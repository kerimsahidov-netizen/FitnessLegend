(function(root){
 'use strict';
 const Performance=typeof module!=='undefined'?require('./performance.js'):root.FLPerformance;
 const T=typeof module!=='undefined'?require('./training.js'):root.FLTraining;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const minutesValid=x=>typeof x==='number'&&Number.isFinite(x)&&x>=1&&x<=120;
 const signature=s=>JSON.stringify({blocks:s.blocks,minutes:s.minutes,focusGroups:s.focusGroups??null,targetGroups:s.targetGroups??null});
 const focus=(catalog,id)=>T.focusFor(catalog.find(e=>e.id===id));
 function prepare(session,profile,catalog,options={}){
  if(!session||!Array.isArray(session.blocks)||session.status==='done'||(options.today&&session.date<options.today))throw new Error('План Б доступен для сегодняшнего или будущего незавершённого занятия.');
  const remaining=Number(options.minutes),blocked=[...new Set(options.blocked||[])];
  if(![10,20,30,45,60].includes(remaining)||!blocked.every(k=>typeof k==='string'&&k.length<40))throw new Error('Проверь доступное время и оборудование.');
  if(session.blocks.every(b=>b.done.length===b.sets))throw new Error('Все подходы уже отмечены. Можно завершить занятие.');
  const source=signature(session),next=clone(session),warnings=[],changes=[];
  const byId=new Map(catalog.map(e=>[e.id,e]));
  if(session.blocks.some(b=>!byId.has(b.exerciseId)))throw new Error('В занятии есть движение, которого больше нет в каталоге.');
  const locked=session.blocks.filter(b=>b.done.length>0),reserved=new Set(locked.map(b=>b.exerciseId));
  if(reserved.size!==locked.length)throw new Error('В уже отмеченной части повторяется упражнение. План Б не меняет такие блоки.');
  const p=profile||{level:'regular',place:'mixed',equipment:[...new Set(catalog.flatMap(e=>e.equipment))]};
  const pool=T.allowed(p,catalog).filter(e=>T.visible(e)&&!e.equipment.some(k=>blocked.includes(k)));
  let available=Math.max(0,remaining-locked.reduce((n,b)=>n+(b.sets-b.done.length)*2,0));
  const estimateLocked=locked.reduce((n,b)=>n+(b.sets-b.done.length)*2,0),picked=[];
  for(let index=0;index<session.blocks.length;index++){
   const b=session.blocks[index],original=byId.get(b.exerciseId),g=T.focusFor(original);
   if(b.done.length){
    picked.push(clone(b));changes.push({index,type:'locked',fromId:b.exerciseId,toId:b.exerciseId,fromSets:b.sets,toSets:b.sets,reason:'Есть отметки: весь блок сохранён без изменений.'});
    if(b.done.length<b.sets&&original.equipment.some(k=>blocked.includes(k)))warnings.push(`«${original.name}»: блок уже начат, но его оборудование отмечено как недоступное. Остальные подходы не заменены; не выполняй их на занятом оборудовании.`);
    continue;
   }
   if(available<2){changes.push({index,type:'removed',fromId:b.exerciseId,toId:null,fromSets:b.sets,toSets:0,reason:'Убрано из оставшейся части по выбранному времени.'});continue;}
   let chosen=original,reason='Остаётся исходное упражнение.';
   if(original.equipment.some(k=>blocked.includes(k))||!T.visible(original)||reserved.has(original.id)){
    const choices=pool.filter(e=>T.focusFor(e)===g&&!reserved.has(e.id)).sort((a,b)=>Number(b.kind===original.kind)-Number(a.kind===original.kind)||Number(b.equipment.length>0)-Number(a.equipment.length>0));
    chosen=choices[0];
    if(!chosen){changes.push({index,type:'removed',fromId:b.exerciseId,toId:null,fromSets:b.sets,toSets:0,reason:`Нет доступной замены на ${g.toLocaleLowerCase('ru')}. Случайное движение другой группы не добавлено.`});continue;}
    reason=`Замена на тот же акцент: ${g.toLocaleLowerCase('ru')}. Выбранный инвентарь доступен по анкете.`;
   }
   const sets=Math.min(b.sets,Math.floor(available/2));available-=sets*2;reserved.add(chosen.id);
   const block=clone(b);if(chosen.id!==b.exerciseId)delete block.records;else if(block.records)block.records=block.records.filter(r=>r.set<sets);block.exerciseId=chosen.id;block.reps=chosen.id===b.exerciseId?b.reps:chosen.reps;block.sets=sets;block.done=[];
   if(sets<b.sets)reason+=' Число неотмеченных подходов сокращено под выбранное время.';
   if(chosen.id!==b.exerciseId||sets!==b.sets)block.reason=reason;
   picked.push(block);
   changes.push({index,type:chosen.id!==b.exerciseId?'replaced':sets!==b.sets?'reduced':'kept',fromId:b.exerciseId,toId:chosen.id,fromSets:b.sets,toSets:sets,reason});
  }
  next.blocks=picked;
  const actual=[...new Set(picked.map(b=>focus(catalog,b.exerciseId)))].filter(g=>T.FOCUSES.includes(g));
  const targets=session.targetGroups?.length?session.targetGroups:session.focusGroups?.length?session.focusGroups:[...new Set(session.blocks.map(b=>focus(catalog,b.exerciseId)))];
  const missingGroups=targets.filter(g=>!actual.includes(g));
  if(missingGroups.length)warnings.push('В новом составе не представлены: '+missingGroups.join(', ')+'. Это сокращённое занятие, а не полная замена прежней нагрузки.');
  if(estimateLocked>remaining)warnings.push('В начатых блоках осталось больше подходов, чем помещается в выбранный ориентир времени. Они сохранены целиком; точное время не гарантируется.');
  next.focusGroups=actual;next.targetGroups=clone(targets);next.missingGroups=missingGroups;
  const estimateMinutes=picked.reduce((n,b)=>n+(b.sets-b.done.length)*2,0);
  next.minutes=Math.min(120,Math.ceil((session.activeSeconds||0)/60)+Math.max(remaining,estimateMinutes));
  const changed=changes.some(c=>!['kept','locked'].includes(c.type))||next.minutes!==session.minutes;
  const canApply=picked.length>0&&signature(next).length<=12000&&source.length<=12000;
  if(!picked.length)warnings.push('Не осталось доступных упражнений. План не будет сохранён: выбери другое время или освободи оборудование.');
  if(signature(next).length>12000||source.length>12000)warnings.push('В занятии слишком много дополнительных данных для безопасного возврата. План Б не будет применён; используй ручной редактор.');
  return {sourceFingerprint:source,session:next,changes,warnings,missingGroups,retainedCount:locked.length,estimateMinutes,remainingMinutes:remaining,canApply,hasChanges:changed};
 }
 function apply(session,proposal){
  if(!proposal?.canApply||!proposal.hasChanges||proposal.sourceFingerprint!==signature(session))throw new Error('План изменился или замен нет. Обнови предпросмотр.');
  const next=clone(proposal.session);next.manual=true;
  next.planBRestore={version:1,createdAt:new Date().toISOString(),blocks:clone(session.blocks),minutes:session.minutes,focusGroups:clone(session.focusGroups??null),targetGroups:clone(session.targetGroups??null),missingGroups:clone(session.missingGroups??null),manual:session.manual??null,appliedFingerprint:signature(next)};
  return next;
 }
 function canUndo(session){try{return !!session?.planBRestore&&session.status!=='done'&&session.planBRestore.appliedFingerprint===signature(session);}catch{return false;}}
 function undo(session){
  if(!canUndo(session))throw new Error('После изменения появились новые отметки или правки. Возврат отключён, чтобы сохранить их.');
  const next=clone(session),saved=next.planBRestore;next.blocks=clone(saved.blocks);next.minutes=saved.minutes;
  for(const key of ['focusGroups','targetGroups','missingGroups','manual']){if(saved[key]===null)delete next[key];else next[key]=clone(saved[key]);}
  delete next.planBRestore;return next;
 }
 function validateSession(session,catalog){
  try{
   if(session.planBRestore===undefined)return true;
   const r=session.planBRestore,ids=new Set(catalog.map(e=>typeof e==='string'?e:e.id));
   const group=a=>a===null||(Array.isArray(a)&&a.length<=10&&new Set(a).size===a.length&&a.every(g=>T.FOCUSES.includes(g)));
   const blocks=a=>Array.isArray(a)&&a.length>=1&&a.length<=20&&a.every(b=>record(b)&&Performance.validateBlock(b)&&ids.has(b.exerciseId)&&Number.isInteger(b.sets)&&b.sets>=1&&b.sets<=5&&typeof b.reps==='string'&&b.reps.length<=50&&Array.isArray(b.done)&&new Set(b.done).size===b.done.length&&b.done.every(n=>Number.isInteger(n)&&n>=0&&n<b.sets));
   if(!record(r)||Object.keys(r).some(k=>!['version','createdAt','blocks','minutes','focusGroups','targetGroups','missingGroups','manual','appliedFingerprint'].includes(k))||r.version!==1||typeof r.createdAt!=='string'||r.createdAt.length>40||!Number.isFinite(Date.parse(r.createdAt))||new Date(r.createdAt).toISOString()!==r.createdAt||!minutesValid(r.minutes)||!blocks(r.blocks)||!group(r.focusGroups)||!group(r.targetGroups)||!group(r.missingGroups)||(r.manual!==null&&typeof r.manual!=='boolean')||typeof r.appliedFingerprint!=='string'||r.appliedFingerprint.length>12000||JSON.stringify(r).length>26000)return false;
   const parsed=JSON.parse(r.appliedFingerprint);
   return record(parsed)&&Object.keys(parsed).length===4&&blocks(parsed.blocks)&&minutesValid(parsed.minutes)&&group(parsed.focusGroups)&&group(parsed.targetGroups);
  }catch{return false;}
 }
 const value={prepare,apply,canUndo,undo,validateSession,fingerprint:signature};root.FLPlanB=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
