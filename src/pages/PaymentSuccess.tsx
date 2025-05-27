
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Receipt, ArrowLeft } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleBackToPayments = () => {
    navigate('/payments');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg animate-pulse">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Оплата успешна!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ваш платеж был успешно обработан
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
              <Receipt className="w-6 h-6 text-green-600 dark:text-green-400" />
              Платеж завершен
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✅ Платеж успешно обработан
                </p>
                <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                  Информация о платеже сохранена в вашем личном кабинете
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleBackToMain}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Вернуться на главную
                </Button>
                
                <Button 
                  onClick={handleBackToPayments}
                  variant="outline"
                  className="w-full border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  К списку платежей
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Спасибо за использование нашего сервиса!</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
