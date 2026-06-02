<template>
    <div class="flex flex-col">
        <div
            v-if="this.$global.isClickDropdown.userSetting"
            class="mb-3 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
            @click="closeDropdownSetting">
            <div class="p-1.5">
                <button
                    type="button"
                    class="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
                    @click="switchAccountType"
                    @click.stop>
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-white group-hover:text-violet-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.5 9a3.5 3.5 0 1 0 0 7h7a3.5 3.5 0 1 0 0-7zm7 6a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m-7-14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m2.45 0A3.5 3.5 0 0 1 8 3.5 3.5 3.5 0 0 1 6.95 6h4.55a2.5 2.5 0 0 0 0-5zM4.5 0h7a3.5 3.5 0 1 1 0 7h-7a3.5 3.5 0 1 1 0-7"/>
                        </svg>
                    </span>
                    <span class="truncate">Switch To {{ accountType == 'buyer' ? 'Seller' : 'Buyer' }}</span>
                </button>

                <router-link
                    v-if="accountType == 'buyer'"
                    to="/buyer/bayar"
                    class="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-violet-50 hover:text-violet-700">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-white group-hover:text-violet-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                            <path d="M2 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/>
                        </svg>
                    </span>
                    <span class="truncate">Bayar</span>
                </router-link>

                <router-link
                    to="/account"
                    class="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors"
                    :class="{
                        'bg-violet-50 text-violet-700': isAccountActive(),
                        'text-neutral-700 hover:bg-violet-50 hover:text-violet-700': !isAccountActive()
                    }">
                    <span
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                        :class="{
                            'bg-violet-100 text-violet-700': isAccountActive(),
                            'bg-neutral-100 text-neutral-600 group-hover:bg-white group-hover:text-violet-700': !isAccountActive()
                        }">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                        </svg>
                    </span>
                    <span class="truncate">Akun Saya</span>
                </router-link>
            </div>

            <div class="border-t border-neutral-200 p-1.5">
                <button
                    type="button"
                    class="group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-red-50 hover:text-red-600"
                    @click="logoutSubmit">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-white group-hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
                            <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                        </svg>
                    </span>
                    <span class="truncate">Logout</span>
                </button>
            </div>
        </div>

        <button
            type="button"
            class="group flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-left transition-all duration-200 hover:border-violet-200 hover:bg-white hover:shadow-sm"
            @click="showDropdownUserSetting"
            @click.stop>
            <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
                <span class="h-10 w-10 bg-cover bg-center bg-no-repeat" :style="{ backgroundImage: `url(${this.$global.personImage})` }"></span>
            </span>

            <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold text-neutral-800">{{ userName }}</span>
                <span class="block text-xs capitalize text-neutral-500">{{ accountType }}</span>
            </span>

            <span class="text-neutral-400 transition-transform duration-200 group-hover:text-violet-600" :class="{'rotate-180': this.$global.isClickDropdown.userSetting}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                </svg>
            </span>
        </button>
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
