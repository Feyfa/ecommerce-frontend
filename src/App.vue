<template>
    <div @click="globalCLick">
        <!-- SIDEBAR DAN KOMPONEN UTAMA -->
        <NavbarComponent v-if="showNavbarSidebar()" />

        <div
            v-if="this.$global.globalTemplate.loading"
            class="w-screen h-screen overflow-hidden flex justify-center items-center bg-slate-50 relative lg:static"
        >
            <span>
                <i class="fas fa-spinner fa-pulse text-4xl"></i>
            </span>
        </div>
        <div v-else class="w-screen h-screen overflow-hidden flex relative lg:static">
            <SidebarComponent v-if="showNavbarSidebar()" />
            <div
                class="h-screen bg-slate-50"
                :class="{
                    'w-full overflow-y-auto pt-14': showNavbarSidebar(),
                    'w-full': !showNavbarSidebar(),
                }"
                ref="globalContainer"
                @scroll="scrollGlobal"
            >
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
        <!-- SIDEBAR DAN KOMPONEN UTAMA -->
    </div>
</template>

<script>
import { watch } from 'vue';
import { useAuth } from '@clerk/vue';
import { getClerkRuntimeState, isClerkEnabled } from '@/clerk';
import eventBus from '@/eventBus';
import global from '@/global';
import NavbarComponent from './components/app/NavbarComponent.vue';
import SidebarComponent from './components/app/SidebarComponent.vue';

export default {
    components: {
        NavbarComponent,
        SidebarComponent,
    },

    /**
     * Menginisialisasi state Composition API dan integrasi komponen utama aplikasi.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    setup() {
        // --- step 1 - start - sinkronkan sesi autentikasi utama dengan state reaktif global
        if (isClerkEnabled) {
            const { isLoaded, isSignedIn, userId } = useAuth();

            /**
             * Memproses sync clerk state untuk app.
             *
             * @returns {Object} Object sync clerk state yang telah disiapkan.
             */
            const syncClerkState = () => {
                const runtimeState = getClerkRuntimeState();

                return {
                    enabled: runtimeState.enabled,
                    loaded: Boolean(isLoaded.value),
                    isSignedIn: Boolean(isSignedIn.value),
                    userId: userId.value || runtimeState.userId || '',
                };
            };

            watch(
                [isLoaded, isSignedIn, userId],
                () => {
                    global.clerk = syncClerkState();
                },
                {
                    immediate: true,
                },
            );
        } else {
            global.clerk = {
                enabled: false,
                loaded: false,
                isSignedIn: false,
                userId: '',
            };
        }
        // --- step 1 - end - sinkronkan sesi autentikasi utama dengan state reaktif global
    },

    /**
     * Menginisialisasi behavior komponen yang bergantung pada browser setelah mounted untuk app.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    mounted() {
        // reset loading global container
        this.$global.globalContainer.loading = false;
    },

    methods: {
        /**
         * Menjalankan proses scroll global dan menyinkronkan state hasilnya untuk app.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        scrollGlobal() {
            this.$global.globalContainer.ref = this.$refs.globalContainer;
            eventBus.emit('scrollGlobal');
        },

        /**
         * Menjalankan proses global click dan menyinkronkan state hasilnya untuk app.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        globalCLick() {
            this.closeDropdown();
            this.closeSidebar();
            this.closeFilter();
        },

        /**
         * Menutup dropdown aplikasi.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        closeDropdown() {
            if (this.$global.isClickDropdown.profile) this.$global.isClickDropdown.profile = false;
            if (this.$global.isClickDropdown.company) this.$global.isClickDropdown.company = false;
            if (this.$global.isClickDropdown.product) this.$global.isClickDropdown.product = false;
            if (this.$global.isClickDropdown.userSetting) this.$global.isClickDropdown.userSetting = false;
        },

        /**
         * Menutup sidebar aplikasi.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        closeSidebar() {
            if (this.$global.isSidebarOpen) {
                this.$global.isSidebarOpen = false;
            }
        },

        /**
         * Menutup filter aplikasi.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        closeFilter() {
            if (this.$global.isFilterOpen) {
                this.$global.isFilterOpen = false;
            }
        },

        /**
         * Mengembalikan show navbar sidebar yang ditentukan modul untuk app.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi show navbar sidebar.
         */
        showNavbarSidebar() {
            return this.$global.isAuth && !this.$global.isLoggingOut;
        },
    },
};
</script>
