import {useEffect, useState} from "react";
import {ScProvider} from "@polkadot/rpc-provider/substrate-connect";
import * as Sc from "@substrate/connect";
import {ApiPromise} from "@polkadot/api";

export function Wallet() {
  useEffect(() => {
    const initClient = async () => {
      const provider = new ScProvider(Sc, Sc.WellKnownChain.polkadot);
      await provider.connect();
      const api = await ApiPromise.create({provider});

      await api.rpc.chain.subscribeNewHeads(lastHeader => {
        console.log(`New block hash: ${lastHeader.hash.toHex()}`);
      });
    };

    initClient().catch(console.error);
  }, []);

  return <div>HELLO</div>;
}
