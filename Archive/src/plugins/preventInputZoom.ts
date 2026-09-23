// src/plugins/preventInputZoom.ts
import type { App } from 'vue'

interface ViewportMetaOptions {
  width?: string;
  initialScale?: number;
  maximumScale?: number;
  userScalable?: 'yes' | 'no';
}

interface PreventInputZoomOptions {
  viewport?: ViewportMetaOptions;
  targetInputTypes?: string[];
}

const defaultOptions: PreventInputZoomOptions = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: 'no'
  },
  targetInputTypes: [
    'text',
    'number',
    'email',
    'tel',
    'password',
    'search',
    'url'
  ]
}

export const createPreventInputZoom = (options: PreventInputZoomOptions = {}) => {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    viewport: { ...defaultOptions.viewport, ...options.viewport }
  }

  return {
    install(app: App): void {
      // Check if viewport meta already exists
      let viewportMeta = document.querySelector('meta[name="viewport"]')

      if (!viewportMeta) {
        viewportMeta = document.createElement('meta')
        viewportMeta.name = 'viewport'

        const viewportContent = Object.entries(mergedOptions.viewport!)
          .map(([key, value]) => `${kebabCase(key)}=${value}`)
          .join(', ')

        viewportMeta.content = viewportContent
        document.head.appendChild(viewportMeta)
      }

      // Create selector for targeted input types
      const inputSelectors = mergedOptions.targetInputTypes!
        .map(type => `input[type="${type}"]`)
        .concat(['textarea'])
        .join(',\n')

      // Create and append global styles - only affecting zoom-related properties
      const style = document.createElement('style')
      style.textContent = `
        /* Mobile input zoom prevention */
        @media screen and (max-width: 768px) {
          ${inputSelectors} {
            /* Only properties that affect zoom, not layout */
            -webkit-text-size-adjust: 100%;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          /* Safari-specific fixes */
          @supports (-webkit-touch-callout: none) {
            ${inputSelectors} {
              /* Set minimum font size only if current size is smaller */
              min-height: 44px; /* iOS touch target size */
              font-size: max(16px, 1em) !important; /* Use existing size if larger than 16px */
            }
          }
        }
      `
      document.head.appendChild(style)
    }
  }
}

// Utility function to convert camelCase to kebab-case
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

// Create default instance
export const preventInputZoom = createPreventInputZoom()

// Export types for users
export type { PreventInputZoomOptions, ViewportMetaOptions }