import ReactDOM from "react-dom/client";
import {Toaster} from "react-hot-toast";
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
      <Toaster />
    </WalletProvider>
  </NodeProvider>
);
