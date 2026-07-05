<template>
  <div class="auth-page w-full min-h-screen flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <div v-if="shouldShowProcessingCallback" class="auth-card relative z-[1] text-center">
      <p class="auth-brand">Ecommerce</p>
      <h1 class="auth-title">Memproses Login</h1>
      <p class="auth-subtitle">Mohon tunggu, kami sedang menyelesaikan proses autentikasi Anda.</p>

      <div class="mt-6 flex justify-center">
        <i class="fa-solid fa-spinner fa-spin-pulse text-2xl text-slate-700"></i>
      </div>
    </div>
  </div>
</template>

<script>
import {
  appendClerkAuthErrorToUrl,
  clearCancelledClerkSecondFactorStep,
  clearGoogleLoginCallback,
  clerkUiConfig,
  consumeClerkAuthReturnUrl,
  consumeGoogleLinkCallback,
  isClerkOauthCancelledError,
  getClerkCallbackErrorMessage,
  getClerkErrorMessage,
  hasGoogleLinkCallback,
  hasGoogleLoginCallback,
  waitForClerkLoaded
} from '@/clerk';
import { bootstrapResolvedAuthSession, resolveDefaultAuthenticatedRouteName } from '@/authBridge';

export default {
  data() {
    return {
      clerkUi: clerkUiConfig,
      isProcessingCallback: false,
      isSilentCallback: false,
    };
  },

  computed: {
    shouldShowProcessingCallback() {
      return this.isProcessingCallback && !this.isSilentCallback;
    },
  },

  mounted() {
    this.handleClerkRedirectCallback();
  },

  methods: {
    /**
     * Membaca payload redirect dari query dan hash karena provider OAuth bisa memakai keduanya.
     */
    getCallbackParams() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      hashParams.forEach((value, key) => {
        params.set(key, value);
      });

      return params;
    },

    /**
     * Menentukan apakah callback kembali karena user membatalkan atau provider mengirim error.
     */
    isCanceledCallback(params) {
      const status = params.get('__clerk_status') || params.get('status') || '';
      const canceledStatuses = ['abandoned', 'cancelled', 'canceled', 'failed'];

      return params.has('error') || params.has('error_description') || canceledStatuses.includes(status);
    },

    /**
     * Mengarahkan kembali ke halaman auth asal tanpa menampilkan loading login untuk flow yang batal.
     */
    redirectToAuthForm(message = '') {
      consumeGoogleLinkCallback();
      clearGoogleLoginCallback();

      const fallbackUrl = consumeClerkAuthReturnUrl() || this.clerkUi.signInUrl;
      const redirectUrl = appendClerkAuthErrorToUrl(fallbackUrl, message);

      return this.$router.replace(redirectUrl);
    },

    /**
     * Menghubungkan sesi Clerk hasil Google OAuth langsung ke backend aplikasi.
     */
    async bridgeGoogleCallbackToBackend(fallbackUrl = '') {
      try {
        await bootstrapResolvedAuthSession(this.$store);
        await this.$router.replace({name: resolveDefaultAuthenticatedRouteName(this.$store)});
      } catch {
        await this.$router.replace(fallbackUrl || this.clerkUi.signInUrl);
      }
    },

    /**
     * Mengambil attempt sign-in aktif dari runtime Clerk setelah callback OAuth selesai diproses.
     */
    getRuntimeClerkSignInAttempt(clerk = null) {
      return clerk?.client?.signIn || clerk?.client?.sign_in || null;
    },

    /**
     * Membaca status sign-in Clerk dari bentuk response runtime yang tersedia.
     */
    getClerkSignInStatus(signInAttempt = null) {
      return signInAttempt?.status || '';
    },

    /**
     * Mengecek apakah callback Google masih harus dilanjutkan di halaman login untuk verifikasi tambahan.
     */
    isPendingClerkVerificationStep(signInAttempt = null) {
      return ['needs_second_factor', 'needs_client_trust'].includes(this.getClerkSignInStatus(signInAttempt));
    },

    /**
     * Memproses callback OAuth hanya ketika payload provider memang valid untuk dilanjutkan.
     */
    async handleClerkRedirectCallback() {
      const callbackParams = this.getCallbackParams();
      const hasCallbackPayload = window.location.search !== '' || window.location.hash !== '';
      const isGoogleLoginCallback = hasGoogleLoginCallback();

      /* step 1: Clerk dapat mengembalikan OAuth sukses ke /auth/callback tanpa query final. */
      if(!hasCallbackPayload && !isGoogleLoginCallback) {
        await this.redirectToAuthForm('');
        return;
      }

      if(hasCallbackPayload && this.isCanceledCallback(callbackParams)) {
        await this.redirectToAuthForm(getClerkCallbackErrorMessage(callbackParams));
        return;
      }

      clearCancelledClerkSecondFactorStep();
      this.isSilentCallback = isGoogleLoginCallback;
      this.isProcessingCallback = true;

      try {
        const runtimeState = await waitForClerkLoaded({ timeout: 5000, interval: 100 });

        if(!runtimeState.loaded || !runtimeState.clerk?.handleRedirectCallback)
          throw new Error('Layanan autentikasi belum siap memproses callback.');

        /* step 2: Google register memakai jalur login agar akun existing dan baru selesai konsisten. */
        const postAuthUrl = isGoogleLoginCallback ? this.clerkUi.signInUrl : this.clerkUi.signUpUrl;
        let clerkRedirectUrl = '';

        const customNavigate = isGoogleLoginCallback
          ? async (to = '') => {
              clerkRedirectUrl = to || this.clerkUi.signInUrl;
            }
          : undefined;

        await runtimeState.clerk.handleRedirectCallback({
          signInUrl: this.clerkUi.signInUrl,
          signUpUrl: this.clerkUi.signUpUrl,
          secondFactorUrl: this.clerkUi.signInUrl,
          signInForceRedirectUrl: isGoogleLoginCallback ? this.clerkUi.signInUrl : null,
          signUpForceRedirectUrl: isGoogleLoginCallback ? this.clerkUi.signInUrl : null,
          signInFallbackRedirectUrl: this.clerkUi.signInUrl,
          signUpFallbackRedirectUrl: postAuthUrl,
          continueSignUpUrl: postAuthUrl,
          verifyEmailAddressUrl: postAuthUrl,
          reloadResource: 'signIn',
        }, customNavigate);

        if(isGoogleLoginCallback) {
          const latestRuntimeState = await waitForClerkLoaded({ timeout: 1200, interval: 50 });
          const signInAttempt = this.getRuntimeClerkSignInAttempt(latestRuntimeState.clerk);

          /* step 3: Batal setelah pilih akun bisa kembali tanpa error eksplisit dari Clerk. */
          if(!latestRuntimeState.isSignedIn && !this.isPendingClerkVerificationStep(signInAttempt)) {
            await this.redirectToAuthForm('');
            return;
          }

          if(this.isPendingClerkVerificationStep(signInAttempt)) {
            await this.$router.replace(clerkRedirectUrl || this.clerkUi.signInUrl);
            return;
          }

          await this.bridgeGoogleCallbackToBackend(clerkRedirectUrl || this.clerkUi.signInUrl);
          return;
        }

        if(hasGoogleLinkCallback())
          await this.$router.replace('/settings/security?google_link=callback');
      } catch(error) {
        if(isClerkOauthCancelledError(error)) {
          await this.redirectToAuthForm('');
          return;
        }

        await this.redirectToAuthForm(getClerkErrorMessage(error, 'Login Google gagal diproses.'));
      } finally {
        this.isProcessingCallback = false;
      }
    },
  },
}
</script>
