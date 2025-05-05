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

    // Проверяем, что все обязательные поля заполнены
    if (requiredFields.every((field) => formData[field as keyof typeof formData])) {
      try {
        const response = await axios.post("https://best-yard.onrender.com/api/login", {
          loginType,
          ...formData,
        });

        console.log("Ответ от сервера:", response.data); // Логируем ответ от сервера

        if (response.data.success) {
          const { userId, isSpecialUser } = response.data;

          // Сохраняем данные пользователя в localStorage
          localStorage.setItem("userId", userId);
          localStorage.setItem("isSpecialUser", isSpecialUser.toString());
          localStorage.setItem("userAddress", JSON.stringify(formData));

          // Отправляем уведомление о успешном входе
          if (loginType === "address") {
            toast({
              title: "Успешный вход",
              description: "Добро пожаловать в личный кабинет",
            });
          } else if (isSpecialUser) {
            toast({
              title: "Успешный вход",
              description: "Добро пожаловать в личный кабинет (особый пользователь)",
            });
          }

          // Редирект на главную страницу или в профиль
          if (loginType === "address") {
            navigate("/"); // Главная страница
          } else {
            navigate("/profile"); // Профиль пользователя
          }
        } else {
          toast({
            title: "Ошибка",
            description: response.data.error || "Не удалось войти",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при подключении к серверу",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
    }
  };

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
                    onChange={(e) => setFormData({ ...formData, contract: e.target.value })}
                    maxLength={12}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Номер лицевого счета"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
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
