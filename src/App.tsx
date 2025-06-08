
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
import Register from "./pages/Register";  
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PaymentSuccess from './pages/PaymentSuccess';
import AllRepairRequests from "./pages/AllRepairRequests";
import TariffManagement from "./pages/TariffManagement";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const SpecialUserRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSpecialUser } = useAuth();
  if (isSpecialUser) {
    return <Navigate to="/profile" replace />;
  }
  return <>{children}</>;
};

const SpecialUserOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSpecialUser } = useAuth();
  if (!isSpecialUser) {
    return <Navigate to="/" replace />; 
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
                path="/all-repair-requests"
                element={
                  <ProtectedRoute>
                    <SpecialUserOnlyRoute>
                      <AllRepairRequests />
                    </SpecialUserOnlyRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tariff-management"
                element={
                  <ProtectedRoute>
                    <SpecialUserOnlyRoute>
                      <TariffManagement />
                    </SpecialUserOnlyRoute>
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
