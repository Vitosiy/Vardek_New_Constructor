
<script lang="ts" setup>
// @ts-nocheck 31
import { onMounted, ref, watch } from "vue";
import { useModelState } from "@/store/appliction/useModelState";

import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import MaterialRedactor from "./MaterialRedactor.vue";
import CorpusMaterialRedactor from "./CorpusMaterialRedactor.vue";

console.log(useModelState().getCurrentModel, 'CURRENT MODEL MATERIAL REDACTOR');

const modelState = useModelState().getCurrentModel
const fasadeList = modelState.PROPS.CONFIG.FASADE_PROPS
const productData = modelState.getCurrentModel;

console.log(fasadeList, 'FASADE LIST');


const tabsList = ref<any[]>([]);
const tabIndex = ref<Number>(1)
const isCorpusSelected = ref<boolean>(true)

const createTabList = (fasadsCount: Array<object>) => {
  let data = [
    {
      name: "Корпус",
      label: "Корпус",
      title: "Цвет корпуса",
    },
  ];
  
  fasadsCount.forEach((item, key) => {
    data.push({
      name: `Фасад ${key + 1}`,
      label: `Фасад ${key + 1}`,
      title: "Цвет фасада",
      type: item.TYPE,
    });
  });
  
  return data;
};

onMounted(() => {
  // productColor.value = objectData.PROPS.CONFIG.MODULE_COLOR_LIST;

  // console.log(modelState.PROPS.CONFIG.MODULE_COLOR_LIST, 'КОРПУС');
  // console.log(modelState.PROPS.CONFIG.FASADE_PROPS, 'МАССИВ ФАСАДОВ');

  // console.log(modelState.PROPS.CONFIG.FASADE_PROPS, 'НЕЧТО');

  // console.log(useModelState().getCurrentModelFasadesData, 'ВОЗМОЖНЫЕ ВАРИАНТЫ ФАСАДОВ');
  // console.log(fasadeMillingList, 'MILLING');
  
  // productFasades.value = objectData?.PROPS.CONFIG.FASADE_PROPS;
  // fasades.value = modelState.getCurrentModelFasadesData;
  tabsList.value = createTabList(fasadeList)
})

const handleTabChange = ({ index, name }) => {
  if(index) {
    tabIndex.value = index
    isCorpusSelected.value = false
    // console.log('FASADE: ', fasadeList[index]);
    return
  }
  tabIndex.value = index // TODO вычитать единицу из таб-индекса здесь?
  isCorpusSelected.value = true 
}

</script>

<template>
  <defaultTab
  :tabs="tabsList"
  initialTab="Корпус"
  @tab-change="handleTabChange" />
  <CorpusMaterialRedactor v-if="isCorpusSelected" />
  <MaterialRedactor v-else :key="tabIndex" :fasadeData="fasadeList[tabIndex - 1]" :tabIndex="tabIndex"/>
</template>

<style lang="scss" scoped>
</style>