const GEOAPIFY_API_URL = 'https://api.geoapify.com/v1/geocode';

export const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY?.trim() || '';

export class GeoapifyRequestError extends Error {
    /**
     * Membuat error provider yang mempertahankan status HTTP agar UI dapat menentukan langkah pemulihan.
     *
     * @param {string} message Deskripsi kegagalan provider yang mudah dipahami.
     * @param {number} status Status HTTP dari Geoapify, atau nol jika tidak tersedia.
     */
    constructor(message, status = 0) {
        super(message);
        this.name = 'GeoapifyRequestError';
        this.status = status;
    }
}

/**
 * Memanggil endpoint geocoding Geoapify menggunakan API key browser yang telah dikonfigurasi.
 *
 * @param {string} endpoint Nama endpoint Geoapify yang ditambahkan ke URL dasar API.
 * @param {Object} params Parameter query yang diperlukan endpoint.
 * @param {AbortSignal} [signal] Signal opsional untuk membatalkan request yang sudah tidak relevan.
 *
 * @returns {Promise<Object>} Payload response provider yang telah diparsing.
 */
const requestGeoapify = async (endpoint, params, signal) => {
    if (!geoapifyApiKey) {
        throw new GeoapifyRequestError('Geoapify API key belum dikonfigurasi.', 401);
    }

    const query = new URLSearchParams({
        ...params,
        format: 'json',
        apiKey: geoapifyApiKey,
    });
    const response = await fetch(`${GEOAPIFY_API_URL}/${endpoint}?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal,
    });

    if (!response.ok) {
        throw new GeoapifyRequestError('Layanan lokasi belum dapat digunakan.', response.status);
    }

    return response.json();
};

/**
 * Mencari alamat hanya di Indonesia dan secara opsional memprioritaskan hasil di sekitar titik tengah peta.
 *
 * @param {string} text Teks alamat yang dimasukkan user.
 * @param {Object} options Pengaturan opsional untuk titik tengah peta dan pembatalan request.
 *
 * @returns {Promise<Array<Object>>} Daftar saran provider yang dibatasi untuk wilayah Indonesia.
 */
export const autocompleteAddress = async (text, options = {}) => {
    const params = {
        text,
        filter: 'countrycode:id',
        lang: 'id',
        limit: '5',
    };

    if (Number.isFinite(options.longitude) && Number.isFinite(options.latitude)) {
        params.bias = `proximity:${options.longitude},${options.latitude}`;
    }

    const response = await requestGeoapify('autocomplete', params, options.signal);
    return response.results || [];
};

/**
 * Mengubah koordinat marker yang telah dikonfirmasi menjadi alamat Indonesia yang mudah dibaca.
 *
 * @param {number} latitude Latitude yang dipilih pada peta.
 * @param {number} longitude Longitude yang dipilih pada peta.
 * @param {AbortSignal} [signal] Signal opsional untuk membatalkan request yang sudah tidak relevan.
 *
 * @returns {Promise<Object|null>} Alamat pertama yang cocok, atau null jika tidak tersedia.
 */
export const reverseGeocode = async (latitude, longitude, signal) => {
    const response = await requestGeoapify(
        'reverse',
        {
            lat: String(latitude),
            lon: String(longitude),
            lang: 'id',
            limit: '1',
        },
        signal,
    );

    return response.results?.[0] || null;
};
