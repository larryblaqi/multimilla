import { Preferences } from "@capacitor/preferences";
import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export async function authMiddleware(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): Promise<void> {
    try {
        const { value: authToken } = await Preferences.get({ key: "token" })
        if (!authToken) {
            return next({ name: 'login' })
        }
        next()
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        next({ name: "login" })
    }
}

export async function riderAuthMiddleware(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): Promise<void> {
    try {
        const { value: authToken } = await Preferences.get({ key: "token" })
        if (!authToken) {
            return next({ name: 'rider-login' })
        }
        next()
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        next({ name: "login" })
    }
}