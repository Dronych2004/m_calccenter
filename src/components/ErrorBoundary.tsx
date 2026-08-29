/**
 * ErrorBoundary — ловит ошибки рендеринга в дочерних компонентах
 *
 * Без него ошибки в любом калькуляторе "убивают" всё приложение.
 * С ним — показывается красивое сообщение с кнопкой перезагрузки.
 *
 * Используется в App.tsx для оборачивания маршрутов.
 */
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Что-то пошло не так
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Произошла ошибка при загрузке калькулятора. Попробуйте перезагрузить страницу.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-600 transition-all"
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
