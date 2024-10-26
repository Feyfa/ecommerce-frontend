import { createStore } from "vuex";
import axios from "@/axios";

export default createStore({
  state: {
    token: '',
    user: ''
  },

  getters: {
    token: state => state.token,
    user: state => state.user,
  },

  actions: {
    fetchTokenFromLocalStorage() {
      this.state.token = localStorage.getItem('token');
    },

    fetchUserFromLocalStorage() {
      this.state.user = JSON.parse(localStorage.getItem('user'));
    },

    getCountries(context, data) {
      return new Promise((resolve, reject) => {
        axios.get('/countries')
             .then(response => {
              resolve(response);
             })
             .catch(error => {
              reject(error);
             });
      });
    },

    getStates(context, data) {
      return new Promise((resolve, reject) => {
        axios.get('/states', {
          params: {
            country_id: data.country_id
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

    getCites(context, data) {
      return new Promise((resolve, reject) => {
        axios.get('/cities', {
          params: {
            city_id: data.city_id
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

    getTopupBalance(context, data) {
      return new Promise((resolve, reject) => {
        axios.get('/topup/get-topup-balance', {
          params: {
            user_id_seller: data.user_id_seller,
            page: data.page,
          }
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      })
    },

    storeTopup(context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/topup/store', {
          user_id_seller: data.user_id_seller,
          select_payment: data.select_payment,
          amount: data.amount,
          stripe_process_fee: data.stripe_process_fee,
          total_amount: data.total_amount,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      });
    },

    getPaymentList(context, data) {
      return new Promise((resolve, reject) => {
        axios.get('/topup/get-payment-list', {
          params: {
            user_id_seller: data.user_id_seller
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

    replaceAch(context, data) {
      return new Promise((resolve, reject) => {
        axios.put('/stripe/replace-ach', {
          user_id_seller: data.user_id_seller,
          holder_type: data.holder_type,
          holder_name: data.holder_name,
          routing_number: data.routing_number,
          account_number: data.account_number,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error=> {
          reject(error);
        })
      });
    },

    deleteAch(context, data) {
      return new Promise((resolve, reject) => {
        axios.delete('/stripe/delete-ach', {
          data: {
            user_id_seller: data.user_id_seller
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

    verifyAch(context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/stripe/verify-ach', {
          user_id_seller: data.user_id_seller,
          micro_deposite_1: data.micro_deposite_1,
          micro_deposite_2: data.micro_deposite_2,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      });
    },

    createAch(context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/stripe/create-ach', {
          user_id_seller: data.user_id_seller,
          holder_type: data.holder_type,
          holder_name: data.holder_name,
          routing_number: data.routing_number,
          account_number: data.account_number,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
      });
    },

    getInfoPaymentMethod(context, data) {
      return new Promise((resolve, reject) => {
        axios.get('/stripe/get-info-payment-method', {
          params: {
            user_id_seller: data.user_id_seller
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

    createCreditCard(context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/stripe/create-credit-card', {
          user_id_seller: data.user_id_seller,
          token: data.token,
          zip: data.zip,
          email: data.email,
          card_holder_name: data.card_holder_name,
          address: data.address,
          country: data.country,
          state: data.state,
          city: data.city,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      });
    },

    replaceCreditCard(context, data) {
      return new Promise((resolve, reject) => {
        axios.put('/stripe/replace-credit-card', {
          user_id_seller: data.user_id_seller,
          token: data.token,
          zip: data.zip,
          email: data.email,
          card_holder_name: data.card_holder_name,
          address: data.address,
          country: data.country,
          state: data.state,
          city: data.city,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      });
    },

    checkConnectAccountStripe(context, data) {
      return new Promise((resolve, reject) => {
        axios.get('/stripe/check-connect-account', {
          params: {
            user_id_seller: data.user_id_seller,
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

    connectAccountStripe(context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/stripe/connect-account', {
          user_id_seller: data.user_id_seller,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      });
    },

    checkOrderId(context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/invoice/order-id-exists', {
          order_id: data.order_id,
          user_id_buyer: data.user_id_buyer,
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

    createTokenMidtrans(context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/payment/createtokenmidtrans', {
          user_id_buyer: data.user_id_buyer,
          user_name_buyer: data.user_name_buyer,
        })
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error);
        })
      })
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
        axios.get(`/belanja/${data.user_id_seller}`)
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
        axios.get(`/product/${data.user_id_seller}`)
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

    updateUser(context, data) {
      return new Promise((resolve, reject) => {
        axios.put(`/user/${data.id}`, {
          name: data.name,
          email: data.email,
          jenis_kelamin: data.jenis_kelamin,
          tanggal_lahir: data.tanggal_lahir,
          phone: data.phone,
          tfa: data.tfa,
          alamat: data.alamat,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      });
    },

    deleteImage(context, data) {
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