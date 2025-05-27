
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ListChecks, Newspaper, User, Clock, ArrowRight, Wrench, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [userAddress, setUserAddress] = useState(null);
  const [isSpecialUser, setIsSpecialUser] = useState(false);
  const [news, setNews] = useState([]);

  useEffect(() => {
    setIsSpecialUser(localStorage.getItem("isSpecialUser") === "true");

    fetch("https://best-yard.onrender.com/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data))
      .catch((error) => console.error("Ошибка загрузки новостей:", error));

    const userId = localStorage.getItem("userId");  
    if (userId) {
      fetch(`https://best-yard.onrender.com/api/user/addresses/${userId}`, {  
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.length > 0) {
            const address = data[0]; 
            setUserAddress({
              city: address.city,
              street: address.street,
              house: address.house,
              apartment: address.apartment,
            });
            localStorage.setItem("userAddress", JSON.stringify(address));  
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
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    !isSpecialUser && {
      title: "Показания",
      icon: ListChecks,
      description: "Передача показаний счетчиков",
      path: "/meters",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Новости",
      icon: Newspaper,
      description: "Последние новости и объявления",
      path: "/news",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    !isSpecialUser && {
      title: "Заявки на ремонт",
      icon: Wrench,
      description: "Оформление заявок на ремонт",
      path: "/repair-requests",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Профиль",
      icon: User,
      description: "Управление личными данными",
      path: "/profile",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Скачать приложение",  
      icon: Download,
      description: "Скачайте наше приложение для удобства использования",
      path: "https://region42.onrender.com/Region42.apk",  
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400", 
      isDownload: true, 
    },
  ].filter(Boolean); 

  const currentMonth = new Date().toLocaleString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Добро пожаловать</h1>
            <p className="text-xl opacity-90 mb-4">
              {userAddress ? (
                `${userAddress.city}, ул. ${userAddress.street}, д. ${userAddress.house}, кв. ${userAddress.apartment}`
              ) : (
                "Адрес не найден"
              )}
            </p>
            <div className="flex items-center text-sm bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Clock className="h-5 w-5 mr-2" />
              <span>
                Последний вход: {new Date().toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Card
              key={item.title}
              className="cursor-pointer group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              onClick={() => {
                if (item.isDownload) {
                  window.location.href = item.path; 
                } else {
                  navigate(item.path); 
                }
              }}
            >
              <div className={`h-2 bg-gradient-to-r ${item.color} group-hover:h-3 transition-all duration-300`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {item.title}
                  </CardTitle>
                  <div className={`p-3 rounded-full ${item.bgColor} ${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <span className="font-medium">Перейти</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Личный кабинет жильца • {currentMonth}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
