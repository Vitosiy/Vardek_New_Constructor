<script setup lang="ts">
//@ts-nocheck

import * as THREETypes from "@/types/types";
import * as THREEInterfases from "@/types/interfases";
import { TMyObject } from "@/types/types";
import { _URL } from "@/types/constants";

import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  toRaw,
  defineExpose,
  nextTick,
} from "vue";

import { useEventBus } from "@/store/appliction/useEventBus";
import { useAppData } from "@/store/appliction/useAppData";
import { useObjectData } from "@/store/appliction/useObjectData";
import { useUniformState } from "@/store/appliction/useUniformState";
import { useRoomContantData } from "@/store/appliction/useRoomContantData";
import { useRoomState } from "@/store/appliction/useRoomState";

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
import ModalUM2Dconstructor from "@/components/2DmoduleConstructor/ModalUM2Dconstructor.vue";

import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";
import { useMenuStore } from "@/store/appStore/useMenuStore";
import { useScreenshotsStore } from "@/features/store/screenshotsStore/screenshotsStore";

const schemeTransitionStore = useSchemeTransition();
const menuStore = useMenuStore();
const roomState = useRoomState();
const screenshotsStore = useScreenshotsStore();

const appData = ref<{ [key: string]: any } | null>(null);

const eventBus = useEventBus();
// uniformStat= useUniformState();
const modelState = useModelState();
const uniformState = useUniformState();
// const modelState = ref<THREETypes.TUseModelState | null>(null);
const models = ref<any>(null);
const wallMaterials = ref<number | null>(null);
const floorMaterials = ref<number | null>(null);
// const customiserStore = ref<THREETypes.TUseCustomiserStore | null>(null);
const objectData = ref<THREETypes.TUseObjectData | null>(
  null
); /** Текущий объект */
const roomContantData = ref<THREETypes.TUseRoomContantData | null>(null);

const _FASADE = ref({});
const _MILLING = ref({});

const preloaderRef = ref<HTMLElement | null>(null);
const activePreloader = ref<boolean>(false);

const sceneContainer = ref<HTMLElement | null>(null);
const VerdekConstructor = ref<Application | null>(null);
const controller = ref(false);
const productColor = ref<{ [key: string]: any }>({});
const currentFasadeId = ref<{ [key: string]: any }>({});
const productData = ref<{ [key: string]: any }>({});
const product = ref<{ [key: string]: any } | null>(null);
const controllerPositionData = ref<THREEInterfases.IMouseData>({ x: 0, y: 0 });
const totalContent = ref<any>();

/**----------------- 01.12.24-------------------- */

const fasades = ref<{ [key: string]: any }>({});
const productFasades = ref<any[]>([]);

/** ----------------- 19.05.25 ----------------------------- */

//Универсальный модуль
const universalModule2DConstructor = ref<typeof ModalUM2Dconstructor | null>(
  null
);
const universalModuleData = ref<TMyObject | null>(null);

//Распил
const tableTopManager = ref();
const CutData = ref({});
const isModalOpen = ref(false);
const CutCash = ref({});
const CutSave = ref(false);

onMounted(async () => {
  try {
    appData.value = useAppData().getAppData;

    models.value = useAppData().getAppData.CATALOG.PRODUCTS;
    wallMaterials.value = useAppData().getAppData.WALL;
    floorMaterials.value = useAppData().getAppData.FLOOR;

    objectData.value = useObjectData(); /** Текущий объект */
    roomContantData.value = useRoomContantData();

    if (sceneContainer.value) {
      _FASADE.value = appData.FASADE;
      _MILLING.value = appData.MILLING;

      // Подписываемся на события
      eventBus.on("A:Move", getMove);
      eventBus.on("A:Selected", selected);
      eventBus.on("A:ContantLoaded", checkContantLoad);
      eventBus.on("A:ClearSelected", clearSelected);
      eventBus.on("A:ScreenPrint", screenPrint);
      eventBus.on("A:Take3DScreenshot", take3DScreenshot);

      // Создаем приложение
      VerdekConstructor.value = new Application(sceneContainer.value);

      await nextTick();
      VerdekConstructor.value.refreshViewer();
    }
  } catch (error) {
    console.error("Ошибка при инициализации The3D компонента:", error);
  }
});

onBeforeUnmount(() => {
  try {
    // Отключаем все события
    eventBus.off("A:Move", getMove);
    eventBus.off("A:Selected", selected);
    eventBus.off("A:ContantLoaded", checkContantLoad);
    eventBus.off("A:ClearSelected", clearSelected);
    eventBus.off("A:ScreenPrint", screenPrint);
    eventBus.off("A:Take3DScreenshot", take3DScreenshot);

    // Сбрасываем состояние
    uniformState.resetUniformState();

    // Очищаем данные
    productColor.value = {};
    productFasades.value = [];
    fasades.value = {};
    currentFasadeId.value = {};
    productData.value = {};
    product.value = null;

    _FASADE.value = {};
    _MILLING.value = {};

    appData.value = null;

    models.value = null;
    wallMaterials.value = null;
    floorMaterials.value = null;

    objectData.value = null;
    roomContantData.value = null;

    // Уничтожаем приложение
    if (VerdekConstructor.value) {
      VerdekConstructor.value.destroy();
      VerdekConstructor.value = null;
    }
  } catch (error) {
    console.error("Ошибка при очистке компонента The3D:", error);
  }
});

onUnmounted(() => {
  eventBus.clearEvents();
});

const checkContantLoad = (state: boolean) => {
  // console.log("checkContantLoad", state);
  activePreloader.value = state;
};

const getMove = (move: boolean) => {
  if (!product.value) return;

  controller.value = move;
  controllerPositionData.value = product.value?.userData.MOUSE_POSITION;
};

const selected = async (item: any) => {
  if (!item || !item.object) {
    controller.value = false;
    CutData.value = {};
    CutCash.value = {};
    universalModuleData.value = null;
    return;
  }

  CutData.value = {};
  CutCash.value = {};
  universalModuleData.value = null;

  let object = item.object;
  let roomContant = item.roomContant;
  totalContent.value = roomContant;

  const { userData } = object;
  const { PROPS } = userData;
  const { CONFIG, RASPIL } = PROPS;

  console.log(RASPIL, "SELECT");

  objectData.value!.setObjectData(userData);
  roomContantData.value!.setRoomContantData(totalContent.value);
  product.value = object;
  controller.value = true;

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

  if (CONFIG.MODULEGRID) {
    universalModuleData.value = {
      MODULEGRID: CONFIG.MODULEGRID || false,
      PROPS: userData,
      canvasHeight: CONFIG.MODULEGRID.canvasHeight,
      canvasWidth: CONFIG.MODULEGRID.canvasWidth,
    };
  }

  if (CONFIG.MODULEGRID && universalModule2DConstructor.value) {
    universalModule2DConstructor.value.selectUMData(universalModuleData.value);
  }

  /**  Координаты мыши */
  await nextTick(() => {
    controllerPositionData.value = userData.MOUSE_POSITION;
  });
};

const clearSelected = () => {
  controller.value = false;
  CutData.value = {};
  CutCash.value = {};
  universalModuleData.value = null;
};

const screenPrint = async () => {
  if (!VerdekConstructor.value) return;

  try {
    const renderer = VerdekConstructor.value._renderer;
    if (!renderer) {
      console.error("Renderer не найден");
      return;
    }

    // Очищаем предыдущие скриншоты перед созданием новых
    screenshotsStore.clearScreenshots();
    console.log("Предыдущие скриншоты очищены");

    // Получаем все комнаты из store - используем правильный источник данных
    // const allRooms = schemeTransitionStore.getSchemeTransitionData;
    const allRooms = roomState.getRooms;

    console.log(`Начинаем создание скриншотов для ${allRooms.length} комнат`);

    // Сохраняем текущую комнату, чтобы восстановить её после создания скриншотов
    const currentRoomId = roomContantData.value?.roomId || null;

    // Сохраняем текущий режим чертежа
    const currentDrawingMode = menuStore.getDrowModeValue;

    for (let i = 0; i < allRooms.length; i++) {
      const room = allRooms[i];
      console.log(
        `Обрабатываем комнату ${i + 1}/${allRooms.length}: ${
          room.label || room.id
        }`
      );

      try {
        // Загружаем комнату в сцену через eventBus
        eventBus.emit("A:Load", room.id);

        // Ждем загрузки комнаты
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Принудительно рендерим сцену перед созданием скриншота

        // 1. Создаем скриншот комнаты в обычном режиме
        console.log(
          `Создаем скриншот комнаты "${room.label || room.id}" в обычном режиме`
        );
        await new Promise<void>((resolve) => {
          renderer.domElement.toBlob((blob: Blob | null) => {
            if (blob) {
              // Сохраняем скриншот в стор вместо скачивания
              const cleanRoomName = (room.label || `Комната_${i + 1}`)
                .replace(/[^a-zA-Z0-9а-яё\s-]/gi, "_")
                .trim();
              const screenshot = {
                id: `${room.id}-normal-${Date.now()}`,
                roomId: room.id,
                roomLabel: room.label || `Комната_${i + 1}`,
                mode: "normal" as const,
                blob: blob,
                timestamp: Date.now(),
                fileName: `3d-screenshot-${cleanRoomName}-normal.png`,
              };

              screenshotsStore.addScreenshot(screenshot);
              console.log(
                `Скриншот комнаты "${
                  room.label || room.id
                }" в обычном режиме сохранен в стор`
              );
            }
            resolve();
          }, "image/png");
        });

        // 2. Включаем режим чертежа
        console.log(
          `Включаем режим чертежа для комнаты "${room.label || room.id}"`
        );
        await menuStore.toggleDrowModeValue();
        const drawingModeValue = menuStore.getDrowModeValue;
        eventBus.emit("A:DrawingMode", drawingModeValue);

        // Ждем применения режима чертежа
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 3. Создаем скриншот комнаты в режиме чертежа
        console.log(
          `Создаем скриншот комнаты "${room.label || room.id}" в режиме чертежа`
        );
        await new Promise<void>((resolve) => {
          renderer.domElement.toBlob((blob: Blob | null) => {
            if (blob) {
              // Сохраняем скриншот в стор вместо скачивания
              const cleanRoomName = (room.label || `Комната_${i + 1}`)
                .replace(/[^a-zA-Z0-9а-яё\s-]/gi, "_")
                .trim();
              const screenshot = {
                id: `${room.id}-drawing-${Date.now()}`,
                roomId: room.id,
                roomLabel: room.label || `Комната_${i + 1}`,
                mode: "drawing" as const,
                blob: blob,
                timestamp: Date.now(),
                fileName: `3d-screenshot-${cleanRoomName}-drawing.png`,
              };

              screenshotsStore.addScreenshot(screenshot);
              console.log(
                `Скриншот комнаты "${
                  room.label || room.id
                }" в режиме чертежа сохранен в стор`
              );
            }
            resolve();
          }, "image/png");
        });

        // 4. Возвращаем режим чертежа в исходное состояние
        if (drawingModeValue !== currentDrawingMode) {
          await menuStore.toggleDrowModeValue();
          eventBus.emit("A:DrawingMode", currentDrawingMode);
        }

        // Пауза между скриншотами
        if (i < allRooms.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (roomError) {
        console.warn(
          `Ошибка при обработке комнаты ${room.label || room.id}:`,
          roomError
        );
        // Продолжаем с следующей комнатой
        continue;
      }
    }

    // Восстанавливаем исходную комнату, если она была
    if (currentRoomId) {
      eventBus.emit("A:Load", currentRoomId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Восстанавливаем исходный режим чертежа
    if (menuStore.getDrowModeValue !== currentDrawingMode) {
      await menuStore.toggleDrowModeValue();
      eventBus.emit("A:DrawingMode", currentDrawingMode);
    }

    console.log(
      `Все скриншоты комнат созданы и сохранены в стор. Всего скриншотов: ${
        screenshotsStore.getScreenshots().length
      }`
    );
    eventBus.emit("A:3DScreenshotCreated");
  } catch (error) {
    console.error("Ошибка при создании 3D скриншотов:", error);
    eventBus.emit("A:3DScreenshotCreated");
  }
};

const take3DScreenshot = () => {
  if (VerdekConstructor.value) {
    try {
      const renderer = VerdekConstructor.value._renderer;
      if (!renderer) {
        console.error("Renderer не найден");
        return;
      }

      renderer.domElement.toBlob((blob: Blob | null) => {
        if (blob) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "3d-screenshot.png";
          link.click();
          URL.revokeObjectURL(link.href);
        }
      }, "image/png");
    } catch (error) {
      console.error("Ошибка при создании 3D скриншота:", error);
    }
  }
};

const removeModel = (model) => {
  if (VerdekConstructor.value) {
    eventBus.emit("A:RemoveModel", { product: model });
    controller.value = false;
  }
};

/** Работа с переходящий рисунок */

const preCreateUniformGroup = () => {
  console.log(uniformState!.getUniformModeData.uniformMode, 'uniformMode')
  if (VerdekConstructor.value) {
    console.log('Pre-Create-Uniform-Group')
    eventBus.emit("A:Pre-Create-Uniform-Group");
  }
};

const сreateUniformGroup = () => {
  console.log(uniformState!.getUniformModeData.uniformMode, 'uniformMode')
  if (VerdekConstructor.value) {
    console.log('Create-Uniform-Group')
    eventBus.emit("A:Create-Uniform-Group");
  }
};

const deliteUniformGroup = (id) => {
  if (VerdekConstructor.value) {
    eventBus.emit("A:Delite-Uniform-Group", id);
  }
};

const addToUniformGroup = (id) => {
  if (VerdekConstructor.value) {
    eventBus.emit("A:Add-To-Uniform-Group", id);
  }
};

const removeFromUniformGroup = (id) => {
  if (VerdekConstructor.value) {
    eventBus.emit("A:Remove-From-Uniform-Group", id);
  }
};

const activeController = computed(() => {
  if (uniformState.getUniformModeData.uniformMode) {
    controller.value = false;
  }

  return {
    "model-controller--active":
      controller.value && !uniformState.getUniformModeData.uniformMode,
  };
});

const pregropping = computed(() => {
  const pregroupMode = uniformState.getPreGrouping;
  return {
    btn_green: !pregroupMode,
    btn_red: pregroupMode,
  };
});

const controllerPosition = computed(() => {
  const curX = controllerPositionData.value.x;
  const curY = controllerPositionData.value.y;
  if (controller.value) {
    return {
      transform: `translate(${curX}px, ${curY}px) scale(1)`,
    };
  }
  return {
    transform: `translate(${curX}px, ${curY}px) scale(0)`,
  };
});

/** Работа о столешницами */

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
    removeModel(null);
  }
};

defineExpose({
  VerdekConstructor,
  closeTableRedactor,
  openTableRedactor,
  selected,
  activePreloader,
  getScreenshots: () => screenshotsStore.getScreenshots(),
  getScreenshotsByRoom: (roomId: string) =>
    screenshotsStore.getScreenshotsByRoom(roomId),
  clearScreenshots: () => screenshotsStore.clearScreenshots(),
});
</script>

<template>
  <div ref="sceneContainer" class="scene-container"></div>
  <div ref="preloaderRef" class="preloader" v-show="!activePreloader"></div>


  <!-- Пока что закоментил потом удалим <div
    class="uniform__container"
    v-if="
      uniformState!.getUniformGroups.length > 0 &&
      uniformState!.getUniformModeData.uniformMode
    "
  >
    <div
      class="uniform__item"
      v-for="(item, key) in uniformState!.getUniformGroups as THREETypes.TUniformGroups[]"
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
  </div> -->

  <!-- <div class="ui-panel--right">
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
  </div> -->

  <div
    :class="['model-controller', activeController]"
    :style="controllerPosition"
  >
    <div class="controller-container">
      <div class="controller-left">
        <img class="left-line" src="@/assets/svg/right-menu/left-line.svg" />
        <ControllerButton
          v-if="Object.keys(CutData).length == 0 && !universalModuleData"
        />
        <ContentControllerButton
          v-if="Object.keys(CutData).length == 0 && !universalModuleData"
        />
        <DeleteControllerButton
          v-if="Object.keys(CutData).length == 0"
          @click="removeModel(null)"
        />
      </div>
      <div class="controller-right">
        <img class="right-line" src="@/assets/svg/right-menu/right-line.svg" />
        <!-- <UpControllerButton /> -->
        <OpenFacadeButton />

        <Modal
          v-if="Object.keys(CutData).length > 0"
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
        <div v-show="universalModuleData && product">
          <ModalUM2Dconstructor
            ref="universalModule2DConstructor"
            :product="product"
          />
        </div>
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
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: white;
  z-index: 0;
}

.preloader {
  position: absolute;
  width: 100dvw;
  height: 100dvh;
  background: rgba(255, 255, 255, 0.5);
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

  opacity: 0;
  filter: blur(10px);
  transform-origin: top center;
  pointer-events: none;
  user-select: none;

  -webkit-user-drag: none;
  transition: all 0.2s ease-in-out;
  &--active {
    opacity: 1;
    filter: blur(0);
  }

  .controller-left {
    transform: translate(23px, -69px);

    .left-line {
    }
  }

  .controller-right {
    transform: translate(69px, -46 * 5px);
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
