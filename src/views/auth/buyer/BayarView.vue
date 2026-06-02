<template>
    <!-- bayar view -->
    <div v-if="show.bayar_view" class="min-h-full w-full bg-slate-50 px-4 pb-8 pt-4 lg:px-6">
        <div class="mb-5">
            <h1 class="text-3xl font-medium text-slate-950">Simulasi Virtual Account</h1>
            <p class="mt-2 text-sm text-slate-500">Gunakan halaman ini untuk simulasi pembayaran virtual account di local development.</p>
        </div>

        <div class="w-full rounded-md border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 px-4 py-4 sm:px-5">
                <h2 class="text-lg font-semibold text-slate-950">Data Pembayaran</h2>
                <p class="mt-1 text-sm text-slate-500">Pilih bank dan masukkan nomor virtual account yang ingin disimulasikan.</p>
            </div>

            <!-- list input -->
            <div class="flex flex-col gap-4 px-4 py-5 sm:px-5">
                <div
                    class="simulate-field input-container flex w-full flex-col"
                    :class="{'is-error': errors.paymentName}">
                    <label
                        for="paymentName"
                        class="mb-1.5 font-medium text-slate-700">
                        Nama Bank
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <el-select
                        id="paymentName"
                        filterable
                        placeholder="Nama Bank"
                        size="large"
                        class="simulate-input !w-full"
                        v-model="paymentName"
                        @change="paymentNameChange"
                        @blur="paymentNameBlur">
                        <el-option
                            v-for="item in paymentList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name"/>
                    </el-select>
                    <small 
                        v-if="errors.paymentName"
                        class="mt-1 text-sm text-red-500">
                        {{ errors.paymentName }}
                    </small>
                </div>
                <div 
                    class="simulate-field input-container flex w-full flex-col"
                    :class="{'is-error': errors.paymentVirtualAccount}"
                    v-show="true">
                    <label
                        for="paymentAccount"
                        class="mb-1.5 font-medium text-slate-700">
                        Nomor Virtual Account
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <el-input
                        id="paymentAccount"
                        placeholder="Nomor Virtual Account"
                        class="simulate-input custom-input !w-full"
                        size="large"
                        clearable
                        v-model="paymentVirtualAccount"
                        @change="paymentVirtualAccountChange"
                        @blur="paymentVirtualAccountBlur">
                    </el-input>
                    <small 
                        v-if="errors.paymentVirtualAccount"
                        class="mt-1 text-sm text-red-500">
                        {{ errors.paymentVirtualAccount }}
                    </small>
                </div>
                <div class="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button 
                        type="button"
                        class="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:w-auto"
                        @click="clearFormSimulateVirtualAccount">
                        Cancel
                    </button>
                    <button 
                        type="button"
                        class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-violet-500 bg-violet-500 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        @click="simulateChargeVirtualAccount"
                        :disabled="isChargeVirtualAccount">
                        Bayar
                        <i v-if="isChargeVirtualAccount" class="fa-solid fa-spinner fa-spin-pulse"></i>
                    </button>
                </div>
            </div>
            <!-- list input -->
        </div>
    </div>
    <!-- bayar view -->
    <div v-else class="w-full text-xl h-full flex justify-center items-center bg-slate-50">
        <span>
            <i class="fas fa-spinner fa-pulse text-4xl"></i>
        </span>
    </div>
</template>

<script>
import { ElNotification } from 'element-plus';

export default {
    data() {
        return {
            paymentName: '',
            paymentSlug: '',
            paymentVirtualAccount: '',
            paymentList: [],

            isChargeVirtualAccount: false,

            errors: {
                paymentName: false,
                paymentVirtualAccount: false
            },

            show: {
                bayar_view: false,
            }
        }
    },

    mounted() {
        this.getPaymentList();
    },

    methods: {
        clearFormSimulateVirtualAccount() {
            this.paymentName = '';
            this.paymentSlug = '';
            this.paymentVirtualAccount = '';
            this.errors.paymentName = '';
            this.errors.paymentVirtualAccount = '';
        },

        getPaymentList() {
            this.clearFormSimulateVirtualAccount();

            this
            .$store
            .dispatch('getPaymentList')
            .then(response => {
                // console.log(response);

                this.show.bayar_view = true;
                this.paymentList = response.paymentList;
            })
            .catch(error => {
                console.error(error);

                this.show.bayar_view = true;
                ElNotification({ type: 'error', title: 'Error', message: error?.response?.data?.message ?? 'Something Error' })
            })
        },

        paymentNameChange(event) {
            const paymentFind = this.paymentList.find(item => item.name == event);
            this.paymentSlug = paymentFind ? paymentFind.slug : '';
            this.errors.paymentName = '';
        },

        paymentVirtualAccountChange() {
            if(!this.paymentVirtualAccount || this.paymentVirtualAccount.trim() == '') {
                this.errors.paymentVirtualAccount = 'Nomor Virtual Account Harus Diisi';
            } else {
                this.errors.paymentVirtualAccount = '';
            }
        },

        paymentNameBlur() {
            this.errors.paymentName = '';
        },

        paymentVirtualAccountBlur() {
            this.errors.paymentVirtualAccount = '';   
        },

        simulateChargeVirtualAccount() {
            let isReturn = false;
            if(!this.paymentSlug || this.paymentSlug.trim() == '') {
                this.errors.paymentName = "Nama Bank Harus Dipilih";
                ElNotification({ type: 'error', title: 'Error', message: 'Nama Bank Harus Dipilih' });
                isReturn = true;
            }
            if(!this.paymentVirtualAccount || this.paymentVirtualAccount.trim() == '') {
                this.errors.paymentVirtualAccount = "Nomor Virtual Account Harus Diisi";
                ElNotification({ type: 'error', title: 'Error', message: 'Nomor Virtual Account Harus Diisi' });
                isReturn = true;
            }
            if(isReturn) {
                return;
            }

            this.isChargeVirtualAccount = true;
            const paymentVirtualAccount = this.paymentVirtualAccount;
            this
            .$store
            .dispatch('simulateChargeVirtualAccount', {
                payment_slug: this.paymentSlug,
                payment_account: this.paymentVirtualAccount
            })
            .then(response => {
                // console.log(response);
                this.isChargeVirtualAccount = false;
                this.clearFormSimulateVirtualAccount();
                ElNotification({ type: 'success', title: 'Success', message: `Nomor Virtual ${paymentVirtualAccount} Berhasil Dibayar` });
            })
            .catch(error => {
                console.error(error);
                this.isChargeVirtualAccount = false;
                const message = error?.response?.data?.message ?? 'Ups Sepertinya Ada Yang Salah';
                ElNotification({ type: 'error', title: 'Error', message: message });
            });
        }
    }
}
</script>

<style scoped>
.required-mark {
    color: #ef4444;
    font-weight: 700;
}

.simulate-field :deep(.el-select__wrapper),
.simulate-field :deep(.el-input__wrapper) {
    height: 48px;
    min-height: 48px;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px;
    background: #ffffff;
    padding: 0 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
    transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out;
}

.simulate-field :deep(.el-select__wrapper.is-hovering),
.simulate-field :deep(.el-input__wrapper:hover) {
    border-color: #cbd5e1 !important;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.simulate-field :deep(.el-select__wrapper.is-focused),
.simulate-field :deep(.el-input__wrapper.is-focus),
.simulate-field :deep(.el-input__wrapper:focus-within) {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #ede9fe, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.simulate-field :deep(.el-input__inner),
.simulate-field :deep(.el-select__input),
.simulate-field :deep(.el-select__placeholder) {
    color: #0f172a;
    font-size: 16px;
}

.simulate-field :deep(.el-input__inner::placeholder) {
    color: #94a3b8;
}

.simulate-field :deep(.el-select__caret),
.simulate-field :deep(.el-input__suffix) {
    color: #94a3b8;
}

.simulate-field.is-error :deep(.el-select__wrapper),
.simulate-field.is-error :deep(.el-select__wrapper.is-focused),
.simulate-field.is-error :deep(.el-input__wrapper),
.simulate-field.is-error :deep(.el-input__wrapper.is-focus),
.simulate-field.is-error :deep(.el-input__wrapper:focus-within) {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 2px #fee2e2, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}
</style>
