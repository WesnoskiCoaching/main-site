/* Optional analytics and chat require explicit acceptance for every visitor. */
(function () {
  var GA_ID   = 'G-1ZF5HKTEET';
  var FB_ID   = '2035505933883732';
  var MC_HASH = '833bd817e4a8a2272ec1f019f1ea2df9';
  var KEY     = 'wc_consent_v2';
  var loaded  = false;

  /* A new consent version includes optional chat. Old declines remain valid. */
  var deniedURL = new URL(location.href).searchParams.get('wc-consent') === 'declined';
  var choice = read();
  var accepted = !deniedURL && choice === 'accepted';
  window.wcConsent = { allowsTracking: function () { return accepted; } };

  function read() {
    try {
      // A storage failure must never turn a stale acceptance into permission.
      localStorage.setItem('wc_consent_probe', '1');
      localStorage.removeItem('wc_consent_probe');
      return localStorage.getItem(KEY) ||
        (localStorage.getItem('wc_consent_v1') === 'declined' ? 'declined' : null);
    } catch (e) { return null; }
  }
  function write(v) {
    try {
      localStorage.setItem(KEY, v);
      return localStorage.getItem(KEY) === v;
    } catch (e) { return false; }
  }
  function withdraw() {
    accepted = false;
    var saved = write('declined');
    if (loaded) {
      window['ga-disable-' + GA_ID] = true;
      if (window.gtag) window.gtag('consent', 'update', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      if (window.fbq) window.fbq('consent', 'revoke');
      window.gtag = window.fbq = window._fbq = function () {};
      if (window.beTracker) window.beTracker.t = function () {};
    }
    dropCookies();
    if (loaded) {
      // Executed vendor code cannot be unloaded. Leave this document immediately.
      // The URL denial survives reload even if storage writes failed.
      var url = new URL(location.href);
      url.searchParams.set('wc-consent', 'declined');
      location.replace(url.href);
    } else if (saved && deniedURL) {
      var url = new URL(location.href);
      url.searchParams.delete('wc-consent');
      history.replaceState(null, '', url.href);
      deniedURL = false;
    }
  }

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
    /* Meta bootstrap. The vendor snippet inserts the tag before the first <script>,
       which does not survive when this runs from an external file. Append to <head>
       instead, the same way GA and Metricool are loaded above. */
    if (!window.fbq) {
      var n = window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      var t = document.createElement('script');
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(t);
    }
    fbq('init', FB_ID);
    fbq('track', 'PageView');
  }

  function loadMetricool() {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://tracker.metricool.com/resources/be.js';
    s.onload = s.onreadystatechange = function () {
      if (accepted && window.beTracker) beTracker.t({ hash: MC_HASH });
    };
    head.appendChild(s);
  }

  function loadAll() {
    if (!accepted || loaded) return;
    loaded = true;
    loadGA(); loadMeta(); loadMetricool();
    ready(function () {
      if (!accepted) return;
      var s = document.createElement('script');
      s.src = 'https://widgets.leadconnectorhq.com/loader.js';
      s.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
      s.setAttribute('data-widget-id', '6ab5268bfad6c0284b5f1907');
      document.head.appendChild(s);
    });
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
        'on other platforms. Accept also enables live chat through GoHighLevel/LeadConnector. Optional analytics and chat stay off until you accept. Read our ' +
        '<a href="privacy.html">Privacy Policy</a>.</p>' +
        '<div class="cc-b">' +
          '<button type="button" class="btn cc-yes">Accept</button>' +
          '<button type="button" class="btn ghost cc-no">Decline</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('on'); });

    wrap.querySelector('.cc-yes').addEventListener('click', function () {
      write('accepted'); accepted = true;
      if (deniedURL) {
        var url = new URL(location.href);
        url.searchParams.delete('wc-consent');
        history.replaceState(null, '', url.href);
        deniedURL = false;
      }
      loadAll(); wrap.remove(); footerLink();
    });
    wrap.querySelector('.cc-no').addEventListener('click', function () {
      withdraw(); wrap.remove(); footerLink();
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
      if (!document.querySelector('.cc')) banner();
    });
    box.appendChild(a);
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---------- decide ---------- */
  if (deniedURL) { write('declined'); ready(footerLink); return; }
  if (choice === 'declined') { ready(footerLink); return; }
  if (accepted) { loadAll(); ready(footerLink); return; }
  ready(function () { banner(); footerLink(); });
})();
