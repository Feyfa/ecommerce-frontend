<template>
  <div class="auth-page w-full min-h-screen flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <div class="w-full max-w-[26rem] relative z-[1]">
      <AuthProcessingPanel
        v-if="isProcessingCallback"
        title="Memeriksa Status Login"
        subtitle="Mohon tunggu, kami sedang memeriksa hasil autentikasi Anda."
        processing-text="Memeriksa autentikasi Anda."
        :show-recovery-actions="false" />
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
  getClerkGoogleLinkCallbackErrorMessage,
  getClerkGoogleLinkErrorMessage,
  hasGoogleLinkCallback,
  hasGoogleLoginCallback,
  waitForClerkLoaded
} from '@/clerk';
import { bootstrapResolvedAuthSession, resolveDefaultAuthenticatedRouteName } from '@/authBridge';
import axios from '@/axios';
import AuthProcessingPanel from '@/components/auth/AuthProcessingPanel.vue';

export default {
  components: { AuthProcessingPanel },
  data() {
    return {
      clerkUi: clerkUiConfig,
      isProcessingCallback: true,
    };
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
    hasCanceledOrFailedCallback(params) {
      const status = String(params.get('__clerk_status') || params.get('status') || '').toLowerCase();
      const terminalStatuses = ['abandoned', 'cancelled', 'canceled', 'failed', 'expired'];

      return params.has('error') || params.has('error_description') || terminalStatuses.includes(status);
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
     * Tujuan method ini untuk meminta Laravel menghapus external account Google
     * sementara yang ditinggalkan Clerk setelah callback link gagal atau batal.
     */
    async cleanupFailedGoogleLink() {
      try {
        await axios.post('/security/google/link/cleanup', null, {
          skipAuthExpiredWarning: true,
        });

        return '';
      } catch(error) {
        return error?.response?.data?.message
          || 'Percobaan menghubungkan Google belum berhasil dibersihkan. Silakan coba lagi.';
      }
    },

    /**
     * Tujuan method ini untuk menyelesaikan seluruh cabang link Google yang gagal
     * melalui cleanup backend sebelum kembali ke halaman keamanan.
     */
    async redirectGoogleLinkFailure(message = '') {
      const cleanupErrorMessage = await this.cleanupFailedGoogleLink();
      const resolvedMessage = cleanupErrorMessage
        ? [message, cleanupErrorMessage].filter(Boolean).join(' ')
        : message;

      return this.redirectToAuthForm(resolvedMessage);
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
     * Memeriksa hasil external account Google agar callback bisa membedakan
     * proses yang berhasil, dibatalkan, atau gagal dengan pesan dari Clerk.
     */
    async getGoogleExternalAccountResult(clerk = null) {
      const clerkUser = clerk?.user || null;
      const fallbackMessage = 'Akun Google belum berhasil dihubungkan.';

      if(!clerkUser)
        return { status: 'failed', message: fallbackMessage };

      if(typeof clerkUser.reload === 'function')
        await clerkUser.reload();

      const externalAccounts = Array.isArray(clerkUser.externalAccounts)
        ? clerkUser.externalAccounts
        : [];
      const googleAccounts = externalAccounts.filter(account => {
        const provider = String(account?.provider || '').toLowerCase();

        return provider.includes('google');
      });
      const verifiedGoogleAccount = googleAccounts.find(account => {
        const verificationStatus = String(account?.verification?.status || '').toLowerCase();

        return verificationStatus === 'verified';
      });

      if(verifiedGoogleAccount)
        return { status: 'success', message: '' };

      const failedGoogleAccount = googleAccounts.find(account => {
        const verificationStatus = String(account?.verification?.status || '').toLowerCase();

        return ['failed', 'expired'].includes(verificationStatus)
          || Boolean(account?.verification?.error);
      });

      if(!failedGoogleAccount)
        return { status: 'cancelled', message: '' };

      const verificationError = failedGoogleAccount?.verification?.error;
      const normalizedError = typeof verificationError === 'string'
        ? new Error(verificationError)
        : verificationError || {};

      return {
        status: 'failed',
        message: getClerkGoogleLinkErrorMessage(normalizedError, fallbackMessage),
      };
    },

    /**
     * Memproses callback OAuth hanya ketika payload provider memang valid untuk dilanjutkan.
     */
    async handleClerkRedirectCallback() {
      const callbackParams = this.getCallbackParams();
      const hasCallbackPayload = window.location.search !== '' || window.location.hash !== '';
      const isGoogleLoginCallback = hasGoogleLoginCallback();
      const isGoogleLinkCallback = hasGoogleLinkCallback();

      /* step 1: Clerk dapat mengembalikan OAuth sukses ke /auth/callback tanpa query final. */
      if(!hasCallbackPayload && !isGoogleLoginCallback && !isGoogleLinkCallback) {
        await this.redirectToAuthForm('');
        return;
      }

      if(hasCallbackPayload && this.hasCanceledOrFailedCallback(callbackParams)) {
        const callbackMessage = isGoogleLinkCallback
          ? getClerkGoogleLinkCallbackErrorMessage(callbackParams)
          : getClerkCallbackErrorMessage(callbackParams, 'Login Google gagal diproses.');

        if(isGoogleLinkCallback)
          await this.redirectGoogleLinkFailure(callbackMessage);
        else
          await this.redirectToAuthForm(callbackMessage);

        return;
      }

      clearCancelledClerkSecondFactorStep();
      this.isProcessingCallback = true;

      try {
        const runtimeState = await waitForClerkLoaded({ timeout: 5000, interval: 100 });

        if(!runtimeState.loaded || !runtimeState.clerk?.handleRedirectCallback)
          throw new Error('Layanan autentikasi belum siap memproses callback.');

        /* step 2: Google register memakai jalur login agar akun existing dan baru selesai konsisten. */
        const postAuthUrl = isGoogleLoginCallback ? this.clerkUi.signInUrl : this.clerkUi.signUpUrl;
        let clerkRedirectUrl = '';

        /*
         * Tahan navigasi internal Clerk untuk login dan link Google. Tanpa ini,
         * redirectUrlComplete dapat membuka Security sebelum callback sempat
         * menambahkan query sukses yang dipakai untuk menampilkan toast sekali.
         */
        const customNavigate = isGoogleLoginCallback || isGoogleLinkCallback
          ? async (to = '') => {
              clerkRedirectUrl = to || this.clerkUi.signInUrl;
            }
          : undefined;

        const callbackOptions = {
          signInUrl: this.clerkUi.signInUrl,
          signUpUrl: this.clerkUi.signUpUrl,
          secondFactorUrl: this.clerkUi.signInUrl,
          signInForceRedirectUrl: isGoogleLoginCallback ? this.clerkUi.signInUrl : null,
          signUpForceRedirectUrl: isGoogleLoginCallback ? this.clerkUi.signInUrl : null,
          signInFallbackRedirectUrl: this.clerkUi.signInUrl,
          signUpFallbackRedirectUrl: postAuthUrl,
          continueSignUpUrl: postAuthUrl,
          verifyEmailAddressUrl: postAuthUrl,
        };

        /* step 3: Resource sign-in hanya dimuat ulang untuk login, bukan account linking. */
        if(isGoogleLoginCallback)
          callbackOptions.reloadResource = 'signIn';

        await runtimeState.clerk.handleRedirectCallback(callbackOptions, customNavigate);

        if(isGoogleLoginCallback) {
          const latestRuntimeState = await waitForClerkLoaded({ timeout: 1200, interval: 50 });
          const signInAttempt = this.getRuntimeClerkSignInAttempt(latestRuntimeState.clerk);

          /* step 4: Batal setelah pilih akun bisa kembali tanpa error eksplisit dari Clerk. */
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

        if(isGoogleLinkCallback) {
          const latestRuntimeState = await waitForClerkLoaded({ timeout: 1200, interval: 50 });
          const googleAccountResult = await this.getGoogleExternalAccountResult(latestRuntimeState.clerk);

          if(googleAccountResult.status !== 'success') {
            await this.redirectGoogleLinkFailure(googleAccountResult.message);
            return;
          }

          await this.$router.replace('/settings/security?google_link=callback');
        }
      } catch(error) {
        if(isClerkOauthCancelledError(error)) {
          if(isGoogleLinkCallback)
            await this.redirectGoogleLinkFailure('');
          else
            await this.redirectToAuthForm('');

          return;
        }

        const errorMessage = isGoogleLinkCallback
          ? getClerkGoogleLinkErrorMessage(error)
          : getClerkErrorMessage(error, 'Login Google gagal diproses.');

        if(isGoogleLinkCallback)
          await this.redirectGoogleLinkFailure(errorMessage);
        else
          await this.redirectToAuthForm(errorMessage);
      } finally {
        this.isProcessingCallback = false;
      }
    },
  },
}
</script>
