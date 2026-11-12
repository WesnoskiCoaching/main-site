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
