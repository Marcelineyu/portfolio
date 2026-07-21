
(function(){
  const gift=document.getElementById('hiddenGift');
  const button=document.getElementById('giftBoxButton');
  const reveal=document.getElementById('giftReveal');
  if(!gift||!button||!reveal) return;
  button.setAttribute('aria-expanded', gift.classList.contains('open') ? 'true' : 'false');
  const observer=new MutationObserver(()=>{
    button.setAttribute('aria-expanded', gift.classList.contains('open') ? 'true' : 'false');
  });
  observer.observe(gift,{attributes:true,attributeFilter:['class']});
})();
