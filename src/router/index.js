import { createRouter, createWebHistory } from 'vue-router'
import axios from '@/axios';
import store from '@/store';
import global from '@/global';

const routerAccountType = {
    all: ['rekening','saldo'],
    buyer: ['buyer_user','buyer_home','buyer_belanja', 'buyer_keranjang','buyer_transaction','buyer_checkout','buyer_bayar'],
    seller: ['seller_company','seller_dashboard','seller_product','seller_transaction']
};

const routes = [
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
        path: '/buyer/beranda',
        name: 'buyer_home',
        component: () => import('../views/auth/buyer/HomeView.vue'),
        meta: {public: false}
    },
    {
        path: '/seller/dashboard',
        name: 'seller_dashboard',
        component: () => import('../views/auth/seller/DashboardView.vue'),
        meta: {public: false}
    },
    {
        path: '/buyer/user',
        name: 'buyer_user',
        component: () => import('../views/auth/buyer/UserProfileView.vue'),
        meta: {public: false}
    },
    {
        path: '/seller/company',
        name: 'seller_company',
        component: () => import('../views/auth/seller/CompanyProfileView.vue'),
        meta: {public: false}
    },
    {
        path: '/seller/product',
        name: 'seller_product',
        component: () => import('../views/auth/seller/ProductView.vue'),
        meta: {public: false}
    },
    {
        path: '/buyer/belanja',
        name: 'buyer_belanja',
        component: () => import('../views/auth/buyer/BelanjaView.vue'),
        meta: {public: false}
    },
    {
        path: '/buyer/keranjang',
        name: 'buyer_keranjang',
        component: () => import('../views/auth/buyer/KeranjangView.vue'),
        meta: {public: false}
    },
    {
        path: '/buyer/transaction',
        name: 'buyer_transaction',
        component: () => import('../views/auth/buyer/TransactionView.vue'),
        meta: {public: false}
    },
    {
        path: '/seller/transaction',
        name: 'seller_transaction',
        component: () => import('../views/auth/seller/TransactionView.vue'),
        meta: {public: false}
    },
    {
        path: '/buyer/checkout',
        name: 'buyer_checkout',
        component: () => import('../views/auth/buyer/CheckoutView.vue'),
        meta: {public: false}
    },
    {
        path: '/buyer/bayar',
        name: 'buyer_bayar',
        component: () => import('../views/auth/buyer/BayarView.vue'),
        meta: {public: false}
    },
    {
        path: '/rekening',
        name: 'rekening',
        component: () => import('../views/auth/PaymentView.vue'),
        meta: {public: false}
    },
    {
        path: '/saldo',
        name: 'saldo',
        component: () => import('../views/auth/SaldoView.vue'),
        meta: {public: false}
    },
    /* AUTH */

    /* NOT FOUND */
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        beforeEnter(to, from, next) {
            if(store.getters.user.account_type == 'buyer') {
                next({name: 'buyer_home'})
            } else {
                next({name: 'seller_dashboard'})
            }
        }
    }
    /* NOT FOUND */
];

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

    routes: routes
});

const validationToken = (to, from, next) => {
    axios
    .get('/tokenvalidation') // cek validasi tokennya
    .then(response => { // jika token valid, maka paksa di ke wilayah yang udah di autentikasi
        // console.log(response)
        if(response.status === 200 && response.data.message === 'token valid') {
            // get image
            const user = JSON.parse(localStorage.getItem('user'));
            const company = JSON.parse(localStorage.getItem('company'));
            if(user) {
                global.personImage = user.img ? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${user.img}` : '/img/person.png';
            }
            if(company) {
                global.companyImage = company.img ? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${company.img}` : '/img/company.png';
            }
            // get image
            
            global.isAuth = true;

            //validation route by account type 
            if(user.account_type == 'buyer' && (!routerAccountType.buyer.includes(to.name) && !routerAccountType.all.includes(to.name))) {
                next({name: 'buyer_home'});
            } else if(user.account_type == 'seller' && (!routerAccountType.seller.includes(to.name) && !routerAccountType.all.includes(to.name))) {
                next({name: 'seller_dashboard'});
            } else {
                next();
            }
            //validation route by account type 
        }
    })
    .catch(error => { // jika token tidak valid, maka yaudah biarkan saja ke halaman register atau login 
        console.error(error);
        if(error.response.status === 401 && error.response.data.message === 'Unauthenticated.') {
            global.isAuth = false;
            next();
        }
    }); 
};

router.beforeEach((to, from, next) => {
    /**CLOSE SIDEBAR */
    global.isSidebarOpen = false;
    /**CLOSE SIDEBAR */

    /* REFRESH GET ITEM LOCALSTORAGE */
    store.dispatch('fetchTokenFromLocalStorage');
    store.dispatch('fetchUserFromLocalStorage');
    store.dispatch('fetchCompanyFromLocalStorage');
    /* REFRESH GET ITEM LOCALSTORAGE */

    // ambil token
    const token = localStorage.getItem('token');
    
    if(!to.meta.public && !token) { // kondisi ketika belum login token masih belum ada
        global.isAuth = false;
        next({name: 'login'});
    } else if(to.path === '/register' || to.path === '/login') { // kondisi ketika mau ke url register dan login
        if(token) { // kondisi sudah ada token, mau ke url register dan login,  
            validationToken(to, from, next);
        } else { // kondisi ketika belum ada token, mau ke url register atau login
            global.isAuth = false;
            next();
        }
    } else { // kondisi masuk ke url selain /register dan /login dan memliki token
        validationToken(to, from, next);
    }
});

export default router
