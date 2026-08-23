/**
 * Шапка — светлая тема
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { t } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { CalcIcon } from './Icons';

const navItems = [
  { path: '/', key: 'nav.home' },
  { path: '/classic', key: 'nav.classic' },
  { path: '/engineering', key: 'nav.engineering' },
  { path: '/mortgage', key: 'nav.mortgage' },
  { path: '/fuel', key: 'nav.fuel' },
  { path: '/bmi', key: 'nav.bmi' },
  { path: '/wallpaper', key: 'nav.wallpaper' },
  { path: '/days', key: 'nav.days' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLangTick] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_1px_20px_rgba(99,102,241,0.08)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/25 group-hover:shadow-lg group-hover:shadow-indigo-500/40 transition-shadow">
            <CalcIcon size={18} className="text-white" />
            {/* Свечение вокруг логотипа */}
            <div className="absolute inset-0 rounded-xl bg-linear-to-br from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
          </div>
          <span className="text-base font-bold text-slate-800 hidden sm:inline tracking-tight">
            {t('header.title')}
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium no-underline transition-all ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            className="flex flex-col gap-1.5 p-2 xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Меню"
          >
            <span className={`block h-[1.5px] w-5 bg-slate-600 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`} />
            <span className={`block h-[1.5px] w-5 bg-slate-600 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-[1.5px] w-5 bg-slate-600 transition-all duration-300 ${mobileOpen ? '-rotate-45 translate-y-[-4.5px]' : ''}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-4 xl:hidden animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block rounded-lg px-4 py-3 text-sm font-medium no-underline transition-all ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
