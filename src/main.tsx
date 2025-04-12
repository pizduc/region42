import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Инициализация темы
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
};

initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);