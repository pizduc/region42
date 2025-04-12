
import React from "react";

interface MeterDisplayProps {
  value: number;
}

export const MeterDisplay: React.FC<MeterDisplayProps> = ({ value }) => {
  return (
    <div className="w-full max-w-md flex justify-center">
      <div className="text-4xl font-mono bg-white dark:bg-gray-800 border rounded-md px-4 py-2 w-48 text-center dark:text-white">
        {Number(value).toFixed(3)}
      </div>
    </div>
  );
};
