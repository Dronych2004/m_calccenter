/**
 * Автокредитный калькулятор
 *
 * Рассчитывает:
 * - Ежемесячный платёж
 * - Общую выплату и переплату
 * - Первый взнос
 * - График платежей по месяцам
 *
 * Особенности:
 * - Возможность задать первый взнос (в % или ₽)
 * - Поддержка аннуитетного и дифференцированного платежа
 */
import { useState } from 'react';
import { t } from '../i18n';
import { formatCurrency, formatNumber } from '../lib/format';
import { useLoanCalculator, type PaymentType, type LoanResult } from '../hooks/useLoanCalculator';
import { useLanguage } from '../hooks/useLanguage';
import SeoContent from '../components/SeoContent';
import SeoHead from '../components/SeoHead';

type DownPaymentMode = 'percent' | 'fixed';

export default function AutoCreditCalculator() {
  const lang = useLanguage();
  const [carPrice, setCarPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentMode, setDownPaymentMode] = useState<DownPaymentMode>('percent');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('annuity');
  const [showSchedule, setShowSchedule] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<LoanResult | null>(null);

  /* Рассчитываем первый взнос в рублях для передачи в хук */
  const dpValue = parseFloat(downPayment) || 0;
  const price = parseFloat(carPrice) || 0;
  const downPaymentRub = downPaymentMode === 'percent'
    ? price * (dpValue / 100)
    : dpValue;

  const { calculate } = useLoanCalculator({
    loanAmount: carPrice,
    interestRate,
    loanTerm,
    paymentType,
    downPayment: downPaymentRub,
  });

  const handleReset = () => {
    setCarPrice('');
    setDownPayment('');
    setDownPaymentMode('percent');
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

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      <SeoHead
        title={lang === 'ru' ? 'Калькулятор автокредита онлайн — бесплатно | CalcCenter' : 'Auto Loan Calculator Online — Free | CalcCenter'}
        description={lang === 'ru'
          ? 'Бесплатный онлайн калькулятор автокредита. Рассчитайте платёж, первый взнос и переплату по кредиту на автомобиль.'
          : 'Free online auto loan calculator. Calculate payment, down payment and overpayment on a car loan.'}
        canonical="https://calccenter.ru/auto-credit"
      />
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {t('autoCredit.title')}
        </h1>
        <p className="text-sm text-slate-400">
          {t('autoCredit.description')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Цена автомобиля */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('autoCredit.carPrice')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={carPrice}
                onChange={(e) => setCarPrice(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
              {carPrice && (
                <p className="mt-1.5 text-xs text-slate-300">{formatCurrency(parseFloat(carPrice))}</p>
              )}
            </div>

            {/* Первый взнос */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('autoCredit.downPayment')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                <div className="flex rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setDownPaymentMode('percent')}
                    className={`px-4 py-3 text-base font-bold transition-all min-w-[56px] ${
                      downPaymentMode === 'percent'
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                    }`}
                  >
                    %
                  </button>
                  <div className="w-px bg-slate-200" />
                  <button
                    onClick={() => setDownPaymentMode('fixed')}
                    className={`px-4 py-3 text-base font-bold transition-all min-w-[56px] ${
                      downPaymentMode === 'fixed'
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                    }`}
                  >
                    ₽
                  </button>
                </div>
              </div>
              {downPayment && carPrice && (
                <p className="mt-1.5 text-xs text-slate-300">
                  {downPaymentMode === 'percent'
                    ? `${formatCurrency(parseFloat(carPrice) * (parseFloat(downPayment) || 0) / 100)}`
                    : `${((parseFloat(downPayment) || 0) / parseFloat(carPrice) * 100).toFixed(1)}%`}
                </p>
              )}
            </div>

            {/* Процентная ставка */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('autoCredit.interestRate')}
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
                {t('autoCredit.loanTerm')}
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('autoCredit.paymentType')}
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
                  {t('autoCredit.annuity')}
                </button>
                <button
                  onClick={() => setPaymentType('differentiated')}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    paymentType === 'differentiated'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('autoCredit.differentiated')}
                </button>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 active:scale-[0.98] transition-all"
              >
                {t('autoCredit.calculate')}
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
              >
                {t('autoCredit.reset')}
              </button>
            </div>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {calculated && result ? (
            <div className="space-y-4">
              {/* Ежемесячный платёж — главная карточка */}
              <div className="bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">
                  {t('autoCredit.monthlyPayment')}
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {formatCurrency(
                    paymentType === 'annuity' ? result.monthlyAnnuity : result.firstPaymentDiff
                  )}
                </p>
                {paymentType === 'differentiated' && (
                  <p className="text-sm text-white/60 mt-2">
                    {t('autoCredit.paymentRange', { from: formatCurrency(result.lastPaymentDiff), to: formatCurrency(result.firstPaymentDiff) })}
                  </p>
                )}
              </div>

              {/* Информация о кредите */}
              <div className="grid grid-cols-2 gap-3">
                {/* Сумма кредита */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <p className="text-[11px] text-slate-400 mb-1">
                    {t('autoCredit.loanAmount')}
                  </p>
                  <p className="text-base font-bold text-slate-800">
                    {formatCurrency(result.S)}
                  </p>
                </div>

                {/* Первый взнос */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <p className="text-[11px] text-slate-400 mb-1">
                    {t('autoCredit.downPayment')}
                  </p>
                  <p className="text-base font-bold text-emerald-600">
                    {formatCurrency(downPaymentRub)}
                  </p>
                </div>
              </div>

              {/* Общая выплата */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">
                  {t('autoCredit.totalPayment')}
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(paymentType === 'annuity' ? result.totalAnnuity + downPaymentRub : result.totalDiff + downPaymentRub)}
                </p>
              </div>

              {/* Переплата */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">
                  {t('autoCredit.totalInterest')}
                </p>
                <p className="text-xl font-bold text-rose-500">
                  {formatCurrency(paymentType === 'annuity' ? result.overpaymentAnnuity : result.overpaymentDiff)}
                </p>
              </div>

              {/* Полная стоимость автомобиля */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500">
                        <path d="M5 17h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 17h2a2 2 0 002-2V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 17h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {t('autoCredit.totalCarCost')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t('autoCredit.pricePlusInterest')}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-800">
                    {formatCurrency(price + (paymentType === 'annuity' ? result.overpaymentAnnuity : result.overpaymentDiff))}
                  </p>
                </div>
              </div>

              {/* График платежей */}
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
              >
                {t('autoCredit.paymentSchedule')}
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
                            {t('autoCredit.period')}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {t('autoCredit.colPayment')}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {t('autoCredit.colPrincipal')}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {t('autoCredit.colInterest')}
                          </th>
                          <th className="px-3 py-3 text-right font-semibold text-slate-400">
                            {t('autoCredit.colBalance')}
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
                  <path d="M5 17h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 17h2a2 2 0 002-2V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 17h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                {t('autoCredit.hint')}
              </p>
            </div>
          )}
        </div>
      </div>

      <SeoContent
        title={lang === 'ru' ? 'Об автокредите' : 'About Auto Loan Calculator'}
        description={lang === 'ru'
          ? `Автокредит — это кредит на покупку автомобиля. Наш калькулятор помогает рассчитать ежемесячный платёж, первоначальный взнос и общую стоимость кредита.

Первоначальный взнос может быть выражен в процентах от стоимости автомобиля или в фиксированной сумме. Чем больше первый взнос — тем меньше ежемесячный платёж и переплата.

Введите стоимость автомобиля, процентную ставку, срок кредита и размер первоначального взноса.`
          : `An auto loan is a loan for purchasing a car. Our calculator helps you calculate the monthly payment, down payment, and total cost of the loan.

Enter the car price, interest rate, loan term, and down payment amount.`}
        formula={{
          title: lang === 'ru' ? 'Расчёт первоначального взноса' : 'Down Payment Calculation',
          text: 'Down Payment = Car Price × Percentage. Loan Amount = Price − Down Payment.'
        }}
        faq={[
          {
            q: lang === 'ru' ? 'Какой минимальный первый взнос?' : 'What is the minimum down payment?',
            a: lang === 'ru'
              ? 'Минимальный первоначальный взнос зависит от банка и программы. Обычно это от 10% до 30% стоимости автомобиля.'
              : 'The minimum down payment depends on the bank and program. Usually 10% to 30% of the car price.'
          },
        ]}
      />
    </div>
  );
}
