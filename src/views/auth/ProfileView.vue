<template>
  <div class="px-5 lg:px-10 w-full flex flex-col justify-center mb-8">
    
    <!-- image setting -->
    <div class="row w-full flex justify-center">
      <ImagePreview
        :src="this.$global.personImage"
        alt="User" />
    </div>
    <!-- image setting -->

    <!-- user setting -->
    <div id="user-setting" class="mt-10">
      <UserSetting />
    </div>
    <!-- user setting -->

    <!-- Connected Account -->
    <div id="connected-account" class="mt-10">
      <ConnectedAccount />
    </div>
    <!-- Connected Account -->

    <!-- Payment Stripe -->
    <div id="payment" class="mt-10">
      <PaymentStripe @onUpdatePayment="onUpdatePayment" />
    </div>
    <!-- Payment Stripe -->

    <!-- Topup Stripe -->
    <div id="topup" class="mt-10">
      <TopupStripe ref="topupStripe" />
    </div>
    <!-- Topup Stripe -->

  </div>
</template>

<script>
import ImagePreview from "@/components/profile/ImagePreview.vue";
import UserSetting from "@/components/profile/UserSetting.vue";
import PersonImage from "@/assets/img/person.png";
import ConnectedAccount from "@/components/profile/ConnectedAccount.vue";
import PaymentStripe from "@/components/profile/PaymentStripe.vue";
import TopupStripe from "@/components/profile/TopupStripe.vue";

export default {
  components: {
    ImagePreview,
    UserSetting,
    ConnectedAccount,
    PaymentStripe,
    TopupStripe
  },

  mounted() {
    this.$global.personImage = this.$store.getters.user.img ? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${this.$store.getters.user.img}` : PersonImage;
  
    this.scrollBehavior('smooth');
  },

  methods: {
    scrollBehavior(behavior) {
      const hash = this.$route.hash;
      console.log(hash);
      
      if (hash) {
        const el = document.querySelector(hash);
        
        if (el) {
          el.scrollIntoView({ behavior: behavior });
        }
      }
    },

    onUpdatePayment() {
      if(this.$refs.topupStripe) {
        this.$refs.topupStripe.getPaymentList();
      }
    }
  }
}
</script>