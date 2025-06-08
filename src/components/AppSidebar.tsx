
import * as React from "react";
import {
  CreditCard,
  Home,
  ListChecks,
  Newspaper,
  User,
  LogOut,
  Wrench,
  UserPlus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function AppSidebar() {
  const navigate = useNavigate();
  const [isSpecialUser, setIsSpecialUser] = React.useState(false);

  React.useEffect(() => {
    setIsSpecialUser(localStorage.getItem("isSpecialUser") === "true");
  }, []);

  const menuItems = [
    { title: "Главная", icon: Home, path: "/" },
    !isSpecialUser && { title: "Оплата", icon: CreditCard, path: "/payments" },
    !isSpecialUser && { title: "Показания", icon: ListChecks, path: "/meters" },
    { title: "Новости", icon: Newspaper, path: "/news" },
    !isSpecialUser && { title: "Заявки на ремонт", icon: Wrench, path: "/repair-requests" },
    isSpecialUser && { title: "Все заявки", icon: Wrench, path: "/all-repair-requests" },
    isSpecialUser && { title: "Управление тарифами", icon: CreditCard, path: "/tariff-management" },
    { title: "Профиль", icon: User, path: "/profile" },
    isSpecialUser && { title: "Регистрация", icon: UserPlus, path: "/register" },
  ].filter(Boolean) as Array<{ title: string; icon: any; path: string }>;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("userAddress");
    localStorage.removeItem("userId");
    localStorage.removeItem("isSpecialUser");
    navigate("/login");
  };

  return (
    <Sidebar className="border-r bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl">
      <SidebarHeader className="border-b border-gray-700/50 p-6 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Управление ЖКХ</h2>
            <p className="text-xs text-gray-400">Личный кабинет</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-transparent">
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">
            Навигация
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigate(item.path)}
                    className="text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20 transition-all duration-200 rounded-lg group border border-transparent hover:border-blue-500/30"
                  >
                    <item.icon className="h-5 w-5 group-hover:text-blue-400 transition-colors" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto px-3 pb-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 rounded-lg group border border-transparent hover:border-red-500/30"
                >
                  <LogOut className="h-5 w-5 group-hover:text-red-300 transition-colors" />
                  <span className="font-medium">Выйти</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
