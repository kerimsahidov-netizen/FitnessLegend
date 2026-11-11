(function(root){
 'use strict';
 const Performance=typeof module!=='undefined'?require('./performance.js'):root.FLPerformance;
 const Decisions=typeof module!=='undefined'?require('./decisions.js'):root.FLDecisions;
 const Training=typeof module!=='undefined'?require('./training.js'):root.FLTraining;
 const PlanB=typeof module!=='undefined'?require('./plan-b.js'):root.FLPlanB;
 const Tracker=typeof module!=='undefined'?require('./tracker.js'):root.FLTracker;
 const EQUIP={chair:'Устойчивый стул',wall:'Стена',dumbbell:'Гантели',bench:'Скамья',step:'Степ-платформа',pullup:'Турник',assistedpullup:'Гравитрон',barbell:'Штанга',rack:'Стойки со страховочными упорами',latmachine:'Верхний блок',cable:'Блочный тренажёр',legpress:'Жим ногами',legextension:'Разгибание ног',legcurl:'Сгибание ног',chestpress:'Жим от груди',bike:'Велотренажёр',ezbar:'EZ-гриф',preacher:'Скамья Скотта',curlmachine:'Тренажёр для бицепса',tricepsmachine:'Тренажёр для трицепса',smith:'Машина Смита',pecdeck:'Баттерфляй',tbar:'Т-гриф',highrow:'Рычажная тяга',band:'Эспандер',landmine:'Лэндмайн',hack:'Гакк-тренажёр',seatedcalf:'Подъём на носки сидя',standingcalf:'Подъём на носки стоя',lyinglegcurl:'Сгибание ног лёжа',elliptical:'Эллиптический тренажёр',rower:'Гребной тренажёр'};
 const GENDERS={male:'Мужской',female:'Женский'};
 const illustrationGender=profile=>profile?.gender==='female'?'female':'male';
 const exercisePhotoPath=(id,profile,active=true)=>'exercise-photos/'+(active?'':'archived/')+illustrationGender(profile)+'/'+encodeURIComponent(id)+'.webp';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const parse=s=>new Date(s+'T12:00:00');
 function addDays(s,n){const d=parse(s);d.setDate(d.getDate()+n);return iso(d)}
 function monday(s){const d=parse(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d)}
 function bestDays(days){
   const values=[...new Set(days.map(Number))].filter(n=>Number.isInteger(n)&&n>=0&&n<=6).sort((a,b)=>a-b);
   let best=[];
   for(let mask=1;mask<(1<<values.length);mask++){
     const list=values.filter((_,i)=>mask&(1<<i));
     if(list.length>3||list.some((d,i)=>list.some((v,j)=>j>i&&(Math.abs(v-d)===1||Math.abs(v-d)===6))))continue;
     if(list.length>best.length)best=list;
   }
   return best;
 }
 function allowedExercises(profile,exercises){return Training.allowed(profile,exercises)}
 const distance=(a,b)=>Math.abs((Date.UTC(...a.split('-').map((n,i)=>i===1?Number(n)-1:Number(n)))-Date.UTC(...b.split('-').map((n,i)=>i===1?Number(n)-1:Number(n))))/86400000);
 function makePlan(profile,exercises,week,occupied=[],minDate=null){return Training.makePlan(profile,exercises,week,occupied,minDate,{addDays});}
 function fullPlanWeek(profile,exercises,week,today){const current=monday(today),start=week<current?current:week;return start===current&&Training.selectedSchedule(profile,Training.allowed(profile,exercises)).some(slot=>addDays(start,slot.day)<today)?addDays(start,7):start;}
 function rebuildPlan(profile,exercises,week,existing,occupied=[],minDate=null){return Training.rebuild(profile,exercises,week,existing,occupied,minDate,{addDays});}
 function moveOptions(plan,session,profile,occupied=plan.sessions,minDate=null){
   return Array.from({length:7},(_,i)=>addDays(plan.week,i)).filter(date=>date>session.date&&(!minDate||date>=minDate)&&profile.days.includes((parse(date).getDay()+6)%7)&&Training.canPlace(date,session.focusGroups,session.trainingMode,occupied,session.id));
 }
 function totals(entries){return entries.reduce((a,e)=>{for(const key of ['kcal','p','f','c'])a[key]+=(Number(e[key])||0)*e.grams/100;return a},{kcal:0,p:0,f:0,c:0})}
 function initial(seed){return {version:1,contentPackVersion:seed.contentPackVersion||0,profile:null,plans:{},diary:[],water:{},measurements:[],favorites:[],challenges:[],activeChallengeId:null,targets:{kcal:2200,p:120,f:70,c:270,water:2000},catalog:clone(seed.exercises),foods:clone(seed.foods),articles:clone(seed.articles),role:'captain'}}
 const str=(x,n)=>typeof x==='string'&&x.length<=n;
 const num=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const id=x=>str(x,90)&&x.trim().length>0;
 const date=s=>str(s,10)&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(parse(s))&&iso(parse(s))===s;
 const timestamp=s=>str(s,40)&&date(s.slice(0,10))&&/^\d{4}-\d{2}-\d{2}T/.test(s)&&Number.isFinite(Date.parse(s));
 const https=s=>s===''||/^https:\/\//i.test(s);
 function bodyValidation(profile,required=false){
   if(!profile||typeof profile!=='object')return 'Заполни параметры профиля.';
   if(profile.gender!==undefined&&!Object.hasOwn(GENDERS,profile.gender))return 'Выбери пол: мужской или женский.';
   const fields=[
     ['age','Возраст',18,100,true],
     ['height','Рост',100,250,false],
     ['weight','Вес',25,350,false],
     ['targetWeight','Целевой вес',25,350,false],
   ];
   for(const [key,label,min,max,integer] of fields){
     const value=profile[key];
     if(value===null||value===undefined){
       if(required&&key!=='targetWeight')return `Укажи ${label.toLocaleLowerCase('ru')}.`;
       continue;
     }
     if(!num(value,min,max)||(integer&&!Number.isInteger(value)))return `${label}: укажи ${integer?'целое число':'число'} от ${min} до ${max}.`;
   }
   return '';
 }
 function validateState(s){
   if(s?.plannerRevision!==undefined&&(!Number.isInteger(s.plannerRevision)||s.plannerRevision<0||s.plannerRevision>999))return false;
   if(s?.plannerUpgradeNotice!==undefined&&!str(s.plannerUpgradeNotice,1000))return false;
   if(s?.challenges!==undefined&&!Tracker?.validateCollection(s.challenges,s.activeChallengeId??null))return false;
   if(!record(s)||s.version!==1||!Array.isArray(s.catalog)||!Array.isArray(s.foods)||!Array.isArray(s.articles)||!Array.isArray(s.diary)||!Array.isArray(s.measurements)||!record(s.targets)||!record(s.plans)||!record(s.water)||(s.profile!==null&&!record(s.profile)))return false;
   if(s.catalog.length>1000||s.foods.length>1000||s.diary.length>10000||s.articles.length>100||s.measurements.length>10000||Object.keys(s.plans).length>200||Object.keys(s.water).length>10000)return false;
   const unique=a=>a.every(x=>record(x)&&id(x.id))&&new Set(a.map(x=>x.id)).size===a.length;
   if(![s.catalog,s.foods,s.articles,s.diary].every(unique))return false;
   const eq=Object.keys(EQUIP);
   if(!s.catalog.every(e=>str(e.name,100)&&str(e.group,40)&&['squat','push','stand','leg','curl','sit','walk','row'].includes(e.kind)&&str(e.reps,50)&&Array.isArray(e.equipment)&&e.equipment.every(x=>eq.includes(x))&&Array.isArray(e.places)&&e.places.length>0&&e.places.every(p=>['home','gym'].includes(p))&&Array.isArray(e.steps)&&e.steps.length>0&&e.steps.length<=8&&e.steps.every(t=>str(t,1000))&&str(e.tip,1000)&&str(e.source,500)&&https(e.source)))return false;
   if(!s.catalog.every(e=>['preparation','equipmentNotes','breathing','easier','stopNote'].every(key=>e[key]===undefined||str(e[key],1500))&&(e.mistakes===undefined||(Array.isArray(e.mistakes)&&e.mistakes.length<=8&&e.mistakes.every(t=>str(t,500))))))return false;
   if(s.contentPackVersion!==undefined&&!num(s.contentPackVersion,0,999))return false;
   if(s.contentPackSkipped!==undefined&&(!Number.isInteger(s.contentPackSkipped)||!num(s.contentPackSkipped,0,1000)))return false;
   if(!s.catalog.every(e=>(e.difficulty===undefined||['beginner','regular'].includes(e.difficulty))&&(e.autoPlan===undefined||typeof e.autoPlan==='boolean')&&(e.muscles===undefined||str(e.muscles,300))&&(e.focus===undefined||str(e.focus,40))))return false;
   if(!s.foods.every(f=>str(f.id,90)&&str(f.name,100)&&str(f.category,100)&&str(f.kind,30)&&str(f.source,500)&&['kcal','p','f','c','price'].every(k=>num(f[k],0,k==='kcal'?1000:k==='price'?10000:100))))return false;
   if(!s.diary.every(e=>str(e.id,90)&&str(e.name,100)&&date(e.date)&&['breakfast','lunch','dinner','snack'].includes(e.meal)&&num(e.grams,0.1,5000)&&['kcal','p','f','c'].every(k=>num(e[k],0,k==='kcal'?1000:100))))return false;
   if(!s.articles.every(a=>str(a.id,90)&&str(a.title,160)&&str(a.category,60)&&str(a.lead,500)&&num(a.time,1,60)&&str(a.kind,30)&&Array.isArray(a.body)&&a.body.length<=30&&a.body.every(t=>str(t,4000))&&str(a.source,500)&&https(a.source)))return false;
   if(!['captain','editor','visitor'].includes(s.role))return false;
   const t=s.targets;if(!num(t.kcal,1000,6000)||!['p','f','c'].every(k=>num(t[k],10,700))||!num(t.water,250,5000))return false;
   if(!s.measurements.every(m=>record(m)&&date(m.date)&&num(m.weight,25,350)&&str(m.note,500))||new Set(s.measurements.map(m=>m.date)).size!==s.measurements.length)return false;
   if(!Object.entries(s.water).every(([d,v])=>date(d)&&num(v,0,10000)))return false;
   if(s.profile){const p=s.profile;if(!str(p.name,60)||!['maintain','lose','gain'].includes(p.goal)||!['beginner','return','regular'].includes(p.level)||!['home','gym','mixed'].includes(p.place)||!Array.isArray(p.equipment)||!p.equipment.every(e=>eq.includes(e))||!Array.isArray(p.days)||!p.days.length||p.days.length>7||new Set(p.days).size!==p.days.length||!p.days.every(n=>Number.isInteger(n)&&n>=0&&n<=6)||!num(p.minutes,15,60)||!num(p.budget,0,5000)||bodyValidation(p)||!Training.profileValid(p))return false;}
   const ids=new Set(s.catalog.map(e=>e.id));
   if(s.favorites!==undefined&&(!Array.isArray(s.favorites)||s.favorites.length>s.catalog.length||new Set(s.favorites).size!==s.favorites.length||!s.favorites.every(id=>ids.has(id))))return false;
   const sessionIds=new Set();
   for(const [week,p] of Object.entries(s.plans)){
    if(!date(week)||!record(p)||p.week!==week||!Array.isArray(p.sessions)||p.sessions.length>7)return false;
    for(const w of p.sessions){if(!record(w)||!id(w.id)||sessionIds.has(w.id)||!date(w.date)||w.date<week||w.date>addDays(week,6)||!str(w.title,100)||!num(w.minutes,1,120)||!['planned','done','missed','skipped'].includes(w.status)||!Array.isArray(w.blocks)||!w.blocks.length||w.blocks.length>20)return false;
     if(w.trainingMode!==undefined&&!Object.hasOwn(Training.MODES,w.trainingMode))return false;
     for(const k of ['focusGroups','targetGroups','missingGroups'])if(w[k]!==undefined&&(!Array.isArray(w[k])||w[k].length>10||new Set(w[k]).size!==w[k].length||!w[k].every(g=>Training.FOCUSES.includes(g))))return false;
     if(w.manual!==undefined&&typeof w.manual!=='boolean')return false;
     if(!PlanB.validateSession(w,s.catalog)||!Decisions.validate(w))return false;
     sessionIds.add(w.id);
     if((w.startedAt!==undefined&&!num(w.startedAt,0,8640000000000000))||(w.actualMinutes!==undefined&&!num(w.actualMinutes,0,Number.MAX_SAFE_INTEGER))||(w.activeSeconds!==undefined&&!num(w.activeSeconds,0,31536000))||(w.completedAt!==undefined&&w.completedAt!==null&&!timestamp(w.completedAt)))return false;
     if(!w.blocks.every(b=>record(b)&&Performance.validateBlock(b)&&ids.has(b.exerciseId)&&Number.isInteger(b.sets)&&b.sets>=1&&b.sets<=5&&str(b.reps,50)&&(b.reason===undefined||str(b.reason,1000))&&Array.isArray(b.done)&&new Set(b.done).size===b.done.length&&b.done.every(n=>Number.isInteger(n)&&n>=0&&n<b.sets)))return false;
    }
   }
   return true;
 }
 function validate(s){try{return validateState(s);}catch{return false;}}
 root.FLEngine={EQUIP,GENDERS,illustrationGender,exercisePhotoPath,clone,iso,parse,addDays,monday,bestDays,allowedExercises,makePlan,fullPlanWeek,rebuildPlan,training:Training,moveOptions,totals,initial,validate,bodyValidation};
 if(typeof module!=='undefined')module.exports=root.FLEngine;
})(typeof window!=='undefined'?window:globalThis);
