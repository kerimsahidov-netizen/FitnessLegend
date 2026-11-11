(function (root) {
  'use strict';
  const strength = 'https://www.nhs.uk/live-well/exercise/strength-exercises/';
  const sitting = 'https://www.nhs.uk/live-well/exercise/sitting-exercises/';
  const row = 'https://health.clevelandclinic.org/dumbbell-rows';
  const stopNote = 'Остановись при боли, головокружении или необычной одышке. Не продолжай через ухудшение самочувствия.';
  const exercises = [
    {
      id:'chair-squat',name:'Подъём со стула',group:'Ноги',equipment:['chair'],places:['home','gym'],kind:'squat',reps:'5–8',
      preparation:'Сядь ближе к переднему краю стула, обе стопы поставь на пол.',
      equipmentNotes:'Устойчивый стул без колёс, нескользкий пол. При необходимости придвинь стул к стене.',
      steps:['Поставь стопы чуть позади коленей, корпус немного наклони вперёд.','Опираясь на стопы, плавно поднимись и выпрямись.','Отведи таз назад и подконтрольно вернись на сиденье.'],
      breathing:'Дыши свободно, не задерживай дыхание при подъёме.',
      mistakes:['Падать на сиденье.','Отталкиваться рывком и терять равновесие.'],
      easier:'Помоги себе руками; уменьши количество повторений.',tip:'Стул должен оставаться неподвижным.',stopNote,
      source:'https://www.kingstonandrichmond.nhs.uk/patients-and-families/patient-leaflets/home-exercise-programme-falls-prevention'
    },
    {
      id:'mini-squat',name:'Приседание с опорой',group:'Ноги',equipment:['chair'],places:['home','gym'],kind:'squat',reps:'5–8',
      preparation:'Встань за устойчивым стулом, стопы на ширине таза.',
      equipmentNotes:'Неподвижная спинка стула для поддержки, свободное место вокруг.',
      steps:['Положи руки на опору, взгляд направь вперёд.','Немного согни колени, сохраняя пятки на полу и спину ровной.','Медленно выпрямись, без резкого толчка.'],
      breathing:'Дыши спокойно в течение всего движения.',mistakes:['Отрывать пятки.','Приседать глубже комфортной амплитуды.'],
      easier:'Сгибай колени совсем немного и держись двумя руками.',tip:'Глубина не важнее контроля движения.',stopNote,source:strength
    },
    {
      id:'wall-push',name:'Отжимание от стены',group:'Верх тела',equipment:['wall'],places:['home','gym'],kind:'push',reps:'5–10',
      preparation:'Встань лицом к стене примерно на расстоянии вытянутых рук.',
      equipmentNotes:'Прочная свободная стена, нескользкая поверхность под ногами.',
      steps:['Поставь ладони на стену на уровне плеч, стопы устойчиво.','Согни локти и плавно приблизь грудь к стене.','Выпрями руки и верни корпус в исходное положение.'],
      breathing:'Не задерживай дыхание; двигайся в спокойном ритме.',
      mistakes:['Провисать в пояснице.','Вытягивать голову вперёд вместо движения корпуса.'],
      easier:'Встань ближе к стене и сократи движение.',tip:'Корпус остаётся ровным, плечи не поднимай к ушам.',stopNote,
      source:'https://www.southtees.nhs.uk/resources/combined-press-ups/'
    },
    {
      id:'calf-raise',name:'Подъём на носки',group:'Ноги',equipment:[],places:['home','gym'],kind:'stand',reps:'5–10',
      preparation:'Встань ровно, стопы примерно на ширине таза.',
      equipmentNotes:'Инвентарь не обязателен. При неустойчивости нужна неподвижная опора для рук.',
      steps:['При необходимости придерживайся за столешницу или спинку стула.','Плавно подними пятки, оставаясь на передней части стоп.','Так же плавно верни пятки на пол.'],
      breathing:'Дыши свободно, не напрягай дыхание.',mistakes:['Раскачиваться вперёд и назад.','Резко опускать пятки.'],
      easier:'Сделай то же движение сидя, стопы на полу.',tip:'Двигайся медленно; устойчивость важнее высоты подъёма.',stopNote,
      source:'https://www.esht.nhs.uk/wp-content/uploads/2026/04/My-keep-active-handbook.pdf'
    },
    {
      id:'side-leg',name:'Отведение ноги в сторону',group:'Ноги',equipment:['chair'],places:['home','gym'],kind:'leg',reps:'5 на сторону',
      preparation:'Встань лицом к опоре, держи корпус вертикально.',
      equipmentNotes:'Устойчивый стул или неподвижная поверхность на удобной высоте.',
      steps:['Перенеси опору на одну ногу, держись рукой.','Отведи другую ногу в сторону, не наклоняя корпус.','Верни стопу и повтори другой ногой.'],
      breathing:'Дыши ровно, без задержки.',mistakes:['Наклонять корпус в сторону.','Размахивать ногой.'],
      easier:'Вместо подъёма сделай короткий шаг в сторону.',tip:'Обе руки можно держать на опоре.',stopNote,
      source:'https://www.nth.nhs.uk/resources/standing-exercises/'
    },
    {
      id:'back-leg',name:'Отведение ноги назад',group:'Ноги',equipment:['chair'],places:['home','gym'],kind:'leg',reps:'5 на сторону',
      preparation:'Встань лицом к опоре, ноги рядом.',
      equipmentNotes:'Устойчивая спинка стула; за спиной должно быть свободно.',
      steps:['Придерживайся за опору и выпрямись.','Отведи одну ногу немного назад, сохраняя корпус неподвижным.','Верни стопу и смени ногу.'],
      breathing:'Продолжай спокойно дышать.',mistakes:['Прогибать поясницу.','Наклоняться вперёд ради высоты подъёма.'],
      easier:'Скользни стопой назад или сделай маленький шаг.',tip:'Амплитуда небольшая; не добивайся высоты.',stopNote,
      source:'https://www.nth.nhs.uk/resources/standing-exercises/'
    },
    {
      id:'biceps',name:'Сгибание рук с гантелями',group:'Верх тела',equipment:['dumbbell'],places:['home','gym'],kind:'curl',reps:'5–8',
      preparation:'Встань устойчиво, руки с лёгкими гантелями опусти вдоль тела.',
      equipmentNotes:'Пара лёгких гантелей с надёжным хватом, свободное место для рук.',
      steps:['Держи локти возле туловища, плечи расслабь.','Плавно согни руки, приближая гантели к плечам.','Медленно опусти руки, не бросая вес вниз.'],
      breathing:'Дыши свободно, не задерживай дыхание.',mistakes:['Помогать движением спины.','Подбирать вес, вызывающий раскачивание.'],
      easier:'Возьми более лёгкий вес или отработай движение без него.',tip:'Сначала контроль, затем дополнительный вес.',stopNote,source:strength
    },
    {
      id:'seated-march',name:'Подъём коленей сидя',group:'Подвижность',equipment:['chair'],places:['home','gym'],kind:'sit',reps:'5 на сторону',
      preparation:'Сядь прямо, не облокачиваясь на спинку.',
      equipmentNotes:'Устойчивый стул без колёс; обе стопы достают до пола.',
      steps:['Придерживайся за края сиденья.','Подними одно согнутое колено на комфортную высоту.','Поставь стопу на пол и повтори другой ногой.'],
      breathing:'Не задерживай дыхание.',mistakes:['Отклонять корпус назад.','Бросать стопу на пол.'],
      easier:'Поднимай стопу всего на несколько сантиметров.',tip:'Важнее спокойный контроль, а не высота колена.',stopNote,source:sitting
    },
    {
      id:'seated-ankle',name:'Движение стопами сидя',group:'Подвижность',equipment:['chair'],places:['home','gym'],kind:'sit',reps:'5 на сторону',
      preparation:'Сядь прямо и придерживайся за край стула.',
      equipmentNotes:'Устойчивый стул; достаточно места вытянуть ногу перед собой.',
      steps:['Выпрями одну ногу, удерживая стопу над полом.','Направь носок от себя, затем плавно потяни к себе.','Верни ногу на пол и смени сторону.'],
      breathing:'Дыши ровно.',mistakes:['Двигать стопой рывками.','Выпрямлять колено через боль.'],
      easier:'Сократи движение стопы и ненадолго опускай ногу.',tip:'Движение остаётся комфортным.',stopNote,source:sitting
    },
    {
      id:'walk',name:'Спокойная ходьба',group:'Подвижность',equipment:[],places:['home','gym'],kind:'walk',reps:'2 минуты',
      preparation:'Выбери ровный свободный маршрут, без скользких участков.',
      equipmentNotes:'Удобная обувь. Спортивные снаряды не нужны; дорожку используй только если умеешь ею управлять.',
      steps:['Начни с привычного спокойного темпа.','Смотри вперёд и двигай руками естественно.','Держи темп, в котором можешь свободно разговаривать.','Перед остановкой плавно замедлись.'],
      breathing:'Дыши естественно, без попытки задать жёсткий ритм.',mistakes:['Ускоряться через дискомфорт.','Смотреть в телефон на ходу.'],
      easier:'Сократи время или пройди более короткий участок.',tip:'Две минуты — учебный пример, не обязательный минимум.',stopNote,
      source:'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html'
    },
    {
      id:'row',name:'Тяга гантели с опорой',group:'Спина',equipment:['dumbbell','bench'],places:['gym','home'],kind:'row',reps:'5–8 на сторону',
      preparation:'Поставь скамью устойчиво; выбери лёгкую гантель.',
      equipmentNotes:'Неподвижная тренировочная скамья и гантель. Не заменяй скамью шаткой мебелью.',
      steps:['Наклонись и обопрись одной рукой на скамью, спину держи ровной.','Другой рукой подтяни гантель к боку, направляя локоть назад.','Не разворачивая корпус, подконтрольно опусти вес.','Закончив сторону, безопасно положи гантель и смени руку.'],
      breathing:'Выдыхай при тяге, вдыхай при опускании; не задерживай дыхание.',
      mistakes:['Скручивать корпус вслед за гантелью.','Закидывать голову или дёргать вес.'],
      easier:'Уменьши вес; первый раз разбери движение с тренером.',tip:'Поднимается рука, а корпус остаётся стабильным.',stopNote,source:row
    },
  ].map(exercise=>({...exercise,contentRevision:2}));
  // Учебные справочные примеры на 100 г. Не выгрузка USDA и не точные данные конкретного бренда.
  const foods=[
    ['oats','Овсяные хлопья, сухие','Крупы',370,13,7,62,12,'grain'],
    ['rice','Рис, варёный','Крупы',130,2.7,0.3,28,8,'grain'],
    ['buckwheat','Гречка, варёная','Крупы',110,4,1.1,21,10,'grain'],
    ['chicken','Куриная грудка, готовая','Белковые продукты',165,31,3.6,0,55,'protein'],
    ['egg','Яйцо, варёное','Белковые продукты',155,13,11,1.1,25,'protein'],
    ['cottage','Творог 5%','Белковые продукты',121,17,5,1.8,45,'protein'],
    ['lentils','Чечевица, варёная','Белковые продукты',116,9,0.4,20,15,'protein'],
    ['yogurt','Йогурт натуральный','Молочные продукты',65,4,3.2,5,25,'dairy'],
    ['milk','Молоко 2,5%','Молочные продукты',52,3,2.5,4.7,10,'dairy'],
    ['banana','Банан','Фрукты',89,1.1,0.3,23,18,'fruit'],
    ['apple','Яблоко','Фрукты',52,0.3,0.2,14,15,'fruit'],
    ['orange','Апельсин','Фрукты',47,0.9,0.1,12,16,'fruit'],
    ['tomato','Помидор','Овощи',18,0.9,0.2,3.9,22,'veg'],
    ['cucumber','Огурец','Овощи',15,0.7,0.1,3.6,18,'veg'],
    ['carrot','Морковь','Овощи',41,0.9,0.2,10,7,'veg'],
    ['potato','Картофель, варёный','Овощи',87,1.9,0.1,20,6,'veg'],
    ['oil','Масло оливковое','Жиры',884,0,100,0,95,'fat'],
    ['nuts','Грецкий орех','Жиры',654,15,65,14,100,'fat'],
  ].map(([id,name,category,kcal,p,f,c,price,kind])=>({id,name,category,kcal,p,f,c,price,kind,source:'Учебное значение. Уточни по этикетке своего продукта.'}));
  const articles=[
    {id:'start',category:'ПРИВЫЧКИ',title:'Начни с недели, которую реально повторить',time:3,kind:'path',lead:'Не идеальная программа. Понятный следующий шаг.',body:['Выбери дни, которые действительно свободны. Оставь небольшой запас времени: дорога, учёба и бытовые дела тоже часть расписания.','CDC рекомендует взрослым сочетать аэробную активность и упражнения для мышц. Это общий ориентир, а не персональная программа. Начало с небольшой посильной активности тоже имеет смысл.','В FitnessLegend начни с анкеты, изучи карточки и отметь первое выполненное занятие. Потом оцени, удобен ли выбранный ритм.'],source:'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html'},
    {id:'missed',category:'ТРЕНИРОВКИ',title:'Пропуск — повод перестроить неделю',time:2,kind:'calendar',lead:'Продолжай с подходящего дня, без наказания нагрузкой.',body:['Если занятие не состоялось, не нужно превращать следующее в двойное. NIDDK советует оставлять хотя бы день отдыха перед повторной работой тех же мышц.','В планировщике можно выбрать сплит и разные мышцы по дням. Он оставляет интервал перед повторной работой тех же групп. Открой пропущенное занятие и посмотри возможные даты.','Если свободных дат больше нет, можно убрать занятие из недели и продолжить со следующего плана. Это лучше, чем обещать невозможное.'],source:'https://www.niddk.nih.gov/health-information/weight-management/healthy-eating-physical-activity-for-life/health-tips-for-adults'},
    {id:'food',category:'ПИТАНИЕ',title:'КБЖУ начинается с размера порции',time:3,kind:'food',lead:'Одна понятная запись полезнее сложного расчёта на глаз.',body:['Сначала проверь, для какого состояния продукта указаны значения: сухая крупа и готовая каша содержат разное количество воды.','Для порции умножь показатель на 100 г на массу порции и раздели на 100. Например, 60 г хлопьев с 370 ккал на 100 г — это 222 ккал. Добавки учитываются отдельно.','FoodData Central различает данные исследований и сведения с этикеток производителей. Наш стартовый каталог — учебные примеры, не выгрузка этой базы. Для своих продуктов перепиши цифры с упаковки.','Калорийность и цели в демоверсии задаются вручную. Приложение не назначает дефицит калорий и лечебное питание.'],source:'https://fdc.nal.usda.gov/data-documentation/'},
    {id:'respect',category:'СООБЩЕСТВО',title:'Прогресс без сравнений и давления',time:2,kind:'heart',lead:'У каждого свой ритм и свои обстоятельства.',body:['Истории реальных людей появятся только с разрешения авторов. Сейчас в приложении нет вымышленных отзывов и фотографий «до и после».','Мат, оскорбления, непристойности и унижение внешности недопустимы. Открытого чата в первой версии нет: сначала нам нужен понятный порядок модерации.','Личные измерения не публикуются автоматически. График в твоём кабинете строится только по тем записям, которые ты добавишь сам.'],source:''},
  ];
  const extra=typeof module!=='undefined'?require('./exercise-expansion.js'):root.FLExerciseExpansion;
  const nutrition=typeof module!=='undefined'?require('./nutrition-expansion.js'):root.FLNutritionExpansion;
  const pack5=typeof module!=='undefined'?require('./exercise-pack-v5.js'):root.FLExercisePackV5;
  const tracker=typeof module!=='undefined'?require('./tracker.js'):root.FLTracker;
  const trackerUI=typeof module!=='undefined'?require('./tracker-ui.js'):root.FLTrackerUI;
  const training=typeof module!=='undefined'?require('./training.js'):root.FLTraining;
  const pack6a=typeof module!=='undefined'?require('./exercise-pack-v6-a.js'):root.FLExercisePackV6A;
  const pack6b=typeof module!=='undefined'?require('./exercise-pack-v6-b.js'):root.FLExercisePackV6B;
  const pack6c=typeof module!=='undefined'?require('./exercise-pack-v6-c.js'):root.FLExercisePackV6C;
  const pack6=pack6a.exercises.concat(pack6b.exercises,pack6c.exercises);
  const all=exercises.concat(extra.exercises,pack5.exercises,pack6).map(training.presentExercise);
  const value={exercises:all,foods:foods.concat(nutrition.foods),articles,version:1,newExercises:extra.exercises.concat(pack5.exercises,pack6).map(training.presentExercise),newFoods:nutrition.foods,recipes:nutrition.recipes,recipeData:nutrition.calculate,foodSafetySource:nutrition.safetySource,contentPackVersion:6,training,focusFor:training.focusFor,presentExercise:training.presentExercise,visibleExercise:training.visible,tracker,trackerUI,contentPacks:[{version:4,exercises:extra.exercises,foods:nutrition.foods},{version:5,exercises:pack5.exercises,foods:[]},{version:6,exercises:pack6,foods:[]}]};
  root.FLSeed=value;
  if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
