import global from '@/global';
import { ElMessageBox } from 'element-plus';
import { getClerkRuntimeState, waitForClerkLoaded } from '@/clerk';

const CLERK_SIGN_OUT_LOAD_TIMEOUT_MS = 5000;
const CLERK_SIGN_OUT_CONFIRM_TIMEOUT_MS = 5000;
const CLERK_SIGN_OUT_CONFIRM_INTERVAL_MS = 100;

let sessionExpiredWarningPromise = null;
let sessionExpirationPromise = null;

/**
 * Membersihkan sesi authentication di modul sesi authentication.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const clearAuthSession = () => {
    // --- step 1 - hapus data autentikasi tersimpan dari browser - start ---
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    sessionStorage.removeItem('active_account_mode');
    // --- step 1 - hapus data autentikasi tersimpan dari browser - end ---

    // --- step 2 - reset state tampilan agar data akun lama tidak lagi ditampilkan - start ---
    global.isAuth = false;
    global.personImage = '/img/person.png';
    global.companyImage = '/img/company.png';
    global.isClickDropdown.userSetting = false;
    // --- step 2 - reset state tampilan agar data akun lama tidak lagi ditampilkan - end ---
};

/**
 * Menentukan apakah kondisi sesi Clerk pada browser cleared terpenuhi di modul sesi authentication.
 *
 * @param {*} [runtimeState] Nilai runtime state yang diproses oleh function.
 *
 * @returns {boolean} Menunjukkan apakah kondisi is sesi Clerk pada browser cleared terpenuhi.
 */
export const isClerkBrowserSessionCleared = (runtimeState = getClerkRuntimeState()) => {
    if (!runtimeState.enabled) return true;

    const clientSessions = runtimeState.clerk?.client?.sessions;
    const hasStoredClientSessions = Array.isArray(clientSessions) && clientSessions.length > 0;

    return (
        Boolean(runtimeState.loaded) &&
        !runtimeState.isSignedIn &&
        !runtimeState.clerk?.session &&
        !runtimeState.clerk?.user &&
        !hasStoredClientSessions
    );
};

/**
 * Menjalankan proses wait until sesi Clerk pada browser is cleared dan menyinkronkan state hasilnya di modul sesi authentication.
 *
 * @param {Object} [options] Timeout dan interval polling untuk memastikan proses logout provider.
 *
 * @returns {Promise<boolean>} Menunjukkan apakah sesi browser berhasil dibersihkan sebelum timeout.
 */
export const waitUntilClerkBrowserSessionIsCleared = ({
    timeout = CLERK_SIGN_OUT_CONFIRM_TIMEOUT_MS,
    interval = CLERK_SIGN_OUT_CONFIRM_INTERVAL_MS,
} = {}) => {
    const initialState = getClerkRuntimeState();

    if (isClerkBrowserSessionCleared(initialState)) return Promise.resolve(true);

    return new Promise((resolve) => {
        const startedAt = Date.now();

        const timer = window.setInterval(() => {
            const runtimeState = getClerkRuntimeState();
            const isTimedOut = Date.now() - startedAt >= timeout;

            if (isClerkBrowserSessionCleared(runtimeState) || isTimedOut) {
                window.clearInterval(timer);
                resolve(isClerkBrowserSessionCleared(runtimeState));
            }
        }, interval);
    });
};

/**
 * Menjalankan proses logout sesi Clerk pada browser dan menyinkronkan state hasilnya di modul sesi authentication.
 *
 * @returns {Promise<boolean>} Promise diselesaikan setelah alur asynchronous selesai.
 */
export const signOutClerkBrowserSession = async () => {
    const runtimeState = await waitForClerkLoaded({
        timeout: CLERK_SIGN_OUT_LOAD_TIMEOUT_MS,
        interval: 50,
    });

    if (!runtimeState.enabled) return true;

    if (!runtimeState.loaded) throw new Error('Layanan autentikasi belum siap menyelesaikan logout.');

    if (isClerkBrowserSessionCleared(runtimeState)) return true;

    if (typeof runtimeState.clerk?.signOut !== 'function')
        throw new Error('Layanan autentikasi belum menyediakan proses logout.');

    await runtimeState.clerk.signOut();

    const isSessionCleared = await waitUntilClerkBrowserSessionIsCleared();

    if (!isSessionCleared) throw new Error('Sesi akun sebelumnya belum berhasil ditutup. Silakan coba lagi.');

    return true;
};

/**
 * Sinkronkan Vuex setelah sesi lokal dibersihkan.
 *
 * @param {*} store Vuex store yang disinkronkan oleh alur authentication.
 *
 * @returns {void} Memperbarui state komponen atau aplikasi tanpa mengembalikan nilai.
 */
export const syncClearedAuthSessionToStore = (store) => {
    store.dispatch('fetchUserFromLocalStorage');
    store.dispatch('fetchCompanyFromLocalStorage');
    store.dispatch('clearActiveAccountMode');
};

/**
 * Menjalankan proses show session expired warning dan menyinkronkan state hasilnya di modul sesi authentication.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi show session expired warning.
 */
export const showSessionExpiredWarning = () => {
    if (sessionExpiredWarningPromise) return sessionExpiredWarningPromise;

    sessionExpiredWarningPromise = ElMessageBox.alert(
        'Sesi login Anda sudah tidak berlaku. Hal ini dapat terjadi karena sesi berakhir atau akun logout dari perangkat lain. Silakan login kembali untuk melanjutkan.',
        'Sesi Berakhir',
        {
            type: 'warning',
            confirmButtonText: 'Login Kembali',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            showClose: false,
        },
    ).finally(() => {
        sessionExpiredWarningPromise = null;
    });

    return sessionExpiredWarningPromise;
};

/**
 * Menangani expired sesi authentication di modul sesi authentication.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi handle expired sesi authentication.
 */
export const handleExpiredAuthSession = () => {
    if (sessionExpirationPromise) return sessionExpirationPromise;

    sessionExpirationPromise = (async () => {
        // --- step 1 - bersihkan state sesi lama sebelum menunggu konfirmasi pengguna - start ---
        global.isLoggingOut = true;
        clearAuthSession();
        // --- step 1 - bersihkan state sesi lama sebelum menunggu konfirmasi pengguna - end ---

        // --- step 2 - tampilkan satu peringatan untuk request tanpa autentikasi yang berjalan bersamaan - start ---
        await showSessionExpiredWarning().catch(() => null);
        // --- step 2 - tampilkan satu peringatan untuk request tanpa autentikasi yang berjalan bersamaan - end ---

        // --- step 3 - tutup sesi provider dan muat ulang aplikasi dari halaman login - start ---
        await signOutClerkBrowserSession().catch(() => false);
        window.location.replace('/login');
        // --- step 3 - tutup sesi provider dan muat ulang aplikasi dari halaman login - end ---
    })();

    return sessionExpirationPromise;
};

/**
 * Menentukan apakah kondisi unauthenticated response terpenuhi di modul sesi authentication.
 *
 * @param {*} error Error yang terjadi ketika operasi dijalankan.
 *
 * @returns {boolean} Menunjukkan apakah kondisi is unauthenticated response terpenuhi.
 */
export const isUnauthenticatedResponse = (error) => {
    return error?.response?.status === 401;
};
