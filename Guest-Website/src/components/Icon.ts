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

      const parser = new DOMParser()
      const parsedSvg = parser.parseFromString(rawSvg, 'image/svg+xml')
      const svgEl = parsedSvg.querySelector('svg')
      const svgPathEl = parsedSvg.querySelectorAll('path')

      svgEl?.setAttribute('width', '100%')
      svgEl?.setAttribute('height', '100%')

      const hasFill = Array.from(svgPathEl).some(path => path.hasAttribute('fill'))
      const hasStroke = Array.from(svgPathEl).some(path => path.hasAttribute('stroke'))

      if(hasFill) {
        svgPathEl.forEach(path => {
          path.setAttribute('fill', props.color)
        })
      }

      if(hasStroke) {
        svgPathEl.forEach(path => {
          path.setAttribute('stroke', props.color)
          if (props.strokeWidth !== null) {
            path.setAttribute('stroke-width', String(props.strokeWidth))
          }
        })
      }

      return svgEl?.outerHTML
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