import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentPeriodSelectProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  months: string[];
}

export const PaymentPeriodSelect = ({ selectedMonth, setSelectedMonth, months }: PaymentPeriodSelectProps) => {
  // Функция для получения текущего месяца в формате "Месяц Год"
  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleString("ru-RU", { month: "long", year: "numeric" });
  };

  // Делаем текущий месяц по умолчанию
  const currentMonth = getCurrentMonth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбор периода</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedMonth || currentMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите месяц" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
