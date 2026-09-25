import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './style.css'
import './assets/css/main.css'
import '@fortawesome/fontawesome-free/css/all.css'

import App from './App.vue'
import router from './router'
import { preventInputZoom } from './plugins/preventInputZoom'
import { capacitorBackButton } from './plugins/capacitorBackButton'
const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .use(preventInputZoom)
  .use(capacitorBackButton)
  .mount('#app')

// Register PWA Service Worker
if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Multimilla PWA Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('Multimilla PWA Service Worker registration failed:', err);
      });
  });
}

// PWA install prompts disabled per design requirement
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
});

