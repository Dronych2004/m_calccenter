/**
 * Конвертер единиц измерений
 *
 * Длина: метры, футы, дюймы, сантиметры, миллиметры, километры, мили
 * Вес: килограммы, фунты, унции, граммы, тонны
 * Объём: литры, галлоны (US), миллилитры, кубические метры
 * Температура: Цельсий, Фаренгейт, Кельвин
 * Площадь: кв. метры, кв. футы, гектары, акры
 */
import { useState, useEffect, useMemo } from 'react';
import { getLanguage } from '../i18n';

/* Категории единиц */
type Category = 'length' | 'weight' | 'volume' | 'temperature' | 'area';

interface Unit {
  id: string;
  nameRu: string;
  nameEn: string;
  factor: number; /* Множитель к базовой единице */
}

/* Базовые единицы для каждой категории:
   длина → метры, вес → килограммы, объём → литры,
   температура → градусы Цельсия (special), площадь → кв. метры */
const categories: Record<Category, { nameRu: string; nameEn: string; units: Unit[] }> = {
  length: {
    nameRu: 'Длина',
    nameEn: 'Length',
    units: [
      { id: 'mm', nameRu: 'Миллиметр (мм)', nameEn: 'Millimeter (mm)', factor: 0.001 },
      { id: 'cm', nameRu: 'Сантиметр (см)', nameEn: 'Centimeter (cm)', factor: 0.01 },
      { id: 'm', nameRu: 'Метр (м)', nameEn: 'Meter (m)', factor: 1 },
      { id: 'km', nameRu: 'Километр (км)', nameEn: 'Kilometer (km)', factor: 1000 },
      { id: 'inch', nameRu: 'Дюйм', nameEn: 'Inch', factor: 0.0254 },
      { id: 'ft', nameRu: 'Фут', nameEn: 'Foot', factor: 0.3048 },
      { id: 'yd', nameRu: 'Ярд', nameEn: 'Yard', factor: 0.9144 },
      { id: 'mi', nameRu: 'Миля', nameEn: 'Mile', factor: 1609.344 },
      { id: 'nmi', nameRu: 'Морская миля', nameEn: 'Nautical mile', factor: 1852 },
    ],
  },
  weight: {
    nameRu: 'Вес',
    nameEn: 'Weight',
    units: [
      { id: 'mg', nameRu: 'Миллиграмм (мг)', nameEn: 'Milligram (mg)', factor: 0.000001 },
      { id: 'g', nameRu: 'Грамм (г)', nameEn: 'Gram (g)', factor: 0.001 },
      { id: 'kg', nameRu: 'Килограмм (кг)', nameEn: 'Kilogram (kg)', factor: 1 },
      { id: 't', nameRu: 'Тонна', nameEn: 'Ton', factor: 1000 },
      { id: 'oz', nameRu: 'Унция', nameEn: 'Ounce', factor: 0.0283495 },
      { id: 'lb', nameRu: 'Фунт', nameEn: 'Pound', factor: 0.453592 },
      { id: 'st', nameRu: 'Стон (stone)', nameEn: 'Stone', factor: 6.35029 },
    ],
  },
  volume: {
    nameRu: 'Объём',
    nameEn: 'Volume',
    units: [
      { id: 'ml', nameRu: 'Миллилитр (мл)', nameEn: 'Milliliter (mL)', factor: 0.001 },
      { id: 'l', nameRu: 'Литр (л)', nameEn: 'Liter (L)', factor: 1 },
      { id: 'm3', nameRu: 'Кубический метр (м³)', nameEn: 'Cubic meter (m³)', factor: 1000 },
      { id: 'tsp', nameRu: 'Чайная ложка', nameEn: 'Teaspoon', factor: 0.00492892 },
      { id: 'tbsp', nameRu: 'Столовая ложка', nameEn: 'Tablespoon', factor: 0.0147868 },
      { id: 'cup', nameRu: 'Чашка (cup)', nameEn: 'Cup', factor: 0.236588 },
      { id: 'gal_us', nameRu: 'Галлон (US)', nameEn: 'Gallon (US)', factor: 3.78541 },
      { id: 'gal_uk', nameRu: 'Галлон (UK)', nameEn: 'Gallon (UK)', factor: 4.54609 },
      { id: 'floz_us', nameRu: 'Жидкая унция (US)', nameEn: 'Fluid ounce (US)', factor: 0.0295735 },
    ],
  },
  temperature: {
    nameRu: 'Температура',
    nameEn: 'Temperature',
    units: [
      { id: 'c', nameRu: 'Цельсий (°C)', nameEn: 'Celsius (°C)', factor: 1 },
      { id: 'f', nameRu: 'Фаренгейт (°F)', nameEn: 'Fahrenheit (°F)', factor: 1 },
      { id: 'k', nameRu: 'Кельвин (K)', nameEn: 'Kelvin (K)', factor: 1 },
    ],
  },
  area: {
    nameRu: 'Площадь',
    nameEn: 'Area',
    units: [
      { id: 'mm2', nameRu: 'Кв. мм', nameEn: 'Sq. mm', factor: 0.000001 },
      { id: 'cm2', nameRu: 'Кв. см', nameEn: 'Sq. cm', factor: 0.0001 },
      { id: 'm2', nameRu: 'Кв. метр (м²)', nameEn: 'Sq. meter (m²)', factor: 1 },
      { id: 'km2', nameRu: 'Кв. километр', nameEn: 'Sq. kilometer', factor: 1000000 },
      { id: 'ha', nameRu: 'Гектар', nameEn: 'Hectare', factor: 10000 },
      { id: 'acre', nameRu: 'Акр', nameEn: 'Acre', factor: 4046.86 },
      { id: 'ft2', nameRu: 'Кв. фут', nameEn: 'Sq. foot', factor: 0.092903 },
      { id: 'in2', nameRu: 'Кв. дюйм', nameEn: 'Sq. inch', factor: 0.00064516 },
      { id: 'yd2', nameRu: 'Кв. ярд', nameEn: 'Sq. yard', factor: 0.836127 },
    ],
  },
};

/* Конвертация температуры (особая логика) */
function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value;

  /* Сначала переводим в Цельсий */
  let celsius: number;
  switch (from) {
    case 'c': celsius = value; break;
    case 'f': celsius = (value - 32) * 5 / 9; break;
    case 'k': celsius = value - 273.15; break;
    default: celsius = value;
  }

  /* Потом из Цельсия в целевую единицу */
  switch (to) {
    case 'c': return celsius;
    case 'f': return celsius * 9 / 5 + 32;
    case 'k': return celsius + 273.15;
    default: return celsius;
  }
}

function formatResult(value: number): string {
  if (Math.abs(value) >= 1000000) return value.toExponential(4);
  if (Math.abs(value) >= 100) return value.toFixed(2);
  if (Math.abs(value) >= 1) return value.toFixed(4);
  if (Math.abs(value) >= 0.01) return value.toFixed(6);
  return value.toExponential(4);
}

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [inputValue, setInputValue] = useState('1');
  const [, setLangTick] = useState(0);
  const lang = getLanguage();

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  const cat = categories[category];

  const result = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return null;

    if (category === 'temperature') {
      return convertTemperature(val, fromUnit, toUnit);
    }

    const fromFactor = cat.units.find((u) => u.id === fromUnit)?.factor ?? 1;
    const toFactor = cat.units.find((u) => u.id === toUnit)?.factor ?? 1;

    /* Конвертация: value × fromFactor / toFactor */
    return (val * fromFactor) / toFactor;
  }, [inputValue, fromUnit, toUnit, category, cat.units]);

  const getUnitName = (unit: Unit) => lang === 'ru' ? unit.nameRu : unit.nameEn;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Конвертер единиц измерений' : 'Unit Converter'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru' ? 'Длина, вес, объём, температура, площадь' : 'Length, weight, volume, temperature, area'}
        </p>
      </div>

      {/* Выбор категории */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {(Object.keys(categories) as Category[]).map((key) => (
          <button
            key={key}
            onClick={() => {
              setCategory(key);
              const units = categories[key].units;
              setFromUnit(units[0].id);
              setToUnit(units.length > 1 ? units[1].id : units[0].id);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              category === key
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {lang === 'ru' ? categories[key].nameRu : categories[key].nameEn}
          </button>
        ))}
      </div>

      {/* Конвертер */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          {/* From */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              {lang === 'ru' ? 'Из' : 'From'}
            </label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all mb-3"
            >
              {cat.units.map((u) => (
                <option key={u.id} value={u.id}>{getUnitName(u)}</option>
              ))}
            </select>
            <input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(',', '.').replace(/[^0-9.\-]/g, ''))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all tabular-nums"
            />
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center sm:pt-6">
            <button
              onClick={() => {
                const temp = fromUnit;
                setFromUnit(toUnit);
                setToUnit(temp);
              }}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              title={lang === 'ru' ? 'Поменять местами' : 'Swap'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              {lang === 'ru' ? 'В' : 'To'}
            </label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all mb-3"
            >
              {cat.units.map((u) => (
                <option key={u.id} value={u.id}>{getUnitName(u)}</option>
              ))}
            </select>
            {/* Результат */}
            <div className={`w-full rounded-xl border px-4 py-4 text-center text-2xl font-bold tabular-nums ${
              result !== null
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-300'
            }`}>
              {result !== null ? formatResult(result) : '—'}
            </div>
          </div>
        </div>

        {/* Формула */}
        {result !== null && inputValue && (
          <div className="mt-4 text-center text-sm text-slate-400">
            {inputValue} {getUnitName(cat.units.find((u) => u.id === fromUnit)!)} = {' '}
            <span className="font-semibold text-indigo-600">{formatResult(result)}</span>{' '}
            {getUnitName(cat.units.find((u) => u.id === toUnit)!)}
          </div>
        )}
      </div>
    </div>
  );
}