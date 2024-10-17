import {useContext} from "react";
import {WalletContext} from "./context";

export function useWallet() {
  return useContext(WalletContext);
}
