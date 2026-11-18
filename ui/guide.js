/* GUIDE DASHBOARD (preview). Turns a guide made of chapter cards into an app-style reader:
   chapter menu, progress saved on this device, a checklist per chapter, optional enter-your-number tool,
   first chapter free with the existing email unlock for the rest, and a finish screen that leads to Apply.
   All chapter text is the guide's own; nothing is rewritten. */
(function () {
  function ready(f) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', f); else f(); }
  var KEY = 'wc_guides', FREE = 1;
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function unlocked() { try { return localStorage.getItem('wc_unlocked') === '1'; } catch (e) { return false; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var slug = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');

  /* Enter-your-number tools. Practice targets come from the guide itself; lab ranges from the published bloodwork sheet. */
  var TOOLS = {
    'iron-protocol': { chapter: 0, label: 'Ferritin', unit: 'ng/mL', max: { Women: 180, Men: 440 },
      groups: { Women: { lab: [15, 150], tgt: [70, 100] }, Men: { lab: [30, 400], tgt: [100, 150] } },
      fine: 'Practice reference points, not instructions to supplement to a number. Lab ranges vary by lab, so check your own report. We do not diagnose, prescribe, or treat.' }
  };

  /* Guide hero: title, deck and intro type themselves out on load. Text stays laid out, letters are revealed, so nothing jumps. */
  function typewriter() {
    var hero = document.querySelector('main header.mhero, main section.reference-hero'); if (!hero) return;
    hero.classList.add('tw-hero');
    var els = [].filter.call(hero.querySelectorAll(hero.matches('.reference-hero') ? 'h1,.hero-deck' : 'h1,.deck,p'), function (e) { return e.textContent.trim(); });
    if (!els.length || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var groups = els.map(function (el) {
      var out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], x;
      while ((x = w.nextNode())) nodes.push(x);
      nodes.forEach(function (t) { var f = document.createDocumentFragment(); t.nodeValue.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'tw'; s.textContent = ch; f.appendChild(s); out.push(s); }); t.parentNode.replaceChild(f, t); });
      el.setAttribute('aria-label', el.textContent); return { el: el, s: out, ms: el.tagName === 'H1' ? 46 : el.classList.contains('deck') ? 20 : 9 };
    });
    hero.classList.add('tw-on');
    var g = 0, i = 0, last = null;
    function step() {
      if (g >= groups.length) { if (last) setTimeout(function () { last.classList.remove('tw-c'); }, 1600); return; }
      var G = groups[g];
      if (i >= G.s.length) { g++; i = 0; setTimeout(step, 260); return; }
      if (last) last.classList.remove('tw-c');
      last = G.s[i++]; last.classList.add('tw-v', 'tw-c');
      setTimeout(step, G.ms);
    }
    setTimeout(step, 650);
    hero.addEventListener('click', function () { groups.forEach(function (G) { G.s.forEach(function (s) { s.classList.add('tw-v'); }); }); g = groups.length; });
  }

  ready(function () { setTimeout(function () {
    var wrap = document.querySelector('main div.mwrap'); 
    var cards = wrap ? [].filter.call(wrap.children, function (c) { return c.matches('article.card, article.reference-section'); }) : [];
    if (wrap && wrap.classList.contains('reference-content') && cards.length >= 3) document.documentElement.classList.add('gd-ref');
    if (cards.length >= 3) {
      typewriter();
      /* the site's gate script loads late; wait for its unlock card (or an unlocked device) so the lock screen can hold the real form */
      var t0 = Date.now(), built = false;
      (function wait() {
        if (built) return;
        if (unlocked() || wrap.querySelector('.wc-gate') || Date.now() - t0 > 2500) { built = true; guide(wrap, cards); document.documentElement.classList.add('gd-built'); return; }
        setTimeout(wait, 60);
      })();
    }
    else document.documentElement.classList.add('gd-built');
    if (document.querySelector('.phase-grid')) library();
  }, 0); });

  function guide(wrap, cards) {
    var all = load(), st = all[slug] || { done: [], checks: {}, last: 0 }, n = cards.length;
    var title = (document.querySelector('main h1') || {}).textContent || document.title, gate = wrap.querySelector('.wc-gate');
    cards.forEach(function (c) { c.classList.remove('wc-teaser', 'wc-hidden'); });
    var names = cards.map(function (c, i) { var h = c.querySelector('h2,h3'); return h ? h.textContent.trim() : 'Chapter ' + (i + 1); });
    var gd = document.createElement('div'); gd.className = 'gd';
    gd.innerHTML = '<aside class="gd-side"><div class="gd-kicker">Your guide</div><div class="gd-title">' + esc(title.trim()) + '</div><p class="gd-welcome"></p><div class="gd-bar"><i></i></div><div class="gd-pct"><span class="gd-c"></span><span class="gd-p"></span></div><button type="button" class="gd-menu-btn" aria-expanded="false"><span>Chapters</span><span>▾</span></button><ol class="gd-nav">' +
      names.map(function (t, i) { return '<li><button type="button" data-i="' + i + '"><span class="n"><span>' + (i + 1) + '</span></span><span>' + esc(t) + '</span></button></li>'; }).join('') +
      '</ol><a class="gd-all" href="resources.html">← All guides</a></aside><section class="gd-main"><div class="gd-head"><span class="gd-where"></span><span class="gd-saved">Progress saved on this device</span></div><div class="gd-panel"></div><div class="gd-extra"></div><div class="gd-foot"><button type="button" class="gd-btn gd-back">← Back</button><button type="button" class="gd-btn go gd-next"></button></div></section>';
    wrap.parentNode.insertBefore(gd, wrap);
    var panel = gd.querySelector('.gd-panel'), extra = gd.querySelector('.gd-extra'), side = gd.querySelector('.gd-side');
    cards.forEach(function (c) { panel.appendChild(c); });
    var lockEl = document.createElement('div'); lockEl.className = 'gd-lock';
    lockEl.innerHTML = '<div class="gd-h">Unlock the rest of this guide</div><p>Chapter one is yours to read. Enter your email once and every chapter, checklist and tool in every guide opens on this device.</p>';
    if (gate) { lockEl.innerHTML = ''; lockEl.appendChild(gate); }      /* the site's own unlock card already says what to do */
    panel.appendChild(lockEl);
    var own = document.querySelector('main .mcta a.btn, main .reference-cta a.btn, main a.js-apply');
    var cta = { href: own ? own.getAttribute('href') : 'https://info.wesnoskicoaching.com/application', text: own && own.textContent.trim().length < 40 ? own.textContent.replace(/[→\s]+$/, '').trim() : 'Apply for the Rebuild' };
    var fin = document.createElement('div'); fin.className = 'gd-finish';
    fin.innerHTML = '<div class="gd-h">Guide complete</div><p>You have worked through all ' + n + ' chapters of ' + esc(title.trim()) + '. The next step is reading your own numbers with a coach.</p><a class="btn large gx-apply" href="' + esc(cta.href) + '">' + esc(cta.text) + '</a>';
    panel.appendChild(fin); wrap.classList.add('gd-src-hidden');
    var cur = -1, navBtns = [].slice.call(gd.querySelectorAll('.gd-nav button'));
    function isLocked(i) { return i >= FREE && !unlocked(); }
    function persist() { st.total = n; st.title = title.trim(); all = load(); all[slug] = st; save(all); }
    function paint() {
      var done = st.done.length, pct = Math.round(done / n * 100);
      gd.querySelector('.gd-bar i').style.width = pct + '%'; gd.querySelector('.gd-c').textContent = done + ' of ' + n + ' chapters'; gd.querySelector('.gd-p').textContent = pct + '%';
      navBtns.forEach(function (b, i) { b.parentNode.className = st.done.indexOf(i) > -1 ? 'done' : isLocked(i) ? 'lock' : ''; b.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    }
    function checklist(i) {
      var subs = [].map.call(cards[i].querySelectorAll('h4'), function (h) { return h.textContent.trim(); }); if (!subs.length) subs = [names[i]];
      var saved = st.checks[i] || [];
      return '<div class="gd-block"><h5>Covered in this chapter</h5><div class="gd-check">' + subs.map(function (s, k) { return '<label><input type="checkbox" data-k="' + k + '"' + (saved[k] ? ' checked' : '') + '/><span class="box"></span><span>' + esc(s) + '</span></label>'; }).join('') + '</div></div>';
    }
    function tool(i) {
      var t = TOOLS[slug]; if (!t || t.chapter !== i) return '';
      var g = Object.keys(t.groups);
      return '<div class="gd-block gd-tool"><h5>Where does your ' + esc(t.label.toLowerCase()) + ' sit?</h5><div class="row"><div class="gd-seg" role="group" aria-label="Range for">' + g.map(function (k, j) { return '<button type="button" aria-pressed="' + (j === 0) + '" data-g="' + k + '">' + k + '</button>'; }).join('') + '</div><input type="number" inputmode="decimal" min="0" step="any" aria-label="Your ' + esc(t.label) + ' result" placeholder="Your result"/><span class="unit">' + esc(t.unit) + '</span></div><div class="gd-track"><span class="lab"></span><span class="tgt"></span><span class="dot"></span></div><div class="gd-legend"><span><i></i>Typical lab range <b class="lr"></b></span><span class="t"><i></i>Our practice target <b class="tr"></b></span></div><p class="gd-read" aria-live="polite"></p><p class="gd-fine">' + esc(t.fine) + '</p></div>';
    }
    function wireTool() {
      var t = TOOLS[slug], box = extra.querySelector('.gd-tool'); if (!t || !box) return;
      var grp = Object.keys(t.groups)[0], input = box.querySelector('input'), track = box.querySelector('.gd-track'), read = box.querySelector('.gd-read');
      function draw() {
        var r = t.groups[grp], max = t.max[grp], pc = function (v) { return Math.max(0, Math.min(100, v / max * 100)); };
        box.querySelector('.lab').style.cssText = 'left:' + pc(r.lab[0]) + '%;width:' + (pc(r.lab[1]) - pc(r.lab[0])) + '%';
        box.querySelector('.tgt').style.cssText = 'left:' + pc(r.tgt[0]) + '%;width:' + (pc(r.tgt[1]) - pc(r.tgt[0])) + '%';
        box.querySelector('.lr').textContent = '~' + r.lab[0] + '–' + r.lab[1]; box.querySelector('.tr').textContent = r.tgt[0] + '–' + r.tgt[1];
        var v = parseFloat(input.value);
        if (!isFinite(v) || v < 0 || input.value === '') { track.classList.remove('has'); read.textContent = ''; return; }
        track.classList.add('has'); box.querySelector('.dot').style.left = pc(v) + '%';
        var a = v < r.tgt[0] ? 'below' : v > r.tgt[1] ? 'above' : 'inside', b = v < r.lab[0] || v > r.lab[1] ? 'outside' : 'inside';
        read.textContent = 'A ' + t.label.toLowerCase() + ' of ' + v + ' ' + t.unit + ' sits ' + a + ' our practice target of ' + r.tgt[0] + '–' + r.tgt[1] + ' and ' + b + ' a typical lab range of about ' + r.lab[0] + '–' + r.lab[1] + '. Bring this number to your call.';
      }
      [].forEach.call(box.querySelectorAll('.gd-seg button'), function (b) { b.addEventListener('click', function () { grp = b.dataset.g; [].forEach.call(box.querySelectorAll('.gd-seg button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); draw(); }); });
      input.addEventListener('input', draw); draw();
    }
    function show(i, scroll) {
      cur = i; var finished = i >= n, locked = !finished && isLocked(i);
      [].forEach.call(panel.children, function (c) { c.classList.remove('gd-on'); });
      (finished ? fin : locked ? lockEl : cards[i]).classList.add('gd-on');
      extra.innerHTML = finished || locked ? '' : tool(i) + checklist(i); wireTool();
      [].forEach.call(extra.querySelectorAll('.gd-check input'), function (cb) { cb.addEventListener('change', function () { var a = st.checks[i] || []; a[+cb.dataset.k] = cb.checked; st.checks[i] = a; persist(); }); });
      gd.querySelector('.gd-where').textContent = finished ? 'Finished' : 'Chapter ' + (i + 1) + ' of ' + n;
      var next = gd.querySelector('.gd-next'), back = gd.querySelector('.gd-back');
      back.disabled = i <= 0; next.style.display = finished || locked ? 'none' : '';
      next.textContent = st.done.indexOf(i) > -1 ? (i === n - 1 ? 'Finish →' : 'Next chapter →') : (i === n - 1 ? 'Mark complete and finish →' : 'Mark complete and continue →');
      if (!finished) { st.last = i; persist(); }
      side.classList.remove('open'); gd.querySelector('.gd-menu-btn').setAttribute('aria-expanded', 'false'); gd.querySelector('.gd-menu-btn span').textContent = finished ? 'Chapters' : (i + 1) + '. ' + names[i];
      paint(); if (scroll) window.scrollTo({ top: gd.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    }
    navBtns.forEach(function (b, i) { b.addEventListener('click', function () { show(i, true); }); });
    gd.querySelector('.gd-next').addEventListener('click', function () { if (st.done.indexOf(cur) < 0) st.done.push(cur); persist(); show(cur + 1, true); });
    gd.querySelector('.gd-back').addEventListener('click', function () { if (cur > 0) show(Math.min(cur, n) - 1, true); });
    gd.querySelector('.gd-menu-btn').addEventListener('click', function () { var o = side.classList.toggle('open'); this.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    var started = st.done.length > 0 || st.last > 0;
    gd.querySelector('.gd-welcome').textContent = started ? 'Welcome back. Picking up at chapter ' + (Math.min(st.last, n - 1) + 1) + '.' : 'Start with chapter one.';
    show(st.done.length >= n ? n : Math.min(st.last || 0, n - 1), false);
    window.addEventListener('storage', function () { paint(); if (cur >= 0 && cur < n) show(cur, false); });
    disclaimer();
    window.__gd = { show: show, state: function () { return { cur: cur, done: st.done.slice(), locked: navBtns.map(function (b, i) { return isLocked(i); }), n: n }; } };
  }

  /* Medical disclaimer: shown the first time each guide is opened on this device. Wording is the site's own footer notice. */
  function disclaimer() {
    var K = 'wc_disc', seen = {}; try { seen = JSON.parse(localStorage.getItem(K) || '{}'); } catch (e) {}
    if (seen[slug]) return;
    var b = document.createElement('div'); b.className = 'gxp-back';
    b.innerHTML = '<div class="gxp gxp-disc" role="dialog" aria-modal="true" aria-labelledby="gxp-t"><div class="gxp-k">Before you read</div><div class="gxp-t" id="gxp-t">Medical disclaimer</div><p>This guide is for educational purposes. It is not medical advice, diagnosis, or treatment, and it is not a substitute for care from a licensed physician.</p><p>Never start, stop, or change prescription medication without your physician. Results shared on this site are individual experiences and are not typical or guaranteed.</p><div class="gxp-b"><button type="button" class="gxp-yes">I understand</button><a href="disclaimer.html">Read the full disclaimer</a></div></div>';
    document.body.appendChild(b); document.documentElement.classList.add('gxp-open');
    requestAnimationFrame(function () { b.classList.add('on'); });
    var yes = b.querySelector('.gxp-yes'); setTimeout(function () { try { yes.focus({ preventScroll: true }); } catch (e) {} }, 60);
    b.addEventListener('keydown', function (e) { if (e.key === 'Tab') { var f = b.querySelectorAll('button,a'); if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } } });
    yes.addEventListener('click', function () { seen[slug] = 1; try { localStorage.setItem(K, JSON.stringify(seen)); } catch (e) {} b.classList.remove('on'); document.documentElement.classList.remove('gxp-open'); setTimeout(function () { b.remove(); }, 350); });
  }

  /* Guides page as a library: progress ring on each guide and a continue row, read from this device */
  function library() {
    var all = load(), best = null;
    [].forEach.call(document.querySelectorAll('.phase-grid a.phase'), function (a) {
      var s = (a.getAttribute('href') || '').replace(/\.html$/, ''), st = all[s]; if (!st || !st.total) return;
      var pct = Math.round((st.done || []).length / st.total * 100), ring = document.createElement('span'); ring.className = 'gl-ring'; ring.style.setProperty('--v', pct); ring.innerHTML = '<span>' + pct + '%</span>'; ring.setAttribute('aria-label', pct + ' percent complete'); a.appendChild(ring);
      if (pct < 100 && (!best || pct > best.pct)) best = { pct: pct, href: a.getAttribute('href'), title: st.title || a.querySelector('h3').textContent, last: (st.last || 0) + 1, total: st.total };
    });
    if (best) { var grid = document.querySelector('.phase-grid'), c = document.createElement('a'); c.className = 'gl-cont'; c.href = best.href; c.innerHTML = '<span><small>Continue where you left off</small><b>' + esc(best.title) + '</b><small>Chapter ' + best.last + ' of ' + best.total + ' · ' + best.pct + '% complete</small></span><i aria-hidden="true">→</i>'; grid.parentNode.insertBefore(c, grid); }
  }
})();
