import { createStore } from 'vuex';
import axios from '@/axios';

export default createStore({
    state: {
        user: '',
        company: '',
        activeAccountMode: '',
    },

    getters: {
        /**
         * Mengembalikan user yang dihitung dari state saat ini di modul store.
         *
         * @param {*} state State Vuex atau state reaktif yang digunakan oleh operasi.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi user.
         */
        user: (state) => state.user,
        /**
         * Mengembalikan company yang dihitung dari state saat ini di modul store.
         *
         * @param {*} state State Vuex atau state reaktif yang digunakan oleh operasi.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi company.
         */
        company: (state) => state.company,
        /**
         * Mengembalikan mode akun aktif yang dihitung dari state saat ini di modul store.
         *
         * @param {*} state State Vuex atau state reaktif yang digunakan oleh operasi.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi mode akun aktif.
         */
        activeAccountMode: (state) => state.activeAccountMode,
    },

    actions: {
        /**
         * Memuat user from local storage di modul store.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        fetchUserFromLocalStorage() {
            this.state.user = JSON.parse(localStorage.getItem('user'));
        },

        /**
         * Memuat company from local storage di modul store.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        fetchCompanyFromLocalStorage() {
            this.state.company = JSON.parse(localStorage.getItem('company'));
        },

        /**
         * Memuat mode akun aktif from session storage di modul store.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        fetchActiveAccountModeFromSessionStorage() {
            const activeAccountMode = sessionStorage.getItem('active_account_mode');
            this.state.activeAccountMode = ['buyer', 'seller'].includes(activeAccountMode)
                ? activeAccountMode
                : 'buyer';
            sessionStorage.setItem('active_account_mode', this.state.activeAccountMode);
        },

        /**
         * Memperbarui mode akun aktif di modul store.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} mode Mode akun atau UI yang dipilih untuk operasi.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi set mode akun aktif.
         */
        setActiveAccountMode(context, mode) {
            const activeAccountMode = ['buyer', 'seller'].includes(mode) ? mode : 'buyer';
            this.state.activeAccountMode = activeAccountMode;
            sessionStorage.setItem('active_account_mode', activeAccountMode);

            return activeAccountMode;
        },

        /**
         * Menjalankan alur store switch active account mode di modul store.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi switch mode akun aktif.
         */
        switchActiveAccountMode() {
            const currentMode = ['buyer', 'seller'].includes(this.state.activeAccountMode)
                ? this.state.activeAccountMode
                : sessionStorage.getItem('active_account_mode') || 'buyer';
            const activeAccountMode = currentMode == 'buyer' ? 'seller' : 'buyer';

            this.state.activeAccountMode = activeAccountMode;
            sessionStorage.setItem('active_account_mode', activeAccountMode);

            return activeAccountMode;
        },

        /**
         * Membersihkan mode akun aktif di modul store.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        clearActiveAccountMode() {
            this.state.activeAccountMode = '';
            sessionStorage.removeItem('active_account_mode');
        },

        /**
         * Menjalankan alur store withdraw saldo di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi withdraw saldo.
         */
        withdrawSaldo(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/saldo-withdraw', {
                        paymentAccount: data.paymentAccount,
                        wihtdrawPrice: data.wihtdrawPrice,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil saldo history di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get saldo history.
         */
        getSaldoHistory(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/saldo-history', {
                        params: {
                            startDate: data.startDate,
                            endDate: data.endDate,
                            saldo_history_current_ids: data.saldo_history_current_ids,
                        },
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil saldo di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get saldo.
         */
        getSaldo(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/saldo')
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store approved transaction di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi approved transaksi.
         */
        approvedTransaction(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/transaction/approved', {
                        transaction_user_id: data.transaction_user_id,
                        user_type: data.user_type,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store simulate charge virtual account di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi simulate charge virtual account.
         */
        simulateChargeVirtualAccount(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/payment/simulate/charge-virtual-account', {
                        payment_slug: data.payment_slug,
                        payment_account: data.payment_account,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil transaksi di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get transaksi.
         */
        getTransactions(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get(`/transaction`, {
                        params: {
                            user_type: data.user_type,
                            status_filter: data.status_filter,
                            search: data.search,
                            sort: data.sort,
                            page: data.page,
                            per_page: data.per_page,
                            date_from: data.date_from,
                            date_to: data.date_to,
                        },
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil seller dashboard di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get seller dashboard.
         */
        getSellerDashboard(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/dashboard')
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menghapus data pembayaran di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi delete payment.
         */
        deletePayment(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .delete(`/payment/${data.id}`, {
                        data: {
                            searchAlamat: data.searchAlamat,
                        },
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Membuat payment di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi add payment.
         */
        addPayment(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/payment', {
                        paymentName: data.paymentName,
                        paymentSlug: data.paymentSlug,
                        paymentAccount: data.paymentAccount,
                        paymentUsername: data.paymentUsername,
                        searchPayment: data.searchPayment,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Memvalidasi payment account di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi validate payment account.
         */
        validatePaymentAccount(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/payment/account/validate', {
                        paymentAccount: data.paymentAccount,
                        paymentSlug: data.paymentSlug,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil payment list di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get payment list.
         */
        getPaymentList(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/payment/list')
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store process checkout di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi process checkout.
         */
        processCheckout(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post(`/checkout/process`, {
                        shipping_options: data.shippingOptions,
                        noteds: data.noteds,
                        payment_slug: data.paymentSlug,
                        client_snapshot: data.clientSnapshot,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Memperbarui alamat buyer di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi edit alamat buyer.
         */
        editAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .put(`/alamat/buyer/${data.id}`, {
                        place: data.place,
                        name: data.name,
                        phone: data.phone,
                        alamat: data.alamat,
                        location_source: data.location_source,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        geoapify_place_id: data.geoapify_place_id,
                        formatted_address: data.formatted_address,
                        address_detail: data.address_detail,
                        enable: data.enable,
                        searchAlamat: data.searchAlamat,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Memperbarui status alamat aktif buyer di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi set enable alamat buyer.
         */
        setEnableAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .put(`/alamat-enable/buyer/${data.id}`, {
                        searchAlamat: data.searchAlamat,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menghapus alamat buyer di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi delete alamat buyer.
         */
        deleteAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .delete(`/alamat/buyer/${data.id}`, {
                        data: {
                            searchAlamat: data.searchAlamat,
                        },
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Membuat alamat buyer di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi add alamat buyer.
         */
        addAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/alamat/buyer', {
                        place: data.place,
                        name: data.name,
                        phone: data.phone,
                        alamat: data.alamat,
                        location_source: data.location_source,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        geoapify_place_id: data.geoapify_place_id,
                        formatted_address: data.formatted_address,
                        address_detail: data.address_detail,
                        enable: data.enable,
                        searchAlamat: data.searchAlamat,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil alamat buyer di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get alamat buyer.
         */
        getAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/alamat/buyer', {
                        params: {
                            searchAlamat: data.searchAlamat,
                        },
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil payment di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get payment.
         */
        getPayment(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/payment', {
                        params: {
                            searchPayment: data.searchPayment,
                        },
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil data checkout di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get data checkout.
         */
        getDataCheckout(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get(`/checkout/data`)
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Memvalidasi checkout di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi validate checkout.
         */
        validateCheckout(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/keranjang/validate/checkout', {
                        product_ids: data.product_ids,
                        user_id_buyer: data.user_id_buyer,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil invoice di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get invoice.
         */
        getInvoice(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/invoice', {
                        params: {
                            user_id_buyer: data.user_id_buyer,
                            filter: data.filter,
                        },
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menghapus transaksi di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi delete transaksi.
         */
        deleteTransaction(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .delete(`/transaction/${data.user_id_buyer}/${data.order_id}`)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store store total keranjang di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi store total keranjang.
         */
        storeTotalKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/keranjang/total/change', {
                        user_id_buyer: data.user_id_buyer,
                        product_id: data.product_id,
                        total: data.total,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store minus total keranjang di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi minus total keranjang.
         */
        minusTotalKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/keranjang/total/minus', {
                        user_id_buyer: data.user_id_buyer,
                        product_id: data.product_id,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store plus total keranjang di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi plus total keranjang.
         */
        plusTotalKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/keranjang/total/plus', {
                        user_id_buyer: data.user_id_buyer,
                        product_id: data.product_id,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menghapus keranjang di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi delete keranjang.
         */
        deleteKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .delete(`/keranjang/${data.user_id_buyer}/${data.product_id}`)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store checked keranjang di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi checked keranjang.
         */
        checkedKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post(`/keranjang/checked`, {
                        user_id_buyer: data.user_id_buyer,
                        product_id: data.product_id,
                        checked: data.checked,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store checked keranjang group di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi checked keranjang group.
         */
        checkedKeranjangGroup(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/keranjang/checked/group', {
                        user_id_buyer: data.user_id_buyer,
                        checked: data.checked,
                        user_id_seller: data.user_id_seller,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store checked keranjang all di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi checked keranjang all.
         */
        checkedKeranjangAll(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/keranjang/checked/all', {
                        user_id_buyer: data.user_id_buyer,
                        checked: data.checked,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil keranjang di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get keranjang.
         */
        getKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get(`/keranjang/${data.user_id_buyer}`)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Membuat keranjang di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi add keranjang.
         */
        addKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post(`/keranjang`, {
                        user_id_seller: data.user_id_seller,
                        user_id_buyer: data.user_id_buyer,
                        product_id: data.product_id,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil belanja di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get belanja.
         */
        getBelanja(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get(`/belanja`, {
                        params: {
                            products_current_id: data.products_current_id,
                            search_product: data.search_product,
                            sort_product: data.sort_product,
                        },
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Memperbarui produk di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi edit produk.
         */
        editProduct(context, data) {
            return new Promise((resolve, reject) => {
                // override method post to put
                axios
                    .post(`/product/${data.get('id')}`, data)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil produk di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get produk.
         */
        getProduct(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get(`/product/${data.user_id_seller}/${data.id_product}`)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menghapus produk di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi delete produk.
         */
        deleteProduct(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .delete(`/product/${data.user_id_seller}/${data.id_product}`)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil produk di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get produk.
         */
        getProducts(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get(`/product/${data.user_id_seller}`, {
                        params: {
                            products_current_id: data.products_current_id,
                            search_product: data.search_product,
                            stock_filter: data.stock_filter,
                            sort_product: data.sort_product,
                        },
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Membuat produk di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi add produk.
         */
        addProduct(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/product', data)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil company di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get company.
         */
        getCompany(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/company')
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Mengambil user di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi get user.
         */
        getUser(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .get('/user')
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Memperbarui user di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi update user.
         */
        updateUser(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .put(`/user/${data.id}`, {
                        jenis_kelamin: data.jenis_kelamin,
                        tanggal_lahir: data.tanggal_lahir,
                        phone: data.phone,
                        // alamat: data.alamat,
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Memperbarui company di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi update company.
         */
        updateCompany(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .put('/company', {
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        description: data.description,
                        alamat: data.alamat,
                        location_source: data.location_source,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        geoapify_place_id: data.geoapify_place_id,
                        formatted_address: data.formatted_address,
                        address_detail: data.address_detail,
                    })
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menghapus gambar user di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi delete gambar user.
         */
        deleteImageUser(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .delete(`/user/image`, {
                        params: {
                            img: data.img,
                        },
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menghapus gambar company di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi delete gambar company.
         */
        deleteImageCompany(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .delete('/company/image')
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store upload image user di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi upload gambar user.
         */
        uploadImageUser(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/user/image', data)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /**
         * Menjalankan alur store upload image company di modul store, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} context Context action Vuex untuk operasi store saat ini.
         * @param {*} data Payload yang digunakan oleh operasi saat ini.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi upload gambar company.
         */
        uploadImageCompany(context, data) {
            return new Promise((resolve, reject) => {
                axios
                    .post('/company/image', data)
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
    },
});
