<template>
  <div class="px-5 lg:px-10 w-full flex flex-col justify-center mb-8" v-show="this.$global.showUserProfileView.allComponent">
    
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

    <!-- alamat -->
    <div id="alamat" class="mt-10">
      <Alamat />
    </div>
    <!-- alamat -->
  </div>

  <!-- loading view -->
  <div v-show="!this.$global.showUserProfileView.allComponent" class="w-full text-xl h-full flex justify-center items-center">
    <span>
      <i class="fas fa-spinner fa-pulse text-4xl"></i>
    </span>
  </div>
  <!-- loading view -->
</template>

<script>
import ImagePreview from "@/components/user-profile/ImagePreview.vue";
import UserSetting from "@/components/user-profile/UserSetting.vue";
import Alamat from "@/components/user-profile/Alamat.vue";

export default {
  components: {
    ImagePreview,
    UserSetting,
    Alamat
  },

  mounted() {
    /* RESET SHOW FOR COMPONENT PROFILEVIEW */
    this.$global.showUserProfileView.allComponent = false;
    /* RESET SHOW FOR COMPONENT PROFILEVIEW */
  },

  watch: {
    '$global.showUserProfileView': {
      handler(value) {
        if(value.userSetting && value.alamat) {
          this.$global.showUserProfileView.allComponent = true;
        }
      },
      deep: true
    },
  }
}
</script>