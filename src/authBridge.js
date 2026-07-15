import axios from '@/axios';
import global from '@/global';
import { clearAuthSession, syncClearedAuthSessionToStore, signOutClerkBrowserSession } from '@/authSession';
import { clearClerkAuthReturnUrl, clearGoogleLoginCallback, waitForClerkLoaded } from '@/clerk';

const AUTH_SESSION_TTL_MS = 2 * 60 * 1000;
let lastResolvedAuthSessionAt = 0;

/**
 * Tujuan helper ini untuk menyamakan bentuk URL gambar lama
 * dengan data user/company yang datang dari backend auth baru.
 */
const resolveImageUrl = (imagePath, fallbackImage) => {
    if(!imagePath)
        return fallbackImage;

    if(/^https?:\/\//i.test(imagePath))
        return imagePath;

    return `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${imagePath}`;
};

/**
 * Menyusun ulang visual global aplikasi setelah sesi auth berhasil dipulihkan.
 */
const applyResolvedAuthVisuals = ({ user, company }) => {
    global.personImage = resolveImageUrl(user?.img, '/img/person.png');
    global.companyImage = resolveImageUrl(company?.img, '/img/company.png');
    global.isAuth = true;
};

/**
 * Menyimpan snapshot auth hasil /auth/me agar komponen lama tetap bisa membaca format lama.
 */
export const persistResolvedAuthSession = ({ user, company }) => {
    localStorage.setItem('user', JSON.stringify(user || null));
    localStorage.setItem('company', JSON.stringify(company || null));

    applyResolvedAuthVisuals({ user, company });
};

/**
 * Menentukan mode akun aktif default setelah sesi baru berhasil di-bootstrap.
 */
const ensureActiveAccountMode = (store) => {
    const currentMode = sessionStorage.getItem('active_account_mode');

    if(['buyer', 'seller'].includes(currentMode)) {
        store.dispatch('fetchActiveAccountModeFromSessionStorage');
        return currentMode;
    }

    store.dispatch('setActiveAccountMode', 'buyer');
    return 'buyer';
};

/**
 * Sinkronkan store lama setelah snapshot auth baru ditulis ke browser.
 */
export const syncResolvedAuthSessionToStore = (store) => {
    store.dispatch('fetchUserFromLocalStorage');
    store.dispatch('fetchCompanyFromLocalStorage');
    ensureActiveAccountMode(store);
};

/**
 * Menghapus cache validasi /auth/me di memory agar validasi berikutnya wajib ulang ke backend.
 */
export const clearResolvedAuthSessionTtl = () => {
    lastResolvedAuthSessionAt = 0;
};

/**
 * Mengecek apakah hasil /auth/me terakhir masih cukup baru untuk navigasi internal SPA.
 */
export const hasFreshResolvedAuthSession = () => {
    return lastResolvedAuthSessionAt > 0 && Date.now() - lastResolvedAuthSessionAt < AUTH_SESSION_TTL_MS;
};

/**
 * Route default tetap dipusatkan di sini agar login, register, dan router memakai aturan yang sama.
 */
export const resolveDefaultAuthenticatedRouteName = (store) => {
    const activeAccountMode = ensureActiveAccountMode(store);
    return activeAccountMode === 'seller' ? 'seller_dashboard' : 'buyer_home';
};

/**
 * Endpoint /auth/me menjadi bootstrap auth baru karena ia mengembalikan user + company sekaligus.
 */
export const bootstrapResolvedAuthSession = async (store) => {
    const response = await axios.get('/auth/me', {
        skipAuthExpiredWarning: true
    });

    if(response.status !== 200 || response.data.message !== 'authenticated')
        throw new Error('Backend auth session belum berhasil dipulihkan.');

    persistResolvedAuthSession({
        user: response.data.user,
        company: response.data.company
    });

    syncResolvedAuthSessionToStore(store);
    clearClerkAuthReturnUrl();
    clearGoogleLoginCallback();
    lastResolvedAuthSessionAt = Date.now();

    return response.data;
};

/**
 * Mengecek petunjuk sesi browser dari provider auth utama.
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
 * Logout frontend membersihkan state lokal dan menutup sesi provider auth utama.
 * Audit backend dicoba terlebih dahulu, tetapi kegagalannya tidak membatalkan logout.
 *
 * @param {Object} store Vuex store aplikasi.
 * @param {Object} router Vue Router instance.
 * @param {string} redirectUrl Halaman tujuan setelah logout.
 */
export const logoutResolvedAuthSession = async (store, router, redirectUrl = '/login') => {
    global.isLoggingOut = true;
    const finalRedirectUrl = redirectUrl || '/login';

    try {
        // --- step 1 - start - coba catat audit tanpa menahan sign-out Clerk jika request gagal
        try {
            await axios.post('/auth/logout', {}, {
                timeout: 5000,
                skipAuthExpiredWarning: true,
            });
        } catch {
            console.warn('Logout audit could not be recorded.');
        }
        // --- step 1 - end - coba catat audit tanpa menahan sign-out Clerk jika request gagal

        // --- step 2 - start - setelah audit dicoba bersihkan seluruh session aplikasi
        clearResolvedAuthSessionTtl();
        clearAuthSession();
        clearGoogleLoginCallback();
        syncClearedAuthSessionToStore(store);
        // --- step 2 - end - setelah audit dicoba bersihkan seluruh session aplikasi

        // --- step 3 - start - tutup session provider dan selalu lanjutkan redirect
        let hasSignedOutClerk = false;

        try {
            hasSignedOutClerk = await signOutClerkBrowserSession({
                redirectUrl: finalRedirectUrl,
                afterSignOut: () => router.replace(finalRedirectUrl),
            });
        } catch {
            console.warn('Clerk sign-out could not be completed.');
        }

        if(!hasSignedOutClerk)
            await router.replace(finalRedirectUrl);
        // --- step 3 - end - tutup session provider dan selalu lanjutkan redirect
    } finally {
        global.isLoggingOut = false;
    }
};
