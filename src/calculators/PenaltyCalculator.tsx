/**
 * Калькулятор пеней
 *
 * Три типа расчёта:
 * 1. Пени по налогам, сборам и страховым взносам (ст. 75 НК РФ)
 * 2. Компенсация за задержку зарплаты (ст. 236 ТК РФ)
 * 3. Пени за просрочку коммунальных услуг
 *
 * Формулы:
 * Налоги (физлица): Сумма × 1/300 × Ставка ЦБ × Дни
 * Налоги (юрлица):
 *   0-30 дн: Сумма × 1/300 × Ставка ЦБ × Дни
 *   31+: Сумма × 1/150 × Ставка ЦБ × Дни
 * Зарплата: Сумма × 1/150 × Ставка ЦБ × Дни
 *   ( min 1/150 × Ставка ЦБ × Сумма за каждый день после 10-дн. просрочки )
 * ЖКХ: Сумма × 1/300 × Ставка ЦБ × Дни
 *
 * Ставка ЦБ РФ по умолчанию: 21% (актуально с 2024 г.)
 */
import { useState, useEffect, useCallback } from 'react';
import { getLanguage } from '../i18n';
import { useCBRRate } from '../hooks/useCBRRate';

type PenaltyType = 'tax' | 'salary' | 'utilities';
type TaxpayerType = 'individual' | 'legal';

interface PenaltyResult {
  days: number;
  ratePerDay: number;
  penalty: number;
  totalDebt: number;
}

export default function PenaltyCalculator() {
  const [penaltyType, setPenaltyType] = useState<PenaltyType>('tax');
  const [taxpayerType, setTaxpayerType] = useState<TaxpayerType>('individual');
  const [debtAmount, setDebtAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [cbrRate, setCbrRate] = useState('');
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<PenaltyResult | null>(null);
  const [, setLangTick] = useState(0);

  /* Загружаем актуальную ставку ЦБ из API (кэш 24ч) */
  const { rate: cbrRateFromAPI, date: cbrRateDate, loading: cbrLoading } = useCBRRate();

  /* Устанавливаем ставку из API при загрузке */
  useEffect(() => {
    if (!cbrLoading && cbrRateFromAPI && !cbrRate) {
      setCbrRate(String(cbrRateFromAPI));
    }
  }, [cbrLoading, cbrRateFromAPI, cbrRate]);

  const lang = getLanguage();

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  const calculate = useCallback((): PenaltyResult | null => {
    const amount = parseFloat(debtAmount);
    if (!amount || amount <= 0) return null;
    if (!dueDate || !paymentDate) return null;

    const due = new Date(dueDate);
    const pay = new Date(paymentDate);
    if (isNaN(due.getTime()) || isNaN(pay.getTime())) return null;
    if (pay <= due) return null;

    const diffMs = pay.getTime() - due.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const rate = parseFloat(cbrRate) || cbrRateFromAPI;
    const dailyRate = rate / 100;

    let penalty = 0;

    if (penaltyType === 'tax') {
      if (taxpayerType === 'individual') {
        /* Физлица: 1/300 × ставка ЦБ × сумма × дни */
        penalty = amount * (1 / 300) * dailyRate * days;
      } else {
        /* Юрлица: 0-30 дн 1/300, 31+ дн 1/150 */
        if (days <= 30) {
          penalty = amount * (1 / 300) * dailyRate * days;
        } else {
          const first30 = amount * (1 / 300) * dailyRate * 30;
          const rest = amount * (1 / 150) * dailyRate * (days - 30);
          penalty = first30 + rest;
        }
      }
    } else if (penaltyType === 'salary') {
      /* Зарплата: 1/150 × ставка ЦБ × сумма × дни (ст. 236 ТК РФ) */
      penalty = amount * (1 / 150) * dailyRate * days;
    } else {
      /* ЖКХ: 1/300 × ставка ЦБ × сумма × дни */
      penalty = amount * (1 / 300) * dailyRate * days;
    }

    return {
      days,
      ratePerDay: amount * (1 / (penaltyType === 'salary' ? 150 : 300)) * dailyRate,
      penalty: Math.round(penalty * 100) / 100,
      totalDebt: amount + Math.round(penalty * 100) / 100,
    };
  }, [debtAmount, dueDate, paymentDate, penaltyType, taxpayerType, cbrRate]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  const handleReset = () => {
    setPenaltyType('tax');
    setTaxpayerType('individual');
    setDebtAmount('');
    setDueDate('');
    setPaymentDate('');
    setCbrRate(String(cbrRateFromAPI));
    setCalculated(false);
    setResult(null);
  };

  const setToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setPaymentDate(`${yyyy}-${mm}-${dd}`);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  };

  const penaltyTypeLabels: Record<PenaltyType, { ru: string; en: string }> = {
    tax: { ru: 'Пени по налогам, сборам и страховым взносам', en: 'Penalties for taxes, fees and insurance contributions' },
    salary: { ru: 'Компенсация за задержку в выплате заработной платы', en: 'Compensation for delayed salary payment' },
    utilities: { ru: 'Пени за просрочку при оплате коммунальных услуг', en: 'Penalties for late utility payments' },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Калькулятор пеней' : 'Penalty Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте пени за просрочку налогов, взносов или коммунальных платежей, а также компенсацию за задержку зарплаты'
            : 'Calculate penalties for overdue taxes, contributions or utility bills, and salary delay compensation'}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Тип расчёта */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-40 shrink-0 sm:mt-1">
            {lang === 'ru' ? 'Рассчитать' : 'Calculate'}
          </label>
          <div className="space-y-3">
            {(Object.keys(penaltyTypeLabels) as PenaltyType[]).map((type) => (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="penaltyType"
                  checked={penaltyType === type}
                  onChange={() => setPenaltyType(type)}
                  className="w-4 h-4 text-indigo-500 border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">{penaltyTypeLabels[type][lang === 'ru' ? 'ru' : 'en']}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Налогоплательщик (только для налогов) */}
        {penaltyType === 'tax' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <label className="text-sm font-medium text-slate-600 sm:w-40 shrink-0">
              {lang === 'ru' ? 'Налогоплательщик' : 'Taxpayer'}
            </label>
            <select
              value={taxpayerType}
              onChange={(e) => setTaxpayerType(e.target.value as TaxpayerType)}
              className="flex-1 max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              <option value="individual">{lang === 'ru' ? 'Физическое лицо' : 'Individual'}</option>
              <option value="legal">{lang === 'ru' ? 'Юридическое лицо' : 'Legal entity'}</option>
            </select>
          </div>
        )}

        {/* Сумма задолженности */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-40 shrink-0">
            {lang === 'ru' ? 'Сумма задолженности' : 'Debt amount'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={debtAmount}
              onChange={(e) => setDebtAmount(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="w-48 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">{lang === 'ru' ? 'руб.' : 'RUB'}</span>
          </div>
        </div>

        {/* Срок уплаты */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-40 shrink-0">
            {lang === 'ru' ? 'Установленный срок уплаты' : 'Due date'}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Дата погашения */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label className="text-sm font-medium text-slate-600 sm:w-40 shrink-0">
            {lang === 'ru' ? 'Дата погашения задолженности' : 'Payment date'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <button
              onClick={setToday}
              className="px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all whitespace-nowrap"
            >
              {lang === 'ru' ? 'Сегодня' : 'Today'}
            </button>
          </div>
        </div>

        {/* Ставка ЦБ */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-slate-600 sm:w-40 shrink-0">
              {lang === 'ru' ? 'Ставка ЦБ РФ (%)' : 'CBR rate (%)'}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={cbrRate}
              onChange={(e) => setCbrRate(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-300 mt-1.5 sm:ml-40">
            {lang === 'ru'
              ? cbrRateDate
                ? `Актуальная ставка на ${cbrRateDate} (обновляется раз в сутки)`
                : 'Загрузка ставки с cbr.ru...'
              : cbrRateDate
                ? `Current rate as of ${cbrRateDate} (updated daily)`
                : 'Loading rate from cbr.ru...'}
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
          {/* Сумма пеней — главная карточка */}
          <div className="bg-linear-to-br from-rose-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20">
            <p className="text-sm font-medium text-white/70 mb-1">
              {lang === 'ru' ? 'Сумма пеней' : 'Penalty amount'}
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatCurrency(result.penalty)}
            </p>
            <p className="text-sm text-white/60 mt-2">
              {result.days} {lang === 'ru' ? 'дн. просрочки' : 'days overdue'}
            </p>
          </div>

          {/* Итого к оплате */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Итого к оплате' : 'Total to pay'}
            </p>
            <p className="text-xl font-bold text-slate-800">
              {formatCurrency(result.totalDebt)}
            </p>
          </div>

          {/* Детали */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Расчёт пеней' : 'Penalty breakdown'}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Сумма задолженности' : 'Debt amount'}</span>
                <span className="font-semibold text-slate-700">{formatCurrency(parseFloat(debtAmount) || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Дней просрочки' : 'Days overdue'}</span>
                <span className="font-semibold text-slate-700">{result.days}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Ставка ЦБ РФ' : 'CBR rate'}</span>
                <span className="font-semibold text-slate-700">{cbrRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {penaltyType === 'salary'
                    ? (lang === 'ru' ? 'Формула (ст. 236 ТК РФ)' : 'Formula (Art. 236 LC RF)')
                    : (lang === 'ru' ? 'Формула (ст. 75 НК РФ)' : 'Formula (Art. 75 TC RF)')}
                </span>
                <span className="font-mono text-xs text-slate-600">
                  {penaltyType === 'salary'
                    ? `С × 1/150 × ${cbrRate}% × ${result.days}`
                    : taxpayerType === 'individual'
                      ? `С × 1/300 × ${cbrRate}% × ${result.days}`
                      : result.days <= 30
                        ? `С × 1/300 × ${cbrRate}% × ${result.days}`
                        : `С × 1/300 × ${cbrRate}% × 30 + С × 1/150 × ${cbrRate}% × ${result.days - 30}`}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Начислено пеней' : 'Penalty charged'}</span>
                <span className="font-bold text-rose-500">{formatCurrency(result.penalty)}</span>
              </div>
            </div>
          </div>

          {/* Примечание */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              {lang === 'ru'
                ? '⚠️ Расчёт приблизительный. Ставка ЦБ РФ может отличаться от фактической на момент просрочки. Точный расчёт могут провести ФНС или суд.'
                : '⚠️ Estimate only. CBR rate may differ from the actual rate during the overdue period. Contact FTS or court for exact calculation.'}
            </p>
          </div>
        </div>
      )}

      {calculated && !result && (
        <div className="mt-6 bg-red-50 rounded-2xl border border-red-200 p-5 text-center animate-fade-in">
          <p className="text-sm text-red-600">
            {lang === 'ru'
              ? 'Пожалуйста, заполните сумму и даты для расчёта'
              : 'Please enter amount and dates to calculate'}
          </p>
        </div>
      )}
    </div>
  );
}
