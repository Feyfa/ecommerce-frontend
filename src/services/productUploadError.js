/**
 * Mengambil pesan error upload produk di modul produk upload error.
 *
 * @param {*} error Error yang terjadi ketika operasi dijalankan.
 *
 * @returns {string} Teks get pesan error upload produk yang telah diformat atau ditentukan.
 */
export const getProductUploadErrorMessage = (error) => {
    const status = error?.response?.status ?? error?.response?.data?.status;

    if (status === 413) {
        return 'Total ukuran foto terlalu besar untuk dikirim. Kurangi ukuran foto lalu coba lagi.';
    }

    if (error?.code === 'ECONNABORTED') {
        return 'Upload produk melewati batas waktu. Periksa koneksi lalu coba lagi.';
    }

    if (!error?.response) {
        return 'Produk gagal dikirim karena koneksi bermasalah. Periksa koneksi lalu coba lagi.';
    }

    const responseMessage = error.response.data?.message;

    return typeof responseMessage === 'string' ? responseMessage : 'Produk gagal disimpan. Silakan coba lagi.';
};
