
import React from "react";
import { MeterCard } from "./MeterCard";
import { MeterData } from "@/types/meters";

interface MetersListProps {
  meters: MeterData[];
  type: "reading" | "consumption";
  onTypeChange: (value: "reading" | "consumption") => void;
  onIncrement: (id: string, amount: number) => void;
  onDecrement: (id: string, amount: number) => void;
}

export const MetersList: React.FC<MetersListProps> = ({
  meters,
  type,
  onTypeChange,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="space-y-6">
      {meters.map((meter) => (
        <MeterCard
          key={meter.id}
          id={meter.id}
          title={meter.title}
          icon={meter.icon}
          value={meter.value}
          step={meter.step}
          color={meter.color}
          type={type}
          onTypeChange={onTypeChange}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      ))}
    </div>
  );
};
