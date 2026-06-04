import axios from "axios";
import { clearAuthSession, isUnauthenticatedResponse, showSessionExpiredWarning } from "@/authSession";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/api`,
  timeout: 30000
});

/* MELAKUKAN SESUATU SEBELUM REQUEST */
// Buat interceptor untuk menetapkan header Authorization
instance.interceptors.request.use(
  config => {
    // Ambil token dari localStorage atau tempat penyimpanan lainnya
    const token = localStorage.getItem('token');

    // Jika token ditemukan, tambahkan ke header Authorization
    if(token)
      config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
/* MELAKUKAN SESUATU SEBELUM REQUEST */

/* MELAKUKAN SESUATU SETELAH RESPONSE */
instance.interceptors.response.use(
  response => response,
  error => {
    if(isUnauthenticatedResponse(error) && !error?.config?.skipAuthExpiredWarning) {
      clearAuthSession();
      showSessionExpiredWarning()
        .finally(() => {
          if(window.location.pathname !== '/login')
            window.location.href = '/login';
        });
    }

    return Promise.reject(error);
  }
);
/* MELAKUKAN SESUATU SETELAH RESPONSE */

export default instance;
