import { LoadingModuleData } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface Game {
  id: string;
  createTime: number;
  buyIns: BuyIn[];
  cashOuts: Record<string, CashOut>;
  payments: Payment[];
}

export interface BuyIn {
  id: string;
  accountId: string;
  amount: string;
  createTime: number;
}

export interface CashOut {
  amount: string;
  time: number;
}

export interface Payment {
  id: string;
  accountid: string;
  amount: string;
  time: number;
  side: "PAYER" | "RECIPIENT";
}