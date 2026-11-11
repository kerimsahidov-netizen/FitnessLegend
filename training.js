(function(root){
 'use strict';
 const FOCUSES=['Спина','Бицепс','Грудь','Трицепс','Плечи','Ноги','Кор','Предплечья','Кардио'];
 const HIDDEN=new Set(['glute-bridge','hip-thrust']);
 const overrides={biceps:'Бицепс','dumbbell-hammer-curl':'Бицепс','dumbbell-triceps-extension':'Трицепс','cable-triceps-pushdown':'Трицепс','wall-push':'Грудь','push-up':'Грудь','incline-push-up':'Грудь','dumbbell-floor-press':'Грудь','chest-press-machine':'Грудь','barbell-bench-press':'Грудь','dumbbell-shoulder-press':'Плечи','dumbbell-lateral-raise':'Плечи','cable-face-pull':'Плечи'};
 const MODES={
  split3:{name:'Классический сплит',badge:'3 дня',description:'Спина и бицепс → грудь и трицепс → ноги. Кардио — по отдельному выбору.',days:[0,2,4],limit:3},
  ppl:{name:'Тяга · жим · ноги',badge:'3 дня',description:'Тяговые мышцы → жимовые мышцы → ноги и кор.',days:[0,2,4],limit:3},
  upperLower:{name:'Верх · низ',badge:'4 дня',description:'Два дня на верх и два на ноги. Разные части тела чередуются.',days:[0,1,3,4],limit:4},
  homeSplit:{name:'Домашний сплит',badge:'3 дня',description:'Верх тела → ноги → кор и спокойная активность. По доступному инвентарю.',days:[0,2,4],limit:3},
  custom:{name:'Мой сплит',badge:'до 5 дней',description:'Выбери мышцы для каждого дня. Пересечения учитываются при расстановке.',days:[0,2,4],limit:5},
  fullbody:{name:'Всё тело',badge:'до 3 дней',description:'Дополнительный вариант: несколько основных групп в одном занятии.',days:[0,2,4],limit:3}
 };
 const clone=x=>JSON.parse(JSON.stringify(x));
 function neutral(text){return String(text).replace(/ягодичн[а-яё]*/gi,'тазовые').replace(/ягодиц[а-яё]*/gi,'мышцы таза');}
 function presentExercise(e){
  const value=clone(e);
  if(e.id==='glute-bridge')value.name='Подъём таза на полу';
  if(e.id==='hip-thrust')value.name='Подъём таза у скамьи со штангой';
  for(const key of ['name','muscles','focus','preparation','equipmentNotes','breathing','easier','tip','stopNote'])if(typeof value[key]==='string')value[key]=neutral(value[key]);
  for(const key of ['steps','mistakes'])if(Array.isArray(value[key]))value[key]=value[key].map(neutral);
  if(HIDDEN.has(e.id))value.autoPlan=false;
  if(e.focus&&/ягод/i.test(e.focus))value.focus='Ноги';
  return value;
 }
 function visible(e){return !HIDDEN.has(e.id);}
 function focusFor(e){return e.focus&&FOCUSES.includes(e.focus)?e.focus:overrides[e.id]||(e.group==='Спина'?'Спина':e.group==='Ноги'?'Ноги':e.group==='Кор'?'Кор':e.group==='Кардио'||e.group==='Подвижность'?'Кардио':'Верх тела');}
 function recommendedMode(profile){return profile.place==='gym'||profile.place==='mixed'?'split3':'homeSplit';}
 function defaultMode(profile){return profile.trainingMode&&MODES[profile.trainingMode]?profile.trainingMode:recommendedMode(profile);}
 function allowed(profile,exercises){return exercises.filter(e=>visible(e)&&e.autoPlan!==false&&(profile.level==='regular'||e.difficulty!=='regular')&&e.equipment.every(k=>profile.equipment.includes(k))&&(profile.place==='mixed'||e.places.includes(profile.place)));}
 function slots(profile,pool){
  const mode=defaultMode(profile);let list;
  if(mode==='split3')list=[{key:'pull',title:'Спина + бицепс',groups:['Спина','Бицепс']},{key:'push',title:'Грудь + трицепс',groups:['Грудь','Трицепс']},profile.fridayMode==='cardio'?{key:'legs',title:'Кардио · отдельный день',groups:['Кардио']}:{key:'legs',title:'Ноги',groups:['Ноги']}];
  if(mode==='ppl')list=[{key:'pull',title:'Тяга · спина и бицепс',groups:['Спина','Бицепс','Предплечья']},{key:'push',title:'Жим · грудь, плечи и трицепс',groups:['Грудь','Плечи','Трицепс']},{key:'legs',title:'Ноги + кор',groups:['Ноги','Кор']}];
  if(mode==='upperLower')list=[{key:'upper-a',title:'Верх A · грудь и спина',groups:['Грудь','Спина','Бицепс','Трицепс']},{key:'lower-a',title:'Низ A · ноги и кор',groups:['Ноги','Кор']},{key:'upper-b',title:'Верх B · спина и плечи',groups:['Спина','Грудь','Плечи','Бицепс']},{key:'lower-b',title:'Низ B · ноги и кор',groups:['Ноги','Кор']}];
  if(mode==='homeSplit'){
   const upper=['Грудь','Спина','Плечи','Бицепс','Трицепс'].filter(g=>pool.some(e=>focusFor(e)===g));
   const fallback=pool.some(e=>focusFor(e)==='Кор')?'Кор':'Кардио';
   list=[{key:'home-upper',title:upper.length?'Верх тела дома':fallback==='Кор'?'Кор · контроль движений':'Спокойная активность',groups:upper.length?upper:[fallback]},{key:'home-legs',title:'Ноги дома',groups:['Ноги']},{key:'home-core',title:profile.goal==='gain'&&pool.some(e=>focusFor(e)==='Кор')?'Кор · контроль движений':'Кор + спокойная активность',groups:profile.goal==='gain'&&pool.some(e=>focusFor(e)==='Кор')?['Кор']:['Кор','Кардио']}];
  }
  if(mode==='fullbody')list=[{key:'full-a',title:'Всё тело · A',groups:['Ноги','Грудь','Спина','Кор']},{key:'full-b',title:'Всё тело · B',groups:['Ноги','Грудь','Спина','Кор']},{key:'full-c',title:'Всё тело · C',groups:['Ноги','Грудь','Спина','Кор']}];
  if(mode==='custom')return [];
  if(Array.isArray(profile.splitOrder)&&profile.splitOrder.length===list.length&&new Set(profile.splitOrder).size===list.length&&profile.splitOrder.every(k=>list.some(s=>s.key===k)))list=profile.splitOrder.map(k=>list.find(s=>s.key===k));
  return list;
 }
 function stress(groups){const out=new Set(groups.filter(g=>g!=='Кардио'));if(out.has('Грудь')){out.add('Плечи');out.add('Трицепс');}if(out.has('Спина')){out.add('Бицепс');out.add('Предплечья');}return out;}
 function conflicts(a,b){if(!a?.length||!b?.length)return true;const x=stress(a);return [...stress(b)].some(g=>x.has(g));}
 const flexible=mode=>['upperLower','custom'].includes(mode);
 function targetFor(profile,list,day,index){if(defaultMode(profile)==='custom'){const groups=(profile.dayTargets?.[day]||[]).filter(g=>FOCUSES.includes(g));return {key:'custom-'+day,title:groups.length?groups.join(' + '):'Выбери мышцы',groups};}return list[index%list.length];}
 function selectedSchedule(profile,pool){
  const mode=defaultMode(profile),list=slots(profile,pool),values=[...new Set(profile.days)].sort((a,b)=>a-b);let best=[];
  for(let mask=1;mask<(1<<values.length);mask++){
   const days=values.filter((_,i)=>mask&(1<<i));if(days.length>MODES[mode].limit)continue;
   const targets=days.map((d,i)=>targetFor(profile,list,d,i));let valid=true;
   for(let i=0;i<days.length;i++)for(let j=i+1;j<days.length;j++)if([1,6].includes(Math.abs(days[i]-days[j]))&&(!flexible(mode)||conflicts(targets[i].groups,targets[j].groups)))valid=false;
   if(valid&&days.length>best.length)best=days;
  }
  return best.map((day,index)=>({day,...targetFor(profile,list,day,index)}));
 }
 function separation(a,b){const stamp=x=>Date.UTC(...x.split('-').map((n,i)=>i===1?Number(n)-1:Number(n)));return Math.abs(stamp(a)-stamp(b))/86400000;}
 function canPlace(date,groups,mode,occupied,id=null){return !occupied.some(s=>s.id!==id&&s.status!=='skipped'&&(s.date===date||(separation(date,s.date)<2&&(!flexible(mode)||!flexible(s.trainingMode)||conflicts(groups,s.focusGroups)))));}
 function choose(pool,groups,count,offset){
  const picked=[],available=groups.filter(g=>pool.some(e=>focusFor(e)===g));
  // Round robin guarantees a represented target before adding another variant.
  for(let round=0;round<count;round++)for(let g=0;g<available.length&&picked.length<count;g++){
   const choices=pool.filter(e=>focusFor(e)===available[g]&&!picked.some(p=>p.id===e.id));
   if(choices.length)picked.push(choices[((offset+round+g)%choices.length+choices.length)%choices.length]);
  }
  return picked;
 }
 const RESISTANCE=new Set(['dumbbell','barbell','ezbar','cable','latmachine','chestpress','legpress','legextension','legcurl','curlmachine','tricepsmachine','pecdeck','highrow','tbar','lyinglegcurl','seatedcalf','standingcalf','smith','hack','landmine']);
 const PRIORITY={
  'Спина':[['lat-pulldown','neutral-lat-pulldown','reverse-grip-lat-pulldown'],['seated-cable-row','chest-supported-row','row','wide-cable-row'],['machine-high-row','t-bar-row']],
  'Бицепс':[['barbell-curl','ez-bar-curl','alternating-dumbbell-curl','biceps'],['dumbbell-hammer-curl','cable-curl','machine-preacher-curl','cross-body-hammer-curl']],
  'Грудь':[['chest-press-machine','dumbbell-bench-press','neutral-grip-dumbbell-press'],['dumbbell-floor-press','pec-deck','cable-chest-fly','low-cable-fly','high-cable-fly']],
  'Трицепс':[['cable-triceps-pushdown','single-arm-cable-pushdown'],['dumbbell-triceps-extension','machine-triceps-extension','dumbbell-floor-triceps-extension']],
  'Ноги':[['leg-press','dumbbell-goblet-squat','bodyweight-squat'],['dumbbell-rdl','leg-curl','lying-leg-curl'],['leg-extension','split-squat','reverse-lunge'],['seated-calf-raise','standing-machine-calf-raise','calf-raise']]
 };
 function strengthPool(profile,pool,group){const list=pool.filter(e=>focusFor(e)===group),loaded=list.filter(e=>e.equipment.some(k=>RESISTANCE.has(k)));return profile.goal==='gain'&&profile.place!=='home'&&loaded.length?loaded:list;}
 function chooseFor(profile,pool,groups,count,offset){
  if(profile.goal!=='gain')return choose(pool,groups,count,offset);
  const result=[],available=groups.filter(g=>pool.some(e=>focusFor(e)===g));
  for(let gi=0;gi<available.length;gi++){
   const group=available[gi],quota=available.length===2?(gi===0?Math.ceil(count*.6):Math.floor(count*.4)):Math.floor(count/available.length)+(gi<count%available.length?1:0),candidates=strengthPool(profile,pool,group),picked=[];
   for(const pattern of PRIORITY[group]||[]){if(picked.length>=quota)break;const options=pattern.map(id=>candidates.find(e=>e.id===id)).filter(e=>e&&!picked.includes(e));if(options.length)picked.push(options[((offset%options.length)+options.length)%options.length]);}
   const rest=candidates.filter(e=>!picked.includes(e));while(picked.length<quota&&rest.length){const i=((offset+picked.length)%rest.length+rest.length)%rest.length;picked.push(rest.splice(i,1)[0]);}
   result.push(...picked);
  }
  return result;
 }
 function audit(plan,catalog){return (plan?.sessions||[]).filter(s=>s.status!=='skipped').map(s=>({id:s.id,date:s.date,title:s.title,groups:[...new Set(s.blocks.map(b=>focusFor(catalog.find(e=>e.id===b.exerciseId)||{group:''})))],rows:[...new Set(s.blocks.map(b=>focusFor(catalog.find(e=>e.id===b.exerciseId)||{group:''})))].map(group=>({group,sets:s.blocks.filter(b=>focusFor(catalog.find(e=>e.id===b.exerciseId)||{group:''})===group).reduce((a,b)=>a+b.sets,0),done:s.blocks.filter(b=>focusFor(catalog.find(e=>e.id===b.exerciseId)||{group:''})===group).reduce((a,b)=>a+b.done.length,0)}))}));}
 function makePlan(profile,exercises,week,occupied=[],minDate=null,helpers){
  const {addDays}=helpers,mode=defaultMode(profile),pool=allowed(profile,exercises),schedule=selectedSchedule(profile,pool),count=profile.minutes<=20?3:profile.minutes<=30?4:profile.minutes<=45?5:6;
  if(!pool.length)throw new Error('Нет доступных движений. Проверь место, опыт и оборудование.');
  const variation=Math.floor(Date.UTC(...week.split('-').map((n,i)=>i===1?Number(n)-1:Number(n)))/604800000),sessions=[],warnings=[];
  for(let index=0;index<schedule.length;index++){
   const slot=schedule[index],date=addDays(week,slot.day);if(minDate&&date<minDate)continue;
   if(!slot.groups.length)throw new Error('В своём сплите выбери мышцы для каждого отмеченного дня.');
   if(!canPlace(date,slot.groups,mode,occupied))continue;
   const represented=slot.groups.filter(g=>pool.some(e=>focusFor(e)===g)).length;
   const picked=chooseFor(profile,pool,slot.groups,Math.max(count,represented),variation+index*7),actual=slot.groups.filter(g=>picked.some(e=>focusFor(e)===g)),missing=slot.groups.filter(g=>!actual.includes(g));
   if(!picked.length)throw new Error(`Для дня «${slot.title}» нет доступных упражнений. Измени оборудование, опыт или схему сплита.`);
   const title=missing.length?actual.join(' + ')+' · доступная часть':slot.title;
   if(missing.length)warnings.push(`${slot.title}: пока нет доступных движений на ${missing.join(', ')}.`);
   sessions.push({id:`${week}-${mode}-${slot.day}`,date,title,minutes:profile.minutes,status:'planned',trainingVersion:7,trainingMode:mode,splitSlot:slot.key,focusGroups:actual,targetGroups:slot.groups,missingGroups:missing,blocks:picked.map(e=>({exerciseId:e.id,sets:profile.goal==='gain'&&focusFor(e)!=='Кардио'?(profile.level==='regular'?3:2):(profile.level==='regular'?2:1),reps:e.reps,done:[],reason:focusFor(e)==='Кардио'?'Кардио входит в выбранную схему.':`Цель: ${profile.goal==='gain'?'набор мышц':profile.goal==='lose'?'снижение веса':'поддержание формы'}. Акцент дня: ${slot.groups.join(' + ')}. ${e.equipment.length?'Используется отмеченный инвентарь.':'Вариант без инвентаря.'} Уровень: ${profile.level==='regular'?'регулярные занятия':'начальный'}.` })),completedAt:null});
  }
  if(!sessions.length)throw new Error('На выбранной неделе нет свободных подходящих дней. Выбери другую неделю или измени дни.');
  const unused=profile.days.filter(d=>!schedule.some(s=>s.day===d));if(unused.length)warnings.push('Часть отмеченных дней оставлена для отдыха: '+unused.map(d=>['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][d]).join(', ')+'.');
  return {week,trainingMode:mode,sessions,warnings,createdAt:new Date().toISOString()};
 }
 function isGenerated(s,week){if(!s.id.startsWith(week+'-'))return false;const tail=s.id.slice(week.length+1);return /^\d{1,2}$/.test(tail)||/^(split3|ppl|upperLower|homeSplit|custom|fullbody)-[0-6](?:-r[1-9]\d*)?$/.test(tail);}
 function isProtected(s,week,minDate){return s.status!=='planned'||s.date<(minDate||week)||s.blocks.some(b=>b.done.length)||(s.activeSeconds||0)>0||Boolean(s.startedAt)||Boolean(s.manual)||!isGenerated(s,week);}
 function rebuild(profile,exercises,week,existing,occupied=[],minDate=null,helpers){
  const kept=(existing?.sessions||[]).filter(s=>isProtected(s,week,minDate)).map(clone);let generated;
  try{generated=makePlan(profile,exercises,week,occupied.concat(kept),minDate,helpers);}catch(error){if(!kept.length||kept.length!==(existing?.sessions.length||0)||!error.message.startsWith('На выбранной неделе'))throw error;generated={week,sessions:[],trainingMode:defaultMode(profile),warnings:[error.message],createdAt:new Date().toISOString()};}
  const ids=new Set(kept.map(s=>s.id));for(const s of generated.sessions){let base=s.id,n=1;while(ids.has(s.id))s.id=base+'-r'+n++;ids.add(s.id);}
  const replaced=(existing?.sessions.length||0)-kept.length;
  return {...generated,sessions:kept.concat(generated.sessions).sort((a,b)=>a.date.localeCompare(b.date)),protectedCount:kept.length,replacedCount:replaced};
 }
 function profileValid(p){return (p.fridayMode===undefined||['legs','cardio'].includes(p.fridayMode))&&(p.trainingMode===undefined||Object.hasOwn(MODES,p.trainingMode))&&(p.splitOrder===undefined||(Array.isArray(p.splitOrder)&&p.splitOrder.length<=5&&new Set(p.splitOrder).size===p.splitOrder.length&&p.splitOrder.every(k=>typeof k==='string'&&k.length<40)))&&(p.dayTargets===undefined||(p.dayTargets&&typeof p.dayTargets==='object'&&!Array.isArray(p.dayTargets)&&Object.entries(p.dayTargets).every(([d,groups])=>/^[0-6]$/.test(d)&&Array.isArray(groups)&&groups.length>=1&&groups.length<=4&&new Set(groups).size===groups.length&&groups.every(g=>FOCUSES.includes(g)))));}
 const value={MODES,FOCUSES,presentExercise,visible,focusFor,defaultMode,recommendedMode,allowed,slots,chooseFor,audit,stress,conflicts,selectedSchedule,canPlace,makePlan,rebuild,isProtected,profileValid};root.FLTraining=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
