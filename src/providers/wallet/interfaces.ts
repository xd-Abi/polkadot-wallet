import {Keyring} from "@polkadot/api";

export interface Wallet {
  address: string;
  mnemonic: string;
  balance: number;
  isReady: boolean;
}
