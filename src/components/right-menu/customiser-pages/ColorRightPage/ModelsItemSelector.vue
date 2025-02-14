
<script lang="ts" setup>
// @ts-nocheck 31
import { onMounted, ref, watch } from "vue";
import { useModelState } from "@/store/appliction/useModelState";

import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import MaterialRedactor from "./MaterialRedactor.vue";

console.log(useModelState().getCurrentModel, 'MATERIAL REDACTOR');

const modelState = useModelState().getCurrentModel
console.log();


const tabsList = ref<any[]>([]);
const itemType = ref<string>('Корпус');
const materialList = ref<Array>(modelState.PROPS.CONFIG.MODULE_COLOR_LIST)
const itemMaterialData = ref<{ [key: string]: any }>({})


const createTabList = (fasadsCount: Array<object>) => {
  let data = [
    {
      name: "Корпус",
      label: "Корпус",
      title: "Цвет корпуса",
    },
  ];
  
  fasadsCount.forEach((item, key) => {
    console.log(item, `ФАСАД ${key}`);
    
    data.push({
      name: `Фасад ${key + 1}`,
      label: `Фасад ${key + 1}`,
      title: "Цвет фасада",
      type: item.TYPE,
    });
  });

  console.log(data, fasadsCount.length, "--createTabList");
  
  return data;
};

onMounted(() => {
  // productColor.value = objectData.PROPS.CONFIG.MODULE_COLOR_LIST;
  console.log(modelState.PROPS.CONFIG.MODULE_COLOR_LIST, 'КОРПУС');
  console.log(modelState.PROPS.CONFIG.FASADE_PROPS, 'МАССИВ ФАСАДОВ');
  // console.log(modelState.PROPS.CONFIG.FASADE_PROPS, 'НЕЧТО');
  console.log(useModelState().getCurrentModelFasadesData, 'ВОЗМОЖНЫЕ ВАРИАНТЫ ФАСАДОВ');
  
  // productFasades.value = objectData?.PROPS.CONFIG.FASADE_PROPS;
  // fasades.value = modelState.getCurrentModelFasadesData;
  tabsList.value = createTabList(modelState.PROPS.CONFIG.FASADE_PROPS)
})

const handleTabChange = (index: number) => {
  console.log(index, 'PARENT');
  if(index) {
    materialList.value = useModelState().getCurrentModelFasadesData
    return
  }
  materialList.value = modelState.PROPS.CONFIG.MODULE_COLOR_LIST
}

</script>

<template>
  <div>
    <defaultTab
      :tabs="tabsList"
      initialTab="Корпус"
      @tab-change="handleTabChange"
    >
    </defaultTab>
    <MaterialRedactor :materialList="materialList" />
  </div>
</template>