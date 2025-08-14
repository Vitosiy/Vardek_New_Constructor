import { ref, computed, watch } from 'vue'
import { useSceneState } from '@/store/appliction/useSceneState'

export function useProjectState() {
  const sceneState = useSceneState()
  
  const currentProjectId = ref<string | null>(null)
  const initialProjectState = ref<any>(null)
  const hasUnsavedChanges = ref(false)
  const isSaving = ref(false)

  // Проверяем, является ли текущий проект новым
  const isNewProject = computed(() => {
    return !currentProjectId.value
  })

  // Проверяем, есть ли изменения
  const hasChanges = computed(() => {
    if (!initialProjectState.value) return false
    
    const currentState = sceneState.getCurrentProjectParams
    const initialState = initialProjectState.value
    
    return JSON.stringify(currentState) !== JSON.stringify(initialState)
  })

  // Обновляем состояние изменений
  const updateChangeState = () => {
    hasUnsavedChanges.value = hasChanges.value
  }

  // Устанавливаем ID проекта
  const setProjectId = (id: string | null) => {
    currentProjectId.value = id
  }

  // Сохраняем начальное состояние
  const setInitialState = (state: any) => {
    initialProjectState.value = JSON.parse(JSON.stringify(state))
    updateChangeState()
  }

  // Сбрасываем состояние
  const resetState = () => {
    currentProjectId.value = null
    initialProjectState.value = null
    hasUnsavedChanges.value = false
  }

  // Отслеживаем изменения в проекте
  watch(() => sceneState.getCurrentProjectParams, () => {
    updateChangeState()
  }, { deep: true })

  return {
    currentProjectId,
    initialProjectState,
    hasUnsavedChanges,
    isSaving,
    isNewProject,
    hasChanges,
    setProjectId,
    setInitialState,
    resetState,
    updateChangeState
  }
}
