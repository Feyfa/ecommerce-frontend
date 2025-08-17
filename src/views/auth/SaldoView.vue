<template>
    <!-- saldo view -->
    <div v-if="show.saldo_view" class="px-4 xl:px-6 w-full flex flex-col justify-center mb-8">
        <!-- title -->
        <h1 class="text-center text-3xl font-medium flex justify-center items-center">Detail Saldo</h1>
        <!-- title -->

        <!-- main -->
        <div class="flex flex-col md:flex-row mt-5 gap-5">
            <div class="border border-neutral-500 flex flex-col justify-center rounded shadow lg:shadow-md w-full md:w-[45%] xl:w-[40%] h-max">
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
                            class="border border-neutral-500 bg-violet-500 w-full px-5 h-10 rounded"
                            @click="openModalRekening"
                            :disabled="isProcessGetPayment || saldoTotal <= 0"
                            :class="{'opacity-50': isProcessGetPayment || saldoTotal <= 0}">
                            Tarik Saldo
                            <i v-if="isProcessGetPayment" class="ml-1 fas fa-spinner fa-pulse"></i>
                        </button>
                    </div>
                </div>
                <!-- block saldo -->

                <div class="border-t border-t-neutral-300 mx-2"></div>

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
                    <div class="p-5">
                        <h3 class="text-2xl font-medium text-center mb-4">Rekening</h3>

                        <!-- input -->
                        <div class="input-container flex flex-col w-full mb-5">
                            <label
                                for="paymentAccount">
                                Nominal
                                <small class="text-[0.7rem] text-neutral-400 ml-1">*batas penarikan Rp1-{{ withdrawMaximum.toLocaleString('id-ID') }}</small>
                            </label>
                            <el-input
                                v-model="wihtdrawPriceString"
                                class="custom-input-price tracking-widest"
                                placeholder="Nominal"
                                size="large"
                                :clearable="false"
                                @keydown="restrictInput($event,'integer')"
                                @keyup="validationMaximumWithdraw">
                                <template #prepend>
                                    <div class="border-l border-t border-b border-l-[rgb(115,115,115)] border-t-[rgb(115,115,115)] border-b-[rgb(115,115,115)] rounded-tl rounded-bl h-full px-5 flex justify-center items-center text-neutral-500">
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
                                    class="cursor-pointer w-full rounded py-3 px-3 flex flex-row justify-between items-center text-[0.8rem]"
                                    :class="{
                                        'border-2 border-violet-500 bg-violet-100 ': item.account == paymentAccount,
                                        'border border-neutral-400 hover:bg-neutral-50': item.account != paymentAccount
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
                        <div class="flex flex-col gap-2 mt-3 sms:mt-5 md:flex-row md:gap-20 lg:gap-40">
                            <button 
                                class="w-full border border-neutral-500 bg-red-600 py-2 px-8 rounded mt-1.5"
                                @click="closeModalRekening">
                                Cancel
                            </button>
                            <button 
                                class="w-full border border-neutral-500 bg-violet-500 py-2 px-8 rounded mt-1.5"
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
            <div class="border border-neutral-500 rounded shadow lg:shadow-md w-full md:w-[55%] xl:w-[60%]">
                <!-- riwayat saldo -->
                <div class="flex flex-col justify-between items-start sm:flex-row sm:items-end md:flex-col md:items-start xl:flex-row xl:items-end gap-2 px-3 pt-3 pb-6 shadow-md">
                    <h2 class="w-full sm:mt-3.5 md:mt-0 text-[1.1rem] font-semibold">History</h2>
                    <div class="w-full flex justify-start items-center gap-1 sm:gap-2">
                        <el-date-picker
                            class="date-saldo-history"
                            v-model="startDate"
                            type="date"
                            placeholder="Start"
                            :clearable="false"
                            value-format="YYYY-MM-DD"
                            format="DD MMMM YYYY"
                            @change="allowOnlyDateCharsChange('start', $event)"
                            @keydown="allowOnlyDateCharsKeydown"/>
                        <span class="mt-3">-</span>
                        <el-date-picker
                            class="date-saldo-history"
                            v-model="endDate"
                            type="date"
                            placeholder="End"
                            :clearable="false"
                            value-format="YYYY-MM-DD"
                            format="DD MMMM YYYY"
                            @change="allowOnlyDateCharsChange('end', $event)"
                            @keydown="allowOnlyDateCharsKeydown"/>
                    </div>
                </div>
                <!-- riwayat saldo -->

                <div class="w-full border-t border-t-neutral-500"></div>

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
                            class="py-2 px-3 text-[0.8rem] flex flex-col justify-center items-start gap-2"
                            :class="{'border-b border-b-neutral-500': index != saldoHistory.length - 1}">
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

    data() {
        const today = moment();
        const start = today.clone().subtract(3, 'days');

        return {
            startDate: start.format('YYYY-MM-DD'),
            endDate: today.format('YYYY-MM-DD'),

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

            payments: Array(2).fill(''),

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
                if(response.saldoHistory) {
                    this.saldoHistory = [ response.saldoHistory, ...this.saldoHistory ];
                }

                this.getSaldo();
                this.closeModalRekening();
                ElNotification({ type: 'success', title: 'Success', message: `Penarikan Sebesar Rp${this.wihtdrawPriceString} Berhasil` });
            })
            .catch(error => {
                console.log(error);

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
            this.account = '';
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

        allowOnlyDateCharsChange(type, event) {
            if (!event) {
                if(type == 'start') {
                    this.startDate = moment().format('YYYY-MM-DD');
                } else {
                    this.endDate = moment().format('YYYY-MM-DD');
                }
            }

            this.isFetchSaldoHistory = true;
            this.saldoHistory = [];
            this.getSaldoHistory();
        },

        allowOnlyDateCharsKeydown(event) {
            event.preventDefault();
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
                const messaga = error?.response?.data?.message ?? "Something Wrong";
                ElNotification({ type: 'error', title: 'Error', message: messaga });
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
                const message = error?.response?.data?.messaga ?? 'Something Wrong';
                ElNotification({ type: 'error', title: 'Error', message: message });
            });
        }
    }
}
</script>

<style>
.date-saldo-history .el-date-editor.el-input, .el-date-editor.el-input__wrapper {
    width: 100% !important;
}
.date-saldo-history .el-input__wrapper {
    height: 2.5rem !important;
}
.date-saldo-history .el-input__inner {
    font-size: 13px !important;
}

.custom-input-price .el-input-group__append, .el-input-group__prepend {
    padding: 0 !important;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>