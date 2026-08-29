/**
 * Тесты для безопасного парсера выражений safeEval
 *
 * Покрывает:
 * - Базовую арифметику (+, -, *, /)
 * - Приоритет операций
 * - Скобки
 * - Возведение в степень (**)
 * - Факториал (!)
 * - Math-функции (sin, cos, sqrt, log и т.д.)
 * - Константы (π, e)
 * - Остаток от деления (%)
 * - Обработку ошибок
 * - Защиту от инъекции
 */
import { describe, it, expect } from 'vitest';
import { safeEval } from '../safeEval';

describe('safeEval — базовая арифметика', () => {
  it('сложение', () => {
    expect(safeEval('2 + 3')).toBe(5);
  });

  it('вычитание', () => {
    expect(safeEval('10 - 4')).toBe(6);
  });

  it('умножение', () => {
    expect(safeEval('6 * 7')).toBe(42);
  });

  it('деление', () => {
    expect(safeEval('15 / 3')).toBe(5);
  });

  it('деление с плавающей точкой', () => {
    expect(safeEval('10 / 3')).toBeCloseTo(3.333, 3);
  });
});

describe('safeEval — приоритет операций', () => {
  it('умножение trước сложения', () => {
    expect(safeEval('2 + 3 * 4')).toBe(14);
  });

  it('скобки меняют приоритет', () => {
    expect(safeEval('(2 + 3) * 4')).toBe(20);
  });

  it('вложенные скобки', () => {
    expect(safeEval('((2 + 3) * (4 - 1))')).toBe(15);
  });
});

describe('safeEval — степени и.factorial', () => {
  it('возведение в степень', () => {
    expect(safeEval('2 ** 10')).toBe(1024);
  });

  it('факториал', () => {
    expect(safeEval('5!')).toBe(120);
  });

  it('факториал 0', () => {
    expect(safeEval('0!')).toBe(1);
  });
});

describe('safeEval — Math-функции', () => {
  it('sin(π/2) ≈ 1', () => {
    expect(safeEval('sin(π / 2)')).toBeCloseTo(1, 10);
  });

  it('cos(0) = 1', () => {
    expect(safeEval('cos(0)')).toBe(1);
  });

  it('sqrt(16) = 4', () => {
    expect(safeEval('sqrt(16)')).toBe(4);
  });

  it('log(100) = 2', () => {
    expect(safeEval('log(100)')).toBe(2);
  });

  it('ln(e) = 1', () => {
    expect(safeEval('ln(e)')).toBeCloseTo(1, 10);
  });

  it('abs(-5) = 5', () => {
    expect(safeEval('abs(-5)')).toBe(5);
  });

  it('cbrt(27) = 3', () => {
    expect(safeEval('cbrt(27)')).toBe(3);
  });
});

describe('safeEval — константы', () => {
  it('π ≈ 3.14159', () => {
    expect(safeEval('π')).toBeCloseTo(Math.PI, 5);
  });

  it('e ≈ 2.71828', () => {
    expect(safeEval('e')).toBeCloseTo(Math.E, 5);
  });
});

describe('safeEval — остаток от деления', () => {
  it('10 mod 3 = 1', () => {
    expect(safeEval('10 mod 3')).toBe(1);
  });

  it('15 % 4 = 3', () => {
    expect(safeEval('15 % 4')).toBe(3);
  });
});

describe('safeEval — отрицательные числа', () => {
  it('отрицательное число', () => {
    expect(safeEval('-5')).toBe(-5);
  });

  it('отрицательное в выражении', () => {
    expect(safeEval('3 + (-5)')).toBe(-2);
  });
});

describe('safeEval — ошибки', () => {
  it('пустое выражение', () => {
    expect(() => safeEval('')).toThrow();
  });

  it('деление на ноль', () => {
    expect(() => safeEval('1 / 0')).toThrow();
  });

  it('недопустимые символы', () => {
    expect(() => safeEval('alert(1)')).toThrow();
  });

  it('попытка вызова функции', () => {
    expect(() => safeEval('fetch("http://evil.com")')).toThrow();
  });
});

describe('safeEval — защита от инъекции', () => {
  it('alert не выполняется', () => {
    expect(() => safeEval('alert("xss")')).toThrow();
  });

  it('document не выполняется', () => {
    expect(() => safeEval('document.cookie')).toThrow();
  });

  it('eval не выполняется', () => {
    expect(() => safeEval('eval("1+1")')).toThrow();
  });
});
