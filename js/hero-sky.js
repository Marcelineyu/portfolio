
import * as THREE from 'three/webgpu';
import { SkyMesh } from 'three/addons/objects/SkyMesh.js';

(async function initHeroSky(){
  if(window.heroCanvasReady) return;
  const heroMount=document.getElementById('heroCanvas');
  const heroSection=document.querySelector('.hero');
  if(!heroMount||!heroSection) return;
  if(!navigator.gpu) return;

  try{localStorage.removeItem('marceline-hero-sky-settings-v1');}catch(_e){}

  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile=window.matchMedia('(max-width:600px)').matches;
  const maxPixelRatio=isMobile?1.25:1.5;

  const OFFICIAL_DAY_DEFAULTS={
    turbidity:10,rayleigh:3,mieCoefficient:0.005,mieDirectionalG:0.7,
    elevation:2,azimuth:180,exposure:0.5,showSunDisc:true,
    cloudCoverage:0.4,cloudDensity:0.4,cloudElevation:0.5,
    cloudScale:0.0002,cloudSpeed:0.0001
  };

  const effectController={...OFFICIAL_DAY_DEFAULTS};
  let panelOpen=false;

  window.heroCanvasReady=true;
  const width=Math.max(heroMount.clientWidth,1);
  const height=Math.max(heroMount.clientHeight,1);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,width/height,100,2000000);
  camera.position.set(0,100,2000);
  camera.lookAt(0,0,0);

  const MAX_YAW=0.10;
  const MAX_PITCH=0.045;
  const CAMERA_DAMPING=0.035;
  const LOOK_SCALE=8000;
  const isCoarsePointer=window.matchMedia('(pointer: coarse)').matches;
  const cameraControlEnabled=!reducedMotion&&!isCoarsePointer;
  let targetYaw=0,targetPitch=0,currentYaw=0,currentPitch=0;
  let guiBlocksCamera=false;

  const renderer=new THREE.WebGPURenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,maxPixelRatio));
  renderer.setSize(width,height,false);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=OFFICIAL_DAY_DEFAULTS.exposure;

  const sky=new SkyMesh();
  sky.scale.setScalar(450000);
  const sun=new THREE.Vector3();

  function applyDaySkyValues(){
    sky.turbidity.value=effectController.turbidity;
    sky.rayleigh.value=effectController.rayleigh;
    sky.mieCoefficient.value=effectController.mieCoefficient;
    sky.mieDirectionalG.value=effectController.mieDirectionalG;
    sky.cloudCoverage.value=effectController.cloudCoverage;
    sky.cloudDensity.value=effectController.cloudDensity;
    sky.cloudElevation.value=effectController.cloudElevation;
    sky.cloudScale.value=effectController.cloudScale;
    sky.cloudSpeed.value=effectController.cloudSpeed;
    sky.showSunDisc.value=effectController.showSunDisc;
    const phi=THREE.MathUtils.degToRad(90-effectController.elevation);
    const theta=THREE.MathUtils.degToRad(effectController.azimuth);
    sun.setFromSphericalCoords(1,phi,theta);
    sky.sunPosition.value.copy(sun);
  }

  applyDaySkyValues();
  scene.add(sky);

  await renderer.init();
  heroMount.appendChild(renderer.domElement);

  let heroVisible=true,pageVisible=!document.hidden,disposed=false;





  function requestSkyRender(){
    if(disposed||!heroVisible||!pageVisible) return;
    updateCameraView();
    renderer.toneMappingExposure=effectController.exposure;
    renderer.render(scene,camera);
  }

  function updateCameraView(){
    camera.position.set(0,100,2000);
    if(cameraControlEnabled){
      if(!guiBlocksCamera){
        currentYaw+=(targetYaw-currentYaw)*CAMERA_DAMPING;
        currentPitch+=(targetPitch-currentPitch)*CAMERA_DAMPING;
      }
    }else{
      currentYaw=0;currentPitch=0;targetYaw=0;targetPitch=0;
    }
    camera.lookAt(currentYaw*LOOK_SCALE,-currentPitch*LOOK_SCALE,0);
  }

  function onHeroPointerMove(event){
    if(!cameraControlEnabled||guiBlocksCamera) return;
    if(event.target.closest('.hero-sky-gui-panel,.hero-sky-gui-trigger')) return;
    const rect=heroSection.getBoundingClientRect();
    const pointerX=(event.clientX-rect.left)/rect.width*2-1;
    const pointerY=(event.clientY-rect.top)/rect.height*2-1;
    targetYaw=pointerX*MAX_YAW;
    targetPitch=pointerY*MAX_PITCH;
  }

  function onHeroPointerLeave(){
    if(!cameraControlEnabled) return;
    targetYaw=0;targetPitch=0;
  }

  let lastFrame=performance.now();
  function animate(now){
    if(!heroVisible||!pageVisible||disposed) return;
    lastFrame=now;
    updateCameraView();
    renderer.render(scene,camera);
  }

  function renderHeroSky(){
    if(!heroVisible||!pageVisible||disposed) return;
    renderer.toneMappingExposure=effectController.exposure;
    updateCameraView();
    renderer.render(scene,camera);
  }

  function startHeroLoop(){
    if(disposed) return;
    if(reducedMotion){renderHeroSky();return;}
    lastFrame=performance.now();
    renderer.setAnimationLoop(animate);
  }

  function stopHeroLoop(){renderer.setAnimationLoop(null);}

  function formatDayValue(key,value){
    if(key==='exposure') return value.toFixed(4);
    if(key==='cloudScale'||key==='cloudSpeed') return value.toFixed(5);
    if(key==='rayleigh'||key==='mieCoefficient'||key==='mieDirectionalG') return value.toFixed(3);
    if(key==='cloudCoverage'||key==='cloudDensity'||key==='cloudElevation') return value.toFixed(2);
    return value.toFixed(1);
  }


  function syncGuiFields(){
    const panel=document.getElementById('heroSkyGuiPanel');
    if(!panel) return;
    panel.querySelectorAll('.hero-sky-gui-row[data-key]').forEach(row=>{
      const key=row.dataset.key;
      const input=row.querySelector('input[type=range]');
      const val=row.querySelector('.hero-sky-gui-val');
      if(!input||!(key in effectController)) return;
      input.value=String(effectController[key]);
      if(val) val.textContent=formatDayValue(key,effectController[key]);
    });
    const sunDisc=document.getElementById('sky-showSunDisc');
    if(sunDisc) sunDisc.checked=!!effectController.showSunDisc;
  }

  function guiChanged(){
    applyDaySkyValues();
    renderer.toneMappingExposure=effectController.exposure;
    requestSkyRender();
  }

  function resetSettings(){
    try{localStorage.removeItem('marceline-hero-sky-settings-v1');}catch(_e){}
    Object.assign(effectController,OFFICIAL_DAY_DEFAULTS);
    applyDaySkyValues();
    renderer.toneMappingExposure=effectController.exposure;
    syncGuiFields();
    requestSkyRender();
  }

  const trigger=document.getElementById('heroSkyGuiTrigger');
  const panel=document.getElementById('heroSkyGuiPanel');
  const closeBtn=document.getElementById('heroSkyGuiClose');
  const resetBtn=document.getElementById('heroSkyReset');

  function setPanelOpen(open){
    panelOpen=!!open;
    if(!panel||!trigger) return;
    if(panelOpen){
      panel.hidden=false;
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded','true');
      trigger.setAttribute('aria-label','Close sky settings');
      panel.querySelectorAll('input,select,button').forEach(el=>{
        if(el.id==='heroSkyGuiTrigger') return;
        el.tabIndex=0;
        el.removeAttribute('aria-hidden');
      });
    }else{
      panel.classList.remove('is-open');
      panel.hidden=true;
      trigger.setAttribute('aria-expanded','false');
      trigger.setAttribute('aria-label','Open sky settings');
      panel.querySelectorAll('input,select,button').forEach(el=>{
        if(document.activeElement===el) trigger.focus();
        el.tabIndex=-1;
      });
    }
  }

  function initHeroSkyGui(){
    if(!panel||!trigger) return;
    syncGuiFields();
    setPanelOpen(false);

    trigger.addEventListener('click',()=>setPanelOpen(!panelOpen));
    closeBtn?.addEventListener('click',()=>setPanelOpen(false));

    trigger?.addEventListener('pointerenter',()=>{guiBlocksCamera=true;});
    trigger?.addEventListener('pointerleave',(e)=>{
      if(!e.relatedTarget||!trigger.contains(e.relatedTarget)) guiBlocksCamera=false;
    });
    panel?.addEventListener('pointerenter',()=>{guiBlocksCamera=true;});
    panel?.addEventListener('pointerleave',(e)=>{
      if(!e.relatedTarget||!panel.contains(e.relatedTarget)) guiBlocksCamera=false;
    });

    panel.querySelectorAll('.hero-sky-gui-section-toggle').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const section=btn.closest('.hero-sky-gui-section');
        const collapsed=section.classList.toggle('is-collapsed');
        btn.setAttribute('aria-expanded',collapsed?'false':'true');
      });
    });

    panel.querySelectorAll('.hero-sky-gui-row[data-key] input[type=range]').forEach(input=>{
      input.addEventListener('input',()=>{
        const key=input.closest('.hero-sky-gui-row')?.dataset.key;
        if(!key) return;
        effectController[key]=parseFloat(input.value);
        const val=input.closest('.hero-sky-gui-row')?.querySelector('.hero-sky-gui-val');
        if(val) val.textContent=formatDayValue(key,effectController[key]);
        guiChanged();
      });
    });

    const sunDisc=document.getElementById('sky-showSunDisc');
    sunDisc?.addEventListener('change',()=>{
      effectController.showSunDisc=!!sunDisc.checked;
      guiChanged();
    });


    resetBtn?.addEventListener('click',resetSettings);
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&panelOpen) setPanelOpen(false);
    });
  }

  const heroObserver=new IntersectionObserver(entries=>{
    heroVisible=entries[0]?.isIntersecting??true;
    if(heroVisible&&pageVisible) startHeroLoop();
    else stopHeroLoop();
  },{threshold:0.08});
  heroObserver.observe(heroSection);

  const onHeroVisibility=()=>{
    pageVisible=!document.hidden;
    if(pageVisible&&heroVisible) startHeroLoop();
    else stopHeroLoop();
  };
  document.addEventListener('visibilitychange',onHeroVisibility);

  if(cameraControlEnabled){
    heroSection.addEventListener('pointermove',onHeroPointerMove);
    heroSection.addEventListener('pointerleave',onHeroPointerLeave);
  }

  const heroResizeObserver=new ResizeObserver(()=>{
    const newWidth=Math.max(heroMount.clientWidth,1);
    const newHeight=Math.max(heroMount.clientHeight,1);
    camera.aspect=newWidth/newHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,maxPixelRatio));
    renderer.setSize(newWidth,newHeight,false);
    if(reducedMotion) renderHeroSky();
  });
  heroResizeObserver.observe(heroMount);

  initHeroSkyGui();
  heroSection.classList.add('hero-sky-ready');
  startHeroLoop();

  window.disposeHeroSky=()=>{
    if(disposed) return;
    disposed=true;
    stopHeroLoop();
    heroObserver.disconnect();
    heroResizeObserver.disconnect();
    document.removeEventListener('visibilitychange',onHeroVisibility);
    heroSection.removeEventListener('pointermove',onHeroPointerMove);
    heroSection.removeEventListener('pointerleave',onHeroPointerLeave);
    sky.geometry.dispose();
    sky.material.dispose();
    renderer.dispose();
    if(renderer.domElement.parentNode===heroMount) heroMount.removeChild(renderer.domElement);
    heroSection.classList.remove('hero-sky-ready');
    window.heroCanvasReady=false;
  };
})().catch(()=>{});
