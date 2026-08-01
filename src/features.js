/**
 * Menjalankan proses read boolean feature dan menyinkronkan state hasilnya di modul features.
 *
 * @param {*} value Nilai yang diproses oleh function.
 * @param {*} [fallback] Nilai fallback yang diproses oleh function.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi read boolean feature.
 */
const readBooleanFeature = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') return fallback;

    return String(value).trim().toLowerCase() === 'true';
};

export const features = Object.freeze({
    clerkPasskey: readBooleanFeature(import.meta.env.VITE_FEATURE_CLERK_PASSKEY, import.meta.env.DEV),
    clerkTotp: readBooleanFeature(import.meta.env.VITE_FEATURE_CLERK_TOTP, import.meta.env.DEV),
});
