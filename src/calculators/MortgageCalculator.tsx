/**
 * Ипотечный калькулятор
 *
 * Рассчитывает:
 * - Ежемесячный платёж (аннуитетный и дифференцированный)
 * - Общую выплату и переплату
 * - График платежей по годам
 *
 * Формулы:
 * Аннуитетный платёж:
 *   S × (P × (1+P)^n) / ((1+P)^n - 1)
 *   где S — сумма кредита, P — месячная ставка, n — количество месяцев
 *
 * Дифференцированный платёж:
 *   Основной долг / n + Остаток × P
 *   Платёж уменьшается каждый месяц
 */
import { useState } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import { formatCurrency, formatNumber } from '../lib/format';
import { useLoanCalculator, type PaymentType, type LoanResult } from '../hooks/useLoanCalculator';

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState('5000000');
  const [interestRate, setInterestRate] = useState('12');
  const [loanTerm, setLoanTerm] = useState('20');
  const [paymentType, setPaymentType] = useState<PaymentType>('annuity');
  const [showSchedule, setShowSchedule] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<LoanResult | null>(null);
  const lang = useLanguage();

  const { calculate } = useLoanCalculator({ loanAmount, interestRate, loanTerm, paymentType });

  /**
   * Сбрасывает все введённые данные к начальным значениям.
   */
  const handleReset = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTerm('');
    setPaymentType('annuity');
    setShowSchedule(false);
    setCalculated(false);
    setResult(null);
  };

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">{t('mortgage.title')}</h1>
        <p className="text-sm text-slate-400">{t('mortgage.description')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Сумма кредита */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('mortgage.loanAmount')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
              {loanAmount && (
                <p className="mt-1.5 text-xs text-slate-300">{formatCurrency(parseFloat(loanAmount))}</p>
              )}
            </div>

            {/* Процентная ставка */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('mortgage.interestRate')}</label>
              <input
                type="text"
                inputMode="decimal"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Срок кредита */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('mortgage.loanTerm')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Тип платежа */}
            <div className="flex gap-2">
              {/* Аннуитетный — с тултипом */}
              <div className="flex-1 group relative">
                <button
                  onClick={() => setPaymentType('annuity')}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    paymentType === 'annuity'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('mortgage.annuity')}
                </button>
                {/* Тултип — определение аннуитетного платежа */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 pointer-events-none">
                  <div className="bg-slate-800 text-white text-xs leading-relaxed rounded-xl px-4 py-3 shadow-xl">
                    {lang === 'ru'
                      ? 'Одинаковый платёж каждый месяц на весь срок кредита. В начале больше процентов, в конце больше основного долга.'
                      : 'Equal payment every month for the entire loan term. More interest at the start, more principal at the end.'}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800" />
                  </div>
                </div>
              </div>

              {/* Дифференцированный — с тултипом */}
              <div className="flex-1 group relative">
                <button
                  onClick={() => setPaymentType('differentiated')}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    paymentType === 'differentiated'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('mortgage.differentiated')}
                </button>
                {/* Тултип — определение дифференцированного платежа */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 pointer-events-none">
                  <div className="bg-slate-800 text-white text-xs leading-relaxed rounded-xl px-4 py-3 shadow-xl">
                    {lang === 'ru'
                      ? 'Платёж уменьшается каждый месяц. Основной долг фиксированный, проценты начисляются на остаток.'
                      : 'Payment decreases every month. Fixed principal, interest calculated on remaining balance.'}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 mt-4">
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
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {calculated && result ? (
            <div className="space-y-4">
              {/* Ежемесячный платёж */}
              <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">{t('mortgage.monthlyPayment')}</p>
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
                <p className="text-xs text-slate-400 mb-1">{t('mortgage.totalPayment')}</p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(paymentType === 'annuity' ? result.totalAnnuity : result.totalDiff)}
                </p>
              </div>

              {/* Переплата */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">{t('mortgage.totalInterest')}</p>
                <p className="text-xl font-bold text-rose-500">
                  {formatCurrency(paymentType === 'annuity' ? result.overpaymentAnnuity : result.overpaymentDiff)}
                </p>
              </div>

              {/* График платежей */}
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
              >
                {t('mortgage.schedule')}
                <span className="ml-2 text-xs text-slate-400">
                  {showSchedule ? '▲' : '▼'}
                </span>
              </button>

              {/* Таблица графика — помесячный */}
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
            /* Подсказка если данные не заполнены */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-slate-300 mb-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                {lang === 'ru'
                  ? 'Заполните параметры и нажмите «Рассчитать»'
                  : 'Fill in parameters and press «Calculate»'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
