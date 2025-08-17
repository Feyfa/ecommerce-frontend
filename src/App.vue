<template>
    <div @click="globalCLick">
        <!-- SIDEBAR AND MAIN COMPONENT -->
        <NavbarComponent v-if="showNavbarSidebar()" />
        
        <div v-if="this.$global.globalTemplate.loading" class="w-screen h-screen overflow-hidden flex justify-center items-center relative lg:static">
            <span>
                <i class="fas fa-spinner fa-pulse text-4xl"></i>
            </span>
        </div>
        <div v-else class="w-screen h-screen overflow-hidden flex relative lg:static">
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

                <!-- untuk loadign di product dan belanja -->
                <div v-show="this.$global.globalContainer.loading" class="w-full pt-4 h-[5rem] flex justify-center">
                    <span>
                        <i class="fas fa-spinner fa-pulse text-2xl"></i>
                    </span>
                </div>
                <!-- untuk loadign di product dan belanja -->
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

    mounted() {
        // reset loading global container
        this.$global.globalContainer.loading = false;
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
            if(this.$global.isClickDropdown.profile) 
                this.$global.isClickDropdown.profile = false;
            if(this.$global.isClickDropdown.company) 
                this.$global.isClickDropdown.company = false;
            if(this.$global.isClickDropdown.product) 
                this.$global.isClickDropdown.product = false;
            if(this.$global.isClickDropdown.userSetting) 
                this.$global.isClickDropdown.userSetting = false;
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

