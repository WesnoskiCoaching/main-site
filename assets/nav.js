/* Wesnoski Coaching — mobile navigation.
   Injects the hamburger control and wires open/close.
   No markup change needed per page beyond loading this file. */
(function () {
  function init() {
    var nav = document.querySelector('nav.nav');
    if (!nav) return;
    var wrap = nav.querySelector('.wrap');
    var links = nav.querySelector('.nav-links');
    if (!wrap || !links || wrap.querySelector('.nav-toggle')) return;

    if (!links.id) links.id = 'navmenu';

    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', links.id);
    btn.innerHTML = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>';
    wrap.appendChild(btn);

    function set(open) {
      links.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    }
    function close() { set(false); }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      set(!links.classList.contains('open'));
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('click', function (e) {
      if (!links.classList.contains('open')) return;
      if (!nav.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) { close(); btn.focus(); }
    });

    var mq = window.matchMedia('(min-width: 1001px)');
    var onChange = function (e) { if (e.matches) close(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
