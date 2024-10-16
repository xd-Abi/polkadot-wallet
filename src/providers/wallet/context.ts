import React from "react";
import {Wallet} from "./interfaces";

export const WalletContext = React.createContext<Wallet>({
  address: "",
  balance: 0,
  mnemonic: "",
  keyPair: null,
  transactions: [],
  isReady: false,
});
