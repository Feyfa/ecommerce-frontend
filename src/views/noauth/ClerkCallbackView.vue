<template>
  <div class="auth-page w-full min-h-screen flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <div v-if="isProcessingCallback" class="auth-card relative z-[1] text-center">
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
import { ElNotification } from 'element-plus';
import { clerkUiConfig, consumeClerkAuthReturnUrl, getClerkErrorMessage, waitForClerkLoaded } from '@/clerk';

export default {
  data() {
    return {
      clerkUi: clerkUiConfig,
      isProcessingCallback: false,
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
    isCanceledCallback(params) {
      const status = params.get('__clerk_status') || params.get('status') || '';
      const canceledStatuses = ['abandoned', 'cancelled', 'canceled', 'failed'];

      return params.has('error') || params.has('error_description') || canceledStatuses.includes(status);
    },

    /**
     * Mengarahkan kembali ke halaman auth asal tanpa menampilkan loading login untuk flow yang batal.
     */
    redirectToAuthForm() {
      const fallbackUrl = consumeClerkAuthReturnUrl() || this.clerkUi.signInUrl;

      return this.$router.replace(fallbackUrl);
    },

    /**
     * Memproses callback OAuth hanya ketika payload provider memang valid untuk dilanjutkan.
     */
    async handleClerkRedirectCallback() {
      const callbackParams = this.getCallbackParams();
      const hasCallbackPayload = window.location.search !== '' || window.location.hash !== '';

      if(!hasCallbackPayload || this.isCanceledCallback(callbackParams)) {
        await this.redirectToAuthForm();
        return;
      }

      this.isProcessingCallback = true;

      try {
        const runtimeState = await waitForClerkLoaded({ timeout: 5000, interval: 100 });

        if(!runtimeState.loaded || !runtimeState.clerk?.handleRedirectCallback)
          throw new Error('Layanan autentikasi belum siap memproses callback.');

        await runtimeState.clerk.handleRedirectCallback({
          signInUrl: this.clerkUi.signInUrl,
          signUpUrl: this.clerkUi.signUpUrl,
          signInFallbackRedirectUrl: this.clerkUi.signInUrl,
          signUpFallbackRedirectUrl: this.clerkUi.signUpUrl,
          continueSignUpUrl: this.clerkUi.signUpUrl,
          verifyEmailAddressUrl: this.clerkUi.signUpUrl,
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Login Google gagal diproses.'),
        });

        await this.redirectToAuthForm();
      } finally {
        this.isProcessingCallback = false;
      }
    },
  },
}
</script>
