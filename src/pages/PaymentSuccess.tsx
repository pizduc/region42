import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Receipt, ArrowLeft, Download, Mail } from "lucide-react";
import { generateAndDownloadReceipt } from '@/utils/receiptGenerator';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleBackToPayments = () => {
    navigate('/payments');
  };

  const handleDownloadReceipt = () => {
    try {
      const receiptDataString = localStorage.getItem('lastPaymentReceipt');
      if (receiptDataString) {
        const receiptData = JSON.parse(receiptDataString);
        generateAndDownloadReceipt(receiptData);

        toast({
          title: "Чек скачан",
          description: "Чек об оплате скачан на ваше устройство",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Данные чека не найдены",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Ошибка при скачивании чека:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скачать чек",
        variant: "destructive",
      });
    }
  };

  const handleSendByEmail = () => {
    setEmailModalOpen(true);
  };

  const submitEmail = async () => {
    setSending(true);
    try {
      const receiptDataString = localStorage.getItem('lastPaymentReceipt');
      if (!receiptDataString) {
        toast({
          title: "Ошибка",
          description: "Данные чека не найдены",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("https://best-yard.onrender.com/api/email/send-receipt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, receiptData: JSON.parse(receiptDataString) })
});

      if (!response.ok) {
        throw new Error("Ошибка при отправке письма");
      }

      toast({
        title: "Чек отправлен",
        description: `Чек успешно отправлен на ${email}`,
      });
      setEmailModalOpen(false);
      setEmail("");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить чек",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
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
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleDownloadReceipt}
                    variant="outline"
                    className="border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Скачать чек
                  </Button>

                  <Button
                    onClick={handleSendByEmail}
                    variant="outline"
                    className="border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Отправить
                  </Button>
                </div>

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

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отправка чека по email</DialogTitle>
            <DialogDescription>
              Введите адрес электронной почты, на который будет отправлен чек об оплате
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={submitEmail} disabled={sending}>
            {sending ? "Отправка..." : "Отправить"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentSuccess;
