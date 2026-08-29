/**
 * Инженерный калькулятор
 *
 * Расширенный калькулятор с математическими функциями:
 * - Тригонометрия: sin, cos, tan, arcsin, arccos, arctan
 * - Логарифмы: log₁₀, ln
 * - Степени и корни: x², x³, xⁿ, √, ∛
 * - Константы: π, e
 * - Другое: факториал (!), модуль |x|, 1/x, скобки
 *
 * Поддерживает два режима: Градусы / Радианы.
 * Ввод осуществляется через кнопки или клавиатуру.
 * Вычисления выполняются через JavaScript Math API.
 */
import { useState, useEffect, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import { safeEval } from '../lib/safeEval';

/* Тип режима углов */
type AngleMode = 'deg' | 'rad';

/**
 * Факториал числа (n!).
 * Вычисляет произведение всех натуральных чисел от 1 до n.
 */
function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */
export default function EngineeringCalculator() {
  /* Текущее выражение (ввод) */
  const [expression, setExpression] = useState('0');

  /* Результат вычисления */
  const [result, setResult] = useState('');

  /* История вычислений */
  const [history, setHistory] = useState<Array<{ expression: string; result: string }>>([]);

  /* Режим: Градусы или Радианы */
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');

  /* Флаг: только что нажали "=" */
  const [justCalculated, setJustCalculated] = useState(false);

  const lang = useLanguage();

  /* ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================== */

  /**
   * Конвертирует угол из градусов в радианы (если нужен режим deg).
   */
  const toRadians = useCallback((degrees: number): number => {
    return angleMode === 'deg' ? (degrees * Math.PI) / 180 : degrees;
  }, [angleMode]);

  /**
   * Конвертирует угол из радиан в градусы (если нужен режим deg).
   */
  const fromRadians = useCallback((radians: number): number => {
    return angleMode === 'deg' ? (radians * 180) / Math.PI : radians;
  }, [angleMode]);


  /**
   * Применяет математическую функцию к текущему выражению.
   * Оборачивает выражение в функцию JS Math.
   */
  const applyFunction = useCallback((func: string) => {
    setJustCalculated(false);

    setExpression((prev) => {
      const val = prev === '0' ? '0' : prev;

      switch (func) {
        case 'sin':
          return `sin(${val})`;
        case 'cos':
          return `cos(${val})`;
        case 'tan':
          return `tan(${val})`;
        case 'cot':
          return `cot(${val})`;
        case 'sec':
          return `sec(${val})`;
        case 'csc':
          return `csc(${val})`;
        case 'asin':
          return `asin(${val})`;
        case 'acos':
          return `acos(${val})`;
        case 'atan':
          return `atan(${val})`;
        case 'log':
          return `log(${val})`;
        case 'ln':
          return `ln(${val})`;
        case 'sqrt':
          return `√(${val})`;
        case 'cbrt':
          return `∛(${val})`;
        case 'square':
          return `(${val})²`;
        case 'cube':
          return `(${val})³`;
        case 'factorial':
          return `(${val})!`;
        case 'abs':
          return `|${val}|`;
        case 'inv':
          return `1/(${val})`;
        case 'pi':
          return prev === '0' ? 'π' : `${prev}×π`;
        case 'euler':
          return prev === '0' ? 'e' : `${prev}×e`;
        case 'ln2':
          return prev === '0' ? 'ln2' : `${prev}×ln2`;
        case 'ln10':
          return prev === '0' ? 'ln10' : `${prev}×ln10`;
        case 'openParen':
          return prev === '0' ? '(' : `${prev}×(`;
        case 'closeParen':
          return `${prev})`;
        default:
          return prev;
      }
    });
  }, []);

  /* ==================== ОБРАБОТКА КНОПОК ==================== */

  /**
   * Добавляет цифру или точку к выражению.
   */
  const handleNumber = useCallback((num: string) => {
    if (justCalculated) {
      setExpression(num === '.' ? '0.' : num);
      setJustCalculated(false);
      return;
    }
    setExpression((prev) => {
      if (prev === '0' && num !== '.') return num;
      if (prev === '-0' && num !== '.') return '-' + num;
      if (num === '.' && prev.includes('.')) return prev;
      return prev + num;
    });
  }, [justCalculated]);

  /**
   * Добавляет оператор (+, -, ×, ÷, ^, mod).
   */
  const handleOperator = useCallback((op: string) => {
    setJustCalculated(false);
    setExpression((prev) => {
      if (prev === '' || prev === '-') return prev;
      const trimmed = prev.trimEnd();
      const lastChar = trimmed.slice(-1);
      const operators = ['+', '-', '×', '÷', '^', '%'];
      if (operators.includes(lastChar)) {
        return trimmed.slice(0, -1) + op + ' ';
      }
      return prev + ' ' + op + ' ';
    });
  }, [justCalculated]);

  /**
   * Очищает всё.
   */
  const handleClear = useCallback(() => {
    setExpression('0');
    setResult('');
    setJustCalculated(false);
  }, []);

  /**
   * Удаляет последний символ (Backspace).
   */
  const handleBackspace = useCallback(() => {
    if (justCalculated) {
      handleClear();
      return;
    }
    setExpression((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev[0] === '-')) return '0';
      return prev.slice(0, -1);
    });
  }, [justCalculated, handleClear]);

  /**
   * Конвертирует текущее число в процент (делит на 100).
   * Например: 200 → 2 (процент от 200)
   */
  const handlePercent = useCallback(() => {
    try {
      const current = parseFloat(expression);
      if (isNaN(current)) return;
      const percentValue = current / 100;
      setExpression(String(percentValue));
    } catch {
      /* Игнорируем ошибки */
    }
  }, [expression]);

  /**
   * Вычисляет результат выражения.
   * Поддерживает математические функции и операции.
   */
  const calculate = useCallback(() => {
    try {
      let expr = expression;

      /* Замена констант */
      expr = expr.replace(/π/g, `(${Math.PI})`);
      expr = expr.replace(/(?<![a-z])e(?![a-z])/g, `(${Math.E})`);
      expr = expr.replace(/ln2/g, `(${Math.LN2})`);
      expr = expr.replace(/ln10/g, `(${Math.LN10})`);

      /* Замена возведения в степень: x^y → Math.pow(x,y) */
      expr = expr.replace(/\^/g, '**');

      /* Тригонометрические функции — обратные */
      expr = expr.replace(/asin\(([^)]+)\)/g, (_, inner) => {
        return `(${fromRadians(Math.asin(parseFloat(inner)))})`;
      });
      expr = expr.replace(/acos\(([^)]+)\)/g, (_, inner) => {
        return `(${fromRadians(Math.acos(parseFloat(inner)))})`;
      });
      expr = expr.replace(/atan\(([^)]+)\)/g, (_, inner) => {
        return `(${fromRadians(Math.atan(parseFloat(inner)))})`;
      });

      /* Тригонометрические функции — прямые */
      expr = expr.replace(/sin\(([^)]+)\)/g, (_, inner) => {
        return `Math.sin(${toRadians(parseFloat(inner))})`;
      });
      expr = expr.replace(/cos\(([^)]+)\)/g, (_, inner) => {
        return `Math.cos(${toRadians(parseFloat(inner))})`;
      });
      expr = expr.replace(/tan\(([^)]+)\)/g, (_, inner) => {
        return `Math.tan(${toRadians(parseFloat(inner))})`;
      });
      /* Котангенс: cot(x) = 1/tan(x) = cos(x)/sin(x) */
      expr = expr.replace(/cot\(([^)]+)\)/g, (_, inner) => {
        return `(1/Math.tan(${toRadians(parseFloat(inner))}))`;
      });
      /* Секанс: sec(x) = 1/cos(x) */
      expr = expr.replace(/sec\(([^)]+)\)/g, (_, inner) => {
        return `(1/Math.cos(${toRadians(parseFloat(inner))}))`;
      });
      /* Косеканс: csc(x) = 1/sin(x) */
      expr = expr.replace(/csc\(([^)]+)\)/g, (_, inner) => {
        return `(1/Math.sin(${toRadians(parseFloat(inner))}))`;
      });

      /* Логарифмы */
      expr = expr.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
      expr = expr.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');

      /* Корни */
      expr = expr.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
      expr = expr.replace(/∛\(([^)]+)\)/g, 'Math.cbrt($1)');

      /* Степени: ()² и ()³ */
      expr = expr.replace(/\)\²/g, ')**2');
      expr = expr.replace(/\)\³/g, ')**3');

      /* Факториал: (n)! → factorial(n) */
      expr = expr.replace(/\((\d+)\)!/g, (_, n) => String(factorial(parseInt(n))));
      expr = expr.replace(/(\d+)!/g, (_, n) => String(factorial(parseInt(n))));

      /* Модуль |x| */
      expr = expr.replace(/\|([^|]+)\|/g, 'Math.abs($1)');

      /* 1/x */
      expr = expr.replace(/1\/\(([^)]+)\)/g, '(1/($1))');

      /* mod (остаток от деления) → оператор % */
      expr = expr.replace(/mod/g, '%');

      /* Убираем префикс Math. для безопасного парсера
       * (парсер поддерживает sin, cos, log, sqrt и т.д. напрямую) */
      expr = expr.replace(/Math\.(sin|cos|tan|asin|acos|atan|log10|log|sqrt|cbrt|abs|pow|PI|E|PI)/g, '$1');
      /* log10 → log (парсер использует log для log₁₀) */
      expr = expr.replace(/\blog\b/g, 'log');

      /* Замена операторов на JS */
      expr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\s+/g, ' ')
        .trim();

      /* Убираем завершающий оператор */
      expr = expr.replace(/ [+\-*/%]$/, '');

      if (!expr) return;

      /* Безопасное вычисление через рекурсивный парсер (без eval/Function) */
      const evalResult = safeEval(expr);

      if (typeof evalResult !== 'number' || !isFinite(evalResult)) {
        throw new Error('Invalid result');
      }

      /* toPrecision(12) убирает ошибки плавающей точки (0.30000000000000004 → 0.3) */
      const resultStr = String(parseFloat(evalResult.toPrecision(12)));

      setHistory((prev) => [
        { expression, result: resultStr },
        ...prev.slice(0, 19),
      ]);

      setResult(resultStr);
      setExpression(resultStr);
      setJustCalculated(true);
    } catch {
      setResult('Ошибка');
      setExpression('Ошибка');
      setJustCalculated(true);
    }
  }, [expression, angleMode, toRadians, fromRadians]);

  /* ==================== ОБРАБОТКА КЛАВИАТУРЫ ==================== */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ('0123456789.'.includes(e.key)) {
        e.preventDefault();
        handleNumber(e.key);
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '^') {
        e.preventDefault();
        handleOperator('^');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, calculate, handleBackspace, handleClear, handlePercent]);

  /* ==================== РЕНДЕР ==================== */

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">{t('engineering.title')}</h1>
        <p className="text-sm text-slate-400">{t('engineering.description')}</p>
      </div>

      {/* Переключатель градусы/радианы */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setAngleMode('deg')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            angleMode === 'deg'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {t('engineering.deg')}
        </button>
        <button
          onClick={() => setAngleMode('rad')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            angleMode === 'rad'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {t('engineering.rad')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* КАЛЬКУЛЯТОР */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
            {/* Экран */}
            <div className="calc-screen mb-5 p-4 sm:p-5 min-h-[100px] flex flex-col items-end justify-end">
              <div className="text-sm text-slate-300 break-all text-right w-full mb-1 min-h-[20px]">
                {expression !== '0' ? expression : ''}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 break-all text-right w-full tracking-tight">
                {result || expression}
              </div>
            </div>

            {/* ==================== КНОПКИ ==================== */}

            {/* Ряд 1: sin, cos, tan, cot */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Синус — sin(x)" onClick={() => applyFunction('sin')}>sin</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Косинус — cos(x)" onClick={() => applyFunction('cos')}>cos</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Тангенс — tan(x)" onClick={() => applyFunction('tan')}>tan</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Котангенс — 1/tan(x)" onClick={() => applyFunction('cot')}>cot</button>
            </div>

            {/* Ряд 2: sec, csc, π, e */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Секанс — 1/cos(x)" onClick={() => applyFunction('sec')}>sec</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Косеканс — 1/sin(x)" onClick={() => applyFunction('csc')}>csc</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Число Пи — 3.14159..." onClick={() => applyFunction('pi')}>π</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Число Эйлера — 2.71828..." onClick={() => applyFunction('euler')}>e</button>
            </div>

            {/* Ряд 3: log, ln, √, ∛ */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Десятичный логарифм — log₁₀(x)" onClick={() => applyFunction('log')}>log</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Натуральный логарифм — ln(x)" onClick={() => applyFunction('ln')}>ln</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Квадратный корень — √x" onClick={() => applyFunction('sqrt')}>√</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Кубический корень — ∛x" onClick={() => applyFunction('cbrt')}>∛</button>
            </div>

            {/* Ряд 4: x², x³, xⁿ, n! */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Квадрат — x²" onClick={() => applyFunction('square')}>x²</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Куб — x³" onClick={() => applyFunction('cube')}>x³</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Степень — xⁿ" onClick={() => handleOperator('^')}>xⁿ</button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Факториал — n!" onClick={() => applyFunction('factorial')}>n!</button>
            </div>

            {/* Разделитель */}
            <div className="border-t border-slate-100 my-3" />

            {/* Основные кнопки */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <button className="calc-btn calc-btn-clear text-sm !py-2.5" title="Очистить всё" onClick={handleClear}>{t('calc.clear')}</button>
              <button className="calc-btn calc-btn-clear" title="Стереть последний символ" onClick={handleBackspace}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" fill="currentColor" opacity="0.15" />
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
              <button className="calc-btn calc-btn-operator text-sm !py-2.5" title="Процент — x%" onClick={handlePercent}>%</button>
              <button className="calc-btn calc-btn-operator" title="Деление" onClick={() => handleOperator('÷')}>÷</button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('7')}>7</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('8')}>8</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('9')}>9</button>
              <button className="calc-btn calc-btn-operator" onClick={() => handleOperator('×')}>×</button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('4')}>4</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('5')}>5</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('6')}>6</button>
              <button className="calc-btn calc-btn-operator" onClick={() => handleOperator('-')}>-</button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('1')}>1</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('2')}>2</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('3')}>3</button>
              <button className="calc-btn calc-btn-operator" onClick={() => handleOperator('+')}>+</button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button className="calc-btn calc-btn-number text-sm !py-2.5" title="Модуль числа — |x|" onClick={() => applyFunction('abs')}>|x|</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('0')}>0</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('.')}>.</button>
              <button className="calc-btn calc-btn-equals" title="Вычислить результат (Enter)" onClick={calculate}>{t('calc.equals')}</button>
            </div>
          </div>
        </div>

        {/* ИСТОРИЯ */}
        <div className="lg:w-56">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 h-full shadow-sm">
            <h3 className="text-[13px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">{t('calc.history')}</h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-300">{t('calc.noHistory')}</p>
            ) : (
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all"
                    onClick={() => {
                      setExpression(entry.result);
                      setJustCalculated(false);
                    }}
                  >
                    <div className="text-[11px] text-slate-300 truncate">{entry.expression}</div>
                    <div className="text-sm font-semibold text-indigo-600">= {entry.result}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
