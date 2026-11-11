(function (root) {
  'use strict';
  // Linked/embedded material remains on its publisher's site. No video or thumbnail is bundled.
  // URLs and the publisher's embedded YouTube IDs were checked on 2026-11-07.
  const checkedAt = '2026-11-07';
  const base = 'https://www.muscleandstrength.com/exercises/';
  const rows = [
    ['dumbbell-bench-press','Жим гантелей лёжа на скамье','dumbbell-bench-press.html','dGqI0Z5ul4k'],
    ['incline-dumbbell-press','Жим гантелей на наклонной скамье','incline-dumbbell-bench-press.html','8nNi8jbbUPE'],
    ['row','Тяга гантели одной рукой с опорой','one-arm-dumbbell-row.html','YZgVEy6cmaY'],
    ['leg-extension','Разгибание ног в тренажёре','leg-extension.html','0fl1RRgJ83I'],
    ['barbell-overhead-press','Жим штанги стоя','military-press.html','j7ULT6dznNc'],
    ['dumbbell-lateral-raise','Подъём гантелей в стороны','dumbbell-lateral-raise.html',null],
    ['dumbbell-hammer-curl','Молотковое сгибание рук','standing-hammer-curl.html',null],
    ['seated-dumbbell-curl','Сгибание гантелей сидя','seated-dumbbell-curl.html',null],
    ['ez-bar-curl','Сгибание рук с EZ-грифом','ez-bar-curl.html',null],
    ['incline-dumbbell-curl','Сгибание гантелей на наклонной скамье','incline-dumbbell-curl.html','UeleXjsE-98'],
    ['barbell-curl','Сгибание рук со штангой стоя','standing-barbell-curl.html',null],
    ['seated-dumbbell-press','Жим гантелей сидя с опорой спины','seated-dumbbell-press.html','FRxZ6wr5bpA'],
    ['dumbbell-front-raise','Подъём гантелей перед собой','dumbbell-front-raise.html',null],
    ['dumbbell-shrug','Шраги с гантелями','dumbbell-shrugs.html','dj2Gm628kas'],
    ['seated-calf-raise','Подъём на носки сидя в тренажёре','seated-calf-raise.html','Yh5TXz99xwY'],
    ['push-up','Отжимание от пола','push-up.html','KEFQyLkDYtI'],
    ['barbell-front-squat','Фронтальный присед со штангой','front-squat.html','9xAkoz95IFE'],
    ['barbell-back-squat','Присед со штангой на спине','squat.html','R2dMsNhN3DE'],
    ['dead-bug','«Мёртвый жук»','dead-bug','eEhoSeBFoBk'],
    ['bird-dog','«Птица-собака»','contralateral-bird-dog','DFdLL82SEiw'],
    ['pallof-press','Жим Палоффа на блоке','pallof-press','SFJprbDnaS0'],
    ['dumbbell-goblet-squat','Гоблет-присед с гантелью','dumbbell-goblet-squat','5Y3KW5rWMh4'],
    ['leg-press','Жим ногами в тренажёре','45-degree-leg-press.html','sEM_zo9w2ss'],
    ['incline-barbell-press','Жим штанги на наклонной скамье','incline-bench-press.html','uIzbJX5EVIY'],
    ['lying-dumbbell-extension','Разгибание гантелей лёжа','lying-dumbbell-extension.html',null],
    ['lying-leg-curl','Сгибание ног лёжа в тренажёре','leg-curl.html',null],
    ['seated-cable-row','Горизонтальная тяга блока сидя','seated-row.html',null],
    ['pec-deck','Сведение рук в тренажёре «Баттерфляй»','pec-dec.html',null],
    ['smith-bench-press','Жим лёжа в машине Смита','smith-machine-bench-press.html',null],
    ['barbell-bent-row','Тяга штанги в наклоне','bent-over-barbell-row.html','paCfxhgW6bI']
  ];
  const items = rows.map(function (r) {
    return {exerciseId:r[0],title:r[1],sourceUrl:base+r[2],provider:r[3]?'youtube':'publisher',videoId:r[3],author:'Muscle & Strength',language:'Английский',checkedAt,match:'exact',provenance:r[3]?'YouTube iframe на странице автора':'Видеоурок Vimeo на странице автора; открывается по ссылке'};
  });
  items.push(
    {exerciseId:'cable-triceps-pushdown',title:'Разгибание рук на верхнем блоке',sourceUrl:'https://www.youtube.com/watch?v=HIKzvHkibWc',provider:'youtube',videoId:'HIKzvHkibWc',author:'Bodybuilding.com',language:'Английский',checkedAt,match:'exact',provenance:'Triceps Pushdown — Tricep Exercise; официальный канал Bodybuilding.com'},
    {exerciseId:'concentration-curl',title:'Концентрированное сгибание гантели',sourceUrl:'https://www.youtube.com/watch?v=ZcU2hN76UyA',provider:'youtube',videoId:'ZcU2hN76UyA',author:'Bodybuilding.com',language:'Английский',checkedAt,match:'exact',provenance:'Concentration Curls — Biceps Exercise; официальный канал Bodybuilding.com'}
  );
  const lessons = [
    {id:'warmup',title:'Подготовка к силовой тренировке',description:'Джо Беннетт объясняет подготовку к рабочим подходам. Это общий урок, а не видео выбранного упражнения.',sourceUrl:'https://www.muscleandstrength.com/videos/how-to-prepare-your-body-for-heavy-workouts',provider:'youtube',videoId:'GdHWLFDxRH8',author:'Muscle & Strength · Joe Bennett'},
    {id:'pushdown-technique',title:'Разбор техники на верхнем блоке',description:'Подсказки по положению тела и движению рук в разгибаниях на блоке.',sourceUrl:'https://cdn.muscleandstrength.com/videos/how-to-perfect-your-tricep-pushdown',provider:'youtube',videoId:'GCa8Q4e7laU',author:'Muscle & Strength'},
    {id:'arms-basics',title:'Разбор упражнений для рук',description:'Чарльз Гласс разбирает упражнения для рук. Подборка для знакомства с техникой; нагрузку из видео повторять не обязательно.',sourceUrl:'https://cdn.muscleandstrength.com/videos/training-fundamentals-charles-glass-arms',provider:'youtube',videoId:'r1AhAlGIRcs',author:'Muscle & Strength · Charles Glass'},
    {id:'overhead-basics',title:'Основы жима штанги стоя',description:'Демонстрация исходного положения и движения штанги над головой. Урок относится именно к жиму стоя.',sourceUrl:base+'military-press.html',provider:'youtube',videoId:'j7ULT6dznNc',author:'Muscle & Strength'}
  ].map(function (l) {return Object.assign(l,{language:'Английский',checkedAt,kind:'general',provenance:'YouTube iframe на странице автора'});});
  items.forEach(Object.freeze);lessons.forEach(Object.freeze);
  const byId = Object.create(null);
  items.forEach(function (v) {byId[v.exerciseId]=v;});
  const value = Object.freeze({items:Object.freeze(items),lessons:Object.freeze(lessons),forExercise:function (id) {return byId[id]||null;},checkedAt});
  root.FLExerciseVideos=value;
  if(typeof module!=='undefined'&&module.exports)module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
