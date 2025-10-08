// TypeScript interfaces for animation configuration
interface AnimationConfig {
  backdropDuration: number
  sheetEnterDuration: number
  sheetLeaveDuration: number
  easing: string
  sheetEasing: string
}

interface BottomSheetElements {
  backdrop: HTMLElement | null
  bottomSheet: HTMLElement | null
}

// Default animation configuration
const defaultConfig: AnimationConfig = {
  backdropDuration: 250,
  sheetEnterDuration: 400,
  sheetLeaveDuration: 350,
  easing: 'ease-in-out',
  sheetEasing: 'cubic-bezier(.33,.18,.11,.98)'
}

// Utility function to find required elements with type safety
const findBottomSheetElements = (el: Element): BottomSheetElements => {
  return {
    backdrop: el.querySelector('.backdrop') as HTMLElement | null,
    bottomSheet: el.querySelector('.bottom-sheet') as HTMLElement | null
  }
}

// TypeScript-friendly animation hooks
const onEnter = (el: Element, done: () => void): void => {
  console.log('🔼 Enter animation started')
  
  const { backdrop, bottomSheet } = findBottomSheetElements(el)
  
  if (!backdrop || !bottomSheet) {
    console.error('Required elements not found:', { 
      backdrop: !!backdrop, 
      bottomSheet: !!bottomSheet 
    })
    done()
    return
  }
  
  try {
    // Set initial states (enter-from)
    backdrop.style.opacity = '0'
    bottomSheet.style.opacity = '0'
    bottomSheet.style.transform = 'translateY(65%)'
    
    // Start animations with slight delay to ensure initial styles are applied
    const animationFrame = requestAnimationFrame((): void => {
      // Backdrop animation
      backdrop.style.transition = `opacity ${defaultConfig.backdropDuration}ms ${defaultConfig.easing}`
      backdrop.style.opacity = '1'
      
      // Bottom sheet animation
      const sheetTransition = `transform ${defaultConfig.sheetEnterDuration}ms ${defaultConfig.sheetEasing}, opacity ${defaultConfig.sheetEnterDuration}ms ${defaultConfig.sheetEasing}`
      bottomSheet.style.transition = sheetTransition
      bottomSheet.style.opacity = '1'
      bottomSheet.style.transform = 'translateY(0%)'
      
      // Call done after the longest animation completes
      const timeoutId = setTimeout((): void => {
        done()
      }, defaultConfig.sheetEnterDuration)
      
      // Store timeout for potential cleanup
      ;(el as any).__animationTimeout = timeoutId
    })
    
    // Store animation frame for potential cleanup
    ;(el as any).__animationFrame = animationFrame
    
  } catch (error) {
    console.error('Animation error during enter:', error)
    done()
  }
}

const onLeave = (el: Element, done: () => void): void => {
  console.log('🔽 Leave animation started')
  
  const { backdrop, bottomSheet } = findBottomSheetElements(el)
  
  if (!backdrop || !bottomSheet) {
    console.error('Required elements not found:', { 
      backdrop: !!backdrop, 
      bottomSheet: !!bottomSheet 
    })
    done()
    return
  }
  
  try {
    // Apply leave animations
    backdrop.style.transition = `opacity ${defaultConfig.backdropDuration}ms ${defaultConfig.easing}`
    backdrop.style.opacity = '0'
    
    const sheetTransition = `transform ${defaultConfig.sheetLeaveDuration}ms ${defaultConfig.sheetEasing}, opacity ${defaultConfig.sheetLeaveDuration}ms ${defaultConfig.sheetEasing}`
    bottomSheet.style.transition = sheetTransition
    bottomSheet.style.opacity = '0'
    bottomSheet.style.transform = 'translateY(65%)'
    
    // Call done after the longest animation completes
    const longestDuration = Math.max(defaultConfig.backdropDuration, defaultConfig.sheetLeaveDuration)
    const timeoutId = setTimeout((): void => {
      done()
    }, longestDuration)
    
    // Store timeout for potential cleanup
    ;(el as any).__animationTimeout = timeoutId
    
  } catch (error) {
    console.error('Animation error during leave:', error)
    done()
  }
}

// Cleanup function to prevent memory leaks
const cleanupAnimation = (el: Element): void => {
  const element = el as any
  
  if (element.__animationTimeout) {
    clearTimeout(element.__animationTimeout)
    delete element.__animationTimeout
  }
  
  if (element.__animationFrame) {
    cancelAnimationFrame(element.__animationFrame)
    delete element.__animationFrame
  }
}

// Hook functions with proper TypeScript types
const onBeforeEnter = (el: Element): void => {
  console.log('🚀 Before enter - setting up initial state')
  cleanupAnimation(el)
}

const onAfterEnter = (el: Element): void => {
  console.log('✅ Enter animation completed')
  cleanupAnimation(el)
}

const onBeforeLeave = (el: Element): void => {
  console.log('👋 Before leave - starting exit')
  cleanupAnimation(el)
}

const onAfterLeave = (el: Element): void => {
  console.log('✅ Leave animation completed')
  cleanupAnimation(el)
}

// Composable function for bottom sheet animations
interface BottomSheetAnimationHooks {
  onBeforeEnter: (el: Element) => void
  onEnter: (el: Element, done: () => void) => void
  onAfterEnter: (el: Element) => void
  onBeforeLeave: (el: Element) => void
  onLeave: (el: Element, done: () => void) => void
  onAfterLeave: (el: Element) => void
}

const useBottomSheetAnimation = (config?: Partial<AnimationConfig>): BottomSheetAnimationHooks => {
  // Merge custom config with defaults
  if (config) {
    Object.assign(defaultConfig, config)
  }
  
  return {
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onBeforeLeave,
    onLeave,
    onAfterLeave
  }
}