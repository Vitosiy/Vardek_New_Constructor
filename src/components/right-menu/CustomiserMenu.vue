<script setup lang="ts">
// @ts-nocheck 31

import RulerPage from "@/components/right-menu/customiser-pages/RulerRightPage.vue";
import ColorPage from "@/components/right-menu/customiser-pages/ColorRightPage.vue";
import ModelsItemSelector from "@/components/right-menu/customiser-pages/ColorRightPage/ModelsItemSelector.vue"
import MovingPage from "@/components/right-menu/customiser-pages/MovingRightPage.vue";
import FigurePage from "@/components/right-menu/customiser-pages/FigureRightPage.vue";

import RulerButton from "@/components/ui/buttons/right-menu/RulerRightButton.vue";
import ColorButton from "@/components/ui/buttons/right-menu/ColorRightButton.vue";
import MovingButton from "@/components/ui/buttons/right-menu/MovingRightButton.vue";
import FigureButton from "@/components/ui/buttons/right-menu/FigureRightButton.vue";
import HammerButton from "@/components/ui/buttons/right-menu/HammerRightButton.vue";

import { useCustomiserStore } from '@/store/appStore/useCustomiserStore';
import { useModelState } from "@/store/appliction/useModelState";

const customiserStore = useCustomiserStore();

const togglePopup = () => {
  customiserStore.toggleCustomiserPopup();
};

// const customise = defineProps({
//   productData: Object,
//   productSize: Object
// })

</script>

<template>
  <div v-if="customiserStore.isCustomiserOpen" class="customiser">
    <div class="customiser__container">
      <div class="customiser-header">
        <p class="customiser__title">Редактирование</p>
        <div class="customiser-links">
          <!-- Rework -->
          <RulerButton />
          <ColorButton />
          <MovingButton />
          <FigureButton />
          <HammerButton />
        </div>
        <img src="@/assets/svg/right-menu/close.svg" class="close__button" @click="togglePopup" />
      </div>
      <div class="cusomiser-main">
        <RulerPage v-if="customiserStore.customisers == 'ruler'" />
        <ColorPage v-if="customiserStore.customisers == 'color'" />
        <!--
          <ModelsItemSelector v-if="customiserStore.customisers == 'color'" />
        -->
        <MovingPage v-if="customiserStore.customisers == 'moving'" />
        <FigurePage v-if="customiserStore.customisers == 'figure'" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.customiser {
  width: 100%;
  max-width: 551px;
  position: absolute;
  top: 106px;
  right: 20px;
  padding: 15px;
  background: $white;
  box-shadow: 0px 0px 10px 0px #3030301a;
  z-index: 10;
  border-radius: 15px;
  transition: 0.5s ease-in-out;
  transform: translateZ(-10px);
  box-sizing: border-box;

  &__container {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .customiser-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .customiser__title {
        margin-right: 50px;
        font-size: 18px;
        font-weight: 600;
      }

      .customiser-links {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .close__button {
        cursor: pointer;
      }
    }
  }
}
</style>
