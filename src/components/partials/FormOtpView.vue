<template>
  <div v-if="show" class="bg-[rgba(0,0,0,.4)] fixed inset-0 z-[999] flex justify-center items-center w-screen h-screen">
    <form class="text-xl font-normal border border-neutral-500 rounded-md w-[90%] sm500:w-[80%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%] p-4 shadow-2xl shadow-neutral-500 bg-white">
      <span class="fixed top-7 right-5 sm400:right-7 sm500:right-10 sm:right-12">
        <i class="fa-solid fa-xmark text-[3rem] text-neutral-50 cursor-pointer" @click="closeFormOtp"></i>
      </span>
      
      <div class="flex justify-center">
        <img src="/img/verified.png">
      </div>

      <div class="text-center mt-8">
        <h1 class="text-center text-3xl">OTP VERIFICATION</h1>
        <div class="mt-4">
          <h4 class="text-[1.2rem]">Enter the OTP your received at</h4>
          <p class="text-[.9rem] -mt-0.5"><strong>{{ email }}</strong></p>
        </div>
      </div>

      <div class="mt-6">
        <div class="grid grid-cols-6 gap-x-3 sm500:gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-7 xl:gap-x-8">
          <input 
            v-for="(input, index) in 6" 
            :key="index" 
            ref="inputOtps" 
            v-model="inputOtp[index]" 
            @input="moveToNext(index)"
            @keydown="handleKeyDown($event, index)"
            @keypress="validateNumber"
            @paste="handlePaste($event)"
            type="text"
            class="border border-neutral-500 rounded-md text-center text-xl outline-none h-11 sm400:h-[3.3rem] md:h-[3.5rem]">
        </div>
        <div class="text-center mt-4 flex justify-between">
          <div>
            <span class="font-light text-[1.1rem] sm:text-[1.2rem] md:text-[1.3rem]">expired {{ formattedTime }}</span>
          </div>
          <div>
            <button 
              type="button" 
              @click="resend"
              :disabled="disabled.resend"
              class="text-blue-700 underline text-[1.1rem] sm:text-[1.2rem] md:text-[1.3rem]"
              :class="disabled.resend ? 'opacity-50' : 'cursor-pointer'">
              Resend
              <i v-if="isResend" class="ml-1 fas fa-spinner fa-pulse"></i>
            </button>
          </div>
        </div>
      </div>
    
      <div class="mt-2">
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
      isProcessVerifyOtp: false,
      isResend: false,

      timeSecond: 120, 
      timeFormat: '00:00',
      interval: {
        time: null,
      },

      disabled: {
        resend: true,
      }
    }
  },

  computed: {
    formattedTime() {
      const minutes = String(Math.floor(this.timeSecond / 60)).padStart(2, '0');
      const seconds = String(this.timeSecond % 60).padStart(2, '0');
      return `${minutes}:${seconds}`;
    },
  },

  watch: {
    show(value) {
      if(value) {
        this.startCountdown();
        this.clearInputOtp();
      }
    },

    timeSecond(value) {
      this.disabled.resend = value > 0 ? true : false;
    }
  },

  beforeDestroy() {
    clearInterval(this.interval.time);
  },

  methods: {
    moveToNext(index) {
      if (this.inputOtp[index] !== '' && index < this.inputOtp.length - 1) {
        this.$refs.inputOtps[index + 1].focus();
      }
    },
    
    handleKeyDown(event, index) {
      const key = event.key;

      if (key === 'Backspace') {
        if (this.inputOtp[index] === '' && index > 0) {
          this.$refs.inputOtps[index - 1].focus(); 
          this.inputOtp[index - 1] = ''; 
        } else {
          this.inputOtp[index] = ''; 
        }
      }
    },
    
    validateNumber(event) {
      const key = event.key;
      if (!/^\d$/.test(key)) {
        event.preventDefault();
      }
    },

    handlePaste(event) {
      const pasteData = event.clipboardData.getData('text');
      const pasteArray = pasteData.split('').filter(char => !isNaN(char)).slice(0, this.inputOtp.length);

      pasteArray.forEach((char, i) => {
        this.inputOtp[i] = char;
      });

      const lastFilledIndex = pasteArray.length - 1;
      if (lastFilledIndex < this.inputOtp.length - 1) {
        this.$refs.inputOtps[lastFilledIndex + 1].focus();
      }

      event.preventDefault();
    },

    clearInputOtp() {
      this.valueOtp = '';
      this.inputOtp = Array(6).fill("");
    },

    resend() {
      // expired 2 menit 5 detik dari sekarang
      // penambahan 5 deitk diperlukan karena adanya keterlambatan saat waktu telah dikirm dengan animasi countdown 
      // waktu saat dikirm > animasi countdown
      const expired = (Math.floor(Date.now() / 1000)) + (2 * 60) + (5);
      this.disabled.resend = true;
      this.isResend = true;

      this.$store.dispatch('loginSubmit', {
        email: this.email,
        password: this.password,
        expired
      })
      .then(response => {
        // console.log(response);

        this.isResend = false;
        this.timeSecond = 120
        this.startCountdown();

        /* IF USER USE TWO FACTORY AUTHENTICATION */
        if(response.data.status == 200 && response.data.type == 'send_otp') {
          this.$emit('update:otpSecretKey', response.data.otp_secret_key);
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
          /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */

          this.$router.push({name: 'buyer_home'});
        }
        /* IF USER NOT USE TWO FACTORY AUTHENTICATION */
      })
      .catch(error => {
        console.error(error);

        this.isResend = false;
        this.disabled.resend = false;
        
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
        else if(error.response.data.status == 401) {
          ElNotification({
            type: 'error',
            title: 'error',
            message: error.response.data.message
          });
        }
        
      })
    },

    startCountdown() {
      this.interval.time = setInterval(() => {
        if (this.timeSecond > 0) {
          this.timeSecond--;
        } else {
          clearInterval(this.interval.time);
        }
      }, 1000);
    },

    closeFormOtp() {
      this.$emit('update:show', false);
      this.timeSecond = 120;
      clearInterval(this.interval.time);
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
        const now = Math.floor(Date.now() / 1000);
        this.isProcessVerifyOtp = true;
        
        this.$store.dispatch('loginSubmit', {
          email: this.email,
          password: this.password,
          type: 'verification_otp',
          otpSecretKey: this.otpSecretKey,
          otpCode: this.valueOtp,
          now
        })
        .then(response => {
          this.isProcessVerifyOtp = false;

          if(response.data.status == 200) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('company', JSON.stringify(response.data.company));

            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
            this.$store.dispatch('fetchTokenFromLocalStorage');
            this.$store.dispatch('fetchUserFromLocalStorage');
            this.$store.dispatch('fetchCompanyFromLocalStorage');
            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */

            this.$router.push({name: 'buyer_home'});
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