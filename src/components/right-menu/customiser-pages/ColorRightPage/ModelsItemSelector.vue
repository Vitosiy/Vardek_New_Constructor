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
const initialTab = ref("Корпус");

const tabsList = ref<TabItem[]>([]);
const tabIndex = ref<number | string>(1);
const isCorpusSelected = ref<boolean>(true);
const isGroupsManagerActive = ref<boolean>(false);

const prepareData = () => {
  fasadeList.value = modelState.getCurrentModel.PROPS.CONFIG.FASADE_PROPS;
  tabsList.value = createTabList(fasadeList.value);
};

const createTabList = (fasadsCount: Array<object>): TabItem[] => {
  let data: TabItem[] = [
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
      type: (item as any).TYPE,
    });
  });

  return data;
};

onMounted(() => {
  prepareData();
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
  
  <!-- Отображаем компоненты в зависимости от активного таба -->
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