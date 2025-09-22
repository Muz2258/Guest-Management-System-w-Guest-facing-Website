import { defineComponent, h, computed, ref, onMounted } from 'vue'

// ✅ OPTIMIZATION: Lazy load icons only when requested
const icons = import.meta.glob('../assets/icons/*.svg', {
  eager: false, // Changed from true to false for lazy loading
  query: '?raw',
  import: 'default'
}) as Record<string, () => Promise<string>>

// Cache loaded icons to avoid re-fetching
const iconCache = new Map<string, string>()

// Create simple name mapping for paths
const iconPaths: Record<string, () => Promise<string>> = {}
Object.keys(icons).forEach(path => {
  const name = path.split('/').pop()?.replace('.svg', '').replace('icon_', '') || ''
  const loader = icons[path]
  if (loader) {
    iconPaths[name] = loader
  }
})

export default defineComponent({
  name: 'Icon',
  
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      default: 24
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: [String, Number],
      default: null
    }
  },

  setup(props) {
    const normalizedSize = computed(() => {
      return typeof props.size === 'number' ? `${props.size}px` : props.size
    })

    const svgContent = ref<string>('')
    const isLoading = ref(false)

    const loadIcon = async () => {
      // Check cache first
      if (iconCache.has(props.name)) {
        svgContent.value = iconCache.get(props.name) || ''
        return
      }

      // Load from dynamic import
      const loader = iconPaths[props.name]
      if (!loader) {
        console.warn(`Icon "${props.name}" not found`)
        return
      }

      try {
        isLoading.value = true
        const rawSvg = await loader()
        
        let processed = rawSvg
          .replace(/width="[^"]*"/g, '')
          .replace(/height="[^"]*"/g, '')
          .replace(/stroke="[^"]*"/g, `stroke="${props.color}"`)
          .replace(/<svg/, '<svg width="100%" height="100%"')

        // Handle stroke width for line icons
        if (props.strokeWidth !== null) {
          processed = processed
            .replace(/stroke-width="[^"]*"/g, `stroke-width="${props.strokeWidth}"`)
          
          // Add stroke-width if it doesn't exist
          if (!processed.includes('stroke-width')) {
            processed = processed.replace('<svg', `<svg stroke-width="${props.strokeWidth}"`)
          }
        }

        // Cache the processed result
        iconCache.set(props.name, processed)
        svgContent.value = processed
      } catch (error) {
        console.error(`Failed to load icon "${props.name}":`, error)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      loadIcon()
    })

    return () => h('span', {
      class: 'icon',
      style: {
        display: 'inline-block',
        width: normalizedSize.value,
        height: normalizedSize.value,
        flexShrink: 0
      },
      innerHTML: isLoading.value ? '' : svgContent.value
    })
  }
})