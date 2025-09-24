// composables/useIconPreloader.ts
const iconCache = new Map<string, string>()
let preloadPromise: Promise<void> | null = null

const icons = import.meta.glob('../assets/icons/*.svg', {
  eager: false,
  query: '?raw',
  import: 'default'
}) as Record<string, () => Promise<string>>

const iconPaths: Record<string, () => Promise<string>> = {}
Object.keys(icons).forEach(path => {
  const name = path.split('/').pop()?.replace('.svg', '').replace('icon_', '') || ''
  const loader = icons[path]
  if (loader) {
    iconPaths[name] = loader
  }
})

export const useIconPreloader = () => {
  const preloadAllIcons = async (): Promise<void> => {
    if (preloadPromise) return preloadPromise
    
    preloadPromise = Promise.all(
      Object.entries(iconPaths).map(async ([name, loader]) => {
        if (iconCache.has(name)) return
        
        try {
          const rawSvg = await loader()
          iconCache.set(name, rawSvg)
        } catch (error) {
          console.warn(`Failed to preload icon "${name}":`, error)
        }
      })
    ).then(() => {})
    
    return preloadPromise
  }

  const getIcon = (name: string): string | null => {
    return iconCache.get(name) || null
  }

  return {
    preloadAllIcons,
    getIcon,
    isPreloaded: () => iconCache.size > 0
  }
}