<template>
    <div class="absolute inset-0 flex flex-col justify-end gap-2">
        <div 
            class="overflow-hidden rounded-lg w-full transition-all duration-100 ease-in-out flex flex-col justify-end gap-1 text-xs"
            :class="{'h-0': !this.$global.isCLickDropdown.userSetting, 'border border-neutral-300 shadow h-[7.8rem]': this.$global.isCLickDropdown.userSetting}"
            @click="closeDropdownSetting">
            <div class="w-full pb-1 border-b border-b-neutral-300">
                <router-link 
                    to="/user" 
                    class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer py-2 px-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    </svg>
                    <h3>User</h3>
                </router-link>
                <div class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer py-2 px-1.5" @click="showModalChangePassword">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-key" viewBox="0 0 16 16">
                        <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"/>
                        <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                    </svg>
                    <h3>Change Password</h3>
                </div>
            </div>

            <div class="w-full">
                <div class="flex items-center gap-4 hover:bg-neutral-200 cursor-pointer py-2 px-1.5" @click="logoutSubmit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-box-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
                        <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                    </svg>
                    <h3>Logout</h3>
                </div>
            </div>
        </div>

        <div 
            class="w-full rounded-lg flex gap-1 p-1 justify-start cursor-pointer mb-1 hover:bg-neutral-200 hover:shadow" 
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

export default {
    methods: {
        closeDropdownSetting() {
            if(this.$global.isCLickDropdown.userSetting) 
                this.$global.isCLickDropdown.userSetting = false;
        },

        showDropdownUserSetting() {
            this.$global.isCLickDropdown.userSetting = !this.$global.isCLickDropdown.userSetting;
        },

        showModalChangePassword() {
            this.$global.isSidebarOpen = false;
            this.$global.modals.changePassword = true;
        },  

        logoutSubmit() {
            this.$store.dispatch('logoutSubmit')
                       .then(response => {
                          // console.log(response);

                          if(response.data.status == 200) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');

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