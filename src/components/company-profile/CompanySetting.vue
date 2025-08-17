<template>
    <div class="w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded">
        <!-- title -->
        <div class="relative">
            <h3 class="text-xl text-center">Company Setting</h3>
            <span v-if="isProcessUpdate" class="absolute top-0 bottom-0 end-0 flex justify-center items-center">
                <i class="fa-solid fa-spinner fa-spin-pulse "></i>
            </span>
        </div>
        <!-- title -->

        <!-- input -->
        <div class="mt-5">
            <div class="grid grid-cols-1 md:grid-cols-3 items-start gap-y-4 gap-x-4 lg:gap-x-6">
                <div class="input-container flex flex-col w-full">
                    <label
                        for="name">
                        Name
                    </label>
                    <input
                        placeholder="name" 
                        id="name" 
                        type="text" 
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
                        v-model="name"
                        :disabled="!isEdit"
                        :class="{'input-disabled': !isEdit, 'border border-red-500': errors.name}"
                        @input="watchInputName">
                    <small 
                        v-if="errors.name"
                        class="text-red-500">
                        {{ errors.name }}
                    </small>
                </div>

                <div class="input-container flex flex-col w-full">
                    <label 
                        for="email">
                        email
                    </label>
                    <input
                        placeholder="email" 
                        id="email" 
                        type="text" 
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
                        v-model="email"
                        :disabled="!isEdit"
                        :class="{'input-disabled': !isEdit, 'border border-red-500': errors.email}"
                        @input="watchInputEmail">
                    <small 
                        v-if="errors.email"
                        class="text-red-500">
                        {{ errors.email }}
                    </small>
                </div>

                <div class="input-container flex flex-col w-full">
                    <label 
                        for="phone">
                        Phone
                    </label>
                    <input 
                        placeholder="phone" 
                        type="text" 
                        id="phone"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        v-model="phone"
                        @keypress="validatePhone"
                        :disabled="!isEdit"
                        :class="{'input-disabled': !isEdit, 'border border-red-500': errors.phone}"
                        @input="watchInputPhone">
                    <small 
                        v-if="errors.phone"
                        class="text-red-500">
                        {{ errors.phone }}
                    </small>
                </div>
            </div>

            <div class="mt-4 grid grid-cols-1 items-start gap-y-4">
                <div class="input-container flex flex-col w-full">
                    <label 
                        for="alamat">
                        Alamat
                    </label>
                    <textarea 
                        id="alamat"
                        :rows="rows.alamat"
                        placeholder="Alamat"
                        class="border w-full border-neutral-500 rounded outline-none py-1 px-2.5 shadow"
                        v-model="alamat"
                        :disabled="!isEdit"
                        :class="{'input-disabled': !isEdit, 'border border-red-500': errors.alamat}"
                        @input="watchInputAlamat">
                    </textarea>
                    <small 
                        v-if="errors.alamat"
                        class="text-red-500">
                        {{ errors.alamat }}
                    </small>
                </div>

                <div class="input-container flex flex-col w-full">
                    <label 
                        for="description">
                        Deskripsi
                    </label>
                    <textarea 
                        id="description"
                        :rows="rows.description"
                        placeholder="Deskripsi"
                        class="border w-full border-neutral-500 rounded outline-none py-1 px-2.5 shadow"
                        v-model="description"
                        :disabled="!isEdit"
                        :class="{'input-disabled': !isEdit}">
                    </textarea>
                </div>    
            </div>

        </div>
        <!-- input -->

        <!-- icon -->
        <div class="mt-5 flex justify-end items-center gap-5">
            <svg 
                v-if="isEdit"
                class="w-5 cursor-pointer" 
                :class="{'opacity-50': isProcessUpdate}"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1024 1024" 
                @click="cancelInput">
                <path fill="currentColor" d="m466.752 512-90.496-90.496a32 32 0 0 1 45.248-45.248L512 466.752l90.496-90.496a32 32 0 1 1 45.248 45.248L557.248 512l90.496 90.496a32 32 0 1 1-45.248 45.248L512 557.248l-90.496 90.496a32 32 0 0 1-45.248-45.248z"></path><path fill="currentColor" d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"></path>
            </svg>

            <svg 
                v-if="isEdit"
                class="w-5 cursor-pointer" 
                :class="{'opacity-50': isProcessUpdate || errors.name || errors.email || errors.phone}"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1024 1024" 
                @click="updateInput">
                <path fill="currentColor" d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"></path>
                <path fill="currentColor" d="M745.344 361.344a32 32 0 0 1 45.312 45.312l-288 288a32 32 0 0 1-45.312 0l-160-160a32 32 0 1 1 45.312-45.312L480 626.752l265.344-265.408z"></path>
            </svg>

            <svg 
                v-if="!isEdit"
                class="w-5 cursor-pointer" 
                :class="{'opacity-50': isProcessUpdate}"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1024 1024" 
                @click="editInput">
                <path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"></path>
                <path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path>
            </svg>
        </div>
        <!-- icon -->

    </div>
</template>

<script>
import { ElNotification } from 'element-plus';

export default {
    data() {
        return {
            name: '',
            email: '',
            phone: '081388992799',
            alamat: '',
            description: '',

            isEdit: false,
            isProcessUpdate: false,

            errors: {
                name: '',
                email: '',
                phone: '',
                alamat: ''
            },

            rows: {
                alamat: 3,
                description: 3,
            }
        }
    },

    mounted() {
        this.getCompany();
        this.setRowsTextAreaBasedOnScreenSize();
        window.addEventListener('resize', this.setRowsTextAreaBasedOnScreenSize);
    },

    beforeUnmount() {
        window.removeEventListener('resize', this.setRowsTextAreaBasedOnScreenSize);
    },

    methods: {
        setRowsTextAreaBasedOnScreenSize() {
            if(window.innerWidth < 500) {
                this.rows.alamat = 4;
                this.rows.description = 4;
            } else if(window.innerWidth < 600) {
                this.rows.description = 3;
                this.rows.alamat = 3;
            } else {
                this.rows.alamat = 3;
                this.rows.description = 3;
            }
        },

        editInput() {
            this.isEdit = true;
        },

        cancelInput() {
            if(!this.isProcessUpdate) {
                this.isEdit = false;
                this.getCompany();
                this.clearErrors();
            }
        },

        getCompany() {
            this.$global.showCompanyProfileView.companySetting = false;
            this.$store
                .dispatch('getCompany')
                .then(response => {
                    localStorage.setItem('company', JSON.stringify(response.company));
                    
                    this.name = response.company.name;
                    this.email = response.company.email;
                    this.phone = response.company.phone;
                    this.description = response.company.description;    
                    this.alamat = response.company.alamat;
                    
                    this.$global.showCompanyProfileView.companySetting = true;
                })
                .catch(error => {
                    localStorage.clear('token');
                    localStorage.clear('user');
                    localStorage.clear('company');
                    this.$router.push('/login');
                });
        },

        updateInput() {
            /* VALIDATION */
            if(
                !this.name || !this.email || !this.phone || !this.alamat ||
                this.name.trim() === '' || this.email.trim() === '' || this.phone.trim() === '' || this.alamat.trim() === ''
            ) {
                this.watchInputName();
                this.watchInputEmail();
                this.watchInputPhone();
                this.watchInputAlamat();
                return;
            }
            /* VALIDATION */

            if(!this.isProcessUpdate && !this.errors.name && !this.errors.email && !this.errors.phone) {
                this.isProcessUpdate = true;
        
                this
                .$store
                .dispatch('updateCompany', {
                    name: this.name,
                    email: this.email,
                    phone: this.phone,
                    description: this.description,
                    alamat: this.alamat,
                })
                .then(response => {
                    // console.log(response);
            
                    this.isEdit = false;
                    this.isProcessUpdate = false;
            
                    if(response.status == 'success') {
                        ElNotification({ type: 'success', title: 'Success', message: response.message });
            
                        localStorage.setItem('company', JSON.stringify(response.company));
            
                        /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
                        this.$store.dispatch('fetchTokenFromLocalStorage');
                        this.$store.dispatch('fetchUserFromLocalStorage');
                        this.$store.dispatch('fetchCompanyFromLocalStorage');
                        /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
                    }
        
                })
                .catch(error => {
                    // console.error(error);

                    this.isProcessUpdate = false;
            
                    if(error.response.status == 422) {
                        const message = error.response.data.message;
                        
                        Object.keys(message).forEach(key => {
                            switch(key) {
                                case 'name' : 
                                    setTimeout(() => { ElNotification({ type: 'error', title: 'Error', message: message[key][0]  }) }, 1);
                                    this.errors.name = message[key][0];
                                    break;
                                case 'email' : 
                                    setTimeout(() => { ElNotification({ type: 'error', title: 'Error', message: message[key][0]  }) }, 1);
                                    this.errors.email = message[key][0];
                                    break;
                                case 'phone' : 
                                    setTimeout(() => { ElNotification({ type: 'error', title: 'Error', message: message[key][0]  }) }, 1);
                                    this.errors.phone = message[key][0];
                                    break;
                                case 'alamat' : 
                                    setTimeout(() => { ElNotification({ type: 'error', title: 'Error', message: message[key][0]  }) }, 1);
                                    this.errors.alamat = message[key][0];
                                    break;
                            }
                        });
                    }
                })
        
            }
        },

        watchInputName() {
            if(!this.name || this.name.trim() === '') {
                this.errors.name = 'name is required';
            } else {
                this.errors.name = '';
            }
        },

        watchInputEmail() {
            if(!this.email || this.email.trim() === '') {
                this.errors.email = 'email is required';
            } else {
                this.errors.email = '';
            }
        },

        watchInputPhone() {
            if(!this.phone || this.phone.trim() === '') {
                this.errors.phone = 'phone is required';
            } else {
                this.errors.phone = '';
            }
        },

        watchInputAlamat() {
            if(!this.alamat || this.alamat.trim() === '') {
                this.errors.alamat = 'alamat is required';
            } else {
                this.errors.alamat = '';
            }
        }
    }
}
</script>