
import { useState, useEffect, useCallback } from "react";
import { subMonths, format, addMonths } from 'date-fns';
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Home, CreditCard, QrCode, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Tariff {
  id: string;
  name: string;
  price: number;
  type: 'static' | 'floating';
}

const Payments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "sbp" | "fast" | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [unpaidMonths, setUnpaidMonths] = useState<string[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const fetchTariffs = async () => {
    try {
      const response = await fetch('https://best-yard.onrender.com/api/tariffs');
      const data = await response.json();
      
      if (data.success) {
        setTariffs(data.tariffs);
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить тарифы",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при загрузке тарифов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить тарифы с сервера",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidMonths = useCallback(async () => {
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
      const response = await fetch(`https://best-yard.onrender.com/api/unpaid-months?userId=${userId}`);
      const data = await response.json();
      
      if (data.unpaidMonths && data.unpaidMonths.length > 0) {
        const formatted = data.unpaidMonths.map((m: string) => {
          const [year, month] = m.split("-");
          const date = new Date(Number(year), Number(month) - 1);
          return format(date, "MMMM yyyy", { locale: ru });
        });
        setUnpaidMonths(formatted);
      } else {
        const currentMonth = format(new Date(), "MMMM yyyy", { locale: ru });
        setUnpaidMonths([currentMonth]);
      }
    } catch (error) {
      console.error("❌ Ошибка при получении неоплаченных месяцев:", error);
      const currentMonth = format(new Date(), "MMMM yyyy", { locale: ru });
      setUnpaidMonths([currentMonth]);
    }
  }, [toast]);

  const getAvailableMonths = () => {
    return unpaidMonths;
  };

const calculatePayment = useCallback(async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMonth || selectedServices.length === 0) {
      return;
    }

    setIsCalculating(true);

    try {
      const response = await fetch(`https://best-yard.onrender.com/api/calculate-payment?userId=${userId}&selectedMonth=${encodeURIComponent(selectedMonth)}&selectedServices=${selectedServices.join(",")}`);
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

      tariffs.forEach((service) => {
        if (selectedServices.includes(service.id)) {
          let cost = 0;

          if (data.details && data.details[service.id] !== undefined && data.details[service.id] > 0) {
            cost = Number(data.details[service.id]); 
            console.log(`Услуга: ${service.name}, Стоимость: ${cost.toFixed(2)}, Тип расчета: по показаниям`);
          } else {
            cost = Number(service.price); 
            console.log(`Услуга: ${service.name}, Стоимость: ${cost.toFixed(2)}, Тип расчета: по базовому тарифу (нет данных за прошлый месяц)`);
          }

          serviceDetails[service.id] = cost;
          total += cost; 
        }
      });

      setTotalAmount(Number(total.toFixed(2)));
      setPaymentDetails(serviceDetails);

    } catch (error) {
      console.error("Ошибка при расчете платежа", error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить данные с сервера.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  }, [selectedMonth, selectedServices, tariffs, toast]);

  function formatMonth(monthName: string): string {
    const monthMap: Record<string, string> = {
      'января': '01',
      'февраля': '02',
      'марта': '03',
      'апреля': '04',
      'мая': '05',
      'июня': '06',
      'июля': '07',
      'августа': '08',
      'сентября': '09',
      'октября': '10',
      'ноября': '11',
      'декабря': '12',
    };

    const [name, year] = monthName.split(' ');
    const month = monthMap[name.toLowerCase()];
    return `${year}-${month}`;
  }

  useEffect(() => {
    fetchTariffs();
    fetchUnpaidMonths();
  }, [fetchUnpaidMonths]);

  useEffect(() => {
    if (selectedMonth && selectedServices.length > 0 && tariffs.length > 0) {
      const timeoutId = setTimeout(() => {
        calculatePayment();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setTotalAmount(0);
      setPaymentDetails({});
    }
  }, [selectedMonth, selectedServices, tariffs, calculatePayment]);

  const handleBackToMain = () => {
    navigate('/');
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'card': return 'Банковская карта';
      case 'sbp': return 'СБП';
      case 'fast': return 'Система быстрых платежей';
      default: return method;
    }
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

    const formattedMonth = formatMonth(selectedMonth);

    const paymentData = {
      userId,
      selectedMonth: formattedMonth,
      selectedServices,
      totalAmount,
      paymentMethod: selectedPaymentMethod,
    };

    const receiptData = {
      userId,
      selectedMonth,
      selectedServices: selectedServices.map(serviceId => {
        const service = tariffs.find(s => s.id === serviceId);
        return {
          id: serviceId,
          name: service?.name || '',
          amount: paymentDetails[serviceId] || 0
        };
      }),
      totalAmount,
      paymentMethod: getPaymentMethodName(selectedPaymentMethod),
      paymentDate: new Date().toLocaleString('ru-RU'),
      receiptNumber: `RCP-${Date.now()}`
    };
    
    localStorage.setItem('lastPaymentReceipt', JSON.stringify(receiptData));

    try {
      const response = await fetch("https://best-yard.onrender.com/api/save-payment", {
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

        setUnpaidMonths(prev => prev.filter(m => m !== selectedMonth));

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка тарифов...</p>
        </div>
      </div>
    );
  }

  const availableMonths = getAvailableMonths();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Оплата услуг
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Выберите услуги и способ оплаты
          </p>
        </div>

        <div className="grid gap-6">
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleBackToMain}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <Home className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Выбор периода
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700">
                  <SelectValue placeholder="Выберите месяц" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {availableMonths.map((month, index) => (
                    <SelectItem key={index} value={month} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Начисления
                {isCalculating && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-12 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 px-2">
                  <div className="col-span-1"></div>
                  <div className="col-span-7">Услуга</div>
                  <div className="col-span-2 text-right">Начислено</div>
                  <div className="col-span-2 text-right">К оплате</div>
                </div>

                <div className="space-y-3">
                  {tariffs.map((service) => (
                    <div key={service.id} className="grid grid-cols-12 items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 hover:shadow-md transition-all">
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
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </div>
                      <Label htmlFor={service.id} className="col-span-7 font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                        {service.name}
                      </Label>
                      <div className="col-span-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                        {Number(service.price).toFixed(2)} ₽
                      </div>
                      <div className="col-span-2 text-right font-bold text-blue-600 dark:text-blue-400">
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

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex justify-between text-2xl font-bold p-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <span>Итого к оплате:</span>
                  <span>{totalAmount.toFixed(2)} ₽</span>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Способы оплаты:
                  </div>
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
                    <Button
                      variant={selectedPaymentMethod === "card" ? "default" : "outline"}
                      className={`h-24 flex flex-col items-center justify-center gap-3 transition-all transform hover:scale-[1.02] ${
                        selectedPaymentMethod === "card" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                          : "bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:shadow-lg"
                      }`}
                      onClick={() => setSelectedPaymentMethod("card")}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span className="text-sm text-center font-medium">Банковской картой</span>
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === "sbp" ? "default" : "outline"}
                      className={`h-24 flex flex-col items-center justify-center gap-3 transition-all transform hover:scale-[1.02] ${
                        selectedPaymentMethod === "sbp" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                          : "bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:shadow-lg"
                      }`}
                      onClick={() => setSelectedPaymentMethod("sbp")}
                    >
                      <QrCode className="h-6 w-6" />
                      <span className="text-sm text-center font-medium">СБП</span>
                    </Button>
                    <Button
                      variant={selectedPaymentMethod === "fast" ? "default" : "outline"}
                      className={`h-24 flex flex-col items-center justify-center gap-3 transition-all transform hover:scale-[1.02] ${
                        selectedPaymentMethod === "fast" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                          : "bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:shadow-lg"
                      }`}
                      onClick={() => setSelectedPaymentMethod("fast")}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span className="text-sm text-center px-2 font-medium">Система быстрых платежей</span>
                    </Button>
                  </div>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  disabled={!selectedMonth || selectedServices.length === 0 || isCalculating}
                  onClick={handlePayment}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Расчет...
                    </>
                  ) : (
                    "Перейти к оплате"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Все платежи защищены и обрабатываются безопасно</p>
        </div>
      </div>
    </div>
  );
};

export default Payments;
