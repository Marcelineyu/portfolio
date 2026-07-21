
(function(){
  const contact=document.getElementById('contact');
  if(contact){
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.some(entry=>entry.isIntersecting && entry.intersectionRatio>0.08);
      contact.classList.toggle('contact-in-view',visible);
      document.body.classList.toggle('contact-in-view',visible);
    },{threshold:[0,.08,.2]});
    observer.observe(contact);
  }

  /* Replace the prior magnetic handler with a restrained 12px maximum range. */
  const zone=document.querySelector('#contact .send-zone');
  const oldOrb=document.getElementById('sendOrb');
  if(!zone||!oldOrb) return;
  const orb=oldOrb.cloneNode(true);
  oldOrb.replaceWith(orb);
  const label=orb.querySelector('span');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const state={x:0,y:0,tx:0,ty:0,lx:0,ly:0,tlx:0,tly:0,hover:false,raf:0};

  function render(){
    const ease=state.hover ? .085 : .065;
    state.x+=(state.tx-state.x)*ease;
    state.y+=(state.ty-state.y)*ease;
    state.lx+=(state.tlx-state.lx)*.10;
    state.ly+=(state.tly-state.ly)*.10;
    if(!reduce.matches){
      orb.style.transform=`translate3d(${state.x.toFixed(2)}px,${state.y.toFixed(2)}px,0)`;
      if(label) label.style.transform=`translate3d(${state.lx.toFixed(2)}px,${state.ly.toFixed(2)}px,0)`;
    }
    const delta=Math.abs(state.tx-state.x)+Math.abs(state.ty-state.y)+Math.abs(state.tlx-state.lx)+Math.abs(state.tly-state.ly);
    if(state.hover||delta>.06){ state.raf=requestAnimationFrame(render); }
    else{
      state.raf=0;
      orb.style.transform='translate3d(0,0,0)';
      if(label) label.style.transform='translate3d(0,0,0)';
    }
  }
  function start(){ if(!state.raf) state.raf=requestAnimationFrame(render); }

  orb.addEventListener('pointerenter',e=>{
    if(e.pointerType==='touch') return;
    state.hover=true;
    zone.classList.add('is-orb-hovered');
    start();
  });
  orb.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||reduce.matches) return;
    const r=orb.getBoundingClientRect();
    const nx=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width/2)));
    const ny=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height/2)));
    state.tx=nx*12;
    state.ty=ny*10;
    state.tlx=nx*4;
    state.tly=ny*3;
    start();
  });
  orb.addEventListener('pointerleave',()=>{
    state.hover=false;
    state.tx=state.ty=state.tlx=state.tly=0;
    zone.classList.remove('is-orb-hovered');
    start();
  });
  orb.addEventListener('focus',()=>zone.classList.add('is-orb-hovered'));
  orb.addEventListener('blur',()=>zone.classList.remove('is-orb-hovered'));
})();
