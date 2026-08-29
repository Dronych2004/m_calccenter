/**
 * Хук для получения ключевой ставки ЦБ РФ
 *
 * Источник: официальный API cbr.ru (XML)
 * URL: https://cbr.ru/scripts/XMLDaily.asp
 *
 * Логика:
 *   1. При загрузке проверяем localStorage (кэш на 24 часа)
 *   2. Если кэш валиден — используем его
 *   3. Если кэш устарел или отсутствует — загружаем из API
 *   4. При ошибке сети — fallback на последний кэшированный или дефолт
 *
 * Кэш хранится в localStorage:
 *   cbr_rate        — числовое значение ставки (%)
 *   cbr_rate_date   — дата ставки (ДД.ММ.ГГГГ)
 *   cbr_rate_fetched — timestamp последней загрузки (ms)
 */
import { useState, useEffect } from 'react';

/* Ключи localStorage */
const LS_RATE = 'cbr_rate';
const LS_DATE = 'cbr_rate_date';
const LS_FETCHED = 'cbr_rate_fetched';

/* Время жизни кэша: 24 часа в миллисекундах */
const CACHE_TTL = 24 * 60 * 60 * 1000;

/* Fallback значение — из .env или 21% */
const FALLBACK_RATE = Number(import.meta.env.VITE_CBR_RATE) || 21;

/**
 * Получает строку today в формате YYYY-MM-DD для сравнения с датой из API
 */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Парсит XML-ответ cbr.ru и возвращает { rate, date } последней ключевой ставки
 *
 * Формат XML:
 * <KeyRecord>
 *   <KeyRate>
 *     <Record>
 *       <Datum>27.01.2025</Datum>
 *       <Rate>21.00</Rate>
 *     </Record>
 *     ...
 *   </KeyRate>
 * </KeyRecord>
 */
function parseKeyRateXML(xmlText: string): { rate: number; date: string } | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');

    /* Ищем все элементы <Record> внутри <KeyRate> */
    const records = doc.querySelectorAll('KeyRate Record');

    if (records.length === 0) return null;

    /* Берём последний (самый свежий) Record */
    const lastRecord = records[records.length - 1];
    const datumEl = lastRecord.querySelector('Datum');
    const rateEl = lastRecord.querySelector('Rate');

    if (!datumEl || !rateEl) return null;

    const dateStr = datumEl.textContent?.trim() || '';
    const rateStr = rateEl.textContent?.trim() || '';

    /* Парсим ставку: "21,00" → 21 */
    const rate = parseFloat(rateStr.replace(',', '.'));
    if (isNaN(rate)) return null;

    return { rate, date: dateStr };
  } catch {
    return null;
  }
}

/**
 * Хук useCBRRate
 *
 * Возвращает:
 *   rate  — ключевая ставка ЦБ РФ (%)
 *   date  — дата ставки (ДД.ММ.ГГГГ)
 *   loading — идёт ли загрузка
 *
 * @example
 * const { rate, date, loading } = useCBRRate();
 * // rate = 21, date = "27.01.2025", loading = false
 */
export function useCBRRate() {
  const [rate, setRate] = useState(FALLBACK_RATE);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    /**
     * Читаем кэш из localStorage
     */
    function readCache(): { rate: number; date: string } | null {
      try {
        const cached = localStorage.getItem(LS_RATE);
        const cachedDate = localStorage.getItem(LS_DATE);
        const cachedFetched = localStorage.getItem(LS_FETCHED);

        if (cached && cachedDate && cachedFetched) {
          const age = Date.now() - parseInt(cachedFetched, 10);
          if (age < CACHE_TTL) {
            return { rate: parseFloat(cached), date: cachedDate };
          }
        }
      } catch {
        /* localStorage недоступен */
      }
      return null;
    }

    /**
     * Сохраняем в localStorage
     */
    function saveCache(rateVal: number, dateVal: string) {
      try {
        localStorage.setItem(LS_RATE, String(rateVal));
        localStorage.setItem(LS_DATE, dateVal);
        localStorage.setItem(LS_FETCHED, String(Date.now()));
      } catch {
        /* Игнорируем ошибки localStorage */
      }
    }

    /**
     * Загружает ставку из API ЦБ
     */
    async function fetchRate() {
      try {
        /* Используем прокси CORS, так как cbr.ru не отдаёт CORS */
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        /* Ключевая ставка может отсутствовать в daily_json — fallback */
        if (data.key_rate) {
          const rateVal = parseFloat(data.key_rate.value);
          const dateVal = data.key_rate.date || todayStr();
          if (!isNaN(rateVal)) {
            saveCache(rateVal, dateVal);
            return { rate: rateVal, date: dateVal };
          }
        }

        /* Если key_rate нет — возвращаем null, используем fallback */
        return null;
      } catch {
        /* API недоступен — используем fallback */
        return null;
      }
    }

    /**
     * Инициализация: читаем кэш → если устарел, загружаем из API
     */
    async function init() {
      /* 1. Пробуем кэш */
      const cached = readCache();
      if (cached && !cancelled) {
        setRate(cached.rate);
        setDate(cached.date);
        setLoading(false);
        return;
      }

      /* 2. Кэша нет — загружаем из API */
      const fresh = await fetchRate();
      if (fresh && !cancelled) {
        setRate(fresh.rate);
        setDate(fresh.date);
      } else if (!cancelled) {
        /* Fallback */
        setRate(FALLBACK_RATE);
        setDate('');
      }

      if (!cancelled) setLoading(false);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return { rate, date, loading };
}
