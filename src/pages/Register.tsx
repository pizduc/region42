
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Building, Home, User, CreditCard, Hash } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Регистрация адреса
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Заполните все поля для регистрации в системе
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center font-semibold text-gray-800 dark:text-gray-200">
              Введите данные
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Поля со звездочкой (*) обязательны для заполнения
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Город *
                </Label>
                <AddressAutocomplete
                  type="locality"
                  value={city}
                  onChange={setCity}
                  placeholder="Выберите город"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Улица *
                </Label>
                <AddressAutocomplete
                  type="street"
                  value={street}
                  onChange={setStreet}
                  placeholder="Выберите улицу"
                  cityValue={city}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Дом *
                  </Label>
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Квартира *
                  </Label>
                  <Input
                    id="apartment"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="№ квартиры"
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Номер договора *
                </Label>
                <Input
                  id="contract"
                  value={contract}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 12) {
                      setContract(value);
                    }
                  }}
                  placeholder="Введите 12-значный номер договора"
                  maxLength={12}
                  className="transition-all focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {contract.length}/12 символов
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Номер лицевого счета *
                </Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 16) {
                      setAccountNumber(value);
                    }
                  }}
                  placeholder="Введите 16-значный номер счета"
                  maxLength={16}
                  className="transition-all focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {accountNumber.length}/16 символов
                </p>
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                <User className="w-5 h-5 mr-2" />
                {isLoading ? "Отправка..." : "Зарегистрировать"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Нужна помощь? Обратитесь в службу поддержки</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
