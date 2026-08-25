/**
 * Справочник телефонных кодов России
 *
 * Источник: Wikipedia "Telephone numbers in Russia"
 * Коды регионов подтверждены official numbering plan.
 *
 * Формат: +7 XXX xxx-xx-xx
 * XXX — код региона (3 цифры), далее — номер абонента.
 */
import { useState, useEffect, useMemo } from 'react';
import { getLanguage } from '../i18n';

interface CityCode {
  city: string;
  cityEn: string;
  code: string;
  region: string;
  regionEn: string;
  federalDistrict: string;
  federalDistrictEn: string;
}

const phoneCodes: CityCode[] = [
  /* ===== ЦЕНТРАЛЬНЫЙ ФО ===== */
  { city: 'Москва', cityEn: 'Moscow', code: '495', region: 'г. Москва', regionEn: 'Moscow City', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Москва (обл.)', cityEn: 'Moscow (region)', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Белгород', cityEn: 'Belgorod', code: '472', region: 'Белгородская область', regionEn: 'Belgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Брянск', cityEn: 'Bryansk', code: '483', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Владимир', cityEn: 'Vladimir', code: '492', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Воронеж', cityEn: 'Voronezh', code: '473', region: 'Воронежская область', regionEn: 'Voronezh Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Иваново', cityEn: 'Ivanovo', code: '493', region: 'Ивановская область', regionEn: 'Ivanovo Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Калуга', cityEn: 'Kaluga', code: '484', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кострома', cityEn: 'Kostroma', code: '494', region: 'Костромская область', regionEn: 'Kostroma Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Курск', cityEn: 'Kursk', code: '471', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Липецк', cityEn: 'Lipetsk', code: '474', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Орёл', cityEn: 'Oryol', code: '486', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Рязань', cityEn: 'Ryazan', code: '491', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Смоленск', cityEn: 'Smolensk', code: '481', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Тамбов', cityEn: 'Tambov', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Тула', cityEn: 'Tula', code: '487', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Тверь', cityEn: 'Tver', code: '482', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ярославль', cityEn: 'Yaroslavl', code: '485', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  /* ===== СЕВЕРО-ЗАПАДНЫЙ ФО ===== */
  { city: 'Санкт-Петербург', cityEn: 'Saint Petersburg', code: '812', region: 'г. Санкт-Петербург', regionEn: 'Saint Petersburg', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Архангельск', cityEn: 'Arkhangelsk', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Великий Новгород', cityEn: 'Veliky Novgorod', code: '816', region: 'Новгородская область', regionEn: 'Novgorod Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Вологда', cityEn: 'Vologda', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Калининград', cityEn: 'Kaliningrad', code: '401', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Петрозаводск', cityEn: 'Petrozavodsk', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Псков', cityEn: 'Pskov', code: '811', region: 'Псковская область', regionEn: 'Pskov Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Мурманск', cityEn: 'Murmansk', code: '815', region: 'Мурманская область', regionEn: 'Murmansk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сыктывкар', cityEn: 'Syktyvkar', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Череповец', cityEn: 'Cherepovets', code: '820', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Ленобласть', cityEn: 'Leningrad Oblast', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },

  /* ===== ЮЖНЫЙ ФО ===== */
  { city: 'Краснодар', cityEn: 'Krasnodar', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Ростов-на-Дону', cityEn: 'Rostov-on-Don', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Волгоград', cityEn: 'Volgograd', code: '844', region: 'Волгоградская область', regionEn: 'Volgograd Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Астрахань', cityEn: 'Astrakhan', code: '851', region: 'Астраханская область', regionEn: 'Astrakhan Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Симферополь', cityEn: 'Simferopol', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Севастополь', cityEn: 'Sevastopol', code: '869', region: 'г. Севастополь', regionEn: 'Sevastopol', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },

  /* ===== СЕВЕРО-КАВКАЗСКИЙ ФО ===== */
  { city: 'Махачкала', cityEn: 'Makhachkala', code: '872', region: 'Республика Дагестан', regionEn: 'Republic of Dagestan', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Нальчик', cityEn: 'Nalchik', code: '866', region: 'Кабардино-Балкарская Республика', regionEn: 'Kabardino-Balkarian Republic', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Ставрополь', cityEn: 'Stavropol', code: '865', region: 'Ставропольский край', regionEn: 'Stavropol Krai', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Владикавказ', cityEn: 'Vladikavkaz', code: '867', region: 'Республика Северная Осетия', regionEn: 'Republic of North Ossetia', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },

  /* ===== ПРИВОЛЖСКИЙ ФО ===== */
  { city: 'Нижний Новгород', cityEn: 'Nizhny Novgorod', code: '831', region: 'Нижегородская область', regionEn: 'Nizhny Novgorod Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Казань', cityEn: 'Kazan', code: '843', region: 'Республика Татарстан', regionEn: 'Republic of Tatarstan', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Самара', cityEn: 'Samara', code: '846', region: 'Самарская область', regionEn: 'Samara Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Уфа', cityEn: 'Ufa', code: '347', region: 'Республика Башкортостан', regionEn: 'Republic of Bashkortostan', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Оренбург', cityEn: 'Orenburg', code: '353', region: 'Оренбургская область', regionEn: 'Orenburg Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Пермь', cityEn: 'Perm', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Саратов', cityEn: 'Saratov', code: '845', region: 'Саратовская область', regionEn: 'Saratov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Тольятти', cityEn: 'Tolyatti', code: '848', region: 'Самарская область', regionEn: 'Samara Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Ижевск', cityEn: 'Izhevsk', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Пенза', cityEn: 'Penza', code: '841', region: 'Пензенская область', regionEn: 'Penza Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Киров', cityEn: 'Kirov', code: '833', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Ульяновск', cityEn: 'Ulyanovsk', code: '842', region: 'Ульяновская область', regionEn: 'Ulyanovsk Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Чебоксары', cityEn: 'Cheboksary', code: '835', region: 'Чувашская Республика', regionEn: 'Chuvash Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Йошкар-Ола', cityEn: 'Yoshkar-Ola', code: '836', region: 'Республика Марий Эл', regionEn: 'Mari El Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Саранск', cityEn: 'Saransk', code: '834', region: 'Республика Мордовия', regionEn: 'Republic of Mordovia', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },

  /* ===== УРАЛЬСКИЙ ФО ===== */
  { city: 'Екатеринбург', cityEn: 'Yekaterinburg', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Челябинск', cityEn: 'Chelyabinsk', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Тюмень', cityEn: 'Tyumen', code: '345', region: 'Тюменская область', regionEn: 'Tyumen Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Курган', cityEn: 'Kurgan', code: '352', region: 'Курганская область', regionEn: 'Kurgan Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },

  /* ===== СИБИРСКИЙ ФО ===== */
  { city: 'Новосибирск', cityEn: 'Novosibirsk', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Красноярск', cityEn: 'Krasnoyarsk', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Омск', cityEn: 'Omsk', code: '381', region: 'Омская область', regionEn: 'Omsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Барнаул', cityEn: 'Barnaul', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Иркутск', cityEn: 'Irkutsk', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кемерово', cityEn: 'Kemerovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Томск', cityEn: 'Tomsk', code: '382', region: 'Томская область', regionEn: 'Tomsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Горно-Алтайск', cityEn: 'Gorno-Altaysk', code: '388', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кызыл', cityEn: 'Kyzyl', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Абакан', cityEn: 'Abakan', code: '390', region: 'Республика Хакасия', regionEn: 'Republic of Khakassia', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },

  /* ===== ДАЛЬНЕВОСТОЧНЫЙ ФО ===== */
  { city: 'Владивосток', cityEn: 'Vladivostok', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Хабаровск', cityEn: 'Khabarovsk', code: '421', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Якутск', cityEn: 'Yakutsk', code: '411', region: 'Республика Саха (Якутия)', regionEn: 'Sakha Republic (Yakutia)', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Петропавловск-Камчатский', cityEn: 'Petropavlovsk-Kamchatsky', code: '415', region: 'Камчатский край', regionEn: 'Kamchatka Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Чита', cityEn: 'Chita', code: '302', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Южно-Сахалинск', cityEn: 'Yuzhno-Sakhalinsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Магадан', cityEn: 'Magadan', code: '413', region: 'Магаданская область', regionEn: 'Magadan Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Благовещенск', cityEn: 'Blagoveshchensk', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Улан-Удэ', cityEn: 'Ulan-Ude', code: '301', region: 'Республика Бурятия', regionEn: 'Republic of Buryatia', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Биробиджан', cityEn: 'Birobidzhan', code: '426', region: 'Еврейская автономная область', regionEn: 'Jewish Autonomous Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Анадырь', cityEn: 'Anadyr', code: '427', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Салехард', cityEn: 'Salekhard', code: '349', region: 'Ямало-Ненецкий АО', regionEn: 'Yamalo-Nenets AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },

  /* ===== РЕСПУБЛИКИ СЕВЕРНОГО КАВКАЗА ===== */
  { city: 'Грозный', cityEn: 'Grozny', code: '871', region: 'Чеченская Республика', regionEn: 'Chechen Republic', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Майкоп', cityEn: 'Maykop', code: '877', region: 'Республика Адыгея', regionEn: 'Republic of Adygea', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Элиста', cityEn: 'Elista', code: '847', region: 'Республика Калмыкия', regionEn: 'Republic of Kalmykia', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Черкесск', cityEn: 'Cherkessk', code: '878', region: 'Карачаево-Черкесская Республика', regionEn: 'Karachay-Cherkess Republic', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },

  /* ===== АВТОНОМНЫЕ ОКРУГА И ОБЛАСТИ ===== */
  { city: 'Ханты-Мансийск', cityEn: 'Khanty-Mansiysk', code: '346', region: 'Ханты-Мансийский АО — Югра', regionEn: 'Khanty-Mansi AO — Yugra', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Надым', cityEn: 'Nadym', code: '349', region: 'Ямало-Ненецкий АО', regionEn: 'Yamalo-Nenets AO', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Нарьян-Мар', cityEn: 'Naryan-Mar', code: '818', region: 'Ненецкий АО', regionEn: 'Nenets AO', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
];

export default function PhoneCodesRussia() {
  const [search, setSearch] = useState('');
  const [, setLangTick] = useState(0);
  const lang = getLanguage();

  useEffect(() => {
    const handler = () => setLangTick((v) => v + 1);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  const grouped = useMemo(() => {
    const filtered = phoneCodes.filter((item) => {
      const query = search.toLowerCase();
      if (!query) return true;
      return (
        item.city.toLowerCase().includes(query) ||
        item.cityEn.toLowerCase().includes(query) ||
        item.code.includes(query) ||
        item.region.toLowerCase().includes(query) ||
        item.regionEn.toLowerCase().includes(query) ||
        item.federalDistrict.toLowerCase().includes(query) ||
        item.federalDistrictEn.toLowerCase().includes(query)
      );
    });

    const groups: Record<string, CityCode[]> = {};
    for (const item of filtered) {
      const district = lang === 'ru' ? item.federalDistrict : item.federalDistrictEn;
      if (!groups[district]) groups[district] = [];
      groups[district].push(item);
    }
    return groups;
  }, [search, lang]);

  const totalResults = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Телефонные коды России' : 'Russia Phone Codes'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru' ? 'Коды регионов (формат: +7 XXX xxx-xx-xx)' : 'Region codes (format: +7 XXX xxx-xx-xx)'}
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
            placeholder={lang === 'ru' ? 'Найти город или код...' : 'Find city or code...'}
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
        {Object.entries(grouped).map(([district, cities]) => (
          <div key={district}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              {district}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {cities.map((item, i) => (
                <div
                  key={`${item.code}-${item.city}-${i}`}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-indigo-50/50 transition-colors ${
                    i < cities.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
                >
                  {/* Код */}
                  <span className="shrink-0 w-16 text-center text-lg font-bold text-indigo-600 bg-indigo-50 rounded-lg py-1.5 tabular-nums">
                    {item.code}
                  </span>
                  {/* Город и регион */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {lang === 'ru' ? item.city : item.cityEn}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {lang === 'ru' ? item.region : item.regionEn}
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
    </div>
  );
}