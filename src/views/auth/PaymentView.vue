<template>
    <!-- payment view -->
    <div
        v-if="show.payment_view"
        class="w-full flex flex-col justify-center mb-8"
        :class="embedded ? 'px-0' : 'px-4 lg:px-6'">
        <!-- title -->
        <h1 v-if="!embedded" class="text-center text-3xl font-medium flex justify-center items-center">Rekening Bank</h1>
        <!-- title -->

        <!-- form add rekening -->
        <Modal v-model:show="modal.addPayment">
            <div class="account-form-modal flex flex-col gap-3 p-5">
                <h1 class="account-modal-title text-center">Tambah Rekening</h1>
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
                                class="check-account-button"
                                :class="{'opacity-50 cursor-default': isProcessValidateAccount, 'hover:bg-violet-50': !isProcessValidateAccount}">
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
                        {{ errors.paymentAccount }}
                    </small>
                </div>
                <div
                    class="input-container flex flex-col w-full border border-slate-200 bg-slate-50 rounded-lg p-3 gap-1 mt-3"
                    v-show="isPaymentAccountValid">
                    <p class="text-[0.85rem] -tracking-[0.2px]">Nama Pemilik Rekening</p>
                    <p class="uppercase tracking-[0.2px] font-medium">{{ paymentUsername }}</p>
                </div>

                <div class="mt-3 flex flex-col gap-2 md:flex-row md:gap-4">
                    <button
                        type="button"
                        class="account-modal-action is-cancel w-full mt-1.5"
                        @click="closeFormAddPayment"
                        :disabled="isProcessAddPayment"
                        :class="{'opacity-50': isProcessAddPayment}">
                        Cancel
                    </button>
                    <button
                        type="button"
                        class="account-modal-action is-primary w-full mt-1.5"
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
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3" :class="embedded ? 'mt-0' : 'mt-5'">
            <div class="w-full md:w-[40%] lg:w-[35%]">
                <input
                    placeholder="Cari Rekening Bank"
                    id="search-payment"
                    type="text"
                    class="account-search-input border w-full outline-none h-12 px-3"
                    v-model="searchPayment"
                    @keyup.enter="enterSearchPayment">
            </div>
            <div class="md:w-[25%] lg:w-[26%]">
                <button
                    type="button"
                    class="account-add-button w-full h-12"
                    @click="openFormAddPayment"
                    :disabled="isProcessGetPaymentList"
                    :class="{'opacity-50': isProcessGetPaymentList}">
                    <i class="fa-solid fa-plus text-xs"></i>
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
                        class="payment-card w-full p-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                        <div class="flex items-center gap-4 min-w-0">
                            <img
                                :src="getImagePayment(payment.slug)"
                                alt=""
                                class="payment-bank-logo cursor-default">
                            <div class="flex flex-col gap-1 min-w-0">
                                <h3 class="payment-bank-name">{{ payment.name }}</h3>
                                <h3 class="payment-account-number">{{ payment.account }}</h3>
                                <h3 class="payment-account-owner">{{ payment.username }}</h3>
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button
                                type="button"
                                class="payment-delete-button"
                                :disabled="isProcessDeletePayment[index]"
                                :class="{'opacity-50': isProcessDeletePayment[index]}"
                                @click="deletePayment(payment.id, index)">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                                Hapus
                                <i v-if="isProcessDeletePayment[index]" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                            </button>
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

    props: {
        embedded: {
            type: Boolean,
            default: false
        }
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
            .catch(() => {});

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
            this.paymentSlug = '';
            this.paymentAccount = '';
            this.paymentUsername = '';
            this.isPaymentAccountValid = false;
            this.errors.paymentName = '';
            this.errors.paymentAccount = '';
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

<style>
.account-form-modal {
    padding: 22px;
}

.account-modal-title {
    color: #111827;
    font-size: 24px;
    font-weight: 700;
}

.account-search-input {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.account-search-input:focus {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #ede9fe, 0 1px 2px rgba(15, 23, 42, 0.05);
}

.payment-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
}

.payment-card {
    transition: 150ms ease-in-out;
}

.payment-card:hover {
    border-color: #c4b5fd;
    background: #fafafa;
}

.account-add-button,
.account-modal-action,
.account-primary-button,
.account-danger-button,
.account-secondary-button,
.payment-delete-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 7px;
    border: 1px solid transparent;
    font-weight: 600;
    transition: 150ms ease-in-out;
}

.account-add-button,
.account-modal-action.is-primary,
.account-primary-button {
    border-color: #7c3aed;
    background: #8b5cf6;
    color: #ffffff;
}

.account-add-button {
    box-shadow: 0 10px 20px rgba(124, 58, 237, 0.18);
}

.account-modal-action {
    min-height: 44px;
    padding: 0 16px;
}

.account-primary-button:not(:disabled):hover {
    background: #7c3aed;
}

.account-add-button:not(:disabled):hover,
.account-modal-action.is-primary:not(:disabled):hover {
    background: #7c3aed;
}

.account-danger-button,
.account-modal-action.is-cancel {
    border-color: #dc2626;
    background: #ef4444;
    color: #ffffff;
}

.account-danger-button:not(:disabled):hover,
.account-modal-action.is-cancel:not(:disabled):hover {
    background: #dc2626;
}

.account-secondary-button {
    border-color: #d1d5db;
    background: #f3f4f6;
    color: #374151;
}

.account-secondary-button:not(:disabled):hover {
    background: #e5e7eb;
}

.payment-bank-logo {
    width: 72px;
    height: 72px;
    flex: 0 0 auto;
    border-radius: 8px;
    border: 1px solid #eef2f7;
    background: #ffffff;
    object-fit: contain;
    padding: 8px;
}

.payment-bank-name {
    overflow: hidden;
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.payment-account-number {
    color: #111827;
    font-size: 0.95rem;
    font-weight: 700;
}

.payment-account-owner {
    color: #111827;
    font-size: 0.88rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    text-transform: uppercase;
}

.payment-delete-button {
    min-height: 38px;
    min-width: 112px;
    border-color: #fecaca;
    background: #fff7f7;
    color: #dc2626;
    padding: 0 14px;
}

.payment-delete-button:not(:disabled):hover {
    border-color: #fca5a5;
    background: #fef2f2;
}

.check-account-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-left: 1px solid #e5e7eb;
    background: #f8fafc;
    color: #6b7280;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0 12px;
}
</style>
