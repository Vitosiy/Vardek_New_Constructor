<script lang="ts" setup>
// @ts-nocheck 31
import { onMounted, ref, watch } from "vue";
import { useModelState } from "@/store/appliction/useModelState";

import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import MaterialRedactor from "./MaterialRedactor.vue";
import CorpusMaterialRedactor from "./CorpusMaterialRedactor.vue";
import GroupsManager from "./GroupsManager.vue";
import TransitionDrawingButton from "./TransitionDrawingButton.vue";

// const props = defineProps(["currentModel"]);

const modelState = useModelState();
// const fasadeList = modelState.PROPS.CONFIG.FASADE_PROPS
// const productData = modelState.getCurrentModel;
const redactorsRef = ref<HTMLElement | null>(null);
const fasadeList = ref(null);
const productData = ref(null);
const initialTab = ref("Корпус");

const tabsList = ref<any[]>([]);
const tabIndex = ref<Number>(1)
const isCorpusSelected = ref<boolean>(true)
const isGroupsMode = ref<boolean>(false)
const defaultTabRef = ref<InstanceType<typeof defaultTab> | null>(null)
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

const handleTabChange = ({ index, name }: { index: string | number, name: string }) => {
  if(index === 'groupsManager') {
    tabIndex.value = index;
    isCorpusSelected.value = false;
    return;
  }

  if(index === 0) {
    tabIndex.value = index;
    isCorpusSelected.value = true;
    return;
  }

  if(index) {
    tabIndex.value = index;
    isCorpusSelected.value = false;
    return;
  }
}

const handleTabChange = ({ index, name }) => {

  if (index) {
    tabIndex.value = index;
    isCorpusSelected.value = false;
    return;
  }
  tabIndex.value = index; // TODO вычитать единицу из таб-индекса здесь?
  isCorpusSelected.value = true;
};

const handleTransitionDrawingClick = () => {
  // Сбрасываем активный таб через метод компонента
  if (defaultTabRef.value) {
    defaultTabRef.value.resetActiveTab();
  }

  handleTabChange({ index: 'groupsManager', name: 'groupsManager' });
}



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
  <div :class="$style.container">
    <defaultTab
      ref="defaultTabRef"
      :tabs="tabsList"
      initialTab="Корпус"
      @tab-change="handleTabChange" />
      <TransitionDrawingButton
        :is-active="tabIndex === 'groupsManager'"
        @click="handleTransitionDrawingClick"
      />
  </div>
  <CorpusMaterialRedactor v-if="tabIndex === 0" />
  <MaterialRedactor v-else-if="typeof tabIndex === 'number' && tabIndex > 0" :key="tabIndex" :fasadeData="fasadeList[tabIndex - 1]" :tabIndex="tabIndex"/>
  <GroupsManager v-if="tabIndex === 'groupsManager'" />
</template>


<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}


</style>