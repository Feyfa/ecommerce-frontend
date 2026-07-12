<template>
  <section class="auth-card">
    <div class="text-center">
      <p class="auth-brand">TokShop</p>
      <h1 class="auth-title">{{ resolvedTitle }}</h1>
      <p class="auth-subtitle">{{ resolvedSubtitle }}</p>
    </div>

    <div class="auth-form">
      <div
        v-if="errorMessage"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <p class="font-semibold">Sesi aplikasi belum berhasil</p>
        <p class="mt-1">{{ errorMessage }}</p>
      </div>

      <div v-else class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <p class="font-semibold">Mohon tunggu sebentar</p>
        <p class="mt-2 flex items-center gap-2">
          <i class="fa-solid fa-spinner fa-spin-pulse"></i>
          {{ processingText }}
        </p>
      </div>
    </div>

    <div v-if="errorMessage && showRecoveryActions" class="space-y-3">
      <button
        type="button"
        class="auth-primary-button"
        :class="{ 'opacity-70': retrying }"
        :disabled="retrying"
        @click="$emit('retry')">
        Coba Sambungkan Lagi
        <i v-if="retrying" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
      </button>

      <button
        type="button"
        class="auth-primary-button"
        :class="{ 'opacity-70': signingOut }"
        :disabled="signingOut"
        @click="$emit('sign-out')">
        Keluar dari Sesi
        <i v-if="signingOut" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  emits: ['retry', 'sign-out'],

  props: {
    title: { type: String, default: 'Menyiapkan Akun' },
    subtitle: { type: String, default: 'Mohon tunggu sebentar, kami sedang menyiapkan akun Anda.' },
    processingText: { type: String, default: 'Menyiapkan akun Anda.' },
    errorMessage: { type: String, default: '' },
    errorTitle: { type: String, default: 'Sesi Aplikasi Belum Siap' },
    errorSubtitle: { type: String, default: 'Sesi akun sudah aktif, tetapi data aplikasi belum berhasil disiapkan.' },
    showRecoveryActions: { type: Boolean, default: true },
    retrying: { type: Boolean, default: false },
    signingOut: { type: Boolean, default: false },
  },

  computed: {
    resolvedTitle() {
      return this.errorMessage ? this.errorTitle : this.title;
    },
    resolvedSubtitle() {
      return this.errorMessage ? this.errorSubtitle : this.subtitle;
    },
  },
};
</script>
