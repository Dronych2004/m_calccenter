/**
 * Корневой компонент приложения (App)
 *
 * Структура layout под рекламу Яндекса:
 *
 * Десктоп (xl+, 1280px+):
 *   [Header — на всю ширину]
 *   [Ad Left 300px] [Content] [Ad Right 300px]
 *   [Footer — на всю ширину]
 *
 * Мобилка/планшет/iPad (<xl):
 *   [Ad Top 728×90]
 *   [Header]
 *   [Content]
 *   [Footer]
 *   [Ad Bottom 728×90]
 *
 * BREAKPOINT xl (1280px) вместо lg (1024px),
 * чтобы iPad Pro (1024px) оставался в мобильной версии.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

/* Lazy-загрузка: каждый калькулятор — отдельный чанк.
 * Код загружается только при переходе на нужный маршрут,
 * а не при первой загрузке страницы. */
const ClassicCalculator = lazy(() => import('./calculators/ClassicCalculator'));
const EngineeringCalculator = lazy(() => import('./calculators/EngineeringCalculator'));
const MortgageCalculator = lazy(() => import('./calculators/MortgageCalculator'));
const FuelCalculator = lazy(() => import('./calculators/FuelCalculator'));
const BMICalculator = lazy(() => import('./calculators/BMICalculator'));
const WallpaperCalculator = lazy(() => import('./calculators/WallpaperCalculator'));
const DateCalculator = lazy(() => import('./calculators/DateCalculator'));
const CountryCodes = lazy(() => import('./calculators/CountryCodes'));
const RegionCodes = lazy(() => import('./calculators/RegionCodes'));
const UnitConverter = lazy(() => import('./calculators/UnitConverter'));
const DiscountCalculator = lazy(() => import('./calculators/DiscountCalculator'));
const PasswordGenerator = lazy(() => import('./calculators/PasswordGenerator'));
const CreditCalculator = lazy(() => import('./calculators/CreditCalculator'));
const AutoCreditCalculator = lazy(() => import('./calculators/AutoCreditCalculator'));
const OSAGOCalculator = lazy(() => import('./calculators/OSAGOCalculator'));
const VacationCalculator = lazy(() => import('./calculators/VacationCalculator'));
const PenaltyCalculator = lazy(() => import('./calculators/PenaltyCalculator'));
const NDFLCalculator = lazy(() => import('./calculators/NDFLCalculator'));
const NDSCalculator = lazy(() => import('./calculators/NDSCalculator'));
const InterestCalculator = lazy(() => import('./calculators/InterestCalculator'));
const UtilFeeCalculator = lazy(() => import('./calculators/UtilFeeCalculator'));
const CustomsCalculator = lazy(() => import('./calculators/CustomsCalculator'));

/** Индикатор загрузки — показывается пока чанк не подгрузится */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <span className="text-sm text-slate-400">Загрузка...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[var(--color-bg)] overflow-x-hidden">

        {/* Мобильная реклама сверху */}
        <AdBanner position="mobile-top" />

        <Header />

        {/* Десктоп: боковые слоты + контент */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <AdBanner position="desktop-left" />

          <main className="flex-1 max-w-[960px] min-w-0 overflow-hidden">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/classic" element={<ClassicCalculator />} />
                  <Route path="/engineering" element={<EngineeringCalculator />} />
                  <Route path="/mortgage" element={<MortgageCalculator />} />
                  <Route path="/fuel" element={<FuelCalculator />} />
                  <Route path="/bmi" element={<BMICalculator />} />
                  <Route path="/wallpaper" element={<WallpaperCalculator />} />
                  <Route path="/days" element={<DateCalculator />} />
                  <Route path="/country-codes" element={<CountryCodes />} />
                  <Route path="/region-codes" element={<RegionCodes />} />
                  <Route path="/unit-converter" element={<UnitConverter />} />
                  <Route path="/discount" element={<DiscountCalculator />} />
                  <Route path="/password" element={<PasswordGenerator />} />
                  <Route path="/credit" element={<CreditCalculator />} />
                  <Route path="/auto-credit" element={<AutoCreditCalculator />} />
                  <Route path="/osago" element={<OSAGOCalculator />} />
                  <Route path="/vacation" element={<VacationCalculator />} />
                  <Route path="/penalty" element={<PenaltyCalculator />} />
                  <Route path="/ndfl" element={<NDFLCalculator />} />
                  <Route path="/nds" element={<NDSCalculator />} />
                  <Route path="/interest" element={<InterestCalculator />} />
                  <Route path="/util-fee" element={<UtilFeeCalculator />} />
                  <Route path="/customs" element={<CustomsCalculator />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          <AdBanner position="desktop-right" />
        </div>

        <Footer />

        {/* Мобильная реклама снизу */}
        <AdBanner position="mobile-bottom" />
      </div>
    </BrowserRouter>
  );
}
