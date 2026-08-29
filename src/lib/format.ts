/**
 * Общие функции форматирования для финансовых калькуляторов
 *
 * Заменяют дублирующийся код formatCurrency / formatNumber
 * в MortgageCalculator, CreditCalculator, AutoCreditCalculator и др.
 */

/**
 * Форматирует число как валюту (₽) с пробелами-разделителями
 * Округляет до целого: 1234567 → "1 234 567 ₽"
 */
export function formatCurrency(value: number): string {
  return Math.round(value).toLocaleString('ru-RU') + ' ₽';
}

/**
 * Форматирует число без знака валюты — только цифры с пробелами
 * Используется в таблицах графика платежей
 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('ru-RU');
}
