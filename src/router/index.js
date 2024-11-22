import { createRouter, createWebHistory } from 'vue-router'
import axios from '@/axios';
import store from '@/store';
import global from '@/global';
import PersonImage from "@/assets/img/person.png";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior(to, from, savedPosition) {
    if(to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
  },

  routes: [
    /* NO AUTH */
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/noauth/RegisterView.vue'),
      meta: {public: true}
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/noauth/LoginView.vue'),
      meta: {public: true}
    },
    /* NO AUTH */

    /* AUTH */
    {
      path: '/',
      name: 'home',
      component: () => import('../views/auth/HomeView.vue'),
      meta: {public: false}
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/auth/ProfileView.vue'),
      meta: {public: false}
    },
    {
      path: '/product',
      name: 'product',
      component: () => import('../views/auth/ProductView.vue'),
      meta: {public: false}
    },
    {
      path: '/belanja',
      name: 'belanja',
      component: () => import('../views/auth/BelanjaView.vue'),
      meta: {public: false}
    },
    {
      path: '/keranjang',
      name: 'keranjang',
      component: () => import('../views/auth/KeranjangView.vue'),
      meta: {public: false}
    },
    {
      path: '/invoice',
      name: 'invoice',
      component: () => import('../views/auth/InvoiceView.vue'),
      meta: {public: false}
    }
    /* AUTH */
  ],
});

router.beforeEach((to, from, next) => {
  /**CLOSE SIDEBAR */
  global.isSidebarOpen = false;
  /**CLOSE SIDEBAR */

  /* REFRESH GET ITEM LOCALSTORAGE */
  store.dispatch('fetchTokenFromLocalStorage');
  store.dispatch('fetchUserFromLocalStorage');
  /* REFRESH GET ITEM LOCALSTORAGE */

  // ambil token
  const token = localStorage.getItem('token');

  // kondisi ketika belum login token masih belum ada
  if(!to.meta.public && !token) {
    global.isAuth = false;
    next({name: 'login'});
  }
  // jika path di url mengarahkan ke /register dan /login
  // kondisi ketika mau ke url register dan login
  else if (to.path === '/register' || to.path === '/login') {
    // kondisi sudah ada token, mau ke url register dan login, 
    if(token) {
      // cek validasi tokennya
      axios.get('/tokenvalidation')
           // jika token valid, maka paksa di ke wilayah yang udah di autentikasi
           .then(response => {
            // console.log(response)
            if(response.status === 200 && response.data.message === 'token valid') {
              // get image
              const user = JSON.parse(localStorage.getItem('user'));
              if(user) {
                global.personImage = user.img ? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${user.img}` : PersonImage;
              }
              // get image
              
              global.isAuth = true;
              next({name: 'home'})
            }
           })
           // jika token tidak valid, maka yaudah biarkan saja ke halaman register atau login 
           .catch(error => {
            // console.error(error);
            if(error.response.status === 401 && error.response.data.message === 'Unauthenticated.') {
              global.isAuth = false;
              next();
            }
           }); 
    }
    // kondisi ketika belum ada token, mau ke url register atau login
    else {
      global.isAuth = false;
      next();
    }
  }
  // kondisi masuk ke url selain /register dan /login dan memliki token
  else {
    // cek validasi tokennya
    axios.get('/tokenvalidation')
         // jika token valid, maka yaudah biarkan saja ke halaman yang dia ingin tuju
         .then(response => {
          // console.log(response)
          if(response.status === 200 && response.data.message === 'token valid'){
            // get image
            const user = JSON.parse(localStorage.getItem('user'));
            if(user) {
              global.personImage = user.img ? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${user.img}` : PersonImage;
            }
            // get image

            global.isAuth = true;
            next();
          }
         })
         // jika token tidak valid, maka paksa di ke wilayah yang belm di autentikasi
         .catch(error => {
          // console.error(error);
          if(error.response.status === 401 && error.response.data.message === 'Unauthenticated.') {
            global.isAuth = false;
            next({name: 'login'});
          }
         });  
  }
});

export default router
