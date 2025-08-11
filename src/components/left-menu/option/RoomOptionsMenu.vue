<script setup lang="ts">
//@ts-nocheck 
import {
  ref,
  computed,
  watch,
  onBeforeMount,
  onMounted,
  defineExpose,
} from "vue";
import { _URL } from "@/types/constants";
import { TQuality } from "@/types/types";
import {
  TOptionsMap,
  TTextureActionMap,
  TTextureItem,
  TFasadeItem,
  MenuType,
} from "@/types/types";
import { IWallSizes } from "@/types/interfases";

import { useRoomState } from "@/store/appliction/useRoomState";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useMenuStore } from "@/store/appStore/useMenuStore";

import MainInput from "@/components/ui/inputs/MainInput.vue";
import MainButton from "@/components/ui/buttons/MainButton.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import Accordion from "@/components/ui/accordion/Accordion.vue";
import RangeSlider from "@/components/ui/rangeSlider/RangeSlider.vue";
import Toggle from "@vueform/toggle";
import MaterialSelector from "@/components/right-menu/customiser-pages/ColorRightPage/MaterialSelector.vue";
import SurfaceRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/SurfaceRedactor.vue";

const eventBus = useEventBus();
const sceneState = useSceneState();
const roomState = useRoomState();
const menuStore = useMenuStore();

const clampHeight = ref<number>(sceneState.getStartHeightClamp);
const quality = ref<TQuality[]>(sceneState.getQuality);
const currentQuality = ref<TQuality>(quality.value[0]);

const pointLight = ref<number | string>(1);
const ambientLight = ref<number | string>(1);

const shadows = ref<boolean>(false);
const refraction = ref<boolean>(false);

const currentOption = ref<keyof TTextureActionMap | null>(null);
const currentOptionLable = ref<string | null>(null);

const optionsData = ref<{ [key: string]: any } | null | any[]>(null);
const roomRef = ref<HTMLElement | null>(null);

const optionsType = ref<TTextureActionMap>({
  wall: "A:ChangeWallTexture",
  floor: "A:ChangeFloorTexture",
  moduleTop: "A:ChangeModuleTotalTexture",
  moduleBottom: "A:ChangeModuleTotalTexture",
  fasadsTop: "A:ChangeFasadsTopTexture",
  fasadsBottom: "A:ChangeFasadsBottomTexture",
});

const globalOptions = ref<TOptionsMap | null>(null);

onMounted(() => {
  shadows.value = sceneState.getShadowValue;
  refraction.value = sceneState.getRefractionValue;
  pointLight.value = sceneState.getLightRange.pointLight;
  ambientLight.value = sceneState.getLightRange.ambientLight;
});

onBeforeMount(() => {
  globalOptions.value = menuStore.getGlobalOptions;
  prepareOptions();
});

defineExpose({
  roomRef,
});

const prepareOptions = () => {
  const { wall, floor } = roomState.getCurrentRoomParams as IWallSizes;

  menuStore.updateOption("wall", wall as number);
  menuStore.updateOption("floor", floor as number);
};

const closeMenu = (menuType: MenuType) => {
  menuStore.closeMenu(menuType);
};

const changeHeightClamp = () => {
  eventBus.emit("A:Height-clamp", clampHeight.value);
};

const loadRoom = (id: number) => {
  menuStore.resetGlobalOptions();
  eventBus.emit("A:Load", id);
  eventBus.emit("A:ContantLoaded", false);
  closeMenu("roomPar");
};

const deliteRoom = (value: number) => {
  roomState.removeRoom(value);
};

const changeQualit = (data: TQuality) => {
  currentQuality.value = data;
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
  if (value == currentOption.value) {
    optionsData.value = null;
    currentOption.value = null;
    return;
  }
  currentOption.value = value;
  switch (value) {
    case "wall":
      optionsData.value = Object.values(roomState.getWallsTextures());
      break;
    case "floor":
      optionsData.value = Object.values(roomState.getFloorTextures());
      break;
    case "moduleTop":
      optionsData.value = Object.values(roomState.getDefaultModuleData());
      break;
    case "moduleBottom":
      optionsData.value = Object.values(roomState.getDefaultModuleData());
      break;
    case "fasadsTop":
      optionsData.value = roomState.getDefaultFasadeData() as [];
      break;
    case "fasadsBottom":
      optionsData.value = roomState.getDefaultFasadeData() as [];
      break;
  }

  currentOptionLable.value = title;
};

const totalSelect = (event: Event, value: keyof TOptionsMap) => {
  menuStore.updateOptionGlobal(value, event.target!.checked);
  const selectOption = menuStore.getGlobalOptions[value];

  switch (value) {
    case "wall":
      if (selectOption.global) {
        roomState.apllyProjectWall(selectOption.id);
        sceneState.updateStartRoomData(value, selectOption.id);
        return;
      }
      sceneState.updateStartRoomData(value, 44128);

      break;
    case "floor":
      if (selectOption.global) {
        roomState.apllyProjectFloor(selectOption.id);
        sceneState.updateStartRoomData(value, selectOption.id);
        return;
      }
      sceneState.updateStartRoomData(value, 44013);
      break;

    case "moduleTop":
      if (selectOption.global) {
        sceneState.updateDefaultData(value, selectOption.id);
        return;
      }
      sceneState.updateDefaultData(value, null);
      break;

    case "moduleBottom":
      if (selectOption.global) {
        sceneState.updateDefaultData(value, selectOption.id);
        return;
      }
      sceneState.updateDefaultData(value, null);
      break;
  }
};

const selectOption = (value: TTextureItem) => {
  console.log(currentOption.value, "currentOption.value");
  let data;
  switch (currentOption.value) {
    case "moduleTop":
    case "moduleBottom":
      data = { data: value, type: currentOption.value };
      break;
    default:
      data = value.ID;
      break;
  }

  if (currentOption.value) {
    eventBus.emit(
      optionsType.value[currentOption.value as keyof TTextureActionMap],
      data
    );
    globalOptions.value![currentOption.value as keyof TTextureActionMap].id =
      value.ID;
    menuStore.updateOption(currentOption.value, value.ID);
  }
};

const getOptionImg = computed(() => {
  return (id: number | string, type: string) => {
    let result;
    switch (type) {
      case "wall":
        result = roomState.getWallsTextures()[id].PREVIEW_PICTURE;
        break;
      case "floor":
        result = roomState.getFloorTextures()[id].PREVIEW_PICTURE;
        break;
      case "moduleTop":
        result = roomState.getDefaultModuleData()[id].PREVIEW_PICTURE;
        break;
      case "moduleBottom":
        result = roomState.getDefaultModuleData()[id].PREVIEW_PICTURE;
        break;
    }
    return result;
  };
});

const roomsList = computed(() => {
  return roomState.getRooms;
});

const getCurrentRoom = computed(() => {
  return (id: number) => {
    if (!roomState.getCurrentRoomId) return;
    return {
      // "btn-active": id === roomState.getCurrentRoomId.id,
      active: id === roomState.getCurrentRoomId.id,
    };
  };
});

const getCurrentRedactor = computed(() => {
  return currentOption.value?.includes("fasads");
});

watch(
  () => pointLight.value,
  () => {
    changePointLightPower(pointLight.value);
    sceneState.setLightRange("pointLight", pointLight.value);
  }
);

watch(
  () => ambientLight.value,
  () => {
    changeAmbientLightPower(ambientLight.value);
    console.log(ambientLight.value);
  }
);

watch(refraction, () => {
  sceneState.setRefractionValue(refraction.value);
  toggleRefraction(refraction.value);
});

watch(shadows, () => {
  sceneState.setShadowValue(shadows.value);
  toggleShadow(shadows.value);
});
</script>

<template>
  <div class="room" ref="roomRef">
    <div class="room-popup">
      <h1 class="popup__title">Параметры помещения</h1>
      <ClosePopUpButton class="menu__close" @close="closeMenu('roomPar')" />

      <div class="room-popup__container">
        <div class="room-select">
          <div v-for="(room, key) in roomsList" :key="key">
            <div class="room-select__item">
              <button
                :class="[
                  'button__filled button__filled--text',
                  getCurrentRoom(room.id),
                ]"
                @click="loadRoom(room.id)"
              >
                <span> {{ room.label }}</span>
              </button>
              <button class="button__filled" @click="deliteRoom(room.id)">
                <span class="icon icon-garbage"></span>
              </button>
            </div>
          </div>
        </div>
        <div class="room-options">
          <div
            v-for="(item, key) in globalOptions"
            :key="key"
            class="option-small"
          >
            <div class="option-label" @click="getOption(key, item.title)">
              <img
                class="label__img"
                :src="_URL + getOptionImg(item.id, key)"
                alt=""
              />

              <p class="label__text">{{ item.title }}</p>
            </div>
            <div class="option__checkbox">
              <label class="control control-checkbox">
                <input
                  type="checkbox"
                  :checked="item.global"
                  @change="totalSelect($event, key)"
                />
                <span class="control_indicator"></span>
                <span class="text-lg text-gray-800 font-medium">{{
                  item.label
                }}</span>
              </label>
            </div>
          </div>
          <!-- <div v-for="(item, index) in 2" :key="index" class="option-standart">
            <div class="select-group">
              <div class="option-label">
                <div class="label__image"></div>
                <p class="label__text">Оформление стен</p>
              </div>
              <div class="option-label">
                <div class="label__image"></div>
                <p class="label__text">Оформление стен</p>
              </div>
            </div>
            <div class="option__checkbox">
              <input type="checkbox" name="" id="1" />
              <label for="1">Для всех комнат</label>
            </div>
          </div> -->
        </div>
        <h3 class="popup__title">Высота навесных модулей</h3>
        <div class="room-modheight">
          <!-- Добавить валидацию -->
          <MainInput
            v-model="clampHeight"
            :min="500"
            :max="3000"
            class="input__search"
            type="number"
            placeholder="3000"
          />
          <MainButton
            :className="'red__button right-menu'"
            @click="changeHeightClamp"
            >Применить</MainButton
          >
        </div>
        <div class="visual">
          <h3 class="visual__title">Свет и тени</h3>
          <div class="visual__contant">
            <div class="visual__top">
              <div class="visual__top--left">
                <Accordion>
                  <template #title>
                    <div class="label__container">
                      <p class="label__text label__text--xs">Качество теней</p>
                      <p class="label__text">{{ currentQuality.lable }}</p>
                    </div>
                  </template>
                  <template #params="{ onToggle }">
                    <ul class="accordion__contant">
                      <li
                        class="label__text"
                        v-for="(param, key) in quality"
                        :key="key"
                        @click="
                          () => {
                            changeQualit(param);
                            onToggle();
                          }
                        "
                      >
                        {{ param.lable }}
                      </li>
                    </ul>
                  </template>
                </Accordion>
              </div>
              <div class="visual__top--right visual__top--switch">
                <div class="switch__container">
                  <h4 class="label__text">Тени</h4>
                  <Toggle v-model="shadows" />
                </div>
                <div class="switch__container">
                  <h4 class="label__text">Отражение</h4>
                  <Toggle v-model="refraction" />
                </div>
              </div>
            </div>
            <div class="visual__bottom">
              <div class="visual__bottom--left">
                <RangeSlider
                  v-model="ambientLight"
                  :min="0"
                  :max="5"
                  :step="0.01"
                  :showValue="true"
                >
                  <template #title>
                    <p class="label__text">Основное освещение</p>
                  </template>
                </RangeSlider>
              </div>
              <div class="visual__bottom--right">
                <RangeSlider
                  v-model="pointLight"
                  :min="0"
                  :max="5"
                  :step="0.01"
                  :showValue="true"
                >
                  <template #title>
                    <p class="label__text">Направленное освещение</p>
                  </template>
                </RangeSlider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="slide--left" mode="out-in">
      <div class="color-select" v-if="optionsData" key="color-select">
        <h1 class="color__title">{{ currentOptionLable }}</h1>

        <SurfaceRedactor
          :materialList="optionsData"
          :tempWork="true"
          v-if="getCurrentRedactor"
        />

        <MaterialSelector
          :materials="optionsData"
          @select="selectOption"
          v-else
        />
      </div>
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
    // background: rgba($white, 0.6);
    background: rgba($white, 1);
    box-shadow: 0px 0px 10px 0px #3030301a;
    z-index: 1;
    border-radius: 15px;
    // backdrop-filter: blur(5px);

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

.option {
  &-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    border-radius: 15px;
    transition-property: background-color;
    transition-duration: 0.25s;
    transition-timing-function: ease;
    cursor: pointer;

    @media (hover: hover) {
      &:hover {
        .label__text {
          color: $black;
        }

        // background-color: $stroke;
      }
    }
  }

  &-small {
    flex: 46%;
    padding: 10px;
    border-radius: 15px;
    background-color: $bg;
  }

  &-standart {
    width: 100%;
    padding: 10px;
    border-radius: 15px;
    background-color: $bg;
  }

  &-standart {
    width: 100%;
    padding: 10px;
    border-radius: 15px;
    background-color: $bg;
  }
}

.color {
  &-select {
    position: absolute;
    left: 575px;
    width: 100%;
    max-width: 373px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    background: rgba($white, 1);
    // background: rgba($white, 0.6);
    box-shadow: 0px 0px 10px 0px #3030301a;
    z-index: -1;
    border-radius: 15px;
    // backdrop-filter: blur(5px);

    &__container {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      overflow: auto;
    }

    &-item {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 10px;
      background-color: $bg;
      border-radius: 15px;
      gap: 10px;

      &__title {
        font-size: 15px;
        font-weight: 500;
      }
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

    // @media (hover: hover) {
    //   &:hover {
    //     color: $black;
    //   }
    // }

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

.menu__close {
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
}

@media screen and (width <=1023px) {
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
