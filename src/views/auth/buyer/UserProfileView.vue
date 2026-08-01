<template>
    <div
        class="w-full flex flex-col justify-center mb-8"
        :class="embedded ? 'px-0' : 'px-5 lg:px-10'"
        v-show="this.$global.showUserProfileView.allComponent"
    >
        <!-- image setting -->
        <div class="row w-full flex justify-center">
            <ImagePreview :src="this.$global.personImage" alt="User" />
        </div>
        <!-- image setting -->

        <!-- user setting -->
        <div id="user-setting" class="mt-10">
            <UserSetting />
        </div>
        <!-- user setting -->

        <!-- alamat -->
        <div v-if="showAlamat" id="alamat" class="mt-10">
            <Alamat />
        </div>
        <!-- alamat -->
    </div>

    <!-- loading view -->
    <div
        v-show="!this.$global.showUserProfileView.allComponent"
        class="w-full text-xl h-full flex justify-center items-center"
    >
        <span>
            <i class="fas fa-spinner fa-pulse text-4xl"></i>
        </span>
    </div>
    <!-- loading view -->
</template>

<script>
import ImagePreview from '@/components/user-profile/ImagePreview.vue';
import UserSetting from '@/components/user-profile/UserSetting.vue';
import Alamat from '@/components/user-profile/Alamat.vue';

export default {
    components: {
        ImagePreview,
        UserSetting,
        Alamat,
    },

    props: {
        embedded: {
            type: Boolean,
            default: false,
        },
        showAlamat: {
            type: Boolean,
            default: true,
        },
    },

    /**
     * Menginisialisasi behavior komponen yang bergantung pada browser setelah mounted untuk halaman user profile.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    mounted() {
        /* RESET TAMPILAN KOMPONEN PROFILE VIEW */
        this.$global.showUserProfileView.allComponent = false;
        /* RESET TAMPILAN KOMPONEN PROFILE VIEW */
    },

    watch: {
        '$global.showUserProfileView': {
            /**
             * Menyinkronkan state komponen ketika $global.show user profile view berubah untuk halaman user profile.
             *
             * @param {*} value Nilai yang diproses oleh function.
             *
             * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
             */
            handler(value) {
                const alamatReady = !this.showAlamat || value.alamat;

                if (value.userSetting && alamatReady) {
                    this.$global.showUserProfileView.allComponent = true;
                }
            },
            deep: true,
        },
    },
};
</script>
