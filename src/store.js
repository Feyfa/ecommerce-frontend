import { createStore } from "vuex";
import axios from "@/axios";

export default createStore({
    state: {
        token: '',
        user: '',
        company: '',
    },

    getters: {
        token: state => state.token,
        user: state => state.user,
        company: state => state.company,
    },

    actions: {
        fetchTokenFromLocalStorage() {
            this.state.token = localStorage.getItem('token');
        },

        fetchUserFromLocalStorage() {
            this.state.user = JSON.parse(localStorage.getItem('user'));
        },

        fetchCompanyFromLocalStorage() {
            this.state.company = JSON.parse(localStorage.getItem('company'));
        },

        withdrawSaldo(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/saldo-withdraw', {
                    paymentAccount: data.paymentAccount,
                    wihtdrawPrice: data.wihtdrawPrice,
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getSaldoHistory(context, data) {
            return new Promise((resolve, reject) => {
                axios.get('/saldo-history', {
                    params: {
                        startDate: data.startDate,
                        endDate: data.endDate,
                        saldo_history_current_ids: data.saldo_history_current_ids
                    }
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getSaldo(context, data) {
            return new Promise((resolve, reject) => {
                axios.get('/saldo')
                     .then(response => {
                        resolve(response.data);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        approvedTransaction(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/transaction/approved', {
                    transaction_user_id: data.transaction_user_id,
                    user_type: data.user_type,
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        simulateChargeVirtualAccount(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/payment/simulate/charge-virtual-account', {
                    payment_slug: data.payment_slug,
                    payment_account: data.payment_account,
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getTransactions(context, data) {
            return new Promise((resolve, reject) => {
                axios.get(`/transaction`, {
                    params: {
                        user_type: data.user_type
                    }
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        deletePayment(context, data) {
            return new Promise((resolve, reject) => {
                axios.delete(`/payment/${data.id}`, {
                    data: {
                        searchAlamat: data.searchAlamat
                    }
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },

        addPayment(context, data) {
        return new Promise((resolve, reject) => {
            axios.post('/payment', {
                paymentName: data.paymentName,
                paymentSlug: data.paymentSlug,
                paymentAccount: data.paymentAccount,
                paymentUsername: data.paymentUsername,
                searchPayment: data.searchPayment,
            })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            })
        });
        },

        validatePaymentAccount(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/payment/account/validate', {
                    paymentAccount: data.paymentAccount,
                    paymentSlug: data.paymentSlug,
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getPaymentList(context, data) {
            return new Promise((resolve, reject) => {
                axios.get('/payment/list')
                     .then(response => {
                        resolve(response.data);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },  

        switchAccountType(context, data) {
            return new Promise((resolve, reject) => {
                axios.put('/user/account/type')
                     .then(response => {
                        resolve(response.data)
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        processCheckout(context, data) {
            return new Promise((resolve, reject) => {
                axios.post(`/checkout/process`, {
                    checkouts: data.checkouts,
                    kurirs: data.kurirs,
                    noteds: data.noteds,
                    alamat: data.alamat,
                    payment_method: data.paymentMethod,
                    payment_slug: data.paymentSlug,
                    payment_name: data.paymentName,
                    price: data.price,
                })
                .then(response => {
                    resolve(response.data)
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        editAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios.put(`/alamat/buyer/${data.id}`, {
                    place: data.place,
                    name: data.name,
                    phone: data.phone,
                    alamat: data.alamat,
                    enable: data.enable,
                    searchAlamat: data.searchAlamat
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        setEnableAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios.put(`/alamat-enable/buyer/${data.id}`, {
                    searchAlamat: data.searchAlamat
                })
                .then(response => {
                    resolve(response.data);
                })  
                .catch(error => {
                    reject(error);
                })
            })
        },

        deleteAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios.delete(`/alamat/buyer/${data.id}`, {
                    data: {
                        searchAlamat: data.searchAlamat
                    }
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        addAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/alamat/buyer', {
                    place: data.place,
                    name: data.name,
                    phone: data.phone,
                    alamat: data.alamat,
                    enable: data.enable,
                    searchAlamat: data.searchAlamat
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getAlamatBuyer(context, data) {
            return new Promise((resolve, reject) => {
                axios.get('/alamat/buyer', {
                    params: {
                        searchAlamat: data.searchAlamat
                    }
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getPayment(context, data) {
            return new Promise((resolve, reject) => {
                axios.get('/payment', {
                    params: {
                        searchPayment: data.searchPayment
                    }
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getDataCheckout(context, data) {
            return new Promise((resolve, reject) => {
                axios.get(`/checkout/data`)
                     .then(response => {
                        resolve(response.data);
                     })
                     .catch(error => {
                        reject(error);
                     });
            });
        },

        validateCheckout(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/keranjang/validate/checkout', {
                    product_ids: data.product_ids,
                    user_id_buyer: data.user_id_buyer
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        changePassword(context, data) {
            return new Promise((resolve, reject) => {
                axios.put('/user/change/password', {
                    id: data.id,
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getInvoice(context, data) {
            return new Promise((resolve, reject) => {
                axios.get('/invoice', {
                    params: {
                        user_id_buyer: data.user_id_buyer,
                        filter: data.filter,
                    }
                })
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error)
                })
            });
        },

        deleteTransaction(context, data) {
            return new Promise((resolve, reject) => {
                axios.delete(`/transaction/${data.user_id_buyer}/${data.order_id}`)
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        storeTotalKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/keranjang/total/change', {
                    user_id_buyer: data.user_id_buyer,
                    product_id: data.product_id,
                    total: data.total,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        minusTotalKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/keranjang/total/minus', {
                    user_id_buyer: data.user_id_buyer,
                    product_id: data.product_id,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        plusTotalKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/keranjang/total/plus', {
                    user_id_buyer: data.user_id_buyer,
                    product_id: data.product_id,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        deleteKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios.delete(`/keranjang/${data.user_id_buyer}/${data.product_id}`)
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        checkedKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios.post(`/keranjang/checked`, {
                    user_id_buyer: data.user_id_buyer,
                    product_id: data.product_id,
                    checked: data.checked,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        checkedKeranjangGroup(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/keranjang/checked/group', {
                    user_id_buyer: data.user_id_buyer,
                    checked: data.checked,
                    user_id_seller: data.user_id_seller,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },

        getKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios.get(`/keranjang/${data.user_id_buyer}`)
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        addKeranjang(context, data) {
            return new Promise((resolve, reject) => {
                axios.post(`/keranjang`, {
                    user_id_seller: data.user_id_seller,
                    user_id_buyer: data.user_id_buyer,
                    product_id: data.product_id,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        getBelanja(context, data) {
            return new Promise((resolve, reject) => {
                axios.get(`/belanja/${data.user_id_seller}`, {
                    params: {
                        products_current_id: data.products_current_id,
                        search_product: data.search_product
                    }
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        editProduct(context, data) {
            return new Promise((resolve, reject) => {
                // override method post to put
                axios.post(`/product/${data.get('id')}`, data)
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        getProduct(context, data) {
            return new Promise((resolve, reject) => {
                axios.get(`/product/${data.user_id_seller}/${data.id_product}`)
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        deleteProduct(context, data) {
            return new Promise((resolve, reject) => {
                axios.delete(`/product/${data.user_id_seller}/${data.id_product}`)
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        getProducts(context, data) {
            return new Promise((resolve, reject) => {
                axios.get(`/product/${data.user_id_seller}`, {
                    params: {
                        products_current_id: data.products_current_id,
                        search_product: data.search_product,
                    }
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        addProduct(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/product', data)
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        getCompany(context, data) {
            return new Promise((resolve, reject) => {
                axios.get('/company')
                     .then(response => {
                        resolve(response.data);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        getUser(context, data) {
            return new Promise((resolve, reject) => {
                axios.get('/user')
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        updateUser(context, data) {
            return new Promise((resolve, reject) => {
                axios.put(`/user/${data.id}`, {
                    name: data.name,
                    email: data.email,
                    jenis_kelamin: data.jenis_kelamin,
                    tanggal_lahir: data.tanggal_lahir,
                    phone: data.phone,
                    tfa: data.tfa,
                    // alamat: data.alamat,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        updateCompany(context, data) {
            return new Promise((resolve, reject) => {
                axios.put('/company', {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    description: data.description,
                    alamat: data.alamat,
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                })
            });
        },

        deleteImageUser(context, data) {
            return new Promise((resolve, reject) => {
                axios.delete(`/user/image`, {
                    params: {
                        img: data.img
                    }
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },

        deleteImageCompany(context, data) {
            return new Promise((resolve, reject) => {
                axios.delete('/company/image')
                     .then(response => {
                        resolve(response.data)
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        uploadImageUser(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/user/image', data)
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            })
        },

        uploadImageCompany(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/company/image', data)
                     .then(response => {
                        resolve(response.data);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        logoutSubmit(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/logout')
                     .then(response => {
                        resolve(response);
                     })
                     .catch(error => {
                        reject(error);
                     })
            });
        },

        loginSubmit(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/login', {
                    email: data.email,
                    password: data.password,
                    type: data.type,
                    otpSecretKey: data.otpSecretKey,
                    otpCode: data.otpCode,
                    now: data.now,
                    expired: data.expired,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        },

        registerSubmit(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/register', {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
            });
        }
    }
})