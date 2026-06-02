<template>
    <div class="absolute inset-0 flex flex-col justify-end gap-2">
        <div
            class="overflow-hidden rounded-lg w-full transition-all duration-100 ease-in-out flex flex-col justify-end gap-1 text-xs bg-white"
            :class="{'h-0': !this.$global.isClickDropdown.userSetting, 'border border-neutral-200 shadow-lg': this.$global.isClickDropdown.userSetting}"
            @click="closeDropdownSetting">
            <div class="w-full pb-1 border-b border-b-neutral-200 relative p-1">
                <div class="flex items-center gap-4 hover:bg-violet-50 hover:text-violet-600 cursor-pointer h-10 px-2 rounded-md relative transition-colors" @click="switchAccountType" @click.stop>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-toggles" viewBox="0 0 16 16">
                        <path d="M4.5 9a3.5 3.5 0 1 0 0 7h7a3.5 3.5 0 1 0 0-7zm7 6a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m-7-14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m2.45 0A3.5 3.5 0 0 1 8 3.5 3.5 3.5 0 0 1 6.95 6h4.55a2.5 2.5 0 0 0 0-5zM4.5 0h7a3.5 3.5 0 1 1 0 7h-7a3.5 3.5 0 1 1 0-7"/>
                    </svg>
                    <h3>Switch To {{ accountType == 'buyer' ? 'Seller' : 'Buyer' }}</h3>
                </div>
                <router-link
                    v-if="accountType == 'buyer'"
                    to="/buyer/bayar"
                    class="flex items-center gap-4 hover:bg-violet-50 hover:text-violet-600 cursor-pointer h-10 px-2 rounded-md transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-credit-card-2-front" viewBox="0 0 16 16">
                        <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                        <path d="M2 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/>
                    </svg>
                    <h3>Bayar</h3>
                </router-link>
                <router-link
                    to="/account"
                    class="flex items-center gap-4 cursor-pointer h-10 px-2 rounded-md transition-colors"
                    :class="{
                        'bg-violet-100 text-violet-600': isAccountActive(),
                        'hover:bg-violet-50 hover:text-violet-600': !isAccountActive()
                    }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    </svg>
                    <h3>Akun Saya</h3>
                </router-link>
            </div>

            <div class="w-full p-1">
                <div class="flex items-center gap-4 hover:bg-red-50 hover:text-red-600 cursor-pointer h-10 px-2 rounded-md transition-colors" @click="logoutSubmit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-box-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
                        <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                    </svg>
                    <h3>Logout</h3>
                </div>
            </div>
        </div>

        <div
            class="rounded-lg flex gap-1 p-1 justify-start cursor-pointer mb-1 hover:bg-neutral-200 hover:shadow"
            @click="showDropdownUserSetting"
            @click.stop>
            <div class="flex justify-center items-center">
                <div class="h-10 w-10 rounded-full bg-cover bg-no-repeat bg-center shadow-xl" :style="{ backgroundImage: `url(${this.$global.personImage})` }"></div>
            </div>

            <div class="text-xs flex items-center justify-start">
                <h3>{{ userName }}</h3>
            </div>
        </div>
    </div>
</template>

<script>
import { ElNotification } from 'element-plus';


export default {
    computed: {
        accountType() {
            return this.$store.getters.user?.account_type;
        },

        userName() {
            return this.$store.getters.user?.name || '';
        }
    },

    methods: {
        isAccountActive() {
            return ['account', 'saldo', 'rekening', 'buyer_user', 'seller_company'].includes(this.$route.name);
        },

        switchAccountType() {
            this.closeDropdownSetting();

            this.$global.globalTemplate.loading = true;
            this
            .$store
            .dispatch('switchAccountType')
            .then(async response => {
                // console.log(response);

                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('company', JSON.stringify(response.company));
                this.$store.dispatch('fetchUserFromLocalStorage');
                this.$store.dispatch('fetchCompanyFromLocalStorage');

                if(response.user.account_type == 'buyer') {
                    await this.$router.push({name: 'buyer_home'});
                } else {
                    await this.$router.push({name: 'seller_dashboard'});
                }

                this.$global.globalTemplate.loading = false;
                ElNotification({ type: 'success', title: 'Success', message: response.message });
            })
            .catch(error => {
                console.log(error);
                this.$global.globalTemplate.loading = false;
                ElNotification({ type: 'error', title: 'Error', message: error?.response?.data?.message ?? "Something Wrong" });
            });
        },

        closeDropdownSetting() {
            if(this.$global.isClickDropdown.userSetting)
                this.$global.isClickDropdown.userSetting = false;
        },

        showDropdownUserSetting() {
            this.$global.isClickDropdown.userSetting = !this.$global.isClickDropdown.userSetting;
        },

        logoutSubmit() {
            this
            .$store
            .dispatch('logoutSubmit')
            .then(response => {
                // console.log(response);

                if(response.data.status == 200) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('company');

                    this.$store.dispatch('fetchTokenFromLocalStorage');
                    this.$store.dispatch('fetchUserFromLocalStorage');
                    this.$store.dispatch('fetchCompanyFromLocalStorage');

                    this.$global.isAuth = false;
                    this.$global.personImage = '/img/person.png';
                    this.$global.companyImage = '/img/company.png';
                    this.$global.isClickDropdown.userSetting = false;

                    this.$router.push('/login');
                }
            })
            .catch(error => {
                console.error(error);
            });
        }
    }
}

</script>
