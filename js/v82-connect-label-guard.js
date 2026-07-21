
(function(){
  const orb=document.getElementById('sendOrb');
  if(!orb) return;
  let label=orb.querySelector(':scope > span');
  if(!label){
    label=document.createElement('span');
    orb.appendChild(label);
  }
  if(!label.textContent.trim()) label.textContent='Connect';
  label.setAttribute('aria-hidden','true');
})();
