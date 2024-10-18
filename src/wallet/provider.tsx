import React, {PropsWithChildren, useEffect, useState} from "react";
import {ScProvider} from "@polkadot/rpc-provider";
import {
  cryptoWaitReady,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
} from "@polkadot/util-crypto";
import * as Sc from "@substrate/connect";
import {ApiPromise, Keyring} from "@polkadot/api";
import {KeyringPair} from "@polkadot/keyring/types";
import {Wallet} from "./interfaces";

export const WalletContext = React.createContext<Wallet>({
  isReady: false,
  address: "",
  balance: 0,
  transactions: [],
  transfer: async (recipient: string, amount: number) => {},
});

export function WalletProvider(props: PropsWithChildren) {
  const [node, setNode] = useState<ApiPromise | null>(null);
  const [keyPair, setKeyPair] = useState<KeyringPair | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initNode = async () => {
      const provider = new ScProvider(Sc, Sc.WellKnownChain.westend2);
      await provider.connect();
      const node = await ApiPromise.create({provider});
      setNode(node);
    };

    const setupWallet = async () => {
      const mnemonic = localStorage.getItem("mnemonic") || mnemonicGenerate();

      if (!mnemonicValidate(mnemonic)) {
        throw Error("Invalid mnemonic generated or parsed.");
      }

      const keyring = new Keyring({type: "sr25519"});
      const miniSecret = mnemonicToMiniSecret(mnemonic);
      const keyPair = keyring.addFromSeed(miniSecret);

      setKeyPair(keyPair);
    };

    const loadTransferHistory = async () => {
      // @TODO: Load all previous transfers and balance
    };

    initNode()
      .then(cryptoWaitReady)
      .then(setupWallet)
      .then(loadTransferHistory)
      .then(() => setIsLoading(false))
      .catch(console.error);
  }, []);

  const transfer = async (recipient: string, amount: number) => {};

  return (
    <WalletContext.Provider
      value={{
        isReady: !isLoading,
        address: keyPair?.address ?? "",
        balance: 0,
        transactions: [],
        transfer: transfer,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
}
