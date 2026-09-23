import type { App } from 'vue'
import type { Router } from 'vue-router'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

interface CapacitorStatusBarOptions {
  debug?: boolean
  backgroundColor?: string
  style?: 'light' | 'dark'
  overlaysWebView?: boolean
  iosSafeAreaColor?: string
}

const defaultOptions: CapacitorStatusBarOptions = {
  debug: false,
  backgroundColor: '#ffffff',
  style: 'light',
  overlaysWebView: false, // force false
  iosSafeAreaColor: '#ffffff'
}

export const createCapacitorStatusBar = (
  options: CapacitorStatusBarOptions = {}
) => {
  const mergedOptions = { ...defaultOptions, ...options, overlaysWebView: false } // enforce false
  let currentApp: App | null = null
  let router: Router | null = null

  const log = (message: string, ...args: any[]) => {
    if (mergedOptions.debug) {
      console.log('[CapacitorStatusBar]', message, ...args)
    }
  }

  const updateThemeMetaColor = (color: string) => {
    let meta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = color
  }

  const applyStatusBarSettings = async () => {
    if (!Capacitor.isNativePlatform()) {
      log('Not running on native platform — skipping')
      return
    }

    try {
      // Set overlay false before anything else
      await StatusBar.setOverlaysWebView({ overlay: false })
      log('Overlay set to false')

      // Set style
      const styleValue =
        Style.Light
      await StatusBar.setStyle({ style: styleValue })
      log('Style set to', mergedOptions.style)

      // Background color (Android only)
      if (Capacitor.getPlatform() === 'android' && mergedOptions.backgroundColor) {
        await StatusBar.setBackgroundColor({
          color: mergedOptions.backgroundColor
        })
        log('Background color set to', mergedOptions.backgroundColor)
        updateThemeMetaColor(mergedOptions.backgroundColor)
      }

      // Safe area filler for iOS
      if (Capacitor.getPlatform() === 'ios') {
        addIOSStatusBarFiller(mergedOptions.iosSafeAreaColor || '#ffffff')
      }
    } catch (err) {
      log('Error applying status bar settings', err)
    }
  }

  const addIOSStatusBarFiller = (color: string) => {
    let filler = document.querySelector(
      '.capacitor-statusbar-filler'
    ) as HTMLElement | null

    if (!filler) {
      filler = document.createElement('div')
      filler.className = 'capacitor-statusbar-filler'
      document.body.prepend(filler)
    }
    filler.style.height = 'env(safe-area-inset-top)'
    filler.style.backgroundColor = color
  }

  return {
    install(app: App): void {
      currentApp = app
      applyStatusBarSettings()
      log('Plugin installed with settings:', mergedOptions)

      // Capture router if available
      const routerInstance = app.config.globalProperties.$router
      if (routerInstance) {
        router = routerInstance
        router.afterEach(() => {
          applyStatusBarSettings()
        })
      }

      // Allow updates
      app.config.globalProperties.$updateStatusBar = (
        newOptions: Partial<CapacitorStatusBarOptions>
      ) => {
        Object.assign(mergedOptions, newOptions, { overlaysWebView: false }) // keep false
        log('Updated status bar options:', mergedOptions)
        applyStatusBarSettings()
      }
    },

    updateStatusBar(newOptions: Partial<CapacitorStatusBarOptions>) {
      Object.assign(mergedOptions, newOptions, { overlaysWebView: false })
      log('Updated status bar options:', mergedOptions)
      applyStatusBarSettings()
    }
  }
}

export const capacitorStatusBar = createCapacitorStatusBar()
export type { CapacitorStatusBarOptions }
