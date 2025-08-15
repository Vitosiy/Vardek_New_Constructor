import { ref } from 'vue'
import { useEventBus } from '@/store/appliction/useEventBus'
import { useSceneState } from '@/store/appliction/useSceneState'
import { Project, ProjectFilters, SaveProjectResult, ProjectTab } from '../types'
import { API_ENDPOINTS, REQUEST_CONSTANTS, ERROR_MESSAGES } from '../constants'
import { useProjectStore } from '../store/useProjectStore'

export function useProjectAPI() {
  const eventBus = useEventBus()
  const sceneState = useSceneState()
  const projectStore = useProjectStore()
  const isLoading = ref(false)
  
  // Дебаунс для запросов
  let loadTimeout: NodeJS.Timeout | null = null

  // Валидация данных проекта
  const validateProjectData = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false
    if (!data.rooms || !Array.isArray(data.rooms)) return false
    return true
  }

  // Загрузка списка проектов с дебаунсом
  const loadProjects = async (tab: ProjectTab, filters: ProjectFilters = {}, delay: number = 300): Promise<Project[]> => {
    // Отменяем предыдущий запрос
    if (loadTimeout) {
      clearTimeout(loadTimeout)
    }

    return new Promise((resolve) => {
      loadTimeout = setTimeout(async () => {
        console.log('🚀 API: Запрос проектов', { tab, filters })
        isLoading.value = true
        
        try {
          const requestBody: any = {
            city: REQUEST_CONSTANTS.CITY,
            designer: REQUEST_CONSTANTS.DESIGNER,
            page: 1,
            config: REQUEST_CONSTANTS.CONFIG,
            type: "user",
            ...filters
          }

          // Для своих проектов добавляем user_hash, для общих - hash: false
          if (tab === 'my') {
            requestBody.user_hash = REQUEST_CONSTANTS.USER_HASH
          } else {
            requestBody.hash = false
          }

          const response = await fetch(API_ENDPOINTS.GET_PROJECT_LIST, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          console.log('📡 API: Ответ получен', { code: data.CODE, itemsCount: data.DATA?.data?.items?.length || 0 })
          
          if (data.CODE === 200 && data.DATA?.data?.items) {
            resolve(data.DATA.data.items)
          } else {
            resolve([])
          }
        } catch (error) {
          console.error(ERROR_MESSAGES.LOAD_PROJECTS, error)
          resolve([])
        } finally {
          isLoading.value = false
          console.log('🏁 API: Запрос завершен')
        }
      }, delay)
    })
  }

  // Загрузка проекта по ID
  const loadProject = async (id: string): Promise<any> => {
    if (!id) {
      console.error(ERROR_MESSAGES.MISSING_PROJECT_ID)
      return null
    }

    try {
      const response = await fetch(API_ENDPOINTS.GET_PROJECT_BY_ID, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.CODE === 200 && data.DATA?.data) {
        const projectData = data.DATA.data
        if (validateProjectData(projectData)) {
          return projectData
        } else {
          console.error(ERROR_MESSAGES.INVALID_PROJECT_DATA)
          return null
        }
      }
      return null
    } catch (error) {
      console.error(ERROR_MESSAGES.LOAD_PROJECT, error)
      return null
    }
  }

  // Сохранение проекта
  const saveProject = async (projectId: string | null = null): Promise<SaveProjectResult> => {
    try {
      // Сначала сохраняем сцену в браузер
      eventBus.emit('A:Save')
      
      const projectData = sceneState.getCurrentProjectParams
      
      // Валидируем данные перед отправкой
      if (!validateProjectData(projectData)) {
        throw new Error(ERROR_MESSAGES.INVALID_PROJECT_DATA)
      }
      
      // Если у нас есть ID проекта - обновляем, иначе создаем новый
      if (projectId) {
        const response = await fetch(API_ENDPOINTS.UPDATE_PROJECT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: projectId,
            project: projectData
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.CODE === 200) {
          return { success: true, data: data.DATA }
        } else {
          throw new Error(`API error: ${data.MESSAGE || 'Unknown error'}`)
        }
      } else {
        const response = await fetch(API_ENDPOINTS.SAVE_PROJECT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              file: 'data:image/jpeg;base64,',
              provider: REQUEST_CONSTANTS.PROVIDER,
              name: projectData.project_name || 'Новый проект',
              user_hash: REQUEST_CONSTANTS.USER_HASH,
              city: REQUEST_CONSTANTS.CITY,
              project: projectData,
              style: REQUEST_CONSTANTS.STYLE,
              projectId: Date.now().toString(),
              user_id: REQUEST_CONSTANTS.USER_ID
            }
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.CODE === 200) {
          return { success: true, data: data.DATA.data }
        } else {
          throw new Error(`API error: ${data.MESSAGE || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.SAVE_PROJECT, error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  return {
    isLoading,
    loadProjects,
    loadProject,
    saveProject
  }
}
