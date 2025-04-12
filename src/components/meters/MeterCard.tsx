import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MeterDisplay } from "./MeterDisplay";
import { MeterControls } from "./MeterControls";

interface MeterCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  value: number;
  step: number;
  color: string;
  type: "reading" | "consumption";
  onTypeChange: (value: "reading" | "consumption") => void;
  onIncrement: (id: string, amount: number) => void;
  onDecrement: (id: string, amount: number) => void;
}

export const MeterCard: React.FC<MeterCardProps> = ({
  id,
  title,
  icon,
  value,
  step,
  color,
  type,
  onTypeChange,
  onIncrement,
  onDecrement,
}) => {
  return (
    <Card>
      <CardHeader className={`${color} text-white rounded-t-lg flex flex-row items-center space-y-0`}>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <RadioGroup value={type} onValueChange={(value) => onTypeChange(value as "reading" | "consumption")} className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reading" id={`reading-${id}`} />
              <Label htmlFor={`reading-${id}`} className="dark:text-gray-200">Показание</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="consumption" id={`consumption-${id}`} />
              <Label htmlFor={`consumption-${id}`} className="dark:text-gray-200">Расход</Label>
            </div>
          </RadioGroup>

          <div className="flex flex-col items-center space-y-6">
            <MeterDisplay value={value} />
            <MeterControls 
              id={id} 
              step={step} 
              onIncrement={onIncrement} 
              onDecrement={onDecrement} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};