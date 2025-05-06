import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ListChecks, Newspaper, User, Clock, ArrowRight, Wrench, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [userAddress, setUserAddress] = useState(null);
  const [isSpecialUser, setIsSpecialUser] = useState(false);
  const [news, setNews] = useState([]);

  useEffect(() => {
    setIsSpecialUser(localStorage.getItem("isSpecialUser") === "true");

    // Получаем новости с сервера
    fetch("https://best-yard.onrender.com/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data))
      .catch((error) => console.error("Ошибка загрузки новостей:", error));

    // Получаем адрес пользователя с сервера
    const accountNumber = localStorage.getItem("accountNumber");  // Лицевой счет из localStorage
    if (accountNumber) {
      fetch("/api/getUserAddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountNumber }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.city) {
            setUserAddress(data);  // Сохраняем адрес в состоянии
            localStorage.setItem("userAddress", JSON.stringify(data));  // Сохраняем в localStorage
          }
        })
        .catch((error) => console.error("Ошибка получения данных пользователя:", error));
    }
  }, []);

  const menuItems = [
    !isSpecialUser && {
      title: "Оплата",
      icon: CreditCard,
      description: "Оплата коммунальных услуг",
      path: "/payments",
      color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      iconColor: "text-blue-500",
    },
    !isSpecialUser && {
      title: "Показания",
      icon: ListChecks,
      description: "Передача показаний счетчиков",
      path: "/meters",
      color: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      iconColor: "text-green-500",
    },
    {
      title: "Новости",
      icon: Newspaper,
      description: "Последние новости и объявления",
      path: "/news",
      color: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
      iconColor: "text-amber-500",
    },
    !isSpecialUser && {
      title: "Чат с поддержкой",
      icon: MessageSquare,
      description: "Задайте вопрос специалисту",
      path: "/support-chat",
      color: "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200",
      iconColor: "text-indigo-500",
    },
    !isSpecialUser && {
      title: "Заявки на ремонт",
      icon: Wrench,
      description: "Оформление заявок на ремонт",
      path: "/repair-requests",
      color: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
      iconColor: "text-orange-500",
    },
    {
      title: "Профиль",
      icon: User,
      description: "Управление личными данными",
      path: "/profile",
      color: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
      iconColor: "text-purple-500",
    },
  ].filter(Boolean); // Убираем null/false элементы

  // Определяем текущий месяц
  const currentMonth = new Date().toLocaleString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary to-primary/70 rounded-2xl p-6 shadow-md text-white">
        <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать</h1>
        <p className="mt-2 opacity-90 text-lg">
          {userAddress ? (
            `${userAddress.city}, ул. ${userAddress.street}, д. ${userAddress.house}, кв. ${userAddress.apartment}`
          ) : (
            "Адрес не найден"
          )}
        </p>
        <div className="flex items-center mt-4 text-sm bg-white/10 p-3 rounded-lg backdrop-blur-sm">
          <Clock className="h-5 w-5 mr-2" />
          <span>
            Последний вход: {new Date().toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Card
            key={item.title}
            className={`cursor-pointer card-hover border ${item.color} shadow-sm hover:shadow-md transition-all`}
            onClick={() => navigate(item.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div className={`rounded-full p-2 ${item.iconColor} bg-white/80`}>
                <item.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <div className="mt-4 text-xs flex items-center text-gray-500 hover:text-primary">
                <span>Перейти</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
