<template>
  <div class="auth-page w-full min-h-screen overflow-hidden flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <div class="w-full max-w-[26rem] space-y-4 relative z-[1]">
      <section v-if="!isClerkEnabled" class="auth-card">
        <div class="text-center">
          <p class="auth-brand">TokShop</p>
          <h1 class="auth-title">Login Belum Tersedia</h1>
          <p class="auth-subtitle">
            Konfigurasi login belum lengkap. Silakan hubungi admin aplikasi.
          </p>
        </div>
      </section>

      <AuthProcessingPanel
        v-else-if="!$global.isLoggingOut && (isClerkResolving || (isClerkSignedIn && shouldShowBridgePanel))"
        :error-message="clerkBootstrapErrorMessage"
        :retrying="isBootstrappingClerkSession"
        :signing-out="isProcessingClerkSignOut"
        @retry="bridgeClerkSessionToBackend"
        @sign-out="signOutClerkSession" />

      <form v-else-if="!$global.isLoggingOut" class="auth-card" @submit.prevent="submitActiveLoginStep">
        <div class="text-center">
          <p class="auth-brand">TokShop</p>
          <h1 class="auth-title">{{ authFormTitle }}</h1>
          <p class="auth-subtitle">
            {{ authFormSubtitle }}
          </p>
        </div>

        <div v-if="!isClerkVerificationStep" class="auth-social-panel">
          <button
            type="button"
            class="auth-social-button"
            :class="{ 'opacity-70': isProcessingGoogleLogin }"
            :disabled="isProcessingGoogleLogin || isProcessingPasskeyLogin"
            @click="signInWithGoogle">
            <span class="auth-social-button-icon" aria-hidden="true">
              <img :src="googleIcon" alt="" class="auth-social-button-icon-image">
            </span>
            <span class="auth-social-button-text">
              Continue with Google
              <i v-if="isProcessingGoogleLogin" class="fa-solid fa-spinner fa-spin-pulse"></i>
            </span>
          </button>

          <button
            v-if="features.clerkPasskey"
            type="button"
            class="auth-social-button"
            :class="{ 'opacity-70': isProcessingPasskeyLogin }"
            :disabled="isProcessingGoogleLogin || isProcessingPasskeyLogin"
            @click="signInWithPasskey">
            <span class="auth-social-button-icon" aria-hidden="true">
              <i class="fa-solid fa-key"></i>
            </span>
            <span class="auth-social-button-text">
              Login dengan Passkey
              <i v-if="isProcessingPasskeyLogin" class="fa-solid fa-spinner fa-spin-pulse"></i>
            </span>
          </button>

          <div class="auth-social-divider">
            <span class="h-px flex-1 bg-slate-200"></span>
            <span>Or</span>
            <span class="h-px flex-1 bg-slate-200"></span>
          </div>
        </div>

        <div
          class="auth-form"
          :class="{
            'auth-form-after-social': isClerkEnabled && !isClerkVerificationStep
          }">
          <template v-if="isClerkVerificationStep">
            <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {{ verificationInfoText }}
            </div>

            <div class="auth-field">
              <label for="second_factor_code">{{ secondFactorInputLabel }}</label>
              <div v-if="isBackupCodeSecondFactor" class="auth-input-wrap">
                <input
                  v-model="secondFactorCode"
                  type="text"
                  inputmode="text"
                  autocomplete="one-time-code"
                  id="second_factor_code"
                  :placeholder="secondFactorInputPlaceholder"
                  class="auth-input"
                  :class="{ 'is-error-field': errors.secondFactorCode }"
                  @input="watchInputSecondFactorCode">
                <span class="auth-input-icon" aria-hidden="true">
                  <i class="fa-solid fa-shield-halved"></i>
                </span>
              </div>
              <div
                v-else
                class="auth-otp-group"
                :class="{ 'is-error-field': errors.secondFactorCode }">
                <input
                  v-for="index in 6"
                  :key="`second-factor-code-${index}`"
                  :ref="element => setSecondFactorOtpInputRef(index - 1, element)"
                  :value="secondFactorOtpDigits[index - 1]"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="1"
                  class="auth-otp-input"
                  :aria-label="`Digit kode authenticator ${index}`"
                  @input="handleSecondFactorOtpInput(index - 1, $event)"
                  @keydown="handleSecondFactorOtpKeydown(index - 1, $event)"
                  @paste.prevent="handleSecondFactorOtpPaste(index - 1, $event)">
              </div>
              <small v-if="errors.secondFactorCode" class="auth-error-text">{{ errors.secondFactorCode }}</small>
            </div>

            <div class="flex items-center justify-between gap-3 text-sm">
              <button
                v-if="canSwitchSecondFactorStrategy && isBackupCodeSecondFactor"
                type="button"
                class="auth-switch-link"
                @click="setSecondFactorStrategy('totp')">
                Gunakan kode Authenticator
              </button>
              <button
                v-else-if="canSwitchSecondFactorStrategy"
                type="button"
                class="auth-switch-link"
                @click="setSecondFactorStrategy('backup_code')">
                Gunakan backup code
              </button>
              <span v-else></span>
              <button
                type="button"
                class="auth-switch-link"
                @click="cancelClerkSecondFactorStep">
                Batalkan login
              </button>
            </div>
          </template>

          <template v-else>
            <div class="auth-field">
              <label for="email">Email</label>
              <div class="auth-input-wrap">
                <input
                  v-model="email"
                  required
                  type="email"
                  autocomplete="email"
                  id="email"
                  placeholder="Masukkan email"
                  class="auth-input"
                  :class="{ 'is-error-field': errors.email }"
                  @input="watchInputEmail">
                <span class="auth-input-icon" aria-hidden="true">
                  <i class="fa-regular fa-envelope"></i>
                </span>
              </div>
              <small v-if="errors.email" class="auth-error-text">{{ errors.email }}</small>
            </div>

            <div class="auth-field">
              <label for="password">Password</label>
              <div class="auth-input-wrap">
                <input
                  v-model="password"
                  :type="isShowPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  id="password"
                  placeholder="Masukkan password"
                  class="auth-input"
                  :class="{ 'is-error-field': errors.password }"
                  @input="watchInpuPassword">
                <button
                  type="button"
                  class="auth-icon-button"
                  :aria-label="isShowPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  @click="isShowPassword = !isShowPassword">
                  <i :class="isShowPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
              </div>
              <small v-if="errors.password" class="auth-error-text">{{ errors.password }}</small>
            </div>

            <div class="flex justify-end text-sm">
              <router-link to="/forgot-password" class="auth-switch-link">Lupa password?</router-link>
            </div>
          </template>
        </div>

        <button
          type="submit"
          class="auth-primary-button"
          :class="{ 'opacity-70': isProcessLogin || isPreparingClientTrust }"
          :disabled="isProcessLogin || isPreparingClientTrust">
          {{ loginButtonLabel }}
          <i v-if="isProcessLogin || isPreparingClientTrust" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
        </button>

        <p v-if="!isClerkVerificationStep" class="auth-switch-text">
          Belum punya akun?
          <router-link to="/register" class="auth-switch-link">Register</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { useSignIn } from '@clerk/vue';
import { ElNotification } from 'element-plus';
import { ref } from 'vue';
import googleIcon from '@/assets/icons/google.svg';
import AuthProcessingPanel from '@/components/auth/AuthProcessingPanel.vue';
import { features } from '@/features';
import {
  bootstrapResolvedAuthSession,
  logoutResolvedAuthSession,
  prepareBrowserForNewAuthentication,
  resolveDefaultAuthenticatedRouteName
} from '@/authBridge';
import {
  clearClerkAuthErrorFromRoute,
  clearCancelledClerkSecondFactorStep,
  clearClerkSecondFactorExpiresAt,
  clearGoogleLoginCallback,
  clerkUiConfig,
  consumeClerkAuthErrorFromRoute,
  getCancelledClerkSecondFactorSignInId,
  getClerkErrorMessage,
  getClerkOauthRedirectUrls,
  getClerkSecondFactorExpiresAt,
  getClerkRuntimeState,
  isClerkEnabled,
  rememberCancelledClerkSecondFactorStep,
  rememberClerkAuthReturnUrl,
  rememberClerkSecondFactorExpiresAt,
  rememberGoogleLoginCallback
} from '@/clerk';

export default {
  components: { AuthProcessingPanel },
  setup() {
    if(!isClerkEnabled) {
      return {
        clerkSignInLoaded: ref(false),
        clerkSignInResource: ref(null),
        clerkSetActive: null,
      };
    }

    const { isLoaded, signIn, setActive } = useSignIn();

    return {
      clerkSignInLoaded: isLoaded,
      clerkSignInResource: signIn,
      clerkSetActive: setActive,
    };
  },

  data() {
    return  {
      email: '',
      password: '',
      secondFactorCode: '',
      secondFactorOtpInputRefs: [],
      secondFactorTimeoutTimer: null,
      secondFactorStrategy: 'totp',
      activeClerkSignInAttempt: null,

      isShowPassword: false,
      isProcessLogin: false,
      isProcessingGoogleLogin: false,
      isProcessingPasskeyLogin: false,
      isProcessingClerkSignOut: false,
      isBootstrappingClerkSession: false,
      isPreparingClientTrust: false,
      isExpiringSecondFactor: false,
      isInlineAuthBridge: false,
      cancelledSecondFactorSignInId: getCancelledClerkSecondFactorSignInId(),
      preparedClientTrustSignInId: '',
      clerkBootstrapErrorMessage: '',

      clerkUi: clerkUiConfig,
      googleIcon,
      features,

      errors: {
        email: '',
        password: '',
        secondFactorCode: '',
      }
    }
  },

  computed: {
    isClerkEnabled() {
      return isClerkEnabled;
    },

    isClerkSignedIn() {
      return Boolean(this.$global.clerk.isSignedIn);
    },

    isClerkResolving() {
      return this.isClerkEnabled && !this.$global.clerk.loaded;
    },

    activeClerkSignInResource() {
      return this.activeClerkSignInAttempt || this.clerkSignInResource;
    },

    clerkSignInStatus() {
      return this.getClerkSignInStatus(this.activeClerkSignInResource);
    },

    clerkSignInId() {
      return this.getClerkSignInId(this.activeClerkSignInResource);
    },

    hasCancelledSecondFactorStep() {
      if(!this.cancelledSecondFactorSignInId)
        return false;

      if(!this.clerkSignInId)
        return true;

      return this.cancelledSecondFactorSignInId === this.clerkSignInId;
    },

    isClerkSecondFactorStep() {
      return this.clerkSignInStatus === 'needs_second_factor' && !this.hasCancelledSecondFactorStep;
    },

    isClerkClientTrustStep() {
      return this.clerkSignInStatus === 'needs_client_trust' && !this.hasCancelledSecondFactorStep;
    },

    isClerkVerificationStep() {
      return this.isClerkSecondFactorStep || this.isClerkClientTrustStep;
    },

    supportedSecondFactorStrategies() {
      return this.getClerkSupportedSecondFactors(this.activeClerkSignInResource)
        .map(factor => factor.strategy);
    },

    hasTotpSecondFactor() {
      return this.supportedSecondFactorStrategies.includes('totp');
    },

    hasBackupCodeSecondFactor() {
      return this.supportedSecondFactorStrategies.includes('backup_code');
    },

    isBackupCodeSecondFactor() {
      return this.secondFactorStrategy === 'backup_code';
    },

    canSwitchSecondFactorStrategy() {
      return !this.isClerkClientTrustStep && this.hasTotpSecondFactor && this.hasBackupCodeSecondFactor;
    },

    authFormTitle() {
      if(this.isClerkClientTrustStep)
        return 'Verifikasi Perangkat Baru';

      if(this.isClerkSecondFactorStep)
        return 'Verifikasi Two-Factor Authentication';

      return 'Login TokShop';
    },

    authFormSubtitle() {
      if(this.isClerkClientTrustStep)
        return 'Masukkan kode yang kami kirim ke email Anda untuk melanjutkan login.';

      if(this.isClerkSecondFactorStep)
        return 'Masukkan kode dari aplikasi Authenticator atau gunakan backup code untuk menyelesaikan login.';

      return 'Masuk menggunakan email/password atau akun Google Anda.';
    },

    verificationInfoText() {
      if(this.isClerkClientTrustStep)
        return 'Password sudah benar. Untuk melindungi akun Anda, masukkan kode email agar browser ini bisa dipercaya.';

      return 'Akun ini memakai perlindungan tambahan. Langkah login pertama sudah berhasil, tetapi masih perlu verifikasi TFA.';
    },

    secondFactorInputLabel() {
      if(this.isClerkClientTrustStep)
        return 'Kode Email';

      return this.isBackupCodeSecondFactor ? 'Backup Code' : 'Kode Authenticator';
    },

    secondFactorInputPlaceholder() {
      if(this.isClerkClientTrustStep)
        return 'Masukkan 6 digit kode email';

      return this.isBackupCodeSecondFactor ? 'Masukkan backup code' : 'Masukkan 6 digit kode';
    },

    secondFactorOtpDigits() {
      return this.normalizeSecondFactorTotpCode(this.secondFactorCode).padEnd(6, ' ').slice(0, 6).split('').map(item => item.trim());
    },

    loginButtonLabel() {
      if(this.isClerkClientTrustStep)
        return 'Verifikasi Email';

      return this.isClerkSecondFactorStep ? 'Verifikasi TFA' : 'Login';
    },

    shouldShowBridgePanel() {
      return Boolean(this.clerkBootstrapErrorMessage || !this.isInlineAuthBridge);
    }
  },

  watch: {
    isClerkSignedIn: {
      immediate: true,

      handler(isSignedIn) {
        if(isSignedIn && !this.$global.isLoggingOut && !this.isInlineAuthBridge)
          this.bridgeClerkSessionToBackend();
      }
    },

    clerkSignInStatus: {
      immediate: true,

      handler(status) {
        if(status === 'needs_second_factor') {
          this.ensureDefaultSecondFactorStrategy();
          this.ensureSecondFactorTimeout();
          return;
        }

        if(status === 'needs_client_trust')
          this.ensureSecondFactorTimeout();
      }
    }
  },

  mounted() {
    this.notifyAuthCallbackError();
    window.addEventListener('focus', this.checkSecondFactorTimeoutOnActiveTab);
    window.addEventListener('pageshow', this.checkSecondFactorTimeoutOnActiveTab);
    document.addEventListener('visibilitychange', this.checkSecondFactorTimeoutOnActiveTab);
  },

  beforeUnmount() {
    this.clearSecondFactorTimeoutTimer();
    window.removeEventListener('focus', this.checkSecondFactorTimeoutOnActiveTab);
    window.removeEventListener('pageshow', this.checkSecondFactorTimeoutOnActiveTab);
    document.removeEventListener('visibilitychange', this.checkSecondFactorTimeoutOnActiveTab);
  },

  methods: {
    /**
     * Menampilkan error OAuth setelah callback selesai redirect kembali ke halaman login.
     */
    notifyAuthCallbackError() {
      const message = consumeClerkAuthErrorFromRoute(this.$route);

      if(!message)
        return;

      ElNotification({
        type: 'error',
        title: 'error',
        message,
      });

      clearClerkAuthErrorFromRoute(this.$route, this.$router);
    },

    /**
     * Membersihkan error field lokal sebelum submit berikutnya dijalankan.
     */
    resetErrors() {
      this.errors.email = '';
      this.errors.password = '';
      this.errors.secondFactorCode = '';
    },

    /* VALIDATION INPUT */
    watchInputEmail() {
      if(this.email.trim() !== '') {
        this.errors.email = '';
      }
    },

    watchInpuPassword() {
      if(this.password.trim() !== '') {
        this.errors.password = '';
      }
    },

    watchInputSecondFactorCode() {
      if(this.secondFactorCode.trim() !== '') {
        this.errors.secondFactorCode = '';
      }
    },
    /* VALIDATION INPUT */

    /**
     * Menyimpan batas waktu TFA satu kali supaya refresh halaman tidak memperpanjang waktu verifikasi.
     */
    ensureSecondFactorTimeout() {
      if(this.isExpiringSecondFactor)
        return;

      const expiresAt = getClerkSecondFactorExpiresAt() || rememberClerkSecondFactorExpiresAt();

      this.clearSecondFactorTimeoutTimer();
      this.secondFactorTimeoutTimer = window.setInterval(() => {
        this.expireSecondFactorIfTimedOut();
      }, 1000);
      this.expireSecondFactorIfTimedOut(expiresAt);
    },

    /**
     * Menghentikan pengecekan timeout TFA tanpa menghapus deadline yang tersimpan.
     */
    clearSecondFactorTimeoutTimer() {
      if(!this.secondFactorTimeoutTimer)
        return;

      window.clearInterval(this.secondFactorTimeoutTimer);
      this.secondFactorTimeoutTimer = null;
    },

    /**
     * Membersihkan deadline TFA ketika login selesai, dibatalkan, atau dimulai ulang.
     */
    clearSecondFactorTimeoutState() {
      this.clearSecondFactorTimeoutTimer();
      clearClerkSecondFactorExpiresAt();
    },

    /**
     * Mengecek apakah pending TFA sudah melewati batas waktu.
     */
    isSecondFactorTimedOut(expiresAt = getClerkSecondFactorExpiresAt()) {
      return Boolean(expiresAt && Date.now() >= expiresAt);
    },

    /**
     * Mengakhiri pending TFA yang terlalu lama agar user harus login ulang.
     */
    expireSecondFactorIfTimedOut(expiresAt = getClerkSecondFactorExpiresAt()) {
      if(!this.isSecondFactorTimedOut(expiresAt) || this.isExpiringSecondFactor)
        return false;

      const { clerk } = getClerkRuntimeState();
      const signInId = this.clerkSignInId;

      this.isExpiringSecondFactor = true;
      this.clearSecondFactorTimeoutState();

      if(typeof clerk?.client?.resetSignIn === 'function')
        clerk.client.resetSignIn();

      this.cancelledSecondFactorSignInId = signInId;
      this.activeClerkSignInAttempt = null;
      this.secondFactorCode = '';
      this.secondFactorStrategy = 'totp';
      this.resetErrors();
      this.clerkBootstrapErrorMessage = '';
      this.isInlineAuthBridge = false;
      this.preparedClientTrustSignInId = '';
      rememberCancelledClerkSecondFactorStep(signInId);

      ElNotification({
        type: 'warning',
        title: 'warning',
        message: 'Waktu verifikasi habis. Silakan login ulang.',
      });

      this.$router.replace(this.clerkUi.signInUrl);
      this.$nextTick(() => {
        this.isExpiringSecondFactor = false;
      });

      return true;
    },

    /**
     * Mengecek timeout ketika user kembali ke tab atau halaman login aktif lagi.
     */
    checkSecondFactorTimeoutOnActiveTab() {
      if(document.visibilityState && document.visibilityState !== 'visible')
        return;

      if(this.isClerkVerificationStep)
        this.expireSecondFactorIfTimedOut();
    },

    /**
     * Menyimpan ref input OTP supaya perpindahan fokus antar digit
     * bisa dilakukan tanpa query DOM manual.
     */
    setSecondFactorOtpInputRef(index, element) {
      if(element)
        this.secondFactorOtpInputRefs[index] = element;
    },

    /**
     * Membersihkan kode authenticator agar hanya berisi maksimal 6 digit.
     */
    normalizeSecondFactorTotpCode(value = '') {
      return String(value).replace(/\D/g, '').slice(0, 6);
    },

    /**
     * Mengisi kode OTP dari input digit biasa atau paste sebagian.
     */
    updateSecondFactorOtpCode(value = '', startIndex = 0) {
      const digits = this.secondFactorOtpDigits;
      const incomingDigits = this.normalizeSecondFactorTotpCode(value).split('');

      if(incomingDigits.length === 0) {
        digits[startIndex] = '';
        this.secondFactorCode = digits.join('');
        return;
      }

      incomingDigits.forEach((digit, offset) => {
        const targetIndex = startIndex + offset;

        if(targetIndex < digits.length)
          digits[targetIndex] = digit;
      });

      this.secondFactorCode = digits.join('');
      this.watchInputSecondFactorCode();
    },

    /**
     * Memindahkan fokus ke kotak OTP tertentu jika index masih valid.
     */
    focusSecondFactorOtpInput(index) {
      const targetInput = this.secondFactorOtpInputRefs[index];

      if(!targetInput)
        return;

      this.$nextTick(() => {
        targetInput.focus();
        targetInput.select();
      });
    },

    /**
     * Mengelola input digit OTP dan otomatis maju ke kotak berikutnya.
     */
    handleSecondFactorOtpInput(index, event) {
      const value = event.target.value;
      this.updateSecondFactorOtpCode(value, index);
      event.target.value = this.secondFactorOtpDigits[index] || '';

      if(this.normalizeSecondFactorTotpCode(value).length > 0 && index < 5)
        this.focusSecondFactorOtpInput(index + 1);
    },

    /**
     * Mengelola keyboard OTP seperti backspace, panah kiri/kanan, dan Enter.
     */
    handleSecondFactorOtpKeydown(index, event) {
      if(event.key === 'Enter')
        return;

      if(event.key === 'Backspace' && !this.secondFactorOtpDigits[index] && index > 0) {
        event.preventDefault();
        this.focusSecondFactorOtpInput(index - 1);
        return;
      }

      if(event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        this.focusSecondFactorOtpInput(index - 1);
        return;
      }

      if(event.key === 'ArrowRight' && index < 5) {
        event.preventDefault();
        this.focusSecondFactorOtpInput(index + 1);
      }
    },

    /**
     * Mengizinkan user paste 6 digit sekaligus dari aplikasi authenticator.
     */
    handleSecondFactorOtpPaste(index, event) {
      const pastedText = event.clipboardData?.getData('text') || '';
      this.updateSecondFactorOtpCode(pastedText, index);
      this.focusSecondFactorOtpInput(Math.min(index + this.normalizeSecondFactorTotpCode(pastedText).length, 5));
    },

    /**
     * Menjalankan submit aktif dari form login agar tombol Enter
     * dan klik tombol utama memakai flow autentikasi yang sama.
     */
    submitActiveLoginStep() {
      if(this.isClerkClientTrustStep) {
        this.verifyClerkSecondFactor();
        return;
      }

      if(this.isClerkSecondFactorStep) {
        this.verifyClerkSecondFactor();
        return;
      }

      this.loginSubmit();
    },

    /**
     * Memastikan strategi TFA default mengikuti faktor yang tersedia di Clerk.
     */
    ensureDefaultSecondFactorStrategy() {
      if(this.hasCancelledSecondFactorStep)
        return;

      if(this.hasTotpSecondFactor) {
        this.secondFactorStrategy = 'totp';
        return;
      }

      if(this.hasBackupCodeSecondFactor)
        this.secondFactorStrategy = 'backup_code';
    },

    /**
     * Mengganti metode verifikasi TFA tanpa mempertahankan kode dari metode sebelumnya.
     */
    setSecondFactorStrategy(strategy) {
      if(this.expireSecondFactorIfTimedOut())
        return;

      if(!this.supportedSecondFactorStrategies.includes(strategy))
        return;

      this.secondFactorStrategy = strategy;
      this.secondFactorCode = '';
      this.errors.secondFactorCode = '';
    },

    /**
     * Membatalkan attempt login yang sedang tertahan di verifikasi TFA.
     */
    cancelClerkSecondFactorStep() {
      const { clerk } = getClerkRuntimeState();
      const signInId = this.clerkSignInId;

      this.clearSecondFactorTimeoutState();

      if(typeof clerk?.client?.resetSignIn === 'function')
        clerk.client.resetSignIn();

      this.cancelledSecondFactorSignInId = signInId;
      this.activeClerkSignInAttempt = null;
      this.secondFactorCode = '';
      this.secondFactorStrategy = 'totp';
      this.resetErrors();
      this.clerkBootstrapErrorMessage = '';
      this.isInlineAuthBridge = false;
      this.preparedClientTrustSignInId = '';
      rememberCancelledClerkSecondFactorStep(signInId);
    },

    /**
     * Mengaktifkan ulang flow sign-in baru setelah user membatalkan verifikasi TFA sebelumnya.
     */
    resetCancelledSecondFactorStep() {
      this.cancelledSecondFactorSignInId = '';
      clearCancelledClerkSecondFactorStep();
    },

    /**
     * Mengambil faktor email_code yang disediakan Clerk untuk verifikasi client trust.
     */
    getEmailCodeSecondFactor(resource) {
      return this.getClerkSupportedSecondFactors(resource)
        .find(factor => factor.strategy === 'email_code') || null;
    },

    /**
     * Mengambil sign-in aktif langsung dari runtime Clerk agar state UI
     * segera mengikuti status terbaru tanpa menunggu refresh halaman.
     */
    getRuntimeClerkSignInAttempt() {
      const { clerk } = getClerkRuntimeState();

      return clerk?.client?.signIn || clerk?.client?.sign_in || null;
    },

    /**
     * Mengambil object sign-in dari beberapa bentuk response Clerk.
     */
    resolveClerkSignInAttempt(response) {
      const candidates = [
        response,
        response?.response,
        response?.signIn,
        response?.sign_in,
        response?.client?.signIn,
        response?.client?.sign_in,
        response?.response?.signIn,
        response?.response?.sign_in,
        response?.response?.client?.signIn,
        response?.response?.client?.sign_in,
        this.getRuntimeClerkSignInAttempt(),
        this.clerkSignInResource,
      ];

      return candidates.find(candidate => this.isClerkSignInLike(candidate)) || response || null;
    },

    /**
     * Mengecek apakah object terlihat seperti sign-in resource dari Clerk.
     */
    isClerkSignInLike(resource) {
      return Boolean(resource && (
        ['sign_in', 'sign_in_attempt'].includes(resource.object)
        || resource.id && (
          this.getClerkSignInStatus(resource)
          || this.getClerkCreatedSessionId(resource)
          || this.getClerkSupportedSecondFactors(resource).length > 0
          || typeof resource.attemptSecondFactor === 'function'
        )
      ));
    },

    /**
     * Membaca status sign-in dari response camelCase atau snake_case.
     */
    getClerkSignInStatus(resource) {
      return resource?.status || '';
    },

    /**
     * Membaca id sign-in dari response camelCase atau snake_case.
     */
    getClerkSignInId(resource) {
      return resource?.id || '';
    },

    /**
     * Membaca created session id dari response camelCase atau snake_case.
     */
    getClerkCreatedSessionId(resource) {
      return resource?.createdSessionId || resource?.created_session_id || '';
    },

    /**
     * Membaca daftar second factor dari response camelCase atau snake_case.
     */
    getClerkSupportedSecondFactors(resource) {
      return resource?.supportedSecondFactors || resource?.supported_second_factors || [];
    },

    /**
     * Memilih resource yang bisa menjalankan attemptSecondFactor.
     */
    getClerkSecondFactorActionResource() {
      if(typeof this.activeClerkSignInResource?.attemptSecondFactor === 'function')
        return this.activeClerkSignInResource;

      const runtimeSignInAttempt = this.getRuntimeClerkSignInAttempt();

      if(typeof runtimeSignInAttempt?.attemptSecondFactor === 'function')
        return runtimeSignInAttempt;

      if(typeof this.clerkSignInResource?.attemptSecondFactor === 'function')
        return this.clerkSignInResource;

      return null;
    },

    /**
     * Mengirim kode email saat Clerk meminta browser baru diverifikasi
     * sebelum session login dibuat.
     */
    async prepareClientTrustEmailCode(signInAttempt) {
      const resolvedSignInAttempt = this.resolveClerkSignInAttempt(signInAttempt);
      const signInId = this.getClerkSignInId(resolvedSignInAttempt);

      this.activeClerkSignInAttempt = resolvedSignInAttempt;
      this.secondFactorStrategy = 'email_code';
      this.secondFactorCode = '';
      this.errors.secondFactorCode = '';

      if(signInId && this.preparedClientTrustSignInId === signInId)
        return;

      const emailCodeFactor = this.getEmailCodeSecondFactor(resolvedSignInAttempt);
      const secondFactorActionResource = typeof resolvedSignInAttempt?.prepareSecondFactor === 'function'
        ? resolvedSignInAttempt
        : this.clerkSignInResource;

      if(!emailCodeFactor || typeof secondFactorActionResource?.prepareSecondFactor !== 'function')
        throw new Error('Verifikasi perangkat baru belum tersedia untuk akun ini.');

      this.isPreparingClientTrust = true;

      try {
        const preparedAttempt = await secondFactorActionResource.prepareSecondFactor({
          strategy: 'email_code',
          emailAddressId: emailCodeFactor.emailAddressId || emailCodeFactor.email_address_id,
        });
        this.activeClerkSignInAttempt = this.resolveClerkSignInAttempt(preparedAttempt);
        this.preparedClientTrustSignInId = signInId;

        ElNotification({
          type: 'success',
          title: 'Success',
          message: 'Kode verifikasi email berhasil dikirim.',
        });
      } finally {
        this.isPreparingClientTrust = false;
      }
    },

    /**
     * Setelah login berhasil, sesi browser perlu dihubungkan ke backend Laravel.
     */
    async bridgeClerkSessionToBackend({ requireSignedIn = true } = {}) {
      if(!this.isClerkEnabled || this.isBootstrappingClerkSession || this.$global.isLoggingOut)
        return;

      if(requireSignedIn && !this.isClerkSignedIn)
        return;

      this.clerkBootstrapErrorMessage = '';
      this.isBootstrappingClerkSession = true;

      try {
        await bootstrapResolvedAuthSession(this.$store);
        this.clearSecondFactorTimeoutState();
        clearGoogleLoginCallback();
        await this.$router.push({name: resolveDefaultAuthenticatedRouteName(this.$store)});
      } catch(error) {
        this.clerkBootstrapErrorMessage = error?.response?.data?.message
          || 'Sesi akun sudah aktif, tetapi aplikasi belum berhasil menyiapkan data Anda. Coba lagi sebentar.';
      } finally {
        this.isBootstrappingClerkSession = false;
      }
    },

    async signOutClerkSession() {
      const { clerk } = getClerkRuntimeState();

      if(!clerk)
        return;

      this.isProcessingClerkSignOut = true;

      try {
        await logoutResolvedAuthSession(this.$store, this.$router, this.clerkUi.signInUrl);
        this.clearSecondFactorTimeoutState();
      } catch {
        ElNotification({
          type: 'error',
          title: 'error',
          message: 'Gagal logout dari sesi akun.',
        });
      } finally {
        this.isProcessingClerkSignOut = false;
      }
    },

    /**
     * Menyelesaikan hasil first factor Clerk yang bisa berasal dari
     * password, passkey, atau metode login lain.
     */
    async handleClerkFirstFactorAttempt(signInAttempt) {
      const resolvedSignInAttempt = this.resolveClerkSignInAttempt(this.getRuntimeClerkSignInAttempt() || signInAttempt);
      const status = this.getClerkSignInStatus(resolvedSignInAttempt);
      const createdSessionId = this.getClerkCreatedSessionId(resolvedSignInAttempt);

      this.activeClerkSignInAttempt = resolvedSignInAttempt;
      await this.$nextTick();

      if(status === 'complete' && createdSessionId) {
        await this.clerkSetActive({
          session: createdSessionId,
        });
        this.activeClerkSignInAttempt = null;
        this.clearSecondFactorTimeoutState();
        await this.bridgeClerkSessionToBackend({ requireSignedIn: false });
        return true;
      }

      if(status === 'needs_second_factor') {
        this.resetCancelledSecondFactorStep();
        this.ensureDefaultSecondFactorStrategy();
        this.secondFactorCode = '';
        this.ensureSecondFactorTimeout();
        return true;
      }

      if(status === 'needs_client_trust') {
        this.resetCancelledSecondFactorStep();
        await this.prepareClientTrustEmailCode(resolvedSignInAttempt);
        this.ensureSecondFactorTimeout();
        return true;
      }

      return false;
    },

    /**
     * Login Google memakai redirect OAuth supaya tetap memakai UI custom aplikasi.
     */
    async signInWithGoogle() {
      if(!this.clerkSignInLoaded || !this.clerkSignInResource) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Form login masih disiapkan. Coba lagi sebentar.',
        });
        return;
      }

      this.isProcessingGoogleLogin = true;

      try {
        await prepareBrowserForNewAuthentication(this.$store);
        await this.$nextTick();

        const signInResource = this.getRuntimeClerkSignInAttempt() || this.clerkSignInResource;

        if(typeof signInResource?.authenticateWithRedirect !== 'function')
          throw new Error('Form login Google belum siap. Silakan coba lagi.');

        const { redirectUrl, redirectUrlComplete } = getClerkOauthRedirectUrls(this.clerkUi.signInUrl);
        this.clearSecondFactorTimeoutState();
        rememberClerkAuthReturnUrl(this.clerkUi.signInUrl);
        rememberGoogleLoginCallback();

        await signInResource.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl,
          redirectUrlComplete,
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Login Google gagal dijalankan.'),
        });
      } finally {
        this.isProcessingGoogleLogin = false;
      }
    },

    /**
     * Login passkey memakai WebAuthn discoverable credential dari Clerk.
     */
    async signInWithPasskey() {
      if(!this.clerkSignInLoaded || !this.clerkSignInResource || !this.clerkSetActive) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Form login masih disiapkan. Coba lagi sebentar.',
        });
        return;
      }

      this.isProcessingPasskeyLogin = true;
      this.isInlineAuthBridge = true;
      this.activeClerkSignInAttempt = null;
      this.clearSecondFactorTimeoutState();

      try {
        const signInAttempt = await this.clerkSignInResource.authenticateWithPasskey({
          flow: 'discoverable',
        });

        if(await this.handleClerkFirstFactorAttempt(signInAttempt))
          return;

        ElNotification({
          type: 'info',
          title: 'info',
          message: `Status login passkey saat ini: ${this.getClerkSignInStatus(this.resolveClerkSignInAttempt(signInAttempt)) || 'tidak diketahui'}`,
        });
      } catch(error) {
        if(this.isPasskeyAuthenticationCancelled(error)) {
          ElNotification({
            type: 'info',
            title: 'Info',
            message: 'Login passkey dibatalkan.',
          });
          return;
        }

        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Login passkey gagal diproses.'),
        });
      } finally {
        this.isProcessingPasskeyLogin = false;
        this.isInlineAuthBridge = false;
      }
    },

    /**
     * Mendeteksi pembatalan dialog passkey supaya tidak tampil sebagai error.
     */
    isPasskeyAuthenticationCancelled(error) {
      const errorCodes = error?.errors?.map(item => item.code) || [];
      const errorText = [
        error?.code,
        error?.name,
        error?.message,
        error?.errors?.[0]?.code,
        error?.errors?.[0]?.message,
        error?.errors?.[0]?.longMessage,
      ].filter(Boolean).join(' ').toLowerCase();

      return errorCodes.some(code => code.includes('passkey') && code.includes('cancel'))
        || errorText.includes('passkey') && errorText.includes('cancel')
        || errorText.includes('notallowederror');
    },

    async loginSubmit() {
      if(!this.isClerkEnabled) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: 'Login belum tersedia. Silakan hubungi admin aplikasi.',
        });
        return;
      }

      this.resetErrors();

      if(this.email.trim() === '' || this.password.trim() === '') {
        if(this.email.trim() === '')
          this.errors.email = 'input email is required';
        if(this.password.trim() === '')
          this.errors.password = 'input password is required';
        return;
      }

      if(!this.clerkSignInLoaded || !this.clerkSignInResource || !this.clerkSetActive) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Form login masih disiapkan. Coba lagi sebentar.',
        });
        return;
      }

      this.isProcessLogin = true;
      this.isInlineAuthBridge = true;
      this.activeClerkSignInAttempt = null;
      this.clearSecondFactorTimeoutState();

      try {
        const signInAttempt = await this.clerkSignInResource.create({
          identifier: this.email.trim(),
          password: this.password,
        });

        if(await this.handleClerkFirstFactorAttempt(signInAttempt))
          return;

        ElNotification({
          type: 'info',
          title: 'info',
          message: `Status login saat ini: ${this.getClerkSignInStatus(this.resolveClerkSignInAttempt(signInAttempt)) || 'tidak diketahui'}`,
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Login gagal diproses.'),
        });
      } finally {
        this.isProcessLogin = false;
        this.isInlineAuthBridge = false;
      }
    },

    /**
     * Menyelesaikan login yang tertahan di TFA setelah password atau OAuth Google berhasil.
     */
    async verifyClerkSecondFactor() {
      this.errors.secondFactorCode = '';

      if(this.expireSecondFactorIfTimedOut())
        return;

      if(this.secondFactorCode.trim() === '') {
        if(this.isClerkClientTrustStep)
          this.errors.secondFactorCode = 'input email code is required';
        else
          this.errors.secondFactorCode = this.isBackupCodeSecondFactor ? 'input backup code is required' : 'input authenticator code is required';

        return;
      }

      if(!this.clerkSignInLoaded || !this.activeClerkSignInResource || !this.clerkSetActive) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Proses verifikasi TFA masih disiapkan. Coba lagi sebentar.',
        });
        return;
      }

      if(!this.isClerkVerificationStep) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Sesi verifikasi belum tersedia. Ulangi login dari awal.',
        });
        return;
      }

      this.isProcessLogin = true;
      this.isInlineAuthBridge = true;

      try {
        const secondFactorActionResource = this.getClerkSecondFactorActionResource();

        if(!secondFactorActionResource) {
          ElNotification({
            type: 'warning',
            title: 'warning',
            message: 'Resource verifikasi TFA belum siap. Ulangi login dari awal.',
          });
          return;
        }

        const secondFactorAttemptResponse = await secondFactorActionResource.attemptSecondFactor({
          strategy: this.secondFactorStrategy,
          code: this.isBackupCodeSecondFactor ? this.secondFactorCode.trim() : this.secondFactorCode.trim().replace(/\s+/g, ''),
        });
        const secondFactorAttempt = this.resolveClerkSignInAttempt(secondFactorAttemptResponse);
        const status = this.getClerkSignInStatus(secondFactorAttempt);
        const createdSessionId = this.getClerkCreatedSessionId(secondFactorAttempt);

        this.activeClerkSignInAttempt = secondFactorAttempt;

        if(status === 'complete' && createdSessionId) {
          await this.clerkSetActive({
            session: createdSessionId,
          });
          this.activeClerkSignInAttempt = null;
          this.preparedClientTrustSignInId = '';
          this.clearSecondFactorTimeoutState();
          await this.bridgeClerkSessionToBackend({ requireSignedIn: false });
          return;
        }

        ElNotification({
          type: 'info',
          title: 'info',
          message: `Status verifikasi saat ini: ${status || 'tidak diketahui'}`,
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Verifikasi TFA gagal diproses.'),
        });
      } finally {
        this.isProcessLogin = false;
        this.isInlineAuthBridge = false;
      }
    }
  }
}
</script>

<style scoped>
.auth-otp-group {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.auth-otp-input {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  outline: none;
  transition: 150ms ease-in-out;
}

.auth-otp-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.14);
}

.auth-otp-group.is-error-field .auth-otp-input {
  border-color: #ef4444;
}
</style>
