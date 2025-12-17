<template>
  <div class="project">
    <GenericLoader v-show="isProjectLoading" />
    <div class="project__title">Менеджер проектов</div>
    <ClosePopUpButton class="popup__close" @close="closePopup" />

    <div class="project__container">
      <!-- Фильтры -->
      <div class="project-header">
        <div class="project-search">
          <MainInput
            v-model="filters.name"
            type="text"
            placeholder="Название"
            :min="0"
            :max="99999999"
            class="search-input"
          />
          <MainInput
            v-model="filters.id"
            type="text"
            placeholder="ID"
            :min="0"
            :max="99999999"
            class="search-input"
          />
        </div>
        <div class="project-buttons">
          <!-- <MainButton
            :className="tab === 'ready' ? 'red__button' : 'grey__button'"
            @click="switchTab('ready')"
            :disabled="isLoading"
          >
            Готовые проекты
          </MainButton>
          <MainButton
            :className="tab === 'my' ? 'red__button' : 'grey__button'"
            @click="switchTab('my')"
            :disabled="isLoading"
          >
            Мои проекты
          </MainButton> -->
        </div>
      </div>

      <!-- Предупреждение -->
      <!-- <div class="project-warning">
        <div v-if="!projectState.currentProjectId" class="warning-text">
          <p class="warning-text__title">Новый проект</p>
          <p class="warning-text__text">
            Сохраните проект, чтобы он появился в списке
          </p>
        </div>
        <MainButton
          :className="'blue__button'"
          @click="saveProject"
          :disabled="projectState.isSaving"
        >
          {{ projectState.isSaving ? "Сохранение..." : "Сохранить" }}
        </MainButton>
      </div> -->

      <!-- Список проектов -->
      <div class="project-list">
        <!-- Лоадер -->
        <div v-if="isLoading" class="project-loader">
          <div class="loader-spinner"></div>
          <p>Загрузка проектов...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="loadError" class="project-error">
          <p class="error-text">{{ loadError }}</p>
          <MainButton :className="'blue__button'" @click="retryLoad">
            Попробовать снова
          </MainButton>
        </div>

        <!-- Пустой список -->
        <div
          v-else-if="!isLoading && projects.length === 0"
          class="project-empty"
        >
          <p>Проекты не найдены</p>
        </div>

        <!-- Создать новый проект -->
        <!-- <div
          v-if="!isLoading && !loadError"
          class="project-new"
          @click="createNewProject"
        >
          <img src="@/assets/svg/popup/add.svg" alt="" />
          <p class="new__title">Создать новый проект</p>
        </div> -->

        <!-- Карточки проектов -->
        <div
          v-for="project in projects"
          :key="project.id"
          class="project-item"
          @click="loadProject(project.id)"
        >
          <img
            :src="
              project.img
                ? `https://dev.vardek.online${project.img}`
                : '/src/assets/img/proj.png'
            "
            class="item__image"
            :alt="project.name || 'Проект'"
          />
          <div class="item-info">
            <div class="info-id">
              <p class="id__name">{{ project.name || "Название" }}</p>
              <p class="id__number text-grey">ID {{ project.id }}</p>
            </div>
            <p class="info__date text-grey">{{ project.date }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

import { ref, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import MainButton from "@/components/ui/buttons/MainButton.vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import { usePopupStore } from "@/store/appStore/popUpsStore";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useProjectStore } from "./store/useProjectStore";
import { useProjectAPI } from "./composables/useProjectAPI";
import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";
import { Project, ProjectTab } from "./types";
import { useToast } from "@/features/toaster/useToast";
import { useRoomState } from "@/store/appliction/useRoomState";
import GenericLoader from "@/components/ui/loader/GenericLoader.vue";

const router = useRouter();
const route = useRoute();
const toaster = useToast();
const popupStore = usePopupStore();
const sceneState = useSceneState();
const eventBus = useEventBus();
const schemeTransition = useSchemeTransition();

// Простое состояние
const projects = ref<Project[]>([]);
const tab = ref<ProjectTab>("my");
const loadError = ref<string | null>(null);
const isLoading = ref(false);
const filters = ref<{ name: string; id: string }>({ name: "", id: "" });

// Инициализируем хуки
const projectState = useProjectStore();
const projectAPI = useProjectAPI();
const roomState = useRoomState();

// Состояние загрузки проекта
const isProjectLoading = ref(false);

// Отслеживаем изменения фильтров
watch(
  filters,
  () => {
    loadProjects();
  },
  { deep: true }
);

// Закрыть попап
const closePopup = () => {
  popupStore.closePopup("project");
};

// Переключение табов
const switchTab = async (newTab: ProjectTab) => {
  tab.value = newTab;
  loadError.value = null;
  await loadProjects();
};

// Загрузка списка проектов
const loadProjects = async () => {
  isLoading.value = true;
  loadError.value = null;

  try {
    const serverFilters: { name?: string; id?: number } = {};
    if (filters.value.name?.trim()) {
      serverFilters.name = filters.value.name.trim();
    }
    if (filters.value.id?.toString().trim()) {
      const idValue = parseInt(filters.value.id.toString().trim());
      if (!isNaN(idValue) && idValue > 0) {
        serverFilters.id = idValue;
      }
    }

    const items = await projectAPI.loadProjects(tab.value, serverFilters);
    projects.value = items;

    if (items.length === 0 && Object.keys(serverFilters).length === 0) {
      loadError.value = "Не удалось загрузить проекты";
    }
  } catch (error) {
    console.error("Ошибка загрузки проектов:", error);
    loadError.value = "Ошибка загрузки проектов";
  } finally {
    isLoading.value = false;
  }
};

// Повторная попытка загрузки
const retryLoad = async () => {
  await loadProjects();
};

// Функция ожидания готовности C2D
const waitForC2D = async (timeout = 3000, interval = 50) => {
  const start = Date.now();
  return new Promise<typeof window.C2D | null>((resolve) => {
    const check = () => {
      if (window.C2D?.layers?.planner && window.C2D?.layers?.doorsAndWindows) {
        resolve(window.C2D);
        return;
      }
      if (Date.now() - start >= timeout) {
        resolve(null);
        return;
      }
      setTimeout(check, interval);
    };
    check();
  });
};

// Загрузка проекта по ID
const loadProject = async (id: string | number) => {
  if (!id) return;

  isProjectLoading.value = true;

  try {
    const projectData = await projectAPI.loadProject(id.toString());
    if (projectData) {
      projectState.resetState();
      projectState.setInitialState(projectData);
      console.log(projectData, "----PROD");

      try {
        schemeTransition.clearStore();
        // Очищаем текущую комнату перед загрузкой нового проекта
        roomState.clearCurrentRoomId();
        
        // 1. Обновляем данные проекта в sceneState
        await sceneState.loadProjectFromData(projectData);
        sceneState.updateProjectParams({});
        
        // 2. Устанавливаем данные в schemeTransition
        schemeTransition.setAppData(projectData.rooms);
        
        const currentPath = route.path;
        const is3DView = currentPath === '/3d';

        if (is3DView) {
          // Если мы на 3D, конвертируем данные только для 3D
          roomState.routConvertData('/3d');
          
          // Устанавливаем ID проекта в store
          projectState.setProjectId(id.toString());
          
          // Ждем, чтобы данные успели обновиться
          await nextTick();
          
          // Уведомляем о загрузке контента
          eventBus.emit("A:ContantLoaded", true);
          
          // Загружаем первую комнату в 3D сцену
          const rooms = roomState.getRooms;
          if (rooms && rooms.length > 0) {
            const firstRoomId = rooms[0].id;
            // Небольшая задержка для гарантии обновления данных
            await nextTick();
            
            // Устанавливаем состояние загрузки перед загрузкой комнаты
            await roomState.setLoad(false);
            eventBus.emit("A:Load", firstRoomId);
            
            // Ждем, пока сцена отрендерится
            await waitForSceneReady();
          }
          
          toaster.success("Проект загружен");
          
          // Закрываем попап
          closePopup();
        } else {
          // Если мы на 2D или другом маршруте, конвертируем данные для 2D
          // 3. Конвертируем данные для 3D (чтобы rooms.value был заполнен)
          roomState.routConvertData('/3d');
          
          // 4. Устанавливаем первую комнату как текущую активную сразу после загрузки комнат
          await nextTick(); // Ждем, чтобы комнаты успели загрузиться
          const rooms = roomState.getRooms;
          if (rooms && rooms.length > 0) {
            // Всегда устанавливаем первую комнату из загруженного проекта
            roomState.setCurrentRoomId(rooms[0].id);
          }
          
          // 5. Конвертируем данные для 2D (чтобы данные были в правильном формате)
          roomState.routConvertData('/2d');

          // 6. Устанавливаем ID проекта в store
          projectState.setProjectId(id.toString());

          // 7. Уведомляем о загрузке контента
          eventBus.emit("A:ContantLoaded", true);

          toaster.success("Проект загружен");

          // 8. Переходим на 2D конструктор
          await router.push("/2d");

          // 9. Ждем готовности C2D и инициализируем слои
          await nextTick(); // Ждем, чтобы компонент начал монтироваться
          const c2d = await waitForC2D();
          
          if (c2d?.layers?.planner && c2d?.layers?.doorsAndWindows) {
            // Проверяем, что данные есть перед инициализацией
            const roomsData = schemeTransition.getAllData();
            if (roomsData && roomsData.length > 0) {
              c2d.layers.planner.init(true);
              c2d.layers.doorsAndWindows.init(true);
            } else {
              console.warn("Данные проекта не найдены в schemeTransition");
            }
          } else {
            console.warn("C2D не готов после ожидания");
          }
          
          // 10. Закрываем попап только после успешной инициализации
          closePopup();
        }
      } catch (error) {
        console.error("Ошибка применения данных проекта:", error);
        toaster.error("Ошибка загрузки проекта");
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки проекта:", error);
    toaster.error("Ошибка загрузки проекта");
  } finally {
    isProjectLoading.value = false;
  }
};

// Ожидание готовности 3D сцены
const waitForSceneReady = async (timeout = 30000, interval = 100) => {
  const start = Date.now();
  return new Promise<void>((resolve) => {
    const check = () => {
      if (roomState.getLoad) {
        resolve();
        return;
      }
      if (Date.now() - start >= timeout) {
        console.warn("Таймаут ожидания готовности сцены");
        resolve();
        return;
      }
      setTimeout(check, interval);
    };
    check();
  });
};

// Сохранение проекта
const saveProject = async () => {
  projectState.isSaving = true;

  try {
    const result = await projectAPI.saveProject(projectState.currentProjectId);

    if (result.success) {
      if (projectState.currentProjectId) {
        // Обновляем существующий проект
        projectState.updateAfterSave();
      } else {
        // Создаем новый проект
        projectState.setProjectId(result.data.ID);
        projectState.updateAfterSave();
        await loadProjects(); // Обновляем список проектов
      }
    } else {
      console.error("❌ Ошибка сохранения:", result.error);
    }
  } catch (error) {
    console.error("❌ Исключение при сохранении:", error);
    alert("Ошибка сохранения проекта");
  } finally {
    projectState.isSaving = false;
    toaster.success("Сохранено");
  }
};

// Создание нового проекта
const createNewProject = async () => {
  try {
    sceneState.createNewProject();
    projectState.resetState();
    projectState.setInitialState(sceneState.getCurrentProjectParams);

    await router.push("/2d");
    closePopup();
    toaster.success("Создано");
  } catch (error) {
    console.error("Ошибка создания нового проекта:", error);
  }
};

// Обработка ошибки загрузки изображения
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "/src/assets/img/proj.png";
};

// Инициализация состояния при монтировании
const initializeState = () => {
  const currentState = sceneState.getCurrentProjectParams;
  projectState.setInitialState(currentState);
};

// Загружаем проекты при монтировании
onMounted(async () => {
  await loadProjects();
  initializeState();
});
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
          padding: 12px;
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
      background: #f6f5fa;
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

      .project-error {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        gap: 20px;

        .error-text {
          color: #e74c3c;
          font-size: 16px;
          text-align: center;
        }
      }

      .project-empty {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;

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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>