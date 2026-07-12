<template>
  <div class="auth-page w-full min-h-screen flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <div class="w-full max-w-[26rem] space-y-4 relative z-[1]">
      <section v-if="!isClerkEnabled" class="auth-card">
        <div class="text-center">
          <p class="auth-brand">TokShop</p>
          <h1 class="auth-title">Register Belum Tersedia</h1>
          <p class="auth-subtitle">
            Konfigurasi register belum lengkap. Silakan hubungi admin aplikasi.
          </p>
        </div>
      </section>

      <AuthProcessingPanel
        v-else-if="isClerkResolving || (isClerkSignedIn && shouldShowBridgePanel)"
        :error-message="clerkBootstrapErrorMessage"
        error-subtitle="Akun sudah aktif, tetapi data aplikasi belum berhasil disiapkan."
        :retrying="isBootstrappingClerkSession"
        :signing-out="isProcessingClerkSignOut"
        @retry="bridgeClerkSessionToBackend"
        @sign-out="signOutClerkSession" />

      <form v-else class="auth-card">
        <div class="text-center">
          <p class="auth-brand">TokShop</p>
          <h1 class="auth-title">{{ isClerkVerificationStep ? 'Verifikasi Email' : 'Register TokShop' }}</h1>
          <p class="auth-subtitle">
            {{ isClerkVerificationStep
              ? `Masukkan kode verifikasi yang dikirim ke ${clerkPendingEmail || email}.`
              : 'Buat akun baru menggunakan email/password atau akun Google Anda.' }}
          </p>
        </div>

        <div v-if="!isClerkVerificationStep" class="auth-social-panel">
          <button
            type="button"
            class="auth-social-button"
            :class="{ 'opacity-70': isProcessingGoogleRegister }"
            :disabled="isProcessingGoogleRegister"
            @click="signUpWithGoogle">
            <span class="auth-social-button-icon" aria-hidden="true">
              <img :src="googleIcon" alt="" class="auth-social-button-icon-image">
            </span>
            <span class="auth-social-button-text">
              Continue with Google
              <i v-if="isProcessingGoogleRegister" class="fa-solid fa-spinner fa-spin-pulse"></i>
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
              Kode verifikasi email sudah dikirim. Silakan cek inbox email Anda lalu masukkan kodenya di bawah ini.
            </div>

            <div class="auth-field">
              <label for="verification_code">Kode Verifikasi</label>
              <div class="auth-input-wrap">
                <input
                  v-model="verificationCode"
                  type="text"
                  autocomplete="one-time-code"
                  id="verification_code"
                  placeholder="Masukkan kode verifikasi"
                  class="auth-input"
                  :class="{ 'is-error-field': errors.verificationCode }"
                  @input="watchInputVerificationCode">
                <span class="auth-input-icon" aria-hidden="true">
                  <i class="fa-regular fa-envelope-open"></i>
                </span>
              </div>
              <small v-if="errors.verificationCode" class="auth-error-text">{{ errors.verificationCode }}</small>
            </div>

            <div class="flex items-center justify-between gap-3 text-sm">
              <button type="button" class="auth-switch-link" @click="resetClerkVerificationStep">
                Ubah Data Register
              </button>
              <button type="button" class="auth-switch-link" @click="resendClerkVerificationCode">
                Kirim Ulang Kode
              </button>
            </div>
          </template>

          <template v-else>
            <div class="auth-field">
              <label for="name">Name</label>
              <div class="auth-input-wrap">
                <input
                  v-model="name"
                  type="text"
                  autocomplete="name"
                  id="name"
                  placeholder="Masukkan nama"
                  class="auth-input"
                  :class="{ 'is-error-field': errors.name }"
                  @input="watchInputName">
                <span class="auth-input-icon" aria-hidden="true">
                  <i class="fa-regular fa-user"></i>
                </span>
              </div>
              <small v-if="errors.name" class="auth-error-text">{{ errors.name }}</small>
            </div>

            <div class="auth-field">
              <label for="email">Email</label>
              <div class="auth-input-wrap">
                <input
                  v-model="email"
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
                  autocomplete="new-password"
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
          </template>
        </div>

        <button
          type="button"
          class="auth-primary-button"
          :class="{ 'opacity-70': isProcessRegister }"
          :disabled="isProcessRegister"
          @click="registerSubmit">
          {{ registerButtonLabel }}
          <i v-if="isProcessRegister" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
        </button>

        <p class="auth-switch-text">
          Sudah punya akun?
          <router-link to="/login" class="auth-switch-link">Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { useSignIn, useSignUp } from '@clerk/vue';
import { ElNotification } from 'element-plus';
import { ref } from 'vue';
import googleIcon from '@/assets/icons/google.svg';
import AuthProcessingPanel from '@/components/auth/AuthProcessingPanel.vue';
import { bootstrapResolvedAuthSession, logoutResolvedAuthSession, resolveDefaultAuthenticatedRouteName } from '@/authBridge';
import {
  clearClerkAuthErrorFromRoute,
  clerkUiConfig,
  consumeClerkAuthErrorFromRoute,
  getClerkErrorMessage,
  getClerkOauthRedirectUrls,
  getClerkRuntimeState,
  isClerkEnabled,
  rememberClerkAuthReturnUrl,
  rememberGoogleLoginCallback,
  splitClerkName
} from '@/clerk';

export default {
  components: { AuthProcessingPanel },
  setup() {
    if(!isClerkEnabled) {
      return {
        clerkSignInLoaded: ref(false),
        clerkSignInResource: ref(null),
        clerkSignUpLoaded: ref(false),
        clerkSignUpResource: ref(null),
        clerkSetActive: null,
      };
    }

    const { isLoaded: isSignInLoaded, signIn } = useSignIn();
    const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();

    return {
      clerkSignInLoaded: isSignInLoaded,
      clerkSignInResource: signIn,
      clerkSignUpLoaded: isSignUpLoaded,
      clerkSignUpResource: signUp,
      clerkSetActive: setActive,
    };
  },

  data() {
    return {
      name: '',
      email: '',
      password: '',
      verificationCode: '',
      clerkPendingEmail: '',
      clerkRegisterStep: 'collect',

      isShowPassword: false,
      isProcessRegister: false,
      isProcessingGoogleRegister: false,
      isProcessingClerkSignOut: false,
      isBootstrappingClerkSession: false,
      isInlineAuthBridge: false,
      clerkBootstrapErrorMessage: '',

      clerkUi: clerkUiConfig,
      googleIcon,

      errors: {
        name: '',
        email: '',
        password: '',
        verificationCode: '',
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

    isClerkVerificationStep() {
      return this.clerkRegisterStep === 'verify_email';
    },

    registerButtonLabel() {
      return this.isClerkVerificationStep ? 'Verifikasi Email' : 'Register';
    },

    shouldShowBridgePanel() {
      return Boolean(this.clerkBootstrapErrorMessage || !this.isInlineAuthBridge);
    }
  },

  watch: {
    isClerkSignedIn: {
      immediate: true,

      handler(isSignedIn) {
        if(isSignedIn && !this.isInlineAuthBridge)
          this.bridgeClerkSessionToBackend();
      }
    }
  },

  mounted() {
    this.notifyAuthCallbackError();
  },

  methods: {
    /**
     * Menampilkan error OAuth setelah callback selesai redirect kembali ke halaman register.
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
     * Reset semua pesan error lokal sebelum masuk ke langkah register berikutnya.
     */
    resetErrors() {
      this.errors.name = '';
      this.errors.email = '';
      this.errors.password = '';
      this.errors.verificationCode = '';
    },

    /* VALIDATION INPUT */
    watchInputName() {
      if(this.name.trim() !== '') {
        this.errors.name = '';
      }
    },

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

    watchInputVerificationCode() {
      if(this.verificationCode.trim() !== '') {
        this.errors.verificationCode = '';
      }
    },
    /* VALIDATION INPUT */

    resetClerkVerificationStep() {
      this.clerkRegisterStep = 'collect';
      this.verificationCode = '';
      this.errors.verificationCode = '';
    },

    /**
     * Setelah register selesai, sesi browser perlu dihubungkan ke backend Laravel.
     */
    async bridgeClerkSessionToBackend({ requireSignedIn = true } = {}) {
      if(!this.isClerkEnabled || this.isBootstrappingClerkSession)
        return;

      if(requireSignedIn && !this.isClerkSignedIn)
        return;

      this.clerkBootstrapErrorMessage = '';
      this.isBootstrappingClerkSession = true;

      try {
        await bootstrapResolvedAuthSession(this.$store);
        await this.$router.push({name: resolveDefaultAuthenticatedRouteName(this.$store)});
      } catch {
        this.clerkBootstrapErrorMessage = 'Akun sudah aktif, tetapi aplikasi belum berhasil menyiapkan data Anda. Coba lagi sebentar.';
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
        await logoutResolvedAuthSession(this.$store, this.$router, this.clerkUi.signUpUrl);
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
     * Google register dibuat idempotent lewat flow sign-in supaya akun baru dan akun existing sama-sama bisa masuk.
     */
    async signUpWithGoogle() {
      if(!this.clerkSignInLoaded || !this.clerkSignInResource) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Form register masih disiapkan. Coba lagi sebentar.',
        });
        return;
      }

      this.isProcessingGoogleRegister = true;

      try {
        const { redirectUrl, redirectUrlComplete } = getClerkOauthRedirectUrls(this.clerkUi.signInUrl);
        /* step 1: batal OAuth tetap kembali ke register, sukses OAuth masuk ke login bridge */
        rememberClerkAuthReturnUrl(this.clerkUi.signUpUrl);
        rememberGoogleLoginCallback();

        await this.clerkSignInResource.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl,
          redirectUrlComplete,
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Google gagal dijalankan.'),
        });
      } finally {
        this.isProcessingGoogleRegister = false;
      }
    },

    async registerSubmit() {
      if(!this.isClerkEnabled) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: 'Register belum tersedia. Silakan hubungi admin aplikasi.',
        });
        return;
      }

      if(this.isClerkVerificationStep) {
        await this.verifyClerkEmailAddress();
        return;
      }

      await this.createClerkAccount();
    },

    /**
     * Langkah pertama register: buat attempt user lalu kirim kode verifikasi email.
     */
    async createClerkAccount() {
      this.resetErrors();

      if(this.name.trim() === '' || this.email.trim() === '' || this.password.trim() === '') {
        if(this.name.trim() === '')
          this.errors.name = 'input name is required';
        if(this.email.trim() === '')
          this.errors.email = 'input email is required';
        if(this.password.trim() === '')
          this.errors.password = 'input password is required';
        return;
      }

      if(!this.clerkSignUpLoaded || !this.clerkSignUpResource || !this.clerkSetActive) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Form register masih disiapkan. Coba lagi sebentar.',
        });
        return;
      }

      this.isProcessRegister = true;
      this.isInlineAuthBridge = true;

      try {
        const { firstName, lastName } = splitClerkName(this.name);

        const signUpAttempt = await this.clerkSignUpResource.create({
          firstName,
          lastName,
          emailAddress: this.email.trim(),
          password: this.password,
        });

        if(signUpAttempt.status === 'complete' && signUpAttempt.createdSessionId) {
          await this.clerkSetActive({
            session: signUpAttempt.createdSessionId,
          });
          await this.bridgeClerkSessionToBackend({ requireSignedIn: false });
          return;
        }

        await this.clerkSignUpResource.prepareEmailAddressVerification({
          strategy: 'email_code',
        });

        this.clerkPendingEmail = this.email.trim();
        this.clerkRegisterStep = 'verify_email';

        ElNotification({
          type: 'success',
          title: 'Success',
          message: 'Kode verifikasi email berhasil dikirim.',
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Register gagal diproses.'),
        });
      } finally {
        this.isProcessRegister = false;
        this.isInlineAuthBridge = false;
      }
    },

    /**
     * Langkah kedua register: verifikasi email code sampai sesi aktif.
     */
    async verifyClerkEmailAddress() {
      this.errors.verificationCode = '';

      if(this.verificationCode.trim() === '') {
        this.errors.verificationCode = 'input verification code is required';
        return;
      }

      if(!this.clerkSignUpLoaded || !this.clerkSignUpResource || !this.clerkSetActive) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Proses verifikasi masih disiapkan. Coba lagi sebentar.',
        });
        return;
      }

      this.isProcessRegister = true;
      this.isInlineAuthBridge = true;

      try {
        const verificationAttempt = await this.clerkSignUpResource.attemptEmailAddressVerification({
          code: this.verificationCode.trim(),
        });

        if(verificationAttempt.status === 'complete' && verificationAttempt.createdSessionId) {
          await this.clerkSetActive({
            session: verificationAttempt.createdSessionId,
          });
          await this.bridgeClerkSessionToBackend({ requireSignedIn: false });
          return;
        }

        ElNotification({
          type: 'info',
          title: 'info',
          message: `Status verifikasi saat ini: ${verificationAttempt.status}`,
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Verifikasi email gagal diproses.'),
        });
      } finally {
        this.isProcessRegister = false;
        this.isInlineAuthBridge = false;
      }
    },

    async resendClerkVerificationCode() {
      if(!this.clerkSignUpLoaded || !this.clerkSignUpResource) {
        ElNotification({
          type: 'warning',
          title: 'warning',
          message: 'Proses verifikasi masih disiapkan. Coba lagi sebentar.',
        });
        return;
      }

      try {
        await this.clerkSignUpResource.prepareEmailAddressVerification({
          strategy: 'email_code',
        });

        ElNotification({
          type: 'success',
          title: 'Success',
          message: 'Kode verifikasi email berhasil dikirim ulang.',
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Kode verifikasi email gagal dikirim ulang.'),
        });
      }
    }
  }
}
</script>
