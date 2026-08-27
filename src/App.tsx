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
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import HomePage from './pages/HomePage';
import ClassicCalculator from './calculators/ClassicCalculator';
import EngineeringCalculator from './calculators/EngineeringCalculator';
import MortgageCalculator from './calculators/MortgageCalculator';
import FuelCalculator from './calculators/FuelCalculator';
import BMICalculator from './calculators/BMICalculator';
import WallpaperCalculator from './calculators/WallpaperCalculator';
import DateCalculator from './calculators/DateCalculator';
import PhoneCodesRussia from './calculators/PhoneCodesRussia';
import CountryCodes from './calculators/CountryCodes';
import RegionCodes from './calculators/RegionCodes';
import UnitConverter from './calculators/UnitConverter';
import DiscountCalculator from './calculators/DiscountCalculator';

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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/classic" element={<ClassicCalculator />} />
              <Route path="/engineering" element={<EngineeringCalculator />} />
              <Route path="/mortgage" element={<MortgageCalculator />} />
              <Route path="/fuel" element={<FuelCalculator />} />
              <Route path="/bmi" element={<BMICalculator />} />
              <Route path="/wallpaper" element={<WallpaperCalculator />} />
              <Route path="/days" element={<DateCalculator />} />
              <Route path="/phone-codes" element={<PhoneCodesRussia />} />
              <Route path="/country-codes" element={<CountryCodes />} />
              <Route path="/region-codes" element={<RegionCodes />} />
              <Route path="/unit-converter" element={<UnitConverter />} />
              <Route path="/discount" element={<DiscountCalculator />} />
            </Routes>
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
