import axios from "axios";
import { auth } from "./auth";
import { getAnonId } from "./auth";

const PROD_API = import.meta.env.VITE_API_BASE || "https://instavote-prc8.onrender.com/api";
const baseURL = import.meta.env.DEV ? "/api" : PROD_API;

export const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  if (auth.token) cfg.headers.Authorization = `Bearer ${auth.token}`;
  cfg.headers["x-anon-id"] = getAnonId();
  return cfg;
});