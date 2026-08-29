/**
 * Безопасный вычислитель математических выражений
 *
 * Заменяет Function() / eval() — выполняет ТОЛЬКО арифметику.
 * Любая попытка вызова (alert, fetch, fetch, document и т.д.)
 * будет отклонена на этапе валидации, до вычисления.
 *
 * Поддерживает:
 *   Числа (целые, дробные, отрицательные)
 *   Операторы: +, -, *, /, %, **
 *   Скобки: ( )
 *   Функции Math: sin, cos, tan, cot, sec, csc, asin, acos, atan,
 *                  log, ln, sqrt, cbrt, abs, pow, PI, E
 *   Факториал: n!
 *   Константы: π, e
 *
 * Как работает:
 *   1. parse() — разбивает строку на токены (числа, операторы, функции)
 *   2. evaluate() — вычисляет по приоритету операций (рекурсивный спуск)
 *   3. Ни на одном этапе не создаётся Function/eval
 */

/* ==================== ТОКЕНЫ ==================== */

type TokenType =
  | 'number'
  | 'operator'
  | 'lparen'
  | 'rparen'
  | 'comma'
  | 'function'
  | 'constant'
  | 'factorial';

interface Token {
  type: TokenType;
  value: string;
}

/* ==================== ЛЕКСИЧЕСКИЙ АНАЛИЗ ==================== */

/* Список поддерживаемых функций (безопасные Math-методы) */
const SAFE_FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan',
  'log', 'ln',
  'sqrt', 'cbrt', 'abs', 'pow',
  'round', 'floor', 'ceil',
]);

/* Константы */
const CONSTANTS: Record<string, number> = {
  PI: Math.PI,
  E: Math.E,
  π: Math.PI,
};

/**
 * Разбивает строку выражения на токены.
 * Выбрасывает ошибку при недопустимых символах.
 */
function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    /* Пробелы — пропускаем */
    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }

    /* Число: цифры и десятичная точка */
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    /* Отрицательное число: минус в начале или после оператора/скобки */
    if (ch === '-' && (
      tokens.length === 0 ||
      tokens[tokens.length - 1].type === 'operator' ||
      tokens[tokens.length - 1].type === 'lparen'
    )) {
      let num = '-';
      i++;
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      if (num.length > 1) {
        tokens.push({ type: 'number', value: num });
      } else {
        /* Минус как оператор, если после него нет цифры */
        tokens.push({ type: 'operator', value: '-' });
      }
      continue;
    }

    /* Возведение в степень ** (проверяем ДО одинарного оператора *) */
    if (ch === '*' && i + 1 < expr.length && expr[i + 1] === '*') {
      tokens.push({ type: 'operator', value: '**' });
      i += 2;
      continue;
    }

    /* Операторы */
    if ('+-*/%'.includes(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    /* Скобки */
    if (ch === '(') {
      tokens.push({ type: 'lparen', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen', value: ')' });
      i++;
      continue;
    }

    /* Запятая — разделитель аргументов функции (pow) */
    if (ch === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
      continue;
    }

    /* Факториал */
    if (ch === '!') {
      tokens.push({ type: 'factorial', value: '!' });
      i++;
      continue;
    }

    /* Константы: π, e */
    if (ch === 'π') {
      tokens.push({ type: 'constant', value: 'PI' });
      i++;
      continue;
    }

    /* Буквенные токены: функции, константы (e), mod */
    if (/[a-zA-Z]/.test(ch)) {
      let word = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        word += expr[i];
        i++;
      }

      /* Константа e (не часть имени функции) */
      if (word === 'e' && (i >= expr.length || expr[i] !== '(')) {
        tokens.push({ type: 'constant', value: 'E' });
        continue;
      }

      /* mod → оператор % */
      if (word === 'mod') {
        tokens.push({ type: 'operator', value: '%' });
        continue;
      }

      /* Функция (ожидаем скобку после) */
      if (SAFE_FUNCTIONS.has(word)) {
        tokens.push({ type: 'function', value: word });
        continue;
      }

      /* Неизвестное слово — ошибка */
      throw new Error(`Unknown identifier: ${word}`);
    }

    /* Любой другой символ — недопустим */
    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
}

/* ==================== ПАРСЕР (рекурсивный спуск) ==================== */

let pos: number;
let toks: Token[];

/** Текущий токен */
function peek(): Token | undefined {
  return toks[pos];
}

/** Берём следующий токен */
function advance(): Token {
  return toks[pos++];
}

/** Ожидаем конкретный токен */
function expect(type: TokenType, value?: string): Token {
  const t = advance();
  if (!t || t.type !== type || (value !== undefined && t.value !== value)) {
    throw new Error(`Expected ${type} '${value}', got ${t?.type} '${t?.value}'`);
  }
  return t;
}

/**
 * Факториал: n! = n × (n-1) × ... × 1
 */
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/**
 * Применяет Math-функцию к аргументу
 */
function applyFunction(name: string, arg: number): number {
  switch (name) {
    case 'sin': return Math.sin(arg);
    case 'cos': return Math.cos(arg);
    case 'tan': return Math.tan(arg);
    case 'cot': return 1 / Math.tan(arg);
    case 'sec': return 1 / Math.cos(arg);
    case 'csc': return 1 / Math.sin(arg);
    case 'asin': return Math.asin(arg);
    case 'acos': return Math.acos(arg);
    case 'atan': return Math.atan(arg);
    case 'log': return Math.log10(arg);
    case 'ln': return Math.log(arg);
    case 'sqrt': return Math.sqrt(arg);
    case 'cbrt': return Math.cbrt(arg);
    case 'abs': return Math.abs(arg);
    case 'round': return Math.round(arg);
    case 'floor': return Math.floor(arg);
    case 'ceil': return Math.ceil(arg);
    default: throw new Error(`Unknown function: ${name}`);
  }
}

/**
 * Фактор: число, константа, функция, скобки, отрицательное число
 */
function parseFactor(): number {
  const t = peek();
  if (!t) throw new Error('Unexpected end of expression');

  /* Число */
  if (t.type === 'number') {
    advance();
    return parseFloat(t.value);
  }

  /* Константа */
  if (t.type === 'constant') {
    advance();
    return CONSTANTS[t.value];
  }

  /* Функция: имя(аргумент) */
  if (t.type === 'function') {
    const funcName = t.value;
    advance();
    expect('lparen', '(');
    const arg = parseExpression();
    expect('rparen', ')');

    /* pow(x, y) — два аргумента через запятую */
    if (funcName === 'pow') {
      expect('comma', ',');
      const arg2 = parseExpression();
      expect('rparen', ')');
      return Math.pow(arg, arg2);
    }

    return applyFunction(funcName, arg);
  }

  /* Скобки */
  if (t.type === 'lparen') {
    advance();
    const result = parseExpression();
    expect('rparen', ')');
    return result;
  }

  /* Отрицательное число (минус перед числом) */
  if (t.type === 'operator' && t.value === '-') {
    advance();
    return -parseFactor();
  }

  throw new Error(`Unexpected token: ${t.type} '${t.value}'`);
}

/**
 * Степень:.factor ^ .factor
 */
function parsePower(): number {
  let base = parseFactor();

  while (peek()?.type === 'operator' && peek()?.value === '**') {
    advance();
    const exp = parseFactor();
    base = Math.pow(base, exp);
  }

  /* Факториал после числа/скобки */
  while (peek()?.type === 'factorial') {
    advance();
    base = factorial(Math.round(base));
  }

  return base;
}

/**
 * Умножение/деление/остаток: .power ((* | / | %) .power)*
 */
function parseTerm(): number {
  let left = parsePower();

  while (peek()?.type === 'operator' && ['*', '/', '%'].includes(peek()!.value)) {
    const op = advance().value;
    const right = parsePower();
    if (op === '*') left *= right;
    else if (op === '/') {
      if (right === 0) throw new Error('Division by zero');
      left /= right;
    }
    else if (op === '%') left %= right;
  }

  return left;
}

/**
 * Сложение/вычитание: .term ((+ | -) .term)*
 */
function parseExpression(): number {
  let left = parseTerm();

  while (peek()?.type === 'operator' && ['+', '-'].includes(peek()!.value)) {
    const op = advance().value;
    const right = parseTerm();
    if (op === '+') left += right;
    else left -= right;
  }

  return left;
}

/* ==================== ПУБЛИЧНЫЙ API ==================== */

/**
 * Безопасно вычисляет математическое выражение.
 *
 * @param expression - строка вида "2 + 3 * (4 - 1)"
 * @returns число — результат вычисления
 * @throws Error при синтаксической ошибке или недопустимых символах
 *
 * @example
 * safeEval('2 + 3')           // 5
 * safeEval('sqrt(16) + 2')    // 6
 * safeEval('sin(π/2)')        // 1
 * safeEval('2 ** 10')         // 1024
 * safeEval('17!')             // 355687428096000
 */
export function safeEval(expression: string): number {
  if (!expression || !expression.trim()) {
    throw new Error('Empty expression');
  }

  /* Замена символов операций на внутренние токены */
  let expr = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

  /* Убираем завершающий оператор */
  expr = expr.replace(/[+\-*/%]$/, '').trim();

  if (!expr) throw new Error('Empty expression');

  /* Лексический анализ */
  toks = tokenize(expr);
  pos = 0;

  /* Парсинг и вычисление */
  const result = parseExpression();

  /* Проверяем, что все токены обработаны */
  if (pos < toks.length) {
    throw new Error(`Unexpected token: ${toks[pos].type} '${toks[pos].value}'`);
  }

  return result;
}
