import { ref, computed } from 'vue'
import { useDebounce } from './useDebounce'

export function useProjectFilters(onFiltersChange: () => void) {
  const filters = ref({ name: '', id: '' })
  
  // Дебаунс для фильтра по названию
  const { debouncedValue: debouncedName } = useDebounce(
    computed(() => filters.value.name),
    () => onFiltersChange(),
    500
  )
  
  // Дебаунс для фильтра по ID
  const { debouncedValue: debouncedId } = useDebounce(
    computed(() => filters.value.id),
    () => onFiltersChange(),
    500
  )
  
  // Получаем дебаунсированные значения для отправки на сервер
  const getServerFilters = () => {
    const serverFilters: any = {}
    
    if (debouncedName.value.trim()) {
      serverFilters.name = debouncedName.value.trim()
    }
    if (debouncedId.value.trim()) {
      serverFilters.id = parseInt(debouncedId.value.trim()) || 0
    }
    
    return serverFilters
  }
  
  return {
    filters,
    getServerFilters
  }
}
