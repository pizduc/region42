import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Home, CreditCard, MapPin, Building, Hash, LogIn, User } from "lucide-react";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<"address" | "account">("address");
  const [formData, setFormData] = useState({
    city: "",
    street: "",
    house: "",
    apartment: "",
    contract: "",
    accountNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = loginType === "address"
      ? ["city", "street", "house", "apartment", "contract"]
      : ["accountNumber"];

    const houseNum = parseInt(formData.house);
    if (loginType === "address" && (isNaN(houseNum) || houseNum > 300)) {
      toast({
        title: "Ошибка",
        description: "Номер дома должен быть не более 300",
        variant: "destructive",
      });
      return;
    }

    const apartmentNum = parseInt(formData.apartment);
    if (loginType === "address" && (isNaN(apartmentNum) || apartmentNum > 500)) {
      toast({
        title: "Ошибка",
        description: "Номер квартиры должен быть не более 500",
        variant: "destructive",
      });
      return;
    }

    if (loginType === "address" && formData.contract.length !== 12) {
      toast({
        title: "Ошибка",
        description: "Номер договора должен состоять из 12 символов",
        variant: "destructive",
      });
      return;
    }
    if (loginType === "account" && formData.accountNumber.length !== 16) {
  toast({
    title: "Ошибка",
    description: "Номер лицевого счёта должен состоять из 16 символов",
    variant: "destructive",
  });
  return;
}

   try {
  const response = await axios.post("https://best-yard.onrender.com/api/login", {
    loginType,
    ...formData,
  });

  if (response.data.success) {
    const { userId, isSpecialUser } = response.data;

    localStorage.setItem("userId", userId);
    localStorage.setItem("isSpecialUser", isSpecialUser.toString());
    localStorage.setItem("userAddress", JSON.stringify(formData));

    toast({
      title: "Успешный вход",
      description: isSpecialUser
        ? "Добро пожаловать (особый пользователь)"
        : "Добро пожаловать в личный кабинет",
    });

    navigate("/");
  } else {
    const { error } = response.data;

    if (error === "Пользователь не найден") {
      toast({
        title: "Пользователь не найден",
        description:
          loginType === "address"
            ? "Проверьте адрес и номер договора"
            : "Проверьте номер лицевого счёта",
        variant: "destructive",
      });
    } else if (error === "Неверный формат данных") {
      toast({
        title: "Ошибка валидации",
        description: "Некорректные поля. Проверьте и попробуйте снова.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ошибка",
        description: error || "Неизвестная ошибка",
        variant: "destructive",
      });
    }
  }
} catch (err: any) {
  if (axios.isAxiosError(err) && err.response) {
    const status = err.response.status;
    const { error, code } = err.response.data || {};

    switch (status) {
      case 400:
        if (code === "missing_fields") {
          toast({
            title: "Недостаточно данных",
            description: "Пожалуйста, заполните все обязательные поля для входа по адресу.",
            variant: "destructive",
          });
        } else if (code === "missing_account_number") {
          toast({
            title: "Отсутствует номер счета",
            description: "Укажите номер лицевого счёта для входа.",
            variant: "destructive",
          });
        } else if (code === "invalid_login_type") {
          toast({
            title: "Неверный тип входа",
            description: "Выбран некорректный способ авторизации.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Ошибка 400",
            description: error || "Некорректный запрос.",
            variant: "destructive",
          });
        }
        break;

      case 401:
        if (code === "user_not_found") {
          toast({
            title: "Пользователь не найден",
            description: "Проверьте корректность введённых данных. Пользователь с такими данными отсутствует.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Ошибка авторизации",
            description: error || "Не удалось выполнить вход.",
            variant: "destructive",
          });
        }
        break;

      case 404:
        toast({
          title: "Ошибка 404",
          description: "API не найден. Убедитесь, что путь запроса указан верно.",
          variant: "destructive",
        });
        break;

      case 500:
        toast({
          title: "Ошибка сервера",
          description: "Произошла внутренняя ошибка сервера. Попробуйте позже.",
          variant: "destructive",
        });
        break;

      default:
        toast({
          title: "Ошибка",
          description: error || "Произошла неизвестная ошибка. Проверьте данные и повторите попытку.",
          variant: "destructive",
        });
    }
  } else {
    toast({
      title: "Сетевая ошибка",
      description: "Не удалось установить соединение с сервером. Проверьте интернет или попробуйте позже.",
      variant: "destructive",
    });
  }
}
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Добро пожаловать
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Войдите в свой личный кабинет
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center font-semibold text-gray-800 dark:text-gray-200">
              Способ входа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              defaultValue="address"
              value={loginType}
              onValueChange={(value) => setLoginType(value as "address" | "account")}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <RadioGroupItem value="address" id="address" className="peer sr-only" />
                <Label
                  htmlFor="address"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 peer-data-[state=checked]:shadow-md [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50 dark:[&:has([data-state=checked])]:bg-blue-900/20"
                >
                  <MapPin className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">По адресу</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="account" id="account" className="peer sr-only" />
                <Label
                  htmlFor="account"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 peer-data-[state=checked]:shadow-md [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50 dark:[&:has([data-state=checked])]:bg-blue-900/20"
                >
                  <CreditCard className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">По лицевому счету</span>
                </Label>
              </div>
            </RadioGroup>

            <form onSubmit={handleSubmit} className="space-y-5">
              {loginType === "address" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Город
                    </Label>
                    <AddressAutocomplete
                      value={formData.city}
                      onChange={(value) => setFormData({ ...formData, city: value })}
                      placeholder="Выберите город"
                      type="locality"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Улица
                    </Label>
                    <AddressAutocomplete
                      value={formData.street}
                      onChange={(value) => setFormData({ ...formData, street: value })}
                      placeholder="Выберите улицу"
                      type="street"
                      cityValue={formData.city}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Дом
                      </Label>
                      <AddressAutocomplete
                        value={formData.house}
                        onChange={(value) => {
                          const num = parseInt(value);
                          if (!value || (num >= 1 && num <= 300)) {
                            setFormData({ ...formData, house: value });
                          }
                        }}
                        placeholder="№ дома"
                        type="house"
                        cityValue={formData.city}
                        streetValue={formData.street}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Квартира
                      </Label>
                      <Input
                        placeholder="№ квартиры"
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                        type="number"
                        min="1"
                        max="500"
                        className="transition-all focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Номер договора
                    </Label>
                    <Input
                      placeholder="Введите 12-значный номер договора"
                      value={formData.contract}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value) && value.length <= 12) {
                          setFormData({ ...formData, contract: value });
                        }
                      }}
                      maxLength={12}
                      className="transition-all focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.contract.length}/12 символов
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Номер лицевого счета
                  </Label>
                  <Input
                    placeholder="Введите 16-значный номер счета"
                    value={formData.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 16) {
                        setFormData({ ...formData, accountNumber: value });
                      }
                    }}
                    maxLength={16}
                    className="transition-all focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.accountNumber.length}/16 символов
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Войти в личный кабинет
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Нужна помощь? Обратитесь в службу поддержки</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
