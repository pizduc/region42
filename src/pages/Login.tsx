
import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, MapPin, Building, Home, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: "locality" | "street" | "house";
  cityValue?: string;
  streetValue?: string;
  inputClassName?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  type,
  cityValue,
  streetValue,
  inputClassName,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getIcon = () => {
    switch (type) {
      case "locality":
        return <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "street":
        return <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "house":
        return <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const fetchSuggestions = async (input: string) => {
    if (!input) return setSuggestions([]);

    if ((type === "house" && (!cityValue || !streetValue)) || (type === "street" && !cityValue)) {
      return setSuggestions([]);
    }
  
    try {
      setLoading(true);
      setError(false);

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

  const renderEmptyMessage = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-4 text-gray-600 dark:text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Загрузка...
      </div>
    );
    if (error) return (
      <div className="flex items-center justify-center py-4 text-red-600 dark:text-red-400">
        Ошибка загрузки
      </div>
    );
    if (suggestions.length === 0) return (
      <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
        Ничего не найдено
      </div>
    );
    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className={cn(
            "w-full justify-between h-11 px-3 py-2",
            "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700",
            "hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700",
            "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
            "transition-all duration-200",
            "text-left font-normal",
            !value && "text-gray-500 dark:text-gray-400"
          )}
        >
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="truncate">
              {value || placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(
        "w-[var(--radix-popover-trigger-width)] p-0",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "shadow-2xl backdrop-blur-sm",
        "rounded-xl overflow-hidden"
      )}>
        <Command className="rounded-xl border-0">
          <CommandInput
            className={cn(
              "h-11 border-0 border-b border-gray-200 dark:border-gray-700",
              "bg-gray-50 dark:bg-gray-900/50",
              "text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
              "focus:bg-white dark:focus:bg-gray-800",
              "transition-colors duration-200",
              inputClassName
            )}
            placeholder={`Поиск ${
              type === "locality" ? "города"
              : type === "street" ? "улицы"
              : "дома"
            }...`}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList className="max-h-60">
            {renderEmptyMessage() && (
              <CommandEmpty className="py-0">
                {renderEmptyMessage()}
              </CommandEmpty>
            )}
            <CommandGroup className="p-2">
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  value={suggestion}
                  onSelect={() => {
                    onChange(suggestion);
                    setInputValue(suggestion);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-2 mb-1",
                    "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    "data-[selected=true]:bg-blue-100 dark:data-[selected=true]:bg-blue-900/30",
                    "transition-colors duration-150",
                    value === suggestion && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <Check 
                    className={cn(
                      "mr-2 h-4 w-4 text-blue-600 dark:text-blue-400", 
                      value === suggestion ? "opacity-100" : "opacity-0"
                    )} 
                  />
                  <span className="text-gray-900 dark:text-gray-100">
                    {suggestion}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
