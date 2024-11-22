<template>
    <ModalBase v-if="show">
        <form class="text-xl font-normal border border-neutral-500 rounded w-[95%] sm500:w-[90%] sm:w-[65%] md:w-[55%] lg:w-[45%] xl:w-[35%] 2xl:w-[25%] p-3 shadow-2xl bg-white" @click.stop>
            <h1 class="text-center text-3xl">Change Password</h1>

            <div class="row flex flex-col gap-1 mt-3">
                <label for="oldpassword">Old Password</label>
                <div class="relative">
                    <input 
                        v-model="oldPassword"
                        :type="isShowOldPassword ? 'text' : 'password'" 
                        required    
                        type="password" 
                        autocomplete="off"
                        id="password"
                        class="w-full border border-neutral-500 h-12 pl-2.5 pr-11 outline-none rounded shadow"
                        :class="{'border-red-500': errors.oldPassword}"
                        @input="watchInput('oldpassword')">
                    <span class="absolute right-2.5 top-3 end-3">
                        <svg 
                            v-if="!isShowOldPassword"
                            @click="isShowOldPassword = true"
                            xmlns="http://www.w3.org/2000/svg" 
                            width="25" 
                            height="25" 
                            fill="currentColor" 
                            class="bi bi-eye cursor-pointer" 
                            viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                        <svg 
                            v-if="isShowOldPassword"
                            @click="isShowOldPassword = false"
                            xmlns="http://www.w3.org/2000/svg" 
                            width="25" 
                            height="25" 
                            fill="currentColor" 
                            class="bi bi-eye-slash cursor-pointer" 
                            viewBox="0 0 16 16">
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                            </svg>
                    </span>
                </div>
                <small v-if="errors.oldPassword" class="text-xs text-red-500">{{ errors.oldPassword }}</small>
            </div>

            <div class="row flex flex-col gap-1 mt-3">
                <label for="newpassword">New Password</label>
                <div class="relative">
                    <input 
                        v-model="newPassword"
                        :type="isShowNewPassword ? 'text' : 'password'" 
                        required    
                        type="password" 
                        autocomplete="off"
                        id="newpassword"
                        class="w-full border border-neutral-500 h-12 pl-2.5 pr-11 outline-none rounded shadow"
                        :class="{'border-red-500': errors.newPassword}"
                        @input="watchInput('newpassword')">
                    <span class="absolute right-2.5 top-3 end-3">
                        <svg 
                            v-if="!isShowNewPassword"
                            @click="isShowNewPassword = true"
                            xmlns="http://www.w3.org/2000/svg" 
                            width="25" 
                            height="25" 
                            fill="currentColor" 
                            class="bi bi-eye cursor-pointer" 
                            viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                        <svg 
                            v-if="isShowNewPassword"
                            @click="isShowNewPassword = false"
                            xmlns="http://www.w3.org/2000/svg" 
                            width="25" 
                            height="25" 
                            fill="currentColor" 
                            class="bi bi-eye-slash cursor-pointer" 
                            viewBox="0 0 16 16">
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                            </svg>
                    </span>
                </div>
                <small v-if="errors.newPassword" class="text-xs text-red-500">{{ errors.newPassword }}</small>
            </div>

            <button 
                type="button" 
                class="w-full h-12 border border-neutral-300 rounded shadow bg-blue-500 mt-4"
                :class="isProcessChangePassword ? 'opacity-85' : 'hover:bg-[#428bff]'"
                :disabled="isProcessChangePassword"
                @click="chagePassword">
                Change
                <i v-if="isProcessChangePassword" class="ml-1 fas fa-spinner fa-pulse"></i>
            </button>
 
        </form>
    </ModalBase>
</template>

<script>
import Swal from 'sweetalert2';
import ModalBase from './ModalBase.vue';
import { ElNotification } from 'element-plus';

export default {
    props: {
        show: {
            type: Boolean,
            required: true
        },
    }, 

    components: {
        ModalBase
    },

    data() {
        return {
            oldPassword: '',
            newPassword: '',

            isShowOldPassword: false,
            isShowNewPassword: false,
            isProcessChangePassword: false,

            errors: {
                oldPassword: '',
                newPassword: ''
            }
        }
    },

    methods: {
        closeModal() {
            this.isShowOldPassword = false;
            this.isShowNewPassword = false;
            this.$global.modals.changePassword = false
        },
        
        watchInput(type) {
            if(type == 'oldpassword') {
                if(this.oldPassword.trim().length > 0) 
                    this.errors.oldPassword = '';
                else 
                    this.errors.oldPassword = 'old password required';
            }
            else if(type == 'newpassword') {
                if(this.newPassword.trim().length > 0) 
                    this.errors.newPassword = '';
                else 
                    this.errors.newPassword = 'new password required';
            }
        },

        chagePassword() {
            /* VALIDATION */
            if(this.oldPassword.trim().length <= 0) 
                this.errors.oldPassword = 'old password required';
            if(this.newPassword.trim().length <= 0) 
                this.errors.newPassword = 'new password required';
            if(this.oldPassword.trim().length <= 0 || this.newPassword.trim().length <= 0)
                return false;
            /* VALIDATION */

            this.isProcessChangePassword = true;

            this.$store.dispatch('changePassword', {
                id: this.$store.getters.user.id,
                oldPassword: this.oldPassword,
                newPassword: this.newPassword,
            })
            .then(response => {
                this.isProcessChangePassword = false;

                if(response.data.result == 'success') {
                    ElNotification({ type: 'success', title: 'Success', message: response.data.message });
                    this.closeModal();
                }
            })
            .catch(error => {
                this.isProcessChangePassword = false;
                
                if(error.response.data.result == 'error' && error.response.data.error_type == 'old_password_invalid') {
                    ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
                } else {
                    Object.keys(message).forEach(key => {
                        ElNotification({ type: 'error', title: 'Error', message: message[key][0] });
                    })
                }
            });
        }
    },

    watch: {
        show(newValue) {
            if(!newValue) {
                this.oldPassword = '';
                this.newPassword =  '';

                this.errors.oldPassword = '';
                this.errors.newPassword = '';
            }
        }
    }
}
</script>