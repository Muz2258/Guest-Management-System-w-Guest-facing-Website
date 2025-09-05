import { defineComponent, h, computed } from 'vue'

// Import all icons - simple and direct
const icons = import.meta.glob('../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

// Create simple name mapping
const iconMap: Record<string, string> = {}
Object.keys(icons).forEach(path => {
  const name = path.split('/').pop()?.replace('.svg', '').replace('icon_', '') || ''
  iconMap[name] = icons[path]
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

    const svgContent = computed(() => {
      const rawSvg = iconMap[props.name]
      if (!rawSvg) {
        console.warn(`Icon "${props.name}" not found`)
        return ''
      }

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

      return processed
    })

    return () => h('span', {
      class: 'icon',
      style: {
        display: 'inline-block',
        width: normalizedSize.value,
        height: normalizedSize.value,
        flexShrink: 0
      },
      innerHTML: svgContent.value
    })
  }
})