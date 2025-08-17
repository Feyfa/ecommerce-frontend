<template>
    <div class="absolute inset-0 flex flex-col justify-end gap-2">
        <div 
            class="overflow-hidden rounded-lg w-full transition-all duration-100 ease-in-out flex flex-col justify-end gap-1 text-xs"
            :class="{'h-0': !this.$global.isClickDropdown.userSetting, 'border border-neutral-300 shadow': this.$global.isClickDropdown.userSetting}"
            @click="closeDropdownSetting">
            <div class="w-full pb-1 border-b border-b-neutral-300 relative">
                <div class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer h-10 px-1.5 relative" @click="switchAccountType" @click.stop>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-toggles" viewBox="0 0 16 16">
                        <path d="M4.5 9a3.5 3.5 0 1 0 0 7h7a3.5 3.5 0 1 0 0-7zm7 6a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m-7-14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m2.45 0A3.5 3.5 0 0 1 8 3.5 3.5 3.5 0 0 1 6.95 6h4.55a2.5 2.5 0 0 0 0-5zM4.5 0h7a3.5 3.5 0 1 1 0 7h-7a3.5 3.5 0 1 1 0-7"/>
                    </svg>
                    <h3>Switch To {{ this.$store.getters.user.account_type == 'buyer' ? 'Seller' : 'Buyer' }}</h3>
                </div>
                <router-link 
                    v-if="this.$store.getters.user.account_type == 'buyer'"
                    to="/buyer/bayar" 
                    class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer h-10 px-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-credit-card-2-front" viewBox="0 0 16 16">
                        <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                        <path d="M2 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/>
                    </svg>
                    <h3>Bayar</h3>
                </router-link>
                <router-link 
                    to="/saldo" 
                    class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer h-10 px-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-cash" viewBox="0 0 16 16">
                        <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                        <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2z"/>
                    </svg>
                    <h3>Saldo</h3>
                </router-link>
                <router-link 
                    to="/rekening" 
                    class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer h-10 px-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-wallet ml-[1px]" viewBox="0 0 16 16">
                        <path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a2 2 0 0 1-1-.268M1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1"/>
                    </svg>
                    <h3 class="ml-[1px]">Rekening</h3>
                </router-link>
                <router-link 
                    v-if="this.$store.getters.user.account_type == 'buyer'"
                    to="/buyer/user" 
                    class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer h-10 px-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    </svg>
                    <h3>User Profile</h3>
                </router-link>
                <router-link 
                    v-if="this.$store.getters.user.account_type == 'seller'" 
                    to="/seller/company" 
                    class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer h-10 px-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" class="bi bi-building" viewBox="0 0 16 16">
                        <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/>
                        <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z"/>
                    </svg>
                    <h3>Company Profile</h3>
                </router-link>
                <div class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer h-10 px-1.5" @click="showModalChangePassword">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-key" viewBox="0 0 16 16">
                        <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"/>
                        <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                    </svg>
                    <h3>Change Password</h3>
                </div>
            </div>

            <div class="w-full">
                <div class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer h-10 px-1.5" @click="logoutSubmit">
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
                <h3>{{ this.$store.getters.user.name }}</h3>
            </div>
        </div>
    </div>
</template>

<script>
import { ElNotification } from 'element-plus';


export default {
    methods: {
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

        showModalChangePassword() {
            this.$global.isSidebarOpen = false;
            this.$global.modals.changePassword = true;
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