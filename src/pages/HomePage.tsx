/**
 * Главная страница — светлая тема с яркими карточками
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { t, getLanguage } from '../i18n';
import {
  CalcIcon, GearIcon, HomeIcon, CarIcon, AppleIcon, PaintIcon, CalendarIcon,
  SparkleIcon, BoltIcon, LockIcon, PhoneIcon,
} from '../components/Icons';

const calculators = [
  { path: '/classic', Icon: CalcIcon, titleKey: 'nav.classic', descKey: 'classic.description', gradient: 'from-indigo-500 to-blue-500', shadow: 'shadow-indigo-500/20' },
  { path: '/engineering', Icon: GearIcon, titleKey: 'nav.engineering', descKey: 'engineering.description', gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20' },
  { path: '/mortgage', Icon: HomeIcon, titleKey: 'nav.mortgage', descKey: 'mortgage.description', gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
  { path: '/fuel', Icon: CarIcon, titleKey: 'nav.fuel', descKey: 'fuel.description', gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
  { path: '/bmi', Icon: AppleIcon, titleKey: 'nav.bmi', descKey: 'bmi.description', gradient: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
  { path: '/wallpaper', Icon: PaintIcon, titleKey: 'nav.wallpaper', descKey: 'wallpaper.description', gradient: 'from-cyan-500 to-sky-500', shadow: 'shadow-cyan-500/20' },
  { path: '__empty1', Icon: CalcIcon, titleKey: '', descKey: '', gradient: '', shadow: '', empty: true },
  { path: '/days', Icon: CalendarIcon, titleKey: 'nav.days', descKey: 'days.description', gradient: 'from-amber-500 to-yellow-500', shadow: 'shadow-amber-500/20' },
];

const features = [
  { Icon: SparkleIcon, color: 'text-amber-500', bg: 'bg-amber-50', titleKey: 'home.features.free', descKey: 'home.features.freeDesc' },
  { Icon: BoltIcon, color: 'text-orange-500', bg: 'bg-orange-50', titleKey: 'home.features.fast', descKey: 'home.features.fastDesc' },
  { Icon: LockIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', titleKey: 'home.features.privacy', descKey: 'home.features.privacyDesc' },
  { Icon: PhoneIcon, color: 'text-sky-500', bg: 'bg-sky-50', titleKey: 'home.features.mobile', descKey: 'home.features.mobileDesc' },
];

export default function HomePage() {
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      {/* HERO */}
      <section className="text-center mb-14 animate-fade-in">
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 blur-2xl" />
          <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/25">
            <CalcIcon size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-slate-800 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            {t('header.title')}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-xl mx-auto">
          {t('home.description')}
        </p>

        <a
          href="#calculators"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3 text-[15px] font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all no-underline"
        >
          {t('home.startButton')}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-14">
        {features.map((feat) => (
          <div key={feat.titleKey} className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${feat.bg} mb-3`}>
              <feat.Icon size={20} className={feat.color} />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">{t(feat.titleKey)}</h3>
            <p className="text-xs text-slate-400">{t(feat.descKey)}</p>
          </div>
        ))}
      </section>

      {/* КАЛЬКУЛЯТОРЫ */}
      <section id="calculators">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center tracking-tight">{t('home.hero')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {calculators.map((calc) => {
            /* Пустые ячейки-заглушки для выравнивания сетки */
            if ((calc as any).empty) {
              return <div key={calc.path} />;
            }
            return (
              <Link
                key={calc.path}
                to={calc.path}
                className="group bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 no-underline shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Цветная иконка */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${calc.gradient} shadow-lg ${calc.shadow} mb-4`}>
                  <calc.Icon size={22} className="text-white" />
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1.5 group-hover:text-indigo-600 transition-colors break-words">
                  {t(calc.titleKey)}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed mb-4 break-words">
                  {t(calc.descKey)}
                </p>

                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {getLanguage() === 'ru' ? 'Открыть' : 'Open'}
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
