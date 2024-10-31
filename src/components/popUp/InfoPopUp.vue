<template>
  <div v-if="popupStore.isInfoPopupOpen" class="info">
    <div class="info__container">
      <div class="info__title">Информация о товаре</div>
      <ClosePopUpButton class="popup__close" @close="toggleInfoPopup" />
      <div class="info__text">Шкаф напольный</div>
      <div class="info-contain">
        <ReaderComponent />
      </div>
    </div>
  </div>
</template>
<script setup>
import ReaderComponent from "@/components/popUp/reader/ReaderComponent.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";

import { usePopupStore } from '@/store/appStore/popUpsStore';

const popupStore = usePopupStore();

const toggleInfoPopup = () => {
  popupStore.toggleInfoPopup();
};
</script>
<style lang="scss" scoped>
.info {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  background: $black-bg;
  z-index: 9999;
  &__container {
    max-width: 1010px;
    background: $white;
    border-radius: 15px;
    padding: 25px;
    position: relative;
    .info__title {
      margin-bottom: 5px;
      font-size: 32px;
      font-weight: 600;
      text-align: center;
    }
  
    .info__text {
      font-size: 18px;
      color: #A3A9B5;
      text-align: center;
      margin-bottom: 30px;
    }
  }
}
</style>