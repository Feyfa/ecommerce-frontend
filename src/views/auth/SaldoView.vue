<template>
    <!-- saldo view -->
    <div
        v-if="show.saldo_view"
        class="w-full flex flex-col justify-center mb-8"
        :class="embedded ? 'px-0' : 'px-4 xl:px-6'">
        <!-- title -->
        <h1 v-if="!embedded" class="text-center text-3xl font-medium flex justify-center items-center">Detail Saldo</h1>
        <!-- title -->

        <!-- main -->
        <div class="flex flex-col md:flex-row gap-5" :class="embedded ? 'mt-0' : 'mt-5'">
            <div class="saldo-summary-card flex flex-col justify-center w-full md:w-[45%] xl:w-[40%] h-max">
                <!-- block saldo -->
                <div class="flex flex-col sm:flex-row justify-between w-full gap-3 p-3">
                    <div class="flex gap-3">
                        <div class="flex justify-center items-center">
                            <span>
                                <img src="/img/rupiah.png" class="w-10">
                            </span>
                        </div>
                        <div>
                            <h3 class="text-[0.8rem]">Total Saldo Aktif</h3>
                            
                            <h2 class="text-[1.1rem] font-semibold">
                                <i v-if="isFetchSaldo" class="ml-1 fas fa-spinner fa-pulse"></i>
                                <span v-else>Rp{{ saldoTotal.toLocaleString('id-ID') }}</span>
                            </h2>
                        </div>
                    </div>
                    <div class="flex justify-center items-center">
                        <button 
                            class="saldo-primary-button w-full px-5 h-10"
                            @click="openModalRekening"
                            :disabled="isProcessGetPayment || saldoTotal <= 0"
                            :class="{'opacity-50': isProcessGetPayment || saldoTotal <= 0}">
                            Tarik Saldo
                            <i v-if="isProcessGetPayment" class="ml-1 fas fa-spinner fa-pulse"></i>
                        </button>
                    </div>
                </div>
                <!-- block saldo -->

                <div class="border-t border-t-slate-200 mx-2"></div>

                <!-- block asal saldo -->
                <div class="flex flex-col w-full p-3 gap-1">
                    <div class="flex justify-between">
                        <span>Saldo Penghasilan</span>
                        <span>
                            <i v-if="isFetchSaldo" class="ml-1 fas fa-spinner fa-pulse"></i>
                            <span v-else>Rp{{ saldoIncome.toLocaleString('id-ID') }}</span>
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span>Saldo Refund</span>
                        <span>
                            <i v-if="isFetchSaldo" class="ml-1 fas fa-spinner fa-pulse"></i>
                            <span v-else>Rp{{ saldoRefund.toLocaleString('id-ID') }}</span>
                        </span>
                    </div>
                </div>
                <!-- block asal saldo -->

                <!-- list rekening -->
                <Modal v-model:show="modal.rekening">
                    <div class="withdraw-modal">
                        <h3 class="withdraw-modal-title">Tarik Saldo</h3>

                        <!-- input -->
                        <div class="input-container flex flex-col w-full mb-5">
                            <label
                                for="paymentAccount">
                                Nominal
                                <small class="text-[0.7rem] text-neutral-400 ml-1">*batas penarikan Rp1-{{ withdrawMaximum.toLocaleString('id-ID') }}</small>
                            </label>
                            <el-input
                                v-model="wihtdrawPriceString"
                                class="custom-input-price withdraw-price-input tracking-widest"
                                placeholder="Nominal"
                                size="large"
                                :clearable="false"
                                @keydown="restrictInput($event,'integer')"
                                @keyup="validationMaximumWithdraw">
                                <template #prepend>
                                    <div class="withdraw-currency-prefix">
                                        Rp
                                    </div>
                                </template>
                                <template #suffix>
                                    <div class="-tracking-wide font-semibold cursor-pointer text-violet-500" @click="allNominalWithdraw">
                                        Tarik Semua
                                    </div>
                                </template>
                            </el-input>
                            <small 
                                v-if="error.withdraw"
                                class="text-[0.7rem] -tracking-normal text-red-500 font-medium mt-0.5">
                                {{ error.withdraw }}
                            </small>
                        </div>
                        <!-- input -->

                        <!-- list rekening -->
                        <div class="max-h-[510px] sm:max-h-[612px] overflow-auto">
                            <div 
                                v-if="this.payments.length > 0" 
                                class="flex flex-col gap-5">
                                <!-- kontent -->
                                <div 
                                    v-for="(item, index) in payments"
                                    class="withdraw-payment-item cursor-pointer w-full rounded py-3 px-3 flex flex-row justify-between items-center text-[0.8rem]"
                                    :class="{
                                        'is-selected': item.account == paymentAccount,
                                        'hover:bg-slate-50': item.account != paymentAccount
                                    }"
                                    @click="changePayment(item.account)">
                                    <div class="flex items-center gap-4 w-[80%] xl:w-[85%]">
                                        <img 
                                            :src="getImagePayment(item.slug)"
                                            alt=""
                                            class="w-14 h-14 sm:w-20 sm:h-20 rounded-md cursor-default">
                                        <div class="flex flex-col gap-1">
                                            <h3 class="text-neutral-500 font-normal -tracking-normal">{{ item.name }}</h3>
                                            <h3 class="font-semibold">{{ item.account }}</h3>
                                            <h3 class="uppercase">{{ item.username }}</h3>
                                        </div>
                                    </div>
                                    <div class="w-[20%] xl:w-[15%]">
                                        <div class="flex justify-end">
                                            <input class="accent-violet-500 scale-125 cursor-pointer mr-2" type="radio" name="paymentName" :id="item.account" :value="item.account" v-model="paymentAccount">
                                        </div>
                                    </div>
                                </div>
                                <!-- kontent -->
                            </div>
                            <div 
                                v-else 
                                class="text-center my-5">
                                <h5 class="text-[.9rem]">Rekening Kosong</h5>
                            </div>
                        </div>
                        <!-- list rekening -->

                        <!-- button -->
                        <div class="withdraw-actions flex flex-col gap-2 mt-3 sms:mt-5 md:flex-row md:gap-4">
                            <button 
                                class="account-danger-button w-full py-2 px-8 mt-1.5"
                                @click="closeModalRekening">
                                Cancel
                            </button>
                            <button 
                                class="account-primary-button w-full py-2 px-8 mt-1.5"
                                :class="{'opacity-50': error.withdraw || wihtdrawPrice <= 0 || !paymentAccount || isProcessWithdraw}"
                                :disabled="error.withdraw || wihtdrawPrice <= 0 || !paymentAccount || isProcessWithdraw"
                                @click="withdrawSaldo">
                                Tarik Saldo
                                <i v-if="isProcessWithdraw" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                            </button>
                        </div>
                        <!-- button -->
                    </div>
                </Modal>
                <!-- list rekening -->
            </div>
            <div class="saldo-history-card w-full md:w-[55%] xl:w-[60%]">
                <!-- riwayat saldo -->
                <div class="saldo-history-header">
                    <h2 class="text-[1.1rem] font-semibold">History</h2>
                    <div class="date-range-control">
                        <el-date-picker
                            v-model="dateRange"
                            class="transaction-date-filter saldo-date-range"
                            type="daterange"
                            placement="bottom-end"
                            :fallback-placements="['bottom-end']"
                            popper-class="saldo-date-range-popper"
                            range-separator="-"
                            start-placeholder="Start Date"
                            end-placeholder="End Date"
                            value-format="YYYY-MM-DD"
                            :clearable="false"
                            format="DD MMM YYYY"
                            @change="changeDateRange" />
                    </div>
                </div>
                <!-- riwayat saldo -->

                <div class="w-full border-t border-t-slate-200"></div>

                <!-- list riwayat saldo  -->
                <div 
                    class="w-full max-h-[705px] overflow-auto"
                    ref="saldoHistoryContainer"
                    @scroll="saldoHistoryScroll">
                    <div v-if="isFetchSaldoHistory" class="text-center py-10">
                        <i class="ml-1 fas fa-spinner fa-pulse"></i>
                    </div>
                    <div v-else>
                        <div v-if="saldoHistory.length == 0" class="py-10 text-center">
                            <p class="text-sm font-medium">History Anda Kosong</p>
                        </div>
                        <div 
                            v-else 
                            v-for="(item, index) in saldoHistory" 
                            class="saldo-history-item py-3 px-4 text-[0.8rem] flex flex-col justify-center items-start gap-2"
                            :class="{'border-b border-b-slate-200': index != saldoHistory.length - 1}">
                            <h3 class="text-[0.9rem] font-semibold">
                                {{ item.title }}
                                <!-- {{ item.id }} -->
                            </h3>
                            <p class="text-neutral-700 text-[0.7rem] tracking-wide">{{ item.date }}</p>
                            <p class="font-semibold" :class="getColorMoney(item.type)">+ Rp{{ item.price.toLocaleString('id-ID') }}</p>
                            <p class="text-neutral-500">{{ item.description }}</p>
                        </div>
                        <div v-show="this.saldoHistoryContainerLoading" class="w-full h-[4rem] flex justify-center items-center">
                            <span>
                                <i class="fas fa-spinner fa-pulse text-xl"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <!-- list riwayat saldo  -->
            </div>
        </div>
        <!-- main -->
    </div>
    <!-- saldo view -->

    <!-- loading view -->
    <div v-else class="w-full text-xl h-full flex justify-center items-center">
        <span>
            <i class="fas fa-spinner fa-pulse text-4xl"></i>
        </span>
    </div>
    <!-- loading view -->
</template>

<script>
import moment from 'moment';
import { ElNotification } from 'element-plus';
import Modal from '@/components/partials/ModalView.vue';

export default {
    components: {
        Modal
    },

    props: {
        embedded: {
            type: Boolean,
            default: false
        }
    },

    data() {
        const today = moment();
        const start = today.clone().subtract(3, 'days');

        const startDate = start.format('YYYY-MM-DD');
        const endDate = today.format('YYYY-MM-DD');

        return {
            startDate,
            endDate,
            dateRange: [startDate, endDate],

            saldoHistoryContainerLoading: false,
            completeSaldoHistory: false,

            isFetchSaldo: false,
            isFetchSaldoHistory: false,
            isProcessGetPayment: false,
            isProcessWithdraw: false,

            modal: {
                rekening: false
            },

            error: {
                withdraw: false
            },

            saldoTotal: 0,
            saldoIncome: 0,
            saldoRefund: 0,
            saldoHistory: [],

            withdrawMaximum: 1000000,
            wihtdrawPrice: 1,
            wihtdrawPriceString: '1',
            paymentAccount: '',
            payments: [],

            show: {
                saldo_view: false,
            }
        }
    },

    mounted() {
        this.isFetchSaldoHistory = true;
        this.getSaldo();
        this.getSaldoHistory();
    },

    watch: {
        wihtdrawPriceString(newValue) {
            this.wihtdrawPrice = String(newValue).replace(/[.,]/g, "");
            this.wihtdrawPriceString = Number(this.wihtdrawPrice).toLocaleString('id-ID');
        },
        'modal.rekening': function(newValue, oldValue) {
            if(oldValue && !newValue) {
                this.closeModalRekening();
            }
        }
    },

    methods: {
        withdrawSaldo() {
            let isError = false;
            let message = "";
            if(this.wihtdrawPrice <= 0) {
                isError = true;
                message = `Nominal Uang Harus Di Atas Rp${this.wihtdrawPrice.toLocaleString('id-ID')}`;
            } else if(this.wihtdrawPrice > this.withdrawMaximum) {
                isError = true;
                message = `Nominal Uang Maximal ${this.withdrawMaximum.toLocaleString('id-ID')}`;
            } else if(!this.paymentAccount) {
                isError = true;
                message = 'Rekening Harus Dipilih';
            }
            if(isError) {
                ElNotification({ type: 'error', title: 'Error', message: message });
                return;
            }

            this.isProcessWithdraw = true;
            this
            .$store
            .dispatch('withdrawSaldo', {
                paymentAccount: this.paymentAccount,
                wihtdrawPrice: this.wihtdrawPrice
            })
            .then(response => {
                // console.log(response);

                this.isProcessWithdraw = false;
                const withdrawPriceString = this.wihtdrawPriceString;
                if(response.saldoHistory) {
                    this.saldoHistory = [ response.saldoHistory, ...this.saldoHistory ];
                }

                this.getSaldo();
                this.closeModalRekening();
                ElNotification({ type: 'success', title: 'Success', message: `Penarikan Sebesar Rp${withdrawPriceString} Berhasil` });
            })
            .catch(error => {
                this.isProcessWithdraw = false;
                ElNotification({ type: 'error', title: 'Error', message: error?.response?.data?.message ?? 'Something Went Wrong' });
            })
        },

        validationMaximumWithdraw() {
            this.error.withdraw = (this.wihtdrawPrice > this.withdrawMaximum) ? 
                                  `Maximal Penarikan Rp${this.withdrawMaximum.toLocaleString('id-ID')}` : 
                                  '';
        },
        
        allNominalWithdraw() {
            if(this.saldoTotal > this.withdrawMaximum) {
                ElNotification({ type: 'error', title: 'Error', message: `Saldo Anda ${this.saldoTotal.toLocaleString('id-ID')} Maximal Penarikan Rp${this.withdrawMaximum.toLocaleString('id-ID')}` });
                return;
            }
            this.wihtdrawPriceString = this.saldoTotal;
        },

        changePayment(account) {
            this.paymentAccount = account;
        },

        restrictInput(event,inputType) {
            const input = event.target.value;
            // Allow backspace, arrow keys, and other non-character keys
            const char = event.key;
            if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
                return; 
            }

            if (inputType == 'integer') {
                if (!/^\d$/.test(char)) {
                    event.preventDefault();
                }
            }

            // Check if the character is not a number
            if (!char.match(/[0-9]/) && char !== '.') {
                event.preventDefault();
            }

            // Allow only one period
            if (char === '.' && input.includes('.')) {
                event.preventDefault();
            }
        },

        getImagePayment(slug) {
            return `/img/${slug}.png`;
        },

        closeModalRekening() {
            this.wihtdrawPrice = 1;
            this.wihtdrawPriceString = '1',
            this.modal.rekening = false;
            this.paymentAccount = '';
            this.payments = [];
        },

        openModalRekening() {
            this.paymentAccount = '';
            this.isProcessGetPayment = true;
            this
            .$store
            .dispatch('getPayment', {
                searchPayment: this.searchPayment
            })
            .then(response => {
                // console.log(response);
                this.isProcessGetPayment = false;
                
                this.payments = response.payments;
                if(this.payments.length == 0) {
                    this.modal.rekening = false;
                    ElNotification({ type: 'error', title: 'error', message: 'Anda belum menambahkan rekening. Tambahkan rekening terlebih dahulu sebelum melakukan tarik saldo.' });
                    return;
                }

                this.modal.rekening = true;
            })
            .catch(error => {
                console.error(error);
                this.isProcessGetPayment = false;
                const message = error?.response?.data?.message ?? "Something Went Wrong";
                ElNotification({ type: 'error', title: 'Error', message: message });
            })
        },

        saldoHistoryScroll() {
            const saldoHistoryContainer = this.$refs.saldoHistoryContainer;
            const tolerant = 2;

            // console.log({
            //   'scrollTop': saldoHistoryContainer.scrollTop,
            //   'clientHeight': saldoHistoryContainer.clientHeight,
            //   'scrollHeight': saldoHistoryContainer.scrollHeight,
            //   'total_ceil': Math.ceil(saldoHistoryContainer.scrollTop + saldoHistoryContainer.clientHeight),
            //   'tolerant': tolerant,
            //   'this.saldoHistoryContainerLoading': this.saldoHistoryContainerLoading,
            //   'this.completeSaldoHistory': this.completeSaldoHistory
            // });

            if((Math.ceil(saldoHistoryContainer.scrollTop + saldoHistoryContainer.clientHeight) >= saldoHistoryContainer.scrollHeight - tolerant) && (!this.saldoHistoryContainerLoading) && (!this.completeSaldoHistory) && (this.saldoHistory.length > 0)) {
                this.saldoHistoryContainerLoading = true;

                this.$nextTick(() => {
                    saldoHistoryContainer.scrollTop = saldoHistoryContainer.scrollHeight;
                    
                    this.getSaldoHistory();
                });
            }
        },

        changeDateRange() {
            if(!this.dateRange || this.dateRange.length != 2) {
                this.dateRange = [this.startDate, this.endDate];
                return;
            }

            this.startDate = this.dateRange[0];
            this.endDate = this.dateRange[1];
            this.isFetchSaldoHistory = true;
            this.saldoHistory = [];
            this.getSaldoHistory();
        },

        getColorMoney(type = '') {
            if(type == 'withdrawal') {
                return 'text-red-700';
            } else {
                return 'text-green-700';
            }
        },

        getSaldo() {
            this.isFetchSaldo = true;
            this
            .$store
            .dispatch('getSaldo')
            .then(response => {
                this.isFetchSaldo = false;
                this.saldoTotal = response?.saldoTotal ?? 0;
                this.saldoIncome = response?.saldoIncome ?? 0;
                this.saldoRefund = response?.saldoRefund ?? 0;
            })
            .catch(error => {
                this.isFetchSaldo = false;
                const message = error?.response?.data?.message ?? "Something Wrong";
                ElNotification({ type: 'error', title: 'Error', message: message });
            });
        },

        getSaldoHistory() {
            /* GET ALL ID */
            let saldo_history_current_ids = this.saldoHistory.map(saldo => saldo.id);
            saldo_history_current_ids = JSON.stringify(saldo_history_current_ids);
            /* GET ALL ID */

            this
            .$store
            .dispatch('getSaldoHistory', {
                startDate: this.startDate,
                endDate: this.endDate,
                saldo_history_current_ids: saldo_history_current_ids
            })
            .then(response => {
                this.show.saldo_view = true;
                this.isFetchSaldoHistory = false;
                this.saldoHistoryContainerLoading = false;

                this.completeSaldoHistory = (response.saldoHistory.length == 0);

                this.saldoHistory = [ ...this.saldoHistory, ...response.saldoHistory ];

                // this.saldoHistory = response.saldoHistory;
            })
            .catch(error => {
                this.show.saldo_view = true;
                this.isFetchSaldoHistory = false;
                this.saldoHistoryContainerLoading = false;
                const message = error?.response?.data?.message ?? 'Something Wrong';
                ElNotification({ type: 'error', title: 'Error', message: message });
            });
        }
    }
}
</script>

<style>
.saldo-summary-card,
.saldo-history-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

.saldo-primary-button,
.account-primary-button,
.account-danger-button {
    border-radius: 7px;
    border: 1px solid transparent;
    color: #ffffff;
    font-weight: 600;
    transition: 150ms ease-in-out;
}

.saldo-primary-button,
.account-primary-button {
    border-color: #7c3aed;
    background: #8b5cf6;
}

.saldo-primary-button:not(:disabled):hover,
.account-primary-button:not(:disabled):hover {
    background: #7c3aed;
}

.account-danger-button {
    border-color: #dc2626;
    background: #ef4444;
}

.account-danger-button:not(:disabled):hover {
    background: #dc2626;
}

.saldo-history-item {
    transition: background 150ms ease-in-out;
}

.saldo-history-item:hover {
    background: #fafafa;
}

.saldo-history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px 18px;
}

.saldo-history-header h2 {
    line-height: 44px;
}

.withdraw-modal {
    padding: 22px;
}

.withdraw-modal-title {
    margin-bottom: 18px;
    color: #111827;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
}

.withdraw-currency-prefix {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-width: 54px;
    border-right: 1px solid #eef2f7;
    color: #64748b;
    font-weight: 700;
}

.withdraw-payment-item {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    transition: 150ms ease-in-out;
}

.withdraw-payment-item.is-selected {
    border: 2px solid #8b5cf6;
    background: #f5f3ff;
}

.withdraw-actions {
    justify-content: space-between;
}

.date-range-control {
    width: 100%;
    max-width: 370px;
    flex: 0 1 370px;
}

.saldo-date-range.el-date-editor.el-input__wrapper {
    width: 100% !important;
    height: 44px;
    min-height: 44px;
}

@media (max-width: 640px) {
    .saldo-history-header {
        flex-direction: column;
        align-items: stretch;
    }

    .saldo-history-header h2 {
        line-height: 1.4;
    }

    .date-range-control {
        max-width: none;
        flex-basis: auto;
    }
}

.custom-input-price .el-input-group__append,
.custom-input-price .el-input-group__prepend {
    padding: 0 !important;
}

.withdraw-price-input.el-input-group {
    border-radius: 6px;
}

.withdraw-price-input .el-input-group__prepend {
    overflow: hidden;
    border: 1px solid #cbd5e1 !important;
    border-right: 0 !important;
    border-radius: 6px 0 0 6px !important;
    background: #f8fafc !important;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.withdraw-price-input .el-input__wrapper {
    height: 44px;
    min-height: 44px;
    border: 1px solid #cbd5e1 !important;
    border-left: 0 !important;
    border-radius: 0 6px 6px 0 !important;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.withdraw-price-input .el-input-group__prepend:has(+ .el-input__wrapper:hover),
.withdraw-price-input .el-input-group__prepend:has(+ .el-input__wrapper:focus-within) {
    border-color: #8b5cf6 !important;
}

.withdraw-price-input .el-input__wrapper:hover,
.withdraw-price-input .el-input__wrapper:focus-within {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #ede9fe, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
