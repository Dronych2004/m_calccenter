/**
 * Калькулятор ИМТ и суточной нормы калорий
 *
 * Формула ИМТ (Body Mass Index):
 *   ИМТ = вес(кг) / (рост(м))²
 *
 * Формула Миффлина-Сан Жеора (Basal Metabolic Rate):
 *   Мужчины: БМР = 10 × вес(кг) + 6.25 × рост(см) - 5 × возраст - 5
 *   Женщины: БМР = 10 × вес(кг) + 6.25 × рост(см) - 5 × возраст - 161
 *
 * Суточная норма = БМР × Коэффициент активности
 *
 * Категории ИМТ (ВОЗ):
 *   < 18.5 — Недостаточный вес
 *   18.5–24.9 — Норма
 *   25–29.9 — Избыточный вес
 *   ≥ 30 — Ожирение
 */
import { useState, useEffect, useCallback } from 'react';
import { t, getLanguage } from '../i18n';

/* Тип пола */
type Gender = 'male' | 'female';

/* Уровень активности */
interface ActivityLevel {
  key: string;
  factor: number;
  labelRu: string;
  labelEn: string;
}

const activityLevels: ActivityLevel[] = [
  { key: 'sedentary', factor: 1.2, labelRu: 'Малоподвижный (офис)', labelEn: 'Sedentary (office)' },
  { key: 'light', factor: 1.375, labelRu: 'Лёгкая активность (1–3 р/нед)', labelEn: 'Light (1–3 times/week)' },
  { key: 'moderate', factor: 1.55, labelRu: 'Умеренная (3–5 р/нед)', labelEn: 'Moderate (3–5 times/week)' },
  { key: 'active', factor: 1.725, labelRu: 'Высокая (6–7 р/нед)', labelEn: 'High (6–7 times/week)' },
  { key: 'veryActive', factor: 1.9, labelRu: 'Очень высокая (тренировки)', labelEn: 'Very high (athlete)' },
];

/* Категория ИМТ */
interface BMICategory {
  label: string;
  color: string;
  bg: string;
}

function getBMICategory(bmi: number, lang: string): BMICategory {
  if (bmi < 18.5) {
    return lang === 'ru'
      ? { label: 'Недостаточный вес', color: 'text-sky-600', bg: 'bg-sky-50' }
      : { label: 'Underweight', color: 'text-sky-600', bg: 'bg-sky-50' };
  }
  if (bmi < 25) {
    return lang === 'ru'
      ? { label: 'Норма', color: 'text-emerald-600', bg: 'bg-emerald-50' }
      : { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  }
  if (bmi < 30) {
    return lang === 'ru'
      ? { label: 'Избыточный вес', color: 'text-amber-600', bg: 'bg-amber-50' }
      : { label: 'Overweight', color: 'text-amber-600', bg: 'bg-amber-50' };
  }
  return lang === 'ru'
    ? { label: 'Ожирение', color: 'text-rose-600', bg: 'bg-rose-50' }
    : { label: 'Obese', color: 'text-rose-600', bg: 'bg-rose-50' };
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function BMICalculator() {
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [activityIndex, setActivityIndex] = useState(0);
  const [targetWeight, setTargetWeight] = useState('');
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculate> | null>(null);
  const [, setLangTick] = useState(0);

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  const calculate = useCallback(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);

    if (!h || !w || !a || h <= 0 || w <= 0 || a <= 0) return null;

    /* ИМТ */
    const heightM = h / 100;
    const bmi = w / (heightM * heightM);

    const activity = activityLevels[activityIndex];

    /* Формула 1: Миффлин-Сан Жеор (2005 г.) */
    let bmrMifflin: number;
    if (gender === 'male') {
      bmrMifflin = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmrMifflin = 10 * w + 6.25 * h - 5 * a - 161;
    }
    const dailyMifflin = bmrMifflin * activity.factor;

    /* Формула 2: Харрис-Бенедикт (пересмотренная 1984 г.) */
    let bmrHarris: number;
    if (gender === 'male') {
      bmrHarris = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      bmrHarris = 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    }
    const dailyHarris = bmrHarris * activity.factor;

    /* Категория ИМТ */
    const category = getBMICategory(bmi, getLanguage());

    /* Анализ целевого веса */
    let targetAnalysis: {
      goal: string;
      diffKg: number;
      currentCalories: number;
      recommendedCalories: number;
      deficit: number;
      weeksToGoal: number;
    } | null = null;
    const tw = parseFloat(targetWeight);
    if (tw && tw > 0 && tw !== w) {
      const diffKg = tw - w;

      /* Формула простая: дефицит 500 ккал/день от текущей нормы */
      const deficit = 500;
      const recommendedCalories = Math.round(dailyMifflin - deficit);

      /* Срок: кг × 7700 / дефицит / 7 */
      const totalDeficitCal = Math.abs(diffKg) * 7700;
      const weeksToGoal = Math.ceil(totalDeficitCal / (deficit * 7));

      targetAnalysis = {
        goal: diffKg < 0 ? (getLanguage() === 'ru' ? 'Снизить вес' : 'Lose weight') : (getLanguage() === 'ru' ? 'Набрать вес' : 'Gain weight'),
        diffKg: Math.abs(diffKg),
        currentCalories: Math.round(dailyMifflin),
        recommendedCalories: Math.max(1200, recommendedCalories),
        deficit,
        weeksToGoal,
      };
    }

    return { bmi, bmrMifflin, bmrHarris, dailyMifflin, dailyHarris, category, targetAnalysis };
  }, [gender, height, weight, age, activityIndex, targetWeight]);

  const handleCalculate = () => {
    setResult(calculate());
    setCalculated(true);
  };

  const handleReset = () => {
    setGender('male');
    setHeight('');
    setWeight('');
    setAge('');
    setActivityIndex(0);
    setTargetWeight('');
    setCalculated(false);
    setResult(null);
  };
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);

    if (!h || !w || !a || h <= 0 || w <= 0 || a <= 0) return null;

    /* ИМТ */
    const heightM = h / 100;
    const bmi = w / (heightM * heightM);

    const activity = activityLevels[activityIndex];

    /* Формула 1: Миффлин-Сан Жеор (2005 г.) */
    let bmrMifflin: number;
    if (gender === 'male') {
      bmrMifflin = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmrMifflin = 10 * w + 6.25 * h - 5 * a - 161;
    }
    const dailyMifflin = bmrMifflin * activity.factor;

    /* Формула 2: Харрис-Бенедикт (пересмотренная 1984 г.) */
    let bmrHarris: number;
    if (gender === 'male') {
      bmrHarris = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      bmrHarris = 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    }
    const dailyHarris = bmrHarris * activity.factor;

    /* Категория ИМТ */
    const category = getBMICategory(bmi, getLanguage());

    /* Анализ целевого веса */
    let targetAnalysis: {
      goal: string;
      diffKg: number;
      currentCalories: number;
      recommendedCalories: number;
      deficit: number;
      weeksToGoal: number;
    } | null = null;
    const tw = parseFloat(targetWeight);
    if (tw && tw > 0 && tw !== w) {
      const diffKg = tw - w;

      /* Формула простая: дефицит 500 ккал/день от текущей нормы */
      const deficit = 500;
      const recommendedCalories = Math.round(dailyMifflin - deficit);

      /* Срок: кг × 7700 / дефицит / 7 */
      const totalDeficitCal = Math.abs(diffKg) * 7700;
      const weeksToGoal = Math.ceil(totalDeficitCal / (deficit * 7));

      targetAnalysis = {
        goal: diffKg < 0 ? (getLanguage() === 'ru' ? 'Снизить вес' : 'Lose weight') : (getLanguage() === 'ru' ? 'Набрать вес' : 'Gain weight'),
        diffKg: Math.abs(diffKg),
        currentCalories: Math.round(dailyMifflin),
        recommendedCalories: Math.max(1200, recommendedCalories),
        deficit,
        weeksToGoal,
      };
    }

    return { bmi, bmrMifflin, bmrHarris, dailyMifflin, dailyHarris, category, targetAnalysis };
  }, [gender, height, weight, age, activityIndex, targetWeight]);

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">{t('bmi.title')}</h1>
        <p className="text-sm text-slate-400">{t('bmi.description')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Пол */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('bmi.gender')}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    gender === 'male'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('bmi.male')}
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    gender === 'female'
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('bmi.female')}
                </button>
              </div>
            </div>

            {/* Рост */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('bmi.height')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Вес */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('bmi.weight')}</label>
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Целевой вес (необязательно) */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {getLanguage() === 'ru' ? 'Целевой вес (кг) — необязательно' : 'Target weight (kg) — optional'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                placeholder="—"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Возраст */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('bmi.age')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Уровень активности */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('bmi.activity')}</label>
              <div className="space-y-2">
                {activityLevels.map((level, i) => (
                  <button
                    key={level.key}
                    onClick={() => setActivityIndex(i)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                      activityIndex === i
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                        : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
                    }`}
                  >
                    {getLanguage() === 'ru' ? level.labelRu : level.labelEn}
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
                {getLanguage() === 'ru' ? 'РАССЧИТАТЬ' : 'CALCULATE'}
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
              >
                {getLanguage() === 'ru' ? 'Сбросить' : 'Reset'}
              </button>
            </div>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {calculated && result ? (
            <div className="space-y-4">
              {/* ИМТ — главная карточка */}
              <div className="bg-linear-to-br from-rose-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">{t('bmi.bmiValue')}</p>
                <p className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                  {result.bmi.toFixed(1)}
                </p>
                {/* Категория */}
                <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full ${result.category.bg} ${result.category.color} text-sm font-semibold`}>
                  {result.category.label}
                </div>
              </div>

              {/* Две формулы — БМР и суточная норма */}
              <div className="grid grid-cols-2 gap-3">
                {/* Миффлин-Сан Жеор */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-500">1</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {getLanguage() === 'ru' ? 'Миффлин-Сан Жеор' : 'Mifflin-St Jeor'}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1">
                    {getLanguage() === 'ru' ? 'Базовый обмен' : 'BMR'}
                  </p>
                  <p className="text-lg font-bold text-slate-800 mb-2">
                    {Math.round(result.bmrMifflin).toLocaleString('ru-RU')}
                    <span className="text-[10px] text-slate-400 ml-0.5">ккал</span>
                  </p>
                  <div className="border-t border-slate-100 pt-2">
                    <p className="text-[11px] text-slate-400 mb-0.5">
                      {getLanguage() === 'ru' ? 'С учётом активности' : 'With activity'}
                    </p>
                    <p className="text-base font-bold text-indigo-600">
                      {Math.round(result.dailyMifflin).toLocaleString('ru-RU')}
                      <span className="text-[10px] text-slate-400 ml-0.5">ккал/день</span>
                    </p>
                  </div>
                </div>

                {/* Харрис-Бенедикт */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                      <span className="text-xs font-bold text-violet-500">2</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {getLanguage() === 'ru' ? 'Харрис-Бенедикт' : 'Harris-Benedict'}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1">
                    {getLanguage() === 'ru' ? 'Базовый обмен' : 'BMR'}
                  </p>
                  <p className="text-lg font-bold text-slate-800 mb-2">
                    {Math.round(result.bmrHarris).toLocaleString('ru-RU')}
                    <span className="text-[10px] text-slate-400 ml-0.5">ккал</span>
                  </p>
                  <div className="border-t border-slate-100 pt-2">
                    <p className="text-[11px] text-slate-400 mb-0.5">
                      {getLanguage() === 'ru' ? 'С учётом активности' : 'With activity'}
                    </p>
                    <p className="text-base font-bold text-violet-600">
                      {Math.round(result.dailyHarris).toLocaleString('ru-RU')}
                      <span className="text-[10px] text-slate-400 ml-0.5">ккал/день</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Анализ целевого веса */}
              {result.targetAnalysis && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      result.targetAnalysis.diffKg > 0 ? 'bg-amber-50' : 'bg-emerald-50'
                    }`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={
                        result.targetAnalysis.diffKg > 0 ? 'text-amber-500' : 'text-emerald-500'
                      }>
                        <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{result.targetAnalysis.goal}</p>
                      <p className="text-xs text-slate-400">
                        {getLanguage() === 'ru' ? `на ${result.targetAnalysis.diffKg.toFixed(1)} кг` : `by ${result.targetAnalysis.diffKg.toFixed(1)} kg`}
                      </p>
                    </div>
                  </div>

                  {/* Рекомендуемые калории — главная карточка */}
                  <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl p-4 text-white text-center mb-3">
                    <p className="text-xs font-medium text-white/70 mb-1">
                      {getLanguage() === 'ru'
                        ? 'Рекомендуется в день для похудения'
                        : 'Recommended daily intake for weight loss'}
                    </p>
                    <p className="text-3xl font-extrabold">
                      {result.targetAnalysis.recommendedCalories.toLocaleString('ru-RU')}
                      <span className="text-sm font-medium text-white/70 ml-1">ккал</span>
                    </p>
                  </div>

                  {/* Текущая норма */}
                  <div className="flex items-center justify-between mb-3 px-1 bg-slate-50 rounded-xl p-3">
                    <p className="text-[11px] text-slate-400">
                      {getLanguage() === 'ru' ? 'Сейчас нужно для поддержания' : 'Current maintenance'}
                    </p>
                    <p className="text-sm font-bold text-slate-600">
                      {result.targetAnalysis.currentCalories.toLocaleString('ru-RU')} ккал
                    </p>
                  </div>

                  {/* Срок и дефицит */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-slate-400 mb-1">
                        {getLanguage() === 'ru' ? 'Дефицит в день' : 'Daily deficit'}
                      </p>
                      <p className="text-base font-bold text-emerald-600">
                        −{result.targetAnalysis.deficit.toLocaleString('ru-RU')} ккал
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-slate-400 mb-1">
                        {getLanguage() === 'ru' ? 'Примерный срок' : 'Estimated time'}
                      </p>
                      <p className="text-base font-bold text-slate-800">
                        {result.targetAnalysis.weeksToGoal >= 4
                          ? `${Math.round(result.targetAnalysis.weeksToGoal / 4)} ${getLanguage() === 'ru' ? 'мес.' : 'mo.'}`
                          : `${result.targetAnalysis.weeksToGoal} ${getLanguage() === 'ru' ? 'нед.' : 'wk'}`}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-3 text-center">
                    {getLanguage() === 'ru'
                      ? 'Безопасный темп: ~0.5 кг/нед. Минимум: 1 200 ккал/день'
                      : 'Safe pace: ~0.5 kg/week. Minimum: 1,200 kcal/day'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Подсказка */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-slate-300 mb-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                {getLanguage() === 'ru'
                  ? 'Заполните данные и нажмите «Рассчитать»'
                  : 'Fill in your data and press «Calculate»'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
