/* Wesnoski Coaching — analytics consent gate.
   Outside the UK/EEA: trackers load immediately, as before.
   Inside the UK/EEA: nothing loads until the visitor opts in.
   Region is inferred from the browser timezone. No IP lookup, no third-party call.
   Fails closed: if region cannot be determined, the visitor is treated as gated. */
(function () {
  var GA_ID   = 'G-1ZF5HKTEET';
  var FB_ID   = '2035505933883732';
  var MC_HASH = '833bd817e4a8a2272ec1f019f1ea2df9';
  var KEY     = 'wc_consent_v1';
  var loaded  = false;

  /* ---------- region ---------- */
  var EXTRA = ['Atlantic/Reykjavik','Atlantic/Canary','Atlantic/Madeira','Atlantic/Azores',
               'Atlantic/Faroe','Africa/Ceuta','Asia/Nicosia','Asia/Famagusta',
               'Arctic/Longyearbyen','Indian/Mayotte','America/Cayenne',
               'Indian/Reunion','America/Martinique','America/Guadeloupe'];
  function gated() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (!tz) return true;
      if (tz.indexOf('Europe/') === 0) return true;
      return EXTRA.indexOf(tz) > -1;
    } catch (e) { return true; }
  }

  /* ---------- storage ---------- */
  function read()  { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v){ try { localStorage.setItem(KEY, v); }    catch (e) {} }
  function clear() { try { localStorage.removeItem(KEY); }    catch (e) {} }

  /* best effort: drop the analytics cookies already set on this domain */
  function dropCookies() {
    var host = location.hostname, parent = host.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_fbp|_fbc)/.test(name)) return;
      [host, '.' + host, parent, '.' + parent].forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d;
      });
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });
  }

  /* ---------- tracker loaders ---------- */
  function loadGA() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function loadMeta() {
    /* standard Meta bootstrap */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', FB_ID);
    fbq('track', 'PageView');
  }

  function loadMetricool() {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://tracker.metricool.com/resources/be.js';
    s.onload = s.onreadystatechange = function () {
      if (window.beTracker) beTracker.t({ hash: MC_HASH });
    };
    head.appendChild(s);
  }

  function loadAll() {
    if (loaded) return;
    loaded = true;
    loadGA(); loadMeta(); loadMetricool();
  }

  /* ---------- banner ---------- */
  function banner() {
    var wrap = document.createElement('div');
    wrap.className = 'cc';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Cookie choices');
    wrap.innerHTML =
      '<div class="cc-in">' +
        '<p class="cc-t">We use cookies to measure how this site is used and to show our content ' +
        'on other platforms. Nothing loads until you choose. Read our ' +
        '<a href="privacy.html">Privacy Policy</a>.</p>' +
        '<div class="cc-b">' +
          '<button type="button" class="btn cc-yes">Accept</button>' +
          '<button type="button" class="btn ghost cc-no">Decline</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('on'); });

    wrap.querySelector('.cc-yes').addEventListener('click', function () {
      write('accepted'); loadAll(); wrap.remove(); footerLink();
    });
    wrap.querySelector('.cc-no').addEventListener('click', function () {
      write('declined'); dropCookies(); wrap.remove(); footerLink();
    });
    wrap.querySelector('.cc-yes').focus();
  }

  /* withdrawal must be as easy as consent */
  function footerLink() {
    var box = document.querySelector('.foot-legal-links');
    if (!box || box.querySelector('.cc-reopen')) return;
    var a = document.createElement('a');
    a.href = '#';
    a.className = 'cc-reopen';
    a.textContent = 'Cookie Choices';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      clear();
      if (!document.querySelector('.cc')) banner();
    });
    box.appendChild(a);
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---------- decide ---------- */
  var choice = read();

  /* an explicit opt-out is honoured in every region */
  if (choice === 'declined') { ready(footerLink); return; }

  /* outside the UK/EEA nothing is gated, but the control is still offered */
  if (!gated()) { loadAll(); ready(footerLink); return; }

  if (choice === 'accepted') { loadAll(); ready(footerLink); return; }
  ready(banner);
})();
