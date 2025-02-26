<script setup lang="ts">
// @ts-nocheck 31
// Интерфейс для табов
interface Tab {
  name: string;
  label: string;
}

import { defineProps, watch, ref, onMounted, computed, reactive } from 'vue';
import { useModelState } from '@/store/appliction/useModelState';
import { useAppData } from "@/store/appliction/useAppData";

import ConfigurationOption from './ConfigurationOption.vue';
import SurfaceRedactor from './SurfaceRedactor.vue';
import MillingRedactor from './MillingRedactor.vue';
import ColorRedactor from './ColorRedactor.vue';

const props = defineProps({
  tabIndex: Number, /** Индекс выбранного фасада в defaultTab.vue */
  fasadeData: Object
  })

const _APP = useAppData().getAppData;
const _FASADE = _APP.FASADE;
  
const modelState = useModelState() 
const materialList = modelState.getCurrentModelFasadesData
const productData = modelState.getCurrentModel;
const productId = productData.PROPS.PRODUCT;



let currentEditableOption = ref<String>('surface')
let key = ref<Number>(props.tabIndex)

let millingList = ref<Array>([])
let isMillingExist = ref<boolean>(false)
// let isMillingExist = ref<null | Boolean>(props.fasadeData.MILLING)
// let isMillingExist = computed(() => {
//   console.log('computed', millingList.value);
  
//   return props.fasadeData.MILLING ? true :  millingList.value.length > 0
// })

let paletteList = ref<Object>({})
let isPalleteExist = ref<boolean>(false)
// let isPalleteExist = computed(() => {
//   return props.fasadeData.PALETTE ? props.fasadeData.PALETTE : paletteList.value.length > 0
// })


const onSelectMaterial = () => {
  // console.log(useModelState().getCurrentMillingData, 'MILLING');
  // console.log(useModelState().getCurrentPaletteData, 'PALETE');
  millingList.value = modelState.getCurrentMillingData
  isMillingExist.value = millingList.value.length > 0
  console.log(isMillingExist.value, 'is milling exist');
  
  
  paletteList.value = modelState.getCurrentPaletteData
  isPalleteExist.value = Object.keys(paletteList.value).length > 0

}

/** Выбор панели редактирования фрезеровки или цвета, если такая опция существует */
const setCurrentEditableOption = (name: String) => {
  currentEditableOption.value = name
}

onMounted(() => {
  console.log(props.tabIndex - 1, 'TABINDEX');
  
  // modelState.createCurrentMillingData(_FASADE ,productId)
  // console.log(props.fasadeData, 'FASADE_DATA', isMillingExist.value);

  console.log(productData.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1], 'CURRENT FASDE');
})

/**
 
<div class="configuration__item" @click="setCurrentEditableOption('surface')">Поверхность</div>
<div class="configuration__item" @click="setCurrentEditableOption('milling')" v-if="isMillingExist">Фрезеровка</div>
<div class="configuration__item" @click="setCurrentEditableOption('palette')" v-if="isPalleteExist">Палитра</div>
 */

</script>

<template>
  <div class="container">
    <div class="container__title">Конфигурация фасада {{ props.tabIndex }}</div>
    <div :key="key">
      <div class="configuration">
        <ConfigurationOption :type="'surface'" />
        <ConfigurationOption :type="'milling'" />
        <ConfigurationOption :type="'palette'" />
      </div>
      <div class="container__list">
        <SurfaceRedactor v-if="currentEditableOption === 'surface'" :materialList="materialList" :tabIndex="props.tabIndex - 1"  @select_material="onSelectMaterial"/>
        <MillingRedactor v-if="currentEditableOption === 'milling'" :millingList="millingList" :tabIndex="props.tabIndex - 1" />
        <ColorRedactor v-if="currentEditableOption === 'palette'" :paletteList="paletteList" :tabIndex="props.tabIndex - 1" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  border: 1px solid rgb(195, 195, 195);
  border-radius: 10px;
  padding: 15px;

  &__title {
    font-size: large;
    font-weight: 600;
  }

  &__list {
    border: 1px solid rgb(179, 179, 179);
    border-radius: 10px;
    padding: 10px;
  }
}

.configuration {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  &__item {
    height: 50px;
    border: 1px solid grey;
    border-radius: 5px;
  }
}
</style>

