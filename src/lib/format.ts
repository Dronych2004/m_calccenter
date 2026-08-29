/**
 * Общие функции форматирования для финансовых калькуляторов
 *
 * Заменяют дублирующийся код formatCurrency / formatNumber
 * в MortgageCalculator, CreditCalculator, AutoCreditCalculator и др.
 */

/**
 * Форматирует число как валюту (₽) с пробелами-разделителями
 *
 * @param value — число для форматирования
 * @param decimals — кол-во знаков после запятой (по умолчанию 0 = целое)
 *
 * formatCurrency(1234567)     → "1 234 567 ₽"
 * formatCurrency(1234.56, 2)  → "1 234,56 ₽"
 */
export function formatCurrency(value: number, decimals = 0): string {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + ' ₽';
}

/**
 * Форматирует число без знака валюты — только цифры с пробелами
 * Используется в таблицах графика платежей
 *
 * @param value — число для форматирования
 * @param decimals — кол-во знаков после запятой (по умолчанию 0 = целое)
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
