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
        axios.post(`/keranjang/checked/${data.user_id_buyer}/${data.product_id}/${data.checked}`)
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
        axios.post(`/keranjang/${data.user_id_seller}/${data.user_id_buyer}/${data.product_id}`)
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