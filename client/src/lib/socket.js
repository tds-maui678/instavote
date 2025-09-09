import { io } from "socket.io-client";


const PROD_WS = import.meta.env.VITE_SOCKET_BASE || "https://instavote-prc8.onrender.com";
const url = import.meta.env.DEV ? "http://localhost:5000" : PROD_WS;

export const socket = io(url, {
  transports: ["websocket"], 
});