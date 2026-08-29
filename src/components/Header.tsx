/**
 * Шапка — навигация по категориям с выпадающими списками
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';
import { CalcIcon } from './Icons';

/* Категории и их калькуляторы */
interface CalculatorItem {
  path: string;
  titleRu: string;
  titleEn: string;
}

interface Category {
  id: string;
  titleRu: string;
  titleEn: string;
  calculators: CalculatorItem[];
}

const categories: Category[] = [
  {
    id: 'basics',
    titleRu: 'Базовые',
    titleEn: 'Basic',
    calculators: [
      { path: '/classic', titleRu: 'Классический', titleEn: 'Classic' },
      { path: '/engineering', titleRu: 'Инженерный', titleEn: 'Engineering' },
    ],
  },
  {
    id: 'finance',
    titleRu: 'Финансы',
    titleEn: 'Finance',
    calculators: [
      { path: '/mortgage', titleRu: 'Ипотечный', titleEn: 'Mortgage' },
      { path: '/credit', titleRu: 'Кредитный', titleEn: 'Credit' },
      { path: '/auto-credit', titleRu: 'Автокредит', titleEn: 'Auto Loan' },
      { path: '/osago', titleRu: 'ОСАГО', titleEn: 'OSAGO' },
      { path: '/vacation', titleRu: 'Отпускные', titleEn: 'Vacation Pay' },
      { path: '/penalty', titleRu: 'Пени', titleEn: 'Penalty' },
    ],
  },
  {
    id: 'taxes',
    titleRu: 'Налоги',
    titleEn: 'Taxes',
    calculators: [
      { path: '/ndfl', titleRu: 'НДФЛ', titleEn: 'Income Tax' },
      { path: '/nds', titleRu: 'НДС', titleEn: 'VAT' },
      { path: '/interest', titleRu: 'Проценты', titleEn: 'Interest' },
    ],
  },
  {
    id: 'auto',
    titleRu: 'Авто',
    titleEn: 'Auto',
    calculators: [
      { path: '/fuel', titleRu: 'Расход топлива', titleEn: 'Fuel Cost' },
      { path: '/util-fee', titleRu: 'Утильсбор', titleEn: 'Utilization Fee' },
      { path: '/customs', titleRu: 'Растаможка', titleEn: 'Customs' },
    ],
  },
  {
    id: 'health',
    titleRu: 'Здоровье',
    titleEn: 'Health',
    calculators: [
      { path: '/bmi', titleRu: 'ИМТ и калории', titleEn: 'BMI & Calories' },
    ],
  },
  {
    id: 'renovation',
    titleRu: 'Ремонт',
    titleEn: 'Renovation',
    calculators: [
      { path: '/wallpaper', titleRu: 'Обои и краска', titleEn: 'Wallpaper & Paint' },
    ],
  },
  {
    id: 'utilities',
    titleRu: 'Утилиты',
    titleEn: 'Utilities',
    calculators: [
      { path: '/days', titleRu: 'Калькулятор дней', titleEn: 'Date Calculator' },
      { path: '/password', titleRu: 'Генератор паролей', titleEn: 'Password Generator' },
      { path: '/discount', titleRu: 'Калькулятор скидок', titleEn: 'Discount Calculator' },
    ],
  },
  {
    id: 'reference',
    titleRu: 'Справочники',
    titleEn: 'Reference',
    calculators: [
      { path: '/phone-codes', titleRu: 'Телефонные коды России', titleEn: 'Russia Phone Codes' },
      { path: '/country-codes', titleRu: 'Телефонные коды стран мира', titleEn: 'World Country Codes' },
      { path: '/region-codes', titleRu: 'Коды регионов России', titleEn: 'Russia Region Codes' },
      { path: '/unit-converter', titleRu: 'Конвертер единиц измерений', titleEn: 'Unit Converter' },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const lang = useLanguage();
  const location = useLocation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenCategory(categoryId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenCategory(null);
    }, 150);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_1px_20px_rgba(99,102,241,0.08)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Логотип */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/25 group-hover:shadow-lg group-hover:shadow-indigo-500/40 transition-shadow">
            <CalcIcon size={18} className="text-white" />
            <div className="absolute inset-0 rounded-xl bg-linear-to-br from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
          </div>
          <span className="text-base font-bold text-slate-800 hidden sm:inline tracking-tight leading-tight whitespace-pre-line">
            {lang === 'ru' ? 'Центр\nкалькуляторов' : 'Calculator\nCenter'}
          </span>
        </Link>

        {/* Десктопная навигация по категориям */}
        <nav className="hidden xl:flex items-center gap-0.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => handleMouseEnter(cat.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`rounded-lg px-3 py-1.5 text-[19px] font-medium transition-all ${
                  openCategory === cat.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {lang === 'ru' ? cat.titleRu : cat.titleEn}
              </button>

              {/* Выпадающий список */}
              {openCategory === cat.id && (
                <div
                  className="absolute left-0 top-full pt-1 z-50 animate-fade-in"
                  onMouseEnter={() => handleMouseEnter(cat.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/50 py-2 min-w-[200px]">
                    {cat.calculators.map((calc) => (
                      <Link
                        key={calc.path}
                        to={calc.path}
                        className={`block px-4 py-2.5 text-sm no-underline transition-colors ${
                          location.pathname === calc.path
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                        onClick={() => setOpenCategory(null)}
                      >
                        {lang === 'ru' ? calc.titleRu : calc.titleEn}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Правая часть: язык + бургер */}
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

      {/* Мобильное меню */}
      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-4 xl:hidden animate-fade-in max-h-[70vh] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.id} className="mb-2">
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {lang === 'ru' ? cat.titleRu : cat.titleEn}
              </div>
              {cat.calculators.map((calc) => (
                <Link
                  key={calc.path}
                  to={calc.path}
                  className={`block rounded-lg px-6 py-2.5 text-sm font-medium no-underline transition-all ${
                    location.pathname === calc.path
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {lang === 'ru' ? calc.titleRu : calc.titleEn}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}