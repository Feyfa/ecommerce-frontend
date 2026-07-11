<template>
  <div class="auth-page w-full min-h-screen overflow-hidden flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <div class="w-full max-w-[26rem] space-y-4 relative z-[1]">
      <section v-if="!isClerkEnabled" class="auth-card">
        <div class="text-center">
          <p class="auth-brand">Ecommerce</p>
          <h1 class="auth-title">Reset Password Belum Tersedia</h1>
          <p class="auth-subtitle">
            Konfigurasi reset password belum lengkap. Silakan hubungi admin aplikasi.
          </p>
        </div>
      </section>

      <form v-else class="auth-card" @submit.prevent="submitActiveResetStep">
        <div class="text-center">
          <p class="auth-brand">Ecommerce</p>
          <h1 class="auth-title">{{ resetFormTitle }}</h1>
          <p class="auth-subtitle">{{ resetFormSubtitle }}</p>
        </div>

        <div class="auth-form">
          <template v-if="isRequestCodeStep">
            <div class="auth-field">
              <label for="forgot_email">Email</label>
              <div class="auth-input-wrap">
                <input
                  v-model="email"
                  required
                  type="email"
                  autocomplete="email"
                  id="forgot_email"
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
          </template>

          <template v-else-if="isVerifyCodeStep">
            <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Kode reset password sudah dikirim ke {{ email }}. Cek inbox email Anda lalu masukkan kode terbaru.
            </div>

            <div class="auth-field">
              <label for="forgot_code">Kode Reset Password</label>
              <div class="auth-input-wrap">
                <input
                  v-model="code"
                  required
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  id="forgot_code"
                  placeholder="Masukkan kode reset"
                  class="auth-input"
                  :class="{ 'is-error-field': errors.code }"
                  @input="watchInputCode">
                <span class="auth-input-icon" aria-hidden="true">
                  <i class="fa-regular fa-envelope-open"></i>
                </span>
              </div>
              <small v-if="errors.code" class="auth-error-text">{{ errors.code }}</small>
            </div>

            <div class="forgot-password-actions">
              <button type="button" class="auth-switch-link" :disabled="isProcessingReset" @click="backToRequestCodeStep">
                Ubah Email
              </button>
              <button type="button" class="auth-switch-link" :disabled="isProcessingReset" @click="sendResetPasswordCode">
                Kirim Ulang Kode
              </button>
            </div>
          </template>

          <template v-else>
            <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Kode berhasil diverifikasi. Buat password baru untuk akun {{ email }}.
            </div>

            <div class="auth-field">
              <label for="new_password">Password Baru</label>
              <div class="auth-input-wrap">
                <input
                  v-model="password"
                  required
                  :type="isShowPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  id="new_password"
                  placeholder="Masukkan password baru"
                  class="auth-input"
                  :class="{ 'is-error-field': errors.password }"
                  @input="watchInputPassword">
                <button
                  type="button"
                  class="auth-icon-button"
                  :aria-label="isShowPassword ? 'Sembunyikan password baru' : 'Tampilkan password baru'"
                  @click="isShowPassword = !isShowPassword">
                  <i :class="isShowPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
              </div>
              <small v-if="errors.password" class="auth-error-text">{{ errors.password }}</small>
            </div>

            <div class="auth-field">
              <label for="confirm_new_password">Konfirmasi Password Baru</label>
              <div class="auth-input-wrap">
                <input
                  v-model="confirmPassword"
                  required
                  :type="isShowConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  id="confirm_new_password"
                  placeholder="Ulangi password baru"
                  class="auth-input"
                  :class="{ 'is-error-field': errors.confirmPassword }"
                  @input="watchInputConfirmPassword">
                <button
                  type="button"
                  class="auth-icon-button"
                  :aria-label="isShowConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'"
                  @click="isShowConfirmPassword = !isShowConfirmPassword">
                  <i :class="isShowConfirmPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
              </div>
              <small v-if="errors.confirmPassword" class="auth-error-text">{{ errors.confirmPassword }}</small>
            </div>
          </template>
        </div>

        <button
          type="submit"
          class="auth-primary-button"
          :class="{ 'opacity-70': isProcessingReset }"
          :disabled="isProcessingReset">
          {{ resetButtonLabel }}
          <i v-if="isProcessingReset" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
        </button>

        <p class="auth-switch-text">
          Ingat password?
          <router-link to="/login" class="auth-switch-link">Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { useSignIn } from '@clerk/vue';
import { ElNotification } from 'element-plus';
import { ref } from 'vue';
import { bootstrapResolvedAuthSession, resolveDefaultAuthenticatedRouteName } from '@/authBridge';
import {
  getClerkErrorMessage,
  getClerkRuntimeState,
  isClerkEnabled,
  waitForClerkLoaded
} from '@/clerk';

const resetPasswordSteps = {
  requestCode: 'request_code',
  verifyCode: 'verify_code',
  newPassword: 'new_password',
};

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
    return {
      email: '',
      code: '',
      password: '',
      confirmPassword: '',
      resetStep: resetPasswordSteps.requestCode,

      isProcessingReset: false,
      isShowPassword: false,
      isShowConfirmPassword: false,

      errors: {
        email: '',
        code: '',
        password: '',
        confirmPassword: '',
      },
    };
  },

  computed: {
    isClerkEnabled() {
      return isClerkEnabled;
    },

    isRequestCodeStep() {
      return this.resetStep === resetPasswordSteps.requestCode;
    },

    isVerifyCodeStep() {
      return this.resetStep === resetPasswordSteps.verifyCode;
    },

    resetFormTitle() {
      if(this.isVerifyCodeStep)
        return 'Verifikasi Kode';

      if(this.resetStep === resetPasswordSteps.newPassword)
        return 'Buat Password Baru';

      return 'Lupa Password';
    },

    resetFormSubtitle() {
      if(this.isVerifyCodeStep)
        return 'Masukkan kode dari Clerk untuk melanjutkan reset password.';

      if(this.resetStep === resetPasswordSteps.newPassword)
        return 'Gunakan password baru yang kuat dan mudah Anda ingat.';

      return 'Masukkan email akun Anda untuk menerima kode reset password.';
    },

    resetButtonLabel() {
      if(this.isVerifyCodeStep)
        return 'Verifikasi Kode';

      if(this.resetStep === resetPasswordSteps.newPassword)
        return 'Simpan Password Baru';

      return 'Kirim Kode Reset';
    },
  },

  methods: {
    /**
     * Tujuan method ini untuk menjalankan submit sesuai tahap reset password aktif.
     */
    submitActiveResetStep() {
      if(this.isVerifyCodeStep) {
        this.verifyResetPasswordCode();
        return;
      }

      if(this.resetStep === resetPasswordSteps.newPassword) {
        this.submitNewPassword();
        return;
      }

      this.sendResetPasswordCode();
    },

    /**
     * Tujuan method ini untuk membersihkan error form reset password.
     */
    resetErrors() {
      this.errors.email = '';
      this.errors.code = '';
      this.errors.password = '';
      this.errors.confirmPassword = '';
    },

    watchInputEmail() {
      if(this.email.trim() !== '')
        this.errors.email = '';
    },

    watchInputCode() {
      if(this.code.trim() !== '')
        this.errors.code = '';
    },

    watchInputPassword() {
      if(this.password.trim() !== '')
        this.errors.password = '';
    },

    watchInputConfirmPassword() {
      if(this.confirmPassword.trim() !== '')
        this.errors.confirmPassword = '';
    },

    /**
     * Tujuan method ini untuk validasi email sebelum Clerk mengirim kode reset.
     */
    validateRequestCodeForm() {
      this.resetErrors();

      if(this.email.trim() === '')
        this.errors.email = 'input email is required';

      return !this.errors.email;
    },

    /**
     * Tujuan method ini untuk validasi kode reset password dari email.
     */
    validateVerifyCodeForm() {
      this.resetErrors();

      if(this.code.trim() === '')
        this.errors.code = 'input reset code is required';

      return !this.errors.code;
    },

    /**
     * Tujuan method ini untuk validasi password baru sebelum dikirim ke Clerk.
     */
    validateNewPasswordForm() {
      this.resetErrors();

      if(this.password.trim().length < 8)
        this.errors.password = 'password baru minimal 8 karakter';

      if(this.confirmPassword.trim() === '')
        this.errors.confirmPassword = 'konfirmasi password wajib diisi';
      else if(this.password !== this.confirmPassword)
        this.errors.confirmPassword = 'konfirmasi password tidak sama';

      return !Object.values(this.errors).some(Boolean);
    },

    /**
     * Tujuan method ini untuk memastikan resource sign-in Clerk siap dipakai.
     */
    getActiveSignInResource() {
      const signInResource = this.resolveClerkSignInAttempt(this.clerkSignInResource);

      if(!this.clerkSignInLoaded || !signInResource)
        throw new Error('Form reset password masih disiapkan. Coba lagi sebentar.');

      return signInResource;
    },

    /**
     * Tujuan method ini untuk menyamakan response Clerk yang bisa melempar error
     * atau mengembalikan field error pada custom flow terbaru.
     */
    assertNoClerkActionError(response = {}) {
      if(response?.error)
        throw response.error;

      return response;
    },

    /**
     * Tujuan method ini untuk mengambil object sign-in dari beberapa bentuk response Clerk.
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
        this.clerkSignInResource,
      ];

      return candidates.find(candidate => this.isClerkSignInLike(candidate)) || response || null;
    },

    /**
     * Tujuan method ini untuk mengecek apakah object terlihat seperti sign-in Clerk.
     */
    isClerkSignInLike(resource) {
      return Boolean(resource && (
        ['sign_in', 'sign_in_attempt'].includes(resource.object)
        || resource.id
        || typeof resource.attemptFirstFactor === 'function'
        || typeof resource.resetPassword === 'function'
        || typeof resource.create === 'function'
      ));
    },

    /**
     * Tujuan method ini untuk membaca status sign-in dari response Clerk.
     */
    getClerkSignInStatus(resource) {
      return resource?.status || '';
    },

    /**
     * Tujuan method ini untuk membaca created session id dari response Clerk.
     */
    getClerkCreatedSessionId(resource) {
      return resource?.createdSessionId || resource?.created_session_id || '';
    },

    /**
     * Tujuan method ini untuk mengirim kode reset password lewat Clerk.
     */
    async sendResetPasswordCode() {
      if(!this.validateRequestCodeForm())
        return;

      this.isProcessingReset = true;

      try {
        const signInResource = this.getActiveSignInResource();
        this.assertNoClerkActionError(await signInResource.create({
          strategy: 'reset_password_email_code',
          identifier: this.email.trim(),
        }));

        this.code = '';
        this.password = '';
        this.confirmPassword = '';
        this.resetStep = resetPasswordSteps.verifyCode;

        ElNotification({
          type: 'success',
          title: 'Success',
          message: 'Kode reset password berhasil dikirim.',
        });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Kode reset password belum berhasil dikirim.'),
        });
      } finally {
        this.isProcessingReset = false;
      }
    },

    /**
     * Tujuan method ini untuk kembali ke tahap input email tanpa membuang email terakhir.
     */
    backToRequestCodeStep() {
      this.resetErrors();
      this.code = '';
      this.resetStep = resetPasswordSteps.requestCode;
    },

    /**
     * Tujuan method ini untuk memverifikasi kode reset password dari email.
     */
    async verifyResetPasswordCode() {
      if(!this.validateVerifyCodeForm())
        return;

      this.isProcessingReset = true;

      try {
        const signInResource = this.getActiveSignInResource();
        const verifyResponse = this.assertNoClerkActionError(await signInResource.attemptFirstFactor({
          strategy: 'reset_password_email_code',
          code: this.code.trim(),
        }));
        const signInAttempt = this.resolveClerkSignInAttempt(verifyResponse);
        const status = this.getClerkSignInStatus(signInAttempt);

        if(status && status !== 'needs_new_password') {
          ElNotification({
            type: 'info',
            title: 'info',
            message: `Status reset password saat ini: ${status}`,
          });
          return;
        }

        this.password = '';
        this.confirmPassword = '';
        this.resetStep = resetPasswordSteps.newPassword;
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Kode reset password belum valid.'),
        });
      } finally {
        this.isProcessingReset = false;
      }
    },

    /**
     * Tujuan method ini untuk menyimpan password baru melalui Clerk.
     */
    async submitNewPassword() {
      if(!this.validateNewPasswordForm())
        return;

      this.isProcessingReset = true;

      try {
        const signInResource = this.getActiveSignInResource();
        const passwordResponse = this.assertNoClerkActionError(await signInResource.resetPassword({
          password: this.password,
          signOutOfOtherSessions: true,
        }));
        const signInAttempt = this.resolveClerkSignInAttempt(passwordResponse);
        const status = this.getClerkSignInStatus(signInAttempt);

        if(status === 'complete' && await this.activateCompletedResetSession(signInAttempt)) {
          ElNotification({
            type: 'success',
            title: 'Success',
            message: 'Password berhasil diganti.',
          });
          return;
        }

        if(status === 'needs_second_factor') {
          ElNotification({
            type: 'warning',
            title: 'Verifikasi tambahan diperlukan',
            message: 'Password berhasil diproses. Silakan login ulang untuk menyelesaikan verifikasi akun.',
          });
        } else {
          ElNotification({
            type: 'success',
            title: 'Success',
            message: 'Password berhasil diganti. Silakan login kembali.',
          });
        }

        await this.$router.push({ name: 'login' });
      } catch(error) {
        ElNotification({
          type: 'error',
          title: 'error',
          message: getClerkErrorMessage(error, 'Password baru belum berhasil disimpan.'),
        });
      } finally {
        this.isProcessingReset = false;
      }
    },

    /**
     * Tujuan method ini untuk mengaktifkan session Clerk hasil reset password
     * lalu menyambungkannya ke backend aplikasi.
     */
    async activateCompletedResetSession(signInAttempt) {
      const createdSessionId = this.getClerkCreatedSessionId(signInAttempt);

      if(createdSessionId && this.clerkSetActive)
        await this.clerkSetActive({ session: createdSessionId });

      const runtimeState = await waitForClerkLoaded({ timeout: 1500, interval: 50 });
      const hasActiveSession = Boolean(createdSessionId || runtimeState.isSignedIn || getClerkRuntimeState().isSignedIn);

      if(!hasActiveSession)
        return false;

      await bootstrapResolvedAuthSession(this.$store);
      await this.$router.push({ name: resolveDefaultAuthenticatedRouteName(this.$store) });

      return true;
    },
  },
};
</script>

<style scoped>
.forgot-password-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.forgot-password-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>
