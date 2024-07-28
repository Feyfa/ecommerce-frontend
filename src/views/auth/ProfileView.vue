<template>
  <div class="px-10 w-full flex flex-col justify-center">
    
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

  </div>
</template>

<script>
import ImagePreview from "@/components/profile/ImagePreview.vue";
import UserSetting from "@/components/profile/UserSetting.vue";
import PersonImage from "@/assets/img/person.png";

export default {
  components: {
    ImagePreview,
    UserSetting,
  },

  mounted() {
    this.$global.personImage = this.$store.getters.user.img ? `http://ecommerce.backend.com/storage/${this.$store.getters.user.img}` : PersonImage;
  }
}
</script>