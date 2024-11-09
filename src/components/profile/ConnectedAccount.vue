<template>
  <div class="w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded">
    <!-- HIDE VIEW -->
    <div v-show="disable.blank_screen" class="fixed inset-0 bg-white z-[99999]"></div>
    <!-- HIDE VIEW -->

    <!-- title -->
    <div class="relative">
      <h3 class="text-xl text-center">Stripe Connect</h3>
    </div>
    <!-- title -->

    <!-- icon status -->
    <div class="mt-7 flex flex-col justify-center items-center gap-5 sm500:flex-row sm500:gap-16 sm:gap-20 md:gap-24" v-show="disable.status_connect_account">
      <div class="flex justify-center items-center gap-2">
        <span>
          <i 
            class="fa-solid text-[1rem]"
            :class="{'fa-circle-check text-[#63E6BE]': topup_enabled, 'fa-circle-xmark text-red-500': !topup_enabled}">
          </i>
        </span>
        <span>Topup Enabled</span>
      </div>
      <div class="flex justify-center items-center gap-2">
        <span>
          <i 
            class="fa-solid text-[1rem]"
            :class="{'fa-circle-check text-[#63E6BE]': payout_enabled, 'fa-circle-xmark text-red-500': !payout_enabled}"></i>
        </span>
        <span>Payout Enabled</span>
      </div>
    </div>
    <!-- icon status -->
    
    <!-- Button Connected Account -->
    <div class="mt-7">
      <div class="flex justify-center items-center">
        <button  
          v-show="disable.button_connect_account"
          class="border border-neutral-300 rounded-md transition-all duration-300 hover:-translate-y-[1px] py-1.5 px-8 text-white font-medium"
          :class="{'bg-neutral-400': loading.button_connect_account, 'bg-neutral-500 cursor-pointer': !loading.button_connect_account}"
          :disabled="loading.button_connect_account"
          @click="connectAccountStripe">
          <span id="text-connect-stripe">Connect Your Stripe</span>
          <i v-if="loading.button_connect_account" class="ml-2 fas fa-spinner fa-pulse"></i>
        </button>
      </div>
    </div>
    <!-- Button Connected Account -->
  </div>
</template>

<script>
import { ElNotification } from 'element-plus';

export default {
  mounted() {
    this.checkConnectAccountStripe();
  },

  data() {
    return {
      topup_enabled: false,
      payout_enabled: false,

      disable: {
        status_connect_account: false,
        button_connect_account: false,
        blank_screen: false,
      },

      loading: {
        button_connect_account: false,
      }
    }
  },

  methods: {
    checkConnectAccountStripe(){
      this.$global.isConnectedAccountComplete = false;
      
      this.$store.dispatch('checkConnectAccountStripe', {
        user_id_seller: this.$store.getters.user.id
      })
      .then(response => {
        // console.log(response);

        /* DETECTS THAT THIS VIEW HAS FINISHED RENDERING */
        this.$global.showProfileView.showConnectedAccount = true;
        /* DETECTS THAT THIS VIEW HAS FINISHED RENDERING */

        if(response.data.result == 'success' && response.data.account != '') {
          this.topup_enabled = response.data.account.charges_enabled;
          this.payout_enabled = response.data.account.payouts_enabled;
          this.disable.status_connect_account = true;

          if(
            response.data.account.requirements.currently_due.length > 0 || 
            response.data.account.requirements.past_due.length > 0
          ) {
            this.disable.button_connect_account = true;
            $('#text-connect-stripe').text('Continue Connect Your Stripe');
            ElNotification({ type: 'warning', title: 'Warning', message: 'Please Continue Connect Your Account' });
          }
          else {
            this.$global.isConnectedAccountComplete = true;
          }

        }
      })
      .catch(error => {
        // console.error(error);

        /* DETECTS THAT THIS VIEW HAS FINISHED RENDERING */
        this.$global.showProfileView.showConnectedAccount = true;
        /* DETECTS THAT THIS VIEW HAS FINISHED RENDERING */

        this.disable.button_connect_account = true;

        if(error.response.data.result == 'warning') {
          ElNotification({ type: 'warning', title: 'Warning', message: error.response.data.message });
        }
        else if(error.response.data.result == 'error') {
          ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
        }
      });
    },

    connectAccountStripe() {
      console.log('connectAccountStripe');
      this.loading.button_connect_account = true;

      this.$store.dispatch('connectAccountStripe', {
        user_id_seller: this.$store.getters.user.id
      })
      .then(response => {
        // console.log(response);

        this.loading.button_connect_account = false;
        
        if(response.data.result == 'success') {
          this.disable.blank_screen = true;
          window.location.href = response.data.accountLink.url;
        } else if(response.data.result == 'failed') {
          ElNotification({ type: 'error', title: 'Error', message: response.data.message });
        }

        // console.log(this.loading.button_connect_account);

      })
      .catch(error => {
        // console.error(error);

        this.loading.button_connect_account = false;

        ElNotification({ type: 'error', title: 'Error', message: response.data.message });

        // console.log(this.loading.button_connect_account);

      });
    }
  }
}
</script>