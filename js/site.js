const nav=document.getElementById('nav');
    addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60));
    const modal=document.getElementById('resumeModal');
    const resumeRequestForm=document.getElementById('resumeRequestForm');
    const resumeSuccess=document.getElementById('resumeSuccess');
    const resetResumeModal=()=>{
      resumeRequestForm?.reset();
      if(resumeRequestForm){
        resumeRequestForm.hidden=false;
        resumeRequestForm.style.removeProperty('display');
      }
      if(resumeSuccess){
        resumeSuccess.hidden=true;
        resumeSuccess.style.removeProperty('display');
      }
    };
    const closeResumeModal=()=>{modal.classList.remove('open');resetResumeModal();};
    document.querySelectorAll('[data-resume]').forEach(el=>el.addEventListener('click',e=>{
      e.preventDefault();
      resetResumeModal();
      modal.classList.add('open');
    }));
    document.getElementById('closeModal').onclick=closeResumeModal;
    modal.addEventListener('click',e=>{if(e.target===modal)closeResumeModal()});
    resumeRequestForm?.addEventListener('submit',e=>{
      e.preventDefault();
      if(!resumeRequestForm.reportValidity()) return;
      resumeRequestForm.hidden=true;
      resumeRequestForm.style.display='none';
      if(resumeSuccess){
        resumeSuccess.hidden=false;
        resumeSuccess.style.display='block';
      }
    });


    /* Progressive reveal system */
    const revealTargets = [
      ...document.querySelectorAll(
        '.opening .about-grid > *, ' +
        '.opening .education-mini, ' +
        '.section > .wrap > .head, ' +
        '#labs .lab-tile, ' +
        '#projects .research-row, #projects .project-row, ' +
        '#beyond .beyond-acc-item, ' +
        '.contact-intro > *, .contact-field, .send-zone, .contact-aside > div'
      )
    ];

    revealTargets.forEach((element,index)=>{
      element.classList.add('section-reveal');
      if(!element.style.getPropertyValue('--reveal-delay')){
        element.style.setProperty('--reveal-delay', `${Math.min((index % 5) * 55,220)}ms`);
      }
    });

    const revealObserver = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },{
      threshold:.12,
      rootMargin:'0px 0px -8% 0px'
    });

    revealTargets.forEach(element=>revealObserver.observe(element));

    /* Smoothly interpolate timeline progress instead of snapping */
    let displayedTimelineProgress = 0;
    let targetTimelineProgress = 0;
    let timelineRaf = null;

    function renderTimelineProgress(){
      displayedTimelineProgress += (targetTimelineProgress - displayedTimelineProgress) * .115;
      timelineProgress.style.height = `${displayedTimelineProgress * 100}%`;

      if(Math.abs(targetTimelineProgress - displayedTimelineProgress) > .001){
        timelineRaf = requestAnimationFrame(renderTimelineProgress);
      }else{
        displayedTimelineProgress = targetTimelineProgress;
        timelineProgress.style.height = `${displayedTimelineProgress * 100}%`;
        timelineRaf = null;
      }
    }

    function setSmoothTimelineProgress(progress){
      targetTimelineProgress = progress;
      if(!timelineRaf) timelineRaf = requestAnimationFrame(renderTimelineProgress);
    }

    const timeline=document.getElementById('careerTimeline');
    const timelineProgress=document.getElementById('timelineProgress');
    const timelineEntries=[...document.querySelectorAll('.timeline-entry')];
    const timelineObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    },{threshold:.18});
    timelineEntries.forEach(entry=>timelineObserver.observe(entry));

    function updateTimeline(){
      if(!timeline||!timelineProgress)return;
      const rect=timeline.getBoundingClientRect();
      const viewportPoint=innerHeight*.52;
      const progress=Math.max(0,Math.min(1,(viewportPoint-rect.top)/rect.height));
      setSmoothTimelineProgress(progress);
      let activeIndex=0;
      timelineEntries.forEach((entry,index)=>{
        const entryRect=entry.getBoundingClientRect();
        if(entryRect.top<viewportPoint)activeIndex=index;
        entry.classList.toggle('is-active',index===activeIndex);
      });
    }
    addEventListener('scroll',updateTimeline,{passive:true});
    addEventListener('resize',updateTimeline);
    updateTimeline();

    document.querySelectorAll('.beyond-trigger').forEach(trigger=>{
      trigger.addEventListener('click',()=>{
        const item=trigger.closest('.beyond-acc-item');
        const isOpen=item.classList.contains('open');
        document.querySelectorAll('.beyond-acc-item').forEach(other=>{
          other.classList.remove('open');
          const btn=other.querySelector('.beyond-trigger');
          if(btn) btn.setAttribute('aria-expanded','false');
        });
        if(!isOpen){
          item.classList.add('open');
          trigger.setAttribute('aria-expanded','true');
        }
      });
    });

    const projectLightbox=document.getElementById('projectLightbox');
    const projectLightboxTitle=document.getElementById('projectLightboxTitle');
    const projectLightboxClose=document.getElementById('projectLightboxClose');

    document.querySelectorAll('.lab-image-button').forEach(button=>{
      button.addEventListener('click',()=>{
        projectLightboxTitle.textContent=button.dataset.lightboxTitle || 'Project preview';
        projectLightbox.classList.add('open');
        document.body.style.overflow='hidden';
      });
    });
    function closeProjectLightbox(){
      projectLightbox.classList.remove('open');
      document.body.style.overflow='';
    }
    projectLightboxClose.addEventListener('click',closeProjectLightbox);
    projectLightbox.addEventListener('click',event=>{
      if(event.target===projectLightbox) closeProjectLightbox();
    });

    const sendOrb=document.getElementById('sendOrb');
    if(sendOrb){
      sendOrb.addEventListener('pointermove',event=>{
        const rect=sendOrb.getBoundingClientRect();
        const x=(event.clientX-(rect.left+rect.width/2))*.18;
        const y=(event.clientY-(rect.top+rect.height/2))*.18;
        sendOrb.style.transform=`translate(${x}px,${y}px)`;
      });
      sendOrb.addEventListener('pointerleave',()=>{
        sendOrb.style.transform='translate(0,0)';
      });
    }

    /* Contact form submission is handled by the Formspree script (v90) below. */

    document.addEventListener('keydown',event=>{
      if(event.key==='Escape' && projectLightbox.classList.contains('open')) closeProjectLightbox();
    });


    /* V26 Beyond Work master-detail */
    const bwSideItems=[...document.querySelectorAll('.bw-side-item')];
    const bwViews=[...document.querySelectorAll('.bw-view')];

    bwSideItems.forEach(item=>{
      item.addEventListener('click',()=>{
        bwSideItems.forEach(other=>other.classList.remove('active'));
        bwViews.forEach(view=>view.classList.remove('show'));
        item.classList.add('active');
        const target=document.getElementById(`bw-${item.dataset.bwTarget}`);
        if(target) target.classList.add('show');
        if(item.dataset.bwTarget==='travel') initBwGlobe();
      });
    });

    const bwStoryContinue=document.getElementById('bwStoryContinue');
    const bwStoryMore=document.getElementById('bwStoryMore');
    const bwStoryCollapse=document.getElementById('bwStoryCollapse');
    const bwStoryTop=document.getElementById('bwStoryTop');

    bwStoryContinue?.addEventListener('click',()=>{
      bwStoryMore.classList.add('is-open');
      bwStoryContinue.style.display='none';
    });
    bwStoryCollapse?.addEventListener('click',()=>{
      bwStoryMore.classList.remove('is-open');
      bwStoryContinue.style.display='inline-flex';
      bwStoryTop?.scrollIntoView({behavior:'smooth',block:'start'});
    });

    const bwTravelData={
      "Europe":["Belgium","Poland","Bulgaria","Germany","France","Finland","Netherlands","Czech Republic","Luxembourg","Romania","Norway","Portugal","Switzerland","Spain","Greece","Hungary","Italy","United Kingdom","Austria"],
      "Asia":["South Korea","Japan","Sri Lanka","Thailand","Turkey","Singapore","India","China"],
      "North Africa":["Morocco"],
      "North America & Caribbean":["United States","Dominican Republic","Costa Rica","Mexico"]
    };
    const bwCoords={
      "Belgium":[50.85,4.35],"Poland":[52.23,21.01],"Bulgaria":[42.70,23.32],"Germany":[52.52,13.40],
      "France":[48.85,2.35],"Finland":[60.17,24.94],"Netherlands":[52.37,4.90],"Czech Republic":[50.08,14.44],
      "Luxembourg":[49.61,6.13],"Romania":[44.43,26.10],"Norway":[59.91,10.75],"Portugal":[38.72,-9.14],
      "Switzerland":[46.95,7.45],"Spain":[40.42,-3.70],"Greece":[37.98,23.73],"Hungary":[47.50,19.04],
      "Italy":[41.90,12.50],"United Kingdom":[51.51,-0.13],"Austria":[48.21,16.37],
      "South Korea":[37.57,126.98],"Japan":[35.68,139.69],"Sri Lanka":[6.93,79.85],"Thailand":[13.76,100.50],
      "Turkey":[39.93,32.86],"Singapore":[1.35,103.82],"India":[28.61,77.21],"China":[39.90,116.41],
      "Morocco":[34.02,-6.83],
      "United States":[38.90,-77.04],"Dominican Republic":[18.49,-69.89],"Costa Rica":[9.93,-84.08],"Mexico":[19.43,-99.13]
    };
    const bwRegionColor={
      "Europe":"#aa7968",
      "Asia":"#7d918a",
      "North Africa":"#b59370",
      "North America & Caribbean":"#8499a0"
    };
    const bwFoodEmoji={
      "Belgium":"🧇","Poland":"🥟","Bulgaria":"🥗","Germany":"🌭","France":"🥐","Finland":"🫐",
      "Netherlands":"🧀","Czech Republic":"🍺","Luxembourg":"🍷","Romania":"🥩","Norway":"🐟",
      "Portugal":"🍮","Switzerland":"🍫","Spain":"🥘","Greece":"🥙","Hungary":"🌶️","Italy":"🍕",
      "United Kingdom":"🫖","Austria":"🥨","South Korea":"🍚","Japan":"🍣","Sri Lanka":"🍛",
      "Thailand":"🍜","Turkey":"🍢","Singapore":"🦀","India":"🫓","China":"🥡","Morocco":"🍲",
      "United States":"🍔","Dominican Republic":"🍌","Costa Rica":"☕","Mexico":"🌮"
    };
    const bwFoodName={
      "Belgium":"Waffles","Poland":"Pierogi","Bulgaria":"Shopska salad","Germany":"Bratwurst","France":"Croissant",
      "Finland":"Wild berries","Netherlands":"Cheese","Czech Republic":"Pilsner","Luxembourg":"Moselle wine",
      "Romania":"Sarmale","Norway":"Smoked salmon","Portugal":"Pastel de nata","Switzerland":"Fondue","Spain":"Paella",
      "Greece":"Souvlaki","Hungary":"Goulash","Italy":"Pizza","United Kingdom":"Afternoon tea","Austria":"Pretzel",
      "South Korea":"Bibimbap","Japan":"Sushi","Sri Lanka":"Curry","Thailand":"Tom yum","Turkey":"Kebab",
      "Singapore":"Chilli crab","India":"Naan","China":"Dim sum","Morocco":"Tagine","United States":"Burger",
      "Dominican Republic":"Mangu","Costa Rica":"Coffee","Mexico":"Tacos"
    };

    const bwMap=document.getElementById('bwMap');
    const bwMapTooltip=document.getElementById('bwMapTooltip');
    const bwMapLegend=document.getElementById('bwMapLegend');
    const bwFoodGrid=document.getElementById('bwFoodGrid');
    const bwMarkers=[];

    const bwAlphabeticalCountries=Object.entries(bwTravelData)
      .flatMap(([region,countries])=>countries.map(country=>({country,region})))
      .sort((a,b)=>a.country.localeCompare(b.country));

    bwAlphabeticalCountries.forEach(({country,region})=>{
      const item=document.createElement('div');
      item.className='bw-food-item';
      item.dataset.region=region;
      item.innerHTML=`<span>${bwFoodEmoji[country]}</span><span class="bw-food-copy"><strong>${country}</strong><small>${bwFoodName[country]}</small></span>`;
      bwFoodGrid?.appendChild(item);
    });

    Object.entries(bwTravelData).forEach(([region,countries])=>{
      const chip=document.createElement('button');
      chip.type='button';
      chip.className='bw-map-chip';
      chip.dataset.region=region;
      chip.innerHTML=`<i style="background:${bwRegionColor[region]}"></i>${region} <small>${countries.length}</small>`;
      chip.addEventListener('click',()=>{
        const active=chip.classList.contains('active');
        bwMapLegend.querySelectorAll('.bw-map-chip').forEach(c=>c.classList.remove('active'));
        if(!active){
          chip.classList.add('active');
          setBwRegion(region);
        }else{
          setBwRegion(null);
        }
      });
      bwMapLegend?.appendChild(chip);
    });

    function setBwRegion(region){
      bwMarkers.forEach(marker=>{
        marker.material.opacity=(!region||marker.userData.region===region)?1:.14;
      });
      bwFoodGrid?.querySelectorAll('.bw-food-item').forEach(item=>{
        item.style.opacity=(!region||item.dataset.region===region)?'1':'.18';
      });
    }

    let bwGlobeReady=false;
    function initBwGlobe(){
      if(bwGlobeReady||!bwMap||typeof THREE==='undefined') return;
      bwGlobeReady=true;

      const width=bwMap.clientWidth;
      const height=bwMap.clientHeight;
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(45,width/height,.1,100);
      camera.position.z=3;
      const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setSize(width,height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      bwMap.insertBefore(renderer.domElement,bwMapTooltip);

      scene.add(new THREE.AmbientLight(0xffffff,.95));
      const light=new THREE.DirectionalLight(0xffffff,.5);
      light.position.set(3,2,4);
      scene.add(light);

      const canvas=document.createElement('canvas');
      canvas.width=1024;
      canvas.height=512;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#2f5f8f';
      ctx.fillRect(0,0,1024,512);
      const landColors=['#5f7f52','#6d8a58','#7a8f62','#8a7d5a','#6b7d4e','#8f8468','#5a7350','#7d9160'];

      function blob(points,color){
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.moveTo(points[0][0]*1.024,points[0][1]*1.024);
        points.slice(1).forEach(point=>ctx.lineTo(point[0]*1.024,point[1]*1.024));
        ctx.closePath();
        ctx.fill();
      }
      blob([[60,90],[140,60],[220,90],[260,110],[250,160],[270,190],[230,220],[200,250],[170,230],[120,240],[100,200],[60,190],[55,150],[50,110]],landColors[0]);
      blob([[170,235],[195,225],[205,250],[210,280],[190,300],[160,340],[150,300],[140,260]],landColors[1]);
      blob([[195,305],[225,300],[235,340],[250,390],[220,420],[200,450],[180,410],[160,360]],landColors[2]);
      blob([[470,95],[520,80],[555,100],[560,120],[540,135],[545,155],[520,160],[495,165],[480,145],[465,120]],landColors[3]);
      blob([[475,165],[535,160],[560,190],[580,230],[565,270],[560,320],[535,340],[510,360],[495,320],[470,270],[470,220],[465,190]],landColors[4]);
      blob([[560,95],[650,70],[740,90],[820,100],[850,140],[870,170],[830,190],[800,220],[760,200],[700,220],[650,200],[590,210],[565,170],[550,130]],landColors[5]);
      blob([[760,205],[810,195],[830,225],[840,250],[810,260],[780,270],[765,245]],landColors[6]);
      blob([[800,355],[840,345],[865,365],[875,390],[850,400],[820,410],[805,390]],landColors[7]);

      const globe=new THREE.Mesh(
        new THREE.SphereGeometry(1,64,64),
        new THREE.MeshPhongMaterial({map:new THREE.CanvasTexture(canvas),shininess:8,specular:0x9ec8e8})
      );
      const atmosphere=new THREE.Mesh(
        new THREE.SphereGeometry(1.018,64,64),
        new THREE.MeshPhongMaterial({color:0xb8d8f0,transparent:true,opacity:.1,shininess:2,side:THREE.FrontSide})
      );
      const group=new THREE.Group();
      group.add(globe);
      group.add(atmosphere);
      group.rotation.y=.4;
      scene.add(group);

      Object.entries(bwTravelData).forEach(([region,countries])=>{
        countries.forEach(country=>{
          const [lat,lon]=bwCoords[country];
          const phi=(90-lat)*Math.PI/180;
          const theta=(lon+180)*Math.PI/180;
          const radius=1.02;
          const marker=new THREE.Mesh(
            new THREE.SphereGeometry(.02,12,12),
            new THREE.MeshBasicMaterial({color:bwRegionColor[region],transparent:true})
          );
          marker.position.set(
            -radius*Math.sin(phi)*Math.cos(theta),
            radius*Math.cos(phi),
            radius*Math.sin(phi)*Math.sin(theta)
          );
          marker.userData={country,region};
          group.add(marker);
          bwMarkers.push(marker);
        });
      });

      let dragging=false;
      let previousX=0;
      let previousY=0;
      let velocityX=0;
      const raycaster=new THREE.Raycaster();
      const mouse=new THREE.Vector2(10,10);

      renderer.domElement.addEventListener('pointerdown',event=>{
        dragging=true;
        previousX=event.clientX;
        previousY=event.clientY;
        renderer.domElement.setPointerCapture(event.pointerId);
        bwMap.classList.add('dragging');
      });
      renderer.domElement.addEventListener('pointerup',()=>{
        dragging=false;
        bwMap.classList.remove('dragging');
      });
      renderer.domElement.addEventListener('pointermove',event=>{
        if(dragging){
          const dx=event.clientX-previousX;
          const dy=event.clientY-previousY;
          velocityX=dx*.005;
          group.rotation.y+=velocityX;
          group.rotation.x=Math.max(-1.1,Math.min(1.1,group.rotation.x+dy*.005));
          previousX=event.clientX;
          previousY=event.clientY;
        }
        const rect=renderer.domElement.getBoundingClientRect();
        mouse.x=((event.clientX-rect.left)/rect.width)*2-1;
        mouse.y=-((event.clientY-rect.top)/rect.height)*2+1;
      });
      renderer.domElement.addEventListener('mouseleave',()=>{
        dragging=false;
        bwMap.classList.remove('dragging');
        bwMapTooltip.style.opacity='0';
      });
      bwMap.addEventListener('wheel',event=>{
        event.preventDefault();
        camera.position.z=Math.max(1.5,Math.min(4.5,camera.position.z+event.deltaY*.0015));
      },{passive:false});

      function render(){
        requestAnimationFrame(render);
        if(!dragging){
          group.rotation.y+=Math.abs(velocityX)>.0002?velocityX:.0008;
          velocityX*=.94;
        }

        raycaster.setFromCamera(mouse,camera);
        const hits=raycaster.intersectObjects(bwMarkers);
        if(hits.length&&hits[0].object.material.opacity>.5){
          const marker=hits[0].object;
          const projected=marker.position.clone().applyMatrix4(group.matrixWorld).project(camera);
          bwMapTooltip.innerHTML=`<span>${bwFoodEmoji[marker.userData.country]}</span><span><strong>${marker.userData.country}</strong><small>${bwFoodName[marker.userData.country]}</small></span>`;
          bwMapTooltip.style.left=`${(projected.x*.5+.5)*100}%`;
          bwMapTooltip.style.top=`${(-projected.y*.5+.5)*100}%`;
          bwMapTooltip.style.opacity='1';
        }else{
          bwMapTooltip.style.opacity='0';
        }
        renderer.render(scene,camera);
      }
      render();

      const resizeObserver=new ResizeObserver(()=>{
        const newWidth=bwMap.clientWidth;
        const newHeight=bwMap.clientHeight;
        camera.aspect=newWidth/newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth,newHeight);
      });
      resizeObserver.observe(bwMap);
    }


    /* V27 hero interaction and direct Personal Story routing */

    document.querySelectorAll('[data-open-story]').forEach(link=>{
      link.addEventListener('click',event=>{
        event.preventDefault();
        const storyTab=document.querySelector('.bw-side-item[data-bw-target="story"]');
        storyTab?.click();
        document.getElementById('beyond')?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });


    const aboutParagraphs=[...document.querySelectorAll('.about-scroll-copy p')];
    const aboutParagraphObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          aboutParagraphObserver.unobserve(entry.target);
        }
      });
    },{
      threshold:.28,
      rootMargin:'0px 0px -12% 0px'
    });
    aboutParagraphs.forEach(paragraph=>aboutParagraphObserver.observe(paragraph));


    const siteLoader=document.getElementById('siteLoader');

    window.addEventListener('load',()=>{
      window.setTimeout(()=>{
        siteLoader?.classList.add('is-hidden');
        document.body.classList.remove('is-loading');
      },1150);
    });

    window.setTimeout(()=>{
      siteLoader?.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    },2400);


    /* V31 draggable return-home button */
    const floatingHome=document.getElementById('floatingHome');
    if(floatingHome){
      let draggingHome=false, movedHome=false, offsetX=0, offsetY=0;
      floatingHome.addEventListener('pointerdown',event=>{
        draggingHome=true;movedHome=false;
        const rect=floatingHome.getBoundingClientRect();
        offsetX=event.clientX-rect.left;offsetY=event.clientY-rect.top;
        floatingHome.setPointerCapture(event.pointerId);
        floatingHome.classList.add('dragging');
      });
      floatingHome.addEventListener('pointermove',event=>{
        if(!draggingHome)return;
        movedHome=true;
        const x=Math.max(6,Math.min(innerWidth-floatingHome.offsetWidth-6,event.clientX-offsetX));
        const y=Math.max(6,Math.min(innerHeight-floatingHome.offsetHeight-6,event.clientY-offsetY));
        floatingHome.style.left=`${x}px`;floatingHome.style.top=`${y}px`;
      });
      floatingHome.addEventListener('pointerup',()=>{draggingHome=false;floatingHome.classList.remove('dragging')});
      floatingHome.addEventListener('click',()=>{if(!movedHome)window.sectionNavPrev?.()});
    }

    const flowerButton=document.getElementById('flowerButton');
    const flowerMessage=document.getElementById('flowerMessage');
    flowerButton?.addEventListener('click',()=>{
      const count=Number(localStorage.getItem('marcelineFlowers')||0)+1;
      localStorage.setItem('marcelineFlowers',String(count));
      flowerButton.classList.remove('bloom');void flowerButton.offsetWidth;flowerButton.classList.add('bloom');
      flowerMessage.textContent='Thank you for stopping by 💐';
    });

    const visitorFeedback=document.getElementById('visitorFeedback');
    visitorFeedback?.addEventListener('submit',event=>{
      event.preventDefault();
      document.getElementById('feedbackStatus').textContent='Thank you. Your feedback has been saved in this demo.';
      visitorFeedback.reset();
    });


    /* V38 group-controlled Morandi skill orbit */
    const skillsOrbit=document.getElementById('skillsOrbit');
    const skillsCore=document.getElementById('skillsCore');
    if(skillsOrbit && skillsCore){
      const bubbles=[...skillsOrbit.querySelectorAll('.skill-bubble')];
      let orbitOpen=false;
      let rotation=0;
      let angularVelocity=0.000075;
      let lastTime=performance.now();
      let rafId=0;
      let draggingRing=false;
      let openingUntil=0;
      let openingSnapshotTime=0;
      let openingTimer=null;
      let dragPointerId=null;
      let dragStartAngle=0;
      let dragStartRotation=0;
      let previousDragAngle=0;
      let previousDragTime=0;
      const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const bubbleState=bubbles.map((bubble,index)=>{
        const style=getComputedStyle(bubble);
        const x=parseFloat(style.getPropertyValue('--x'))||0;
        const y=parseFloat(style.getPropertyValue('--y'))||0;
        return {
          bubble,
          baseAngle:Math.atan2(y,x),
          radius:Math.hypot(x,y),
          phase:index*.42
        };
      });

      function normalizeDelta(delta){
        while(delta>Math.PI) delta-=Math.PI*2;
        while(delta<-Math.PI) delta+=Math.PI*2;
        return delta;
      }

      function pointerAngle(event){
        const rect=skillsOrbit.getBoundingClientRect();
        const cx=rect.left+rect.width/2;
        const cy=rect.top+rect.height/2;
        return Math.atan2(event.clientY-cy,event.clientX-cx);
      }

      function placeBubbles(time){
        bubbleState.forEach(state=>{
          const angle=state.baseAngle+rotation;
          const breathe=prefersReduced?0:Math.sin(time*.0012+state.phase)*2.2;
          const radius=state.radius+breathe;
          const x=Math.cos(angle)*radius;
          const y=Math.sin(angle)*radius;
          state.bubble.style.setProperty('--orbit-x',`${x.toFixed(2)}px`);
          state.bubble.style.setProperty('--orbit-y',`${y.toFixed(2)}px`);
        });
      }

      function animateOrbit(now){
        const delta=Math.min(32,now-lastTime);
        lastTime=now;
        const isOpening=orbitOpen && now<openingUntil;
        if(orbitOpen && !prefersReduced && !draggingRing && !isOpening){
          rotation += delta*angularVelocity;
          angularVelocity += (0.000075-angularVelocity)*0.012;
        }
        if(!isOpening) placeBubbles(now);
        rafId=requestAnimationFrame(animateOrbit);
      }
      placeBubbles(performance.now());
      rafId=requestAnimationFrame(animateOrbit);

      skillsCore.addEventListener('click',()=>{
        orbitOpen=skillsOrbit.classList.toggle('is-open');
        skillsCore.setAttribute('aria-expanded',String(orbitOpen));
        window.clearTimeout(openingTimer);
        skillsOrbit.classList.remove('orbit-running');
        if(orbitOpen){
          openingSnapshotTime=performance.now();
          openingUntil=openingSnapshotTime+3000;
          placeBubbles(openingSnapshotTime);
          openingTimer=window.setTimeout(()=>{
            openingUntil=0;
            skillsOrbit.classList.add('orbit-running');
            placeBubbles(performance.now());
          },3000);
        }else{
          openingUntil=0;
        }
      });

      bubbles.forEach(bubble=>{
        bubble.addEventListener('pointerdown',event=>{
          if(!orbitOpen) return;
          event.preventDefault();
          draggingRing=true;
          dragPointerId=event.pointerId;
          dragStartAngle=pointerAngle(event);
          dragStartRotation=rotation;
          previousDragAngle=dragStartAngle;
          previousDragTime=performance.now();
          bubble.setPointerCapture(dragPointerId);
          skillsOrbit.classList.add('is-dragging-ring');
        });

        bubble.addEventListener('pointermove',event=>{
          if(!draggingRing || event.pointerId!==dragPointerId) return;
          const now=performance.now();
          const current=pointerAngle(event);
          const totalDelta=normalizeDelta(current-dragStartAngle);
          rotation=dragStartRotation+totalDelta;

          const frameDelta=normalizeDelta(current-previousDragAngle);
          const elapsed=Math.max(8,now-previousDragTime);
          angularVelocity=Math.max(-0.0012,Math.min(0.0012,frameDelta/elapsed));
          previousDragAngle=current;
          previousDragTime=now;
          placeBubbles(now);
        });

        const finish=event=>{
          if(!draggingRing || event.pointerId!==dragPointerId) return;
          draggingRing=false;
          skillsOrbit.classList.remove('is-dragging-ring');
          if(bubble.hasPointerCapture(dragPointerId)) bubble.releasePointerCapture(dragPointerId);
          dragPointerId=null;
        };
        bubble.addEventListener('pointerup',finish);
        bubble.addEventListener('pointercancel',finish);
      });
    }

    document.querySelectorAll('.research-toggle').forEach(toggle=>{
      toggle.addEventListener('click',()=>{
        const open=toggle.getAttribute('aria-expanded')==='true';
        const detailId=toggle.getAttribute('aria-controls');
        const detail=detailId?document.getElementById(detailId):null;
        toggle.setAttribute('aria-expanded',String(!open));
        detail?.classList.toggle('open',!open);
      });
    });

    const bwTravelCollapse=document.getElementById('bwTravelCollapse');
    const bwTravelExpandable=document.getElementById('bwTravelExpandable');
    bwTravelCollapse?.addEventListener('click',()=>{
      const collapsed=bwTravelExpandable?.classList.toggle('collapsed');
      bwTravelCollapse.innerHTML=collapsed?'Open Travel Map <span>↓</span>':'<span>↑</span> Collapse map';
      if(!collapsed) setTimeout(()=>initBwGlobe(),80);
    });


    /* V40 progressive text reveal across the page after the hero */
    const textRevealTargets=[...document.querySelectorAll(
      'main h2, main h3, main p, main .section-label, main .mini-fact span, main .mini-fact strong, main .education-school, main .education-degree, main .education-year, main .timeline-year, main .timeline-role, main .timeline-place, main .research-title, main .research-type, footer h2, footer p, footer .section-label, footer .field-label, footer .aside-label, footer a, footer span'
    )].filter(el=>!el.closest('.skills-orbit') && !el.classList.contains('scroll-text-reveal'));

    textRevealTargets.forEach((el,index)=>{
      el.classList.add('scroll-text-reveal');
      el.style.setProperty('--text-delay',`${Math.min((index%4)*60,180)}ms`);
    });

    const textRevealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          textRevealObserver.unobserve(entry.target);
        }
      });
    },{threshold:.16,rootMargin:'0px 0px -9% 0px'});
    textRevealTargets.forEach(el=>textRevealObserver.observe(el));

    /* Open the Skills orbit naturally when it becomes the reading focus */
    if(skillsOrbit && skillsCore){
      let skillsAutoOpened=false;
      const skillsAutoObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting && !skillsAutoOpened){
            skillsAutoOpened=true;
            window.setTimeout(()=>{
              if(!skillsOrbit.classList.contains('is-open')) skillsCore.click();
            },260);
            skillsAutoObserver.unobserve(entry.target);
          }
        });
      },{threshold:.42,rootMargin:'0px 0px -8% 0px'});
      skillsAutoObserver.observe(skillsOrbit);
    }

(function(){
  function initV41Reveal(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const selector=[
      'main .section-label','main h2','main h3','main p',
      'main .mini-fact > span','main .mini-fact > strong','main .mini-fact > em',
      'main .education-mini-school','main .education-mini-degree','main .education-mini-year',
      'main .timeline-year','main .timeline-role','main .timeline-place','main .timeline-description','main .timeline-tags',
      'main .lab-title-link','main .lab-tile > p',
      'main .research-title','main .research-type','main .research-detail-inner > *',
      'main .bw-kicker','main .bw-story-copy > p','main .bw-volunteer-list > *','main .bw-map-intro','main .bw-food-label',
      'footer .section-label','footer h2','footer .field-label','footer .aside-label','footer .contact-aside a','footer .contact-aside span','footer .footer span'
    ].join(',');
    const targets=[...document.querySelectorAll(selector)].filter(el=>
      !el.closest('.hero') && !el.closest('.skills-orbit') && !el.classList.contains('v41-text-reveal')
    );
    targets.forEach((el,i)=>{
      el.classList.add('v41-text-reveal');
      el.style.setProperty('--v41-delay',`${(i%3)*75}ms`);
    });
    document.body.classList.add('v41-reveal-ready');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('v41-visible');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:0.05,rootMargin:'0px 0px -4% 0px'});
    targets.forEach(el=>observer.observe(el));
    requestAnimationFrame(()=>{
      targets.forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.top<innerHeight*.92 && r.bottom>0) el.classList.add('v41-visible');
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initV41Reveal,{once:true});
  else initV41Reveal();
})();

(function(){
  const albums=document.querySelector('.project-albums');
  if(!albums) return;
  const cards=[...albums.querySelectorAll('.album-card')];
  cards.forEach(card=>{
    const toggle=card.querySelector('.album-toggle');
    toggle?.addEventListener('click',()=>{
      const willOpen=!card.classList.contains('open');
      cards.forEach(other=>{
        other.classList.remove('open');
        other.querySelector('.album-toggle')?.setAttribute('aria-expanded','false');
      });
      if(willOpen){
        card.classList.add('open');
        toggle.setAttribute('aria-expanded','true');
        albums.classList.add('has-active');
        window.setTimeout(()=>card.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}),120);
      }else{
        albums.classList.remove('has-active');
      }
    });
  });
})();

(function(){
  document.querySelectorAll('.album-carousel').forEach(carousel=>{
    const track=carousel.querySelector('.album-grid');
    const prev=carousel.querySelector('.album-prev');
    const next=carousel.querySelector('.album-next');
    if(!track||!prev||!next) return;
    const step=()=>Math.max(170,Math.round(track.clientWidth*.72));
    const update=()=>{
      prev.disabled=track.scrollLeft<=2;
      next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;
    };
    prev.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:'smooth'}));
    next.addEventListener('click',()=>track.scrollBy({left:step(),behavior:'smooth'}));
    track.addEventListener('scroll',update,{passive:true});
    new ResizeObserver(update).observe(track);
    requestAnimationFrame(update);
  });
})();

(function(){
  // Clicking a thumbnail replaces the large album cover.
  document.querySelectorAll('.album-card').forEach(card=>{
    const cover=card.querySelector('.album-stack .cover');
    const thumbs=[...card.querySelectorAll('.album-grid img')];
    if(!cover||!thumbs.length) return;
    const markActive=src=>thumbs.forEach(img=>img.classList.toggle('is-active',img.src===src));
    markActive(cover.src);
    thumbs.forEach(img=>img.addEventListener('click',event=>{
      event.stopPropagation();
      if(cover.src===img.src) return;
      cover.classList.add('is-switching');
      window.setTimeout(()=>{
        cover.src=img.src;
        cover.alt=img.alt||cover.alt;
        markActive(img.src);
        cover.classList.remove('is-switching');
      },160);
    }));
  });

  const lightbox=document.getElementById('tirpLightbox');
  const lightboxImage=lightbox?.querySelector('img');
  const close=()=>lightbox?.classList.remove('open');
  document.querySelectorAll('.tirp-photo-button img').forEach(img=>{
    img.closest('button')?.addEventListener('click',()=>{
      if(!lightbox||!lightboxImage) return;
      lightboxImage.src=img.src;
      lightboxImage.alt=img.alt;
      lightbox.classList.add('open');
    });
  });
  lightbox?.querySelector('.tirp-lightbox-close')?.addEventListener('click',close);
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox) close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape') close()});
})();

(function(){
  const gallery=document.querySelector('.community-waterfall');
  const more=document.getElementById('communityMoreBtn');
  const collapse=document.getElementById('communityCollapseBtn');
  if(!gallery||!more||!collapse) return;
  more.addEventListener('click',()=>{
    gallery.classList.add('show-all');
    more.hidden=true;
    collapse.hidden=false;
  });
  collapse.addEventListener('click',()=>{
    gallery.classList.remove('show-all');
    collapse.hidden=true;
    more.hidden=false;
    gallery.scrollIntoView({behavior:'smooth',block:'start'});
  });
})();

(function(){
  const albums=document.querySelector('.project-albums');
  const rowPrev=document.querySelector('.project-row-prev');
  const rowNext=document.querySelector('.project-row-next');
  if(albums && rowPrev && rowNext){
    const step=()=>Math.max(220,Math.round(albums.clientWidth*.68));
    const update=()=>{
      rowPrev.disabled=albums.scrollLeft<=4;
      rowNext.disabled=albums.scrollLeft+albums.clientWidth>=albums.scrollWidth-4;
    };
    rowPrev.addEventListener('click',()=>albums.scrollBy({left:-step(),behavior:'smooth'}));
    rowNext.addEventListener('click',()=>albums.scrollBy({left:step(),behavior:'smooth'}));
    albums.addEventListener('scroll',update,{passive:true});
    new ResizeObserver(update).observe(albums);
    requestAnimationFrame(update);
    let isDown=false,startX=0,startLeft=0;
    albums.addEventListener('pointerdown',e=>{isDown=true;startX=e.clientX;startLeft=albums.scrollLeft;albums.setPointerCapture(e.pointerId)});
    albums.addEventListener('pointermove',e=>{if(!isDown) return; albums.scrollLeft=startLeft-(e.clientX-startX);});
    ['pointerup','pointercancel','pointerleave'].forEach(evt=>albums.addEventListener(evt,()=>{isDown=false;}));
  }

  const lightbox=document.getElementById('galleryLightbox');
  const lightImg=lightbox?.querySelector('img');
  const lightCaption=lightbox?.querySelector('.gallery-lightbox-caption');
  const btnPrev=lightbox?.querySelector('.gallery-lightbox-prev');
  const btnNext=lightbox?.querySelector('.gallery-lightbox-next');
  const btnClose=lightbox?.querySelector('.gallery-lightbox-close');
  const clickable=[
    ...document.querySelectorAll('.community-waterfall img'),
    ...document.querySelectorAll('.research-inline-photo img'),
    ...document.querySelectorAll('.project-albums .album-grid img')
  ];
  let currentGroup=[]; let currentIndex=0;
  const groups = new Map();
  function groupFor(img){
    const container=img.closest('.community-waterfall, .research-inline-gallery, .album-grid') || img.parentElement;
    if(!groups.has(container)) groups.set(container,[...container.querySelectorAll('img')]);
    return groups.get(container) || [img];
  }
  function show(index){
    if(!currentGroup.length || !lightbox || !lightImg) return;
    currentIndex=(index+currentGroup.length)%currentGroup.length;
    const target=currentGroup[currentIndex];
    lightImg.src=target.src; lightImg.alt=target.alt || '';
    if(lightCaption) lightCaption.textContent=target.alt || '';
    lightbox.classList.add('open');
  }
  clickable.forEach(img=>img.addEventListener('click',e=>{
    e.stopPropagation();
    currentGroup=groupFor(img);
    currentIndex=currentGroup.indexOf(img);
    show(currentIndex);
  }));
  btnPrev?.addEventListener('click',()=>show(currentIndex-1));
  btnNext?.addEventListener('click',()=>show(currentIndex+1));
  const close=()=>lightbox?.classList.remove('open');
  btnClose?.addEventListener('click',close);
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox) close();});
  document.addEventListener('keydown',e=>{
    if(!lightbox?.classList.contains('open')) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowLeft') show(currentIndex-1);
    if(e.key==='ArrowRight') show(currentIndex+1);
  });
  let touchStartX=null;
  lightbox?.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
  lightbox?.addEventListener('touchend',e=>{
    if(touchStartX==null) return;
    const dx=e.changedTouches[0].clientX-touchStartX;
    if(Math.abs(dx)>40){ if(dx>0) show(currentIndex-1); else show(currentIndex+1); }
    touchStartX=null;
  },{passive:true});

  const gallery=document.querySelector('.community-waterfall');
  const more=document.getElementById('communityMoreBtn');
  const collapse=document.getElementById('communityCollapseBtn');
  if(gallery && more && collapse){
    more.addEventListener('click',()=>{
      gallery.classList.add('show-all');
      more.hidden=true;
      collapse.hidden=false;
      requestAnimationFrame(()=>gallery.scrollIntoView({behavior:'smooth',block:'nearest'}));
    });
    collapse.addEventListener('click',()=>{
      gallery.classList.remove('show-all');
      collapse.hidden=true;
      more.hidden=false;
      gallery.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }
})();

(function(){
  const toast=document.getElementById('siteToast');
  let toastTimer;
  function showToast(message){
    if(!toast) return;
    toast.textContent=message;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('show'),2600);
  }

  // Flower sent animation + message.
  const flowerButton=document.getElementById('flowerButton');
  const flowerWidget=flowerButton?.closest('.flower-widget');
  flowerButton?.addEventListener('click',()=>{
    flowerWidget?.classList.remove('flower-sent');
    void flowerWidget?.offsetWidth;
    flowerWidget?.classList.add('flower-sent');
    showToast('Thank you for your Flower, Have a great day!');
    setTimeout(()=>flowerWidget?.classList.remove('flower-sent'),1400);
  });

  // Visitor note confirmation.
  const visitorFeedback=document.getElementById('visitorFeedback');
  visitorFeedback?.addEventListener('submit',()=>{
    showToast('Thank you!');
  });

  // Larger magnetic interaction zone for Connect.
  const zone=document.querySelector('.send-zone');
  const orb=document.getElementById('sendOrb');
  if(zone && orb){
    zone.addEventListener('pointermove',event=>{
      const zr=zone.getBoundingClientRect();
      const or=orb.getBoundingClientRect();
      const cx=zr.left+zr.width/2;
      const cy=zr.top+zr.height/2;
      const dx=(event.clientX-cx)/(zr.width/2);
      const dy=(event.clientY-cy)/(zr.height/2);
      const maxX=Math.min(105,(zr.width-or.width)/2-12);
      const maxY=Math.min(90,(zr.height-or.height)/2-12);
      orb.style.transform=`translate(${dx*maxX}px,${dy*maxY}px)`;
    });
    zone.addEventListener('pointerleave',()=>{
      orb.style.transform='translate(0,0)';
    });

    // Position sparks using JS for broad browser support.
    zone.querySelectorAll('.connect-spark').forEach((spark,index)=>{
      const angle=index*Math.PI*2/12;
      spark.style.setProperty('--sx',`${Math.cos(angle)*132}px`);
      spark.style.setProperty('--sy',`${Math.sin(angle)*132}px`);
    });
    // Connect completion animation is handled by the nearby-fireworks effect.
  }
})();

(function(){
  const gallery=document.querySelector('.community-waterfall');
  const collapse=document.getElementById('communityCollapseBtn');
  if(gallery&&collapse){
    collapse.hidden=false;
    collapse.textContent='Collapse photos ↑';
    collapse.addEventListener('click',()=>{
      const collapsed=gallery.classList.toggle('v50-gallery-collapsed');
      collapse.textContent=collapsed?'Show photos ↓':'Collapse photos ↑';
      if(!collapsed) requestAnimationFrame(()=>gallery.scrollIntoView({behavior:'smooth',block:'nearest'}));
    });
  }

  const toast=document.getElementById('siteToast');
  let toastTimer;
  function showToast(message,duration=3600){
    if(!toast) return;
    toast.textContent=message;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('show'),duration);
  }
  const feedback=document.getElementById('visitorFeedback');
  feedback?.addEventListener('submit',e=>{
    e.preventDefault();
    showToast('Thank you for your note. Your feedback is very valuable to me. Have a great day.',4800);
  },true);

  const gift=document.getElementById('hiddenGift');
  const giftButton=document.getElementById('giftBoxButton');
  const stage=document.getElementById('giftBouquetStage');
  const bouquetSvgs=[
    `<svg class="gift-bouquet" viewBox="0 0 160 160" aria-label="Sunflower bouquet"><path d="M78 74 C78 101 66 124 56 146 M83 74 C87 103 100 124 111 145 M80 78 C82 103 82 126 82 148" fill="none" stroke="#7c9664" stroke-width="4" stroke-linecap="round"/><path d="M48 91 Q79 114 119 92 L107 145 Q80 155 57 144 Z" fill="#d9b48e" stroke="#8f694e" stroke-width="2"/><path d="M67 105 Q48 98 42 112 Q58 115 71 109 M94 105 Q116 99 122 114 Q104 116 91 109" fill="#9eb487" stroke="#6f8a5e" stroke-width="2"/><g fill="#e7bd3b" stroke="#c68f2c" stroke-width="2"><circle cx="52" cy="61" r="16"/><circle cx="81" cy="43" r="18"/><circle cx="111" cy="65" r="16"/></g><g fill="#6d4a2f"><circle cx="52" cy="61" r="6"/><circle cx="81" cy="43" r="7"/><circle cx="111" cy="65" r="6"/></g></svg>`,
    `<svg class="gift-bouquet" viewBox="0 0 160 160" aria-label="Pink rose bouquet"><path d="M76 72 C77 102 67 125 57 146 M83 72 C87 102 100 125 110 145 M80 76 C82 103 82 127 82 148" fill="none" stroke="#768f68" stroke-width="4" stroke-linecap="round"/><path d="M48 91 Q79 114 119 92 L107 145 Q80 155 57 144 Z" fill="#d7b6a6" stroke="#8e6d5e" stroke-width="2"/><path d="M67 105 Q48 98 42 112 Q58 115 71 109 M94 105 Q116 99 122 114 Q104 116 91 109" fill="#9aaa84" stroke="#6f835f" stroke-width="2"/><g stroke="#a96778" stroke-width="2"><path d="M39 62 C36 47 50 39 61 48 C68 36 85 41 84 55 C95 46 110 54 106 69 C96 82 77 84 60 79 C49 77 42 72 39 62Z" fill="#e8a9b8"/><path d="M69 40 C65 26 80 18 92 27 C99 17 114 25 111 39 C101 51 82 54 69 48Z" fill="#f0bbc7"/><path d="M91 67 C91 52 108 47 119 58 C129 51 140 64 133 77 C121 86 105 85 94 78Z" fill="#dc91a5"/></g></svg>`,
    `<svg class="gift-bouquet" viewBox="0 0 160 160" aria-label="Lily bouquet"><path d="M76 70 C77 101 67 124 57 146 M83 70 C87 101 100 124 110 145 M80 74 C82 102 82 126 82 148" fill="none" stroke="#78966f" stroke-width="4" stroke-linecap="round"/><path d="M48 91 Q79 114 119 92 L107 145 Q80 155 57 144 Z" fill="#d6c0a5" stroke="#8d7259" stroke-width="2"/><path d="M67 105 Q48 98 42 112 Q58 115 71 109 M94 105 Q116 99 122 114 Q104 116 91 109" fill="#a3b591" stroke="#718568" stroke-width="2"/><g fill="#f7f1df" stroke="#c9b998" stroke-width="2"><path d="M48 69 C35 58 39 44 53 47 C58 32 73 35 72 50 C87 44 96 58 85 70 C73 80 59 79 48 69Z"/><path d="M77 45 C66 32 72 18 86 23 C94 10 108 18 103 31 C118 30 124 46 111 55 C98 63 85 58 77 45Z"/><path d="M99 71 C92 56 104 44 117 51 C127 40 140 52 134 65 C146 71 141 86 127 87 C114 88 104 82 99 71Z"/></g><g fill="#d9a54a"><circle cx="62" cy="61" r="3"/><circle cx="94" cy="42" r="3"/><circle cx="119" cy="70" r="3"/></g></svg>`
  ];
  function makeGiftSparks(){
    gift.querySelectorAll('.gift-spark').forEach(n=>n.remove());
    const colors=['#e7bd3b','#e9a7b8','#f1e6c8','#91b08b','#c5a4d8'];
    for(let i=0;i<18;i++){
      const s=document.createElement('span');
      s.className='gift-spark';
      const a=Math.PI*2*i/18;
      const r=70+(i%4)*12;
      s.style.setProperty('--x',`${Math.cos(a)*r}px`);
      s.style.setProperty('--y',`${Math.sin(a)*r}px`);
      s.style.setProperty('--d',`${(i%6)*.04}s`);
      s.style.setProperty('--c',colors[i%colors.length]);
      gift.appendChild(s);
    }
  }
  giftButton?.addEventListener('click',()=>{
    gift.classList.remove('open');
    void gift.offsetWidth;
    stage.innerHTML=bouquetSvgs[Math.floor(Math.random()*bouquetSvgs.length)];
    makeGiftSparks();
    gift.classList.add('open');
  });

  const contact=document.getElementById('contact');
  const layer=document.getElementById('contactCelebrationLayer');
  const form=document.getElementById('contactForm');
  function buildFullCelebration(){
    if(!layer || !contact) return;
    layer.innerHTML='';
    const orb=document.getElementById('sendOrb');
    if(!orb) return;
    const contactRect=contact.getBoundingClientRect();
    const orbRect=orb.getBoundingClientRect();
    const centerX=orbRect.left-contactRect.left+orbRect.width/2;
    const centerY=orbRect.top-contactRect.top+orbRect.height/2;
    const fireworks=[
      {x:centerX-105,y:centerY-72,delay:'0.03s',c:'#8fb4c6',c2:'#d7a7a1'},
      {x:centerX+118,y:centerY-88,delay:'0.20s',c:'#e7c46a',c2:'#b9a7cf'},
      {x:centerX+8,y:centerY-145,delay:'0.38s',c:'#9eb8ad',c2:'#d99a74'}
    ];
    fireworks.forEach(item=>{
      const f=document.createElement('span');
      f.className='full-firework';
      f.style.setProperty('--x',`${item.x}px`);
      f.style.setProperty('--y',`${item.y}px`);
      f.style.setProperty('--delay',item.delay);
      f.style.setProperty('--c',item.c);
      f.style.setProperty('--c2',item.c2);
      layer.appendChild(f);
    });
  }
  form?.addEventListener('submit',()=>{
    buildFullCelebration();
    contact.classList.remove('celebrate-full');
    void contact.offsetWidth;
    contact.classList.add('celebrate-full');
    setTimeout(()=>contact.classList.remove('celebrate-full'),2200);
  },true);
})();

(function(){
  const gift=document.getElementById('hiddenGift');
  const btn=document.getElementById('giftBoxButton');
  const stage=document.getElementById('giftBouquetStage');
  const reveal=document.getElementById('giftReveal');
  if(gift&&btn&&stage&&reveal){
    let open=false;
    let last=-1;
    const bouquets=[
      `<svg class="gift-bouquet" viewBox="0 0 220 220" aria-label="Sunflower gift bouquet">
        <defs>
          <linearGradient id="swrap1" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f7e7c9"/><stop offset=".55" stop-color="#e8cda7"/><stop offset="1" stop-color="#c89e75"/></linearGradient>
          <linearGradient id="sribbon1" x1="0" x2="1"><stop offset="0" stop-color="#c4785f"/><stop offset="1" stop-color="#e2a68c"/></linearGradient>
          <radialGradient id="spetal" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#ffe67a"/><stop offset=".65" stop-color="#e8b931"/><stop offset="1" stop-color="#c9901c"/></radialGradient>
        </defs>
        <g stroke-linecap="round"><path d="M106 79 C105 122 90 154 78 186 M112 74 C116 120 132 153 145 184 M109 80 C110 127 111 157 111 190" fill="none" stroke="#718c61" stroke-width="6"/></g>
        <g fill="#8fa67d" stroke="#67805b" stroke-width="2"><path d="M89 126 C63 112 52 125 52 138 C68 139 83 136 96 130Z"/><path d="M130 126 C158 113 171 128 170 142 C151 143 136 137 123 131Z"/><path d="M106 111 C90 94 83 101 84 113 C94 121 101 123 108 123Z"/></g>
        <g><g transform="translate(60 72)"><circle r="28" fill="url(#spetal)"/><circle r="11" fill="#68472f"/><circle r="5" fill="#9f6a33"/></g><g transform="translate(111 48)"><circle r="32" fill="url(#spetal)"/><circle r="12" fill="#68472f"/><circle r="6" fill="#9f6a33"/></g><g transform="translate(160 76)"><circle r="27" fill="url(#spetal)"/><circle r="10" fill="#68472f"/><circle r="5" fill="#9f6a33"/></g></g>
        <path d="M58 118 Q109 150 166 118 L150 199 Q110 214 72 198 Z" fill="url(#swrap1)" stroke="#9a7558" stroke-width="2.5"/>
        <path class="gift-wrap-shimmer" d="M67 127 Q110 149 156 126 L148 181 Q111 194 78 181 Z" fill="#fff" opacity=".32"/>
        <path d="M69 152 C94 141 128 141 153 152" fill="none" stroke="url(#sribbon1)" stroke-width="14"/>
        <path d="M111 149 C88 137 82 163 98 170 C107 170 111 160 111 149Z M111 149 C134 137 140 163 124 170 C115 170 111 160 111 149Z" fill="#d58f76" stroke="#a75e4b" stroke-width="2"/>
      </svg>`,
      `<svg class="gift-bouquet" viewBox="0 0 220 220" aria-label="Pink rose gift bouquet">
        <defs><linearGradient id="rwrap" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f4ddd9"/><stop offset=".55" stop-color="#e7c4c7"/><stop offset="1" stop-color="#c99da2"/></linearGradient><linearGradient id="rribbon" x1="0" x2="1"><stop offset="0" stop-color="#9b6877"/><stop offset="1" stop-color="#d59aaa"/></linearGradient></defs>
        <path d="M106 79 C105 122 90 154 78 186 M112 74 C116 120 132 153 145 184 M109 80 C110 127 111 157 111 190" fill="none" stroke="#6d8864" stroke-width="6" stroke-linecap="round"/>
        <g fill="#8ca17f" stroke="#66785c" stroke-width="2"><path d="M91 123 C64 111 53 125 53 138 C70 139 84 135 98 129Z"/><path d="M129 126 C157 113 171 128 170 142 C151 143 137 137 123 131Z"/></g>
        <g stroke="#9c5f73" stroke-width="2"><path d="M44 78 C38 55 63 44 76 60 C87 42 113 51 109 73 C102 92 68 98 44 78Z" fill="#e7a4b7"/><path d="M83 49 C76 27 104 18 118 36 C132 21 153 36 145 57 C132 73 100 72 83 49Z" fill="#f0b9c7"/><path d="M124 83 C121 61 148 52 162 69 C176 59 191 78 181 94 C164 106 138 102 124 83Z" fill="#d98ca5"/></g>
        <g fill="none" stroke="#f7dce4" stroke-width="4" opacity=".8"><path d="M55 72 C66 58 83 60 91 73"/><path d="M96 44 C110 32 128 39 135 52"/><path d="M137 82 C149 68 166 72 172 86"/></g>
        <path d="M58 118 Q109 150 166 118 L150 199 Q110 214 72 198 Z" fill="url(#rwrap)" stroke="#a2767f" stroke-width="2.5"/>
        <path class="gift-wrap-shimmer" d="M67 127 Q110 149 156 126 L148 181 Q111 194 78 181 Z" fill="#fff" opacity=".30"/>
        <path d="M69 152 C94 141 128 141 153 152" fill="none" stroke="url(#rribbon)" stroke-width="14"/>
        <path d="M111 149 C88 137 82 163 98 170 C107 170 111 160 111 149Z M111 149 C134 137 140 163 124 170 C115 170 111 160 111 149Z" fill="#b87c8d" stroke="#875263" stroke-width="2"/>
      </svg>`,
      `<svg class="gift-bouquet" viewBox="0 0 220 220" aria-label="Lily gift bouquet">
        <defs><linearGradient id="lwrap" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#efe9df"/><stop offset=".55" stop-color="#dcd2c3"/><stop offset="1" stop-color="#b9aa95"/></linearGradient><linearGradient id="lribbon" x1="0" x2="1"><stop offset="0" stop-color="#7d8f77"/><stop offset="1" stop-color="#a9b89f"/></linearGradient></defs>
        <path d="M106 79 C105 122 90 154 78 186 M112 74 C116 120 132 153 145 184 M109 80 C110 127 111 157 111 190" fill="none" stroke="#708d68" stroke-width="6" stroke-linecap="round"/>
        <g fill="#93a987" stroke="#6f8267" stroke-width="2"><path d="M90 124 C64 110 52 126 53 139 C69 140 85 135 98 129Z"/><path d="M129 126 C158 113 171 128 170 142 C151 143 137 138 123 131Z"/></g>
        <g fill="#fbf6e8" stroke="#c8b99c" stroke-width="2.5"><path d="M39 81 C28 61 46 47 61 57 C64 36 88 37 90 56 C108 45 123 63 111 80 C94 99 57 101 39 81Z"/><path d="M80 50 C70 28 93 16 109 30 C117 12 140 24 138 44 C158 40 167 62 151 76 C130 89 98 77 80 50Z"/><path d="M127 86 C121 64 146 53 160 70 C173 55 194 72 185 91 C171 107 143 106 127 86Z"/></g>
        <g fill="#d6a84b"><circle cx="72" cy="74" r="4"/><circle cx="120" cy="55" r="4"/><circle cx="159" cy="86" r="4"/></g>
        <path d="M58 118 Q109 150 166 118 L150 199 Q110 214 72 198 Z" fill="url(#lwrap)" stroke="#938571" stroke-width="2.5"/>
        <path class="gift-wrap-shimmer" d="M67 127 Q110 149 156 126 L148 181 Q111 194 78 181 Z" fill="#fff" opacity=".38"/>
        <path d="M69 152 C94 141 128 141 153 152" fill="none" stroke="url(#lribbon)" stroke-width="14"/>
        <path d="M111 149 C88 137 82 163 98 170 C107 170 111 160 111 149Z M111 149 C134 137 140 163 124 170 C115 170 111 160 111 149Z" fill="#92a18b" stroke="#65745f" stroke-width="2"/>
      </svg>`
    ];
    const wishes=[
      'May these sunflowers bring warmth, optimism, and a bright moment to your day.',
      'May these pink roses bring gentleness, joy, and a little reminder that you are appreciated.',
      'May these lilies bring calm, clarity, and something beautiful to carry with you today.'
    ];
    function choose(){let i;do{i=Math.floor(Math.random()*bouquets.length)}while(i===last&&bouquets.length>1);last=i;const wish=reveal.querySelector('.gift-wish');if(wish)wish.textContent=wishes[i];return bouquets[i];}
    btn.addEventListener('click',function(e){
      e.preventDefault();e.stopImmediatePropagation();
      if(open){gift.classList.remove('open');stage.innerHTML='';open=false;return;}
      stage.innerHTML=choose();
      gift.classList.add('open');
      open=true;
    },true);
    reveal.addEventListener('click',function(e){
      e.preventDefault();e.stopImmediatePropagation();
      gift.classList.remove('open');stage.innerHTML='';open=false;
    },true);
  }

})();

(function(){
  const toast=document.getElementById('siteToast');
  let flowerToastTimer;
  function showFlowerToast(){
    if(!toast) return;
    toast.textContent='Thank you for your flower. I love it!';
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(flowerToastTimer);
    flowerToastTimer=setTimeout(()=>toast.classList.remove('show'),3600);
  }

  // Replace the flower button once more so only this final interaction runs.
  const currentFlower=document.getElementById('flowerButton');
  if(currentFlower){
    const flowerButton=currentFlower.cloneNode(true);
    currentFlower.replaceWith(flowerButton);
    const originalBouquet=flowerButton.innerHTML;
    let flowerBusy=false;

    flowerButton.addEventListener('click',function(event){
      event.preventDefault();
      if(flowerBusy) return;
      flowerBusy=true;
      flowerButton.classList.add('is-shattering');

      const pieces=[...flowerButton.querySelectorAll('svg path, svg circle')];
      pieces.forEach((piece,index)=>{
        const angle=(Math.PI*2*index/Math.max(pieces.length,1))+(Math.random()-.5)*.55;
        const distance=30+Math.random()*43;
        const x=Math.cos(angle)*distance;
        const y=Math.sin(angle)*distance-12-Math.random()*16;
        const rotation=(Math.random()-.5)*240;
        piece.style.transformBox='fill-box';
        piece.style.transformOrigin='center';
        piece.animate([
          {transform:'translate(0,0) rotate(0deg) scale(1)',opacity:1},
          {transform:`translate(${x*.25}px,${y*.25}px) rotate(${rotation*.25}deg) scale(1.04)`,opacity:1,offset:.22},
          {transform:`translate(${x}px,${y}px) rotate(${rotation}deg) scale(.2)`,opacity:0}
        ],{
          duration:820+Math.random()*180,
          delay:index*9,
          easing:'cubic-bezier(.18,.82,.2,1)',
          fill:'forwards'
        });
      });

      flowerButton.animate([
        {transform:'scale(1)',opacity:1},
        {transform:'scale(1.07)',opacity:1,offset:.18},
        {transform:'scale(.84)',opacity:0}
      ],{duration:1030,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});

      setTimeout(()=>{
        flowerButton.getAnimations().forEach(animation=>animation.cancel());
        flowerButton.innerHTML=originalBouquet;
        flowerButton.removeAttribute('style');
        flowerButton.classList.remove('is-shattering');
        flowerButton.animate([
          {transform:'scale(.78)',opacity:0},
          {transform:'scale(1.06)',opacity:1,offset:.72},
          {transform:'scale(1)',opacity:1}
        ],{duration:460,easing:'cubic-bezier(.22,1,.36,1)'});
        showFlowerToast();
        flowerBusy=false;
      },1120);
    });
  }

  // Replace the collapse button to remove older, conflicting collapse handlers.
  const gallery=document.querySelector('.community-waterfall');
  const currentCollapse=document.getElementById('communityCollapseBtn');
  if(gallery && currentCollapse){
    const collapse=currentCollapse.cloneNode(true);
    currentCollapse.replaceWith(collapse);
    gallery.classList.remove('v50-gallery-collapsed','v52-collapsing','v52-gallery-collapsed','v52-expanding');
    collapse.innerHTML='Collapse photos <span>↑</span>';
    let collapsed=false;
    let busy=false;

    collapse.addEventListener('click',function(event){
      event.preventDefault();
      if(busy) return;
      busy=true;

      if(!collapsed){
        gallery.classList.add('v60-fading');
        // Let the complete image stream fade away first, then gently close its space.
        setTimeout(()=>{
          gallery.classList.add('v60-collapsed');
          gallery.classList.remove('v60-fading');
          collapsed=true;
          collapse.innerHTML='Show photos <span>↓</span>';
          setTimeout(()=>{busy=false;},1150);
        },2250);
      }else{
        gallery.classList.remove('v60-collapsed');
        gallery.classList.add('v60-revealing');
        collapse.innerHTML='Collapse photos <span>↑</span>';
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          gallery.classList.remove('v60-revealing');
          collapsed=false;
          setTimeout(()=>{busy=false;},2250);
        }));
      }
    });
  }
})();

(function(){
  const gallery=document.querySelector('.community-waterfall');
  const oldButton=document.getElementById('communityCollapseBtn');
  if(!gallery || !oldButton) return;

  // Remove every previous gallery state and replace the button so legacy handlers cannot run.
  gallery.classList.remove(
    'v50-gallery-collapsed','v52-collapsing','v52-gallery-collapsed','v52-expanding',
    'v60-fading','v60-collapsed','v60-revealing','travel-style-collapsed','collapsed'
  );
  gallery.removeAttribute('style');

  const button=oldButton.cloneNode(true);
  oldButton.replaceWith(button);
  button.hidden=false;
  button.innerHTML='<span>↑</span> Collapse photos';

  button.addEventListener('click',function(event){
    event.preventDefault();
    const collapsed=gallery.classList.toggle('collapsed');
    button.innerHTML=collapsed
      ? 'Show photos <span>↓</span>'
      : '<span>↑</span> Collapse photos';
  });
})();

(function(){
  const nav = document.querySelector('#beyond .bw-side-nav');
  const travelButton = nav?.querySelector('.bw-side-item[data-bw-target="travel"]');
  const slot = document.getElementById('projectsGiftSlot');
  const gift = document.getElementById('hiddenGift');
  const button = document.getElementById('giftBoxButton');
  if(!nav || !travelButton || !slot || !gift || !button) return;

  slot.className = 'travel-nav-gift-slot';
  slot.removeAttribute('style');
  if(travelButton.nextElementSibling !== slot){
    travelButton.insertAdjacentElement('afterend', slot);
  }

  // Magnetic hover should now use the side-nav area instead of the contact header.
  const radius = 150;
  const maxPull = 12;
  nav.addEventListener('pointermove', event => {
    if(gift.classList.contains('open')) return;
    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const distance = Math.hypot(dx,dy);
    if(distance >= radius){
      gift.style.transform = 'translate(0,0)';
      return;
    }
    const strength = 1 - distance / radius;
    const tx = (dx / radius) * maxPull * strength * 1.8;
    const ty = (dy / radius) * maxPull * strength * 1.8;
    gift.style.transform = `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px)`;
  });
  nav.addEventListener('pointerleave', () => {
    if(!gift.classList.contains('open')) gift.style.transform = 'translate(0,0)';
  });
  button.addEventListener('click', () => {
    gift.style.transform = 'translate(0,0)';
  });
})();


(function(){
  const lightbox=document.getElementById('projectLightbox');
  const image=lightbox?.querySelector('.project-lightbox-image');
  const title=document.getElementById('projectLightboxTitle');
  const counter=document.getElementById('projectLightboxCounter');
  const closeBtn=document.getElementById('projectLightboxClose');
  const prevBtn=document.getElementById('projectLightboxPrev');
  const nextBtn=document.getElementById('projectLightboxNext');
  const buttons=[...document.querySelectorAll('.lab-image-button')];
  if(!lightbox||!image||!buttons.length) return;
  let index=0;
  let touchStartX=0;

  function render(){
    const button=buttons[index];
    title.textContent=button.dataset.lightboxTitle||'Project preview';
    counter.textContent=`${index+1} / ${buttons.length}`;
    const preview=button.querySelector('.lab-preview');
    image.innerHTML=preview?.innerHTML||'Project image';
    image.className='project-lightbox-image';
    if(preview){
      [...preview.classList].filter(c=>c!=='lab-preview').forEach(c=>image.classList.add(c));
      const bg=getComputedStyle(preview).backgroundImage;
      if(bg && bg!=='none') image.style.backgroundImage=bg;
      else image.style.removeProperty('background-image');
    }
  }
  function openAt(i){index=(i+buttons.length)%buttons.length;render();lightbox.classList.add('open');document.body.style.overflow='hidden';}
  function close(){lightbox.classList.remove('open');document.body.style.removeProperty('overflow');}
  function move(step){index=(index+step+buttons.length)%buttons.length;render();}

  buttons.forEach((button,i)=>button.addEventListener('click',e=>{e.preventDefault();openAt(i);},true));
  prevBtn?.addEventListener('click',e=>{e.stopPropagation();move(-1)});
  nextBtn?.addEventListener('click',e=>{e.stopPropagation();move(1)});
  closeBtn?.addEventListener('click',close);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox) close();});
  document.addEventListener('keydown',e=>{
    if(!lightbox.classList.contains('open')) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowLeft') move(-1);
    if(e.key==='ArrowRight') move(1);
  });
  lightbox.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
  lightbox.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-touchStartX;
    if(Math.abs(dx)>45) move(dx>0?-1:1);
  },{passive:true});
})();
