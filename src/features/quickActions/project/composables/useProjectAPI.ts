import { ref } from 'vue'
import { useEventBus } from '@/store/appliction/useEventBus'
import { useSceneState } from '@/store/appliction/useSceneState'
import { Project, ProjectFilters, SaveProjectResult, ProjectTab } from '../types'
import { API_ENDPOINTS, REQUEST_CONSTANTS, ERROR_MESSAGES } from '../constants'

export function useProjectAPI() {
  const eventBus = useEventBus()
  const sceneState = useSceneState()
  const isLoading = ref(false)

  // Дебаунс для запросов
  let loadTimeout: NodeJS.Timeout | null = null

  // Валидация данных проекта
  const validateProjectData = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false
    if (!data.rooms || !Array.isArray(data.rooms)) return false
    return true
  }

  // Генерация скриншота 3D сцены в base64 (аналогично take3DScreenshot из The3D.vue)
  const getProjectScreenshot = async (): Promise<string> => {
    return new Promise((resolve) => {
      // Небольшая задержка для обеспечения готовности рендерера
      setTimeout(() => {
        // Ищем все canvas элементы и находим тот, который имеет WebGL контекст
        const canvases = document.querySelectorAll('canvas')
        let webglCanvas: HTMLCanvasElement | null = null
        
        for (const canvas of canvases) {
          const context = canvas.getContext('webgl') || canvas.getContext('webgl2')
          // Проверяем что это WebGL canvas и он достаточно большой (3D сцена обычно большая)
          if (context && canvas.width > 100 && canvas.height > 100) {
            webglCanvas = canvas
            break
          }
        }
        
        if (!webglCanvas) {
          console.warn('WebGL canvas не найден для скриншота проекта')
          resolve('data:image/jpeg;base64,')
          return
        }

        try {
          // Используем toBlob как в take3DScreenshot (строки 544-552 из The3D.vue), но преобразуем в base64
          webglCanvas.toBlob((blob: Blob | null) => {
            if (blob) {
              const reader = new FileReader()
              reader.onloadend = () => {
                const base64 = reader.result as string
                resolve(base64 || 'data:image/jpeg;base64,')
              }
              reader.onerror = () => {
                console.error('Ошибка при чтении blob для скриншота')
                resolve('data:image/jpeg;base64,')
              }
              reader.readAsDataURL(blob)
            } else {
              console.warn('Не удалось создать blob для скриншота')
              resolve('data:image/jpeg;base64,')
            }
          }, 'image/jpeg', 0.8)
        } catch (error) {
          console.error('Ошибка при создании скриншота проекта:', error)
          resolve('data:image/jpeg;base64,')
        }
      }, 100) // Небольшая задержка для готовности рендерера
    })
  }

  // Загрузка списка проектов с дебаунсом
  const loadProjects = async (tab: ProjectTab, filters: ProjectFilters = {}, delay: number = 300): Promise<Project[]> => {
    // Отменяем предыдущий запрос
    if (loadTimeout) {
      clearTimeout(loadTimeout)
    }

    return new Promise((resolve) => {
      loadTimeout = setTimeout(async () => {
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
  const saveProject = async (incomeProjectId: string | null = null, projectName?: string): Promise<SaveProjectResult> => {
    try {
      // Сначала сохраняем сцену в браузер
      eventBus.emit('A:Save')

      const projectData = sceneState.getCurrentProjectParams
      // console.log(projectData, 'projectData')

      // Если передан projectName, обновляем его перед сохранением
      if (projectName) {
        (projectData as any).project_name = projectName
      }

      // Валидируем данные перед отправкой
      if (!validateProjectData(projectData)) {
        throw new Error(ERROR_MESSAGES.INVALID_PROJECT_DATA)
      }

      // Генерируем скриншот проекта для нового проекта
      let screenshotBase64 = 'data:image/jpeg;base64,'
      const projectId = incomeProjectId ?? projectData.projectId

      // Если создаем новый проект, генерируем скриншот
      if (!projectId) {
        screenshotBase64 = await getProjectScreenshot()
      }

      // Если у нас есть ID проекта - обновляем, иначе создаем новый
      if (projectId) {
        console.log(projectId, 'projectId HAVE')

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
        console.log(projectId, 'projectId No')

        const tempProjectId = Date.now().toString();
        projectData.projectId = tempProjectId


        const response = await fetch(API_ENDPOINTS.SAVE_PROJECT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              file: screenshotBase64,
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
