/**
 * Калькулятор скидок
 *
 * Рассчитывает:
 * - Итоговую цену со скидкой
 * - Размер скидки в货币е
 * - Экономию
 * - Поддержка нескольких последовательных скидок (10% + 5%)
 */
import { useState, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';

export default function DiscountCalculator() {
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [extraDiscount, setExtraDiscount] = useState('');
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculate> | null>(null);
  const lang = useLanguage();

  const calculate = useCallback(() => {
    const p = parseFloat(price);
    const d = parseFloat(discount);
    const ed = parseFloat(extraDiscount);

    if (!p || p <= 0) return null;
    if ((!d && d !== 0) || d < 0 || d > 100) return null;

    const firstDiscount = d / 100;
    const priceAfterFirst = p * (1 - firstDiscount);

    let totalDiscountPercent = d;
    let finalPrice = priceAfterFirst;

    if (ed && ed > 0 && ed <= 100) {
      const secondDiscount = ed / 100;
      finalPrice = priceAfterFirst * (1 - secondDiscount);
      totalDiscountPercent = 100 - (finalPrice / p) * 100;
    }

    const savings = p - finalPrice;

    return {
      originalPrice: p,
      finalPrice,
      savings,
      totalDiscountPercent,
      firstDiscountPrice: priceAfterFirst,
      hasExtraDiscount: ed > 0 && ed <= 100,
    };
  }, [price, discount, extraDiscount]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  const handleReset = () => {
    setPrice('');
    setDiscount('');
    setExtraDiscount('');
    setCalculated(false);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Калькулятор скидок' : 'Discount Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте итоговую цену со скидкой и вашу экономию'
            : 'Calculate the final price with discount and your savings'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Цена */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Исходная цена' : 'Original price'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Скидка */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Скидка (%)' : 'Discount (%)'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={discount}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                  const num = parseFloat(val);
                  if (val === '' || (num >= 0 && num <= 100)) setDiscount(val);
                }}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Доп. скидка */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Дополнительная скидка (%) — необязательно' : 'Extra discount (%) — optional'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={extraDiscount}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                  const num = parseFloat(val);
                  if (val === '' || (num >= 0 && num <= 100)) setExtraDiscount(val);
                }}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                {lang === 'ru'
                  ? 'Применяется к уже промежуточной цене (не суммируется)'
                  : 'Applied to the intermediate price (not additive)'}
              </p>
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
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {calculated && result ? (
            <div className="space-y-4">
              {/* Итоговая цена — главная карточка */}
              <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">
                  {lang === 'ru' ? 'Итоговая цена' : 'Final price'}
                </p>
                <p className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                  {result.finalPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-sm font-semibold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18 12a2 2 0 000 4h4v-4h-4z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {lang === 'ru' ? 'Экономия' : 'Savings'}: {result.savings.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Детали */}
              <div className="grid grid-cols-2 gap-3">
                {/* Исходная цена */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <p className="text-[11px] text-slate-400 mb-1">
                    {lang === 'ru' ? 'Исходная цена' : 'Original price'}
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {result.originalPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Общая скидка */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <p className="text-[11px] text-slate-400 mb-1">
                    {lang === 'ru' ? 'Общая скидка' : 'Total discount'}
                  </p>
                  <p className="text-lg font-bold text-rose-600">
                    −{result.totalDiscountPercent.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Пошаговый расчёт (если есть доп. скидка) */}
              {result.hasExtraDiscount && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-fade-in">
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    {lang === 'ru' ? 'Пошаговый расчёт' : 'Step-by-step breakdown'}
                  </p>
                  <div className="space-y-3">
                    {/* Шаг 1 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-indigo-500">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">
                          {lang === 'ru' ? 'Первая скидка' : 'First discount'}
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {result.originalPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {' → '}
                          {result.firstDiscountPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Стрелка */}
                    <div className="pl-3 border-l-2 border-dashed border-slate-200 h-2" />

                    {/* Шаг 2 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-emerald-500">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">
                          {lang === 'ru' ? 'Вторая скидка' : 'Second discount'}
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {result.firstDiscountPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {' → '}
                          {result.finalPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Экономия */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {lang === 'ru' ? 'Ваша экономия' : 'Your savings'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {result.totalDiscountPercent.toFixed(1)}% {lang === 'ru' ? 'от исходной цены' : 'off original price'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">
                    {result.savings.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Подсказка */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-slate-300 mb-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                  <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18 12a2 2 0 000 4h4v-4h-4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                {lang === 'ru'
                  ? 'Заполните данные и нажмите «Рассчитать»'
                  : 'Fill in the fields and press «Calculate»'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
