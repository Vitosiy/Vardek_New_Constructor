<template>
  <div>
    <div class="info">
      <div class="info__title">Информация о товаре</div>
      <ClosePopUpButton class="popup__close" @close="closePopup" />
      <div class="info__text">Шкаф напольный</div>
      <div class="info__container">
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

const closePopup = () => {
  popupStore.closePopup('info');
};
</script>
<style lang="scss" scoped>
.info {
  width: 100%;
  max-width: 1011px;
  position: relative;
  &__title {
    margin-bottom: 5px;
    font-size: 32px;
    font-weight: 600;
    text-align: center;
  }
  &__text {
    font-size: 18px;
    color: #A3A9B5;
    text-align: center;
    margin-bottom: 30px;
  }
}
</style>