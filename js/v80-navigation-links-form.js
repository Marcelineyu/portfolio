
(function(){
  const topButton=document.getElementById('floatingHome');
  const bottomButton=document.getElementById('floatingBottom');
  const NAV_SECTION_IDS=['home','about','experience','labs','projects','beyond','contact'];
  const navSections=NAV_SECTION_IDS.map(id=>document.getElementById(id)).filter(Boolean);

  function getCurrentSectionIndex(){
    const viewportCenter=window.innerHeight/2;
    let closestIndex=0;
    let closestDistance=Infinity;
    navSections.forEach((section,index)=>{
      const rect=section.getBoundingClientRect();
      const sectionCenter=rect.top+rect.height/2;
      const distance=Math.abs(sectionCenter-viewportCenter);
      if(distance<closestDistance){
        closestDistance=distance;
        closestIndex=index;
      }
    });
    return closestIndex;
  }

  function scrollToSection(index){
    const section=navSections[index];
    if(section) section.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function updateFloatingButtons(){
    const current=getCurrentSectionIndex();
    topButton?.classList.toggle('is-edge-hidden',current<=0);
    bottomButton?.classList.toggle('is-edge-hidden',current>=navSections.length-1);
  }

  window.sectionNavPrev=function(){
    const current=getCurrentSectionIndex();
    if(current>0) scrollToSection(current-1);
  };

  window.sectionNavNext=function(){
    const current=getCurrentSectionIndex();
    if(current<navSections.length-1) scrollToSection(current+1);
  };

  bottomButton?.addEventListener('click',()=>window.sectionNavNext());

  window.addEventListener('scroll',updateFloatingButtons,{passive:true});
  window.addEventListener('resize',updateFloatingButtons);
  updateFloatingButtons();

  document.querySelectorAll('[data-open-lab-preview]').forEach(titleButton=>{
    titleButton.addEventListener('click',()=>{
      titleButton.closest('.lab-tile')?.querySelector('.lab-image-button')?.click();
    });
  });
})();
