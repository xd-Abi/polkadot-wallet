import {useEffect, useState} from "react";
import {ScProvider} from "@polkadot/rpc-provider/substrate-connect";
import * as Sc from "@substrate/connect";
import {ApiPromise, Keyring} from "@polkadot/api";
import {
  cryptoWaitReady,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
} from "@polkadot/util-crypto";

export function Wallet() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [address, setAddress] = useState<string>("");
  const [keyPair, setKeyPair] = useState<any>(null);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [mnemonic, setMnemonic] = useState<string>("");

  useEffect(() => {
    const saveToStorage = (mnemonic: string) => {
      localStorage.setItem("polkadot_mnemonic", mnemonic);
    };

    const loadFromStorage = () => {
      return localStorage.getItem("polkadot_mnemonic");
    };

    const initWallet = async () => {
      const provider = new ScProvider(Sc, Sc.WellKnownChain.polkadot);
      await provider.connect();
      const api = await ApiPromise.create({provider});
      setApi(api);

      await cryptoWaitReady();
      let walletMnemonic = loadFromStorage();

      if (!walletMnemonic) {
        const generatedMnemonic = mnemonicGenerate();

        const isValid = mnemonicValidate(generatedMnemonic);
        if (!isValid) {
          console.error("Invalid mnemonic generated.");
          return;
        }

        saveToStorage(generatedMnemonic);
        walletMnemonic = generatedMnemonic;
      }

      const keyring = new Keyring({type: "sr25519"});
      const miniSecret = mnemonicToMiniSecret(walletMnemonic);
      const pair = keyring.addFromSeed(miniSecret);

      setMnemonic(walletMnemonic);
      setKeyPair(pair);
      setAddress(pair.address);
    };

    initWallet().catch(console.error);
  }, []);

  return (
    <div>
      <h2>Polkadot Wallet</h2>
      <div>
        <h3>Generated Mnemonic:</h3>
        <p>{mnemonic}</p>
      </div>

      <div>
        <h3>Wallet Address:</h3>
        <p>{address}</p>
      </div>
      <div>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount to Send"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button>Transfer Funds</button>
      </div>
    </div>
  );
}
