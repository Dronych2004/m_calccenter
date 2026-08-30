/**
 * Компонент-заглушка для рекламного блока Яндекса.
 *
 * Десктоп (xl+, 1280px+): боковые баннеры 300×600.
 * Мобилка/планшет (<xl): баннеры 728×90 сверху и снизу.
 *
 * BREAKPOINT: xl вместо lg, чтобы iPad Pro (1024px) оставался в мобильном режиме.
 *
 * Сейчас отключён (return null). Когда подключи рекламу —
 * раскомментируй нужный блок и верни return.
 */

interface AdBannerProps {
  position: 'desktop-left' | 'desktop-right' | 'mobile-top' | 'mobile-bottom'
}

export default function AdBanner(_position: AdBannerProps) {
  return null
}
