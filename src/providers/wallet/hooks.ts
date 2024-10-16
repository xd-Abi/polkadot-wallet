import {useContext} from "react";
import {WalletContext} from "./context";
import {useNode} from "../node";
import {decodeAddress} from "@polkadot/util-crypto";

export function useWallet() {
  const {api, isReady} = useNode();
  const wallet = useContext(WalletContext);

  const transfer = async (address: string, amount: number) => {
    if (!isReady || !api || !wallet.isReady || !wallet.keyPair) {
      console.warn("Not ready to transfer yet");
      return;
    }

    const to = decodeAddress(address);
    const transfer = api?.tx.balances.transferAllowDeath(to, BigInt(amount));
    await transfer.signAndSend(wallet.keyPair);
  };

  return {wallet, transfer};
}
