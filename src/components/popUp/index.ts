import BasketPopUpView from '@/components/popUp/popup-views/BasketPopUpView.vue';
import StudyPopUpView from '@/features/quickActions/learning/components/StudyPopUpView.vue';
import ErrorPopUpView from '@/features/quickActions/report/ErrorPopUpView.vue';
import ProjectPopUpView from '@/features/quickActions/project/ProjectPopUpView.vue';
import { Component } from 'vue';
import CatalogPopUpView from './popup-views/CatalogPopUpView.vue';
import TechnologistPopUpView from "@/components/popUp/popup-views/TechnologistPopUpView.vue";
import TechnologistForm from "@/components/Technologist/TechnologistForm.vue";


export type PopupKey = 'basket' | 'study' | 'error' | 'project' | 'catalog' | 'technologist' | 'technologist-form'

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
  },
  catalog: {
    title: 'Каталог',
    component: CatalogPopUpView
  },
  technologist: {
    title: 'Технолог',
    component: TechnologistPopUpView
  },
  "technologist-form": {
    title: 'Технолог',
    component: TechnologistForm
  }
} as const;