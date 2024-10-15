import { useEffect, useState } from "react";
import { ScProvider } from "@polkadot/rpc-provider/substrate-connect";
import * as Sc from "@substrate/connect";
import { WellKnownChain } from "@substrate/connect";
import { ApiPromise, Keyring } from "@polkadot/api";
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
      const api = await ApiPromise.create({ provider });
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

      const keyring = new Keyring({ type: "sr25519" });
      const miniSecret = mnemonicToMiniSecret(walletMnemonic);
      const pair = keyring.addFromSeed(miniSecret);

      setMnemonic(walletMnemonic);
      setKeyPair(pair);
      setAddress(pair.address);

      const data = await api.query.system.account(pair.address);
      const {
        data: { free },
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
        ({ status, events }: any) => {
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

          events.forEach(({ event: { method, section }, phase }: any) => {
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
          className="w-full h-[19rem] bg-cover bg-no-repeat p-8"
          style={{ backgroundImage: "url('/card.svg')" }}
        >
          <div className="text-lg font-medium text-transparent bg-white bg-opacity-50 bg-clip-text">
            Current Balance
          </div>
          <div className="text-white text-3xl font-medium mt-1">{balance}</div>
        </div>
        <div className="w-full mt-10 grid grid-cols-4 gap-2">
          <div className="w-full flex flex-col items-center justify-center">
            <a
              href="https://faucet.polkadot.io/westend"
              target="_blank"
              className="bg-gray-800 rounded-full flex items-center justify-center p-5 size-20 transition-all duration-200 ease-in hover:cursor-pointer hover:bg-gray-900 hover:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="size-8 text-white"
              >
                <path
                  opacity="0.4"
                  d="M7.57686 4.21398C7.77748 3.75211 7.87779 3.52117 7.78894 3.3857C7.70009 3.25024 7.46547 3.25024 6.99624 3.25024L4.18182 3.25026C2.56262 3.25026 1.25 4.55982 1.25 6.17524V14.0465C1.24998 15.8244 1.24996 17.2574 1.40184 18.3845C1.55952 19.5546 1.89687 20.5398 2.68119 21.3223C3.4655 22.1048 4.45303 22.4414 5.6259 22.5987C6.75559 22.7502 8.19196 22.7502 9.97398 22.7502H15.978C17.3014 22.7502 18.3927 22.7502 19.2563 22.6344C20.1631 22.5128 20.9639 22.2476 21.6051 21.6079C22.2463 20.9682 22.512 20.1692 22.6339 19.2646C22.7501 18.4029 22.75 17.3142 22.75 15.994V13.9064C22.75 12.5862 22.7501 11.4974 22.6339 10.6358C22.512 9.73115 22.2463 8.93222 21.6051 8.29252C20.9639 7.65281 20.1631 7.38765 19.2563 7.26602C18.6295 7.14299 16.8093 7.13756 15.9776 7.15023L4.18138 7.15023C3.64164 7.15023 3.2041 6.71371 3.2041 6.17523C3.2041 5.63676 3.64164 5.20024 4.18138 5.20024H6.77242C6.99012 5.20024 7.09897 5.20024 7.17738 5.14397C7.25578 5.0877 7.29287 4.97795 7.36705 4.75843C7.42959 4.57336 7.49965 4.39175 7.57686 4.21398Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M19.5 15C19.5 13.8954 18.6046 13 17.5 13C16.3954 13 15.5 13.8954 15.5 15C15.5 16.1046 16.3954 17 17.5 17C18.6046 17 19.5 16.1046 19.5 15Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M19.4557 6.03151C19.563 6.0463 19.6555 5.95355 19.6339 5.84742C19.1001 3.22413 16.7803 1.25 13.9994 1.25C11.3264 1.25 9.07932 3.07399 8.43503 5.54525C8.38746 5.72772 8.52962 5.90006 8.7182 5.90006L15.9679 5.90006C16.3968 5.89365 17.0712 5.89192 17.7232 5.90742C18.3197 5.92161 19.0159 5.95164 19.4557 6.03151Z"
                  fill="currentColor"
                ></path>
              </svg>
            </a>
            <div className="mt-2">Buy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
