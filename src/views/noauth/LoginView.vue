<template>
  <div class="auth-page w-full min-h-screen overflow-hidden flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <FormOtpView v-model:show="show.formOtpView" v-model:otpSecretKey="otpSecretKey" :email="email" :password="password" />

    <form class="auth-card">
      <div class="text-center">
        <p class="auth-brand">Ecommerce</p>
        <h1 class="auth-title">Login Ecommerce</h1>
        <p class="auth-subtitle">Masuk untuk melanjutkan belanja.</p>
      </div>

      <div class="auth-form">
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
              :class="{'is-error-field': errors.email}"
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
              :class="{'is-error-field': errors.password}"
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
        :class="{'opacity-70': isProcessLogin}"
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
</template>

<script>
import { ElNotification } from 'element-plus';
import FormOtpView from '@/components/partials/FormOtpView.vue';

export default {
  components: {
    FormOtpView
  },

  data() {
    return  {
      email: '',
      password: '',
      otpSecretKey: '',

      isShowPassword: false,
      isProcessLogin: false,

      errors: {
        email: '',
        password: ''
      },

      show: {
        formOtpView: false
      }
    }
  },

  methods: {
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

    loginSubmit() {
      /* VALIDATION INPUT */
      if(this.email.trim() === '' || this.password.trim() === '') {
        if(this.email.trim() === '')
          this.errors.email = 'input email is required';
        if(this.password.trim() === '')
          this.errors.password = 'input password is required';
      }
      /* VALIDATION INPUT */

      /* SUCCESS VALIDATION INPUT */
      else {
        // expired 2 menit 5 detik dari sekarang
        // penambahan 5 deitk diperlukan karena adanya keterlambatan saat waktu telah dikirm dengan animasi countdown 
        // waktu saat dikirm > animasi countdown
        const expired = (Math.floor(Date.now() / 1000)) + (2 * 60) + (5);
        this.isProcessLogin = true;

        this.$store.dispatch('loginSubmit', {
          email: this.email,
          password: this.password,
          expired
        })
        .then(response => {
          // console.log(response);

          /* IF USER USE TWO FACTORY AUTHENTICATION */
          if(response.data.status == 200 && response.data.type == 'send_otp') {
            this.isProcessLogin = false;
            this.show.formOtpView = true;
            this.otpSecretKey = response.data.otp_secret_key;
          }
          /* IF USER USE TWO FACTORY AUTHENTICATION */

          /* IF USER NOT USE TWO FACTORY AUTHENTICATION */
          else if(response.data.status == 200) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('company', JSON.stringify(response.data.company));

            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
            this.$store.dispatch('fetchTokenFromLocalStorage');
            this.$store.dispatch('fetchUserFromLocalStorage');
            this.$store.dispatch('fetchCompanyFromLocalStorage');
            this.$store.dispatch('setActiveAccountMode', 'buyer');
            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */

            this.$router.push({name: 'buyer_home'});
          }
          /* IF USER NOT USE TWO FACTORY AUTHENTICATION */

          /* DAN LAIN LAIN */
          else {
            this.isProcessLogin = false;
          }
          /* DAN LAIN LAIN */
        })
        .catch(error => {
          console.error(error);

          this.isProcessLogin = false;
          
          if(error.response.data.status == 422) {
            const message = error.response.data.message;
            
            Object.keys(message).forEach(key => {
              switch(key) {
                case 'email' : 
                  this.errors.email = message[key][0];
                  break;
                case 'password' : 
                  this.errors.password = message[key][0];
                  break;
                case 'user_secret_key' :
                  ElNotification({ type: 'error', title: 'error', message: message[key][0] });
                  break;
              }
            })
          }
          else {
            ElNotification({
              type: 'error',
              title: 'error',
              message: error.response.data.message
            });
          }
          
        })
      }
      /* SUCCESS VALIDATION INPUT */
    }
  }
}
</script>
