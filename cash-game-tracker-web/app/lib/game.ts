import { Account } from "./account";

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
  accountid: string;
  amount: string;
  time: number;
  side: "PAYER" | "RECIPIENT";
}

export interface Balances {
  balances: Balance[];
}

export interface Balance {
  accountId: string;
  name: string;
  balance: string;
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
}
