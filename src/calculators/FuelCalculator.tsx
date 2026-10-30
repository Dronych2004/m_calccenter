/**
 * Калькулятор расхода топлива и стоимости поездки
 *
 * Рассчитывает:
 * - Необходимый объём топлива (литры)
 * - Стоимость поездки (₽)
 *
 * Формула:
 *   Литры = (Расстояние × Расход на 100 км) / 100
 *   Стоимость = Литры × Цена за литр
 *
 * Дополнительно:
 * - Расход на километр (₽/км)
 * - Расход на 100 км в деньгах (₽/100 км)
 */
import { useState, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import SeoContent from '../components/SeoContent';
import SeoHead from '../components/SeoHead';
import { formatCurrency, formatNumber } from '../lib/format';

interface FuelResult {
  liters: number;
  totalCost: number;
  costPerKm: number;
  costPer100km: number;
}

export default function FuelCalculator() {
  const lang = useLanguage();
  const [distance, setDistance] = useState('');
  const [consumption, setConsumption] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<FuelResult | null>(null);

  const calculate = useCallback((): FuelResult | null => {
    const d = parseFloat(distance);
    const c = parseFloat(consumption);
    const p = parseFloat(fuelPrice);

    if (!d || !c || !p || d <= 0 || c <= 0 || p <= 0) return null;

    const liters = (d * c) / 100;
    const totalCost = liters * p;
    const costPerKm = totalCost / d;
    const costPer100km = c * p;

    return { liters, totalCost, costPerKm, costPer100km };
  }, [distance, consumption, fuelPrice]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  const handleReset = () => {
    setDistance('');
    setConsumption('');
    setFuelPrice('');
    setShowDetails(false);
    setCalculated(false);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      <SeoHead
        title={lang === 'ru' ? 'Калькулятор расхода топлива онлайн — бесплатно | CalcCenter' : 'Fuel Cost Calculator Online — Free | CalcCenter'}
        description={lang === 'ru'
          ? 'Бесплатный онлайн калькулятор расхода топлива. Рассчитайте стоимость поездки и расход бензина на 100 км.'
          : 'Free online fuel cost calculator. Calculate trip cost and fuel consumption per 100 km.'}
        canonical="https://calccenter.ru/fuel"
      />
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">{t('fuel.title')}</h1>
        <p className="text-sm text-slate-400">{t('fuel.description')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Расстояние */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('fuel.distance')}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={distance}
                onChange={(e) => setDistance(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Расход на 100 км */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('fuel.consumption')}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Цена за литр */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('fuel.fuelPrice')}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 active:scale-[0.98] transition-all"
              >
                {t('fuel.calculate')}
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
              >
                {t('fuel.reset')}
              </button>
            </div>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {calculated && result ? (
            <div className="space-y-4 animate-fade-in">
              {/* Объём топлива */}
              <div className="bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">{t('fuel.liters')}</p>
                <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  {formatNumber(result.liters, 1)}
                  <span className="text-lg font-semibold text-white/70 ml-2">{t('fuel.litersUnit')}</span>
                </p>
              </div>

              {/* Стоимость поездки */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">{t('fuel.cost')}</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(result.totalCost)}
                </p>
              </div>

              {/* Детали */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
              >
                {t('fuel.details')}
                <span className="ml-2 text-xs text-slate-400">{showDetails ? '▲' : '▼'}</span>
              </button>

              {showDetails && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-fade-in space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500">
                          <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{t('fuel.costPerKm')}</p>
                        <p className="text-lg font-bold text-slate-800">{formatCurrency(result.costPerKm)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{t('fuel.costPer100km')}</p>
                        <p className="text-lg font-bold text-slate-800">{formatCurrency(result.costPer100km)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-slate-300 mb-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="14" r="3" />
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                {t('fuel.hint')}
              </p>
            </div>
          )}
        </div>
      </div>

      <SeoContent
        title={lang === 'ru' ? 'О калькуляторе расхода топлива' : 'About the Fuel Cost Calculator'}
        description={lang === 'ru'
          ? `Калькулятор расхода топлива помогает рассчитать стоимость поездки, расход бензина на 100 км и потребление топлива за определённое расстояние.

Введите расход вашего автомобиля (литров на 100 км), расстояние поездки (в км) и стоимость топлива (за литр). Калькулятор покажет общее количество литров и их стоимость.

Вы также можете узнать реальный расход топлива, указав начальный и конечный уровень бака, количество заправленного топлива и пройденное расстояние.`
          : `The fuel cost calculator helps you calculate the cost of a trip, fuel consumption per 100 km, and fuel usage for a given distance.

Enter your car's fuel consumption (liters per 100 km), trip distance (in km), and fuel price (per liter). The calculator will show the total liters needed and their cost.`}
        formula={{
          title: lang === 'ru' ? 'Формула расхода топлива' : 'Fuel Consumption Formula',
          text: lang === 'ru'
            ? 'Расход на 100 км = (Заправлено / Пройдено) × 100. Стоимость поездки = (Расход × Расстояние / 100) × Цена за литр.'
            : 'Consumption per 100 km = (Fuel refueled / Distance) × 100. Trip cost = (Consumption × Distance / 100) × Price per liter.'
        }}
        faq={[
          {
            q: lang === 'ru' ? 'Как снизить расход топлива?' : 'How to reduce fuel consumption?',
            a: lang === 'ru'
              ? 'Плавное ускорение и торможение, поддержание давления в шинах, удаление лишнего груза, плановое ТО.'
              : 'Smooth acceleration and braking, maintaining tire pressure, removing excess cargo, regular maintenance.'
          },
        ]}
      />
    </div>
  );
}
