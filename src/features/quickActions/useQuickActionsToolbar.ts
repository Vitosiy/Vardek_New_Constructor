// @ts-nocheck
import { usePopupStore } from '@/store/appStore/popUpsStore';
import { useEventBus } from '@/store/appliction/useEventBus';
import { useSceneState } from '@/store/appliction/useSceneState';
import { useMenuStore } from "@/store/appStore/useMenuStore";

import { useFullscreen } from '@/features/quickActions/composables/useFullscreen';
import { usePrint } from '@/features/quickActions/composables/usePrint';
import { useScreenshot } from '@/features/quickActions/composables/useScreenshot';

export type ActionKey =
  | 'fullscreen'
  | 'report'
  | 'study'
  | 'print'
  | 'screenshot'
  | 'newProject'
  | 'saveProject';

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
  const sceneState = useSceneState();
  const menuStore = useMenuStore();

  const { toggleFullscreen } = useFullscreen();
  const { printPage } = usePrint();
  const { makeScreen } = useScreenshot();

  // Функция сохранения проекта
  const saveProject = async () => {
    eventBus.emit("A:Save");
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
      action: () => printPage(),
    },
    {
      key: 'screenshot',
      tooltip: 'Скриншот',
      iconClass: 'icon-zoom',
      path: 'default',
      action: () => makeScreen(),
    },
    {
      key: 'saveProject',
      tooltip: 'Сохранить',
      iconClass: 'icon-save',
      path: 'default',
      action: () => saveProject(),
    },
    {
      key: 'newProject',
      tooltip: 'Новый проект',
      iconClass: 'icon-add',
      path: 'default',
      action: () => popupStore.openPopup('project'),
    },
  ];

  return { actions };
}; 