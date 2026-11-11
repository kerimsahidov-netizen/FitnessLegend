(function(root){
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const signature=s=>JSON.stringify({date:s.date,title:s.title,status:s.status,minutes:s.minutes,blocks:s.blocks.map(b=>({id:b.exerciseId,sets:b.sets,reps:b.reps}))});
 function record(before,after,catalog,at=new Date().toISOString()){
  if(!before||!after||signature(before)===signature(after))return false;
  const name=id=>catalog.find(e=>e.id===id)?.name||'Упражнение';let title='Изменён состав занятия',kind='composition',details=[];
  if(before.minutes!==after.minutes)details.push('Ориентир времени: '+before.minutes+' → '+after.minutes+' мин');
  if(before.date!==after.date){title='Занятие перенесено';kind='move';details.push(before.date+' → '+after.date);}
  if(after.status!==before.status){title=after.status==='done'?'Занятие завершено':after.status==='missed'?'Отмечен пропуск':after.status==='skipped'?'Занятие убрано из недели':'Статус занятия изменён';kind='status';}
  if(after.planBRestore&&after.planBRestore.appliedFingerprint!==before.planBRestore?.appliedFingerprint){title='Применён План Б';kind='plan-b';}
  if(before.planBRestore&&!after.planBRestore){title='Возвращён состав до Плана Б';kind='undo';}
  for(const b of before.blocks){const next=after.blocks.find(x=>x.exerciseId===b.exerciseId);if(!next)details.push('Убрано: '+name(b.exerciseId));else if(next.sets!==b.sets||next.reps!==b.reps)details.push(name(b.exerciseId)+': '+b.sets+' × '+b.reps+' → '+next.sets+' × '+next.reps);}
  for(const b of after.blocks)if(!before.blocks.some(x=>x.exerciseId===b.exerciseId))details.push('Добавлено: '+name(b.exerciseId)+' · '+b.sets+' × '+b.reps);
  if(after.missingGroups?.length)details.push('В сокращённом составе не представлены: '+after.missingGroups.join(', '));
  if(!details.length)details.push('Изменения сохранены пользователем.');
  after.decisions=[...(after.decisions||[]),{at,kind,title,details:details.slice(0,8).map(t=>t.slice(0,240))}].slice(-12);return true;
 }
 function capture(previous,candidate){const old=new Map(Object.values(previous.plans).flatMap(p=>p.sessions).map(s=>[s.id,s]));for(const s of Object.values(candidate.plans).flatMap(p=>p.sessions))record(old.get(s.id),s,candidate.catalog);}
 function validate(s){try{return s.decisions===undefined||Array.isArray(s.decisions)&&s.decisions.length<=12&&s.decisions.every(x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>['at','kind','title','details'].includes(k))&&typeof x.at==='string'&&x.at.length<=40&&/^\d{4}-\d{2}-\d{2}T/.test(x.at)&&Number.isFinite(Date.parse(x.at))&&['composition','move','status','plan-b','undo'].includes(x.kind)&&typeof x.title==='string'&&x.title.length<=120&&Array.isArray(x.details)&&x.details.length<=8&&x.details.every(t=>typeof t==='string'&&t.length<=240));}catch{return false;}}
 function history(sessions){return sessions.flatMap(s=>(s.decisions||[]).map(e=>({...clone(e),sessionTitle:s.title,date:s.date,id:s.id}))).sort((a,b)=>b.at.localeCompare(a.at));}
 function panel(sessions,esc){const rows=history(sessions).slice(0,100);return rows.length?`<div class="decision-list">${rows.map(e=>`<article><small>${esc(new Date(e.at).toLocaleString('ru-RU'))} · ${esc(e.sessionTitle)}</small><h3>${esc(e.title)}</h3><ul>${e.details.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></article>`).join('')}</div>`:'<p class="muted">Изменений пока нет. Здесь появятся применения и отмены Плана Б, замены упражнений, изменения подходов и переносы. Старые события не восстанавливаются задним числом.</p>';}
 const value={signature,record,capture,validate,history,panel};root.FLDecisions=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
