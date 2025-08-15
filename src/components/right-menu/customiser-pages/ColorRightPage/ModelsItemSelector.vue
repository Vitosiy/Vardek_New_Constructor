<script lang="ts" setup>
// @ts-nocheck 31
import { onMounted, ref, watch } from "vue";
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
const initialTab = ref("Корпус");

const tabsList = ref<any[]>([]);
const tabIndex = ref<Number>(1);
const isCorpusSelected = ref<boolean>(true);

const prepareData = () => {
  fasadeList.value = modelState.getCurrentModel.PROPS.CONFIG.FASADE_PROPS;
  tabsList.value = createTabList(fasadeList.value);
};

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

  prepareData();
});

const handleTabChange = ({ index, name }) => {

  if (index) {
    tabIndex.value = index;
    isCorpusSelected.value = false;
    return;
  }
  tabIndex.value = index; // TODO вычитать единицу из таб-индекса здесь?
  isCorpusSelected.value = true;
};

watch(
  () => modelState.getCurrentModel,
  () => {
    tabIndex.value = 1;
    redactorsRef.value.selectTab(initialTab.value, tabIndex.value, true);
    isCorpusSelected.value = true;
    prepareData();
  }
  // { flush: "post", immediate: true }
);
</script>

<template>
  <defaultTab
    ref="redactorsRef"
    :tabs="tabsList"
    :initialTab="initialTab"
    @tab-change="handleTabChange"
  />
  <CorpusMaterialRedactor v-if="isCorpusSelected" />
  <MaterialRedactor
    v-else
    :key="tabIndex"
    :fasadeData="fasadeList[tabIndex - 1]"
    :tabIndex="tabIndex"
  />
</template>
