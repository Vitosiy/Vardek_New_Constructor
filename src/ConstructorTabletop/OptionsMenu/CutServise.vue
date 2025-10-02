<script setup lang="ts">
// @ts-nocheck
import { computed, ref, toRefs } from "vue";
import { SERVISE_ERRORS } from "@/ConstructorTabletop/CutterScripts/CutterConst";
import MainInput from "@/components/ui/inputs/MainInput.vue";
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

const cutChacked = (
  event: Event,
  item: Record<string,string>,
) => {
  console.log(item, "item");
  // const typeLow = item.NAME.toLowerCase();
  emit("cut-servisData", event.target.checked, item);
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
  // if (event!.target!.value <= 1) event!.target!.value = 1;
  // if (event!.target!.value <= 1) event!.target!.value = 1;

  emit("cut-updateServise", event, typeLow);
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
              @change="cutChacked($event, item)"
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
            <MainInput
              :inputClass="'actions-input'"
              v-model="item.width"
              :min="200"
              :max="getMaxWidth"
              :type="'number'"
              @update:modelValue="
                (newValue) => updateEuroWidth(newValue, item.NAME)
              "
            />
            <!-- <input
              type="number"
              :step="step"
              min="300"
              :max="getMaxWidth"
              class="actions-input"
              :value="item.width"
              @input.number="updateEuroWidth($event, item.NAME)"
            /> -->
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
</style>
