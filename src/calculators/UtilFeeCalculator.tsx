/**
 * Калькулятор утильсбора (утилизационный сбор)
 *
 * Рассчитывает стоимость утилизационного сбора при ввозе ТС в РФ
 * на основании Постановления Правительства РФ № 616.
 *
 * Формула:
 *   УС = БТ × КТ × НВ × КЦ × КД
 *
 * Параметры:
 *   БТ — базовая ставка (зависит от типа ТС и объёма двигателя)
 *   КТ — коэффициент территории (1.0 для большинства регионов)
 *   НВ — коэффициент изменения ставки (обновляется ежегодно, актуален 2024+)
 *   КЦ — коэффициент типа ТС (легковые, грузовые, автобусы и т.д.)
 *   КД — коэффициент возраста ТС (заводская дата + мощность)
 *
 * Базовые ставки (ПП РФ № 616, приложение):
 *   Легковые:  0-1 л.с. → 20 000, 1-2 л.с. → 30 000, 2-3 л.с. → 42 000, 3+ л.с. → 48 000
 *   Грузовые:  до 2.5 т → 20 000, 2.5-3.5 т → 30 000, 3.5+ т → 42 000
 *   Автобусы:  до 8 мест → 20 000, 8-25 мест → 30 000, 25+ мест → 42 000
 *   Мотоциклы: до 150 л.с. → 2 000, 150+ л.с. → 3 000
 *   Прицепы:   до 0.5 т → 3 000, 0.5-1 т → 5 000, 1-2 т → 10 000, 2+ т → 20 000
 *
 * КЦ (коэффициент типа ТС):
 *   Легковые → 1, Грузовые → 1, Автобусы → 1, Мотоциклы → 0.5, Прицепы → 0.5
 *
 * КД (коэффициент возраста):
 *   Новые (≤ 3 лет)  → 0.20
 *   3-5 лет           → 0.38
 *   5-7 лет           → 0.50
 *   7-10 лет          → 0.75
 *   10+ лет           → 1.00
 *   Грузовые 7+ лет   → 0.60 (отдельное правило)
 *
 * НВ (коэффициент изменения ставки):
 *   2024: 1.42 (актуальное значение)
 */
import { useState, useEffect, useCallback } from 'react';
import { getLanguage } from '../i18n';

/* ==================== ТИПЫ ==================== */

/* Тип транспортного средства */
type VehicleCategory = 'car' | 'truck' | 'bus' | 'motorcycle' | 'trailer';

/* Тип двигателя (влияет на КД для грузовых 7+ лет) */
type EngineType = 'diesel' | 'gasoline';

/* Интерфейс результата */
interface UtilFeeResult {
  baseRate: number;        /* Базовая ставка БТ (₽) */
  regionCoeff: number;     /* Коэффициент территории КТ */
  changeCoeff: number;     /* Коэффициент изменения ставки НВ */
  typeCoeff: number;       /* Коэффициент типа ТС КЦ */
  ageCoeff: number;        /* Коэффициент возраста КД */
  totalFee: number;        /* Итого утильсбор (₽) */
  vehicleAge: number;      /* Возраст ТС (лет) */
}

/* ==================== КОНСТАНТЫ ==================== */

/**
 * Базовые ставки утильсбора (₽) по типу ТС и объёму/грузоподъёмности
 * Источник: ПП РФ № 616, приложение к статье 2
 */
const BASE_RATES: Record<VehicleCategory, { labelRu: string; labelEn: string; ranges: { min: number; max: number; rate: number; unitRu: string; unitEn: string }[] }> = {
  car: {
    labelRu: 'Легковые автомобили',
    labelEn: 'Passenger cars',
    ranges: [
      { min: 0, max: 1000, rate: 20000, unitRu: 'л.с.', unitEn: 'HP' },
      { min: 1000, max: 2000, rate: 30000, unitRu: 'л.с.', unitEn: 'HP' },
      { min: 2000, max: 3000, rate: 42000, unitRu: 'л.с.', unitEn: 'HP' },
      { min: 3000, max: Infinity, rate: 48000, unitRu: 'л.с.', unitEn: 'HP' },
    ],
  },
  truck: {
    labelRu: 'Грузовые автомобили',
    labelEn: 'Trucks',
    ranges: [
      { min: 0, max: 2500, rate: 20000, unitRu: 'кг', unitEn: 'kg' },
      { min: 2500, max: 3500, rate: 30000, unitRu: 'кг', unitEn: 'kg' },
      { min: 3500, max: Infinity, rate: 42000, unitRu: 'кг', unitEn: 'kg' },
    ],
  },
  bus: {
    labelRu: 'Автобусы',
    labelEn: 'Buses',
    ranges: [
      { min: 0, max: 8, rate: 20000, unitRu: 'мест', unitEn: 'seats' },
      { min: 8, max: 25, rate: 30000, unitRu: 'мест', unitEn: 'seats' },
      { min: 25, max: Infinity, rate: 42000, unitRu: 'мест', unitEn: 'seats' },
    ],
  },
  motorcycle: {
    labelRu: 'Мотоциклы',
    labelEn: 'Motorcycles',
    ranges: [
      { min: 0, max: 150, rate: 2000, unitRu: 'л.с.', unitEn: 'HP' },
      { min: 150, max: Infinity, rate: 3000, unitRu: 'л.с.', unitEn: 'HP' },
    ],
  },
  trailer: {
    labelRu: 'Прицепы',
    labelEn: 'Trailers',
    ranges: [
      { min: 0, max: 500, rate: 3000, unitRu: 'кг', unitEn: 'kg' },
      { min: 500, max: 1000, rate: 5000, unitRu: 'кг', unitEn: 'kg' },
      { min: 1000, max: 2000, rate: 10000, unitRu: 'кг', unitEn: 'kg' },
      { min: 2000, max: Infinity, rate: 20000, unitRu: 'кг', unitEn: 'kg' },
    ],
  },
};

/**
 * Коэффициент типа ТС (КЦ)
 * Легковые, грузовые, автобусы → 1.0
 * Мотоциклы, прицепы → 0.5
 */
const TYPE_COEFFICIENTS: Record<VehicleCategory, number> = {
  car: 1,
  truck: 1,
  bus: 1,
  motorcycle: 0.5,
  trailer: 0.5,
};

/**
 * Коэффициент возраста (КД)
 * Зависит от возраста ТС и типа двигателя
 *
 * Легковые, мотоциклы, автобусы, прицепы:
 *   ≤ 3 лет → 0.20
 *   3-5 лет → 0.38
 *   5-7 лет → 0.50
 *   7-10 лет → 0.75
 *   10+ лет → 1.00
 *
 * Грузовые:
 *   ≤ 3 лет → 0.20
 *   3-5 лет → 0.38
 *   5-7 лет → 0.50
 *   7+ лет (дизель) → 0.60  ← отдельное правило!
 *   7+ лет (бензин) → 1.00  ← как общее правило 10+
 */
function getAgeCoefficient(ageYears: number, category: VehicleCategory, engineType: EngineType): number {
  /* Грузовые 7+ лет: дизель → 0.60, бензин → 1.00 */
  if (category === 'truck' && ageYears >= 7) {
    return engineType === 'diesel' ? 0.60 : 1.00;
  }
  if (ageYears <= 3) return 0.20;
  if (ageYears <= 5) return 0.38;
  if (ageYears <= 7) return 0.50;
  if (ageYears <= 10) return 0.75;
  return 1.00;
}

/**
 * Коэффициент изменения ставки (НВ)
 * Актуальное значение: 2024+
 * Правительство обновляет ежегодно (ПП РФ № 616)
 */
const RATE_CHANGE_COEFF = 1.42;

/* ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================== */

function formatCurrency(value: number): string {
  return Math.round(value).toLocaleString('ru-RU') + ' ₽';
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function UtilFeeCalculator() {
  /* Тип ТС */
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('car');

  /* Тип двигателя (только для грузовых, влияет на КД 7+ лет) */
  const [engineType, setEngineType] = useState<EngineType>('diesel');

  /* Мощность / объём / грузоподъёмность (ед. измерения зависят от типа) */
  const [specValue, setSpecValue] = useState('');

  /* Дата изготовления ТС */
  const [manufactureDate, setManufactureDate] = useState('');

  /* Регистрация в РФ (is it first registration in Russia?) */
  const [isFirstReg, setIsFirstReg] = useState(false);

  /* Флаг расчёта */
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<UtilFeeResult | null>(null);

  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [, setLangTick] = useState(0);

  useEffect(() => {
    const handler = () => {
      setLang(getLanguage());
      setLangTick((v) => v + 1);
    };
    setLang(getLanguage());
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  /* Текущая информация о типе ТС */
  const currentType = BASE_RATES[vehicleType];

  /**
   * Определяем допустимый диапазон значений
   */
  const currentRange = currentType.ranges.find(
    (r) => parseFloat(specValue) >= r.min && (r.max === Infinity || parseFloat(specValue) < r.max)
  );

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  const calculate = useCallback((): UtilFeeResult | null => {
    const spec = parseFloat(specValue);
    if (!spec || spec <= 0 || !manufactureDate) return null;

    /* Находим базовую ставку по текущему значению */
    const range = currentType.ranges.find(
      (r) => spec >= r.min && (r.max === Infinity || spec < r.max)
    );
    if (!range) return null;

    const baseRate = range.rate;
    const typeCoeff = TYPE_COEFFICIENTS[vehicleType];

    /* Считаем возраст ТС */
    const manufDate = new Date(manufactureDate);
    if (isNaN(manufDate.getTime())) return null;

    const now = new Date();
    const ageMs = now.getTime() - manufDate.getTime();
    const ageYears = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
    const ageCoeff = getAgeCoefficient(ageYears, vehicleType, engineType);

    /* Коэффициент территории — 1.0 (большинство регионов) */
    const regionCoeff = 1.0;

    /* Итого */
    const totalFee = baseRate * regionCoeff * RATE_CHANGE_COEFF * typeCoeff * ageCoeff;

    return {
      baseRate,
      regionCoeff,
      changeCoeff: RATE_CHANGE_COEFF,
      typeCoeff,
      ageCoeff,
      totalFee,
      vehicleAge: ageYears,
    };
  }, [specValue, manufactureDate, vehicleType, engineType, currentType]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  const handleReset = () => {
    setVehicleType('car');
    setEngineType('diesel');
    setSpecValue('');
    setManufactureDate('');
    setIsFirstReg(false);
    setCalculated(false);
    setResult(null);
  };

  /* ==================== РЕНДЕР ==================== */

  /* Текст для единиц измерения */
  const getUnitLabel = () => {
    if (!currentRange) return '';
    return lang === 'ru' ? currentRange.unitRu : currentRange.unitEn;
  };

  /* Метки возрастных коэффициентов */
  const ageCoeffLabels: { maxAge: number; coeff: number; labelRu: string; labelEn: string }[] = [
    { maxAge: 3, coeff: 0.20, labelRu: 'до 3 лет', labelEn: 'up to 3 years' },
    { maxAge: 5, coeff: 0.38, labelRu: '3–5 лет', labelEn: '3–5 years' },
    { maxAge: 7, coeff: 0.50, labelRu: '5–7 лет', labelEn: '5–7 years' },
    { maxAge: 10, coeff: 0.75, labelRu: '7–10 лет', labelEn: '7–10 years' },
    { maxAge: Infinity, coeff: 1.00, labelRu: '10+ лет', labelEn: '10+ years' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Калькулятор утильсбора' : 'Utilization Fee Calculator'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте стоимость утилизационного сбора при ввозе ТС в РФ (ПП РФ № 616)'
            : 'Calculate vehicle utilization fee for import to Russia (Government Decree No. 616)'}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Тип ТС */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
            {lang === 'ru' ? 'Тип транспортного средства' : 'Vehicle type'}
          </label>
          <select
            value={vehicleType}
            onChange={(e) => {
              setVehicleType(e.target.value as VehicleCategory);
              setSpecValue('');
            }}
            className="flex-1 max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          >
            {(Object.keys(BASE_RATES) as VehicleCategory[]).map((key) => (
              <option key={key} value={key}>
                {lang === 'ru' ? BASE_RATES[key].labelRu : BASE_RATES[key].labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Тип двигателя — только для грузовых ТС */}
        {vehicleType === 'truck' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
              {lang === 'ru' ? 'Тип двигателя' : 'Engine type'}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setEngineType('diesel')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  engineType === 'diesel'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {lang === 'ru' ? 'Дизель' : 'Diesel'}
              </button>
              <button
                onClick={() => setEngineType('gasoline')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  engineType === 'gasoline'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {lang === 'ru' ? 'Бензин' : 'Gasoline'}
              </button>
            </div>
          </div>
        )}

        {/* Мощность / объём */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
            {vehicleType === 'car' || vehicleType === 'motorcycle'
              ? (lang === 'ru' ? 'Мощность двигателя' : 'Engine power')
              : vehicleType === 'truck'
                ? (lang === 'ru' ? 'Грузоподъёмность' : 'Payload capacity')
                : vehicleType === 'bus'
                  ? (lang === 'ru' ? 'Количество мест' : 'Number of seats')
                  : (lang === 'ru' ? 'Грузоподъёмность' : 'Payload capacity')}
          </label>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="text"
              inputMode="numeric"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value.replace(/\D/g, ''))}
              placeholder={vehicleType === 'car' ? '150' : vehicleType === 'truck' ? '3000' : vehicleType === 'bus' ? '20' : '100'}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">{getUnitLabel()}</span>
          </div>
        </div>

        {/* Дата изготовления */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-52 shrink-0">
            {lang === 'ru' ? 'Дата изготовления ТС' : 'Date of manufacture'}
          </label>
          <input
            type="date"
            value={manufactureDate}
            onChange={(e) => setManufactureDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Первичная регистрация в РФ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <div className="sm:w-52 shrink-0" />
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isFirstReg}
              onChange={(e) => setIsFirstReg(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">
              {lang === 'ru' ? 'Первичная регистрация в РФ' : 'First registration in Russia'}
            </span>
          </label>
        </div>

        {/* Инфо: физлицо / юрлицо */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-8">
          <p className="text-xs text-slate-400">
            {lang === 'ru'
              ? 'ℹ️ Стоимость утильсбора одинакова для физических и юридических лиц. Формула: УС = БТ × КТ × НВ × КЦ × КД'
              : 'ℹ️ Utilization fee is the same for individuals and legal entities. Formula: UF = BT × KT × NV × KC × KD'}
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

      {/* РЕЗУЛЬТАТЫ */}
      {calculated && result ? (
        <div className="mt-6 space-y-4 animate-fade-in">
          {/* Стоимость — главная карточка */}
          <div className="bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
            <p className="text-sm font-medium text-white/70 mb-1">
              {lang === 'ru' ? 'Стоимость утильсбора' : 'Utilization fee'}
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatCurrency(result.totalFee)}
            </p>
            <p className="text-sm text-white/60 mt-2">
              {lang === 'ru' ? `Возраст ТС: ${result.vehicleAge} ${result.vehicleAge < 5 ? 'года' : 'лет'}` : `Vehicle age: ${result.vehicleAge} years`}
            </p>
          </div>

          {/* Разбивка коэффициентов */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Формула расчёта' : 'Calculation formula'}
            </p>
            <div className="space-y-2.5">
              {[
                { label: 'БТ', value: formatCurrency(result.baseRate), descRu: 'Базовая ставка', descEn: 'Base rate' },
                { label: 'КТ', value: `×${result.regionCoeff}`, descRu: 'Коэффициент территории', descEn: 'Region coefficient' },
                { label: 'НВ', value: `×${result.changeCoeff}`, descRu: 'Коэффициент изменения ставки', descEn: 'Rate change coefficient' },
                { label: 'КЦ', value: `×${result.typeCoeff}`, descRu: 'Коэффициент типа ТС', descEn: 'Vehicle type coefficient' },
                { label: 'КД', value: `×${result.ageCoeff}`, descRu: 'Коэффициент возраста', descEn: 'Age coefficient' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-500">{item.label} — </span>
                    <span className="text-slate-400">{lang === 'ru' ? item.descRu : item.descEn}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'ru' ? 'Итого' : 'Total'}</span>
                <span className="font-bold text-orange-600">{formatCurrency(result.totalFee)}</span>
              </div>
            </div>
          </div>

          {/* Таблица ставок */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Базовые ставки (ПП РФ № 616)' : 'Base rates (Gov. Decree No. 616)'}
            </p>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-slate-400 font-medium">{lang === 'ru' ? 'Тип ТС' : 'Type'}</span>
                <span className="text-slate-400 font-medium">{lang === 'ru' ? 'Диапазон' : 'Range'}</span>
                <span className="text-slate-400 font-medium text-right">БТ</span>
              </div>
              {(Object.keys(BASE_RATES) as VehicleCategory[]).map((cat) =>
                BASE_RATES[cat].ranges.map((r, i) => (
                  <div key={`${cat}-${i}`} className="grid grid-cols-3 gap-2 text-xs">
                    <span className="text-slate-600">
                      {lang === 'ru' ? BASE_RATES[cat].labelRu : BASE_RATES[cat].labelEn}
                    </span>
                    <span className="text-slate-500">
                      {r.min}–{r.max === Infinity ? '∞' : r.max} {lang === 'ru' ? r.unitRu : r.unitEn}
                    </span>
                    <span className="text-slate-700 font-semibold text-right">{formatCurrency(r.rate)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Возрастные коэффициенты */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Возрастные коэффициенты (КД)' : 'Age coefficients (KD)'}
            </p>
            <div className="space-y-2">
              {ageCoeffLabels.map((item) => (
                <div key={item.maxAge} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{lang === 'ru' ? item.labelRu : item.labelEn}</span>
                  <span className={`font-semibold ${item.coeff === result.ageCoeff ? 'text-orange-600' : 'text-slate-700'}`}>
                    ×{item.coeff}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Примечание */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              {lang === 'ru'
                ? '⚠️ Расчёт приблизительный. Точный размер утильсбора зависит от региона, даты ввоза и актуального коэффициента изменения ставки. Обратитесь в ГИБДД или таможню.'
                : '⚠️ Estimate only. Actual fee depends on region, import date and current rate change coefficient. Contact traffic police or customs.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-slate-300 mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
              <path d="M5 17h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 17h2a2 2 0 002-2V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 17h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {lang === 'ru'
              ? 'Выберите тип ТС, мощность и дату изготовления, затем нажмите «Рассчитать»'
              : 'Select vehicle type, power and manufacture date, then press «Calculate»'}
          </p>
        </div>
      )}
    </div>
  );
}
