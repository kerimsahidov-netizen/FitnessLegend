(function (root) {
  'use strict';
  const V=typeof module!=='undefined'&&module.exports?require('./exercise-videos.js'):root.FLExerciseVideos;
  function create(ctx) {
    const {esc,attr,btn,openModal}=ctx;
    function source(v) {return `<a class="btn secondary" href="${attr(v.sourceUrl)}" target="_blank" rel="noopener noreferrer">Открыть у автора ↗</a>`;}
    function meta(v) {return `<p class="muted video-meta">${esc(v.author)} · ${esc(v.language)} · Источник проверен ${esc(v.checkedAt)}</p>`;}
    function watch(v,isLesson,small) {return btn(small?'Смотреть':'Смотреть видеоурок',isLesson?'video-lesson':'video-open','play',small?'secondary small':'primary',`data-id="${attr(isLesson?v.id:v.exerciseId)}"`);}
    function lessonCards(limit) {return `<div class="video-lessons">${V.lessons.slice(0,limit||V.lessons.length).map(l=>`<article class="video-lesson-card"><h4>${esc(l.title)}</h4><p>${esc(l.description)}</p>${watch(l,true,true)}</article>`).join('')}</div>`;}
    function exercisePanel(e) {
      const original=ctx.Seed?.exercises.find(x=>x.id===e.id);
      const v=original&&(original.name!==e.name||original.kind!==e.kind)?null:V.forExercise(e.id);
      return `<section class="video-panel" aria-label="Видеоуроки"><div class="section-heading"><h3>Посмотри, как выполнять</h3><span class="badge">Видео + фото</span></div>${v?`<p>Видеоурок: ${esc(v.title)}.</p>${meta(v)}<div class="button-row">${watch(v,false,false)}${source(v)}</div>`:`<p class="video-unavailable">Видео для этой вариации пока не добавлено.</p><p class="muted">Используй фото и пошаговую инструкцию в карточке. Ниже — общие уроки, они не заменяют разбор выбранного упражнения.</p>${lessonCards(2)}`}<p class="muted video-note">Фотоинструкция остаётся доступной. Внешнее видео загружается только после нажатия и требует интернета. Уроки на английском; доступность субтитров зависит от автора.</p></section>`;
    }
    function open(v,isLesson) {
      const youtube=v.provider==='youtube'&&/^[\w-]{11}$/.test(v.videoId||'');
      const player=youtube?`<div class="video-player"><iframe title="${attr(v.title)} — ${attr(v.author)}" src="https://www.youtube-nocookie.com/embed/${attr(v.videoId)}?rel=0" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><p class="muted">Если плеер недоступен или автор запретил встраивание, открой оригинал по кнопке ниже.</p>`:`<div class="video-external"><p>Этот урок размещён в видеоплеере на сайте автора.</p><p>Нажми «Открыть у автора», чтобы посмотреть видео в новой вкладке.</p></div>`;
      openModal('video-lesson',v.title,`<div class="video-modal">${isLesson?`<p class="video-general-label">Общий урок</p><p>${esc(v.description||'')}</p>`:''}${meta(v)}${player}<div class="button-row">${source(v)}${ctx.hasTraining?.()?btn('Вернуться к тренировке','video-back','left','secondary'):''}${btn('Закрыть','modal-close','close','secondary')}</div><p class="muted">Материал стороннего автора. Смотри технику вместе с нашей фотоинструкцией; начни с лёгкой нагрузки. При боли прекрати упражнение.</p></div>`,true);
    }
    function action(a,target) {
      if(a==='video-back'){if(ctx.backToTraining)ctx.backToTraining();else ctx.closeModal();return true;}
      if(a!=='video-open'&&a!=='video-lesson')return false;
      const id=target&&target.dataset?target.dataset.id:target&&typeof target.getAttribute==='function'?target.getAttribute('data-id'):null;
      const lesson=a==='video-lesson';
      const v=lesson?V.lessons.find(l=>l.id===id):V.forExercise(id);
      if(v)open(v,lesson);else if(ctx.notice)ctx.notice('Видеоурок пока недоступен. Открой фотоинструкцию.');
      return true;
    }
    return {exercisePanel,lessonCards,action};
  }
  const value={create};root.FLVideoUI=value;
  if(typeof module!=='undefined'&&module.exports)module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
