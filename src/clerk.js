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
const clerkInvalidIdentifierMessage = 'Email belum valid atau akun belum terdaftar. Periksa kembali email Anda atau register terlebih dahulu.';
const clerkPasskeyNotRegisteredMessage = 'Passkey belum terdaftar untuk akun ini. Pilih passkey yang sesuai atau login dengan email/password.';
const clerkInvalidVerificationCodeMessage = 'Kode verifikasi salah atau sudah kedaluwarsa. Periksa kembali kode terbaru lalu coba lagi.';
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
    'external_account_exists',
    'account_exists',
    'already_exists',
    'already_registered',
    'already registered',
    'already exists',
    'email address is taken',
    'identifier is already',
    'has already been taken',
];
const clerkUnknownAccountErrorPatterns = [
    'couldn\'t find your account',
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
export const clerkSecondFactorTimeoutMs = 5 * 60 * 1000;

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
 * Menandai callback OAuth berikutnya sebagai proses hubungkan Google
 * dari halaman keamanan akun.
 */
export const rememberGoogleLinkCallback = () => {
    sessionStorage.setItem(clerkGoogleLinkCallbackStorageKey, '1');
};

/**
 * Mengecek apakah callback aktif berasal dari flow hubungkan Google.
 */
export const hasGoogleLinkCallback = () => {
    return sessionStorage.getItem(clerkGoogleLinkCallbackStorageKey) === '1';
};

/**
 * Mengambil status callback hubungkan Google satu kali agar tidak diproses ulang.
 */
export const consumeGoogleLinkCallback = () => {
    const isPending = hasGoogleLinkCallback();
    sessionStorage.removeItem(clerkGoogleLinkCallbackStorageKey);

    return isPending;
};

/**
 * Menandai callback OAuth berikutnya sebagai proses login Google.
 */
export const rememberGoogleLoginCallback = () => {
    sessionStorage.setItem(clerkGoogleLoginCallbackStorageKey, '1');
    localStorage.setItem(clerkGoogleLoginCallbackStorageKey, '1');
};

/**
 * Mengecek apakah callback aktif berasal dari proses login Google.
 */
export const hasGoogleLoginCallback = () => {
    return sessionStorage.getItem(clerkGoogleLoginCallbackStorageKey) === '1'
        || localStorage.getItem(clerkGoogleLoginCallbackStorageKey) === '1';
};

/**
 * Mengambil status callback login Google satu kali agar pesan gagal tidak muncul berulang.
 */
export const consumeGoogleLoginCallback = () => {
    const isPending = hasGoogleLoginCallback();
    clearGoogleLoginCallback();

    return isPending;
};

/**
 * Membersihkan marker login Google setelah session benar-benar berhasil dibuat.
 */
export const clearGoogleLoginCallback = () => {
    sessionStorage.removeItem(clerkGoogleLoginCallbackStorageKey);
    localStorage.removeItem(clerkGoogleLoginCallbackStorageKey);
};

/**
 * Mengambil sign-in id yang sudah dibatalkan pada step TFA.
 */
export const getCancelledClerkSecondFactorSignInId = () => {
    return sessionStorage.getItem(clerkCancelledSecondFactorStorageKey) || '';
};

/**
 * Mengecek apakah attempt TFA saat ini adalah attempt yang sebelumnya dibatalkan.
 */
export const hasCancelledClerkSecondFactorStep = (signInId = '') => {
    const cancelledSignInId = getCancelledClerkSecondFactorSignInId();

    if(!cancelledSignInId)
        return false;

    if(!signInId)
        return true;

    return cancelledSignInId === signInId;
};

/**
 * Menyimpan sign-in id yang dibatalkan agar pending attempt lama tidak tampil lagi setelah refresh.
 */
export const rememberCancelledClerkSecondFactorStep = (signInId = '') => {
    sessionStorage.setItem(clerkCancelledSecondFactorStorageKey, signInId);
};

/**
 * Menghapus status pembatalan TFA ketika flow login baru benar-benar dilanjutkan.
 */
export const clearCancelledClerkSecondFactorStep = () => {
    sessionStorage.removeItem(clerkCancelledSecondFactorStorageKey);
};

/**
 * Menyimpan batas waktu pending TFA agar refresh halaman tidak memperpanjang attempt login.
 */
export const rememberClerkSecondFactorExpiresAt = (expiresAt = Date.now() + clerkSecondFactorTimeoutMs) => {
    sessionStorage.setItem(clerkSecondFactorExpiresAtStorageKey, String(expiresAt));

    return expiresAt;
};

/**
 * Mengambil batas waktu pending TFA dari session tab aktif.
 */
export const getClerkSecondFactorExpiresAt = () => {
    const expiresAt = Number(sessionStorage.getItem(clerkSecondFactorExpiresAtStorageKey) || 0);

    return Number.isFinite(expiresAt) ? expiresAt : 0;
};

/**
 * Membersihkan batas waktu pending TFA setelah login selesai, dibatalkan, atau kedaluwarsa.
 */
export const clearClerkSecondFactorExpiresAt = () => {
    sessionStorage.removeItem(clerkSecondFactorExpiresAtStorageKey);
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
 * Mencocokkan payload error Clerk dengan pattern akun yang sudah terdaftar.
 */
const hasClerkAlreadyRegisteredPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkAlreadyRegisteredErrorPatterns.some(pattern => normalizedPayload.includes(pattern));
};

/**
 * Mencocokkan payload error Clerk dengan pattern akun yang belum terdaftar.
 */
const hasClerkUnknownAccountPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkUnknownAccountErrorPatterns.some(pattern => normalizedPayload.includes(pattern));
};

/**
 * Mencocokkan payload error Clerk dengan pattern identifier login yang tidak valid.
 */
const hasClerkInvalidIdentifierPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkInvalidIdentifierErrorPatterns.some(pattern => normalizedPayload.includes(pattern));
};

/**
 * Mencocokkan payload error Clerk dengan pattern passkey yang tidak terdaftar.
 */
const hasClerkPasskeyNotRegisteredPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkPasskeyNotRegisteredErrorPatterns.some(pattern => normalizedPayload.includes(pattern));
};

/**
 * Mencocokkan payload error Clerk dengan pattern kode verifikasi TFA/email yang salah.
 */
const hasClerkInvalidVerificationCodePayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkInvalidVerificationCodeErrorPatterns.some(pattern => normalizedPayload.includes(pattern));
};

/**
 * Mencocokkan payload OAuth yang berarti user membatalkan flow provider.
 */
const hasClerkCancelledOauthPayload = (payload = '') => {
    const normalizedPayload = String(payload).toLowerCase();

    return clerkCancelledOauthErrorPatterns.some(pattern => normalizedPayload.includes(pattern));
};

/**
 * Mengubah URL auth tujuan agar pesan callback bisa tampil setelah redirect selesai.
 */
export const appendClerkAuthErrorToUrl = (url = clerkSignInUrl, message = '') => {
    if(!message)
        return url;

    const [pathWithQuery, hash = ''] = String(url).split('#');
    const [path, rawQuery = ''] = pathWithQuery.split('?');
    const params = new URLSearchParams(rawQuery);
    params.set(clerkAuthErrorQueryKey, message);

    return `${path}?${params.toString()}${hash ? `#${hash}` : ''}`;
};

/**
 * Mengambil pesan error auth dari query URL saat halaman auth selesai dimuat.
 */
export const consumeClerkAuthErrorFromRoute = (route = {}) => {
    const message = route?.query?.[clerkAuthErrorQueryKey] || '';

    return Array.isArray(message) ? message[0] || '' : message;
};

/**
 * Membersihkan query error auth agar toast tidak muncul berulang saat refresh.
 */
export const clearClerkAuthErrorFromRoute = (route = {}, router = null) => {
    if(!route?.query?.[clerkAuthErrorQueryKey] || !router?.replace)
        return;

    const query = { ...route.query };
    delete query[clerkAuthErrorQueryKey];

    router.replace({ query });
};

/**
 * Mengecek error Clerk yang berarti email/account sudah pernah terdaftar.
 */
export const isClerkAccountAlreadyRegisteredError = (error = {}) => {
    const clerkErrors = Array.isArray(error?.errors) ? error.errors : [];
    const errorPayload = [
        error?.code,
        error?.status,
        error?.message,
        ...clerkErrors.flatMap(item => [
            item?.code,
            item?.message,
            item?.longMessage,
        ]),
    ].filter(Boolean).join(' ').toLowerCase();

    return hasClerkAlreadyRegisteredPayload(errorPayload);
};

/**
 * Mengecek error Clerk yang berasal dari pembatalan OAuth provider.
 */
export const isClerkOauthCancelledError = (error = {}) => {
    const clerkErrors = Array.isArray(error?.errors) ? error.errors : [];
    const errorPayload = [
        error?.code,
        error?.status,
        error?.message,
        ...clerkErrors.flatMap(item => [
            item?.code,
            item?.message,
            item?.longMessage,
        ]),
    ].filter(Boolean).join(' ').toLowerCase();

    return hasClerkCancelledOauthPayload(errorPayload);
};

/**
 * Mengambil pesan error dari callback OAuth yang dikembalikan lewat query/hash.
 */
export const getClerkCallbackErrorMessage = (params) => {
    const errorPayload = [
        params?.get?.('error'),
        params?.get?.('error_description'),
        params?.get?.('__clerk_status'),
        params?.get?.('status'),
    ].filter(Boolean).join(' ').toLowerCase();

    if(hasClerkCancelledOauthPayload(errorPayload))
        return '';

    if(hasClerkAlreadyRegisteredPayload(errorPayload))
        return clerkAccountAlreadyRegisteredMessage;

    if(hasClerkUnknownAccountPayload(errorPayload))
        return clerkUnknownAccountMessage;

    if(hasClerkInvalidIdentifierPayload(errorPayload))
        return clerkInvalidIdentifierMessage;

    if(hasClerkPasskeyNotRegisteredPayload(errorPayload))
        return clerkPasskeyNotRegisteredMessage;

    return '';
};

/**
 * Mengambil pesan error Clerk yang paling mudah ditampilkan ke user.
 */
export const getClerkErrorMessage = (error, fallbackMessage = 'Terjadi kesalahan saat memproses autentikasi.') => {
    if(isClerkAccountAlreadyRegisteredError(error))
        return clerkAccountAlreadyRegisteredMessage;

    const firstError = error?.errors?.[0];
    const errorPayload = [
        error?.code,
        error?.status,
        error?.message,
        firstError?.code,
        firstError?.message,
        firstError?.longMessage,
    ].filter(Boolean).join(' ').toLowerCase();

    if(hasClerkUnknownAccountPayload(errorPayload))
        return clerkUnknownAccountMessage;

    if(hasClerkInvalidIdentifierPayload(errorPayload))
        return clerkInvalidIdentifierMessage;

    if(hasClerkPasskeyNotRegisteredPayload(errorPayload))
        return clerkPasskeyNotRegisteredMessage;

    if(hasClerkInvalidVerificationCodePayload(errorPayload))
        return clerkInvalidVerificationCodeMessage;

    return firstError?.longMessage || firstError?.message || error?.message || fallbackMessage;
};
