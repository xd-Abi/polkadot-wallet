import {ApiPromise} from "@polkadot/api";

export interface Node {
  api: ApiPromise | null;
  isReady: boolean;
}
