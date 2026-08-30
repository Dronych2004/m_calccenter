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
import { useState } from 'react';
import { t } from '../i18n';
import { formatCurrency, formatNumber } from '../lib/format';
import { useLoanCalculator, type PaymentType, type LoanResult } from '../hooks/useLoanCalculator';
import { useLanguage } from '../hooks/useLanguage';
import SeoContent from '../components/SeoContent';

export default function CreditCalculator() {
  const lang = useLanguage();
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('annuity');
  const [insurance, setInsurance] = useState('');
  const [commission, setCommission] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<LoanResult | null>(null);

  const ins = parseFloat(insurance) || 0;
  const comm = parseFloat(commission) || 0;

  const { calculate } = useLoanCalculator({ loanAmount, interestRate, loanTerm, paymentType });

  const handleReset = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTerm('');
    setPaymentType('annuity');
    setInsurance('');
    setCommission('');
    setShowSchedule(false);
    setCalculated(false);
    setResult(null);
  };

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {t('credit.title')}
        </h1>
        <p className="text-sm text-slate-400">
          {t('credit.description')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Сумма кредита */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('credit.loanAmount')}
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
                {t('credit.interestRate')}
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
                {t('credit.loanTerm')}
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
                {t('credit.paymentType')}
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
                  {t('credit.annuity')}
                </button>
                <button
                  onClick={() => setPaymentType('differentiated')}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    paymentType === 'differentiated'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('credit.differentiated')}
                </button>
              </div>
            </div>

            {/* Доп. расходы — сворачиваемый блок */}
            <details className="mb-6">
              <summary className="text-sm font-medium text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                {t('credit.additionalCostsOptional')}
              </summary>
              <div className="mt-4 space-y-4">
                {/* Страхование */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t('credit.insurance')}
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
                    {t('credit.disbursementFee')}
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

            {/* Кнопки */}
            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 active:scale-[0.98] transition-all"
              >
                {t('credit.calculate')}
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
              >
                {t('credit.reset')}
              </button>
            </div>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {calculated && result ? (
            <div className="space-y-4">
              {/* Ежемесячный платёж — главная карточка */}
              <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">
                  {t('credit.monthlyPayment')}
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {formatCurrency(
                    paymentType === 'annuity' ? result.monthlyAnnuity : result.firstPaymentDiff
                  )}
                </p>
                {paymentType === 'differentiated' && (
                  <p className="text-sm text-white/60 mt-2">
                    {t('credit.paymentRange', { from: formatCurrency(result.lastPaymentDiff), to: formatCurrency(result.firstPaymentDiff) })}
                  </p>
                )}
              </div>

              {/* Общая выплата */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">
                  {t('credit.totalPayment')}
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(paymentType === 'annuity' ? result.totalAnnuity : result.totalDiff)}
                </p>
              </div>

              {/* Переплата */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">
                  {t('credit.totalInterest')}
                </p>
                <p className="text-xl font-bold text-rose-500">
                  {formatCurrency(paymentType === 'annuity' ? result.overpaymentAnnuity : result.overpaymentDiff)}
                </p>
              </div>

              {/* Доп. расходы (если есть) */}
              {(ins > 0 || comm > 0) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-fade-in">
                  <p className="text-xs text-slate-400 mb-3">
                    {t('credit.additionalCosts')}
                  </p>
                  <div className="space-y-2">
                    {ins > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          {t('credit.insuranceLabel')}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{formatCurrency(ins)}</span>
                      </div>
                    )}
                    {comm > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          {t('credit.disbursementFeeLabel')}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{formatCurrency(comm)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        {t('credit.totalCost')}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency((paymentType === 'annuity' ? result.totalAnnuity : result.totalDiff) + ins + comm)}
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
                {t('credit.paymentSchedule')}
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
                            {t('credit.period')}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {t('credit.colPayment')}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {t('credit.colPrincipal')}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {t('credit.colInterest')}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {t('credit.colBalance')}
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
                {t('credit.hint')}
              </p>
            </div>
          )}
        </div>
      </div>

      <SeoContent
        title={lang === 'ru' ? 'О кредитном калькуляторе' : 'About the Credit Calculator'}
        description={lang === 'ru'
          ? `Кредитный калькулятор помогает рассчитать ежемесячный платёж по кредиту с учётом дополнительных расходов: страхования, комиссий и услуг банка. Это важно для понимания реальной стоимости кредита.

Помимо основного платежа, кредит может включать обязательное страхование, комиссии за обслуживание счёта, плату за выпуск карты и другие расходы. Наш калькулятор суммирует все затраты и покажет полную стоимость кредита.

Введите сумму кредита, процентную ставку, срок и дополнительные расходы. Калькулятор рассчитает ежемесячный платёж, общую сумму выплат и переплату по процентам.`
          : `The credit calculator helps you calculate your monthly loan payment including additional expenses: insurance, fees, and bank services.

Enter the loan amount, interest rate, term, and additional expenses. The calculator will compute the monthly payment, total payments, and interest overpayment.`}
        formula={{
          title: lang === 'ru' ? 'Формула ежемесячного платежа' : 'Monthly Payment Formula',
          text: 'Payment = P × (r × (1 + r)^n) / ((1 + r)^n − 1)'
        }}
        faq={[
          {
            q: lang === 'ru' ? 'Что такое полная стоимость кредита?' : 'What is the total cost of credit?',
            a: lang === 'ru'
              ? 'Полная стоимость кредита — это сумма всех платежей по кредиту за весь срок, включая проценты и дополнительные комиссии.'
              : 'The total cost of credit is the sum of all loan payments over the entire term, including interest and additional fees.'
          },
          {
            q: lang === 'ru' ? 'Как уменьшить переплату по кредиту?' : 'How to reduce credit overpayment?',
            a: lang === 'ru'
              ? 'Способы: уменьшить срок кредита, увеличить первый взнос, выбрать банк с меньшей ставкой, вносить досрочные платежи.'
              : 'Ways: reduce the loan term, increase the down payment, choose a bank with a lower rate, make early payments.'
          },
        ]}
      />
    </div>
  );
}
