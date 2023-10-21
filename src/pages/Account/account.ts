import { useUserStore } from '@/stores/user'

export default {
    orders: {
        displayText: 'myOrders',
        route: useAppConfig().routes.accountOrders,
        icon: 'mdi-shopping-outline'
    },
    profile: {
        displayText: 'profile',
        route: useAppConfig().routes.accountProfile,
        icon: 'mdi-account-outline'
    },
    logout: {
        displayText: 'logout',
        onClick: () => { useUserStore().logout() },
        icon: 'mdi-logout'
    },
}