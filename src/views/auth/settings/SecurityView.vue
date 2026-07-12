<template>
    <div class="security-page">
        <section class="security-panel">
            <div class="security-panel-header">
                <div>
                    <h3>Status Keamanan Akun</h3>
                    <p>Ringkasan cara masuk dan perlindungan akun Anda.</p>
                </div>

                <button
                    type="button"
                    class="security-icon-button"
                    :disabled="isLoadingSummary"
                    aria-label="Muat ulang status keamanan"
                    @click="loadSummary">
                    <i class="fa-solid fa-rotate-right" :class="{'fa-spin': isLoadingSummary}"></i>
                </button>
            </div>

            <div v-if="summaryError" class="security-alert">
                <div>
                    <strong>Data keamanan belum bisa dimuat.</strong>
                    <p>{{ summaryError }}</p>
                </div>
                <button type="button" @click="loadSummary">Coba Lagi</button>
            </div>

            <template v-else>
                <div class="security-group">
                    <h4>Cara Masuk</h4>

                    <div v-if="isLoadingSummary" class="security-skeleton-list">
                        <div v-for="index in 2" :key="`method-${index}`" class="security-skeleton-row"></div>
                    </div>

                    <div v-else class="security-list">
                        <article
                            v-for="method in signInMethods"
                            :key="method.key"
                            class="security-row"
                            :class="{'is-feature-locked': !isFeatureAvailable(method)}">
                            <div class="security-row-icon" aria-hidden="true">
                                <i :class="methodIcon(method.key)"></i>
                            </div>

                            <div class="security-row-main">
                                <div class="security-row-title">
                                    <h5>{{ method.label }}</h5>
                                    <span v-if="isFeatureAvailable(method)" class="security-badge" :class="statusClass(method.status)">
                                        {{ method.status_label }}
                                    </span>
                                    <span v-if="!isFeatureAvailable(method)" class="security-badge is-pro">
                                        <i class="fa-solid fa-lock" aria-hidden="true"></i>
                                        Clerk Pro
                                    </span>
                                </div>
                                <p>{{ featureDescription(method) }}</p>
                            </div>

                            <button
                                v-if="method.action_label && isFeatureAvailable(method)"
                                type="button"
                                class="security-secondary-button"
                                :disabled="actionMethodKey === method.key || !isFeatureAvailable(method)"
                                :title="!isFeatureAvailable(method) ? 'Fitur ini memerlukan Clerk Pro dan belum tersedia pada environment ini.' : ''"
                                @click="handleSignInMethodAction(method)">
                                <i v-if="actionMethodKey === method.key" class="fa-solid fa-spinner fa-spin-pulse"></i>
                                {{ method.action_label }}
                            </button>
                        </article>
                    </div>
                </div>

                <div class="security-group">
                    <h4>Perlindungan Tambahan</h4>

                    <div v-if="isLoadingSummary" class="security-skeleton-list">
                        <div v-for="index in 2" :key="`protection-${index}`" class="security-skeleton-row"></div>
                    </div>

                    <div v-else class="security-list">
                        <article
                            v-for="protection in additionalProtections"
                            :key="protection.key"
                            class="security-row"
                            :class="{'is-feature-locked': !isFeatureAvailable(protection)}">
                            <div class="security-row-icon" aria-hidden="true">
                                <i :class="protectionIcon(protection.key)"></i>
                            </div>

                            <div class="security-row-main">
                                <div class="security-row-title">
                                    <h5>{{ protection.label }}</h5>
                                    <span v-if="isFeatureAvailable(protection)" class="security-badge" :class="statusClass(protection.status)">
                                        {{ protection.status_label }}
                                    </span>
                                    <span v-if="!isFeatureAvailable(protection)" class="security-badge is-pro">
                                        <i class="fa-solid fa-lock" aria-hidden="true"></i>
                                        Clerk Pro
                                    </span>
                                </div>
                                <p>{{ featureDescription(protection) }}</p>
                            </div>

                            <button
                                v-if="isFeatureAvailable(protection)"
                                type="button"
                                class="security-secondary-button"
                                :disabled="actionProtectionKey === protection.key || !isFeatureAvailable(protection)"
                                :title="!isFeatureAvailable(protection) ? 'Fitur ini memerlukan Clerk Pro dan belum tersedia pada environment ini.' : ''"
                                @click="handleProtectionAction(protection)">
                                <i v-if="actionProtectionKey === protection.key" class="fa-solid fa-spinner fa-spin-pulse"></i>
                                {{ protection.action_label }}
                            </button>
                        </article>
                    </div>
                </div>
            </template>
        </section>

        <section class="security-panel">
            <div class="security-panel-header security-session-header">
                <div>
                    <h3>Perangkat & Sesi Aktif</h3>
                    <p>Kelola perangkat yang sedang masuk ke akun Anda.</p>
                </div>

                <div class="security-header-actions">
                    <button
                        type="button"
                        class="security-icon-button"
                        :disabled="isLoadingSessions"
                        aria-label="Muat ulang perangkat dan sesi aktif"
                        @click="loadSessions">
                        <i class="fa-solid fa-rotate-right" :class="{'fa-spin': isLoadingSessions}"></i>
                    </button>

                    <button
                        type="button"
                        class="security-danger-outline-button"
                        :disabled="isLoadingSessions || isRevokingOtherSessions || otherSessions.length === 0"
                        @click="revokeOtherSessions">
                        <i v-if="isRevokingOtherSessions" class="fa-solid fa-spinner fa-spin-pulse"></i>
                        Keluar Semua Perangkat
                    </button>
                </div>
            </div>

            <div v-if="sessionsError" class="security-alert">
                <div>
                    <strong>Data sesi belum bisa dimuat.</strong>
                    <p>{{ sessionsError }}</p>
                </div>
                <button type="button" @click="loadSessions">Coba Lagi</button>
            </div>

            <div v-else-if="isLoadingSessions" class="security-skeleton-list">
                <div v-for="index in 2" :key="`session-${index}`" class="security-skeleton-row"></div>
            </div>

            <div v-else-if="sessions.length === 0" class="security-empty">
                <div class="security-empty-icon" aria-hidden="true">
                    <i class="fa-solid fa-laptop"></i>
                </div>
                <h4>Belum ada sesi aktif yang bisa ditampilkan</h4>
                <p>Coba muat ulang halaman ini beberapa saat lagi.</p>
            </div>

            <div v-else class="security-list">
                <article
                    v-for="session in sessions"
                    :key="session.id"
                    class="security-row security-session-row">
                    <div class="security-row-icon" aria-hidden="true">
                        <i :class="sessionIcon(session)"></i>
                    </div>

                    <div class="security-row-main">
                        <div class="security-row-title">
                            <h5>{{ session.device_label }}</h5>
                            <span v-if="session.is_current" class="security-badge is-current">Perangkat ini</span>
                        </div>
                        <p>{{ formatSessionTime(session) }}</p>
                        <p v-if="session.location_label" class="security-muted-text">{{ session.location_label }}</p>
                    </div>

                    <button
                        v-if="!session.is_current"
                        type="button"
                        class="security-danger-button"
                        :disabled="actionSessionId === session.id"
                        @click="revokeSession(session)">
                        <i v-if="actionSessionId === session.id" class="fa-solid fa-spinner fa-spin-pulse"></i>
                        Keluar
                    </button>
                </article>
            </div>
        </section>

        <Modal v-model:show="modal.password" panel-class="security-credential-modal-panel">
            <form class="security-modal" @submit.prevent="submitPasswordForm">
                <div class="security-modal-header">
                    <div>
                        <h3>{{ selectedPasswordMethod?.is_enabled ? 'Ubah Password' : 'Buat Password' }}</h3>
                        <p>Gunakan password ini bersama email utama akun Anda untuk login manual.</p>
                    </div>

                    <button
                        type="button"
                        class="security-modal-close"
                        aria-label="Tutup modal password"
                        @click="closePasswordModal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div v-if="passwordForm.requiresCurrentPassword" class="security-info-box">
                    <strong>Verifikasi password diperlukan</strong>
                    <p>Clerk belum menerima hasil verifikasi dari modal bawaan. Masukkan password saat ini di sini untuk menyimpan perubahan.</p>
                </div>

                <div v-if="passwordForm.requiresCurrentPassword" class="security-modal-field">
                    <label for="currentPassword">Password Saat Ini</label>
                    <div class="security-password-input-wrap">
                        <input
                            id="currentPassword"
                            v-model="passwordForm.currentPassword"
                            :type="passwordVisibility.current ? 'text' : 'password'"
                            autocomplete="current-password"
                            placeholder="Masukkan password saat ini"
                            :class="{'is-error-field': passwordErrors.currentPassword}">
                        <button
                            type="button"
                            class="security-password-toggle"
                            :aria-label="passwordVisibility.current ? 'Sembunyikan password saat ini' : 'Tampilkan password saat ini'"
                            @click="togglePasswordVisibility('current')">
                            <i :class="passwordVisibility.current ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                        </button>
                    </div>
                    <small v-if="passwordErrors.currentPassword">{{ passwordErrors.currentPassword }}</small>
                </div>

                <div class="security-modal-field">
                    <label for="newPassword">Password Baru</label>
                    <div class="security-password-input-wrap">
                        <input
                            id="newPassword"
                            v-model="passwordForm.newPassword"
                            :type="passwordVisibility.new ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="Minimal 8 karakter"
                            :class="{'is-error-field': passwordErrors.newPassword}">
                        <button
                            type="button"
                            class="security-password-toggle"
                            :aria-label="passwordVisibility.new ? 'Sembunyikan password baru' : 'Tampilkan password baru'"
                            @click="togglePasswordVisibility('new')">
                            <i :class="passwordVisibility.new ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                        </button>
                    </div>
                    <small v-if="passwordErrors.newPassword">{{ passwordErrors.newPassword }}</small>
                </div>

                <div class="security-modal-field">
                    <label for="confirmPassword">Konfirmasi Password Baru</label>
                    <div class="security-password-input-wrap">
                        <input
                            id="confirmPassword"
                            v-model="passwordForm.confirmPassword"
                            :type="passwordVisibility.confirm ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="Ulangi password baru"
                            :class="{'is-error-field': passwordErrors.confirmPassword}">
                        <button
                            type="button"
                            class="security-password-toggle"
                            :aria-label="passwordVisibility.confirm ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'"
                            @click="togglePasswordVisibility('confirm')">
                            <i :class="passwordVisibility.confirm ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                        </button>
                    </div>
                    <small v-if="passwordErrors.confirmPassword">{{ passwordErrors.confirmPassword }}</small>
                </div>

                <div class="security-modal-actions">
                    <button
                        type="button"
                        class="security-secondary-button"
                        :disabled="isProcessingPassword"
                        @click="closePasswordModal">
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="security-primary-button"
                        :disabled="isProcessingPassword">
                        <i v-if="isProcessingPassword" class="fa-solid fa-spinner fa-spin-pulse"></i>
                        Simpan Password
                    </button>
                </div>
            </form>
        </Modal>

        <Modal v-model:show="modal.mfa" panel-class="security-credential-modal-panel">
            <div class="security-modal">
                <div class="security-modal-header">
                    <div>
                        <h3>{{ mfaMode === 'manage' ? 'Kelola Two-Factor Authentication' : 'Aktifkan Two-Factor Authentication' }}</h3>
                        <p>Gunakan aplikasi authenticator untuk menambahkan verifikasi ekstra saat login.</p>
                    </div>

                    <button
                        type="button"
                        class="security-modal-close"
                        aria-label="Tutup modal two-factor authentication"
                        @click="closeMfaModal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div v-if="isProcessingMfaSetup" class="security-modal-state">
                    <i class="fa-solid fa-spinner fa-spin-pulse"></i>
                    <span>Menyiapkan autentikator...</span>
                </div>

                <template v-else-if="mfaMode === 'manage'">
                    <div class="security-info-box">
                        <strong>Authenticator aktif</strong>
                        <p>Anda bisa membuat ulang backup codes atau menonaktifkan authenticator dari akun ini.</p>
                    </div>

                    <div v-if="backupCodes.length > 0" class="security-backup-codes">
                        <div class="security-backup-header">
                            <strong>Backup codes baru</strong>
                            <div class="security-backup-actions">
                                <button type="button" @click="copyBackupCodes">Salin</button>
                                <button type="button" @click="downloadBackupCodes">Download</button>
                            </div>
                        </div>
                        <code v-for="code in backupCodes" :key="code">{{ code }}</code>
                    </div>

                    <div class="security-modal-actions">
                        <button
                            type="button"
                            class="security-secondary-button"
                            :disabled="isProcessingMfaBackup || isProcessingMfaDisable"
                            @click="regenerateBackupCodes">
                            <i v-if="isProcessingMfaBackup" class="fa-solid fa-spinner fa-spin-pulse"></i>
                            Buat Backup Codes
                        </button>
                        <button
                            type="button"
                            class="security-danger-outline-button"
                            :disabled="isProcessingMfaBackup || isProcessingMfaDisable"
                            @click="disableMfa">
                            <i v-if="isProcessingMfaDisable" class="fa-solid fa-spinner fa-spin-pulse"></i>
                            Nonaktifkan
                        </button>
                    </div>
                </template>

                <template v-else-if="mfaSetupCompleted">
                    <div class="security-info-box is-success">
                        <strong>Two-factor authentication aktif</strong>
                        <p>Simpan backup codes ini di tempat aman. Setiap kode hanya bisa digunakan satu kali.</p>
                    </div>

                    <div v-if="backupCodes.length > 0" class="security-backup-codes">
                        <div class="security-backup-header">
                            <strong>Backup codes</strong>
                            <div class="security-backup-actions">
                                <button type="button" @click="copyBackupCodes">Salin</button>
                                <button type="button" @click="downloadBackupCodes">Download</button>
                            </div>
                        </div>
                        <code v-for="code in backupCodes" :key="code">{{ code }}</code>
                    </div>

                    <div class="security-modal-actions">
                        <button type="button" class="security-primary-button" @click="closeMfaModal">
                            Selesai
                        </button>
                    </div>
                </template>

                <form v-else class="security-mfa-setup-form" @submit.prevent="verifyMfaSetup">
                    <div class="security-info-box">
                        <strong>Scan QR code</strong>
                        <p>Gunakan Google Authenticator, Microsoft Authenticator, Authy, 1Password, atau aplikasi sejenis.</p>
                    </div>

                    <div v-if="totpQrCodeDataUri" class="security-qr-card">
                        <img :src="totpQrCodeDataUri" alt="QR code authenticator">
                    </div>

                    <div v-else class="security-info-box">
                        <strong>QR code belum tersedia</strong>
                        <p>Gunakan secret key manual di bawah ini untuk menambahkan authenticator.</p>
                    </div>

                    <div class="security-secret-box">
                        <div>
                            <span>Secret key manual</span>
                            <code>{{ totpSetup?.secret || 'Secret belum tersedia' }}</code>
                        </div>
                        <button type="button" @click="copyTotpSecret">Salin</button>
                    </div>

                    <div class="security-modal-field">
                        <label for="totpCode">Kode Verifikasi</label>
                        <input
                            id="totpCode"
                            v-model="totpCode"
                            type="text"
                            inputmode="numeric"
                            autocomplete="one-time-code"
                            placeholder="Masukkan 6 digit kode"
                            :class="{'is-error-field': mfaErrors.totpCode}">
                        <small v-if="mfaErrors.totpCode">{{ mfaErrors.totpCode }}</small>
                    </div>

                    <div class="security-modal-actions">
                        <button
                            type="button"
                            class="security-secondary-button"
                            :disabled="isProcessingMfaVerify"
                            @click="closeMfaModal">
                            Batal
                        </button>
                        <button
                            type="submit"
                            class="security-primary-button"
                            :disabled="isProcessingMfaVerify || !totpSetup">
                            <i v-if="isProcessingMfaVerify" class="fa-solid fa-spinner fa-spin-pulse"></i>
                            Verifikasi
                        </button>
                    </div>
                </form>
            </div>
        </Modal>

        <Modal v-model:show="modal.passkey" panel-class="security-credential-modal-panel">
            <div class="security-modal">
                <div class="security-modal-header">
                    <div>
                        <h3>Kelola Passkey</h3>
                        <p>Atur passkey yang bisa dipakai untuk login ke akun ini.</p>
                    </div>

                    <button
                        type="button"
                        class="security-modal-close"
                        aria-label="Tutup modal passkey"
                        @click="closePasskeyModal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="security-passkey-toolbar">
                    <div>
                        <strong>{{ passkeys.length }} passkey aktif</strong>
                        <p>Hapus passkey yang tidak dipakai atau tambahkan passkey untuk perangkat lain.</p>
                    </div>

                    <button
                        type="button"
                        class="security-secondary-button"
                        :disabled="isProcessingPasskeyCreate"
                        @click="createPasskey(passkeyProtection)">
                        <i v-if="isProcessingPasskeyCreate" class="fa-solid fa-spinner fa-spin-pulse"></i>
                        Tambah Passkey
                    </button>
                </div>

                <div v-if="passkeys.length === 0" class="security-empty is-compact">
                    <div class="security-empty-icon" aria-hidden="true">
                        <i class="fa-solid fa-key"></i>
                    </div>
                    <h4>Belum ada passkey aktif</h4>
                    <p>Tambahkan passkey untuk memakai biometrik atau PIN perangkat saat login.</p>
                </div>

                <div v-else class="security-list security-modal-list">
                    <article
                        v-for="passkey in passkeys"
                        :key="passkey.id"
                        class="security-row">
                        <div class="security-row-icon" aria-hidden="true">
                            <i class="fa-solid fa-key"></i>
                        </div>

                        <div class="security-row-main">
                            <div class="security-row-title">
                                <h5>{{ passkey.name }}</h5>
                            </div>
                            <p>{{ formatPasskeyLastUsed(passkey) }}</p>
                        </div>

                        <button
                            type="button"
                            class="security-danger-button"
                            :disabled="actionPasskeyId === passkey.id"
                            @click="deletePasskey(passkey)">
                            <i v-if="actionPasskeyId === passkey.id" class="fa-solid fa-spinner fa-spin-pulse"></i>
                            Hapus
                        </button>
                    </article>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script>
import axios from '@/axios';
import { ElMessageBox, ElNotification } from 'element-plus';
import Modal from '@/components/partials/ModalView.vue';
import {
    buildClerkAbsoluteUrl,
    consumeGoogleLinkCallback,
    getClerkErrorMessage,
    rememberClerkAuthReturnUrl,
    rememberGoogleLinkCallback,
    waitForClerkLoaded,
} from '@/clerk';
import { createQrCodeSvgDataUri } from '@/utils/qrCode';
import { features } from '@/features';

export default {
    components: {
        Modal,
    },

    data() {
        return {
            security: {
                sign_in_methods: [],
                additional_protections: [],
            },
            features,
            sessions: [],

            isLoadingSummary: false,
            isLoadingSessions: false,
            isRevokingOtherSessions: false,
            actionSessionId: '',
            actionMethodKey: '',
            actionProtectionKey: '',
            actionPasskeyId: '',
            isProcessingPassword: false,
            isProcessingMfaSetup: false,
            isProcessingMfaVerify: false,
            isProcessingMfaBackup: false,
            isProcessingMfaDisable: false,
            isProcessingPasskeyCreate: false,

            summaryError: '',
            sessionsError: '',

            modal: {
                password: false,
                mfa: false,
                passkey: false,
            },
            selectedPasswordMethod: null,
            passwordForm: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                requiresCurrentPassword: false,
            },
            passwordErrors: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            },
            passwordVisibility: {
                current: false,
                new: false,
                confirm: false,
            },
            selectedMfaProtection: null,
            mfaMode: 'setup',
            totpSetup: null,
            totpQrCodeDataUri: '',
            totpCode: '',
            backupCodes: [],
            mfaSetupCompleted: false,
            mfaErrors: {
                totpCode: '',
            },
        };
    },

    computed: {
        signInMethods() {
            return this.security.sign_in_methods || [];
        },

        additionalProtections() {
            return this.security.additional_protections || [];
        },

        otherSessions() {
            return this.sessions.filter(session => !session.is_current);
        },

        passkeyProtection() {
            return this.signInMethods.find(method => method.key === 'passkey') || null;
        },

        passkeys() {
            return this.passkeyProtection?.meta?.passkeys || [];
        },
    },

    async mounted() {
        await this.loadSecurityData();
        await this.finalizeGoogleLinkCallback();
    },

    methods: {
        /**
         * Tujuan method ini untuk memuat semua data halaman keamanan
         * saat pertama kali halaman dibuka.
         */
        async loadSecurityData() {
            await Promise.all([
                this.loadSummary(),
                this.loadSessions(),
            ]);
        },

        /**
         * Tujuan method ini untuk mengambil ringkasan metode login
         * dan perlindungan tambahan dari backend.
         */
        async loadSummary() {
            this.isLoadingSummary = true;
            this.summaryError = '';

            try {
                const response = await axios.get('/security/summary');
                this.security = response.data.security || {
                    sign_in_methods: [],
                    additional_protections: [],
                };
            } catch {
                this.summaryError = 'Ringkasan keamanan belum tersedia. Silakan coba lagi.';
            } finally {
                this.isLoadingSummary = false;
            }
        },

        /**
         * Tujuan method ini untuk mengambil daftar session aktif user.
         */
        async loadSessions() {
            this.isLoadingSessions = true;
            this.sessionsError = '';

            try {
                const response = await axios.get('/security/sessions');
                this.sessions = response.data.session_data?.sessions || [];
            } catch {
                this.sessionsError = 'Daftar perangkat aktif belum tersedia. Silakan coba lagi.';
            } finally {
                this.isLoadingSessions = false;
            }
        },

        /**
         * Tujuan method ini untuk memastikan user Clerk aktif tersedia
         * sebelum action keamanan dijalankan dari frontend.
         */
        async getActiveClerkUser() {
            const runtimeState = await waitForClerkLoaded({ timeout: 3000, interval: 50 });

            if(!runtimeState.loaded || !runtimeState.isSignedIn || !runtimeState.clerk?.user)
                throw new Error('Sesi Clerk belum siap. Silakan muat ulang halaman.');

            return runtimeState.clerk.user;
        },

        /**
         * Tujuan method ini untuk menghubungkan OAuth Google ke akun Clerk
         * yang sedang login dari halaman keamanan.
         */
        async connectGoogleAccount(method) {
            if(method.is_enabled) {
                ElNotification({
                    type: 'info',
                    title: 'Info',
                    message: 'Akun Google sudah terhubung.',
                });
                return;
            }

            this.actionMethodKey = 'google';

            try {
                const activeClerkUser = await this.getActiveClerkUser();

                if(typeof activeClerkUser.createExternalAccount !== 'function')
                    throw new Error('Fitur hubungkan Google belum tersedia pada sesi ini.');

                const callbackPath = '/auth/callback';
                const completePath = '/settings/security?google_link=callback';
                const redirectUrl = buildClerkAbsoluteUrl(callbackPath);
                const redirectUrlComplete = buildClerkAbsoluteUrl(completePath);

                rememberClerkAuthReturnUrl('/settings/security');
                rememberGoogleLinkCallback();

                const externalAccount = await activeClerkUser.createExternalAccount({
                    strategy: 'oauth_google',
                    redirectUrl,
                    redirectUrlComplete,
                });
                const verificationUrl = externalAccount?.verification?.externalVerificationRedirectURL
                    || externalAccount?.verification?.external_verification_redirect_url;

                if(verificationUrl)
                    window.location.href = verificationUrl;
            } catch(error) {
                consumeGoogleLinkCallback();
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: getClerkErrorMessage(error, 'Akun Google belum berhasil dihubungkan.'),
                });
            } finally {
                this.actionMethodKey = '';
            }
        },

        /**
         * Tujuan method ini untuk memastikan Google yang baru terhubung
         * emailnya sama dan status OAuth-nya verified sebelum dianggap aktif.
         */
        async finalizeGoogleLinkCallback() {
            consumeGoogleLinkCallback();
            const isGoogleLinkCallback = this.$route.query.google_link === 'callback';

            if(!isGoogleLinkCallback)
                return;

            this.actionMethodKey = 'google';

            try {
                await axios.post('/security/google/link/validate');
                await this.loadSummary();

                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Akun Google berhasil dihubungkan.',
                });
            } catch(error) {
                consumeGoogleLinkCallback();
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: error?.response?.data?.message || 'Akun Google belum berhasil dihubungkan.',
                });
                await this.loadSummary();
            } finally {
                this.actionMethodKey = '';
                this.clearGoogleLinkQuery();
            }
        },

        /**
         * Tujuan method ini untuk membersihkan query callback agar refresh halaman
         * tidak memproses validasi Google berulang.
         */
        clearGoogleLinkQuery() {
            if(this.$route.query.google_link !== 'callback')
                return;

            const query = { ...this.$route.query };
            delete query.google_link;

            this.$router.replace({ query });
        },

        /**
         * Tujuan method ini untuk membuka action metode login
         * sesuai jenis credential yang dipilih user.
         */
        handleSignInMethodAction(method) {
            if(!this.isFeatureAvailable(method))
                return;

            if(method.key === 'password') {
                this.openPasswordModal(method);
                return;
            }

            if(method.key === 'passkey') {
                if(method.is_enabled) {
                    this.openPasskeyModal();
                    return;
                }

                this.createPasskey(method);
                return;
            }

            if(method.key === 'google') {
                this.connectGoogleAccount(method);
                return;
            }

            ElNotification({
                type: 'info',
                title: 'Info',
                message: `${method.label} akan dikelola melalui Clerk setelah konfigurasi fitur siap.`,
            });
        },

        /**
         * Tujuan method ini untuk membuka action perlindungan tambahan
         * yang sudah dikelola langsung melalui Clerk.
         */
        handleProtectionAction(protection) {
            if(!this.isFeatureAvailable(protection))
                return;

            if(protection.key === 'mfa') {
                this.openMfaModal(protection);
                return;
            }

            ElNotification({ type: 'info', title: 'Info', message: `${protection.label} belum tersedia.` });
        },

        /**
         * Tujuan method ini untuk membuka form buat atau ubah password
         * tanpa memperbolehkan user mengganti email utama.
         */
        openPasswordModal(method) {
            this.selectedPasswordMethod = method;
            this.passwordForm = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                requiresCurrentPassword: false,
            };
            this.passwordErrors = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            };
            this.passwordVisibility = {
                current: false,
                new: false,
                confirm: false,
            };
            this.modal.password = true;
        },

        closePasswordModal(force = false) {
            if(this.isProcessingPassword && !force)
                return;

            this.modal.password = false;
            this.selectedPasswordMethod = null;
        },

        /**
         * Tujuan method ini untuk menampilkan atau menyembunyikan
         * isi password tanpa mengubah nilai input.
         */
        togglePasswordVisibility(field) {
            if(!Object.prototype.hasOwnProperty.call(this.passwordVisibility, field))
                return;

            this.passwordVisibility[field] = !this.passwordVisibility[field];
        },

        validatePasswordForm() {
            this.passwordErrors = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            };

            if(this.passwordForm.requiresCurrentPassword && this.passwordForm.currentPassword.trim() === '')
                this.passwordErrors.currentPassword = 'password saat ini wajib diisi';

            if(this.passwordForm.newPassword.trim().length < 8)
                this.passwordErrors.newPassword = 'password baru minimal 8 karakter';

            if(this.passwordForm.confirmPassword.trim() === '')
                this.passwordErrors.confirmPassword = 'konfirmasi password wajib diisi';
            else if(this.passwordForm.newPassword !== this.passwordForm.confirmPassword)
                this.passwordErrors.confirmPassword = 'konfirmasi password tidak sama';

            return !Object.values(this.passwordErrors).some(Boolean);
        },

        /**
         * Tujuan method ini untuk mendeteksi response Clerk saat
         * action sensitif membutuhkan verifikasi ulang sesi.
         */
        isSessionVerificationRequired(error) {
            const errorCodes = error?.errors?.map(item => item.code) || [];

            return errorCodes.includes('session_verification_required')
                || errorCodes.includes('session_reverification_required');
        },

        getSessionVerificationLevel(error) {
            const firstError = error?.errors?.[0] || {};
            const reverification = firstError.meta?.reverification
                || firstError.metadata?.reverification;

            return reverification?.level
                || firstError.meta?.level
                || firstError.metadata?.level
                || 'first_factor';
        },

        sleep(milliseconds = 0) {
            return new Promise(resolve => window.setTimeout(resolve, milliseconds));
        },

        /**
         * Tujuan method ini untuk memberi waktu Clerk menyimpan hasil
         * re-verification sebelum action sensitif dicoba ulang.
         */
        async refreshClerkStateAfterSessionVerification(clerk, delay = 350) {
            await this.sleep(delay);

            const reloadTargets = [
                clerk?.session,
                clerk?.user,
                clerk?.client,
            ].filter(target => typeof target?.reload === 'function');

            await Promise.all(reloadTargets.map(target => target.reload.call(target)));

            await this.sleep(150);
        },

        /**
         * Tujuan method ini untuk membuka modal verifikasi ulang bawaan Clerk
         * sebelum action keamanan sensitif dicoba ulang.
         */
        async requestClerkSessionVerification(error, preferredLevel = '') {
            const runtimeState = await waitForClerkLoaded({ timeout: 3000, interval: 50 });
            const clerk = runtimeState.clerk;

            if(typeof clerk?.__internal_openReverification !== 'function')
                throw new Error('Sesi perlu diverifikasi ulang. Silakan logout lalu login kembali sebelum melanjutkan.');

            await new Promise((resolve, reject) => {
                try {
                    clerk.__internal_openReverification({
                        level: preferredLevel || this.getSessionVerificationLevel(error),
                        afterVerification: async () => {
                            try {
                                await this.refreshClerkStateAfterSessionVerification(clerk);
                                resolve();
                            } catch(reverificationError) {
                                reject(reverificationError);
                            }
                        },
                        afterVerificationCancelled: () => reject(new Error('Verifikasi dibatalkan. Perubahan keamanan belum disimpan.')),
                    });
                } catch(reverificationError) {
                    reject(reverificationError);
                }
            });
        },

        /**
         * Tujuan method ini untuk menjalankan action Clerk yang bisa membutuhkan
         * verifikasi ulang, lalu retry satu kali setelah verifikasi selesai.
         */
        async runClerkActionWithSessionVerification(action, options = {}) {
            try {
                return await action();
            } catch(error) {
                if(!this.isSessionVerificationRequired(error))
                    throw error;

                const runtimeState = await waitForClerkLoaded({ timeout: 3000, interval: 50 });
                await this.requestClerkSessionVerification(error, options.level || '');

                try {
                    return await action();
                } catch(retryError) {
                    if(!this.isSessionVerificationRequired(retryError))
                        throw retryError;

                    await this.refreshClerkStateAfterSessionVerification(runtimeState.clerk, 600);
                    return await action();
                }
            }
        },

        /**
         * Tujuan method ini untuk membuka fallback current password saat
         * modal re-verification Clerk sudah sukses tetapi action tetap ditolak.
         */
        requestCurrentPasswordFallback() {
            this.passwordForm.requiresCurrentPassword = true;
            this.passwordForm.currentPassword = '';
            this.passwordErrors.currentPassword = 'masukkan password saat ini lalu simpan ulang';
            this.passwordVisibility.current = false;
        },

        /**
         * Tujuan method ini untuk menentukan level re-verification password.
         * Akun yang sudah MFA aktif perlu verifikasi multi factor agar Clerk
         * tidak terus menolak action change_password.
         */
        getPasswordReverificationLevel() {
            return this.getSensitiveCredentialReverificationLevel();
        },

        /**
         * Tujuan method ini untuk menentukan level re-verification action
         * kredensial sensitif seperti password dan passkey.
         */
        getSensitiveCredentialReverificationLevel() {
            const mfaProtection = this.additionalProtections.find(item => item.key === 'mfa');

            return mfaProtection?.is_enabled ? 'multi_factor' : 'first_factor';
        },

        /**
         * Tujuan method ini untuk menyusun payload update password.
         * Saat fallback aktif, snake_case ikut dikirim karena endpoint Clerk
         * change_password menerima format field tersebut.
         */
        createPasswordUpdatePayload() {
            const payload = {
                newPassword: this.passwordForm.newPassword,
                signOutOfOtherSessions: true,
            };

            if(!this.passwordForm.requiresCurrentPassword)
                return payload;

            return {
                ...payload,
                currentPassword: this.passwordForm.currentPassword,
                current_password: this.passwordForm.currentPassword,
                new_password: this.passwordForm.newPassword,
                sign_out_of_other_sessions: true,
            };
        },

        /**
         * Tujuan method ini untuk menjalankan update password langsung saat
         * fallback current password sudah aktif agar tidak masuk loop modal Clerk.
         */
        async updatePasswordWithFallbackPayload(payload) {
            const activeClerkUser = await this.getActiveClerkUser();

            return activeClerkUser.updatePassword(payload);
        },

        /**
         * Tujuan method ini untuk membuat atau mengubah password utama
         * melalui Clerk, lalu memuat ulang ringkasan keamanan.
         */
        async submitPasswordForm() {
            if(!this.validatePasswordForm())
                return;

            this.isProcessingPassword = true;
            this.actionMethodKey = 'password';

            try {
                const payload = this.createPasswordUpdatePayload();
                const clerkUser = this.passwordForm.requiresCurrentPassword
                    ? await this.updatePasswordWithFallbackPayload(payload)
                    : await this.runClerkActionWithSessionVerification(async () => {
                        const activeClerkUser = await this.getActiveClerkUser();

                        return activeClerkUser.updatePassword(payload);
                    }, { level: this.getPasswordReverificationLevel() });
                await clerkUser.reload();
                await this.loadSummary();

                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: this.selectedPasswordMethod?.is_enabled ? 'Password berhasil diubah.' : 'Password berhasil dibuat.',
                });

                this.closePasswordModal(true);
            } catch(error) {
                if(this.selectedPasswordMethod?.is_enabled
                    && !this.passwordForm.requiresCurrentPassword
                    && this.isSessionVerificationRequired(error)) {
                    this.requestCurrentPasswordFallback();

                    ElNotification({
                        type: 'warning',
                        title: 'Verifikasi diperlukan',
                        message: 'Masukkan password saat ini di form, lalu klik Simpan Password lagi.',
                    });
                    return;
                }

                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: getClerkErrorMessage(error, 'Password belum berhasil disimpan.'),
                });
            } finally {
                this.isProcessingPassword = false;
                this.actionMethodKey = '';
            }
        },

        /**
         * Tujuan method ini untuk membuat passkey baru melalui WebAuthn Clerk.
         */
        async createPasskey(protection) {
            this.actionMethodKey = protection?.key || 'passkey';
            this.isProcessingPasskeyCreate = true;

            try {
                const clerkUser = await this.runClerkActionWithSessionVerification(async () => {
                    const activeClerkUser = await this.getActiveClerkUser();
                    await activeClerkUser.createPasskey();

                    return activeClerkUser;
                }, { level: this.getSensitiveCredentialReverificationLevel() });
                await clerkUser.reload();
                await this.loadSummary();

                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Passkey berhasil ditambahkan.',
                });
            } catch(error) {
                if(this.isPasskeyRegistrationCancelled(error)) {
                    ElNotification({
                        type: 'info',
                        title: 'Info',
                        message: 'Pembuatan passkey dibatalkan. Tidak ada perubahan pada akun.',
                    });
                    return;
                }

                if(this.isPasskeyAlreadyRegistered(error)) {
                    ElNotification({
                        type: 'warning',
                        title: 'Passkey sudah terdaftar',
                        message: 'Perangkat atau metode passkey ini sudah terhubung ke akun Anda. Gunakan perangkat lain atau hapus passkey lama sebelum menambahkannya lagi.',
                    });
                    return;
                }

                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: getClerkErrorMessage(error, 'Passkey belum berhasil ditambahkan.'),
                });
            } finally {
                this.actionMethodKey = '';
                this.isProcessingPasskeyCreate = false;
            }
        },

        /**
         * Tujuan method ini untuk membedakan pembatalan dialog passkey
         * dari error asli agar user tidak melihat pesan teknis WebAuthn.
         */
        isPasskeyRegistrationCancelled(error) {
            const errorCodes = error?.errors?.map(item => item.code) || [];
            const errorText = [
                error?.code,
                error?.message,
                error?.errors?.[0]?.code,
                error?.errors?.[0]?.message,
                error?.errors?.[0]?.longMessage,
            ].filter(Boolean).join(' ').toLowerCase();

            return errorCodes.includes('passkey_registration_cancelled')
                || errorText.includes('passkey_registration_cancelled');
        },

        /**
         * Tujuan method ini untuk mendeteksi passkey yang sama saat user
         * mencoba mendaftarkan authenticator yang sudah pernah terhubung.
         */
        isPasskeyAlreadyRegistered(error) {
            const errorCodes = error?.errors?.map(item => item.code) || [];
            const errorText = [
                error?.code,
                error?.message,
                error?.errors?.[0]?.code,
                error?.errors?.[0]?.message,
                error?.errors?.[0]?.longMessage,
            ].filter(Boolean).join(' ').toLowerCase();

            return errorCodes.includes('passkey_already_exists')
                || errorText.includes('passkey_already_exists')
                || errorText.includes('already registered');
        },

        /**
         * Tujuan method ini untuk membuka daftar pengelolaan passkey
         * setelah user minimal memiliki satu passkey aktif.
         */
        openPasskeyModal() {
            this.modal.passkey = true;
        },

        closePasskeyModal() {
            if(this.isProcessingPasskeyCreate || this.actionPasskeyId)
                return;

            this.modal.passkey = false;
        },

        /**
         * Tujuan method ini untuk menghapus passkey tertentu dari akun Clerk
         * setelah user menyetujui konfirmasi.
         */
        async deletePasskey(passkey) {
            try {
                await ElMessageBox.confirm(
                    'Passkey ini akan dihapus dari akun Anda.',
                    'Hapus passkey?',
                    {
                        type: 'warning',
                        confirmButtonText: 'Hapus',
                        cancelButtonText: 'Batal',
                    }
                );
            } catch {
                return;
            }

            this.actionPasskeyId = passkey.id;

            try {
                const clerkUser = await this.runClerkActionWithSessionVerification(async () => {
                    const activeClerkUser = await this.getActiveClerkUser();
                    await activeClerkUser.reload();

                    const targetPasskey = activeClerkUser.passkeys.find(item => item.id === passkey.id);

                    if(!targetPasskey)
                        throw new Error('Passkey tidak ditemukan. Silakan muat ulang data keamanan.');

                    await targetPasskey.delete();

                    return activeClerkUser;
                }, { level: this.getSensitiveCredentialReverificationLevel() });
                await clerkUser.reload();
                await this.loadSummary();

                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Passkey berhasil dihapus.',
                });
            } catch(error) {
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: getClerkErrorMessage(error, 'Passkey belum berhasil dihapus.'),
                });
            } finally {
                this.actionPasskeyId = '';
            }
        },

        /**
         * Tujuan method ini untuk membuka setup atau pengelolaan MFA TOTP.
         */
        async openMfaModal(protection) {
            this.selectedMfaProtection = protection;
            this.mfaMode = protection.is_enabled ? 'manage' : 'setup';
            this.totpSetup = null;
            this.totpQrCodeDataUri = '';
            this.totpCode = '';
            this.backupCodes = [];
            this.mfaSetupCompleted = false;
            this.mfaErrors = {
                totpCode: '',
            };
            this.modal.mfa = true;

            if(!protection.is_enabled)
                await this.prepareMfaSetup();
        },

        closeMfaModal(force = false) {
            if(!force && (this.isProcessingMfaSetup || this.isProcessingMfaVerify || this.isProcessingMfaBackup || this.isProcessingMfaDisable))
                return;

            this.modal.mfa = false;
            this.selectedMfaProtection = null;
            this.totpSetup = null;
            this.totpQrCodeDataUri = '';
            this.totpCode = '';
            this.backupCodes = [];
            this.mfaSetupCompleted = false;
        },

        /**
         * Tujuan method ini untuk meminta secret TOTP baru dari Clerk.
         */
        async prepareMfaSetup() {
            this.isProcessingMfaSetup = true;
            this.actionProtectionKey = 'mfa';

            try {
                this.totpSetup = await this.runClerkActionWithSessionVerification(async () => {
                    const clerkUser = await this.getActiveClerkUser();

                    return clerkUser.createTOTP();
                });
                this.totpQrCodeDataUri = await this.createTotpQrCodeDataUri(this.totpSetup?.uri || '');
            } catch(error) {
                this.modal.mfa = false;
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: getClerkErrorMessage(error, 'Setup authenticator belum berhasil disiapkan.'),
                });
            } finally {
                this.isProcessingMfaSetup = false;
                this.actionProtectionKey = '';
            }
        },

        /**
         * Tujuan method ini untuk membuat QR code TOTP dari URI Clerk.
         * Jika QR gagal dibuat, user tetap bisa memakai secret key manual.
         */
        async createTotpQrCodeDataUri(uri) {
            if(!uri)
                return '';

            try {
                return await createQrCodeSvgDataUri(uri);
            } catch(error) {
                console.error(error);

                return '';
            }
        },

        /**
         * Tujuan method ini untuk memverifikasi kode TOTP pertama
         * dan membuat backup codes setelah MFA aktif.
         */
        async verifyMfaSetup() {
            this.mfaErrors.totpCode = '';

            if(this.totpCode.trim() === '') {
                this.mfaErrors.totpCode = 'kode verifikasi wajib diisi';
                return;
            }

            this.isProcessingMfaVerify = true;
            this.actionProtectionKey = 'mfa';

            try {
                const clerkUser = await this.runClerkActionWithSessionVerification(async () => {
                    const activeClerkUser = await this.getActiveClerkUser();
                    await activeClerkUser.verifyTOTP({
                        code: this.totpCode.trim(),
                    });

                    return activeClerkUser;
                });

                try {
                    const backupCode = await this.createBackupCodesWithSessionVerification();
                    this.backupCodes = backupCode.codes || [];
                } catch {
                    this.backupCodes = [];
                }

                await clerkUser.reload();
                await this.loadSummary();
                this.mfaSetupCompleted = true;

                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Two-factor authentication berhasil diaktifkan.',
                });
            } catch(error) {
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: getClerkErrorMessage(error, 'Kode authenticator belum valid.'),
                });
            } finally {
                this.isProcessingMfaVerify = false;
                this.actionProtectionKey = '';
            }
        },

        /**
         * Tujuan method ini untuk membuat ulang backup codes MFA.
         */
        async regenerateBackupCodes() {
            this.isProcessingMfaBackup = true;

            try {
                const backupCode = await this.createBackupCodesWithSessionVerification();
                const clerkUser = await this.getActiveClerkUser();
                this.backupCodes = backupCode.codes || [];
                await clerkUser.reload();
                await this.loadSummary();

                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Backup codes berhasil dibuat ulang.',
                });
            } catch(error) {
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: getClerkErrorMessage(error, 'Backup codes belum berhasil dibuat.'),
                });
            } finally {
                this.isProcessingMfaBackup = false;
            }
        },

        /**
         * Tujuan method ini untuk membuat backup codes MFA melalui Clerk.
         * Backup codes memakai verifikasi multi-factor karena aksinya mengubah
         * recovery method untuk fitur two-factor authentication.
         */
        async createBackupCodesWithSessionVerification() {
            return this.runClerkActionWithSessionVerification(async () => {
                const clerkUser = await this.getActiveClerkUser();

                return clerkUser.createBackupCode();
            }, { level: 'multi_factor' });
        },

        /**
         * Tujuan method ini untuk menonaktifkan TOTP milik user
         * setelah user menyetujui konfirmasi.
         */
        async disableMfa() {
            try {
                await ElMessageBox.confirm(
                    'Authenticator akan dinonaktifkan dari akun ini.',
                    'Nonaktifkan Two-Factor Authentication?',
                    {
                        type: 'warning',
                        confirmButtonText: 'Nonaktifkan',
                        cancelButtonText: 'Batal',
                    }
                );
            } catch {
                return;
            }

            this.isProcessingMfaDisable = true;

            try {
                const clerkUser = await this.runClerkActionWithSessionVerification(async () => {
                    const activeClerkUser = await this.getActiveClerkUser();
                    await activeClerkUser.disableTOTP();

                    return activeClerkUser;
                }, { level: 'multi_factor' });
                await clerkUser.reload();
                await this.loadSummary();

                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Two-factor authentication berhasil dinonaktifkan.',
                });

                this.closeMfaModal(true);
            } catch(error) {
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: getClerkErrorMessage(error, 'Two-factor authentication belum berhasil dinonaktifkan.'),
                });
            } finally {
                this.isProcessingMfaDisable = false;
            }
        },

        async copyText(value, successMessage) {
            if(!value)
                return;

            try {
                await navigator.clipboard.writeText(value);
                ElNotification({ type: 'success', title: 'Success', message: successMessage });
            } catch {
                ElNotification({ type: 'error', title: 'error', message: 'Teks belum berhasil disalin.' });
            }
        },

        copyTotpSecret() {
            this.copyText(this.totpSetup?.secret || '', 'Secret key berhasil disalin.');
        },

        copyBackupCodes() {
            this.copyText(this.backupCodes.join('\n'), 'Backup codes berhasil disalin.');
        },

        /**
         * Tujuan method ini untuk membentuk isi file backup codes
         * yang bisa disimpan user secara lokal.
         */
        getBackupCodesFileContent() {
            return [
                'TokShop Backup Codes',
                '',
                `Dibuat pada: ${new Date().toLocaleString('id-ID')}`,
                '',
                'Simpan file ini di tempat aman. Setiap kode hanya bisa digunakan satu kali.',
                '',
                ...this.backupCodes,
                '',
            ].join('\n');
        },

        /**
         * Tujuan method ini untuk mengunduh backup codes sebagai file teks
         * tanpa mengirim kode ke backend atau layanan lain.
         */
        downloadBackupCodes() {
            if(this.backupCodes.length === 0)
                return;

            const fileContent = this.getBackupCodesFileContent();
            const fileBlob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
            const downloadUrl = URL.createObjectURL(fileBlob);
            const downloadLink = document.createElement('a');
            const dateText = new Date().toISOString().slice(0, 10);

            downloadLink.href = downloadUrl;
            downloadLink.download = `tokshop-backup-codes-${dateText}.txt`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadUrl);
        },

        /**
         * Tujuan method ini untuk mengeluarkan satu perangkat lain
         * setelah user menyetujui konfirmasi.
         */
        async revokeSession(session) {
            try {
                await ElMessageBox.confirm(
                    'Perangkat ini akan dikeluarkan dari akun Anda.',
                    'Keluar dari perangkat ini?',
                    {
                        type: 'warning',
                        confirmButtonText: 'Keluar',
                        cancelButtonText: 'Batal',
                    }
                );
            } catch {
                return;
            }

            this.actionSessionId = session.id;

            try {
                await axios.post(`/security/sessions/${encodeURIComponent(session.id)}/revoke`);
                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Perangkat berhasil dikeluarkan.',
                });
                await this.loadSessions();
            } catch {
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: 'Perangkat belum berhasil dikeluarkan.',
                });
            } finally {
                this.actionSessionId = '';
            }
        },

        /**
         * Tujuan method ini untuk mengeluarkan semua perangkat lain
         * tanpa memutus perangkat yang sedang dipakai.
         */
        async revokeOtherSessions() {
            if(this.otherSessions.length === 0)
                return;

            try {
                await ElMessageBox.confirm(
                    'Semua perangkat lain akan dikeluarkan dari akun ini. Perangkat yang sedang Anda pakai tetap aktif.',
                    'Keluar dari semua perangkat?',
                    {
                        type: 'warning',
                        confirmButtonText: 'Keluar Semua',
                        cancelButtonText: 'Batal',
                    }
                );
            } catch {
                return;
            }

            this.isRevokingOtherSessions = true;

            try {
                const response = await axios.post('/security/sessions/revoke-others');
                const revokedTotal = response.data.result?.revoked_total || 0;

                ElNotification({
                    type: 'success',
                    title: 'Success',
                    message: `${revokedTotal} perangkat berhasil dikeluarkan.`,
                });
                await this.loadSessions();
            } catch {
                ElNotification({
                    type: 'error',
                    title: 'error',
                    message: 'Perangkat lain belum berhasil dikeluarkan.',
                });
            } finally {
                this.isRevokingOtherSessions = false;
            }
        },

        methodIcon(key) {
            if(key === 'google')
                return 'fa-brands fa-google';

            if(key === 'passkey')
                return 'fa-solid fa-key';

            return 'fa-solid fa-lock';
        },

        isFeatureAvailable(item) {
            if(item?.key === 'passkey')
                return this.features.clerkPasskey && item.feature_available !== false;

            if(item?.key === 'mfa')
                return this.features.clerkTotp && item.feature_available !== false;

            return true;
        },

        featureDescription(item) {
            if(this.isFeatureAvailable(item))
                return item.description;

            return `${item.description} Fitur ini memerlukan Clerk Pro dan belum tersedia.`;
        },

        protectionIcon(key) {
            return 'fa-solid fa-shield-halved';
        },

        sessionIcon(session) {
            return session.device_label?.toLowerCase().includes('mobile')
                ? 'fa-solid fa-mobile-screen-button'
                : 'fa-solid fa-laptop';
        },

        statusClass(status) {
            if(['active', 'connected'].includes(status))
                return 'is-success';

            return 'is-muted';
        },

        formatSessionTime(session) {
            if(session.is_current)
                return 'Aktif sekarang';

            const timestamp = Number(session.last_active_at_timestamp || 0);

            if(!timestamp)
                return 'Terakhir aktif tidak tersedia';

            const seconds = Math.max(0, Math.floor((Date.now() - timestamp * 1000) / 1000));

            if(seconds < 60)
                return 'Terakhir aktif baru saja';

            const minutes = Math.floor(seconds / 60);

            if(minutes < 60)
                return `Terakhir aktif ${minutes} menit lalu`;

            const hours = Math.floor(minutes / 60);

            if(hours < 24)
                return `Terakhir aktif ${hours} jam lalu`;

            if(hours < 48)
                return 'Terakhir aktif kemarin';

            return `Terakhir aktif ${new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }).format(new Date(timestamp * 1000))}`;
        },

        formatPasskeyLastUsed(passkey) {
            const timestamp = Number(passkey.last_used_at_timestamp || 0);

            if(!timestamp)
                return 'Belum pernah digunakan';

            return `Terakhir digunakan ${new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }).format(new Date(timestamp * 1000))}`;
        },
    },
}
</script>

<style scoped>
.security-page {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.security-panel {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.security-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 18px 16px;
    border-bottom: 1px solid #e5e7eb;
}

.security-panel-header h3 {
    color: #111827;
    font-size: 18px;
    font-weight: 700;
}

.security-panel-header p {
    margin-top: 4px;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
}

.security-session-header {
    align-items: center;
}

.security-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.security-group {
    padding: 18px;
}

.security-group + .security-group {
    border-top: 1px solid #f1f5f9;
}

.security-group h4 {
    margin-bottom: 10px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.security-list {
    display: flex;
    flex-direction: column;
}

.security-panel > .security-list {
    padding: 0 18px;
}

.security-row {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    min-height: 74px;
    padding: 14px 0;
}

.security-row + .security-row {
    border-top: 1px solid #f1f5f9;
}

.security-session-row {
    min-height: 82px;
}

.security-row-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f8fafc;
    color: #475569;
    font-size: 17px;
}

.security-row-main {
    min-width: 0;
}

.security-row-title {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.security-row-title h5 {
    min-width: 0;
    color: #0f172a;
    font-size: 15px;
    font-weight: 700;
    word-break: break-word;
}

.security-row-main p {
    margin-top: 4px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
}

.security-row.is-feature-locked {
    border: 1px dashed #f59e0b;
    border-radius: 9px;
    background: #fffbeb;
    margin: 4px 8px;
    padding: 12px;
}

.security-row.is-feature-locked .security-row-icon {
    background: #fef3c7;
    color: #b45309;
}

.security-muted-text {
    color: #94a3b8 !important;
}

.security-badge {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    min-height: 22px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    padding: 0 9px;
}

.security-badge.is-success {
    background: #dcfce7;
    color: #15803d;
}

.security-badge.is-muted {
    background: #e2e8f0;
    color: #64748b;
}

.security-badge.is-current {
    background: #ede9fe;
    color: #7c3aed;
}

.security-badge.is-pro {
    gap: 5px;
    background: #fef3c7;
    color: #92400e;
    box-shadow: inset 0 0 0 1px #fcd34d;
}

.security-icon-button,
.security-primary-button,
.security-secondary-button,
.security-danger-button,
.security-danger-outline-button,
.security-alert button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 700;
    padding: 0 12px;
    transition: 150ms ease-in-out;
}

.security-icon-button {
    width: 36px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #64748b;
    padding: 0;
}

.security-icon-button:not(:disabled):hover,
.security-secondary-button:not(:disabled):hover {
    border-color: #8b5cf6;
    background: #f5f3ff;
    color: #7c3aed;
}

.security-secondary-button {
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #475569;
}

.security-primary-button {
    border: 1px solid #7c3aed;
    background: #8b5cf6;
    color: #ffffff;
}

.security-primary-button:not(:disabled):hover {
    background: #7c3aed;
}

.security-danger-button {
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #dc2626;
}

.security-danger-button:not(:disabled):hover {
    background: #fee2e2;
}

.security-danger-outline-button {
    border: 1px solid #fecaca;
    background: #ffffff;
    color: #dc2626;
}

.security-danger-outline-button:not(:disabled):hover {
    background: #fef2f2;
}

.security-icon-button:disabled,
.security-primary-button:disabled,
.security-secondary-button:disabled,
.security-danger-button:disabled,
.security-danger-outline-button:disabled {
    cursor: not-allowed;
    opacity: 0.58;
}

.security-alert {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin: 18px;
    border: 1px solid #fde68a;
    border-radius: 8px;
    background: #fffbeb;
    padding: 14px;
}

.security-alert strong {
    color: #92400e;
    font-size: 14px;
}

.security-alert p {
    margin-top: 3px;
    color: #b45309;
    font-size: 13px;
}

.security-alert button {
    border: 1px solid #f59e0b;
    background: #ffffff;
    color: #92400e;
}

.security-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    padding: 28px 18px;
    text-align: center;
}

.security-empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border-radius: 8px;
    background: #f8fafc;
    color: #64748b;
    font-size: 20px;
}

.security-empty h4 {
    margin-top: 12px;
    color: #334155;
    font-size: 16px;
    font-weight: 700;
}

.security-empty p {
    margin-top: 5px;
    color: #94a3b8;
    font-size: 13px;
}

.security-empty.is-compact {
    min-height: 180px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f8fafc;
}

.security-skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 18px;
}

.security-group .security-skeleton-list {
    padding: 0;
}

.security-skeleton-row {
    height: 68px;
    border-radius: 8px;
    background: linear-gradient(90deg, #f1f5f9 0%, #f8fafc 48%, #f1f5f9 100%);
    background-size: 200% 100%;
    animation: security-skeleton 1.1s ease-in-out infinite;
}

.security-modal {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 22px;
}

:deep(.modal-panel.security-credential-modal-panel) {
    max-width: min(760px, calc(100vw - 32px));
}

.security-modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.security-modal-header h3 {
    color: #111827;
    font-size: 20px;
    font-weight: 800;
}

.security-modal-header p {
    margin-top: 5px;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
}

.security-modal-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    background: #ffffff;
    color: #64748b;
    transition: 150ms ease-in-out;
}

.security-modal-close:hover {
    background: #f8fafc;
    color: #0f172a;
}

.security-modal-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.security-modal-field label {
    color: #334155;
    font-size: 13px;
    font-weight: 700;
}

.security-modal-field input,
.security-modal-field textarea {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 7px;
    background: #ffffff;
    color: #0f172a;
    font-size: 14px;
    outline: none;
    padding: 10px 12px;
    transition: 150ms ease-in-out;
}

.security-password-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.security-password-input-wrap input {
    padding-right: 44px;
}

.security-password-toggle {
    position: absolute;
    right: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #64748b;
    transition: 150ms ease-in-out;
}

.security-password-toggle:hover {
    background: #f8fafc;
    color: #0f172a;
}

.security-modal-field textarea {
    min-height: 78px;
    resize: vertical;
    word-break: break-all;
}

.security-modal-field input:focus,
.security-modal-field textarea:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.14);
}

.security-modal-field input.is-error-field,
.security-modal-field textarea.is-error-field {
    border-color: #ef4444;
}

.security-modal-field small {
    color: #dc2626;
    font-size: 12px;
}

.security-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
}

.security-modal-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 110px;
    color: #64748b;
    font-size: 14px;
    font-weight: 700;
}

.security-mfa-setup-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.security-info-box {
    border: 1px solid #dbeafe;
    border-radius: 8px;
    background: #eff6ff;
    padding: 12px 14px;
}

.security-info-box.is-success {
    border-color: #bbf7d0;
    background: #f0fdf4;
}

.security-info-box strong {
    color: #1e3a8a;
    font-size: 13px;
    font-weight: 800;
}

.security-info-box.is-success strong {
    color: #166534;
}

.security-info-box p {
    margin-top: 4px;
    color: #475569;
    font-size: 13px;
    line-height: 1.5;
}

.security-passkey-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f8fafc;
    padding: 12px 14px;
}

.security-passkey-toolbar strong {
    color: #0f172a;
    font-size: 14px;
    font-weight: 800;
}

.security-passkey-toolbar p {
    margin-top: 4px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
}

.security-passkey-toolbar .security-secondary-button {
    flex: 0 0 auto;
    min-width: 136px;
    white-space: nowrap;
}

.security-modal-list {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0 14px;
}

.security-qr-card {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    padding: 16px;
}

.security-qr-card img {
    width: min(240px, 100%);
    aspect-ratio: 1;
    display: block;
    image-rendering: pixelated;
}

.security-secret-box {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f8fafc;
    padding: 12px;
}

.security-secret-box > div {
    min-width: 0;
}

.security-secret-box span {
    display: block;
    margin-bottom: 4px;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
}

.security-secret-box code {
    color: #0f172a;
    font-size: 13px;
    font-weight: 800;
    word-break: break-all;
}

.security-secret-box button,
.security-backup-header button {
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    background: #ffffff;
    color: #475569;
    font-size: 12px;
    font-weight: 800;
    min-height: 32px;
    padding: 0 10px;
}

.security-backup-codes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f8fafc;
    padding: 12px;
}

.security-backup-header {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 2px;
}

.security-backup-header strong {
    color: #0f172a;
    font-size: 13px;
    font-weight: 800;
}

.security-backup-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.security-backup-codes code {
    border-radius: 6px;
    background: #ffffff;
    color: #0f172a;
    font-size: 13px;
    font-weight: 800;
    padding: 8px 10px;
    text-align: center;
}

@keyframes security-skeleton {
    0% {
        background-position: 100% 0;
    }

    100% {
        background-position: -100% 0;
    }
}

@media (max-width: 768px) {
    .security-panel-header,
    .security-session-header {
        flex-direction: column;
        align-items: stretch;
    }

    .security-row {
        grid-template-columns: 40px minmax(0, 1fr);
    }

    .security-secondary-button,
    .security-primary-button,
    .security-danger-button {
        grid-column: 1 / -1;
        width: 100%;
    }

    .security-danger-outline-button {
        width: 100%;
    }

    .security-header-actions {
        width: 100%;
    }

    .security-alert {
        flex-direction: column;
        align-items: stretch;
    }

    .security-modal-actions {
        flex-direction: column;
    }

    .security-passkey-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .security-secret-box,
    .security-backup-codes {
        grid-template-columns: 1fr;
    }
}
</style>
