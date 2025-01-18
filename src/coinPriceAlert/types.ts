export interface CoinAlertConfig {
    coinCode: string;
    direction: "GoDown" | "GoUp";
    value: number;
    step: number;
  }
  