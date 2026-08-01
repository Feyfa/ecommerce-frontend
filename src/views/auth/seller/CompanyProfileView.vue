<template>
    <div
        class="w-full flex flex-col justify-center mb-8"
        :class="embedded ? 'px-0' : 'px-5 lg:px-10'"
        v-show="this.$global.showCompanyProfileView.allComponent"
    >
        <!-- image setting -->
        <div class="row w-full flex justify-center">
            <ImagePreview :src="this.$global.companyImage" alt="User" />
        </div>
        <!-- image setting -->

        <!-- company setting -->
        <div id="company-setting" class="mt-10">
            <CompanySetting />
        </div>
        <!-- company setting -->
    </div>

    <!-- loading view -->
    <div
        v-show="!this.$global.showCompanyProfileView.allComponent"
        class="w-full text-xl h-full flex justify-center items-center"
    >
        <span>
            <i class="fas fa-spinner fa-pulse text-4xl"></i>
        </span>
    </div>
    <!-- loading view -->
</template>

<script>
import ImagePreview from '@/components/company-profile/ImagePreview.vue';
import CompanySetting from '@/components/company-profile/CompanySetting.vue';

export default {
    components: {
        ImagePreview,
        CompanySetting,
    },

    props: {
        embedded: {
            type: Boolean,
            default: false,
        },
    },

    /**
     * Menginisialisasi behavior komponen yang bergantung pada browser setelah mounted untuk halaman company profile.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    mounted() {
        /* RESET TAMPILAN KOMPONEN PROFILE VIEW */
        this.$global.showCompanyProfileView.allComponent = false;
        /* RESET TAMPILAN KOMPONEN PROFILE VIEW */
    },

    watch: {
        '$global.showCompanyProfileView': {
            /**
             * Menyinkronkan state komponen ketika $global.show company profile view berubah untuk halaman company profile.
             *
             * @param {*} value Nilai yang diproses oleh function.
             *
             * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
             */
            handler(value) {
                if (value.companySetting) {
                    this.$global.showCompanyProfileView.allComponent = true;
                }
            },
            deep: true,
        },
    },
};
</script>
