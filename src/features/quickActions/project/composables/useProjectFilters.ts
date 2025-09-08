import { ref, watch } from 'vue'
import { ProjectFilters } from '../types'

export function useProjectFilters(onFiltersChange: () => void) {
  const filters = ref<ProjectFilters>({ name: '', id: '' })
  const isInitialized = ref(false)
  
  // Отслеживаем изменения фильтров
  watch(filters, () => {
    if (isInitialized.value) {
      onFiltersChange()
    }
  }, { deep: true })
  
  // Получаем значения фильтров для отправки на сервер
  const getServerFilters = (): ProjectFilters => {
    const serverFilters: ProjectFilters = {}
    
    if (filters.value.name?.trim()) {
      serverFilters.name = filters.value.name.trim()
    }
    if (filters.value.id?.toString().trim()) {
      const idValue = parseInt(filters.value.id.toString().trim())
      if (!isNaN(idValue) && idValue > 0) {
        serverFilters.id = idValue
      }
    }
    
    return serverFilters
  }

  // Инициализация фильтров
  const initialize = () => {
    isInitialized.value = true
  }
  
  return {
    filters,
    getServerFilters,
    initialize
  }
}
