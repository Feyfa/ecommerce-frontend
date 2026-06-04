import global from '@/global';
import { ElMessageBox } from 'element-plus';

let sessionExpiredWarningPromise = null;

/**
 * Membersihkan data login lokal ketika token sudah tidak valid.
 */
export const clearAuthSession = () => {
    /* step 1: hapus data autentikasi dari browser */
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    sessionStorage.removeItem('active_account_mode');
    /* step 1 */

    /* step 2: reset tampilan user supaya tidak menampilkan data akun lama */
    global.isAuth = false;
    global.personImage = '/img/person.png';
    global.companyImage = '/img/company.png';
    global.isClickDropdown.userSetting = false;
    /* step 2 */
};

/**
 * Sinkronkan Vuex setelah sesi lokal dibersihkan.
 */
export const syncClearedAuthSessionToStore = (store) => {
    store.dispatch('fetchTokenFromLocalStorage');
    store.dispatch('fetchUserFromLocalStorage');
    store.dispatch('fetchCompanyFromLocalStorage');
    store.dispatch('clearActiveAccountMode');
};

/**
 * Menampilkan peringatan sebelum user diarahkan ke halaman login.
 */
export const showSessionExpiredWarning = () => {
    if(sessionExpiredWarningPromise)
        return sessionExpiredWarningPromise;

    sessionExpiredWarningPromise = ElMessageBox.alert(
        'Sesi login Anda sudah berakhir karena akun ini sudah logout dari browser lain. Silakan login kembali untuk melanjutkan.',
        'Sesi Berakhir',
        {
            type: 'warning',
            confirmButtonText: 'Login Kembali',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            showClose: false,
        }
    ).finally(() => {
        sessionExpiredWarningPromise = null;
    });

    return sessionExpiredWarningPromise;
};

/**
 * Mengecek response API yang menandakan token sudah tidak berlaku.
 */
export const isUnauthenticatedResponse = (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    return status === 401 && ['Unauthenticated.', 'Unauthorized'].includes(message);
};
