import { defineStore } from 'pinia'
import { useHttp } from '../composables/useHttp'
import { handleAuthError } from '../utils/errorHandler'
import { useRouter } from 'vue-router'
import { ref, computed } from "vue";
import { Preferences } from '@capacitor/preferences';

export interface Customer {
    id?: number
    full_name?: string
}

export const useCustomerStore = defineStore('customer', () => {
    const customer = ref({} as any)
    const transactions = ref([] as any[])
    const providers = ref([] as any[])
    const packages = ref([] as any[])
    const accounts = ref([] as any[])
    const investments = ref([] as any[])
    const activities = ref([] as any[])
    const banks = ref([] as any[])
    const electricity = ref([] as any[])


    const notifications = ref([] as any[])
    const unreadNotifications = ref([] as any[])
    const dataProviders = ref([] as any[])
    const tvVariations = ref([] as any[])
    const dataPlans = ref([] as any[])

    //loaders
    const isLoadingProvider = ref(true)
    const isLoadingCustomerData = ref(true)
    const isLoadingDataVariations = ref(false)
    const isLoadingBanks = ref(false)
    const isLoadingElectricity = ref(false)

    async function fetchCustomer(force: boolean = false) {
        isLoadingCustomerData.value = true
        isLoadingBanks.value = true
        if (!force && customer.value && customer.value.id) {
            isLoadingCustomerData.value = false
            isLoadingBanks.value = false
            return customer.value
        }
        const { httpRequest } = useHttp()
        const router = useRouter()
        try {
            const response = await httpRequest('GET', `/customer/customer`)
            if (response.data.message === 'Unauthenticated.' || response.status === 401) {
                handleAuthError({ response: { status: 401, data: response.data }, message: 'Unauthenticated' }, router)
                return
            }
            customer.value = response.data.data
            transactions.value = customer?.value.transactions
            packages.value = customer?.value.pkgs
            notifications.value = customer?.value.notifications || []
            accounts.value = customer?.value.accounts
            investments.value = customer?.value.investments
            activities.value = customer?.value.activities
            isLoadingCustomerData.value = false
            
            // Load unread notifications from storage or initialize with all notifications
            await loadUnreadNotifications(customer?.value.notifications || [])
            
            // Run these API calls in parallel instead of sequentially
            Promise.all([
                fetchServiceDataIds(),
                fetchServiceAirtimeIds(),
                fetchBanks(),
                fetchElectrictyVariations()
            ]).catch(error => {
                console.error('Error fetching service data:', error)
            })
        } catch (error) {
            isLoadingCustomerData.value = false
            handleAuthError(error, router)
        }
    }

    async function fetchServiceAirtimeIds() {
        if (providers.value.length > 0) {
            console.log('Service airtime providers already fetched')
            return providers.value
        }
        const { httpRequest } = useHttp()
        const router = useRouter()
        try {
            const response = await httpRequest(
                "GET",
                `/customer/serviceVariations/airtime`
            );
            providers.value = response.data.content;
            isLoadingProvider.value = false
        } catch (error) {
            handleAuthError(error, router)
            isLoadingProvider.value = false

        }
    }

    async function fetchElectrictyVariations() {
        if (electricity.value.length > 0) {
            console.log('Service electricty providers already fetched')
            return electricity.value
        }
        const { httpRequest } = useHttp()
        const router = useRouter()
        try {
            const response = await httpRequest(
                "GET",
                `/customer/serviceVariations/electricity-bill`
            );
            electricity.value = response.data.content;
            isLoadingElectricity.value = false
        } catch (error) {
            handleAuthError(error, router)
            isLoadingElectricity.value = false

        }
    }


    async function fetchBanks() {
        if (banks.value.length > 0) {
            console.log('banks already fetched')
            return banks.value
        }
        const { httpRequest } = useHttp()
        const router = useRouter()
        try {
            const response = await httpRequest(
                "GET",
                `/customer/getBanks`
            );
            banks.value = response.data?.data || response.data || [];
            isLoadingBanks.value = false
        } catch (error) {
            handleAuthError(error, router)
            isLoadingBanks.value = false

        }
    }

    async function fetchServiceDataIds() {
        if (dataProviders.value.length > 0) {
            console.log('Service airtime providers already fetched')
            return dataProviders.value
        }
        const { httpRequest } = useHttp()
        const router = useRouter()
        try {
            const response = await httpRequest(
                "GET",
                `/customer/serviceVariations/data`
            );
            dataProviders.value = response.data.content;
            isLoadingProvider.value = false
        } catch (error) {
            handleAuthError(error, router)
            isLoadingProvider.value = false

        }
    }

    async function fetchTvVariations(data) {
        const { httpRequest } = useHttp()
        const router = useRouter()
        try {
            const response = await httpRequest(
                "GET",
                `/customer/tvServiceVariations/${data}`
            );
            tvVariations.value = response.data.content?.varations;
            isLoadingProvider.value = false
        } catch (error) {
            handleAuthError(error, router)
            isLoadingProvider.value = false

        }
    }

    async function fetchDataPlans(serviceId: string) {
        const { httpRequest } = useHttp()
        const router = useRouter()
        try {
            isLoadingDataVariations.value = true
            const response = await httpRequest(
                "GET",
                `/customer/dataServiceVariations/${serviceId}`
            );
            if (response.data?.content?.varations) {
                dataPlans.value = response.data.content.varations;
                isLoadingDataVariations.value = false
            }

        } catch (error) {
            isLoadingDataVariations.value = false
            handleAuthError(error, router)

        }
    }

    // Load unread notifications from storage
    async function loadUnreadNotifications(allNotifications) {
        try {
            const { value } = await Preferences.get({ key: 'unreadNotificationIds' })
            if (value) {
                const unreadIds = JSON.parse(value)
                unreadNotifications.value = allNotifications.filter(notification => 
                    unreadIds.includes(notification.id)
                )
            } else {
                // First time - all notifications are unread
                unreadNotifications.value = [...allNotifications]
                await saveUnreadNotificationIds()
            }
        } catch (error) {
            console.error('Error loading unread notifications:', error)
            unreadNotifications.value = [...allNotifications]
        }
    }

    // Save unread notification IDs to storage
    async function saveUnreadNotificationIds() {
        try {
            const unreadIds = unreadNotifications.value.map(notification => notification.id)
            await Preferences.set({
                key: 'unreadNotificationIds',
                value: JSON.stringify(unreadIds)
            })
        } catch (error) {
            console.error('Error saving unread notification IDs:', error)
        }
    }

    // Computed property for unread notification count
    const unreadCount = computed(() => unreadNotifications.value.length)

    // Function to mark notification as read
    async function markNotificationAsRead(notificationId) {
        unreadNotifications.value = unreadNotifications.value.filter(
            notification => notification.id !== notificationId
        )
        await saveUnreadNotificationIds()
    }

    // Function to mark all notifications as read
    async function markAllNotificationsAsRead() {
        unreadNotifications.value = []
        await saveUnreadNotificationIds()
    }

    // Function to add new notification (when received)
    async function addNewNotification(notification) {
        notifications.value.unshift(notification)
        unreadNotifications.value.unshift(notification)
        await saveUnreadNotificationIds()
    }

    return {
        customer,
        notifications,
        unreadNotifications,
        unreadCount,
        transactions,
        activities,
        accounts,
        providers,
        packages,
        banks,
        investments,
        dataProviders,
        tvVariations,
        electricity,
        fetchCustomer,
        fetchServiceAirtimeIds,
        fetchDataPlans,
        fetchServiceDataIds,
        fetchTvVariations,
        fetchElectrictyVariations,
        isLoadingProvider,
        isLoadingCustomerData,
        isLoadingDataVariations,
        isLoadingElectricity,
        dataPlans,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNewNotification,
    }
})