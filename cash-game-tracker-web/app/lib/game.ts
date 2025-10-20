import { Account } from "./account";

export enum PaymentSide {
  PAYER = "PAYER",
  RECIPIENT = "RECIPIENT"
}

export enum SettlementStatus {
  SETTLED = "SETTLED",
  UNSETTLED = "UNSETTLED",
  OVERPAID = "OVERPAID"
}

export interface Game {
  id: string;
  createTime: number;
  buyIns: BuyIn[];
  cashOuts: Record<string, CashOut>;
  payments: Payment[];
  players: Record<string, Account>;
}

export interface BuyIn {
  id: string;
  accountId: string;
  amount: string;
  time: number;
}

export interface CashOut {
  amount: string;
  time: number;
}

export interface Payment {
  id: string;
  accountId: string;
  amount: string;
  time: number;
  side: PaymentSide;
}

export interface Balances {
  balances: Balance[];
  house: Balance;
}

export interface Balance {
  accountId: string;
  name: string;
  chipBalance: string;
  paymentBalance: string;
  outstanding: string;
  status: SettlementStatus;
}

export interface Transfers {
  transfers: Transfer[];
}

export interface Transfer {
  id?: string;
  type: string;
  amount: string;
  accountId: string;
  time: number;
  side?: PaymentSide;
}
