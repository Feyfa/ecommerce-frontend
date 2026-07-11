import axios from "axios";
import { handleExpiredAuthSession, isUnauthenticatedResponse } from "@/authSession";
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
      handleExpiredAuthSession();

      /*
       * Response 401 berhenti di interceptor karena aplikasi akan logout
       * dan memuat ulang halaman login. Dengan begitu, catch komponen tidak
       * menampilkan error tambahan untuk session yang sama.
       */
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);
/* MELAKUKAN SESUATU SETELAH RESPONSE */

export default instance;
