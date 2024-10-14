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
        <h3>Balance:</h3>
        <p>{balance}</p>
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
        <button onClick={transfer}>Transfer Funds</button>
      </div>
    </div>
  );
}
