import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

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
  streetValue,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const baseUrl = "https://best-yard.onrender.com/api";
      const params: any = { query, type };

      if (type === "street" && cityValue) params.locality = cityValue;
      if (type === "house" && cityValue && streetValue) {
        params.locality = cityValue;
        params.street = streetValue;
      }      

      const response = await axios.get(`${baseUrl}/suggest`, { params });
      const data = response.data;

if (!Array.isArray(data.suggestions)) {
  throw new Error("Неверный формат ответа от сервера");
}

let result: string[] = data.suggestions;


      // Специальная обработка для домов — оставить только номер
      if (type === "house") {
        result = result
          .map((s) => {
            const match = (s as string).match(/(\d+\w*)$/);
            return match ? match[0] : null;
          })
          .filter((s): s is string => s !== null);
      }

      setSuggestions(Array.from(new Set(result)));
    } catch (err: any) {
      console.error("Ошибка получения данных:", err?.response?.data || err.message);
      setError("Ошибка получения данных");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue, type, cityValue, streetValue]);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const renderEmptyMessage = () => {
    if (loading) return "Загрузка...";
    if (error) return error;
    if (suggestions.length === 0) return "Ничего не найдено";
    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
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
            {renderEmptyMessage() && <CommandEmpty>{renderEmptyMessage()}</CommandEmpty>}
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
                  <Check
                    className={cn("mr-2 h-4 w-4", value === suggestion ? "opacity-100" : "opacity-0")}
                  />
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
