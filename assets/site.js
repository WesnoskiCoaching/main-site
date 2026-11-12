/* == v2.js == */
/* Progressive enhancements only: all primary content is available without JS. */
(function () {
  'use strict';
  document.querySelectorAll('.calc-units .unit').forEach(function (button) {
    button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
    button.addEventListener('click', function () {
      document.querySelectorAll('.calc-units .unit').forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
    });
  });
  // Announce the newly selected method panel without changing the native radio behavior.
  var march = document.querySelector('.march');
  if (march) {
    march.querySelector('.march-panel').setAttribute('aria-live', 'polite');
    march.querySelectorAll('input').forEach(function (input, i) {
      input.setAttribute('aria-controls', 'phase-' + i);
    });
  }
})();
/* == testimonial-video.js == */
(function () {
  var video = document.getElementById('melissa-video');
  var button = document.querySelector('.video-play');
  if (!video || !button) return;
  button.addEventListener('click', function () {
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.controls = true;
    button.hidden = true;
    video.play().catch(function () {
      button.hidden = false;
      button.textContent = 'Try playing again';
    });
  });
}());
/* == site-up.js == */
/* Sitewide: nav state, heading reveal, reading progress on guides. Nothing here is needed to read the page. */
(function () {
  var nav = document.querySelector('nav.nav');
  var bar = null, fill = null, ticking = false;
  if (document.querySelector('.mwrap, article.card')) {
    bar = document.createElement('div'); bar.className = 'siteup-progress'; bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i></i>'; document.body.appendChild(bar); fill = bar.firstChild;
  }
  function update() {
    ticking = false;
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
    if (fill) { var m = document.documentElement.scrollHeight - window.innerHeight; fill.style.transform = 'scaleX(' + (m > 0 ? Math.min(1, window.scrollY / m) : 0) + ')'; }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (still || !('IntersectionObserver' in window)) return;
  var heads = document.querySelectorAll('main section h2, main section .lede');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  heads.forEach(function (h) {
    if (h.getBoundingClientRect().top < window.innerHeight) return;
    h.classList.add('rv'); io.observe(h);
  });
})();

/* Apply bar. Phones and tablets only (CSS). Hidden while a closing ask, the footer, the cookie
   notice, the open menu, the guide form or a text field is on screen. Leaves the bottom-right
   corner to the chat bubble once the chat has loaded. */
(function () {
  if (!document.querySelector('nav.nav')) return;
  if (/\/(privacy|terms|disclaimer|booked|thanks|unlocked)(\.html)?$/.test(location.pathname)) return;
  var jimmy = document.querySelector('main a[href*="jimmy-application"]');
  var house = document.querySelector('nav.nav a[href*="/application"]');
  var src = jimmy || house; if (!src) return;
  var bar = document.createElement('div'); bar.className = 'applybar';
  var note = document.createElement('span'); note.textContent = jimmy ? 'Work with Jimmy' : '1-on-1 functional health coaching';
  var a = document.createElement('a'); a.className = 'btn'; a.href = src.href;
  a.textContent = jimmy ? 'Apply to work with Jimmy' : 'Apply for the Rebuild';
  bar.appendChild(note); bar.appendChild(a); document.body.appendChild(bar);
  a.addEventListener('click', function () {
    if (window.wcConsent && window.wcConsent.allowsTracking() && window.gtag) window.gtag('event', 'apply_bar_click', { page: location.pathname });
  });
  var asks = 0, typing = false, queued = false;
  function chat() { return document.querySelector('chat-widget, #lc_chat_widget, [id^="lc_text-widget"], iframe[src*="leadconnectorhq"]'); }
  function update() {
    queued = false;
    var links = document.querySelector('.nav-links.open');
    var show = window.scrollY > window.innerHeight * 0.6 && asks === 0 && !typing && !links &&
      !document.querySelector('.cc') && !document.querySelector('.wc-gate-modal');
    bar.classList.toggle('on', !!show);
    bar.classList.toggle('has-chat', !!chat());
    a.tabIndex = show ? 0 : -1;
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  if ('IntersectionObserver' in window) {
    var seen = new Set();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      asks = seen.size; queue();
    });
    var sel = '#apply, section.cta, .mcta, .reference-cta, .reference-ask, body > footer, .quiz-result, .calc-result', els;
    try { els = document.querySelectorAll(sel + ', section:has(> .wrap.cta)'); } catch (e) { els = document.querySelectorAll(sel); }
    els.forEach(function (el) { io.observe(el); });
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  document.addEventListener('focusin', function (e) { typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && e.target.type !== 'checkbox' && e.target.type !== 'radio'; queue(); });
  document.addEventListener('focusout', function () { typing = false; queue(); });
  document.addEventListener('click', function () { setTimeout(queue, 0); });
  if ('MutationObserver' in window) {
    new MutationObserver(queue).observe(document.body, { childList: true });
    var menu = document.querySelector('.nav-links');
    if (menu) new MutationObserver(queue).observe(menu, { attributes: true, attributeFilter: ['class'] });
  }
  update();
})();
/* == home.js == */
/* Homepage: the lab-read toggle. Content is readable without it. */
(function () {
  var card = document.querySelector('.read-card');
  if (!card) return;
  var flag = card.querySelector('.read-flag');
  var label = card.querySelector('.read-band-label');
  var buttons = card.querySelectorAll('.read-switch button');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-view');
      card.setAttribute('data-view', v);
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      flag.textContent = flag.getAttribute('data-' + v);
      label.textContent = label.getAttribute('data-' + v);
      try { if (window.wcConsent && window.wcConsent.allowsTracking() && typeof window.gtag === 'function') window.gtag('event', 'home_lab_toggle', { view: v }); } catch (e) {}
    });
  });
})();

/* MARCH: on tall desktop screens the method pins and scroll walks the five floors. Tabs still work. */
(function () {
  var march = document.querySelector('.march');
  if (!march || !window.matchMedia) return;
  var ok = window.matchMedia('(min-width:1001px) and (min-height:760px) and (prefers-reduced-motion:no-preference)');
  var radios = march.querySelectorAll('input[type="radio"]');
  var run = document.createElement('div'); run.className = 'march-run'; run.setAttribute('aria-hidden', 'true');
  march.parentNode.insertBefore(run, march.nextSibling);
  var bar = document.createElement('div'); bar.className = 'march-progress'; bar.innerHTML = '<i></i>';
  march.appendChild(bar);
  var fill = bar.firstChild, last = -1, ticking = false;
  function top(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
  function start() { return run.getBoundingClientRect().top + window.scrollY - march.offsetHeight - 96 - 22; }
  function update() {
    ticking = false;
    if (!march.classList.contains('is-pinned')) return;
    var p = (window.scrollY - start()) / run.offsetHeight;
    p = Math.max(0, Math.min(0.999, p));
    fill.style.transform = 'scaleX(' + p + ')';
    var i = Math.floor(p * radios.length);
    if (i !== last) { last = i; radios[i].checked = true; }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function mode() {
    var fits = ok.matches && march.offsetHeight < window.innerHeight - 110;
    march.classList.toggle('is-pinned', fits);
    last = -1; update();
  }
  march.querySelectorAll('.march-tab').forEach(function (tab, i) {
    tab.addEventListener('click', function (e) {
      if (!march.classList.contains('is-pinned')) return;
      e.preventDefault();
      window.scrollTo({ top: start() + run.offsetHeight * (i + 0.5) / radios.length, behavior: 'smooth' });
    });
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', mode);
  mode();
})();
/* == app-up.js == */
/* App page: the showcase list swaps the phone screen. First item shows without JS. */
(function () {
  var frame = document.querySelector('.sc-frame'); if (!frame) return;
  var tabs = frame.querySelectorAll('.sc-tab'), items = frame.querySelectorAll('.sc-item'), screens = frame.querySelectorAll('.sc-screen');
  function show(k) {
    items.forEach(function (it, n) { it.classList.toggle('is-on', n === k); });
    tabs.forEach(function (t, n) { t.setAttribute('aria-expanded', String(n === k)); });
    screens.forEach(function (s, n) { s.classList.toggle('is-on', n === k); });
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () {
      show(k);
      try { if (window.wcConsent && window.wcConsent.allowsTracking() && typeof gtag === 'function') gtag('event', 'app_showcase_view', { page: 'app', item: k + 1 }); } catch (e) {}
    });
  });
})();
