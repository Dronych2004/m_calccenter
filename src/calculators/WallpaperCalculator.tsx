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
import { useState, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import SeoContent from '../components/SeoContent';
import SeoHead from '../components/SeoHead';

/* Режим калькулятора */
type CalcMode = 'wallpaper' | 'paint';

export default function WallpaperCalculator() {
  const lang = useLanguage();
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

  const [calculated, setCalculated] = useState(false);
  const [wallArea, setWallArea] = useState<{ perimeter: number; grossArea: number; doorArea: number; windowArea: number; netArea: number } | null>(null);
  const [wallpaperResult, setWallpaperResult] = useState<{ stripLength: number; totalStrips: number; totalLength: number; rolls: number } | null>(null);
  const [paintResult, setPaintResult] = useState<{ litersNeeded: number; cans: number } | null>(null);

  /* ==================== ВЫЧИСЛЕНИЯ ==================== */

  const handleCalculate = useCallback(() => {
    const w = parseFloat(roomWidth);
    const l = parseFloat(roomLength);
    const h = parseFloat(roomHeight);
    const dw = parseFloat(doorWidth) || 0;
    const dh = parseFloat(doorHeight) || 0;
    const ww = parseFloat(windowWidth) || 0;
    const wh = parseFloat(windowHeight) || 0;
    const wc = parseInt(windowCount) || 0;
    const rw = parseFloat(rollWidth);
    const rl = parseFloat(rollLength);
    const coverage = parseFloat(paintCoverage);
    const volume = parseFloat(paintVolume);

    if (!w || !l || !h || w <= 0 || l <= 0 || h <= 0) {
      setCalculated(true);
      return;
    }

    /* Периметр и площадь стен */
    const perimeter = 2 * (w + l);
    const grossArea = perimeter * h;
    const doorArea = dw * dh;
    const windowArea = ww * wh * wc;
    const netArea = Math.max(0, grossArea - doorArea - windowArea);

    setWallArea({ perimeter, grossArea, doorArea, windowArea, netArea });

    /* Обои */
    if (rw && rl && rw > 0 && rl > 0) {
      const stripLength = h + 0.05;
      const wall1Strips = Math.ceil(w / rw);
      const wall2Strips = Math.ceil(l / rw);
      const totalStrips = wall1Strips * 2 + wall2Strips * 2;
      const totalLength = totalStrips * stripLength;
      const rolls = Math.ceil(totalLength / rl);
      setWallpaperResult({ stripLength, totalStrips, totalLength, rolls });
    } else {
      setWallpaperResult(null);
    }

    /* Краска */
    if (coverage && volume && coverage > 0 && volume > 0) {
      const litersNeeded = netArea / coverage;
      const cans = Math.ceil(litersNeeded / volume);
      setPaintResult({ litersNeeded, cans });
    } else {
      setPaintResult(null);
    }

    setCalculated(true);
  }, [roomWidth, roomLength, roomHeight, doorWidth, doorHeight, windowWidth, windowHeight, windowCount, rollWidth, rollLength, paintCoverage, paintVolume]);

  /* ==================== ФОРМАТИРОВАНИЕ ==================== */

  const fmt = (v: number, d = 1) => v.toFixed(d);

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      <SeoHead
        title={lang === 'ru' ? 'Калькулятор обоев и краски онлайн — бесплатно | CalcCenter' : 'Wallpaper & Paint Calculator Online — Free | CalcCenter'}
        description={lang === 'ru'
          ? 'Бесплатный онлайн калькулятор обоев и краски. Рассчитайте количество рулонов обоев и банок краски для ремонта.'
          : 'Free online wallpaper and paint calculator. Calculate the number of wallpaper rolls and paint cans for renovation.'}
        canonical="https://calccenter.ru/wallpaper"
      />
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
              {t('wallpaper.room')}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Ширина */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.width')}</label>
                <input type="text" inputMode="decimal" value={roomWidth} onChange={(e) => setRoomWidth(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
              </div>
              {/* Длина */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.length')}</label>
                <input type="text" inputMode="decimal" value={roomLength} onChange={(e) => setRoomLength(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
              </div>
            </div>

            {/* Высота */}
            <div className="mb-5">
              <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.wallHeightLabel')}</label>
              <input type="text" inputMode="decimal" value={roomHeight} onChange={(e) => setRoomHeight(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
            </div>

            {/* Дверь */}
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.door')}</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" inputMode="decimal" value={doorWidth} onChange={(e) => setDoorWidth(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="0.9"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
                <input type="text" inputMode="decimal" value={doorHeight} onChange={(e) => setDoorHeight(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} placeholder="2.0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
              </div>
            </div>

            {/* Окно */}
            <div className="mb-6">
              <label className="block text-xs text-slate-400 mb-1">{t('wallpaper.window')}</label>
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
                {t('wallpaper.paint')}
              </button>
            </div>

            {/* Параметры обоев */}
            {mode === 'wallpaper' && (
              <div className="mb-5 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                  {t('wallpaper.rollParams')}
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
                  {t('wallpaper.paintParams')}
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

            {/* Кнопки */}
            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 active:scale-[0.98] transition-all"
              >
                {t('wallpaper.calcBtn')}
              </button>
              <button onClick={() => {
                setRoomWidth(''); setRoomLength(''); setRoomHeight('');
                setDoorWidth('0.9'); setDoorHeight('2.0');
                setWindowWidth('1.2'); setWindowHeight('1.4'); setWindowCount('1');
                setRollWidth('0.53'); setRollLength('10.05');
                setPaintCoverage('10'); setPaintVolume('2.5');
                setCalculated(false); setWallArea(null); setWallpaperResult(null); setPaintResult(null);
              }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all">
                {t('wallpaper.reset')}
              </button>
            </div>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          {calculated && wallArea ? (
            <div className="space-y-4">
              {/* Площадь стен */}
              <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                <p className="text-sm font-medium text-white/70 mb-1">{t('wallpaper.wallArea')}</p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {fmt(wallArea.netArea)} <span className="text-lg font-medium text-white/70">{t('wallpaper.m2')}</span>
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {t('wallpaper.netAreaDetail', { doorArea: fmt(wallArea.doorArea), windowArea: fmt(wallArea.windowArea) })}
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
                        <p className="text-2xl font-bold text-slate-800">{wallpaperResult.rolls} <span className="text-sm text-slate-400">{t('wallpaper.pcs')}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Детали */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('wallpaper.stripLength')}</span>
                      <span className="font-medium text-slate-700">{fmt(wallpaperResult.stripLength)} м</span>
                    </div>
                    <div className="border-t border-slate-100" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('wallpaper.stripsCount')}</span>
                      <span className="font-medium text-slate-700">{wallpaperResult.totalStrips} {t('wallpaper.pcs')}</span>
                    </div>
                    <div className="border-t border-slate-100" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('wallpaper.totalLength')}</span>
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
                        <p className="text-2xl font-bold text-slate-800">{paintResult.cans} <span className="text-sm text-slate-400">{t('wallpaper.pcs')}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Детали */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('wallpaper.paintNeeded')}</span>
                      <span className="font-medium text-slate-700">{fmt(paintResult.litersNeeded)} л</span>
                    </div>
                    <div className="border-t border-slate-100" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('wallpaper.extraPaint')}</span>
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
                {t('wallpaper.fillDimensions')}
              </p>
            </div>
          )}
        </div>
      </div>

      <SeoContent title={lang === 'ru' ? 'Обои и краска: как рассчитать' : 'Wallpaper and Paint Calculator'} description={lang === 'ru' ? 'Калькулятор обоев и краски помогает рассчитать точное количество рулонов обоев или банок краски для ремонта.\n\nДля обоев введите размеры комнаты, размеры окон и дверей, а также размер рулона. Калькулятор рассчитает количество рулонов с учётом раппорта рисунка.\n\nДля краски введите площадь стен, расход краски на м² и размер банки.' : 'The wallpaper and paint calculator helps you calculate the exact number of wallpaper rolls or paint cans for renovation.'} faq={[{ q: lang === 'ru' ? 'Как рассчитать площадь стен?' : 'How to calculate wall area?', a: lang === 'ru' ? 'Площадь стен = (Длина + Ширина) × 2 × Высота. Вычтите площадь окон и дверей.' : 'Wall area = (Length + Width) × 2 × Height. Subtract window and door areas.' }]} />
    </div>
  );
}
