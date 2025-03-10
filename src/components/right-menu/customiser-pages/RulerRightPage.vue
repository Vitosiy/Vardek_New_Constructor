<script lang="ts" setup>
// @ts-nocheck 31
import { reactive } from "vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
const eventBus = useEventBus();
import { useEventBus } from "@/store/appliction/useEventBus";
import { useObjectData } from "@/store/appliction/useObjectData";
import { useModelState } from "@/store/appliction/useModelState";

const modelState = useModelState().getCurrentModel;

/* данные размера модели */
let resizeData: { width: number; height: number; depth: number } = {
  width: modelState.PROPS.CONFIG.SIZE.width,
  height: modelState.PROPS.CONFIG.SIZE.height,
  depth: modelState.PROPS.CONFIG.SIZE.depth,
};

/* данные ограничения размера модели */
let sizeEditData = {
  widthMin: modelState.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_WIDTH_MIN,
  widthMax: modelState.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_WIDTH_MAX,
  heightMin: modelState.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_HEIGHT_MIN,
  heightMax: modelState.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_HEIGHT_MAX,
  depthMin: modelState.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_DEPTH_MIN,
  depthMax: modelState.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_DEPTH_MAX
}

const resizeModel = (value: object) => {
  eventBus.emit("A:Model-resize", {... resizeData, ... value});
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
                     v-model="resizeData.width" 
                     @update:modelValue="resizeModel" 
                     type="number"   
                     :min="sizeEditData.widthMin"
                     :max="sizeEditData.widthMax"
          />
        </div>
        <div class="size-item">
          <p class="item__label text-grey ">Высота</p>
          <MainInput class="input__search right-menu" 
                    v-model="resizeData.height"
                    @update:modelValue="resizeModel" 
                    type="number"
                    :min="sizeEditData.heightMin"
                    :max="sizeEditData.heightMax"  
           />
        </div>
        <div class="size-item">
          <p class="item__label text-grey ">Глубина</p>
          <MainInput class="input__search right-menu" 
                      v-model="resizeData.depth" 
                      @update:modelValue="resizeModel" 
                      type="number"
                      :min="sizeEditData.depthMin"
                      :max="sizeEditData.depthMax" 
          />
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
