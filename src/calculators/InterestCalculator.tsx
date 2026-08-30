/**
 * Калькулятор процентов (вклад / кредит)
 *
 * Рассчитывает:
 * - Простые проценты (без капитализации)
 * - Сложные проценты (с капитализацией)
 * - Итоговую сумму и прибыль
 *
 * Формулы:
 *
 * Простые проценты (Art. 807-808 ГК РФ):
 *   I = P × r × t
 *   Итого = P + I
 *   где: P — начальная сумма, r — годовая ставка (decimal), t — время (годы)
 *
 * Сложные проценты (капитализация):
 *   A = P × (1 + r/n)^(n×t)
 *   Прибыль = A − P
 *   где: n — частота капитализации в год
 *        (12 — ежемесячно, 4 — ежеквартально, 1 — ежегодно)
 */
import { useState, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import SeoContent from '../components/SeoContent';
import SeoHead from '../components/SeoHead';

/* ==================== ТИПЫ ==================== */

/* Интерфейс результата */
interface InterestResult {
  principal: number;       /* Начальная сумма (₽) */
  rate: number;            /* Годовая ставка (%) */
  termYears: number;       /* Срок (годы) */
  termMonths: number;      /* Срок (месяцы) */
  simpleInterest: number;  /* Прибыль по простым процентам */
  simpleTotal: number;     /* Итого по простым процентам */
  compoundInterest: number;/* Прибыль по сложным процентам */
  compoundTotal: number;   /* Итого по сложным процентам */
  compoundFrequency: number; /* Частота капитализации (раз/год) */
}

/* ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================== */

import { formatCurrency } from '../lib/format';

/**
 * Форматирует число с двумя знаками после запятой
 */
function formatDecimal(value: number): string {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function InterestCalculator() {
  /* Начальная сумма */
  const [principal, setPrincipal] = useState('');

  /* Годовая ставка (%) */
  const [rate, setRate] = useState('');

  /* Срок: месяцы */
  const [termMonths, setTermMonths] = useState('12');

  /* Частота капитализации (12=мес, 4=кварт, 1=год) */
  const [compoundFrequency, setCompoundFrequency] = useState(12);

  /* Флаг расчёта */
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<InterestResult | null>(null);

  const lang = useLanguage();

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  /**
   * Рассчитывает простые и сложные проценты
   */
  const calculate = useCallback((): InterestResult | null => {
    const P = parseFloat(principal);
    const r = parseFloat(rate);
    const months = parseInt(termMonths);

    /* Валидация: сумма и ставка обязательны, срок > 0 */
    if (!P || P <= 0 || !r || r <= 0 || !months || months <= 0) return null;

    const years = months / 12;

    /* ---- Простые проценты ---- */
    /* Формула: I = P × (r/100) × years */
    const simpleInterest = P * (r / 100) * years;
    const simpleTotal = P + simpleInterest;

    /* ---- Сложные проценты (капитализация) ---- */
    /* Формула: A = P × (1 + r/(100×n))^(n×years) */
    const n = compoundFrequency;
    const rDecimal = r / 100;
    const compoundTotal = P * Math.pow(1 + rDecimal / n, n * years);
    const compoundInterest = compoundTotal - P;

    return {
      principal: P,
      rate: r,
      termYears: years,
      termMonths: months,
      simpleInterest,
      simpleTotal,
      compoundInterest,
      compoundTotal,
      compoundFrequency: n,
    };
  }, [principal, rate, termMonths, compoundFrequency]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  /**
   * Сброс всех полей
   */
  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setTermMonths('12');
    setCompoundFrequency(12);
    setCalculated(false);
    setResult(null);
  };

  /* ==================== РЕНДЕР ==================== */

  /* Метки частоты капитализации */
  const frequencyLabels: Record<number, { ru: string; en: string }> = {
    12: { ru: 'Ежемесячно (12 раз/год)', en: 'Monthly (12x/year)' },
    4: { ru: 'Ежеквартально (4 раза/год)', en: 'Quarterly (4x/year)' },
    1: { ru: 'Ежегодно (1 раз/год)', en: 'Yearly (1x/year)' },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      <SeoHead
        title={lang === 'ru' ? 'Процентный калькулятор онлайн — бесплатно | CalcCenter' : 'Interest Calculator Online — Free | CalcCenter'}
        description={lang === 'ru'
          ? 'Бесплатный онлайн процентный калькулятор. Рассчитайте простые и сложные проценты с учётом капитализации.'
          : 'Free online interest calculator. Calculate simple and compound interest with capitalization.'}
        canonical="https://calccenter.ru/interest"
      />
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Калькулятор процентов' : 'Interest Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте прибыль по вкладу или переплату по кредиту с простыми и сложными процентами'
            : 'Calculate deposit income or loan overpayment with simple and compound interest'}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Начальная сумма */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Начальная сумма' : 'Principal'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="decimal"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">₽</span>
          </div>
        </div>

        {/* Годовая ставка */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Годовая ставка' : 'Annual rate'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">%</span>
          </div>
        </div>

        {/* Срок */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Срок' : 'Term'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="numeric"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">{lang === 'ru' ? 'мес.' : 'mo.'}</span>
          </div>
        </div>

        {/* Частота капитализации */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-600 mb-3">
            {lang === 'ru' ? 'Капитализация процентов' : 'Interest compounding'}
          </label>
          <div className="space-y-2">
            {(Object.keys(frequencyLabels) as unknown as number[]).map((freq) => (
              <button
                key={freq}
                onClick={() => setCompoundFrequency(freq)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  compoundFrequency === freq
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                    : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
                }`}
              >
                {lang === 'ru' ? frequencyLabels[freq].ru : frequencyLabels[freq].en}
              </button>
            ))}
          </div>
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
          {/* Сравнение: Простые vs Сложные — главная карточка */}
          <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
            <div className="grid grid-cols-2 gap-4">
              {/* Простые */}
              <div className="text-center">
                <p className="text-xs font-medium text-white/60 mb-1">
                  {lang === 'ru' ? 'Простые проценты' : 'Simple interest'}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {formatCurrency(result.simpleTotal)}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  +{formatCurrency(result.simpleInterest)}
                </p>
              </div>

              {/* Сложные */}
              <div className="text-center">
                <p className="text-xs font-medium text-white/60 mb-1">
                  {lang === 'ru' ? 'Сложные проценты' : 'Compound interest'}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {formatCurrency(result.compoundTotal)}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  +{formatCurrency(result.compoundInterest)}
                </p>
              </div>
            </div>

            {/* Разница */}
            <div className="mt-4 text-center border-t border-white/20 pt-4">
              <p className="text-xs text-white/60">
                {lang === 'ru' ? 'Выгода от капитализации' : 'Benefit from compounding'}
              </p>
              <p className="text-lg font-bold text-emerald-300">
                +{formatCurrency(result.compoundInterest - result.simpleInterest)}
              </p>
            </div>
          </div>

          {/* Начальная сумма */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Начальная сумма' : 'Principal'}
            </p>
            <p className="text-xl font-bold text-slate-800">
              {formatCurrency(result.principal)}
            </p>
          </div>

          {/* Простые проценты — детали */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Простые проценты' : 'Simple interest'}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'Ставка' : 'Rate'}
                </span>
                <span className="font-semibold text-slate-700">{result.rate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'Срок' : 'Term'}
                </span>
                <span className="font-semibold text-slate-700">
                  {result.termMonths} {lang === 'ru' ? 'мес.' : 'mo.'} ({formatDecimal(result.termYears)} {lang === 'ru' ? 'год' : 'yr'})
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'Формула' : 'Formula'}
                </span>
                <span className="font-mono text-xs text-slate-600">
                  {result.principal.toLocaleString('ru-RU')} × {result.rate}% × {formatDecimal(result.termYears)}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'Прибыль' : 'Profit'}
                </span>
                <span className="font-bold text-emerald-600">
                  +{formatCurrency(result.simpleInterest)}
                </span>
              </div>
            </div>
          </div>

          {/* Сложные проценты — детали */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Сложные проценты (капитализация)' : 'Compound interest'}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'Капитализация' : 'Compounding'}
                </span>
                <span className="font-semibold text-slate-700">
                  {lang === 'ru'
                    ? frequencyLabels[result.compoundFrequency].ru
                    : frequencyLabels[result.compoundFrequency].en}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'Формула' : 'Formula'}
                </span>
                <span className="font-mono text-xs text-slate-600">
                  {result.principal.toLocaleString('ru-RU')} × (1 + {result.rate}%)^{result.termMonths}/{12}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {lang === 'ru' ? 'Прибыль' : 'Profit'}
                </span>
                <span className="font-bold text-emerald-600">
                  +{formatCurrency(result.compoundInterest)}
                </span>
              </div>
            </div>
          </div>

          {/* Примечание */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              {lang === 'ru'
                ? '⚠️ Расчёт приблизительный. Реальные условия могут включать комиссии, налоги,capitalisation. Обратитесь к банковскому консультанту.'
                : '⚠️ Estimate only. Actual terms may include fees, taxes, commission. Consult your bank advisor.'}
            </p>
          </div>
        </div>
      ) : (
        /* Подсказка */
        <div className="mt-6 bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-slate-300 mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {lang === 'ru'
              ? 'Введите сумму, ставку и срок, затем нажмите «Рассчитать»'
              : 'Enter amount, rate and term, then press «Calculate»'}
          </p>
        </div>
      )}

      <SeoContent title={lang === 'ru' ? 'О процентном калькуляторе' : 'About the Interest Calculator'} description={lang === 'ru' ? 'Процентный калькулятор рассчитывает простые и сложные проценты с учётом капитализации. Полезный инструмент для вкладов, накоплений и инвестиций.\n\nПростые проценты: начисляются только на первоначальную сумму. Сложные проценты: начисляются на сумму с учётом уже начисленных процентов.\n\nВведите сумму вклада, процентную ставку и срок.' : 'The interest calculator calculates simple and compound interest with capitalization.'} formula={{ title: 'Формулы процентов', text: 'Простые: S = P × (1 + r × n). Сложные: S = P × (1 + r)^n' }} faq={[{ q: lang === 'ru' ? 'Простые или сложные проценты выгоднее?' : 'Are simple or compound interest better?', a: 'Сложные проценты выгоднее: при капитализации доход растёт экспоненциально.' }]} />
    </div>
  );
}
