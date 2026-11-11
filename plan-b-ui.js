(function(root){
 'use strict';
 const B=typeof module!=='undefined'?require('./plan-b.js'):root.FLPlanB;
 function create(ctx){
  const {E,Seed,esc,attr,icon,btn,notice,openModal,closeModal,today,formatDate,getState,commit,render,toast,beforeOpen,showSession}=ctx;
  let selectedId=null,blocked=[],minutes=30,proposal=null;
  const find=(state,id)=>Object.values(state.plans).flatMap(p=>p.sessions).find(s=>s.id===id);
  const editable=s=>s&&s.date>=today()&&['planned','missed'].includes(s.status);
  const label=(state,id)=>state.catalog.find(e=>e.id===id)?.name||'Упражнение';
  function calculate(){
   const state=getState(),s=find(state,selectedId);proposal=null;
   if(!editable(s))return 'Это занятие уже завершено или осталось в истории.';
   try{proposal=B.prepare(s,state.profile,state.catalog,{blocked,minutes,today:today()});return '';}
   catch(error){return error.message;}
  }
  function open(id){
   const s=find(getState(),id);if(!editable(s)){toast('План Б доступен для сегодняшнего или будущего незавершённого занятия.');return;}
   beforeOpen?.();selectedId=id;blocked=[];const desired=Math.max(10,Math.min(60,s.minutes-Math.floor((s.activeSeconds||0)/60)));
   minutes=[10,20,30,45,60].sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired))[0];draw();
  }
  function draw(){
   const state=getState(),s=find(state,selectedId),error=calculate();if(!s)return;
   const used=[...new Set(s.blocks.flatMap(b=>state.catalog.find(e=>e.id===b.exerciseId)?.equipment||[]))],other=Object.keys(E.EQUIP).filter(k=>!used.includes(k)&&(state.profile?.equipment.includes(k)||!state.profile));
   const gear=keys=>keys.map(k=>`<button type="button" class="chip ${blocked.includes(k)?'active':''}" data-action="planb-gear" data-value="${k}" aria-pressed="${blocked.includes(k)}">${blocked.includes(k)?icon('close',12):icon('dumbbell',12)}${esc(E.EQUIP[k])}</button>`).join('');
   const list=blocks=>`<ol class="planb-blocks">${blocks.map(b=>`<li><strong>${esc(label(state,b.exerciseId))}</strong><span>${b.sets} × ${esc(b.reps)}${b.done.length?' · отмечено '+b.done.length+'/'+b.sets:''}</span></li>`).join('')}</ol>`;
   const changeNames={locked:'Сохраняется',kept:'Без замены',replaced:'Замена',removed:'Убрано',reduced:'Меньше подходов'};
   const body=`<div class="planb-intro"><span class="pill green">${icon('path',14)} ПЛАН Б</span><h3>${esc(s.title)}</h3><p>${formatDate(s.date)} · Сохраняем уже отмеченное и меняем только оставшуюся часть.</p></div><section class="planb-controls"><h3>Что сейчас недоступно?</h3><p class="muted">Отметь занятые тренажёры или инвентарь. Постоянная анкета не изменится.</p><div class="chips">${gear(used)||'<span class="muted">В исходном занятии инвентарь не требуется.</span>'}</div>${other.length?`<details class="planb-other"><summary>Другой инвентарь из анкеты</summary><div class="chips">${gear(other)}</div></details>`:''}<h3>Сколько времени осталось?</h3><div class="chips">${[10,20,30,45,60].map(n=>`<button type="button" class="chip ${minutes===n?'active':''}" data-action="planb-time" data-value="${n}" aria-pressed="${minutes===n}">${n} мин</button>`).join('')}</div><p class="muted">Это ориентир для оставшейся части. Для сравнения считаем примерно 2 минуты на подход вместе с отдыхом; реальное время зависит от темпа и пауз.</p></section>${error?`<p class="split-error" role="alert">${esc(error)}</p>`:''}${proposal?`<div class="planb-comparison"><section><span class="eyebrow">ИСХОДНЫЙ ПЛАН</span>${list(s.blocks)}</section><section><span class="eyebrow">НОВЫЙ ВАРИАНТ</span>${list(proposal.session.blocks)}<p class="planb-estimate">Ориентир оставшейся части: ≈ ${proposal.estimateMinutes} мин. Блоков с отметками сохранено: ${proposal.retainedCount}.</p></section></div><div class="planb-reasons"><h3>Что меняется и почему</h3>${proposal.changes.map(c=>`<div class="planb-reason"><span class="pill ${c.type==='locked'?'green':''}">${changeNames[c.type]}</span><p><strong>${esc(label(state,c.fromId))}${c.toId&&c.toId!==c.fromId?' → '+esc(label(state,c.toId)):''}</strong><br>${esc(c.reason)}</p></div>`).join('')}</div>${proposal.warnings.map(w=>notice(esc(w))).join('')}${!proposal.hasChanges?'<p class="muted">При этих условиях состав остаётся прежним. Можно изменить время или отметить недоступный инвентарь.</p>':''}`:''}${notice('После сохранения можно вернуть исходный состав, пока в новом варианте не появились отметки или другие изменения. Начатый блок целиком остаётся на месте; новый рабочий вес не назначается.')}<div class="modal-buttons">${btn('Отмена','modal-close')}${btn('Вернуться к занятию','planb-back','left','',`data-id="${attr(s.id)}"`)}${btn('Применить План Б','planb-save','check','primary',proposal?.canApply&&proposal?.hasChanges?'':'disabled')}</div>`;
   const scroll=document.querySelector('#modal-root .modal-body')?.scrollTop||0;openModal('plan-b','План Б для этой тренировки',body,true);const node=document.querySelector('#modal-root .modal-body');if(node)node.scrollTop=scroll;
  }
  function action(a,target){
   if(!a.startsWith('planb-'))return false;
   const id=target.dataset.id;
   if(a==='planb-open'){open(id);return true;}
   if(a==='planb-back'){showSession(id||selectedId);return true;}
   if(a==='planb-undo'){
    beforeOpen?.();const candidate=E.clone(getState()),s=find(candidate,id);
    if(!editable(s)||!B.canUndo(s)){toast('После Плана Б появились новые отметки или правки. Возврат отключён, чтобы их сохранить.');return true;}
    const restored=B.undo(s);for(const key of ['planBRestore','manual','focusGroups','targetGroups','missingGroups'])if(!Object.hasOwn(restored,key))delete s[key];Object.assign(s,restored);
    if(commit(candidate)){render();showSession(id);toast('Исходный состав восстановлен.');}else toast('Не удалось сохранить возврат.');return true;
   }
   if(!selectedId)return true;
   if(a==='planb-gear'&&Object.hasOwn(E.EQUIP,target.dataset.value)){const k=target.dataset.value;blocked=blocked.includes(k)?blocked.filter(x=>x!==k):blocked.concat(k);draw();return true;}
   if(a==='planb-time'&&[10,20,30,45,60].includes(Number(target.dataset.value))){minutes=Number(target.dataset.value);draw();return true;}
   if(a==='planb-save'){
    const seen=proposal?.sourceFingerprint,error=calculate();
    if(error||!proposal?.canApply||!proposal.hasChanges){toast(error||'Подходящего изменения нет. Проверь условия.');draw();return true;}
    if(proposal.sourceFingerprint!==seen){draw();toast('Записи занятия изменились. Предпросмотр обновлён — проверь его перед сохранением.');return true;}
    const candidate=E.clone(getState()),s=find(candidate,selectedId);let next;
    try{next=B.apply(s,proposal);}catch(error){toast(error.message);draw();return true;}
    Object.assign(s,next);
    if(commit(candidate)){render();showSession(selectedId);toast('План Б сохранён. Уже отмеченные блоки остались на месте.');}else toast('Не удалось сохранить План Б. Проверь доступность хранилища.');return true;
   }
   return true;
  }
  return {open,action};
 }
 const value={create};root.FLPlanBUI=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
