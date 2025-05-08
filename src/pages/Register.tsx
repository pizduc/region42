
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Функция для запроса предложений от Яндекс Саджеста
const fetchSuggestions = async (query: string, type: string) => {
  try {
    const url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${process.env.YANDEX_API_KEY}&text=${encodeURIComponent(query)}&lang=ru_RU&type=${type}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const data = await response.json();
    const results = data?.results;

    if (!Array.isArray(results)) {
      console.warn("⚠️ Пустой или некорректный ответ:", data);
      return [];
    }

    const suggestions = results
      .filter((item) => item.uri?.includes("country--russia"))
      .map((item) => item.title?.text)
      .filter(Boolean);

    return [...new Set(suggestions)];
  } catch (error) {
    console.error("❌ Ошибка запроса:", error);
    return [];
  }
};

const Register = () => {
  const { toast } = useToast();

  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [apartment, setApartment] = useState("");
  const [contract, setContract] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [activeField, setActiveField] = useState("");

  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);

    if (value) {
      const suggestions = await fetchSuggestions(value, "locality");
      setCitySuggestions(suggestions);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleStreetChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStreet(value);

    if (value) {
      const suggestions = await fetchSuggestions(value, "street");
      setStreetSuggestions(suggestions);
    } else {
      setStreetSuggestions([]);
    }
  };

  const applySuggestion = (value: string, field: string) => {
    if (field === "city") setCity(value);
    if (field === "street") setStreet(value);
    setCitySuggestions([]);
    setStreetSuggestions([]);
  };

  const handleSubmit = () => {
    if (!city || !street || !house || !contract || !accountNumber) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля.",
      });
      return;
    }

    const userData = {
      city,
      street,
      house,
      apartment,
      contract,
      accountNumber,
    };

    fetch("https://best-yard.onrender.com/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then(() => {
        toast({
          title: "Регистрация успешна",
          description: "Ваши данные успешно зарегистрированы.",
        });
      })
      .catch((error) => {
        console.error("Ошибка при регистрации:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при регистрации. Попробуйте снова.",
        });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Регистрация нового пользователя</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Введите данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">Город</label>
            <Input
              id="city"
              value={city}
              onChange={handleCityChange}
              placeholder="Введите город"
              onFocus={() => setActiveField("city")}
            />
            {activeField === "city" && citySuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border shadow rounded w-full mt-1 max-h-40 overflow-y-auto">
                {citySuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => applySuggestion(suggestion, "city")}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="street" className="text-sm font-medium">Улица</label>
            <Input
              id="street"
              value={street}
              onChange={handleStreetChange}
              placeholder="Введите улицу"
              onFocus={() => setActiveField("street")}
            />
            {activeField === "street" && streetSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border shadow rounded w-full mt-1 max-h-40 overflow-y-auto">
                {streetSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => applySuggestion(suggestion, "street")}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="house" className="text-sm font-medium">Дом</label>
            <Input
              id="house"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
              placeholder="Введите номер дома"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="apartment" className="text-sm font-medium">Квартира</label>
            <Input
              id="apartment"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder="Введите номер квартиры"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contract" className="text-sm font-medium">Номер договора</label>
            <Input
              id="contract"
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              placeholder="Введите номер договора"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="accountNumber" className="text-sm font-medium">Номер лицевого счета</label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Введите номер лицевого счета"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">Зарегистрировать</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
