import { idID } from '@clerk/localizations';

const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();
const clerkSignInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL || '/login';
const clerkSignUpUrl = import.meta.env.VITE_CLERK_SIGN_UP_URL || '/register';
const clerkAuthCallbackUrl = '/auth/callback';
const clerkAuthReturnUrlStorageKey = 'clerk_auth_return_url';
const clerkCancelledSecondFactorStorageKey = 'clerk_cancelled_second_factor';
const clerkSecondFactorExpiresAtStorageKey = 'clerk_second_factor_expires_at';
const clerkGoogleLinkCallbackStorageKey = 'clerk_google_link_callback_pending';
const clerkGoogleLoginCallbackStorageKey = 'clerk_google_login_callback_pending';
const clerkAccountAlreadyRegisteredMessage = 'Akun sudah terdaftar. Silakan login terlebih dahulu.';
const clerkUnknownAccountMessage = 'Akun belum terdaftar. Silakan register terlebih dahulu.';
const clerkInvalidIdentifierMessage =
    'Email belum valid atau akun belum terdaftar. Periksa kembali email Anda atau register terlebih dahulu.';
const clerkPasskeyNotRegisteredMessage =
    'Passkey belum terdaftar untuk akun ini. Pilih passkey yang sesuai atau login dengan email/password.';
const clerkInvalidVerificationCodeMessage =
    'Kode verifikasi salah atau sudah kedaluwarsa. Periksa kembali kode terbaru lalu coba lagi.';
const clerkPasswordNotCreatedMessage =
    'Akun ini belum memiliki password. Masuk dengan Google atau gunakan Lupa password untuk membuat password baru.';
const clerkGoogleLinkAlreadyUsedMessage = 'Akun Google sudah digunakan oleh akun TokShop lain.';
const clerkGoogleLinkEmailMismatchMessage = 'Email akun Google harus sama dengan email utama akun Anda.';
const clerkAuthErrorQueryKey = 'auth_error';
const clerkCancelledOauthErrorPatterns = [
    'oauth_access_denied',
    'access_denied',
    'user_cancelled',
    'user_canceled',
    'cancelled',
    'canceled',
    'abandoned',
];
const clerkAlreadyRegisteredErrorPatterns = [
    'form_identifier_exists',
    'identifier_exists',
    'oauth_identification_claimed',
    'identification_claimed',
    'external_account_exists',
    'account_exists',
    'already_exists',
    'already_registered',
    'already registered',
    'already exists',
    'email address is taken',
    'identifier is already',
    'identification claimed by another user',
    'has already been taken',
];
const clerkUnknownAccountErrorPatterns = [
    "couldn't find your account",
    'could not find your account',
    'account not found',
    'user not found',
    'identifier_not_found',
];
const clerkInvalidIdentifierErrorPatterns = [
    'identifier is invalid',
    'form_identifier_not_found',
    'form_identifier_invalid',
];
const clerkPasskeyNotRegisteredErrorPatterns = [
    'passkey is not registered',
    'passkey_not_registered',
    'credential not registered',
];
const clerkInvalidVerificationCodeErrorPatterns = [
    'incorrect code',
    'invalid code',
    'code is incorrect',
    'code is invalid',
    'verification code is invalid',
    'verification code is incorrect',
    'form_code_incorrect',
    'form_code_invalid',
    'totp code invalid',
    'totp code is invalid',
];
const clerkPasswordNotCreatedErrorPatterns = [
    'strategy_for_user_invalid',
    'invalid verification strategy',
    'verification strategy is not valid',
    'verification strategy is not valid for this account',
];
const clerkGoogleLinkEmailMismatchErrorPatterns = [
    'oauth_connection_blocked_by_immutable_attribute',
    'does not match your existing email address',
    'email address does not match',
];
export const clerkSecondFactorTimeoutMs = 5 * 60 * 1000;

export const isClerkEnabled = clerkPublishableKey !== '';

/**
 * Mengambil clerk plugin options di modul clerk.
 *
 * @returns {Object} Object get clerk plugin options yang telah disiapkan.
 */
export const getClerkPluginOptions = () => ({
    publishableKey: clerkPublishableKey,
    localization: idID,
});

export const clerkUiConfig = {
    signInUrl: clerkSignInUrl,
    signUpUrl: clerkSignUpUrl,
    authCallbackUrl: clerkAuthCallbackUrl,
};

/**
 * Mengambil clerk state runtime di modul clerk.
 *
 * @returns {Object} Object get clerk state runtime yang telah disiapkan.
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
 * Mengambil clerk session token di modul clerk.
 *
 * @param {Object} [options] Timeout dan interval polling untuk mendapatkan token sesi.
 *
 * @returns {Promise<string>} Promise diselesaikan setelah alur asynchronous selesai.
 */
export const getClerkSessionToken = async ({ timeout = 1500, interval = 50 } = {}) => {
    const runtimeState = await waitForClerkLoaded({ timeout, interval });

    if (!runtimeState.enabled || !runtimeState.loaded || !runtimeState.isSignedIn) return '';

    if (!runtimeState.clerk?.session?.getToken) return '';

    return (await runtimeState.clerk.session.getToken()) || '';
};

/**
 * Menjalankan proses wait for clerk loaded dan menyinkronkan state hasilnya di modul clerk.
 *
 * @param {Object} [options] Timeout dan interval polling saat menunggu inisialisasi Clerk.
 *
 * @returns {Promise<Object>} State runtime Clerk terbaru, termasuk hasil timeout.
 */
export const waitForClerkLoaded = ({ timeout = 5000, interval = 100 } = {}) => {
    if (!isClerkEnabled) return Promise.resolve(getClerkRuntimeState());

    const initialState = getClerkRuntimeState();
    if (initialState.loaded) return Promise.resolve(initialState);

    return new Promise((resolve) => {
        const startedAt = Date.now();

        const timer = window.setInterval(() => {
            const runtimeState = getClerkRuntimeState();
            const isTimedOut = Date.now() - startedAt >= timeout;

            if (runtimeState.loaded || isTimedOut) {
                window.clearInterval(timer);
                resolve(runtimeState);
            }
        }, interval);
    });
};

/**
 * Menjalankan proses build clerk absolute url dan menyinkronkan state hasilnya di modul clerk.
 *
 * @param {*} [path] Nilai path yang diproses oleh function.
 *
 * @returns {string} Teks build clerk absolute url yang telah diformat atau ditentukan.
 */
export const buildClerkAbsoluteUrl = (path = '/') => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${window.location.origin}${normalizedPath}`;
};

/**
 * Redirect OAuth Clerk dipusatkan di sini agar login dan register memakai callback yang sama.
 *
 * @param {*} [completePath] Path aplikasi yang dibuka setelah alur authentication selesai.
 *
 * @returns {Object} Object yang telah disiapkan untuk alur saat ini.
 */
export const getClerkOauthRedirectUrls = (completePath = clerkSignInUrl) => ({
    redirectUrl: buildClerkAbsoluteUrl(clerkAuthCallbackUrl),
    redirectUrlComplete: buildClerkAbsoluteUrl(completePath),
});

/**
 * Menjalankan proses remember clerk URL kembali authentication dan menyinkronkan state hasilnya di modul clerk.
 *
 * @param {*} [returnUrl] Nilai return url yang diproses oleh function.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const rememberClerkAuthReturnUrl = (returnUrl = clerkSignInUrl) => {
    sessionStorage.setItem(clerkAuthReturnUrlStorageKey, returnUrl);
};

/**
 * Menjalankan proses consume clerk URL kembali authentication dan menyinkronkan state hasilnya di modul clerk.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi consume clerk URL kembali authentication.
 */
export const consumeClerkAuthReturnUrl = () => {
    const returnUrl = sessionStorage.getItem(clerkAuthReturnUrlStorageKey);
    sessionStorage.removeItem(clerkAuthReturnUrlStorageKey);

    return returnUrl || '';
};

/**
 * Membersihkan clerk URL kembali authentication di modul clerk.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const clearClerkAuthReturnUrl = () => {
    sessionStorage.removeItem(clerkAuthReturnUrlStorageKey);
};

/**
 * Menjalankan proses remember callback penautan Google dan menyinkronkan state hasilnya di modul clerk.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const rememberGoogleLinkCallback = () => {
    sessionStorage.setItem(clerkGoogleLinkCallbackStorageKey, '1');
};

/**
 * Menentukan apakah kondisi callback penautan Google terpenuhi di modul clerk.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has callback penautan Google terpenuhi.
 */
export const hasGoogleLinkCallback = () => {
    return sessionStorage.getItem(clerkGoogleLinkCallbackStorageKey) === '1';
};

/**
 * Menjalankan proses consume callback penautan Google dan menyinkronkan state hasilnya di modul clerk.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi consume callback penautan Google.
 */
export const consumeGoogleLinkCallback = () => {
    const isPending = hasGoogleLinkCallback();
    sessionStorage.removeItem(clerkGoogleLinkCallbackStorageKey);

    return isPending;
};

/**
 * Menjalankan proses remember callback login Google dan menyinkronkan state hasilnya di modul clerk.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const rememberGoogleLoginCallback = () => {
    sessionStorage.setItem(clerkGoogleLoginCallbackStorageKey, '1');
    localStorage.setItem(clerkGoogleLoginCallbackStorageKey, '1');
};

/**
 * Menentukan apakah kondisi callback login Google terpenuhi di modul clerk.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has callback login Google terpenuhi.
 */
export const hasGoogleLoginCallback = () => {
    return (
        sessionStorage.getItem(clerkGoogleLoginCallbackStorageKey) === '1' ||
        localStorage.getItem(clerkGoogleLoginCallbackStorageKey) === '1'
    );
};

/**
 * Menjalankan proses consume callback login Google dan menyinkronkan state hasilnya di modul clerk.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi consume callback login Google.
 */
export const consumeGoogleLoginCallback = () => {
    const isPending = hasGoogleLoginCallback();
    clearGoogleLoginCallback();

    return isPending;
};

/**
 * Membersihkan callback login Google di modul clerk.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const clearGoogleLoginCallback = () => {
    sessionStorage.removeItem(clerkGoogleLoginCallbackStorageKey);
    localStorage.removeItem(clerkGoogleLoginCallbackStorageKey);
};

/**
 * Mengambil cancelled clerk faktor kedua login id di modul clerk.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi get cancelled clerk faktor kedua login id.
 */
export const getCancelledClerkSecondFactorSignInId = () => {
    return sessionStorage.getItem(clerkCancelledSecondFactorStorageKey) || '';
};

/**
 * Menentukan apakah kondisi cancelled clerk faktor kedua step terpenuhi di modul clerk.
 *
 * @param {*} [signInId] Nilai sign in id yang diproses oleh function.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has cancelled clerk faktor kedua step terpenuhi.
 */
export const hasCancelledClerkSecondFactorStep = (signInId = '') => {
    const cancelledSignInId = getCancelledClerkSecondFactorSignInId();

    if (!cancelledSignInId) return false;

    if (!signInId) return true;

    return cancelledSignInId === signInId;
};

/**
 * Menjalankan proses remember cancelled clerk faktor kedua step dan menyinkronkan state hasilnya di modul clerk.
 *
 * @param {*} [signInId] Nilai sign in id yang diproses oleh function.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const rememberCancelledClerkSecondFactorStep = (signInId = '') => {
    sessionStorage.setItem(clerkCancelledSecondFactorStorageKey, signInId);
};

/**
 * Membersihkan cancelled clerk faktor kedua step di modul clerk.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const clearCancelledClerkSecondFactorStep = () => {
    sessionStorage.removeItem(clerkCancelledSecondFactorStorageKey);
};

/**
 * Menjalankan proses remember clerk faktor kedua expires at dan menyinkronkan state hasilnya di modul clerk.
 *
 * @param {*} [expiresAt] Nilai expires at yang diproses oleh function.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi remember clerk faktor kedua expires at.
 */
export const rememberClerkSecondFactorExpiresAt = (expiresAt = Date.now() + clerkSecondFactorTimeoutMs) => {
    sessionStorage.setItem(clerkSecondFactorExpiresAtStorageKey, String(expiresAt));

    return expiresAt;
};

/**
 * Mengambil clerk faktor kedua expires at di modul clerk.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi get clerk faktor kedua expires at.
 */
export const getClerkSecondFactorExpiresAt = () => {
    const expiresAt = Number(sessionStorage.getItem(clerkSecondFactorExpiresAtStorageKey) || 0);

    return Number.isFinite(expiresAt) ? expiresAt : 0;
};

/**
 * Membersihkan clerk faktor kedua expires at di modul clerk.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const clearClerkSecondFactorExpiresAt = () => {
    sessionStorage.removeItem(clerkSecondFactorExpiresAtStorageKey);
};

/**
 * Clerk menyimpan nama dalam firstName dan lastName, sehingga input nama tunggal perlu dipecah.
 *
 * @param {*} [name] Nilai name yang diproses oleh function.
 *
 * @returns {Object} Object yang telah disiapkan untuk alur saat ini.
 */
export const splitClerkName = (name = '') => {
    const segments = name.trim().split(/\s+/).filter(Boolean);

    return {
        firstName: segments[0] || '',
        lastName: segments.slice(1).join(' ') || undefined,
    };
};

/**
 * Menentukan apakah kondisi clerk already registered payload terpenuhi di modul clerk.
 *
 * @param {*} [payload] Data yang dikirim ke operasi store atau backend.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has clerk already registered payload terpenuhi.
 */
const hasClerkAlreadyRegisteredPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkAlreadyRegisteredErrorPatterns.some((pattern) => normalizedPayload.includes(pattern));
};

/**
 * Menentukan apakah kondisi clerk unknown account payload terpenuhi di modul clerk.
 *
 * @param {*} [payload] Data yang dikirim ke operasi store atau backend.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has clerk unknown account payload terpenuhi.
 */
const hasClerkUnknownAccountPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkUnknownAccountErrorPatterns.some((pattern) => normalizedPayload.includes(pattern));
};

/**
 * Menentukan apakah kondisi clerk invalid identifier payload terpenuhi di modul clerk.
 *
 * @param {*} [payload] Data yang dikirim ke operasi store atau backend.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has clerk invalid identifier payload terpenuhi.
 */
const hasClerkInvalidIdentifierPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkInvalidIdentifierErrorPatterns.some((pattern) => normalizedPayload.includes(pattern));
};

/**
 * Menentukan apakah kondisi clerk passkey not registered payload terpenuhi di modul clerk.
 *
 * @param {*} [payload] Data yang dikirim ke operasi store atau backend.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has clerk passkey not registered payload terpenuhi.
 */
const hasClerkPasskeyNotRegisteredPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkPasskeyNotRegisteredErrorPatterns.some((pattern) => normalizedPayload.includes(pattern));
};

/**
 * Menentukan apakah kondisi clerk invalid verification code payload terpenuhi di modul clerk.
 *
 * @param {*} [payload] Data yang dikirim ke operasi store atau backend.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has clerk invalid verification code payload terpenuhi.
 */
const hasClerkInvalidVerificationCodePayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkInvalidVerificationCodeErrorPatterns.some((pattern) => normalizedPayload.includes(pattern));
};

/**
 * Menentukan apakah kondisi clerk password not created payload terpenuhi di modul clerk.
 *
 * @param {*} [payload] Data yang dikirim ke operasi store atau backend.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has clerk password not created payload terpenuhi.
 */
const hasClerkPasswordNotCreatedPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkPasswordNotCreatedErrorPatterns.some((pattern) => normalizedPayload.includes(pattern));
};

/**
 * Menentukan apakah kondisi clerk google link email mismatch payload terpenuhi di modul clerk.
 *
 * @param {*} [payload] Data yang dikirim ke operasi store atau backend.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has clerk google link email mismatch payload terpenuhi.
 */
const hasClerkGoogleLinkEmailMismatchPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkGoogleLinkEmailMismatchErrorPatterns.some((pattern) => normalizedPayload.includes(pattern));
};

/**
 * Menentukan apakah kondisi clerk cancelled oauth payload terpenuhi di modul clerk.
 *
 * @param {*} [payload] Data yang dikirim ke operasi store atau backend.
 *
 * @returns {boolean} Menunjukkan apakah kondisi has clerk cancelled oauth payload terpenuhi.
 */
const hasClerkCancelledOauthPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkCancelledOauthErrorPatterns.some((pattern) => normalizedPayload.includes(pattern));
};

/**
 * Menjalankan proses append clerk error authentication to url dan menyinkronkan state hasilnya di modul clerk.
 *
 * @param {*} [url] Nilai url yang diproses oleh function.
 * @param {*} [message] Pesan yang ditampilkan atau disimpan oleh alur saat ini.
 *
 * @returns {string} Teks append clerk error authentication to url yang telah diformat atau ditentukan.
 */
export const appendClerkAuthErrorToUrl = (url = clerkSignInUrl, message = '') => {
    if (!message) return url;

    const [pathWithQuery, hash = ''] = String(url).split('#');
    const [path, rawQuery = ''] = pathWithQuery.split('?');
    const params = new URLSearchParams(rawQuery);
    params.set(clerkAuthErrorQueryKey, message);

    return `${path}?${params.toString()}${hash ? `#${hash}` : ''}`;
};

/**
 * Menjalankan proses consume clerk error authentication from route dan menyinkronkan state hasilnya di modul clerk.
 *
 * @param {*} [route] Record route yang dievaluasi oleh logic navigasi.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi consume clerk error authentication from route.
 */
export const consumeClerkAuthErrorFromRoute = (route = {}) => {
    const message = route?.query?.[clerkAuthErrorQueryKey] || '';

    return Array.isArray(message) ? message[0] || '' : message;
};

/**
 * Membersihkan clerk error authentication from route di modul clerk, termasuk state navigasi yang dihasilkan.
 *
 * @param {*} [route] Record route yang dievaluasi oleh logic navigasi.
 * @param {*} [router] Nilai router yang diproses oleh function.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
export const clearClerkAuthErrorFromRoute = (route = {}, router = null) => {
    if (!route?.query?.[clerkAuthErrorQueryKey] || !router?.replace) return;

    const query = { ...route.query };
    delete query[clerkAuthErrorQueryKey];

    router.replace({ query });
};

/**
 * Menentukan apakah kondisi clerk account already registered error terpenuhi di modul clerk.
 *
 * @param {*} [error] Error yang terjadi ketika operasi dijalankan.
 *
 * @returns {boolean} Menunjukkan apakah kondisi is clerk account already registered error terpenuhi.
 */
export const isClerkAccountAlreadyRegisteredError = (error = {}) => {
    const clerkErrors = Array.isArray(error?.errors) ? error.errors : [];
    const errorPayload = [
        error?.code,
        error?.status,
        error?.message,
        ...clerkErrors.flatMap((item) => [item?.code, item?.message, item?.longMessage]),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return hasClerkAlreadyRegisteredPayload(errorPayload);
};

/**
 * Menentukan apakah kondisi clerk oauth cancelled error terpenuhi di modul clerk.
 *
 * @param {*} [error] Error yang terjadi ketika operasi dijalankan.
 *
 * @returns {boolean} Menunjukkan apakah kondisi is clerk oauth cancelled error terpenuhi.
 */
export const isClerkOauthCancelledError = (error = {}) => {
    const clerkErrors = Array.isArray(error?.errors) ? error.errors : [];
    const errorPayload = [
        error?.code,
        error?.status,
        error?.message,
        ...clerkErrors.flatMap((item) => [item?.code, item?.message, item?.longMessage]),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return hasClerkCancelledOauthPayload(errorPayload);
};

/**
 * Mengambil clerk callback error pesan di modul clerk.
 *
 * @param {*} params Parameter yang diproses oleh function.
 * @param {*} [fallbackMessage] Pesan fallback yang diproses oleh function.
 *
 * @returns {string} Teks get clerk callback error pesan yang telah diformat atau ditentukan.
 */
export const getClerkCallbackErrorMessage = (params, fallbackMessage = '') => {
    const errorPayload = [
        params?.get?.('error'),
        params?.get?.('error_description'),
        params?.get?.('__clerk_status'),
        params?.get?.('status'),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    if (hasClerkCancelledOauthPayload(errorPayload)) return '';

    if (hasClerkAlreadyRegisteredPayload(errorPayload)) return clerkAccountAlreadyRegisteredMessage;

    if (hasClerkUnknownAccountPayload(errorPayload)) return clerkUnknownAccountMessage;

    if (hasClerkInvalidIdentifierPayload(errorPayload)) return clerkInvalidIdentifierMessage;

    if (hasClerkPasskeyNotRegisteredPayload(errorPayload)) return clerkPasskeyNotRegisteredMessage;

    return fallbackMessage;
};

/**
 * Mengambil clerk callback penautan Google error pesan di modul clerk.
 *
 * @param {*} params Parameter yang diproses oleh function.
 * @param {*} [fallbackMessage] Pesan fallback yang diproses oleh function.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi get clerk callback penautan Google error pesan.
 */
export const getClerkGoogleLinkCallbackErrorMessage = (
    params,
    fallbackMessage = 'Akun Google belum berhasil dihubungkan.',
) => {
    const errorPayload = [
        params?.get?.('error'),
        params?.get?.('error_description'),
        params?.get?.('__clerk_status'),
        params?.get?.('status'),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    if (hasClerkGoogleLinkEmailMismatchPayload(errorPayload)) return clerkGoogleLinkEmailMismatchMessage;

    const message = getClerkCallbackErrorMessage(params, fallbackMessage);

    return message === clerkAccountAlreadyRegisteredMessage ? clerkGoogleLinkAlreadyUsedMessage : message;
};

/**
 * Mengambil clerk error pesan di modul clerk.
 *
 * @param {*} error Error yang terjadi ketika operasi dijalankan.
 * @param {*} [fallbackMessage] Pesan fallback yang diproses oleh function.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi get clerk error pesan.
 */
export const getClerkErrorMessage = (error, fallbackMessage = 'Terjadi kesalahan saat memproses autentikasi.') => {
    if (isClerkAccountAlreadyRegisteredError(error)) return clerkAccountAlreadyRegisteredMessage;

    const firstError = error?.errors?.[0];
    const errorPayload = [
        error?.code,
        error?.status,
        error?.message,
        firstError?.code,
        firstError?.message,
        firstError?.longMessage,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    if (hasClerkUnknownAccountPayload(errorPayload)) return clerkUnknownAccountMessage;

    if (hasClerkInvalidIdentifierPayload(errorPayload)) return clerkInvalidIdentifierMessage;

    if (hasClerkPasskeyNotRegisteredPayload(errorPayload)) return clerkPasskeyNotRegisteredMessage;

    if (hasClerkInvalidVerificationCodePayload(errorPayload)) return clerkInvalidVerificationCodeMessage;

    if (hasClerkPasswordNotCreatedPayload(errorPayload)) return clerkPasswordNotCreatedMessage;

    return firstError?.longMessage || firstError?.message || error?.message || fallbackMessage;
};

/**
 * Mengambil clerk google link error pesan di modul clerk.
 *
 * @param {*} error Error yang terjadi ketika operasi dijalankan.
 * @param {*} [fallbackMessage] Pesan fallback yang diproses oleh function.
 *
 * @returns {string} Teks get clerk google link error pesan yang telah diformat atau ditentukan.
 */
export const getClerkGoogleLinkErrorMessage = (error, fallbackMessage = 'Akun Google belum berhasil dihubungkan.') => {
    if (isClerkOauthCancelledError(error)) return '';

    if (isClerkAccountAlreadyRegisteredError(error)) return clerkGoogleLinkAlreadyUsedMessage;

    const firstError = error?.errors?.[0];
    const errorPayload = [
        error?.code,
        error?.status,
        error?.message,
        error?.longMessage,
        error?.long_message,
        firstError?.code,
        firstError?.message,
        firstError?.longMessage,
        firstError?.long_message,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    if (hasClerkGoogleLinkEmailMismatchPayload(errorPayload)) return clerkGoogleLinkEmailMismatchMessage;

    return getClerkErrorMessage(error, fallbackMessage);
};
