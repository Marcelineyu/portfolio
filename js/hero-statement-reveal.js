
(function(){
  var stmt=document.querySelector('.hero-statement');
  if(!stmt||stmt.dataset.revealInit)return;
  stmt.dataset.revealInit='1';
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  requestAnimationFrame(function(){stmt.classList.add('is-reveal-ready');});
})();
