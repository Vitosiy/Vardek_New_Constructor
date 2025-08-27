<script lang="ts" setup>
// @ts-nocheck 31
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useModelState } from "@/store/appliction/useModelState";

import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import MaterialRedactor from "./MaterialRedactor.vue";
import CorpusMaterialRedactor from "./CorpusMaterialRedactor.vue";
import GroupsManager from "./GroupsManager.vue";
import TransitionDrawingButton from "./TransitionDrawingButton.vue";

// Типы для табов
interface TabItem {
  name: string;
  label: string;
  title?: string;
  type?: string;
}

// const props = defineProps(["currentModel"]);

const modelState = useModelState();
// const fasadeList = modelState.PROPS.CONFIG.FASADE_PROPS
// const productData = modelState.getCurrentModel;
const redactorsRef = ref<HTMLElement | null>(null);
const fasadeList = ref<any[]>([]);
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
      type: (item as any).TYPE,
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

// Добавляем метод для возврата к обычным табам
const returnToTabs = () => {
  tabIndex.value = 1;
  isCorpusSelected.value = true;
  isGroupsManagerActive.value = false;
  redactorsRef.value?.selectTab(initialTab.value, 0, true);
};

// Экспортируем метод для использования в других компонентах
defineExpose({
  returnToTabs,
  handleTabChange,
  isGroupsManagerActive: readonly(isGroupsManagerActive)
});

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

const handleTransitionDrawingClick = () => {
  handleTabChange({ index: 'groupsManager', name: 'groupsManager' });
}

// Вычисляемое свойство для определения активного состояния кнопки
const isGroupsManagerButtonActive = computed(() => {
  return isGroupsManagerActive.value || tabIndex.value === 'groupsManager';
});
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
  <GroupsManager v-if="isGroupsManagerActive" />
</template>


<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
</style>

<!-- Переходящий рисунок, совместно скорректировать -->

<!-- 

<script lang="ts" setup>
// @ts-nocheck 31
import { onMounted, ref, watch, computed, readonly } from "vue";
import { useModelState } from "@/store/appliction/useModelState";

import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import MaterialRedactor from "./MaterialRedactor.vue";
import CorpusMaterialRedactor from "./CorpusMaterialRedactor.vue";
import GroupsManager from "./GroupsManager.vue";
import TransitionDrawingButton from "./TransitionDrawingButton.vue";

// Типы для табов
interface TabItem {
  name: string;
  label: string;
  title?: string;
  type?: string;
}

// const props = defineProps(["currentModel"]);

const modelState = useModelState();
// const fasadeList = modelState.PROPS.CONFIG.FASADE_PROPS
// const productData = modelState.getCurrentModel;
const redactorsRef = ref<HTMLElement | null>(null);
const fasadeList = ref<any[]>([]);
const productData = ref(null);
// const initialTab = ref("Корпус");

const tabsList = ref<TabItem[]>([]);
const tabIndex = ref<number | string>(1);
const isCorpusSelected = ref<boolean>(true);
const isGroupsManagerActive = ref<boolean>(false);

const prepareData = () => {
  materialList.value = modelState.getCurrentModuleData;
  fasadeList.value = modelState.getCurrentModel.PROPS.CONFIG.FASADE_PROPS;
  tabsList.value = createTabList(fasadeList.value, materialList.value);
  tabName.value = tabsList.value[0].name;
};

const createTabList = (fasadsCount: Array<object>): TabItem[] => {
  let data: TabItem[] = [
    {
      name: "Корпус",
      label: "Корпус",
      title: "Цвет корпуса",
    },
  ];

  fasadeList.forEach((item, key) => {
    data.push({
      name: `Фасад ${key + 1}`,
      label: `Фасад ${key + 1}`,
      title: "Цвет фасада",
      type: (item as any).TYPE,
    });
  });

  return data;
};

onMounted(() => {
  prepareData();
  // initialTab.value = tabsList.value[0].name;
  // console.log(tabsList.value[0].name, fasadeList.value)
  // materialList.value = modelState.getCurrentModuleData;
});

onMounted(() => {
  tabIndex.value = 0;
});

const handleTabChange = ({ index, name }: { index: number | string; name: string }) => {
  // Проверяем, является ли это переключением на GroupManager
  if (name === 'groupsManager' || index === 'groupsManager') {
    tabIndex.value = 'groupsManager';
    isCorpusSelected.value = false;
    isGroupsManagerActive.value = true;
    return;
  }

  // Обычное переключение между табами
  if (typeof index === 'number') {
    tabIndex.value = index;
    isCorpusSelected.value = index === 0; // 0 - это таб "Корпус"
    isGroupsManagerActive.value = false;
  }
};

// Добавляем метод для возврата к обычным табам
const returnToTabs = () => {
  tabIndex.value = 1;
  isCorpusSelected.value = true;
  isGroupsManagerActive.value = false;
  redactorsRef.value?.selectTab(initialTab.value, 0, true);
};

// Экспортируем метод для использования в других компонентах
defineExpose({
  returnToTabs,
  handleTabChange,
  isGroupsManagerActive: readonly(isGroupsManagerActive)
});

watch(
    () => modelState.getCurrentModel,
    () => {
      tabIndex.value = 1;
      isCorpusSelected.value = true;
      isGroupsManagerActive.value = false;
      redactorsRef.value?.selectTab(initialTab.value, 0, true);
      prepareData();
    }
    // { flush: "post", immediate: true }
);

const handleTransitionDrawingClick = () => {
  handleTabChange({ index: 'groupsManager', name: 'groupsManager' });
}

// Вычисляемое свойство для определения активного состояния кнопки
const isGroupsManagerButtonActive = computed(() => {
  return isGroupsManagerActive.value || tabIndex.value === 'groupsManager';
});
</script>

<template>
  <div :class="$style.container">
    <defaultTab
        ref="redactorsRef"
        :tabs="tabsList"
        :initialTab="initialTab"
        @tab-change="handleTabChange"
    />
    <TransitionDrawingButton
        :is-active="isGroupsManagerButtonActive"
        @click="handleTransitionDrawingClick"
    />
  </div>
  

  <CorpusMaterialRedactor v-if="isCorpusSelected && !isGroupsManagerActive" />
  <MaterialRedactor
      v-else-if="!isCorpusSelected && !isGroupsManagerActive"
      :key="tabIndex"
      :fasadeData="fasadeList[tabIndex - 1]"
      :tabIndex="tabIndex"
  />
  <GroupsManager v-if="isGroupsManagerActive" />
</template>


<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
</style>

 -->