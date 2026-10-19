#!/usr/bin/env bash
#
# publish.sh — commit the day's site and push it to GitHub.
#
# Kept separate from run-daily.sh so that publishing can be retried on its own
# without re-running the agent. The built site in docs/ is committed together
# with its source in site/, which is what makes the output portable: the exact
# files GitHub Pages serves are in the repository.
#
# Usage:
#   ./scripts/publish.sh                 # commit and push what is already built
#   ./scripts/publish.sh --build         # build first, then commit and push
#   ./scripts/publish.sh --build --date 2026-10-19
#
# Exit codes:
#   0  published, or nothing to publish
#   1  build or push failed

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

export PATH="$HOME/.local/share/node/current/bin:$HOME/.local/bin:$PATH"

DATE="$(date +%F)"
DO_BUILD=0
BRANCH="main"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build) DO_BUILD=1; shift ;;
    --date) DATE="${2:?--date needs a value}"; shift 2 ;;
    --help|-h) sed -n '2,18p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "publish: unknown option '$1'" >&2; exit 64 ;;
  esac
done

step() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

if [[ "$DO_BUILD" -eq 1 ]]; then
  step "Building the site..."
  npm --prefix site run build
fi

if [[ ! -f "$PROJECT_DIR/docs/index.html" ]]; then
  step "ERROR: docs/index.html is missing. Run with --build first."
  exit 1
fi

# ---------------------------------------------------------------------------
# Git
# ---------------------------------------------------------------------------

# Never publish as a random machine account. The identity is repository-local,
# set by scripts/install-autostart.ps1 or manually with `git config user.email`.
if ! git config user.email >/dev/null 2>&1; then
  step "ERROR: no git user.email configured for this repository."
  step "       Run: git config user.name  'Your Name'"
  step "            git config user.email 'you@example.com'"
  exit 1
fi

git add -A -- .

if git diff --cached --quiet; then
  step "Nothing to publish: the repository is unchanged."
  exit 0
fi

REPORT="$PROJECT_DIR/site/src/content/reports/$DATE.md"
TITLE=""
if [[ -f "$REPORT" ]]; then
  TITLE="$(sed -n 's/^title:[[:space:]]*//p' "$REPORT" | head -1 | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
fi

if [[ -n "$TITLE" ]]; then
  MESSAGE="daily: $DATE — $TITLE"
else
  MESSAGE="daily: $DATE"
fi

step "Committing: $MESSAGE"
git commit -m "$MESSAGE" --quiet

# Someone (or the future self-hosted mirror) may have pushed since the last run.
step "Rebasing on origin/$BRANCH..."
if ! git pull --rebase --autostash --quiet origin "$BRANCH"; then
  step "ERROR: could not rebase on origin/$BRANCH. Resolve it manually, then re-run publish.sh."
  exit 1
fi

step "Pushing to origin/$BRANCH..."
if ! git push --quiet origin "HEAD:$BRANCH"; then
  step "Push rejected; retrying once after another rebase."
  git pull --rebase --autostash --quiet origin "$BRANCH" || true
  if ! git push --quiet origin "HEAD:$BRANCH"; then
    step "ERROR: push failed. The commit is local and will be published by a later run."
    exit 1
  fi
fi

step "Published $(git rev-parse --short HEAD) to origin/$BRANCH."
