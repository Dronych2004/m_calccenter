/**
 * Заглушка калькулятора — светлая тема
 */
import { type ReactNode } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';

interface PlaceholderProps {
  titleKey: string;
  descKey: string;
  icon: ReactNode;
}

export default function PlaceholderCalculator({ titleKey, descKey, icon }: PlaceholderProps) {
  const lang = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center animate-fade-in overflow-hidden">
      <div className="relative inline-block mb-8">
        <div className="absolute -inset-6 rounded-full bg-linear-to-r from-indigo-500/15 to-violet-500/15 blur-2xl" />
        <div className="relative text-indigo-400">{icon}</div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 tracking-tight">{t(titleKey)}</h1>
      <p className="text-sm text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">{t(descKey)}</p>

      <div className="inline-flex items-center gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-6 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-[13px] font-medium text-indigo-400">
          {lang === 'ru'
            ? 'Этот калькулятор будет добавлен скоро'
            : 'This calculator will be added soon'}
        </span>
      </div>
    </div>
  );
}
