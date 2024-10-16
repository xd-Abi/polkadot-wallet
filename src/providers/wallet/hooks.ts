import {useContext} from "react";
import {WalletContext} from "./context";

export function useWallet() {
  const wallet = useContext(WalletContext);

  return {wallet};
}
