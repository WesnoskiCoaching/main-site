/* PREVIEW site-wide effects. Text fades and lifts in as it enters the screen and fades out as it leaves. */
(function () {
  var root = document.documentElement; root.classList.add('fx');
  /* preview only: complementary accent chosen on the homepage switcher and remembered across pages */
  try { var acq = /[?&]ac=(cycle|teal|sage|blue|none)/.exec(location.search), ac = acq ? acq[1] : localStorage.getItem('pv_ac'); if (acq) localStorage.setItem('pv_ac', ac); root.classList.add('ac-' + (ac || 'cycle')); } catch (e) {}
  function ready(f) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', f); else f(); }
  ready(function () {
    /* iPhone frame around app screenshots that are not already inside a framed container */
    [].forEach.call(document.querySelectorAll('img[src*="/app/"][width="390"]'), function (img) {
      if (img.closest('.sc-phone,.phone,.ipx')) return;
      var w = document.createElement('span'); w.className = 'ipx'; img.parentNode.insertBefore(w, img); w.appendChild(img);
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var SKIP = '.gd,.gl-cont,.ib-host,.tm-stage,.ib-device,.fq,.faq-list,.btn,.hero-cta,.offer-close,[data-fade],.rc,.st-stack,.bd-stage,.nn,.nm,nav,.ph-modal,.pv-switch,.cc,.march-panel,.reviews-track,[hidden],.wc-sr,.sc-phone,dialog';
    var sel = 'h1,h2,h3,h4,p,li,blockquote,figcaption,dt,dd,summary,.eyebrow,.lede,.num,.lbl,label';   /* buttons stay solid */
    var els = [].filter.call(document.querySelectorAll('main ' + sel.split(',').join(',main ') + ',footer ' + sel.split(',').join(',footer ')), function (e) {
      if (e.closest(SKIP)) return false;
      var p = e.parentElement.closest('[data-fx]'); if (p) return false;       /* fade the outermost text block only */
      e.setAttribute('data-fx', ''); return true;
    });
    var first = document.querySelector('main>:first-child');
    if (first) [].forEach.call(first.querySelectorAll('[data-fx]'), function (e, i) { e.style.setProperty('--fx-i', Math.min(i, 9)); });
    var live = new Set(), tick = false;
    function run() {
      tick = false; var vh = window.innerHeight, inZone = vh * 0.16, top = 64;
      live.forEach(function (e) {
        var r = e.getBoundingClientRect(), c = r.top + Math.min(r.height, 120) / 2;
        var a = Math.min(1, Math.max(0, (vh - c) / inZone)), b = Math.min(1, Math.max(0, (r.bottom - top) / 80)), o = Math.min(a, b);
        e.style.opacity = o.toFixed(3); e.style.transform = 'translateY(' + ((1 - a) * 18 - (1 - b) * 10).toFixed(1) + 'px)';
      });
    }
    function req() { if (!tick) { tick = true; requestAnimationFrame(run); } }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) live.add(x.target); else { live.delete(x.target); x.target.style.opacity = x.boundingClientRect.top > 0 ? 0 : 0; } });
      req();
    }, { rootMargin: '80px 0px 80px 0px' });
    els.forEach(function (e) { e.classList.remove('rv'); e.style.transition = 'none'; io.observe(e); });
    window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req);
  });
})();

/* Apply buttons: glass styling, plus a strand of "matrix code" that ties the cursor to the button
   once it has been hovered and snaps when the cursor is pulled too far away. */
(function () {
  function ready(f) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', f); else f(); }
  ready(function () {
    var btns = [].slice.call(document.querySelectorAll('a[href*="wesnoskicoaching.com/application"]'));
    btns.forEach(function (b) { b.classList.add('gx-apply'); });
    if (!btns.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover)').matches) return;
    var cv = document.createElement('canvas'); cv.className = 'gx-tether'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = 1, GL = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789MARCH+<>/=', BREAK = 300, STEP = 13;
    var dark = /bg-orig/.test(document.documentElement.className), HEAD = dark ? '255,240,228' : '153,82,57', BODY = dark ? '232,149,107' : '165,90,63';
    var target = null, mouse = { x: 0, y: 0 }, strand = [], shards = [], running = false, last = 0;
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    function glyph() { return GL.charAt(Math.random() * GL.length | 0); }
    function anchor() {                                    /* point on the button's edge nearest the cursor */
      var r = target.getBoundingClientRect();
      return { x: Math.max(r.left, Math.min(r.right, mouse.x)), y: Math.max(r.top, Math.min(r.bottom, mouse.y)), r: r };
    }
    function snap(a) {                                     /* the strand breaks: its glyphs fall away like rain */
      strand.forEach(function (g, i) {
        var t = (i + 1) / (strand.length + 1);
        shards.push({ x: a.x + (mouse.x - a.x) * t, y: a.y + (mouse.y - a.y) * t, vy: 40 + Math.random() * 160, vx: (Math.random() - 0.5) * 30, c: g.c, life: 1 });
      });
      strand = []; target = null;
    }
    function frame(t) {
      var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.font = '600 13px ui-monospace,SFMono-Regular,Menlo,monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (target) {
        if (!document.body.contains(target)) { target = null; }
        else {
          var a = anchor(), dx = mouse.x - a.x, dy = mouse.y - a.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d > BREAK) snap(a);
          else if (d > 6) {
            var n = Math.max(1, Math.floor(d / STEP)), strain = d / BREAK, nx = -dy / d, ny = dx / d;
            while (strand.length < n) strand.push({ c: glyph(), p: Math.random() * 6.28 });
            strand.length = n;
            for (var i = 0; i < n; i++) {
              var g = strand[i], f = (i + 0.5) / n;
              if (Math.random() < 0.1 + strain * 0.25) g.c = glyph();
              var wob = Math.sin(t / 180 + f * 9 + g.p * 0.2) * (3 + strain * 9) * Math.sin(f * Math.PI);
              var x = a.x + dx * f + nx * wob, y = a.y + dy * f + ny * wob;
              var pulse = (Math.sin(t / 130 - f * 11) + 1) / 2;         /* light running from the button to the cursor */
              var al = (0.35 + 0.65 * pulse) * (1 - Math.max(0, strain - 0.7) / 0.3 * 0.6);
              if (strain > 0.8 && Math.random() < (strain - 0.8) * 2.2) al *= 0.15;   /* flicker before it snaps */
              ctx.shadowColor = 'rgba(' + BODY + ',0.9)'; ctx.shadowBlur = 8;
              ctx.fillStyle = 'rgba(' + (pulse > 0.82 || i === n - 1 ? HEAD : BODY) + ',' + al.toFixed(3) + ')';
              ctx.fillText(g.c, x, y);
            }
          } else strand = [];
        }
      }
      for (var k = shards.length - 1; k >= 0; k--) {
        var s = shards[k]; s.vy += 520 * dt; s.y += s.vy * dt; s.x += s.vx * dt; s.life -= dt * 1.5;
        if (s.life <= 0) { shards.splice(k, 1); continue; }
        if (Math.random() < 0.2) s.c = glyph();
        ctx.shadowBlur = 6; ctx.fillStyle = 'rgba(' + BODY + ',' + (s.life * 0.9).toFixed(3) + ')'; ctx.fillText(s.c, s.x, s.y);
      }
      ctx.shadowBlur = 0;
      if (target || shards.length) requestAnimationFrame(frame); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
    btns.forEach(function (b) { b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; if (target && target !== b) strand = []; target = b; mouse.x = e.clientX; mouse.y = e.clientY; start(); }); });
    window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('pointerleave', function () { if (target) snap(anchor()); });
    window.addEventListener('blur', function () { target = null; strand = []; });
    window.addEventListener('resize', size); size();
    window.__gxTether = function () { return { on: !!target, strand: strand.length, shards: shards.length }; };
  });
})();

/* Holographic cards for guides and tools: tilt toward the pointer, light follows it, colours slide across the card. */
(function () {
  function ready(f) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', f); else f(); }
  ready(function () {
    var cards = [].filter.call(document.querySelectorAll('.phase-grid .phase, .assess-card, .mag .minicard, .inc-grid2 .inc2'), function (c) { return !c.querySelector('blockquote'); });   /* guides and tools only, not quote cards */
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach(function (c) {
      c.classList.add('holo'); c.classList.remove('dk', 'dk-solid');
      if (still) return;
      c.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.classList.add('is-live');
        c.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((0.5 - y) * 14).toFixed(2) + 'deg');
        c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        c.style.setProperty('--gx', (100 - x * 100).toFixed(1) + '%'); c.style.setProperty('--gy', (100 - y * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', function () { c.classList.remove('is-live'); ['--rx', '--ry', '--gx', '--gy'].forEach(function (k) { c.style.removeProperty(k); }); });
    });
  });
})();

/* Chat launcher: replaces the GoHighLevel bubble with our own and gives the chat window an iPhone-messages look.
   The chat itself is still the GoHighLevel widget, so messages land in the same inbox. */
(function () {
  var SHADOW = [
    /* widget shell */
    '.lc_text-widget--bubble{visibility:hidden!important;pointer-events:none!important}',
    '#lc_text-widget>:not(#lc_text-widget--box):not(.lc_text-widget--bubble){display:none!important}',
    '.lc_text-widget--box{background:#000!important;border-radius:28px!important;overflow:hidden!important;border:1px solid rgba(255,255,255,.18)!important;box-shadow:0 30px 80px rgba(0,0,0,.7)!important}',
    '.lc_text-widget--header-wrapper,.lc_text-widget--header-wrapper>div,.lc_text-widget_heading--root{background:#0c0c0e!important;background-image:none!important;color:#fff!important}',
    '.lc_text-widget--header-wrapper{border-bottom:1px solid rgba(255,255,255,.1)!important}',
    /* conversation */
    ':host(chat-pane),:host(chat-conversation),ion-list,.footer{background:#000!important}',
    'ion-content{--background:#000!important}',
    '.message-container{background:transparent!important}',
    '.bubble{border-radius:19px!important;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif!important;font-size:15px!important}',
    '.bubble.incoming{background:#26262a!important;color:#fff!important}',
    '.bubble.incoming *{color:#fff!important}',
    '.bubble.outgoing{background:linear-gradient(135deg,var(--ac,#e8b79c),var(--ac2,#c27c5a))!important;color:#000!important}',
    '.bubble.outgoing *{color:#000!important}',
    '.footer-text{color:rgba(255,255,255,.5)!important}',
    /* input */
    '.input-container{background:#000!important;border-top:1px solid rgba(255,255,255,.1)!important}',
    '.input-container-textarea{background:#1c1c1e!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:20px!important}',
    'textarea{color:#fff!important;caret-color:var(--ac,#e8b79c)!important}',
    'textarea::placeholder{color:rgba(255,255,255,.45)!important}',
    '.attach-button,.input-icons button,.input-icons ion-icon{color:rgba(255,255,255,.7)!important}',
    '.live-chat-send-button{background:linear-gradient(135deg,var(--ac,#e8b79c),var(--ac2,#c27c5a))!important;border-radius:50%!important}'
  ].join('');
  function paint(root) {
    if (!root.querySelector('style[data-wc]')) { var s = document.createElement('style'); s.setAttribute('data-wc', '1'); s.textContent = SHADOW; root.appendChild(s); }
    var all = root.querySelectorAll('*'); for (var i = 0; i < all.length; i++) if (all[i].shadowRoot) paint(all[i].shadowRoot);
  }
  var btn, tip;
  function api() { return window.leadConnector && window.leadConnector.chatWidget; }
  function build() {
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cwb'; btn.setAttribute('aria-label', 'Chat with our team'); btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="cwb-msg" aria-hidden="true"><i></i><i></i><i></i></span><span class="cwb-x" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></span>';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () { var a = api(); if (!a) return; hideTip(); if (a.isActive()) a.closeWidget(); else a.openWidget(); setTimeout(sync, 120); });
    var seen = false; try { seen = sessionStorage.getItem('wc_chat_tip') === '1'; } catch (e) {}
    if (!seen) setTimeout(function () {
      var a = api(); if (!a || a.isActive() || document.documentElement.classList.contains('gxp-open')) return;
      tip = document.createElement('div'); tip.className = 'cwb-tip';
      tip.innerHTML = '<small>Wesnoski Coaching</small><button type="button" class="cwb-c" aria-label="Dismiss">×</button><button type="button" class="cwb-b">Have a question about coaching? Chat with our team.</button>';
      document.body.appendChild(tip); requestAnimationFrame(function () { tip.classList.add('on'); });
      tip.querySelector('.cwb-c').addEventListener('click', hideTip);
      tip.querySelector('.cwb-b').addEventListener('click', function () { hideTip(); api().openWidget(); setTimeout(sync, 120); });
    }, 6000);
  }
  function hideTip() { try { sessionStorage.setItem('wc_chat_tip', '1'); } catch (e) {} if (tip) { tip.classList.remove('on'); var t = tip; tip = null; setTimeout(function () { t.remove(); }, 400); } }
  function sync() { var a = api(); if (!a || !btn) return; var on = !!a.isActive(); btn.classList.toggle('open', on); btn.setAttribute('aria-expanded', on ? 'true' : 'false'); btn.setAttribute('aria-label', on ? 'Close chat' : 'Chat with our team'); if (on) hideTip(); }
  setInterval(function () {
    var w = document.querySelector('chat-widget'); if (!w || !w.shadowRoot) return;
    paint(w.shadowRoot);
    if (api()) { if (!btn) build(); sync(); }
  }, 600);
})();

/* footer mark: the 3D copper W */
(function () {
  function go() { [].forEach.call(document.querySelectorAll('footer a.brand img[src*="logo-180"]'), function (i) { i.src = 'ui/mark-3d-copper.svg'; i.classList.add('mark3d'); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
