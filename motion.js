(function(){
 'use strict';
 const surfaces='button,a.btn,a.text-btn,a.nav-link,a.profile-link,.bottom-nav a,.brand,.source-link';
 const reduced=()=>document.documentElement.dataset.motion==='off'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function ripple(target,x,y){
  if(reduced()||!target||target.disabled||target.getAttribute('aria-disabled')==='true')return;
  const box=target.getBoundingClientRect();if(!box.width||!box.height)return;
  const size=Math.hypot(box.width,box.height)*2;
  const wave=document.createElement('span');wave.className='motion-ripple';wave.setAttribute('aria-hidden','true');
  wave.style.width=wave.style.height=size+'px';wave.style.left=(x-box.left-size/2)+'px';wave.style.top=(y-box.top-size/2)+'px';
  target.classList.add('motion-surface');target.appendChild(wave);
  const remove=()=>wave.remove();wave.addEventListener('animationend',remove,{once:true});setTimeout(remove,650);
 }
 // Capture observes the gesture, leaving click, links and native forms alone.
 document.addEventListener('pointerdown',event=>{if(event.button!==0)return;const target=event.target.closest?.(surfaces);if(target)ripple(target,event.clientX,event.clientY);},{capture:true,passive:true});
 document.addEventListener('keydown',event=>{if(event.repeat||!['Enter',' '].includes(event.key))return;const target=event.target.closest?.(surfaces);if(!target||(event.key===' '&&target.tagName!=='BUTTON'))return;const box=target.getBoundingClientRect();ripple(target,box.left+box.width/2,box.top+box.height/2);},{capture:true,passive:true});
 let glowing=null,glowFrame=0;
 document.addEventListener('pointermove',event=>{if(reduced()||event.pointerType==='touch')return;const card=event.target.closest?.('[data-glow]');if(!card)return;glowing={card,x:event.clientX,y:event.clientY};if(glowFrame)return;glowFrame=requestAnimationFrame(()=>{glowFrame=0;const p=glowing;if(!p?.card.isConnected)return;const rect=p.card.getBoundingClientRect();p.card.style.setProperty('--spot-x',(p.x-rect.left)+'px');p.card.style.setProperty('--spot-y',(p.y-rect.top)+'px');});},{passive:true});
 function celebrate(){if(reduced())return;const target=document.querySelector('.tracker-today .card-head .pill');if(!target)return;const r=target.getBoundingClientRect();for(let i=0;i<10;i++){const p=document.createElement('span');p.className='motion-particle';p.setAttribute('aria-hidden','true');p.style.left=(r.left+r.width/2)+'px';p.style.top=(r.top+r.height/2)+'px';p.style.setProperty('--particle-color',['#c6ff69','#66e1d1','#b8a1ff'][i%3]);p.style.setProperty('--dx',((Math.random()-.5)*120)+'px');p.style.setProperty('--dy',(-20-Math.random()*70)+'px');document.body.appendChild(p);setTimeout(()=>p.remove(),750);}}
 function refresh(main=document.querySelector('#main')){
  if(reduced()||!main?.querySelectorAll)return;
  // Animate the first visible batch; the rest stay ready to read without observers.
  [...main.querySelectorAll('.plan-card,.exercise-card,.portal-card,.split-week-day')].slice(0,12).forEach((node,index)=>{node.style.setProperty('--reveal-delay',Math.min(index,7)*30+'ms');node.classList.add('motion-ready','motion-visible');});
 }
 window.FLMotion={celebrate,refresh};refresh();
})();
