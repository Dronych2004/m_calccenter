/**
 * Калькулятор дней отпуска
 *
 * Рассчитывает:
 * - Общий стаж работы (дни)
 * - Отпускной стаж (дни, за вычетом исключённых периодов)
 * - Накопленные дни отпуска
 * - Неиспользованные дни отпуска
 * - Компенсацию при увольнении (если указан средний заработок)
 *
 * Формула (ст. 115, 121 ТК РФ):
 *   Накопленные дни = Отпускной стаж (дни) / 365 × Продолжительность отпуска
 *   Неиспользованные = Накопленные − Использованные
 *   Компенсация = Неиспользованные × Средний дневной заработок
 */
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface ExcludedPeriod {
  id: string;
  startDate: string;
  endDate: string;
}

function daysBetween(d1: string, d2: string): number {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function VacationCalculator() {
  const [hireDate, setHireDate] = useState('');
  const [calcDate, setCalcDate] = useState('');
  const [vacationDays, setVacationDays] = useState('28');
  const [usedDays, setUsedDays] = useState('0');
  const [dailyEarnings, setDailyEarnings] = useState('');
  const [excludedPeriods, setExcludedPeriods] = useState<ExcludedPeriod[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculate> | null>(null);
  const lang = useLanguage();

  useEffect(() => {
    if (!calcDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setCalcDate(`${yyyy}-${mm}-${dd}`);
    }
  }, []);

  const addExcludedPeriod = () => {
    setExcludedPeriods([
      ...excludedPeriods,
      { id: generateId(), startDate: '', endDate: '' },
    ]);
  };

  const removeExcludedPeriod = (id: string) => {
    setExcludedPeriods(excludedPeriods.filter((p) => p.id !== id));
  };

  const updateExcludedPeriod = (id: string, field: 'startDate' | 'endDate', value: string) => {
    setExcludedPeriods(excludedPeriods.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const calculate = useCallback(() => {
    if (!hireDate || !calcDate) return null;

    const hire = new Date(hireDate);
    const calc = new Date(calcDate);
    if (isNaN(hire.getTime()) || isNaN(calc.getTime())) return null;
    if (calc <= hire) return null;

    /* Общий стаж */
    const totalDays = daysBetween(hireDate, calcDate);

    /* Исключённые периоды */
    let excludedDays = 0;
    for (const period of excludedPeriods) {
      if (period.startDate && period.endDate) {
        const pStart = new Date(period.startDate);
        const pEnd = new Date(period.endDate);
        if (!isNaN(pStart.getTime()) && !isNaN(pEnd.getTime()) && pEnd >= pStart) {
          excludedDays += daysBetween(period.startDate, period.endDate);
        }
      }
    }

    /* Отпускной стаж */
    const vacationSeniority = Math.max(0, totalDays - excludedDays);

    /* Накопленные дни отпуска */
    const annualDays = parseFloat(vacationDays) || 28;
    const earnedDays = Math.floor(vacationSeniority / 365 * annualDays);

    /* Использованные дни */
    const used = parseInt(usedDays) || 0;

    /* Неиспользованные дни */
    const unusedDays = Math.max(0, earnedDays - used);

    /* Компенсация */
    const earnings = parseFloat(dailyEarnings) || 0;
    const compensation = unusedDays * earnings;

    /* Стаж в годах и месяцах */
    const years = Math.floor(vacationSeniority / 365);
    const months = Math.floor((vacationSeniority % 365) / 30);

    return {
      totalDays,
      excludedDays,
      vacationSeniority,
      earnedDays,
      used,
      unusedDays,
      compensation,
      years,
      months,
      annualDays,
    };
  }, [hireDate, calcDate, vacationDays, usedDays, dailyEarnings, excludedPeriods]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  const handleReset = () => {
    setHireDate('');
    setCalcDate('');
    setVacationDays('28');
    setUsedDays('0');
    setDailyEarnings('');
    setExcludedPeriods([]);
    setCalculated(false);
    setResult(null);
  };

  const setToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setCalcDate(`${yyyy}-${mm}-${dd}`);
  };

  const formatCurrency = (value: number): string => {
    return Math.round(value).toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Калькулятор дней отпуска' : 'Vacation Days Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте количество неиспользованных дней отпуска и положенную денежную компенсацию'
            : 'Calculate unused vacation days and compensation'}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Дата приёма на работу */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Дата приёма на работу' : 'Date of employment'}
          </label>
          <input
            type="date"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
            className="flex-1 max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Расчетная дата */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Расчётная дата' : 'Calculation date'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="date"
              value={calcDate}
              onChange={(e) => setCalcDate(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <button
              onClick={setToday}
              className="px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all whitespace-nowrap"
            >
              {lang === 'ru' ? 'Сегодня' : 'Today'}
            </button>
          </div>
        </div>

        {/* Периоды исключения */}
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
              <span className="flex items-center gap-1.5">
                {lang === 'ru' ? 'Периоды, не включаемые в отпускной стаж' : 'Periods excluded from vacation seniority'}
                <span className="text-slate-300" title={lang === 'ru' ? 'Отпуск по уходу за ребёнком, прогулы и т.д.' : 'Childcare leave, absenteeism, etc.'}>ⓘ</span>
              </span>
            </label>
            <button
              onClick={addExcludedPeriod}
              className="text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              + {lang === 'ru' ? 'Исключить период' : 'Exclude period'}
            </button>
          </div>

          {excludedPeriods.length > 0 && (
            <div className="mt-3 space-y-2">
              {excludedPeriods.map((period) => (
                <div key={period.id} className="flex items-center gap-2">
                  <input
                    type="date"
                    value={period.startDate}
                    onChange={(e) => updateExcludedPeriod(period.id, 'startDate', e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                  <span className="text-xs text-slate-400">—</span>
                  <input
                    type="date"
                    value={period.endDate}
                    onChange={(e) => updateExcludedPeriod(period.id, 'endDate', e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                  <button
                    onClick={() => removeExcludedPeriod(period.id)}
                    className="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-all text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Продолжительность отпуска */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            <span className="flex items-center gap-1.5">
              {lang === 'ru' ? 'Продолжительность ежегодного отпуска' : 'Annual vacation duration'}
              <span className="text-slate-300" title={lang === 'ru' ? 'Стандарт — 28 дней (ст. 115 ТК РФ)' : 'Standard — 28 days (Art. 115 LC RF)'}>ⓘ</span>
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={vacationDays}
              onChange={(e) => setVacationDays(e.target.value.replace(/\D/g, ''))}
              className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">{lang === 'ru' ? 'дн.' : 'days'}</span>
          </div>
        </div>

        {/* Использованные дни */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Использованные дни отпуска за весь период' : 'Vacation days used during entire period'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={usedDays}
              onChange={(e) => setUsedDays(e.target.value.replace(/\D/g, ''))}
              className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">{lang === 'ru' ? 'дн.' : 'days'}</span>
          </div>
        </div>

        {/* Средний заработок */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            <span className="flex items-center gap-1.5">
              {lang === 'ru' ? 'Средний дневной заработок' : 'Average daily earnings'}
              <span className="text-slate-300" title={lang === 'ru' ? 'Для расчёта компенсации' : 'For compensation calculation'}>ⓘ</span>
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={dailyEarnings}
              onChange={(e) => setDailyEarnings(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              placeholder={lang === 'ru' ? 'необязательно' : 'optional'}
              className="w-40 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">₽</span>
          </div>
          <p className="text-xs text-slate-400 sm:ml-2">
            {lang === 'ru' ? 'Для расчёта компенсации' : 'For compensation calculation'}
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            className="px-8 py-3 rounded-xl bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 hover:bg-indigo-600 active:scale-[0.98] transition-all"
          >
            {lang === 'ru' ? 'РАССЧИТАТЬ' : 'CALCULATE'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
          >
            {lang === 'ru' ? 'Сбросить' : 'Reset'}
          </button>
        </div>
      </div>

      {/* РЕЗУЛЬТАТЫ */}
      {calculated && result && (
        <div className="mt-6 space-y-4 animate-fade-in">
          {/* Неиспользованные дни — главная карточка */}
          <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <p className="text-sm font-medium text-white/70 mb-1">
              {lang === 'ru' ? 'Неиспользованные дни отпуска' : 'Unused vacation days'}
            </p>
            <p className="text-5xl sm:text-6xl font-extrabold tracking-tight">
              {result.unusedDays}
              <span className="text-lg font-semibold text-white/70 ml-2">{lang === 'ru' ? 'дн.' : 'days'}</span>
            </p>
            <p className="text-sm text-white/60 mt-2">
              {lang === 'ru'
                ? `Стаж: ${result.years} ${lang === 'ru' ? 'лет' : 'years'} ${result.months} ${lang === 'ru' ? 'мес.' : 'mo.'}`
                : `Seniority: ${result.years} years ${result.months} mo.`}
            </p>
          </div>

          {/* Детали */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <p className="text-[11px] text-slate-400 mb-1">
                {lang === 'ru' ? 'Отпускной стаж' : 'Vacation seniority'}
              </p>
              <p className="text-lg font-bold text-slate-800">
                {result.vacationSeniority.toLocaleString('ru-RU')}
                <span className="text-xs text-slate-400 ml-1">{lang === 'ru' ? 'дн.' : 'days'}</span>
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <p className="text-[11px] text-slate-400 mb-1">
                {lang === 'ru' ? 'Накоплено дней' : 'Earned days'}
              </p>
              <p className="text-lg font-bold text-indigo-600">
                {result.earnedDays}
                <span className="text-xs text-slate-400 ml-1">{lang === 'ru' ? 'дн.' : 'days'}</span>
              </p>
            </div>
          </div>

          {/* Стаж */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Разбивка стажа' : 'Seniority breakdown'}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Общий стаж' : 'Total seniority'}</span>
                <span className="font-semibold text-slate-700">{result.totalDays.toLocaleString('ru-RU')} {lang === 'ru' ? 'дн.' : 'days'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Исключённые периоды' : 'Excluded periods'}</span>
                <span className="font-semibold text-rose-500">−{result.excludedDays.toLocaleString('ru-RU')} {lang === 'ru' ? 'дн.' : 'days'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Отпускной стаж' : 'Vacation seniority'}</span>
                <span className="font-semibold text-emerald-600">{result.vacationSeniority.toLocaleString('ru-RU')} {lang === 'ru' ? 'дн.' : 'days'}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Ежегодный отпуск' : 'Annual vacation'}</span>
                <span className="font-semibold text-slate-700">{result.annualDays} {lang === 'ru' ? 'дн./год' : 'days/year'}</span>
              </div>
            </div>
          </div>

          {/* Компенсация */}
          {result.compensation > 0 && (
            <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
              <p className="text-sm font-medium text-white/70 mb-1">
                {lang === 'ru' ? 'Компенсация при увольнении' : 'Termination compensation'}
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(result.compensation)}
              </p>
              <p className="text-sm text-white/60 mt-2">
                {result.unusedDays} {lang === 'ru' ? 'дн. ×' : 'days ×'} {formatCurrency(parseFloat(dailyEarnings) || 0)}
              </p>
            </div>
          )}

          {/* Примечание */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              {lang === 'ru'
                ? '⚠️ Расчёт приблизительный, основан на ст. 115, 121 ТК РФ. Точный расчёт может отличаться в зависимости от обстоятельств. Обратитесь к кадровику или юристу.'
                : '⚠️ Estimate based on Art. 115, 121 LC RF. Actual calculation may vary. Consult HR or legal counsel.'}
            </p>
          </div>
        </div>
      )}

      {calculated && !result && (
        <div className="mt-6 bg-red-50 rounded-2xl border border-red-200 p-5 text-center animate-fade-in">
          <p className="text-sm text-red-600">
            {lang === 'ru'
              ? 'Пожалуйста, заполните даты для расчёта'
              : 'Please enter dates to calculate'}
          </p>
        </div>
      )}
    </div>
  );
}
