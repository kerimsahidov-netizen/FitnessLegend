(function(root){
 'use strict';
 function create(ctx){
  const {E,Seed,esc,attr,btn,notice,openModal,closeModal,today,getState,commit,toast,render,go,exerciseImage}=ctx;
  const find=(state,id)=>Object.values(state.plans).flatMap(p=>p.sessions).find(s=>s.id===id);
  const editable=s=>s&&s.status!=='done'&&s.date>=today();
  function open(id){
   const s=find(getState(),id);if(!editable(s)){toast('Выполненные и прошедшие занятия остаются историей.');return;}
   openModal('workout-editor','Состав тренировки',`<p class="lead">${esc(s.title)}</p><p class="muted">Меняй упражнения и подходы до их выполнения. Блоки с отметками сохраняются.</p><div class="workout-editor-list">${s.blocks.map((b,index)=>{const e=getState().catalog.find(e=>e.id===b.exerciseId),locked=b.done.length>0;return `<article class="workout-editor-item"><h3>${index+1}. ${esc(e?.name||'Упражнение')}</h3><div><span>${b.sets} × ${esc(b.reps)}</span>${btn('−','workout-sets','','count-btn',`data-id="${attr(id)}" data-index="${index}" data-change="-1" aria-label="Уменьшить подходы: ${attr(e?.name)}" ${locked||b.sets<=1?'disabled':''}`)}${btn('+','workout-sets','','count-btn',`data-id="${attr(id)}" data-index="${index}" data-change="1" aria-label="Добавить подход: ${attr(e?.name)}" ${locked||b.sets>=5?'disabled':''}`)}${btn('Заменить','workout-replace','refresh','',`data-id="${attr(id)}" data-index="${index}" ${locked?'disabled':''}`)}${btn('Убрать','workout-remove','close','ghost',`data-id="${attr(id)}" data-index="${index}" ${locked||s.blocks.length<=1?'disabled':''}`)}${locked?'<span class="pill green">Есть отметки</span>':''}</div></article>`;}).join('')}</div>${notice('Ручные изменения сохраняются сразу. Такая тренировка защищена от замены при смене сплита. Диапазоны повторений — учебные подписи, рабочий вес ты подбираешь отдельно.')}<div class="modal-buttons">${btn('Добавить из каталога','workout-add-more','plus')}${btn('Готово','modal-close','check','primary')}</div>`,true);
  }
  function choices(id,index){
   const state=getState(),s=find(state,id),b=s?.blocks[index];if(!editable(s)||!b||b.done.length)return;
   const e=state.catalog.find(e=>e.id===b.exerciseId),profile=state.profile||{level:'regular',place:'mixed',equipment:Object.keys(E.EQUIP)};
   const pool=E.allowedExercises(profile,state.catalog).filter(x=>Seed.focusFor(x)===Seed.focusFor(e)&&!s.blocks.some(block=>block.exerciseId===x.id));
   openModal('workout-replace','Выбери замену',`<p class="lead">${esc(e.name)} → ${esc(Seed.focusFor(e))}</p><p class="muted">${state.profile?'Показаны варианты с учётом опыта, места и инвентаря анкеты.':'Анкета ещё не заполнена: показаны базовые варианты из каталога. Проверь нужный инвентарь.'}</p><div class="workout-swap-list">${pool.map(x=>`<button type="button" class="workout-swap-choice" data-action="workout-select" data-id="${attr(id)}" data-index="${index}" data-exercise="${attr(x.id)}">${exerciseImage(x)}<strong>${esc(x.name)}</strong><small>${x.equipment.length?x.equipment.map(k=>E.EQUIP[k]).join(', '):'Без инвентаря'} · ${esc(x.reps)}</small></button>`).join('')||'<p class="muted">Других подходящих вариантов пока нет. Измени инвентарь в анкете или добавь упражнение вручную из каталога.</p>'}</div><div class="modal-buttons">${btn('Назад к составу','workout-edit','left','',`data-id="${attr(id)}"`)}</div>`,true);
  }
  function action(a,target){
   if(!a.startsWith('workout-'))return false;
   const id=target.dataset.id,index=Number(target.dataset.index);
   if(a==='workout-edit'){open(id);return true;}
   if(a==='workout-add-more'){closeModal();go('exercises');toast('Открой движение и нажми «Добавить в занятие».');return true;}
   if(a==='workout-replace'){choices(id,index);return true;}
   const candidate=E.clone(getState()),s=find(candidate,id),b=s?.blocks[index];if(!editable(s)||!b||b.done.length){toast('Этот блок уже начат. Его отметки сохраняются.');return true;}
   if(a==='workout-sets'){const value=b.sets+Number(target.dataset.change);if(!Number.isInteger(value)||value<1||value>5)return true;b.sets=value;if(b.records)b.records=b.records.filter(r=>r.set<value);}
   else if(a==='workout-remove'){if(s.blocks.length<=1){toast('В занятии должно остаться хотя бы одно упражнение.');return true;}s.blocks.splice(index,1);}
   else if(a==='workout-select'){
    const original=candidate.catalog.find(e=>e.id===b.exerciseId),profile=candidate.profile||{level:'regular',place:'mixed',equipment:Object.keys(E.EQUIP)},next=E.allowedExercises(profile,candidate.catalog).find(e=>e.id===target.dataset.exercise&&Seed.focusFor(e)===Seed.focusFor(original));
    if(!next||s.blocks.some(block=>block.exerciseId===next.id)){toast('Выбери другое движение.');return true;}b.exerciseId=next.id;b.reps=next.reps;delete b.records;delete b.reason;
   }else return true;
   s.manual=true;s.focusGroups=[...new Set(s.blocks.map(block=>Seed.focusFor(candidate.catalog.find(e=>e.id===block.exerciseId))))].filter(g=>E.training.FOCUSES.includes(g));
   if(commit(candidate)){render();open(id);toast('Состав тренировки сохранён.');}else toast('Изменения не сохранены. Проверь хранилище.');return true;
  }
  return {open,action};
 }
 const value={create};root.FLWorkoutUI=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
