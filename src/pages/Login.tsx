import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
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

    // Проверяем, что все обязательные поля заполнены
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Вход в личный кабинет</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              defaultValue="address"
              value={loginType}
              onValueChange={(value) => setLoginType(value as "address" | "account")}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <div>
                <RadioGroupItem value="address" id="address" className="peer sr-only" />
                <Label
                  htmlFor="address"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-sm font-medium">По адресу</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="account" id="account" className="peer sr-only" />
                <Label
                  htmlFor="account"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-sm font-medium">По лицевому счету</span>
                </Label>
              </div>
            </RadioGroup>

            {loginType === "address" ? (
              <>
                <div className="space-y-2">
                  <AddressAutocomplete
                    value={formData.city}
                    onChange={(value) => setFormData({ ...formData, city: value })}
                    placeholder="Город"
                    type="locality"
                  />
                </div>
                <div className="space-y-2">
                  <AddressAutocomplete
                    value={formData.street}
                    onChange={(value) => setFormData({ ...formData, street: value })}
                    placeholder="Улица"
                    type="street"
                    cityValue={formData.city}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AddressAutocomplete
                    value={formData.house}
                    onChange={(value) => {
                      const num = parseInt(value);
                      if (!value || (num >= 1 && num <= 300)) {
                        setFormData({ ...formData, house: value });
                      }
                    }}
                    placeholder="Дом"
                    type="house"
                    cityValue={formData.city}
                    streetValue={formData.street}
                  />
                  <Input
                    placeholder="Квартира"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    type="number"
                    min="1"
                    max="500"
                  />
                </div>
                <div className="space-y-2">
                  <Input
  placeholder="Номер договора"
  value={formData.contract}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 12) {
      setFormData({ ...formData, contract: value });
    }
  }}
  maxLength={12}
/>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Input
  placeholder="Номер лицевого счета"
  value={formData.accountNumber}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 16) {
      setFormData({ ...formData, accountNumber: value });
    }
  }}
  maxLength={16}
/>
              </div>
            )}
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
