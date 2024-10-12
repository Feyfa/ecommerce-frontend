<template>
  <div class="w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded relative">
    <!-- HIDE TOPUP -->
    <div class="bg-[rgba(50,50,50,.1)] absolute inset-0 z-99" v-show="!$global.isConnectedAccountComplete"></div>
    <!-- HIDE TOPUP -->
     
    <!-- HEADING TOPUP -->
    <div class="text-center flex flex-col-reverse gap-6 sm:relative">
      <h1 class="text-xl font-semibold sm:absolute sm:left-0 sm:top-0 sm:bottom-0 sm:mt-0.5">$10000.00</h1>
      <h1 class="text-xl">Topup Setting</h1>
    </div>
    <!-- HEADING TOPUP -->

    <!-- TOPUP INPUT -->
    <div class="mt-5">
      <div class="grid md:grid-cols-3 items-start gap-y-4 gap-x-4 lg:gap-x-6">
        <div class="input-container flex flex-col w-full">
          <label 
            for="payment-topup">
            Payment
          </label>
          <select 
            id="payment-topup" 
            v-model="select_payment"
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
            :class="{'input-disabled': !$global.isConnectedAccountComplete}"
            :disabled="!$global.isConnectedAccountComplete"
            @change="watchInput('select_payment')">
            <option v-for="(item) in paymentList" :value="item.value" :key="item.id">{{ item.text }}</option>
          </select>
          <small 
            v-if="error.select_payment"
            class="text-red-500">
            payment the required
          </small>
        </div>
        
        <div class="input-container flex flex-col w-full">
          <label 
            for="topup-amount">
            Amount
          </label>
          <input
            placeholder="Amount" 
            id="topup-amount" 
            type="text" 
            v-model="amount"
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
            :class="{'input-disabled': !$global.isConnectedAccountComplete}"
            :disabled="!$global.isConnectedAccountComplete"
            @input="watchInput('amount')">
          <small 
            v-if="error.amount"
            class="text-red-500">
            {{ errorText.amount }}
          </small>
        </div>

        <div>
          <button  
            class="border w-full border-neutral-300 rounded-md transition-all duration-300 hover:-translate-y-[1px] h-12 px-8 text-white font-medium mt-3 md:mt-6"
            :class="{'bg-neutral-400': loading.button_topup, 'bg-neutral-500 cursor-pointer': !loading.button_topup}"
            :disabled="loading.button_topup || !$global.isConnectedAccountComplete"
            @click="storeTopup">
            <span>Topup</span>
            <i v-if="loading.button_topup" class="ml-2 fas fa-spinner fa-pulse"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- TOPUP INPUT -->

    <!-- TOPUP HISTORY -->
    <div class="mt-5">
      <h3 class="text-[1rem]">Topup History</h3>
      <div class="mt-2 flex flex-col gap-2 border border-neutral-400 bg-whie rounded shadow p-2 w-full max-h-[26rem] overflow-auto">
        <div v-for="item in topupHistory" class="border w-full border-neutral-300 rounded px-2 h-[8rem] flex items-center">
          <div class="p-2 border-black w-full">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-base font-semibold">Ringkasan Topup</h2>
              <BadgeView :type="item.status" :text="item.status" />
            </div>
            <div class="mt-1 flex items-center justify-between text-[.75rem]">
              <h3>Payment</h3>
              <h3 class="font-semibold">{{ item.payment }}</h3>
            </div>
            <div class="mt-1 flex items-center justify-between text-[.75rem]">
              <h3>Last Number</h3>
              <h3 class="font-semibold">&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;{{ item.last_number }}</h3>
            </div>
            <div class="mt-1 flex items-center justify-between text-[.75rem]">
              <h3>Tanggal</h3>
              <h3 class="font-semibold">{{ new Date(item.created_at).toLocaleString('sv-SE') }}</h3>
            </div>
            <div class="mt-1 flex items-center justify-between text-[.75rem]">
              <h3>Amount</h3>
              <h3 class="font-semibold">${{ item.amount }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- TOPUP HISTORY -->

  </div>
</template>

<script>
import { ElNotification } from 'element-plus';
import BadgeView from '../partials/BadgeView.vue';

export default {
  components: {
    BadgeView
  },

  data() {
    return {
      array: ['','','','',''],

      paymentList: [],
      topupHistory: [],

      select_payment: '',
      amount: '',

      error: {
        select_payment: false,
        amount: false,
      },

      errorText: {
        select_payment: '',
        amount: 'Amount name the required',
      },

      loading: {
        button_topup: false
      }
    }
  },

  mounted() {
    this.getPaymentList();
    this.getTopupHistory();
  },

  methods: {
    clearFormTopup() {
      this.select_payment = '';
      this.amount = '';
    },

    storeTopup() {
      this.loading.button_topup = true;

      /* VALIDATOR */
      if(this.select_payment.trim() == '') 
        this.error.select_payment = true;
      if(this.amount.trim() == '') 
        this.error.amount = true;

      if(this.error.select_payment || this.error.amount) {
        this.loading.button_topup = false;
        return false;
      }
      /* VALIDATOR */

      this.$store.dispatch('storeTopup', {
        user_id_seller: this.$store.getters.user.id,
        select_payment: this.select_payment,
        amount: this.amount
      })
      .then(response => {
        console.log(response);

        console.log(response.data.result);

        this.loading.button_topup = false;

        if(response.data.result == 'success') {
          this.clearFormTopup();

          this.topupHistory = response.data.topup_history;

          ElNotification({ type: 'success', title: 'Success', message: response.data.message });
        }
      })
      .catch(error => {
        console.error(error);

        this.loading.button_topup = false;

        ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
      });
    },
    
    getPaymentList() {
      this.$store.dispatch('getPaymentList', {
        user_id_seller: this.$store.getters.user.id
      })
      .then(response => {
        console.log(response);

        if(response.data.result == 'success') {
          if(response.data.params_cc != '') {
            this.paymentList.push({
              id: this.paymentList.length,
              value: 'credit_card',
              text: `Credit Card #${response.data.params_cc.last4}`
            });
          }
          if(response.data.params_ach != '') {
            this.paymentList.push({
              id: this.paymentList.length,
              value: 'bank_account',
              text: `Bank Account #${response.data.params_ach.last4}`
            });
          }
          console.log('getPaymentList');
          console.log(this.paymentList);
        }
      })
      .catch(error => {
        console.error(error);

        ElNotification({ type: 'error', title: 'Error', message: error.response.data.message })
      })
    },

    getTopupHistory() {
      this.$store.dispatch('getTopupHistory', {
        user_id_seller: this.$store.getters.user.id
      })
      .then(response => {
        console.log(response);

        if(response.data.result == 'success') {
          this.topupHistory = response.data.topup_history;
        }
      })
      .catch(error => {
        console.error(error);
      })
    },

    watchInput(type) {
      /* CREDIT CARD */
      if(type == 'select_payment' && this.select_payment.trim() != '') {
        if(this.error.select_payment) {
          this.error.select_payment = false;
        }
      }
      else if(type == 'amount' && this.amount.trim() != '') {
        if(this.error.amount) {
          this.error.amount = false;
        }
      }
    }
  }
}
</script>
