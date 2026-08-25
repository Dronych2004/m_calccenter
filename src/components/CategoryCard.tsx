/**
 * Анимированная карточка категории
 *
 * Список калькуляторов виден всегда.
 * При наведении/скольжении по инструментам —
 * каждый "выпячивается" с эффектом глубины и подсветки.
 */
import { Link } from 'react-router-dom';
import { getLanguage } from '../i18n';

type IconComponent = React.FC<{ size?: number; className?: string }>;

interface CalcItem {
  path: string;
  titleRu: string;
  titleEn: string;
}

interface CategoryCardProps {
  Icon: IconComponent;
  titleRu: string;
  titleEn: string;
  gradient: string;
  shadow: string;
  calculators: CalcItem[];
}

export default function CategoryCard({
  Icon,
  titleRu,
  titleEn,
  gradient,
  shadow,
  calculators,
}: CategoryCardProps) {
  const lang = getLanguage();

  return (
    <div className="group/card bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
      {/* Заголовок категории */}
      <div className={`bg-linear-to-br ${gradient} p-5`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-lg ${shadow}`}>
            <Icon size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {lang === 'ru' ? titleRu : titleEn}
          </h3>
        </div>
      </div>

      {/* Список инструментов — всегда виден */}
      <div className="p-3">
        {calculators.map((calc, i) => (
          <Link
            key={calc.path}
            to={calc.path}
            className={`
              relative flex items-center gap-3 rounded-xl px-4 py-3
              no-underline transition-all duration-200
              text-slate-600 hover:text-indigo-700
              hover:bg-indigo-50/80
              hover:shadow-md hover:shadow-indigo-500/10
              hover:-translate-y-0.5 hover:scale-[1.02]
              hover:z-10
              ${i < calculators.length - 1 ? 'border-b border-slate-50' : ''}
            `}
          >
            {/* Иконка-стрелка, подсвечивается при hover */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-all duration-200 group-hover/card:bg-indigo-100 group-hover/card:text-indigo-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>

            {/* Название инструмента */}
            <span className="text-sm font-medium transition-all duration-200">
              {lang === 'ru' ? calc.titleRu : calc.titleEn}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}