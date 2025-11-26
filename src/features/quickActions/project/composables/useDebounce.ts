import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(
  source: Ref<T>,
  callback: (value: T) => void,
  delay: number = 500
) {
  const debouncedValue = ref<T>(source.value)
  let timeoutId: NodeJS.Timeout | null = null

  watch(source, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
      callback(newValue)
    }, delay)
  }, { immediate: true })

  return {
    debouncedValue,
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }
}
