<script setup lang="ts">
// @ts-nocheck
import { ref, toRefs } from "vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";

const props = defineProps({
  fillings: {
    type: Array,
    required: true,
  },
});

const optionsShow = ref(false);
const { fillings } = toRefs(props);

const emit = defineEmits([
  "product-addFilling",
  "product-deleteFilling",
  "product-updateFilling",
  "product-toggleFillingOptions",
  "product-changePositionY",
]);

const addFilling = (type: string) => {
  emit("product-addFilling", type);
};

const deliteFilling = (key: number) => {
  emit("product-deleteFilling", key);
};

const updateFilling = (
    event: Event,
    key: number,
    valueType: string,
    fillingType: string
) =>
{
  console.log(event);
  emit("product-updateFilling", event, key, valueType, fillingType);
};

const changeFillingPositionY = ({
                               event,
                               key,
                               valueType,
                               fillingType,
                               filling,
                               direction,
                             }: {
  event: Event;
  key: number;
  valueType: string;
  fillingType: string;
  filling: any;
  direction: string;
}) =>
{
  let dirrectionValue;

  switch (direction) {
    case "top":
      dirrectionValue =
          parseInt(event.target.value) - filling.distances[direction];
      break;

    case "bottom":
      dirrectionValue =
          (parseInt(event.target.value) - filling.distances[direction]) * -1;
      break;
  }

  console.log(dirrectionValue, "dirrectionValue");

  emit("product-changePositionY", event, key, valueType, fillingType, dirrectionValue);
};

const toggleFillingOptions = () => {
  optionsShow.value = !optionsShow.value;
  emit("product-toggleFillingOptions", optionsShow.value);
};
</script>

<template>
  <div class="splitter-container--product">

    <div class="splitter-container--product-header">
      <h3 class="splitter-title">Вставка</h3>
      <button class="actions-btn actions-icon" @click="toggleFillingOptions">
        <img class="actions-icon--close" src="/icons/close.svg" alt="" />
      </button>
    </div>

    <div class="splitter-container--product-options">

      <div class="splitter-container--product-options--add">
        <button
            class="actions-btn actions-icon"
            @click="addFilling('rect')"
            v-if="fillings.length < 2"
        >
          <img class="actions-icon--add" src="/icons/add.svg" alt="" />
        </button>
        <p>Ящик</p>
      </div>

    </div>

    <div class="splitter-container--product-data" v-if="props.fillings">
      <div
          v-for="(filling, key) in fillings"
          :key="key + filling.type"
          class="splitter-container--product-items"
      >
        <div class="splitter-container--product-header">
          <h3 class="splitter-title">{{ filling.lable }}</h3>
          <button class="actions-btn actions-icon" @click="deliteFilling(key)">
            <img class="actions-icon--delite" src="/icons/delite.svg" alt="" />
          </button>
        </div>
        <div class="splitter-container--product-position">
          <div class="actions-inputs" v-if="filling.width">
            <p class="actions-title">Ширина</p>
            <div class="actions-input--container">
              <MainInput
                  :type="'number'"
                  :step="10"
                  :min="150"
                  :max="filling.Mwidth"
                  :inputClass="'actions-input'"
                  v-model="filling.width"
                  @update:modelValue="
                  (newValue) => updateFilling(newValue, key, 'width', 'rect')
                "
              />
            </div>
          </div>
          <div class="actions-inputs" v-if="filling.height">
            <p class="actions-title">Высота</p>
            <div class="actions-input--container">
              <MainInput
                  :type="'number'"
                  :step="10"
                  :min="150"
                  :max="filling.Mheight"
                  :inputClass="'actions-input'"
                  v-model="filling.height"
                  @update:modelValue="
                  (newValue) => updateFilling(newValue, key, 'height', 'rect')
                "
              />
            </div>
          </div>
        </div>

        <div class="splitter-container--product-actions">
          <div class="actions-inputs width-max" v-if="filling.radius">
            <p class="actions-title">Позиция</p>

            <div class="splitter-container--product-position">
              <div class="actions-input--container">
                <input
                    type="number"
                    step="1"
                    class="actions-input"
                    :value="filling.distances.top"
                    @input="
                    changeFillingPositionY({
                      event: $event,
                      key: key,
                      valueType: 'radius',
                      fillingType: 'circle',
                      filling: filling,
                      direction: 'top',
                    })
                  "
                />
              </div>

              <img
                  class="actions-icon--position"
                  src="/icons/position-y.svg"
                  alt=""
              />

              <div class="actions-input--container">
                <input
                    type="number"
                    step="1"
                    class="actions-input"
                    :value="filling.distances.bottom"
                    @input="
                    changeFillingPositionY({
                      event: $event,
                      key: key,
                      valueType: 'radius',
                      fillingType: 'circle',
                      filling: filling,
                      direction: 'bottom',
                    })
                  "
                />
              </div>
            </div>
          </div>

          <div class="actions-inputs width-max" v-else>
            <p class="actions-title">Позиция</p>
            <div class="splitter-container--product-position">
              <div class="actions-input--container">
                <input
                    type="number"
                    step="1"
                    class="actions-input"
                    :value="filling.distances.top"
                    @input="
                    changeFillingPositionY({
                      event: $event,
                      key: key,
                      valueType: 'height',
                      fillingType: 'rect',
                      filling: filling,
                      direction: 'top',
                    })
                  "
                />
              </div>

              <img
                  class="actions-icon--position"
                  src="/icons/position-y.svg"
                  alt=""
              />

              <div class="actions-input--container">
                <input
                    type="number"
                    step="1"
                    class="actions-input"
                    :value="filling.distances.bottom"
                    @input="
                    changeFillingPositionY({
                      event: $event,
                      key: key,
                      valueType: 'height',
                      fillingType: 'rect',
                      filling: filling,
                      direction: 'bottom',
                    })
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.splitter {
  &-container {
    &--product {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: #a3a9b5;
      overflow: hidden;

      &-icon {
        cursor: pointer;
      }

      &-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      &-data {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
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

      &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #ecebf1;

        &--add {
          display: flex;
          gap: 5px;
          align-items: center;
        }
      }

      &-actions {
        display: flex;
        gap: 1rem;
      }

      &-position {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
    }
  }
}

.width {
  &-max {
    max-width: 100% !important;
  }
}
</style>
