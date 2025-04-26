import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Инициализация темы
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  
  // Если тема сохранена как 'dark' или если не сохранена и пользователь предпочитает темную тему
  if (
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
};

// Инициализация темы при загрузке
initializeTheme();

// Получаем корневой элемент и рендерим приложение
const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('Корневой элемент не найден!');
}
