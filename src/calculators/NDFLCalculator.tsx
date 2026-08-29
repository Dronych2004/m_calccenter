/**
 * Калькулятор НДФЛ (Налог на доходы физических лиц)
 *
 * Рассчитывает:
 * - Сумму налога по прогрессивной шкале (13% / 15%)
 * - Итоговую сумму "на руки"
 * - Применимые вычеты
 *
 * Формулы (НК РФ, ст. 224):
 *   НДФЛ = (Доход − Вычеты) × Ставка
 *
 * Ставки (2024+):
 *   ≤ 5 000 000 ₽/год  → 13%
 *   > 5 000 000 ₽/год  → 15%
 *
 * Стандартные вычеты (ст. 218 НК РФ):
 *   - 1 400 ₽/мес на первого и второго ребёнка
 *   - 3 000 ₽/мес на третьего и каждого следующего
 *   - 500 ₽/мес для инвалидов I и II группы
 *   Лимит дохода для вычетов на детей: 350 000 ₽/год
 */
import { useState, useEffect, useCallback } from 'react';
import { getLanguage } from '../i18n';

/* ==================== ТИПЫ ==================== */

/* Тип дохода: ежемесячный или годовой */
type IncomePeriod = 'monthly' | 'yearly';

/* Типы вычетов на детей */
type ChildDeductionType = 'first' | 'second' | 'third' | 'disabled';

/* Интерфейс ребёнка для вычета */
interface Child {
  id: string;
  type: ChildDeductionType;
}

/* Интерфейс результата расчёта */
interface NDFLResult {
  grossIncome: number;      /* Сумма дохода (годовая) */
  totalDeduction: number;   /* Общая сумма вычетов */
  taxableBase: number;      /* Налоговая база */
  taxAmount: number;        /* Сумма НДФЛ */
  netIncome: number;        /* Сумма на руки */
  effectiveRate: number;    /* Эффективная ставка (%) */
  childDeduction: number;   /* Вычет на детей (годовой) */
  standardDeduction: number;/* Стандартный вычет (годовой, инвалидность) */
}

/* ==================== КОНСТАНТЫ ==================== */

/* Порог прогрессивной шкалы (₽/год) */
const TAX_THRESHOLD = 5_000_000;

/* Ставки НДФЛ */
const RATE_LOW = 13;   /* Ставка до порога (%) */
const RATE_HIGH = 15;  /* Ставка сверх порога (%) */

/* Стандартные вычеты на детей (₽/мес) — ст. 218 НК РФ */
const CHILD_DEDUCTIONS: Record<ChildDeductionType, number> = {
  first: 1400,
  second: 1400,
  third: 3000,
  disabled: 12000, /* Для инвалидов I/II группы (родители/опекуны) */
};

/* Лимит дохода для вычетов на детей (₽/год) */
const CHILD_DEDUCTION_LIMIT = 350_000;

/* ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================== */

/**
 * Генерирует уникальный ID для списка детей
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Рассчитывает годовую сумму вычета на детей
 * с учётом лимита дохода 350 000 ₽/год
 *
 * Формула: min(Месячный вычет × Кол-во месяцев, Лимит)
 * Где "месяцев" = кол-во месяцев до достижения лимита
 */
function calcChildDeductionYearly(
  children: Child[],
  annualIncome: number,
): number {
  if (annualIncome <= 0 || children.length === 0) return 0;

  let totalMonthly = 0;
  for (const child of children) {
    totalMonthly += CHILD_DEDUCTIONS[child.type];
  }

  /* Кол-во месяцев, пока доход не превысит лимит */
  const months = Math.min(
    12,
    Math.max(0, Math.floor((CHILD_DEDUCTION_LIMIT - annualIncome / 12 < 0 ? 0 : 1))),
  );

  /* Более точный расчёт: считаем месяц за месяцем */
  const monthlyIncome = annualIncome / 12;
  let applicableMonths = 0;
  let cumulative = 0;

  for (let m = 0; m < 12; m++) {
    cumulative += monthlyIncome;
    if (cumulative <= CHILD_DEDUCTION_LIMIT) {
      applicableMonths++;
    } else {
      break;
    }
  }

  return totalMonthly * applicableMonths;
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function NDFLCalculator() {
  /* Период дохода: ежемесячный или годовой */
  const [period, setPeriod] = useState<IncomePeriod>('monthly');

  /* Сумма дохода (до вычетов) */
  const [income, setIncome] = useState('');

  /* Стандартный вычет (инвалидность) */
  const [hasDisability, setHasDisability] = useState(false);

  /* Список детей для вычета */
  const [children, setChildren] = useState<Child[]>([]);

  /* Флаг расчёта */
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<NDFLResult | null>(null);

  /* Тик для перерисовки при смене языка */
  const [, setLangTick] = useState(0);

  const lang = getLanguage();

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  /* ==================== ОБРАБОТКА СОБЫТИЙ ==================== */

  /**
   * Добавляет ребёнка в список для вычета
   * По умолчанию — первый ребёнок (1 400 ₽)
   */
  const addChild = () => {
    const type: ChildDeductionType =
      children.length === 0 ? 'first'
        : children.length === 1 ? 'second'
          : 'third';
    setChildren([...children, { id: generateId(), type }]);
  };

  /**
   * Удаляет ребёнка из списка
   */
  const removeChild = (id: string) => {
    setChildren(children.filter((c) => c.id !== id));
  };

  /**
   * Меняет тип вычета для ребёнка
   */
  const updateChildType = (id: string, type: ChildDeductionType) => {
    setChildren(children.map((c) => (c.id === id ? { ...c, type } : c)));
  };

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  const calculate = useCallback((): NDFLResult | null => {
    const val = parseFloat(income);
    if (!val || val <= 0) return null;

    /* Переводим годовой доход */
    const annualIncome = period === 'monthly' ? val * 12 : val;

    /* Вычет на детей (годовой) */
    const childDeduction = calcChildDeductionYearly(children, annualIncome);

    /* Стандартный вычет инвалидности: 500 ₽/мес × 12 = 6 000 ₽/год */
    const standardDeduction = hasDisability ? 500 * 12 : 0;

    /* Общая сумма вычетов */
    const totalDeduction = childDeduction + standardDeduction;

    /* Налоговая база (не может быть отрицательной) */
    const taxableBase = Math.max(0, annualIncome - totalDeduction);

    /**
     * Прогрессивная шкала НДФЛ (ст. 224 НК РФ):
     * - 13% на сумму до 5 000 000 ₽
     * - 15% на сумму свыше 5 000 000 ₽
     */
    let taxAmount: number;
    if (taxableBase <= TAX_THRESHOLD) {
      taxAmount = taxableBase * (RATE_LOW / 100);
    } else {
      /* 13% на первые 5 млн + 15% на остаток */
      taxAmount =
        TAX_THRESHOLD * (RATE_LOW / 100) +
        (taxableBase - TAX_THRESHOLD) * (RATE_HIGH / 100);
    }

    /* Итого на руки */
    const netIncome = annualIncome - taxAmount;

    /* Эффективная ставка */
    const effectiveRate = annualIncome > 0
      ? (taxAmount / annualIncome) * 100
      : 0;

    return {
      grossIncome: annualIncome,
      totalDeduction,
      taxableBase,
      taxAmount,
      netIncome,
      effectiveRate,
      childDeduction,
      standardDeduction,
    };
  }, [income, period, hasDisability, children]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  /**
   * Сброс всех полей к начальным значениям
   */
  const handleReset = () => {
    setPeriod('monthly');
    setIncome('');
    setHasDisability(false);
    setChildren([]);
    setCalculated(false);
    setResult(null);
  };

  /* ==================== ФОРМАТИРОВАНИЕ ==================== */

  const formatCurrency = (value: number): string => {
    return Math.round(value).toLocaleString('ru-RU') + ' ₽';
  };

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Калькулятор НДФЛ' : 'Income Tax Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте подоходный налог 13%/15% и сумму на руки с учётом вычетов'
            : 'Calculate income tax at 13%/15% and net income with deductions'}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Период дохода */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
            {lang === 'ru' ? 'Получаю доход' : 'Income period'}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('monthly')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                period === 'monthly'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {lang === 'ru' ? 'Ежемесячно' : 'Monthly'}
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                period === 'yearly'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {lang === 'ru' ? 'Ежегодно' : 'Yearly'}
            </button>
          </div>
        </div>

        {/* Сумма дохода */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
            {lang === 'ru' ? 'Сумма до вычета НДФЛ' : 'Gross income'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="decimal"
              value={income}
              onChange={(e) => setIncome(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">₽/{period === 'monthly' ? 'мес' : 'год'}</span>
          </div>
        </div>

        {/* Стандартный вычет — инвалидность */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
            <span className="flex items-center gap-1.5">
              {lang === 'ru' ? 'Стандартный вычет' : 'Standard deduction'}
              <span
                className="text-slate-300"
                title={lang === 'ru'
                  ? 'Инвалиды I и II группы: 500 ₽/мес (ст. 218 НК РФ)'
                  : 'Disability I and II groups: 500 ₽/month (Art. 218 Tax Code)'}
              >
                ⓘ
              </span>
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDisability}
              onChange={(e) => setHasDisability(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">
              {lang === 'ru' ? 'Инвалид I или II группы' : 'Disability group I or II'}
            </span>
          </label>
        </div>

        {/* Вычеты на детей */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
              <span className="flex items-center gap-1.5">
                {lang === 'ru' ? 'Вычеты на детей' : 'Child deductions'}
                <span
                  className="text-slate-300"
                  title={lang === 'ru'
                    ? '1 400 ₽/мес — 1-й и 2-й ребёнок, 3 000 ₽/мес — 3-й и далее, 12 000 ₽/мес — инвалид. Лимит: 350 000 ₽/год'
                    : '1,400 ₽/mo — 1st and 2nd child, 3,000 ₽/mo — 3rd+, 12,000 ₽/mo — disabled. Limit: 350,000 ₽/year'}
                >
                  ⓘ
                </span>
              </span>
            </label>
            <button
              onClick={addChild}
              className="text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              + {lang === 'ru' ? 'Добавить ребёнка' : 'Add child'}
            </button>
          </div>

          {children.length > 0 && (
            <div className="space-y-2">
              {children.map((child, index) => (
                <div key={child.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-6">#{index + 1}</span>
                  <select
                    value={child.type}
                    onChange={(e) => updateChildType(child.id, e.target.value as ChildDeductionType)}
                    className="flex-1 max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  >
                    <option value="first">
                      {lang === 'ru' ? '1-й или 2-й ребёнок — 1 400 ₽/мес' : '1st or 2nd child — 1,400 ₽/mo'}
                    </option>
                    <option value="second">
                      {lang === 'ru' ? '1-й или 2-й ребёнок — 1 400 ₽/мес' : '1st or 2nd child — 1,400 ₽/mo'}
                    </option>
                    <option value="third">
                      {lang === 'ru' ? '3-й и далее — 3 000 ₽/мес' : '3rd and more — 3,000 ₽/mo'}
                    </option>
                    <option value="disabled">
                      {lang === 'ru' ? 'Ребёнок-инвалид — 12 000 ₽/мес' : 'Disabled child — 12,000 ₽/mo'}
                    </option>
                  </select>
                  <button
                    onClick={() => removeChild(child.id)}
                    className="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-all text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 active:scale-[0.98] transition-all"
          >
            {lang === 'ru' ? 'РАССЧИТАТЬ' : 'CALCULATE'}
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
          >
            {lang === 'ru' ? 'Сбросить' : 'Reset'}
          </button>
        </div>
      </div>

      {/* РЕЗУЛЬТАТЫ */}
      {calculated && result ? (
        <div className="mt-6 space-y-4 animate-fade-in">
          {/* Сумма на руки — главная карточка */}
          <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <p className="text-sm font-medium text-white/70 mb-1">
              {lang === 'ru' ? 'Итого на руки (за год)' : 'Net income (per year)'}
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatCurrency(result.netIncome)}
            </p>
            <p className="text-sm text-white/60 mt-2">
              {lang === 'ru' ? `Эффективная ставка: ${result.effectiveRate.toFixed(1)}%` : `Effective rate: ${result.effectiveRate.toFixed(1)}%`}
            </p>
          </div>

          {/* Сумма НДФЛ */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Сумма НДФЛ (за год)' : 'Income tax (per year)'}
            </p>
            <p className="text-xl font-bold text-rose-500">
              {formatCurrency(result.taxAmount)}
            </p>
          </div>

          {/* Доход до вычетов */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Доход до вычета НДФЛ' : 'Gross income'}
            </p>
            <p className="text-xl font-bold text-slate-800">
              {formatCurrency(result.grossIncome)}
            </p>
          </div>

          {/* Налоговая база */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Налоговая база' : 'Taxable base'}
            </p>
            <p className="text-xl font-bold text-indigo-600">
              {formatCurrency(result.taxableBase)}
            </p>
          </div>

          {/* Детали вычетов (если есть) */}
          {result.totalDeduction > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                {lang === 'ru' ? 'Применённые вычеты' : 'Applied deductions'}
              </p>
              <div className="space-y-2.5">
                {result.standardDeduction > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Стандартный (инвалидность)' : 'Standard (disability)'}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      −{formatCurrency(result.standardDeduction)}
                    </span>
                  </div>
                )}
                {result.childDeduction > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'На детей' : 'Child deduction'}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      −{formatCurrency(result.childDeduction)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {lang === 'ru' ? 'Итого вычетов' : 'Total deductions'}
                  </span>
                  <span className="font-bold text-emerald-600">
                    −{formatCurrency(result.totalDeduction)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ставки НДФЛ */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Прогрессивная шкала' : 'Progressive scale'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'До 5 000 000 ₽/год' : 'Up to 5,000,000 ₽/year'}
                </span>
                <span className="font-semibold text-slate-700">13%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'Свыше 5 000 000 ₽/год' : 'Over 5,000,000 ₽/year'}
                </span>
                <span className="font-semibold text-slate-700">15%</span>
              </div>
            </div>
          </div>

          {/* Примечание */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              {lang === 'ru'
                ? '⚠️ Расчёт приблизительный. Реальная сумма НДФЛ зависит от вычетов, льгот и налогового периода. Обратитесь к бухгалтеру или в ФНС для точного расчёта.'
                : '⚠️ Estimate only. Actual tax depends on deductions, benefits and tax period. Consult an accountant or FTS for exact calculation.'}
            </p>
          </div>
        </div>
      ) : (
        /* Подсказка */
        <div className="mt-6 bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-slate-300 mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {lang === 'ru'
              ? 'Введите доход и нажмите «Рассчитать»'
              : 'Enter income and press «Calculate»'}
          </p>
        </div>
      )}
    </div>
  );
}
