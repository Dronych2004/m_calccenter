/**
 * Точка входа приложения
 * Подключает глобальные стили и рендерит корневой компонент App в DOM.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

/* Находим корневой элемент в HTML и рендерим React-приложение */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
