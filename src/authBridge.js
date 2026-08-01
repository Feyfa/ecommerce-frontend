import axios from '@/axios';
import global from '@/global';
import {
    clearAuthSession,
    isClerkBrowserSessionCleared,
    signOutClerkBrowserSession,
    syncClearedAuthSessionToStore,
} from '@/authSession';
import { clearClerkAuthReturnUrl, clearGoogleLoginCallback, getClerkRuntimeState, waitForClerkLoaded } from '@/clerk';

const AUTH_SESSION_TTL_MS = 2 * 60 * 1000;
let lastResolvedAuthSessionAt = 0;

/**
 * Tujuan helper ini untuk menyamakan bentuk URL gambar lama
 * dengan data user/company yang datang dari backend auth baru.
 *
 * @param {*} imagePath Path gambar tersimpan yang diubah menjadi URL publik.
 * @param {*} fallbackImage Asset fallback yang dikembalikan ketika path gambar tidak tersedia.
 *
 * @returns {string} Resolved text value.
 */
const resolveImageUrl = (imagePath, fallbackImage) => {
    if (!imagePath) return fallbackImage;

    if (/^https?:\/\//i.test(imagePath)) return imagePath;

    return `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${imagePath}`;
};

/**
 * Menjalankan proses apply resolved auth visuals dan menyinkronkan state hasilnya di modul auth bridge.
 *
 * @param {*} options Pengaturan opsional yang mengendalikan operasi.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
const applyResolvedAuthVisuals = ({ user, company }) => {
    global.personImage = resolveImageUrl(user?.img, '/img/person.png');
    global.companyImage = resolveImageUrl(company?.img, '/img/company.png');
    global.isAuth = true;
};

/**
 * Menjalankan proses persist resolved sesi authentication dan menyinkronkan state hasilnya di modul auth bridge.
 *
 * @param {*} options Pengaturan opsional yang mengendalikan operasi.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const persistResolvedAuthSession = ({ user, company }) => {
    localStorage.setItem('user', JSON.stringify(user || null));
    localStorage.setItem('company', JSON.stringify(company || null));

    applyResolvedAuthVisuals({ user, company });
};

/**
 * Menjalankan proses ensure mode akun aktif dan menyinkronkan state hasilnya di modul auth bridge, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
 *
 * @param {*} store Vuex store yang diproses oleh function.
 *
 * @returns {string} Teks ensure mode akun aktif yang telah diformat atau ditentukan.
 */
const ensureActiveAccountMode = (store) => {
    const currentMode = sessionStorage.getItem('active_account_mode');

    if (['buyer', 'seller'].includes(currentMode)) {
        store.dispatch('fetchActiveAccountModeFromSessionStorage');
        return currentMode;
    }

    store.dispatch('setActiveAccountMode', 'buyer');
    return 'buyer';
};

/**
 * Sinkronkan store lama setelah snapshot auth baru ditulis ke browser.
 *
 * @param {*} store Vuex store yang disinkronkan oleh alur authentication.
 *
 * @returns {void} Memperbarui state komponen atau aplikasi tanpa mengembalikan nilai.
 */
export const syncResolvedAuthSessionToStore = (store) => {
    store.dispatch('fetchUserFromLocalStorage');
    store.dispatch('fetchCompanyFromLocalStorage');
    ensureActiveAccountMode(store);
};

/**
 * Membersihkan resolved sesi authentication ttl di modul auth bridge.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const clearResolvedAuthSessionTtl = () => {
    lastResolvedAuthSessionAt = 0;
};

/**
 * Menentukan apakah kondisi fresh resolved sesi authentication terpenuhi di modul auth bridge.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has fresh resolved sesi authentication terpenuhi.
 */
export const hasFreshResolvedAuthSession = () => {
    return lastResolvedAuthSessionAt > 0 && Date.now() - lastResolvedAuthSessionAt < AUTH_SESSION_TTL_MS;
};

/**
 * Route default tetap dipusatkan di sini agar login, register, dan router memakai aturan yang sama.
 *
 * @param {*} store Vuex store yang disinkronkan oleh alur authentication.
 *
 * @returns {*} Nilai yang dihasilkan oleh alur saat ini.
 */
export const resolveDefaultAuthenticatedRouteName = (store) => {
    const activeAccountMode = ensureActiveAccountMode(store);
    return activeAccountMode === 'seller' ? 'seller_dashboard' : 'buyer_home';
};

/**
 * Endpoint /auth/me menjadi bootstrap auth baru karena ia mengembalikan user + company sekaligus.
 *
 * @param {*} store Vuex store yang disinkronkan oleh alur authentication.
 *
 * @returns {Promise<*>} Promise diselesaikan setelah alur asynchronous selesai.
 */
export const bootstrapResolvedAuthSession = async (store) => {
    const response = await axios.get('/auth/me', {
        skipAuthExpiredWarning: true,
    });

    if (response.status !== 200 || response.data.message !== 'authenticated')
        throw new Error('Backend auth session belum berhasil dipulihkan.');

    persistResolvedAuthSession({
        user: response.data.user,
        company: response.data.company,
    });

    syncResolvedAuthSessionToStore(store);
    clearClerkAuthReturnUrl();
    clearGoogleLoginCallback();
    lastResolvedAuthSessionAt = Date.now();

    return response.data;
};

/**
 * Mengambil keberadaan authentication pada browser di modul auth bridge.
 *
 * @returns {Promise<Object>} Promise diselesaikan setelah alur asynchronous selesai.
 */
export const getBrowserAuthPresence = async () => {
    const runtimeState = await waitForClerkLoaded({ timeout: 1200, interval: 50 });
    const hasClerkSession = Boolean(runtimeState.enabled && runtimeState.loaded && runtimeState.isSignedIn);

    return {
        hasClerkSession,
        hasAnySession: hasClerkSession,
    };
};

/**
 * Menjalankan proses prepare browser for new authentication dan menyinkronkan state hasilnya di modul auth bridge, termasuk penanganan request backend dan response lokal.
 *
 * @param {*} store Vuex store yang diproses oleh function.
 *
 * @returns {Promise<void>} Promise diselesaikan setelah alur asynchronous selesai.
 */
export const prepareBrowserForNewAuthentication = async (store) => {
    const runtimeState = await waitForClerkLoaded({ timeout: 5000, interval: 50 });

    if (!runtimeState.enabled) return;

    if (!runtimeState.loaded) throw new Error('Layanan autentikasi belum siap. Silakan coba lagi.');

    if (isClerkBrowserSessionCleared(runtimeState)) return;

    // --- step 1 - start - bersihkan akun Google belum terverifikasi saat token sesi lama masih dapat digunakan
    if (runtimeState.isSignedIn && runtimeState.clerk?.session?.getToken) {
        try {
            await axios.post('/security/google/link/cleanup', null, {
                timeout: 5000,
                skipAuthExpiredWarning: true,
            });
        } catch (error) {
            throw new Error(
                error?.response?.data?.message || 'Sesi akun sebelumnya belum berhasil dibersihkan. Silakan coba lagi.',
            );
        }
    }
    // --- step 1 - end - bersihkan akun Google belum terverifikasi saat token sesi lama masih dapat digunakan

    // --- step 2 - start - tutup sesi browser lama dan tunggu konfirmasi provider
    await signOutClerkBrowserSession();
    // --- step 2 - end - tutup sesi browser lama dan tunggu konfirmasi provider

    // --- step 3 - start - sinkronkan state aplikasi dengan snapshot provider yang sudah logout
    clearResolvedAuthSessionTtl();
    clearAuthSession();
    clearGoogleLoginCallback();
    syncClearedAuthSessionToStore(store);
    // --- step 3 - end - sinkronkan state aplikasi dengan snapshot provider yang sudah logout

    if (!isClerkBrowserSessionCleared(getClerkRuntimeState()))
        throw new Error('Sesi akun sebelumnya belum berhasil ditutup. Silakan coba lagi.');
};

/**
 * Logout frontend membersihkan state lokal dan menutup sesi provider auth utama.
 * Audit backend dicoba terlebih dahulu, tetapi kegagalannya tidak membatalkan logout.
 *
 * @param {*} store Vuex store yang disinkronkan oleh alur authentication.
 * @param {*} router Nilai router yang diproses oleh function.
 * @param {*} [redirectUrl] Nilai redirect url yang diproses oleh function.
 *
 * @returns {Promise<void>} Promise diselesaikan setelah alur asynchronous selesai.
 */
export const logoutResolvedAuthSession = async (store, router, redirectUrl = '/login') => {
    global.isLoggingOut = true;
    const finalRedirectUrl = redirectUrl || '/login';

    try {
        // --- step 1 - start - coba catat audit tanpa menahan logout provider saat request gagal
        try {
            await axios.post(
                '/auth/logout',
                {},
                {
                    timeout: 5000,
                    skipAuthExpiredWarning: true,
                },
            );
        } catch {
            console.warn('Logout audit could not be recorded.');
        }
        // --- step 1 - end - coba catat audit tanpa menahan logout provider saat request gagal

        // --- step 2 - start - bersihkan seluruh state sesi aplikasi setelah percobaan audit
        clearResolvedAuthSessionTtl();
        clearAuthSession();
        clearGoogleLoginCallback();
        syncClearedAuthSessionToStore(store);
        // --- step 2 - end - bersihkan seluruh state sesi aplikasi setelah percobaan audit

        // --- step 3 - start - konfirmasi dan sinkronkan logout provider sebelum membuka halaman login
        await signOutClerkBrowserSession();

        global.clerk = {
            ...global.clerk,
            loaded: true,
            isSignedIn: false,
            userId: '',
        };

        await router.replace(finalRedirectUrl);
        // --- step 3 - end - konfirmasi dan sinkronkan logout provider sebelum membuka halaman login
    } finally {
        global.isLoggingOut = false;
    }
};
