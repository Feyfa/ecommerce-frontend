import { createRouter, createWebHistory } from 'vue-router'
import axios from '@/axios';
import store from '@/store';
import global from '@/global';
import { clearAuthSession, isUnauthenticatedResponse, showSessionExpiredWarning, syncClearedAuthSessionToStore } from '@/authSession';

const routerAccountType = {
    all: ['rekening','saldo','account'],
    buyer: ['buyer_user','buyer_home','buyer_belanja', 'buyer_keranjang','buyer_transaction','buyer_checkout','buyer_bayar'],
    seller: ['seller_company','seller_dashboard','seller_product','seller_transaction']
};

const defaultRouteByAccountMode = {
    buyer: 'buyer_home',
    seller: 'seller_dashboard'
};

const getActiveAccountMode = () => {
    const activeAccountMode = store.getters.activeAccountMode || sessionStorage.getItem('active_account_mode');

    if(['buyer', 'seller'].includes(activeAccountMode))
        return activeAccountMode;

    store.dispatch('setActiveAccountMode', 'buyer');
    return 'buyer';
};

/**
 * Mengarahkan user setelah sesi login lokal dibersihkan.
 */
const redirectAfterClearedSession = (to, next) => {
    if(to.meta.public) {
        next();
        return;
    }

    next({name: 'login'});
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
    {
        path: '/account',
        name: 'account',
        component: () => import('../views/auth/AccountView.vue'),
        meta: {public: false}
    },
    /* AUTH */

    /* NOT FOUND */
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        beforeEnter(to, from, next) {
            if(store.getters.user?.id) {
                next({name: defaultRouteByAccountMode[getActiveAccountMode()]})
            } else {
                next({name: 'login'})
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
    .get('/tokenvalidation', {skipAuthExpiredWarning: true}) // cek validasi tokennya
    .then(response => { // jika token valid, maka paksa di ke wilayah yang udah di autentikasi
        // console.log(response)
        if(response.status === 200 && response.data.message === 'token valid') {
            // get image
            const user = JSON.parse(localStorage.getItem('user'));
            const company = JSON.parse(localStorage.getItem('company'));

            if(!user?.id) {
                clearAuthSession();
                syncClearedAuthSessionToStore(store);
                redirectAfterClearedSession(to, next);
                return;
            }

            if(user) {
                global.personImage = user.img ? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${user.img}` : '/img/person.png';
            }
            if(company) {
                global.companyImage = company.img ? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${company.img}` : '/img/company.png';
            }
            // get image
            
            global.isAuth = true;

            //validation route by active account mode
            const activeAccountMode = getActiveAccountMode();
            if(activeAccountMode == 'buyer' && (!routerAccountType.buyer.includes(to.name) && !routerAccountType.all.includes(to.name))) {
                next({name: 'buyer_home'});
            } else if(activeAccountMode == 'seller' && (!routerAccountType.seller.includes(to.name) && !routerAccountType.all.includes(to.name))) {
                next({name: 'seller_dashboard'});
            } else {
                next();
            }
            //validation route by active account mode
        }
    })
    .catch(error => { // jika token tidak valid, maka yaudah biarkan saja ke halaman register atau login 
        console.error(error);
        if(isUnauthenticatedResponse(error)) {
            clearAuthSession();
            syncClearedAuthSessionToStore(store);
            showSessionExpiredWarning()
                .finally(() => {
                    redirectAfterClearedSession(to, next);
                });

            return;
        }

        if(to.meta.public) {
            global.isAuth = false;
            next();
        } else {
            next({name: 'login'});
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
    store.dispatch('fetchActiveAccountModeFromSessionStorage');
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
