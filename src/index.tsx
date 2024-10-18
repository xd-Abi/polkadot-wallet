import ReactDOM from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import {Home} from "./pages/home";
import {Transfer} from "./pages/transfer";

import "./global.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <BrowserRouter>
    <Toaster />
    <Routes>
      <Route path="/" Component={Home} />
      <Route path="/transfer" Component={Transfer} />
    </Routes>
  </BrowserRouter>
);
