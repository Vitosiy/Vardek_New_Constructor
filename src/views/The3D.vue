<script setup lang="ts">
/**//@ts-nocheck */

import * as THREETypes from "@/types/types";
import * as THREEInterfases from "@/types/interfases";
import * as THREE from "three";
import { _URL } from "@/types/constants";

import {
  ref,
  watch,
  computed,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  onUnmounted,
  toRaw,
  defineExpose,
  nextTick,
} from "vue";

import { useEventBus } from "@/store/appliction/useEventBus";
import { useRoomState } from "@/store/appliction/useRoomState";
import { useAppData } from "@/store/appliction/useAppData";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useCustomiserStore } from "@/store/appStore/useCustomiserStore";
import { useObjectData } from "@/store/appliction/useObjectData";
import { useRoomContantData } from "@/store/appliction/useRoomContantData";
import { useUniformState } from "@/store/appliction/useUniformState";

import { useModelState } from "@/store/appliction/useModelState";

import { Application } from "@/Application/Core/Application";

// import customInput from "@/components/customInput.vue";
import TableTopManager from "@/ConstructorTabletop/TableTopManager.vue";
import Modal from "@/components/ui/modals/Modal.vue";

import ControllerButton from "@/components/ui/buttons/right-menu/controller/ControllerButton.vue";
import ContentControllerButton from "@/components/ui/buttons/right-menu/controller/ContentControllerButton.vue";
import DeleteControllerButton from "@/components/ui/buttons/right-menu/controller/DeleteControllerButton.vue";
import UpControllerButton from "@/components/ui/buttons/right-menu/controller/UpControllerButton.vue";
import OpenFacadeButton from "@/components/ui/buttons/right-menu/controller/OpenFacadeButton.vue";
import CutButton from "@/components/ui/buttons/right-menu/controller/CutButton.vue";

import Toggle from "@vueform/toggle";

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

const appData = ref<{ [key: string]: any } | null>(null);
const startData = ref<THREETypes.TUseSceneState | null>(null);
const roomStore = ref<THREETypes.TUseRoomState | null>(null);
const eventBus = ref<THREETypes.TUseEventBus | null>(null);
const uniformState = ref<THREETypes.TUseUniformState | null>(null);
const modelState = ref<THREETypes.TUseModelState | null>(null);
const models = ref<any>(null);
const wallMaterials = ref<number | null>(null);
const floorMaterials = ref<number | null>(null);
const customiserStore = ref<THREETypes.TUseCustomiserStore | null>(null);
const objectData = ref<THREETypes.TUseObjectData | null>(
  null
); /** Текущий объект */
const roomContantData = ref<THREETypes.TUseRoomContantData | null>(null);

const _FASADE = ref({});
const _MILLING = ref({});

const preloader = ref<HTMLElement | null>(null);
const activePreloader = ref<boolean>(false);

const sceneContainer = ref<HTMLElement | null>(null);
const VerdekConstructor = ref<Application | null>(null);

const selectedRoom = computed(() => {
  if (!roomStore) return;
  return (
    roomStore.value!.getRooms.find((room) => room.id === selectValue.value) ||
    null
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

const clampHeight = ref<number>(3000);

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

/**----------------- 01.12.24-------------------- */

const fasades = ref<{ [key: string]: any }>({});
const productFasades = ref<any[]>([]);
const glassColorsData = ref<{ [key: string]: any }>({});
const showGlass = ref<boolean>(false);

const selectGlass = ref<any>(null);
const selectMilling = ref<any>(null);

/** ----------------- 19.05.25 ----------------------------- */

//Распил
const tableTopManager = ref();
const CutData = ref({});
const isModalOpen = ref(false);
const gridSaved = ref(false);
const CutCash = ref({});
const CutSave = ref(false);

onBeforeMount(() => {
  //   appData.value = useAppData().getAppData;

  startData.value = useSceneState();

  eventBus.value = useEventBus();
  uniformState.value = useUniformState();
  modelState.value = useModelState();
  customiserStore.value = useCustomiserStore();
  roomStore.value = useRoomState();
});

onMounted(() => {
  appData.value = useAppData().getAppData;

  models.value = useAppData().getAppData.CATALOG.PRODUCTS;
  wallMaterials.value = useAppData().getAppData.WALL;
  floorMaterials.value = useAppData().getAppData.FLOOR;

  objectData.value = useObjectData(); /** Текущий объект */
  roomContantData.value = useRoomContantData();

  if (sceneContainer.value) {
    _FASADE.value = appData.FASADE;
    _MILLING.value = appData.MILLING;

    eventBus.value!.on("A:Move", getMove);
    eventBus.value!.on("A:Selected", selected);
    eventBus.value!.on("A:ContantLoaded", checkContantLoad);

    VerdekConstructor.value = new Application(sceneContainer.value);
  }
});

onBeforeUnmount(() => {
  uniformState.value!.resetUniformState();

  productColor.value = {};
  productFasades.value = [];
  fasades.value = {};
  currentFasadeId.value = {};
  productData.value = {};
  product.value = null;

  _FASADE.value = {};
  _MILLING.value = {};

  appData.value = null;
  startData.value = null;
  roomStore.value = null;
  uniformState.value = null;

  modelState.value = null;
  models.value = null;
  wallMaterials.value = null;
  floorMaterials.value = null;
  customiserStore.value = null;
  objectData.value = null;
  roomContantData.value = null;

  VerdekConstructor.value?.destroy();
  VerdekConstructor.value = null;
});

onUnmounted(() => {
  eventBus.value!.clearEvents();
  eventBus.value = null;
});

watch(shadows, () => {
  toggleShadow(shadows.value);
});

watch(refraction, () => {
  toggleRefraction(refraction.value);
});

watch(pointLightValue, () => {
  changePointLightPower(pointLightValue.value);
});

const checkContantLoad = (state: boolean) => {
  activePreloader.value = state;
};

const getMove = (move: boolean) => {
  if (!product.value) return;

  controller.value = move;
  controllerPositionData.value = product.value?.userData.MOUSE_POSITION;
};

const selected = async (item: any) => {
  // let object = item.object;
  // let roomContant = item.roomContant;
  // totalContent.value = roomContant;

  if (!item || !item.object) {
    controller.value = false;
    CutData.value = {};
    CutCash.value = {};
    return;
  }

  let object = item.object;
  let roomContant = item.roomContant;
  totalContent.value = roomContant;

  const { userData } = object;
  const { PROPS } = userData;
  const { CONFIG, RASPIL } = PROPS;

  // console.log(item, "SELECT");

  objectData.value!.setObjectData(userData);
  roomContantData.value!.setRoomContantData(totalContent.value);

  // if (CONFIG.SIZE) {
  //   getProductSizeProps(CONFIG.SIZE, CONFIG.SIZE_EDIT);
  // }

  controller.value = true;

  product.value = object;

  controller.value = true;

  /**  Координаты мыши */
  // if (userData.MOUSE_POSITION)
  // controllerPositionData.value = userData.MOUSE_POSITION;

  console.log(userData.MOUSE_POSITION, "UM");

  productData.value = { ...PROPS };

  if (RASPIL.data) {
    CutData.value = {
      data: RASPIL.data,
      canvasHeight: RASPIL.canvasHeight,
      modelHeight: RASPIL.modelHeight,
    };

    CutCash.value = {
      data: RASPIL.data,
      canvasHeight: RASPIL.canvasHeight,
      modelHeight: RASPIL.modelHeight,
    };
  }

  useModelState().setCurrentModel(userData);

  /**  Координаты мыши */
  await nextTick(() => {
    controllerPositionData.value = userData.MOUSE_POSITION;
  });
};

const toggleShadow = (value: boolean) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:ToggleShadow", value);
  }
};

const toggleRefraction = (value: boolean) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:ToggleRefraction", value);
  }
};

const changePointLightPower = (value: number) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:ChangePointLightPower", value);
  }
};

const setQuality = (value: string) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Quality", value);
  }
};

const create = () => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Create");
  }
};

const save = () => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Save");
  }
};

const load = () => {
  if (VerdekConstructor) {
    shadows.value = false;
    refraction.value = false;
    eventBus.value!.emit("A:ToggleShadow", shadows.value);
    eventBus.value!.emit("A:ToggleRefraction", refraction.value);
    eventBus.value!.emit("A:Load", selectedRoom.value?.id);
  }
};

const toggleiew = () => {
  cameraView.value = !cameraView.value;
  eventBus.value!.emit("A:CameraToggle", cameraView.value);
};

const changeWallTexture = () => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:ChangeWallTexture", wallTexture.value);
  }
};

const changeFloorTexture = () => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:ChangeFloorTexture", floorTexture.value);
  }
};

const changeModuleTexture = (value: { [key: string]: any }) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:ChangeModuleTexture", value);
  }
};

const changePaletteColor = () => {
  // const selectedPalette = paletteColorsData.find(
  //   (palette) => palette.UNAME === selectPalette.value
  // );

  eventBus.value!.emit("A:ChangePaletteColor", selectPalette.value);
};

const onDrag = (event: any, model: { [key: string]: any } | string) => {
  event.dataTransfer?.setData("text", JSON.stringify(model));
};

const removeModel = (model) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:RemoveModel", model);
    controller.value = false;
  }
};

const changeHeightClamp = () => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Height-clamp", clampHeight.value);
  }
};

const getCurrentProduct = (item: any) => {
  if (VerdekConstructor) {
    product.value.userData = item;
  }
};

const toggleFasad = () => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Toggle-Fasad", clampHeight.value);
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
  customiserStore.value!.toggleCustomiserPopup();
};

/** Работа с переходящий рисунок */

const preCreateUniformGroup = () => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Pre-Create-Uniform-Group");
  }
};

const сreateUniformGroup = () => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Create-Uniform-Group");
  }
};

const deliteUniformGroup = (id) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Delite-Uniform-Group", id);
  }
};

const addToUniformGroup = (id) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Add-To-Uniform-Group", id);
  }
};

const removeFromUniformGroup = (id) => {
  if (VerdekConstructor) {
    eventBus.value!.emit("A:Remove-From-Uniform-Group", id);
  }
};

const activeController = computed(() => {
  if (uniformState.value!.getUniformModeData.uniformMode) {
    controller.value = false;
  }

  return {
    "model-controller--active":
      controller.value && !uniformState.value!.getUniformModeData.uniformMode,
  };
});

const pregropping = computed(() => {
  const pregroupMode = uniformState.value!.getPreGrouping;
  return {
    btn_green: !pregroupMode,
    btn_red: pregroupMode,
  };
});

const controllerPosition = computed(() => {
  return {
    transform: `translate(${controllerPositionData.value.x}px, ${controllerPositionData.value.y}px )`,
  };
});

/** Работа о сталешницами */

const saveTableData = () => {
  if (!product.value) return;
  const APP = VerdekConstructor.value;
  const { userData, id } = product.value;

  const groupID = userData.type !== "raspil" ? id : null;

  CutCash.value = userData.PROPS.RASPIL = tableTopManager.value.saveGrid();
  CutSave.value = true;

  APP!.tableTopCreator?.create(toRaw(CutCash.value), product.value, groupID);
};

const openTableRedactor = () => {
  if (!product.value) return;
  const APP = VerdekConstructor.value;
  const { userData, id } = product.value;

  console.log(CutData.value, "CD");
  isModalOpen.value = true;

  const parent = APP!._scene!.getObjectByProperty("id", userData.groupId);

  if (parent) {
    parent.userData.PROPS.RASPIL = userData.PROPS.RASPIL;
    APP!.tableTopCreator?.applyMovements(parent);
  }
  controller.value = false;
};

const closeTableRedactor = () => {
  if (!product.value) return;
  const APP = VerdekConstructor.value;
  const { userData } = product.value;
  if (!CutSave.value) {
    userData.PROPS.RASPIL = CutCash.value;
  }
  CutData.value = userData.PROPS.RASPIL;
  isModalOpen.value = false;
  CutSave.value = false;

  /** Сохраняем данные в родителе */

  const parent = APP!._scene!.getObjectByProperty("id", userData.groupId);
  if (parent) {
    parent.userData.PROPS.RASPIL = userData.PROPS.RASPIL;
  }
};

const deliteTable = () => {
  if (!product.value) return;
  const APP = VerdekConstructor.value;
  const { userData } = product.value;

  const parent = toRaw(
    APP!._scene!.getObjectByProperty("id", userData.groupId)
  );

  isModalOpen.value = false;
  CutSave.value = false;
  CutData.value = {};
  CutCash.value = {};
  if (parent) {
    removeModel(parent);
  } else {
    removeModel();
  }
};

defineExpose({
  VerdekConstructor,
  closeTableRedactor,
  openTableRedactor,
  selected,
});
</script>

<template>
  <div ref="sceneContainer" class="scene-container"></div>
  <div ref="preloader" class="preloader" v-if="!activePreloader"></div>

  <!-- <div class="inputs">
    <customInput v-model="clampHeight" :min="758" :max="2000" :step="10" />
    <button class="btn" @click="changeHeightClamp">Поменять</button>
  </div> -->

  <div
    class="uniform__container"
    v-if="
      uniformState!.getUniformGroups.length > 0 &&
      uniformState!.getUniformModeData.uniformMode
    "
  >
    <div
      class="uniform__item"
      v-for="(item, key) in uniformState!.getUniformGroups"
      :key="key + item.id"
    >
      <p class="uniform__name" :style="[`background-color: ${item.color}`]">
        Группа {{ item.id + 1 }}
      </p>
      <button class="uniform__btn" @click="deliteUniformGroup(item.id)">
        УДАЛИТЬ ГРУППУ
      </button>

      <button class="uniform__btn" @click="addToUniformGroup(item.id)">
        ДОБАВИТЬ ЭЛЕМЕНТ
      </button>

      <button class="uniform__btn" @click="removeFromUniformGroup(item.id)">
        Убрать ЭЛЕМЕНТ
      </button>
    </div>
  </div>

  <div class="ui-panel--right">
    <!-- <button class="btn" @click="save">Сохранить</button>
    <button class="btn" @click="create">Создать новую</button> -->
    <button
      style="margin-top: 2rem"
      v-show="uniformState!.getUniformModeData.uniformMode"
      :class="['btn', pregropping]"
      @click="preCreateUniformGroup"
    >
      Создать новую группу
    </button>

    <button
      class="btn btn_green"
      @click="сreateUniformGroup()"
      v-show="
        uniformState!.getPreGroup > 0 &&
        uniformState!.getUniformModeData.uniformMode
      "
    >
      Создать
    </button>
  </div>


  <!-- <div class="ui-panel--right">
    <button class="btn" @click="save">Сохранить</button>
    <button class="btn" @click="create">Создать новую</button>
    <button class="btn" @click="toggleiew">Поменять вид</button>  -->
  <!-- </div> -->

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

  <div
    :class="['model-controller', activeController]"
    :style="controllerPosition"
  >
    <div class="controller-container">
      <div class="controller-left">
        <img class="left-line" src="@/assets/svg/right-menu/left-line.svg" />
        <ControllerButton v-show="!CutData.data" />
        <ContentControllerButton v-show="!CutData.data" />
        <DeleteControllerButton v-show="!CutData.data" @click="removeModel" />
      </div>
      <div class="controller-right">
        <img class="right-line" src="@/assets/svg/right-menu/right-line.svg" />
        <UpControllerButton />
        <OpenFacadeButton />

        <Modal
          v-if="CutData.data"
          :container="`modal--tableTop`"
          @open-modal="openTableRedactor"
          @close-modal="closeTableRedactor"
        >
          <template #modalBody="{ onModalClose }" class="modal--tableTop">
            <TableTopManager
              ref="tableTopManager"
              :grid="CutData.data"
              :canvas-height="CutData.canvasHeight"
              :model-height="CutData.modelHeight"
              v-if="isModalOpen"
            >
              <template #delite>
                <button
                  class="actions-btn actions-btn--footer"
                  @click="
                    () => {
                      deliteTable();
                      onModalClose();
                    }
                  "
                >
                  Удалить
                </button>
              </template>
              <template #save>
                <button
                  class="actions-btn actions-btn--footer"
                  @click="saveTableData"
                >
                  Сохранить
                </button>
              </template>
              <template #close>
                <button
                  @click="
                    () => {
                      onModalClose();
                    }
                  "
                  class="actions-btn actions-btn--footer"
                >
                  Закрыть
                </button>
              </template>
            </TableTopManager>
          </template>
          <template #modalOpen="{ onModalOpen }">
            <CutButton @click="onModalOpen" />
            <!-- <button class="cut-btn" @click="onModalOpen">
              <img class="cut-icon" src="/icons/cut.svg" alt="" />
            </button> -->
          </template>
        </Modal>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.uniform {
  &__container {
    position: absolute;
    top: 30%;
    right: 0;
    transform: translate(0, 0);
    display: flex;
    flex-direction: column;
    padding: 1rem;
    background-color: white;
  }

  &__item {
    display: flex;
    gap: 1rem;
  }
}

.scene-container {
  width: 100dvw;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  background-color: white;
  z-index: 0;
}

.preloader {
  position: absolute;
  width: 100dvw;
  height: 100dvh;
  background: rgba(2, 2, 2, 0.834);
  backdrop-filter: blur(10px);
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
  transform: scale(0) translate(50%, 50%);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  z-index: -1;
  transition: all 0.1s ease-in-out;

  &--active {
    height: fit-content;
    transform: scale(1);
    filter: blur(0);
    opacity: 1;
    z-index: 0;
  }

  .controller-left {
    transform: translate(46px, -46px);

    .left-line {
    }
  }

  .controller-right {
    transform: translate(92px, -184px);
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

.controller {
  &-container {
    position: relative;
  }
}

.right-menu__button {
  border-color: #ecebf1;
  transition-property: background-color, border-color;
  transition-duration: 0.3s;
  transition-timing-function: ease;

  &.active {
    background-color: #131313;

    &:active {
      background-color: #131313;
    }
  }

  @media (hover: hover) {
    &:hover {
      background-color: #131313;
      border-color: #131313;
    }
  }
}

.btn,
.uniform__btn {
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

  &_red {
    background-color: rgb(255, 111, 111);
    pointer-events: none;
    cursor: none;

    &:hover {
      background-color: rgba(255, 111, 111, 0.581);
    }
  }

  &_green {
    background-color: rgb(111, 255, 152);

    &:hover {
      background-color: rgba(111, 255, 152, 0.581);
    }
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

.modal {
  &--tableTop {
    border: none;
    width: 95vw;
    height: 95vh;
    display: none;
    border-radius: 8px;
    overflow: hidden;
  }
}

.cut {
  &-btn {
    width: 50px;
    height: 50px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    background-color: #ecebf1;
    border: 2px solid #ffffff;
    border-radius: 360px;
    cursor: pointer;
    transition: 0.05s;
    pointer-events: auto;
    transform: translate(65px, -30px);
  }

  &-icon {
    width: 25px;
    height: 25px;
    svg {
      g {
        path {
          fill: black;
        }
      }
    }
  }
}
</style>
