
import { ReactNode } from "react";

export interface MeterData {
  id: string;
  title: string;
  icon: ReactNode;
  value: number;
  step: number;
  color: string;
}
