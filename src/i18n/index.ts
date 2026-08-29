/**
 * Модуль интернационализации (i18n)
 * Управляет языковыми пакетами и переключением языка.
 * Поддерживает русский (ru) и английский (en) языки.
 */

/* Тип для структуры перевода — рекурсивный, чтобы вложенные ключи работали */
export type TranslationKeys = {
  [key: string]: string | TranslationKeys;
};

/* Все доступные языки */
export type Language = 'ru' | 'en';

/* Текущий выбранный язык (по умолчанию русский) */
let currentLanguage: Language = 'ru';

/* Функция для получения текущего языка */
export function getLanguage(): Language {
  return currentLanguage;
}

/* Функция для установки языка */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  /* Обновляем атрибут lang у тега html для accessibility */
  document.documentElement.lang = lang;
}

/**
 * Функция перевода по ключу вида "header.title"
 * Ищет вложенное значение в объекте перевода.
 *
 * Поддержка плейсхолдеров:
 *   t('footer.copyright', { year: 2025 })
 *   → "© 2025 Центр калькуляторов. Все права защищены."
 *
 * Плейсхолдеры в строке: {year}, {name}, {value} и т.д.
 * Значения подставляются из второго аргумента (объект).
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let result: string | TranslationKeys = translations[currentLanguage];

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      /* Если ключ не найден — возвращаем сам ключ как fallback */
      return key;
    }
  }

  let str = typeof result === 'string' ? result : key;

  /* Подставляем плейсхолдеры {name} из объекта params */
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }
  }

  return str;
}

/* ==================== ПЕРЕВОДЫ ==================== */

const translations: Record<Language, TranslationKeys> = {
  /* ---------- РУССКИЙ ЯЗЫК ---------- */
  ru: {
    /* Шапка сайта */
    header: {
      title: 'Центр калькуляторов',
      subtitle: 'Бесплатные онлайн-калькуляторы',
    },

    /* Навигация и страницы */
    nav: {
      home: 'Главная',
      classic: 'Классический',
      engineering: 'Инженерный',
      mortgage: 'Кредитный',
      fuel: 'Расход топлива',
      bmi: 'ИМТ и калории',
      wallpaper: 'Обои и краска',
      days: 'Калькулятор дней',
    },

    /* Главная страница */
    home: {
      hero: 'Набор полезных калькуляторов',
      description: 'Быстрые и точные онлайн-инструменты для повседневных расчётов',
      startButton: 'Начать использовать',
      features: {
        free: 'Бесплатно',
        freeDesc: 'Все калькуляторы абсолютно бесплатны',
        fast: 'Быстро',
        fastDesc: 'Мгновенные расчёты без ожидания',
        privacy: 'Приватно',
        privacyDesc: 'Данные не покидают ваш браузер',
        mobile: 'Мобильный',
        mobileDesc: 'Удобно на любом устройстве',
      },
    },

    /* Калькуляторы — общее */
    calc: {
      clear: 'C',
      backspace: '⌫',
      equals: '=',
      history: 'История',
      noHistory: 'Пока нет вычислений',
    },

    /* Классический калькулятор */
    classic: {
      title: 'Классический калькулятор',
      description: 'Простой и удобный калькулятор для повседневных вычислений',
    },

    /* Инженерный калькулятор */
    engineering: {
      title: 'Инженерный калькулятор',
      description: 'Расширенные математические функции для сложных вычислений',
      deg: 'Градусы',
      rad: 'Радианы',
      secondFn: '2nd',
    },

    /* Калькулятор кредита/ипотеки */
    mortgage: {
      title: 'Ипотечный калькулятор',
      description: 'Рассчитайте ежемесячный платёж, переплату и график платежей по ипотеке',
      loanAmount: 'Сумма кредита (₽)',
      interestRate: 'Процентная ставка (% годовых)',
      loanTerm: 'Срок кредита (лет)',
      calculate: 'Рассчитать',
      monthlyPayment: 'Ежемесячный платёж',
      totalPayment: 'Общая выплата',
      totalInterest: 'Переплата',
      annuity: 'Аннуитетный',
      differentiated: 'Дифференцированный',
      schedule: 'График платежей',
      year: 'Год',
      principal: 'Основной долг',
      interest: 'Проценты',
      remaining: 'Остаток',
    },

    /* Кредитный калькулятор */
    credit: {
      title: 'Кредитный калькулятор',
      description: 'Рассчитайте ежемесячный платёж, переплату и график погашения кредита',
      loanAmount: 'Сумма кредита',
      interestRate: 'Процентная ставка (% годовых)',
      loanTerm: 'Срок кредита (лет)',
      paymentType: 'Тип платежа',
      annuity: 'Аннуитетный',
      differentiated: 'Дифференцированный',
      additionalCostsOptional: 'Дополнительные расходы (необязательно)',
      insurance: 'Страхование (₽)',
      disbursementFee: 'Комиссия за выдачу (₽)',
      calculate: 'РАССЧИТАТЬ',
      reset: 'Сбросить',
      monthlyPayment: 'Ежемесячный платёж',
      paymentRange: 'от {from} до {to}',
      totalPayment: 'Общая выплата',
      totalInterest: 'Переплата по процентам',
      additionalCosts: 'Дополнительные расходы',
      insuranceLabel: 'Страхование',
      disbursementFeeLabel: 'Комиссия за выдачу',
      totalCost: 'Полная стоимость',
      paymentSchedule: 'График платежей',
      period: 'Период',
      colPayment: 'Платёж, ₽',
      colPrincipal: 'Долг, ₽',
      colInterest: 'Проценты, ₽',
      colBalance: 'Остаток, ₽',
      hint: 'Заполните параметры и нажмите «Рассчитать»',
    },

    /* Автокредитный калькулятор */
    autoCredit: {
      title: 'Автокредитный калькулятор',
      description: 'Рассчитайте ежемесячный платёж, переплату и стоимость кредита на автомобиль',
      carPrice: 'Цена автомобиля',
      downPayment: 'Первый взнос',
      interestRate: 'Процентная ставка (% годовых)',
      loanTerm: 'Срок кредита (лет)',
      paymentType: 'Тип платежа',
      annuity: 'Аннуитетный',
      differentiated: 'Дифференцированный',
      calculate: 'РАССЧИТАТЬ',
      reset: 'Сбросить',
      monthlyPayment: 'Ежемесячный платёж',
      paymentRange: 'от {from} до {to}',
      loanAmount: 'Сумма кредита',
      totalPayment: 'Общая выплата',
      totalInterest: 'Переплата по процентам',
      totalCarCost: 'Полная стоимость авто',
      pricePlusInterest: 'Цена + переплата',
      paymentSchedule: 'График платежей',
      period: 'Период',
      colPayment: 'Платёж, ₽',
      colPrincipal: 'Долг, ₽',
      colInterest: 'Проценты, ₽',
      colBalance: 'Остаток, ₽',
      hint: 'Заполните параметры и нажмите «Рассчитать»',
    },

    /* ОСАГО */
    osago: {
      title: 'Калькулятор ОСАГО',
      description: 'Рассчитайте примерную стоимость полиса ОСАГО по формуле ЦБ РФ',
    },

    /* Расход топлива */
    fuel: {
      title: 'Расход топлива',
      description: 'Рассчитайте стоимость поездки и расход бензина',
      distance: 'Расстояние (км)',
      consumption: 'Расход на 100 км (л)',
      fuelPrice: 'Цена за литр (₽)',
      calculate: 'РАССЧИТАТЬ',
      liters: 'Необходимый объём топлива',
      cost: 'Стоимость поездки',
      litersUnit: 'л',
      costUnit: '₽',
      reset: 'Сбросить',
      details: 'Подробнее',
      costPerKm: 'Стоимость на 1 км',
      costPer100km: 'Расход на 100 км в деньгах',
      hint: 'Заполните данные и нажмите «Рассчитать»',
    },

    /* ИМТ калькулятор */
    bmi: {
      title: 'ИМТ и норма калорий',
      description: 'Индекс массы тела и суточная норма калорий',
      gender: 'Пол',
      male: 'Мужской',
      female: 'Женский',
      height: 'Рост (см)',
      weight: 'Вес (кг)',
      age: 'Возраст (лет)',
      activity: 'Уровень активности',
      activityLevels: {
        sedentary: 'Малоподвижный (офис)',
        light: 'Лёгкая активность (1–3 раза в неделю)',
        moderate: 'Умеренная (3–5 раз в неделю)',
        active: 'Высокая (6–7 раз в неделю)',
        veryActive: 'Очень высокая (тренировки)',
      },
      calculate: 'РАССЧИТАТЬ',
      bmiValue: 'Ваш ИМТ',
      bmiCategory: 'Категория',
      categories: {
        underweight: 'Недостаточный вес',
        normal: 'Норма',
        overweight: 'Избыточный вес',
        obese: 'Ожирение',
      },
      calories: 'Суточная норма калорий',
      loseWeight: 'Для похудения',
      maintain: 'Для поддержания',
      gainWeight: 'Для набора веса',
      kcal: 'ккал/день',
      targetWeight: 'Целевой вес (кг) — необязательно',
      reset: 'Сбросить',
      mifflinStJeor: 'Миффлин-Сан Жеор',
      bmr: 'Базовый обмен',
      withActivity: 'С учётом активности',
      harrisBenedict: 'Харрис-Бенедикт',
      loseWeightGoal: 'Снизить вес',
      gainWeightGoal: 'Набрать вес',
      targetDiff: 'на {diff} кг',
      recommendedDaily: 'Рекомендуется в день для похудения',
      currentMaintenance: 'Сейчас нужно для поддержания',
      dailyDeficit: 'Дефицит в день',
      estimatedTime: 'Примерный срок',
      monthsAbbr: 'мес.',
      weeksAbbr: 'нед.',
      safePace: 'Безопасный темп: ~0.5 кг/нед. Минимум: 1 200 ккал/день',
      hint: 'Заполните данные и нажмите «Рассчитать»',
    },

    /* Калькулятор обоев и краски */
    wallpaper: {
      title: 'Калькулятор обоев и краски',
      description: 'Рассчитайте количество рулонов обоев или банок краски',
      wallWidth: 'Ширина стены (м)',
      wallHeight: 'Высота стены (м)',
      doorWidth: 'Ширина двери (м)',
      doorHeight: 'Высота двери (м)',
      windowWidth: 'Ширина окна (м)',
      windowHeight: 'Высота окна (м)',
      wallpaperWidth: 'Ширина рулона обоев (м)',
      wallpaperLength: 'Длина рулона (м)',
      paintCoverage: 'Расход краски (м²/л)',
      paintCapacity: 'Объём банки (л)',
      calculate: 'Рассчитать',
      wallArea: 'Площадь стен',
      netArea: 'Площадь за вычетом',
      wallpaperRolls: 'Рулонов обоев',
      paintCans: 'Банок краски',
      m2: 'м²',
      room: 'Комната',
      width: 'Ширина (м)',
      length: 'Длина (м)',
      wallHeightLabel: 'Высота стен (м)',
      door: 'Дверь (Ш × В м)',
      window: 'Окно (Ш × В м) × кол-во',
      paint: 'Краска',
      rollParams: 'Параметры рулона',
      paintParams: 'Параметры краски',
      calcBtn: 'РАССЧИТАТЬ',
      reset: 'Сбросить',
      netAreaDetail: 'за вычетом {doorArea} м² двери и {windowArea} м² окон',
      stripLength: 'Длина полосы',
      stripsCount: 'Кол-во полос',
      totalLength: 'Общая длина',
      paintNeeded: 'Нужно краски',
      extraPaint: 'Банок в запасе',
      fillDimensions: 'Заполните размеры комнаты для расчёта',
      pcs: 'шт.',
    },

    /* Калькулятор дней */
    days: {
      title: 'Калькулятор дней между датами',
      description: 'Точно посчитайте количество дней между двумя датами',
      startDate: 'Начальная дата',
      endDate: 'Конечная дата',
      calculate: 'Рассчитать',
      calendarDays: 'Календарных дней',
      weekdays: 'Рабочих дней',
      weekendDays: 'Выходных дней',
      months: 'Месяцев',
      years: 'Лет',
      weeks: 'Недель',
    },

    /* Генератор паролей */
    password: {
      title: 'Генератор паролей',
      description: 'Создайте надёжный пароль для защиты ваших аккаунтов',
      passwordLength: 'Длина пароля',
      characterTypes: 'Типы символов',
      uppercaseDesc: 'Заглавные буквы',
      lowercaseDesc: 'Строчные буквы',
      digitsDesc: 'Цифры',
      symbolsDesc: 'Символы',
      generate: 'Сгенерировать',
      copied: 'Скопировано!',
      copy: 'Копировать',
      yourPassword: 'Ваш пароль',
      passwordStrength: 'Сложность пароля',
      crackTime: 'Время подбора',
      recentPasswords: 'Недавние пароли',
      strengthWeak: 'Слабый',
      strengthFair: 'Средний',
      strengthGood: 'Хороший',
      strengthExcellent: 'Отличный',
      crackInstantly: 'Мгновенно',
      crackSec: '{value} сек.',
      crackMin: '{value} мин.',
      crackHr: '{value} ч.',
      crackDays: '{value} дн.',
      crackYears: '{value} лет',
      crackThousandYears: '{value} тыс. лет',
      crackMillionYears: '{value} млн лет',
      crackBillionYears: '{value} млрд лет',
    },

    /* Калькулятор дней отпуска */
    vacation: {
      title: 'Калькулятор дней отпуска',
      description: 'Рассчитайте количество неиспользованных дней отпуска и положенную денежную компенсацию',
      hireDate: 'Дата приёма на работу',
      calcDate: 'Расчётная дата',
      today: 'Сегодня',
      excludedPeriodsLabel: 'Периоды, не включаемые в отпускной стаж',
      excludedPeriodsTooltip: 'Отпуск по уходу за ребёнком, прогулы и т.д.',
      excludePeriod: 'Исключить период',
      annualDuration: 'Продолжительность ежегодного отпуска',
      annualDurationTooltip: 'Стандарт — 28 дней (ст. 115 ТК РФ)',
      days: 'дн.',
      usedDays: 'Использованные дни отпуска за весь период',
      dailyEarnings: 'Средний дневной заработок',
      dailyEarningsTooltip: 'Для расчёта компенсации',
      optional: 'необязательно',
      calcBtn: 'РАССЧИТАТЬ',
      reset: 'Сбросить',
      unusedDays: 'Неиспользованные дни отпуска',
      seniority: 'Стаж: {years} лет {months} мес.',
      vacationSeniority: 'Отпускной стаж',
      earnedDays: 'Накоплено дней',
      seniorityBreakdown: 'Разбивка стажа',
      totalSeniority: 'Общий стаж',
      excludedPeriods: 'Исключённые периоды',
      annualVacation: 'Ежегодный отпуск',
      daysPerYear: 'дн./год',
      compensation: 'Компенсация при увольнении',
      daysTimes: 'дн. ×',
      disclaimer: '⚠️ Расчёт приблизительный, основан на ст. 115, 121 ТК РФ. Точный расчёт может отличаться в зависимости от обстоятельств. Обратитесь к кадровику или юристу.',
      errorNoDates: 'Пожалуйста, заполните даты для расчёта',
    },

    /* Калькулятор пеней */
    penalty: {
      title: 'Калькулятор пеней',
      description: 'Рассчитайте пени за просрочку налогов, взносов или коммунальных платежей, а также компенсацию за задержку зарплаты',
      calculateLabel: 'Рассчитать',
      typeTax: 'Пени по налогам, сборам и страховым взносам',
      typeSalary: 'Компенсация за задержку в выплате заработной платы',
      typeUtilities: 'Пени за просрочку при оплате коммунальных услуг',
      taxpayer: 'Налогоплательщик',
      individual: 'Физическое лицо',
      legalEntity: 'Юридическое лицо',
      debtAmount: 'Сумма задолженности',
      currency: 'руб.',
      dueDate: 'Установленный срок уплаты',
      paymentDate: 'Дата погашения задолженности',
      today: 'Сегодня',
      cbrRate: 'Ставка ЦБ РФ (%)',
      cbrRateCurrent: 'Актуальная ставка на {date} (обновляется раз в сутки)',
      cbrRateLoading: 'Загрузка ставки с cbr.ru...',
      calcBtn: 'РАССЧИТАТЬ',
      reset: 'Сбросить',
      penaltyAmount: 'Сумма пеней',
      daysOverdue: 'дн. просрочки',
      totalToPay: 'Итого к оплате',
      penaltyBreakdown: 'Расчёт пеней',
      debtAmountLabel: 'Сумма задолженности',
      daysOverdueLabel: 'Дней просрочки',
      cbrRateLabel: 'Ставка ЦБ РФ',
      formulaSalary: 'Формула (ст. 236 ТК РФ)',
      formulaTax: 'Формула (ст. 75 НК РФ)',
      penaltyCharged: 'Начислено пеней',
      disclaimer: '⚠️ Расчёт приблизительный. Ставка ЦБ РФ может отличаться от фактической на момент просрочки. Точный расчёт могут провести ФНС или суд.',
      errorNoData: 'Пожалуйста, заполните сумму и даты для расчёта',
    },

    /* Калькулятор НДФЛ */
    ndfl: {
      title: 'Калькулятор НДФЛ',
      description: 'Рассчитайте подоходный налог 13%/15% и сумму на руки с учётом вычетов',
    },

    /* Калькулятор НДС */
    nds: {
      title: 'Калькулятор НДС',
      description: 'Рассчитайте НДС прибавлением или извлечением из суммы',
    },

    /* Калькулятор процентов */
    interest: {
      title: 'Калькулятор процентов',
      description: 'Рассчитайте прибыль по вкладу или переплату по кредиту с простыми и сложными процентами',
    },

    /* Калькулятор утильсбора */
    utilFee: {
      title: 'Калькулятор утильсбора',
      description: 'Рассчитайте стоимость утилизационного сбора при ввозе ТС в РФ',
    },

    /* Калькулятор растаможки */
    customs: {
      title: 'Калькулятор растаможки',
      description: 'Рассчитайте полную стоимость таможенного оформления автомобиля',
    },

    /* Футер */
    footer: {
      copyright: '© {year} Центр калькуляторов. Все права защищены.',
      privacy: 'Политика конфиденциальности',
      terms: 'Пользовательское соглашение',
    },

    /* Модальные окна */
    modal: {
      privacyTitle: 'Политика конфиденциальности',
      termsTitle: 'Пользовательское соглашение',
      close: 'Закрыть',
    },
  },

  /* ---------- ENGLISH ---------- */
  en: {
    header: {
      title: 'Calculator Center',
      subtitle: 'Free Online Calculators',
    },
    nav: {
      home: 'Home',
      classic: 'Classic',
      engineering: 'Engineering',
      mortgage: 'Loan',
      fuel: 'Fuel Cost',
      bmi: 'BMI & Calories',
      wallpaper: 'Wallpaper & Paint',
      days: 'Date Calculator',
    },
    home: {
      hero: 'A Collection of Useful Calculators',
      description: 'Fast and accurate online tools for everyday calculations',
      startButton: 'Get Started',
      features: {
        free: 'Free',
        freeDesc: 'All calculators are absolutely free',
        fast: 'Fast',
        fastDesc: 'Instant calculations without waiting',
        privacy: 'Private',
        privacyDesc: 'Data never leaves your browser',
        mobile: 'Mobile',
        mobileDesc: 'Convenient on any device',
      },
    },
    calc: {
      clear: 'C',
      backspace: '⌫',
      equals: '=',
      history: 'History',
      noHistory: 'No calculations yet',
    },
    classic: {
      title: 'Classic Calculator',
      description: 'A simple and convenient calculator for everyday calculations',
    },
    engineering: {
      title: 'Engineering Calculator',
      description: 'Advanced math functions for complex calculations',
      deg: 'Degrees',
      rad: 'Radians',
      secondFn: '2nd',
    },
    mortgage: {
      title: 'Mortgage Calculator',
      description: 'Calculate monthly payments, overpayment, and payment schedule for your mortgage',
      loanAmount: 'Loan Amount (₽)',
      interestRate: 'Interest Rate (% per year)',
      loanTerm: 'Loan Term (years)',
      calculate: 'Calculate',
      monthlyPayment: 'Monthly Payment',
      totalPayment: 'Total Payment',
      totalInterest: 'Overpayment',
      annuity: 'Annuity',
      differentiated: 'Differentiated',
      schedule: 'Payment Schedule',
      year: 'Year',
      principal: 'Principal',
      interest: 'Interest',
      remaining: 'Remaining',
    },

    /* Credit Calculator */
    credit: {
      title: 'Credit Calculator',
      description: 'Calculate monthly payment, overpayment and loan repayment schedule',
      loanAmount: 'Loan amount',
      interestRate: 'Interest rate (% per year)',
      loanTerm: 'Loan term (years)',
      paymentType: 'Payment type',
      annuity: 'Annuity',
      differentiated: 'Differentiated',
      additionalCostsOptional: 'Additional costs (optional)',
      insurance: 'Insurance (₽)',
      disbursementFee: 'Disbursement fee (₽)',
      calculate: 'CALCULATE',
      reset: 'Reset',
      monthlyPayment: 'Monthly payment',
      paymentRange: 'from {from} to {to}',
      totalPayment: 'Total payment',
      totalInterest: 'Total interest',
      additionalCosts: 'Additional costs',
      insuranceLabel: 'Insurance',
      disbursementFeeLabel: 'Disbursement fee',
      totalCost: 'Total cost',
      paymentSchedule: 'Payment schedule',
      period: 'Period',
      colPayment: 'Payment, ₽',
      colPrincipal: 'Principal, ₽',
      colInterest: 'Interest, ₽',
      colBalance: 'Balance, ₽',
      hint: 'Fill in parameters and press «Calculate»',
    },

    /* Auto Credit Calculator */
    autoCredit: {
      title: 'Auto Loan Calculator',
      description: 'Calculate monthly payment, overpayment and total cost of your auto loan',
      carPrice: 'Car price',
      downPayment: 'Down payment',
      interestRate: 'Interest rate (% per year)',
      loanTerm: 'Loan term (years)',
      paymentType: 'Payment type',
      annuity: 'Annuity',
      differentiated: 'Differentiated',
      calculate: 'CALCULATE',
      reset: 'Reset',
      monthlyPayment: 'Monthly payment',
      paymentRange: 'from {from} to {to}',
      loanAmount: 'Loan amount',
      totalPayment: 'Total payment',
      totalInterest: 'Total interest',
      totalCarCost: 'Total car cost',
      pricePlusInterest: 'Price + interest',
      paymentSchedule: 'Payment schedule',
      period: 'Period',
      colPayment: 'Payment, ₽',
      colPrincipal: 'Principal, ₽',
      colInterest: 'Interest, ₽',
      colBalance: 'Balance, ₽',
      hint: 'Fill in parameters and press «Calculate»',
    },

    /* OSAGO */
    osago: {
      title: 'OSAGO Calculator',
      description: 'Estimate your OSAGO policy cost based on CBR formula',
    },
    fuel: {
      title: 'Fuel Cost Calculator',
      description: 'Calculate trip cost and fuel consumption',
      distance: 'Distance (km)',
      consumption: 'Consumption per 100 km (L)',
      fuelPrice: 'Price per liter (₽)',
      calculate: 'CALCULATE',
      liters: 'Required fuel volume',
      cost: 'Trip cost',
      litersUnit: 'L',
      costUnit: '₽',
      reset: 'Reset',
      details: 'Details',
      costPerKm: 'Cost per 1 km',
      costPer100km: 'Cost per 100 km',
      hint: 'Fill in the fields and press «Calculate»',
    },
    bmi: {
      title: 'BMI & Daily Calorie Calculator',
      description: 'Body mass index and daily calorie needs',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      age: 'Age (years)',
      activity: 'Activity Level',
      activityLevels: {
        sedentary: 'Sedentary (office work)',
        light: 'Light activity (1–3 times/week)',
        moderate: 'Moderate (3–5 times/week)',
        active: 'High activity (6–7 times/week)',
        veryActive: 'Very high (athlete)',
      },
      calculate: 'CALCULATE',
      bmiValue: 'Your BMI',
      bmiCategory: 'Category',
      categories: {
        underweight: 'Underweight',
        normal: 'Normal',
        overweight: 'Overweight',
        obese: 'Obese',
      },
      calories: 'Daily Calorie Needs',
      loseWeight: 'For weight loss',
      maintain: 'To maintain',
      gainWeight: 'To gain weight',
      kcal: 'kcal/day',
      targetWeight: 'Target weight (kg) — optional',
      reset: 'Reset',
      mifflinStJeor: 'Mifflin-St Jeor',
      bmr: 'BMR',
      withActivity: 'With activity',
      harrisBenedict: 'Harris-Benedict',
      loseWeightGoal: 'Lose weight',
      gainWeightGoal: 'Gain weight',
      targetDiff: 'by {diff} kg',
      recommendedDaily: 'Recommended daily intake for weight loss',
      currentMaintenance: 'Current maintenance',
      dailyDeficit: 'Daily deficit',
      estimatedTime: 'Estimated time',
      monthsAbbr: 'mo.',
      weeksAbbr: 'wk',
      safePace: 'Safe pace: ~0.5 kg/week. Minimum: 1,200 kcal/day',
      hint: 'Fill in your data and press «Calculate»',
    },
    wallpaper: {
      title: 'Wallpaper & Paint Calculator',
      description: 'Calculate the number of wallpaper rolls or paint cans',
      wallWidth: 'Wall width (m)',
      wallHeight: 'Wall height (m)',
      doorWidth: 'Door width (m)',
      doorHeight: 'Door height (m)',
      windowWidth: 'Window width (m)',
      windowHeight: 'Window height (m)',
      wallpaperWidth: 'Wallpaper roll width (m)',
      wallpaperLength: 'Roll length (m)',
      paintCoverage: 'Paint coverage (m²/L)',
      paintCapacity: 'Can volume (L)',
      calculate: 'Calculate',
      wallArea: 'Wall area',
      netArea: 'Net area',
      wallpaperRolls: 'Wallpaper rolls',
      paintCans: 'Paint cans',
      m2: 'm²',
      room: 'Room',
      width: 'Width (m)',
      length: 'Length (m)',
      wallHeightLabel: 'Wall height (m)',
      door: 'Door (W × H m)',
      window: 'Window (W × H m) × count',
      paint: 'Paint',
      rollParams: 'Roll parameters',
      paintParams: 'Paint parameters',
      calcBtn: 'CALCULATE',
      reset: 'Reset',
      netAreaDetail: 'minus {doorArea} m² door and {windowArea} m² windows',
      stripLength: 'Strip length',
      stripsCount: 'Strips count',
      totalLength: 'Total length',
      paintNeeded: 'Paint needed',
      extraPaint: 'Extra paint',
      fillDimensions: 'Fill in room dimensions to calculate',
      pcs: 'pcs.',
    },
    days: {
      title: 'Date Difference Calculator',
      description: 'Accurately count the number of days between two dates',
      startDate: 'Start date',
      endDate: 'End date',
      calculate: 'Calculate',
      calendarDays: 'Calendar days',
      weekdays: 'Working days',
      weekendDays: 'Weekend days',
      months: 'Months',
      years: 'Years',
      weeks: 'Weeks',
    },
    /* Password Generator */
    password: {
      title: 'Password Generator',
      description: 'Create a strong password to protect your accounts',
      passwordLength: 'Password length',
      characterTypes: 'Character types',
      uppercaseDesc: 'Uppercase letters',
      lowercaseDesc: 'Lowercase letters',
      digitsDesc: 'Digits',
      symbolsDesc: 'Symbols',
      generate: 'Generate',
      copied: 'Copied!',
      copy: 'Copy',
      yourPassword: 'Your password',
      passwordStrength: 'Password strength',
      crackTime: 'Crack time',
      recentPasswords: 'Recent passwords',
      strengthWeak: 'Weak',
      strengthFair: 'Fair',
      strengthGood: 'Good',
      strengthExcellent: 'Excellent',
      crackInstantly: 'Instantly',
      crackSec: '{value} sec.',
      crackMin: '{value} min.',
      crackHr: '{value} hr.',
      crackDays: '{value} days',
      crackYears: '{value} years',
      crackThousandYears: '{value}K years',
      crackMillionYears: '{value}M years',
      crackBillionYears: '{value}B years',
    },
    /* Vacation Days Calculator */
    vacation: {
      title: 'Vacation Days Calculator',
      description: 'Calculate unused vacation days and compensation',
      hireDate: 'Date of employment',
      calcDate: 'Calculation date',
      today: 'Today',
      excludedPeriodsLabel: 'Periods excluded from vacation seniority',
      excludedPeriodsTooltip: 'Childcare leave, absenteeism, etc.',
      excludePeriod: 'Exclude period',
      annualDuration: 'Annual vacation duration',
      annualDurationTooltip: 'Standard — 28 days (Art. 115 LC RF)',
      days: 'days',
      usedDays: 'Vacation days used during entire period',
      dailyEarnings: 'Average daily earnings',
      dailyEarningsTooltip: 'For compensation calculation',
      optional: 'optional',
      calcBtn: 'CALCULATE',
      reset: 'Reset',
      unusedDays: 'Unused vacation days',
      seniority: 'Seniority: {years} years {months} mo.',
      vacationSeniority: 'Vacation seniority',
      earnedDays: 'Earned days',
      seniorityBreakdown: 'Seniority breakdown',
      totalSeniority: 'Total seniority',
      excludedPeriods: 'Excluded periods',
      annualVacation: 'Annual vacation',
      daysPerYear: 'days/year',
      compensation: 'Termination compensation',
      daysTimes: 'days ×',
      disclaimer: '⚠️ Estimate based on Art. 115, 121 LC RF. Actual calculation may vary. Consult HR or legal counsel.',
      errorNoDates: 'Please enter dates to calculate',
    },
    /* Penalty Calculator */
    penalty: {
      title: 'Penalty Calculator',
      description: 'Calculate penalties for overdue taxes, contributions or utility bills, and salary delay compensation',
      calculateLabel: 'Calculate',
      typeTax: 'Penalties for taxes, fees and insurance contributions',
      typeSalary: 'Compensation for delayed salary payment',
      typeUtilities: 'Penalties for late utility payments',
      taxpayer: 'Taxpayer',
      individual: 'Individual',
      legalEntity: 'Legal entity',
      debtAmount: 'Debt amount',
      currency: 'RUB',
      dueDate: 'Due date',
      paymentDate: 'Payment date',
      today: 'Today',
      cbrRate: 'CBR rate (%)',
      cbrRateCurrent: 'Current rate as of {date} (updated daily)',
      cbrRateLoading: 'Loading rate from cbr.ru...',
      calcBtn: 'CALCULATE',
      reset: 'Reset',
      penaltyAmount: 'Penalty amount',
      daysOverdue: 'days overdue',
      totalToPay: 'Total to pay',
      penaltyBreakdown: 'Penalty breakdown',
      debtAmountLabel: 'Debt amount',
      daysOverdueLabel: 'Days overdue',
      cbrRateLabel: 'CBR rate',
      formulaSalary: 'Formula (Art. 236 LC RF)',
      formulaTax: 'Formula (Art. 75 TC RF)',
      penaltyCharged: 'Penalty charged',
      disclaimer: '⚠️ Estimate only. CBR rate may differ from the actual rate during the overdue period. Contact FTS or court for exact calculation.',
      errorNoData: 'Please enter amount and dates to calculate',
    },
    /* Income Tax Calculator */
    ndfl: {
      title: 'Income Tax Calculator',
      description: 'Calculate income tax at 13%/15% and net income with deductions',
    },
    /* VAT Calculator */
    nds: {
      title: 'VAT Calculator',
      description: 'Calculate VAT by adding or extracting from the amount',
    },
    /* Interest Calculator */
    interest: {
      title: 'Interest Calculator',
      description: 'Calculate deposit income or loan overpayment with simple and compound interest',
    },
    /* Utilization Fee Calculator */
    utilFee: {
      title: 'Utilization Fee Calculator',
      description: 'Calculate vehicle utilization fee for import to Russia',
    },
    /* Customs Clearance Calculator */
    customs: {
      title: 'Customs Clearance Calculator',
      description: 'Calculate full customs clearance cost when importing a vehicle to Russia',
    },
    footer: {
      copyright: '© {year} Calculator Center. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    modal: {
      privacyTitle: 'Privacy Policy',
      termsTitle: 'Terms of Service',
      close: 'Close',
    },
  },
};

export default translations;
