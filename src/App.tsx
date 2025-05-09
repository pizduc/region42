import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Payments from "./pages/Payments";
import Meters from "./pages/Meters";
import Profile from "./pages/Profile";
import News from "./pages/News";
import RepairRequests from "./pages/RepairRequests";
import Register from "./pages/Register";  // Исправленный импорт страницы регистрации для специальных пользователей
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PaymentSuccess from './pages/PaymentSuccess';

const queryClient = new QueryClient();

// Защищенный маршрут, доступный только для аутентифицированных пользователей
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Специальный маршрут, скрывающий страницы для specialUser
const SpecialUserRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSpecialUser } = useAuth();
  if (isSpecialUser) {
    return <Navigate to="/Index" replace />;
  }
  return <>{children}</>;
};

// Специальный маршрут, который показывает страницы только для specialUser
const SpecialUserOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSpecialUser } = useAuth();
  if (!isSpecialUser) {
    return <Navigate to="/" replace />; // Перенаправляем на главную, если пользователь не специальный
  }
  return <>{children}</>;
};

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              {/* Страница оплаты и показаний скрыта для SpecialUser */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <SpecialUserRoute>
                      <Payments />
                    </SpecialUserRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meters"
                element={
                  <ProtectedRoute>
                    <SpecialUserRoute>
                      <Meters />
                    </SpecialUserRoute>
                  </ProtectedRoute>
                }
              />
              {/* Страница профиля доступна для всех */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news"
                element={
                  <ProtectedRoute>
                    <News />
                  </ProtectedRoute>
                }
              />
              {/* Страница регистрации доступна только для специального пользователя */}
              <Route
                path="/register"
                element={
                  <ProtectedRoute>
                    <SpecialUserOnlyRoute>
                      <Register />
                    </SpecialUserOnlyRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repair-requests"
                element={
                  <ProtectedRoute>
                    <SpecialUserRoute>
                      <RepairRequests />
                    </SpecialUserRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-success"
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
