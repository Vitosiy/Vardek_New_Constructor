<script lang="ts" setup>
//@ts-nocheck
import MaterialSelector from "./MaterialSelector.vue";
import ConfigurationOption from "./ConfigurationOption.vue";
import {ref, onMounted, onBeforeMount, watch, toRefs, defineExpose} from "vue";
import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";

const modelState = useModelState();
const eventBus = useEventBus();
const props = defineProps<{
  materialList: Object;
  is2Dconstructor: {
    type: Boolean,
    default: false,
  }
}>();


const materialList = ref(null);
const selectedSurfaceID = ref(null);

const currentSurfaceData = ref<any>({});
const isMillingExist = ref(false);
const currentMillingData = ref(null);

const {is2Dconstructor} = toRefs(props);

const emit = defineEmits([
  "parent-callback",
]);

const callback = (material) => {
  emit("parent-callback", material);
}

onBeforeMount(() => {
  materialList.value = props.materialList || modelState.getCurrentModuleData;
  selectedSurfaceID.value = modelState.getCurrentModel.PROPS.CONFIG.MODULE_COLOR;
});

onMounted(() => {
  const current = props.materialList!.find(
    (m) => m.ID === selectedSurfaceID.value
  );
  if (current) {
    currentSurfaceData.value = {
      name: current.NAME,
      imgSrc: current.DETAIL_PICTURE,
    };
  }
});

const changeModuleTexture = (data: any) => {
  currentSurfaceData.value = {
    name: data.NAME,
    imgSrc: data.DETAIL_PICTURE,
  };

  if(!is2Dconstructor.value)
    eventBus.emit("A:ChangeModuleTexture", data);
  else
    callback(data)
};

const deleteSelectedOptions = (type: string) => {
  const fallback = materialList.value![0];
  currentSurfaceData.value = {
    name: fallback.NAME,
    imgSrc: fallback.PREVIEW_PICTURE,
  };
  eventBus.emit("A:ChangeModuleTexture", fallback);
};

watch(
  () => props.materialList,
  () => {
    materialList.value = props.materialList || modelState.getCurrentModuleData;

    selectedSurfaceID.value =
      modelState.getCurrentModel.PROPS.CONFIG.MODULE_COLOR;
    const current = materialList.value!.find(
      (m) => m.ID === selectedSurfaceID.value
    );
    if (current) {
      currentSurfaceData.value = {
        name: current.NAME,
        imgSrc: current.DETAIL_PICTURE,
      };
    }
  }
  // { flush: "post", immediate: true }
);
</script>

<template>
  <div class="container" v-if="!is2Dconstructor">
    <h2 class="container__title">Конфигурация корпуса</h2>
    <div class="configuration">
      <ConfigurationOption
        :type="'surface'"
        :data="currentSurfaceData"
        @delete-choise="deleteSelectedOptions"
      />
      <ConfigurationOption
        v-if="isMillingExist"
        :type="'milling'"
        :data="currentMillingData"
        @delete-choise="deleteSelectedOptions"
      />
    </div>

    <MaterialSelector :materials="materialList" @select="changeModuleTexture" />
  </div>
  <div class="container container--2D-constructor" v-else>
    <div class="configuration">
      <ConfigurationOption
          :type="'surface'"
          :data="currentSurfaceData"
          @delete-choise="deleteSelectedOptions"
      />
      <ConfigurationOption
          v-if="isMillingExist"
          :type="'milling'"
          :data="currentMillingData"
          @delete-choise="deleteSelectedOptions"
      />
    </div>

    <MaterialSelector :materials="materialList" @select="changeModuleTexture" />
  </div>
</template>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  border: 1px solid $stroke;
  border-radius: 10px;
  padding: 15px;
  max-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;

  &__title {
    font-size: large;
    font-weight: 600;
  }

  &--2D-constructor {
    border: unset;
    padding: 0;
  }
}

.configuration {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;

  &__item {
    height: 50px;
    border: 1px solid grey;
    border-radius: 5px;
  }

  @media (min-height: 1000px) {
    gap: 17px;
  }
}
</style>
