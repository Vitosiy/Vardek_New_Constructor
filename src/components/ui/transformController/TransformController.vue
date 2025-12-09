<!-- src/components/ui/transform/TransformModeSwitcher.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import Toggle from "@vueform/toggle";
import Accordion from "@/components/ui/accordion/Accordion.vue";

import { useTransformController } from "./useTransformController";
import { useEventBus } from "@/store/appliction/useEventBus";

const eventBus = useEventBus();
const {
  getTransformControlsValue,
  setTransformControlsValue,
  getTransformControlSnapAngles,
  setControlSnapAngle,
  getControlSnapAngle,
  getTransformControlsName,
  setTransformControlsName
} = useTransformController();

// === Локальное состояние (полностью независимо от родителя) ===
const transformControlsValue = ref<boolean>(false);
const curControllerValue = ref<string>("Позиционирование");
const curAngleParam = ref<number>(1);

const controllerValue = ref([
  { name: "Позиционирование", type: "translate" },
  { name: "Вращение", type: "rotate" },
]);

const emit = defineEmits<{
  (e: "TransformMode", value: boolean): void;
}>();

const changeAngle = (value: number) => {
  curAngleParam.value = value;
  setControlSnapAngle(value);
  eventBus.emit("A:TransformSetRotationSnap", value);
};

const changeControllerType = (data: { name: string; type: string }) => {
  curControllerValue.value = data.name;
  setTransformControlsName(data.name)
  eventBus.emit("A:TransformSetMode", data.type);
};

const toggleTransformMode = (value: boolean) => {
  transformControlsValue.value = value;


  if (value) {
    eventBus.emit("A:TransformMode_On");
  } else {
    eventBus.emit("A:TransformMode_Off");
  }

  emit("TransformMode", value);

  setTransformControlsValue(value);
};

// === Синхронизация с глобальным состоянием при монтировании и изменениях ===
onMounted(() => {
  // Подтягиваем текущее значение из стора, если компонент монтируется позже
  transformControlsValue.value = getTransformControlsValue ?? false;
  curAngleParam.value = getControlSnapAngle;
  curControllerValue.value = getTransformControlsName
});

// Следим за внешними изменениями (например, если кто-то снаружи сбросил режим)
// watch(
//   () => getTransformControlsValue,
//   (newVal) => {
//     if (newVal !== undefined && transformControlsValue.value !== newVal) {
//       transformControlsValue.value = newVal;
//     }
//   }
// );
</script>

<template>
  <div class="switch__wrapper">
    <!-- Заголовок текущего режима (когда toggle выключен) -->
    <transition name="controller-toggle">
      <p v-if="!transformControlsValue" class="switch__title">
        {{ curControllerValue }}
      </p>
    </transition>

    <div>
      <transition name="controller-toggle">
        <Accordion v-if="curControllerValue.includes('Вращение') && transformControlsValue">
          <template #title>
            <h4 class="accordion__header">Шаг: {{ curAngleParam }}&deg;</h4>
          </template>

          <template #params="{ onToggle }">
            <ul class="accordion__contant">
              <li
                v-for="(data, index) in getTransformControlSnapAngles"
                :key="index + data"
                class="accordion__text"
                @click="
                  () => {
                    changeAngle(data);
                    onToggle();
                  }
                "
              >
                {{ data }}
              </li>
            </ul>
          </template>
        </Accordion>
      </transition>

      <transition name="controller-toggle">
        <Accordion v-if="transformControlsValue">
          <template #title>
            <h4 class="accordion__header">
              {{ curControllerValue }}
            </h4>
          </template>

          <template #params="{ onToggle }">
            <ul class="accordion__contant">
              <li
                v-for="(data, index) in controllerValue"
                :key="index + data.name"
                class="accordion__text"
                @click="
                  () => {
                    changeControllerType(data);
                    onToggle();
                  }
                "
              >
                {{ data.name }}
              </li>
            </ul>
          </template>
        </Accordion>
      </transition>
    </div>

    <!-- Сам переключатель -->
    <div class="switch__container">
      <Toggle
        :model-value="transformControlsValue"
        @update:model-value="toggleTransformMode"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.switch {
  &__wrapper {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 85x;
    // z-index: 10;
    // pointer-events: auto;
  }

  &__title {
    position: absolute;
    bottom: 2rem;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    backdrop-filter: blur(4px);
  }

  &__container {
    padding: 0.35rem;
    border-radius: 8px;
    backdrop-filter: blur(4px);
  }
}

.accordion {
  padding: 0.5rem 1rem;
  color: $alter-gray;
  border-radius: 8px;
  backdrop-filter: blur(5px);

  &__header {
    margin-right: 0.5rem;
  }
  &__summary {
    gap: 10rem;
  }

  &__contant {
    padding-top: 0.5rem;
    border-top: 1px solid #a3a9b5;
  }

  &__text {
    cursor: pointer;
    transition-property: color;
    transition-duration: 0.25s;
    transition-timing-function: ease;
    @media (hover: hover) {
      /* when hover is supported */
      &:hover {
        color: $light-grey;
      }
    }
  }
}
</style>
