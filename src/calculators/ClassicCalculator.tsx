/**
 * Классический калькулятор
 *
 * Простой арифметический калькулятор для повседневных вычислений.
 * Поддерживает: сложение, вычитание, умножение, деление, проценты, знак +/-
 *
 * Как работает:
 * - Ввод чисел через кнопки или клавиатуру
 * - Операции выполняются при нажатии следующей операции или "="
 * - Результат отображается в большом поле ввода
 * - История вычислений сохраняется в локальном состоянии
 */
import { useState, useEffect, useCallback } from 'react';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import SeoContent from '../components/SeoContent';
import SeoHead from '../components/SeoHead';
import { safeEval } from '../lib/safeEval';

/* ==================== ТИПЫ ==================== */

/* Элемент истории вычислений */
interface HistoryEntry {
  expression: string; /* Выражение, которое было вычислено */
  result: string;     /* Результат вычисления */
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */

export default function ClassicCalculator() {
  /* Текущее выражение, отображаемое в строке ввода */
  const [expression, setExpression] = useState('0');

  /* Текущий результат (после нажатия =) */
  const [result, setResult] = useState('');

  /* История вычислений */
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  /* Флаг: только что нажали "=" — следующее число начнёт новый ввод */
  const [justCalculated, setJustCalculated] = useState(false);

  /* Флаг: последний введённый символ — оператор */
  const [lastWasOperator, setLastWasOperator] = useState(false);

  const lang = useLanguage();

  /* ==================== ОБРАБОТКА ВВОДА ==================== */

  /**
   * Добавляет цифру или точку к текущему выражению.
   * Если только что нажали "=", начинает новый ввод.
   */
  const handleNumber = useCallback((num: string) => {
    if (justCalculated) {
      /* После "=" начинаем новый ввод с нуля */
      setExpression(num === '.' ? '0.' : num);
      setJustCalculated(false);
      setLastWasOperator(false);
      return;
    }

    setExpression((prev) => {
      /* Если текущее значение "0" и введена не точка — заменяем */
      if (prev === '0' && num !== '.') return num;
      /* Если текущее значение "-0" и введена не точка — заменяем */
      if (prev === '-0' && num !== '.') return '-' + num;
      /* Если уже есть точка — не даём добавить вторую */
      if (num === '.' && prev.includes('.')) return prev;
      return prev + num;
    });
    setLastWasOperator(false);
  }, [justCalculated]);

  /**
   * Добавляет оператор (+, -, ×, ÷) к выражению.
   * Если последний символ — оператор, заменяет его.
   */
  const handleOperator = useCallback((op: string) => {
    setJustCalculated(false);

    setExpression((prev) => {
      /* Если выражение пустое или заканчивается на минус и это отрицательное число */
      if (prev === '' || prev === '-') return prev;

      /* Если последний символ — оператор, заменяем его */
      if (lastWasOperator) {
        return prev.slice(0, -1) + ' ' + op + ' ';
      }

      return prev + ' ' + op + ' ';
    });
    setLastWasOperator(true);
  }, [lastWasOperator, justCalculated]);

  /**
   * Вычисляет результат выражения.
   * Поддерживает последовательные операции (без "=").
   */
  const calculate = useCallback(() => {
    try {
      /* Заменяем символы операций на JavaScript-операторы */
      let expr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\s+/g, ' ')
        .trim();

      /* Убираем завершающий оператор */
      expr = expr.replace(/ [+\-*/]$/, '');

      if (!expr) return;

      /* Безопасное вычисление через рекурсивный парсер (без eval/Function) */
      const evalResult = safeEval(expr);
      const resultStr = String(evalResult);

      /* Добавляем в историю */
      setHistory((prev) => [
        { expression: expression, result: resultStr },
        ...prev.slice(0, 19), /* Храним последние 20 записей */
      ]);

      setResult(resultStr);
      setExpression(resultStr);
      setJustCalculated(true);
      setLastWasOperator(false);
    } catch {
      /* При ошибке вычисления показываем "Ошибка" */
      setResult('Ошибка');
      setExpression('Ошибка');
      setJustCalculated(true);
    }
  }, [expression]);

  /**
   * Очищает всё —.expression и результат.
   */
  const handleClear = useCallback(() => {
    setExpression('0');
    setResult('');
    setJustCalculated(false);
    setLastWasOperator(false);
  }, []);

  /**
   * Удаляет последний символ из выражения (Backspace).
   */
  const handleBackspace = useCallback(() => {
    if (justCalculated) {
      handleClear();
      return;
    }
    setExpression((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev[0] === '-')) return '0';
      /* Если удаляем оператор — убираем пробелы вокруг */
      const trimmed = prev.trimEnd();
      if (['+', '-', '×', '÷'].includes(trimmed.slice(-1))) {
        return trimmed.slice(0, -2).trimEnd() || '0';
      }
      return trimmed.slice(0, -1);
    });
  }, [justCalculated, handleClear]);

  /**
   * Переключает знак числа (+/-).
   */
  const handlePlusMinus = useCallback(() => {
    setExpression((prev) => {
      if (prev === '0' || prev === 'Ошибка') return prev;
      if (prev.startsWith('-')) return prev.slice(1);
      return '-' + prev;
    });
  }, []);

  /**
   * Вычисляет процент от текущего числа.
   * Например: 200 + 10% = 200 + 20 (10% от 200).
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

  /* ==================== ОБРАБОТКА КЛАВИАТУРЫ ==================== */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      /* Предотвращаем стандартную обработку клавиш калькулятора */
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
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
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
      <SeoHead
        title={lang === 'ru' ? 'Классический калькулятор онлайн — бесплатно | CalcCenter' : 'Classic Calculator Online — Free | CalcCenter'}
        description={lang === 'ru'
          ? 'Бесплатный онлайн классический калькулятор для повседневных вычислений. Сложение, вычитание, умножение, деление и проценты. Быстро и удобно.'
          : 'Free online classic calculator for everyday calculations. Addition, subtraction, multiplication, division and percentages. Fast and convenient.'}
        canonical="https://calccenter.ru/classic"
      />
      {/* Заголовок */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">{t('classic.title')}</h1>
        <p className="text-sm text-slate-400">{t('classic.description')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* КАЛЬКУЛЯТОР */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-7 shadow-sm">
            {/* Экран */}
            <div className="calc-screen mb-6 p-5 min-h-[110px] flex flex-col items-end justify-end">
              <div className="text-sm text-slate-300 break-all text-right w-full mb-1 min-h-[20px]">
                {expression !== '0' ? expression : ''}
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-800 break-all text-right w-full tracking-tight">
                {result || expression}
              </div>
            </div>

            {/* Кнопки */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              <button className="calc-btn calc-btn-clear" title="Очистить всё" onClick={handleClear}>{t('calc.clear')}</button>
              <button className="calc-btn calc-btn-clear" title="Стереть последний символ" onClick={handleBackspace}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" fill="currentColor" opacity="0.15" />
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
              <button className="calc-btn calc-btn-operator" title="Процент — x%" onClick={handlePercent}>%</button>
              <button className="calc-btn calc-btn-operator" title="Деление" onClick={() => handleOperator('÷')}>÷</button>

              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('7')}>7</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('8')}>8</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('9')}>9</button>
              <button className="calc-btn calc-btn-operator" title="Умножение" onClick={() => handleOperator('×')}>×</button>

              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('4')}>4</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('5')}>5</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('6')}>6</button>
              <button className="calc-btn calc-btn-operator" title="Вычитание" onClick={() => handleOperator('-')}>-</button>

              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('1')}>1</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('2')}>2</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('3')}>3</button>
              <button className="calc-btn calc-btn-operator" title="Сложение" onClick={() => handleOperator('+')}>+</button>

              <button className="calc-btn calc-btn-number" title="Сменить знак +/−" onClick={handlePlusMinus}>+/−</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('0')}>0</button>
              <button className="calc-btn calc-btn-number" onClick={() => handleNumber('.')}>.</button>
              <button className="calc-btn calc-btn-equals" title="Вычислить результат" onClick={calculate}>{t('calc.equals')}</button>
            </div>
          </div>
        </div>

        {/* ИСТОРИЯ */}
        <div className="lg:w-64">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full shadow-sm">
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

      <SeoContent
        title={lang === 'ru' ? 'О классическом калькуляторе' : 'About the Classic Calculator'}
        description={lang === 'ru'
          ? `Классический калькулятор — это простой и удобный инструмент для выполнения базовых арифметических действий: сложения, вычитания, умножения и деления. Он идеально подходит для повседневных расчётов: от вычисления суммы покупки до распределения бюджета.\n\nКалькулятор поддерживает работу с дробными числами, процентами и последовательные вычисления. Вы можете вводить длинные выражения, и калькулятор рассчитает результат с учётом приоритета операций.\n\nИстория вычислений сохраняется на странице, поэтому вы можете вернуться к любому предыдущему результату одним кликом. Все вычисления выполняются локально в браузере — данные не передаются на сервер.`
          : `The classic calculator is a simple and convenient tool for basic arithmetic operations: addition, subtraction, multiplication, and division. It's perfect for everyday calculations — from figuring out a shopping total to splitting a budget.\n\nThe calculator supports decimal numbers, percentages, and sequential calculations. You can enter long expressions, and the calculator will compute the result following the order of operations.\n\nCalculation history is saved on the page, so you can return to any previous result with a single click. All calculations are performed locally in your browser — no data is sent to any server.`}
        formula={{
          title: lang === 'ru' ? 'Как работают операции' : 'How Operations Work',
          text: lang === 'ru'
            ? 'Калькулятор использует стандартный приоритет математических операций: сначала выполняются умножение и деление, затем сложение и вычитание. Процент (%) вычисляется от текущего результата. Например, 100 + 50% = 100 + (100 × 0.5) = 150.'
            : 'The calculator follows the standard order of mathematical operations: multiplication and division are performed first, then addition and subtraction. The percent (%) is calculated from the current result. For example, 100 + 50% = 100 + (100 × 0.5) = 150.'
        }}
        faq={[
          {
            q: lang === 'ru' ? 'Как сохранить результат вычисления?' : 'How to save a calculation result?',
            a: lang === 'ru'
              ? 'Результат автоматически появляется в блоке «История» справа. Нажмите на любой результат в истории, чтобы подставить его в калькулятор для дальнейших вычислений.'
              : 'The result automatically appears in the "History" block on the right. Click any result in the history to use it in the calculator for further calculations.'
          },
          {
            q: lang === 'ru' ? 'Как ввести дробное число?' : 'How to enter a decimal number?',
            a: lang === 'ru'
              ? 'Используйте точку (.) как разделитель дробной части. Например: 3.14 + 2.86 = 6.00.'
              : 'Use a dot (.) as the decimal separator. For example: 3.14 + 2.86 = 6.00.'
          },
          {
            q: lang === 'ru' ? 'Как рассчитать процент скидки?' : 'How to calculate a discount percentage?',
            a: lang === 'ru'
              ? 'Введите сумму, нажмите ×, затем введите процент скидки и нажмите %. Например: 5000 × 15% = 750 (скидка). Чтобы узнать итоговую цену: 5000 − 750 = 4250.'
              : 'Enter the amount, press ×, then enter the discount percentage and press %. For example: 5000 × 15% = 750 (discount). To find the final price: 5000 − 750 = 4250.'
          },
        ]}
      />
    </div>
  );
}
