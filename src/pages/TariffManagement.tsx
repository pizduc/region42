
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Home, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  price: number;
  type: 'static' | 'floating';
}

const TariffManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        const response = await fetch('https://best-yard.onrender.com/api/tariffs');
        const data = await response.json();
        
        if (data.success) {
          setServices(data.tariffs);
        } else {
          const defaultServices: Service[] = [
            { id: "heating", name: "Отопление", price: 500, type: 'static' },
            { id: "maintenance", name: "Содержание жилья", price: 300, type: 'static' },
            { id: "electricity", name: "Электроснабжение", price: 4.70, type: 'floating' },
            { id: "hot_water", name: "Горячее водоснабжение", price: 17.51, type: 'floating' },
            { id: "cold_water", name: "Холодное водоснабжение", price: 80.69, type: 'floating' },
          ];
          setServices(defaultServices);
        }
      } catch (error) {
        console.error("Ошибка при загрузке тарифов:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить тарифы",
          variant: "destructive",
        });

        const defaultServices: Service[] = [
          { id: "heating", name: "Отопление", price: 500, type: 'static' },
          { id: "maintenance", name: "Содержание жилья", price: 300, type: 'static' },
          { id: "electricity", name: "Электроснабжение", price: 4.70, type: 'floating' },
          { id: "hot_water", name: "Горячее водоснабжение", price: 17.51, type: 'floating' },
          { id: "cold_water", name: "Холодное водоснабжение", price: 80.69, type: 'floating' },
        ];
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };

    fetchTariffs();
  }, []);

  const handlePriceChange = (serviceId: string, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, price } 
          : service
      )
    );
  };

  const saveTariffs = async () => {
    setSaving(true);
    try {
      const response = await fetch('https://best-yard.onrender.com/api/tariffs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tariffs: services }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Успешно сохранено",
          description: "Тарифы успешно обновлены",
        });
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось сохранить тарифы",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при сохранении тарифов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить тарифы",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  const staticServices = services.filter(s => s.type === 'static');
  const floatingServices = services.filter(s => s.type === 'floating');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка тарифов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Управление тарифами
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Редактирование стандартных тарифов для расчета платежей
          </p>
        </div>

        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handleBackToMain}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <Home className="mr-2 h-4 w-4" />
              На главную
            </Button>

            <Button 
              onClick={saveTariffs}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              {saving ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Статичные тарифы (фиксированная стоимость)
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Услуги с фиксированной ежемесячной стоимостью
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staticServices.map((service) => (
                  <div key={service.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20">
                    <div>
                      <Label className="font-medium text-gray-800 dark:text-gray-200">
                        {service.name}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={service.price}
                        onChange={(e) => handlePriceChange(service.id, e.target.value)}
                        className="w-full"
                        placeholder="Введите стоимость"
                      />
                      <span className="text-gray-600 dark:text-gray-400 font-medium">₽</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Стоимость за месяц
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                Плавающие тарифы (по счетчикам)
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Услуги, рассчитываемые по показаниям счетчиков
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {floatingServices.map((service) => (
                  <div key={service.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 rounded-lg bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-green-900/20">
                    <div>
                      <Label className="font-medium text-gray-800 dark:text-gray-200">
                        {service.name}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={service.price}
                        onChange={(e) => handlePriceChange(service.id, e.target.value)}
                        className="w-full"
                        placeholder="Введите тариф"
                      />
                      <span className="text-gray-600 dark:text-gray-400 font-medium">₽</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {service.id === 'electricity' ? 'За кВт·ч' : 
                       service.id === 'hot_water' || service.id === 'cold_water' ? 'За м³' : 'За единицу'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-0 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  ℹ️ Информация о тарифах
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• <strong>Статичные тарифы</strong> - фиксированная ежемесячная плата</li>
                  <li>• <strong>Плавающие тарифы</strong> - расчет по показаниям счетчиков</li>
                  <li>• Изменения применяются ко всем новым расчетам</li>
                  <li>• Сохраните изменения для применения новых тарифов</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Изменения тарифов влияют на расчет всех будущих платежей</p>
        </div>
      </div>
    </div>
  );
};

export default TariffManagement;
