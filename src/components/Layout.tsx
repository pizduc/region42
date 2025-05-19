import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import Footer from "./Footer"; 

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background relative flex flex-col">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main className="flex-grow">{children}</main>
        <Footer /> 
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex-1 p-6 page-transition flex flex-col">
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>
            <div className="flex-grow">{children}</div>
          </main>
        </div>
        <Footer /> 
      </div>
    </SidebarProvider>
  );
};
