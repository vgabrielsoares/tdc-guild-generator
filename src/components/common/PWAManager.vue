<template>
  <div>
    <!-- Install Prompt -->
    <div v-if="showInstallPrompt"
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-guild-800 border border-guild-600 rounded-lg p-4 shadow-lg z-50">
      <div class="flex items-start space-x-3">
        <div class="text-2xl">📱</div>
        <div class="flex-1">
          <h3 class="font-semibold text-white mb-1">Instalar Aplicativo</h3>
          <p class="text-sm text-gray-300 mb-3">
            Instale o Gerador de Guildas para acesso rápido e uso offline!
          </p>
          <div class="flex space-x-2">
            <button @click="installApp" class="btn-primary text-sm px-3 py-1">
              Instalar
            </button>
            <button @click="dismissInstall" class="btn-secondary text-sm px-3 py-1">
              Agora Não
            </button>
          </div>
        </div>
        <button @click="dismissInstall" class="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
    </div>

    <!-- Update Available -->
    <div v-if="showUpdatePrompt"
      class="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-800 border border-green-600 rounded-lg p-4 shadow-lg z-50">
      <div class="flex items-start space-x-3">
        <div class="text-2xl">
          <font-awesome-icon :icon="['fas', 'arrows-rotate']" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-white mb-1">Atualização Disponível</h3>
          <p class="text-sm text-green-200 mb-3">
            Uma nova versão está disponível. Recarregue para atualizar.
          </p>
          <div class="flex space-x-2">
            <button @click="updateApp" class="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded">
              Atualizar
            </button>
            <button @click="dismissUpdate" class="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded">
              Depois
            </button>
          </div>
        </div>
        <button @click="dismissUpdate" class="text-green-200 hover:text-white">
          ✕
        </button>
      </div>
    </div>

    <!-- Offline Indicator -->
    <div v-if="!isOnline"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-800 border border-yellow-600 rounded-lg px-4 py-2 shadow-lg z-50">
      <div class="flex items-center space-x-2 text-yellow-200">
        <span>
          <font-awesome-icon :icon="['fas', 'signal']" />
        </span>
        <span class="text-sm font-medium">Modo Offline</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Estado dos prompts
const showInstallPrompt = ref(false)
const showUpdatePrompt = ref(false)
const isOnline = ref(navigator.onLine)

// Event listeners
let deferredPrompt: any = null
let registration: ServiceWorkerRegistration | null = null

// Install App
const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA MANAGER] PWA installed successfully')
    } else {
      console.log('[PWA MANAGER] PWA installation declined')
    }

    deferredPrompt = null
    showInstallPrompt.value = false
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', Date.now().toString())
}

// Update App
const updateApp = () => {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }
}

const dismissUpdate = () => {
  showUpdatePrompt.value = false
}

// Event Handlers
const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt = e

  // Só mostra se não foi dismissado recentemente (24h)
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (!dismissed || Date.now() - parseInt(dismissed) > 24 * 60 * 60 * 1000) {
    showInstallPrompt.value = true
  }
}

const handleOnline = () => {
  isOnline.value = true
  console.log('[PWA MANAGER] Connection restored')
}

const handleOffline = () => {
  isOnline.value = false
  console.log('[PWA MANAGER] Connection lost - entering offline mode')
}

const handleServiceWorkerUpdate = () => {
  showUpdatePrompt.value = true
}

// Lifecycle
onMounted(async () => {
  // Install prompt
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // Online/Offline
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Service Worker updates
  if ('serviceWorker' in navigator) {
    try {
      registration = await navigator.serviceWorker.getRegistration() || null

      if (registration) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration!.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                handleServiceWorkerUpdate()
              }
            })
          }
        })
      }

      // Listen for controllerchange (when SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

    } catch (error) {
      console.error('[PWA MANAGER] Service Worker registration failed:', error)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>
