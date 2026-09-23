// src/plugins/capacitorBackButton.ts
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { App as CapacitorApp } from '@capacitor/app'

interface CapacitorBackButtonOptions {
  debug?: boolean;
  exitRoutes?: string[]; // Can be route names OR paths
}

const defaultOptions: CapacitorBackButtonOptions = {
  debug: false,
  exitRoutes: ['home', '/wallet'], // match by name and path
}

export const createCapacitorBackButton = (options: CapacitorBackButtonOptions = {}) => {
  const mergedOptions = { ...defaultOptions, ...options }

  let router: Router | null = null
  let backButtonListener: any = null
  let currentApp: App | null = null

  // Double-tap tracking
  let lastBackPressTime = 0
  const DOUBLE_PRESS_EXIT_DELAY = 2000 // 2 seconds

  const log = (message: string, ...args: any[]) => {
    if (mergedOptions.debug) {
      console.log('[CapacitorBackButton]', message, ...args)
    }
  }

  // Match by route name OR route path
  const shouldExitApp = (routeName?: string, routePath?: string): boolean => {
    if (!routeName && !routePath) return false
    return mergedOptions.exitRoutes?.some(route => {
      return routeName === route || routePath === route
    }) || false
  }

  const handleBackButton = () => {
    if (!router) {
      log('Router not available, ignoring back button')
      return
    }

    const currentRoute = router.currentRoute.value
    const routeName = currentRoute.name as string
    const currentPath = currentRoute.path

    log('Back button pressed:', { name: routeName, path: currentPath })

    if (shouldExitApp(routeName, currentPath)) {
      const now = Date.now()
      if (now - lastBackPressTime < DOUBLE_PRESS_EXIT_DELAY) {
        log('Double back detected — exiting app immediately')
        CapacitorApp.exitApp()
        return
      }
      lastBackPressTime = now
      log('Press back again to exit')
      return
    }

    log('Navigating back from:', routeName)
    router.back()
  }

  const setupBackButtonListener = () => {
    log('Setting up back button listener')
    if (backButtonListener) {
      backButtonListener.remove()
    }
    backButtonListener = CapacitorApp.addListener('backButton', handleBackButton)
  }

  const removeBackButtonListener = () => {
    if (backButtonListener) {
      log('Removing back button listener')
      backButtonListener.remove()
      backButtonListener = null
    }
  }

  return {
    install(app: App): void {
      currentApp = app

      // Get router immediately if available
      const routerInstance = app.config.globalProperties.$router
      if (routerInstance) {
        router = routerInstance
        setupBackButtonListener()
      }

      // Fallback for when router is injected later
      app.mixin({
        async created() {
          if (this.$router && !router) {
            router = this.$router
            await router?.isReady()
            setupBackButtonListener()
          }
        },
        beforeUnmount() {
          if (this.$el === document.getElementById('app')) {
            removeBackButtonListener()
          }
        }
      })

      // Allow dynamic update of exit routes
      app.config.globalProperties.$updateExitRoutes = (routes: string[]) => {
        mergedOptions.exitRoutes = routes
        log('Exit routes updated:', routes)
      }

      log('Plugin installed successfully with exit route names/paths:', mergedOptions.exitRoutes)
    },

    // Expose manual methods
    updateExitRoutes(routes: string[]) {
      mergedOptions.exitRoutes = routes
      log('Exit routes updated:', routes)
    },

    getCurrentRoute() {
      return router?.currentRoute.value
    }
  }
}

// Default instance
export const capacitorBackButton = createCapacitorBackButton()
export type { CapacitorBackButtonOptions }
