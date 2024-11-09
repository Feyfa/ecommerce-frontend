<template>
  <div class="w-full border bg-neutral-50 border-neutral-400 shadow-md rounded relative">
    <!-- HIDE CARD -->
    <div class="bg-[rgba(50,50,50,.1)] absolute inset-0 z-99" v-show="!$global.isConnectedAccountComplete"></div>
    <!-- HIDE CARD -->

    <!-- HEADING CREDIT CARD -->
    <div class="text-center m-5">
      <h1 class="text-xl">Payment <span class="font-medium">{{ $store.getters.user?.name }}</span></h1>
    </div>
    <!-- HEADING CREDIT CARD -->

    <!-- TABS CONTAINER -->
    <div class="mt-5">
      <el-tabs stretch>
        <!-- CREDIT CARD -->
        <el-tab-pane label="Credit Card">
          <div class="px-5 pb-5 pt-1.5">
            <!-- Form  -->
            <div>
              <div class="flex flex-col items-start gap-y-4">
                <div class="input-container flex flex-col w-full">
                    <label>
                      Card Number
                    </label>
                    <div
                      id="card-element" 
                      class="border w-full border-neutral-500 rounded outline-none shadow px-2.5">
                    </div>
                    <small 
                      v-if="error.creditCard.card_number"
                      class="text-red-500">
                      {{ errorText.card_number }}
                    </small>
                </div>
  
                <div class="input-container flex flex-col w-full">
                    <label 
                      for="card-holder-name">
                      Card Holder Name
                    </label>
                    <input
                      placeholder="Card Holder Name" 
                      id="card-holder-name" 
                      type="text" 
                      v-model="creditCardInput.card_holder_name"
                      class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                      :class="{'input-disabled': !$global.isConnectedAccountComplete}"
                      :disabled="!$global.isConnectedAccountComplete"
                      @input="watchInput('credit_card.card_holder_name')">
                    <small 
                      v-if="error.creditCard.card_holder_name"
                      class="text-red-500">
                      card holder name the required
                    </small>
                </div>
  
                <div class="input-container flex flex-col w-full">
                    <label 
                      for="address">
                      Address
                    </label>
                    <input
                      placeholder="Address" 
                      id="address" 
                      type="text" 
                      v-model="creditCardInput.address"
                      class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                      :class="{'input-disabled': !$global.isConnectedAccountComplete}"
                      :disabled="!$global.isConnectedAccountComplete"
                      @input="watchInput('credit_card.address')">
                    <small 
                      v-if="error.creditCard.address"
                      class="text-red-500">
                      addres the required
                    </small>
                </div>
  
                <div class="w-full grid grid-cols-1 sm:grid-cols-3 items-start gap-y-4 gap-x-4 lg:gap-x-6">
                  <div class="input-container flex flex-col w-full">
                    <label 
                      for="country">
                      Country
                    </label>
                    <el-select
                      v-model="creditCardInput.country"
                      filterable
                      placeholder="Country"
                      @change="countryChange"
                      :disabled="!$global.isConnectedAccountComplete">
                      <el-option
                        v-for="item in countries"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <small 
                      v-if="error.creditCard.country"
                      class="text-red-500">
                      country the required
                    </small>
                  </div>
          
                  <div class="input-container flex flex-col w-full">
                    <label 
                      for="state">
                      State
                    </label>
                    <el-select
                      v-model="creditCardInput.state"
                      filterable
                      placeholder="State"
                      @change="stateChange"
                      :disabled="!$global.isConnectedAccountComplete">
                      <el-option
                        v-for="item in states"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <small 
                      v-if="error.creditCard.state"
                      class="text-red-500">
                      state the required
                    </small>
                  </div>
          
                  <div class="input-container flex flex-col w-full">
                    <label 
                      for="city">
                      City
                    </label>
                    <el-select
                      v-model="creditCardInput.city"
                      filterable
                      placeholder="City"
                      :disabled="!$global.isConnectedAccountComplete">
                      <el-option
                        v-for="item in cities"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <small 
                      v-if="error.creditCard.city"
                      class="text-red-500">
                      city the required
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <!-- Form  -->
            
            <!-- Information Card -->
            <div class="mt-7 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-end justify-center gap-5">
              <ul class="flex flex-col gap-1">
                <li v-show="creditCardInfo.lastNumber">
                  <span class="w-[7.5rem] inline-block">Last Number</span>
                  <span class="mr-2.5">:</span>
                  <span>&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;{{ creditCardInfo.lastNumber }} ({{ creditCardInfo.brand }})</span>
                </li>
                <li v-show="creditCardInfo.holderName">
                  <span class="w-[7.5rem] inline-block">Holder Name</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ creditCardInfo.holderName }}</span>
                </li>
                <li v-show="creditCardInfo.address">
                  <span class="w-[7.5rem] inline-block">Address</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ creditCardInfo.address }}</span>
                </li>
                <li v-show="creditCardInfo.country">
                  <span class="w-[7.5rem] inline-block">Country</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ creditCardInfo.country }}</span>
                </li>
                <li v-show="creditCardInfo.state">
                  <span class="w-[7.5rem] inline-block">State</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ creditCardInfo.state }}</span>
                </li>
                <li v-show="creditCardInfo.city">
                  <span class="w-[7.5rem] inline-block">City</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ creditCardInfo.city }}</span>
                </li>
              </ul>
              <div>
                <button  
                  class="border w-full border-neutral-300 rounded-md transition-all duration-300 hover:-translate-y-[1px] h-12 px-8 text-white font-medium"
                  :class="{'bg-neutral-400': loading.button_credit_card, 'bg-neutral-500 cursor-pointer': !loading.button_credit_card}"
                  :disabled="loading.button_credit_card || !$global.isConnectedAccountComplete"
                  @click="createOrReplaceCreditCard">
                  <span id="text-submit-credit-card">{{ cardText }}</span>
                  <i v-if="loading.button_credit_card" class="ml-2 fas fa-spinner fa-pulse"></i>
                </button>
              </div>
            </div>
            <!-- Information Card -->
          </div>
        </el-tab-pane>
        <!-- CREDIT CARD -->

        <!-- BANK ACCOUNT -->
        <el-tab-pane label="Bank Account">
          <div class="px-5 pb-5 pt-1.5">
            <!-- Form For Not Status Or Status Verified  -->
            <div v-show="achInfo.status == '' || achInfo.status == 'verify'">
              <div class="flex flex-col items-start gap-y-4">
                <div class="input-container flex flex-col w-full">
                  <label 
                    for="ach-routing-number">
                    Routing Number
                  </label>
                  <input
                    placeholder="Routing Number" 
                    id="ach-routing-number" 
                    type="text" 
                    v-model="achInput.routing_number"
                    class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                    :class="{'input-disabled': !$global.isConnectedAccountComplete}"
                    :disabled="!$global.isConnectedAccountComplete"
                    @input="watchInput('ach.routing_number')">
                  <small 
                    v-if="error.ach.routing_number"
                    class="text-red-500">
                    routing number the required
                  </small>
                </div>

                <div class="input-container flex flex-col w-full">
                  <label 
                    for="ach-account-number">
                    Account Number
                  </label>
                  <input
                    placeholder="Account Number" 
                    id="ach-account-number" 
                    type="text" 
                    v-model="achInput.account_number"
                    class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                    :class="{'input-disabled': !$global.isConnectedAccountComplete}"
                    :disabled="!$global.isConnectedAccountComplete"
                    @input="watchInput('ach.account_number')">
                  <small 
                    v-if="error.ach.account_number"
                    class="text-red-500">
                    account number the required
                  </small>
                </div>

                <div class="input-container flex flex-col w-full">
                  <label 
                    for="ach-holder-name">
                    Holder Name
                  </label>
                  <input
                    placeholder="Holder Name" 
                    id="ach-holder-name" 
                    type="text" 
                    v-model="achInput.holder_name"
                    class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                    :class="{'input-disabled': !$global.isConnectedAccountComplete}"
                    :disabled="!$global.isConnectedAccountComplete"
                    @input="watchInput('ach.holder_name')">
                  <small 
                    v-if="error.ach.holder_name"
                    class="text-red-500">
                    holder name the required
                  </small>
                </div>

                <div class="input-container flex flex-col w-full">
                  <label 
                    for="ach-holder-type">
                    Holder Type
                  </label>
                  <select 
                    id="ach-holder-type" 
                    v-model="achInput.holder_type"
                    class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                    :class="{'input-disabled': !$global.isConnectedAccountComplete}"
                    :disabled="!$global.isConnectedAccountComplete"
                    @change="watchInput('ach.holder_type')">
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                  <small 
                    v-if="error.ach.holder_type"
                    class="text-red-500">
                    holder type the required
                  </small>
                </div>
              </div>
            </div>
            <!-- Form For Not Status Or Status Verified  -->

            <!-- Form For Not Status Or Status Verified  -->
            <div v-show="achInfo.status == 'pending'">
              <div class="mb-4">
                <div class="text-center mb-5">
                  <h2 class="text-xl font-semibold">Waiting Verification</h2>
                </div>

                <div id="image-ach-pending" class="flex justify-center my-2">
                  <img
                    width="190"
                    :src="achPendingVerification" 
                    alt="achPendingVerification">
                </div>
                
                <div id="message-ach-pending">
                  <p class="text-center font-medium text-[.8rem]">Within 1-3 business days, you'll receive two small deposits in your bank account. Once you see them, log in to your account and enter the exact amounts to verify your bank account.</p>
                </div>
              </div>

              <div class="w-full grid grid-cols-1 sm:grid-cols-2 items-start gap-y-4 gap-x-4 lg:gap-x-6">
                <div class="input-container flex flex-col w-full">
                  <label 
                    for="ach-micro-deposite-1">
                    Micro Deposite 1
                  </label>
                  <input
                    placeholder="0.32" 
                    id="ach-micro-deposite-1" 
                    type="text" 
                    v-model="achInput.micro_deposite_1"
                    class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                    :class="{'input-disabled': !$global.isConnectedAccountComplete}"
                    :disabled="!$global.isConnectedAccountComplete"
                    @input="watchInput('ach.micro_deposite_1')">
                  <small 
                    v-if="error.ach.micro_deposite_1"
                    class="text-red-500">
                    micro deposite 1 the required
                  </small>
                </div>

                <div class="input-container flex flex-col w-full">
                  <label 
                    for="ach-micro-deposite-2">
                    Micro Deposite 2
                  </label>
                  <input
                    placeholder="0.45" 
                    id="ach-micro-deposite-2" 
                    type="text" 
                    v-model="achInput.micro_deposite_2"
                    class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                    :class="{'input-disabled': !$global.isConnectedAccountComplete}"
                    :disabled="!$global.isConnectedAccountComplete"
                    @input="watchInput('ach.micro_deposite_2')">
                  <small 
                    v-if="error.ach.micro_deposite_2"
                    class="text-red-500">
                    micro deposite 2 the required
                  </small>
                </div>
              </div>
            </div>
            <!-- Form For Not Status Or Status Verified  -->

            <!-- Form For Not Status Or Status Verified  -->
            <div v-show="achInfo.status == 'failed'">
              <div class="mb-4">
                <div class="text-center mb-5">
                  <h2 class="text-xl font-semibold">Failed Verification</h2>
                </div>

                <div id="image-ach-pending" class="flex justify-center my-10">
                  <img
                    width="190"
                    :src="achfailedVerification" 
                    alt="achPendingVerification">
                </div>
                
                <div id="message-ach-pending">
                  <p class="text-center font-medium text-[.8rem]">We’re sorry, but your bank account verification could not be completed. Please reinitiate the payment and follow the steps to verify your account.</p>
                </div>
              </div>
            </div>
            <!-- Form For Not Status Or Status Verified  -->
            
            <!-- Information Card -->
            <!-- <div class="mt-5 flex justify-between items-end"> -->
            <div class="mt-7 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-end justify-center gap-5">
              <ul class="flex flex-col gap-1">
                <li v-show="achInfo.lastNumber">
                  <span class="w-[9rem] inline-block">Last Number</span>
                  <span class="mr-2.5">:</span>
                  <span>&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;{{ achInfo.lastNumber }}</span>
                </li>
                <li v-show="achInfo.routingNumber">
                  <span class="w-[9rem] inline-block">Routing Number</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ achInfo.routingNumber }}</span>
                </li>
                <li v-show="achInfo.holderType">
                  <span class="w-[9rem] inline-block">Holder Type</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ achInfo.holderType }}</span>
                </li>
                <li v-show="achInfo.holderName">
                  <span class="w-[9rem] inline-block">Holder Name</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ achInfo.holderName }}</span>
                </li>
                <li v-show="achInfo.status">
                  <span class="w-[9rem] inline-block">Verify Status</span>
                  <span class="mr-2.5">:</span>
                  <span>{{ achInfo.status }}</span>
                </li>
              </ul>
              <div>
                <button v-show="achInfo.status == '' || achInfo.status == 'verify'"
                  class="border w-full border-neutral-300 rounded-md transition-all duration-300 hover:-translate-y-[1px] h-12 px-8 text-white font-medium"
                  :class="{'bg-neutral-400': loading.button_ach, 'bg-neutral-500 cursor-pointer': !loading.button_ach}"
                  :disabled="loading.button_ach || !$global.isConnectedAccountComplete"
                  @click="createOrReplaceAch">
                  <span id="text-submit-credit-card">{{ achText }}</span>
                  <i v-if="loading.button_ach" class="ml-2 fas fa-spinner fa-pulse"></i>
                </button>

                <button v-show="achInfo.status == 'pending'"
                  class="border w-full border-neutral-300 rounded-md transition-all duration-300 hover:-translate-y-[1px] h-12 px-8 text-white font-medium"
                  :class="{'bg-neutral-400': loading.button_ach, 'bg-neutral-500 cursor-pointer': !loading.button_ach}"
                  :disabled="loading.button_ach || !$global.isConnectedAccountComplete"
                  @click="verifyAch">
                  <span id="text-submit-credit-card">Verify</span>
                  <i v-if="loading.button_ach" class="ml-2 fas fa-spinner fa-pulse"></i>
                </button>

                <button v-show="achInfo.status == 'failed'"
                  class="border w-full border-neutral-300 rounded-md transition-all duration-300 hover:-translate-y-[1px] h-12 px-8 text-white font-medium"
                  :class="{'bg-neutral-400': loading.button_ach, 'bg-neutral-500 cursor-pointer': !loading.button_ach}"
                  :disabled="loading.button_ach || !$global.isConnectedAccountComplete"
                  @click="deleteAch">
                  <span id="text-submit-credit-card">Create New Account</span>
                  <i v-if="loading.button_ach" class="ml-2 fas fa-spinner fa-pulse"></i>
                </button>
              </div>
            </div>
            <!-- Information Card -->
          </div>
        </el-tab-pane>
        <!-- BANK ACCOUNT -->
      </el-tabs>
    </div>
    <!-- TABS CONTAINER -->

  </div>
</template>

<script>
import { ElNotification } from 'element-plus';
import achPendingVerification from "@/assets/img/ach-pending-verification.png";
import achfailedVerification from "@/assets/img/ach-failed-verification.png";

export default {
  data() {
    return {
      STRIPE_PUBLISHED_KEY: import.meta.env.VITE_STRIPE_PUBLISHED_KEY,
      achPendingVerification: achPendingVerification,
      achfailedVerification: achfailedVerification,

      stripe: null,
      cardElement: null,

      countries: [],
      states: [],
      cities: [],

      creditCardInfo: {
        brand: '',
        lastNumber: '',
        holderName: '',
        address: '',
        country: '',
        state: '',
        city: '',
      },

      achInfo: {
        lastNumber: '',
        routingNumber: '',
        holderType: '',
        holderName: '',
        status: '',
      },
      
      replace: {
        creditCard: false,
        ach: false,
      },

      cardText: 'Create',
      achText: 'Create',

      creditCardInput: {
        card_holder_name: '',
        address: '',
        country: '',
        state: '',
        city: '',
      },
      
      achInput: {
        holder_type: '',
        holder_name: '',
        routing_number: '',
        account_number: '',
        micro_deposite_1: '',
        micro_deposite_2: '',
      },

      error: {
        creditCard: {
          card_number: false,
          card_holder_name: false,
          address: false,
          country: false,
          state: false,
          city: false,
        },
        ach: {
          holder_type: false,
          holder_name: false,
          routing_number: false,
          account_number: false,
          micro_deposite_1: false,
          micro_deposite_2: false,
        }
      },

      errorText: {
        card_number: ''
      },

      loading: {
        button_credit_card: false,
        button_ach: false
      },
    }
  },

  async mounted() {
    this.setupInputCreditCard();
    this.getInfoPaymentMethod();
    this.getCountries();
  },

  methods: {
    getCountries() {
      this.$store.dispatch('getCountries')
                 .then(response => {
                  // console.log(response);

                  if(response.data.result == 'success') {
                    this.countries = response.data.countries;
                  }
                 })
                 .catch(error => {
                  console.error(error);
                 })
    },

    countryChange(selectedValue) {
      this.creditCardInput.state = '';
      this.creditCardInput.city = '';

      const selectedCountry = this.countries.find(country => country.value === selectedValue);

      this.$store.dispatch('getStates', {
        country_id: selectedCountry.id
      })
      .then(response => {
        // console.log(response);

        if(response.data.result == 'success') {
          this.states = response.data.states
        }
      })
      .catch(error => {
        console.error(error);
      })
    },

    stateChange(selectedValue) {
      this.creditCardInput.city = '';

      const selectedCity = this.states.find(state => state.value === selectedValue);

      this.$store.dispatch('getCites', {
        city_id: selectedCity.id
      })
      .then(response => {
        // console.log(response);

        if(response.data.result == 'success') {
          this.cities = response.data.cities
        }
      })
      .catch(error => {
        console.error(error);
      })
    },

    deleteAch() {
      this.loading.button_ach = true;

      this.$store.dispatch('deleteAch', {
        user_id_seller: this.$store.getters.user.id,
      })
      .then(response => {
        // console.log(response);

        this.loading.button_ach = false;

        if(response.data.result == 'success') {
          this.cleanFormAch();
          this.cleanAchInfo();

          this.replace.ach = false;

          ElNotification({ type: 'success', title: 'Success', message: response.data.message })
        }

      })
      .catch(error => {
        console.error(error);

        this.loading.button_ach = false;

        ElNotification({ type: 'error', title: 'Error', message: error.response.data.message })
      });
    },

    verifyAch() {
      this.loading.button_ach = true;

      /* VALIDATOR */
      if(this.achInput.micro_deposite_1.trim() == '') 
        this.error.ach.micro_deposite_1 = true;
      if(this.achInput.micro_deposite_2.trim() == '') 
        this.error.ach.micro_deposite_2 = true;

      if(this.error.ach.micro_deposite_1 || this.error.ach.micro_deposite_2) {
        return false;
      }
      /* VALIDATOR */

      /* VERIFY */
      this.$store.dispatch('verifyAch', {
        user_id_seller: this.$store.getters.user.id,
        micro_deposite_1: this.achInput.micro_deposite_1,
        micro_deposite_2: this.achInput.micro_deposite_2,
      })
      .then(response => {
        // console.log(response);

        this.loading.button_ach = false;

        if(response.data.result == 'success' && response.data.params_ach != '') {
          this.achInfo.lastNumber = response.data.params_ach.last4;
          this.achInfo.routingNumber = response.data.params_ach.routing_number;
          this.achInfo.holderType = response.data.params_ach.account_holder_type;
          this.achInfo.holderName = response.data.params_ach.account_holder_name;
          
          switch(response.data.params_ach.status)
          {
            case 'new' : this.achInfo.status = 'pending'; break;
            case 'verified' : this.achInfo.status = 'verify'; break;
            case 'verification_failed' : this.achInfo.status = 'failed'; break;
          }

          this.cleanFormAch();

          this.$emit('onUpdatePayment');

          ElNotification({ type: 'success', title: 'Success', message: response.data.message })
        }

      })
      .catch(error => {
        console.error(error);
        
        this.loading.button_ach = false;
        
        if(error.response.data.result == 'failed' && error.response.data.params_ach != '') {
          this.achInfo.lastNumber = error.response.data.params_ach.last4;
          this.achInfo.routingNumber = error.response.data.params_ach.routing_number;
          this.achInfo.holderType = error.response.data.params_ach.account_holder_type;
          this.achInfo.holderName = error.response.data.params_ach.account_holder_name;
          
          switch(error.response.data.params_ach.status)
          {
            case 'new' : this.achInfo.status = 'pending'; break;
            case 'verified' : this.achInfo.status = 'verify'; break;
            case 'verification_failed' : this.achInfo.status = 'failed'; break;
          }
        }

        ElNotification({ type: 'error', title: 'Error', message: error.response.data.message })
      });
      /* VERIFY */
    },

    createOrReplaceAch() {
      this.loading.button_ach = true;

      /* VALIDATOR */
      if(this.achInput.holder_type.trim() == '') 
        this.error.ach.holder_type = true;
      if(this.achInput.holder_name.trim() == '') 
        this.error.ach.holder_name = true;
      if(this.achInput.routing_number.trim() == '') 
        this.error.ach.routing_number = true;
      if(this.achInput.account_number.trim() == '') 
        this.error.ach.account_number = true;

      if(this.error.ach.holder_type || this.error.ach.holder_name || this.error.ach.routing_number || this.error.ach.account_number) {
        this.loading.button_ach = false;
        return false;
      }
      /* VALIDATOR */

      /* CREATE ACH */
      if(!this.replace.ach) {
        this.$store.dispatch('createAch', {
          user_id_seller: this.$store.getters.user.id,
          holder_type: this.achInput.holder_type,
          holder_name: this.achInput.holder_name,
          routing_number: this.achInput.routing_number,
          account_number: this.achInput.account_number,
        })
        .then(response => {
          // console.log(response);

          this.loading.button_ach = false;

          if(response.data.result == 'success' && response.data.params_ach != '') {
            this.achInfo.lastNumber = response.data.params_ach.last4;
            this.achInfo.routingNumber = response.data.params_ach.routing_number;
            this.achInfo.holderType = response.data.params_ach.account_holder_type;
            this.achInfo.holderName = response.data.params_ach.account_holder_name;
            
            switch(response.data.params_ach.status)
            {
              case 'new' : this.achInfo.status = 'pending'; break;
              case 'verified' : this.achInfo.status = 'verify'; break;
              case 'verification_failed' : this.achInfo.status = 'failed'; break;
            }

            this.cleanFormAch();

            this.$emit('onUpdatePayment');

            ElNotification({ type: 'success', title: 'Success', message: response.data.message })
          }
        })
        .catch(error => {
          console.error(error);
          this.loading.button_ach = false;
          ElNotification({ type: 'error', title: 'Error', message: error.response.data.message })
        })
      }
      /* CREATE ACH */
      /* REPLACE ACH */
      else {
        this.$store.dispatch('replaceAch', {
          user_id_seller: this.$store.getters.user.id,
          holder_type: this.achInput.holder_type,
          holder_name: this.achInput.holder_name,
          routing_number: this.achInput.routing_number,
          account_number: this.achInput.account_number,
        })
        .then(response => {
          // console.log(response);

          this.loading.button_ach = false;

          if(response.data.result == 'success' && response.data.params_ach != '') {
            this.achInfo.lastNumber = response.data.params_ach.last4;
            this.achInfo.routingNumber = response.data.params_ach.routing_number;
            this.achInfo.holderType = response.data.params_ach.account_holder_type;
            this.achInfo.holderName = response.data.params_ach.account_holder_name;
            
            switch(response.data.params_ach.status)
            {
              case 'new' : this.achInfo.status = 'pending'; break;
              case 'verified' : this.achInfo.status = 'verify'; break;
              case 'verification_failed' : this.achInfo.status = 'failed'; break;
            }

            this.cleanFormAch();

            this.$emit('onUpdatePayment');

            ElNotification({ type: 'success', title: 'Success', message: response.data.message })
          }
        })
        .catch(errorr => {
          console.error(error);

          this.loading.button_ach = false;

          ElNotification({ type: 'error', title: 'Error', message: error.response.data.message })
        })
      }
      /* REPLACE ACH */
    },

    cleanAchInfo() {
      this.achInfo.lastNumber = '';
      this.achInfo.routingNumber = '';
      this.achInfo.holderType = '';
      this.achInfo.holderName = '';
      this.achInfo.status = '';
    },

    cleanFormAch() {
      console.log('cleanFormAch');
      this.achInput.routing_number = '';
      this.achInput.account_number = '';
      this.achInput.holder_type = '';
      this.achInput.holder_name = '';
      this.achInput.micro_deposite_1 = '';
      this.achInput.micro_deposite_2 = '';
    },

    cleanFormCreditcard() {
      /* CLEAN MY INPUT */
      this.creditCardInput.card_holder_name = '';
      this.creditCardInput.address = '';
      this.creditCardInput.country = '';
      this.creditCardInput.state = '';
      this.creditCardInput.city = '';
      /* CLEAN MY INPUT */

      /* CLEAN INPUT STRIPE JS */
      this.setupInputCreditCard();
      /* CLEAN INPUT STRIPE JS */
    },

    getInfoPaymentMethod() {
      this.$store.dispatch('getInfoPaymentMethod', {
        user_id_seller: this.$store.getters.user.id
      })
      .then(response => {
        // console.log(response);

        /* DETECTS THAT THIS VIEW HAS FINISHED RENDERING */
        this.$global.showProfileView.showPaymentStripe = true;
        /* DETECTS THAT THIS VIEW HAS FINISHED RENDERING */

        if(response.data.result == 'success') {

          /* GET INFO CC */
          if(response.data.params_cc != '') {
            this.creditCardInfo.brand = response.data.params_cc.brand;
            this.creditCardInfo.lastNumber = response.data.params_cc.last4;
            this.creditCardInfo.holderName = response.data.params_cc.name;
            this.creditCardInfo.address = response.data.params_cc.address_line1;
            this.creditCardInfo.country = response.data.params_cc.address_country;
            this.creditCardInfo.state = response.data.params_cc.address_state;
            this.creditCardInfo.city = response.data.params_cc.address_city;
  
            this.cardText = 'Replace';
            this.replace.creditCard = true;
          }
          /* GET INFO CC */

          /* GET INFO ACH */
          if(response.data.params_ach != '') {
            this.achInfo.lastNumber = response.data.params_ach.last4;
            this.achInfo.routingNumber = response.data.params_ach.routing_number;
            this.achInfo.holderType = response.data.params_ach.account_holder_type;
            this.achInfo.holderName = response.data.params_ach.account_holder_name;

            switch(response.data.params_ach.status)
            {
              case 'new' : this.achInfo.status = 'pending'; break;
              case 'verified' : this.achInfo.status = 'verify'; break;
              case 'verification_failed' : this.achInfo.status = 'failed'; break;
            }

            this.achText = 'Replace';
            this.replace.ach = true;
          }
          /* GET INFO ACH */

        } else if(response.data.result == 'success' && response.data.params_cc == '' && response.data.params_ach == '') {
          this.creditCardInfo.brand = '';
          this.creditCardInfo.lastNumber = '';
          this.creditCardInfo.holderName = '';
          this.creditCardInfo.address = '';
          this.creditCardInfo.country = '';
          this.creditCardInfo.state = '';
          this.creditCardInfo.city = '';
          
          this.cardText = 'Create';
          this.replace.creditCard = false;
        }
      })
      .catch(error => {
        console.error(error);

        /* DETECTS THAT THIS VIEW HAS FINISHED RENDERING */
        this.$global.showProfileView.showPaymentStripe = true;
        /* DETECTS THAT THIS VIEW HAS FINISHED RENDERING */

        this.replace.creditCard = false;
        ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
      })
    },

    setupInputCreditCard() {
      /* SETUP INPUT CREDIT CARD */
      this.stripe = Stripe(this.STRIPE_PUBLISHED_KEY);
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        style: {
          base: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            fontSize: '16px',
            lineHeight: '46px',
          },
        },
        disableLink: true,
      });
      this.cardElement.mount('#card-element');
      /* SETUP INPUT CREDIT CARD */

      /* EVENT CHANGE INPUT CREDIT CARD */
      this.cardElement.on('change', (event) => {
        if (event.error) {
          // Tampilkan kesalahan jika ada
          this.error.creditCard.card_number = true;
          this.errorText.card_number = event.error.message;
        } else {
          // Hilangkan kesalahan jika input valid
          this.error.creditCard.card_number = false;
          this.errorText.card_number = '';
        }
      });
      /* EVENT CHANGE INPUT CREDIT CARD */
    },

    async createOrReplaceCreditCard() {
      this.loading.button_credit_card = true;

      /* STRIPE CREATE TOKEN  */
      const createToken = await this.stripe.createToken(this.cardElement);
      
      if(typeof(createToken.error) != 'undefined') {
        console.error(createToken.error);
        this.error.creditCard.card_number = true;
        this.errorText.card_number = createToken.error.message;
      }
      /* STRIPE CREATE TOKEN  */

      /* VALIDATOR */
      if(this.creditCardInput.card_holder_name.trim() == '') 
        this.error.creditCard.card_holder_name = true;
      if(this.creditCardInput.address.trim() == '') 
        this.error.creditCard.address = true;
      if(this.creditCardInput.country.trim() == '') 
        this.error.creditCard.country = true;
      if(this.creditCardInput.state.trim() == '') 
        this.error.creditCard.state = true;
      if(this.creditCardInput.city.trim() == '') 
        this.error.creditCard.city = true;

      if(this.error.creditCard.card_number || this.error.creditCard.card_holder_name || this.error.creditCard.address || this.error.creditCard.country || this.error.creditCard.state) {
        this.loading.button_credit_card = false;
        return false;
      }
      /* VALIDATOR */

      /* CREATE CREDIT CARD */
      if(!this.replace.creditCard) {
        try  {
          const response  = await this.$store.dispatch('createCreditCard', {
            user_id_seller: this.$store.getters.user.id,
            token: createToken.token.id,
            zip: createToken.token.card.address_zip,
            email: this.$store.getters.user.email,
            card_holder_name: this.creditCardInput.card_holder_name,
            address: this.creditCardInput.address,
            country: this.creditCardInput.country,
            state: this.creditCardInput.state,
            city: this.creditCardInput.city
          });
  
          // console.log(response);
  
          this.loading.button_credit_card = false;
  
          if(response.data.result == 'success' && response.data.params != '') {
            this.creditCardInfo.brand = response.data.params.brand;
            this.creditCardInfo.lastNumber = response.data.params.last4;
            this.creditCardInfo.holderName = response.data.params.name;
            this.creditCardInfo.address = response.data.params.address_line1;
            this.creditCardInfo.country = response.data.params.address_country;
            this.creditCardInfo.state = response.data.params.address_state;
            this.creditCardInfo.city = response.data.params.address_city;
  
            this.cardText = 'Replace';
            this.replace.creditCard = true;
  
            this.cleanFormCreditcard();

            this.$emit('onUpdatePayment');
  
            ElNotification({ type: 'success', title: 'Success', message: 'Success Create Credit Card' })
  
          } 
          else if(response.data.result == 'success' && response.data.params == '') {
            this.creditCardInfo.brand = '';
            this.creditCardInfo.lastNumber = '';
            this.creditCardInfo.holderName = '';
            this.creditCardInfo.address = '';
            this.creditCardInfo.country = '';
            this.creditCardInfo.state = '';
            this.creditCardInfo.city = '';

            this.$emit('onUpdatePayment');
          }
        } 
        catch (error) {
          console.error(error);

          this.loading.button_credit_card = true;
  
          ElNotification({ type: 'error', title: 'Error', message: error.response.data.message })
        }
      }
      /* CREATE CREDIT CARD */
      /* REPLACE CREDIT CARD */
      else {
        try {
          const response  = await this.$store.dispatch('replaceCreditCard', {
            user_id_seller: this.$store.getters.user.id,
            token: createToken.token.id,
            zip: createToken.token.card.address_zip,
            email: this.$store.getters.user.email,
            card_holder_name: this.creditCardInput.card_holder_name,
            address: this.creditCardInput.address,
            country: this.creditCardInput.country,
            state: this.creditCardInput.state,
            city: this.creditCardInput.city
          });

          // console.log(response);
  
          this.loading.button_credit_card = false;
  
          if(response.data.result == 'success' && response.data.params != '') {
            this.creditCardInfo.lastNumber = response.data.params.last4;
            this.creditCardInfo.holderName = response.data.params.name;
            this.creditCardInfo.address = response.data.params.address_line1;
            this.creditCardInfo.country = response.data.params.address_country;
            this.creditCardInfo.state = response.data.params.address_state;
            this.creditCardInfo.city = response.data.params.address_city;
  
            this.cardText = 'Replace';
  
            this.cleanFormCreditcard();

            this.$emit('onUpdatePayment');
  
            ElNotification({ type: 'success', title: 'Success', message: 'Success Create Credit Card' })
  
          } 
          else if(response.data.result == 'success' && response.data.params == '') {
            this.creditCardInfo.lastNumber = '';
            this.creditCardInfo.holderName = '';
            this.creditCardInfo.address = '';
            this.creditCardInfo.country = '';
            this.creditCardInfo.state = '';
            this.creditCardInfo.city = '';

            this.$emit('onUpdatePayment');
          }
        } 
        catch (error) {
          console.error(error);

          this.loading.button_credit_card = true;
  
          ElNotification({ type: 'error', title: 'Error', message: error.response.data.message })
        }
      }
      /* REPLACE CREDIT CARD */
    },

    watchInput(type) {
      /* CREDIT CARD */
      if(type == 'credit_card.card_holder_name' && this.creditCardInput.card_holder_name.trim() != '') {
        if(this.error.creditCard.card_holder_name) {
          this.error.creditCard.card_holder_name = false;
        }
      }
      else if(type == 'credit_card.address' && this.creditCardInput.address.trim() != '') {
        if(this.error.creditCard.address) {
          this.error.creditCard.address = false;
        }
      }
      else if(type == 'credit_card.country' && this.creditCardInput.country.trim() != '') {
        if(this.error.creditCard.country) {
          this.error.creditCard.country = false;
        }
      }
      else if(type == 'credit_card.state' && this.creditCardInput.state.trim() != '') {
        if(this.error.creditCard.state) {
          this.error.creditCard.state = false;
        }
      }
      else if(type == 'credit_card.city' && this.creditCardInput.city.trim() != '') {
        if(this.error.creditCard.city) {
          this.error.creditCard.city = false;
        }
      }
      /* CREDIT CARD */

      /* ACH */
      else if(type == 'ach.holder_name' && this.achInput.holder_name.trim() != '') {
        if(this.error.ach.holder_name) {
          this.error.ach.holder_name = false;
        }
      }
      else if(type == 'ach.holder_type' && this.achInput.holder_type.trim() != '') {
        if(this.error.ach.holder_type) {
          this.error.ach.holder_type = false;
        }
      }
      else if(type == 'ach.routing_number' && this.achInput.routing_number.trim() != '') {
        if(this.error.ach.routing_number) {
          this.error.ach.routing_number = false;
        }
      }
      else if(type == 'ach.account_number' && this.achInput.account_number.trim() != '') {
        if(this.error.ach.account_number) {
          this.error.ach.account_number = false;
        }
      }
      else if(type == 'ach.micro_deposite_1' && this.achInput.micro_deposite_1.trim() != '') {
        if(this.error.ach.micro_deposite_1) {
          this.error.ach.micro_deposite_1 = false;
        }
      }
      else if(type == 'ach.micro_deposite_2' && this.achInput.micro_deposite_2.trim() != '') {
        if(this.error.ach.micro_deposite_2) {
          this.error.ach.micro_deposite_2 = false;
        }
      }
      /* ACH */
    }
  },
}
</script>