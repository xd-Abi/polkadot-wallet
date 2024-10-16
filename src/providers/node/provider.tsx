import {PropsWithChildren, useEffect, useState} from "react";
import {ScProvider} from "@polkadot/rpc-provider/substrate-connect";
import {ApiPromise} from "@polkadot/api";
import * as Sc from "@substrate/connect";
import {NodeContext} from "./context";

export function NodeProvider(props: PropsWithChildren) {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isReady, setIsReady] = useState<boolean>(true);

  useEffect(() => {
    const initNode = async () => {
      const provider = new ScProvider(Sc, Sc.WellKnownChain.westend2);
      await provider.connect();
      const api = await ApiPromise.create({provider});
      setApi(api);
    };

    initNode().catch(console.error);
  }, []);

  useEffect(() => {
    const checkNodeStatus = async () => {
      if (api && !api.isConnected) {
        setIsReady(false);
        return;
      }

      const ready = await api?.isReady;
      setIsReady(ready !== undefined);
    };

    checkNodeStatus().catch(console.error);
  }, [api]);

  return (
    <NodeContext.Provider value={{api, isReady}}>
      {props.children}
    </NodeContext.Provider>
  );
}
