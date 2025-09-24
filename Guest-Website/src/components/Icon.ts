import { useIconPreloader } from "@/composables/useIconPreloader"

export default defineComponent({
  name: 'Icon',
  props: {
    name: { type: String, required: true },
    size: { type: [String, Number], default: 24 },
    color: { type: String, default: 'currentColor' },
    strokeWidth: { type: [String, Number], default: null }
  },

  setup(props) {
    const { getIcon } = useIconPreloader()
    
    const normalizedSize = computed(() => {
      return typeof props.size === 'number' ? `${props.size}px` : props.size
    })

    const svgContent = computed(() => {
      const rawSvg = getIcon(props.name)
      if (!rawSvg) return ''

      let processed = rawSvg
        .replace(/width="[^"]*"/g, '')
        .replace(/height="[^"]*"/g, '')
        .replace(/stroke="[^"]*"/g, `stroke="${props.color}"`)
        .replace(/<svg/, '<svg width="100%" height="100%"')

      if (props.strokeWidth !== null) {
        processed = processed
          .replace(/stroke-width="[^"]*"/g, `stroke-width="${props.strokeWidth}"`)
        
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