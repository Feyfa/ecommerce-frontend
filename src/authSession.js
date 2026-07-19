import global from '@/global';
import { ElMessageBox } from 'element-plus';
import { getClerkRuntimeState, waitForClerkLoaded } from '@/clerk';

const CLERK_SIGN_OUT_LOAD_TIMEOUT_MS = 5000;
const CLERK_SIGN_OUT_CONFIRM_TIMEOUT_MS = 5000;
const CLERK_SIGN_OUT_CONFIRM_INTERVAL_MS = 100;

let sessionExpiredWarningPromise = null;
let sessionExpirationPromise = null;

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
 * Menentukan apakah browser sudah tidak memiliki user atau sesi Clerk aktif.
 *
 * @param {Object} runtimeState Snapshot runtime Clerk terbaru.
 */
export const isClerkBrowserSessionCleared = (runtimeState = getClerkRuntimeState()) => {
    if(!runtimeState.enabled)
        return true;

    const clientSessions = runtimeState.clerk?.client?.sessions;
    const hasStoredClientSessions = Array.isArray(clientSessions) && clientSessions.length > 0;

    return Boolean(runtimeState.loaded)
        && !runtimeState.isSignedIn
        && !runtimeState.clerk?.session
        && !runtimeState.clerk?.user
        && !hasStoredClientSessions;
};

/**
 * Menunggu state browser Clerk benar-benar bersih setelah perintah sign-out selesai.
 *
 * @param {Object} options Batas waktu dan interval pemeriksaan state Clerk.
 */
export const waitUntilClerkBrowserSessionIsCleared = ({
    timeout = CLERK_SIGN_OUT_CONFIRM_TIMEOUT_MS,
    interval = CLERK_SIGN_OUT_CONFIRM_INTERVAL_MS,
} = {}) => {
    const initialState = getClerkRuntimeState();

    if(isClerkBrowserSessionCleared(initialState))
        return Promise.resolve(true);

    return new Promise(resolve => {
        const startedAt = Date.now();

        const timer = window.setInterval(() => {
            const runtimeState = getClerkRuntimeState();
            const isTimedOut = Date.now() - startedAt >= timeout;

            if(isClerkBrowserSessionCleared(runtimeState) || isTimedOut) {
                window.clearInterval(timer);
                resolve(isClerkBrowserSessionCleared(runtimeState));
            }
        }, interval);
    });
};

/**
 * Menutup seluruh sesi Clerk yang tersimpan pada browser aktif dan memastikan
 * state user lama sudah hilang sebelum autentikasi berikutnya boleh dimulai.
 */
export const signOutClerkBrowserSession = async () => {
    const runtimeState = await waitForClerkLoaded({
        timeout: CLERK_SIGN_OUT_LOAD_TIMEOUT_MS,
        interval: 50,
    });

    if(!runtimeState.enabled)
        return true;

    if(!runtimeState.loaded)
        throw new Error('Layanan autentikasi belum siap menyelesaikan logout.');

    if(isClerkBrowserSessionCleared(runtimeState))
        return true;

    if(typeof runtimeState.clerk?.signOut !== 'function')
        throw new Error('Layanan autentikasi belum menyediakan proses logout.');

    await runtimeState.clerk.signOut();

    const isSessionCleared = await waitUntilClerkBrowserSessionIsCleared();

    if(!isSessionCleared)
        throw new Error('Sesi akun sebelumnya belum berhasil ditutup. Silakan coba lagi.');

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
        'Sesi login Anda sudah tidak berlaku. Hal ini dapat terjadi karena sesi berakhir atau akun logout dari perangkat lain. Silakan login kembali untuk melanjutkan.',
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
 * Menangani session yang sudah tidak valid melalui satu proses bersama.
 * Semua response 401 memakai promise yang sama agar modal, Clerk sign out,
 * dan redirect tidak dijalankan berulang kali.
 */
export const handleExpiredAuthSession = () => {
    if(sessionExpirationPromise)
        return sessionExpirationPromise;

    sessionExpirationPromise = (async () => {
        /* step 1: hentikan tampilan data session lama sebelum menunggu konfirmasi user */
        global.isLoggingOut = true;
        clearAuthSession();

        /* step 2: tampilkan satu peringatan untuk seluruh request 401 yang berjalan bersamaan */
        await showSessionExpiredWarning().catch(() => null);

        /* step 3: tutup session Clerk dan selalu muat ulang aplikasi dari halaman login */
        await signOutClerkBrowserSession().catch(() => false);
        window.location.replace('/login');
    })();

    return sessionExpirationPromise;
};

/**
 * Mengecek response API yang menandakan sesi auth sudah tidak berlaku.
 */
export const isUnauthenticatedResponse = (error) => {
    return error?.response?.status === 401;
};
