import ReactDOM from "react-dom/client";
import {Wallet} from "./wallet";
import {NodeProvider, WalletProvider} from "./providers";

import "./global.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <NodeProvider>
    <WalletProvider>
      <Wallet />
    </WalletProvider>
  </NodeProvider>
);
