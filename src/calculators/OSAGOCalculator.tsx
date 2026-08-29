/**
 * Калькулятор ОСАГО
 *
 * Формула: БТ × КТ × КБМ × КВС × КО × КМ × КС × КН
 *
 * Функционал:
 * - Владелец ТС: физлицо / юрлицо
 * - Тип ТС: легковые / грузовые / автобусы / мотоциклы / прицепы
 * - Иностранные номера
 * - Регион (85 регионов)
 * - Мощность двигателя
 * - Период использования
 * - Ограничение по водителям + список водителей
 * - КБМ (класс)
 * - Кнопка «Рассчитать»
 */
import { useState, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import { formatCurrency } from '../lib/format';

type OwnerType = 'individual' | 'legal';
type VehicleType = 'B' | 'BE' | 'C' | 'CE' | 'D' | 'DE' | 'M' | 'trailer' | 'B_legal' | 'C_legal' | 'D_legal';

interface VehicleTypeInfo {
  code: VehicleType;
  labelRu: string;
  labelEn: string;
}

const VEHICLE_TYPES: VehicleTypeInfo[] = [
  { code: 'B', labelRu: 'Легковые автомобили (B, BE) физ. лиц', labelEn: 'Passenger cars (B, BE) individuals' },
  { code: 'C', labelRu: 'Грузовые автомобили (C, CE) физ. лиц', labelEn: 'Trucks (C, CE) individuals' },
  { code: 'D', labelRu: 'Автобусы (D, DE) физ. лиц', labelEn: 'Buses (D, DE) individuals' },
  { code: 'M', labelRu: 'Мотоциклы и мопеды (M) физ. лиц', labelEn: 'Motorcycles and mopeds (M) individuals' },
  { code: 'trailer', labelRu: 'Прицепы к легковым автомобилям', labelEn: 'Trailers to passenger cars' },
  { code: 'B_legal', labelRu: 'Легковые автомобили (B, BE) юр. лиц', labelEn: 'Passenger cars (B, BE) legal entities' },
  { code: 'C_legal', labelRu: 'Грузовые автомобили (C, CE) юр. лиц', labelEn: 'Trucks (C, CE) legal entities' },
  { code: 'D_legal', labelRu: 'Автобусы (D, DE) юр. лиц', labelEn: 'Buses (D, DE) legal entities' },
];

interface DriverInfo {
  age: string;
  experience: string;
}

interface Region {
  id: string;
  nameRu: string;
  nameEn: string;
  kt: number;
}

const REGIONS: Region[] = [
  /* Города федерального значения */
  { id: '77', nameRu: 'Москва', nameEn: 'Moscow', kt: 1.80 },
  { id: '78', nameRu: 'Санкт-Петербург', nameEn: 'Saint Petersburg', kt: 1.72 },
  { id: '92', nameRu: 'Севастополь', nameEn: 'Sevastopol', kt: 1.36 },
  /* Республики */
  { id: '01', nameRu: 'Республика Адыгея', nameEn: 'Republic of Adygea', kt: 1.36 },
  { id: '02', nameRu: 'Республика Башкортостан', nameEn: 'Republic of Bashkortostan', kt: 1.36 },
  { id: '03', nameRu: 'РеспуБурятия', nameEn: 'Republic of Buryatia', kt: 1.20 },
  { id: '04', nameRu: 'Республика Алтай', nameEn: 'Altai Republic', kt: 1.12 },
  { id: '05', nameRu: 'Республика Дагестан', nameEn: 'Republic of Dagestan', kt: 1.60 },
  { id: '06', nameRu: 'Республика Ингушетия', nameEn: 'Republic of Ingushetia', kt: 1.72 },
  { id: '07', nameRu: 'Кабардино-Балкарская Республика', nameEn: 'Kabardino-Balkarian Republic', kt: 1.36 },
  { id: '08', nameRu: 'Республика Калмыкия', nameEn: 'Republic of Kalmykia', kt: 1.28 },
  { id: '09', nameRu: 'Карачаево-Черкесская Республика', nameEn: 'Karachay-Cherkess Republic', kt: 1.32 },
  { id: '10', nameRu: 'Республика Карелия', nameEn: 'Republic of Karelia', kt: 1.24 },
  { id: '11', nameRu: 'Республика Коми', nameEn: 'Komi Republic', kt: 1.24 },
  { id: '12', nameRu: 'Республика Марий Эл', nameEn: 'Mari El Republic', kt: 1.28 },
  { id: '13', nameRu: 'Республика Мордовия', nameEn: 'Mordovia Republic', kt: 1.28 },
  { id: '14', nameRu: 'Республика Саха (Якутия)', nameEn: 'Sakha Republic (Yakutia)', kt: 1.16 },
  { id: '15', nameRu: 'Республика Северная Осетия — Алания', nameEn: 'North Ossetia-Alania Republic', kt: 1.36 },
  { id: '16', nameRu: 'Республика Татарстан', nameEn: 'Republic of Tatarstan', kt: 1.44 },
  { id: '17', nameRu: 'Республика Тыва', nameEn: 'Tuva Republic', kt: 1.12 },
  { id: '18', nameRu: 'Удмуртская Республика', nameEn: 'Udmurt Republic', kt: 1.36 },
  { id: '19', nameRu: 'Республика Хакасия', nameEn: 'Khakassia Republic', kt: 1.20 },
  { id: '20', nameRu: 'Чеченская Республика', nameEn: 'Chechen Republic', kt: 1.72 },
  { id: '21', nameRu: 'Чувашская Республика', nameEn: 'Chuvash Republic', kt: 1.28 },
  /* Края */
  { id: '22', nameRu: 'Алтайский край', nameEn: 'Altai Krai', kt: 1.20 },
  { id: '23', nameRu: 'Краснодарский край', nameEn: 'Krasnodar Krai', kt: 1.40 },
  { id: '24', nameRu: 'Красноярский край', nameEn: 'Krasnoyarsk Krai', kt: 1.36 },
  { id: '25', nameRu: 'Приморский край', nameEn: 'Primorsky Krai', kt: 1.24 },
  { id: '26', nameRu: 'Ставропольский край', nameEn: 'Stavropol Krai', kt: 1.32 },
  { id: '27', nameRu: 'Хабаровский край', nameEn: 'Khabarovsk Krai', kt: 1.24 },
  /* Области */
  { id: '28', nameRu: 'Амурская область', nameEn: 'Amur Oblast', kt: 1.20 },
  { id: '29', nameRu: 'Архангельская область', nameEn: 'Arkhangelsk Oblast', kt: 1.20 },
  { id: '30', nameRu: 'Астраханская область', nameEn: 'Astrakhan Oblast', kt: 1.32 },
  { id: '31', nameRu: 'Белгородская область', nameEn: 'Belgorod Oblast', kt: 1.32 },
  { id: '32', nameRu: 'Брянская область', nameEn: 'Bryansk Oblast', kt: 1.28 },
  { id: '33', nameRu: 'Владимирская область', nameEn: 'Vladimir Oblast', kt: 1.28 },
  { id: '34', nameRu: 'Волгоградская область', nameEn: 'Volgograd Oblast', kt: 1.36 },
  { id: '35', nameRu: 'Вологодская область', nameEn: 'Vologda Oblast', kt: 1.20 },
  { id: '36', nameRu: 'Воронежская область', nameEn: 'Voronezh Oblast', kt: 1.36 },
  { id: '37', nameRu: 'Ивановская область', nameEn: 'Ivanovo Oblast', kt: 1.24 },
  { id: '38', nameRu: 'Иркутская область', nameEn: 'Irkutsk Oblast', kt: 1.28 },
  { id: '39', nameRu: 'Калининградская область', nameEn: 'Kaliningrad Oblast', kt: 1.36 },
  { id: '40', nameRu: 'Калужская область', nameEn: 'Kaluga Oblast', kt: 1.28 },
  { id: '41', nameRu: 'Камчатский край', nameEn: 'Kamchatka Krai', kt: 1.16 },
  { id: '42', nameRu: 'Кемеровская область', nameEn: 'Kemerovo Oblast', kt: 1.28 },
  { id: '43', nameRu: 'Кировская область', nameEn: 'Kirov Oblast', kt: 1.24 },
  { id: '44', nameRu: 'Костромская область', nameEn: 'Kostroma Oblast', kt: 1.20 },
  { id: '45', nameRu: 'Курганская область', nameEn: 'Kurgan Oblast', kt: 1.24 },
  { id: '46', nameRu: 'Курская область', nameEn: 'Kursk Oblast', kt: 1.28 },
  { id: '47', nameRu: 'Ленинградская область', nameEn: 'Leningrad Oblast', kt: 1.32 },
  { id: '48', nameRu: 'Липецкая область', nameEn: 'Lipetsk Oblast', kt: 1.28 },
  { id: '49', nameRu: 'Магаданская область', nameEn: 'Magadan Oblast', kt: 1.12 },
  { id: '50', nameRu: 'Московская область', nameEn: 'Moscow Oblast', kt: 1.56 },
  { id: '51', nameRu: 'Мурманская область', nameEn: 'Murmansk Oblast', kt: 1.20 },
  { id: '52', nameRu: 'Нижегородская область', nameEn: 'Nizhny Novgorod Oblast', kt: 1.44 },
  { id: '53', nameRu: 'Новгородская область', nameEn: 'Novgorod Oblast', kt: 1.20 },
  { id: '54', nameRu: 'Новосибирская область', nameEn: 'Novosibirsk Oblast', kt: 1.40 },
  { id: '55', nameRu: 'Омская область', nameEn: 'Omsk Oblast', kt: 1.28 },
  { id: '56', nameRu: 'Оренбургская область', nameEn: 'Orenburg Oblast', kt: 1.28 },
  { id: '57', nameRu: 'Орловская область', nameEn: 'Oryol Oblast', kt: 1.24 },
  { id: '58', nameRu: 'Пензенская область', nameEn: 'Penza Oblast', kt: 1.28 },
  { id: '59', nameRu: 'Пермский край', nameEn: 'Perm Krai', kt: 1.28 },
  { id: '60', nameRu: 'Псковская область', nameEn: 'Pskov Oblast', kt: 1.20 },
  { id: '61', nameRu: 'Ростовская область', nameEn: 'Rostov Oblast', kt: 1.40 },
  { id: '62', nameRu: 'Рязанская область', nameEn: 'Ryazan Oblast', kt: 1.32 },
  { id: '63', nameRu: 'Самарская область', nameEn: 'Samara Oblast', kt: 1.40 },
  { id: '64', nameRu: 'Саратовская область', nameEn: 'Saratov Oblast', kt: 1.36 },
  { id: '65', nameRu: 'Сахалинская область', nameEn: 'Sakhalin Oblast', kt: 1.16 },
  { id: '66', nameRu: 'Свердловская область', nameEn: 'Sverdlovsk Oblast', kt: 1.36 },
  { id: '67', nameRu: 'Смоленская область', nameEn: 'Smolensk Oblast', kt: 1.24 },
  { id: '68', nameRu: 'Тамбовская область', nameEn: 'Tambov Oblast', kt: 1.28 },
  { id: '69', nameRu: 'Тверская область', nameEn: 'Tver Oblast', kt: 1.24 },
  { id: '70', nameRu: 'Томская область', nameEn: 'Tomsk Oblast', kt: 1.24 },
  { id: '71', nameRu: 'Тульская область', nameEn: 'Tula Oblast', kt: 1.32 },
  { id: '72', nameRu: 'Тюменская область', nameEn: 'Tyumen Oblast', kt: 1.36 },
  { id: '73', nameRu: 'Ульяновская область', nameEn: 'Ulyanovsk Oblast', kt: 1.28 },
  { id: '74', nameRu: 'Челябинская область', nameEn: 'Chelyabinsk Oblast', kt: 1.36 },
  { id: '75', nameRu: 'Забайкальский край', nameEn: 'Zabaykalsky Krai', kt: 1.16 },
  { id: '76', nameRu: 'Ярославская область', nameEn: 'Yaroslavl Oblast', kt: 1.36 },
  /* Автономная область */
  { id: '79', nameRu: 'Еврейская автономная область', nameEn: 'Jewish Autonomous Oblast', kt: 1.16 },
  /* Автономные округа */
  { id: '83', nameRu: 'Ненецкий автономный округ', nameEn: 'Nenets AO', kt: 1.12 },
  { id: '86', nameRu: 'Ханты-Мансийский автономный округ — Югра', nameEn: 'Khanty-Mansi AO', kt: 1.28 },
  { id: '80', nameRu: 'Чукотский автономный округ', nameEn: 'Chukotka AO', kt: 1.12 },
  { id: '81', nameRu: 'Ямало-Ненецкий автономный округ', nameEn: 'Yamalo-Nenets AO', kt: 1.28 },
  /* Другой */
  { id: '99', nameRu: 'Другой регион', nameEn: 'Other region', kt: 1.24 },
];

const KBM_TABLE: { class: number; coefficient: number }[] = [
  { class: -2, coefficient: 2.45 },
  { class: -1, coefficient: 2.30 },
  { class: 0, coefficient: 2.25 },
  { class: 1, coefficient: 1.55 },
  { class: 2, coefficient: 1.40 },
  { class: 3, coefficient: 1.00 },
  { class: 4, coefficient: 0.95 },
  { class: 5, coefficient: 0.90 },
  { class: 6, coefficient: 0.85 },
  { class: 7, coefficient: 0.80 },
  { class: 8, coefficient: 0.75 },
  { class: 9, coefficient: 0.70 },
  { class: 10, coefficient: 0.65 },
  { class: 11, coefficient: 0.60 },
  { class: 12, coefficient: 0.55 },
  { class: 13, coefficient: 0.50 },
];

function getKVS(age: number, exp: number): number {
  const table: [number, number, number][] = [
    [18, 0, 2.27], [18, 1, 1.87], [18, 2, 1.65],
    [22, 0, 1.87], [22, 1, 1.65], [22, 2, 1.55],
    [24, 0, 1.65], [24, 1, 1.55], [24, 2, 1.45],
    [25, 0, 1.55], [25, 1, 1.45], [25, 2, 1.35],
    [30, 0, 1.45], [30, 1, 1.35], [30, 2, 1.25],
    [35, 0, 1.35], [35, 1, 1.25], [35, 2, 1.15],
    [40, 0, 1.25], [40, 1, 1.15], [40, 2, 1.05],
    [45, 0, 1.15], [45, 1, 1.05], [45, 2, 1.00],
    [50, 0, 1.05], [50, 1, 1.00], [50, 2, 0.95],
    [60, 0, 1.00], [60, 1, 0.95], [60, 2, 0.90],
  ];
  let result = 2.27;
  for (const [minAge, minExp, coeff] of table) {
    if (age >= minAge && exp >= minExp) result = coeff;
  }
  return result;
}

function getKM(hp: number): number {
  if (hp <= 50) return 0.63;
  if (hp <= 70) return 0.80;
  if (hp <= 100) return 1.00;
  if (hp <= 120) return 1.14;
  if (hp <= 150) return 1.33;
  return 1.53;
}

function getKO(limited: boolean): number {
  return limited ? 1.00 : 1.94;
}

function getKS(period: string): number {
  switch (period) {
    case '3': return 0.27;
    case '4': return 0.36;
    case '5': return 0.45;
    case '6': return 0.54;
    case '7': return 0.63;
    case '8': return 0.72;
    case '9': return 0.81;
    case '10': return 0.90;
    case '11': return 0.95;
    default: return 1.00;
  }
}

export default function OSAGOCalculator() {
  const [ownerType, setOwnerType] = useState<OwnerType>('individual');
  const [vehicleType, setVehicleType] = useState<VehicleType>('B');
  const [isForeign, setIsForeign] = useState(false);
  const [regionIndex, setRegionIndex] = useState(0);
  const [horsepower, setHorsepower] = useState('');
  const [period, setPeriod] = useState('12');
  const [limitedDrivers, setLimitedDrivers] = useState(true);
  const [drivers, setDrivers] = useState<DriverInfo[]>([{ age: '', experience: '' }]);
  const [kbmIndex, setKbmIndex] = useState(6);
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculate> | null>(null);
  const lang = useLanguage();

  const addDriver = () => {
    setDrivers([...drivers, { age: '', experience: '' }]);
  };

  const removeDriver = (index: number) => {
    if (drivers.length > 1) {
      setDrivers(drivers.filter((_, i) => i !== index));
    }
  };

  const updateDriver = (index: number, field: keyof DriverInfo, value: string) => {
    const newDrivers = [...drivers];
    newDrivers[index][field] = value;
    setDrivers(newDrivers);
  };

  const calculate = useCallback(() => {
    const hp = parseInt(horsepower);
    if (!hp || hp <= 0) return null;

    const BT = 4942;
    const KT = REGIONS[regionIndex].kt;
    const KBM = KBM_TABLE[kbmIndex].coefficient;
    const KM = getKM(hp);
    const KO = getKO(limitedDrivers);
    const KS = getKS(period);
    const KN = 1.00;

    let KVS = 1.00;
    if (limitedDrivers) {
      /* Без ограничений — худший случай для любого водителя */
      KVS = 1.94;
    } else if (drivers.length > 0) {
      /* Ограниченный список — берём худший (максимальный) КВС */
      let maxKVS = 0;
      for (const driver of drivers) {
        const age = parseInt(driver.age);
        const exp = parseInt(driver.experience);
        if (age && exp >= 0) {
          const kvs = getKVS(age, exp);
          if (kvs > maxKVS) maxKVS = kvs;
        }
      }
      KVS = maxKVS || 1.94;
    }

    const total = Math.round(BT * KT * KBM * KVS * KO * KM * KS * KN);

    return {
      BT, KT, KBM, KVS, KO, KM, KS, KN, total,
      region: REGIONS[regionIndex],
      kbm: KBM_TABLE[kbmIndex],
    };
  }, [horsepower, regionIndex, kbmIndex, period, limitedDrivers, drivers]);

  const handleCalculate = () => {
    const res = calculate();
    setResult(res);
    setCalculated(true);
  };

  const handleReset = () => {
    setOwnerType('individual');
    setVehicleType('B');
    setIsForeign(false);
    setRegionIndex(0);
    setHorsepower('');
    setPeriod('12');
    setLimitedDrivers(true);
    setDrivers([{ age: '', experience: '' }]);
    setKbmIndex(6);
    setCalculated(false);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {t('osago.title')}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru'
            ? 'Расчёт стоимости полиса ОСАГО и коэффициентов по актуальным тарифам'
            : 'Calculate OSAGO policy cost and coefficients at current rates'}
        </p>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {/* Владелец ТС */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0">
            {lang === 'ru' ? 'Владелец ТС' : 'Vehicle owner'}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ownerType"
                checked={ownerType === 'individual'}
                onChange={() => setOwnerType('individual')}
                className="w-4 h-4 text-indigo-500 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">{lang === 'ru' ? 'Физическое лицо' : 'Individual'}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ownerType"
                checked={ownerType === 'legal'}
                onChange={() => setOwnerType('legal')}
                className="w-4 h-4 text-indigo-500 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">{lang === 'ru' ? 'Юридическое лицо' : 'Legal entity'}</span>
            </label>
          </div>
        </div>

        {/* Тип ТС */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0">
            {lang === 'ru' ? 'Тип ТС' : 'Vehicle type'}
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          >
            {VEHICLE_TYPES.map((vt) => (
              <option key={vt.code} value={vt.code}>
                {lang === 'ru' ? vt.labelRu : vt.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Иностранные номера */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="sm:w-48 shrink-0" />
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isForeign}
              onChange={(e) => setIsForeign(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">
              {lang === 'ru' ? 'ТС с иностранной регистрацией' : 'Foreign registered vehicle'}
            </span>
            <span className="text-slate-300" title={lang === 'ru' ? 'Информация' : 'Info'}>ⓘ</span>
          </label>
        </div>

        {/* Регион */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0">
            {lang === 'ru' ? 'Регион' : 'Region'}
          </label>
          <select
            value={regionIndex}
            onChange={(e) => setRegionIndex(parseInt(e.target.value))}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          >
            {REGIONS.map((r, i) => (
              <option key={`${r.id}-${i}`} value={i}>
                {lang === 'ru' ? r.nameRu : r.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Мощность двигателя */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0">
            {lang === 'ru' ? 'Мощность двигателя' : 'Engine power'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={horsepower}
              onChange={(e) => setHorsepower(e.target.value.replace(/\D/g, ''))}
              placeholder="150"
              className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <span className="text-sm text-slate-400">{lang === 'ru' ? 'л.с.' : 'HP'}</span>
          </div>
        </div>

        {/* Период использования */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0">
            {lang === 'ru' ? 'Период использования ТС' : 'Vehicle usage period'}
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          >
            {[12, 11, 10, 9, 8, 7, 6, 5, 4, 3].map((m) => (
              <option key={m} value={m}>
                {m} {lang === 'ru' ? 'мес.' : 'mo.'}
              </option>
            ))}
          </select>
        </div>

        {/* Водители */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0 sm:mt-3">
            {lang === 'ru' ? 'Лица, допущенные к управлению' : 'Authorized drivers'}
          </label>
          <div className="flex-1 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="drivers"
                checked={limitedDrivers}
                onChange={() => setLimitedDrivers(true)}
                className="w-4 h-4 text-indigo-500 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">
                {lang === 'ru' ? 'Без ограничений по водителям' : 'Unlimited drivers'}
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="drivers"
                checked={!limitedDrivers}
                onChange={() => setLimitedDrivers(false)}
                className="w-4 h-4 text-indigo-500 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">
                {lang === 'ru' ? 'Ограниченный список водителей' : 'Limited driver list'}
              </span>
            </label>

            {!limitedDrivers && (
              <div className="mt-3 space-y-3 animate-fade-in">
                {drivers.map((driver, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-6">#{i + 1}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={driver.age}
                      onChange={(e) => updateDriver(i, 'age', e.target.value.replace(/\D/g, ''))}
                      placeholder={lang === 'ru' ? 'Возраст' : 'Age'}
                      className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={driver.experience}
                      onChange={(e) => updateDriver(i, 'experience', e.target.value.replace(/\D/g, ''))}
                      placeholder={lang === 'ru' ? 'Стаж' : 'Exp'}
                      className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                    {drivers.length > 1 && (
                      <button
                        onClick={() => removeDriver(i)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-all text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addDriver}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <span className="text-lg leading-none">+</span>
                  {lang === 'ru' ? 'Добавить водителя' : 'Add driver'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* КБМ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <label className="text-sm font-medium text-slate-600 sm:w-48 shrink-0">
            КБМ
          </label>
          <div className="flex items-center gap-3 flex-1">
            <select
              value={kbmIndex}
              onChange={(e) => setKbmIndex(parseInt(e.target.value))}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              {KBM_TABLE.map((entry, i) => (
                <option key={i} value={i}>
                  {lang === 'ru' ? `Класс ${entry.class}` : `Class ${entry.class}`} (Кбм={entry.coefficient})
                </option>
              ))}
            </select>
            <span className="text-slate-300" title={lang === 'ru' ? 'Как определяется КБМ?' : 'How is KBM determined?'}>ⓘ</span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCalculate}
            className="px-8 py-3 rounded-xl bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 hover:bg-indigo-600 active:scale-[0.98] transition-all"
          >
            {lang === 'ru' ? 'РАССЧИТАТЬ' : 'CALCULATE'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-all"
          >
            {lang === 'ru' ? 'Сбросить' : 'Reset'}
          </button>
        </div>
      </div>

      {/* РЕЗУЛЬТАТЫ */}
      {calculated && result && (
        <div className="mt-6 space-y-4 animate-fade-in">
          {/* Стоимость — главная карточка */}
          <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <p className="text-sm font-medium text-white/70 mb-1">
              {lang === 'ru' ? 'Примерная стоимость ОСАГО' : 'Estimated OSAGO cost'}
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatCurrency(result.total)}
            </p>
            <p className="text-sm text-white/60 mt-2">
              {lang === 'ru' ? `на ${period} мес.` : `for ${period} months`}
            </p>
          </div>

          {/* Разбивка */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {lang === 'ru' ? 'Коэффициенты' : 'Coefficients'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'БТ', value: result.BT.toLocaleString('ru-RU') + ' ₽' },
                { label: 'КТ', value: `×${result.KT}` },
                { label: 'КБМ', value: `×${result.KBM}` },
                { label: 'КВС', value: `×${result.KVS}` },
                { label: 'КО', value: `×${result.KO}` },
                { label: 'КМ', value: `×${result.KM}` },
                { label: 'КС', value: `×${result.KS}` },
                { label: 'КН', value: `×${result.KN}` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Формула */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="font-mono text-xs text-slate-500 break-all">
              {result.BT} × {result.KT} × {result.KBM} × {result.KVS} × {result.KO} × {result.KM} × {result.KS} × {result.KN} = {formatCurrency(result.total)}
            </p>
          </div>

          {/* Примечание */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              {lang === 'ru'
                ? '⚠️ Расчёт приблизительный. Точная стоимость зависит от страховщика и доп. услуг. Обратитесь в страховую компанию.'
                : '⚠️ Estimate only. Actual cost depends on insurer and additional services. Contact your insurance company.'}
            </p>
          </div>
        </div>
      )}

      {calculated && !result && (
        <div className="mt-6 bg-red-50 rounded-2xl border border-red-200 p-5 text-center animate-fade-in">
          <p className="text-sm text-red-600">
            {lang === 'ru'
              ? 'Пожалуйста, заполните мощность двигателя для расчёта'
              : 'Please enter engine power to calculate'}
          </p>
        </div>
      )}
    </div>
  );
}
