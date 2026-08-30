/**
 * Футер — светлая тема
 */
import { useState } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import { CalcIcon } from './Icons';

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const lang = useLanguage();

  return (
    <>
      <footer className="border-t border-slate-200 bg-white shadow-[0_-1px_20px_rgba(99,102,241,0.06)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex items-center gap-2">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 shadow-sm shadow-indigo-500/20">
                <CalcIcon size={14} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{t('header.title')}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={() => setShowPrivacy(true)} className="text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer bg-transparent border-none font-medium">
                {t('footer.privacy')}
              </button>
              <button onClick={() => setShowTerms(true)} className="text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer bg-transparent border-none font-medium">
                {t('footer.terms')}
              </button>
              <a href="mailto:info@calccenter.ru" className="text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium no-underline">
                ✉ info@calccenter.ru
              </a>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>

      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowPrivacy(false)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{t('modal.privacyTitle')}</h2>
              <button onClick={() => setShowPrivacy(false)} className="text-slate-300 hover:text-slate-600 text-2xl bg-transparent border-none cursor-pointer">×</button>
            </div>
            <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
              <p>{t('header.title')} — это бесплатный веб-сервис, предоставляющий онлайн-калькуляторы.</p>
              <h3 className="text-slate-700 font-semibold">Сбор данных</h3>
              <p>Мы не собираем и не храним персональные данные. Все вычисления выполняются локально в браузере.</p>
              <h3 className="text-slate-700 font-semibold">Cookies</h3>
              <p>Сайт может использовать технические cookies для обеспечения корректной работы.</p>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowTerms(false)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{t('modal.termsTitle')}</h2>
              <button onClick={() => setShowTerms(false)} className="text-slate-300 hover:text-slate-600 text-2xl bg-transparent border-none cursor-pointer">×</button>
            </div>
            <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
              <p>Используя {t('header.title')}, вы соглашаетесь с условиями использования.</p>
              <h3 className="text-slate-700 font-semibold">Условия</h3>
              <p>Сервис предоставляется «как есть». Мы стремимся к точности, но не гарантируем абсолютную точность.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
