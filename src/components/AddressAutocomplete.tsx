import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import axios from "axios";

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
  const [error, setError] = useState<string | null>(null);

  const apiUrl = "https://region42.onrender.com/api";

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      return setSuggestions([]);
    }

    try {
      setLoading(true);
      setError(null);

      const params = {
        query,
        type,
        city: cityValue || "",
        street: streetValue || "",
      };

      const response = await axios.get(`${apiUrl}/suggest`, { params });

      if (response.status !== 200) {
        throw new Error("Ошибка запроса к серверу");
      }

      let filteredSuggestions = response.data.suggestions || [];

      if (type === "house") {
        filteredSuggestions = filteredSuggestions
          .map((s: string) => {
            const match = s.match(/(?:\d+[A-Za-zа-яА-Я]*)$/);
            return match ? match[0] : null;
          })
          .filter((s: string | null) => s !== null);
      }

      setSuggestions(Array.from(new Set(filteredSuggestions)));
    } catch (err) {
      console.error("Ошибка получения данных:", err);
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

  useEffect(() => setInputValue(value || ""), [value]);

  const renderEmptyMessage = () => {
    if (loading) return "Загрузка...";
    if (error) return error;
    if (suggestions.length === 0) return "Ничего не найдено";
    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value || placeholder}
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
