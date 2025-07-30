<script setup lang="ts">
/**/ / @ts-nocheck 31 */;
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

import { TQuality } from "@/types/types";

import { START_PROJECT_PARAMS } from "@/Application/F-startData";

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

const eventBus = useEventBus();
const sceneState = useSceneState();
const rooms = useRoomState();
const menuStore = useMenuStore();

const isPopUpOpen = ref(false);
const clampHeight = ref<number>(sceneState.getStartHeightClamp);
const quality = START_PROJECT_PARAMS.quality as TQuality[];
const currentQuality = ref<TQuality>(quality[1]);
const pointLight = ref<number>(1);
const ambientLight = ref<number>(1);
const shadows = ref<boolean>(false);
const refraction = ref<boolean>(false);

onMounted(() => {
  shadows.value = sceneState.getShadowValue;
  refraction.value = sceneState.getRefractionValue;
});

// onBeforeUnmount(() => {
//   sceneState.setRefractionValue(refraction.value);
//   sceneState.setShadowValue(refraction.value);
// });

const closeMenu = (menuType) => {
  menuStore.closeMenu(menuType);
};

const changeHeightClamp = () => {
  eventBus.emit("A:Height-clamp", clampHeight.value);
};

const loadRoom = (id: number) => {
  console.log(id);
  eventBus.emit("A:Load", id);
  eventBus.emit("A:ContantLoaded", false);
  closeMenu("roomPar");
};

const changeQualit = (data: TQuality) => {
  currentQuality.value = data;
  console.log(data.value);
  eventBus.emit("A:Quality", data.value);
};

const getCurrentRoom = computed(() => {
  return (id: number) => {
    if (!rooms.getCurrentRoomId) return;
    return {
      "btn-active": id === rooms.getCurrentRoomId.id,
    };
  };
});

const changePointLightPower = (value: number) => {
  eventBus.emit("A:ChangePointLightPower", value);
};

const changeAmbientLightPower = (value: number) => {
  eventBus.emit("A:ChangeAmbientLightPower", value);
};

const toggleShadow = (value: boolean) => {
  eventBus.emit("A:ToggleShadow", value);
};

const toggleRefraction = (value: boolean) => {
  eventBus.emit("A:ToggleRefraction", value);
};

watch(
  () => pointLight.value,
  () => {
    changePointLightPower(pointLight.value);
    console.log(pointLight.value);
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

let text = "garage"; // TODO Временная заглушка. Валятся ошибки. Позже разобраться что требуется
</script>

<template>
  <div class="room" :class="{ active: menuStore.openMenus == 'roomPar' }">
    <div class="room-popup">
      <h1 class="popup__title">Параметры помещения</h1>
      <ClosePopUpButton class="menu__close" @close="closeMenu('roomPar')" />

      <div class="room-popup__container">
        <div class="room-select">
          <MainButton
            v-for="(room, key) in rooms.getRooms"
            :key="key"
            :value="room.id"
            @click="loadRoom(room.id)"
            :class="[getCurrentRoom(room.id)]"
          >
            {{ room.label }}</MainButton
          >
        </div>
        <div class="room-options">
          <div v-for="(item, index) in 6" :key="index" class="option-small">
            <div class="option-label">
              <div class="label__image">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="60" height="60" rx="15" fill="white" />
                  <g clip-path="url(#clip0_455_30589)">
                    <path
                      d="M35.8334 30.0003C35.8334 30.4606 35.4603 30.8337 35.0001 30.8337H30.8334V35.0003C30.8334 35.4606 30.4603 35.8337 30.0001 35.8337C29.5398 35.8337 29.1667 35.4606 29.1667 35.0003V30.8337H25.0001C24.5398 30.8337 24.1667 30.4606 24.1667 30.0003C24.1667 29.5401 24.5398 29.167 25.0001 29.167H29.1667V25.0003C29.1667 24.5401 29.5398 24.167 30.0001 24.167C30.4603 24.167 30.8334 24.5401 30.8334 25.0003V29.167H35.0001C35.4603 29.167 35.8334 29.5401 35.8334 30.0003Z"
                      fill="#A3A9B5"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_455_30589">
                      <rect
                        width="20"
                        height="20"
                        fill="white"
                        transform="translate(20 20)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <p class="label__text">Оформление стен</p>
            </div>
            <div class="option__checkbox">
              <input type="checkbox" name="" id="1" />
              <label for="1">Для всех комнат</label>
            </div>
          </div>
          <div v-for="(item, index) in 2" :key="index" class="option-standart">
            <div class="select-group">
              <div class="option-label">
                <div class="label__image">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="60" height="60" rx="15" fill="white" />
                    <g clip-path="url(#clip0_455_30589)">
                      <path
                        d="M35.8334 30.0003C35.8334 30.4606 35.4603 30.8337 35.0001 30.8337H30.8334V35.0003C30.8334 35.4606 30.4603 35.8337 30.0001 35.8337C29.5398 35.8337 29.1667 35.4606 29.1667 35.0003V30.8337H25.0001C24.5398 30.8337 24.1667 30.4606 24.1667 30.0003C24.1667 29.5401 24.5398 29.167 25.0001 29.167H29.1667V25.0003C29.1667 24.5401 29.5398 24.167 30.0001 24.167C30.4603 24.167 30.8334 24.5401 30.8334 25.0003V29.167H35.0001C35.4603 29.167 35.8334 29.5401 35.8334 30.0003Z"
                        fill="#A3A9B5"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_455_30589">
                        <rect
                          width="20"
                          height="20"
                          fill="white"
                          transform="translate(20 20)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <p class="label__text">Оформление стен</p>
              </div>
              <div class="option-label">
                <div class="label__image">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="60" height="60" rx="15" fill="white" />
                    <g clip-path="url(#clip0_455_30589)">
                      <path
                        d="M35.8334 30.0003C35.8334 30.4606 35.4603 30.8337 35.0001 30.8337H30.8334V35.0003C30.8334 35.4606 30.4603 35.8337 30.0001 35.8337C29.5398 35.8337 29.1667 35.4606 29.1667 35.0003V30.8337H25.0001C24.5398 30.8337 24.1667 30.4606 24.1667 30.0003C24.1667 29.5401 24.5398 29.167 25.0001 29.167H29.1667V25.0003C29.1667 24.5401 29.5398 24.167 30.0001 24.167C30.4603 24.167 30.8334 24.5401 30.8334 25.0003V29.167H35.0001C35.4603 29.167 35.8334 29.5401 35.8334 30.0003Z"
                        fill="#A3A9B5"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_455_30589">
                        <rect
                          width="20"
                          height="20"
                          fill="white"
                          transform="translate(20 20)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <p class="label__text">Оформление стен</p>
              </div>
            </div>
            <div class="option__checkbox">
              <input type="checkbox" name="" id="1" />
              <label for="1">Для всех комнат</label>
            </div>
          </div>
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
    <!-- <div class="color-select" :class="{ active: isPopUpOpen == true }">
      <h1 class="color__title">Цвет стен</h1>
      <MainInput
        class="input__search"
        v-model="text"
        type="text"
        placeholder="Поиск..."
      />

      <div class="color-select__container">
        <div v-for="(item, index) in 7" :key="index" class="color-item">
          <img src="@/assets/img/right-menu/bg.png" />
          <p class="color-item__title">Светло-серый</p>
        </div>
      </div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
.room {
  display: flex;
  gap: 15px;
  position: absolute;
  top: 15px;
  left: -840px;
  transform: translateZ(-10px);
  transition: 0.5s ease-in-out;

  .room-popup {
    width: 570px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: relative;
    padding: 15px;
    background: $white;
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

      .room-options {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;

        .option-small {
          flex: 46%;
          padding: 10px;
          border-radius: 15px;
          background-color: $bg;

          .option-label {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
          }

          .option__checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }

        .option-standart {
          width: 100%;
          padding: 10px;
          border-radius: 15px;
          background-color: $bg;

          .select-group {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .option-label {
              width: 100%;
              max-width: 262.5px;
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 10px;

              .label__image {
                display: flex;
              }

              .label__text {
                font-size: 15px;
                font-weight: 600;
                color: $strong-grey;
              }
            }
          }

          .option__checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }

      .room-modheight {
        display: flex;
        align-items: center;
        gap: 15px;
      }
    }

    &.active {
      left: 330px;
    }
  }

  .color-select {
    width: 373px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    background: $white;
    box-shadow: 0px 0px 10px 0px #3030301a;
    z-index: 1;
    border-radius: 15px;
    transition: 0.5s ease-in-out;

    .menu__close {
      position: absolute;
      right: 15px;
      top: 15px;
      cursor: pointer;
    }

    &__container {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      overflow: auto;

      .color-item {
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

  &.active {
    left: 330px;
  }
}

.room-select {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  padding: 10px 0;
  border-top: 1px solid $stroke;
  border-bottom: 1px solid $stroke;
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

.switch {
  &__container {
  }
}

.label {
  &__container {
    display: flex;
    flex-direction: column;
    pointer-events: none;
  }
  &__image {
    display: flex;
  }
  &__text {
    font-size: 15px;
    font-weight: 600;
    color: $strong-grey;
    cursor: pointer;
    transition-property: color;
    transition-duration: 0.25s;
    transition-timing-function: ease;

    @media (hover: hover) {
      &:hover {
        color: $black;
      }
    }

    &--xs {
      color: $dark-grey;
      font-size: clamp(9px, 0.78125vw + 1px, 14px) !important;
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
