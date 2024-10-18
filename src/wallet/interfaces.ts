export interface Wallet {
  isReady: boolean;
  address: string;
  balance: number;
  transactions: Transaction[];
  transfer: (recipient: string, amount: number) => Promise<void>;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  status: "pending" | "successful" | "failed";
  amount: number;
  timestamp: Date;
}
