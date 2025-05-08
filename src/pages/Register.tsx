
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Building, Home, User } from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

const Register = () => {
  const { toast } = useToast();

  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [apartment, setApartment] = useState("");
  const [contract, setContract] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Валидация обязательных полей
    if (!city || !street || !house || !contract || !accountNumber) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля.",
      });
      return;
    }

    if (contract.length !== 12) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Номер договора должен содержать ровно 12 символов.",
      });
      return;
    }
    
    if (accountNumber.length !== 16) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Номер лицевого счета должен содержать ровно 16 символов.",
      });
      return;
    }

    setIsLoading(true);

    const userData = {
      city,
      street,
      house,
      apartment,
      contract,
      accountNumber,
    };

    try {
      const response = await fetch("https://best-yard.onrender.com/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      toast({
        title: "Регистрация успешна",
        description: "Ваши данные успешно зарегистрированы.",
      });

      // Очистка полей формы после успешной регистрации
      setCity("");
      setStreet("");
      setHouse("");
      setApartment("");
      setContract("");
      setAccountNumber("");
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при регистрации. Попробуйте снова.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Регистрация адреса</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Введите данные</CardTitle>
          <CardDescription>
            Поля со звездочкой (*) обязательны для заполнения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-blue-500" />
              Город *
            </label>
            <AddressAutocomplete
              type="locality"
              value={city}
              onChange={setCity}
              placeholder="Выберите город"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="street" className="text-sm font-medium flex items-center">
              <Building className="mr-1 h-4 w-4 text-blue-500" />
              Улица *
            </label>
            <AddressAutocomplete
              type="street"
              value={street}
              onChange={setStreet}
              placeholder="Выберите улицу"
              cityValue={city}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="house" className="text-sm font-medium flex items-center">
                <Home className="mr-1 h-4 w-4 text-blue-500" />
                Дом *
              </label>
              <AddressAutocomplete
                type="house"
                value={house}
                onChange={setHouse}
                placeholder="Выберите дом"
                cityValue={city}
                streetValue={street}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="apartment" className="text-sm font-medium">
                Квартира *
              </label>
              <Input
                id="apartment"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="№ квартиры"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contract" className="text-sm font-medium flex items-center">
              <User className="mr-1 h-4 w-4 text-blue-500" />
              Номер договора *
            </label>
            <Input
  id="contract"
  value={contract}
  onChange={(e) => setContract(e.target.value)}
  placeholder="Введите номер договора"
  maxLength={12} // Ограничение на 12 символов
  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
/>
          </div>

          <div className="space-y-2">
            <label htmlFor="accountNumber" className="text-sm font-medium">
              Номер лицевого счета *
            </label>
            <Input
  id="accountNumber"
  value={accountNumber}
  onChange={(e) => setAccountNumber(e.target.value)}
  placeholder="Введите номер лицевого счета"
  maxLength={16} // Ограничение на 16 символов
  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
/>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Отправка..." : "Зарегистрировать"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
