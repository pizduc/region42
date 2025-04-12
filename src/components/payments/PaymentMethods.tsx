import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, QrCode, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

type PaymentMethod = "card" | "sbp" | "fast" | null;

interface PaymentMethodsProps {
  lastReadings: any;
  prevReadings: any;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const tariffs = {
  coldWater: 80.69,
  hotWater: 17.51,
  electricity: 4.7,
  heating: 500,
  maintenance: 300,
};

export const PaymentMethods = ({
  lastReadings,
  prevReadings,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onSubmit,
  isLoading,
  disabled
}: PaymentMethodsProps) => {
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (lastReadings && prevReadings) {
      calculateTotal();
    }
  }, [lastReadings, prevReadings]);

  const calculateTotal = () => {
    const coldWaterUsage = (lastReadings.cold_water || 0) - (prevReadings.cold_water || 0);
    const hotWaterUsage = (lastReadings.hot_water || 0) - (prevReadings.hot_water || 0);
    const electricityUsage = (lastReadings.electricity || 0) - (prevReadings.electricity || 0);

    const total =
      tariffs.heating +
      tariffs.maintenance +
      coldWaterUsage * tariffs.coldWater +
      hotWaterUsage * tariffs.hotWater +
      electricityUsage * tariffs.electricity;

    setTotalAmount(total);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Итого к оплате:</span>
            <span>{totalAmount.toFixed(2)} ₽</span>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Способы оплаты:
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={selectedPaymentMethod === "card" ? "default" : "outline"}
                className={`h-20 flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedPaymentMethod === "card" ? "border-2 border-primary" : ""
                }`}
                onClick={() => setSelectedPaymentMethod("card")}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Банковской картой</span>
              </Button>
              <Button
                variant={selectedPaymentMethod === "sbp" ? "default" : "outline"}
                className={`h-20 flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedPaymentMethod === "sbp" ? "border-2 border-primary" : ""
                }`}
                onClick={() => setSelectedPaymentMethod("sbp")}
              >
                <QrCode className="h-6 w-6" />
                <span className="text-sm">СБП</span>
              </Button>
              <Button
                variant={selectedPaymentMethod === "fast" ? "default" : "outline"}
                className={`h-20 flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedPaymentMethod === "fast" ? "border-2 border-primary" : ""
                }`}
                onClick={() => setSelectedPaymentMethod("fast")}
              >
                <Wallet className="h-6 w-6" />
                <span className="text-sm">Система быстрых платежей</span>
              </Button>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={disabled || isLoading}
            onClick={onSubmit}
          >
            {isLoading ? "Создание платежа..." : "Перейти к оплате"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
