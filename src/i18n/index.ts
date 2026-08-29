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
 * Простая функция перевода по ключу вида "header.title"
 * Ищет вложенное значение в объекте перевода.
 */
export function t(key: string): string {
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

  return typeof result === 'string' ? result : key;
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
      calculate: 'Рассчитать',
      liters: 'Необходимый объём топлива',
      cost: 'Стоимость поездки',
      litersUnit: 'л',
      costUnit: '₽',
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
      calculate: 'Рассчитать',
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
      calculate: 'Calculate',
      liters: 'Required fuel volume',
      cost: 'Trip cost',
      litersUnit: 'L',
      costUnit: '₽',
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
      calculate: 'Calculate',
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
