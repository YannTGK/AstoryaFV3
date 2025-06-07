// services/api.ts
import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://astorya-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    if (config.headers && typeof (config.headers as AxiosHeaders).set === "function") {
      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
    }
  }

  // Als het een FormData is, verwijder de default JSON-header
  const isFormData = config.data instanceof FormData;
  if (isFormData && config.headers) {
    if (typeof (config.headers as AxiosHeaders).delete === "function") {
      (config.headers as AxiosHeaders).delete("Content-Type");
    } else if ("Content-Type" in config.headers) {
      delete (config.headers as any)["Content-Type"];
    }
  }

  return config;
});

export default api;