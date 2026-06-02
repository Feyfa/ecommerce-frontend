<template>
  <div class="auth-page w-full min-h-screen flex justify-center items-center bg-utama bg-cover bg-no-repeat px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true"></div>

    <form class="auth-card">
      <div class="text-center">
        <p class="auth-brand">Ecommerce</p>
        <h1 class="auth-title">Register Ecommerce</h1>
        <p class="auth-subtitle">Buat akun untuk mulai berbelanja.</p>
      </div>

      <div class="auth-form">
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
              :class="{'is-error-field': errors.name}"
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
              autocomplete="new-password"
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
        :class="{'opacity-70': isProcessRegister}"
        :disabled="isProcessRegister"
        @click="registerSubmit">
        Register
        <i v-if="isProcessRegister" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
      </button>

      <p class="auth-switch-text">
        Sudah punya akun?
        <router-link to="/login" class="auth-switch-link">Login</router-link>
      </p>
    </form>
  </div>
</template>

<script>
import { ElNotification } from 'element-plus';

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',

      isShowPassword: false,
      isProcessRegister: false,

      errors: {
        name: '',
        email: '',
        password: ''
      }
    }
  },

  methods: {
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
    /* VALIDATION INPUT */

    registerSubmit() {
      /* VALIDATION INPUT */
      if(this.name.trim() === '' || this.email.trim() === '' || this.password.trim() === '') {
        if(this.name.trim() === '')
          this.errors.name = 'input name is required';
        if(this.email.trim() === '')
          this.errors.email = 'input email is required';
        if(this.password.trim() === '')
          this.errors.password = 'input password is required';
      }
      /* VALIDATION INPUT */

      /* SUCCESS VALIDATION INPUT */
      else {
        this.isProcessRegister = true;

        this.$store.dispatch('registerSubmit', {
          name: this.name,
          email: this.email,
          password: this.password
        })
        .then(response => {
          // console.log(response);

          this.isProcessRegister = false;

          if(response.data.status == 201) {
            ElNotification({
              type: 'success',
              title: 'Success',
              message: response.data.message
            });

            this.$router.push('/login');
          }
        })
        .catch(error => {
          // console.error(error);

          this.isProcessRegister = false;
          
          const message = error.response.data.message;
          
          Object.keys(message).forEach(key => {
            switch(key) {
              case 'name' :
                this.errors.name = message[key][0];
                break;
              case 'email' : 
                this.errors.email = message[key][0];
                break;
              case 'password' : 
                this.errors.password = message[key][0];
                break;
            }
          })
        })
      }
      /* SUCCESS VALIDATION INPUT */
    }
  }
}
</script>
