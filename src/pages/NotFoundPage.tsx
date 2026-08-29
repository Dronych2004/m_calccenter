/**
 * Страница 404 — отображается при переходе на несуществующий маршрут
 */
import { Link } from 'react-router-dom';
import { t } from '../i18n';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm">
        <p className="text-7xl font-extrabold text-indigo-500 mb-4">404</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          {t('notFound.title')}
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          {t('notFound.description')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 transition-all no-underline"
        >
          {t('notFound.backToHome')}
        </Link>
      </div>
    </div>
  );
}
