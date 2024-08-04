<template>
  <div @click="globalCLick">
    <NavbarComponent v-if="showNavbarSidebar()" />
  
    <div 
      class="w-screen h-screen overflow-hidden flex relative lg:static">
      <SidebarComponent 
        class="sidebar h-screen overflow-y-auto absolute lg:static lg:w-[25%] xl:w-[20%] 2xl:[w-15%] lg:p-4 lg:border-r-2 lg:border-r-neutral-300 lg:bg-white lg:pt-[4.5rem] lg:shadow-neutral-500 lg:shadow-lg transition-all ease-in-out duration-300  flex flex-col gap-5 text-lg z-40 lg:z-0"
        :class="{'w-0 overflow-hidden p-0 pt-[4.5rem] border-none shadow-none': !this.$global.isSidebarOpen, ' w-[50%] sm500:w-[40%] sm:w-[30%] md:w-[25%] p-4 border-r-2 border-r-neutral-300 bg-white pt-[4.5rem] shadow-neutral-500 shadow-lg': this.$global.isSidebarOpen}"
        v-if="this.$route.path !== '/register' && this.$route.path !== '/login'" />
      
      <div 
        class="h-screen bg-[rgba(255,255,255,.5)]"
        :class="{
          'w-full overflow-y-auto pt-[4.5rem]': showNavbarSidebar(), 
          'w-full': !showNavbarSidebar(),
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

  data() {
    return {
      snapScriptElement: null
    }
  },

  mounted() {
    // URL script Midtrans dan client key dari environment variable
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const script = document.createElement('script');
    
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);
    this.snapScriptElement = script;
  },

  beforeUnmount() {
    if (this.snapScriptElement) {
      document.body.removeChild(this.snapScriptElement);
    }
  },

  methods: {
    globalCLick() {
      this.closeDropdown();
      this.closeSidebar();
    },

    closeDropdown() {
      if(this.$global.isCLickDropdown.profile) 
        this.$global.isCLickDropdown.profile = false;
      if(this.$global.isCLickDropdown.product) 
        this.$global.isCLickDropdown.product = false;
    },
    
    closeSidebar() {
      if(this.$global.isSidebarOpen) {
        this.$global.isSidebarOpen = false;
      }
    },

    showNavbarSidebar() {
      return !['/register', '/login'].includes(this.$route.path);
    }
  }

}
</script>

