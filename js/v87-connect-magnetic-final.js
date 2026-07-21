
(function(){
  const form=document.getElementById('contactForm');
  const current=document.getElementById('sendOrb');
  const zone=current?.closest('.send-zone');
  if(!current||!zone) return;

  /* Replace only this button so older magnetic handlers can no longer affect it. */
  const orb=current.cloneNode(true);
  current.replaceWith(orb);
  let label=orb.querySelector(':scope > span');
  if(!label){
    label=document.createElement('span');
    label.textContent='Connect';
    orb.appendChild(label);
  }

  const coarse=window.matchMedia('(hover:none), (pointer:coarse)');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const SENSOR=46;
  const MAX_ORB=20;
  const MAX_LABEL=9;

  const state={
    x:0,y:0,tx:0,ty:0,
    lx:0,ly:0,tlx:0,tly:0,
    scale:1,targetScale:1,
    pressed:false,active:false,raf:0
  };

  function clamp(value,min,max){return Math.max(min,Math.min(max,value));}

  function layoutCenter(){
    const zoneRect=zone.getBoundingClientRect();
    const left=orb.offsetLeft;
    const top=orb.offsetTop;
    return {
      x:zoneRect.left+left+orb.offsetWidth/2,
      y:zoneRect.top+top+orb.offsetHeight/2,
      radius:Math.max(orb.offsetWidth,orb.offsetHeight)/2
    };
  }

  function render(){
    const returning=!state.active&&!state.pressed;
    const ease=returning?0.075:0.115;
    const labelEase=returning?0.09:0.14;
    state.x+=(state.tx-state.x)*ease;
    state.y+=(state.ty-state.y)*ease;
    state.lx+=(state.tlx-state.lx)*labelEase;
    state.ly+=(state.tly-state.ly)*labelEase;
    state.scale+=(state.targetScale-state.scale)*0.13;

    if(!coarse.matches&&!reduced.matches){
      orb.style.transform=`translate3d(${state.x.toFixed(2)}px,${state.y.toFixed(2)}px,0) scale(${state.scale.toFixed(4)})`;
      label.style.transform=`translate3d(${state.lx.toFixed(2)}px,${state.ly.toFixed(2)}px,0)`;
    }

    const delta=Math.abs(state.tx-state.x)+Math.abs(state.ty-state.y)+
      Math.abs(state.tlx-state.lx)+Math.abs(state.tly-state.ly)+
      Math.abs(state.targetScale-state.scale)*20;
    if(state.active||state.pressed||delta>0.05){
      state.raf=requestAnimationFrame(render);
    }else{
      state.raf=0;
      if(!coarse.matches&&!reduced.matches){
        orb.style.transform='translate3d(0,0,0) scale(1)';
        label.style.transform='translate3d(0,0,0)';
      }
    }
  }

  function start(){if(!state.raf) state.raf=requestAnimationFrame(render);}
  function reset(){
    state.active=false;
    state.tx=state.ty=state.tlx=state.tly=0;
    state.targetScale=state.pressed?0.97:1;
    start();
  }

  function track(event){
    if(event.pointerType==='touch'||coarse.matches||reduced.matches) return;
    const center=layoutCenter();
    const dx=event.clientX-center.x;
    const dy=event.clientY-center.y;
    const distance=Math.hypot(dx,dy);
    const threshold=center.radius+SENSOR;

    if(distance>threshold){
      if(state.active) reset();
      return;
    }

    state.active=true;
    const strength=1-distance/threshold;
    const pull=.18+.12*strength;
    state.tx=clamp(dx*pull,-MAX_ORB,MAX_ORB);
    state.ty=clamp(dy*pull,-MAX_ORB,MAX_ORB);
    state.tlx=clamp(dx*.10,-MAX_LABEL,MAX_LABEL);
    state.tly=clamp(dy*.10,-MAX_LABEL,MAX_LABEL);
    state.targetScale=distance<=center.radius?1.03:1;
    start();
  }

  /* The sensing area is mathematical only; no overlay blocks nearby content. */
  zone.addEventListener('pointermove',track,{passive:true});
  zone.addEventListener('pointerleave',reset);
  window.addEventListener('blur',reset);

  orb.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch'||coarse.matches||reduced.matches) return;
    state.pressed=true;
    state.targetScale=.97;
    start();
  });
  const release=()=>{
    state.pressed=false;
    state.targetScale=state.active?1.03:1;
    start();
  };
  orb.addEventListener('pointerup',release);
  orb.addEventListener('pointercancel',release);
  orb.addEventListener('lostpointercapture',release);

  /* Settle the magnetic transform on submit; label/status is owned by the Formspree handler (v90). */
  form?.addEventListener('submit',()=>{
    reset();
  },true);
})();
