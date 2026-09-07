/* ------------------------------------------------------------------
   Wesnoski Coaching · content gate + lead capture
   Loaded once by assets/nav.js. Configures itself from the URL, so no
   page needs a script tag and new pages are covered automatically.
   The PAGES table below is the only thing to edit when pages change.

   One unlock opens every gated page on that device, permanently.
------------------------------------------------------------------ */
(function () {
  'use strict';

  var HOST = 'https://link.info.wesnoskicoaching.com';

  /* ---- your Content Unlock form -------------------------------- */
  var FORM_ID = 'uaVXiWIIiQUMInbQUf4c';   // Content Unlock
  /* -------------------------------------------------------------- */

  var UNLOCK_KEY = 'wc_unlocked';
  var RETURN_KEY = 'wc_return';
  var STASH_KEY  = 'wc_stash';
  var EXIT_KEY   = 'wc_exit_seen';

  var EXIT_COOLDOWN = 14 * 24 * 60 * 60 * 1000;  // do not ask again for 14 days
  var EXIT_ARM_MS   = 8000;                      // never fire at a bouncer
  var EXIT_DWELL_MS = 30000;                     // touch devices: engagement, not exit
  var EXIT_DEPTH    = 0.6;

  /* Per page config, keyed by path. Anything not listed gets exit intent
     only, tagged with its own slug, so new pages are covered by default. */
  var PAGES = {
    'iron-protocol':        { mode: 'guide', guide: 'iron',         free: 2 },
    'metabolic-panel':      { mode: 'guide', guide: 'metabolic',    free: 2 },
    'estrogen-clearance':   { mode: 'guide', guide: 'e2',           free: 3 },
    'cholesterol-playbook': { mode: 'guide', guide: 'cholesterol',  free: 3 },
    'birth-control':        { mode: 'guide', guide: 'birthcontrol', free: 3 },
    'depleted':             { mode: 'guide', guide: 'depleted',     free: 3 },
    'assessment':           { mode: 'assessment', guide: 'assessment' },
    'calculator':           { mode: 'calculator', guide: 'tghdl' },
    'index':                { mode: 'exit', guide: 'home' },
    '':                     { mode: 'exit', guide: 'home' },
    'resources':            { mode: 'exit', guide: 'resources' },
    'reviews':              { mode: 'exit', guide: 'reviews' },
    'coaches':              { mode: 'exit', guide: 'coaches' },
    'app':                  { mode: 'exit', guide: 'app' }
  };

  var NO_GATE = { privacy: 1, terms: 1, disclaimer: 1, unlocked: 1 };

  var slug = location.pathname.split('/').pop().replace(/\.html?$/i, '');
  var page = PAGES[slug] || { mode: 'exit', guide: slug || 'home' };

  var me = document.currentScript ||
           document.querySelector('script[src*="wc-gate.js"]');
  var d  = (me && me.dataset) || {};

  var cfg = {
    mode:  d.mode  || page.mode,
    guide: d.guide || page.guide,
    coach: d.coach || 'house',
    free:  parseInt(d.free || page.free || '2', 10),
    exit:  d.exit !== 'off'          // exit intent on every page unless turned off
  };

  if (NO_GATE[slug]) return;   // legal pages stay clean

  /* --- storage helpers, never throw ------------------------------ */
  function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
  function isUnlocked() { return safe(function () { return localStorage.getItem(UNLOCK_KEY) === '1'; }, false); }
  function setUnlocked() { safe(function () { localStorage.setItem(UNLOCK_KEY, '1'); }); }
  function setReturn()   { safe(function () { localStorage.setItem(RETURN_KEY, location.pathname); }); }

  /* --- styles ---------------------------------------------------- */
  function injectStyles() {
    if (document.getElementById('wc-gate-styles')) return;
    var s = document.createElement('style');
    s.id = 'wc-gate-styles';
    s.textContent = [
      '.wc-teaser{position:relative;max-height:200px;overflow:hidden;pointer-events:none;user-select:none}',
      '.wc-teaser::after{content:"";position:absolute;left:0;right:0;bottom:0;height:170px;',
        'background:linear-gradient(180deg,rgba(245,232,218,0) 0%,var(--cream,#F5E8DA) 88%)}',
      '.wc-hidden{display:none}',
      '.wc-gate{position:relative;margin:26px 0 34px;padding:34px 30px 26px;',
        'border:1px solid var(--peach,#E8C5A8);border-top:3px solid var(--terracotta,#C97B5C);',
        'background:#fff;border-radius:4px}',
      '.wc-gate .wc-eyebrow{margin:0 0 10px;font-family:var(--sans,Inter,sans-serif);font-size:11px;',
        'font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--copper,#B8643F)}',
      '.wc-gate h3{margin:0 0 10px;font-family:var(--display,"Cormorant Garamond",Georgia,serif);',
        'font-weight:500;font-size:clamp(25px,3.4vw,34px);line-height:1.15;color:var(--espresso,#1C1109)}',
      '.wc-gate p{margin:0 0 20px;max-width:56ch;font-family:var(--sans,Inter,sans-serif);',
        'font-size:15.5px;line-height:1.6;color:var(--text-soft,#6B4F3E)}',
      '.wc-gate iframe{display:block;width:100%;min-height:420px;border:none;border-radius:4px}',
      '.wc-gate-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;',
        'justify-content:center;padding:20px;background:rgba(28,17,9,.72)}',
      '.wc-gate-modal .wc-gate{margin:0;width:100%;max-width:560px;max-height:92vh;overflow:auto;',
        'box-shadow:0 30px 80px rgba(28,17,9,.4)}',
      '.wc-gate-close{position:absolute;top:12px;right:14px;width:36px;height:36px;border:none;',
        'background:transparent;font-size:26px;line-height:1;cursor:pointer;color:var(--text-soft,#6B4F3E)}',
      '.wc-gate-close:hover{color:var(--espresso,#1C1109)}',
      '.wc-gate-close:focus-visible{outline:2px solid var(--terracotta,#C97B5C);outline-offset:2px}',
      '@media (max-width:620px){.wc-gate{padding:26px 20px 20px}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* --- the embed ------------------------------------------------- */
  function formEmbed(which) {
    var id = FORM_ID;
    var src = HOST + '/widget/form/' + id +
              '?guide_source=' + encodeURIComponent(cfg.guide) +
              '&coach_source=' + encodeURIComponent(cfg.coach);
    var f = document.createElement('iframe');
    f.src = src;
    f.id = 'inline-' + id;
    f.title = 'Wesnoski Coaching';
    f.setAttribute('data-layout', "{'id':'INLINE'}");
    f.setAttribute('data-trigger-type', 'alwaysShow');
    f.setAttribute('data-form-name', 'Wesnoski Coaching');
    f.setAttribute('data-height', '460');
    f.setAttribute('data-layout-iframe-id', 'inline-' + id);
    f.setAttribute('data-form-id', id);
    f.setAttribute('data-cookie-consent', 'true');
    f.setAttribute('data-cookie-consent-provider', 'auto');
    return f;
  }

  function loadEmbedScript() {
    if (document.querySelector('script[src*="form_embed.js"]')) return;
    var s = document.createElement('script');
    s.src = HOST + '/js/form_embed.js';
    s.async = true;
    document.body.appendChild(s);
  }

  var COPY = {
    guide: {
      eyebrow: 'Keep reading',
      head: 'The rest of this guide is below.',
      body: 'Tell us where to send things and it opens. Every other guide on the site opens with it, and stays open.'
    },
    assessment: {
      eyebrow: 'Your reading is ready',
      head: 'Your reading is built.',
      body: 'Your answers are saved. Tell us where to send it and the result opens.'
    },
    calculator: {
      eyebrow: 'Your ratio is ready',
      head: 'Your ratio is calculated.',
      body: 'Your numbers are saved. Tell us where to send it and the result opens.'
    },
    exit: {
      eyebrow: 'Before you go',
      head: 'Read your own bloodwork.',
      body: 'Six guides on the markers that actually move. Ferritin, fasting insulin, estrogen clearance, TG to HDL. Free, no diagnosis, no pitch.'
    }
  };

  function buildGate(which, withClose) {
    var c = COPY[which] || COPY.guide;
    var wrap = document.createElement('div');
    wrap.className = 'wc-gate';
    var eb = document.createElement('p'); eb.className = 'wc-eyebrow'; eb.textContent = c.eyebrow;
    var h  = document.createElement('h3'); h.textContent = c.head;
    var p  = document.createElement('p');  p.textContent = c.body;
    wrap.appendChild(eb); wrap.appendChild(h); wrap.appendChild(p);
    wrap.appendChild(formEmbed(which));
    if (withClose) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'wc-gate-close';
      b.setAttribute('aria-label', 'Close'); b.innerHTML = '&times;';
      b.onclick = closeModal;
      wrap.appendChild(b);
    }
    return wrap;
  }

  function closeModal() {
    var m = document.querySelector('.wc-gate-modal');
    if (m && m.parentNode) m.parentNode.removeChild(m);
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e) { if (e.key === 'Escape') closeModal(); }

  function openModal(which) {
    if (document.querySelector('.wc-gate-modal')) return;
    injectStyles();
    setReturn();
    var m = document.createElement('div');
    m.className = 'wc-gate-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.appendChild(buildGate(which, true));
    m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });
    document.addEventListener('keydown', onEsc);
    document.body.appendChild(m);
    loadEmbedScript();
    var c = m.querySelector('.wc-gate-close');
    if (c) c.focus();
  }

  /* --- stash and restore the visitor's own input ------------------ */
  function stash() {
    safe(function () {
      var box = [], val = [], unit = -1;
      [].forEach.call(document.querySelectorAll('input[type="checkbox"]'), function (el, i) {
        if (el.checked) box.push(i);
      });
      [].forEach.call(document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"])'), function (el) {
        val.push(el.value);
      });
      [].forEach.call(document.querySelectorAll('button.unit'), function (b, i) {
        if (b.classList.contains('is-active')) unit = i;
      });
      sessionStorage.setItem(STASH_KEY, JSON.stringify({ b: box, v: val, u: unit }));
    });
  }

  function restore() {
    return safe(function () {
      var raw = sessionStorage.getItem(STASH_KEY);
      if (!raw) return false;
      var s = JSON.parse(raw);
      var boxes = [].slice.call(document.querySelectorAll('input[type="checkbox"]'));
      (s.b || []).forEach(function (i) { if (boxes[i]) boxes[i].checked = true; });
      var vals = [].slice.call(document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"])'));
      (s.v || []).forEach(function (v, i) { if (vals[i]) vals[i].value = v; });
      if (s.u > -1) {
        var units = [].slice.call(document.querySelectorAll('button.unit'));
        if (units[s.u] && !units[s.u].classList.contains('is-active')) units[s.u].click();
      }
      sessionStorage.removeItem(STASH_KEY);
      return true;
    }, false);
  }

  /* --- mode: guide ------------------------------------------------ */
  function runGuide() {
    var wrap = document.querySelector('div.mwrap');
    if (!wrap) return;
    var cards = [].slice.call(wrap.children);
    if (cards.length <= cfg.free) return;

    injectStyles();
    setReturn();

    cards.forEach(function (el, i) {
      if (i < cfg.free) return;
      if (i === cfg.free) el.classList.add('wc-teaser');
      else el.classList.add('wc-hidden');
    });

    wrap.insertBefore(buildGate('guide', false), cards[cfg.free].nextSibling);
    loadEmbedScript();
  }

  /* --- mode: assessment / calculator ------------------------------ */
  var TRIGGERS = {
    assessment: { btn: '#seeReading', result: '#result' },
    calculator: { btn: '#calcBtn',    result: '#calcResult' }
  };

  function runTool(which) {
    var t = TRIGGERS[which];
    if (!t) return;
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest(t.btn);
      if (!btn) return;
      if (isUnlocked()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      stash();
      openModal(which);
    }, true);
  }

  function replayTool(which) {
    var t = TRIGGERS[which];
    if (!t) return;
    window.addEventListener('load', function () {
      setTimeout(function () {
        if (!restore()) return;
        var btn = document.querySelector(t.btn);
        if (btn) btn.click();
        var res = document.querySelector(t.result);
        if (res && res.scrollIntoView) res.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    });
  }

  /* --- exit intent ------------------------------------------------ */
  function exitSuppressed() {
    return safe(function () {
      var t = parseInt(localStorage.getItem(EXIT_KEY) || '0', 10);
      return !!t && (Date.now() - t) < EXIT_COOLDOWN;
    }, false);
  }
  function markExitSeen() { safe(function () { localStorage.setItem(EXIT_KEY, String(Date.now())); }); }

  function gateOnScreen() {
    var g = document.querySelector('.wc-gate');
    if (!g) return false;
    var r = g.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  function runExit() {
    if (isUnlocked() || exitSuppressed()) return;

    var armed = false, fired = false;
    setTimeout(function () { armed = true; }, EXIT_ARM_MS);

    function fire() {
      if (!armed || fired) return;
      if (document.querySelector('.wc-gate-modal')) return;
      if (gateOnScreen()) return;          // they are already looking at a form
      fired = true;
      markExitSeen();
      openModal('exit');
    }

    var touch = safe(function () { return window.matchMedia('(hover:none)').matches; }, false);

    if (!touch) {
      // pointer leaves the top of the viewport
      document.addEventListener('mouseout', function (e) {
        if (e.relatedTarget || e.clientY > 0) return;
        fire();
      });
    } else {
      // no reliable exit signal on touch, so use engagement instead
      var deep = false;
      window.addEventListener('scroll', function () {
        var h = document.documentElement;
        var pct = (h.scrollTop + window.innerHeight) / (h.scrollHeight || 1);
        if (pct > EXIT_DEPTH) deep = true;
      }, { passive: true });
      setTimeout(function () { if (deep) fire(); }, EXIT_DWELL_MS);
    }
  }

  /* --- unlock in place, no navigation ----------------------------- */
  function revealAll() {
    setUnlocked();
    closeModal();
    var t = document.querySelector('.wc-teaser');
    if (t) t.classList.remove('wc-teaser');
    [].forEach.call(document.querySelectorAll('.wc-hidden'), function (e) { e.classList.remove('wc-hidden'); });
    [].forEach.call(document.querySelectorAll('.wc-gate'), function (e) {
      if (e.parentNode) e.parentNode.removeChild(e);
    });
    var tr = TRIGGERS[cfg.mode];
    if (tr) {
      restore();
      var b = document.querySelector(tr.btn);
      if (b) b.click();
      var r = document.querySelector(tr.result);
      if (r && r.scrollIntoView) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* If the embed announces its own submit, unlock instantly and the
     redirect that follows becomes harmless. If it never announces,
     the redirect through unlocked.html is still the real mechanism. */
  function listenForSubmit() {
    window.addEventListener('message', function (e) {
      if (typeof e.origin !== 'string' || e.origin.indexOf(HOST) !== 0) return;
      var s;
      try { s = typeof e.data === 'string' ? e.data : JSON.stringify(e.data || ''); }
      catch (err) { return; }
      if (!/submit|success/i.test(s)) return;      // resize chatter never matches
      revealAll();
    });
  }

  /* --- boot -------------------------------------------------------- */
  function boot() {
    var justUnlocked = false;
    try {
      var q = new URLSearchParams(location.search);
      if (q.get('unlocked') === '1') {
        setUnlocked();
        justUnlocked = true;
        q.delete('unlocked');
        var rest = q.toString();
        history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      }
    } catch (e) { /* older browser, gate simply stays closed */ }

    if (cfg.mode === 'guide' && !isUnlocked()) runGuide();

    if (cfg.mode === 'assessment' || cfg.mode === 'calculator') {
      if (justUnlocked) replayTool(cfg.mode);
      runTool(cfg.mode);
    }

    if (cfg.exit && !justUnlocked) runExit();

    listenForSubmit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
