import {useEffect, useState} from "react";
import {ScProvider} from "@polkadot/rpc-provider/substrate-connect";
import * as Sc from "@substrate/connect";
import {WellKnownChain} from "@substrate/connect";
import {ApiPromise, Keyring} from "@polkadot/api";
import {
  cryptoWaitReady,
  decodeAddress,
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
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    const initWallet = async () => {
      const provider = new ScProvider(Sc, WellKnownChain.westend2);
      await provider.connect();
      const api = await ApiPromise.create({provider});
      setApi(api);

      await cryptoWaitReady();
      let walletMnemonic = localStorage.getItem("polkadot_mnemonic");

      if (!walletMnemonic) {
        const generatedMnemonic = mnemonicGenerate();

        const isValid = mnemonicValidate(generatedMnemonic);
        if (!isValid) {
          console.error("Invalid mnemonic generated.");
          return;
        }

        localStorage.setItem("polkadot_mnemonic", generatedMnemonic);
        walletMnemonic = generatedMnemonic;
      }

      const keyring = new Keyring({type: "sr25519"});
      const miniSecret = mnemonicToMiniSecret(walletMnemonic);
      const pair = keyring.addFromSeed(miniSecret);

      setMnemonic(walletMnemonic);
      setKeyPair(pair);
      setAddress(pair.address);

      const data = await api.query.system.account(pair.address);
      const {
        data: {free},
      } = JSON.parse(data.toString());
      setBalance(free);
    };

    initWallet().catch(console.error);
  }, []);

  const transfer = async () => {
    if (!keyPair || !recipient || !amount || !api) {
      console.error("Missing required details to send funds.");
      return;
    }

    if (!api.isReady) {
      console.error("API is not ready.");
      return;
    }

    try {
      const to = decodeAddress(recipient);
      const transfer = api.tx.balances.transferAllowDeath(to, BigInt(amount));
      const unsub = await transfer.signAndSend(
        keyPair,
        ({status, events}: any) => {
          if (status.isInBlock) {
            console.log(
              "Transaction included at blockHash",
              status.asInBlock.toHex()
            );
          } else if (status.isFinalized) {
            console.log(
              "Transaction finalized at blockHash",
              status.asFinalized.toHex()
            );
          }

          events.forEach(({event: {method, section}, phase}: any) => {
            console.log("Event:", phase.toString(), `: ${section}.${method}`);
          });
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 font-roboto">
      <div className="max-w-lg mx-auto mt-20">
        <div
          className="w-full h-72 bg-contain bg-no-repeat p-8"
          style={{backgroundImage: "url('/card.svg')"}}
        >
          <div className="text-lg font-medium text-transparent bg-white bg-opacity-50 bg-clip-text">
            Current Balance
          </div>
          <div className="text-white text-3xl font-medium mt-1">{balance}</div>
        </div>
      </div>
    </div>
  );
}
