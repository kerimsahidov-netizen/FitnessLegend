(function(root){
 'use strict';
 const BASIS={total:'Общий вес снаряда',perHand:'Вес одной гантели',machine:'Вес на тренажёре',bodyweight:'Свой вес',assistance:'Вес помощи тренажёра'};
 const UNITS={reps:'повторений',seconds:'секунд'};
 const clone=x=>JSON.parse(JSON.stringify(x));
 const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+'T12:00:00Z'))&&new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x;
 function validRecord(r,sets=5){return object(r)&&Object.keys(r).every(k=>['set','load','value','unit','basis','note','at','day'].includes(k))&&Number.isInteger(r.set)&&r.set>=0&&r.set<sets&&(r.load===null||(typeof r.load==='number'&&Number.isFinite(r.load)&&r.load>=0&&r.load<=1000))&&Number.isInteger(r.value)&&r.value>=1&&r.value<=3600&&Object.hasOwn(UNITS,r.unit)&&Object.hasOwn(BASIS,r.basis)&&(r.basis==='bodyweight'?r.load===null:r.load!==null)&&typeof r.note==='string'&&r.note.length<=120&&typeof r.at==='string'&&r.at.length<=40&&/^\d{4}-\d{2}-\d{2}T/.test(r.at)&&Number.isFinite(Date.parse(r.at))&&date(r.day);}
 function validateBlock(b){try{return object(b)&&(b.records===undefined||(Array.isArray(b.records)&&b.records.length<=5&&Number.isInteger(b.sets)&&b.sets>=1&&b.sets<=5&&new Set(b.records.map(r=>r?.set)).size===b.records.length&&b.records.every(r=>validRecord(r,b.sets))));}catch{return false;}}
 function history(sessions,exerciseId,excludeSessionId){
  const rows=[];for(const session of sessions||[])if(session.id!==excludeSessionId)for(let i=0;i<(session.blocks||[]).length;i++){
   const b=session.blocks[i];if(!b||b.exerciseId!==exerciseId||!Array.isArray(b.done)||!validateBlock(b))continue;
   for(const r of b.records||[])if(b.done.includes(r.set))rows.push({...clone(r),sessionId:session.id,sessionTitle:session.title,plannedDate:session.date,exerciseId,blockIndex:i});
  }
  return rows.sort((a,b)=>a.at.localeCompare(b.at)||a.sessionId.localeCompare(b.sessionId)||a.set-b.set);
 }
 function matching(sessions,id,options={}){return history(sessions,id,options.excludeSessionId).filter(r=>(!options.basis||r.basis===options.basis)&&(!options.unit||r.unit===options.unit));}
 function last(sessions,id,options={}){return matching(sessions,id,options).at(-1)||null;}
 function stats(sessions,id,options={}){
  const all=matching(sessions,id,options),basis=options.basis||all.at(-1)?.basis||null,unit=options.unit||all.at(-1)?.unit||null,rows=all.filter(r=>r.basis===basis&&r.unit===unit);
  const positive=rows.filter(r=>r.load!==null),maxLoad=positive.length?Math.max(...positive.map(r=>r.load)):null,maxValue=rows.length?Math.max(...rows.map(r=>r.value)):null;
  const bestSet=rows.filter(r=>r.load===maxLoad).sort((a,b)=>b.value-a.value)[0]||null;
  return {basis,unit,rows,count:rows.length,sessionCount:new Set(rows.map(r=>r.sessionId)).size,last:rows.at(-1)||null,maxLoad,maxValue,bestSet,loadRecordAvailable:rows.length>0&&basis!=='assistance'&&basis!=='bodyweight'};
 }
 function saveRecord(session,index,record){
  if(!session||!['planned','missed'].includes(session.status)||!Number.isInteger(index)||!session.blocks?.[index])throw new Error('Это занятие недоступно для записи подходов.');
  const result=clone(session),b=result.blocks[index];if(!validRecord(record,b.sets))throw new Error('Проверь вес, количество, тип записи и дату.');
  b.records=(b.records||[]).filter(r=>r.set!==record.set).concat(clone(record)).sort((a,b)=>a.set-b.set);b.done=[...new Set(b.done.concat(record.set))].sort((a,b)=>a-b);
  return result;
 }
 function defaultBasis(exercise){const gear=exercise?.equipment||[];return gear.includes('dumbbell')?'perHand':gear.includes('assistedpullup')?'assistance':gear.some(k=>['barbell','ezbar','landmine'].includes(k))?'total':gear.some(k=>!['chair','wall','bench','step','pullup'].includes(k))?'machine':'bodyweight';}
 function describe(record){if(!record)return 'Записей пока нет';const load=record.basis==='bodyweight'?'Свой вес':record.basis==='assistance'?record.load+' кг помощи':record.load+' кг';return load+' × '+record.value+' '+(record.unit==='seconds'?'сек':'повт.');}
 const value={BASIS,UNITS,validRecord,validateBlock,history,last,stats,saveRecord,defaultBasis,describe};root.FLPerformance=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
