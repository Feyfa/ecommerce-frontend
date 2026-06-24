<template>
  <div class="auth-page w-full min-h-screen overflow-hidden flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <div class="w-full max-w-[26rem] space-y-4 relative z-[1]">
      <section v-if="!isClerkEnabled" class="auth-card">
        <div class="text-center">
          <p class="auth-brand">Ecommerce</p>
          <h1 class="auth-title">Login Belum Tersedia</h1>
          <p class="auth-subtitle">
            Konfigurasi login belum lengkap. Silakan hubungi admin aplikasi.
          </p>
        </div>
      </section>

      <section v-else-if="isClerkSignedIn" class="auth-card">
        <div class="text-center">
          <p class="auth-brand">Ecommerce</p>
          <h1 class="auth-title">Menyambungkan Sesi Akun</h1>
          <p class="auth-subtitle">
            Sesi akun Anda sudah aktif. Kami sedang menyiapkan data aplikasi.
          </p>
        </div>

        <div class="auth-form">
          <div v-if="clerkBootstrapErrorMessage" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p class="font-semibold">Sesi aplikasi belum berhasil</p>
            <p class="mt-1">{{ clerkBootstrapErrorMessage }}</p>
          </div>

          <div v-else class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p class="font-semibold">Mohon tunggu sebentar</p>
            <p class="mt-2 flex items-center gap-2">
              <i class="fa-solid fa-spinner fa-spin-pulse"></i>
              Menyiapkan sesi akun Anda.
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <button
            v-if="clerkBootstrapErrorMessage"
            type="button"
            class="auth-primary-button"
            :class="{ 'opacity-70': isBootstrappingClerkSession }"
            :disabled="isBootstrappingClerkSession"
            @click="bridgeClerkSessionToBackend">
            Coba Sambungkan Lagi
            <i v-if="isBootstrappingClerkSession" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
          </button>

          <button
            type="button"
            class="auth-primary-button"
            :class="{ 'opacity-70': isProcessingClerkSignOut }"
            :disabled="isProcessingClerkSignOut"
            @click="signOutClerkSession">
            Keluar dari Sesi
            <i v-if="isProcessingClerkSignOut" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
          </button>
        </div>
      </section>

      <form v-else class="auth-card">
        <div class="text-center">
          <p class="auth-brand">Ecommerce</p>
          <h1 class="auth-title">Login Ecommerce</h1>
          <p class="auth-subtitle">
            Masuk menggunakan email/password atau akun Google Anda.
          </p>
        </div>

        <div class="auth-social-panel">
          <button
            type="button"
            class="auth-social-button"
            :class="{ 'opacity-70': isProcessingGoogleLogin }"
            :disabled="isProcessingGoogleLogin"
            @click="signInWithGoogle">
            <span class="auth-social-button-icon" aria-hidden="true">
              <img :src="googleIcon" alt="" class="auth-social-button-icon-image">
            </span>
            <span class="auth-social-button-text">
              Continue with Google
              <i v-if="isProcessingGoogleLogin" class="fa-solid fa-spinner fa-spin-pulse"></i>
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
            'auth-form-after-social': isClerkEnabled
          }">
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
        </div>

        <button
          type="button"
          class="auth-primary-button"
          :class="{ 'opacity-70': isProcessLogin }"
          :disabled="isProcessLogin"
          @click="loginSubmit">
          Login
          <i v-if="isProcessLogin" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
        </button>

        <p class="auth-switch-text">
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
import { bootstrapResolvedAuthSession, logoutResolvedAuthSession, resolveDefaultAuthenticatedRouteName } from '@/authBridge';
import { clerkUiConfig, getClerkErrorMessage, getClerkOauthRedirectUrls, getClerkRuntimeState, isClerkEnabled, rememberClerkAuthReturnUrl } from '@/clerk';

export default {
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

      isShowPassword: false,
      isProcessLogin: false,
      isProcessingGoogleLogin: false,
      isProcessingClerkSignOut: false,
      isBootstrappingClerkSession: false,
      clerkBootstrapErrorMessage: '',

      clerkUi: clerkUiConfig,
      googleIcon,

      errors: {
        email: '',
        password: ''
      }
    }
  },

  computed: {
    isClerkEnabled() {
      return isClerkEnabled;
    },

    isClerkSignedIn() {
      return Boolean(this.$global.clerk.isSignedIn);
    }
  },

  watch: {
    isClerkSignedIn: {
      immediate: true,

      handler(isSignedIn) {
        if(isSignedIn)
          this.bridgeClerkSessionToBackend();
      }
    }
  },

  methods: {
    /**
     * Membersihkan error field lokal sebelum submit berikutnya dijalankan.
     */
    resetErrors() {
      this.errors.email = '';
      this.errors.password = '';
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
    /* VALIDATION INPUT */

    /**
     * Setelah login berhasil, sesi browser perlu dihubungkan ke backend Laravel.
     */
    async bridgeClerkSessionToBackend() {
      if(!this.isClerkEnabled || !this.isClerkSignedIn || this.isBootstrappingClerkSession)
        return;

      this.clerkBootstrapErrorMessage = '';
      this.isBootstrappingClerkSession = true;

      try {
        await bootstrapResolvedAuthSession(this.$store);
        await this.$router.push({name: resolveDefaultAuthenticatedRouteName(this.$store)});
      } catch {
        this.clerkBootstrapErrorMessage = 'Sesi akun sudah aktif, tetapi aplikasi belum berhasil menyiapkan data Anda. Coba lagi sebentar.';
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
        const { redirectUrl, redirectUrlComplete } = getClerkOauthRedirectUrls(this.clerkUi.signInUrl);
        rememberClerkAuthReturnUrl(this.clerkUi.signInUrl);

        await this.clerkSignInResource.authenticateWithRedirect({
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

      try {
        const signInAttempt = await this.clerkSignInResource.create({
          identifier: this.email.trim(),
          password: this.password,
        });

        if(signInAttempt.status === 'complete' && signInAttempt.createdSessionId) {
          await this.clerkSetActive({
            session: signInAttempt.createdSessionId,
          });
          await this.bridgeClerkSessionToBackend();
          return;
        }

        ElNotification({
          type: 'info',
          title: 'info',
          message: `Status login saat ini: ${signInAttempt.status}`,
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Login gagal diproses.'),
        });
      } finally {
        this.isProcessLogin = false;
      }
    }
  }
}
</script>
