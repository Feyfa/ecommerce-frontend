<template>
  <div 
    class="w-full min-h-screen flex justify-center items-center bg-utama bg-cover bg-no-repeat">
    <form 
      class="text-xl font-normal border border-neutral-500 rounded w-[35%] p-3 shadow-2xl bg-[rgba(255,255,255,.7)]">
      
      <h1 class="text-center text-3xl">Register Ecommerce</h1>

      <div class="row flex flex-col gap-1 mt-5">
          <label for="name">Name</label>
          <div class="relative">
              <input
                  v-model="name"
                  type="text" 
                  autocomplete="off"
                  id="name"
                  class="w-full border border-neutral-500 h-12 pl-2.5 pr-11 outline-none rounded shadow"
                  :class="{'border-red-500': errors.name}"
                  @input="watchInputName">
              <span class="absolute right-2.5 top-3 end-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                  </svg>
              </span>
          </div>
          <small v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</small>
      </div>

      <div class="row flex flex-col gap-1 mt-3">
          <label for="email">Email</label>
          <div class="relative">
              <input  
                  v-model="email"
                  type="text" 
                  autocomplete="off"
                  id="email"
                  class="w-full border border-neutral-500 h-12 pl-2.5 pr-11 outline-none rounded shadow"
                  :class="{'border-red-500': errors.email}"
                  @input="watchInputEmail">
              <span class="absolute right-2.5 top-3 end-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                  </svg>
              </span>
          </div>
          <small v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</small>
      </div>


      <div class="row flex flex-col gap-1 mt-3">
          <label for="password">Password</label>
          <div class="relative">
              <input 
                  v-model="password"
                  :type="isShowPassword ? 'text' : 'password'" 
                  autocomplete="off" 
                  id="password"
                  class="w-full border border-neutral-500 h-12 pl-2.5 pr-11 outline-none rounded shadow"
                  :class="{'border-red-500': errors.password}"
                  @input="watchInpuPassword">
              <span class="absolute right-2.5 top-3 end-3">
                  <svg 
                    v-if="!isShowPassword"
                    @click="isShowPassword = true"
                    xmlns="http://www.w3.org/2000/svg" 
                    width="25" 
                    height="25" 
                    fill="currentColor" 
                    class="bi bi-eye cursor-pointer" 
                    viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                  </svg>
                  <svg 
                    v-if="isShowPassword"
                    @click="isShowPassword = false"
                    xmlns="http://www.w3.org/2000/svg" 
                    width="25" 
                    height="25" 
                    fill="currentColor" 
                    class="bi bi-eye-slash cursor-pointer" 
                    viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                    <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                  </svg>
              </span>
          </div>
          <small v-if="errors.password" class="text-xs text-red-500">{{ errors.password }}</small>
      </div>

      <div class="flex justify-end mt-3">
          <router-link to="/login" class="underline text-blue-700">login</router-link>
      </div>

      <button 
        type="button" 
        class="w-full h-12 border border-neutral-300 rounded shadow bg-blue-500 mt-4"
        :class="isProcessRegister ? 'opacity-85' : 'hover:bg-[#428bff]'"
        :disabled="isProcessRegister"
        @click="registerSubmit">
        Register
        <i v-if="isProcessRegister" class="ml-1 fas fa-spinner fa-pulse"></i>
      </button>
    </form>
</div>
</template>

<script>
import { RouterLink } from 'vue-router';
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
      if(this.name.trim() === '') {
        this.errors.name = 'input name is required';
      } else {
        this.errors.name = '';
      }
    },
    
    watchInputEmail() {
      if(this.email.trim() === '') {
        this.errors.email = 'input email is required';
      } else {
        this.errors.email = '';
      }
    },

    watchInpuPassword() {
      if(this.password.trim() === '') {
        this.errors.password = 'input password is required';
      } else {
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