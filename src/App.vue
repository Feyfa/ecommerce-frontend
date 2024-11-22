<template>
  <div @click="globalCLick">
    <!-- SIDEBAR AND MAIN COMPONENT -->
    <NavbarComponent v-if="showNavbarSidebar()" />
  
    <div class="w-screen h-screen overflow-hidden flex relative lg:static">
      
      <SidebarComponent v-if="showNavbarSidebar()" />

      <div 
        class="h-screen bg-[rgba(255,255,255,.5)]"
        :class="{
          'w-full overflow-y-auto pt-[4.5rem]': showNavbarSidebar(), 
          'w-full': !showNavbarSidebar(),
        }"
        ref="globalContainer"
        @scroll="scrollGlobal">
        
        <RouterView />
        
        <div v-show="this.$global.globalContainer.loading" class="w-full pt-4 h-[5rem] flex justify-center">
          <span>
            <i class="fas fa-spinner fa-pulse text-2xl"></i>
          </span>
        </div>
      </div>

    </div>
    <!-- SIDEBAR AND MAIN COMPONENT -->

    <!-- FIXED COMPONENTS -->
    <ModalCollection />
    <!-- FIXED COMPONENTS -->
  </div>
</template>

<script>
import eventBus from "@/eventBus";
import NavbarComponent from "./components/app/NavbarComponent.vue";
import SidebarComponent from "./components/app/SidebarComponent.vue";
import ModalCollection from "./components/modals/ModalCollection.vue";

export default {
  components: {
    NavbarComponent,
    SidebarComponent,
    ModalCollection,
  },

  data() {
    return {
      snapScriptElement: null
    }
  },

  mounted() {
    // reset loading global container
    this.$global.globalContainer.loading = false;

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
    scrollGlobal() {
      this.$global.globalContainer.ref = this.$refs.globalContainer;
      eventBus.emit('scrollGlobal');
    },

    globalCLick() {
      this.closeDropdown();
      this.closeSidebar();
      this.closeFilter();
    },

    closeDropdown() {
      if(this.$global.isCLickDropdown.profile) 
        this.$global.isCLickDropdown.profile = false;
      if(this.$global.isCLickDropdown.product) 
        this.$global.isCLickDropdown.product = false;
      if(this.$global.isCLickDropdown.userSetting) 
        this.$global.isCLickDropdown.userSetting = false;
    },
    
    closeSidebar() {
      if(this.$global.isSidebarOpen) {
        this.$global.isSidebarOpen = false;
      }
    },

    closeFilter() {
      if(this.$global.isFilterOpen) {
        this.$global.isFilterOpen = false;
      }
    },

    showNavbarSidebar() {
      return this.$global.isAuth;
    }
  }

}
</script>

