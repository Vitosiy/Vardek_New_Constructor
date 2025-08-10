<script setup lang="ts">
// @ts-nocheck 31

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";

import { useAppData } from "@/store/appliction/useAppData";
import { useMenuStore } from "@/store/appStore/useMenuStore";
import { usePopupStore } from "@/store/appStore/popUpsStore";
import { computed } from "vue";

import { _URL } from "@/types/constants";

const menuStore = useMenuStore();
const catalogProducts = useAppData().getAppData.CATALOG.PRODUCTS;

const filteredData = computed(() => {
  if (menuStore.catalogFilterProductsId) {
    return Object.values(catalogProducts).filter((item) =>
      menuStore.catalogFilterProductsId.includes(item.ID)
    );
  } else {
    console.log("empty");
  }
});

// const baseUrl = 'https://vardek.ru';

// Вариант статики
// const getImageUrl = (imageName: string) => {
//   return `${baseUrl}/${imageName}`;
// };

// Вариант Александра
const getImageUrl = (imageName: string) => {
  return ` ${_URL}${imageName}`;
};

const dropItems: { [key: string]: {} } = catalogProducts;

const onDrag = (event: any, model: { [key: string]: any } | string) => {
  event.dataTransfer?.setData("text", JSON.stringify(model));
};

const closeMenu = (menuType: MenuType) => {
  menuStore.closeMenu(menuType);
};

const popupStore = usePopupStore();

const openPopup = (popupName: keyof typeof popupStore.popups) => {
  popupStore.openPopup(popupName);
};

const toggleInfoPopup = () => {
  popupStore.toggleInfoPopup();
};
</script>

<template>
  <div class="options-popup">
    <h1 class="popup__title">Основное</h1>
    <ClosePopUpButton class="menu__close" @close="closeMenu('tech')" />
    <div
      v-if="menuStore.catalogFilterProductsId"
      class="options-popup__container"
    >
      <div
        v-for="item in filteredData"
        class="popup-items"
        draggable="true"
        :key="item.name"
        @dragstart="onDrag($event, item)"
      >
        <div class="popup-items-picture">
          <img
            src="@/assets/svg/left-menu/question.svg"
            class="popup-items__question"
            @click="toggleInfoPopup"
          />
          <img
            :src="getImageUrl(item.PREVIEW_PICTURE)"
            class="popup-items__image"
          />
        </div>
        <p class="popup-items__title">{{ item.NAME }}</p>
      </div>
    </div>
    <div v-else class="options-popup-isempty">
      Товары в каталоге отсутсвуют, обратитесь в поддержку
    </div>
  </div>
</template>

<style lang="scss" scoped>
.options-popup {
  width: max-content;
  max-width: 575px;
  min-width: 210px;
  position: absolute;
  top: 15px;
  // left: -840px;
  left: 320px;
  padding: 15px;
  background: $white;
  box-shadow: 0px 0px 10px 0px #3030301a;
  z-index: -1;
  border-radius: 15px;
  // transition: 0.5s ease-in-out;
  // transform: translateZ(-10px);

  &__container {
    max-height: 80vh;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    overflow: auto;

    .popup-items {
      width: 167px;
      height: 240px;
      display: flex;
      flex-direction: column;
      padding: 10px;
      background: #f6f5fa;
      border-radius: 15px;
      gap: 10px;

      &__title {
        font-size: 15px;
        font-weight: 500;
      }
      .popup-items-picture {
        position: relative;
        .popup-items__question {
          position: absolute;
          top: 10px;
          right: 5px;
          cursor: pointer;
        }
        .popup-items__image {
          height: 150px;
          max-width: 150px;
          padding: 10px;
          background: #ffffff;
          border-radius: 15px;
          object-fit: contain;
        }
      }
    }
  }

  &.active {
    left: 330px;
  }
}
</style>
