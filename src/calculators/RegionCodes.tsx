/**
 * Справочник кодов регионов России (номерные коды автомобильных номеров)
 *
 * Поиск по названию региона, коду или федеральному округу.
 */
import { useState, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface RegionCode {
  code: string;
  region: string;
  regionEn: string;
  federalDistrict: string;
  federalDistrictEn: string;
}

const regionCodes: RegionCode[] = [
  /* Центральный ФО */
  { code: '01', region: 'Республика Адыгея', regionEn: 'Republic of Adygea', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '02', region: 'Республика Башкортостан', regionEn: 'Republic of Bashkortostan', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '03', region: 'Республика Бурятия', regionEn: 'Republic of Buryatia', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '04', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '05', region: 'Республика Дагестан', regionEn: 'Republic of Dagestan', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '06', region: 'Республика Ингушетия', regionEn: 'Republic of Ingushetia', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '07', region: 'Кабардино-Балкарская Республика', regionEn: 'Kabardino-Balkarian Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '08', region: 'Республика Калмыкия', regionEn: 'Republic of Kalmykia', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '09', region: 'Карачаево-Черкесская Республика', regionEn: 'Karachay-Cherkess Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '10', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '11', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '12', region: 'Республика Марий Эл', regionEn: 'Mari El Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '13', region: 'Республика Мордовия', regionEn: 'Republic of Mordovia', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '14', region: 'Республика Саха (Якутия)', regionEn: 'Sakha Republic (Yakutia)', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '15', region: 'Республика Северная Осетия — Алания', regionEn: 'Republic of North Ossetia-Alania', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '16', region: 'Республика Татарстан', regionEn: 'Republic of Tatarstan', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '17', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '18', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '19', region: 'Республика Хакасия', regionEn: 'Republic of Khakassia', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '20', region: 'Чеченская Республика', regionEn: 'Chechen Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '21', region: 'Чувашская Республика', regionEn: 'Chuvash Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '22', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '23', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '24', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '25', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '26', region: 'Ставропольский край', regionEn: 'Stavropol Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '27', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '28', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '29', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '30', region: 'Астраханская область', regionEn: 'Astrakhan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '31', region: 'Белгородская область', regionEn: 'Belgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '32', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '33', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '34', region: 'Волгоградская область', regionEn: 'Volgograd Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '35', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '36', region: 'Воронежская область', regionEn: 'Voronezh Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '37', region: 'Ивановская область', regionEn: 'Ivanovo Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '38', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '39', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '40', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '41', region: 'Камчатский край', regionEn: 'Kamchatka Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '42', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '43', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '44', region: 'Костромская область', regionEn: 'Kostroma Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '45', region: 'Курганская область', regionEn: 'Kurgan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '46', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '47', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '48', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '49', region: 'Магаданская область', regionEn: 'Magadan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '50', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '51', region: 'Мурманская область', regionEn: 'Murmansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '52', region: 'Нижегородская область', regionEn: 'Nizhny Novgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '53', region: 'Новгородская область', regionEn: 'Novgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '54', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '55', region: 'Омская область', regionEn: 'Omsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '56', region: 'Оренбургская область', regionEn: 'Orenburg Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '57', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '58', region: 'Пензенская область', regionEn: 'Penza Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '59', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '60', region: 'Псковская область', regionEn: 'Pskov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '61', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '62', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '63', region: 'Самарская область', regionEn: 'Samara Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '64', region: 'Саратовская область', regionEn: 'Saratov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '65', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '66', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '67', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '68', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '69', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '70', region: 'Томская область', regionEn: 'Tomsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '71', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '72', region: 'Тюменская область', regionEn: 'Tyumen Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '73', region: 'Ульяновская область', regionEn: 'Ulyanovsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '74', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '75', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '76', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '77', region: 'Москва', regionEn: 'Moscow', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '78', region: 'Санкт-Петербург', regionEn: 'Saint Petersburg', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '79', region: 'Еврейская автономная область', regionEn: 'Jewish Autonomous Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '80', region: 'Ненецкий АО', regionEn: 'Nenets AO', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '81', region: 'Ханты-Мансийский АО — Югра', regionEn: 'Khanty-Mansi AO — Yugra', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '82', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '83', region: 'Ямало-Ненецкий АО', regionEn: 'Yamalo-Nenets AO', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '84', region: 'Republic of Crimea', regionEn: 'Republic of Crimea', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '85', region: 'Севастополь', regionEn: 'Sevastopol', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '86', region: 'Ханты-Мансийский АО', regionEn: 'Khanty-Mansi AO', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '87', region: 'Ненецкий АО', regionEn: 'Nenets AO', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '88', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '89', region: 'Ямало-Ненецкий АО', regionEn: 'Yamalo-Nenets AO', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '90', region: 'Republic of Crimea', regionEn: 'Republic of Crimea', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '91', region: 'Севастополь', regionEn: 'Sevastopol', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '92', region: 'Севастополь', regionEn: 'Sevastopol', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '93', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '94', region: 'Republic of Crimea', regionEn: 'Republic of Crimea', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '95', region: 'Чеченская Республика', regionEn: 'Chechen Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '96', region: 'Кабардино-Балкарская Республика', regionEn: 'Kabardino-Balkarian Republic', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '97', region: 'Москва', regionEn: 'Moscow', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '98', region: 'Санкт-Петербург', regionEn: 'Saint Petersburg', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { code: '99', region: 'Москва', regionEn: 'Moscow', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
];

export default function RegionCodes() {
  const [search, setSearch] = useState('');
  const lang = useLanguage();

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return regionCodes;
    return regionCodes.filter((item) => {
      return (
        item.code.includes(query) ||
        item.region.toLowerCase().includes(query) ||
        item.regionEn.toLowerCase().includes(query) ||
        item.federalDistrict.toLowerCase().includes(query) ||
        item.federalDistrictEn.toLowerCase().includes(query)
      );
    });
  }, [search]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Коды регионов России' : 'Russia Region Codes'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru' ? 'Номерные коды автомобильных номеров (RUS)' : 'Vehicle registration plate codes (RUS)'}
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
            placeholder={lang === 'ru' ? 'Найти регион или код...' : 'Find region or code...'}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
        {search && (
          <p className="mt-2 text-xs text-slate-400">
            {lang === 'ru' ? `Найдено: ${filtered.length}` : `Found: ${filtered.length}`}
          </p>
        )}
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left font-semibold text-slate-400 w-20">
                  {lang === 'ru' ? 'Код' : 'Code'}
                </th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400">
                  {lang === 'ru' ? 'Регион' : 'Region'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={`${item.code}-${item.region}-${i}`}
                  className="border-b border-slate-50 hover:bg-indigo-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-block w-12 text-lg font-bold text-indigo-600 bg-indigo-50 rounded-lg py-1 tabular-nums">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">
                    {lang === 'ru' ? item.region : item.regionEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center mt-4">
          <p className="text-sm text-slate-300">
            {lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}
          </p>
        </div>
      )}
    </div>
  );
}