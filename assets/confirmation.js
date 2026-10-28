/* Neutral conversion pages. consent.js remains the only tracker loader. */
(function () {
  'use strict';
  var path = location.pathname;
  if (path !== '/thanks.html' && path !== '/booked.html') return;
  var isLead = path === '/thanks.html';
  var confirmed = new URL(location.href).searchParams.get('confirmed') === '1';
  // Do not forward arbitrary query values or fragments to any tracker.
  var cleanURL = location.origin + path + (!isLead && confirmed ? '?confirmed=1' : '');

  // An embedded form may redirect its iframe only. Track only at top level.
  if (window.top !== window.self) {
    try { window.top.location.replace(cleanURL); } catch (e) {}
    return;
  }
  // A meta policy alone does not sanitize the incoming document.referrer.
  // Navigate once under this page's origin policy before loading trackers.
  var referrerSafe = !document.referrer;
  try {
    if (document.referrer) {
      var ref = new URL(document.referrer);
      referrerSafe = document.referrer === ref.origin + '/';
    }
  } catch (e) {}
  if (!referrerSafe) {
    if (location.hash !== '#origin-only') location.replace(cleanURL + '#origin-only');
    return; // Fail closed if the browser does not reduce the referrer.
  }
  history.replaceState(null, '', cleanURL);

  if (isLead) {
    var dest = '/resources.html';
    try {
      localStorage.setItem('wc_unlocked', '1');
      var back = localStorage.getItem('wc_return');
      // Stored delivery paths never enter the tracking URL or event arguments.
      if (back && /^\/[a-z0-9-]+\.html$/i.test(back) &&
          back !== '/thanks.html' && back !== '/booked.html') dest = back;
      localStorage.removeItem('wc_return');
    } catch (e) {}
    document.getElementById('continue').href = dest + '?unlocked=1';
  }

  var sent = false;
  var key = isLead ? 'wc_meta_lead_session_v1' : 'wc_meta_schedule_session_v1';
  function track() {
    if (sent || (!isLead && !confirmed)) return;
    if (!window.wcConsent || !window.wcConsent.allowsTracking() ||
        typeof window.fbq !== 'function' || typeof window.fbq.callMethod !== 'function') return;
    try {
      if (sessionStorage.getItem(key) === '1') return;
      sessionStorage.setItem(key, '1');
      if (sessionStorage.getItem(key) !== '1') return;
    } catch (e) { return; } // No storage: skip rather than risk duplicates.
    sent = true;
    if (isLead) window.fbq('track', 'Lead');
    else window.fbq('track', 'Schedule');
  }
  // Capture script load events, including the pixel loaded after late consent.
  document.addEventListener('load', function (e) {
    if (e.target.tagName === 'SCRIPT') track();
  }, true);
  var consent = document.createElement('script');
  consent.src = 'assets/consent.js';
  consent.onload = track;
  document.head.appendChild(consent);
})();
