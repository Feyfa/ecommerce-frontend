import { fileURLToPath, URL } from 'node:url';

import { createLogger, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const appUrl = 'https://app.ecommerce.dev/';
const logger = createLogger();
const defaultInfo = logger.info;
/**
 * Menjalankan proses strip ansi dan menyinkronkan state hasilnya di modul vite.config.
 *
 * @param {*} value Nilai yang diproses oleh function.
 *
 * @returns {*} Nilai yang dihasilkan oleh operasi strip ansi.
 */
const stripAnsi = (value) => value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');

/**
 * Menjalankan proses info dan menyinkronkan state hasilnya di modul vite.config.
 *
 * @param {*} message Pesan yang ditampilkan atau disimpan oleh alur saat ini.
 * @param {*} options Pengaturan opsional yang mengendalikan operasi.
 *
 * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
 */
logger.info = (message, options) => {
    const plainMessage = stripAnsi(message);

    if (plainMessage.includes('Local:') && plainMessage.includes('127.0.0.1:43010')) {
        defaultInfo(`  -> Local:   ${appUrl}`, options);
        return;
    }

    defaultInfo(message, options);
};

// https://vitejs.dev/config/
export default defineConfig({
    customLogger: logger,
    plugins: [vue()],
    server: {
        host: '127.0.0.1',
        port: 43010,
        strictPort: true,
        hmr: {
            protocol: 'wss',
            host: 'app.ecommerce.dev',
            clientPort: 443,
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
