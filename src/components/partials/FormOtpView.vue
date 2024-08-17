<template>
  <div v-if="show" class="bg-[rgba(0,0,0,.4)] fixed inset-0 z-[999] flex justify-center items-center">
    <form class="text-xl font-normal border border-neutral-500 rounded-md w-[90%] sm500:w-[80%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%] p-4 shadow-2xl bg-white">
      <span class="fixed top-7 right-5 sm400:right-7 sm500:right-10 sm:right-12">
        <i class="fa-solid fa-xmark text-[3rem] text-neutral-50 cursor-pointer" @click="closeFormOtp"></i>
      </span>
      
      <div class="flex justify-center">
        <img :src="verifiedImage">
      </div>

      <div class="text-center mt-8">
        <h1 class="text-center text-3xl">OTP VERIFICATION</h1>
        <div class="mt-4">
          <h4 class="text-[1.2rem]">Enter the OTP your received at</h4>
          <p class="text-[.9rem] -mt-0.5"><strong>{{ email }}</strong></p>
        </div>
      </div>

      <div class="mt-8">
        <div class="grid grid-cols-6 gap-x-3 sm500:gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-7 xl:gap-x-8">
          <input 
            v-for="(input, index) in 6" 
            :key="index" 
            ref="inputOtps" 
            v-model="inputOtp[index]" 
            @keyup="moveInputFocus($event, index)" 
            @keydown="restrictInput" 
            type="text"
            class="border border-neutral-500 rounded-md text-center text-xl outline-none h-11 sm400:h-[3.3rem] md:h-[3.5rem]">
        </div>
        <div class="text-center mt-4">
          Not Send OTP ? <span class="text-blue-700 underline cursor-pointer">Resend</span>
        </div>
      </div>
    
      <div class="mt-8">
        <button 
          type="button" 
          class="w-full h-12 border border-neutral-300 rounded shadow bg-blue-500 mt-4"
          :class="isProcessVerifyOtp ? 'opacity-85' : 'hover:bg-[#428bff]'"
          :disabled="isProcessVerifyOtp"
          @click="verifySubmit">
          Verify
          <i v-if="isProcessVerifyOtp" class="ml-1 fas fa-spinner fa-pulse"></i>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import VerifiedImage from "@/assets/img/verified.png";
import { ElNotification } from "element-plus";

export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    otpSecretKey: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      valueOtp: '',
      inputOtp: Array(6).fill(""),
      verifiedImage: VerifiedImage,
      isProcessVerifyOtp: false
    }
  },

  methods: {
    closeFormOtp() {
      this.$emit('update:show', false);
    },

    restrictInput(event) {
      const input = event.target.value;
      const char = event.key;

      if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Shift', 'Alt'].includes(char)) {
        return; 
      }

      if(input.length > 0) event.target.value = '';
    },

    moveInputFocus(event, index) {
      const input = event.target.value;
      const char = event.key;

      console.log(char);

      if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Shift', 'Alt'].includes(char)) {
        return; 
      }

      if(input.length > 0) {
        if(index < 5) {
          const nextInput = this.$refs.inputOtps[index + 1];
          nextInput.focus();
        }
      }
    },

    verifySubmit() {
      this.valueOtp = '';
      this.inputOtp.forEach(element => {
        this.valueOtp += element;
      });
      this.valueOtp.trim();

      if(this.valueOtp.length < 5) {
        ElNotification({ type: 'error', 'title': 'error', message: 'otp is required' });
        return;
      }
      else {
        this.isProcessVerifyOtp = true;

        this.$store.dispatch('loginSubmit', {
          email: this.email,
          password: this.password,
          type: 'verification_otp',
          otpSecretKey: this.otpSecretKey,
          otpCode: this.valueOtp,
        })
        .then(response => {
          this.isProcessVerifyOtp = false;

          if(response.data.status == 200) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
            this.$store.dispatch('fetchTokenFromLocalStorage');
            this.$store.dispatch('fetchUserFromLocalStorage');
            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */

            this.$router.push('/');
          }
          else {
            this.isProcessLogin = false;
          }
        })
        .catch(error => {
          console.error(error);

          this.isProcessLogin = false;
          this.isProcessVerifyOtp = false;

                    
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
                case 'otp_invalid' :
                case 'otp_expired' :
                case 'user_secret_key' :
                  ElNotification({ type: 'error', title: 'error', message: message[key][0] });
                  break;
              }
            })
          }
          else if(error.response.data.status == 401) {
            ElNotification({
              type: 'error',
              title: 'error',
              message: error.response.data.message
            });
          }
        })
      }
    }
  }
}
</script>