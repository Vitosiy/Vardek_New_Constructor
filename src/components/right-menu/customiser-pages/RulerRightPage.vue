<script lang="ts" setup>
// @ts-nocheck 31
import { reactive } from "vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
const eventBus = useEventBus();
import { useEventBus } from "@/store/appliction/useEventBus";
import { useObjectData } from "@/store/appliction/useObjectData";
import { useModelState } from "@/store/appliction/useModelState";

// const objectStore = useObjectData().getObjectData;
const modelState = useModelState().getCurrentModel;

console.log(modelState.trueLength, 'RESIZE_COMPONENT');

let data: { width: any; height: any; depth: any } = {
  width: modelState.trueLength*2,
  height: modelState.trueHeight*2,
  depth: modelState.trueDepth*2,
};

const resizeModel = () => {
    eventBus.emit("A:Model-resize", data);
  }



const updateValue = (value: object) => {
  console.log('CHANGE_ SIZE', {...data, ... value});
  eventBus.emit("A:Model-resize", {...data, ... value});
}

const updateW = (e) => {
  console.log(e, 'UPDATE');
}


</script>

<template>
  <div class="ruler">
    <!-- component -->
    <div class="customiser-section">
      <p class="customiser-section__title">Размер товара</p>
      <div class="settings-size">
        <div class="size-item">
          <p class="item__label text-grey">Ширина</p>
          <MainInput class="input__search right-menu"
                     v-model="data.width" 
                     @update:modelValue="updateValue" 
                     type="number" 
                     placeholder="3000 мм"  
                     inputInfo="width"
                     min=""
                     max="null"
                     />
          <!--  <MainInput class="input__search right-menu" v-model="objectStore.PROPS.PRODUCT.width" type="text" placeholder="3000 мм" />
            <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
            <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
            <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
            <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
            <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
            <MainInput class="input__search right-menu" v-model="textValue" type="text" placeholder="300" />
          -->
        </div>
        <div class="size-item">
          <p class="item__label text-grey ">Высота</p>
          <MainInput class="input__search right-menu" v-model="data.height" @update:modelValue="updateValue" type="number" placeholder="3000 мм" inputInfo="height" />
        </div>
        <div class="size-item">
          <p class="item__label text-grey ">Глубина</p>
          <MainInput class="input__search right-menu" v-model="data.depth" @update:modelValue="updateValue" type="number" placeholder="3000 мм" inputInfo="depth"/>
        </div>
      </div>
    </div>
    <div class="customiser-section">
      <p class="customiser-section__title">Расстояние от стен</p>
      <div class="settings-walls">
        <div class="walls-item">
          <img src="../../../assets/svg/right-menu/wallW.svg" alt="" class="wall__icon" />
        </div>
        <div class="walls-item">
          <img src="../../../assets/svg/right-menu/wallH.svg" alt="" class="wall__icon" />
        </div>
        <div class="walls-item">
          <img src="../../../assets/svg/right-menu/wallZ.svg" alt="" class="wall__icon" />
        </div>
      </div>
    </div>
  </div>
</template>

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
      // border: 1px solid red;
      display: flex;
      align-items: center;
      gap: 10px;
      .size-item {
        width: 33%;
      }
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
