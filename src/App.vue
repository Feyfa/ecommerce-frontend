<template>
  <div @click="globalCLick">
    <NavbarComponent v-if="showNavbarSidebar()" />
  
    <div 
      class="w-screen h-screen flex">
      <SidebarComponent 
        v-if="this.$route.path !== '/register' && this.$route.path !== '/login'" />
      
      <div 
        class="h-screen bg-[rgba(255,255,255,.5)]"
        :class="{
          'w-[85%] overflow-y-auto pt-[4.5rem]': showNavbarSidebar(), 
          'w-full': !showNavbarSidebar()
        }">
        
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script>
import NavbarComponent from "./components/app/NavbarComponent.vue";
import SidebarComponent from "./components/app/SidebarComponent.vue";

export default {
  components: {
    NavbarComponent,
    SidebarComponent
  },

  methods: {
    globalCLick() {
      this.closeDropdown();
    },

    closeDropdown() {
      if(this.$global.isCLickDropdown.profile) 
        this.$global.isCLickDropdown.profile = false;
      if(this.$global.isCLickDropdown.product) 
        this.$global.isCLickDropdown.product = false;
    },

    showNavbarSidebar() {
      return !['/register', '/login'].includes(this.$route.path);
    }
  }

}
</script>

