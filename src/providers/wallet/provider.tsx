import {PropsWithChildren, useEffect, useState} from "react";
import {WalletContext} from "./context";
import {Keyring} from "@polkadot/api";
import {useNode} from "../node";
import {
  cryptoWaitReady,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
} from "@polkadot/util-crypto";
import {KeyringPair} from "@polkadot/keyring/types";

export function WalletProvider(props: PropsWithChildren) {
  const [keyPair, setKeyPair] = useState<KeyringPair>();
  const [mnemonic, setMnemonic] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const {api, isReady} = useNode();

  useEffect(() => {
    if (!isReady || !api) {
      return;
    }

    const initWallet = async () => {
      await cryptoWaitReady();
      let mnemonic = localStorage.getItem("polkadot_mnemonic");

      if (!mnemonic) {
        const generatedMnemonic = mnemonicGenerate();

        const isValid = mnemonicValidate(generatedMnemonic);
        if (!isValid) {
          console.error("Invalid mnemonic generated.");
          return;
        }

        localStorage.setItem("polkadot_mnemonic", generatedMnemonic);
        mnemonic = generatedMnemonic;
      }

      setMnemonic(mnemonic);

      const keyring = new Keyring({type: "sr25519"});
      const miniSecret = mnemonicToMiniSecret(mnemonic);
      const pair = keyring.addFromSeed(miniSecret);

      setKeyPair(pair);

      const data = await api.query.system.account(keyPair!.address);
      const {
        data: {free},
      } = JSON.parse(data.toString());
      setBalance(free);
    };

    initWallet()
      .then(() => setIsLoaded(true))
      .catch(console.error);
  }, [isReady]);

  return (
    <WalletContext.Provider
      value={{
        address: keyPair?.address!,
        balance: balance,
        mnemonic: mnemonic,
        isReady: isLoaded,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
}
