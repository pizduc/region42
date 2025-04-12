import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: "city" | "street" | "house";
  cityValue?: string;
  streetValue?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  type,
  cityValue,
  streetValue
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchSuggestions = async (query: string) => {
    if (!query) return setSuggestions([]);

    if ((type === "house" && (!cityValue || !streetValue)) || (type === "street" && !cityValue)) {
      return setSuggestions([]);
    }

    try {
      setLoading(true);
      setError(false);

      const response = await fetch(
        `http://localhost:3000/suggest?query=${query}&type=${type}&city=${cityValue || ""}&street=${streetValue || ""}`
      );

      if (!response.ok) throw new Error("Ошибка запроса к серверу");
      const data = await response.json();

      // Указание типа данных для suggestions как string[]
      let filteredSuggestions: string[] = Array.from(new Set(data.suggestions || []));

      // Фильтрация номеров домов
      if (type === "house") {
        filteredSuggestions = filteredSuggestions
          .map((s) => {
            // Преобразование s в строку для использования метода match
            const match = (s as string).match(/(?:\d+[A-Za-zа-яА-Я]*)$/); // Ищем только цифры с буквой в конце
            return match ? match[0] : null; // Возвращаем только номер дома
          })
          .filter((s) => s !== null); // Убираем null значения

        console.log("Фильтрованные предложения для дома:", filteredSuggestions);
      }

      setSuggestions(filteredSuggestions);
    } catch (err) {
      console.error("Ошибка получения данных:", err);
      setError(true);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue, type, cityValue, streetValue]);

  useEffect(() => setInputValue(value || ""), [value]);

  // Показ сообщений о загрузке/ошибке только один раз
  const renderEmptyMessage = () => {
    if (loading) return "Загрузка...";
    if (error) return "Ошибка загрузки";
    if (suggestions.length === 0) return "Ничего не найдено";
    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput
            placeholder={`Поиск ${type === "city" ? "города" : type === "street" ? "улицы" : "дома"}...`}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {renderEmptyMessage() && (
              <CommandEmpty>{renderEmptyMessage()}</CommandEmpty>
            )}
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  value={suggestion}
                  onSelect={() => {
                    onChange(suggestion);
                    setInputValue(suggestion);
                    setOpen(false);
                  }}
                  className={cn("cursor-pointer", value === suggestion && "bg-gray-200")}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === suggestion ? "opacity-100" : "opacity-0")} />
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
