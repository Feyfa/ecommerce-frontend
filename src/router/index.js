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
    all: [
        'rekening',
        'saldo',
        'account',
        'settings',
        'settings_profile',
        'settings_addresses',
        'settings_store',
        'settings_balance',
        'settings_bank_accounts',
        'settings_security',
        'settings_audit_log',
        'settings_notifications',
        'settings_support_report',
    ],
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
 * Route lama Akun Saya diarahkan ke struktur Settings baru agar deep link tetap aman.
 */
const resolveLegacyAccountRoute = (to) => {
    const routeByTab = {
        profile: 'settings_profile',
        alamat: 'settings_addresses',
        saldo: 'settings_balance',
        rekening: 'settings_bank_accounts',
    };

    return {
        name: routeByTab[to.query.tab] || 'settings_profile',
        replace: true,
    };
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
        path: '/forgot-password',
        name: 'forgot_password',
        component: () => import('../views/noauth/ForgotPasswordView.vue'),
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
        redirect: {name: 'settings_bank_accounts'},
        meta: {public: false}
    },
    {
        path: '/saldo',
        name: 'saldo',
        redirect: {name: 'settings_balance'},
        meta: {public: false}
    },
    {
        path: '/account',
        name: 'account',
        redirect: resolveLegacyAccountRoute,
        meta: {public: false}
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/auth/settings/SettingsView.vue'),
        redirect: {name: 'settings_profile'},
        meta: {public: false},
        children: [
            {
                path: 'profile',
                name: 'settings_profile',
                component: () => import('../views/auth/buyer/UserProfileView.vue'),
                props: {embedded: true, showAlamat: false},
                meta: {
                    public: false,
                    settingsTitle: 'Profil Pengguna',
                    settingsDescription: 'Kelola data dasar akun yang digunakan untuk identitas dan transaksi.'
                }
            },
            {
                path: 'addresses',
                name: 'settings_addresses',
                component: () => import('../components/user-profile/Alamat.vue'),
                props: {flat: true, showTitle: false},
                meta: {
                    public: false,
                    settingsTitle: 'Alamat',
                    settingsDescription: 'Kelola alamat pengiriman yang digunakan saat bertransaksi.'
                }
            },
            {
                path: 'store',
                name: 'settings_store',
                component: () => import('../views/auth/seller/CompanyProfileView.vue'),
                props: {embedded: true},
                meta: {
                    public: false,
                    settingsTitle: 'Profil Toko',
                    settingsDescription: 'Kelola informasi toko yang tampil untuk pembeli.'
                }
            },
            {
                path: 'balance',
                name: 'settings_balance',
                component: () => import('../views/auth/SaldoView.vue'),
                props: {embedded: true},
                meta: {
                    public: false,
                    settingsTitle: 'Saldo',
                    settingsDescription: 'Pantau saldo aktif, saldo refund, dan riwayat transaksi saldo.'
                }
            },
            {
                path: 'bank-accounts',
                name: 'settings_bank_accounts',
                component: () => import('../views/auth/PaymentView.vue'),
                props: {embedded: true},
                meta: {
                    public: false,
                    settingsTitle: 'Rekening Bank',
                    settingsDescription: 'Kelola rekening bank yang digunakan untuk penarikan saldo.'
                }
            },
            {
                path: 'security',
                name: 'settings_security',
                component: () => import('../views/auth/settings/SecurityView.vue'),
                meta: {
                    public: false,
                    settingsTitle: 'Keamanan',
                    settingsDescription: 'Kelola cara masuk, perlindungan akun, dan perangkat yang sedang aktif.'
                }
            },
            {
                path: 'audit-log',
                name: 'settings_audit_log',
                component: () => import('../views/auth/settings/ComingSoonView.vue'),
                meta: {
                    public: false,
                    settingsTitle: 'Audit Log',
                    settingsDescription: 'Fitur audit log sedang disiapkan untuk menampilkan riwayat aktivitas penting pada akun Anda.'
                }
            },
            {
                path: 'notifications',
                name: 'settings_notifications',
                component: () => import('../views/auth/settings/ComingSoonView.vue'),
                meta: {
                    public: false,
                    settingsTitle: 'Notifikasi',
                    settingsDescription: 'Fitur notifikasi sedang disiapkan untuk mengatur preferensi email, transaksi, dan informasi aplikasi.'
                }
            },
            {
                path: 'support-report',
                name: 'settings_support_report',
                component: () => import('../views/auth/settings/ComingSoonView.vue'),
                meta: {
                    public: false,
                    settingsTitle: 'Support Report',
                    settingsDescription: 'Fitur support report sedang disiapkan untuk membuat laporan masalah dan memantau status bantuan.'
                }
            },
        ]
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
