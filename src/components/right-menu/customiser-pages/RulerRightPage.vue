<template>
  <div class="ruler">
    <!-- component -->
    <div class="customiser-section">
      <p class="customiser-section__title">Размер товара {{ objectStore.PROPS.PRODUCT.width }}</p>
      <div class="settings-size">
        <div class="size-item">
          <p class="item__label text-grey" @click="resizeModel">Ширина</p>
          <MainInput class="input__search right-menu" v-model="objectStore.PROPS.PRODUCT.width" type="text" placeholder="3000 мм" />
        </div>
        <div class="size-item">
          <p class="item__label text-grey ">Высота</p>
          <MainInput class="input__search right-menu" v-model="objectStore.PROPS.PRODUCT.height" type="text" placeholder="3000 мм" />
        </div>
        <div class="size-item">
          <p class="item__label text-grey ">Глубина</p>
          <MainInput class="input__search right-menu" v-model="objectStore.PROPS.PRODUCT.depth" type="text" placeholder="3000 мм" />
        </div>
      </div>
    </div>
    <div class="customiser-section">
      <p class="customiser-section__title">Расстояние от стен</p>
      <div class="settings-walls">
        <div class="walls-item">
          <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
          <img src="../../../assets/svg/right-menu/wallW.svg" alt="" class="wall__icon" />
          <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
        </div>
        <div class="walls-item">
          <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
          <img src="../../../assets/svg/right-menu/wallH.svg" alt="" class="wall__icon" />
          <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
        </div>
        <div class="walls-item">
          <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
          <img src="../../../assets/svg/right-menu/wallZ.svg" alt="" class="wall__icon" />
          <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import MainInput from "@/components/ui/inputs/MainInput.vue";
const eventBus = useEventBus();
import { useEventBus } from "@/store/appliction/useEventBus";
import { useObjectData } from "@/store/appliction/useObjectData";

const objectStore = useObjectData().getObjectData;


const resizeModel = () => {
    let data: { width: any; height: any; depth: any } = {
      width: objectStore.PROPS.PRODUCT.width,
      height: objectStore.PROPS.PRODUCT.height,
      depth: objectStore.PROPS.PRODUCT.depth,
    };
    eventBus.emit("A:Model-resize", data);
  }


</script>
<style lang="scss" scoped>
.ruler {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .customiser-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    border: 1px solid $stroke;
    border-radius: 15px;
    &__title {
      font-size: 18px;
      font-weight: 600;
    }
    .settings-size {
      display: flex;
      align-items: center;
      gap: 10px;
      .item__label {
        margin-bottom: 2px;
      }
    }
    .settings-walls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      .walls-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
  }
}
</style>
