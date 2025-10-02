<script lang="ts" setup>
// @ts-nocheck 31
import {
  computed,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { useModelState } from "@/store/appliction/useModelState";
import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import MaterialRedactor from "./MaterialRedactor.vue";
import CorpusMaterialRedactor from "./CorpusMaterialRedactor.vue";
import GroupsManager from "./GroupsManager.vue";
import TransitionDrawingButton from "./TransitionDrawingButton.vue";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useUniformState } from "@/store/appliction/useUniformState";
import { useCustomiserStore } from "@/store/appStore/useCustomiserStore";

// Типы для табов
interface TabItem {
  name: string;
  label: string;
  title?: string;
  type?: string;
}

const modelState = useModelState();
const uniformState = useUniformState();
const customiserStore = useCustomiserStore();
const redactorsRef = ref<HTMLElement | null>(null);
const fasadeList = ref<any[]>([]);
const productData = ref(null);
const eventBus = useEventBus();
const materialList = ref(null);
const tabsList = ref<any[]>([]);
const tabIndex = ref<Number>(0);
const tabName = ref<string>("Корпус");
const isGroupsManagerActive = ref<boolean>(false);
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
});

onMounted(() => {
  tabIndex.value = 0;
});

const handleTabChange = ({ index, tab }) => {
  console.log(index, tab);

  // Если переключаемся на другой таб, отключаем режим переходящего рисунка
  if (isGroupsManagerActive.value) {
    eventBus.emit("A:Toggle-Uniform-Mode", { showGroupsManager: false });
  }

  isGroupsManagerActive.value = false;
  tabIndex.value = index;
  tabName.value = tab.name;
};

// Добавляем метод для возврата к обычным табам
const returnToTabs = () => {
  // Отключаем режим переходящего рисунка при возврате к табам
  if (isGroupsManagerActive.value) {
    eventBus.emit("A:Toggle-Uniform-Mode", { showGroupsManager: false });
  }

  tabIndex.value = 1;
  isCorpusSelected.value = true;
  isGroupsManagerActive.value = false;
  redactorsRef.value?.selectTab(initialTab.value, 0, true);
};

const handleTransitionDrawingClick = () => {
  // Переключаем режим переходящего рисунка с флагом
  eventBus.emit("A:Toggle-Uniform-Mode", { showGroupsManager: true });
};
// Обработчик для синхронизации состояния uniformMode
const handleUniformModeToggled = (data: {
  uniformMode: boolean;
  showGroupsManager: boolean;
}) => {
  console.log("Uniform mode toggled:", data);
  isGroupsManagerActive.value = data.showGroupsManager && data.uniformMode;
};

// Экспортируем метод для использования в других компонентах
defineExpose({
  returnToTabs,
  handleTabChange,
  // isGroupsManagerActive: readonly(isGroupsManagerActive)
});

watch(
  () => modelState.getCurrentModel,
  () => {
    // Отключаем режим переходящего рисунка при смене модели
    if (isGroupsManagerActive.value) {
      eventBus.emit("A:Toggle-Uniform-Mode", { showGroupsManager: false });
    }

    tabIndex.value = 0;
    materialList.value = modelState.getCurrentModuleData;
    tabName.value = tabsList.value[0].name;
    isGroupsManagerActive.value = false;

    prepareData();
    redactorsRef.value.selectTab(tabName.value, tabIndex.value, true);
  }
);

// Следим за изменениями uniformMode для синхронизации состояния
watch(
  () => uniformState.getUniformModeData.uniformMode,
  (newUniformMode) => {
    // Если uniformMode выключен, скрываем менеджер групп
    if (!newUniformMode) {
      isGroupsManagerActive.value = false;
      customiserStore.hideCustomiserPopup();
    }
  }
);

// Подписываемся на событие синхронизации состояния
onMounted(() => {
  eventBus.on("A:Uniform-Mode-Toggled", handleUniformModeToggled);
});

onUnmounted(() => {
  eventBus.off("A:Uniform-Mode-Toggled", handleUniformModeToggled);
});
</script>

<template>
  <defaultTab
    ref="redactorsRef"
    :tabs="tabsList"
    @tab-change="handleTabChange"
  />
  <TransitionDrawingButton
    :class="$style.transitionDrawingButton"
    :is-active="isGroupsManagerActive"
    @click="handleTransitionDrawingClick"
  />
  <CorpusMaterialRedactor
    :materialList="materialList"
    v-if="
      materialList.length > 0 && tabName == 'Корпус' && !isGroupsManagerActive
    "
  />

  <MaterialRedactor
    v-if="tabName != 'Корпус' && !isGroupsManagerActive"
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
