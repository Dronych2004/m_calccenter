/**
 * Калькулятор дней между датами
 *
 * Точно считает количество календарных, рабочих и выходных дней
 * между двумя выбранными датами. Также показывает количество
 * месяцев, недель и лет.
 *
 * Формула:
 * - Календарные дни = разница в миллисекундах / (1000 * 60 * 60 * 24)
 * - Рабочие дни = календарные минус субботы и воскресенья
 * - Выходные = общее минус рабочие
 */
import { useState, useEffect, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';

/* Структура результата подсчёта */
interface DateResult {
  calendarDays: number;   /* Календарных дней */
  weekdays: number;       /* Рабочих дней (пн-пт) */
  weekendDays: number;    /* Выходных дней (сб-вс) */
  weeks: number;          /* Полных недель */
  months: number;         /* Приблизительных месяцев */
  years: number;          /* Приблизительных лет */
}

/**
 * Подсчитывает разницу между двумя датами.
 * Использует UTC для корректного учёта часовых поясов.
 */
function calculateDateDiff(start: string, end: string): DateResult | null {
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

  /* Разница в миллисекундах (абсолютное значение) */
  const diffMs = Math.abs(endDate.getTime() - startDate.getTime());

  /* Календарные дни */
  const calendarDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  /* Вычисляем рабочие/выходные, проходя по каждому дню */
  const startUTC = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  const endUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

  let weekdays = 0;
  let weekendDays = 0;

  /* Определяем направление, чтобы итерировать от меньшей к большей */
  const direction = endUTC.getTime() >= startUTC.getTime() ? 1 : -1;
  const current = new Date(startUTC);

  while (current.getTime() !== endUTC.getTime()) {
    const day = current.getUTCDay();
    if (day === 0 || day === 6) {
      weekendDays++;
    } else {
      weekdays++;
    }
    current.setUTCDate(current.getUTCDate() + direction);
  }

  const weeks = Math.floor(calendarDays / 7);
  const months = Math.round(calendarDays / 30.44); /* Среднее количество дней в месяце */
  const years = Math.round(calendarDays / 365.25);

  return { calendarDays, weekdays, weekendDays, weeks, months, years };
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function DateCalculator() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<DateResult | null>(null);
  const lang = useLanguage();

  /**
   * Автоматически ставит сегодняшнюю дату как начальную при загрузке.
   */
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setStartDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  /**
   * Вычисляет результат при нажатии кнопки.
   */
  const handleCalculate = useCallback(() => {
    const res = calculateDateDiff(startDate, endDate);
    if (res) {
      setResult(res);
    }
  }, [startDate, endDate]);

  /**
   * Форматирует дату для отображения на русском.
   */
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {t('days.title')}
        </h1>
        <p className="text-sm text-slate-400">{t('days.description')}</p>
      </div>

      {/* Форма ввода дат */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Начальная дата */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              {t('days.startDate')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            {startDate && (
              <p className="mt-1.5 text-xs text-slate-300">{formatDate(startDate)}</p>
            )}
          </div>

          {/* Конечная дата */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              {t('days.endDate')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            {endDate && (
              <p className="mt-1.5 text-xs text-slate-300">{formatDate(endDate)}</p>
            )}
          </div>
        </div>

        {/* Направление */}
        {result && startDate && endDate && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-full px-3 py-1.5">
              {formatDate(startDate)}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-indigo-400">
                <path d="M3 8h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {formatDate(endDate)}
            </span>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCalculate}
            className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 active:scale-[0.98] transition-all"
          >
            {lang === 'ru' ? 'РАССЧИТАТЬ' : 'CALCULATE'}
          </button>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setResult(null);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
          >
            {lang === 'ru' ? 'Сбросить' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Результаты */}
      {result && (
        <div className="space-y-4">
          {/* Основной результат — календарные дни */}
          <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/20">
            <div className="text-center">
              <p className="text-sm font-medium text-white/70 mb-1">
                {t('days.calendarDays')}
              </p>
              <p className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                {result.calendarDays.toLocaleString()}
              </p>
              </p>
            </div>
          </div>

          {/* Детальные результаты */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Рабочие дни */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-slate-800">{result.weekdays.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">{t('days.weekdays')}</p>
            </div>

            {/* Выходные */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-500">
                  <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-slate-800">{result.weekendDays.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">{t('days.weekendDays')}</p>
            </div>

            {/* Недели */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sky-500">
                  <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 9h16M9 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-slate-800">{result.weeks.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">{t('days.weeks')}</p>
            </div>

            {/* Месяцы */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-rose-500">
                  <path d="M8 2v4m8-4v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="16" r="2" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-slate-800">{result.months.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">{t('days.months')}</p>
            </div>
          </div>

          {/* Годы (если больше года) */}
          {result.years > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-indigo-500">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {result.years.toLocaleString()} {t('days.years')}
                </p>
                <p className="text-xs text-slate-400">≈ {result.months.toLocaleString()} {t('days.months')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Подсказка если даты не выбраны */}
      {!result && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-slate-300 mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {lang === 'ru'
              ? 'Выберите две даты для расчёта'
              : 'Select two dates to calculate'}
          </p>
        </div>
      )}
    </div>
  );
}
