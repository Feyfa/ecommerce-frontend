import global from '@/global';
import { ElMessageBox } from 'element-plus';
import { buildClerkAbsoluteUrl, waitForClerkLoaded } from '@/clerk';

let sessionExpiredWarningPromise = null;

/**
 * Membersihkan data login lokal ketika sesi auth utama sudah tidak valid.
 */
export const clearAuthSession = () => {
    /* step 1: hapus data autentikasi dari browser */
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
 * Menutup sesi Clerk di browser bila memang masih aktif.
 */
export const signOutClerkBrowserSession = async ({ redirectUrl = '', afterSignOut = null } = {}) => {
    const runtimeState = await waitForClerkLoaded({ timeout: 1000, interval: 50 });

    if(!runtimeState.loaded || !runtimeState.isSignedIn || !runtimeState.clerk?.signOut)
        return false;

    const signOutOptions = redirectUrl ? { redirectUrl: buildClerkAbsoluteUrl(redirectUrl) } : undefined;

    if(typeof afterSignOut === 'function') {
        await runtimeState.clerk.signOut(afterSignOut, signOutOptions);
        return true;
    }

    await runtimeState.clerk.signOut(signOutOptions);

    return true;
};

/**
 * Sinkronkan Vuex setelah sesi lokal dibersihkan.
 */
export const syncClearedAuthSessionToStore = (store) => {
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
 * Mengecek response API yang menandakan sesi auth sudah tidak berlaku.
 */
export const isUnauthenticatedResponse = (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    return status === 401 && ['Unauthenticated.', 'Unauthorized'].includes(message);
};
