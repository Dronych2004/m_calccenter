/**
 * Хук useLanguage — заменяет повторяющийся паттерн
 *   const [langTick, setLangTick] = useState(0);
 *   useEffect(() => {
 *     const handler = () => setLangTick(v => v + 1);
 *     window.addEventListener('languageChange', handler);
 *     return () => window.removeEventListener('languageChange', handler);
 *   }, []);
 *
 * Теперь достаточно: const lang = useLanguage();
 * Компонент автоматически перерисуется при смене языка.
 */
import { useState, useEffect } from 'react';
import { getLanguage, type Language } from '../i18n';

export function useLanguage(): Language {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const handler = () => setLang(getLanguage());
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  return lang;
}
