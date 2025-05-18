<script setup lang="ts">
import { computed, ref, toRefs } from "vue";
import { SERVISE_ERRORS } from "@/ConstructorTabletop/CutterScripts/CutterConst";
import Tooltip from "./Tooltip.vue";

const props = defineProps({
  serviseData: {
    type: Array,
    required: true,
  },
  currentSection: {
    type: Object,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
  },
});
const emit = defineEmits([
  "cut-toggleCutServise",
  "cut-servisData",
  "cut-updateServise",
]);

const cutServisShow = ref(false);

const cutChacked = (event: Event, type: string, pos: string) => {
  const typeLow = type.toLowerCase();
  emit("cut-servisData", event.target.checked, typeLow, pos);
};

const toggleCutServise = () => {
  cutServisShow.value = !cutServisShow.value;
  emit("cut-toggleCutServise", cutServisShow.value);
};

const getMaxWidth = computed(() => {
  const sectionWidth = props.currentSection.currentRow.width;

  if (sectionWidth < 1600) {
    return sectionWidth - 30;
  }
  return 1600;
});

const updateEuroWidth = (event: Event, type: string) => {
  const typeLow = type.toLowerCase();
  if (event!.target!.value <= 1) event!.target!.value = 1;

  emit("cut-updateServise", event!.target!.value, typeLow);
};
</script>

<template>
  <div class="splitter-container--cut">
    <div class="splitter-container--cut-header">
      <h3 class="splitter-title">Услуги</h3>
      <button class="actions-btn actions-icon" @click="toggleCutServise">
        <img class="actions-icon--close" src="/icons/close.svg" alt="" />
      </button>
    </div>

    <div class="splitter-container--cut-servise">
      <div
        v-for="(item, key) in props.serviseData"
        :key="key"
        :class="['cut-servise--item', { error: item.error }]"
      >
        <div :class="['cut-servise--wrapper', { error: item.error }]">
          <label class="control control-checkbox">
            <input
              type="checkbox"
              :checked="item.value"
              @change="cutChacked($event, item.NAME, item.pos)"
            />
            <span class="control_indicator"></span>
            <span class="text-lg text-gray-800 font-medium">{{
              item.NAME
            }}</span>
          </label>

          <Tooltip
            v-if="item.error"
            :theme="'dark'"
            :content="`${SERVISE_ERRORS[item.error]}`"
          >
            <template #trigger>
              <button class="actions-btn actions-icon">
                <img class="actions-icon--help" src="/icons/help.svg" alt="" />
              </button>
            </template>
            <template #content> </template>
          </Tooltip>
        </div>

        <div class="actions-inputs" v-if="item.width && item.value">
          <p class="actions-title">Ширина</p>
          <div class="actions-input--container">
            <input
              type="number"
              :step="step"
              min="300"
              :max="getMaxWidth"
              class="actions-input"
              :value="item.width"
              @input.number="updateEuroWidth($event, item.NAME)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.splitter {
  &-container {
    &--cut {
      &-servise {
        display: flex;
        flex-direction: column;
        padding: 0 10px;
        gap: 5px;
        overflow-y: scroll;

        &::-webkit-scrollbar {
          width: 5px;
          /* Ширина скроллбара */
        }

        &::-webkit-scrollbar-button {
          display: none;
          /* Убираем стрелки */
        }

        &::-webkit-scrollbar-thumb {
          background: #888;
          /* Цвет ползунка */
          border-radius: 4px;
        }
      }
    }
  }
}

.cut-servise {
  &--item {
    display: flex;
    flex-direction: column;
    padding: 0 5px 5px 5px;
    border-radius: 5px;
    &.error {
      background-color: #d56b6b32;
    }
  }

  &--wrapper {
    display: flex;
  }
}

.control {
  font-family: arial;
  display: block;
  position: relative;
  padding-left: 30px;
  margin-bottom: 5px;
  padding-top: 3px;
  cursor: pointer;
  font-size: 16px;

  input {
    position: absolute;
    z-index: -1;
    opacity: 0;
  }
}

.control_indicator {
  position: absolute;
  top: 5px;
  left: 0;
  height: 20px;
  width: 20px;
  background: #ffffff;
  border: 1px solid #c7c7c7;
  border-radius: 5px;

  &:after {
    box-sizing: unset;
    content: "";
    position: absolute;
    display: none;
  }
}

.control:hover input ~ .control_indicator {
  background: #eaeaea;
}

.control input:checked ~ .control_indicator {
  background: #000000;

  &:after {
    display: block;
  }
}

.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
  background: #000000;
}

.control input:disabled ~ .control_indicator {
  background: #e6e6e6;
  opacity: 0.6;
  pointer-events: none;

  &:after {
    border-color: #7b7b7b;
  }
}

.control-checkbox .control_indicator {
  &:after {
    left: 7px;
    top: 3px;
    width: 3px;
    height: 8px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  &::before {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 30px;
    height: 30px;
    margin-left: -6px;
    margin-top: -6px;
    background: #191d1e;
    border-radius: 50px;
    opacity: 0.6;
    z-index: 99999;
    transform: scale(0);
  }
}

.control-checkbox input + .control_indicator::before {
  animation: s-ripple 250ms ease-out;
}

.control-checkbox input:checked + .control_indicator::before {
  animation-name: s-ripple-dup;
}

@keyframes s-ripple {
  0% {
    transform: scale(0);
  }
  20% {
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes s-ripple-dup {
  0% {
    transform: scale(0);
  }
  30% {
    transform: scale(1);
  }
  60% {
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}
</style>
