import { usePopupStore } from '@/store/appStore/popUpsStore';

import { useFullscreen } from '@/features/quickActions/composables/useFullscreen';
import { usePrint } from '@/features/quickActions/composables/usePrint';
import { useScreenshot } from '@/features/quickActions/composables/useScreenshot';

export type ActionKey =
  | 'fullscreen'
  | 'report'
  | 'study'
  | 'print'
  | 'screenshot'
  | 'newProject';

export interface QuickActionItem {
  key: ActionKey;
  tooltip: string;
  iconClass: string;
  action: () => void | Promise<void>;
}

export const useQuickActionsToolbar = () => {
  const popupStore = usePopupStore();

  const { toggleFullscreen } = useFullscreen();
  const { printPage } = usePrint();
  const { makeScreen } = useScreenshot();

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
      key: 'newProject',
      tooltip: 'Новый проект',
      iconClass: 'icon-add',
      action: () => popupStore.openPopup('project'),
    },
  ];

  return { actions };
}; 