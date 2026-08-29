/**
 * Калькулятор НДС (Налог на добавленную стоимость)
 *
 * Рассчитывает:
 * - Сумму НДС от цены без НДС
 * - Итоговую цену с НДС
 * - Извлекает НДС из суммы, включающей НДС
 * - Определяет цену без НДС из суммы с НДС
 *
 * Формулы (НК РФ, ст. 164):
 *   НДС = Цена × Ставка / 100
 *   Цена с НДС = Цена + НДС = Цена × (1 + Ставка / 100)
 *   Цена без НДС = Цена с НДС / (1 + Ставка / 100)
 *   НДС (из суммы) = Цена с НДС − Цена без НДС
 *
 * Ставки НДС (2024+):
 *   20% — основная ставка
 *   10% — продовольствие, детские товары, медицинские, sáchи
 *   5%  — спецрежим (МСП, доходы)
 *   0%  — экспорт, международные перевозки
 *   Без НДС — некоторые категории (МСП на УСН до лимита)
 */
import { useState, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';

/* ==================== ТИПЫ ==================== */

/* Режим расчёта: от цены без НДС или из цены с НДС */
type CalcMode = 'add' | 'extract';

/* Ставки НДС */
type NDSType = '20' | '10' | '5' | '0' | 'none';

/* Интерфейс результата */
interface NDSResult {
  priceWithoutNDS: number;   /* Цена без НДС */
  ndsAmount: number;         /* Сумма НДС */
  priceWithNDS: number;      /* Цена с НДС */
  rate: number;              /* Ставка НДС (%) */
}

/* ==================== КОНСТАНТЫ ==================== */

/* Ставки НДС с описаниями */
const NDS_RATES: { value: NDSType; rate: number; labelRu: string; labelEn: string }[] = [
  { value: '20', rate: 20, labelRu: '20% — основная ставка', labelEn: '20% — standard rate' },
  { value: '10', rate: 10, labelRu: '10% — льготная (продовольствие, дети, книги)', labelEn: '10% — reduced (food, children, books)' },
  { value: '5', rate: 5, labelRu: '5% — спецрежим (МСП)', labelEn: '5% — special regime (SME)' },
  { value: '0', rate: 0, labelRu: '0% — экспорт, международные перевозки', labelEn: '0% — export, international transport' },
  { value: 'none', rate: 0, labelRu: 'Без НДС — освобождение', labelEn: 'No VAT — exemption' },
];

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function NDSCalculator() {
  /* Режим расчёта */
  const [mode, setMode] = useState<CalcMode>('add');

  /* Сумма (базовое значение) */
  const [amount, setAmount] = useState('');

  /* Ставка НДС */
  const [ndsType, setNdsType] = useState<NDSType>('20');

  /* Флаг расчёта */
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<NDSResult | null>(null);

  const lang = useLanguage();

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  /**
   * Рассчитывает НДС в зависимости от выбранного режима:
   * - mode='add': к цене без НДС прибавляем НДС → получаем цену с НДС
   * - mode='extract': из цены с НДС извлекаем НДС → получаем цену без НДС
   */
  const calculate = useCallback((): NDSResult | null => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return null;

    /* Находим ставку по выбранному типу */
    const rateEntry = NDS_RATES.find((r) => r.value === ndsType);
    if (!rateEntry) return null;
    const rate = rateEntry.rate;

    /* Если ставка 0% или "Без НДС" — НДС нет */
    if (rate === 0) {
      return {
        priceWithoutNDS: val,
        ndsAmount: 0,
        priceWithNDS: val,
        rate: 0,
      };
    }

    /* Коэффициент НДС: 1 + rate/100 */
    const ndsFactor = 1 + rate / 100;

    if (mode === 'add') {
      /**
       * Режим "Прибавить НДС":
       * Цена без НДС = val
       * НДС = val × rate / 100
       * Цена с НДС = val × ndsFactor
       */
      const ndsAmount = val * (rate / 100);
      const priceWithNDS = val * ndsFactor;

      return {
        priceWithoutNDS: val,
        ndsAmount,
        priceWithNDS,
        rate,
      };
    } else {
      /**
       * Режим "Извлечь НДС":
       * Цена с НДС = val
       * Цена без НДС = val / ndsFactor
       * НДС = val − (val / ndsFactor)
       */
      const priceWithoutNDS = val / ndsFactor;
      const ndsAmount = val - priceWithoutNDS;

      return {
        priceWithoutNDS,
        ndsAmount,
        priceWithNDS: val,
        rate,
      };
    }
  }, [amount, ndsType, mode]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  /**
   * Сброс всех полей
   */
  const handleReset = () => {
    setMode('add');
    setAmount('');
    setNdsType('20');
    setCalculated(false);
    setResult(null);
  };

  /* ==================== ФОРМАТИРОВАНИЕ ==================== */

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₽';
  };

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {t('nds.title')}
        </h1>
        <p className="text-sm text-slate-400">
          {t('nds.description')}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Режим расчёта */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0">
            {lang === 'ru' ? 'Режим расчёта' : 'Calculation mode'}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('add')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                mode === 'add'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {lang === 'ru' ? 'Прибавить НДС' : 'Add VAT'}
            </button>
            <button
              onClick={() => setMode('extract')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                mode === 'extract'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {lang === 'ru' ? 'Извлечь НДС' : 'Extract VAT'}
            </button>
          </div>
        </div>

        {/* Подсказка к режиму */}
        <div className="mb-6 bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400">
            {mode === 'add'
              ? (lang === 'ru'
                ? 'Вы вводите цену БЕЗ НДС → калькулятор покажет сумму НДС и итоговую цену С НДС'
                : 'You enter the price WITHOUT VAT → calculator shows VAT amount and final price WITH VAT')
              : (lang === 'ru'
                ? 'Вы вводите цену С НДС → калькулятор покажет сумму НДС и цену БЕЗ НДС'
                : 'You enter the price WITH VAT → calculator shows VAT amount and price WITHOUT VAT')}
          </p>
        </div>

        {/* Сумма */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0">
            {mode === 'add'
              ? (lang === 'ru' ? 'Цена без НДС' : 'Price without VAT')
              : (lang === 'ru' ? 'Цена с НДС' : 'Price with VAT')}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">₽</span>
          </div>
        </div>

        {/* Ставка НДС */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-600 mb-3">
            {lang === 'ru' ? 'Ставка НДС' : 'VAT rate'}
          </label>
          <div className="space-y-2">
            {NDS_RATES.map((r) => (
              <button
                key={r.value}
                onClick={() => setNdsType(r.value)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  ndsType === r.value
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                    : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
                }`}
              >
                {lang === 'ru' ? r.labelRu : r.labelEn}
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
          {/* Сумма НДС — главная карточка */}
          <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
            <p className="text-sm font-medium text-white/70 mb-1">
              {lang === 'ru' ? 'Сумма НДС' : 'VAT amount'}
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatCurrency(result.ndsAmount)}
            </p>
            <p className="text-sm text-white/60 mt-2">
              {lang === 'ru' ? `Ставка: ${result.rate}%` : `Rate: ${result.rate}%`}
            </p>
          </div>

          {/* Цена без НДС */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Цена без НДС' : 'Price without VAT'}
            </p>
            <p className="text-xl font-bold text-slate-800">
              {formatCurrency(result.priceWithoutNDS)}
            </p>
          </div>

          {/* Цена с НДС */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">
              {lang === 'ru' ? 'Цена с НДС' : 'Price with VAT'}
            </p>
            <p className="text-xl font-bold text-indigo-600">
              {formatCurrency(result.priceWithNDS)}
            </p>
          </div>

          {/* Формула расчёта */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Формула расчёта' : 'Calculation formula'}
            </p>
            <div className="space-y-2.5">
              {mode === 'add' ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'НДС = Цена × Ставка / 100' : 'VAT = Price × Rate / 100'}
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {result.priceWithoutNDS.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {result.rate}% = {formatCurrency(result.ndsAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Итого с НДС' : 'Total with VAT'}
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {result.priceWithoutNDS.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} + {result.ndsAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = {formatCurrency(result.priceWithNDS)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Цена без НДС = Цена с НДС / (1 + Ставка/100)' : 'Price without VAT = Price with VAT / (1 + Rate/100)'}
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {result.priceWithNDS.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {(1 + result.rate / 100).toFixed(2)} = {formatCurrency(result.priceWithoutNDS)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'НДС = Цена с НДС − Цена без НДС' : 'VAT = Price with VAT − Price without VAT'}
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {result.priceWithNDS.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} − {result.priceWithoutNDS.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = {formatCurrency(result.ndsAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Таблица ставок */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Ставки НДС (НК РФ, ст. 164)' : 'VAT rates (Tax Code, Art. 164)'}
            </p>
            <div className="space-y-2">
              {[
                { rate: '20%', descRu: 'Основная ставка', descEn: 'Standard rate' },
                { rate: '10%', descRu: 'Продовольствие, детские товары, медицинские, книги', descEn: 'Food, children goods, medical, books' },
                { rate: '5%', descRu: 'Спецрежим (МСП, доходы)', descEn: 'Special regime (SME, income)' },
                { rate: '0%', descRu: 'Экспорт, международные перевозки', descEn: 'Export, international transport' },
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
                ? '⚠️ Расчёт приблизительный. Точные ставки и условия могут отличаться в зависимости от категории товаров/услуг. Обратитесь к бухгалтеру или в ФНС.'
                : '⚠️ Estimate only. Exact rates and conditions may vary depending on goods/services category. Consult an accountant or FTS.'}
            </p>
          </div>
        </div>
      ) : (
        /* Подсказка */
        <div className="mt-6 bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-slate-300 mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
              <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 12a2 2 0 000 4h4v-4h-4z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {lang === 'ru'
              ? 'Введите сумму, выберите ставку и нажмите «Рассчитать»'
              : 'Enter amount, select rate and press «Calculate»'}
          </p>
        </div>
      )}
    </div>
  );
}
