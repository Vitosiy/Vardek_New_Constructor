import { ref } from 'vue'
import { useEventBus } from '@/store/appliction/useEventBus'
import { useSceneState } from '@/store/appliction/useSceneState'

export function useProjectAPI() {
  const eventBus = useEventBus()
  const sceneState = useSceneState()
  const isLoading = ref(false)

  // Загрузка списка проектов
  const loadProjects = async (tab: string, filters: any = {}) => {
    isLoading.value = true
    try {
      const requestBody = {
        city: 17281,
        designer: '14240',
        page: 1,
        config: 43830,
        type: "user",
        ...filters
      }

      // Для своих проектов добавляем user_hash, для общих - hash: false
      if (tab === 'my') {
        requestBody.user_hash = '08a57654db94bdcfe44a9ee10b2f0778'
      } else {
        requestBody.hash = false
      }

      const response = await fetch('https://dev.vardek.online/api/modeller/projectq/getprojectlist/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      if (data.CODE === 200 && data.DATA?.data?.items) {
        return data.DATA.data.items
      }
      return []
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Загрузка проекта по ID
  const loadProject = async (id: string) => {
    try {
      const response = await fetch('https://dev.vardek.online/api/modeller/projectq/getprojectbyid/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      const data = await response.json()
      if (data.CODE === 200 && data.DATA?.data) {
        return data.DATA.data
      }
      return null
    } catch (error) {
      console.error('Ошибка загрузки проекта:', error)
      return null
    }
  }

  // Сохранение проекта
  const saveProject = async (projectId: string | null = null) => {
    try {
      // Сначала сохраняем сцену в браузер
      eventBus.emit('A:Save')
      
      const projectData = sceneState.getCurrentProjectParams
      
      // Если у нас есть ID проекта - обновляем, иначе создаем новый
      if (projectId) {
        const response = await fetch('https://dev.vardek.online/api/modeller/projectq/updateprojectbyid/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: projectId,
            project: projectData
          })
        })
        
        const data = await response.json()
        if (data.CODE === 200) {
          return { success: true, data: data.DATA }
        }
      } else {
        const response = await fetch('https://dev.vardek.online/api/modeller/projectq/SaveProject/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              file: 'data:image/jpeg;base64,',
              provider: 'vardek',
              name: 'Новый проект',
              user_hash: '08a57654db94bdcfe44a9ee10b2f0778',
              city: 17281,
              project: projectData,
              style: '689680',
              projectId: Date.now().toString(),
              user_id: '14240'
            }
          })
        })
        
        const data = await response.json()
        if (data.CODE === 200) {
          return { success: true, data: data.DATA.data }
        }
      }
      
      return { success: false }
    } catch (error) {
      console.error('Ошибка сохранения проекта:', error)
      return { success: false, error }
    }
  }

  return {
    isLoading,
    loadProjects,
    loadProject,
    saveProject
  }
}
