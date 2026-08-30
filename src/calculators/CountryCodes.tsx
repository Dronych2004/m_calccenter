/**
 * Справочник телефонных кодов стран мира
 *
 * Поиск по названию страны, коду или региону.
 */
import { useState, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import SeoContent from '../components/SeoContent';

interface CountryCode {
  country: string;
  countryEn: string;
  code: string;
  region: string;
  regionEn: string;
}

const countryCodes: CountryCode[] = [
  /* Европа */
  { country: 'Россия', countryEn: 'Russia', code: '+7', region: 'Европа', regionEn: 'Europe' },
  { country: 'Великобритания', countryEn: 'United Kingdom', code: '+44', region: 'Европа', regionEn: 'Europe' },
  { country: 'Германия', countryEn: 'Germany', code: '+49', region: 'Европа', regionEn: 'Europe' },
  { country: 'Франция', countryEn: 'France', code: '+33', region: 'Европа', regionEn: 'Europe' },
  { country: 'Италия', countryEn: 'Italy', code: '+39', region: 'Европа', regionEn: 'Europe' },
  { country: 'Испания', countryEn: 'Spain', code: '+34', region: 'Европа', regionEn: 'Europe' },
  { country: 'Португалия', countryEn: 'Portugal', code: '+351', region: 'Европа', regionEn: 'Europe' },
  { country: 'Нидерланды', countryEn: 'Netherlands', code: '+31', region: 'Европа', regionEn: 'Europe' },
  { country: 'Бельгия', countryEn: 'Belgium', code: '+32', region: 'Европа', regionEn: 'Europe' },
  { country: 'Швейцария', countryEn: 'Switzerland', code: '+41', region: 'Европа', regionEn: 'Europe' },
  { country: 'Австрия', countryEn: 'Austria', code: '+43', region: 'Европа', regionEn: 'Europe' },
  { country: 'Польша', countryEn: 'Poland', code: '+48', region: 'Европа', regionEn: 'Europe' },
  { country: 'Чехия', countryEn: 'Czech Republic', code: '+420', region: 'Европа', regionEn: 'Europe' },
  { country: 'Словакия', countryEn: 'Slovakia', code: '+421', region: 'Европа', regionEn: 'Europe' },
  { country: 'Венгрия', countryEn: 'Hungary', code: '+36', region: 'Европа', regionEn: 'Europe' },
  { country: 'Румыния', countryEn: 'Romania', code: '+40', region: 'Европа', regionEn: 'Europe' },
  { country: 'Болгария', countryEn: 'Bulgaria', code: '+359', region: 'Европа', regionEn: 'Europe' },
  { country: 'Греция', countryEn: 'Greece', code: '+30', region: 'Европа', regionEn: 'Europe' },
  { country: 'Турция', countryEn: 'Turkey', code: '+90', region: 'Европа', regionEn: 'Europe' },
  { country: 'Украина', countryEn: 'Ukraine', code: '+380', region: 'Европа', regionEn: 'Europe' },
  { country: 'Беларусь', countryEn: 'Belarus', code: '+375', region: 'Европа', regionEn: 'Europe' },
  { country: 'Молдова', countryEn: 'Moldova', code: '+373', region: 'Европа', regionEn: 'Europe' },
  { country: 'Латвия', countryEn: 'Latvia', code: '+371', region: 'Европа', regionEn: 'Europe' },
  { country: 'Литва', countryEn: 'Lithuania', code: '+370', region: 'Европа', regionEn: 'Europe' },
  { country: 'Эстония', countryEn: 'Estonia', code: '+372', region: 'Европа', regionEn: 'Europe' },
  { country: 'Финляндия', countryEn: 'Finland', code: '+358', region: 'Европа', regionEn: 'Europe' },
  { country: 'Швеция', countryEn: 'Sweden', code: '+46', region: 'Европа', regionEn: 'Europe' },
  { country: 'Норвегия', countryEn: 'Norway', code: '+47', region: 'Европа', regionEn: 'Europe' },
  { country: 'Дания', countryEn: 'Denmark', code: '+45', region: 'Европа', regionEn: 'Europe' },
  { country: 'Ирландия', countryEn: 'Ireland', code: '+353', region: 'Европа', regionEn: 'Europe' },
  { country: 'Хорватия', countryEn: 'Croatia', code: '+385', region: 'Европа', regionEn: 'Europe' },
  { country: 'Сербия', countryEn: 'Serbia', code: '+381', region: 'Европа', regionEn: 'Europe' },
  { country: 'Черногория', countryEn: 'Montenegro', code: '+382', region: 'Европа', regionEn: 'Europe' },
  { country: 'Босния и Герцеговина', countryEn: 'Bosnia and Herzegovina', code: '+387', region: 'Европа', regionEn: 'Europe' },
  { country: 'Словения', countryEn: 'Slovenia', code: '+386', region: 'Европа', regionEn: 'Europe' },
  { country: 'Северная Македония', countryEn: 'North Macedonia', code: '+389', region: 'Европа', regionEn: 'Europe' },
  { country: 'Албания', countryEn: 'Albania', code: '+355', region: 'Европа', regionEn: 'Europe' },
  { country: 'Косово', countryEn: 'Kosovo', code: '+383', region: 'Европа', regionEn: 'Europe' },
  { country: 'Исландия', countryEn: 'Iceland', code: '+354', region: 'Европа', regionEn: 'Europe' },
  { country: 'Люксембург', countryEn: 'Luxembourg', code: '+352', region: 'Европа', regionEn: 'Europe' },
  { country: 'Мальта', countryEn: 'Malta', code: '+356', region: 'Европа', regionEn: 'Europe' },
  { country: 'Кипр', countryEn: 'Cyprus', code: '+357', region: 'Европа', regionEn: 'Europe' },
  { country: 'Андорра', countryEn: 'Andorra', code: '+376', region: 'Европа', regionEn: 'Europe' },
  { country: 'Монако', countryEn: 'Monaco', code: '+377', region: 'Европа', regionEn: 'Europe' },
  { country: 'Лихтенштейн', countryEn: 'Liechtenstein', code: '+423', region: 'Европа', regionEn: 'Europe' },
  { country: 'Сан-Марино', countryEn: 'San Marino', code: '+378', region: 'Европа', regionEn: 'Europe' },
  { country: 'Ватикан', countryEn: 'Vatican', code: '+379', region: 'Европа', regionEn: 'Europe' },

  /* Азия */
  { country: 'Китай', countryEn: 'China', code: '+86', region: 'Азия', regionEn: 'Asia' },
  { country: 'Япония', countryEn: 'Japan', code: '+81', region: 'Азия', regionEn: 'Asia' },
  { country: 'Индия', countryEn: 'India', code: '+91', region: 'Азия', regionEn: 'Asia' },
  { country: 'Южная Корея', countryEn: 'South Korea', code: '+82', region: 'Азия', regionEn: 'Asia' },
  { country: 'Индонезия', countryEn: 'Indonesia', code: '+62', region: 'Азия', regionEn: 'Asia' },
  { country: 'Таиланд', countryEn: 'Thailand', code: '+66', region: 'Азия', regionEn: 'Asia' },
  { country: 'Вьетнам', countryEn: 'Vietnam', code: '+84', region: 'Азия', regionEn: 'Asia' },
  { country: 'Малайзия', countryEn: 'Malaysia', code: '+60', region: 'Азия', regionEn: 'Asia' },
  { country: 'Сингапур', countryEn: 'Singapore', code: '+65', region: 'Азия', regionEn: 'Asia' },
  { country: 'Филиппины', countryEn: 'Philippines', code: '+63', region: 'Азия', regionEn: 'Asia' },
  { country: 'Пакистан', countryEn: 'Pakistan', code: '+92', region: 'Азия', regionEn: 'Asia' },
  { country: 'Бангладеш', countryEn: 'Bangladesh', code: '+880', region: 'Азия', regionEn: 'Asia' },
  { country: 'Шри-Ланка', countryEn: 'Sri Lanka', code: '+94', region: 'Азия', regionEn: 'Asia' },
  { country: 'Мьянма', countryEn: 'Myanmar', code: '+95', region: 'Азия', regionEn: 'Asia' },
  { country: 'Камбоджа', countryEn: 'Cambodia', code: '+855', region: 'Азия', regionEn: 'Asia' },
  { country: 'Лаос', countryEn: 'Laos', code: '+856', region: 'Азия', regionEn: 'Asia' },
  { country: 'Непал', countryEn: 'Nepal', code: '+977', region: 'Азия', regionEn: 'Asia' },
  { country: 'Монголия', countryEn: 'Mongolia', code: '+976', region: 'Азия', regionEn: 'Asia' },
  { country: 'Казахстан', countryEn: 'Kazakhstan', code: '+7', region: 'Азия', regionEn: 'Asia' },
  { country: 'Узбекистан', countryEn: 'Uzbekistan', code: '+998', region: 'Азия', regionEn: 'Asia' },
  { country: 'Таджикистан', countryEn: 'Tajikistan', code: '+992', region: 'Азия', regionEn: 'Asia' },
  { country: 'Кыргызстан', countryEn: 'Kyrgyzstan', code: '+996', region: 'Азия', regionEn: 'Asia' },
  { country: 'Туркменистан', countryEn: 'Turkmenistan', code: '+993', region: 'Азия', regionEn: 'Asia' },
  { country: 'ОАЭ', countryEn: 'UAE', code: '+971', region: 'Азия', regionEn: 'Asia' },
  { country: 'Саудовская Аравия', countryEn: 'Saudi Arabia', code: '+966', region: 'Азия', regionEn: 'Asia' },
  { country: 'Израиль', countryEn: 'Israel', code: '+972', region: 'Азия', regionEn: 'Asia' },
  { country: 'Иран', countryEn: 'Iran', code: '+98', region: 'Азия', regionEn: 'Asia' },
  { country: 'Ирак', countryEn: 'Iraq', code: '+964', region: 'Азия', regionEn: 'Asia' },
  { country: 'Катар', countryEn: 'Qatar', code: '+974', region: 'Азия', regionEn: 'Asia' },
  { country: 'Кувейт', countryEn: 'Kuwait', code: '+965', region: 'Азия', regionEn: 'Asia' },
  { country: 'Бахрейн', countryEn: 'Bahrain', code: '+973', region: 'Азия', regionEn: 'Asia' },
  { country: 'Оман', countryEn: 'Oman', code: '+968', region: 'Азия', regionEn: 'Asia' },
  { country: 'Йемен', countryEn: 'Yemen', code: '+967', region: 'Азия', regionEn: 'Asia' },
  { country: 'Иордания', countryEn: 'Jordan', code: '+962', region: 'Азия', regionEn: 'Asia' },
  { country: 'Ливан', countryEn: 'Lebanon', code: '+961', region: 'Азия', regionEn: 'Asia' },
  { country: 'Сирия', countryEn: 'Syria', code: '+963', region: 'Азия', regionEn: 'Asia' },
  { country: 'Палестина', countryEn: 'Palestine', code: '+970', region: 'Азия', regionEn: 'Asia' },
  { country: 'Грузия', countryEn: 'Georgia', code: '+995', region: 'Азия', regionEn: 'Asia' },
  { country: 'Армения', countryEn: 'Armenia', code: '+374', region: 'Азия', regionEn: 'Asia' },
  { country: 'Азербайджан', countryEn: 'Azerbaijan', code: '+994', region: 'Азия', regionEn: 'Asia' },

  /* Америка */
  { country: 'США', countryEn: 'USA', code: '+1', region: 'Америка', regionEn: 'Americas' },
  { country: 'Канада', countryEn: 'Canada', code: '+1', region: 'Америка', regionEn: 'Americas' },
  { country: 'Мексика', countryEn: 'Mexico', code: '+52', region: 'Америка', regionEn: 'Americas' },
  { country: 'Бразилия', countryEn: 'Brazil', code: '+55', region: 'Америка', regionEn: 'Americas' },
  { country: 'Аргентина', countryEn: 'Argentina', code: '+54', region: 'Америка', regionEn: 'Americas' },
  { country: 'Колумбия', countryEn: 'Colombia', code: '+57', region: 'Америка', regionEn: 'Americas' },
  { country: 'Чили', countryEn: 'Chile', code: '+56', region: 'Америка', regionEn: 'Americas' },
  { country: 'Перу', countryEn: 'Peru', code: '+51', region: 'Америка', regionEn: 'Americas' },
  { country: 'Венесуэла', countryEn: 'Venezuela', code: '+58', region: 'Америка', regionEn: 'Americas' },
  { country: 'Эквадор', countryEn: 'Ecuador', code: '+593', region: 'Америка', regionEn: 'Americas' },
  { country: 'Боливия', countryEn: 'Bolivia', code: '+591', region: 'Америка', regionEn: 'Americas' },
  { country: 'Парагвай', countryEn: 'Paraguay', code: '+595', region: 'Америка', regionEn: 'Americas' },
  { country: 'Уругвай', countryEn: 'Uruguay', code: '+598', region: 'Америка', regionEn: 'Americas' },
  { country: 'Куба', countryEn: 'Cuba', code: '+53', region: 'Америка', regionEn: 'Americas' },
  { country: 'Панама', countryEn: 'Panama', code: '+507', region: 'Америка', regionEn: 'Americas' },
  { country: 'Коста-Рика', countryEn: 'Costa Rica', code: '+506', region: 'Америка', regionEn: 'Americas' },
  { country: 'Гватемала', countryEn: 'Guatemala', code: '+502', region: 'Америка', regionEn: 'Americas' },
  { country: 'Гондурас', countryEn: 'Honduras', code: '+504', region: 'Америка', regionEn: 'Americas' },
  { country: 'Сальвадор', countryEn: 'El Salvador', code: '+503', region: 'Америка', regionEn: 'Americas' },
  { country: 'Никарагуа', countryEn: 'Nicaragua', code: '+505', region: 'Америка', regionEn: 'Americas' },
  { country: 'Доминикана', countryEn: 'Dominican Republic', code: '+1-809', region: 'Америка', regionEn: 'Americas' },
  { country: 'Ямайка', countryEn: 'Jamaica', code: '+1-876', region: 'Америка', regionEn: 'Americas' },
  { country: 'Тринидад и Тобаго', countryEn: 'Trinidad and Tobago', code: '+1-868', region: 'Америка', regionEn: 'Americas' },
  { country: 'Гаити', countryEn: 'Haiti', code: '+509', region: 'Америка', regionEn: 'Americas' },

  /* Африка */
  { country: 'Египет', countryEn: 'Egypt', code: '+20', region: 'Африка', regionEn: 'Africa' },
  { country: 'ЮАР', countryEn: 'South Africa', code: '+27', region: 'Африка', regionEn: 'Africa' },
  { country: 'Нигерия', countryEn: 'Nigeria', code: '+234', region: 'Африка', regionEn: 'Africa' },
  { country: 'Кения', countryEn: 'Kenya', code: '+254', region: 'Африка', regionEn: 'Africa' },
  { country: 'Эфиопия', countryEn: 'Ethiopia', code: '+251', region: 'Африка', regionEn: 'Africa' },
  { country: 'Танзания', countryEn: 'Tanzania', code: '+255', region: 'Африка', regionEn: 'Africa' },
  { country: 'Гана', countryEn: 'Ghana', code: '+233', region: 'Африка', regionEn: 'Africa' },
  { country: 'Марокко', countryEn: 'Morocco', code: '+212', region: 'Африка', regionEn: 'Africa' },
  { country: 'Алжир', countryEn: 'Algeria', code: '+213', region: 'Африка', regionEn: 'Africa' },
  { country: 'Тунис', countryEn: 'Tunisia', code: '+216', region: 'Африка', regionEn: 'Africa' },
  { country: 'Ливия', countryEn: 'Libya', code: '+218', region: 'Африка', regionEn: 'Africa' },
  { country: 'Судан', countryEn: 'Sudan', code: '+249', region: 'Африка', regionEn: 'Africa' },
  { country: 'Уганда', countryEn: 'Uganda', code: '+256', region: 'Африка', regionEn: 'Africa' },
  { country: 'Руанда', countryEn: 'Rwanda', code: '+250', region: 'Африка', regionEn: 'Africa' },
  { country: 'Сенегал', countryEn: 'Senegal', code: '+221', region: 'Африка', regionEn: 'Africa' },
  { country: 'Кот-д\'Ивуар', countryEn: 'Ivory Coast', code: '+225', region: 'Африка', regionEn: 'Africa' },
  { country: 'Камерун', countryEn: 'Cameroon', code: '+237', region: 'Африка', regionEn: 'Africa' },
  { country: 'ДР Конго', countryEn: 'DR Congo', code: '+243', region: 'Африка', regionEn: 'Africa' },
  { country: 'Зимбабве', countryEn: 'Zimbabwe', code: '+263', region: 'Африка', regionEn: 'Africa' },
  { country: 'Замбия', countryEn: 'Zambia', code: '+260', region: 'Африка', regionEn: 'Africa' },
  { country: 'Ботсвана', countryEn: 'Botswana', code: '+267', region: 'Африка', regionEn: 'Africa' },
  { country: 'Мадагаскар', countryEn: 'Madagascar', code: '+261', region: 'Африка', regionEn: 'Africa' },
  { country: 'Мозамбик', countryEn: 'Mozambique', code: '+258', region: 'Африка', regionEn: 'Africa' },
  { country: 'Ангола', countryEn: 'Angola', code: '+244', region: 'Африка', regionEn: 'Africa' },

  /* Океания */
  { country: 'Австралия', countryEn: 'Australia', code: '+61', region: 'Океания', regionEn: 'Oceania' },
  { country: 'Новая Зеландия', countryEn: 'New Zealand', code: '+64', region: 'Океания', regionEn: 'Oceania' },
  { country: 'Фиджи', countryEn: 'Fiji', code: '+679', region: 'Океания', regionEn: 'Oceania' },
  { country: 'Папуа — Новая Гвинея', countryEn: 'Papua New Guinea', code: '+675', region: 'Океания', regionEn: 'Oceania' },
  { country: 'Соломоновы Острова', countryEn: 'Solomon Islands', code: '+677', region: 'Океания', regionEn: 'Oceania' },
];

export default function CountryCodes() {
  const [search, setSearch] = useState('');
  const lang = useLanguage();

  const grouped = useMemo(() => {
    const filtered = countryCodes.filter((item) => {
      const query = search.toLowerCase();
      if (!query) return true;
      return (
        item.country.toLowerCase().includes(query) ||
        item.countryEn.toLowerCase().includes(query) ||
        item.code.includes(query) ||
        item.region.toLowerCase().includes(query) ||
        item.regionEn.toLowerCase().includes(query)
      );
    });

    const groups: Record<string, CountryCode[]> = {};
    for (const item of filtered) {
      const region = lang === 'ru' ? item.region : item.regionEn;
      if (!groups[region]) groups[region] = [];
      groups[region].push(item);
    }
    return groups;
  }, [search, lang]);

  const totalResults = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Телефонные коды стран мира' : 'World Country Phone Codes'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru' ? 'Поиск по названию страны или коду' : 'Search by country name or code'}
        </p>
      </div>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ru' ? 'Найти страну или код...' : 'Find country or code...'}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
        {search && (
          <p className="mt-2 text-xs text-slate-400">
            {lang === 'ru' ? `Найдено: ${totalResults}` : `Found: ${totalResults}`}
          </p>
        )}
      </div>

      {/* Результаты */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([region, countries]) => (
          <div key={region}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              {region}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {countries.map((item, i) => (
                <div
                  key={`${item.code}-${item.country}-${i}`}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-indigo-50/50 transition-colors ${
                    i < countries.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
                >
                  {/* Код */}
                  <span className="shrink-0 w-20 text-center text-lg font-bold text-indigo-600 bg-indigo-50 rounded-lg py-1.5 tabular-nums">
                    {item.code}
                  </span>
                  {/* Страна */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {lang === 'ru' ? item.country : item.countryEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <p className="text-sm text-slate-300">
              {lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}
            </p>
          </div>
        )}
      </div>

      <SeoContent title={lang === 'ru' ? 'Телефонные коды стран мира' : 'World Country Phone Codes'} description={lang === 'ru' ? 'Справочник телефонных кодов стран мира. Каждая страна имеет уникальный международный код, который добавляется перед номером при звонке из-за рубежа.\n\nКод начинается с символа «+» или «00». Например, код России — +7, Украины — +380, Беларуси — +375.' : 'Reference directory of world country phone codes.'} faq={[{ q: lang === 'ru' ? 'Как звонить из России за рубеж?' : 'How to call internationally from Russia?', a: 'Наберите 8, затем 10, код страны и номер. Или используйте символ +.' }]} />
    </div>
  );
}