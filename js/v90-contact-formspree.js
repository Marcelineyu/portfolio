
(function(){
  const form=document.getElementById('contactForm');
  if(!form || form.dataset.formspreeBound) return;
  form.dataset.formspreeBound='1';
  const endpoint='https://formspree.io/f/mgogygro';
  const status=document.getElementById('contactStatus');
  const contact=document.getElementById('contact');
  const layer=document.getElementById('contactCelebrationLayer');
  let sending=false;

  function setStatus(message){
    if(!status) return;
    status.textContent=message||'';
    status.hidden=!message;
  }
  function orb(){return document.getElementById('sendOrb');}
  function orbLabel(){const o=orb();return o?o.querySelector('span'):null;}
  function clearCelebration(){
    if(contact) contact.classList.remove('celebrate-full');
    if(layer) layer.innerHTML='';
  }

  form.addEventListener('submit',function(event){
    event.preventDefault();
    if(sending) return;
    sending=true;

    const o=orb(), label=orbLabel();
    if(o){o.disabled=true;o.classList.remove('is-sent');}
    if(label) label.textContent='Sending...';
    setStatus('');

    fetch(endpoint,{
      method:'POST',
      body:new FormData(form),
      headers:{'Accept':'application/json'}
    }).then(function(response){
      if(response.ok){
        setStatus('Thank you. Your message has been sent.');
        form.reset();
      }else{
        setStatus('Something went wrong. Please try again.');
        clearCelebration();
      }
    }).catch(function(){
      setStatus('Something went wrong. Please try again.');
      clearCelebration();
    }).finally(function(){
      sending=false;
      const o2=orb(), label2=orbLabel();
      if(o2){o2.disabled=false;o2.classList.remove('is-sent');}
      if(label2) label2.textContent='Connect';
    });
  });
})();
