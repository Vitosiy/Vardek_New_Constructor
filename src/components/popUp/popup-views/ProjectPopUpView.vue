<template>
  <div class="project">
    <div class="project__title">Открыть проект</div>
    <ClosePopUpButton class="popup__close" @close="closePopup" />
    <div class="project__container">
      <div class="project-header">
        <div class="project-search">
          <MainInput class="input__search" v-model="textValue" type="text" placeholder="Название" />
          <MainInput class="input__search" v-model="textValue" type="text" placeholder="ID" />
        </div>
        <div class="project-buttons">
          <MainButton :className="'red__button'" @click="handleButtonClick">Готовые проекты</MainButton>
          <MainButton :className="'grey__button'" @click="handleButtonClick">Мои проекты</MainButton>

        </div>
      </div>
      <div class="project-warning">
        <div class="warning-text">
          <p class="warning-text__title">Внимание</p>
          <p class="warning-text__text">Ваш проект не сохранен. При переходе на новый проект, данные текущего проекта не
            сохранятся</p>
        </div>
        <MainButton :className="'blue__button'" @click="handleButtonClick">Сохранить</MainButton>

      </div>
      <div class="project-list">
        <div class="project-new">
          <img src="../../../assets/svg/popup/add.svg" alt="">
          <p class="new__title">Создать новый проект</p>
        </div>
        <div v-for="(item, index) in 12" :key="index" class="project-item">
          <img src="../../../assets/img/proj.png" class="item__image" />
          <div class="item-info">
            <div class="info-id">
              <p class="id__name">Название</p>
              <p class="id__number text-grey">ID 245223</p>
            </div>
            <p class="info__date text-grey">24.02.2024</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import MainButton from "@/components/ui/buttons/MainButton.vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";

import { usePopupStore } from '@/store/appStore/popUpsStore';

const popupStore = usePopupStore();

const closePopup = () => {
  popupStore.closePopup('project');
};
</script>
<style lang="scss" scoped>
.project {
  width: 100%;
  height: 80vh;
  max-width: 1347px;
  position: relative;
  overflow: hidden;
  &__title {
    text-align: center;
    margin-bottom: 30px;
    font-size: 32px;
    font-weight: 600;
  }

  &__container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      border: 1px solid $stroke;
      border-radius: 15px;

      .project-search {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .project-buttons {
        display: flex;
        align-items: center;
        gap: 10px;

      }
    }

    .project-warning {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F6F5FA;
      border-radius: 15px;
      padding: 19px 15px;

      .warning-text {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
    }

    .project-list {
      max-height: 500px;
      display: flex;
      flex-wrap: wrap;
      overflow-y: auto;
      gap: 15px;

      .project-new {
        width: 323px;
        height: 269px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        border: 1px solid $stroke;
        border-radius: 16px;
        box-sizing: border-box;
      }

      .project-item {
        width: 323px;
        height: 269px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
        border-radius: 16px;
        background-color: $bg;
        overflow: hidden;

        .item__image {
          margin: 0;
          width: 100%;
          height: 200px;
        }

        .item-info {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 15px 10px;
          box-sizing: border-box;
        }
      }
    }
  }
}
</style>
