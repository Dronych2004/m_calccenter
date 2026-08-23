/**
 * Калькулятор обоев и краски
 *
 * Рассчитывает:
 * - Количество рулонов обоев для поклейки комнаты
 * - Количество банок краски для покраски стен
 *
 * Формулы:
 *   Периметр комнаты = 2 × (длина + ширина)
 *   Площадь стен = Периметр × Высота
 *   Площадь за вычетом = Стены - Дверь - Окно(а)
 *
 *   Рулоны обоев:
 *     Кол-во полос = ⌈Ширина стены / Ширина рулона⌉
 *     Длина одной полосы = Высота стены + 5 см (запас)
 *     Полная длина рулона = Кол-во полос × Длина одной полосы
 *     Рулоны = ⌈Длина рулона на стену × Кол-во стен / Длина рулона⌉
 *
 *   Банки краски:
 *     Кол-во = ⌈Площадь / Расход / Объём банки⌉
 */
import { useState, useEffect, useMemo } from 'react';
import { t, getLanguage } from '../i18n';

/* Режим калькулятора */
type CalcMode = 'wallpaper' | 'paint';

export default function WallpaperCalculator() {
  const [mode, setMode] = useState<CalcMode>('wallpaper');

  /* Параметры комнаты */
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [roomHeight, setRoomHeight] = useState('');
  const [doorWidth, setDoorWidth] = useState('0.9');
  const [doorHeight, setDoorHeight] = useState('2.0');
  const [windowWidth, setWindowWidth] = useState('1.2');
  const [windowHeight, setWindowHeight] = useState('1.4');
  const [windowCount, setWindowCount] = useState('1');

  /* Параметры обоев */
  const [rollWidth, setRollWidth] = useState('0.53');
  const [rollLength, setRollLength] = useState('10.05');

  /* Параметры краски */
  const [paintCoverage, setPaintCoverage] = useState('10');
  const [paintVolume, setPaintVolume] = useState('2.5');

  const [, setLangTick] = useState(0);

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  const wallArea = useMemo(() => {
    const w = parseFloat(roomWidth);
    const l = parseFloat(roomLength);
    const h = parseFloat(roomHeight);
    const dw = parseFloat(doorWidth) || 0;
    const dh = parseFloat(doorHeight) || 0;
    const ww = parseFloat(windowWidth) || 0;
    const wh = parseFloat(windowHeight) || 0;
    const wc = parseInt(windowCount) || 0;

    if (!w || !l || !h || w <= 0 || l <= 0 || h <= 0) return null;

    /* Периметр и площадь стен */
    const perimeter = 2 * (w + l);
    const grossArea = perimeter * h;

    /* Площадь дверей и окон */
    const doorArea = dw * dh;
    const windowArea = ww * wh * wc;
    const netArea = grossArea - doorArea - windowArea;

    return { perimeter, grossArea, doorArea, windowArea, netArea: Math.max(0, netArea) };
  }, [roomWidth, roomLength, roomHeight, doorWidth, doorHeight, windowWidth, windowHeight, windowCount]);

  const wallpaperResult = useMemo(() => {
    if (!wallArea) return null;

    const w = parseFloat(roomWidth);
    const l = parseFloat(roomLength);
    const h = parseFloat(roomHeight);
    const rw = parseFloat(rollWidth);
    const rl = parseFloat(rollLength);

    if (!w || !l || !h || !rw || !rl || rw <= 0 || rl <= 0) return null;

    /* Длина одной полосы = высота + 5 см запас на подрезку */
    const stripLength = h + 0.05;

    /* Количество полос на каждую стену */
    const wall1Strips = Math.ceil(w / rw); /* Стена длиной w */
    const wall2Strips = Math.ceil(l / rw); /* Стена длиной l */
    const totalStrips = wall1Strips * 2 + wall2Strips * 2; /* 4 стены */

    /* Общая длина обоев */
    const totalLength = totalStrips * stripLength;

    /* Количество рулонов */
    const rolls = Math.ceil(totalLength / rl);

    return { stripLength, totalStrips, totalLength, rolls };
  }, [roomWidth, roomLength, roomHeight, rollWidth, rollLength, wallArea]);

  const paintResult = useMemo(() => {
    if (!wallArea) return null;

    const coverage = parseFloat(paintCoverage);
    const volume = parseFloat(paintVolume);

    if (!coverage || !volume || coverage <= 0 || volume <= 0) return null;

    /* Сколько литров краски нужно */
    const litersNeeded = wallArea.netArea / coverage;

    /* Сколько банок */
    const cans = Math.ceil(litersNeeded / volume);

    return { litersNeeded, cans };
  }, [wallArea, paintCoverage, paintVolume]);

  /* ==================== ФОРМАТИРОВАНИЕ ==================== */

  const fmt = (v: number, d = 1) => v.toFixed(d);

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">{t('wallpaper.title')}</h1>
        <p className="text-sm text-slate-400">{t('wallpaper.description')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">

            {/* Параметры комнаты */}
            <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
              {getLanguage() === 'ru' ? 'Комната' : 'Room'}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Ширина */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">{getLanguage() === 'ru' ? 'Ширина (м)' : 'Width (m)'}</label>
                <input type="text" inputMode="decimal" value={roomWidth} onChange={(e) => setRoomWidth(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
              </div>
              {/* Длина */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">{getLanguage() === 'ru' ? 'Длина (м)' : 'Length (m)'}</label>
                <input type="text" inputMode="decimal" value={roomLength} onChange={(e) => setRoomLength(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
              </div>
            </div>

            {/* Высота */}
            <div className="mb-5">
              <label className="block text-xs text-slate-400 mb-1">{getLanguage() === 'ru' ? 'Высота стен (м)' : 'Wall height (m)'}</label>
              <input type="text" inputMode="decimal" value={roomHeight} onChange={(e) => setRoomHeight(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
            </div>

            {/* Дверь */}
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">{getLanguage() === 'ru' ? 'Дверь (Ш × В м)' : 'Door (W × H m)'}</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" inputMode="decimal" value={doorWidth} onChange={(e) => setDoorWidth(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="0.9"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
                <input type="text" inputMode="decimal" value={doorHeight} onChange={(e) => setDoorHeight(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="2.0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
              </div>
            </div>

            {/* Окно */}
            <div className="mb-6">
              <label className="block text-xs text-slate-400 mb-1">{getLanguage() === 'ru' ? 'Окно (Ш × В м) × кол-во' : 'Window (W × H m) × count'}</label>
              <div className="grid grid-cols-3 gap-3">
                <input type="text" inputMode="decimal" value={windowWidth} onChange={(e) => setWindowWidth(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="1.2"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
                <input type="text" inputMode="decimal" value={windowHeight} onChange={(e) => setWindowHeight(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="1.4"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" />
                <input type="text" inputMode="numeric" value={windowCount} onChange={(e) => setWindowCount(e.target.value.replace(/\D/g, ''))} placeholder="1"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
              </div>
            </div>

            {/* Переключатель режима */}
            <div className="flex gap-2 mb-5">
              <button onClick={() => setMode('wallpaper')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${mode === 'wallpaper' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {t('nav.wallpaper')}
              </button>
              <button onClick={() => setMode('paint')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${mode === 'paint' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {getLanguage() === 'ru' ? 'Краска' : 'Paint'}
              </button>
            </div>

            {/* Параметры обоев */}
            {mode === 'wallpaper' && (
              <div className="mb-5 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                  {getLanguage() === 'ru' ? 'Параметры рулона' : 'Roll parameters'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.wallpaperWidth')}</label>
                    <input type="text" inputMode="decimal" value={rollWidth} onChange={(e) => setRollWidth(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.wallpaperLength')}</label>
                    <input type="text" inputMode="decimal" value={rollLength} onChange={(e) => setRollLength(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* Параметры краски */}
            {mode === 'paint' && (
              <div className="mb-5 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                  {getLanguage() === 'ru' ? 'Параметры краски' : 'Paint parameters'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.paintCoverage')}</label>
                    <input type="text" inputMode="decimal" value={paintCoverage} onChange={(e) => setPaintCoverage(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.paintCapacity')}</label>
                    <input type="text" inputMode="decimal" value={paintVolume} onChange={(e) => setPaintVolume(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* Сброс */}
            <button onClick={() => {
              setRoomWidth(''); setRoomLength(''); setRoomHeight('');
              setDoorWidth('0.9'); setDoorHeight('2.0');
              setWindowWidth('1.2'); setWindowHeight('1.4'); setWindowCount('1');
              setRollWidth('0.53'); setRollLength('10.05');
              setPaintCoverage('10'); setPaintVolume('2.5');
            }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all">
              {getLanguage() === 'ru' ? 'Сбросить' : 'Reset'}
            </button>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {wallArea ? (
            <div className="space-y-4">
              {/* Площадь стен */}
              <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">{t('wallpaper.wallArea')}</p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {fmt(wallArea.netArea)} <span className="text-lg font-medium text-white/70">{t('wallpaper.m2')}</span>
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {getLanguage() === 'ru'
                    ? `за вычетом ${fmt(wallArea.doorArea)} м² двери и ${fmt(wallArea.windowArea)} м² окон`
                    : `minus ${fmt(wallArea.doorArea)} m² door and ${fmt(wallArea.windowArea)} m² windows`}
                </p>
              </div>

              {/* Результаты по режиму */}
              {mode === 'wallpaper' && wallpaperResult ? (
                <>
                  {/* Рулоны обоев */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500">
                          <rect x="6" y="2" width="12" height="20" rx="3" />
                          <path d="M6 8h12M6 14h12" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{t('wallpaper.wallpaperRolls')}</p>
                        <p className="text-2xl font-bold text-slate-800">{wallpaperResult.rolls} <span className="text-sm text-slate-400">шт.</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Детали */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{getLanguage() === 'ru' ? 'Длина полосы' : 'Strip length'}</span>
                      <span className="font-medium text-slate-700">{fmt(wallpaperResult.stripLength)} м</span>
                    </div>
                    <div className="border-t border-slate-100" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{getLanguage() === 'ru' ? 'Кол-во полос' : 'Strips count'}</span>
                      <span className="font-medium text-slate-700">{wallpaperResult.totalStrips} шт.</span>
                    </div>
                    <div className="border-t border-slate-100" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{getLanguage() === 'ru' ? 'Общая длина' : 'Total length'}</span>
                      <span className="font-medium text-slate-700">{fmt(wallpaperResult.totalLength, 0)} м</span>
                    </div>
                  </div>
                </>
              ) : mode === 'paint' && paintResult ? (
                <>
                  {/* Банки краски */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{t('wallpaper.paintCans')}</p>
                        <p className="text-2xl font-bold text-slate-800">{paintResult.cans} <span className="text-sm text-slate-400">шт.</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Детали */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{getLanguage() === 'ru' ? 'Нужно краски' : 'Paint needed'}</span>
                      <span className="font-medium text-slate-700">{fmt(paintResult.litersNeeded)} л</span>
                    </div>
                    <div className="border-t border-slate-100" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{getLanguage() === 'ru' ? 'Банок в запасе' : 'Extra paint'}</span>
                      <span className="font-medium text-slate-700">
                        {fmt((paintResult.cans * parseFloat(paintVolume)) - paintResult.litersNeeded)} л
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            /* Подсказка */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-slate-300 mb-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
                  <path d="M3 9h18M9 21V9" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                {getLanguage() === 'ru'
                  ? 'Заполните размеры комнаты для расчёта'
                  : 'Fill in room dimensions to calculate'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
