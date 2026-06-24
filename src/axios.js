import axios from "axios";
import { clearAuthSession, isUnauthenticatedResponse, showSessionExpiredWarning, signOutClerkBrowserSession } from "@/authSession";
import { getClerkSessionToken } from "@/clerk";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/api`,
  timeout: 30000
});

/* MELAKUKAN SESUATU SEBELUM REQUEST */
// Buat interceptor untuk menetapkan header Authorization
instance.interceptors.request.use(
  async config => {
    /* step 1: gunakan token sesi utama untuk request API protected */
    const clerkToken = await getClerkSessionToken();

    if(clerkToken) {
      config.headers.Authorization = `Bearer ${clerkToken}`;
      return config;
    }
    /* step 1 */

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
        .finally(async () => {
          if(window.location.pathname !== '/login') {
            await signOutClerkBrowserSession();
            window.location.href = '/login';
          }
        });
    }

    return Promise.reject(error);
  }
);
/* MELAKUKAN SESUATU SETELAH RESPONSE */

export default instance;
