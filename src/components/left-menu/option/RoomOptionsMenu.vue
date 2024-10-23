<script setup lang="ts">

import MainInput from "@/components/ui/inputs/MainInput.vue";
import MainButton from "@/components/ui/buttons/MainButton.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";

import { useSceneState } from "@/store/appliction/useSceneState";
import { useEventBus } from "@/store/appliction/useEventBus";
import customInput from "@/components/ui/inputs/customInput.vue";

const eventBus = useEventBus();
const startData = useSceneState()

const isPopUpOpen = ref(false);
const clampHeight = ref<number>(startData.getStartHeightClamp);

import { ref } from "vue";

import { useMenuStore } from '@/store/appStore/useMenuStore';

const menuStore = useMenuStore();


const closeMenu = (menuType) => {

  menuStore.closeMenu(menuType);
};

const changeHeightClamp = () => {
    eventBus.emit("A:Height-clamp", clampHeight.value);
};

</script>

<template>
  <div class="room" :class="{ active: menuStore.openMenus == 'roomPar' }">
    <div class="room-popup">
      <h1 class="popup__title">Параметры помещения</h1>
      <ClosePopUpButton class="menu__close" @close="closeMenu('roomPar')" />

      <div class="room-popup__container">
        <div class="room-select">
          <MainButton :className="'red__button right-menu'" @click="">Кухня</MainButton>
          <MainButton :className="'grey__button right-menu'" @click="">Коридор</MainButton>
        </div>
        <div class="room-options">
          <div v-for="(item, index) in 6" :key="index" class="option-small">
            <div class="option-label">
              <div class="label__image">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="60" height="60" rx="15" fill="white" />
                  <g clip-path="url(#clip0_455_30589)">
                    <path
                      d="M35.8334 30.0003C35.8334 30.4606 35.4603 30.8337 35.0001 30.8337H30.8334V35.0003C30.8334 35.4606 30.4603 35.8337 30.0001 35.8337C29.5398 35.8337 29.1667 35.4606 29.1667 35.0003V30.8337H25.0001C24.5398 30.8337 24.1667 30.4606 24.1667 30.0003C24.1667 29.5401 24.5398 29.167 25.0001 29.167H29.1667V25.0003C29.1667 24.5401 29.5398 24.167 30.0001 24.167C30.4603 24.167 30.8334 24.5401 30.8334 25.0003V29.167H35.0001C35.4603 29.167 35.8334 29.5401 35.8334 30.0003Z"
                      fill="#A3A9B5" />
                  </g>
                  <defs>
                    <clipPath id="clip0_455_30589">
                      <rect width="20" height="20" fill="white" transform="translate(20 20)" />
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
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="15" fill="white" />
                    <g clip-path="url(#clip0_455_30589)">
                      <path
                        d="M35.8334 30.0003C35.8334 30.4606 35.4603 30.8337 35.0001 30.8337H30.8334V35.0003C30.8334 35.4606 30.4603 35.8337 30.0001 35.8337C29.5398 35.8337 29.1667 35.4606 29.1667 35.0003V30.8337H25.0001C24.5398 30.8337 24.1667 30.4606 24.1667 30.0003C24.1667 29.5401 24.5398 29.167 25.0001 29.167H29.1667V25.0003C29.1667 24.5401 29.5398 24.167 30.0001 24.167C30.4603 24.167 30.8334 24.5401 30.8334 25.0003V29.167H35.0001C35.4603 29.167 35.8334 29.5401 35.8334 30.0003Z"
                        fill="#A3A9B5" />
                    </g>
                    <defs>
                      <clipPath id="clip0_455_30589">
                        <rect width="20" height="20" fill="white" transform="translate(20 20)" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <p class="label__text">Оформление стен</p>
              </div>
              <div class="option-label">
                <div class="label__image">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="15" fill="white" />
                    <g clip-path="url(#clip0_455_30589)">
                      <path
                        d="M35.8334 30.0003C35.8334 30.4606 35.4603 30.8337 35.0001 30.8337H30.8334V35.0003C30.8334 35.4606 30.4603 35.8337 30.0001 35.8337C29.5398 35.8337 29.1667 35.4606 29.1667 35.0003V30.8337H25.0001C24.5398 30.8337 24.1667 30.4606 24.1667 30.0003C24.1667 29.5401 24.5398 29.167 25.0001 29.167H29.1667V25.0003C29.1667 24.5401 29.5398 24.167 30.0001 24.167C30.4603 24.167 30.8334 24.5401 30.8334 25.0003V29.167H35.0001C35.4603 29.167 35.8334 29.5401 35.8334 30.0003Z"
                        fill="#A3A9B5" />
                    </g>
                    <defs>
                      <clipPath id="clip0_455_30589">
                        <rect width="20" height="20" fill="white" transform="translate(20 20)" />
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
        <h1 class="popup__title">Высота навесных модулей</h1>
        <div class="room-modheight">
          <!-- Добавить валидацию -->
          <MainInput v-model="clampHeight" :min="1000" :max="2000" class="input__search" type="number" placeholder="2000" />
          <MainButton :className="'red__button right-menu'" @click="changeHeightClamp">Применить</MainButton>
        </div>

      </div>
    </div>
    <div class="color-select" :class="{ active: isPopUpOpen == true }">
      <h1 class="color__title">Цвет стен</h1>
      <MainInput class="input__search" v-model="text" type="text" placeholder="Поиск..." />

      <div class="color-select__container">
        <div v-for="(item, index) in 7" :key="index" class="color-item">
          <img src="@/assets/img/right-menu/bg.png" />
          <p class="color-item__title">Светло-серый</p>
        </div>
      </div>
    </div>
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

      .room-select {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 10px 0;
        border-top: 1px solid $stroke;
        border-bottom: 1px solid $stroke;
      }

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

            .label__image {
              display: flex;
            }

            .label__text {
              font-size: 15px;
              font-weight: 600;
              color: $strong-grey;
            }
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
</style>