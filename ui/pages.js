/* Shared page pieces for the preview: an iPad messages inbox built from each page's own reviews, and the team cut-outs.
   Nothing is invented: every bubble is text, video or a screenshot that is already on the page. */
(function () {
  function ready(f) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', f); else f(); }
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches, small = window.matchMedia('(max-width: 900px)');
  var PHOTO = { 'Frances B.': 'ui/fran.png', 'Melissa J.': 'ui/melissa.jpg', 'Scott M.': 'ui/scott.jpg' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function initials(n) { return n.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase(); }
  function avatar(c) { return c.photo ? '<img src="' + c.photo + '" alt="" width="40" height="40" loading="lazy"/>' : '<i>' + esc(c.mark || initials(c.name)) + '</i>'; }

  function buildInbox(host, convs, big) {
    var ICON = { voice: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 5v2M4.5 3v6M7 1.5v9M9.5 4v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>', video: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2v8l7-4z" fill="currentColor"/></svg>', image: '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.5" y="2.5" width="9" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>', text: '' };
    var list = convs.map(function (c, i) { return '<button type="button" class="ib-item" data-i="' + i + '">' + avatar(c) + '<span class="ib-it"><b>' + esc(c.name) + '</b><span>' + (ICON[c.kind] || '') + esc(c.preview) + '</span></span><em class="ib-new" aria-hidden="true"></em></button>'; }).join('');
    var panes = convs.map(function (c, i) {
      var body = c.bubbles.map(function (b) {
        if (b.type === 'video') return '<div class="ib-b ib-videob"><video playsinline controls preload="none"' + (b.poster ? ' poster="' + b.poster + '"' : '') + ' data-src="' + b.src + '" aria-label="Video from ' + esc(c.name) + '"></video></div>';
        if (b.type === 'shots') return '<div class="ib-shots">' + b.srcs.map(function (s, k) { return '<img src="' + s + '" alt="Client message screenshot ' + (k + 1) + '" loading="lazy"/>'; }).join('') + '</div>';
        return '<div class="ib-b"><p>' + esc(b.text) + '</p></div>' + (b.tags && b.tags.length ? '<div class="ib-tags">' + b.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '');
      }).join('');
      return '<div class="ib-conv" hidden><div class="ib-top"><button type="button" class="ib-back" aria-label="Back to messages">‹</button>' + avatar(c) + '<span><b>' + esc(c.name) + '</b><small>' + esc(c.sub || '') + '</small></span>' + (c.stars ? '<span class="ib-stars" aria-label="5 out of 5 stars">★★★★★</span>' : '') + '</div><div class="ib-body' + (c.kind === 'image' ? ' ib-scroll' : '') + '">' + body + '</div></div>';
    }).join('');
    host.innerHTML = '<div class="ib-device' + (big ? ' ib-big' : '') + '"><span class="ib-cam" aria-hidden="true"></span><div class="ib-app" role="region" aria-label="Messages from clients"><aside class="ib-list"><div class="ib-lh"><b>Messages</b><span>' + convs.length + ' conversations</span></div><div class="ib-items">' + list + '</div></aside><section class="ib-pane">' + panes + '</section></div></div>';
    var app = host.querySelector('.ib-app'), items = [].slice.call(app.querySelectorAll('.ib-item')), cs = [].slice.call(app.querySelectorAll('.ib-conv')), cur = -1, timer = null, touched = false, playing = null;
    function open(i, byUser) {
      if (byUser) { touched = true; clearInterval(timer); } if (playing && !playing.paused) playing.pause(); cur = i;
      items.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); if (k === i) b.classList.add('seen'); });
      cs.forEach(function (c, k) { c.hidden = k !== i; }); if (small.matches) app.classList.add('open');
      var it = items[i], box = it.parentNode; if (box.scrollHeight > box.clientHeight) box.scrollTop = Math.max(0, it.offsetTop - box.clientHeight / 2);
    }
    items.forEach(function (b, i) { b.addEventListener('click', function () { open(i, true); }); });
    [].forEach.call(app.querySelectorAll('.ib-back'), function (b) { b.addEventListener('click', function () { app.classList.remove('open'); if (playing) playing.pause(); }); });
    [].forEach.call(app.querySelectorAll('video'), function (v) {
      function arm() { if (!v.getAttribute('src')) v.src = v.getAttribute('data-src'); }
      v.addEventListener('pointerdown', arm, { once: true }); v.addEventListener('click', function () { arm(); if (v.paused) v.play().catch(function () {}); }, { once: true });
      v.addEventListener('play', function () { if (playing && playing !== v) playing.pause(); playing = v; touched = true; clearInterval(timer); });
    });
    [].forEach.call(app.querySelectorAll('.ib-shots img'), function (img) {
      img.addEventListener('click', function () { var z = document.createElement('div'); z.className = 'ib-zoom'; z.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '"/>'; z.addEventListener('click', function () { z.remove(); }); document.body.appendChild(z); });
    });
    function arrive() {
      items.forEach(function (b, i) { setTimeout(function () { b.classList.add('in'); }, still ? 0 : 120 * i); });
      if (!small.matches) { open(0, false); if (!still) timer = setInterval(function () { if (touched || (playing && !playing.paused) || small.matches) { clearInterval(timer); return; } open((cur + 1) % items.length, false); }, 5000); }
    }
    app.addEventListener('pointerenter', function () { clearInterval(timer); });
    if (window.IntersectionObserver) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { arrive(); o.disconnect(); } }, { threshold: 0.15 }).observe(app); else arrive();
    return { open: open, count: convs.length };
  }

  ready(function () {
    var main = document.querySelector('main'); if (!main || document.querySelector('.ib-device')) return;
    /* 1. reviews already on this page */
    var byName = {}, order = [];
    function conv(name) { if (!byName[name]) { byName[name] = { name: name, photo: PHOTO[name], bubbles: [], kind: 'text', stars: false, sub: '', preview: '' }; order.push(name); } return byName[name]; }
    var seen = {}, feat = [].filter.call(main.querySelectorAll('.phase-grid .phase'), function (c) { return c.querySelector('blockquote') && c.querySelector('.rwho'); });
    feat.forEach(function (c) {                                                    /* featured quote cards (stories page) lead the list */
      var who = c.querySelector('.rwho').textContent.trim(), q = c.querySelector('blockquote').textContent.trim(); if (seen[who + q]) return; seen[who + q] = 1;
      var tags = ((c.querySelector('.sub') || {}).textContent || '').split('·').map(function (t) { return t.trim(); }).filter(Boolean), cv = conv(who);
      cv.bubbles.push({ type: 'text', text: q, tags: tags }); if (!cv.sub) cv.sub = tags.join(' · '); if (!cv.preview) cv.preview = q.replace(/^["“]/, '').slice(0, 42) + '…';
    });
    var cards = [].filter.call(main.querySelectorAll('.rcard'), function (c) { return c.getAttribute('aria-hidden') !== 'true'; });
    cards.forEach(function (c) {
      var who = (c.querySelector('.rwho') || {}).textContent, q = (c.querySelector('blockquote') || {}).textContent; if (!who || !q) return;
      who = who.trim(); q = q.trim(); if (seen[who + q]) return; seen[who + q] = 1;
      var tags = ((c.querySelector('.rtag') || {}).textContent || '').split('·').map(function (t) { return t.trim(); }).filter(Boolean), cv = conv(who);
      cv.bubbles.push({ type: 'text', text: q, tags: tags }); cv.stars = cv.stars || !!c.querySelector('.stars'); if (!cv.sub) cv.sub = tags.join(' · ');
      if (!cv.preview) cv.preview = q.replace(/^["“]/, '').slice(0, 42) + '…';
    });
    /* 2. video stories (stories page) */
    var vids = [].slice.call(main.querySelectorAll('.vid-card'));
    vids.forEach(function (vc) {
      var src = (vc.querySelector('source') || vc.querySelector('video') || {}).src, b = vc.querySelector('.vid-cap b'); if (!src || !b) return;
      var name = b.textContent.trim(), cap = vc.querySelector('.vid-cap'), sub = cap.querySelector('.sub'), line = cap.textContent.replace(b.textContent, '').replace(sub ? sub.textContent : '', '').replace(/^[\s·]+/, '').trim(), cv = conv(name);
      cv.bubbles.unshift({ type: 'video', src: src, poster: name === 'Melissa J.' ? 'assets/melissa-poster.jpg' : '' }); cv.kind = 'video'; cv.preview = 'Video message'; if (line) cv.sub = line;
      if (sub) cv.bubbles.splice(1, 0, { type: 'text', text: sub.textContent.trim(), tags: [] });
      order.splice(order.indexOf(name), 1); order.unshift(name);                    /* videos lead the list */
    });
    /* 3. real message screenshots (stories page) */
    var shots = [].map.call(main.querySelectorAll('.phone .screen img'), function (i) { return i.currentSrc || i.src; }).filter(Boolean);
    if (shots.length) { var sc = conv('Client messages'); sc.mark = '✉'; sc.kind = 'image'; sc.sub = shots.length + ' real screenshots'; sc.preview = shots.length + ' screenshots'; sc.bubbles.push({ type: 'shots', srcs: shots }); }
    var convs = order.map(function (n) { return byName[n]; });
    if (convs.length) {
      /* hide what the inbox replaces, and put the iPad where the first of those blocks was */
      var srcs = [].slice.call(main.querySelectorAll('.reviews-flow,.vid-row,.phone-wall')), anchor = null;
      srcs.forEach(function (s) {
        var block = s; while (block.parentNode && block.parentNode !== main) block = block.parentNode;
        var onlyThis = block.querySelectorAll('h1').length === 0;                    /* keep a block that carries the page title */
        var target = onlyThis ? block : s; if (!anchor) anchor = target; target.classList.add('ib-src-hidden');
      });
      [].slice.call(main.children).forEach(function (el) {                           /* heading-only blocks that introduced a hidden block */
        if (el.classList.contains('ib-src-hidden') || el.querySelector('h1')) return;
        var nx = el.nextElementSibling; if (!nx || !nx.classList.contains('ib-src-hidden')) return;
        var rest = el.querySelectorAll('img,video,a.btn,form,table,.rcard').length; if (!rest && el.textContent.trim().length < 400) el.classList.add('ib-src-hidden');
      });
      if (feat.length) { var fg = feat[0].closest('.phase-grid'), fw = fg.parentNode; fg.classList.add('ib-src-hidden'); [].forEach.call(fw.querySelectorAll(':scope > .eyebrow, :scope > h2'), function (e) { e.classList.add('ib-src-hidden'); }); }   /* the results disclaimer in that block stays */
      var host = document.createElement('div'); host.className = 'wrap ib-host'; anchor.parentNode.insertBefore(host, anchor);
      window.__ibPage = buildInbox(host, convs, shots.length > 0 || vids.length > 0);
    }

    /* TEAM PAGE: swap the boxed portraits for cut-outs that slide in from alternate sides */
    var CUT = { 'Farren Brown': 'ui/farren-cut.png?v=2', 'Jimmy Baydoun': 'ui/jimmy-cut.png?v=2' };
    var ports = [].filter.call(document.querySelectorAll('.coach-card .coach-portrait'), function (p) { var img = p.querySelector('img'); return img && CUT[img.alt]; });
    ports.forEach(function (p, i) {
      var img = p.querySelector('img'); img.removeAttribute('srcset'); img.removeAttribute('sizes'); img.style.objectPosition = ''; img.src = CUT[img.alt];
      p.classList.remove('dk', 'dk-solid'); p.classList.add('tmc', i % 2 ? 'tmc-r' : 'tmc-l'); p.setAttribute('data-ghost', img.alt.split(' ')[0]);
    });
    if (ports.length) {
      if (still) { ports.forEach(function (p) { p.style.setProperty('--p', 1); }); return; }
      var tick = false;
      function run() { tick = false; var vh = window.innerHeight; ports.forEach(function (el) { var r = el.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh * 0.95 - r.top) / (vh * 0.6))); el.style.setProperty('--p', (1 - Math.pow(1 - p, 3)).toFixed(3)); }); }
      function req() { if (!tick) { tick = true; requestAnimationFrame(run); } }
      window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req); run();
    }
  });
})();

/* slider button for the client sign-in link */
(function () {
  function go() {
    [].forEach.call(document.querySelectorAll('a.client-login-button'), function (a) {
      if (a.classList.contains('slb')) return;
      var label = a.textContent.replace(/[→\s]+$/, '').trim(); a.classList.add('slb'); a.removeAttribute('style');
      a.innerHTML = '<span class="sl-knob" aria-hidden="true"><svg viewBox="0 0 20 18"><circle cx="2" cy="9" r="1.5"/><circle cx="6.5" cy="9" r="1.5"/><circle cx="11" cy="9" r="1.5"/><circle cx="15.5" cy="9" r="1.5"/><circle cx="11.5" cy="4.5" r="1.5"/><circle cx="11.5" cy="13.5" r="1.5"/><circle cx="7.5" cy="1.5" r="1.5"/><circle cx="7.5" cy="16.5" r="1.5"/></svg></span><span class="sl-label"></span>';
      a.querySelector('.sl-label').textContent = label;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  setTimeout(go, 1200);
})();

/* App screens section: pin while scrolling and step through the four panels */
(function () {
  function go() {
    var frame = document.querySelector('.sc-frame'); if (!frame || frame.dataset.pin) return;
    var tabs = frame.querySelectorAll('.sc-tab'), items = frame.querySelectorAll('.sc-item'), phone = frame.querySelector('.sc-phone'), n = tabs.length;
    if (n < 2 || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    frame.dataset.pin = '1';
    var pin = document.createElement('div'); pin.className = 'sc-pin'; frame.parentNode.insertBefore(pin, frame); pin.appendChild(frame);
    document.documentElement.classList.add('sc-pinned');
    var cur = -1, top = 0, raf = 0;
    function size() {
      var vh = window.innerHeight, fh = frame.offsetHeight, foot = window.innerWidth <= 900 ? 92 : 20;
      top = fh + 84 + foot > vh ? Math.min(70, vh - fh - foot) : Math.max(84, (vh - fh) / 2);
      frame.style.top = top + 'px'; pin.style.height = (fh + n * Math.round(vh * 0.62)) + 'px';
    }
    function tick() {
      raf = 0; var r = pin.getBoundingClientRect(), span = pin.offsetHeight - frame.offsetHeight; if (span <= 0) return;
      var p = Math.max(0, Math.min(0.999, (top - r.top) / span)), k = Math.floor(p * n);
      if (k === cur) return; cur = k;
      if (!items[k].classList.contains('is-on')) tabs[k].click();
      [].forEach.call(items, function (it, i) { it.classList.toggle('sc-seen', i <= k); });
      if (phone) { phone.classList.remove('sc-bump'); void phone.offsetWidth; phone.classList.add('sc-bump'); }
    }
    function req() { if (!raf) raf = requestAnimationFrame(tick); }
    size(); tick();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { size(); cur = -2; req(); });
    setTimeout(function () { size(); cur = -2; req(); }, 1500);
    [].forEach.call(tabs, function (t, i) { t.addEventListener('click', function (e) { if (!e.isTrusted) return; [].forEach.call(items, function (it, j) { if (j <= i) it.classList.add('sc-seen'); }); }); });
  }
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
})();
