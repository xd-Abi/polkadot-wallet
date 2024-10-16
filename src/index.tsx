import ReactDOM from "react-dom/client";
import {Wallet} from "./wallet";
import {NodeProvider} from "./providers";

import "./global.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<NodeProvider>{/* <Wallet /> */}</NodeProvider>);
