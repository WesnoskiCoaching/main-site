(function(){
'use strict';
var progress=document.querySelector('.reading-progress span');
function update(){var max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')';}
addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
document.querySelectorAll('.reference-nav a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var target=document.getElementById(a.hash.slice(1));if(target && (target.classList.contains('wc-hidden') || target.classList.contains('wc-teaser'))){var gate=document.querySelector('.wc-gate');if(gate){e.preventDefault();gate.scrollIntoView({block:'center'});}}});});
var checks=document.querySelectorAll('.readiness-checks input');
checks.forEach(function(input){input.addEventListener('change',function(){var n=Array.from(checks).filter(function(x){return x.checked}).length;document.querySelector('.check-count').textContent=n+' of '+checks.length+' items checked';});});
if('IntersectionObserver' in window){var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){document.querySelectorAll('.reference-nav [aria-current]').forEach(function(a){a.removeAttribute('aria-current');});var link=document.querySelector('.reference-nav a[href="#'+e.target.id+'"]');if(link)link.setAttribute('aria-current','location');}});},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('.reference-section[id]').forEach(function(s){obs.observe(s);});}
})();
