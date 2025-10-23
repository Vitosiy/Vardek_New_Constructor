<script setup lang="ts">
//@ts-nocheck
import {
  ref,
  computed,
  watch,
  onBeforeMount,
  onUnmounted,
  defineExpose,
} from "vue";
import { _URL } from "@/types/constants";
import type {
  TQuality,
  TOptionsMap,
  TTextureActionMap,
  TTextureItem,
  MenuType,
  TPalitte,
  TOptionItem,
  TMilling,
} from "@/types/types";
import type { IWallSizes } from "@/types/interfases";

import { useRoomState } from "@/store/appliction/useRoomState";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useMenuStore } from "@/store/appStore/useMenuStore";
import { useAppData } from "@/store/appliction/useAppData";
import { useRoomOptions } from "./roomOptions/useRoomOptons";

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import RoomList from "./roomOptions/RoomList.vue";
import RoomOptions from "./roomOptions/RoomOptions.vue";
import RoomHeight from "./roomOptions/RoomHeight.vue";
import RoomVisualSettings from "./roomOptions/RoomVisualSettings.vue";
import ColorSelector from "./roomOptions/ColorSelector.vue";

type TExtras = {
  isPalitte: TPalitte[] | null;
  isMilling: TMilling[] | null;
  isPlinth: any;
};

const eventBus = useEventBus();
const sceneState = useSceneState();
const roomState = useRoomState();
const menuStore = useMenuStore();
const appData = useAppData();
const roomOptions = useRoomOptions();

const clampHeight = ref<number | null | string>(null);
const quality = ref<TQuality[] | null>(null);
const currentQuality = ref<TQuality | null>(null);

const pointLight = ref<number | string>(1);
const ambientLight = ref<number | string>(1);

const shadows = ref<boolean>(false);
const refraction = ref<boolean>(false);

const currentOption = ref<keyof TTextureActionMap | null>(null);
const currentOptionLable = ref<string | null>(null);

const optionsData = ref<{ [key: string]: any } | null | any[]>(null);
const extrasSelect = ref<boolean>(false);

const roomRef = ref<HTMLElement | null>(null);

const visualData = ref<any>({
  module: null,
  fasade: null,
  table: null,
  walls: null,
  floor: null,
  plinth: null,
});

const optionsType = ref<TTextureActionMap>({
  wall: "A:ChangeWallTexture",
  floor: "A:ChangeFloorTexture",
  moduleTop: "A:ChangeModuleTotalTexture",
  moduleBottom: "A:ChangeModuleTotalTexture",
  fasadsTop: "A:ChangeFasadsTopTexture",
  fasadsBottom: "A:ChangeFasadsBottomTexture",
  // tableTop: "A:ChangeTableTop",
  palitteTotal: "A:ChangePaletteTotal",
  millingTotal: "A:ChangeMillingTotal",
  plinth: "A:ChangePlinthBody",
  plinthColor: "A:ChangePlinthColor",
});

const globalOptions = ref<TOptionsMap | null>(null);

onBeforeMount(() => {
  prepareOptions();
});

onUnmounted(() => {
  roomOptions.setHeightClamp(clampHeight.value);
  roomOptions.setLightRange("pointLight", pointLight.value);
  roomOptions.setLightRange("ambientLight", ambientLight.value);
  roomOptions.setRefractionValue(refraction.value);
  roomOptions.setShadowValue(shadows.value);
  extrasSelect.value = false;
});

defineExpose({ roomRef });

const prepareOptions = () => {
  const { wall, floor } = roomState.getCurrentRoomParams as IWallSizes;

  roomOptions.updateOption("wall", wall as number);
  roomOptions.updateOption("floor", floor as number);

  visualData.value = {
    module: roomOptions.getDefaultModuleData(),
    fasade: roomOptions.getDefaultFasadeData(),
    // table: roomOptions.getDefaultTableTopData(),
    walls: roomOptions.getWallsTextures(),
    floor: roomOptions.getFloorTextures(),
    plinth: roomOptions.getDefaultTotalPlinthData(),
  };

  globalOptions.value = roomOptions.getGlobalOptions;
  const { fasadsBottom, fasadsTop, plinth } = globalOptions.value;
  prepareExtras([fasadsBottom, fasadsTop, plinth]);

  clampHeight.value = roomOptions.getHeightClamp;
  quality.value = roomOptions.getQuality;
  currentQuality.value = quality.value?.find((el) => el.active) ?? null;

  shadows.value = roomOptions.getShadowValue;
  refraction.value = roomOptions.getRefractionValue;
  pointLight.value = roomOptions.getPointLightRange;
  ambientLight.value = roomOptions.getAmbientLightRange;
};

const prepareExtras = (arr: TOptionItem[]) => {
  for (const el in arr) {
    const option = arr[el];
    const { isPalitte } = checkExtras(option.id);
    if (option.palitte) {
      option.palitteData = isPalitte;
    }
  }
};

const closeMenu = (menuType: MenuType) => {
  menuStore.closeMenu(menuType);
};

const changeHeightClamp = (value: number | null) => {
  clampHeight.value = value;
  eventBus.emit("A:Height-clamp", value);
};

const loadRoom = (id: number) => {
  roomOptions.resetGlobalOptions();
  eventBus.emit("A:Load", id);
  eventBus.emit("A:ContantLoaded", false);
  eventBus.emit("A:DrawingMode", false);
  eventBus.emit("A:ToggleRulerVisibility", true);
};

const deliteRoom = (value: number) => {
  roomState.removeRoom(value);
};

const changeQuality = (data: TQuality) => {
  currentQuality.value = data;
  roomOptions.setQuality(data.value);
  eventBus.emit("A:Quality", data.value);
};

const changePointLightPower = (value: number | string) => {
  eventBus.emit("A:ChangePointLightPower", value);
};

const changeAmbientLightPower = (value: number | string) => {
  eventBus.emit("A:ChangeAmbientLightPower", value);
};

const toggleShadow = (value: boolean) => {
  eventBus.emit("A:ToggleShadow", value);
};

const toggleRefraction = (value: boolean) => {
  eventBus.emit("A:ToggleRefraction", value);
};

const getOption = (value: keyof TTextureActionMap, title: string) => {
  // if (value == currentOption.value) {
  //   // optionsData.value = null;
  //   // currentOption.value = null;
  //   return;
  // }
  currentOption.value = value;

  switch (value) {
    case "plinth":
      optionsData.value = Object.values(visualData.value.plinth);
      break;
    case "wall":
      optionsData.value = Object.values(visualData.value.walls);
      break;
    case "floor":
      optionsData.value = Object.values(visualData.value.floor);
      break;
    case "moduleTop":
    case "moduleBottom":
      optionsData.value = Object.values(visualData.value.module);
      break;
    case "fasadsTop":
    case "fasadsBottom":
      optionsData.value = visualData.value.fasade as [];
      break;
    // case "tableTop":
    //   optionsData.value = Object.values(visualData.value.table);
    //   break;
  }
  currentOptionLable.value = title;
  extrasSelect.value = false;
};

const totalSelect = (event: Event, value: keyof TOptionsMap) => {
  roomOptions.updateOptionGlobal(
    value,
    (event.target as HTMLInputElement).checked
  );
  const selectOption = roomOptions.getGlobalOptions[value];

  if (selectOption) {
    switch (value) {
      case "wall":
        if (selectOption.global) {
          roomOptions.apllyProjectWall(selectOption.id);
          sceneState.updateStartRoomData(value, selectOption.id);
          return;
        }
        sceneState.updateStartRoomData(value, 44128);
        break;
      case "floor":
        if (selectOption.global) {
          roomOptions.apllyProjectFloor(selectOption.id);
          sceneState.updateStartRoomData(value, selectOption.id);
          return;
        }
        sceneState.updateStartRoomData(value, 44013);
        break;
      default:
        if (selectOption.global) {
          sceneState.updateDefaultData(value, selectOption);
          return;
        }
        sceneState.updateDefaultData(value, null);
    }
  }
};

const selectOption = (value: TTextureItem) => {
  let data;
  switch (currentOption.value) {
    case "moduleTop":
    case "moduleBottom":
    case "fasadsTop":
    case "fasadsBottom":
    // case "tableTop":
    case "plinth":
      data = { data: value, type: currentOption.value };
      break;
    default:
      data = value.ID;
      break;
  }

  const checkMillingSelect = "type_showcase" in value;
  if (!currentOption.value) return;

  const curOption = globalOptions.value![currentOption.value];

  if (curOption.id === value.ID) return;

  if (!extrasSelect.value) {
    if (curOption.id != value.ID) {
      roomOptions.setGlobalPalitte(null, currentOption.value);
      roomOptions.setGlobalMilling(null, currentOption.value);
      roomOptions.setGlobalPlinth(null, currentOption.value);
    }
    curOption.id = value.ID;
  }
  const { isPalitte, isMilling, isPlinth } = checkExtras(value.ID);

  if (isPlinth) {
    curOption.plinthData = isPlinth;
  } else {
    curOption.palitteData = isPalitte;
    curOption.millingData = isMilling;
  }

  const startMill = curOption.milling;
  const startPlinth = curOption.plinthSurfase;
  // const startPall = curOption.palitte;

  if (isPlinth && curOption) {
    if (curOption.plinthSurfase === null) {
      if (isPlinth.length > 0) {
        if (isPlinth[0] != null) {
          roomOptions.setGlobalPlinth(isPlinth[0].ID, currentOption.value);
          eventBus.emit(optionsType.value["plinthColor"], data);
        } else {
          roomOptions.setGlobalPlinth(null, currentOption.value);
          eventBus.emit(optionsType.value["plinthColor"], data);
        }
      } else {
        roomOptions.setGlobalPlinth(null, currentOption.value);
        eventBus.emit(optionsType.value["plinthColor"], data);
      }
    } else {
      roomOptions.setGlobalPlinth(value.ID, currentOption.value);
      eventBus.emit(optionsType.value["plinthColor"], data);
    }

    if (startPlinth === null) {
      roomOptions.updateOption(currentOption.value, value.ID);
      eventBus.emit(optionsType.value["plinthColor"], data);
    }

    return;
  }

  // Ветка 1: если есть палитра
  if (isPalitte && curOption) {
    if (curOption.palitte === null) {
      if (isPalitte.length > 0) {
        roomOptions.setGlobalPalitte(isPalitte[0].ID, currentOption.value);
      } else {
        roomOptions.setGlobalPalitte(null, currentOption.value);
      }
    } else {
      if (!checkMillingSelect) {
        roomOptions.setGlobalPalitte(value.ID, currentOption.value);
        eventBus.emit(optionsType.value["palitteTotal"], data);
      }
    }
    // внутри палитры дополнительно проверяем milling
    if (isMilling && checkMillingSelect) {
      if (curOption.milling === null) {
        if (isMilling.length > 0) {
          roomOptions.setGlobalMilling(isMilling[0].ID, currentOption.value);
        } else {
          roomOptions.setGlobalMilling(null, currentOption.value);
        }
      } else {
        roomOptions.setGlobalMilling(value.ID, currentOption.value);
        eventBus.emit(optionsType.value["millingTotal"], data);
      }
    }

    if (isPalitte && isMilling && curOption) {
      if (startMill === null) {
        roomOptions.updateOption(currentOption.value, value.ID);
        eventBus.emit(optionsType.value[currentOption.value], data);
      }
    }
    return; // если палитра true, на этом завершаем
  }

  // Ветка 2: палитры нет, но есть milling
  if (!isPalitte && isMilling && curOption && checkMillingSelect) {
    if (curOption.milling === null) {
      if (isMilling.length > 0) {

        roomOptions.setGlobalMilling(isMilling[0].ID, currentOption.value);
      } else {
        roomOptions.setGlobalMilling(null, currentOption.value);
      }
    } else {

      roomOptions.setGlobalMilling(value.ID, currentOption.value);
      eventBus.emit(optionsType.value["millingTotal"], data);
    }

    if (startMill === null) {
      roomOptions.updateOption(currentOption.value, value.ID);
      eventBus.emit(optionsType.value[currentOption.value], data);


    }

    return;
  }

  // Ветка 3: ни палитры, ни milling
  roomOptions.setGlobalPalitte(null, currentOption.value);
  roomOptions.setGlobalMilling(null, currentOption.value);
  roomOptions.setGlobalPlinth(null, currentOption.value);
  eventBus.emit(optionsType.value[currentOption.value], data);
  roomOptions.updateOption(currentOption.value, value.ID);
};

const palitteSelect = (
  palitteTitle: string,
  key: keyof TOptionsMap,
  palitteData: TPalitte[]
) => {
  optionsData.value = palitteData;
  currentOption.value = key;
  currentOptionLable.value = palitteTitle;
  extrasSelect.value = true;
};

const millingSelect = (
  millingTitle: string,
  key: keyof TOptionsMap,
  millingData: TMilling[]
) => {
  optionsData.value = millingData;
  currentOption.value = key;
  currentOptionLable.value = millingTitle;
  extrasSelect.value = true;
};

const plinthSelect = (
  plinthTitle: string,
  key: keyof TOptionsMap,
  plinthgData: TMilling[]
) => {

  optionsData.value = plinthgData;
  currentOption.value = key;
  currentOptionLable.value = plinthTitle;
  extrasSelect.value = true;
};

const checkExtras = (fasadeId?: number | string): TExtras => {
  const curOption = globalOptions.value![currentOption.value!];
  const id = curOption?.id ?? fasadeId;

  const palitte = roomOptions.getDefaultPalitData(id!);
  const milling = roomOptions.getDefaultMillingData(id!);
  const plinth = roomOptions.getTotalPlinthColorData(id);

  return {
    isPalitte: palitte.length > 0 ? palitte : null,
    isMilling: milling.length > 0 ? milling : null,
    isPlinth: plinth.length > 0 ? plinth : null,
  };
};

const getOptionImg = computed(() => {
  return (id: number | string, type: string) => {
    let result;
    const FASADE = appData.getAppData.FASADE;
    switch (type) {
      case "wall":
        result = visualData.value.walls[id].PREVIEW_PICTURE;
        break;
      case "floor":
        result = visualData.value.floor[id].PREVIEW_PICTURE;
        break;
      case "moduleTop":
      case "moduleBottom":
        result = visualData.value.module[id].PREVIEW_PICTURE;
        break;
      case "fasadsTop":
      case "fasadsBottom":
        result = FASADE[id].PREVIEW_PICTURE;
        break;
      // case "tableTop":
      //   result = visualData.value.table[id].PREVIEW_PICTURE;
      //   break;
      case "plinth":
        result = visualData.value.plinth[id].PREVIEW_PICTURE;
        break;
    }
    return result;
  };
});

const roomsList = computed(() => roomState.getRooms);
const getCurrentRoomId = computed(() => roomState.getRoomId);
const getCurrentRedactor = computed(
  () =>
    (currentOption.value?.includes("fasads") && !extrasSelect.value) ?? false
);

watch(pointLight, () => changePointLightPower(pointLight.value));
watch(ambientLight, () => changeAmbientLightPower(ambientLight.value));
watch(refraction, () => toggleRefraction(refraction.value));
watch(shadows, () => toggleShadow(shadows.value));
</script>

<template>
  <div class="room" ref="roomRef">
    <div class="room-popup">
      <h1 class="popup__title">Параметры помещения</h1>
      <ClosePopUpButton class="menu__close" @close="closeMenu('roomPar')" />

      <div class="room-popup__container">
        <RoomList
          :rooms="roomsList"
          :currentRoomId="getCurrentRoomId"
          @load-room="loadRoom"
          @delete-room="deliteRoom"
        />
        <RoomOptions
          v-if="globalOptions"
          :options="globalOptions"
          :getOptionImg="getOptionImg"
          @toSelect="getOption"
          @toToggle="totalSelect"
          @toPalitteSelect="palitteSelect"
          @toMillingSelect="millingSelect"
          @toPlinthSelect="plinthSelect"
        />

        <h3 class="popup__title">Высота навесных модулей</h3>
        <RoomHeight :clampHeight="clampHeight" @apply="changeHeightClamp" />

        <RoomVisualSettings
          :currentQuality="currentQuality"
          :quality="quality"
          v-model:shadows="shadows"
          v-model:refraction="refraction"
          v-model:ambientLight="ambientLight"
          v-model:pointLight="pointLight"
          @change-quality="changeQuality"
        />
      </div>
    </div>

    <transition name="slide--left" mode="out-in">
      <ColorSelector
        v-if="optionsData"
        key="color-select"
        :optionsData="optionsData"
        :currentOptionLabel="currentOptionLable"
        :getCurrentRedactor="getCurrentRedactor"
        @select="selectOption"
      />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.room {
  display: flex;
  gap: 5px;
  position: absolute;
  top: 15px;
  left: 320px;
  max-height: calc(100vh - 120px);
  z-index: -1;
  user-select: none;

  &-options {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  &-modheight {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  &-select {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    padding: 10px 0;
    border-top: 1px solid $stroke;
    border-bottom: 1px solid $stroke;

    &__item {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px;
      border: 1px solid $dark-grey;
      border-radius: 50px;
    }
  }

  &-popup {
    width: 570px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: relative;
    padding: 15px;
    background: rgba($white, 1);
    box-shadow: 0px 0px 10px 0px #3030301a;
    z-index: 1;
    border-radius: 15px;

    &__container {
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding-right: 10px;
      overflow: auto;
    }
  }
}

.visual {
  padding: 1rem;
  border: 1px solid $dark-grey;
  border-radius: 15px;

  &__contant {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__top,
  &__bottom {
    display: flex;
    gap: 16px;
  }

  &__top {
    width: 100%;

    &--left,
    &--right {
      display: flex;
      width: 100%;
      max-width: calc(50% - 8px);
    }

    &--switch {
      justify-content: space-around;
      align-items: center;
    }
  }

  &__bottom {
    &--left,
    &--right {
      display: flex;
      width: 100%;
    }
  }
}

.accordion {
  &__contant {
    padding-top: 0.5rem;
    border-top: 1px solid $dark-grey;
  }
}

.menu__close {
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
}

.label {
  &__container {
    display: flex;
    flex-direction: column;
    pointer-events: none;
  }

  &__img {
    height: 60px;
    border-radius: 15px;
  }

  &__text {
    font-size: 15px;
    font-weight: 600;
    color: $strong-grey;
    cursor: pointer;
    transition-property: color;
    transition-duration: 0.25s;
    transition-timing-function: ease;

    &--xs {
      color: $dark-grey;
      font-size: clamp(9px, 0.78125vw + 1px, 14px) !important;
    }
  }
}

.button {
  &__filled {
    &.active {
      color: $white;
      background-color: $red;
    }

    @media (hover: hover) {
      &:hover {
        color: $white;
        background-color: $red;
      }
    }
  }
}

@media screen and (width <= 1023px) {
  .visual {
    &__top {
      max-width: 100%;
      flex-wrap: wrap;

      &--left,
      &--right {
        max-width: 100%;
        flex-wrap: wrap;
      }

      &--switch {
        justify-content: flex-start;
        gap: 1rem;
      }
    }
  }
}
</style>
