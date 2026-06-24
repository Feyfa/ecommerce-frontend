const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();
const clerkSignInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL || '/login';
const clerkSignUpUrl = import.meta.env.VITE_CLERK_SIGN_UP_URL || '/register';
const clerkAuthCallbackUrl = '/auth/callback';
const clerkAuthReturnUrlStorageKey = 'clerk_auth_return_url';

/**
 * Menentukan apakah Clerk sudah siap diaktifkan dari konfigurasi environment.
 */
export const isClerkEnabled = clerkPublishableKey !== '';

/**
 * Menyediakan konfigurasi minimum Clerk untuk fase integrasi awal.
 */
export const getClerkPluginOptions = () => ({
    publishableKey: clerkPublishableKey,
});

export const clerkUiConfig = {
    signInUrl: clerkSignInUrl,
    signUpUrl: clerkSignUpUrl,
    authCallbackUrl: clerkAuthCallbackUrl,
};

/**
 * Mengambil status Clerk yang sudah dimuat di browser.
 * Pada fase transisi, helper ini dipakai sebagai sumber status dasar di luar komponen Vue.
 */
export const getClerkRuntimeState = () => {
    const clerk = window.Clerk;

    return {
        clerk,
        enabled: isClerkEnabled,
        loaded: Boolean(clerk?.loaded),
        isSignedIn: Boolean(clerk?.loaded && clerk?.isSignedIn),
        userId: clerk?.user?.id || '',
    };
};

/**
 * Mengambil session token Clerk yang nantinya dibawa ke backend Laravel.
 */
export const getClerkSessionToken = async ({ timeout = 1500, interval = 50 } = {}) => {
    const runtimeState = await waitForClerkLoaded({ timeout, interval });

    if(!runtimeState.enabled || !runtimeState.loaded || !runtimeState.isSignedIn)
        return '';

    if(!runtimeState.clerk?.session?.getToken)
        return '';

    return await runtimeState.clerk.session.getToken() || '';
};

/**
 * Menunggu Clerk selesai load sebelum status runtime dibaca oleh caller lain.
 */
export const waitForClerkLoaded = ({ timeout = 5000, interval = 100 } = {}) => {
    if(!isClerkEnabled)
        return Promise.resolve(getClerkRuntimeState());

    const initialState = getClerkRuntimeState();
    if(initialState.loaded)
        return Promise.resolve(initialState);

    return new Promise(resolve => {
        const startedAt = Date.now();

        const timer = window.setInterval(() => {
            const runtimeState = getClerkRuntimeState();
            const isTimedOut = Date.now() - startedAt >= timeout;

            if(runtimeState.loaded || isTimedOut) {
                window.clearInterval(timer);
                resolve(runtimeState);
            }
        }, interval);
    });
};

/**
 * Membentuk absolute URL agar flow redirect OAuth Clerk tidak bergantung pada hardcode domain.
 */
export const buildClerkAbsoluteUrl = (path = '/') => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${window.location.origin}${normalizedPath}`;
};

/**
 * Redirect OAuth Clerk dipusatkan di sini agar login dan register memakai callback yang sama.
 */
export const getClerkOauthRedirectUrls = (completePath = clerkSignInUrl) => ({
    redirectUrl: buildClerkAbsoluteUrl(clerkAuthCallbackUrl),
    redirectUrlComplete: buildClerkAbsoluteUrl(completePath),
});

/**
 * Menyimpan halaman asal OAuth agar callback yang dibatalkan dapat kembali ke form yang tepat.
 */
export const rememberClerkAuthReturnUrl = (returnUrl = clerkSignInUrl) => {
    sessionStorage.setItem(clerkAuthReturnUrlStorageKey, returnUrl);
};

/**
 * Mengambil halaman asal OAuth satu kali agar state callback tidak tertinggal di tab browser.
 */
export const consumeClerkAuthReturnUrl = () => {
    const returnUrl = sessionStorage.getItem(clerkAuthReturnUrlStorageKey);
    sessionStorage.removeItem(clerkAuthReturnUrlStorageKey);

    return returnUrl || '';
};

/**
 * Membersihkan halaman asal OAuth setelah session aplikasi berhasil dibuat.
 */
export const clearClerkAuthReturnUrl = () => {
    sessionStorage.removeItem(clerkAuthReturnUrlStorageKey);
};

/**
 * Clerk menyimpan nama dalam firstName dan lastName, sehingga input nama tunggal perlu dipecah.
 */
export const splitClerkName = (name = '') => {
    const segments = name.trim().split(/\s+/).filter(Boolean);

    return {
        firstName: segments[0] || '',
        lastName: segments.slice(1).join(' ') || undefined,
    };
};

/**
 * Mengambil pesan error Clerk yang paling mudah ditampilkan ke user.
 */
export const getClerkErrorMessage = (error, fallbackMessage = 'Terjadi kesalahan saat memproses autentikasi.') => {
    const firstError = error?.errors?.[0];

    return firstError?.longMessage || firstError?.message || error?.message || fallbackMessage;
};
