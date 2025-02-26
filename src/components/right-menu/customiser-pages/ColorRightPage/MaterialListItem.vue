<script setup lang="ts">
// @ts-nocheck 31

import { defineProps, defineEmits } from 'vue';
import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { _URL } from "@/types/constants";

/** 
 * tabIndex - индекс выбранного фасада с панели редактирования
 * fasadeData - данные фасада. Тут для того, чтобы при выборе материала 
 * определить него палитру возможных цветов и возможные фрезеровки
 */
const props = defineProps({
  tabIndex: Number,
  fasadeData: Object
});

const emit = defineEmits(["select_material"])

const modelState = useModelState();
const eventBus = useEventBus();

const productData = useModelState().getCurrentModel

const changeFasadeTexture = (data: { [key: string]: any }, fasadeNdx) => {
  // currentFasadeId.value = fasadeNdx;
  // selectedFasade.value = data.ID;

  const productId = productData.PROPS.PRODUCT;

  // console.log('PRODUCT_DATA', productData);
  // console.log('DATA', data);
  // console.log('INDEX', fasadeNdx);
  // console.log('PRODUCT_ID', productId);

  modelState.createCurrentPaletteData(props.fasadeData.ID, productId);
  modelState.createCurrentMillingData({ fasadeId: props.fasadeData.ID, productId });
  modelState.createCurrentWindowsData({ fasadeId: props.fasadeData.ID, productId });
  eventBus.emit("A:ChangeFasadeTexture", { data, fasadeNdx });
  
  emit("select_material")

  console.log(modelState.getCurrentModel, 'MODEL STATE');
  
};

</script>


<template>
  <div class="item" @click="changeFasadeTexture(props.fasadeData, props.tabIndex - 1)">
    <img class="item__img" :src="_URL + props.fasadeData.DETAIL_PICTURE" alt="">
    <div class="item__name">
      {{ props.fasadeData.NAME }}
    </div>
  </div>
</template>


<style lang="scss" scoped>
.item {
  display: flex;
  flex-direction: row;
  cursor: pointer;

  &__img {
    height: 20px;
  }
}
</style>