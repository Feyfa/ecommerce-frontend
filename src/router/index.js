import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store';
import global from '@/global';
import { clearAuthSession, isUnauthenticatedResponse, showSessionExpiredWarning, syncClearedAuthSessionToStore } from '@/authSession';
import {
    bootstrapResolvedAuthSession,
    clearResolvedAuthSessionTtl,
    getBrowserAuthPresence,
    hasFreshResolvedAuthSession,
    resolveDefaultAuthenticatedRouteName
} from '@/authBridge';

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
    {
        path: '/auth/callback',
        name: 'auth_callback',
        component: () => import('../views/noauth/ClerkCallbackView.vue'),
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

/**
 * Setelah sesi terverifikasi, route tetap divalidasi terhadap mode akun aktif per tab.
 */
const resolveProtectedRouteByActiveAccountMode = (to) => {
    const activeAccountMode = getActiveAccountMode();

    if(activeAccountMode == 'buyer' && (!routerAccountType.buyer.includes(to.name) && !routerAccountType.all.includes(to.name)))
        return {name: 'buyer_home'};

    if(activeAccountMode == 'seller' && (!routerAccountType.seller.includes(to.name) && !routerAccountType.all.includes(to.name)))
        return {name: 'seller_dashboard'};

    return true;
};

router.beforeEach(async to => {
    /**CLOSE SIDEBAR */
    global.isSidebarOpen = false;
    /**CLOSE SIDEBAR */

    /* REFRESH GET ITEM LOCALSTORAGE */
    store.dispatch('fetchUserFromLocalStorage');
    store.dispatch('fetchCompanyFromLocalStorage');
    store.dispatch('fetchActiveAccountModeFromSessionStorage');
    /* REFRESH GET ITEM LOCALSTORAGE */

    /* step 1: callback auth tidak boleh dipotong guard lain sebelum provider selesai memproses redirect */
    if(to.name === 'auth_callback') {
        global.isAuth = false;
        return true;
    }
    /* step 1 */

    /* step 2: saat logout berjalan, jangan bootstrap ulang halaman protected lama */
    if(global.isLoggingOut) {
        if(to.meta.public)
            return true;

        return {name: 'login'};
    }
    /* step 2 */

    /* step 3: cek petunjuk sesi dari provider auth utama */
    const browserAuthPresence = await getBrowserAuthPresence();

    if(!browserAuthPresence.hasAnySession) {
        clearResolvedAuthSessionTtl();
        clearAuthSession();
        syncClearedAuthSessionToStore(store);
        global.isAuth = false;

        if(to.meta.public)
            return true;

        return {name: 'login'};
    }
    /* step 3 */

    /* step 4: bootstrap session final dari backend melalui /auth/me */
    try {
        const canUseFreshAuthSession = hasFreshResolvedAuthSession() && Boolean(store.getters.user?.id);

        if(!canUseFreshAuthSession)
            await bootstrapResolvedAuthSession(store);
        else
            global.isAuth = true;

        if(to.meta.public)
            return {name: resolveDefaultAuthenticatedRouteName(store)};

        return resolveProtectedRouteByActiveAccountMode(to);
    } catch(error) {
        if(isUnauthenticatedResponse(error)) {
            clearResolvedAuthSessionTtl();
            clearAuthSession();
            syncClearedAuthSessionToStore(store);

            if(!to.meta.public)
                await showSessionExpiredWarning();
        }

        global.isAuth = false;

        if(to.meta.public)
            return true;

        return {name: 'login'};
    }
    /* step 4 */
});

export default router
