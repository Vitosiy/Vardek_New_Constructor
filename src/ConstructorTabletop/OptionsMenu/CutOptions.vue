<script setup lang="ts">
// @ts-nocheck 
import { ref, toRefs } from "vue";

const props = defineProps({
  holes: {
    type: Array,
    required: true,
  },
});

const optionsShow = ref(false);
const { holes } = toRefs(props);

const emit = defineEmits([
  "cut-addHole",
  "cut-deleteHole",
  "cut-updateHole",
  "cut-toggleHoleOptions",
  "cut-changePositionX",
  "cut-changePositionY",
]);

const addHole = (type: string) => {
  emit("cut-addHole", type);
};

const deliteHole = (key: number) => {
  emit("cut-deleteHole", key);
};

const updateHole = (
  event: Event,
  key: number,
  valueType: string,
  holeType: string
) => {
  emit("cut-updateHole", event, key, valueType, holeType);
};

const changeHolePositionX = ({
  event,
  key,
  valueType,
  holeType,
  hole,
  direction,
}: {
  event: Event;
  key: number;
  valueType: string;
  holeType: string;
  hole: any;
  direction: string;
}) => {
  let dirrectionValue;

  switch (direction) {
    case "left":
      dirrectionValue =
        parseInt(event.target.value) - hole.distances[direction];
      break;
    case "right":
      dirrectionValue =
        (parseInt(event.target.value) - hole.distances[direction]) * -1;
      break;
  }

  emit("cut-changePositionX", event, key, valueType, holeType, dirrectionValue);
};

const changeHolePositionY = ({
  event,
  key,
  valueType,
  holeType,
  hole,
  direction,
}: {
  event: Event;
  key: number;
  valueType: string;
  holeType: string;
  hole: any;
  direction: string;
}) => {
  let dirrectionValue;

  switch (direction) {
    case "top":
      dirrectionValue =
        parseInt(event.target.value) - hole.distances[direction];
      break;

    case "bottom":
      dirrectionValue =
        (parseInt(event.target.value) - hole.distances[direction]) * -1;
      break;
  }

  console.log(dirrectionValue, "dirrectionValue");

  emit("cut-changePositionY", event, key, valueType, holeType, dirrectionValue);
};

const toggleHoleOptions = () => {
  optionsShow.value = !optionsShow.value;
  emit("cut-toggleHoleOptions", optionsShow.value);
};
</script>

<template>
  <div class="splitter-container--cut">
    <div class="splitter-container--cut-header">
      <h3 class="splitter-title">Разрез</h3>
      <button class="actions-btn actions-icon" @click="toggleHoleOptions">
        <img class="actions-icon--close" src="/icons/close.svg" alt="" />
      </button>
    </div>

    <div class="splitter-container--cut-options">
      <div class="splitter-container--cut-options--add">
        <button
          class="actions-btn actions-icon"
          @click="addHole('rect')"
          v-if="holes.length < 2"
        >
          <img class="actions-icon--add" src="/icons/add.svg" alt="" />
        </button>
        <p>Прямогульный разрез</p>
      </div>
      <div class="splitter-container--cut-options--add">
        <button
          class="actions-btn actions-icon"
          @click="addHole('circle')"
          v-if="holes.length < 2"
        >
          <img class="actions-icon--add" src="/icons/add.svg" alt="" />
        </button>
        <p>Круглый разрез</p>
      </div>
    </div>
    <div class="splitter-container--cut-data" v-if="props.holes">
      <div
        v-for="(hole, key) in holes"
        :key="key + hole.type"
        class="splitter-container--cut-items"
      >
        <div class="splitter-container--cut-header">
          <h3 class="splitter-title">{{ hole.lable }}</h3>
          <button class="actions-btn actions-icon" @click="deliteHole(key)">
            <img class="actions-icon--delite" src="/icons/delite.svg" alt="" />
          </button>
        </div>
        <div class="splitter-container--cut-position">
          <div class="actions-inputs" v-if="hole.width">
            <p class="actions-title">Ширина</p>
            <div class="actions-input--container">
              <input
                type="number"
                step="10"
                min="150"
                :max="hole.Mwidth"
                class="actions-input"
                :value="hole.width"
                @input="updateHole($event, key, 'width', 'rect')"
              />
            </div>
          </div>
          <div class="actions-inputs" v-if="hole.height">
            <p class="actions-title">Высота</p>
            <div class="actions-input--container">
              <input
                type="number"
                step="10"
                min="150"
                :max="hole.Mheight"
                class="actions-input"
                :value="hole.height"
                @input="updateHole($event, key, 'height', 'rect')"
              />
            </div>
          </div>
          <div class="actions-inputs" v-else>
            <p class="actions-title">Диаметр</p>
            <div class="actions-input--container">
              <input
                type="number"
                step="10"
                min="150"
                :max="hole.Mradius"
                class="actions-input"
                :value="hole.radius"
                @input="updateHole($event, key, 'radius', 'circle')"
              />
            </div>
          </div>
        </div>

        <div class="splitter-container--cut-actions">
          <div class="actions-inputs width-max" v-if="hole.radius">
            <p class="actions-title">Расстояние от краев</p>

            <div class="splitter-container--cut-position">
              <div class="actions-input--container">
                <input
                  type="number"
                  step="1"
                  class="actions-input"
                  :value="hole.distances.left"
                  @input="
                    changeHolePositionX({
                      event: $event,
                      key: key,
                      valueType: 'radius',
                      holeType: 'circle',
                      hole: hole,
                      direction: 'left',
                    })
                  "
                />
              </div>

              <img
                class="actions-icon--position"
                src="/icons/position-x.svg"
                alt=""
              />

              <div class="actions-input--container">
                <input
                  type="number"
                  step="1"
                  class="actions-input"
                  :value="hole.distances.right"
                  @input="
                    changeHolePositionX({
                      event: $event,
                      key: key,
                      valueType: 'radius',
                      holeType: 'circle',
                      hole: hole,
                      direction: 'right',
                    })
                  "
                />
              </div>
            </div>

            <div class="splitter-container--cut-position">
              <div class="actions-input--container">
                <input
                  type="number"
                  step="1"
                  class="actions-input"
                  :value="hole.distances.top"
                  @input="
                    changeHolePositionY({
                      event: $event,
                      key: key,
                      valueType: 'radius',
                      holeType: 'circle',
                      hole: hole,
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
                  :value="hole.distances.bottom"
                  @input="
                    changeHolePositionY({
                      event: $event,
                      key: key,
                      valueType: 'radius',
                      holeType: 'circle',
                      hole: hole,
                      direction: 'bottom',
                    })
                  "
                />
              </div>
            </div>
          </div>

          <div class="actions-inputs width-max" v-else>
            <p class="actions-title">Расстояние от краев</p>
            <div class="splitter-container--cut-position">
              <div class="actions-input--container">
                <input
                  type="number"
                  step="1"
                  class="actions-input"
                  :value="hole.distances.left"
                  @input="
                    changeHolePositionX({
                      event: $event,
                      key: key,
                      valueType: 'width',
                      holeType: 'rect',
                      hole: hole,
                      direction: 'left',
                    })
                  "
                />
              </div>

              <img
                class="actions-icon--position"
                src="/icons/position-x.svg"
                alt=""
              />

              <div class="actions-input--container">
                <input
                  type="number"
                  step="1"
                  class="actions-input"
                  :value="hole.distances.right"
                  @input="
                    changeHolePositionX({
                      event: $event,
                      key: key,
                      valueType: 'width',
                      holeType: 'rect',
                      hole: hole,
                      direction: 'right',
                    })
                  "
                />
              </div>
            </div>

            <div class="splitter-container--cut-position">
              <div class="actions-input--container">
                <input
                  type="number"
                  step="1"
                  class="actions-input"
                  :value="hole.distances.top"
                  @input="
                    changeHolePositionY({
                      event: $event,
                      key: key,
                      valueType: 'height',
                      holeType: 'rect',
                      hole: hole,
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
                  :value="hole.distances.bottom"
                  @input="
                    changeHolePositionY({
                      event: $event,
                      key: key,
                      valueType: 'height',
                      holeType: 'rect',
                      hole: hole,
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
    &--cut {
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
        gap: 0.75 rem;
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
