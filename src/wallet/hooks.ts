import {useContext} from "react";
import {WalletContext} from "./provider";

export function useWallet() {
  return useContext(WalletContext);
}
