import { defineComponent, h } from 'vue'

// Import all icons
const icons = import.meta.glob('../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})

// Remove 'icon_' prefix from icon names for easier usage
const iconNameMap = Object.keys(icons).reduce((acc, key) => {
  const name = key.split('/').pop()?.replace('.svg', '').replace('icon_', '') || ''
  acc[name] = key
  return acc
}, {} as Record<string, string>)

console.log('🔍 Available icons:', Object.keys(iconNameMap ))

export default defineComponent({
  name: 'Icon',
  
  props: {
    name: {
      type: String,
      required: true,
      validator: (value: string) => value in iconNameMap
    },
    size: {
      type: [String, Number],
      default: '24px'
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: [String, Number],
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    class: {
      type: [String, Array, Object],
      default: ''
    },
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

    // Process SVG content to make it scalable
  const processIconContent = (svgContent: string, color: string) => {
    let processed = svgContent
      .replace(/width="[^"]*"/g, '')
      .replace(/height="[^"]*"/g, '')
      .replace(/<svg/, '<svg width="100%" height="100%"')
      .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`)
    .replace(/fill:\s*(?!none)[^;"]*/g, `fill: ${color}`)
    .replace(/stroke:\s*(?!none)[^;"]*/g, `stroke: ${color}`)

    if(props.strokeWidth !== null) {
      processed = processed.replace(/stroke-width="[^"]*"/g, `stroke-width="${props.strokeWidth}"`)
        .replace(/stroke-width:\s*[^;"]*/g, `stroke-width: ${props.strokeWidth}`)

      if(!/stroke-width="[^"]*"/.test(processed) && !/stroke-width:\s*[^;"]*/.test(processed)) {
        processed = processed.replace('<svg', `<svg stroke-width="${props.strokeWidth}"`)
      }
    }

    return processed
  }

  return () => {
    const iconContent = getIconContent()
    if (!iconContent) return null

    const processedContent = processIconContent(iconContent, props.color)
    const size = normalizedSize()

    return h('div', {
      class: ['icon-component', props.class],
      innerHTML: processedContent, // Use processed content
      role: 'img',
      'aria-label': props.title || props.name,
      style: {
        width: size,
        height: size,
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        color: props.color,
      }
    })
  }
}
})
