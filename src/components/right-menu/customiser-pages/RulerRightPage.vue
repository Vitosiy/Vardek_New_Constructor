<script lang="ts" setup>
// @ts-nocheck
import { ref, onMounted, onBeforeMount, watch, computed } from "vue";
import Toggle from "@vueform/toggle";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import DirectionControl from "@/components/ui/direction/DirectionControl.vue";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useModelState } from "@/store/appliction/useModelState";
import { label } from "three/webgpu";

type TDirectionModelType = {
  id: number;
  label: string;
  active: boolean;
};

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
const rootModelsList = ref<TDirectionModelType[] | null>(null);

const getIsUMproduct = computed(() => {
  return !currentModel.value?.PROPS.CONFIG.MODULEGRID;
});

const rotateModel = (id: numbe) => {
  eventBus.emit("A:RotateModel", id);
};

const updateRootModel = (model: TDirectionModelType) => {
  eventBus.emit("A:ChangeRootModel", { data: model.id });
  rootModelsList.value?.forEach((el) => {
     el.active = el.id == model.id;

  });
};

const prepareData = () => {
  const { userData } = modelState.getCurrentModel;
  const { MODEL, MODELID } = userData.PROPS.CONFIG;

  currentModel.value = userData;
  rootModelsList.value = MODEL.map((el) => {
    if (!el) return;
    return {
      id: modelState._MODELS[el].id,
      label: modelState._MODELS[el].type_label,
      active: modelState._MODELS[el].id === MODELID,
    };
  });

  console.log(rootModelsList.value, "rootModelsList.value");

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
  eventBus.emit("A:Model-resize", { data: { ...resizeData.value, ...value } });
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
          <p class="item__label text-grey">
            Мин: {{ sizeEditData.widthMin ?? "н/о" }}
          </p>
          <p class="item__label text-grey">
            Макс: {{ sizeEditData.widthMax ?? "н/о" }}
          </p>
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
          <p class="item__label text-grey">
            Мин: {{ sizeEditData.heightMin ?? "н/о" }}
          </p>
          <p class="item__label text-grey">
            Макс: {{ sizeEditData.heightMax ?? "н/о" }}
          </p>
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
          <p class="item__label text-grey">
            Мин: {{ sizeEditData.depthMin ?? "н/о" }}
          </p>
          <p class="item__label text-grey">
            Макс: {{ sizeEditData.depthMax ?? "н/о" }}
          </p>
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
      <p class="customiser-section__title" v-if="rootModelsList?.length > 1">
        Позиционирование
      </p>
      <div v-if="rootModelsList?.length > 1" class="side-direction">
        <div v-for="(model, key) in rootModelsList" :key="key + model">
          <button
            :class="['side-direction_item', { active: model.active }]"
            @click="updateRootModel(model)"
          >
            {{ model.label }}
          </button>
        </div>
      </div>

      <p class="customiser-section__title">Вращение</p>
      <DirectionControl
        @changeDirectionPos="rotateModel"
        :type="'rotateMap'"
        :scale="0.8"
        :max-width="140"
        :gap="2"
      />

      <!-- <p class="customiser-section__title">Произвольное позиционирование</p>
      <div class="switch__container">
        <Toggle v-model="transformControlsValue" />
      </div> -->
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

.side-direction {
  display: flex;
  gap: 10px;
  &_item {
    border: none;
    border-radius: 15px;
    font-size: 16px;
    padding: 10px 20px;
    min-width: 60px;
    font-weight: 600;
    font-size: small;
    outline: none;
    background: $bg;
    color: $strong-grey;
    transition: background-color 0.2s, transform 0.1s;

    @media (min-height: 1000px) {
      font-size: medium;
      padding: 15px 25px;
    }

    &:hover {
      background-color: #e0e0e0;
    }

    &.active {
      background: $red;
      color: $white;
    }
  }
}
</style>
