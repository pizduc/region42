
import React from "react";
import { Button } from "@/components/ui/button";

interface MeterControlsProps {
  id: string;
  step: number;
  onIncrement: (id: string, amount: number) => void;
  onDecrement: (id: string, amount: number) => void;
}

export const MeterControls: React.FC<MeterControlsProps> = ({
  id,
  step,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-md">
      <Button type="button" variant="outline" onClick={() => onIncrement(id, step * 100)}>
        +{step * 100}
      </Button>
      <Button type="button" variant="outline" onClick={() => onIncrement(id, step * 10)}>
        +{step * 10}
      </Button>
      <Button type="button" variant="outline" onClick={() => onIncrement(id, step)}>
        +{step}
      </Button>
      
      <Button type="button" variant="outline" onClick={() => onDecrement(id, step * 100)}>
        -{step * 100}
      </Button>
      <Button type="button" variant="outline" onClick={() => onDecrement(id, step * 10)}>
        -{step * 10}
      </Button>
      <Button type="button" variant="outline" onClick={() => onDecrement(id, step)}>
        -{step}
      </Button>
    </div>
  );
};
