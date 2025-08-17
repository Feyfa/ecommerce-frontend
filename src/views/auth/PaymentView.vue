<template>
    <!-- payment view -->
    <div v-if="show.payment_view" class="px-4 lg:px-6 w-full flex flex-col justify-center mb-8">
        <!-- title -->
        <h1 class="text-center text-3xl font-medium flex justify-center items-center">Rekening Bank</h1>
        <!-- title -->

        <!-- form add rekening -->
        <Modal v-model:show="modal.addPayment">
            <div class="flex flex-col gap-3 p-5">
                <h1 class="text-[24px] text-center font-medium">Tambah Rekening</h1>
                <div class="input-container flex flex-col w-full">
                    <label
                        for="paymentName">
                        Nama Bank
                    </label>
                    <el-select
                        v-model="paymentName"
                        filterable
                        placeholder="Nama Bank"
                        size="large"
                        @change="paymentNameChange">
                        <el-option
                            v-for="item in paymentList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name"/>
                    </el-select>
                </div>
                <div 
                    class="input-container flex flex-col w-full"
                    v-show="paymentName && paymentName.trim() != ''">
                    <label
                        for="paymentAccount">
                        Nomor Rekening
                    </label>
                    <el-input
                        v-model="paymentAccount"
                        placeholder="Nomor Rekening"
                        class="custom-input"
                        size="large"
                        clearable>
                        <template #append>
                            <div 
                                class="border-t border-r border-b border-t-[rgb(115,115,115)] border-r-[rgb(115,115,115)] border-b-[rgb(115,115,115)] rounded-tr rounded-br w-full h-full px-2 text-[0.8rem] bg-neutral-100"
                                :class="{'opacity-50 cursor-default': isProcessValidateAccount, 'hover:bg-[#ededed]': !isProcessValidateAccount}">
                                <button 
                                    class="h-full"
                                    :disabled="isProcessValidateAccount"
                                    @click="validatePaymentAccount">Check Nama Pemilik
                                </button>
                                <i v-if="isProcessValidateAccount" class="fa-solid fa-spinner fa-spin-pulse ml-2"></i>
                            </div>
                        </template>
                    </el-input>
                    <small 
                        v-if="errors.paymentAccount"
                        class="text-red-500">
                        {{ errors.name }}
                    </small>
                </div>
                <div 
                    class="input-container flex flex-col w-full border border-[rgb(115,115,115)] shadow rounded p-2 gap-1 mt-3"
                    v-show="isPaymentAccountValid">
                    <p class="text-[0.85rem] -tracking-[0.2px]">Nama Pemilik Rekening</p>
                    <p class="uppercase tracking-[0.2px] font-medium">{{ paymentUsername }}</p>
                </div>
                    
                <div class="mt-3 flex flex-col gap-2 md:flex-row md:gap-20 lg:gap-40">
                    <button 
                        class="w-full md:w-96 border border-neutral-500 bg-red-600 py-2 px-5 rounded mt-1.5"
                        @click="closeFormAddPayment"
                        :disabled="isProcessAddPayment"
                        :class="{'opacity-50': isProcessAddPayment}">
                        Cancel
                    </button>
                    <button 
                        class="w-full md:w-96 border border-neutral-500 bg-violet-500 py-2 px-5 rounded mt-1.5"
                        @click="addPayment"
                        :disabled="isProcessAddPayment || !paymentName || !isPaymentAccountValid"
                        :class="{'opacity-50': isProcessAddPayment || !paymentName || !isPaymentAccountValid}">
                        Tambah Rekening
                        <i v-if="isProcessAddPayment" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                    </button>
                </div>
            </div>
        </Modal>
        <!-- form add rekening -->

        <!-- search and button add rekening -->
        <div class="mt-5 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div class="w-full md:w-[40%] lg:w-[35%]">
                <input
                    placeholder="Cari Rekening Bank" 
                    id="search-payment" 
                    type="text" 
                    class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                    v-model="searchPayment"
                    @keyup.enter="enterSearchPayment">   
            </div>
            <div class="md:w-[25%] lg:w-[26%]">
                <button
                    class="border border-neutral-500 bg-violet-500 w-[100%] h-12 rounded"
                    @click="openFormAddPayment"
                    :disabled="isProcessGetPaymentList"
                    :class="{'opacity-50': isProcessGetPaymentList}">
                    Tambah Rekening
                    <i v-if="isProcessGetPaymentList" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                </button>
            </div>
        </div>
        <!-- search and button add rekening -->

        <!-- list payment -->
        <div class="mt-7">
            <div v-if="isProcessGetPayment" class="text-center">
                <span class="inline-block py-10">
                    <i class="fa-solid fa-spinner fa-spin-pulse text-xl"></i>
                </span>
            </div>
            <div v-else>
                <div 
                    v-if="this.payments.length > 0" 
                    class="flex flex-col gap-5">
                    <!-- kontent -->
                    <div 
                        v-for="(payment, index) in payments"
                        class="w-full rounded-md py-3 px-3 flex flex-row justify-between items-center border border-neutral-500">
                        <div class="flex items-center gap-4 w-[80%] xl:w-[85%]">
                            <img 
                                :src="getImagePayment(payment.slug)" 
                                alt=""
                                class="w-20 h-20 rounded-md cursor-default">
                            <div class="flex flex-col gap-1">
                                <h3 class="text-neutral-500 font-normal -tracking-normal text-[.9rem]">{{ payment.name }}</h3>
                                <h3 class="font-semibold text-[.9rem]">{{ payment.account }}</h3>
                                <h3 class="uppercase text-[.9rem]">{{ payment.username }}</h3>
                            </div>
                        </div>
                        <div class="w-[20%] xl:w-[15%]">
                            <div class="flex justify-end">
                                <button 
                                    class=" text-[.7rem] border border-neutral-400 bg-neutral-200 py-1.5 w-[100%] sm500:text-[.8rem] sm:text-[.9rem] rounded" 
                                    :disabled="isProcessDeletePayment[index]"
                                    :class="{'opacity-50': isProcessDeletePayment[index]}"
                                    @click="deletePayment(payment.id, index)">
                                    Hapus
                                    <i v-if="isProcessDeletePayment[index]" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- kontent -->
                </div>
                <div 
                    v-else 
                    class="text-center mt-10">
                    <h5 class="text-[.9rem]">Rekening Kosong</h5>
                </div>
            </div>
        </div>
        <!-- list payment -->
    </div>
    <!-- payment view -->

    <!-- loading view -->
    <div v-else class="w-full text-xl h-full flex justify-center items-center">
        <span>
            <i class="fas fa-spinner fa-pulse text-4xl"></i>
        </span>
    </div>
    <!-- loading view -->
</template>

<script>
import { ElNotification, ElMessageBox } from 'element-plus';
import Modal from '@/components/partials/ModalView.vue';

export default {
    components: {
        Modal,
    },

    data() {
        return {
            APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
            SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,
            PAYMENT_IMG: 'payment-imgs',

            modal: {
                addPayment: false
            },

            errors: {
                paymentName: '',
                paymentAccount: ''
            },

            isProcessAddPayment: false,
            isProcessGetPayment: false,
            isProcessGetPaymentList: false,
            isProcessValidateAccount: false,
            isPaymentAccountValid: false,
            isProcessDeletePayment: [],

            paymentName: '',
            paymentSlug: '',
            paymentAccount: '',
            paymentUsername: '',
            paymentList: [],
            
            searchPayment: '',
            payments: [
                {
                    id: '',
                    slug: 'bca',
                    name: 'PT. BCA (BANK CENTRAL ASIA) TBK',
                    account: '310012345678',
                    username: 'Muhammad Jidan',
                },
                {
                    id: '',
                    slug: 'bni',
                    name: 'PT. BANK NEGARA INDONESIA (BNI) (PERSERO)',
                    account: '3100134565432',
                    username: 'Muhammad Jidan',
                },
                {
                    id: '',
                    slug: 'bri',
                    name: 'PT. BANK RAKYAT INDONESIA (BRI) (PERSERO)',
                    account: '3100323245656',
                    username: 'Muhammad Jidan',
                },
                {
                    id: '',
                    slug: 'mandiri',
                    name: 'PT. BANK MANDIRI / MANDIRI',
                    account: '3100777665677',
                    username: 'Muhammad Jidan',
                },
            ],

            show: {
                payment_view: false,
            }
            
        }
    },

    mounted() {
        this.getPayment();
    },

    methods: {
        deletePayment(id, index) {
            ElMessageBox
            .confirm(
                'Anda Yakin Ingin Hapus Rekening Ini?',
                'Warning',
                {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                }
            )
            .then(() => {
                this.isProcessDeletePayment[index] = true;

                this
                .$store
                .dispatch('deletePayment', {
                    id: id,
                    searchPayment: this.searchPayment
                })
                .then(response => {
                    // console.log(response);
                    this.isProcessDeletePayment[index] = false;
                    this.payments = response.payments;
                    ElNotification({ type: 'success', title: 'Success', message: response.message });
                })
                .catch(error => {
                    // console.error(error);
                    this.isProcessDeletePayment[index] = false;
                    ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
                });
            })
            
        },

        addPayment() {
            this.isProcessAddPayment = true;
            this
            .$store
            .dispatch('addPayment', {
                paymentName: this.paymentName,
                paymentSlug: this.paymentSlug,
                paymentAccount: this.paymentAccount,
                paymentUsername: this.paymentUsername,
                searchPayment: this.searchPayment
            })
            .then(response => {
                // console.log(response);
                this.isProcessAddPayment = false;
                this.modal.addPayment = false;
                this.payments = response.payments;
                ElNotification({ type: 'success', title: 'Success', message: response.message });
            })
            .catch(error => {
                // console.error(error);
                this.isProcessAddPayment = false;
                if(error.response.status == 422) {
                    const message = error.response.data.message;
                    Object.keys(message).forEach(key => {
                        setTimeout(() => {
                            ElNotification({ type: 'error', title: 'Error', message: message[key][0] });    
                        }, 100);
                    })
                } else {
                    ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
                }
            })
        },  

        validatePaymentAccount() {
            this.isProcessValidateAccount = true;
            this
            .$store
            .dispatch('validatePaymentAccount', {
                paymentAccount: this.paymentAccount,
                paymentSlug: this.paymentSlug,
            })
            .then(response => {
                // console.log(response);

                this.isProcessValidateAccount = false;
                this.isPaymentAccountValid = true;
                this.paymentUsername = response.username;
            })
            .catch(error => {
                console.error(error);
                const message = typeof(error.response.data.message) != 'undefined' ? error.response.data.message : 'Sepertinya Ada Yang Salah';
                ElNotification({ type: 'error', title: 'Error', message: message });
                this.isProcessValidateAccount = false;
            })
        },

        paymentNameChange(event) {
            const paymentFind = this.paymentList.find(item => item.name == event);
            this.paymentSlug = paymentFind ? paymentFind.slug : '';
        },

        getImagePayment(slug) {
            return `/img/${slug}.png`;
        },

        openFormAddPayment() {
            this.resetFormAddPayment();
            this.isProcessGetPaymentList = true;

            this
            .$store
            .dispatch('getPaymentList')
            .then(response => {
                // console.log(response);

                this.paymentList = response.paymentList;
                this.isProcessGetPaymentList = false;
                this.modal.addPayment = true;
            })
            .catch(error => {
                this.isProcessGetPaymentList = false;
                console.error(error);
            })
        },

        closeFormAddPayment() {
            this.modal.addPayment = false;
        },

        getPayment() {
            this.isProcessGetPayment = true;

            this
            .$store
            .dispatch('getPayment', {
                searchPayment: this.searchPayment
            })
            .then(response => {
                // console.log(response);

                this.show.payment_view = true;  
                this.isProcessGetPayment = false;
                this.payments = response.payments;
            })
            .catch(error => {
                console.error(error);

                this.show.payment_view = true;
                this.isProcessGetPayment = false;
            })
        },

        enterSearchPayment() {
            this.getPayment();
        },

        resetFormAddPayment() {
            this.paymentName = '';
            this.paymentAccount = '';
            this.paymentUsername = '';
            this.isPaymentAccountValid = false;
        }
    },

    watch: {
        'modal.addPayment': function(newValue) {
            if(!newValue) {
                this.resetFormAddPayment();
            }
        },

        payments(newValue) {
            this.isProcessDeletePayment = Array(newValue.length).fill(false);
        },
    }
}
</script>