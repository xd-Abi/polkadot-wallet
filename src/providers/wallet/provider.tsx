import {PropsWithChildren, useEffect, useState} from "react";
import axios from "axios";
import {Keyring, SubmittableResult} from "@polkadot/api";
import {
  cryptoWaitReady,
  decodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
} from "@polkadot/util-crypto";
import {KeyringPair} from "@polkadot/keyring/types";
import {EventRecord} from "@polkadot/types/interfaces";
import {useNode} from "../node";
import {WalletContext} from "./context";
import {Transaction} from "./interfaces";
import {add} from "date-fns";

export function WalletProvider(props: PropsWithChildren) {
  const [keyPair, setKeyPair] = useState<KeyringPair | null>(null);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

      const data = await api.query.system.account(pair.address);
      const {
        data: {free},
      } = JSON.parse(data.toString());

      // free is the balance in planks. One WND = 10^12 planks.
      setBalance(free / Math.pow(10, 12));
    };

    initWallet()
      .then(() => setIsLoaded(true))
      .catch(console.error);
  }, [isReady]);

  // useEffect(() => {
  //   if (!keyPair) {
  //     return;
  //   }

  //   // Note: There is no easy option to retrieve all transactions of an account
  //   // in Polkadot RPC Endpoints. We have to use some sort of indexer like Subscan to do that for us.
  //   axios
  //     .post(
  //       "https://westend.api.subscan.io/api/v2/scan/transfers",
  //       {
  //         address: keyPair.address,
  //         // We only show the latest 100 transactions
  //         row: 100,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           "X-API-Key": process.env.SUBSCAN_KEY,
  //         },
  //       }
  //     )
  //     .then(response => {
  //       const transactions: Transaction[] = response.data.data.transfers.map(
  //         (transfer: any) => ({
  //           hash: transfer.hash,
  //           from: transfer.from,
  //           to: transfer.to,
  //           status: transfer.success ? "successful" : "failed",
  //           amount: parseFloat(transfer.amount_v2) / Math.pow(10, 12),
  //           timestamp: new Date(transfer.block_timestamp * 1000),
  //         })
  //       );

  //       setTransactions(transactions);
  //     })
  //     .catch(console.error);
  // }, [keyPair]);

  const transfer = async (address: string, amount: number) => {
    if (!isReady || !api || !isLoaded || !keyPair) {
      console.warn("Not ready to transfer yet");
      return;
    }

    const to = decodeAddress(address);
    const wnd = BigInt(amount * Math.pow(10, 12));

    const transfer = api?.tx.balances.transferAllowDeath(to, wnd);
    await transfer.signAndSend(keyPair, (result: SubmittableResult) => {
      const {status, events, dispatchError} = result;
      const txHash = transfer.hash.toHex();

      if (status.isInBlock) {
        setTransactions(prev => [
          ...prev,
          {
            hash: txHash,
            from: keyPair.address,
            to: address,
            status: "pending",
            amount: amount,
            timestamp: new Date(Date.now()),
          },
        ]);
      }

      if (status.isFinalized) {
        setTransactions(prev =>
          prev.map(tx =>
            tx.hash === txHash ? {...tx, status: "successful"} : tx
          )
        );
      }

      if (dispatchError) {
        setTransactions(prev =>
          prev.map(tx => (tx.hash === txHash ? {...tx, status: "failed"} : tx))
        );
      }
    });
  };

  return (
    <WalletContext.Provider
      value={{
        address: keyPair?.address!,
        balance: balance,
        mnemonic: mnemonic,
        keyPair: keyPair,
        transactions: transactions,
        isReady: isLoaded,
        transfer: transfer,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
}
