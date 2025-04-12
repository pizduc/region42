import {
  CreditCard,
  Home,
  ListChecks,
  Newspaper,
  User,
  LogOut,
  MessageSquare,
  Wrench,
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
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function AppSidebar() {
  const navigate = useNavigate();
  const [isSpecialUser, setIsSpecialUser] = useState(false);

  useEffect(() => {
    setIsSpecialUser(localStorage.getItem("isSpecialUser") === "true");
  }, []);

  const menuItems = [
    { title: "Главная", icon: Home, path: "/" },
    !isSpecialUser && { title: "Оплата", icon: CreditCard, path: "/payments" },
    !isSpecialUser && { title: "Показания", icon: ListChecks, path: "/meters" },
    { title: "Новости", icon: Newspaper, path: "/news" },
    !isSpecialUser && { title: "Чат с поддержкой", icon: MessageSquare, path: "/support-chat" },
    !isSpecialUser && { title: "Заявки на ремонт", icon: Wrench, path: "/repair-requests" },
    { title: "Профиль", icon: User, path: "/profile" },
  ].filter(Boolean); // Убираем null/false значения  

  const handleLogout = () => {
    localStorage.removeItem("userAddress");
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Меню</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={() => navigate(item.path)}>
                    <button className="w-full flex items-center gap-2 px-4 py-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLogout}>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-destructive">
                    <LogOut className="h-5 w-5" />
                    <span>Выйти</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
