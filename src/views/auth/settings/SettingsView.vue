<template>
    <div class="settings-page px-5 pb-6 lg:px-8 w-full" @click="closeMobileMenu">
        <div class="settings-shell">
            <header class="settings-header">
                <div>
                    <h1>Pengaturan</h1>
                    <p>Kelola informasi akun, toko, pembayaran, dan preferensi aplikasi.</p>
                </div>
            </header>

            <div class="settings-mobile-menu" @click.stop>
                <label class="settings-mobile-field-label">Menu Pengaturan</label>
                <button
                    type="button"
                    class="settings-mobile-button"
                    :class="{'is-open': isMobileMenuOpen}"
                    :aria-expanded="isMobileMenuOpen"
                    @click="toggleMobileMenu">
                    <span>{{ currentSettingsMenuLabel }}</span>
                    <svg
                        class="settings-mobile-chevron"
                        :class="{'is-open': isMobileMenuOpen}"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                    </svg>
                </button>

                <div v-if="isMobileMenuOpen" class="settings-mobile-dropdown">
                    <div
                        v-for="section in settingsMenus"
                        :key="section.title"
                        class="settings-mobile-section">
                        <h3>{{ section.title }}</h3>
                        <button
                            v-for="item in section.items"
                            :key="item.name"
                            type="button"
                            class="settings-mobile-item"
                            :class="{'is-active': isMenuActive(item)}"
                            @click="changeSettingsMenu(item.name)">
                            <span>{{ item.label }}</span>
                            <span v-if="item.soon" class="settings-soon-badge">Segera</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="settings-layout">
                <aside class="settings-menu" aria-label="Settings navigation">
                    <div
                        v-for="section in settingsMenus"
                        :key="section.title"
                        class="settings-menu-section">
                        <h2>{{ section.title }}</h2>

                        <router-link
                            v-for="item in section.items"
                            :key="item.name"
                            :to="{name: item.name}"
                            class="settings-menu-item"
                            :class="{'is-active': isMenuActive(item)}">
                            <span>{{ item.label }}</span>
                            <span v-if="item.soon" class="settings-soon-badge">Segera</span>
                        </router-link>
                    </div>
                </aside>

                <main class="settings-content">
                    <div class="settings-content-header">
                        <h2>{{ currentSettingsTitle }}</h2>
                        <p>{{ currentSettingsDescription }}</p>
                        <div class="settings-title-divider" aria-hidden="true"></div>
                    </div>

                    <div class="settings-content-body">
                        <router-view />
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isMobileMenuOpen: false,

            /**
             * Config menu Settings global supaya penambahan fitur baru cukup lewat item route.
             */
            settingsMenus: [
                {
                    title: 'Akun',
                    items: [
                        { name: 'settings_profile', label: 'Profil Pengguna' },
                        { name: 'settings_addresses', label: 'Alamat' },
                        { name: 'settings_security', label: 'Keamanan', soon: true },
                    ],
                },
                {
                    title: 'Bisnis / Toko',
                    items: [
                        { name: 'settings_store', label: 'Profil Toko' },
                    ],
                },
                {
                    title: 'Keuangan',
                    items: [
                        { name: 'settings_balance', label: 'Saldo' },
                        { name: 'settings_bank_accounts', label: 'Rekening Bank' },
                    ],
                },
                {
                    title: 'Aktivitas',
                    items: [
                        { name: 'settings_audit_log', label: 'Audit Log', soon: true },
                    ],
                },
                {
                    title: 'Preferensi',
                    items: [
                        { name: 'settings_notifications', label: 'Notifikasi', soon: true },
                    ],
                },
                {
                    title: 'Bantuan',
                    items: [
                        { name: 'settings_support_report', label: 'Support Report', soon: true },
                    ],
                },
            ]
        }
    },

    computed: {
        currentSettingsTitle() {
            return this.$route.meta.settingsTitle || 'Pengaturan';
        },

        currentSettingsDescription() {
            return this.$route.meta.settingsDescription || 'Kelola informasi akun, toko, pembayaran, dan preferensi aplikasi.';
        },

        currentSettingsMenuLabel() {
            for(const section of this.settingsMenus) {
                const item = section.items.find(item => item.name == this.$route.name);

                if(item)
                    return item.label;
            }

            return 'Pilih Menu';
        }
    },

    methods: {
        isMenuActive(item) {
            return this.$route.name == item.name;
        },

        /**
         * Navigasi mobile memakai dropdown custom supaya bisa toggle buka dan tutup.
         */
        toggleMobileMenu() {
            this.isMobileMenuOpen = !this.isMobileMenuOpen;
        },

        closeMobileMenu() {
            this.isMobileMenuOpen = false;
        },

        changeSettingsMenu(routeName) {
            this.closeMobileMenu();

            if(routeName && routeName != this.$route.name)
                this.$router.push({name: routeName});
        }
    }
}
</script>

<style scoped>
.settings-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 3.5rem);
    min-height: 0;
    overflow: hidden;
    background: #f8fafc;
}

.settings-shell {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    margin: 0 auto;
    padding-top: 22px;
}

.settings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
}

.settings-header h1 {
    color: #111827;
    font-size: 28px;
    font-weight: 700;
}

.settings-header p {
    margin-top: 4px;
    color: #64748b;
    font-size: 14px;
}

.settings-mobile-menu {
    display: none;
}

.settings-layout {
    display: grid;
    flex: 1;
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 18px;
    align-items: flex-start;
    min-height: 0;
}

.settings-menu {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 0;
    overflow: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    padding: 14px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
}

.settings-menu-section h2 {
    margin-bottom: 7px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.settings-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    gap: 8px;
    border-radius: 7px;
    color: #475569;
    font-size: 14px;
    font-weight: 600;
    padding: 0 10px;
    transition: 150ms ease-in-out;
}

.settings-menu-item:hover {
    background: #f5f3ff;
    color: #7c3aed;
}

.settings-menu-item.is-active {
    background: #8b5cf6;
    color: #ffffff;
    box-shadow: 0 6px 14px rgba(124, 58, 237, 0.18);
}

.settings-soon-badge {
    display: inline-flex;
    align-items: center;
    height: 20px;
    border-radius: 999px;
    background: #e2e8f0;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 700;
    padding: 0 8px;
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
}

.settings-menu-item.is-active .settings-soon-badge {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

.settings-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    padding: 0;
}

.settings-content-header {
    margin-bottom: 16px;
}

.settings-content-header h2 {
    color: #111827;
    font-size: 22px;
    font-weight: 700;
}

.settings-content-header p {
    margin-top: 4px;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
}

.settings-title-divider {
    width: 100%;
    height: 1px;
    margin-top: 14px;
    background: #e2e8f0;
}

.settings-content-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
}

:deep(.shadow),
:deep(.shadow-md) {
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

:deep(.border-neutral-500),
:deep(.border-neutral-400) {
    border-color: #cbd5e1 !important;
}

:deep(.bg-neutral-50) {
    background-color: #ffffff !important;
}

:deep(.rounded) {
    border-radius: 8px;
}

:deep(.input-container) {
    gap: 6px;
}

:deep(.input-container label) {
    color: #334155;
    font-size: 14px;
    font-weight: 500;
}

:deep(input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input)),
:deep(select),
:deep(textarea) {
    width: 100%;
    min-height: 44px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background-color: #ffffff;
    color: #0f172a;
    font-size: 16px;
    outline: none;
    box-shadow: none;
    transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, background-color 150ms ease-in-out;
}

:deep(input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input)) {
    height: 44px;
    padding: 0 12px;
}

:deep(select) {
    height: 44px;
    padding: 0 36px 0 12px;
}

:deep(textarea) {
    min-height: 92px;
    padding: 10px 12px;
}

:deep(input:not(.el-input__inner):not(.el-range-input):not(.el-select__input)::placeholder),
:deep(textarea::placeholder) {
    color: #94a3b8;
}

:deep(input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input):focus),
:deep(select:focus),
:deep(textarea:focus) {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #f3e8ff !important;
}

:deep(input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input):disabled),
:deep(select:disabled),
:deep(textarea:disabled),
:deep(.input-disabled) {
    background-color: #f8fafc;
    color: #475569;
    -webkit-text-fill-color: #475569;
    opacity: 1;
}

:deep(button.bg-violet-500) {
    border-color: #7c3aed;
    background-color: #8b5cf6;
    color: #ffffff;
    font-weight: 500;
}

:deep(button.bg-violet-500:not(:disabled):hover) {
    background-color: #7c3aed;
}

:deep(button.bg-red-600) {
    border-color: #dc2626;
    background-color: #ef4444;
    color: #ffffff;
    font-weight: 500;
}

:deep(button.bg-red-600:not(:disabled):hover) {
    background-color: #dc2626;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-date-editor.el-input__wrapper) {
    height: 44px;
    min-height: 44px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    box-shadow: none !important;
    transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, background-color 150ms ease-in-out;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus),
:deep(.el-input__wrapper:focus-within),
:deep(.el-select__wrapper:hover),
:deep(.el-select__wrapper.is-focused),
:deep(.el-select__wrapper:focus-within),
:deep(.el-date-editor.el-input__wrapper:hover),
:deep(.el-date-editor.el-input__wrapper.is-active),
:deep(.el-date-editor.el-input__wrapper:focus-within) {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #f3e8ff !important;
}

:deep(.el-input__inner),
:deep(.el-select__input),
:deep(.el-select__placeholder),
:deep(.el-date-editor .el-range-input) {
    color: #0f172a;
    font-size: 16px;
}

:deep(.el-input__inner),
:deep(.el-select__input),
:deep(.el-date-editor .el-range-input) {
    min-height: 0;
    border: 0 !important;
    border-radius: 0;
    background: transparent;
    box-shadow: none !important;
}

:deep(.el-input__inner::placeholder),
:deep(.el-date-editor .el-range-input::placeholder) {
    color: #94a3b8;
}

:deep(.el-input.is-disabled .el-input__wrapper),
:deep(.el-select.is-disabled .el-select__wrapper),
:deep(.el-date-editor.is-disabled) {
    background-color: #f8fafc;
    box-shadow: none !important;
}

:deep(.border-red-500),
:deep(.is-error .el-input__wrapper) {
    border-color: #ef4444 !important;
}

:deep(.border-red-500:focus),
:deep(input.is-error-field:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input):focus),
:deep(.setting-card input.is-error-field),
:deep(.setting-card input.is-error-field:focus),
:deep(.setting-card input.is-error-field.border-red-500:focus),
:deep(.setting-card textarea.is-error-field),
:deep(.setting-card textarea.is-error-field:focus),
:deep(.setting-card textarea.is-error-field.border-red-500:focus),
:deep(.alamat-modal input.is-error-field),
:deep(.alamat-modal input.is-error-field:focus),
:deep(.alamat-modal input.is-error-field.border-red-500:focus),
:deep(.alamat-modal textarea.is-error-field),
:deep(.alamat-modal textarea.is-error-field:focus),
:deep(.alamat-modal textarea.is-error-field.border-red-500:focus),
:deep(.is-error .el-input__wrapper.is-focus),
:deep(.is-error .el-input__wrapper:focus-within) {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 2px #fee2e2, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

@media (max-width: 1024px) {
    .settings-mobile-menu {
        display: block;
        position: relative;
        margin-bottom: 14px;
    }

    .settings-mobile-field-label {
        display: block;
        margin-bottom: 6px;
        color: #334155;
        font-size: 13px;
        font-weight: 700;
    }

    .settings-mobile-button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: 44px;
        gap: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #ffffff;
        color: #334155;
        padding: 0 12px;
        text-align: left;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
        transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out;
    }

    .settings-mobile-button.is-open,
    .settings-mobile-button:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 2px #f3e8ff;
        outline: none;
    }

    .settings-mobile-button span {
        color: #111827;
        font-size: 14px;
        font-weight: 700;
    }

    .settings-mobile-chevron {
        flex: 0 0 auto;
        color: #94a3b8;
        transition: transform 150ms ease-in-out, color 150ms ease-in-out;
    }

    .settings-mobile-chevron.is-open {
        color: #8b5cf6;
        transform: rotate(180deg);
    }

    .settings-mobile-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        z-index: 20;
        max-height: 360px;
        overflow-y: auto;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #ffffff;
        padding: 8px;
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
    }

    .settings-mobile-section + .settings-mobile-section {
        margin-top: 8px;
    }

    .settings-mobile-section h3 {
        margin: 0 6px 4px;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .settings-mobile-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: 38px;
        gap: 8px;
        border-radius: 7px;
        color: #475569;
        font-size: 13px;
        font-weight: 700;
        padding: 0 10px;
        text-align: left;
    }

    .settings-mobile-item:hover {
        background: #f5f3ff;
        color: #7c3aed;
    }

    .settings-mobile-item.is-active {
        background: #8b5cf6;
        color: #ffffff;
    }

    .settings-layout {
        grid-template-columns: 1fr;
        gap: 0;
    }

    .settings-menu {
        display: none;
    }
}

@media (max-width: 640px) {
    .settings-page {
        height: calc(100dvh - 3.5rem);
        padding-left: 12px;
        padding-right: 12px;
        padding-bottom: 12px;
    }

    .settings-shell {
        padding-top: 14px;
    }

    .settings-header h1 {
        font-size: 24px;
    }

    .settings-header p {
        font-size: 13px;
    }

    .settings-content {
        padding: 0;
    }

    .settings-content-header {
        margin-bottom: 12px;
    }

    .settings-content-header h2 {
        font-size: 20px;
    }

    .settings-content-header p {
        font-size: 13px;
    }
}
</style>
