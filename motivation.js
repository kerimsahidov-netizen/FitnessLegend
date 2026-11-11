(function (root) {
  'use strict';

  // Original project phrases: no attribution to athletes or other public figures.
  const phrases = [
    'Посильный шаг сегодня тоже считается.',
    'План может меняться вместе с твоим расписанием.',
    'Пропущенное занятие — повод перестроить неделю и продолжить.',
    'Отдых заслуживает места в твоём плане.',
    'Сравнивай свой путь с собственным началом.',
    'Удобная привычка начинается с небольшого действия.',
    'Тебе не обязательно ждать идеального настроения.',
    'Выбирай нагрузку, с которой можешь работать спокойно и внимательно.',
    'Десять доступных минут — хороший повод уделить время себе.',
    'Запись в дневнике помогает заметить то, что легко забыть.',
    'Сегодняшний план должен подходить сегодняшнему тебе.',
    'Техника важнее спешки: дай себе время разобраться.',
    'Можно начать с простого и усложнять постепенно.',
    'В твоём ритме есть место и движению, и восстановлению.',
    'Маленькое выполненное дело лучше бесконечного ожидания старта.',
    'Одна трудная неделя не определяет весь твой путь.',
    'Замечай не только цифры, но и то, чему ты научился.',
    'Забота о себе не требует соревнования с другими.',
    'Если упражнение не подходит, найди удобную замену.',
    'Возвращение к привычке — тоже шаг вперёд.',
    'Пусть следующий шаг будет понятным и выполнимым.',
    'Твой план — помощник, а не повод ругать себя.',
    'Пробуй, записывай наблюдения и подстраивай свой подход.',
    'Начало может быть спокойным. Главное — выбрать свой первый шаг.'
  ];

  const quotes = phrases.map(function (text, index) {
    return Object.freeze({
      id: 'quote-' + String(index + 1).padStart(2, '0'),
      text: text,
      author: 'Команда FitnessLegend'
    });
  });

  // Progress is calculated by the app from saved actions, never screen visits.
  const achievements = [
    { id: 'first-workout', title: 'Первое занятие', description: 'Отметь одну тренировку выполненной.', icon: 'dumbbell', target: 1, metric: 'completedWorkouts' },
    { id: 'three-workouts', title: 'Три занятия', description: 'Выполни три тренировки в удобном для тебя ритме.', icon: 'check', target: 3, metric: 'completedWorkouts' },
    { id: 'ten-workouts', title: 'Десять занятий', description: 'Собери десять выполненных тренировок.', icon: 'flag', target: 10, metric: 'completedWorkouts' },
    { id: 'three-training-days', title: 'Свои дни', description: 'Отметь выполненные тренировки в три разных дня. Дни не обязаны идти подряд.', icon: 'calendar', target: 3, metric: 'distinctTrainingDays' },
    { id: 'first-food-entry', title: 'Первая запись', description: 'Добавь первую запись о питании в дневник.', icon: 'food', target: 1, metric: 'foodEntries' },
    { id: 'three-food-days', title: 'Дневник в ритме', description: 'Добавь записи о питании за три разные даты. Дни не обязаны идти подряд.', icon: 'book', target: 3, metric: 'distinctFoodDays' },
    { id: 'first-measurement', title: 'Точка отсчёта', description: 'Сохрани первое измерение для наблюдения за своим прогрессом.', icon: 'chart', target: 1, metric: 'measurements' },
    { id: 'five-favorites', title: 'Своя подборка', description: 'Сохрани пять разных упражнений в избранное.', icon: 'heart', target: 5, metric: 'favorites' }
  ].map(function (achievement) { return Object.freeze(achievement); });

  const metricDescriptions = Object.freeze({
    completedWorkouts: 'Число сохранённых занятий со статусом done во всех неделях плана; каждое занятие учитывается один раз.',
    distinctTrainingDays: 'Число разных локальных дат фактического выполнения занятий со статусом done. Для старых записей без completedAt допустима дата занятия.',
    foodEntries: 'Число реально сохранённых записей дневника питания.',
    distinctFoodDays: 'Число уникальных дат date у сохранённых записей дневника питания.',
    measurements: 'Число реально сохранённых измерений.',
    favorites: 'Число уникальных существующих упражнений, сохранённых в избранное.'
  });

  function localDateKey(date) {
    const value = date instanceof Date ? date : new Date();
    return value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0');
  }

  // A stable result for the same YYYY-MM-DD, regardless of render count.
  function quoteForDate(date) {
    const key = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : localDateKey(date);
    let hash = 2166136261;
    for (let i = 0; i < key.length; i += 1) {
      hash ^= key.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return quotes[(hash >>> 0) % quotes.length];
  }

  function nextQuote(current) {
    const id = typeof current === 'string' ? current : current && current.id;
    const index = quotes.findIndex(function (quote) { return quote.id === id; });
    return quotes[(index + 1) % quotes.length];
  }

  const api = Object.freeze({
    quotes: Object.freeze(quotes),
    achievements: Object.freeze(achievements),
    metricDescriptions: metricDescriptions,
    quoteForDate: quoteForDate,
    nextQuote: nextQuote
  });

  root.FLMotivation = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
