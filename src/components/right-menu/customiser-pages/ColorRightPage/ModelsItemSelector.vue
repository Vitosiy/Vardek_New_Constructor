<script lang="ts" setup>
// @ts-nocheck 31
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useModelState } from "@/store/appliction/useModelState";

import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import MaterialRedactor from "./MaterialRedactor.vue";
import CorpusMaterialRedactor from "./CorpusMaterialRedactor.vue";

// const props = defineProps(["currentModel"]);

const modelState = useModelState();
// const fasadeList = modelState.PROPS.CONFIG.FASADE_PROPS
// const productData = modelState.getCurrentModel;
const redactorsRef = ref<HTMLElement | null>(null);
const fasadeList = ref(null);
const productData = ref(null);
// const initialTab = ref("Корпус");

const materialList = ref(null);
const tabsList = ref<any[]>([]);
const tabIndex = ref<Number>(0);
const tabName = ref<string>("Корпус");

const prepareData = () => {
  materialList.value = modelState.getCurrentModuleData;
  fasadeList.value = modelState.getCurrentModel.PROPS.CONFIG.FASADE_PROPS;
  tabsList.value = createTabList(fasadeList.value, materialList.value);
  tabName.value = tabsList.value[0].name;
};

const createTabList = (
  fasadeList: Array<object>,
  materialList: Array<object>
) => {
  let data: Array<object> = [];
  materialList.length > 0
    ? data.push({
        name: "Корпус",
        label: "Корпус",
        title: "Цвет корпуса",
      })
    : false;

  fasadeList.forEach((item, key) => {
    data.push({
      name: `Фасад ${key + 1}`,
      label: `Фасад ${key + 1}`,
      title: "Цвет фасада",
      type: item.TYPE,
    });
  });

  return data;
};

const fasadeIndex = computed(() => {
  if (materialList.value.length > 0) {
    return tabIndex.value - 1;
  }
  return tabIndex.value;
});

onBeforeMount(() => {
  prepareData();
  // initialTab.value = tabsList.value[0].name;
  // console.log(tabsList.value[0].name, fasadeList.value)
  // materialList.value = modelState.getCurrentModuleData;
});

onMounted(() => {
  tabIndex.value = 0;
});

const handleTabChange = ({ index, name }) => {
  tabIndex.value = index;
  tabName.value = name;
};

watch(
  () => modelState.getCurrentModel,
  () => {
    tabIndex.value = 0;
    materialList.value = modelState.getCurrentModuleData;
    tabName.value = tabsList.value[0].name;

    prepareData();
    redactorsRef.value.selectTab(tabName.value, tabIndex.value, true);

  }

);
</script>

<template>
  <defaultTab
    ref="redactorsRef"
    :tabs="tabsList"
    @tab-change="handleTabChange"
  />
  <CorpusMaterialRedactor
    :materialList="materialList"
    v-if="materialList.length > 0 && tabName == 'Корпус'"
  />

  <MaterialRedactor
    v-if="tabName != 'Корпус'"
    :key="tabIndex"
    :fasadeData="fasadeList[fasadeIndex]"
    :tabIndex="fasadeIndex"
  />
</template>
