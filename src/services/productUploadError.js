/**
 * Mengubah kegagalan upload produk menjadi pesan yang dapat ditindaklanjuti seller.
 *
 * Response 413 dapat dibuat oleh reverse proxy sebelum request mencapai Laravel,
 * sedangkan timeout dan network error tidak memiliki response API yang bisa dibaca.
 *
 * @param {Object} error Error upload yang dikembalikan HTTP client.
 *
 * @returns {string} Pesan kegagalan yang dapat ditindaklanjuti seller.
 */
export const getProductUploadErrorMessage = error => {
    const status = error?.response?.status ?? error?.response?.data?.status;

    if(status === 413) {
        return 'Total ukuran foto terlalu besar untuk dikirim. Kurangi ukuran foto lalu coba lagi.';
    }

    if(error?.code === 'ECONNABORTED') {
        return 'Upload produk melewati batas waktu. Periksa koneksi lalu coba lagi.';
    }

    if(!error?.response) {
        return 'Produk gagal dikirim karena koneksi bermasalah. Periksa koneksi lalu coba lagi.';
    }

    const responseMessage = error.response.data?.message;

    return typeof responseMessage === 'string'
        ? responseMessage
        : 'Produk gagal disimpan. Silakan coba lagi.';
};
