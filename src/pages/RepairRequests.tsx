
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Wrench, Calendar, Clock, Phone, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RepairRequest {
  type: string;
  description: string;
  date?: string;
  time?: string;
  phone?: string;
}

const RepairRequests = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<{ phone: string; email: string } | null>(null);
  const [request, setRequest] = useState<RepairRequest>({
    type: "plumbing",
    description: "",
    date: "",
    time: "",
    phone: "",
  });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  const requestTypes = [
    { id: "plumbing", label: "Сантехника", icon: "🔧" },
    { id: "electrical", label: "Электрика", icon: "⚡" },
    { id: "construction", label: "Строительные работы", icon: "🏗️" },
    { id: "other", label: "Другое", icon: "🛠️" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      let cleaned = value.replace(/\D/g, "");
      if (cleaned.startsWith("7")) cleaned = cleaned.substring(1);
      if (cleaned.length <= 10) {
        let formatted = "+7";
        if (cleaned.length > 0) formatted += " (" + cleaned.substring(0, 3);
        if (cleaned.length >= 4) formatted += ") " + cleaned.substring(3, 6);
        if (cleaned.length >= 7) formatted += "-" + cleaned.substring(6, 8);
        if (cleaned.length >= 9) formatted += "-" + cleaned.substring(8, 10);
        setRequest(prev => ({ ...prev, [name]: formatted }));
      }
    } else {
      setRequest(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) => {
    setRequest(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request.description) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, опишите проблему",
        variant: "destructive",
      });
      return;
    }

    if (!request.phone || request.phone.length < 10) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите корректный номер телефона",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("https://best-yard.onrender.com/api/applications2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...request,
          email: userData?.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ошибка при отправке заявки");
      }

      toast({
        title: "Заявка отправлена",
        description: "Ваша заявка успешно зарегистрирована",
      });

      setRequest({
        type: "plumbing",
        description: "",
        date: "",
        time: "",
        phone: "",
      });

    } catch (error: any) {
      console.error("Ошибка при отправке заявки:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Произошла ошибка при отправке заявки",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                <Wrench className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Заявки на ремонт
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Оформите заявку на устранение неисправностей
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleBackToMain}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
            >
              <Home className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                  <Wrench className="h-5 w-5" />
                </div>
                Создать заявку
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Тип проблемы
                  </Label>
                  <Select value={request.type} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Выберите тип проблемы" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {requestTypes.map(type => (
                        <SelectItem 
                          key={type.id} 
                          value={type.id}
                          className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Описание проблемы
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={request.description}
                    onChange={handleChange}
                    placeholder="Опишите вашу проблему подробнее..."
                    className="min-h-[120px] transition-all focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Предпочтительная дата
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      value={request.date}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Необязательно</p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Предпочтительное время
                    </Label>
                    <Input
                      type="time"
                      id="time"
                      name="time"
                      value={request.time}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Необязательно</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Номер телефона
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={request.phone}
                    onChange={handleChange}
                    placeholder="+7 (___) ___-__-__"
                    className="transition-all focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 font-mono"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  disabled={isSubmitting}
                >
                  <Wrench className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Отправка..." : "Отправить заявку"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Заявки обрабатываются в рабочие дни с 9:00 до 18:00
          </p>
        </div>
      </div>
    </div>
  );
};

export default RepairRequests;
