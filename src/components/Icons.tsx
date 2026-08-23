/**
 * Библиотека SVG-иконок для сайта.
 * Все иконки — React-компоненты, принимающие пропсы для размера и цвета.
 * Используются вместо эмодзи для кроссбраузерной совместимости.
 */

/* Общий тип для всех иконок */
interface IconProps {
  size?: number;      /* Размер иконки (по умолчанию 24) */
  className?: string; /* Дополнительные CSS-классы */
}

/* ==================== ИКОНКА КАЛЬКУЛЯТОРА (основная) ==================== */
export function CalcIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Корпус калькулятора */}
      <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
      {/* Экран */}
      <rect x="7" y="5" width="10" height="4" rx="1" fill="currentColor" opacity="0.3" />
      {/* Кнопки ряд 1 */}
      <rect x="7" y="12" width="3" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="12" width="3" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="14" y="12" width="3" height="2.5" rx="0.5" fill="currentColor" />
      {/* Кнопки ряд 2 */}
      <rect x="7" y="15.5" width="3" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="15.5" width="3" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="14" y="15.5" width="3" height="2.5" rx="0.5" fill="currentColor" />
      {/* Кнопки ряд 3 */}
      <rect x="7" y="19" width="3" height="2" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="19" width="3" height="2" rx="0.5" fill="currentColor" />
      <rect x="14" y="19" width="3" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

/* ==================== ИКОНКА ШЕСТЕРЁНКИ (инженерный) ==================== */
export function GearIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ==================== ИКОНКА ДОМА (ипотечный) ==================== */
export function HomeIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ==================== ИКОНКА МАШИНЫ (расход топлива) ==================== */
export function CarIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ==================== ИКОНКА ЯБЛОКА (ИМТ/калории) ==================== */
export function AppleIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3c-.5-1.5-2-2-3-2 0 0 0 1 0 2 0 1.5 1 2.5 2 3h1z" fill="currentColor" />
      <path d="M8.5 4C5.5 4 3 6.5 3 10c0 4.5 3.5 8 5.5 9.5.8.6 1.5 1 2.5 1s1.7-.4 2.5-1c2-1.5 5.5-5 5.5-9.5 0-3.5-2.5-6-5.5-6-1.2 0-2.3.5-3 1.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ==================== ИКОНКА КРАСКИ/КИСТИ (обои) ==================== */
export function PaintIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 3H5a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 9v4m0 0l-2 3m2-3l2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

/* ==================== ИКОНКА КАЛЕНДАРЯ (дни) ==================== */
export function CalendarIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
}

/* ==================== ИКОНКИ ДЛЯ ПРЕИМУЩЕСТВ ==================== */

export function SparkleIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="currentColor" />
    </svg>
  );
}

export function BoltIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
    </svg>
  );
}

export function LockIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PhoneIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
