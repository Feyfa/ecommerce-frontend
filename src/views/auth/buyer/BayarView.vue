<template>
    <!-- bayar view -->
    <div v-if="show.bayar_view" class="px-5 lg:px-10 w-full flex flex-col justify-center items-center mb-8">
        <!-- title -->
        <h1 class="text-center text-3xl font-medium flex justify-center items-center">Simulasi Virtual Account</h1>
        <!-- title -->

        <div class="mt-5 w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded">
            <!-- list input -->
            <div class="flex flex-col gap-3 mt-5">
                <div class="input-container flex flex-col w-full">
                    <label
                        for="paymentName">
                        Nama Bank
                    </label>
                    <el-select
                        filterable
                        placeholder="Nama Bank"
                        size="large"
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
                        class="text-red-500">
                        {{ errors.paymentName }}
                    </small>
                </div>
                <div 
                    class="input-container flex flex-col w-full"
                    v-show="true">
                    <label
                        for="paymentAccount">
                        Nomor Virtual Account
                    </label>
                    <el-input
                        placeholder="Nomor Virtual Account"
                        class="custom-input"
                        size="large"
                        clearable
                        v-model="paymentVirtualAccount"
                        @change="paymentVirtualAccountChange"
                        @blur="paymentVirtualAccountBlur">
                    </el-input>
                    <small 
                        v-if="errors.paymentVirtualAccount"
                        class="text-red-500">
                        {{ errors.paymentVirtualAccount }}
                    </small>
                </div>
                <div class="flex flex-col gap-2 mt-3 md:flex-row md:gap-20 lg:gap-40">
                    <button 
                        class="w-full border border-neutral-500 bg-red-600 py-2 px-8 rounded mt-1.5"
                        @click="clearFormSimulateVirtualAccount">
                        Cancel
                    </button>
                    <button 
                        class="w-full border border-neutral-500 bg-violet-500 py-2 px-8 rounded mt-1.5"
                        @click="simulateChargeVirtualAccount"
                        :disabled="isChargeVirtualAccount"
                        :class="{'opacity-50': isChargeVirtualAccount}">
                        Bayar
                        <i v-if="isChargeVirtualAccount" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                    </button>
                </div>
            </div>
            <!-- list input -->
        </div>
    </div>
    <!-- bayar view -->
    <div v-else class="w-full text-xl h-full flex justify-center items-center">
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
            this.paymentVirtualAccount = '';
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
            if(this.paymentVirtualAccount || this.paymentVirtualAccount.trim() == '') {
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
                ElNotification({ type: 'success', title: 'Success', message: 'Nama Bank Harus Dipilih' });
                isReturn = true;
            }
            if(!this.paymentVirtualAccount || this.paymentVirtualAccount.trim() == '') {
                this.errors.paymentVirtualAccount = "Nomor Virtual Account Harus Diisi";
                ElNotification({ type: 'success', title: 'Success', message: 'Nomor Virtual Account Harus Diisi' });
                isReturn = true;
            }
            if(isReturn) {
                return;
            }

            this.isChargeVirtualAccount = true;
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
                ElNotification({ type: 'success', title: 'Success', message: `Nomor Virtual ${this.paymentVirtualAccount} Berhasil Dibayar` });
            })
            .catch(error => {
                console.error(error);
                this.isChargeVirtualAccount = false;
                const message = typeof(error.response.data.message) ? error.response.data.message : 'Ups Sepertinya Ada Yang Salah';
                ElNotification({ type: 'error', title: 'Error', message: message });
            });
        }
    }
}
</script>