<script setup lang="ts">
// @ts-nocheck
import * as THREEInterfases from "@/types/interfases";
import * as THREE from "three";
import { _URL } from "@/types/constants";

import {
  Ref,
  ref,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useRoomState } from "@/store/appliction/useRoomState";
import { useAppData } from "@/store/appliction/useAppData";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useCustomiserStore } from "@/store/appStore/useCustomiserStore";
import { useObjectData } from "@/store/appliction/useObjectData";

import { Application } from "@/Application/Core/Application";

// import customInput from "@/components/customInput.vue";

import ControllerButton from "@/components/ui/buttons/right-menu/controller/ControllerButton.vue";
import ContentControllerButton from "@/components/ui/buttons/right-menu/controller/ContentControllerButton.vue";
import DeleteControllerButton from "@/components/ui/buttons/right-menu/controller/DeleteControllerButton.vue";
import UpControllerButton from "@/components/ui/buttons/right-menu/controller/UpControllerButton.vue";
import OpenFacadeButton from "@/components/ui/buttons/right-menu/controller/OpenFacadeButton.vue";

import Toggle from "@vueform/toggle";
import Slider from "@vueform/slider";

type TSize = {
  width: {
    title: "Ширина";
    value: number;
    min: number | null;
    max: number | null;
  };
  height: {
    title: "Высота";
    value: number;
    min: number | null;
    max: number | null;
  };
  depth: {
    title: "Глубина";
    value: number;
    min: number | null;
    max: number | null;
  };
};

type TEditSize = {
  SIZE_EDIT_WIDTH_MIN: number | null;
  SIZE_EDIT_WIDTH_MAX: number | null;
  SIZE_EDIT_HEIGHT_MIN: number | null;
  SIZE_EDIT_HEIGHT_MAX: number | null;
  SIZE_EDIT_DEPTH_MIN: number | null;
  SIZE_EDIT_DEPTH_MAX: number | null;
};

interface IProductSizeEdit {
  size: TSize | null;
}

const appData = useAppData().getAppData;
const startData = useSceneState();
const roomStore = useRoomState();
const eventBus = useEventBus();
const models = useAppData().getAppData.CATALOG.PRODUCTS;
const wallMaterials = useAppData().getAppData.WALL;
const floorMaterials = useAppData().getAppData.FLOOR;
const customiserStore = useCustomiserStore();
const objectData = useObjectData()

const sceneContainer: Ref<HTMLElement | null> = ref(null);
let VerdekConstructor: Application | null = null;

const selectedRoom = computed(() => {
  return (
    roomStore.getRooms.find((room) => room.id === selectValue.value) || null
  );
});

const wallTexture = ref<number | string | null>(null);

const floorTexture = ref<number | string | null>(null);

const selectValue = ref<number | null>(null);

const cameraView = ref<boolean>(false);

const inputValue = ref({
  width: 4,
  height: 3,
  depth: 7,
  thickness: 0.1,
});

const productSize = ref<TSize>({
  width: { title: "Ширина", value: 0, min: 0, max: 0 },
  height: { title: "Высота", value: 0, min: 0, max: 0 },
  depth: { title: "Глубина", value: 0, min: 0, max: 0 },
});

const dropItems: { [key: string]: {} }[] = models;

const quality = ref(["low", "medium", "hight"]);

const controller = ref(false);

const shadows = ref<boolean>(false);

const refraction = ref<boolean>(false);

const pointLightValue = ref<number>(2);

const clampHeight = ref<number>(startData.getStartHeightClamp);

const productColor = ref<{ [key: string]: any }>({});

const fasadeColor = ref<{ [key: string]: any }>({});

const currentFasadeId = ref<{ [key: string]: any }>({});

const productData = ref<{ [key: string]: any }>({});

const product = ref<{ [key: string]: any } | null>(null);

const controllerPositionData = ref<THREEInterfases.IMouseData>({ x: 0, y: 0 });

const totalContent = ref<any>();

const paletteColorsData = ref<{ [key: string]: any }>({});

const showPalette = ref<boolean>(false);

const selectPalette = ref<any>(null);

onMounted(() => {
  if (sceneContainer.value) {
    VerdekConstructor = new Application(sceneContainer.value);

    eventBus.on("A:Move", (move: boolean) => {
      if (!product.value) return;
      controller.value = move;
      controllerPositionData.value = product.value?.MOUSE_POSITION;
    });

    // Пописать интерфейс *item*
    eventBus.on("A:Selected", (item: any) => {
      let object = item.object;
      objectData.setObjectData(object)
      let roomContant = item.roomContant;
      totalContent.value = roomContant;

      if (!object) {
        controller.value = false;
        return;
      }

      getProductSizeProps(
        object?.PROPS.CONFIG.SIZE,
        object?.PROPS.CONFIG.SIZE_EDIT
      );

      getCurrentProduct(object);

      controller.value = true;
      /**  Список FASADE для корпуса модели */
      productColor.value = object?.PROPS.CONFIG.MODULE_COLOR_LIST;

      /**  Список FASADE для фасалдов модели */
      fasadeColor.value = object?.PROPS.CONFIG.FASADE_COLOR_LIST;

      /** Текущий фасад */
      currentFasadeId.color = object?.PROPS.CONFIG.FASADE_COLOR;

      /**  Координаты мыши */
      controllerPositionData.value = object?.MOUSE_POSITION;

      productData.value = { ...object?.PROPS };
    });
  }
});

onBeforeUnmount(() => {
  console.log("onBeforeUnmount");
  VerdekConstructor?.destroy();
});

watch(shadows, () => {
  toggleShadow(shadows.value);
  console.log(shadows.value);
});

watch(refraction, () => {
  toggleRefraction(refraction.value);
  console.log(refraction.value);
});

watch(pointLightValue, () => {
  changePointLightPower(pointLightValue.value);
  console.log(pointLightValue.value);
});

watch(paletteColorsData, () => {
  showPalette.value =
    Object.keys(paletteColorsData.value).length > 0 ? true : false;
});

const resizeRoom = () => {
  if (VerdekConstructor) {
    eventBus.emit("A:Room-resize", inputValue.value);
  }
};

const resizeModel = () => {
  if (VerdekConstructor) {
    let data: { width: number; height: number; depth: number } = {
      width: productSize.value.width.value,
      height: productSize.value.height.value,
      depth: productSize.value.depth.value,
    };
    eventBus.emit("A:Model-resize", data);
  }
};

const toggleShadow = (value: boolean) => {
  if (VerdekConstructor) {
    eventBus.emit("A:ToggleShadow", value);
  }
};

const toggleRefraction = (value: boolean) => {
  if (VerdekConstructor) {
    eventBus.emit("A:ToggleRefraction", value);
  }
};

const changePointLightPower = (value: number) => {
  if (VerdekConstructor) {
    eventBus.emit("A:ChangePointLightPower", value);
  }
};

const setQuality = (value: string) => {
  if (VerdekConstructor) {
    eventBus.emit("A:Quality", value);
  }
};

const create = () => {
  if (VerdekConstructor) {
    eventBus.emit("A:Create");
  }
};

const save = () => {
  if (VerdekConstructor) {
    eventBus.emit("A:Save");
  }
};

const load = () => {
  if (VerdekConstructor) {
    shadows.value = false;
    refraction.value = false;
    eventBus.emit("A:ToggleShadow", shadows.value);
    eventBus.emit("A:ToggleRefraction", refraction.value);
    eventBus.emit("A:Load", selectedRoom.value?.id);
  }
};

const toggleiew = () => {
  cameraView.value = !cameraView.value;
  eventBus.emit("A:CameraToggle", cameraView.value);
};

const changeWallTexture = () => {
  if (VerdekConstructor) {
    console.log(wallTexture.value);
    eventBus.emit("A:ChangeWallTexture", wallTexture.value);
  }
};

const changeFloorTexture = () => {
  if (VerdekConstructor) {
    console.log(floorTexture.value);
    eventBus.emit("A:ChangeFloorTexture", floorTexture.value);
  }
};

const changeModuleTexture = (value: { [key: string]: any }) => {
  if (VerdekConstructor) {
    eventBus.emit("A:ChangeModuleTexture", value);
  }
};

const changeFasadeTexture = (value: { [key: string]: any }) => {
  if (VerdekConstructor) {
    currentFasadeId.value = value.ID;

    if (
      appData.FASADE[currentFasadeId.value].PALETTE.length &&
      appData.FASADE[currentFasadeId.value].PALETTE[0] != null
    ) {
      paletteColorsData.value = Object.keys(appData.PALETTE)
        .filter(
          (key) =>
            appData.PALETTE[key].TYPE ===
            appData.FASADE[currentFasadeId.value].PALETTE[0]
        )
        .reduce((obj, key) => {
          obj[key] = appData.PALETTE[key];
          return obj;
        }, {});

      return;
    }

    paletteColorsData.value = {};
    eventBus.emit("A:ChangeFasadeTexture", value);
  }
};

const changePaletteColor = () => {
  // const selectedPalette = paletteColorsData.find(
  //   (palette) => palette.UNAME === selectPalette.value
  // );

  eventBus.emit("A:ChangePaletteColor", selectPalette.value);
};

const onDrag = (event: any, model: { [key: string]: any } | string) => {
  event.dataTransfer?.setData("text", JSON.stringify(model));
};

const removeModel = () => {
  if (VerdekConstructor) {
    eventBus.emit("A:RemoveModel");
    console.log(totalContent.value, "roomContant");
    controller.value = false;
  }
};

const changeHeightClamp = () => {
  if (VerdekConstructor) {
    eventBus.emit("A:Height-clamp", clampHeight.value);
  }
};

const getCurrentProduct = (item: any) => {
  if (VerdekConstructor) {
    product.value = item;
  }
};

const toggleFasad = () => {
  if (VerdekConstructor) {
    eventBus.emit("A:Toggle-Fasad", clampHeight.value);
  }
};

const getProductSizeProps = (
  size?: { width: number; height: number; depth: number },
  edit?: TEditSize
) => {
  productSize.value.width.value = 0;
  productSize.value.height.value = 0;
  productSize.value.depth.value = 0;

  productSize.value.width.min = null;
  productSize.value.width.max = null;
  productSize.value.height.min = null;
  productSize.value.height.max = null;
  productSize.value.depth.min = null;
  productSize.value.depth.max = null;

  if (productSize.value) {
    productSize.value.width.value = size.width;
    productSize.value.height.value = size.height;
    productSize.value.depth.value = size.depth;

    productSize.value.width.min = edit.SIZE_EDIT_WIDTH_MIN;
    productSize.value.width.max = edit.SIZE_EDIT_WIDTH_MAX;
    productSize.value.height.min = edit.SIZE_EDIT_HEIGHT_MIN;
    productSize.value.height.max = edit.SIZE_EDIT_HEIGHT_MAX;
    productSize.value.depth.min = edit.SIZE_EDIT_DEPTH_MIN;
    productSize.value.depth.max = edit.SIZE_EDIT_DEPTH_MAX;
  }
};

const togglePopup = () => {
  customiserStore.toggleCustomiserPopup();
};

const activeController = computed(() => {
  return {
    "model-controller--active": controller.value,
  };
});

const controllerPosition = computed(() => {
  return {
    transform: `translate(${controllerPositionData.value.x}px, ${controllerPositionData.value.y}px )`,
  };
});
</script>

<template>
  <div ref="sceneContainer" class="scene-container"></div>

  <div class="inputs">
    <customInput v-model="clampHeight" :min="758" :max="2000" :step="10" />
    <button class="btn" @click="changeHeightClamp">Поменять</button>
  </div>

  <!-- <div class="inputs">
    <customInput v-model="inputValue.width" :min="1" :max="10" :step="1" />
    <customInput v-model="inputValue.height" :min="1" :max="10" :step="1" />
    <customInput v-model="inputValue.depth" :min="1" :max="10" :step="1" />

    <button class="btn" @click="resizeRoom">Resize</button>
  </div> -->

  <div class="quality">
    <div>
      <p>Тени</p>
      <Toggle v-model="shadows" />
    </div>

    <div>
      <p>Отражение</p>
      <Toggle v-model="refraction" />
    </div>

    <!-- <div>
      <p>Направленный свет</p>
      <Slider v-model="pointLightValue" />
    </div> -->

    <!-- <button class="btn" v-for="(item, key) in quality" :key="key + item" @click="setQuality(item)">
      {{ item }}
    </button> -->
  </div>

  <!-- <select class="example" id="rooms" v-model="selectValue" name="rooms" @change="load">
    <option v-for="(room, key) in roomStore.getRooms" :key="key" :value="room.id">
      {{ room.label }}
    </option>
  </select> -->

  <!-- <div class="ui-panel--right">
    <button class="btn" @click="save">Сохранить</button>
    <button class="btn" @click="create">Создать новую</button>
    <button class="btn" @click="toggleiew">Поменять вид</button> 
  </div> -->

  <!-- <div class="room-textures">
    <select class="room-textures--item" id="wall" v-model="wallTexture" name="wall" @change="changeWallTexture">
      <option v-for="(texture, key) in wallMaterials" :key="key" :value="texture.ID">
        {{ texture.NAME }}
      </option>
    </select>

    <select class="room-textures--item" id="floor" v-model="floorTexture" name="floor" @change="changeFloorTexture">
      <option v-for="(texture, key) in floorMaterials" :key="key" :value="texture.ID">
        {{ texture.NAME }}
      </option>
    </select>
  </div> -->

  <!-- <div
    :class="['model-controller', activeController]"
    :style="controllerPosition"
    v-if="product"
  >
    <div>
      <h2>{{ productData.PRODUCT?.NAME }}</h2>
      <div class="model-controller_controls">
        <div class="model-controller_items">
          <h3>Корпус</h3>
          <div class="model-controller_elements">
            <div
              v-for="(fasade_data, key) in productColor"
              :key="fasade_data!.NAME + key"
              class="model-controller_item"
              @click="changeModuleTexture(fasade_data)"
            >
              <img
                class="model-controller_image"
                :src="_URL + fasade_data.DETAIL_PICTURE"
                alt=""
              />
              <p class="model-controller_text">{{ fasade_data.NAME }}</p>
            </div>
          </div>
        </div>

        <div class="product-size" v-if="product">
          <div v-for="size in productSize">
            <p>{{ size.title }}</p>
            <b></b>
            <customInput
              v-model="size.value"
              :min="size.min !== null ? size.min : null"
              :max="size.max !== null ? size.max : null"
              :step="1"
            />
          </div>
          <button class="btn" @click="resizeModel">Resize</button>
        </div>
        <div class="model-controller_items">
          <h3>Фасад</h3>
          <div class="model-controller_elements">
            <div
              v-for="(fasade_data, key) in fasadeColor"
              :key="fasade_data!.NAME + key"
              class="model-controller_item"
              @click="changeFasadeTexture(fasade_data)"
            >
              <img
                class="model-controller_image"
                :src="_URL + fasade_data.DETAIL_PICTURE"
                alt=""
              />
              <p class="model-controller_text">{{ fasade_data.NAME }}</p>
            </div>
          </div>
          <select
            v-if="showPalette"
            class="palette-textures--items"
            id="palette"
            v-model="selectPalette"
            name="palette"
            @change="changePaletteColor"
          >
            <option
              v-for="(palette, key) in paletteColorsData"
              :key="key"
              :value="palette.ID"
            >
              {{ palette.NAME }} {{ palette.UNAME }}
            </option>
          </select>

          <button class="btn" @click="toggleFasad">Скрыть/Показать</button>
        </div>
      </div>
    </div>
    <button class="btn" @click="removeModel">Удалить</button>
  </div> -->

  <div :class="['model-controller', activeController]" :style="controllerPosition">
    <div class="controller-left">
      <img class="left-line" src="@/assets/svg/right-menu/left-line.svg">
      <ControllerButton />
      <ContentControllerButton />
      <DeleteControllerButton />
    </div>
    <div class="controller-right">
      <img class="right-line" src="@/assets/svg/right-menu/right-line.svg">
      <UpControllerButton />
      <OpenFacadeButton />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scene-container {
  width: 100dvw;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  background-color: white;
  z-index: 0;
}

.inputs {
  position: absolute;
  left: 2rem;
  top: 50%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-size {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.value {
  position: absolute;
  left: 0;
  top: 45%;
  background-color: rgba(255, 255, 255, 0.615);
}

.quality {
  position: absolute;
  right: 2rem;
  top: 50%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.example {
  position: absolute;
  top: 2rem;
  left: 2rem;
  // width: clamp(100px, 10vw - 1rem, 250px );
  aspect-ratio: 1;
  height: 2rem;
  width: fit-content;
  border-radius: 5px;
  border: none;
  outline: none;
}

.drag_example {
  width: fit-content;
  position: absolute;

  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  justify-content: center;

  &--items {
    display: flex;
    gap: 0.5rem;
  }

  &--item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: black;
    max-width: 50px;

    p {
      font-size: 0.75rem;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &--image {
    width: 50px;
    object-fit: cover;
  }
}

.ui-panel--right {
  position: absolute;
  right: 2rem;
  top: 20%;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.model-controller {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: absolute;
  left: 50%;
  top: 50%;
  padding: 1rem;
  filter: blur(10px);
  opacity: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  max-height: 0;
  z-index: -1;

  &--active {
    filter: blur(0);
    opacity: 1;
    height: fit-content;
    max-height: 50vh;
    z-index: 1;
  }

  .controller-left {
    position: absolute;
    left: 30px;
    top: -30px;

    .left-line {
    }
  }

  .controller-right {
    position: absolute;
    left: 80px;
    top: 30px;

    .right-line {
    }
  }

  &_controls {
    display: flex;
    gap: 1rem;
  }

  &_image {
    width: 25px;
    aspect-ratio: 1;
  }

  &_items {
    display: flex;
    // align-items: center;
    flex-direction: column;
    padding: 0.5rem;
    gap: 1rem;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 10px;
  }

  &_elements {
    display: flex;
    flex-direction: column;
    max-height: 200px;
    overflow: scroll;
  }

  &_item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 5px;
    transition: all 0.2s ease-in-out;

    &:hover {
      -webkit-box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);
      -moz-box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);
      box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.2);
    }
  }

  &_text {
    font-size: 12px;
  }
}

.btn {
  width: fit-content;
  padding: 0.5rem;
  background-color: rgb(99, 133, 255);
  border-radius: 10px;
  outline: none;
  border: none;
  color: white;
  font-weight: 600;
  font-size: clamp(0.75rem, 10vw - 1rem, 1rem);
  cursor: pointer;

  transition: all 0.25s ease-in-out;

  &:hover {
    background-color: rgba(99, 133, 255, 0.581);
  }
}

.room-textures {
  position: absolute;
  top: 5rem;
  left: 2rem;
  aspect-ratio: 1;
  height: 2rem;
  width: fit-content;
  border-radius: 5px;
  border: none;
  outline: none;
}

.distance-label {
  font-size: 12px;
  font-weight: 400;
  color: black;

  &--wall {
    color: black;
    font-weight: 600;
  }
}

.dimension-label {
  font-size: 12px;
  font-weight: 400;
  color: black;
}

.palette-textures {
  &--items {
    max-width: fit-content;
  }

  &--item {
    padding: 2rem;
    display: flex;
  }

  &--image {
    width: 25px;
    aspect-ratio: 1;
  }
}
</style>
