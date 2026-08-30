/**
 * Генератор паролей
 *
 * Генерирует безопасные пароли с настройкой:
 * - Длина пароля (4–64)
 * - Заглавные буквы (A-Z)
 * - Строчные буквы (a-z)
 * - Цифры (0-9)
 * - Символы (!@#$%...)
 *
 * Индикатор сложности:
 * - Слабый (< 3 баллов)
 * - Средний (3–4 балла)
 * - Хороший (5–6 баллов)
 * - Отличный (≥ 7 баллов)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import SeoContent from '../components/SeoContent';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

interface StrengthLevel {
  label: string;
  color: string;
  bg: string;
  barColor: string;
}

function getStrength(score: number): StrengthLevel {
  if (score < 3) {
    return { label: t('password.strengthWeak'), color: 'text-rose-600', bg: 'bg-rose-50', barColor: 'bg-rose-500' };
  }
  if (score < 5) {
    return { label: t('password.strengthFair'), color: 'text-amber-600', bg: 'bg-amber-50', barColor: 'bg-amber-500' };
  }
  if (score < 7) {
    return { label: t('password.strengthGood'), color: 'text-emerald-600', bg: 'bg-emerald-50', barColor: 'bg-emerald-500' };
  }
  return { label: t('password.strengthExcellent'), color: 'text-indigo-600', bg: 'bg-indigo-50', barColor: 'bg-indigo-500' };
}

function generatePassword(length: number, options: { uppercase: boolean; lowercase: boolean; digits: boolean; symbols: boolean }): string {
  let charset = '';
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.digits) charset += CHARSETS.digits;
  if (options.symbols) charset += CHARSETS.symbols;

  if (!charset) charset = CHARSETS.lowercase;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => charset[v % charset.length]).join('');
}

function calculateStrength(password: string): number {
  let score = 0;

  // Длина
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 24) score += 1;

  // Наборы символов
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  return score;
}

function estimateCrackTime(password: string): string {
  const len = password.length;
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

  if (charsetSize === 0) return '—';

  // Комбинаций: charsetSize ^ len
  // При 1 млрд попыток/сек
  const combinations = Math.pow(charsetSize, len);
  const seconds = combinations / 1e9;

  if (seconds < 1) return t('password.crackInstantly');
  if (seconds < 60) return t('password.crackSec', { value: Math.round(seconds) });
  if (seconds < 3600) return t('password.crackMin', { value: Math.round(seconds / 60) });
  if (seconds < 86400) return t('password.crackHr', { value: Math.round(seconds / 3600) });
  if (seconds < 86400 * 365) return t('password.crackDays', { value: Math.round(seconds / 86400) });
  if (seconds < 86400 * 365 * 1000) return t('password.crackYears', { value: Math.round(seconds / (86400 * 365)) });
  if (seconds < 86400 * 365 * 1e6) return t('password.crackThousandYears', { value: Math.round(seconds / (86400 * 365 * 1000)) });
  if (seconds < 86400 * 365 * 1e9) return t('password.crackMillionYears', { value: Math.round(seconds / (86400 * 365 * 1e6)) });
  return t('password.crackBillionYears', { value: (seconds / (86400 * 365 * 1e9)).toExponential(1) });
}

export default function PasswordGenerator() {
  const lang = useLanguage();
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
  });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  /* Очистка таймера при размонтировании */
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const generate = useCallback(() => {
    const newPassword = generatePassword(length, options);
    setPassword(newPassword);
    setCopied(false);
    setHistory((prev) => {
      const next = [newPassword, ...prev.filter((p) => p !== newPassword)].slice(0, 10);
      return next;
    });
  }, [length, options]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const strength = calculateStrength(password);
  const strengthLevel = getStrength(strength);
  const crackTime = estimateCrackTime(password);
  const strengthPercent = Math.min((strength / 8) * 100, 100);

  const toggleOption = (key: keyof typeof options) => {
    const newOptions = { ...options, [key]: !options[key] };
    // Ensure at least one option is enabled
    if (!Object.values(newOptions).some(Boolean)) return;
    setOptions(newOptions);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {t('password.title')}
        </h1>
        <p className="text-sm text-slate-400">
          {t('password.description')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ФОРМА ВВОДА */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* Длина */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-600">
                  {t('password.passwordLength')}
                </label>
                <span className="text-sm font-bold text-indigo-600">{length}</span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-300">4</span>
                <span className="text-[10px] text-slate-300">64</span>
              </div>
            </div>

            {/* Типы символов */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-3">
                {t('password.characterTypes')}
              </label>
              <div className="space-y-2">
                {[
                  { key: 'uppercase' as const, label: 'A-Z', desc: t('password.uppercaseDesc') },
                  { key: 'lowercase' as const, label: 'a-z', desc: t('password.lowercaseDesc') },
                  { key: 'digits' as const, label: '0-9', desc: t('password.digitsDesc') },
                  { key: 'symbols' as const, label: '!@#', desc: t('password.symbolsDesc') },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => toggleOption(opt.key)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                      options[opt.key]
                        ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                        : 'bg-slate-50 border border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        options[opt.key] ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {opt.label}
                      </div>
                      <span className={`text-sm font-medium ${options[opt.key] ? 'text-slate-700' : 'text-slate-400'}`}>
                        {opt.desc}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      options[opt.key]
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {options[opt.key] && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <button
                onClick={generate}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 transition-all"
              >
                {t('password.generate')}
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {copied
                  ? t('password.copied')
                  : t('password.copy')}
              </button>
            </div>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="flex-1">
          <div className="space-y-4">
            {/* Пароль — главная карточка */}
            <div className="bg-linear-to-br from-indigo-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
              <p className="text-sm font-medium text-white/70 mb-2">
                {t('password.yourPassword')}
              </p>
              <div className="bg-white/10 rounded-xl p-4 font-mono text-lg sm:text-xl font-bold break-all leading-relaxed tracking-wide select-all">
                {password}
              </div>
            </div>

            {/* Сложность */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-600">
                  {t('password.passwordStrength')}
                </p>
                <span className={`text-sm font-bold ${strengthLevel.color}`}>
                  {strengthLevel.label}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strengthLevel.barColor}`}
                  style={{ width: `${strengthPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[11px] text-slate-400">
                  {t('password.crackTime')}
                </p>
                <p className="text-xs font-semibold text-slate-600">{crackTime}</p>
              </div>
            </div>

            {/* История */}
            {history.length > 1 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-fade-in">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  {t('password.recentPasswords')}
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.slice(1).map((p, i) => (
                    <div
                      key={`${p}-${i}`}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                    >
                      <span className="font-mono text-xs text-slate-500 truncate flex-1">{p}</span>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(p);
                          } catch {
                            const textarea = document.createElement('textarea');
                            textarea.value = p;
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textarea);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-medium hover:bg-indigo-100 transition-all shrink-0"
                      >
                        {t('password.copy')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SeoContent title={lang === 'ru' ? 'О генераторе паролей' : 'About the Password Generator'} description={lang === 'ru' ? 'Генератор паролей создаёт надёжные случайные пароли указанной длины. Вы можете выбрать, включать ли заглавные буквы, цифры и спецсимволы.\n\nНадёжный пароль должен содержать минимум 12 символов и включать буквы верхнего и нижнего регистра, цифры и спецсимволы.\n\nИндикатор сложности показывает, насколько защищён ваш пароль.' : 'The password generator creates strong random passwords of specified length.'} faq={[{ q: lang === 'ru' ? 'Какой длины должен быть пароль?' : 'How long should a password be?', a: 'Минимум 12 символов, рекомендуется 16+.' }]} />
    </div>
  );
}
