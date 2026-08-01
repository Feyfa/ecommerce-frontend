import globalData from '@/global';

const GlobalPlugin = {
    /**
     * Menjalankan proses install dan menyinkronkan state hasilnya di modul global plugin.
     *
     * @param {*} app Nilai app yang diproses oleh function.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    install(app) {
        app.config.globalProperties.$global = globalData;
    },
};

export default GlobalPlugin;
