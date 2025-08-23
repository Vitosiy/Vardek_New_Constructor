<script lang="ts" setup>
// @ts-nocheck
import {ref, onMounted, onBeforeMount, watch, computed} from "vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useModelState } from "@/store/appliction/useModelState";

const modelState = useModelState();
const eventBus = useEventBus();

const sizeEditData = ref({
  widthMin: 0,
  widthMax: 0,
  heightMin: 0,
  heightMax: 0,
  depthMin: 0,
  depthMax: 0,
});

const resizeData = ref({
  width: 0,
  height: 0,
  depth: 0,
});

const currentModel = ref(null);
const isMounted = ref(false); // флаг готовности для предотвращения автозапуска

const getIsUMproduct = computed(() => {
  return !currentModel.value?.PROPS.CONFIG.MODULEGRID
})

const prepareData = () => {
  console.log(modelState.getCurrentModel, 'modelState.getCurrentModel')
  currentModel.value = modelState.getCurrentModel;

  sizeEditData.value = {
    widthMin: currentModel.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_WIDTH_MIN,
    widthMax: currentModel.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_WIDTH_MAX,
    heightMin: currentModel.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_HEIGHT_MIN,
    heightMax: currentModel.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_HEIGHT_MAX,
    depthMin: currentModel.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_DEPTH_MIN,
    depthMax: currentModel.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_DEPTH_MAX,
  };

  resizeData.value = {
    width: currentModel.value.PROPS.CONFIG.SIZE.width,
    height: currentModel.value.PROPS.CONFIG.SIZE.height,
    depth: currentModel.value.PROPS.CONFIG.SIZE.depth,
  };
};

const resizeModel = (value: object) => {
  if (!isMounted.value) return; // игнорируем вызов до готовности
  eventBus.emit("A:Model-resize", { ...resizeData.value, ...value });
};

onBeforeMount(() => {
  prepareData();
});

onMounted(() => {
  isMounted.value = true;
});

watch(
  () => modelState.getCurrentModel,
  () => {
    isMounted.value = false; // сбрасываем, чтобы при смене модели не было вызова
    prepareData();
    // включаем реакцию после обновления данных
    requestAnimationFrame(() => {
      isMounted.value = true;
    });
  }
);
</script>

<template>
  <div class="ruler">
    <div class="customiser-section">
      <p class="customiser-section__title">Размер товара</p>
      <div class="settings-size">
        <div class="size-item">
          <p class="item__label text-grey">Ширина</p>
          <MainInput
            class="input__search right-menu"
            v-model="resizeData.width"
            @update:modelValue="resizeModel"
            type="number"
            :min="sizeEditData.widthMin"
            :max="sizeEditData.widthMax"
            :disabled="!getIsUMproduct"
          />
        </div>
        <div class="size-item">
          <p class="item__label text-grey">Высота</p>
          <MainInput
            class="input__search right-menu"
            v-model="resizeData.height"
            @update:modelValue="resizeModel"
            type="number"
            :min="sizeEditData.heightMin"
            :max="sizeEditData.heightMax"
            :disabled="!getIsUMproduct"
          />
        </div>
        <div class="size-item">
          <p class="item__label text-grey">Глубина</p>
          <MainInput
            class="input__search right-menu"
            v-model="resizeData.depth"
            @update:modelValue="resizeModel"
            type="number"
            :min="sizeEditData.depthMin"
            :max="sizeEditData.depthMax"
            :disabled="!getIsUMproduct"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ruler {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .customiser-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    border: 1px solid $stroke;
    border-radius: 15px;
    &__title {
      font-size: 18px;
      font-weight: 600;
    }
    .settings-size {
      display: flex;
      align-items: center;
      gap: 10px;
      .size-item {
        width: 33%;
      }
      .item__label {
        margin-bottom: 2px;
      }
    }
    .settings-walls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      .walls-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
  }
}
</style>
