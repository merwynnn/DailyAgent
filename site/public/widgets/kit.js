/* ==========================================================================
   DailyAgent — widget kit
   --------------------------------------------------------------------------
   Shared helpers for the interactive panels embedded in reports. A widget is a
   plain, self-contained HTML file; this script is the only thing it needs to
   load, and everything here is optional.

     <link rel="stylesheet" href="../kit.css" />
     <script src="../kit.js" defer></script>

   What it gives you:

     DAKit.tokens()          the page's colours, so a canvas can match the CSS
     DAKit.canvas(el)        a hi-dpi canvas that resizes itself
     DAKit.loop(fn)          requestAnimationFrame loop with dt in seconds
     DAKit.pointer(el, h)    mouse/touch/pen flattened into {x, y, nx, ny}
     DAKit.fit()             ask the page to grow the iframe to your content
     DAKit.theme()           'light' or 'dark', kept in sync with the page
     DAKit.clamp/lerp/rand/TAU, DAKit.reduceMotion

   Rules of the house: never touch window.parent (the page around you is not
   yours), keep the panel keyboard-usable, and respect DAKit.reduceMotion.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;

  function applyTheme(theme) {
    root.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    document.dispatchEvent(new CustomEvent('dakit:theme', { detail: root.dataset.theme }));
  }

  // Same origin, so the page's own preference is readable here. This keeps a
  // dark-mode reader from getting a cream panel.
  try {
    var stored = localStorage.getItem('dailyagent-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored || (prefersDark ? 'dark' : 'light'));
  } catch {
    applyTheme('light');
  }

  // The reader can flip the switch while the panel is on screen.
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.type === 'dailyagent:theme') applyTheme(data.theme);
  });

  function tokens() {
    var style = getComputedStyle(root);
    var read = function (name) {
      return style.getPropertyValue(name).trim();
    };
    return {
      bg: read('--bg'),
      bg2: read('--bg-2'),
      surface: read('--surface'),
      surface2: read('--surface-2'),
      ink: read('--ink'),
      inkSoft: read('--ink-soft'),
      muted: read('--muted'),
      line: read('--line'),
      lineStrong: read('--line-strong'),
      gold: read('--gold'),
      goldDeep: read('--gold-deep'),
      lime: read('--lime'),
      bark: read('--bark'),
      charcoal: read('--charcoal'),
    };
  }

  function canvas(el) {
    var ctx = el.getContext('2d');
    var listeners = [];
    var state = {
      el: el,
      ctx: ctx,
      width: 1,
      height: 1,
      dpr: 1,
      /** Repaint on resize. Setting a canvas's width clears its pixels, so any
       *  panel that draws once must subscribe or it will be wiped by the
       *  observer's first callback — which lands *after* the initial draw. */
      onResize: function (fn) {
        listeners.push(fn);
        return fn;
      },
    };

    function resize() {
      var rect = el.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.max(1, Math.round(rect.width));
      var height = Math.max(1, Math.round(rect.height));
      // Nothing changed: don't touch the bitmap, and don't wipe the drawing.
      if (width === state.width && height === state.height && dpr === state.dpr) return;
      state.dpr = dpr;
      state.width = width;
      state.height = height;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      el.dispatchEvent(new CustomEvent('dakit:resize', { detail: state }));
      for (var i = 0; i < listeners.length; i++) listeners[i](state);
    }

    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(el);
    else window.addEventListener('resize', resize);

    return state;
  }

  function loop(fn) {
    var last = performance.now();
    var raf = 0;
    function tick(now) {
      var dt = Math.min(48, now - last) / 1000;
      last = now;
      if (!document.hidden) fn(dt, now);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function stop() {
      cancelAnimationFrame(raf);
    };
  }

  function pointer(el, handlers) {
    var dragging = false;

    function pos(event) {
      var rect = el.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      return {
        x: x,
        y: y,
        nx: rect.width ? x / rect.width : 0,
        ny: rect.height ? y / rect.height : 0,
        event: event,
      };
    }

    el.addEventListener('pointerdown', function (event) {
      dragging = true;
      if (el.setPointerCapture) el.setPointerCapture(event.pointerId);
      if (handlers.down) handlers.down(pos(event));
    });
    el.addEventListener('pointermove', function (event) {
      if (handlers.move) handlers.move(pos(event), dragging);
    });
    el.addEventListener('pointerup', function (event) {
      dragging = false;
      if (handlers.up) handlers.up(pos(event));
    });
    el.addEventListener('pointercancel', function () {
      dragging = false;
    });
    el.addEventListener('pointerleave', function (event) {
      if (!dragging && handlers.leave) handlers.leave(pos(event));
    });

    return function isDragging() {
      return dragging;
    };
  }

  var fitTimer = 0;
  var lastHeight = 0;

  /**
   * The panel's real content height. Measuring the document would just return
   * the frame's own height, so this walks the body's children instead — that is
   * what lets a frame shrink as well as grow.
   */
  function contentHeight() {
    var body = document.body;
    if (!body) return 0;
    var padBottom = parseFloat(getComputedStyle(body).paddingBottom) || 0;
    var bottom = 0;
    for (var i = 0; i < body.children.length; i++) {
      var rect = body.children[i].getBoundingClientRect();
      if (rect.height > 0) bottom = Math.max(bottom, rect.bottom);
    }
    return bottom > 0 ? Math.ceil(bottom + padBottom) : 0;
  }

  function fit() {
    if (window.parent === window) return;
    clearTimeout(fitTimer);
    fitTimer = setTimeout(function () {
      var height = contentHeight();
      if (!height || Math.abs(height - lastHeight) < 2) return;
      lastHeight = height;
      window.parent.postMessage({ type: 'dailyagent:height', height: height }, '*');
    }, 60);
  }

  // Keep the frame snug without every widget having to think about it.
  function boot() {
    window.addEventListener('load', fit);
    if (window.ResizeObserver && document.body) new ResizeObserver(fit).observe(document.body);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.DAKit = {
    theme: function () {
      return root.dataset.theme || 'light';
    },
    tokens: tokens,
    canvas: canvas,
    loop: loop,
    pointer: pointer,
    fit: fit,
    onTheme: function (fn) {
      document.addEventListener('dakit:theme', function () {
        fn(root.dataset.theme || 'light');
      });
    },
    clamp: function (v, lo, hi) {
      return Math.min(hi, Math.max(lo, v));
    },
    lerp: function (a, b, t) {
      return a + (b - a) * t;
    },
    rand: function (a, b) {
      if (a === undefined) return Math.random();
      if (b === undefined) return Math.random() * a;
      return a + Math.random() * (b - a);
    },
    TAU: Math.PI * 2,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})();
