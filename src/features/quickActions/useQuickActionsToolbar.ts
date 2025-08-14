import { usePopupStore } from '@/store/appStore/popUpsStore';
import { useEventBus } from '@/store/appliction/useEventBus';
import { useSceneState } from '@/store/appliction/useSceneState';

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
  action: () => void | Promise<void>;
}

export const useQuickActionsToolbar = () => {
  const popupStore = usePopupStore();
  const eventBus = useEventBus();
  const sceneState = useSceneState();

  const { toggleFullscreen } = useFullscreen();
  const { printPage } = usePrint();
  const { makeScreen } = useScreenshot();

  // Функция сохранения проекта
  const saveProject = async () => {
    try {
      // Сначала сохраняем сцену в браузер
      eventBus.emit('A:Save')
      
      const projectData = sceneState.getCurrentProjectParams
      
      // Создаем новый проект (так как это быстрая кнопка сохранения)
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
        console.log('Проект сохранен:', data.DATA.data)
      }
    } catch (error) {
      console.error('Ошибка сохранения проекта:', error)
    }
  }

  const actions: QuickActionItem[] = [
    {
      key: 'fullscreen',
      tooltip: 'На весь экран',
      iconClass: 'icon-centered',
      action: () => toggleFullscreen(),
    },
    {
      key: 'report',
      tooltip: 'Сообщить об ошибке',
      iconClass: 'icon-alert',
      action: () => popupStore.openPopup('error'),
    },
    {
      key: 'study',
      tooltip: 'Обучение',
      iconClass: 'icon-lern',
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
      action: () => makeScreen(),
    },
    {
      key: 'saveProject',
      tooltip: 'Сохранить проект',
      iconClass: 'icon-save',
      action: () => saveProject(),
    },
    {
      key: 'newProject',
      tooltip: 'Новый проект',
      iconClass: 'icon-add',
      action: () => popupStore.openPopup('project'),
    },
  ];

  return { actions };
}; 