(function(root){
 'use strict';
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const parse=s=>new Date(s+'T12:00:00');
 const add=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
 const index=(start,date)=>Math.round((Date.UTC(...date.split('-').map((n,i)=>+n-(i===1?1:0)))-Date.UTC(...start.split('-').map((n,i)=>+n-(i===1?1:0))))/86400000);
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(parse(s))&&iso(parse(s))===s;
 const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
 const text=(s,max)=>typeof s==='string'&&s.length<=max;
 const id=s=>text(s,90)&&s.trim().length>0;
 const time=s=>s===''||typeof s==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s);
 const days=a=>Array.isArray(a)&&a.length>0&&a.length<=7&&new Set(a).size===a.length&&a.every(d=>Number.isInteger(d)&&d>=0&&d<7);
 const colors=['lime','cyan','violet','orange','rose'];
 const all=[0,1,2,3,4,5,6];
 const presets=[
  {id:'wake',title:'Встать в 07:00',time:'07:00',minutes:0,kind:'manual',icon:'sun',color:'orange',days:all,mini:'Подняться в выбранное время без спешки'},
  {id:'walk',title:'Прогулка или лёгкий бег',time:'08:00',minutes:20,kind:'move',icon:'path',color:'cyan',days:[1,3,5],mini:'10 минут спокойной прогулки'},
  {id:'gym',title:'Тренировка дома или в зале',time:'18:00',minutes:30,kind:'workout',icon:'dumbbell',color:'lime',days:[0,2,4],mini:'Разобрать технику одного движения без нагрузки'},
  {id:'food',title:'Записать питание',time:'19:00',minutes:5,kind:'nutrition',icon:'food',color:'rose',days:all,mini:'Добавить хотя бы одну запись в дневник'},
  {id:'study',title:'Время без отвлечений',time:'16:00',minutes:25,kind:'manual',icon:'book',color:'violet',days:[0,1,2,3,4],mini:'10 минут одного выбранного дела'},
  {id:'sleep',title:'Подготовиться ко сну',time:'22:30',minutes:10,kind:'manual',icon:'moon',color:'violet',days:all,mini:'Убрать телефон и подготовить вещи на завтра'}
 ];
 const templates={balance:{title:'Мой ритм',description:'Подъём, движение, питание и восстановление',ids:['wake','walk','gym','food','sleep']},student:{title:'Ритм студента',description:'Учёба, движение и место для отдыха',ids:['wake','study','gym','food','sleep']},custom:{title:'Свои 30 дней',description:'Начни с одной привычки и добавляй свои',ids:['wake']}};
 function make(start,title,template,selected,uid,workoutDays){
  if(!validDate(start)||!text(title,80)||!title.trim()||!templates[template]||!Array.isArray(selected)||selected.length<1||selected.length>12)throw Error('Проверь название, дату и выбранные привычки.');
  const allowed=presets.filter(p=>selected.includes(p.id));if(allowed.length!==selected.length)throw Error('Выбери привычки из списка.');
  const challenge={id:uid('cycle'),title:title.trim(),start,createdAt:new Date().toISOString(),habits:allowed.map(p=>({...p,id:uid('habit'),days:p.kind==='workout'&&days(workoutDays)?[...workoutDays]:[...p.days],activeFrom:0})),logs:{}};
  if(!validate(challenge))throw Error('Не удалось создать трекер.');return challenge;
 }
 function due(c,h,date){const n=index(c.start,date);return n>=0&&n<30&&n>=(h.activeFrom||0)&&(h.archivedFrom===undefined||n<h.archivedFrom)&&h.days.includes((parse(date).getDay()+6)%7);}
 function status(c,h,date,facts={}){
  if(!due(c,h,date))return {scheduled:false,done:false,mode:null,auto:false,rest:false};
  const log=c.logs[date]||{},mark=log.checks?.[h.id];
  const auto=h.kind==='workout'&&facts.workout===true||h.kind==='nutrition'&&facts.nutrition===true;
  if(log.mode==='rest'&&['move','workout'].includes(h.kind)&&!auto&&!mark)return {scheduled:true,done:false,mode:null,auto:false,rest:true};
  return {scheduled:true,done:auto||mark==='full'||mark==='mini',mode:auto?'full':mark||null,auto,rest:false};
 }
 function day(c,date,facts={}){
  const rows=c.habits.filter(h=>due(c,h,date)).map(h=>({habit:h,...status(c,h,date,facts)}));
  const required=rows.filter(r=>!r.rest),done=required.filter(r=>r.done).length;
  return {rows,total:required.length,done,full:required.filter(r=>r.done&&r.mode==='full').length,mini:required.filter(r=>r.done&&r.mode==='mini').length,percent:required.length?Math.round(done/required.length*100):0};
 }
 function progress(c,today,factsForDate=()=>({})){
  const list=Array.from({length:30},(_,i)=>{const date=add(c.start,i);return {date,index:i,...day(c,date,factsForDate(date)),future:date>today};});
  const elapsed=list.filter(d=>!d.future);const total=elapsed.reduce((n,d)=>n+d.total,0),done=elapsed.reduce((n,d)=>n+d.done,0);
  return {days:list,total,done,percent:total?Math.round(done/total*100):0,full:elapsed.reduce((n,d)=>n+d.full,0),mini:elapsed.reduce((n,d)=>n+d.mini,0),daysMarked:elapsed.filter(d=>d.done>0).length,elapsed:elapsed.length,end:add(c.start,29)};
 }
 function toggle(c,habitId,date,today,facts={}){
  const h=c.habits.find(h=>h.id===habitId);if(!h||!validDate(date)||date>today)return false;
  const st=status(c,h,date,facts);if(!st.scheduled||st.rest||st.auto)return false;
  const log=c.logs[date]||(c.logs[date]={checks:{},mode:'normal',energy:'normal',note:''});if(!log.checks)log.checks={};
  if(log.checks[habitId])delete log.checks[habitId];else log.checks[habitId]=log.mode==='light'&&h.mini?'mini':'full';return true;
 }
 function validate(c){
  if(!record(c)||!id(c.id)||!text(c.title,80)||!c.title.trim()||!validDate(c.start)||c.start<'2000-01-01'||c.start>'2100-12-01'||!text(c.createdAt,40)||!Number.isFinite(Date.parse(c.createdAt))||!Array.isArray(c.habits)||c.habits.length<1||c.habits.length>12||!record(c.logs)||Object.keys(c.logs).length>30)return false;
  const ids=new Set();
  for(const h of c.habits){if(!record(h)||!id(h.id)||ids.has(h.id)||!text(h.title,90)||!h.title.trim()||!time(h.time)||!Number.isInteger(h.minutes)||h.minutes<0||h.minutes>240||!['manual','move','workout','nutrition'].includes(h.kind)||!text(h.icon,30)||!colors.includes(h.color)||!days(h.days)||!text(h.mini,150)||!Number.isInteger(h.activeFrom)||h.activeFrom<0||h.activeFrom>29||(h.archivedFrom!==undefined&&(!Number.isInteger(h.archivedFrom)||h.archivedFrom<h.activeFrom||h.archivedFrom>30)))return false;ids.add(h.id);}
  for(const [date,log] of Object.entries(c.logs)){if(!validDate(date)||index(c.start,date)<0||index(c.start,date)>29||!record(log)||!record(log.checks)||Object.keys(log.checks).length>12||!['normal','light','rest'].includes(log.mode)||!['low','normal','high'].includes(log.energy)||!text(log.note,700)||!Object.entries(log.checks).every(([id,mark])=>ids.has(id)&&['full','mini'].includes(mark)))return false;}
  return true;
 }
 function validateCollection(challenges,active){return Array.isArray(challenges)&&challenges.length<=12&&challenges.every(validate)&&new Set(challenges.map(c=>c.id)).size===challenges.length&&(active===null||challenges.some(c=>c.id===active));}
 function csv(c,today,factsForDate=()=>({})){
  const safe=v=>{let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
  const rows=[['День','Дата','Привычка','Время','Статус','Режим дня','Заметка']];
  for(let i=0;i<30;i++){const date=add(c.start,i),log=c.logs[date]||{},info=day(c,date,factsForDate(date));for(const r of info.rows)rows.push([i+1,date,r.habit.title,r.habit.time,date>today?'Впереди':r.rest?'Отдых':r.done?(r.mode==='mini'?'Маленький шаг':'Выполнено'):'Без отметки',log.mode||'normal',log.note||'']);}
  return '\ufeff'+rows.map(row=>row.map(safe).join(';')).join('\r\n');
 }
 const value={iso,add,index,validDate,presets,templates,colors,make,due,status,day,progress,toggle,validate,validateCollection,csv};
 root.FLTracker=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
