import {KeyringPair} from "@polkadot/keyring/types";

export interface Wallet {
  address: string;
  mnemonic: string;
  balance: number;
  keyPair: KeyringPair | null;
  isReady: boolean;
  transactions: Transaction[];
  transfer: (address: string, amount: number) => Promise<void>;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  status: "pending" | "successful" | "failed";
  amount: number;
  timestamp: Date;
}
