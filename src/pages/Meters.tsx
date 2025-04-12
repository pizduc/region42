import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplet, Flame, Zap, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MeterData } from "@/types/meters";

const Meters = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [meters, setMeters] = useState<MeterData[]>([{
    id: "cold_water",
    title: "Счетчик холодной воды",
    icon: <Droplet className="h-5 w-5" />,
    value: 0,
    step: 0.1,
    color: "bg-blue-500"
  }, {
    id: "hot_water",
    title: "Счетчик горячей воды",
    icon: <Flame className="h-5 w-5" />,
    value: 0,
    step: 0.1,
    color: "bg-red-500"
  }, {
    id: "electricity",
    title: "Счетчик электрической энергии",
    icon: <Zap className="h-5 w-5" />,
    value: 0,
    step: 1,
    color: "bg-yellow-500"
  }]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      toast({
        title: "Ошибка авторизации",
        description: "Не найден пользователь. Пожалуйста, войдите снова.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setUserId(storedUserId);

    const loadLatestReadings = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/meter-readings?userId=${storedUserId}`);

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          toast({
            title: "Ошибка загрузки данных",
            description: data.error,
            variant: "destructive",
          });
          return;
        }

        if (data.currentReadings) {  // ✅ Используем правильное поле
          setMeters((prevMeters) =>
            prevMeters.map((meter) => ({
              ...meter,
              value: parseFloat(data.currentReadings[meter.id]) || meter.value, // ✅ Берем из currentReadings
            }))
          );
          toast({
            title: "Данные загружены",
            description: "Последние показания успешно подгружены.",
          });
        } else {
          toast({
            title: "Нет данных",
            description: "Не найдено предыдущих показаний.",
          });
        }
                
      } catch (error: any) {
        console.error("Ошибка загрузки показаний:", error);
        toast({
          title: "Ошибка загрузки",
          description: error.message || "Не удалось загрузить последние показания счетчиков.",
          variant: "destructive",
        });
      }
    };

    loadLatestReadings();
  }, [navigate, toast]);

  const handleIncrement = (id: string, amount: number) => {
    setMeters(meters.map(meter => meter.id === id ? {
      ...meter,
      value: parseFloat((Number(meter.value) + amount).toFixed(3))
    } : meter));
  };

  const handleDecrement = (id: string, amount: number) => {
    setMeters(meters.map(meter => meter.id === id ? {
      ...meter,
      value: Math.max(parseFloat((Number(meter.value) - amount).toFixed(3)), 0)
    } : meter));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Не найден ID пользователя.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');  // формат: "YYYY-MM-DD HH:MM:SS"
  
    const payload = {
      userId,
      coldWater: meters.find((m) => m.id === "cold_water")?.value ?? 0,
      hotWater: meters.find((m) => m.id === "hot_water")?.value ?? 0,
      electricity: meters.find((m) => m.id === "electricity")?.value ?? 0,
      readingDate: currentDate,  // заменяем на readingDate
    };    
  
    // Проверка данных перед отправкой
    if (payload.coldWater === 0 && payload.hotWater === 0 && payload.electricity === 0) {
      toast({
        title: "Ошибка",
        description: "Не введены показания для счетчиков.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      setIsLoading(true);
  
      const response = await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (!response.ok || data.error) {
        throw new Error(data.error || `Ошибка сервера: ${response.status}`);
      }
  
      toast({
        title: "Успешно",
        description: "Показания успешно отправлены.",
      });
    } catch (error: any) {
      console.error("Ошибка отправки показаний:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить показания.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Показания счетчиков</h1>
        <Button variant="outline" onClick={handleBackToMain}>
          <Home className="mr-2 h-4 w-4" />
          На главную
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {meters.map((meter) => (
            <Card key={meter.id} className="overflow-hidden">
              <CardHeader className={`${meter.color} text-white rounded-t-lg flex flex-row items-center py-3`}>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {meter.icon}
                  {meter.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div className="w-full flex justify-center">
                    <div className="text-3xl font-mono bg-white border rounded-md px-4 py-2 w-40 text-center">
                      {Number(meter.value).toFixed(3)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <Button type="button" variant="outline" onClick={() => handleIncrement(meter.id, meter.step * 100)}>
                      +{meter.step * 100}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleIncrement(meter.id, meter.step * 10)}>
                      +{meter.step * 10}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleIncrement(meter.id, meter.step)}>
                      +{meter.step}
                    </Button>
                    
                    <Button type="button" variant="outline" onClick={() => handleDecrement(meter.id, meter.step * 100)}>
                      -{meter.step * 100}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDecrement(meter.id, meter.step * 10)}>
                      -{meter.step * 10}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDecrement(meter.id, meter.step)}>
                      -{meter.step}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        
          <Button 
            type="submit"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Сохранение..." : "Подтвердить ввод"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Meters;
