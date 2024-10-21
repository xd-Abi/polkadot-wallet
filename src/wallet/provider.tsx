import React, {PropsWithChildren, useEffect, useState} from "react";
import {ScProvider} from "@polkadot/rpc-provider";
import {
  cryptoWaitReady,
  decodeAddress,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
} from "@polkadot/util-crypto";
import {ApiPromise, Keyring, SubmittableResult} from "@polkadot/api";
import {KeyringPair} from "@polkadot/keyring/types";
import {SignedBlock} from "@polkadot/types/interfaces";
import {AnyTuple} from "@polkadot/types/types";
import {GenericExtrinsic} from "@polkadot/types";
import * as Sc from "@substrate/connect";
import axios from "axios";

import {Transaction, Wallet} from "./interfaces";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
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

      localStorage.setItem("mnemonic", mnemonic);
      const keyring = new Keyring({type: "sr25519"});
      const miniSecret = mnemonicToMiniSecret(mnemonic);
      const keyPair = keyring.addFromSeed(miniSecret);

      setKeyPair(keyPair);
      return keyPair.address;
    };

    const loadTransferHistory = async (address: string) => {
      // Note: There is no easy option to retrieve all transactions of an account
      // in Polkadot RPC Endpoints. We have to use some sort of indexer like Subscan to do that for us.
      await axios
        .post(
          "https://westend.api.subscan.io/api/v2/scan/transfers",
          {
            address: address,
            // We only show the latest 100 transactions
            row: 100,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.SUBSCAN_KEY,
            },
          }
        )
        .then(response => {
          if (response.data.data.transfers === null) {
            return;
          }

          const transactions: Transaction[] = response.data.data.transfers.map(
            (transfer: any) => ({
              hash: transfer.hash,
              from: transfer.from,
              to: transfer.to,
              status: transfer.success ? "successful" : "failed",
              amount: parseFloat(transfer.amount_v2) / Math.pow(10, 12),
              timestamp: new Date(transfer.block_timestamp * 1000),
            })
          );

          setTransactions(transactions);
        });
    };

    initNode()
      .then(cryptoWaitReady)
      .then(setupWallet)
      .then(loadTransferHistory)
      .then(() => setIsLoading(false))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!node || !keyPair) {
      return;
    }

    node.rpc.chain.subscribeFinalizedHeads(async head => {
      const block: SignedBlock = await node.rpc.chain.getBlock(head.hash);

      block.block.extrinsics.forEach(
        ({method, signer, args}: GenericExtrinsic<AnyTuple>) => {
          if (
            method.section === "balances" &&
            method.method.includes("transfer")
          ) {
            const from = signer.toString();
            const to = args[0].toString();
            const amount = args[1].toString();

            if (to !== keyPair.address) {
              return;
            }

            setTransactions(prev => [
              ...prev,
              {
                hash: head.hash.toString(),
                from: from,
                to: to,
                status: "successful",
                amount: parseFloat(amount) / Math.pow(10, 12),
                timestamp: new Date(),
              },
            ]);
          }
        }
      );
    });
  }, [node, keyPair]);

  useEffect(() => {
    if (!node || !keyPair) {
      return;
    }

    const loadBalance = async () => {
      const data = await node!.query.system.account(keyPair.address);
      const {
        data: {free},
      } = JSON.parse(data.toString());
      setBalance(free);
    };

    loadBalance().catch(console.error);
  }, [transactions, node, keyPair]);

  const transfer = async (recipient: string, amount: number) => {
    if (isLoading || !node || !keyPair) {
      console.warn("Not ready to transfer yet");
      return;
    }

    const to = decodeAddress(recipient);
    const wnd = BigInt(amount * Math.pow(10, 12));

    const transfer = node.tx.balances.transferAllowDeath(to, wnd);
    await transfer.signAndSend(keyPair, (result: SubmittableResult) => {
      const {status, events, dispatchError} = result;
      const txHash = transfer.hash.toHex();

      if (status.isInBlock) {
        setTransactions(prev => [
          ...prev,
          {
            hash: txHash,
            from: keyPair.address,
            to: recipient,
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
        isReady: !isLoading,
        address: keyPair?.address ?? "",
        balance: balance,
        transactions: transactions,
        transfer: transfer,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
}
