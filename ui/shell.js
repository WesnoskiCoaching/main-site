/* SHELL: gives every page the homepage's moving background, notch nav and dark surfaces. */
(function () {
  var root = document.documentElement; root.classList.add('bg-orig', 'shell');
  function ready(f) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', f); else f(); }
  ready(function () {
    var main = document.querySelector('main'); if (!main) return;
    var bg = document.createElement('div'); bg.className = 'page-bg'; bg.setAttribute('aria-hidden', 'true'); bg.innerHTML = '<canvas></canvas>'; document.body.insertBefore(bg, document.body.firstChild);
    var hadNav = !!document.querySelector('body>nav.nav');     /* confirmation pages have no nav on purpose: keep them that way */
    if (!hadNav) { background(bg.firstChild); darken(); window.addEventListener('load', darken); setTimeout(darken, 1500); return; }
    var wrap = document.createElement('div'); wrap.innerHTML = NN_HTML + NM_HTML; while (wrap.firstChild) main.parentNode.insertBefore(wrap.firstChild, main);
    var here = location.pathname.split('/').pop() || 'index.html';
    [].forEach.call(document.querySelectorAll('.nn-bar a,.nm-menu a'), function (a) { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });
    (function () { (function () {
  var nn = document.querySelector('.nn'), notch = nn.querySelector('.nn-notch'), wrap = nn.querySelector('.nn-panels');
  var btns = [].slice.call(nn.querySelectorAll('button[data-m]')), timer;
  function open(id) {
    clearTimeout(timer);
    btns.forEach(function (b) { b.setAttribute('aria-expanded', b.getAttribute('data-m') === id ? 'true' : 'false'); });
    [].forEach.call(nn.querySelectorAll('.nn-panel'), function (p) { p.classList.toggle('on', p.id === id); });
    wrap.style.height = id ? document.getElementById(id).offsetHeight + 'px' : '0px';
  }
  function closeSoon() { clearTimeout(timer); timer = setTimeout(function () { open(null); }, 180); }
  btns.forEach(function (b) {
    b.addEventListener('mouseenter', function () { open(b.getAttribute('data-m')); });
    b.addEventListener('click', function () { open(b.getAttribute('aria-expanded') === 'true' && !b.matches(':hover') ? null : b.getAttribute('data-m')); });
  });
  [].forEach.call(nn.querySelectorAll('.nn-bar a'), function (a) { a.addEventListener('mouseenter', closeSoon); });
  notch.addEventListener('mouseleave', closeSoon);
  notch.addEventListener('mouseenter', function () { clearTimeout(timer); });
  notch.addEventListener('focusout', function (e) { if (!notch.contains(e.relatedTarget)) closeSoon(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(null); });
  document.addEventListener('click', function (e) { if (!notch.contains(e.target)) open(null); });
  /* logo turns dark once the dark hero has scrolled away (or when the hero is light) */
  var hero, dark = /bg-orig/.test(document.documentElement.className);
  function tone() { var o = Math.max(0, 1 - window.scrollY / 48), lg = nn.querySelector('.nn-logo'); lg.style.opacity = o; lg.style.transform = 'translateY(' + (-(1 - o) * 8) + 'px)'; lg.style.pointerEvents = o < .2 ? 'none' : ''; lg.tabIndex = o < .2 ? -1 : 0; hero = hero || document.querySelector('.v2-hero'); nn.classList.toggle('nn-light', !dark || !hero || hero.getBoundingClientRect().bottom < 40); }
  window.addEventListener('scroll', tone, { passive: true }); document.addEventListener('DOMContentLoaded', tone); tone();
})(); })();
    (function () { (function () {
  var nm = document.querySelector('.nm'), btn = nm.querySelector('.nm-toggle'), menu = nm.querySelector('.nm-menu');
  function set(open) {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    if (!open) [].forEach.call(menu.querySelectorAll('details[open]'), function (d) { d.open = false; });
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); set(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', function (e) { if (menu.classList.contains('open') && !nm.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { set(false); btn.focus(); } });
})(); })();
    background(bg.firstChild);
    darken(); window.addEventListener('load', darken); setTimeout(darken, 1500);
    document.addEventListener('click', function () { setTimeout(darken, 60); });
  });

  function lum(c) { var m = c.match(/[\d.]+/g); if (!m) return null; return { l: (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255, a: m.length > 3 ? +m[3] : 1, r: +m[0], g: +m[1], b: +m[2] }; }
  /* Light cards become dark glass and dark text becomes light, so pages written for cream read on the dark background. */
  function darken() {
    var SKIP = '.inc2,.slb,.client-login-button,.gxp-back,.gxp,.gd-side,.gd-foot,.gd-extra,.gd-lock,.gd-finish,.gd-head,.gl-cont,.gl-ring,.ib-device,.ib-host,.coach-portrait,.holo,.phase-grid .phase,.assess-card,.mag .minicard,.nn,.nm,.gx-apply,.ipx,.phone,.sc-phone,.cc,.page-bg,.pv-switch,.mk,.ph-modal,img,video,canvas,svg,.official-store-badge';
    [].forEach.call(document.querySelectorAll('main *,footer,footer *'), function (e) {
      if (e.closest(SKIP) || e.classList.contains('dk') || e.classList.contains('dk-solid')) return;
      if (e.closest('h1,h2,h3,h4')) return;                 /* titles carry a gradient as text, not as a panel */
      var cs = getComputedStyle(e); if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') return;
      var b = lum(cs.backgroundColor), light = b && b.a > 0.35 && b.l > 0.55;
      if (!light && cs.backgroundImage.indexOf('gradient') > -1) { var g = cs.backgroundImage.match(/rgba?\([^)]+\)/g); if (g) { var n = 0; g.forEach(function (x) { var q = lum(x); if (q && q.a > 0.35 && q.l > 0.55) n++; }); light = n >= Math.ceil(g.length / 2); } }
      if (light) { var r = e.getBoundingClientRect(); e.classList.add(r.height < 14 || r.width < 14 ? 'dk-solid' : 'dk'); }
    });
    [].forEach.call(document.querySelectorAll('main *,footer *'), function (e) {
      if (e.closest(SKIP) || e.dataset.dkt) return;
      var has = false; for (var i = 0; i < e.childNodes.length; i++) if (e.childNodes[i].nodeType === 3 && e.childNodes[i].textContent.trim()) { has = true; break; }
      if (!has && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.tagName)) return;
      var c = lum(getComputedStyle(e).color); if (!c || c.l * c.a > 0.5) return;
      e.dataset.dkt = 1; e.style.setProperty('color', c.r > c.g + 28 && c.r > c.b + 28 ? '#e8b79c' : '#fbf6ee', 'important');
    });
  }

  function background(canvas) {
    var box = canvas.parentNode, gl = canvas.getContext('webgl'); if (!gl) return;
    var P = { BG: '#000000', COLORS: ['#e8b79c', '#c27c5a', '#995239', '#000000'], VIG: 0.2, GLOW: 0.3, GRAIN: 0.3 }, SPEED = 2.0;
    var VS = 'attribute vec2 position;varying vec2 vUv;void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}';
  var FS = [
  'precision highp float;varying vec2 vUv;',
  'uniform vec2 u_resolution;uniform float u_time;uniform float u_grain;uniform vec3 u_colors[4];uniform vec3 u_bg;uniform float u_vig;uniform float u_glow;',
  'vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}',
  'float snoise(vec2 v){',
  ' const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);',
  ' vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);',
  ' vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);',
  ' vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);',
  ' vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
  ' vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;',
  ' vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;',
  ' m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
  ' vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}',
  'void main(){',
  ' vec2 uv=vUv;float ratio=u_resolution.x/u_resolution.y;vec2 p=uv-0.5;p.x*=ratio;',
  ' float t=u_time*0.1;',
  ' float n1=snoise(p*0.4+vec2(t*0.2,-t*0.3));',
  ' float n2=snoise(p*0.55+vec2(-t*0.15,t*0.25)+n1*0.25);',
  ' float n3=snoise(p*0.75+vec2(t*0.1,-t*0.2)+n2*0.2);',
  ' vec3 col=u_bg;float dist=length(p)*1.5;float vignette=1.0-smoothstep(0.3,1.2,dist);',
  ' col=mix(col,u_colors[0],smoothstep(-0.2,0.5,n1)*0.85);',
  ' col=mix(col,u_colors[1],smoothstep(-0.1,0.6,n2)*0.7);',
  ' col=mix(col,u_colors[2],smoothstep(-0.3,0.4,n3)*0.6);',
  ' col=mix(col,u_colors[3],smoothstep(0.0,0.7,n1*n2)*0.5);',
  ' float glow=smoothstep(0.8,0.0,dist)*u_glow;col+=u_colors[1]*glow;',
  ' col=mix(col*u_vig,col,vignette);',
  ' float grain=fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453+u_time);',
  ' col+=(grain-0.5)*u_grain*0.1;',
  ' gl_FragColor=vec4(col,1.0);}'].join('\n');
    function rgb(hex) { hex = hex.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(hex.slice(i, i + 2), 16) / 255; }); }
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var pos = gl.getAttribLocation(prog, 'position'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    var U = function (n) { return gl.getUniformLocation(prog, n); }, uRes = U('u_resolution'), uTime = U('u_time');
    gl.uniform1f(U('u_grain'), P.GRAIN); gl.uniform1f(U('u_vig'), P.VIG); gl.uniform1f(U('u_glow'), P.GLOW);
    gl.uniform3fv(U('u_bg'), new Float32Array(rgb(P.BG))); gl.uniform3fv(U('u_colors'), new Float32Array([].concat.apply([], P.COLORS.map(rgb))));
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function draw(t) { gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uTime, t * 0.001 * SPEED); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    function resize() { var d = Math.min(window.devicePixelRatio || 1, (window.matchMedia && matchMedia('(pointer:coarse)').matches) ? 1.25 : 2); canvas.width = box.clientWidth * d; canvas.height = box.clientHeight * d; gl.viewport(0, 0, canvas.width, canvas.height); if (still) draw(8000); }
    window.addEventListener('resize', resize); resize();
    if (!still) requestAnimationFrame(function loop(t) { if (!document.hidden) draw(t); requestAnimationFrame(loop); });
  }
  var NN_HTML = "<header class=\"nn\" aria-label=\"Main navigation\">\n<a class=\"nn-logo\" href=\"index.html\" aria-label=\"Wesnoski Coaching\"></a>\n<nav class=\"nn-notch\" aria-label=\"Main\">\n<ul class=\"nn-bar\">\n<li><button type=\"button\" aria-expanded=\"false\" aria-controls=\"nn-method\" data-m=\"nn-method\">The Method <svg viewBox=\"0 0 10 10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2 3.5 5 6.5 8 3.5\"/></svg></button></li>\n<li><button type=\"button\" aria-expanded=\"false\" aria-controls=\"nn-team\" data-m=\"nn-team\">The Team <svg viewBox=\"0 0 10 10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2 3.5 5 6.5 8 3.5\"/></svg></button></li>\n<li><a href=\"reviews.html\">Stories</a></li>\n<li><button type=\"button\" aria-expanded=\"false\" aria-controls=\"nn-guides\" data-m=\"nn-guides\">Free Guides <svg viewBox=\"0 0 10 10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2 3.5 5 6.5 8 3.5\"/></svg></button></li>\n<li><a href=\"app.html\">The App</a></li>\n<li><a class=\"nn-cta\" href=\"apply.html\">Apply for the Rebuild <span aria-hidden=\"true\">\u2192</span></a></li>\n</ul>\n<div class=\"nn-panels\">\n<div class=\"nn-panel\" id=\"nn-method\"><div class=\"nn-grid\" style=\"grid-template-columns:repeat(5,1fr)\"><a class=\"nn-card\" href=\"index.html#method\"><b>M</b><strong>Mitochondria</strong></a><a class=\"nn-card\" href=\"index.html#method\"><b>A</b><strong>Absorption</strong></a><a class=\"nn-card\" href=\"index.html#method\"><b>R</b><strong>Resilience</strong></a><a class=\"nn-card\" href=\"index.html#method\"><b>C</b><strong>Cycle</strong></a><a class=\"nn-card\" href=\"index.html#method\"><b>H</b><strong>Healthspan</strong></a></div><a class=\"nn-more\" href=\"index.html#method\">See how the MARCH Method works \u2192</a></div>\n<div class=\"nn-panel\" id=\"nn-team\"><div class=\"nn-grid\" style=\"grid-template-columns:1fr 1fr\">\n<a class=\"nn-card nn-person\" href=\"farren.html\"><img src=\"assets/farren-portrait-560.jpg\" alt=\"\" width=\"54\" height=\"54\"/><div><strong>Farren Brown</strong><span>Founder \u00b7 The MARCH Method</span></div></a>\n<a class=\"nn-card nn-person\" href=\"jimmy.html\"><img src=\"assets/jimmy-portrait-520.jpg\" alt=\"\" width=\"54\" height=\"54\"/><div><strong>Jimmy Baydoun</strong><span>Regulate, Repair, Rebuild</span></div></a>\n</div><a class=\"nn-more\" href=\"coaches.html\">Meet the whole team \u2192</a></div>\n<div class=\"nn-panel\" id=\"nn-guides\"><div class=\"nn-grid\" style=\"grid-template-columns:repeat(3,1fr)\">\n<a class=\"nn-card\" href=\"iron-protocol.html\"><em class=\"tag\">Fe</em><strong>The Complete Iron Protocol</strong><i>Read the guide \u2192</i></a>\n<a class=\"nn-card\" href=\"metabolic-panel.html\"><em class=\"tag\">IR</em><strong>The Metabolic Panel Cheat Sheet</strong><i>Read the guide \u2192</i></a>\n<a class=\"nn-card\" href=\"estrogen-clearance.html\"><em class=\"tag\">E2</em><strong>The Estrogen Clearance Guide</strong><i>Read the guide \u2192</i></a>\n</div><a class=\"nn-more\" href=\"resources.html\">All seven free guides \u2192</a></div>\n</div>\n</nav>\n</header>", NM_HTML = "<header class=\"nm\">\n<nav class=\"nm-notch\" aria-label=\"Main\">\n<div class=\"nm-bar\"><a class=\"nm-logo\" href=\"index.html\" aria-label=\"Wesnoski Coaching\"></a><button class=\"nm-toggle\" type=\"button\" aria-label=\"Menu\" aria-expanded=\"false\" aria-controls=\"nm-menu\"><i></i><i></i></button></div>\n<div class=\"nm-menu\" id=\"nm-menu\"><div class=\"nm-inner\"><div class=\"nm-scroll\">\n<details name=\"nm\"><summary>The Method <svg viewBox=\"0 0 10 10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2 3.5 5 6.5 8 3.5\"/></svg></summary><div class=\"nm-sub\"><div class=\"nm-march\"><a href=\"index.html#method\"><b>M</b>Mitochondria</a><a href=\"index.html#method\"><b>A</b>Absorption</a><a href=\"index.html#method\"><b>R</b>Resilience</a><a href=\"index.html#method\"><b>C</b>Cycle</a><a href=\"index.html#method\"><b>H</b>Healthspan</a></div><a class=\"nm-more\" href=\"index.html#method\">See how the MARCH Method works \u2192</a></div></details>\n<details name=\"nm\"><summary>The Team <svg viewBox=\"0 0 10 10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2 3.5 5 6.5 8 3.5\"/></svg></summary><div class=\"nm-sub\">\n<a class=\"nm-row\" href=\"farren.html\"><img src=\"assets/farren-portrait-560.jpg\" alt=\"\" width=\"42\" height=\"42\" loading=\"lazy\"/><span>Farren Brown<small>Founder \u00b7 The MARCH Method</small></span></a>\n<a class=\"nm-row\" href=\"jimmy.html\"><img src=\"assets/jimmy-portrait-520.jpg\" alt=\"\" width=\"42\" height=\"42\" loading=\"lazy\"/><span>Jimmy Baydoun<small>Regulate, Repair, Rebuild</small></span></a>\n<a class=\"nm-more\" href=\"coaches.html\">Meet the whole team \u2192</a></div></details>\n<a class=\"nm-link\" href=\"reviews.html\">Stories</a>\n<details name=\"nm\"><summary>Free Guides <svg viewBox=\"0 0 10 10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2 3.5 5 6.5 8 3.5\"/></svg></summary><div class=\"nm-sub\">\n<a class=\"nm-row\" href=\"iron-protocol.html\"><em class=\"tag\">Fe</em><span>The Complete Iron Protocol</span></a>\n<a class=\"nm-row\" href=\"metabolic-panel.html\"><em class=\"tag\">IR</em><span>The Metabolic Panel Cheat Sheet</span></a>\n<a class=\"nm-row\" href=\"estrogen-clearance.html\"><em class=\"tag\">E2</em><span>The Estrogen Clearance Guide</span></a>\n<a class=\"nm-more\" href=\"resources.html\">All seven free guides \u2192</a></div></details>\n<a class=\"nm-link\" href=\"app.html\">The App</a>\n<a class=\"nm-cta\" href=\"apply.html\">Apply for the Rebuild <span aria-hidden=\"true\">\u2192</span></a>\n</div></div></div>\n</nav>\n</header>";
})();
