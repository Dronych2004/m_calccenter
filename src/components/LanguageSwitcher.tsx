/**
 * Переключатель языка — крупный
 */
import { setLanguage, type Language } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';

export default function LanguageSwitcher() {
  const currentLang = useLanguage();
  const handleChange = (lang: Language) => {
    setLanguage(lang);
    window.dispatchEvent(new Event('languageChange'));
  };

  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
      <button
        onClick={() => handleChange('ru')}
        className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${
          currentLang === 'ru' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label="Русский"
      >RU</button>
      <button
        onClick={() => handleChange('en')}
        className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${
          currentLang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label="English"
      >EN</button>
    </div>
  );
}
