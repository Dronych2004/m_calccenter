/**
 * Калькулятор НДФЛ (Налог на доходы физических лиц)
 *
 * Рассчитывает:
 * - Сумму налога для разных видов дохода
 * - Прогрессивную шкалу (13% / 15%)
 * - Ставку 35% для призов/выигрышей
 * - Вычеты на детей и инвалидность
 *
 * Виды дохода и ставки (НК РФ, ст. 224):
 *   Зарплата, аренда, продажа имущества, ЦБ, дивиденды, вклады → 13% / 15%
 *   Призы/выигрыши → 35% (без прогрессивной шкалы)
 *   СВО-выплаты → 13% / 15% (по основной ставке)
 *
 * Стандартные вычеты (ст. 218 НК РФ):
 *   - 1 400 ₽/мес на 1-го и 2-го ребёнка
 *   - 3 000 ₽/мес на 3-го и далее
 *   - 12 000 ₽/мес на ребёнка-инвалида
 *   - 500 ₽/мес для инвалидов I и II группы
 *   Лимит дохода для вычетов на детей: 350 000 ₽/год
 *
 * Примечание:
 *   Вычеты на детей и инвалидность применяются только к основной ставке (13%/15%),
 *   не к 35%. Для 35% вычеты не предусмотрены.
 */
import { useState, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import { formatCurrency } from '../lib/format';
import SeoContent from '../components/SeoContent';
import SeoHead from '../components/SeoHead';

/* ==================== ТИПЫ ==================== */

/* Вид дохода — ключи для объекта INCOME_TYPES */
type IncomeType = 'salary' | 'svo' | 'property' | 'rental' | 'securities' | 'dividends' | 'deposits' | 'prize' | 'ad_prize' | 'custom';

/* Период дохода */
type IncomePeriod = 'monthly' | 'yearly';

/* Типы вычетов на детей */
type ChildDeductionType = 'first' | 'second' | 'third' | 'disabled';

/* Интерфейс ребёнка для вычета */
interface Child {
  id: string;
  type: ChildDeductionType;
}

/* Описание вида дохода */
interface IncomeTypeInfo {
  labelRu: string;
  labelEn: string;
  /* Ставка: number — фиксированная, null — прогрессивная шкала */
  rate: number | null;
  /* Можно ли применять вычеты к этому виду дохода */
  allowsDeductions: boolean;
}

/* Интерфейс результата расчёта */
interface NDFLResult {
  grossIncome: number;
  totalDeduction: number;
  taxableBase: number;
  taxAmount: number;
  netIncome: number;
  effectiveRate: number;
  childDeduction: number;
  standardDeduction: number;
  monthlyGross: number;
  monthlyTax: number;
  monthlyNet: number;
  monthlyDeduction: number;
  appliedRate: number; /* Какая ставка была применена (%) */
}

/* ==================== КОНСТАНТЫ ==================== */

/* Порог прогрессивной шкалы (₽/год) */
const TAX_THRESHOLD = 5_000_000;

/* Стандартные вычеты на детей (₽/мес) — ст. 218 НК РФ */
const CHILD_DEDUCTIONS: Record<ChildDeductionType, number> = {
  first: 1400,
  second: 1400,
  third: 3000,
  disabled: 12000,
};

/* Лимит дохода для вычетов на детей (₽/год) */
const CHILD_DEDUCTION_LIMIT = 350_000;

/* Виды дохода с описаниями и ставками */
const INCOME_TYPES: Record<IncomeType, IncomeTypeInfo> = {
  salary: {
    labelRu: 'Заработная плата',
    labelEn: 'Salary / wages',
    rate: null, /* Прогрессивная шкала: 13% / 15% */
    allowsDeductions: true,
  },
  svo: {
    labelRu: 'Выплаты, связанные с СВО',
    labelEn: 'Payments related to SMO',
    rate: null, /* Прогрессивная шкала: 13% / 15% */
    allowsDeductions: true,
  },
  property: {
    labelRu: 'Доход с продажи имущества',
    labelEn: 'Income from property sale',
    rate: null, /* Прогрессивная шкала: 13% / 15% */
    allowsDeductions: false, /* Вычеты на детей не применяются */
  },
  rental: {
    labelRu: 'Доход с аренды',
    labelEn: 'Rental income',
    rate: null, /* Прогрессивная шкала: 13% / 15% */
    allowsDeductions: false,
  },
  securities: {
    labelRu: 'Доход по операциям с ценными бумагами',
    labelEn: 'Securities income',
    rate: null, /* Прогрессивная шкала: 13% / 15% */
    allowsDeductions: false,
  },
  dividends: {
    labelRu: 'Дивиденды',
    labelEn: 'Dividends',
    rate: null, /* Прогрессивная шкала: 13% / 15% */
    allowsDeductions: false,
  },
  deposits: {
    labelRu: 'Проценты по вкладам',
    labelEn: 'Deposit interest',
    rate: null, /* Прогрессивная шкала: 13% / 15% */
    allowsDeductions: false,
  },
  prize: {
    labelRu: 'Приз / выигрыш',
    labelEn: 'Prize / winnings',
    rate: 35, /* Фиксированная ставка 35% */
    allowsDeductions: false,
  },
  ad_prize: {
    labelRu: 'Приз / выигрыш в мероприятии рекламного характера',
    labelEn: 'Prize in promotional event',
    rate: 35, /* Фиксированная ставка 35% */
    allowsDeductions: false,
  },
  custom: {
    labelRu: 'Указать ставку вручную',
    labelEn: 'Set rate manually',
    rate: 0, /* Задаётся пользователем */
    allowsDeductions: false,
  },
};

/* ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================== */

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Рассчитывает годовую сумму вычета на детей
 * с учётом лимита дохода 350 000 ₽/год
 */
function calcChildDeductionYearly(children: Child[], annualIncome: number): number {
  if (annualIncome <= 0 || children.length === 0) return 0;

  let totalMonthly = 0;
  for (const child of children) {
    totalMonthly += CHILD_DEDUCTIONS[child.type];
  }

  /* Считаем месяц за месяцем, пока накопленный доход ≤ лимита */
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
  /* Вид дохода */
  const [incomeType, setIncomeType] = useState<IncomeType>('salary');

  /* Период дохода */
  const [period, setPeriod] = useState<IncomePeriod>('monthly');

  /* Сумма дохода */
  const [income, setIncome] = useState('');

  /* Пользовательская ставка (только для типа 'custom') */
  const [customRate, setCustomRate] = useState('13');

  /* Стандартный вычет (инвалидность) */
  const [hasDisability, setHasDisability] = useState(false);

  /* Список детей для вычета */
  const [children, setChildren] = useState<Child[]>([]);

  /* Флаг расчёта */
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<NDFLResult | null>(null);

  const lang = useLanguage();

  /* Текущая информация о виде дохода */
  const currentType = INCOME_TYPES[incomeType];

  /* Определяем, применять ли прогрессивную шкалу */
  const useProgressiveScale = currentType.rate === null;

  /* Определяем, применять ли вычеты */
  const canApplyDeductions = currentType.allowsDeductions;

  /* ==================== ОБРАБОТКА СОБЫТИЙ ==================== */

  const addChild = () => {
    const type: ChildDeductionType =
      children.length === 0 ? 'first'
        : children.length === 1 ? 'second'
          : 'third';
    setChildren([...children, { id: generateId(), type }]);
  };

  const removeChild = (id: string) => {
    setChildren(children.filter((c) => c.id !== id));
  };

  const updateChildType = (id: string, type: ChildDeductionType) => {
    setChildren(children.map((c) => (c.id === id ? { ...c, type } : c)));
  };

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  const calculate = useCallback((): NDFLResult | null => {
    const val = parseFloat(income);
    if (!val || val <= 0) return null;

    const annualIncome = period === 'monthly' ? val * 12 : val;

    /**
     * Вычеты применяются ТОЛЬКО к основной ставке (13%/15%)
     * и ТОЛЬКО для видов дохода, где allowsDeductions = true
     */
    let childDeduction = 0;
    let standardDeduction = 0;
    let totalDeduction = 0;

    if (canApplyDeductions) {
      childDeduction = calcChildDeductionYearly(children, annualIncome);
      standardDeduction = hasDisability ? 500 * 12 : 0;
      totalDeduction = childDeduction + standardDeduction;
    }

    /* Налоговая база */
    const taxableBase = Math.max(0, annualIncome - totalDeduction);

    /* Определяем ставку и считаем налог */
    let taxAmount: number;
    let appliedRate: number;

    if (useProgressiveScale) {
      /**
       * Прогрессивная шкала (ст. 224 НК РФ):
       * 13% до 5 млн, 15% сверх
       */
      if (taxableBase <= TAX_THRESHOLD) {
        taxAmount = taxableBase * 0.13;
        appliedRate = 13;
      } else {
        taxAmount = TAX_THRESHOLD * 0.13 + (taxableBase - TAX_THRESHOLD) * 0.15;
        appliedRate = 15;
      }
    } else {
      /* Фиксированная ставка (35% для призов или пользовательская) */
      const rate = incomeType === 'custom' ? parseFloat(customRate) || 0 : currentType.rate!;
      taxAmount = taxableBase * (rate / 100);
      appliedRate = rate;
    }

    const netIncome = annualIncome - taxAmount;
    const effectiveRate = annualIncome > 0 ? (taxAmount / annualIncome) * 100 : 0;

    return {
      grossIncome: annualIncome,
      totalDeduction,
      taxableBase,
      taxAmount,
      netIncome,
      effectiveRate,
      childDeduction,
      standardDeduction,
      monthlyGross: annualIncome / 12,
      monthlyTax: taxAmount / 12,
      monthlyNet: netIncome / 12,
      monthlyDeduction: totalDeduction / 12,
      appliedRate,
    };
  }, [income, period, hasDisability, children, incomeType, customRate, canApplyDeductions, useProgressiveScale, currentType]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  const handleReset = () => {
    setIncomeType('salary');
    setPeriod('monthly');
    setIncome('');
    setCustomRate('13');
    setHasDisability(false);
    setChildren([]);
    setCalculated(false);
    setResult(null);
  };

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      <SeoHead
        title={lang === 'ru' ? 'Калькулятор НДФЛ онлайн — бесплатно | CalcCenter' : 'Income Tax Calculator Online — Free | CalcCenter'}
        description={lang === 'ru'
          ? 'Бесплатный онлайн калькулятор НДФЛ (13%/15%). Рассчитайте подоходный налог с учётом вычетов на детей.'
          : 'Free online income tax calculator (13%/15%). Calculate income tax with child deductions.'}
        canonical="https://calccenter.ru/ndfl"
      />
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Калькулятор НДФЛ' : 'Income Tax Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте НДФЛ с вашего дохода с учётом прогрессивной шкалы налогообложения'
            : 'Calculate income tax with progressive taxation scale'}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Вид дохода */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
            {lang === 'ru' ? 'Вид дохода' : 'Income type'}
          </label>
          <select
            value={incomeType}
            onChange={(e) => setIncomeType(e.target.value as IncomeType)}
            className="flex-1 max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          >
            {(Object.keys(INCOME_TYPES) as IncomeType[]).map((key) => (
              <option key={key} value={key}>
                {lang === 'ru' ? INCOME_TYPES[key].labelRu : INCOME_TYPES[key].labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Подсказка по ставке */}
        <div className="mb-6 bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400">
            {useProgressiveScale
              ? (lang === 'ru'
                ? 'Прогрессивная шкала: 13% до 5 000 000 ₽/год, 15% сверх. Вычеты применяются.'
                : 'Progressive scale: 13% up to 5,000,000 ₽/year, 15% above. Deductions apply.')
              : (lang === 'ru'
                ? `Фиксированная ставка: ${incomeType === 'custom' ? customRate : currentType.rate}%${
                    !canApplyDeductions ? '. Вычеты не применяются.' : ''
                  }`
                : `Fixed rate: ${incomeType === 'custom' ? customRate : currentType.rate}%${
                    !canApplyDeductions ? '. No deductions apply.' : ''}`)}
          </p>
        </div>

        {/* Пользовательская ставка (только для типа 'custom') */}
        {incomeType === 'custom' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
              {lang === 'ru' ? 'Ставка НДФЛ' : 'Tax rate'}
            </label>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <input
                type="text"
                inputMode="decimal"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                placeholder="13"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
              <span className="text-sm text-slate-400">%</span>
            </div>
          </div>
        )}

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
            {lang === 'ru' ? 'Доход' : 'Income'}
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

        {/* Налоговый вычет — только для видов с allowsDeductions */}
        {canApplyDeductions && (
          <>
            {/* Стандартный вычет — инвалидность */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
                <span className="flex items-center gap-1.5">
                  {lang === 'ru' ? 'Налоговый вычет' : 'Tax deduction'}
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
                        ? '1 400 ₽/мес — 1-й и 2-й, 3 000 ₽/мес — 3-й+, 12 000 ₽/мес — инвалид. Лимит: 350 000 ₽/год'
                        : '1,400 ₽/mo — 1st/2nd, 3,000 ₽/mo — 3rd+, 12,000 ₽/mo — disabled. Limit: 350,000 ₽/year'}
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
          </>
        )}

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
          {/* Итого на руки — главная карточка */}
          <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <p className="text-sm font-medium text-white/70 mb-1">
              {lang === 'ru' ? 'Итого на руки' : 'Net income'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-white/50 mb-1">{lang === 'ru' ? 'за месяц' : 'per month'}</p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {formatCurrency(result.monthlyNet)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/50 mb-1">{lang === 'ru' ? 'за год' : 'per year'}</p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {formatCurrency(result.netIncome)}
                </p>
              </div>
            </div>
            <p className="text-sm text-white/60 mt-3 text-center">
              {lang === 'ru'
                ? `${lang === 'ru' ? INCOME_TYPES[incomeType].labelRu : INCOME_TYPES[incomeType].labelEn} — ставка ${result.appliedRate}%`
                : `${INCOME_TYPES[incomeType].labelEn} — rate ${result.appliedRate}%`}
            </p>
          </div>

          {/* Сумма НДФЛ */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Сумма НДФЛ' : 'Income tax'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">{lang === 'ru' ? 'за месяц' : 'per month'}</p>
                <p className="text-xl font-bold text-rose-500">{formatCurrency(result.monthlyTax)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">{lang === 'ru' ? 'за год' : 'per year'}</p>
                <p className="text-xl font-bold text-rose-500">{formatCurrency(result.taxAmount)}</p>
              </div>
            </div>
          </div>

          {/* Доход до вычетов */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Доход до вычета НДФЛ' : 'Gross income'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">{lang === 'ru' ? 'за месяц' : 'per month'}</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(result.monthlyGross)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">{lang === 'ru' ? 'за год' : 'per year'}</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(result.grossIncome)}</p>
              </div>
            </div>
          </div>

          {/* Налоговая база */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{lang === 'ru' ? 'Налоговая база' : 'Taxable base'}</p>
            <p className="text-xl font-bold text-indigo-600">{formatCurrency(result.taxableBase)}</p>
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
                    <span className="text-slate-500">{lang === 'ru' ? 'Стандартный (инвалидность)' : 'Standard (disability)'}</span>
                    <span className="font-semibold text-emerald-600">−{formatCurrency(result.standardDeduction)}</span>
                  </div>
                )}
                {result.childDeduction > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{lang === 'ru' ? 'На детей' : 'Child deduction'}</span>
                    <span className="font-semibold text-emerald-600">−{formatCurrency(result.childDeduction)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">{lang === 'ru' ? 'Итого вычетов' : 'Total deductions'}</span>
                  <span className="font-bold text-emerald-600">−{formatCurrency(result.totalDeduction)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Ставки НДФЛ — таблица */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Ставки НДФЛ (ст. 224 НК РФ)' : 'Tax rates (Art. 224 Tax Code)'}
            </p>
            <div className="space-y-2">
              {[
                { rate: '13%', descRu: 'Зарплата, аренда, продажа имущества, ЦБ, дивиденды, вклады (до 5 млн ₽/год)', descEn: 'Salary, rental, property, securities, dividends, deposits (up to 5M ₽/yr)' },
                { rate: '15%', descRu: 'То же, свыше 5 000 000 ₽/год', descEn: 'Same, over 5,000,000 ₽/year' },
                { rate: '35%', descRu: 'Призы, выигрыши, рекламные мероприятия', descEn: 'Prizes, winnings, promotional events' },
              ].map((item) => (
                <div key={item.rate} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{lang === 'ru' ? item.descRu : item.descEn}</span>
                  <span className="font-semibold text-slate-700">{item.rate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Примечание */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              {lang === 'ru'
                ? '⚠️ Расчёт приблизительный. Реальная сумма НДФЛ зависит от вычетов, льгот и налогового периода. Обратитесь к бухгалтеру или в ФНС.'
                : '⚠️ Estimate only. Actual tax depends on deductions, benefits and tax period. Consult an accountant or FTS.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-slate-300 mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {lang === 'ru'
              ? 'Выберите вид дохода, введите сумму и нажмите «Рассчитать»'
              : 'Select income type, enter amount and press «Calculate»'}
          </p>
        </div>
      )}

      <SeoContent title={lang === 'ru' ? 'О НДФЛ' : 'About Income Tax Calculator'} description={lang === 'ru' ? 'Калькулятор НДФЛ (налога на доходы физических лиц) рассчитывает сумму подоходного налога и вычетов. В России стандартная ставка НДФЛ — 13%, для доходов свыше 5 млн ₽ в год — 15%.\n\nКалькулятор учитывает налоговые вычеты: стандартный (на детей), социальный (на обучение, лечение) и имущественный (на покупку жилья).\n\nВведите ваш ежемесячный доход и выберите applicable вычеты.' : 'The NDFL calculator calculates personal income tax and deductions. In Russia, the standard rate is 13%, over 5 million ₽ — 15%.'} formula={{ title: 'Формула НДФЛ', text: 'НДФЛ = (Доход − Вычеты) × 13%' }} faq={[{ q: lang === 'ru' ? 'Кто имеет право на вычет по НДФЛ?' : 'Who is entitled to NDFL deductions?', a: 'Родители несовершеннолетних детей, лица на обучение/лечение, покупатели жилья.' }]} />
    </div>
  );
}
