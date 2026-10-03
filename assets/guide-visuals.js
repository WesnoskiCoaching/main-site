(() => {
  const figures = document.querySelectorAll('.mag .gv-panel, .mag .gv-timeline, .mag .gv-nutrient-grid, .mag .gv-compare');
  figures.forEach(figure => figure.querySelectorAll('.gv-tile, .gv-flow > div').forEach((item, i) => item.style.setProperty('--i', i)));
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('gv-seen');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  figures.forEach(figure => observer.observe(figure));
})();
