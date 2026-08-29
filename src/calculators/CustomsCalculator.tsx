/**
 * Калькулятор растаможки автомобилей (ввоз в РФ)
 *
 * Рассчитывает полную стоимость таможенного оформления автомобиля:
 *   1. Таможенная пошлина
 *   2. НДС (20%)
 *   3. Акциз (при мощности > 150 л.с.)
 *   4. Утильсбор (отдельный калькулятор)
 *
 * Формулы (ТК ЕАЭС, Решение Совета ЕЭК № 107):
 *
 * Таможенная пошлина (ст. 79 ТК ЕАЭС):
 *   Новые ТС (до 3 лет от даты выпуска):
 *     Длина ≤ 3 м: БТС × 15%
 *     Длина > 3 м:
 *       0-1000 см³:   БТС × 15%
 *       1000-1500 см³: БТС × 15%
 *       1500-1800 см³: 0.50 €/см³
 *       1800-2300 см³: 0.45 €/см³
 *       2300-3000 см³: 0.35 €/см³
 *       3000+ см³:     БТС × 15%
 *
 *   Старше 3 лет (использованные):
 *     Длина ≤ 3 м: БТС × 15%
 *     Длина > 3 м:
 *       0-1000 см³:   БТС × 15%
 *       1000-1500 см³: 1.50 €/см³
 *       1500-1800 см³: 1.70 €/см³
 *       1800-2300 см³: 2.50 €/см³
 *       2300-3000 см³: 3.00 €/см³
 *       3000+ см³:     3.60 €/см³
 *
 *   Где БТС = таможенная стоимость × курс ЦБ на дату подачи ДТ
 *
 * НДС (ст. 164 НК РФ):
 *   НДС = (БТС + Пошлина) × 20%
 *
 * Акциз (ст. 193 НК РФ):
 *   Бензин ≤ 150 л.с. → 0 ₽
 *   Бензин 150-200 л.с.: (л.с. − 150) × 54 ₽
 *   Бензин > 200 л.с.:  (л.с. − 150) × 500 ₽
 *   Дизель ≤ 150 л.с. → 0 ₽
 *   Дизель 150-200 л.с.: (л.с. − 150) × 49 ₽
 *   Дизель > 200 л.с.:  (л.с. − 150) × 493 ₽
 *
 * Курс евро (актуальное значение):
 *   Условное: 1 € = 100 ₽ (пользователь может задать своё)
 */
import { useState, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';

/* ==================== ТИПЫ ==================== */

/* Тип топлива */
type FuelType = 'gasoline' | 'diesel';

/* Интерфейс результата */
interface CustomsResult {
  customsValue: number;     /* Таможенная стоимость (₽) */
  eurRate: number;          /* Курс евро (₽/€) */
  customsValueEur: number;  /* Таможенная стоимость в € */
  dutyPercent: number;      /* Ставка пошлины (%) */
  dutyFixed: number;        /* Фиксированная ставка (€/см³) */
  dutyType: 'percent' | 'fixed'; /* Тип расчёта пошлины */
  dutyAmount: number;       /* Сумма пошлины (₽) */
  vatAmount: number;        /* НДС (₽) */
  exciseAmount: number;     /* Акциз (₽) */
  totalCost: number;        /* Итого растаможка (₽) */
  engineDisplacement: number; /* Объём двигателя (см³) */
  enginePower: number;      /* Мощность (л.с.) */
  vehicleAge: number;       /* Возраст ТС (лет) */
}

/* ==================== КОНСТАНТЫ ==================== */

/* Курс евро (₽/€) — из .env или значение по умолчанию */
const DEFAULT_EUR_RATE = Number(import.meta.env.VITE_EUR_RATE) || 100;

/* Порог мощности для начала начисления акциза */
const EXCISE_THRESHOLD = 150;

/* Ставки акциза (₽/л.с. сверх порога) — ст. 193 НК РФ */
const EXCISE_RATES = {
  gasoline: {
    mid: 54,   /* 150-200 л.с. */
    high: 500, /* 200+ л.с. */
  },
  diesel: {
    mid: 49,
    high: 493,
  },
};

/* ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================== */

function formatCurrency(value: number): string {
  return Math.round(value).toLocaleString('ru-RU') + ' ₽';
}

function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function CustomsCalculator() {
  /* Таможенная стоимость (₽) */
  const [customsValue, setCustomsValue] = useState('');

  /* Объём двигателя (см³) */
  const [displacement, setDisplacement] = useState('');

  /* Мощность (л.с.) */
  const [power, setPower] = useState('');

  /* Дата выпуска ТС */
  const [manufactureDate, setManufactureDate] = useState('');

  /* Тип топлива */
  const [fuelType, setFuelType] = useState<FuelType>('gasoline');

  /* Длина ТС (для определения ставки: ≤ 3 м или > 3 м) */
  const [isShort, setIsShort] = useState(false);

  /* Курс евро */
  const [eurRate, setEurRate] = useState(String(DEFAULT_EUR_RATE));

  /* Флаг расчёта */
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<CustomsResult | null>(null);

  const lang = useLanguage();

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  const calculate = useCallback((): CustomsResult | null => {
    const btS = parseFloat(customsValue);
    const disp = parseInt(displacement);
    const hp = parseInt(power);
    const date = manufactureDate;
    const rate = parseFloat(eurRate) || DEFAULT_EUR_RATE;

    if (!btS || btS <= 0 || !disp || disp <= 0 || !hp || hp <= 0 || !date) return null;

    /* Считаем возраст ТС */
    const manufDate = new Date(date);
    if (isNaN(manufDate.getTime())) return null;
    const now = new Date();
    const ageMs = now.getTime() - manufDate.getTime();
    const ageYears = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
    const isNew = ageYears < 3;

    /* Таможенная стоимость в евро */
    const btSEur = btS / rate;

    /* ---- 1. ТАМОЖЕННАЯ ПОШЛИНА ---- */
    let dutyPercent = 0;
    let dutyFixed = 0;
    let dutyType: 'percent' | 'fixed' = 'percent';
    let dutyAmount = 0;

    if (isShort) {
      /* Длина ≤ 3 м → всегда 15% */
      dutyPercent = 15;
      dutyType = 'percent';
      dutyAmount = btS * 0.15;
    } else if (isNew) {
      /* Новые ТС (до 3 лет) */
      if (disp <= 1000 || (disp > 1000 && disp <= 1500)) {
        dutyPercent = 15;
        dutyType = 'percent';
        dutyAmount = btS * 0.15;
      } else if (disp <= 1800) {
        dutyFixed = 0.50;
        dutyType = 'fixed';
        dutyAmount = disp * 0.50 * rate;
      } else if (disp <= 2300) {
        dutyFixed = 0.45;
        dutyType = 'fixed';
        dutyAmount = disp * 0.45 * rate;
      } else if (disp <= 3000) {
        dutyFixed = 0.35;
        dutyType = 'fixed';
        dutyAmount = disp * 0.35 * rate;
      } else {
        dutyPercent = 15;
        dutyType = 'percent';
        dutyAmount = btS * 0.15;
      }
    } else {
      /* Старше 3 лет (использованные) */
      if (disp <= 1000) {
        dutyPercent = 15;
        dutyType = 'percent';
        dutyAmount = btS * 0.15;
      } else if (disp <= 1500) {
        dutyFixed = 1.50;
        dutyType = 'fixed';
        dutyAmount = disp * 1.50 * rate;
      } else if (disp <= 1800) {
        dutyFixed = 1.70;
        dutyType = 'fixed';
        dutyAmount = disp * 1.70 * rate;
      } else if (disp <= 2300) {
        dutyFixed = 2.50;
        dutyType = 'fixed';
        dutyAmount = disp * 2.50 * rate;
      } else if (disp <= 3000) {
        dutyFixed = 3.00;
        dutyType = 'fixed';
        dutyAmount = disp * 3.00 * rate;
      } else {
        dutyFixed = 3.60;
        dutyType = 'fixed';
        dutyAmount = disp * 3.60 * rate;
      }
    }

    /* ---- 2. НДС (20%) ---- */
    const vatAmount = (btS + dutyAmount) * 0.20;

    /* ---- 3. АКЦИЗ ---- */
    let exciseAmount = 0;
    if (hp > EXCISE_THRESHOLD) {
      const excess = hp - EXCISE_THRESHOLD;
      const rates = EXCISE_RATES[fuelType];

      if (hp <= 200) {
        /* 150-200 л.с. — пониженная ставка */
        exciseAmount = excess * rates.mid;
      } else {
        /* 200+ л.с. — повышенная ставка */
        exciseAmount = excess * rates.high;
      }
    }

    /* ---- ИТОГО ---- */
    const totalCost = dutyAmount + vatAmount + exciseAmount;

    return {
      customsValue: btS,
      eurRate: rate,
      customsValueEur: btSEur,
      dutyPercent,
      dutyFixed,
      dutyType,
      dutyAmount,
      vatAmount,
      exciseAmount,
      totalCost,
      engineDisplacement: disp,
      enginePower: hp,
      vehicleAge: ageYears,
    };
  }, [customsValue, displacement, power, manufactureDate, fuelType, isShort, eurRate]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  const handleReset = () => {
    setCustomsValue('');
    setDisplacement('');
    setPower('');
    setManufactureDate('');
    setFuelType('gasoline');
    setIsShort(false);
    setEurRate(String(DEFAULT_EUR_RATE));
    setCalculated(false);
    setResult(null);
  };

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Калькулятор растаможки' : 'Customs Clearance Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте полную стоимость таможенного оформления автомобиля при ввозе в РФ'
            : 'Calculate full customs clearance cost when importing a vehicle to Russia'}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Таможенная стоимость */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Таможенная стоимость' : 'Customs value'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="decimal"
              value={customsValue}
              onChange={(e) => setCustomsValue(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">₽</span>
          </div>
        </div>

        {/* Курс евро */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Курс евро (₽/€)' : 'EUR/RUB rate'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="decimal"
              value={eurRate}
              onChange={(e) => setEurRate(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
              placeholder="100"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">₽/€</span>
          </div>
        </div>

        {/* Объём двигателя */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Объём двигателя' : 'Engine displacement'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="numeric"
              value={displacement}
              onChange={(e) => setDisplacement(e.target.value.replace(/\D/g, ''))}
              placeholder="2000"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">см³</span>
          </div>
        </div>

        {/* Мощность двигателя */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Мощность двигателя' : 'Engine power'}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="numeric"
              value={power}
              onChange={(e) => setPower(e.target.value.replace(/\D/g, ''))}
              placeholder="150"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">л.с.</span>
          </div>
        </div>

        {/* Дата выпуска */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Дата выпуска ТС' : 'Date of manufacture'}
          </label>
          <input
            type="date"
            value={manufactureDate}
            onChange={(e) => setManufactureDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Тип топлива */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
            {lang === 'ru' ? 'Тип топлива' : 'Fuel type'}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFuelType('gasoline')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                fuelType === 'gasoline'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {lang === 'ru' ? 'Бензин' : 'Gasoline'}
            </button>
            <button
              onClick={() => setFuelType('diesel')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                fuelType === 'diesel'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {lang === 'ru' ? 'Дизель' : 'Diesel'}
            </button>
          </div>
        </div>

        {/* Длина ТС */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-slate-600 sm:w-56 shrink-0">
              {lang === 'ru' ? 'Длина ТС' : 'Vehicle length'}
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isShort}
                onChange={(e) => setIsShort(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">
                {lang === 'ru' ? 'Длина ≤ 3 метров (mini, city car)' : 'Length ≤ 3 meters (mini, city car)'}
              </span>
            </label>
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
          {/* Итого — главная карточка */}
          <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
            <p className="text-sm font-medium text-white/70 mb-1">
              {lang === 'ru' ? 'Итого растаможка' : 'Total customs clearance'}
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatCurrency(result.totalCost)}
            </p>
            <p className="text-sm text-white/60 mt-2">
              {result.engineDisplacement} см³ / {result.enginePower} л.с. / {lang === 'ru' ? `${result.vehicleAge} ${result.vehicleAge < 5 ? 'года' : 'лет'}` : `${result.vehicleAge} years`}
            </p>
          </div>

          {/* Разбивка */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Составляющие' : 'Breakdown'}
            </p>
            <div className="space-y-2.5">
              {[
                {
                  labelRu: 'Таможенная пошлина',
                  labelEn: 'Customs duty',
                  value: result.dutyAmount,
                  desc: result.dutyType === 'percent'
                    ? `${result.dutyPercent}% от БТС`
                    : `${result.dutyFixed} €/см³ × ${result.engineDisplacement} см³`,
                },
                {
                  labelRu: 'НДС (20%)',
                  labelEn: 'VAT (20%)',
                  value: result.vatAmount,
                  desc: `20% от (${formatCurrency(result.customsValue)} + ${formatCurrency(result.dutyAmount)})`,
                },
                {
                  labelRu: 'Акциз',
                  labelEn: 'Excise tax',
                  value: result.exciseAmount,
                  desc: result.exciseAmount > 0
                    ? (lang === 'ru'
                      ? `${result.enginePower} л.с. (свыше ${EXCISE_THRESHOLD})`
                      : `${result.enginePower} HP (over ${EXCISE_THRESHOLD})`)
                    : (lang === 'ru' ? `≤ ${EXCISE_THRESHOLD} л.с. — не облагается` : `≤ ${EXCISE_THRESHOLD} HP — exempt`),
                },
              ].map((item) => (
                <div key={item.labelRu} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-500">{lang === 'ru' ? item.labelRu : item.labelEn}</span>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <span className={`font-semibold ${item.value > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Итого' : 'Total'}</span>
                <span className="font-bold text-indigo-600">{formatCurrency(result.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Таможенная пошлина — таблица */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Ставки таможенной пошлины (ТК ЕАЭС)' : 'Customs duty rates (EAEU Customs Code)'}
            </p>
            <div className="space-y-1">
              {[
                { range: '≤ 3 м', rate: '15%', descRu: 'mini / city car', descEn: 'mini / city car' },
                { range: '0-1000 см³', rate: '15%', descRu: 'новые', descEn: 'new' },
                { range: '1000-1500 см³', rate: '15%', descRu: 'новые / 1.50 €/см³ старше 3 лет', descEn: 'new / 1.50 €/cm³ used' },
                { range: '1500-1800 см³', rate: '0.50 €/см³', descRu: 'новые / 1.70 €/см³ старше', descEn: 'new / 1.70 €/cm³ used' },
                { range: '1800-2300 см³', rate: '0.45 €/см³', descRu: 'новые / 2.50 €/см³ старше', descEn: 'new / 2.50 €/cm³ used' },
                { range: '2300-3000 см³', rate: '0.35 €/см³', descRu: 'новые / 3.00 €/см³ старше', descEn: 'new / 3.00 €/cm³ used' },
                { range: '3000+ см³', rate: '15% / 3.60 €/см³', descRu: 'новые / старше', descEn: 'new / used' },
              ].map((item) => (
                <div key={item.range} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 w-28">{item.range}</span>
                  <span className="text-slate-400 flex-1 px-2">{lang === 'ru' ? item.descRu : item.descEn}</span>
                  <span className="font-semibold text-slate-700">{item.rate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Акциз — таблица */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Ставки акциза (ст. 193 НК РФ)' : 'Excise rates (Art. 193 Tax Code)'}
            </p>
            <div className="space-y-1">
              {[
                { power: '≤ 150 л.с.', rate: '0 ₽', descRu: 'не облагается', descEn: 'exempt' },
                { power: '150-200 л.с. бензин', rate: '54 ₽/л.с.', descRu: 'сверх 150', descEn: 'over 150' },
                { power: '200+ л.с. бензин', rate: '500 ₽/л.с.', descRu: 'сверх 150', descEn: 'over 150' },
                { power: '150-200 л.с. дизель', rate: '49 ₽/л.с.', descRu: 'сверх 150', descEn: 'over 150' },
                { power: '200+ л.с. дизель', rate: '493 ₽/л.с.', descRu: 'сверх 150', descEn: 'over 150' },
              ].map((item) => (
                <div key={item.power} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{item.power}</span>
                  <span className="font-semibold text-slate-700">{item.rate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Примечание */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              {lang === 'ru'
                ? '⚠️ Расчёт приблизительный. Точные ставки зависят от курса ЦБ на дату подачи ДТ, категории ТС и действующих льгот. Обратитесь в таможню.'
                : '⚠️ Estimate only. Actual rates depend on CBR rate on the date of declaration, vehicle category and applicable benefits. Contact customs.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-slate-300 mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
              <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-5l-3 3-3-3z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 9H8M14 13H8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {lang === 'ru'
              ? 'Заполните параметры автомобиля и нажмите «Рассчитать»'
              : 'Fill in vehicle parameters and press «Calculate»'}
          </p>
        </div>
      )}
    </div>
  );
}
