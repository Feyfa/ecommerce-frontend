<template>
    <div class="setting-card w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded">
        <!-- title -->
        <div class="setting-card-header relative">
            <h3 class="text-xl text-center">Company Setting</h3>
        </div>
        <!-- title -->

        <!-- input -->
        <div class="mt-5">
            <div class="grid grid-cols-1 md:grid-cols-3 items-start gap-y-4 gap-x-4 lg:gap-x-6">
                <div class="input-container flex flex-col w-full">
                    <label
                        for="name">
                        Name
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="name" 
                        id="name" 
                        type="text" 
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
                        required
                        aria-required="true"
                        v-model="name"
                        :class="{'is-error-field border border-red-500': errors.name}"
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
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="email" 
                        id="email" 
                        type="text" 
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
                        required
                        aria-required="true"
                        v-model="email"
                        :class="{'is-error-field border border-red-500': errors.email}"
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
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input 
                        placeholder="phone" 
                        type="text" 
                        id="phone"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        v-model="phone"
                        @keypress="validatePhone"
                        :class="{'is-error-field border border-red-500': errors.phone}"
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
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <textarea 
                        id="alamat"
                        :rows="rows.alamat"
                        placeholder="Alamat"
                        class="border w-full border-neutral-500 rounded outline-none py-1 px-2.5 shadow"
                        required
                        aria-required="true"
                        v-model="alamat"
                        :class="{'is-error-field border border-red-500': errors.alamat}"
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
                        v-model="description">
                    </textarea>
                </div>    
            </div>

        </div>
        <!-- input -->

        <!-- action -->
        <div class="setting-action">
            <button
                type="button"
                class="setting-primary-button"
                :disabled="isProcessUpdate"
                :class="{'is-invalid': errors.name || errors.email || errors.phone || errors.alamat, 'opacity-50': isProcessUpdate}"
                @click="updateInput">
                Simpan
            </button>
        </div>
        <!-- action -->

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
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('company');
                    this.$router.push('/login');
                });
        },

        updateInput() {
            /* VALIDATION */
            this.watchInputName();
            this.watchInputEmail();
            this.watchInputPhone();
            this.watchInputAlamat();

            if(this.errors.name || this.errors.email || this.errors.phone || this.errors.alamat) {
                return;
            }
            /* VALIDATION */

            if(!this.isProcessUpdate) {
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

<style scoped>
.setting-card {
    border-color: #e5e7eb !important;
    border-radius: 8px;
    background: #ffffff !important;
    padding: 20px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

.setting-card-header {
    border-bottom: 1px solid #eef2f7;
    padding-bottom: 14px;
}

.setting-card-header h3 {
    color: #111827;
    font-size: 20px;
    font-weight: 600;
    text-align: left;
}

.setting-action {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.required-mark {
    color: #ef4444;
    font-weight: 700;
}

.setting-primary-button {
    min-height: 40px;
    min-width: 116px;
    border-radius: 7px;
    border: 1px solid transparent;
    font-weight: 700;
    padding: 0 16px;
    transition: 150ms ease-in-out;
}

.setting-primary-button {
    border-color: #7c3aed;
    background: #8b5cf6;
    color: #ffffff;
}

.setting-primary-button:not(:disabled):hover {
    background: #7c3aed;
}

.setting-primary-button.is-invalid {
    cursor: not-allowed;
    opacity: 0.55;
}

.input-container input.is-error-field,
.input-container textarea.is-error-field,
.input-container input.is-error-field:focus,
.input-container textarea.is-error-field:focus {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 2px #fee2e2, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

</style>
