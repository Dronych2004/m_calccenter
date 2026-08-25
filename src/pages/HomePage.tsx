/**
 * Главная страница — карточки категорий со списками калькуляторов
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { t, getLanguage } from '../i18n';
import {
  CalcIcon, GearIcon, MoneyIcon, FileTextIcon, CarIcon, AppleIcon,
  PaintIcon, WrenchIcon, BookIcon, CalendarIcon,
  SparkleIcon, BoltIcon, LockIcon, PhoneIcon,
} from '../components/Icons';

/* Тип иконки — любая функция из Icons.tsx */
type IconComponent = React.FC<{ size?: number; className?: string }>;

/* Калькулятор внутри категории */
interface CalcItem {
  path: string;
  titleRu: string;
  titleEn: string;
}

/* Категория на главной */
interface CategoryCard {
  id: string;
  Icon: IconComponent;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  gradient: string;
  shadow: string;
  calculators: CalcItem[];
}

const categories: CategoryCard[] = [
  {
    id: 'basics',
    Icon: CalcIcon,
    titleRu: 'Базовые',
    titleEn: 'Basic',
    descRu: 'Классический и инженерный калькуляторы для повседневных и сложных вычислений',
    descEn: 'Classic and engineering calculators for everyday and complex calculations',
    gradient: 'from-indigo-500 to-blue-500',
    shadow: 'shadow-indigo-500/20',
    calculators: [
      { path: '/classic', titleRu: 'Классический', titleEn: 'Classic' },
      { path: '/engineering', titleRu: 'Инженерный', titleEn: 'Engineering' },
    ],
  },
  {
    id: 'finance',
    Icon: MoneyIcon,
    titleRu: 'Финансы',
    titleEn: 'Finance',
    descRu: 'Расчёт кредитов, ипотеки, автокредитов, отпускных и пеней',
    descEn: 'Calculate loans, mortgages, auto loans, vacation pay and penalties',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/20',
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
    Icon: FileTextIcon,
    titleRu: 'Налоги',
    titleEn: 'Taxes',
    descRu: 'НДФЛ, НДС, расчёт процентов — всё для точных финансовых расчётов',
    descEn: 'Income tax, VAT, interest — everything for accurate financial calculations',
    gradient: 'from-violet-500 to-purple-500',
    shadow: 'shadow-violet-500/20',
    calculators: [
      { path: '/ndfl', titleRu: 'НДФЛ', titleEn: 'Income Tax' },
      { path: '/nds', titleRu: 'НДС', titleEn: 'VAT' },
      { path: '/interest', titleRu: 'Проценты', titleEn: 'Interest' },
    ],
  },
  {
    id: 'auto',
    Icon: CarIcon,
    titleRu: 'Авто',
    titleEn: 'Auto',
    descRu: 'Расход топлива, утильсбор и растаможка автомобилей',
    descEn: 'Fuel consumption, utilization fee and customs clearance',
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/20',
    calculators: [
      { path: '/fuel', titleRu: 'Расход топлива', titleEn: 'Fuel Cost' },
      { path: '/util-fee', titleRu: 'Утильсбор', titleEn: 'Utilization Fee' },
      { path: '/customs', titleRu: 'Растаможка', titleEn: 'Customs' },
    ],
  },
  {
    id: 'health',
    Icon: AppleIcon,
    titleRu: 'Здоровье',
    titleEn: 'Health',
    descRu: 'ИМТ, суточная норма калорий и рекомендации по весу',
    descEn: 'BMI, daily calorie needs and weight recommendations',
    gradient: 'from-rose-500 to-pink-500',
    shadow: 'shadow-rose-500/20',
    calculators: [
      { path: '/bmi', titleRu: 'ИМТ и калории', titleEn: 'BMI & Calories' },
    ],
  },
  {
    id: 'renovation',
    Icon: PaintIcon,
    titleRu: 'Ремонт',
    titleEn: 'Renovation',
    descRu: 'Расчёт количества обоев и краски для вашего ремонта',
    descEn: 'Calculate wallpaper rolls and paint cans for your renovation',
    gradient: 'from-cyan-500 to-sky-500',
    shadow: 'shadow-cyan-500/20',
    calculators: [
      { path: '/wallpaper', titleRu: 'Обои и краска', titleEn: 'Wallpaper & Paint' },
    ],
  },
  {
    id: 'utilities',
    Icon: WrenchIcon,
    titleRu: 'Утилиты',
    titleEn: 'Utilities',
    descRu: 'Калькулятор дней, генератор паролей, перевод систем счисления и скидки',
    descEn: 'Date calculator, password generator, number systems and discounts',
    gradient: 'from-amber-500 to-yellow-500',
    shadow: 'shadow-amber-500/20',
    calculators: [
      { path: '/days', titleRu: 'Калькулятор дней', titleEn: 'Date Calculator' },
      { path: '/password', titleRu: 'Генератор паролей', titleEn: 'Password Generator' },
      { path: '/number-systems', titleRu: 'Перевод систем счисления', titleEn: 'Number Systems' },
      { path: '/discount', titleRu: 'Калькулятор скидок', titleEn: 'Discount Calculator' },
    ],
  },
  {
    id: 'reference',
    Icon: BookIcon,
    titleRu: 'Справочники',
    titleEn: 'Reference',
    descRu: 'Телефонные коды, страны, коды регионов и конвертер единиц',
    descEn: 'Phone codes, countries, region codes and unit converter',
    gradient: 'from-slate-500 to-gray-500',
    shadow: 'shadow-slate-500/20',
    calculators: [
      { path: '/phone-codes', titleRu: 'Телефонные коды', titleEn: 'Phone Codes' },
      { path: '/countries', titleRu: 'Страны мира', titleEn: 'Countries' },
      { path: '/region-codes', titleRu: 'Коды регионов', titleEn: 'Region Codes' },
      { path: '/unit-converter', titleRu: 'Конвертер единиц', titleEn: 'Unit Converter' },
    ],
  },
];

const features = [
  { Icon: SparkleIcon, color: 'text-amber-500', bg: 'bg-amber-50', titleKey: 'home.features.free', descKey: 'home.features.freeDesc' },
  { Icon: BoltIcon, color: 'text-orange-500', bg: 'bg-orange-50', titleKey: 'home.features.fast', descKey: 'home.features.fastDesc' },
  { Icon: LockIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', titleKey: 'home.features.privacy', descKey: 'home.features.privacyDesc' },
  { Icon: PhoneIcon, color: 'text-sky-500', bg: 'bg-sky-50', titleKey: 'home.features.mobile', descKey: 'home.features.mobileDesc' },
];

export default function HomePage() {
  const [, setLangTick] = useState(0);
  const lang = getLanguage();

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
          <div className="absolute -inset-6 rounded-full bg-linear-to-r from-indigo-500/20 to-violet-500/20 blur-2xl" />
          <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/25">
            <CalcIcon size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
          <span className="bg-linear-to-r from-slate-800 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            {t('header.title')}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-xl mx-auto">
          {t('home.description')}
        </p>

        <a
          href="#categories"
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 px-7 py-3 text-[15px] font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all no-underline"
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

      {/* КАТЕГОРИИ */}
      <section id="categories">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center tracking-tight">{t('home.hero')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Цветная иконка */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${cat.gradient} shadow-lg ${cat.shadow} mb-4`}>
                <cat.Icon size={22} className="text-white" />
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1.5 group-hover:text-indigo-600 transition-colors">
                {lang === 'ru' ? cat.titleRu : cat.titleEn}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed mb-4">
                {lang === 'ru' ? cat.descRu : cat.descEn}
              </p>

              {/* Список калькуляторов */}
              <div className="space-y-1">
                {cat.calculators.map((calc) => (
                  <Link
                    key={calc.path}
                    to={calc.path}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 no-underline hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-300 shrink-0">
                      <path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {lang === 'ru' ? calc.titleRu : calc.titleEn}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}