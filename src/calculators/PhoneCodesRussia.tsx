/**
 * Справочник телефонных кодов России
 *
 * Поиск по названию города или коду.
 * Группировка по федеральным округам.
 */
import { useState, useEffect, useMemo } from 'react';
import { t, getLanguage } from '../i18n';

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
  /* Центральный ФО */
  { city: 'Москва', cityEn: 'Moscow', code: '495', region: 'Москва', regionEn: 'Moscow', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Москва (моб.)', cityEn: 'Moscow (mobile)', code: '910', region: 'Москва', regionEn: 'Moscow', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
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
  { city: 'Тверь', cityEn: 'Tver', code: '482', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Тула', cityEn: 'Tula', code: '487', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ярославль', cityEn: 'Yaroslavl', code: '485', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  /* Северо-Западный ФО */
  { city: 'Санкт-Петербург', cityEn: 'Saint Petersburg', code: '812', region: 'Санкт-Петербург', regionEn: 'Saint Petersburg', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Санкт-Петербург (моб.)', cityEn: 'Saint Petersburg (mobile)', code: '921', region: 'Санкт-Петербург', regionEn: 'Saint Petersburg', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Архангельск', cityEn: 'Arkhangelsk', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Великий Новгород', cityEn: 'Veliky Novgorod', code: '816', region: 'Новгородская область', regionEn: 'Novgorod Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Вологда', cityEn: 'Vologda', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Калининград', cityEn: 'Kaliningrad', code: '401', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Петрозаводск', cityEn: 'Petrozavodsk', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Псков', cityEn: 'Pskov', code: '811', region: 'Псковская область', regionEn: 'Pskov Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Мурманск', cityEn: 'Murmansk', code: '815', region: 'Мурманская область', regionEn: 'Murmansk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сыктывкар', cityEn: 'Syktyvkar', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Череповец', cityEn: 'Cherepovets', code: '820', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },

  /* Южный ФО */
  { city: 'Краснодар', cityEn: 'Krasnodar', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Ростов-на-Дону', cityEn: 'Rostov-on-Don', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Волгоград', cityEn: 'Volgograd', code: '844', region: 'Волгоградская область', regionEn: 'Volgograd Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Астрахань', cityEn: 'Astrakhan', code: '851', region: 'Астраханская область', regionEn: 'Astrakhan Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Сочи', cityEn: 'Sochi', code: '862', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Новороссийск', cityEn: 'Novorossiysk', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Симферополь', cityEn: 'Simferopol', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Севастополь', cityEn: 'Sevastopol', code: '869', region: 'Севастополь', regionEn: 'Sevastopol', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },

  /* Северо-Кавказский ФО */
  { city: 'Махачкала', cityEn: 'Makhachkala', code: '872', region: 'Республика Дагестан', regionEn: 'Republic of Dagestan', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Нальчик', cityEn: 'Nalchik', code: '866', region: 'Кабардино-Балкарская Республика', regionEn: 'Kabardino-Balkarian Republic', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Ставрополь', cityEn: 'Stavropol', code: '865', region: 'Ставропольский край', regionEn: 'Stavropol Krai', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Владикавказ', cityEn: 'Vladikavkaz', code: '867', region: 'Республика Северная Осетия', regionEn: 'Republic of North Ossetia', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },

  /* Приволжский ФО */
  { city: 'Нижний Новгород', cityEn: 'Nizhny Novgorod', code: '831', region: 'Нижегородская область', regionEn: 'Nizhny Novgorod Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Казань', cityEn: 'Kazan', code: '843', region: 'Республика Татарстан', regionEn: 'Republic of Tatarstan', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Самара', cityEn: 'Samara', code: '846', region: 'Самарская область', regionEn: 'Samara Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Уфа', cityEn: 'Ufa', code: '347', region: 'Республика Башкортостан', regionEn: 'Republic of Bashkortostan', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Челябинск', cityEn: 'Chelyabinsk', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Оренбург', cityEn: 'Orenburg', code: '353', region: 'Оренбургская область', regionEn: 'Orenburg Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Пермь', cityEn: 'Perm', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Волгоград', cityEn: 'Volgograd', code: '844', region: 'Волгоградская область', regionEn: 'Volgograd Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Саратов', cityEn: 'Saratov', code: '845', region: 'Саратовская область', regionEn: 'Saratov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Тольятти', cityEn: 'Tolyatti', code: '848', region: 'Самарская область', regionEn: 'Samara Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Ижевск', cityEn: 'Izhevsk', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Пенза', cityEn: 'Penza', code: '841', region: 'Пензенская область', regionEn: 'Penza Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Киров', cityEn: 'Kirov', code: '833', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Ульяновск', cityEn: 'Ulyanovsk', code: '842', region: 'Ульяновская область', regionEn: 'Ulyanovsk Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },

  /* Уральский ФО */
  { city: 'Екатеринбург', cityEn: 'Yekaterinburg', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Челябинск', cityEn: 'Chelyabinsk', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Тюмень', cityEn: 'Tyumen', code: '345', region: 'Тюменская область', regionEn: 'Tyumen Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Сургут', cityEn: 'Surgut', code: '346', region: 'Ханты-Мансийский АО', regionEn: 'Khanty-Mansi AO', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Челябинск', cityEn: 'Chelyabinsk', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Оренбург', cityEn: 'Orenburg', code: '353', region: 'Оренбургская область', regionEn: 'Orenburg Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },

  /* Сибирский ФО */
  { city: 'Новосибирск', cityEn: 'Novosibirsk', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Красноярск', cityEn: 'Krasnoyarsk', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Омск', cityEn: 'Omsk', code: '381', region: 'Омская область', regionEn: 'Omsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Барнаул', cityEn: 'Barnaul', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Иркутск', cityEn: 'Irkutsk', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кемерово', cityEn: 'Kemerovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Томск', cityEn: 'Tomsk', code: '382', region: 'Томская область', regionEn: 'Tomsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Новокузнецк', cityEn: 'Novokuznetsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Бийск', cityEn: 'Biysk', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },

  /* Дальневосточный ФО */
  { city: 'Владивосток', cityEn: 'Vladivostok', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Хабаровск', cityEn: 'Khabarovsk', code: '421', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Якутск', cityEn: 'Yakutsk', code: '411', region: 'Республика Саха', regionEn: 'Sakha Republic', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Камчатский край', cityEn: 'Kamchatka Krai', code: '415', region: 'Камчатский край', regionEn: 'Kamchatka Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Чита', cityEn: 'Chita', code: '302', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Южно-Сахалинск', cityEn: 'Yuzhno-Sakhalinsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Магадан', cityEn: 'Magadan', code: '413', region: 'Магаданская область', regionEn: 'Magadan Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Петропавловск-Камчатский', cityEn: 'Petropavlovsk-Kamchatsky', code: '415', region: 'Камчатский край', regionEn: 'Kamchatka Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Благовещенск', cityEn: 'Blagoveshchensk', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Улан-Удэ', cityEn: 'Ulan-Ude', code: '301', region: 'Республика Бурятия', regionEn: 'Republic of Buryatia', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },

  /* Крым */
  { city: 'Симферополь', cityEn: 'Simferopol', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Крым', federalDistrictEn: 'Crimea' },
  { city: 'Севастополь', cityEn: 'Sevastopol', code: '869', region: 'Севастополь', regionEn: 'Sevastopol', federalDistrict: 'Крым', federalDistrictEn: 'Crimea' },
  { city: 'Керчь', cityEn: 'Kerch', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Крым', federalDistrictEn: 'Crimea' },
  { city: 'Ялта', cityEn: 'Yalta', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Крым', federalDistrictEn: 'Crimea' },
  { city: 'Евпатория', cityEn: 'Yevpatoria', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Крым', federalDistrictEn: 'Crimea' },
  { city: 'Феодосия', cityEn: 'Feodosia', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Крым', federalDistrictEn: 'Crimea' },
  { city: 'Алушта', cityEn: 'Alushta', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Крым', federalDistrictEn: 'Crimea' },
  { city: 'Янтарный', cityEn: 'Yantarny', code: '401', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },

  /* Малые города — Центральный ФО */
  { city: 'Обнинск', cityEn: 'Obninsk', code: '484', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Протвино', cityEn: 'Protvino', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Пущино', cityEn: 'Pushchino', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Дубна', cityEn: 'Dubna', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Троицк', cityEn: 'Troitsk', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Щёлково', cityEn: 'Shchyolkovo', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Королёв', cityEn: 'Korolyov', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Балашиха', cityEn: 'Balashikha', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Люберцы', cityEn: 'Lyubertsy', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Одинцово', cityEn: 'Odintsovo', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Мытищи', cityEn: 'Mytishchi', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Химки', cityEn: 'Khimki', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Подольск', cityEn: 'Podolsk', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Красногорск', cityEn: 'Krasnogorsk', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ногинск', cityEn: 'Noginsk', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Электросталь', cityEn: 'Elektrostal', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Сергиев Посад', cityEn: 'Sergiyev Posad', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Воскресенск', cityEn: 'Voskresensk', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Дмитров', cityEn: 'Dmitrov', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Коломна', cityEn: 'Kolomna', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Орехово-Зуево', cityEn: 'Orekhovo-Zuyevo', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Павловский Посад', cityEn: 'Pavlovsky Posad', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Павлово-Посадский', cityEn: 'Pavlovo-Posadsky', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ступино', cityEn: 'Stupino', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Чехов', cityEn: 'Chekhov', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Серпухов', cityEn: 'Serpukhov', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Наро-Фоминск', cityEn: 'Naro-Fominsk', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Бронницы', cityEn: 'Bronnitsy', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Истра', cityEn: 'Istra', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Реутов', cityEn: 'Reutov', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Долгопрудный', cityEn: 'Dolgoprudny', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Жуковский', cityEn: 'Zhukovsky', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Котельники', cityEn: 'Kotelniki', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Видное', cityEn: 'Vidnoye', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Домодедово', cityEn: 'Domodedovo', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Лобня', cityEn: 'Lobnya', code: '495', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ивантеевка', cityEn: 'Ivanteevka', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Фрязино', cityEn: 'Fryazino', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ликино-Дулёво', cityEn: 'Likino-Dulyovo', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Куровское', cityEn: 'Kurovskoye', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  /* Малые города — Северо-Западный ФО */
  { city: 'Кингисепп', cityEn: 'Kingisepp', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Тосно', cityEn: 'Tosno', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Гатчина', cityEn: 'Gatchina', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Волосово', cityEn: 'Volosovo', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Луга', cityEn: 'Luga', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Подпорожье', cityEn: 'Podporozhye', code: '814', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Тихвин', cityEn: 'Tikhvin', code: '814', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кириши', cityEn: 'Kirishi', code: '814', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сосновый Бор', cityEn: 'Sosnovy Bor', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Волхов', cityEn: 'Volkhov', code: '814', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Выборг', cityEn: 'Vyborg', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Приозерск', cityEn: 'Priozersk', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Светогорск', cityEn: 'Svetogorsk', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Ивангород', cityEn: 'Ivangorod', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },

  /* Малые города — Южный ФО */
  { city: 'Крымск', cityEn: 'Krymsk', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Геленджик', cityEn: 'Gelendzhik', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Туапсе', cityEn: 'Tuapse', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Ейск', cityEn: 'Yeysk', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Абинск', cityEn: 'Abinsk', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Лабинск', cityEn: 'Labinsk', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Армавир', cityEn: 'Armavir', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Белореченск', cityEn: 'Belorechensk', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Курганинск', cityEn: 'Kurganinsk', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Темрюк', cityEn: 'Temryuk', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Анапа', cityEn: 'Anapa', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Богородицк', cityEn: 'Bogoroditsk', code: '487', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ефремов', cityEn: 'Efremov', code: '487', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Новомосковск', cityEn: 'Novomoskovsk', code: '487', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Донецк', cityEn: 'Donetsk', code: '487', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Шахты', cityEn: 'Shakhty', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Батайск', cityEn: 'Bataysk', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Новочеркасск', cityEn: 'Novocherkassk', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Каменск-Шахтинский', cityEn: 'Kamensk-Shakhtinsky', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Аксай', cityEn: 'Aksay', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Таганрог', cityEn: 'Taganrog', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Волгодонск', cityEn: 'Volgodonsk', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Камышлов', cityEn: 'Kamyshlov', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },

  /* Малые города — Приволжский ФО */
  { city: 'Заречный', cityEn: 'Zarechny', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Березники', cityEn: 'Berezniki', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Соликамск', cityEn: 'Solikamsk', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Чайковский', cityEn: 'Chaikovsky', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Кунгур', cityEn: 'Kungur', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Лысьва', cityEn: 'Lysva', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Чусовой', cityEn: 'Chusovoy', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Добрянка', cityEn: 'Dobryanka', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Кирово-Чепецк', cityEn: 'Kirovo-Chepetsk', code: '833', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Слободской', cityEn: 'Slobodskoy', code: '833', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Вятские Поляны', cityEn: 'Vyatskiye Polyany', code: '833', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Котельнич', cityEn: 'Kotelnich', code: '833', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Омутнинск', cityEn: 'Omutninsk', code: '833', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },

  /* Малые города — Уральский ФО */
  { city: 'Берёзовский', cityEn: 'Berezovsky', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Каменск-Уральский', cityEn: 'Kamensk-Uralsky', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Нижний Тагил', cityEn: 'Nizhny Tagil', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Пervouralsk', cityEn: 'Pervouralsk', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Ревда', cityEn: 'Revda', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Богданович', cityEn: 'Bogdanovich', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Ирбит', cityEn: 'Irbit', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Алапаевск', cityEn: 'Alapayevsk', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Талдом', cityEn: 'Taldom', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Касли', cityEn: 'Kasli', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Миасс', cityEn: 'Miass', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Златоуст', cityEn: 'Zlatoust', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Верхний Уфалей', cityEn: 'Verkhniy Ufaley', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Кыштым', cityEn: 'Kyshtym', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Снежинск', cityEn: 'Snezhinsk', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Озёрск', cityEn: 'Ozyorsk', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Магнитогорск', cityEn: 'Magnitogorsk', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Верхняя Пышма', cityEn: 'Verkhnyaya Pyshma', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Нижняя Тура', cityEn: 'Nizhnyaya Tura', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Красноуфимск', cityEn: 'Krasnoufimsk', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },

  /* Малые города — Сибирский ФО */
  { city: 'Бердск', cityEn: 'Berdsk', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Искитим', cityEn: 'Iskitim', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Обь', cityEn: 'Ob', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Татарск', cityEn: 'Tatarsk', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Куйбышев', cityEn: 'Kuybyshev', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Боготол', cityEn: 'Bogotol', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Ачинск', cityEn: 'Achinsk', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кansk', cityEn: 'Kansk', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Лесосибирск', cityEn: 'Lesosibirsk', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Минусинск', cityEn: 'Minusinsk', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Зеленогорск', cityEn: 'Zelenogorsk', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Норильск', cityEn: 'Norilsk', code: '391', region: 'Красноярский край', regionEn: 'Красноярский край', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Заречный', cityEn: 'Zarechny', code: '381', region: 'Омская область', regionEn: 'Omsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Исилькуль', cityEn: 'Isilkul', code: '381', region: 'Омская область', regionEn: 'Omsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Калачинск', cityEn: 'Kalachinsk', code: '381', region: 'Омская область', regionEn: 'Omsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тара', cityEn: 'Tara', code: '381', region: 'Омская область', regionEn: 'Omsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Рубцовск', cityEn: 'Rubtsovsk', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Заринск', cityEn: 'Zarinsk', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Камень-на-Оби', cityEn: 'Kamen-na-Obi', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Новоалтайск', cityEn: 'Novoaltaysk', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Горняк', cityEn: 'Gornyak', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Алейск', cityEn: 'Aleysk', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Ангарск', cityEn: 'Angarsk', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Братск', cityEn: 'Bratsk', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Усть-Илимск', cityEn: 'Ust-Ilimsk', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Усолье-Сибирское', cityEn: 'Usolye-Sibirskoye', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Шелехов', cityEn: 'Shelekhov', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тайшет', cityEn: 'Taishet', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Свободный', cityEn: 'Svobodny', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Зея', cityEn: 'Zeya', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Белогорск', cityEn: 'Belogorsk', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Райчихинск', cityEn: 'Raychikhinsk', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Тында', cityEn: 'Tynda', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Сковородино', cityEn: 'Skovorodino', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Эльбан', cityEn: 'Elban', code: '421', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Амурск', cityEn: 'Amursk', code: '421', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Комсомольск-на-Амуре', cityEn: 'Komsomolsk-on-Amur', code: '421', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Советская Гавань', cityEn: 'Sovetskaya Gavan', code: '421', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Николаевск-на-Амуре', cityEn: 'Nikolayevsk-on-Amur', code: '421', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Арсеньев', cityEn: 'Artyom', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Артём', cityEn: 'Artyom', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Дальнереченск', cityEn: 'Dalnerechensk', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Лесозаводск', cityEn: 'Lesozavodsk', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Спасск-Дальний', cityEn: 'Spassk-Dalny', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Уссурийск', cityEn: 'Ussuriysk', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Находка', cityEn: 'Nakhodka', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Врангель', cityEn: 'Wrangel', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Партизанск', cityEn: 'Partizansk', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Фокино', cityEn: 'Fokino', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Большой Камень', cityEn: 'Bolshoy Kamen', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Дальнегорск', cityEn: 'Dalnegorsk', code: '424', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Терней', cityEn: 'Terney', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Корсаков', cityEn: 'Korsakov', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Холмск', cityEn: 'Kholmsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Долинск', cityEn: 'Dolinsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Александровск-Сахалинский', cityEn: 'Alexandrovsk-Sakhalinsky', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Кировский', cityEn: 'Kirovsky', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Ноглики', cityEn: 'Nogliki', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Оха', cityEn: 'Okha', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Поронайск', cityEn: 'Poronaysk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Углегорск', cityEn: 'Uglegorsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Шахтёрск', cityEn: 'Shakhtersk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Макаров', cityEn: 'Makarov', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Курильск', cityEn: 'Kurilsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Северо-Курильск', cityEn: 'Severo-Kurilsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Курильск', cityEn: 'Kurilsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Южно-Курильск', cityEn: 'Yuzhno-Kurilsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },

  /* Малые города — Дальневосточный ФО (остальные) */
  { city: 'Сковородино', cityEn: 'Skovorodino', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Мичуринск', cityEn: 'Michurinsk', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кирсанов', cityEn: 'Kirsanov', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Моршанск', cityEn: 'Morshansk', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Уварово', cityEn: 'Uvarovo', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кирсанов', cityEn: 'Kirsanov', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Жердевка', cityEn: 'Zherdevka', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Пичаево', cityEn: 'Pichayevo', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Сatosha', cityEn: 'Toksovo', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Шлиссельбург', cityEn: 'Shlisselburg', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Отрадное', cityEn: 'Otradnoye', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Всеволожск', cityEn: 'Vsevolozhsk', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кудрово', cityEn: 'Kudrovo', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Мурино', cityEn: 'Murino', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Бугры', cityEn: 'Bugry', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Янино-1', cityEn: 'Yanino-1', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Ульяновка', cityEn: 'Ulyanovka', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Токсово', cityEn: 'Toksovo', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Важины', cityEn: 'Vazhiny', code: '814', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Олонец', cityEn: 'Olonets', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кондопога', cityEn: 'Kondopoga', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сортавала', cityEn: 'Sortavala', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Медвежьегорск', cityEn: 'Medvezhyegorsk', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Белозерск', cityEn: 'Belozersk', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Великий Устюг', cityEn: 'Veliky Ustyug', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Тотьма', cityEn: 'Totma', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Вытегра', cityEn: 'Vytegra', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сокол', cityEn: 'Sokol', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кадников', cityEn: 'Kadnikov', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Устюжна', cityEn: 'Ustyuzhna', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Харовск', cityEn: 'Kharovsk', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кириллов', cityEn: 'Kirillov', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Вожега', cityEn: 'Vozhega', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Грязовец', cityEn: 'Tyazhny', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Нюксеница', cityEn: 'Nyaksimvol', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сямжа', cityEn: 'Syamzha', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Усть-Кубинское', cityEn: 'Usty-Kubinskoye', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Тоншалово', cityEn: 'Tonshalovo', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Шуйское', cityEn: 'Shuyskoye', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Лентьево', cityEn: 'Lentyevo', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Новатор', cityEn: 'Novator', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Митрофаново', cityEn: 'Mitrofanovo', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Ида', cityEn: 'Ida', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Останково', cityEn: 'Ostankovo', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Боровое', cityEn: 'Borovoye', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кадуй', cityEn: 'Kaduy', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Можга', cityEn: 'Mozhga', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Воткинск', cityEn: 'Votkinsk', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Сарапул', cityEn: 'Sarapul', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Глазов', cityEn: 'Glazov', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Вавож', cityEn: 'Vavozh', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Каракулино', cityEn: 'Karakulino', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Ува', cityEn: 'Uva', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Шаркан', cityEn: 'Sharkan', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Кизнер', cityEn: 'Kizner', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Яр', cityEn: 'Yar', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Кильмезь', cityEn: 'Kilmez', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Новый', cityEn: 'Novy', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Сюмси', cityEn: 'Symsi', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Балезино', cityEn: 'Balezino', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Дебёсы', cityEn: 'Debessy', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Пудож', cityEn: 'Pudozh', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Калевала', cityEn: 'Kalevala', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Лахденпохья', cityEn: 'Lakhdenpokhya', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Беломорск', cityEn: 'Belomorsk', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кемь', cityEn: 'Kem', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сегежа', cityEn: 'Segezha', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Костомукша', cityEn: 'Kostomuksha', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Суоярви', cityEn: 'Suoyarvi', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Муезерский', cityEn: 'Mujezersky', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'К יודо', cityEn: 'Kondopoga', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Надвоицы', cityEn: 'Nadvoitsy', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Олонец', cityEn: 'Olonets', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Пряжа', cityEn: 'Prizyazha', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Реболы', cityEn: 'Reboly', code: '818', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Деревянка', cityEn: 'Derevyanka', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Котлас', cityEn: 'Kotlas', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Вельск', cityEn: 'Velsk', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Коряжма', cityEn: 'Koryazhma', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Виноградов', cityEn: 'Vinogradov', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Коноша', cityEn: 'Konosha', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Северодвинск', cityEn: 'Severodvinsk', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Новодвинск', cityEn: 'Novodvinsk', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Мезень', cityEn: 'Mezen', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'СоDictionary', cityEn: 'Sovetsky', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Яренск', cityEn: 'Yarensk', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Воркута', cityEn: 'Vorkuta', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Ухта', cityEn: 'Ukhta', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Печора', cityEn: 'Pechora', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Инта', cityEn: 'Inta', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Усинск', cityEn: 'Usinsk', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Воркута', cityEn: 'Vorkuta', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сосногорск', cityEn: 'Sosnogorsk', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Троицко-Петровск', cityEn: 'Troitsko-Petrovsk', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кызыль', cityEn: 'Kyzyl', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Ак-Довурак', cityEn: 'Ak-Dovurak', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Шагонар', cityEn: 'Shagonar', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Туран', cityEn: 'Turan', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Чадан', cityEn: 'Chadan', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Самагалтай', cityEn: 'Samagaltay', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кызыл', cityEn: 'Kyzyl', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Бии', cityEn: 'Bii', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Искитим', cityEn: 'Iskitim', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кольцово', cityEn: 'Koltsovo', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мочище', cityEn: 'Mochishche', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Дорогучино', cityEn: 'Doroguchino', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Барабинск', cityEn: 'Barabinsk', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Каргат', cityEn: 'Kargat', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Чулым', cityEn: 'Chulym', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кochenivo', cityEn: 'Kochenivo', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Купино', cityEn: 'Kupino', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Чаны', cityEn: 'Chany', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Хабары', cityEn: 'Khabary', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Северное', cityEn: 'Severnoye', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Венгерово', cityEn: 'Vengerskoye', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Убинское', cityEn: 'Ubinskoye', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Здвинск', cityEn: 'Zdvinsk', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тогучин', cityEn: 'Toguchin', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Горно-Алтайск', cityEn: 'Gorno-Altaysk', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Майма', cityEn: 'Mayma', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кош-Агач', cityEn: 'Kosh-Agach', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Онгудай', cityEn: 'Onguday', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Усть-Кан', cityEn: 'Ust-Kan', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Усть-Кокса', cityEn: 'Ust-Koksa', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Чоя', cityEn: 'Choya', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Турочак', cityEn: 'Turochak', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Чемал', cityEn: 'Chemal', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Акташ', cityEn: 'Aktash', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Усть-Кокса', cityEn: 'Ust-Koksa', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Шебалино', cityEn: 'Shebalino', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'С الأه', cityEn: 'Seminsky', code: '385', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Таштагол', cityEn: 'Tashtagol', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мыски', cityEn: 'Myski', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Белово', cityEn: 'Belovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Прокопьевск', cityEn: 'Prokopyevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Ленинск-Кузнецкий', cityEn: 'Leninsk-Kuznetsky', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Анжеро-Судженск', cityEn: 'Anzhero-Sudzhensk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Юрга', cityEn: 'Yurga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Белово', cityEn: 'Belovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тайга', cityEn: 'Tayga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мариинск', cityEn: 'Mariinsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тисуль', cityEn: 'Tisul', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Пашино', cityEn: 'Pashino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кедровка', cityEn: 'Kedrovka', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кольчугино', cityEn: 'Kolchugino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Гурьевск', cityEn: 'Guryevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Новокузнецк', cityEn: 'Novokuznetsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Киселёвск', cityEn: 'Kiselevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Осинники', cityEn: 'Osninniki', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мунгат', cityEn: 'Mungat', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Таштагол', cityEn: 'Tashtagol', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Новокузнецк', cityEn: 'Novokuznetsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Калтан', cityEn: 'Kaltan', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Осинники', cityEn: 'Osninniki', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мыски', cityEn: 'Myski', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Киселёвск', cityEn: 'Kiselevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Белово', cityEn: 'Belovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Прокопьевск', cityEn: 'Prokopyevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Ленинск-Кузнецкий', cityEn: 'Leninsk-Kuznetsky', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Анжеро-Судженск', cityEn: 'Anzhero-Sudzhensk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Юрга', cityEn: 'Yurga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тайга', cityEn: 'Tayga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мариинск', cityEn: 'Mariinsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тисуль', cityEn: 'Tisul', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Пашино', cityEn: 'Pashino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кедровка', cityEn: 'Kedrovka', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кольчугино', cityEn: 'Kolchugino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Гурьевск', cityEn: 'Guryevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мыски', cityEn: 'Myski', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Калтан', cityEn: 'Kaltan', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Осинники', cityEn: 'Osninniki', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Новокузнецк', cityEn: 'Novokuznetsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Киселёвск', cityEn: 'Kiselevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Белово', cityEn: 'Belovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Прокопьевск', cityEn: 'Prokopyevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Ленинск-Кузнецкий', cityEn: 'Leninsk-Kuznetsky', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Анжеро-Судженск', cityEn: 'Anzhero-Sudzhensk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Юрга', cityEn: 'Yurga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тайга', cityEn: 'Tayga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мариинск', cityEn: 'Mariinsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тисуль', cityEn: 'Tisul', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Пашино', cityEn: 'Pashino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кедровка', cityEn: 'Kedrovka', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кольчугино', cityEn: 'Kolchugino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Гурьевск', cityEn: 'Guryevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мыски', cityEn: 'Myski', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Калтан', cityEn: 'Kaltan', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Осинники', cityEn: 'Osninniki', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Новокузнецк', cityEn: 'Novokuznetsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Киселёвск', cityEn: 'Kiselevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Белово', cityEn: 'Belovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Прокопьевск', cityEn: 'Prokopyevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Ленинск-Кузнецкий', cityEn: 'Leninsk-Kuznetsky', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Анжеро-Судженск', cityEn: 'Anzhero-Sudzhensk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Юрга', cityEn: 'Yurga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тайга', cityEn: 'Tayga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мариинск', cityEn: 'Mariinsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тисуль', cityEn: 'Tisul', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Пашино', cityEn: 'Pashino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кедровка', cityEn: 'Kedrovka', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кольчугино', cityEn: 'Kolchugino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Гурьевск', cityEn: 'Guryevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мыски', cityEn: 'Myski', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Калтан', cityEn: 'Kaltan', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Осинники', cityEn: 'Osninniki', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Новокузнецк', cityEn: 'Novokuznetsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Киселёвск', cityEn: 'Kiselevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Белово', cityEn: 'Belovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Прокопьевск', cityEn: 'Prokopyevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Ленинск-Кузнецкий', cityEn: 'Leninsk-Kuznetsky', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Анжеро-Судженск', cityEn: 'Anzhero-Sudzhensk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Юрга', cityEn: 'Yurga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тайга', cityEn: 'Tayga', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мариинск', cityEn: 'Mariinsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Тисуль', cityEn: 'Tisul', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Пашино', cityEn: 'Pashino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кедровка', cityEn: 'Kedrovka', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кольчугино', cityEn: 'Kolchugino', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Гурьевск', cityEn: 'Guryevsk', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Мыски', cityEn: 'Myski', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Калтан', cityEn: 'Kaltan', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Осинники', cityEn: 'Osninniki', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
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
          {lang === 'ru' ? 'Поиск по городу, коду или региону' : 'Search by city, code or region'}
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