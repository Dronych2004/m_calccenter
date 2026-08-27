/**
 * Кредитный калькулятор
 *
 * Рассчитывает:
 * - Ежемесячный платёж (аннуитетный и дифференцированный)
 * - Общую выплату и переплату
 * - График платежей по месяцам
 *
 * Отличие от ипотечного:
 * - Меньшие суммы (до 10 млн)
 * - Короче сроки (до 10 лет)
 * - Дополнительные опции: страхование, комиссии
 */
import { useState, useEffect, useMemo } from 'react';
import { getLanguage } from '../i18n';

type PaymentType = 'annuity' | 'differentiated';

interface MonthSchedule {
  month: number;
  year: number;
  monthInYear: number;
  payment: number;
  principal: number;
  interest: number;
  remaining: number;
}

export default function CreditCalculator() {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('annuity');
  const [insurance, setInsurance] = useState('');
  const [commission, setCommission] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [, setLangTick] = useState(0);

  const lang = getLanguage();

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  const handleReset = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTerm('');
    setPaymentType('annuity');
    setInsurance('');
    setCommission('');
    setShowSchedule(false);
  };

  const result = useMemo(() => {
    const S = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const years = parseInt(loanTerm);
    const ins = parseFloat(insurance) || 0;
    const comm = parseFloat(commission) || 0;

    if (!S || !annualRate || !years || S <= 0 || annualRate <= 0 || years <= 0) {
      return null;
    }

    const n = years * 12;
    const P = annualRate / 100 / 12;

    /* Аннуитетный платёж */
    const annuityFactor = (P * Math.pow(1 + P, n)) / (Math.pow(1 + P, n) - 1);
    const monthlyAnnuity = S * annuityFactor;
    const totalAnnuity = monthlyAnnuity * n;
    const overpaymentAnnuity = totalAnnuity - S;

    /* Дифференцированный платёж */
    const monthlyPrincipal = S / n;
    const firstPaymentDiff = monthlyPrincipal + S * P;
    const lastPaymentDiff = monthlyPrincipal + monthlyPrincipal * P;

    let remaining = S;
    let totalDiff = 0;
    const monthSchedule: MonthSchedule[] = [];

    for (let i = 0; i < n; i++) {
      if (remaining <= 0) break;
      const interestPayment = remaining * P;
      const principalPayment = Math.min(monthlyPrincipal, remaining);
      const payment = principalPayment + interestPayment;

      remaining -= principalPayment;
      totalDiff += payment;

      const year = Math.floor(i / 12) + 1;
      const monthInYear = (i % 12) + 1;

      monthSchedule.push({
        month: i + 1,
        year,
        monthInYear,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        remaining: Math.max(0, remaining),
      });
    }

    const overpaymentDiff = totalDiff - S;

    /* Общая стоимость кредита с доп. расходами */
    const totalCost = S + ins + comm;

    return {
      monthlyAnnuity,
      totalAnnuity,
      overpaymentAnnuity,
      firstPaymentDiff,
      lastPaymentDiff,
      totalDiff,
      overpaymentDiff,
      monthlyPrincipal,
      P,
      n,
      S,
      totalCost,
      insurance: ins,
      commission: comm,
      monthSchedule,
    };
  }, [loanAmount, interestRate, loanTerm, insurance, commission]);

  const formatCurrency = (value: number): string => {
    return Math.round(value).toLocaleString('ru-RU') + ' ₽';
  };

  const formatNumber = (value: number): string => {
    return Math.round(value).toLocaleString('ru-RU');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Кредитный калькулятор' : 'Credit Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте ежемесячный платёж, переплату и график погашения кредита'
            : 'Calculate monthly payment, overpayment and loan repayment schedule'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Сумма кредита */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Сумма кредита' : 'Loan amount'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
              {loanAmount && (
                <p className="mt-1.5 text-xs text-slate-300">{formatCurrency(parseFloat(loanAmount))}</p>
              )}
            </div>

            {/* Процентная ставка */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Процентная ставка (% годовых)' : 'Interest rate (% per year)'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Срок кредита */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Срок кредита (лет)' : 'Loan term (years)'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Тип платежа */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Тип платежа' : 'Payment type'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentType('annuity')}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    paymentType === 'annuity'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'ru' ? 'Аннуитетный' : 'Annuity'}
                </button>
                <button
                  onClick={() => setPaymentType('differentiated')}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    paymentType === 'differentiated'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'ru' ? 'Дифференцированный' : 'Differentiated'}
                </button>
              </div>
            </div>

            {/* Доп. расходы — сворачиваемый блок */}
            <details className="mb-6">
              <summary className="text-sm font-medium text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                {lang === 'ru' ? 'Дополнительные расходы (необязательно)' : 'Additional costs (optional)'}
              </summary>
              <div className="mt-4 space-y-4">
                {/* Страхование */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {lang === 'ru' ? 'Страхование (₽)' : 'Insurance (₽)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
                {/* Комиссия */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {lang === 'ru' ? 'Комиссия за выдачу (₽)' : 'Disbursement fee (₽)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            </details>

            {/* Кнопка сброса */}
            <button
              onClick={handleReset}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
            >
              {lang === 'ru' ? 'Сбросить' : 'Reset'}
            </button>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {result ? (
            <div className="space-y-4">
              {/* Ежемесячный платёж — главная карточка */}
              <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">
                  {lang === 'ru' ? 'Ежемесячный платёж' : 'Monthly payment'}
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {formatCurrency(
                    paymentType === 'annuity' ? result.monthlyAnnuity : result.firstPaymentDiff
                  )}
                </p>
                {paymentType === 'differentiated' && (
                  <p className="text-sm text-white/60 mt-2">
                    {lang === 'ru'
                      ? `от ${formatCurrency(result.lastPaymentDiff)} до ${formatCurrency(result.firstPaymentDiff)}`
                      : `from ${formatCurrency(result.lastPaymentDiff)} to ${formatCurrency(result.firstPaymentDiff)}`}
                  </p>
                )}
              </div>

              {/* Общая выплата */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">
                  {lang === 'ru' ? 'Общая выплата' : 'Total payment'}
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(paymentType === 'annuity' ? result.totalAnnuity : result.totalDiff)}
                </p>
              </div>

              {/* Переплата */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">
                  {lang === 'ru' ? 'Переплата по процентам' : 'Total interest'}
                </p>
                <p className="text-xl font-bold text-rose-500">
                  {formatCurrency(paymentType === 'annuity' ? result.overpaymentAnnuity : result.overpaymentDiff)}
                </p>
              </div>

              {/* Доп. расходы (если есть) */}
              {(result.insurance > 0 || result.commission > 0) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-fade-in">
                  <p className="text-xs text-slate-400 mb-3">
                    {lang === 'ru' ? 'Дополнительные расходы' : 'Additional costs'}
                  </p>
                  <div className="space-y-2">
                    {result.insurance > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          {lang === 'ru' ? 'Страхование' : 'Insurance'}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{formatCurrency(result.insurance)}</span>
                      </div>
                    )}
                    {result.commission > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          {lang === 'ru' ? 'Комиссия за выдачу' : 'Disbursement fee'}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{formatCurrency(result.commission)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        {lang === 'ru' ? 'Полная стоимость' : 'Total cost'}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(result.totalCost)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* График платежей */}
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
              >
                {lang === 'ru' ? 'График платежей' : 'Payment schedule'}
                <span className="ml-2 text-xs text-slate-400">
                  {showSchedule ? '▲' : '▼'}
                </span>
              </button>

              {/* Таблица графика */}
              {showSchedule && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-fade-in">
                  <div className="max-h-[400px] overflow-x-auto">
                    <table className="w-full text-xs border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-100">
                          <th className="px-3 py-3 text-center font-semibold text-slate-400 w-10">№</th>
                          <th className="px-3 py-3 text-left font-semibold text-slate-400">
                            {lang === 'ru' ? 'Период' : 'Period'}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {lang === 'ru' ? 'Платёж, ₽' : 'Payment, ₽'}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {lang === 'ru' ? 'Долг, ₽' : 'Principal, ₽'}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {lang === 'ru' ? 'Проценты, ₽' : 'Interest, ₽'}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {lang === 'ru' ? 'Остаток, ₽' : 'Balance, ₽'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.monthSchedule.map((row) => (
                          <tr key={row.month} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors">
                            <td className="px-3 py-2 text-slate-300 text-center tabular-nums">{row.month}</td>
                            <td className="px-3 py-2 text-slate-600">
                              {row.monthInYear}/{row.year}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700 font-medium tabular-nums">{formatNumber(row.payment)}</td>
                            <td className="px-3 py-2 text-right text-emerald-600 tabular-nums">{formatNumber(row.principal)}</td>
                            <td className="px-3 py-2 text-right text-rose-500 tabular-nums">{formatNumber(row.interest)}</td>
                            <td className="px-3 py-2 text-right text-slate-500 tabular-nums">{formatNumber(row.remaining)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Подсказка */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-slate-300 mb-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                  <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 10h20" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                {lang === 'ru'
                  ? 'Заполните параметры кредита для расчёта'
                  : 'Fill in loan parameters to calculate'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
