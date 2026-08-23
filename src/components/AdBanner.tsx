/**
 * Компонент-заглушка для рекламного блока Яндекса.
 *
 * Десктоп (xl+, 1280px+): боковые баннеры 300×600.
 * Мобилка/планшет (<xl): баннеры 728×90 сверху и снизу.
 *
 * BREAKPOINT: xl вместо lg, чтобы iPad Pro (1024px) оставался в мобильном режиме.
 */

interface AdBannerProps {
  position: 'desktop-left' | 'desktop-right' | 'mobile-top' | 'mobile-bottom';
}

export default function AdBanner({ position }: AdBannerProps) {
  if (position === 'desktop-left' || position === 'desktop-right') {
    return (
      <aside
        className="hidden xl:flex flex-col items-center justify-start pt-24 w-[300px] shrink-0"
        aria-label="Реклама"
      >
        <div className="sticky top-24 w-[300px] h-[600px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center">
          <span className="text-xs text-slate-300 select-none">
            Рекламный блок 300×600
          </span>
        </div>
      </aside>
    );
  }

  return (
    <div
      className="xl:hidden flex items-center justify-center w-full bg-slate-50/50 border-b border-dashed border-slate-200"
      aria-label="Реклама"
    >
      <div className="w-full max-w-[728px] h-[90px] flex items-center justify-center">
        <span className="text-xs text-slate-300 select-none">
          Рекламный блок 728×90
        </span>
      </div>
    </div>
  );
}
