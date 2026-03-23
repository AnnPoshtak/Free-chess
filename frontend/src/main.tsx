import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.js";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");
socket.on("connect", () => {
  console.log("Connected to server. SocketID:", socket.id);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
