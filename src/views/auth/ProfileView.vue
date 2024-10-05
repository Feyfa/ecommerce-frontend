<template>
  <div class="px-5 lg:px-10 w-full flex flex-col justify-center mb-48">
    
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

  </div>
</template>

<script>
import ImagePreview from "@/components/profile/ImagePreview.vue";
import UserSetting from "@/components/profile/UserSetting.vue";
import PersonImage from "@/assets/img/person.png";
import ConnectedAccount from "@/components/profile/ConnectedAccount.vue";

export default {
  components: {
    ImagePreview,
    UserSetting,
    ConnectedAccount
  },

  mounted() {
    this.$global.personImage = this.$store.getters.user.img ? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${this.$store.getters.user.img}` : PersonImage;
  }
}
</script>