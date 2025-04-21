// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://astorya-api.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ── request‑interceptor: voeg token toe ───────────────────────────── */
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;