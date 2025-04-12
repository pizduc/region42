import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface ServicesListProps {
  services: Service[];
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  fixedCharges: { heating: number; maintenance: number }; // Фиксированные начисления
}

export const ServicesList = ({
  services,
  selectedServices,
  setSelectedServices,
  fixedCharges
}: ServicesListProps) => {
  const [totalAmount, setTotalAmount] = useState(0);

  // Функция для пересчета суммы к оплате
  useEffect(() => {
    const selectedServicesTotal = services
      .filter((service) => selectedServices.includes(service.id))
      .reduce((acc, service) => acc + service.price, 0);

    setTotalAmount(selectedServicesTotal + fixedCharges.heating + fixedCharges.maintenance);
  }, [selectedServices, services, fixedCharges]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Начисления</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground mb-2">
            <div className="col-span-1"></div>
            <div className="col-span-7">Услуга</div>
            <div className="col-span-2 text-right">Начислено</div>
            <div className="col-span-2 text-right">К оплате</div>
          </div>

          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="grid grid-cols-12 items-center">
                <div className="col-span-1">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={(checked) => {
                      setSelectedServices(
                        checked
                          ? [...selectedServices, service.id]
                          : selectedServices.filter((id) => id !== service.id)
                      );
                    }}
                  />
                </div>
                <Label htmlFor={service.id} className="col-span-7">
                  {service.name}
                </Label>
                <div className="col-span-2 text-right">
                  {service.price.toFixed(2)}
                </div>
                <div className="col-span-2 text-right">
                  {selectedServices.includes(service.id) ? service.price.toFixed(2) : "0.00"}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="text-lg font-semibold">
              <span>Общая сумма к оплате:</span>
              <span className="ml-2">{totalAmount.toFixed(2)} ₽</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
