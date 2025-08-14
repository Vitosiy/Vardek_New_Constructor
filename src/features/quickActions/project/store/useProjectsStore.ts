import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useEventBus } from '@/store/appliction/useEventBus'
import { useSceneState } from '@/store/appliction/useSceneState'
import type { Project, ProjectListItem } from '../types'
import { projectsService } from '../services/projectsService'

export const useProjectsStore = defineStore('ProjectsStore', () => {
  const eventBus = useEventBus()
  const sceneState = useSceneState()

  const projects = ref<ProjectListItem[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const unsavedChanges = ref(false)

  const getProjects = computed(() => projects.value)
  const getCurrentProject = computed(() => currentProject.value)

  const getList = async () => {
    isLoading.value = true
    error.value = null
    try {
      const list = await projectsService.getProjects()
      // Без фильтрации, просто приводим к карточкам
      projects.value = (list?.items as ProjectListItem[]) || []
    } catch (e: any) {
      error.value = e?.message || 'Failed to load projects'
    } finally {
      isLoading.value = false
    }
  }

  const getProject = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await projectsService.getProject(id)
      currentProject.value = (data as Project) || null
      unsavedChanges.value = false
    } catch (e: any) {
      error.value = e?.message || 'Failed to load project'
    } finally {
      isLoading.value = false
    }
  }

  const save = async (name?: string) => {
    // Сначала дергаем сохранение сцены
    eventBus.emit('A:Save')
    isLoading.value = true
    error.value = null
    try {
      const projectParams = sceneState.getCurrentProjectParams as unknown as Record<string, any>
      const payload = {
        file: 'data:image/jpeg;base64,',
        provider: 'vardek',
        name: name || 'project',
        user_hash: '08a57654db94bdcfe44a9ee10b2f0778',
        city: 17281,
        project: projectParams,
        style: '689680',
        projectId: Date.now().toString(),
        user_id: '14240',
      }
      await projectsService.saveProject(payload)
      unsavedChanges.value = false
      // После сохранения можно обновить список
      await getList()
    } catch (e: any) {
      error.value = e?.message || 'Failed to save project'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // state
    isLoading,
    error,
    unsavedChanges,
    // getters
    getProjects,
    getCurrentProject,
    // actions
    getList,
    getProject,
    save,
  }
})


