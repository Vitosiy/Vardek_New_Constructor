<template>
  <div class="error">
    <div class="error__title">Сообщить об ошибке</div>
    <ClosePopUpButton class="popup__close" @close="closePopup" />
    <div class="error-input">
      <p class="error__text">Опишите проблему/ошибку</p>
      <textarea class="error__textarea"></textarea>
    </div>
    <button class="error__button">Отправить</button>
  </div>
</template>
<script lang="ts" setup>
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";

import { usePopupStore } from '@/store/appStore/popUpsStore';

const popupStore = usePopupStore();

const closePopup = () => {
  popupStore.closePopup('error');
};
</script>
<style lang="scss" scoped>
.error {

  width: 822px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  position: relative;

  &__title {
    margin-bottom: 5px;
    font-size: 32px;
    font-weight: 600;
  }
  &
  &__text {
    font-size: 18px;
    color: $dark-grey;
  }

  &-input {
    width: 100%;

    .error__textarea {
      width: 100%;
      height: 249px;
      resize: none;
      background: $stroke;
      border-radius: 15px;
      border: none;
      margin-bottom: 30px;
    }
  }

  .error__button {
    width: 132px;
    height: 50px;
    font-size: 16px;
    font-weight: 500;
    border: none;
    border-radius: 15px;
    background: $red;
    color: $white;
  }
}
</style>
