/* AutoLab — UI и единая точка событий.
   quiz_started и quiz_completed отправляются в Rambler Top-100 / Sber Ads.
   Все события доступны в DevTools при адресе ?debug=1. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const page = document.body.dataset.page || 'unknown';

  const TOP100_PROJECT_ID = 7752813;
  const TOP100_QUIZ_EVENTS = new Set(['quiz_started', 'quiz_completed']);
  const DEBUG_ANALYTICS = new URLSearchParams(location.search).has('debug');

  function sendQuizEventToTop100(name, data) {
    // Официальная очередь для reachGoal: сохраняет событие, если
    // скрипт Top-100 ещё не успел загрузиться (он подключён async).
    if (typeof window.top100d !== 'function') {
      window.top100d = function () {
        (window.top100d.a = window.top100d.a || []).push(arguments);
      };
    }
    try {
      if (name === 'quiz_completed') {
        window.top100d(TOP100_PROJECT_ID, 'reachGoal', name, {
          score: data.score,
          total: data.total,
          percent: data.percent
        });
      } else {
        window.top100d(TOP100_PROJECT_ID, 'reachGoal', name);
      }
    } catch (error) {
      if (DEBUG_ANALYTICS) console.warn('[AutoLab] Ошибка отправки события Top-100', error);
    }
  }

  function emit(name, data = {}) {
    const eventData = { event: name, page, ...data };
    document.dispatchEvent(new CustomEvent('autolab:analytics', { detail: eventData }));
    if (TOP100_QUIZ_EVENTS.has(name)) sendQuizEventToTop100(name, data);
    if (DEBUG_ANALYTICS) console.info('[AutoLab event]', eventData);
  }
  window.AutoLabAnalytics = Object.freeze({ emit });

  // Мобильная навигация.
  const menu = $('#menu-toggle');
  const nav = $('#site-nav');
  if (menu && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Открыть меню');
    };
    menu.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });
    $$('.nav-link', nav).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (evt) => { if (evt.key === 'Escape') closeMenu(); });
    document.addEventListener('click', (evt) => {
      if (!menu.contains(evt.target) && !nav.contains(evt.target)) closeMenu();
    });
  }
  $$('[data-track]').forEach(link => link.addEventListener('click', () => {
    emit(link.dataset.track, { location: link.dataset.location || 'page' });
  }));

  const systems = {
    engine: {
      title: 'Двигатель',
      description: 'Двигатель преобразует энергию топлива или электричества в движение. В двигателе внутреннего сгорания давление газов перемещает поршни и вращает коленчатый вал.',
      parts: ['Блок цилиндров', 'Поршни', 'Коленчатый вал', 'Клапанный механизм', 'Система охлаждения'],
      image: 'assets/engine.jpg', alt: 'Тематическая иллюстрация двигателя'
    },
    gearbox: {
      title: 'Трансмиссия',
      description: 'Трансмиссия передаёт крутящий момент от двигателя к ведущим колёсам и помогает изменять соотношение между скоростью вращения двигателя и колёс.',
      parts: ['Сцепление или гидротрансформатор', 'Коробка передач', 'Приводные валы', 'Дифференциал'],
      image: 'assets/engine.jpg', alt: 'Тематическое изображение автомобильного силового агрегата'
    },
    suspension: {
      title: 'Подвеска',
      description: 'Подвеска соединяет кузов с колёсами, смягчает удары от неровностей и помогает шинам сохранять контакт с дорогой.',
      parts: ['Пружины', 'Амортизаторы', 'Рычаги', 'Втулки и сайлентблоки', 'Стабилизатор поперечной устойчивости'],
      image: 'assets/wheel.jpg', alt: 'Тематическое изображение автомобильного колеса'
    },
    brakes: {
      title: 'Тормозная система',
      description: 'Тормоза замедляют и останавливают автомобиль. Во многих легковых автомобилях гидравлический привод передаёт усилие от педали к тормозным механизмам.',
      parts: ['Тормозная педаль', 'Главный тормозной цилиндр', 'Тормозные магистрали', 'Суппорты', 'Диски и колодки'],
      image: 'assets/brakes.jpg', alt: 'Тематическое изображение дискового тормозного механизма'
    },
    electric: {
      title: 'Электрооборудование',
      description: 'Электросистема обеспечивает запуск двигателя, освещение, работу электронных блоков и питание различных потребителей автомобиля.',
      parts: ['Аккумулятор', 'Генератор или DC-DC преобразователь', 'Предохранители', 'Проводка', 'Электронные блоки управления'],
      image: 'assets/engine.jpg', alt: 'Тематическое изображение силового агрегата автомобиля'
    },
    body: {
      title: 'Кузов',
      description: 'Кузов образует основную конструкцию автомобиля, защищает пассажиров от внешних воздействий и служит креплением для множества узлов.',
      parts: ['Каркас', 'Двери и проёмы', 'Капот и крышка багажника', 'Панели кузова', 'Уплотнения'],
      image: 'assets/about-car.jpg', alt: 'Внешний вид современного автомобиля'
    },
    safety: {
      title: 'Системы безопасности',
      description: 'Пассивные системы уменьшают последствия столкновения, а активные помогают водителю избегать опасных ситуаций.',
      parts: ['Ремни безопасности', 'Подушки безопасности', 'ABS', 'Электронная система стабилизации (ESC)', 'Датчики и камеры'],
      image: 'assets/brakes.jpg', alt: 'Тематическая иллюстрация тормозного механизма'
    }
  };
  function setupTabs(tabSelector, keyName, onSelection) {
    const tabs = $$(tabSelector);
    if (!tabs.length) return;
    tabs.forEach((tab, index) => {
      tab.tabIndex = tab.classList.contains('selected') ? 0 : -1;
      tab.addEventListener('click', () => {
        tabs.forEach(item => {
          const selected = item === tab;
          item.classList.toggle('selected', selected);
          item.setAttribute('aria-selected', String(selected));
          item.tabIndex = selected ? 0 : -1;
        });
        onSelection(tab.dataset[keyName]);
      });
      tab.addEventListener('keydown', e => {
        if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const pos = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 :
          (index + (['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : -1) + tabs.length) % tabs.length;
        tabs[pos].focus();
        tabs[pos].click();
      });
    });
  }
  if (page === 'structure') {
    setupTabs('.system-tab', 'system', key => {
      const data = systems[key];
      if (!data) return;
      $('#system-title').textContent = data.title;
      $('#system-text').textContent = data.description;
      const img = $('#system-image');
      img.src = data.image;
      img.alt = data.alt;
      const parts = $('#system-parts');
      parts.replaceChildren(...data.parts.map(part => {
        const li = document.createElement('li'); li.textContent = part; return li;
      }));
      emit('view_vehicle_system', { system: key });
    });
  }

  const serviceData = {
    scheduled: {
      title: 'Плановое техническое обслуживание',
      text: 'Регулярное техническое обслуживание помогает обнаруживать износ и снижать вероятность неожиданных неисправностей.',
      heading: 'Общий принцип',
      advice: 'Интервал обслуживания зависит от марки, модели, двигателя, условий эксплуатации и рекомендаций производителя.',
      image: 'assets/oil-service.jpg', alt: 'Процесс обслуживания автомобиля'
    },
    oil: {
      title: 'Замена моторного масла',
      text: 'Масло снижает трение и помогает отводить тепло. Со временем присадки теряют свойства, а в масле накапливаются загрязнения.',
      heading: 'На что ориентироваться',
      advice: 'Выбирай допуски и вязкость по руководству автомобиля. Меняй масляный фильтр согласно регламенту.',
      image: 'assets/oil-service.jpg', alt: 'Заливка моторного масла'
    },
    tires: {
      title: 'Шины и давление',
      text: 'От состояния шин зависит сцепление с дорогой, эффективность торможения и управляемость. Проверяй давление на холодных шинах.',
      heading: 'Совет',
      advice: 'Рекомендованное давление обычно указано на наклейке автомобиля и в руководстве. Осматривай протектор, боковины и износ.',
      image: 'assets/wheel.jpg', alt: 'Автомобильное колесо'
    },
    brakes: {
      title: 'Тормозная система',
      text: 'Проверяй состояние тормозных колодок, дисков, жидкости и шлангов. Изменение поведения педали — повод для немедленной диагностики.',
      heading: 'Безопасность прежде всего',
      advice: 'Если тормоза срабатывают с задержкой, педаль проваливается или торможение нестабильно, прекрати эксплуатацию до проверки специалистом.',
      image: 'assets/brakes.jpg', alt: 'Дисковый тормозной механизм'
    },
    battery: {
      title: 'Аккумулятор и электросистема',
      text: 'Аккумулятор питает бортовые системы и обеспечивает запуск двигателя. Его состояние зависит от заряда, температуры и режима поездок.',
      heading: 'Совет',
      advice: 'Следи за надёжностью клемм и напряжением системы. Повторяющиеся проблемы с запуском — повод проверить батарею и генератор.',
      image: 'assets/engine.jpg', alt: 'Тематическое изображение моторного отсека'
    }
  };
  if (page === 'service') {
    setupTabs('.service-tab', 'service', key => {
      const data = serviceData[key];
      if (!data) return;
      $('#service-title').textContent = data.title;
      $('#service-text').textContent = data.text;
      $('#service-advice-title').textContent = data.heading;
      $('#service-advice').textContent = data.advice;
      const photo = $('#service-photo');
      photo.src = data.image; photo.alt = data.alt;
      emit('view_service_topic', { topic: key });
    });
    const checkboxes = $$('#trip-checklist input[type=checkbox]');
    const storageKey = 'autolab-trip-checks-v1';
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      checkboxes.forEach(box => { box.checked = saved[box.dataset.check] === true; });
    } catch (_) { /* в приватном режиме хранилище может быть недоступно */ }
    function updateChecks(userChanged = false) {
      const checked = checkboxes.filter(box => box.checked).length;
      $('#checks-done').textContent = checked;
      $('#check-progress-bar').style.width = `${100 * checked / checkboxes.length}%`;
      $('#check-message').textContent = checked === checkboxes.length ? 'Готово! Все пункты отмечены.' :
        checked ? `Выполнено ${checked} из ${checkboxes.length}. Продолжай!` : 'Начни с первого пункта.';
      try {
        localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(checkboxes.map(box => [box.dataset.check, box.checked]))));
      } catch (_) { /* без сохранения на устройстве */ }
      if (userChanged) emit(checked === checkboxes.length ? 'checklist_completed' : 'checklist_updated', { checked, total: checkboxes.length });
    }
    checkboxes.forEach(box => box.addEventListener('change', () => updateChecks(true)));
    $('#check-reset').addEventListener('click', () => {
      checkboxes.forEach(box => { box.checked = false; });
      updateChecks(); emit('checklist_reset');
    });
    updateChecks();
  }

  const glossary = [
    ['ABS', 'Антиблокировочная система', 'Система, предотвращающая длительную блокировку колёс при торможении.', 'Помогает сохранять управляемость при интенсивном торможении.'],
    ['АКПП', 'Автоматическая коробка передач', 'Коробка передач, выбирающая ступени без ручного переключения водителем.', 'Позволяет менять передаточное отношение с минимальным участием водителя.'],
    ['Амортизатор', 'Элемент подвески', 'Устройство, гасящее колебания кузова и колёс.', 'Помогает колесу сохранять контакт с дорогой.'],
    ['Вискомуфта', 'Устройство передачи крутящего момента', 'Механизм, в котором момент передаётся через вязкую жидкость.', 'Используется в некоторых приводах и вентиляторах охлаждения.'],
    ['Генератор', 'Источник электроэнергии', 'Устройство, преобразующее механическую энергию двигателя в электрическую.', 'Питает потребители автомобиля и заряжает АКБ при работе двигателя.'],
    ['ГРМ', 'Газораспределительный механизм', 'Механизм, управляющий своевременным открытием и закрытием клапанов двигателя.', 'Обеспечивает правильный газообмен в цилиндрах.'],
    ['Дроссель', 'Дроссельная заслонка', 'Узел, регулирующий поток воздуха, поступающего в двигатель.', 'Участвует в регулировании мощности бензинового двигателя.'],
    ['Дифференциал', 'Механизм трансмиссии', 'Позволяет ведущим колёсам вращаться с разной скоростью.', 'Особенно важен при прохождении поворотов.'],
    ['Катализатор', 'Каталитический нейтрализатор', 'Компонент выпускной системы, снижающий содержание некоторых вредных веществ в выхлопе.', 'Уменьшает токсичность отработавших газов.'],
    ['Клиренс', 'Дорожный просвет', 'Расстояние от самой нижней предусмотренной точки автомобиля до дорожной поверхности.', 'Характеризует способность проезжать неровности без контакта с днищем.'],
    ['Коленвал', 'Коленчатый вал', 'Вал, превращающий возвратно-поступательное движение поршней во вращение.', 'Передаёт крутящий момент от двигателя к трансмиссии.'],
    ['Крутящий момент', 'Вращающее усилие', 'Физическая величина, характеризующая способность силы создавать вращение.', 'Одна из характеристик двигателя, измеряется в Н·м.'],
    ['Лямбда-зонд', 'Датчик кислорода', 'Датчик, оценивающий содержание кислорода в отработавших газах.', 'Помогает системе управления двигателем корректировать топливную смесь.'],
    ['Масляный фильтр', 'Фильтр системы смазки', 'Компонент, задерживающий механические загрязнения в моторном масле.', 'Помогает уменьшать износ двигателя.'],
    ['Подвеска', 'Система соединения колёс с кузовом', 'Комплекс деталей, воспринимающих нагрузки от дороги и направляющих движение колёс.', 'Влияет на плавность хода и управляемость.'],
    ['Радиатор', 'Теплообменник', 'Элемент, отдающий тепло от охлаждающей жидкости окружающему воздуху.', 'Поддерживает рабочую температуру двигателя.'],
    ['Свеча зажигания', 'Источник искры в цилиндре', 'Создаёт искру для воспламенения смеси в бензиновом двигателе.', 'Важна для стабильного запуска и работы двигателя.'],
    ['Сайлентблок', 'Резинометаллический шарнир', 'Соединительный элемент, допускающий упругие перемещения деталей.', 'Помогает гасить вибрации в подвеске.'],
    ['Суппорт', 'Узел дискового тормоза', 'Механизм, прижимающий тормозные колодки к диску.', 'Участвует в замедлении автомобиля.'],
    ['Термостат', 'Клапан системы охлаждения', 'Регулирует движение охлаждающей жидкости между малым и большим кругом.', 'Ускоряет прогрев и помогает поддерживать рабочую температуру.'],
    ['Трансмиссия', 'Система передачи крутящего момента', 'Узлы, передающие момент двигателя к ведущим колёсам.', 'Позволяет эффективно использовать тягу двигателя.'],
    ['Турбина', 'Турбокомпрессор', 'Устройство, использующее энергию выхлопных газов для наддува воздуха.', 'Повышает количество воздуха, поступающего в двигатель.'],
    ['Форсунка', 'Топливный инжектор', 'Устройство для дозированной подачи топлива.', 'Влияет на смесеобразование и работу двигателя.'],
    ['ШРУС', 'Шарнир равных угловых скоростей', 'Шарнир, передающий крутящий момент при изменении угла между валами.', 'Часто применяется в приводах ведущих колёс.'],
    ['ESC', 'Электронная система стабилизации', 'Система, способная выборочно подтормаживать колёса для помощи в сохранении траектории.', 'Снижает риск потери устойчивости, но не отменяет законов физики.']
  ];
  if (page === 'glossary') {
    const search = $('#term-search');
    const alphabet = $('#alphabet');
    const buttons = $('#term-buttons');
    const count = $('#term-count');
    let activeLetter = 'all';
    let activeTerm = 'ABS';
    let debounce;
    const letters = Array.from(new Set(glossary.map(([term]) => term[0].toUpperCase()))).sort((a, b) => a.localeCompare(b, 'ru'));
    for (const letter of letters) {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'letter'; btn.dataset.letter = letter;
      btn.textContent = letter; alphabet.append(btn);
    }
    function displayTerm(entry, track = false) {
      if (!entry) return;
      activeTerm = entry[0];
      $('#term-title').textContent = entry[0];
      $('#term-full').textContent = entry[1];
      $('#term-description').textContent = entry[2];
      $('#term-usage').textContent = entry[3];
      $$('.term-btn', buttons).forEach(btn => btn.classList.toggle('selected', btn.dataset.term === activeTerm));
      if (track) emit('glossary_term_view', { term: entry[0] });
    }
    function render() {
      const query = search.value.trim().toLocaleLowerCase('ru');
      const matches = glossary.filter(([term, full, definition]) =>
        (activeLetter === 'all' || term[0].toUpperCase() === activeLetter) &&
        `${term} ${full} ${definition}`.toLocaleLowerCase('ru').includes(query));
      count.textContent = `Найдено терминов: ${matches.length}`;
      buttons.replaceChildren();
      if (!matches.length) {
        const note = document.createElement('p'); note.className = 'empty-results';
        note.textContent = 'Ничего не найдено. Попробуй другой запрос.';
        buttons.append(note);
        $('#term-detail').hidden = true;
      } else {
        $('#term-detail').hidden = false;
        for (const entry of matches) {
          const btn = document.createElement('button');
          btn.type = 'button'; btn.className = 'term-btn'; btn.dataset.term = entry[0];
          const strong = document.createElement('strong'); strong.textContent = entry[0];
          const small = document.createElement('small'); small.textContent = entry[1];
          btn.append(strong, small);
          btn.addEventListener('click', () => displayTerm(entry, true));
          buttons.append(btn);
        }
        displayTerm(matches.find(entry => entry[0] === activeTerm) || matches[0]);
      }
      return matches.length;
    }
    alphabet.addEventListener('click', e => {
      const btn = e.target.closest('button[data-letter]');
      if (!btn) return;
      activeLetter = btn.dataset.letter;
      $$('.letter', alphabet).forEach(item => item.classList.toggle('selected', item === btn));
      const n = render(); emit('glossary_letter_filter', { letter: activeLetter, results: n });
    });
    search.addEventListener('input', () => {
      clearTimeout(debounce);
      const n = render();
      debounce = setTimeout(() => {
        if (search.value.trim()) emit('glossary_search', { query_length: search.value.trim().length, results: n });
      }, 700);
    });
    $('#clear-search').addEventListener('click', () => {
      search.value = ''; search.focus(); render();
    });
    render();
  }

  const questions = [
    { question: 'Для чего нужна антиблокировочная система ABS?', options: ['Увеличивать мощность двигателя', 'Помогать сохранять управляемость при торможении', 'Ускорять разгон', 'Измерять уровень масла'], correct: 1 },
    { question: 'Какой узел передаёт крутящий момент от двигателя к колёсам?', options: ['Трансмиссия', 'Радиатор', 'Аккумулятор', 'Стеклоочистители'], correct: 0 },
    { question: 'Что помогает гасить колебания кузова и колёс?', options: ['Генератор', 'Катализатор', 'Амортизатор', 'Топливный насос'], correct: 2 },
    { question: 'Какой элемент очищает моторное масло от загрязнений?', options: ['Воздушный фильтр салона', 'Масляный фильтр', 'Термостат', 'Свеча зажигания'], correct: 1 },
    { question: 'Что измеряют в Н·м (ньютон-метрах)?', options: ['Температуру воздуха', 'Крутящий момент', 'Электрическое напряжение', 'Объём бака'], correct: 1 },
    { question: 'Зачем нужен дифференциал?', options: ['Охлаждать двигатель', 'Позволять ведущим колёсам вращаться с разной скоростью', 'Включать фары', 'Подавать топливо'], correct: 1 },
    { question: 'Где узнать правильное давление в шинах своей машины?', options: ['У любого другого автомобиля', 'По цвету шин', 'На наклейке автомобиля или в руководстве', 'По звуку двигателя'], correct: 2 },
    { question: 'Какова основная функция радиатора охлаждения?', options: ['Отводить тепло от охлаждающей жидкости', 'Управлять коробкой передач', 'Создавать искру', 'Приводить колёса'], correct: 0 },
    { question: 'Что нужно сделать при нестабильном торможении?', options: ['Продолжать ездить как обычно', 'Проверить тормоза и не эксплуатировать машину до устранения проблемы', 'Отключить ABS', 'Увеличить скорость'], correct: 1 },
    { question: 'Для чего служит свеча зажигания в бензиновом двигателе?', options: ['Фильтровать масло', 'Охлаждать антифриз', 'Создавать искру для воспламенения смеси', 'Регулировать давление в шинах'], correct: 2 }
  ];
  if (page === 'quiz') {
    let current = 0, score = 0, choice = null;
    const start = $('#quiz-start'), play = $('#quiz-play'), finish = $('#quiz-finish');
    const options = $('#quiz-options'), next = $('#next-question');
    function showQuestion() {
      const item = questions[current]; choice = null;
      $('#quiz-step').textContent = `Вопрос ${current + 1} из ${questions.length}`;
      $('#quiz-score').textContent = `${score} баллов`;
      $('#quiz-bar').style.width = `${100 * (current + 1) / questions.length}%`;
      $('#quiz-question').textContent = item.question;
      options.replaceChildren();
      item.options.forEach((value, i) => {
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'quiz-option';
        btn.setAttribute('role', 'radio'); btn.setAttribute('aria-checked', 'false');
        btn.textContent = `${String.fromCharCode(65 + i)}. ${value}`;
        btn.addEventListener('click', () => {
          choice = i;
          $$('.quiz-option', options).forEach((b, k) => {
            b.classList.toggle('selected', k === i);
            b.setAttribute('aria-checked', String(k === i));
          });
          next.disabled = false;
        });
        options.append(btn);
      });
      next.disabled = true;
      next.querySelector('span').textContent = '→';
      next.firstChild.textContent = current === questions.length - 1 ? 'Завершить тест ' : 'Следующий вопрос ';
    }
    function begin() {
      current = 0; score = 0;
      start.hidden = true; finish.hidden = true; play.hidden = false;
      emit('quiz_started'); showQuestion();
    }
    $('#start-quiz').addEventListener('click', begin);
    $('#restart-quiz').addEventListener('click', begin);
    next.addEventListener('click', () => {
      if (choice === null) return;
      if (choice === questions[current].correct) score++;
      current++;
      if (current < questions.length) { showQuestion(); return; }
      play.hidden = true; finish.hidden = false;
      $('#quiz-result-score').textContent = String(score);
      $('#quiz-result-title').textContent = score >= 8 ? 'Отличный результат!' : score >= 5 ? 'Хорошая база!' : 'Всё впереди!';
      $('#quiz-result-text').textContent = score >= 8 ? 'Ты хорошо разбираешься в автомобильных системах. Так держать!' :
        score >= 5 ? 'Несколько тем стоит повторить — и следующий результат будет ещё лучше.' :
        'Начни с раздела «Устройство», затем попробуй снова.';
      emit('quiz_completed', { score, total: questions.length, percent: Math.round(100 * score / questions.length) });
    });
  }

  if (page === 'about') {
    const share = $('#share-site');
    const status = $('#share-status');
    share.addEventListener('click', async () => {
      try {
        if (navigator.share && location.protocol === 'https:') {
          await navigator.share({ title: 'AutoLab', text: 'Справочник об автомобилях', url: location.href });
          status.textContent = 'Ссылка успешно отправлена.';
          emit('site_shared', { method: 'share' });
        } else if (navigator.clipboard && location.protocol === 'https:') {
          await navigator.clipboard.writeText(location.href);
          status.textContent = 'Ссылка скопирована.';
          emit('site_shared', { method: 'copy' });
        } else {
          status.textContent = 'Скопируй адрес страницы из адресной строки браузера.';
        }
      } catch (err) {
        if (err.name !== 'AbortError') status.textContent = 'Не удалось поделиться. Скопируй адрес страницы вручную.';
      }
    });
  }
})();
