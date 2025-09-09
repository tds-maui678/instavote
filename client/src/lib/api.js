import axios from "axios";
import { auth, getAnonId } from "./auth";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((cfg) => {
  if (auth.token) cfg.headers.Authorization = `Bearer ${auth.token}`;
  cfg.headers["x-anon-id"] = getAnonId();
  return cfg;
});
