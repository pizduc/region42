
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ListChecks, Newspaper, User, Clock, ArrowRight, Wrench, Download, UserPlus } from "lucide-react";
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
    isSpecialUser && {
      title: "Все заявки",
      icon: Wrench,
      description: "Просмотр всех заявок на ремонт",
      path: "/all-repair-requests",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    isSpecialUser && {
      title: "Управление тарифами",
      icon: CreditCard,
      description: "Настройка и управление тарифами",
      path: "/tariff-management",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    isSpecialUser && {
      title: "Регистрация",
      icon: UserPlus,
      description: "Регистрация новых пользователей",
      path: "/register",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900">
      <div className="w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3 text-white">
            Добро пожаловать
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 mb-3 sm:mb-4 text-white">
            {userAddress ? (
              `${userAddress.city}, ул. ${userAddress.street}, д. ${userAddress.house}, кв. ${userAddress.apartment}`
            ) : (
              "Адрес не найден"
            )}
          </p>
          <div className="flex items-center text-xs sm:text-sm bg-white/20 p-2 sm:p-3 rounded-lg backdrop-blur-sm text-white max-w-fit">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span>
              Последний вход: {new Date().toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {menuItems.map((item) => (
              <Card
                key={item.title}
                className="cursor-pointer group bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                onClick={() => {
                  if (item.isDownload) {
                    window.location.href = item.path; 
                  } else {
                    navigate(item.path); 
                  }
                }}
              >
                <div className={`h-1 sm:h-2 bg-gradient-to-r ${item.color} group-hover:h-2 sm:group-hover:h-3 transition-all duration-300`}></div>
                <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-white group-hover:text-gray-100 transition-colors">
                      {item.title}
                    </CardTitle>
                    <div className={`p-2 sm:p-3 rounded-full ${item.bgColor} ${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
                  <p className="text-slate-300 mb-3 sm:mb-4 leading-relaxed text-xs sm:text-sm lg:text-base">
                    {item.description}
                  </p>
                  <div className="flex items-center text-xs sm:text-sm text-slate-400 group-hover:text-blue-400 transition-colors">
                    <span className="font-medium">Перейти</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center py-4 sm:py-6">
          <p className="text-slate-400 text-xs sm:text-sm">
            Личный кабинет жильца • {currentMonth}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
