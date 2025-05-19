// services/api.ts
import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://astorya-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json", // default voor normale requests
  },
});

/* ── request-interceptor: JWT toevoegen + Content-Type aanpassen ─ */
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem("authToken");

  // ✅ Voeg Authorization header toe (voor JWT)
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

  // ✅ Als het een FormData upload is: laat Axios Content-Type automatisch bepalen (voegt boundary toe)
  const isFormData = config.data instanceof FormData;

  if (isFormData && config.headers) {
    // Als AxiosHeaders instantie
    if (typeof (config.headers as AxiosHeaders).delete === "function") {
      (config.headers as AxiosHeaders).delete("Content-Type");
    }
    // Of gewoon object
    else if ("Content-Type" in config.headers) {
      delete (config.headers as any)["Content-Type"];
    }
  }

  return config;
});

export default api;