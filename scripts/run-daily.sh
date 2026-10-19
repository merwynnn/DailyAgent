#!/usr/bin/env bash
#
# run-daily.sh — the DailyAgent's entry point.
#
# One run = one day of work. It guards the "once per day, never before 06:00"
# rule, wakes the agent, then hands off to publish.sh to build and push.
#
# Usage:
#   ./scripts/run-daily.sh                 # run now if today's run has not happened
#   ./scripts/run-daily.sh --force         # run regardless (manual override)
#   ./scripts/run-daily.sh --autostart     # what the Startup shortcut uses: wait for 06:00
#   ./scripts/run-daily.sh --dry-run       # explain what would happen, do nothing
#   ./scripts/run-daily.sh --no-publish    # run the agent and build, but do not commit
#
# Exit codes:
#   0  success, or nothing to do
#   1  the agent or the build failed
#   2  another run is already in progress

set -euo pipefail

# ---------------------------------------------------------------------------
# Paths and configuration
# ---------------------------------------------------------------------------

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Node and opencode are installed outside the default non-interactive PATH.
export PATH="$HOME/.opencode/bin:$HOME/.local/share/node/current/bin:$HOME/.local/bin:$PATH"

STATE_DIR="$PROJECT_DIR/state"
LOCK_FILE="$STATE_DIR/run.lock"
STAMP_FILE="$STATE_DIR/last-run"
SESSION_FILE="$STATE_DIR/session-id"
LOG_DIR="$PROJECT_DIR/logs"

# Local hour (24h) before which the daily run is not allowed to start.
START_HOUR="${DAILY_START_HOUR:-6}"

# Which agent and model to use. The agent is defined in opencode.jsonc.
AGENT="${DAILY_AGENT:-daily}"
MODEL="${DAILY_MODEL:-}"

RUN_DATE="$(date +%F)"

FORCE=0
AUTOSTART=0
DRY_RUN=0
PUBLISH=1

for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=1 ;;
    --autostart) AUTOSTART=1 ;;
    --dry-run|-n) DRY_RUN=1 ;;
    --no-publish) PUBLISH=0 ;;
    --help|-h)
      sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "run-daily: unknown option '$arg' (try --help)" >&2
      exit 64
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

mkdir -p "$STATE_DIR" "$LOG_DIR"
LOG_FILE="$LOG_DIR/$RUN_DATE.log"

log() {
  local line
  line="$(printf '%s' "$*")"
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$line" | tee -a "$LOG_FILE"
}

# ---------------------------------------------------------------------------
# Guards
# ---------------------------------------------------------------------------

# Only one run at a time. A second attempt (e.g. a second logon) exits quietly.
acquire_lock() {
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    log "Another run is already in progress; exiting."
    exit 2
  fi
}

already_ran_today() {
  [[ -f "$STAMP_FILE" ]] && [[ "$(cat "$STAMP_FILE" 2>/dev/null || true)" == "$RUN_DATE" ]]
}

if [[ "$FORCE" -eq 0 ]] && already_ran_today; then
  log "Already ran today ($RUN_DATE); nothing to do. Use --force to run again."
  exit 0
fi

# The Startup shortcut fires at logon, which may be long before six. Rather than
# skip the day, wait for the clock to reach the allowed hour. The clock is
# re-read every minute, so a suspend/resume only delays it slightly.
#
# The lock is deliberately NOT held while waiting: otherwise a manual run at
# 05:30 would be refused for half an hour. It is taken after the wait instead.
wait_until_allowed() {
  local hour minute waited=0

  while :; do
    hour=$((10#$(date +%H)))
    minute=$((10#$(date +%M)))

    if (( hour >= START_HOUR )); then
      return 0
    fi

    if (( waited == 0 )); then
      log "Waiting until $(printf '%02d:00' "$START_HOUR") before starting (now $(printf '%02d:%02d' "$hour" "$minute"))."
    fi

    sleep 60
    waited=$((waited + 60))
  done
}

if [[ "$FORCE" -eq 0 ]]; then
  if [[ "$AUTOSTART" -eq 1 ]]; then
    wait_until_allowed

    # Something may have run while we waited (a manual --force, say).
    if already_ran_today; then
      exit 0
    fi
  elif (( 10#$(date +%H) < START_HOUR )); then
    log "It is before $(printf '%02d:00' "$START_HOUR"); not starting. Use --force to run anyway."
    exit 0
  fi
fi

acquire_lock

# ---------------------------------------------------------------------------
# The run
# ---------------------------------------------------------------------------

log "=== DailyAgent run for $RUN_DATE ==="
log "Project: $PROJECT_DIR"

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "Dry run."
  log "Would invoke: opencode run --agent $AGENT${MODEL:+ --model $MODEL} --auto"
  if [[ -f "$SESSION_FILE" ]]; then
    log "Would continue the stored session ($(cat "$SESSION_FILE"))."
  else
    log "Would create a new persistent session."
  fi
  if [[ "$PUBLISH" -eq 1 ]]; then
    log "Would then build and publish."
  else
    log "Would then build, without publishing."
  fi
  exit 0
fi

if ! command -v opencode >/dev/null 2>&1; then
  log "ERROR: opencode is not on PATH ($PATH)."
  exit 1
fi

SESSION_ID=""
if [[ -f "$SESSION_FILE" ]]; then
  SESSION_ID="$(tr -d '[:space:]' <"$SESSION_FILE")"
fi

PROMPT="Daily run for $RUN_DATE.

Read INSTRUCTIONS.md and AGENTS.md, do the work they ask for, then write today's report to site/src/content/reports/$RUN_DATE.md and stop."

opencode_args=(run --agent "$AGENT" --auto)
if [[ -n "$MODEL" ]]; then
  opencode_args+=(--model "$MODEL")
fi

if [[ -n "$SESSION_ID" ]]; then
  log "Continuing session $SESSION_ID."
  opencode_args+=(--session "$SESSION_ID")
  agent_status=0
  opencode "${opencode_args[@]}" "$PROMPT" 2>&1 | tee -a "$LOG_FILE" || agent_status=${PIPESTATUS[0]}
else
  # First ever run: ask for JSON so the session id can be captured and reused
  # forever after. The raw file stays around for debugging.
  log "No stored session yet; creating the persistent session."
  RAW_FILE="$LOG_DIR/$RUN_DATE.jsonl"
  agent_status=0
  opencode "${opencode_args[@]}" --format json "$PROMPT" 2>&1 | tee "$RAW_FILE" || agent_status=${PIPESTATUS[0]}

  # Keep a readable copy in the main log.
  python3 - "$RAW_FILE" >>"$LOG_FILE" <<'PY' || true
import json, sys
for line in open(sys.argv[1], encoding="utf-8", errors="replace"):
    line = line.strip()
    if not line:
        continue
    try:
        event = json.loads(line)
    except json.JSONDecodeError:
        print(line)
        continue
    if event.get("type") == "text":
        print(event.get("part", {}).get("text", ""))
PY

  SESSION_ID="$(grep -o '"sessionID":"[^"]*"' "$RAW_FILE" 2>/dev/null | head -1 | cut -d'"' -f4 || true)"

  if [[ -n "$SESSION_ID" ]]; then
    printf '%s\n' "$SESSION_ID" >"$SESSION_FILE"
    log "Created session $SESSION_ID (remembered for future runs)."
  else
    log "WARNING: could not capture a session id; the next run will start a new session."
  fi
fi

if [[ "$agent_status" -ne 0 ]]; then
  log "ERROR: the agent exited with status $agent_status. Not publishing."
  exit 1
fi

# The report is the deliverable. If it is missing, something went wrong even
# though the process exited cleanly.
if [[ ! -f "$PROJECT_DIR/site/src/content/reports/$RUN_DATE.md" ]]; then
  log "WARNING: no report was written for $RUN_DATE. Publishing anyway is pointless, so stopping."
  log "        (The agent may have decided there was nothing to do — check the log above.)"
  exit 1
fi

log "Report written: site/src/content/reports/$RUN_DATE.md"

# Building is the correctness gate: a malformed report fails here and never
# reaches the published site.
log "Building the site..."
if ! npm --prefix site run build >>"$LOG_FILE" 2>&1; then
  log "ERROR: the site build failed. Nothing was published. See $LOG_FILE."
  exit 1
fi
log "Build succeeded."

if [[ "$PUBLISH" -eq 1 ]]; then
  log "Publishing..."
  if ! "$PROJECT_DIR/scripts/publish.sh" >>"$LOG_FILE" 2>&1; then
    log "ERROR: publishing failed. See $LOG_FILE."
    exit 1
  fi
  log "Published."
else
  log "Skipping publish (--no-publish)."
fi

printf '%s\n' "$RUN_DATE" >"$STAMP_FILE"
log "=== Done ==="
