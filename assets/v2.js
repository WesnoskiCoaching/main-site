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
