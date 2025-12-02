import { ref } from 'vue';
import { usePopupStore } from '@/store/appStore/popUpsStore';
import { useEventBus } from '@/store/appliction/useEventBus';
import { useMenuStore } from "@/store/appStore/useMenuStore";
import { useRouter } from 'vue-router';
import { useToast } from "@/features/toaster/useToast";
import { useSceneState } from '@/store/appliction/useSceneState';

import { useFullscreen } from '@/features/quickActions/composables/useFullscreen';
import { usePrint } from '@/features/quickActions/composables/usePrint';
import { use2DScreenshot } from './composables/use2DScreenshot';

import { useProjectAPI } from './project/composables/useProjectAPI';
import { useProjectStore } from './project/store/useProjectStore';
import { useRoomState } from '@/store/appliction/useRoomState';
import { useSchemeTransition } from '@/store/canvasMerge/schemeTransition';

export type ActionKey =
  | 'fullscreen'
  | 'report'
  | 'study'
  | 'print'
  | 'screenshot'
  | 'newProject'
  | 'saveProject'
  | 'drowmod'
  | 'ruller'
  | 'screenshot3d';

export interface QuickActionItem {
  key: ActionKey;
  tooltip: string;
  iconClass: string;
  path?: string
  action: () => void | Promise<void>;
}

export const useQuickActionsToolbar = () => {
  const popupStore = usePopupStore();
  const eventBus = useEventBus();
  const menuStore = useMenuStore();
  const router = useRouter();
  const toaster = useToast();
  const sceneState = useSceneState();
  const roomState = useRoomState()

  const projectState = useProjectStore();
  const projectAPI = useProjectAPI()

  const { toggleFullscreen } = useFullscreen();
  const { printPage } = usePrint();
  const { makeScreen } = use2DScreenshot();

  // Реф для функции открытия модального окна
  const openSaveDialog = ref<(() => void) | null>(null);

  // Функция открытия модального окна для сохранения проекта
  const onSaveProject = async () => {
    // Если проект уже имеет ID — обновляем без показа модалки
    if (projectState.currentProjectId) {
      console.log(projectState.currentProjectId, 'currentProjectId')
      projectState.isSaving = true;
      try {
        const result = await projectAPI.saveProject(projectState.currentProjectId);
        if (result.success) {
          projectState.updateAfterSave();
          toaster.success("Сохранено");
        } else {
          console.error("❌ Ошибка сохранения:", result.error);
          toaster.error("Ошибка сохранения проекта");
        }
      } catch (error) {
        console.error("❌ Исключение при сохранении:", error);
        toaster.error("Ошибка сохранения проекта");
      } finally {
        projectState.isSaving = false;
      }
      return;
    }

    // Иначе — это новый проект: открываем модальное окно для ввода имени
    if (openSaveDialog.value) openSaveDialog.value();
  }

  // Обработка подтверждения сохранения с названием проекта
  const handleSaveConfirm = async (projectName: string, onSuccess?: () => void, kpFlag: boolean = false) => {
    if (!projectName.trim()) {
      toaster.error("Введите название проекта");
      return false;
    }

    projectState.isSaving = true;

    try {
      // Обновляем название проекта перед сохранением
      sceneState.updateProjectParams({ project_name: projectName as any });

      const result = await projectAPI.saveProject(projectState.currentProjectId, projectName, kpFlag);

      if (result.success) {
        if (projectState.currentProjectId) {
          // Обновляем существующий проект
          projectState.updateAfterSave();
        } else {
          // Создаем новый проект
          projectState.setProjectId(result.data.ID);
          projectState.updateAfterSave();
        }
        toaster.success("Сохранено");
        
        // Вызываем callback при успешном сохранении
        if (onSuccess) {
          onSuccess();
        }
        return true;
      } else {
        console.error("❌ Ошибка сохранения:", result.error);
        toaster.error("Ошибка сохранения проекта");
        return false;
      }
    } catch (error) {
      console.error("❌ Исключение при сохранении:", error);
      toaster.error("Ошибка сохранения проекта");
      return false;
    } finally {
      projectState.isSaving = false;
    }
  }

  // Функция режима чертежа
  const toggleDrowMode = async () => {
    await menuStore.toggleDrowModeValue();
    const value = menuStore.getDrowModeValue
    eventBus.emit("A:DrawingMode", value);
  };

  // Функция отображения линейки
  const toggleRulerVisibility = async () => {
    await menuStore.toggleRulerVisibility();
    const value = menuStore.getRulerVisibility
    eventBus.emit("A:ToggleRulerVisibility", value);
  };


  const actions: QuickActionItem[] = [
    {
      key: 'fullscreen',
      tooltip: 'На весь экран',
      iconClass: 'icon-centered',
      path: 'default',
      action: () => toggleFullscreen(),
    },
    {
      key: 'drowmod',
      tooltip: 'Режим чертежа',
      iconClass: 'icon-show',
      path: '/3d',
      action: () => toggleDrowMode(),
    },

    {
      key: 'ruller',
      tooltip: 'Отображение линейки',
      iconClass: 'icon-ruler',
      path: '/3d',
      action: () => toggleRulerVisibility(),
    },

    {
      key: 'report',
      tooltip: 'Сообщить об ошибке',
      iconClass: 'icon-alert',
      path: 'default',
      action: () => popupStore.openPopup('error'),
    },
    {
      key: 'study',
      tooltip: 'Обучение',
      iconClass: 'icon-lern',
      path: 'default',
      action: () => popupStore.openPopup('study'),
    },
    {
      key: 'print',
      tooltip: 'Печать',
      iconClass: 'icon-print',
      path: 'default',
      action: async () => {
        if (router.currentRoute.value.path !== '/3d') {
          await router.push('/3d');
        }
        eventBus.emit('A:Save')
        roomState.routConvertData('/2d');
        eventBus.emit("A:ScreenPrint")

        const handleComplete = () => {
          eventBus.off("A:3DScreenshotCreated", handleComplete);
          printPage();
        }

        eventBus.on("A:3DScreenshotCreated", handleComplete);
      },
    },
    {
      key: 'screenshot',
      tooltip: 'Скриншот',
      iconClass: 'icon-zoom',
      path: '/2d',
      action: () => makeScreen(),
    },
    {
      key: 'screenshot3d',
      tooltip: '3D Скриншот',
      iconClass: 'icon-zoom',
      path: '/3d',
      action: () => eventBus.emit("A:Take3DScreenshot"),
    },
    {
      key: 'saveProject',
      tooltip: 'Сохранить',
      iconClass: 'icon-save',
      path: 'default',
      action: async () => {
        projectState.isSaving = true
        if (router.currentRoute.value.path !== '/3d') {
          await router.push('/3d');
        }
        setTimeout(() => {
          eventBus.emit('A:Save')
          onSaveProject()
        }, 2000)
        projectState.isSaving = false
      },
    },
    {
      key: 'newProject',
      tooltip: 'Менеджер проектов',
      iconClass: 'icon-add',
      path: 'default',
      action: () => popupStore.openPopup('project'),
    },
  ];

  return { 
    actions,
    openSaveDialog,
    handleSaveConfirm
  };
}; 