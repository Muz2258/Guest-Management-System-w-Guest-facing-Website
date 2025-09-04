import { defineComponent, h } from 'vue'

// Import all icons
const icons = import.meta.glob('../assets/icons/*.svg', {
  eager: true,
  as: 'raw'
})

// Icon names type based on available icons
type IconName = keyof typeof icons

// Remove 'icon_' prefix from icon names for easier usage
const iconNameMap = Object.keys(icons).reduce((acc, key) => {
  const name = key.split('/').pop()?.replace('.svg', '').replace('icon_', '') || ''
  acc[name] = key
  return acc
}, {} as Record<string, string>)

export default defineComponent({
  name: 'Icon',
  
  props: {
    // Name of the icon to display (without 'icon_' prefix)
    name: {
      type: String,
      required: true,
      validator: (value: string) => value in iconNameMap
    },
    // Size in pixels or with units (e.g., '24px', '1.5rem')
    size: {
      type: [String, Number],
      default: '24px'
    },
    // Color of the icon (any valid CSS color)
    color: {
      type: String,
      default: 'currentColor'
    },
    // Optional title for accessibility
    title: {
      type: String,
      default: ''
    },
    // Rotation in degrees
    rotate: {
      type: Number,
      default: 0
    },
    // Additional classes to apply to the icon wrapper
    class: {
      type: [String, Array, Object],
      default: ''
    },
    // Whether to flip the icon horizontally
    flipX: {
      type: Boolean,
      default: false
    },
    // Whether to flip the icon vertically
    flipY: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    // Convert size to valid CSS value
    const normalizedSize = () => {
      if (typeof props.size === 'number' || /^\d+$/.test(props.size)) {
        return `${props.size}px`
      }
      return props.size
    }

    // Get SVG content for the icon
    const getIconContent = () => {
      const iconPath = iconNameMap[props.name]
      if (!iconPath || !(iconPath in icons)) {
        console.error(`Icon "${props.name}" not found`)
        return null
      }

      return icons[iconPath] as string
    }

    return () => {
      const iconContent = getIconContent()
      if (!iconContent) return null

      const size = normalizedSize()
      const transforms: string[] = []
      
      if (props.rotate) {
        transforms.push(`rotate(${props.rotate}deg)`)
      }
      if (props.flipX) {
        transforms.push('scaleX(-1)')
      }
      if (props.flipY) {
        transforms.push('scaleY(-1)')
      }

      // Create wrapper div with icon content
      return h('div', {
        class: ['icon-component', props.class],
        innerHTML: iconContent,
        role: 'img',
        'aria-label': props.title || props.name,
        style: {
          width: size,
          height: size,
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: props.color,
          transform: transforms.length ? transforms.join(' ') : undefined
        }
      })
    }
  }
})
