<template>
  <div class="project">
    <div class="project__title">Открыть проект</div>
    <ClosePopUpButton class="popup__close" @close="closePopup" />
    
    <div class="project__container">
      <!-- Фильтры -->
      <div class="project-header">
        <div class="project-search">
          <MainInput 
            v-model="projectFilters.filters.name" 
            type="text" 
            placeholder="Название" 
            :min="0"
            :max="99999999"
            class="search-input"
          />
          <MainInput 
            v-model="projectFilters.filters.id" 
            type="text" 
            placeholder="ID" 
            :min="0"
            :max="99999999"
            class="search-input"
          />
        </div>
        <div class="project-buttons">
          <MainButton 
            :className="tab === 'ready' ? 'red__button' : 'grey__button'" 
            @click="switchTab('ready')"
            :disabled="projectAPI.isLoading"
          >
            Готовые проекты
          </MainButton>
          <MainButton 
            :className="tab === 'my' ? 'red__button' : 'grey__button'" 
            @click="switchTab('my')"
            :disabled="projectAPI.isLoading"
          >
            Мои проекты
          </MainButton>
        </div>
      </div>

      <!-- Предупреждение -->
      <div v-if="projectState.hasUnsavedChanges || projectState.isNewProject" class="project-warning">
        <div v-if="projectState.hasUnsavedChanges" class="warning-text">
          <p class="warning-text__title">Внимание</p>
          <p class="warning-text__text">Ваш проект не сохранен. При переходе на новый проект, данные текущего проекта не сохранятся</p>
        </div>
        <div v-else-if="projectState.isNewProject" class="warning-text">
          <p class="warning-text__title">Новый проект</p>
          <p class="warning-text__text">Сохраните проект, чтобы он появился в списке</p>
        </div>
        <MainButton 
          :className="'blue__button'" 
          @click="saveProject"
          :disabled="projectState.isSaving"
        >
          {{ projectState.isSaving ? 'Сохранение...' : 'Сохранить' }}
        </MainButton>
      </div>

      <!-- Список проектов -->
      <div class="project-list">
        <!-- Лоадер -->
        <div v-if="projectAPI.isLoading" class="project-loader">
          <div class="loader-spinner"></div>
          <p>Загрузка проектов...</p>
        </div>

        <!-- Создать новый проект -->
        <div v-else class="project-new" @click="createNewProject">
          <img src="@/assets/svg/popup/add.svg" alt="" />
          <p class="new__title">Создать новый проект</p>
        </div>

        <!-- Карточки проектов -->
        <div 
          v-for="project in filteredProjects" 
          :key="project.id" 
          class="project-item" 
          @click="loadProject(project.id)"
        >
          <img 
            :src="project.img ? `https://dev.vardek.online${project.img}` : '/src/assets/img/proj.png'" 
            class="item__image" 
            @error="handleImageError"
          />
          <div class="item-info">
            <div class="info-id">
              <p class="id__name">{{ project.name || 'Название' }}</p>
              <p class="id__number text-grey">ID {{ project.id }}</p>
            </div>
            <p class="info__date text-grey">{{ project.date }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainButton from "@/components/ui/buttons/MainButton.vue"
import MainInput from "@/components/ui/inputs/MainInput.vue"
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue"
import { usePopupStore } from '@/store/appStore/popUpsStore'
import { useSceneState } from '@/store/appliction/useSceneState'
import { useProjectFilters } from './composables/useProjectFilters'
import { useProjectState } from './composables/useProjectState'
import { useProjectAPI } from './composables/useProjectAPI'

const router = useRouter()
const popupStore = usePopupStore()
const sceneState = useSceneState()

// Состояние
const projects = ref([])
const tab = ref('my')

// Инициализируем хуки
const projectFilters = useProjectFilters(() => {
  loadProjects()
})
const projectState = useProjectState()
const projectAPI = useProjectAPI()

// Закрыть попап
const closePopup = () => {
  popupStore.closePopup('project')
}

// Переключение табов
const switchTab = async (newTab) => {
  tab.value = newTab
  await loadProjects()
}

// Загрузка списка проектов
const loadProjects = async () => {
  const serverFilters = projectFilters.getServerFilters()
  const items = await projectAPI.loadProjects(tab.value, serverFilters)
  projects.value = items
}

// Загрузка проекта по ID
const loadProject = async (id) => {
  const projectData = await projectAPI.loadProject(id)
  if (projectData) {
    // Применяем данные проекта к сцене
    sceneState.updateProjectParams(projectData)
    projectState.setProjectId(id)
    projectState.setInitialState(projectData)
    
    console.log('Проект загружен:', projectData)
    
    // Переходим на 2D конструктор
    await router.push('/2d')
    closePopup()
  }
}

// Сохранение проекта
const saveProject = async () => {
  projectState.isSaving.value = true
  try {
    const result = await projectAPI.saveProject(projectState.currentProjectId.value)
    
    if (result.success) {
      if (projectState.currentProjectId.value) {
        console.log('Проект обновлен:', result.data)
        // Обновляем начальное состояние после сохранения
        projectState.setInitialState(sceneState.getCurrentProjectParams)
      } else {
        console.log('Проект сохранен:', result.data)
        projectState.setProjectId(result.data.ID)
        projectState.setInitialState(sceneState.getCurrentProjectParams)
        await loadProjects() // Обновляем список
      }
    }
  } catch (error) {
    console.error('Ошибка сохранения проекта:', error)
  } finally {
    projectState.isSaving.value = false
  }
}

// Создание нового проекта
const createNewProject = async () => {
  // Всегда сохраняем текущий проект перед созданием нового
  if (projectState.hasUnsavedChanges.value || projectState.isNewProject.value) {
    await saveProject()
  }
  
  // Сбрасываем к начальным параметрам
  sceneState.createNewProject()
  projectState.resetState()
  projectState.setInitialState(sceneState.getCurrentProjectParams)
  
  console.log('Создан новый проект')
  
  // Переходим на 2D конструктор
  await router.push('/2d')
  closePopup()
}

// Обработка ошибки загрузки изображения
const handleImageError = (event) => {
  event.target.src = '/src/assets/img/proj.png'
}

// Фильтрация проектов
const filteredProjects = computed(() => {
  // Фильтрация теперь происходит на сервере
  return projects.value
})

// Инициализация состояния при монтировании
const initializeState = () => {
  const currentState = sceneState.getCurrentProjectParams
  projectState.setInitialState(currentState)
}

// Загружаем проекты при монтировании
onMounted(() => {
  loadProjects()
  initializeState()
})
</script>

<style lang="scss" scoped>
.project {
  width: 100%;
  height: 80vh;
  max-width: 1347px;
  position: relative;
  overflow: hidden;
  
  &__title {
    text-align: center;
    margin-bottom: 30px;
    font-size: 32px;
    font-weight: 600;
  }

  &__container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      border: 1px solid $stroke;
      border-radius: 15px;

      .project-search {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .search-input {
          min-width: 150px;
          width: 200px;
        }
      }

      .project-buttons {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .project-warning {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F6F5FA;
      border-radius: 15px;
      padding: 19px 15px;

      .warning-text {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
    }

    .project-list {
      max-height: 500px;
      display: flex;
      flex-wrap: wrap;
      overflow-y: auto;
      gap: 15px;

      .project-loader {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        
        .loader-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        p {
          color: #666;
          font-size: 16px;
        }
      }

      .project-new {
        width: 323px;
        height: 269px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        border: 1px solid $stroke;
        border-radius: 16px;
        box-sizing: border-box;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: #f8f8f8;
        }
      }

      .project-item {
        width: 323px;
        height: 269px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
        border-radius: 16px;
        background-color: $bg;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .item__image {
          margin: 0;
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .item-info {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 15px 10px;
          box-sizing: border-box;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 