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
  type: "locality" | "street" | "house";
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

  const fetchSuggestions = async (input: string) => {
    if (!input) return setSuggestions([]);
  
    // Проверка на достаточные данные
    if ((type === "house" && (!cityValue || !streetValue)) || (type === "street" && !cityValue)) {
      return setSuggestions([]);
    }
  
    try {
      setLoading(true);
      setError(false);
  
      // Составляем единый текст запроса
      let fullQuery = "Россия, ";
      if (type === "locality") {
        fullQuery += input;
      } else if (type === "street") {
        fullQuery += `${cityValue}, ${input}`;
      } else if (type === "house") {
        fullQuery += `${cityValue}, ${streetValue}, ${input}`;
      }
  
      const params = new URLSearchParams({
        query: fullQuery,
        type,
      });
  
      const response = await fetch(`https://best-yard.onrender.com/api/suggest?${params.toString()}`);
      if (!response.ok) throw new Error("Ошибка запроса к серверу");
  
      const data = await response.json();
      let filteredSuggestions: string[] = Array.from(new Set(data.suggestions || []));
  
      // Фильтрация номеров домов
      if (type === "house") {
        filteredSuggestions = filteredSuggestions
          .map((s) => {
            const match = s.match(/(?:\d+[A-Za-zа-яА-Я]*)$/);
            return match ? match[0] : null;
          })
          .filter((s): s is string => !!s);
  
        console.log("🏠 Фильтрованные дома:", filteredSuggestions);
      }
  
      setSuggestions(filteredSuggestions);
    } catch (err) {
      console.error("❌ Ошибка получения подсказок:", err);
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
            placeholder={`Поиск ${type === "locality" ? "города" : type === "street" ? "улицы" : "дома"}...`}
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
