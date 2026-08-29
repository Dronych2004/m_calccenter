/**
 * Хук useLoanCalculator — общая логика для кредитных калькуляторов
 *
 * Заменяет дублированный код в:
 *   - MortgageCalculator.tsx (ипотека)
 *   - CreditCalculator.tsx (кредит)
 *   - AutoCreditCalculator.tsx (автокредит)
 *
 * Поддерживает:
 *   - Аннуитетный платёж
 *   - Дифференцированный платёж
 *   - Помесячный график платежей
 *
 * Формулы:
 *   Аннуитетный: A = S × (P × (1+P)^n) / ((1+P)^n - 1)
 *   Дифференцированный: D_i = S/n + (S - S×(i-1)/n) × P
 *   где S — сумма кредита, P — месячная ставка, n — кол-во месяцев
 */
import { useState, useCallback } from 'react';

/* ==================== ТИПЫ ==================== */

export type PaymentType = 'annuity' | 'differentiated';

export interface MonthSchedule {
  month: number;
  year: number;
  monthInYear: number;
  payment: number;
  principal: number;
  interest: number;
  remaining: number;
}

export interface LoanResult {
  /* Аннуитетный */
  monthlyAnnuity: number;
  totalAnnuity: number;
  overpaymentAnnuity: number;
  /* Дифференцированный */
  firstPaymentDiff: number;
  lastPaymentDiff: number;
  totalDiff: number;
  overpaymentDiff: number;
  /* Общее */
  monthlyPrincipal: number;
  P: number;
  n: number;
  S: number;
  /* График (дифференцированный) */
  monthSchedule: MonthSchedule[];
}

interface UseLoanCalculatorParams {
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  paymentType: PaymentType;
  /* Доп. параметры — первый взнос для автокредита */
  downPayment?: number;
}

/* ==================== ХУК ==================== */

export function useLoanCalculator(params: UseLoanCalculatorParams) {
  const { loanAmount, interestRate, loanTerm, paymentType, downPayment = 0 } = params;

  const calculate = useCallback((): LoanResult | null => {
    const S_raw = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const years = parseInt(loanTerm);

    /* Валидация */
    if (!S_raw || S_raw <= 0 || !annualRate || annualRate <= 0 || !years || years <= 0) return null;

    /* Сумма кредита за вычетом первого взноса */
    const S = Math.max(0, S_raw - downPayment);
    if (S <= 0) return null;

    const n = years * 12;
    const P = annualRate / 100 / 12;

    /* ---- Аннуитетный платёж ---- */
    const annuityFactor = (P * Math.pow(1 + P, n)) / (Math.pow(1 + P, n) - 1);
    const monthlyAnnuity = S * annuityFactor;
    const totalAnnuity = monthlyAnnuity * n;
    const overpaymentAnnuity = totalAnnuity - S;

    /* ---- Дифференцированный платёж ---- */
    const monthlyPrincipal = S / n;
    const firstPaymentDiff = monthlyPrincipal + S * P;
    const lastPaymentDiff = monthlyPrincipal + monthlyPrincipal * P;

    let remaining = S;
    let totalDiff = 0;
    const monthSchedule: MonthSchedule[] = [];

    for (let i = 0; i < n; i++) {
      if (remaining <= 0) break;
      const interestPayment = remaining * P;
      const principalPayment = Math.min(monthlyPrincipal, remaining);
      const payment = principalPayment + interestPayment;

      remaining -= principalPayment;
      totalDiff += payment;

      const year = Math.floor(i / 12) + 1;
      const monthInYear = (i % 12) + 1;

      monthSchedule.push({
        month: i + 1,
        year,
        monthInYear,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        remaining: Math.max(0, remaining),
      });
    }

    const overpaymentDiff = totalDiff - S;

    return {
      monthlyAnnuity,
      totalAnnuity,
      overpaymentAnnuity,
      firstPaymentDiff,
      lastPaymentDiff,
      totalDiff,
      overpaymentDiff,
      monthlyPrincipal,
      P,
      n,
      S,
      monthSchedule,
    };
  }, [loanAmount, interestRate, loanTerm, downPayment]);

  return { calculate };
}
