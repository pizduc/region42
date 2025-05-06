import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import InputMask from 'react-input-mask';  // Подключаем библиотеку для маски

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
    { id: "plumbing", label: "Сантехника" },
    { id: "electrical", label: "Электрика" },
    { id: "construction", label: "Строительные работы" },
    { id: "other", label: "Другое" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequest(prev => ({ ...prev, [name]: value }));
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

    if (!request.phone) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите номер телефона",
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
        phone: userData?.phone || "",
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Заявки на ремонт</h1>
        <Button variant="outline" onClick={handleBackToMain}>
          <Home className="mr-2 h-4 w-4" />
          На главную
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Создать заявку
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Тип проблемы
                </label>
                <Select
                  value={request.type}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите тип проблемы" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Описание проблемы
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={request.description}
                  onChange={handleChange}
                  placeholder="Опишите вашу проблему подробнее..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium">
                    Предпочтительная дата (необязательно)
                  </label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={request.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="time" className="text-sm font-medium">
                    Предпочтительное время (необязательно)
                  </label>
                  <Input
                    type="time"
                    id="time"
                    name="time"
                    value={request.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Номер телефона
                </label>
                <InputMask
                  mask="+7 (999) 999-99-99"
                  value={request.phone || ""}
                  onChange={handleChange}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      id="phone"
                      name="phone"
                      placeholder="+7 (___) ___-__-__"
                      required
                    />
                  )}
                </InputMask>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Отправить заявку"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RepairRequests;
