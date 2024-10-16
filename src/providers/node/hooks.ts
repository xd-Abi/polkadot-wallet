import {useContext} from "react";
import {NodeContext} from "./context";

export function useNode() {
  return useContext(NodeContext);
}
