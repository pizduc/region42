
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplet, Flame, Zap, Home, Clock, AlertTriangle } from "lucide-react";
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
    color: "bg-gradient-to-r from-blue-500 to-cyan-500"
  }, {
    id: "hot_water",
    title: "Счетчик горячей воды",
    icon: <Flame className="h-5 w-5" />,
    value: 0,
    step: 0.1,
    color: "bg-gradient-to-r from-red-500 to-orange-500"
  }, {
    id: "electricity",
    title: "Счетчик электрической энергии",
    icon: <Zap className="h-5 w-5" />,
    value: 0,
    step: 1,
    color: "bg-gradient-to-r from-yellow-500 to-amber-500"
  }]);

  // Функция для проверки, находится ли текущая дата в разрешенном периоде (20-25 число)
  const isReadingPeriodAllowed = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    return currentDay >= 20 && currentDay <= 25;
  };

  // Функция для получения информации о следующем разрешенном периоде
  const getNextAllowedPeriod = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    
    if (currentDay < 20) {
      // Если сегодня до 20 числа, то следующий период в этом месяце
      return `20-25 ${currentDate.toLocaleDateString('ru-RU', { month: 'long' })}`;
    } else {
      // Если сегодня после 25 числа, то следующий период в следующем месяце
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 20);
      return `20-25 ${nextMonth.toLocaleDateString('ru-RU', { month: 'long' })}`;
    }
  };

  const isInputAllowed = isReadingPeriodAllowed();

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

    // Показываем уведомление, если период подачи показаний закрыт
    if (!isInputAllowed) {
      toast({
        title: "Период подачи показаний закрыт",
        description: `Показания можно подавать только с 20 по 25 число каждого месяца. Следующий период: ${getNextAllowedPeriod()}`,
        variant: "destructive",
      });
    }

    const loadLatestReadings = async () => {
      try {
        const response = await fetch(`https://best-yard.onrender.com/api/meter-readings?userId=${storedUserId}`);

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

        if (data.currentReadings) {
          setMeters((prevMeters) =>
            prevMeters.map((meter) => ({
              ...meter,
              value: parseFloat(data.currentReadings[meter.id]) || meter.value,
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
  }, [navigate, toast, isInputAllowed]);

  const handleIncrement = (id: string, amount: number) => {
    if (!isInputAllowed) {
      toast({
        title: "Изменение показаний недоступно",
        description: `Показания можно изменять только с 20 по 25 число каждого месяца. Следующий период: ${getNextAllowedPeriod()}`,
        variant: "destructive",
      });
      return;
    }

    setMeters(meters.map(meter => meter.id === id ? {
      ...meter,
      value: parseFloat((Number(meter.value) + amount).toFixed(3))
    } : meter));
  };

  const handleDecrement = (id: string, amount: number) => {
    if (!isInputAllowed) {
      toast({
        title: "Изменение показаний недоступно",
        description: `Показания можно изменять только с 20 по 25 число каждого месяца. Следующий период: ${getNextAllowedPeriod()}`,
        variant: "destructive",
      });
      return;
    }

    setMeters(meters.map(meter => meter.id === id ? {
      ...meter,
      value: Math.max(parseFloat((Number(meter.value) - amount).toFixed(3)), 0)
    } : meter));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isInputAllowed) {
      toast({
        title: "Подача показаний недоступна",
        description: `Показания можно подавать только с 20 по 25 число каждого месяца. Следующий период: ${getNextAllowedPeriod()}`,
        variant: "destructive",
      });
      return;
    }
  
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Не найден ID пользователя.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
    const payload = {
      userId,
      coldWater: meters.find((m) => m.id === "cold_water")?.value ?? 0,
      hotWater: meters.find((m) => m.id === "hot_water")?.value ?? 0,
      electricity: meters.find((m) => m.id === "electricity")?.value ?? 0,
      readingDate: currentDate,
    };    
  
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
  
      const response = await fetch("https://best-yard.onrender.com/api/meter-readings", {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Уведомление о периоде подачи показаний для десктопной версии */}
      {!isInputAllowed && (
        <div className="hidden lg:block">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Период подачи показаний закрыт.</strong> Показания можно подавать только с 20 по 25 число каждого месяца. 
                  Следующий период: <strong>{getNextAllowedPeriod()}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:flex min-h-screen">
        <div className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Показания счетчиков</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Внесите текущие показания</p>
              </div>
            </div>

            {/* Индикатор периода подачи показаний */}
            <div className={`mb-6 p-3 rounded-lg border-2 ${isInputAllowed 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${isInputAllowed ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${isInputAllowed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isInputAllowed ? 'Период подачи открыт' : 'Период подачи закрыт'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isInputAllowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isInputAllowed 
                  ? 'Сейчас можно подавать показания' 
                  : `Следующий период: ${getNextAllowedPeriod()}`
                }
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={handleBackToMain} 
              className="w-full mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white dark:hover:bg-gray-800"
            >
              <Home className="mr-2 h-4 w-4" />
              На главную
            </Button>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Статистика</h3>
              {meters.map((meter) => (
                <div key={meter.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    {meter.icon}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {meter.id === 'cold_water' && 'Холодная вода'}
                      {meter.id === 'hot_water' && 'Горячая вода'}
                      {meter.id === 'electricity' && 'Электричество'}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
                    {Number(meter.value).toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {meters.map((meter) => (
                <Card key={meter.id} className={`shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden transition-all hover:shadow-3xl hover:scale-[1.02] ${!isInputAllowed ? 'opacity-60' : ''}`}>
                  <CardHeader className={`${meter.color} text-white flex flex-row items-center py-6 px-6`}>
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        {meter.icon}
                      </div>
                      <span className="truncate">{meter.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-200 dark:border-gray-500 rounded-xl px-8 py-6 shadow-inner">
                          <div className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-100 text-center min-w-[160px]">
                            {Number(meter.value).toFixed(3)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                            {meter.id === 'electricity' ? 'кВт·ч' : 'м³'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                          Изменить показания
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleIncrement(meter.id, meter.step * 100)}
                            disabled={!isInputAllowed}
                            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-all transform hover:scale-[1.05] active:scale-[0.95] font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            +{meter.step * 100}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleIncrement(meter.id, meter.step * 10)}
                            disabled={!isInputAllowed}
                            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-all transform hover:scale-[1.05] active:scale-[0.95] font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            +{meter.step * 10}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleIncrement(meter.id, meter.step)}
                            disabled={!isInputAllowed}
                            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-all transform hover:scale-[1.05] active:scale-[0.95] font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            +{meter.step}
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleDecrement(meter.id, meter.step * 100)}
                            disabled={!isInputAllowed}
                            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all transform hover:scale-[1.05] active:scale-[0.95] font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            -{meter.step * 100}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleDecrement(meter.id, meter.step * 10)}
                            disabled={!isInputAllowed}
                            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all transform hover:scale-[1.05] active:scale-[0.95] font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            -{meter.step * 10}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleDecrement(meter.id, meter.step)}
                            disabled={!isInputAllowed}
                            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all transform hover:scale-[1.05] active:scale-[0.95] font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            -{meter.step}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="xl:col-span-2 pt-4">
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={isLoading || !isInputAllowed}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Сохранение...
                    </div>
                  ) : !isInputAllowed ? (
                    <>
                      <Clock className="w-5 h-5 mr-2" />
                      Период подачи показаний закрыт
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Подтвердить ввод показаний
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p>Показания принимаются ежемесячно с 20 по 25 число</p>
              {!isInputAllowed && (
                <p className="text-red-500 dark:text-red-400 mt-2">
                  Следующий период подачи: <strong>{getNextAllowedPeriod()}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        {/* Уведомление о периоде подачи показаний для мобильной версии */}
        {!isInputAllowed && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Период подачи показаний закрыт.</strong> Показания можно подавать только с 20 по 25 число каждого месяца. 
                  Следующий период: <strong>{getNextAllowedPeriod()}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Показания счетчиков
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Внесите текущие показания приборов учета
            </p>
          </div>

          {/* Индикатор периода подачи показаний для мобильной версии */}
          <div className={`mb-6 p-4 rounded-lg border-2 ${isInputAllowed 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
          }`}>
            <div className="flex items-center gap-2 justify-center">
              <Clock className={`h-5 w-5 ${isInputAllowed ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${isInputAllowed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {isInputAllowed ? 'Период подачи открыт' : 'Период подачи закрыт'}
              </span>
            </div>
            <p className={`text-xs mt-2 text-center ${isInputAllowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isInputAllowed 
                ? 'Сейчас можно подавать показания' 
                : `Следующий период: ${getNextAllowedPeriod()}`
              }
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Button 
              variant="outline" 
              onClick={handleBackToMain} 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all transform hover:scale-[1.02]"
            >
              <Home className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {meters.map((meter) => (
              <Card key={meter.id} className={`shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden transition-all hover:shadow-3xl hover:scale-[1.01] ${!isInputAllowed ? 'opacity-60' : ''}`}>
                <CardHeader className={`${meter.color} text-white flex flex-row items-center py-4 px-6`}>
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl font-semibold">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {meter.icon}
                    </div>
                    <span className="truncate">{meter.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-200 dark:border-gray-500 rounded-xl px-6 py-4 shadow-inner">
                        <div className="text-3xl md:text-4xl font-mono font-bold text-gray-800 dark:text-gray-100 text-center min-w-[140px]">
                          {Number(meter.value).toFixed(3)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                          {meter.id === 'electricity' ? 'кВт·ч' : 'м³'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Изменить показания
                      </div>
                     
                      <div className="grid grid-cols-3 gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleIncrement(meter.id, meter.step * 100)}
                          disabled={!isInputAllowed}
                          className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          +{meter.step * 100}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleIncrement(meter.id, meter.step * 10)}
                          disabled={!isInputAllowed}
                          className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          +{meter.step * 10}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleIncrement(meter.id, meter.step)}
                          disabled={!isInputAllowed}
                          className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          +{meter.step}
                        </Button>
                      </div>
                
                      <div className="grid grid-cols-3 gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleDecrement(meter.id, meter.step * 100)}
                          disabled={!isInputAllowed}
                          className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          -{meter.step * 100}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleDecrement(meter.id, meter.step * 10)}
                          disabled={!isInputAllowed}
                          className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          -{meter.step * 10}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleDecrement(meter.id, meter.step)}
                          disabled={!isInputAllowed}
                          className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          -{meter.step}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          
            <div className="pt-4">
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading || !isInputAllowed}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Сохранение...
                  </div>
                ) : !isInputAllowed ? (
                  <>
                    <Clock className="w-5 h-5 mr-2" />
                    Период подачи показаний закрыт
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Подтвердить ввод показаний
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>Показания принимаются ежемесячно с 20 по 25 число</p>
            {!isInputAllowed && (
              <p className="text-red-500 dark:text-red-400 mt-2">
                Следующий период подачи: <strong>{getNextAllowedPeriod()}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meters;
