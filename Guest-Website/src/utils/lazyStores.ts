import type { App } from 'vue'

// Store factory for lazy initialization
type StoreFactory<T = any> = () => T

interface LazyStoreMap {
  [key: string]: {
    factory: StoreFactory
    instance: any
    initialized: boolean
  }
}

class LazyStoreManager {
  private stores: LazyStoreMap = {}
  private app: App | null = null

  // Register store factory without initializing
  register<T>(name: string, factory: StoreFactory<T>): void {
    this.stores[name] = {
      factory,
      instance: null,
      initialized: false
    }
  }

  // Get store instance, initializing if needed
  get<T>(name: string): T {
    const store = this.stores[name]
    if (!store) {
      throw new Error(`Store '${name}' not registered`)
    }

    if (!store.initialized) {
      console.log(`🏪 Lazy initializing store: ${name}`)
      store.instance = store.factory()
      store.initialized = true
    }

    return store.instance as T
  }

  // Check if store is already initialized
  isInitialized(name: string): boolean {
    return this.stores[name]?.initialized || false
  }

  // Pre-initialize critical stores
  preload(storeNames: string[]): void {
    storeNames.forEach(name => {
      if (!this.isInitialized(name)) {
        this.get(name)
      }
    })
  }

  // Set app instance for dependency injection
  setApp(app: App): void {
    this.app = app
  }
}

export const lazyStoreManager = new LazyStoreManager()

// Composable for lazy store access
export function useLazyStore<T>(name: string): T {
  return lazyStoreManager.get<T>(name)
}

export default lazyStoreManager