// services/api.ts
import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://astorya-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    // 1. Token toevoegen
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

    // 2. Robuuste FormData-detectie (voor React Native)
    const data = config.data as any;
    const isFormData =
      // Browser / moderne omgeving
      (typeof FormData !== "undefined" && data instanceof FormData) ||
      // React Native FormData polyfill bevat meestal een _parts array
      (data && Array.isArray(data._parts));

    if (isFormData && config.headers) {
      // verwijderen van Content-Type zodat Axios zelf 'multipart/form-data; boundary=...' zet
      if (typeof (config.headers as AxiosHeaders).delete === "function") {
        (config.headers as AxiosHeaders).delete("Content-Type");
      } else {
        delete (config.headers as any)["Content-Type"];
      }

      // optionele debugging
      console.log("📦 FormData gedetecteerd, headers na verwijdering:", config.headers);
      if (data._parts) {
        console.log("📄 FormData parts:", data._parts);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;