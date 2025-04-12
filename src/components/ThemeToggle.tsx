import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>("light");
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };
  
  useEffect(() => {
    // Ensure theme state is in sync with actual document class
    const isDarkMode = document.documentElement.classList.contains("dark");
    const savedTheme = isDarkMode ? "dark" : "light";
    setTheme(savedTheme);
  }, []);
  
  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
      title={theme === "light" ? "Включить темную тему" : "Включить светлую тему"}
      className="rounded-full shadow-md dark:bg-gray-700 dark:hover:bg-gray-600 hover:bg-gray-200 z-50"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Переключить тему</span>
    </Button>
  );
}