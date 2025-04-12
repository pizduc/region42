import { useState, useEffect } from "react";
import { subMonths, format, addMonths } from 'date-fns';
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Home, CreditCard, QrCode, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Статичные тарифы
const staticServices = [
  { id: "heating", name: "Отопление", price: 500 },
  { id: "maintenance", name: "Содержание жилья", price: 300 },
];

// Плавающие тарифы
const floatingServices = [
  { id: "electricity", name: "Электроснабжение", price: 4.70 },
  { id: "hot_water", name: "Горячее водоснабжение", price: 17.51 },
  { id: "cold_water", name: "Холодное водоснабжение", price: 80.69 },
];

const Payments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "sbp" | "fast" | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentDetails, setPaymentDetails] = useState<any>({});

  // Генерация списка месяцев начиная с текущего
  const getMonths = () => {
    const currentDate = new Date();
    const monthsArray = [];

    // Начинаем с предыдущего месяца
    const firstMonth = subMonths(currentDate, 1);

    // Генерация месяцев начиная с предыдущего
    for (let i = 0; i < 12; i++) {
      const month = addMonths(firstMonth, i);  // Добавляем месяц
      monthsArray.push(format(month, "MMMM yyyy", { locale: ru }));
    }

    return monthsArray;
  };

  const months = getMonths();

  // Функция для расчета платежа на сервере
  const calculatePayment = async () => {
    const userId = localStorage.getItem('userId');  // Получаем userId из localStorage

    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMonth || selectedServices.length === 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите месяц и услуги",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/calculate-payment?userId=${userId}&selectedServices=${selectedServices.join(",")}`);
      const data = await response.json();

      if (data.error) {
        toast({
          title: "Ошибка",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      let total = 0;
      const serviceDetails = {};

      staticServices.concat(floatingServices).forEach((service) => {
        if (selectedServices.includes(service.id)) {
          let cost = 0;

          // Для статичных услуг просто берем стоимость из сервера
          if (staticServices.some(s => s.id === service.id)) {
            cost = data.details?.[service.id] ?? 0; // Получаем итоговую стоимость с сервера
          } else {
            // Для плавающих услуг тоже получаем итоговую стоимость с сервера
            cost = data.details?.[service.id] ?? 0; // Получаем итоговую стоимость с сервера
          }

          serviceDetails[service.id] = cost;
          total += cost;

          console.log(`Услуга: ${service.name}, Стоимость: ${cost}`);
        }
      });

      setTotalAmount(parseFloat(total.toFixed(2))); // Итоговая сумма
      setPaymentDetails(serviceDetails); // Детали расчета

    } catch (error) {
      console.error("Ошибка при расчете платежа", error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить данные с сервера.",
        variant: "destructive",
      });
    }
  };

  const [paidMonths, setPaidMonths] = useState<string[]>([]);

  useEffect(() => {
    const fetchPaidMonths = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast({
          title: "Ошибка",
          description: "Пользователь не авторизован",
          variant: "destructive",
        });
        return;
      }
  
      try {
        const response = await fetch(`/api/paid-months?userId=${userId}`);
        const data = await response.json();
        setPaidMonths(data.paidMonths || []);
      } catch (error) {
        console.error("Ошибка при получении оплаченных месяцев", error);
        toast({
          title: "Ошибка",
          description: "Не удалось получить информацию о оплаченных месяцах.",
          variant: "destructive",
        });
      }
    };
  
    fetchPaidMonths();
  }, []);  

  const handleBackToMain = () => {
    navigate('/');
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Выберите способ оплаты",
        description: "Пожалуйста, выберите способ оплаты перед продолжением",
        variant: "destructive",
      });
      return;
    }
  
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }
  
    const paymentData = {
      userId,
      selectedMonth,
      selectedServices,
      totalAmount,
      paymentMethod: selectedPaymentMethod,
    };
  
    try {
      const response = await fetch("/api/save-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });
  
      const data = await response.json();
  
      if (data.success) {
        toast({
          title: "Оплата успешно сохранена!",
          description: `Сумма к оплате: ${totalAmount.toFixed(2)} ₽`,
        });
        // Перенаправление на страницу оплаты или успешного завершения
        navigate('/payment-success');
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось сохранить данные оплаты.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при отправке данных на сервер:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить данные на сервер.",
        variant: "destructive",
      });
    }
  };  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Оплата услуг</h1>
        <Button variant="outline" onClick={handleBackToMain}>
          <Home className="mr-2 h-4 w-4" />
          На главную
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Выбор периода</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите месяц" />
              </SelectTrigger>
              <SelectContent>
                {paidMonths.map((month, index) => (
                  <SelectItem key={index} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Начисления</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground mb-2">
                <div className="col-span-1"></div>
                <div className="col-span-7">Услуга</div>
                <div className="col-span-2 text-right">Начислено</div>
                <div className="col-span-2 text-right">К оплате</div>
              </div>

              <div className="space-y-4">
                {staticServices.concat(floatingServices).map((service) => (
                  <div key={service.id} className="grid grid-cols-12 items-center">
                    <div className="col-span-1">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={(checked) => {
                          setSelectedServices(
                            checked
                              ? [...selectedServices, service.id]
                              : selectedServices.filter((id) => id !== service.id)
                          );
                        }}
                      />
                    </div>
                    <Label htmlFor={service.id} className="col-span-7">
                      {service.name}
                    </Label>
                    <div className="col-span-2 text-right">
                      {service.price.toFixed(2)} ₽
                    </div>
                    <div className="col-span-2 text-right">
                      {selectedServices.includes(service.id)
                        ? (paymentDetails[service.id] && paymentDetails[service.id] > 0
                            ? paymentDetails[service.id].toFixed(2)
                            : "0.00")
                        : "0.00"} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Итого к оплате:</span>
                <span>{totalAmount.toFixed(2)} ₽</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Способы оплаты:
                </div>
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
                  <Button
                    variant={selectedPaymentMethod === "card" ? "default" : "outline"}
                    className={`h-20 flex flex-col items-center justify-center gap-2 transition-all ${selectedPaymentMethod === "card" ? "border-2 border-primary" : ""}`}
                    onClick={() => setSelectedPaymentMethod("card")}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-sm text-center">Банковской картой</span>
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === "sbp" ? "default" : "outline"}
                    className={`h-20 flex flex-col items-center justify-center gap-2 transition-all ${selectedPaymentMethod === "sbp" ? "border-2 border-primary" : ""}`}
                    onClick={() => setSelectedPaymentMethod("sbp")}
                  >
                    <QrCode className="h-6 w-6" />
                    <span className="text-sm text-center">СБП</span>
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === "fast" ? "default" : "outline"}
                    className={`h-20 flex flex-col items-center justify-center gap-2 transition-all ${selectedPaymentMethod === "fast" ? "border-2 border-primary" : ""}`}
                    onClick={() => setSelectedPaymentMethod("fast")}
                  >
                    <Wallet className="h-6 w-6" />
                    <span className="text-sm text-center px-2">Система быстрых платежей</span>
                  </Button>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={!selectedMonth || selectedServices.length === 0}
                onClick={handlePayment}
              >
                Перейти к оплате
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
