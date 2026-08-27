/**
 * Калькулятор ОСАГО
 *
 * Рассчитывает примерную стоимость полиса ОСАГО
 * на основе базовых тарифов и коэффициентов:
 *
 * Формула: БТ × КТ × КБМ × КВС × КО × КМ × КС × КН
 *
 * - БТ — базовый тариф (устанавливается ЦБ)
 * - КТ — территориальный коэффициент
 * - КБМ — бонус-малус (коэффициент безаварийности)
 * - КВС — коэффициент возраста-стажа
 * - КО — ограничение использования
 * - КМ — мощность двигателя
 * - КС — сезонность
 * - КН — нарушения
 */
import { useState, useEffect, useMemo } from 'react';
import { t, getLanguage } from '../i18n';

/* КБМ — бонус-малус */
interface KBMEntry {
  class: number;
  coefficient: number;
  labelRu: string;
  labelEn: string;
}

const KBM_TABLE: KBMEntry[] = [
  { class: -2, coefficient: 2.45, labelRu: 'М class — 2 (макс.)', labelEn: 'M class — 2 (max)' },
  { class: -1, coefficient: 2.30, labelRu: 'М class — 1', labelEn: 'M class — 1' },
  { class: 0, coefficient: 2.25, labelRu: 'М class — 0', labelEn: 'M class — 0' },
  { class: 1, coefficient: 1.55, labelRu: 'Класс 1', labelEn: 'Class 1' },
  { class: 2, coefficient: 1.40, labelRu: 'Класс 2', labelEn: 'Class 2' },
  { class: 3, coefficient: 1.00, labelRu: 'Класс 3 (начальный)', labelEn: 'Class 3 (start)' },
  { class: 4, coefficient: 0.95, labelRu: 'Класс 4', labelEn: 'Class 4' },
  { class: 5, coefficient: 0.90, labelRu: 'Класс 5', labelEn: 'Class 5' },
  { class: 6, coefficient: 0.85, labelRu: 'Класс 6', labelEn: 'Class 6' },
  { class: 7, coefficient: 0.80, labelRu: 'Класс 7', labelEn: 'Class 7' },
  { class: 8, coefficient: 0.75, labelRu: 'Класс 8', labelEn: 'Class 8' },
  { class: 9, coefficient: 0.70, labelRu: 'Класс 9', labelEn: 'Class 9' },
  { class: 10, coefficient: 0.65, labelRu: 'Класс 10', labelEn: 'Class 10' },
  { class: 11, coefficient: 0.60, labelRu: 'Класс 11', labelEn: 'Class 11' },
  { class: 12, coefficient: 0.55, labelRu: 'Класс 12 (мин.)', labelEn: 'Class 12 (min)' },
  { class: 13, coefficient: 0.50, labelRu: 'Класс 13 (мин.)', labelEn: 'Class 13 (min)' },
];

/* КВС — коэффициент возраста-стажа */
interface KVSRange {
  minAge: number;
  minExp: number;
  coefficient: number;
}

const KVS_TABLE: KVSRange[] = [
  { minAge: 18, minExp: 0, coefficient: 2.27 },
  { minAge: 18, minExp: 1, coefficient: 1.87 },
  { minAge: 18, minExp: 2, coefficient: 1.65 },
  { minAge: 22, minExp: 0, coefficient: 1.87 },
  { minAge: 22, minExp: 1, coefficient: 1.65 },
  { minAge: 22, minExp: 2, coefficient: 1.55 },
  { minAge: 24, minExp: 0, coefficient: 1.65 },
  { minAge: 24, minExp: 1, coefficient: 1.55 },
  { minAge: 24, minExp: 2, coefficient: 1.45 },
  { minAge: 25, minExp: 0, coefficient: 1.55 },
  { minAge: 25, minExp: 1, coefficient: 1.45 },
  { minAge: 25, minExp: 2, coefficient: 1.35 },
  { minAge: 30, minExp: 0, coefficient: 1.45 },
  { minAge: 30, minExp: 1, coefficient: 1.35 },
  { minAge: 30, minExp: 2, coefficient: 1.25 },
  { minAge: 35, minExp: 0, coefficient: 1.35 },
  { minAge: 35, minExp: 1, coefficient: 1.25 },
  { minAge: 35, minExp: 2, coefficient: 1.15 },
  { minAge: 40, minExp: 0, coefficient: 1.25 },
  { minAge: 40, minExp: 1, coefficient: 1.15 },
  { minAge: 40, minExp: 2, coefficient: 1.05 },
  { minAge: 45, minExp: 0, coefficient: 1.15 },
  { minAge: 45, minExp: 1, coefficient: 1.05 },
  { minAge: 45, minExp: 2, coefficient: 1.00 },
  { minAge: 50, minExp: 0, coefficient: 1.05 },
  { minAge: 50, minExp: 1, coefficient: 1.00 },
  { minAge: 50, minExp: 2, coefficient: 0.95 },
  { minAge: 60, minExp: 0, coefficient: 1.00 },
  { minAge: 60, minExp: 1, coefficient: 0.95 },
  { minAge: 60, minExp: 2, coefficient: 0.90 },
];

/* КМ — коэффициент мощности */
function getKM(hp: number): number {
  if (hp <= 50) return 0.63;
  if (hp <= 70) return 0.80;
  if (hp <= 100) return 1.00;
  if (hp <= 120) return 1.14;
  if (hp <= 150) return 1.33;
  return 1.53;
}

/* КТ — территориальный коэффициент (примерные значения для городов) */
const KT_TABLE: { city: string; cityEn: string; coefficient: number }[] = [
  { city: 'Москва', cityEn: 'Moscow', coefficient: 1.80 },
  { city: 'Санкт-Петербург', cityEn: 'Saint Petersburg', coefficient: 1.72 },
  { city: 'Новосибирск', cityEn: 'Novosibirsk', coefficient: 1.40 },
  { city: 'Екатеринбург', cityEn: 'Yekaterinburg', coefficient: 1.36 },
  { city: 'Казань', cityEn: 'Kazan', coefficient: 1.44 },
  { city: 'Нижний Новгород', cityEn: 'Nizhny Novgorod', coefficient: 1.44 },
  { city: 'Челябинск', cityEn: 'Chelyabinsk', coefficient: 1.36 },
  { city: 'Самара', cityEn: 'Samara', coefficient: 1.40 },
  { city: 'Ростов-на-Дону', cityEn: 'Rostov-on-Don', coefficient: 1.40 },
  { city: 'Уфа', cityEn: 'Ufa', coefficient: 1.36 },
  { city: 'Красноярск', cityEn: 'Krasnoyarsk', coefficient: 1.36 },
  { city: 'Воронеж', cityEn: 'Voronezh', coefficient: 1.36 },
  { city: 'Волгоград', cityEn: 'Volgograd', coefficient: 1.36 },
  { city: 'Краснодар', cityEn: 'Krasnodar', coefficient: 1.40 },
  { city: 'Саратов', cityEn: 'Saratov', coefficient: 1.36 },
  { city: 'Тюмень', cityEn: 'Tyumen', coefficient: 1.36 },
  { city: 'Тольятти', cityEn: 'Tolyatti', coefficient: 1.36 },
  { city: 'Ижевск', cityEn: 'Izhevsk', coefficient: 1.36 },
  { city: 'Барнаул', cityEn: 'Barnaul', coefficient: 1.24 },
  { city: 'Иркутск', cityEn: 'Irkutsk', coefficient: 1.28 },
  { city: 'Хабаровск', cityEn: 'Khabarovsk', coefficient: 1.24 },
  { city: 'Ярославль', cityEn: 'Yaroslavl', coefficient: 1.36 },
  { city: 'Владивосток', cityEn: 'Vladivostok', coefficient: 1.24 },
  { city: 'Махачкала', cityEn: 'Makhachkala', coefficient: 1.60 },
  { city: 'Томск', cityEn: 'Tomsk', coefficient: 1.24 },
  { city: 'Оренбург', cityEn: 'Orenburg', coefficient: 1.28 },
  { city: 'Кемерово', cityEn: 'Kemerovo', coefficient: 1.28 },
  { city: 'Новокузнецк', cityEn: 'Novokuznetsk', coefficient: 1.28 },
  { city: 'Рязань', cityEn: 'Ryazan', coefficient: 1.32 },
  { city: 'Астрахань', cityEn: 'Astrakhan', coefficient: 1.32 },
  { city: 'Набережные Челны', cityEn: 'Naberezhnye Chelny', coefficient: 1.36 },
  { city: 'Санкт-Петербург (область)', cityEn: 'Saint Petersburg Oblast', coefficient: 1.28 },
  { city: 'Другой город', cityEn: 'Other city', coefficient: 1.24 },
];

export default function OSAGOCalculator() {
  const [selectedCity, setSelectedCity] = useState(0);
  const [age, setAge] = useState('');
  const [experience, setExperience] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [kbmIndex, setKbmIndex] = useState(6); // Класс 3 — начальный
  const [period, setPeriod] = useState('12');
  const [, setLangTick] = useState(0);

  const lang = getLanguage();

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  const handleReset = () => {
    setSelectedCity(0);
    setAge('');
    setExperience('');
    setHorsepower('');
    setKbmIndex(6);
    setPeriod('12');
  };

  const result = useMemo(() => {
    const a = parseInt(age);
    const e = parseInt(experience);
    const hp = parseInt(horsepower);

    if (!a || !e || !hp || a <= 0 || e < 0 || hp <= 0) return null;

    /* Базовый тариф (ЦБ РФ, легковые, категория B) */
    const BT = 4118;

    /* КТ — территориальный */
    const KT = KT_TABLE[selectedCity].coefficient;

    /* КБМ — бонус-малус */
    const KBM = KBM_TABLE[kbmIndex].coefficient;

    /* КВС — возраст-стаж */
    let KVS = 1.00;
    for (let i = KVS_TABLE.length - 1; i >= 0; i--) {
      const range = KVS_TABLE[i];
      if (a >= range.minAge && e >= range.minExp) {
        KVS = range.coefficient;
        break;
      }
    }

    /* КО — ограничение (без ограничений = 1.94, с ограничением = 1.00) */
    const KO = 1.94;

    /* КМ — мощность */
    const KM = getKM(hp);

    /* КС — сезонность (12 мес = 1.0) */
    const KS = period === '12' ? 1.00 : period === '9' ? 0.85 : period === '6' ? 0.65 : 0.30;

    /* КН — нарушения */
    const KN = 1.00;

    /* Итого */
    const total = Math.round(BT * KT * KBM * KVS * KO * KM * KS * KN);

    return {
      BT,
      KT,
      KBM,
      KVS,
      KO,
      KM,
      KS,
      KN,
      total,
      city: KT_TABLE[selectedCity],
      kbm: KBM_TABLE[kbmIndex],
    };
  }, [selectedCity, age, experience, horsepower, kbmIndex, period]);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {t('osago.title')}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Рассчитайте примерную стоимость полиса ОСАГО по формуле ЦБ РФ'
            : 'Estimate your OSAGO policy cost based on CBR formula'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Город */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Город регистрации ТС' : 'Vehicle registration city'}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
              >
                {KT_TABLE.map((city, i) => (
                  <option key={i} value={i}>
                    {lang === 'ru' ? city.city : city.cityEn} (КТ: {city.coefficient})
                  </option>
                ))}
              </select>
            </div>

            {/* Возраст и стаж */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Возраст водителя (лет)' : "Driver's age (years)"}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
                placeholder="30"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Стаж вождения (лет)' : 'Driving experience (years)'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={experience}
                onChange={(e) => setExperience(e.target.value.replace(/\D/g, ''))}
                placeholder="10"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Мощность двигателя */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Мощность двигателя (л.с.)' : 'Engine power (HP)'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={horsepower}
                onChange={(e) => setHorsepower(e.target.value.replace(/\D/g, ''))}
                placeholder="150"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* КБМ — бонус-малус */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Класс КБМ (безаварийная езда)' : 'KBM class (no-claims)'}
              </label>
              <select
                value={kbmIndex}
                onChange={(e) => setKbmIndex(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
              >
                {KBM_TABLE.map((entry, i) => (
                  <option key={i} value={i}>
                    {lang === 'ru' ? entry.labelRu : entry.labelEn} ({entry.coefficient})
                  </option>
                ))}
              </select>
            </div>

            {/* Срок страхования */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {lang === 'ru' ? 'Срок страхования' : 'Insurance period'}
              </label>
              <div className="flex gap-2">
                {[
                  { value: '12', labelRu: '12 мес', labelEn: '12 mo' },
                  { value: '9', labelRu: '9 мес', labelEn: '9 mo' },
                  { value: '6', labelRu: '6 мес', labelEn: '6 mo' },
                  { value: '3', labelRu: '3 мес', labelEn: '3 mo' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriod(opt.value)}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      period === opt.value
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {lang === 'ru' ? opt.labelRu : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>

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
              {/* Стоимость — главная карточка */}
              <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">
                  {lang === 'ru' ? 'Примерная стоимость ОСАГО' : 'Estimated OSAGO cost'}
                </p>
                <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  {formatCurrency(result.total)}
                </p>
                <p className="text-sm text-white/60 mt-2">
                  {lang === 'ru' ? `на ${period} мес.` : `for ${period} months`}
                </p>
              </div>

              {/* Разбивка по коэффициентам */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  {lang === 'ru' ? 'Разбивка по коэффициентам' : 'Coefficient breakdown'}
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Базовый тариф (БТ)' : 'Base tariff (BT)'}
                    </span>
                    <span className="font-semibold text-slate-700">{result.BT.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Территория (КТ)' : 'Territory (KT)'}
                    </span>
                    <span className="font-semibold text-slate-700">×{result.KT}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Бонус-малус (КБМ)' : 'No-claims (KBM)'}
                    </span>
                    <span className="font-semibold text-slate-700">×{result.KBM}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Возраст-стаж (КВС)' : 'Age-experience (KVS)'}
                    </span>
                    <span className="font-semibold text-slate-700">×{result.KVS}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Ограничение (КО)' : 'Restriction (KO)'}
                    </span>
                    <span className="font-semibold text-slate-700">×{result.KO}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Мощность (КМ)' : 'Power (KM)'}
                    </span>
                    <span className="font-semibold text-slate-700">×{result.KM}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {lang === 'ru' ? 'Сезонность (КС)' : 'Season (KS)'}
                    </span>
                    <span className="font-semibold text-slate-700">×{result.KS}</span>
                  </div>
                </div>
              </div>

              {/* Формула */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-xs text-slate-400 mb-2">
                  {lang === 'ru' ? 'Формула расчёта' : 'Calculation formula'}
                </p>
                <p className="font-mono text-xs text-slate-600 break-all">
                  {result.BT} × {result.KT} × {result.KBM} × {result.KVS} × {result.KO} × {result.KM} × {result.KS} × {result.KN} = {formatCurrency(result.total)}
                </p>
              </div>

              {/* Примечание */}
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
                <p className="text-xs text-amber-700">
                  {lang === 'ru'
                    ? '⚠️ Расчёт является приблизительным. Точная стоимость зависит от страховщика, КАСКО, доп. услуг и других факторов. Обратитесь в страховую компанию для точного расчёта.'
                    : '⚠️ This is an estimate. Actual cost depends on insurer, additional services and other factors. Contact your insurance company for an exact quote.'}
                </p>
              </div>
            </div>
          ) : (
            /* Подсказка */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-slate-300 mb-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                {lang === 'ru'
                  ? 'Заполните данные для расчёта стоимости ОСАГО'
                  : 'Fill in data to estimate OSAGO cost'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
