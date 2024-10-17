import {useEffect, useState} from "react";
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
import {Loading} from "./loading";
import {BalanceCard} from "./balance";
import {ActionsPanel} from "./actions";

export function Wallet() {
  const [node, setNode] = useState<ApiPromise | null>(null);
  const [keyPair, setKeyPair] = useState<KeyringPair | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      .then(() => setLoading(false))
      .catch(console.error);
  }, []);

  const transfer = async (recipient: string, amount: number) => {};

  return (
    <Loading loading={loading}>
      <div className="w-full min-h-screen bg-black text-white font-roboto p-4">
        <div className="max-w-lg mx-auto mt-6 lg:mt-20">
          <div className="text-5xl font-bold">Wallet</div>
          <BalanceCard address={keyPair?.address ?? ""} balance={0} />
          <ActionsPanel address={keyPair?.address ?? ""} transfer={transfer} />
        </div>
      </div>
    </Loading>
  );
}
