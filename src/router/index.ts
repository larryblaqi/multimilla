import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TransactionHistoryView from '../views/TransactionHistoryView.vue'
import AirtimeView from '../views/AirtimeView.vue'
import DataView from '../views/DataView.vue'
import CardsView from '../views/CardsView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import TvView from '../views/TvView.vue'
import FinanceView from '../views/FinanceView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import BankView from '../views/BankView.vue'
import BillPayment from '../views/BillPayment.vue'
import WithdrawView from '../views/WithdrawView.vue'
import RecoverView from '../views/RecoverView.vue'
import AccountPinPage from '../views/AccountPinPage.vue'
import ElectricityView from '../views/ElectricityView.vue'
import TransactionSummaryView from '../views/TransactionSummaryView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import ResetPinView from '../views/ResetPinView.vue'
import ResetPhoneView from '../views/ResetPhoneView.vue'
import ResetEmailView from '../views/ResetEmailView.vue'
import VerifyNinView from '../views/VerifyNinView.vue'
import LegalView from '../views/LegalView.vue'
import DeactivateAccountView from '../views/DeactivateAccountView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import LoanView from '../views/LoanView.vue'
import FixedDepositView from '../views/FixedDepositView.vue'
import AdminAdvertisementView from '../views/AdminAdvertisementView.vue'
import AdminProfileView from '../views/AdminProfileView.vue'

import DashboardLayout from '../layouts/DashboardLayouts.vue';


import { authMiddleware } from '../middlewares';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,

    },
    {
      path: '/login',
      name: 'login-auth',
      component: LoginView,

    },
    {
      path: '/join',
      name: 'join',
      component: RegisterView,

    },
    {
      path: '/account-pin',
      name: 'account-pin',
      component: AccountPinPage,

    },
    {
      path: '/recover',
      name: 'recover',
      component: RecoverView
    },
    {
      path: '/wallet',
      component: DashboardLayout,
      beforeEnter: authMiddleware,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: { title: 'Overview', transition: 'slide-right' },
        },
        {
          path: 'airtime',
          name: 'airtime',
          component: AirtimeView
        },
        {
          path: 'data',
          name: 'data',
          component: DataView
        },
        {
          path: 'tv',
          name: 'tv',
          component: TvView
        },
        {
          path: 'finance',
          name: 'finance',
          component: FinanceView
        },
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView
        },
        {
          path: 'banks',
          name: 'banks',
          component: BankView
        },
        {
          path: 'bill-payment',
          name: 'bill-payment',
          component: BillPayment
        },
        {
          path: 'withdraw',
          name: 'withdraw',
          component: WithdrawView
        },
        {
          path: 'electricity',
          name: 'electricity',
          component: ElectricityView
        },
        {
          path: '/transaction/:id',
          name: 'transaction',
          component: TransactionSummaryView
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: ResetPasswordView
        },
        {
          path: 'reset-pin',
          name: 'reset-pin',
          component: ResetPinView
        },
        {
          path: 'reset-phone',
          name: 'reset-phone',
          component: ResetPhoneView
        },
        {
          path: 'reset-email',
          name: 'reset-email',
          component: ResetEmailView
        },
        {
          path: 'verify-nin',
          name: 'verify-nin',
          component: VerifyNinView
        },
        {
          path: 'legal',
          name: 'legal',
          component: LegalView
        },
        {
          path: 'deactivate-account',
          name: 'deactivate-account',
          component: DeactivateAccountView
        },
        {
          path: 'loan',
          name: 'loan',
          component: LoanView
        },
        {
          path: 'fixed-deposit',
          name: 'fixed-deposit',
          component: FixedDepositView
        },
      ]

    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionHistoryView,
      beforeEnter: authMiddleware
    },
    {
      path: '/cards',
      name: 'cards',
      component: CardsView,
      beforeEnter: authMiddleware
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationsView,
      beforeEnter: authMiddleware
    },
    {
      path: '/admin/advertisements',
      name: 'admin-advertisements',
      component: AdminAdvertisementView,
      beforeEnter: authMiddleware
    },
    {
      path: '/admin/profile',
      name: 'admin-profile',
      component: AdminProfileView,
      beforeEnter: authMiddleware
    },
    // Catch-all route for 404 handling
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }

  ]
})

export default router