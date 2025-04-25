// services/api.ts
import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://astorya-api.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

/* ── request-interceptor: JWT toevoegen ──────────────────────────── */
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    /* 1️⃣  headers kan een AxiosHeaders-instance zijn */
    if (config.headers && typeof (config.headers as AxiosHeaders).set === "function") {
      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    }
    /* 2️⃣  …of een gewoon object / undefined */
    else {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});

export default api;