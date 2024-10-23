<template>
  <div>
    <div class="study">
      <div class="study-header">
        <div class="study__title">Обучение</div>
        <ClosePopUpButton class="popup__close" @close="closePopup" />
      </div>
      <div class="study-parts">
        <MainButton :className="'red__button'" @click="handleButtonClick">Кухонные шкафы</MainButton>
        <MainButton :className="'grey__button'" @click="handleButtonClick">Столешница</MainButton>
        <MainButton :className="'grey__button'" @click="handleButtonClick">Шкафы</MainButton>
        <MainButton :className="'grey__button'" @click="handleButtonClick">Бытовая техника</MainButton>
        <MainButton :className="'grey__button'" @click="handleButtonClick">Бытовая техника</MainButton>
        <MainButton :className="'grey__button'" @click="handleButtonClick">Модули</MainButton>
        <MainButton :className="'grey__button'" @click="handleButtonClick">Свет</MainButton>
      </div>
      <MainInput class="input__search" v-model="textValue" type="text" placeholder="Поиск..." />
      <div class="study-main">
        <ReaderComponent/>
      </div>
    </div>
  </div>
</template>
<script setup>
import MainButton from "@/components/ui/buttons/MainButton.vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import ReaderComponent from "@/components/popUp/reader/ReaderComponent.vue";

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";

import { usePopupStore } from '@/store/appStore/popUpsStore';

const popupStore = usePopupStore();

const closePopup = () => {
  popupStore.closePopup('study');
};
</script>
<style lang="scss" scoped>
.study {
  width: 100%;
  max-width: 1250px;
  position: relative;
  &-header {
    .study__title {
      margin-bottom: 20px;
      font-size: 32px;
      font-weight: 600;
      text-align: center;
    }
  }
  .study-parts {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 0;
    margin-bottom: 10px;
    border-top: 1px solid $stroke;
    border-bottom: 1px solid $stroke;
  }
  .study-main {
    margin-top: 30px;
  }
}
</style>
