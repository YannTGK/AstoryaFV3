// services/api.ts
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1) Axios instance
const api = axios.create({
  baseURL: "https://astorya-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 2) Interceptor voor token en multipart header cleanup
api.interceptors.request.use(
  async (config) => {
    // -- token
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

    // -- robuuste FormData-detectie (web én RN)
    const data = config.data as any;
    const isFormData =
      (typeof FormData !== "undefined" && data instanceof FormData) ||
      (data && Array.isArray(data._parts));

    if (isFormData && config.headers) {
      // Verwijder Content-Type zodat Axios boundary automatisch wordt toegevoegd
      if (typeof (config.headers as AxiosHeaders).delete === "function") {
        (config.headers as AxiosHeaders).delete("Content-Type");
      } else {
        delete (config.headers as any)["Content-Type"];
      }

      // Debug-logs
      console.log("📦 FormData gedetecteerd, headers na delete:", config.headers);
      if (data._parts) console.log("📄 FormData parts:", data._parts);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 3) Helper-functie om foto te uploaden
export async function uploadPhoto(
  starId: string,
  albumId: string,
  imageUri: string
): Promise<AxiosResponse> {
  // Bouw FormData
  const formData = new FormData();
  formData.append("photo", {
    uri: imageUri,                      // b.v. 'file:///…/IMG1234.jpg'
    name: `${Date.now()}.jpg`,          // of je originele bestandsnaam
    type: "image/jpeg",                 // match je server‐filter
  } as any);

  try {
    // POST naar het juiste endpoint
    // Let op: hier /photos/upload — pas aan als jouw mount point anders is
    const url = `/v2/stars/${starId}/albums/${albumId}/photos/upload`;
    const response = await api.post(url, formData);
    console.log("✅ Upload geslaagd:", response.data);
    return response;
  } catch (error: any) {
    // Uitgebreide logging
    console.error(
      "❌ Upload error:",
      error.response?.status,
      error.response?.data,
      error.message
    );
    throw error;
  }
}

export default api;