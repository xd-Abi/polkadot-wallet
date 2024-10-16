import React from "react";
import {Node} from "./interfaces";

export const NodeContext = React.createContext<Node | null>(null);
