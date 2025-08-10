<script setup lang="ts">
// @ts-nocheck 31

import BasketPopUpView from "@/components/popUp/popup-views/BasketPopUpView.vue";
import StudyPopUpView from "@/components/popUp/popup-views/StudyPopUpView.vue";
import ErrorPopUpView from "@/components/popUp/popup-views/ErrorPopUpView.vue";
import ProjectPopUpView from "@/components/popUp/popup-views/ProjectPopUpView.vue";

import { usePopupStore } from '@/store/appStore/popUpsStore';
import CatalogPopUpView from "./popup-views/CatalogPopUpView.vue";

const popupStore = usePopupStore();


const isAnyPopupOpen = popupStore.isAnyPopupOpen;
</script>

<template>
  <div v-if="popupStore.isAnyPopupOpen" class="popUp">
    <div class="popUp__container">
      <BasketPopUpView v-if="popupStore.popups.basket" />
      <StudyPopUpView v-if="popupStore.popups.study"/>
      <ErrorPopUpView v-if="popupStore.popups.error"/>
      <ProjectPopUpView v-if="popupStore.popups.project"/>
      <CatalogPopUpView v-if="popupStore.popups.catalog"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popUp {
  width: 100%;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  background: $black-bg;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  &__container {
    background: $white;
    border-radius: 15px;
    padding: 25px;
  }
}
</style>
../../stores/popUpsStore