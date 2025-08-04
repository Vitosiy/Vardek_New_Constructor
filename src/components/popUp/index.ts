import BasketPopUpView from '@/components/popUp/popup-views/BasketPopUpView.vue';
import StudyPopUpView from '@/components/popUp/popup-views/StudyPopUpView.vue';
import ErrorPopUpView from '@/components/popUp/popup-views/ErrorPopUpView.vue';
import ProjectPopUpView from '@/components/popUp/popup-views/ProjectPopUpView.vue';
import { Component } from 'vue';


export type PopupKey = 'basket' | 'study' | 'error' | 'project'

export type Popup = {
  title?: string,
  component: Component
}

export type PopupsConfig = Record<PopupKey, Popup>

export const POPUP_CONFIG: PopupsConfig = {
  basket: {
    title: 'Корзина',
    component: BasketPopUpView
  },
  study: {
    title: 'Обучение',
    component: StudyPopUpView
  },
  error: {
    title: 'Ошибка',
    component: ErrorPopUpView
  },
  project: {
    title: 'Проект',
    component: ProjectPopUpView
  }
} as const;