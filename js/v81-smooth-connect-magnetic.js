
(function(){
  const zone=document.querySelector('#contact .send-zone');
  const oldOrb=document.getElementById('sendOrb');
  if(!zone || !oldOrb) return;

  // Replace only the button to detach the older competing pointer handlers.
  // The button remains type="submit", so the existing form submission logic still works.
  const orb=oldOrb.cloneNode(true);
  oldOrb.replaceWith(orb);
  const label=orb.querySelector('span');

  const state={x:0,y:0,tx:0,ty:0,lx:0,ly:0,tlx:0,tly:0,hover:false,raf:0};
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');

  function render(){
    const ease=state.hover ? 0.075 : 0.055;
    state.x += (state.tx-state.x)*ease;
    state.y += (state.ty-state.y)*ease;
    state.lx += (state.tlx-state.lx)*0.09;
    state.ly += (state.tly-state.ly)*0.09;

    if(!reduced.matches){
      orb.style.transform=`translate3d(${state.x.toFixed(2)}px,${state.y.toFixed(2)}px,0)`;
      if(label) label.style.transform=`translate3d(${state.lx.toFixed(2)}px,${state.ly.toFixed(2)}px,0)`;
    }

    const moving=Math.abs(state.tx-state.x)+Math.abs(state.ty-state.y)+Math.abs(state.tlx-state.lx)+Math.abs(state.tly-state.ly);
    if(state.hover || moving>.08){
      state.raf=requestAnimationFrame(render);
    }else{
      state.raf=0;
      orb.style.transform='translate3d(0,0,0)';
      if(label) label.style.transform='translate3d(0,0,0)';
    }
  }

  function ensureRender(){
    if(!state.raf) state.raf=requestAnimationFrame(render);
  }

  zone.addEventListener('pointerenter',event=>{
    if(event.pointerType==='touch') return;
    state.hover=true;
    zone.classList.add('is-orb-hovered');
    ensureRender();
  });

  zone.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch' || reduced.matches) return;
    const zoneRect=zone.getBoundingClientRect();
    const orbRect=orb.getBoundingClientRect();
    const centerX=zoneRect.left+zoneRect.width/2;
    const centerY=zoneRect.top+zoneRect.height/2;
    const nx=Math.max(-1,Math.min(1,(event.clientX-centerX)/(zoneRect.width/2)));
    const ny=Math.max(-1,Math.min(1,(event.clientY-centerY)/(zoneRect.height/2)));

    // A restrained magnetic range creates a slow floating feeling instead of shaking.
    const maxX=Math.min(32,Math.max(18,(zoneRect.width-orbRect.width)/2-18));
    const maxY=Math.min(24,Math.max(14,(zoneRect.height-orbRect.height)/2-18));
    state.tx=nx*maxX;
    state.ty=ny*maxY;
    state.tlx=nx*7;
    state.tly=ny*5;
    ensureRender();
  });

  zone.addEventListener('pointerleave',()=>{
    state.hover=false;
    state.tx=0;
    state.ty=0;
    state.tlx=0;
    state.tly=0;
    zone.classList.remove('is-orb-hovered');
    ensureRender();
  });

  orb.addEventListener('focus',()=>zone.classList.add('is-orb-hovered'));
  orb.addEventListener('blur',()=>zone.classList.remove('is-orb-hovered'));
})();
