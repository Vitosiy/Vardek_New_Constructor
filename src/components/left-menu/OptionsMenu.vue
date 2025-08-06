<script setup lang="ts">
/**/ / @ts-nocheck 31 */;

import { computed, ref, onMounted, toRaw } from "vue";

import { useAppData } from "@/store/appliction/useAppData";
import { useMenuStore } from "@/store/appStore/useMenuStore";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useModelStore } from "@/store/appStore/useModelStore";
import { useCustomiserStore } from "@/store/appStore/useCustomiserStore";

import PopUpOptionsMenu from "@/components/left-menu/option/PopUpOptionsMenu.vue";
import RoomOptionsMenu from "@/components/left-menu/option/RoomOptionsMenu.vue";
import S2DAppartSVG from "@/components/ui/svg/left-menu/S2DAppartSVG.vue";
import MainSelect from "@/components/ui/selects/MainSelect.vue";
import MainButton from "../ui/buttons/MainButton.vue";

const controlBtn = [
  { icon: "icon-t-45-l", size: "20", fontSize: 10, action: 0 },
  { icon: "icon-t-90", size: "25", fontSize: 10, action: 1 },
  { icon: "icon-t-45-r", size: "20", fontSize: 10, action: 2 },
  { icon: "icon-l-90", size: "25", fontSize: 15, action: 3 },
  { icon: "icon-centered", size: "25", fontSize: 25, action: 4 },
  { icon: "icon-r-90", size: "25", fontSize: 15, action: 5 },
  { icon: "icon-b-45-l", size: "20", fontSize: 10, action: 6 },
  { icon: "icon-b-90", size: "25", fontSize: 10, action: 7 },
  { icon: "icon-b-45-r", size: "20", fontSize: 10, action: 8 },
];

const eventBus = useEventBus();
const store = useModelStore();
const menuStore = useMenuStore();
const customiserStore = useCustomiserStore();

const catalogSectionsType = useAppData().getAppData.CATALOG.SECTIONS_TYPE;
const catalogSections = useAppData().getAppData.CATALOG.SECTIONS;

const selectedSectionType = ref<string>("standart");
const cameraBtn = ref<InstanceType<typeof MainButton>[]>([]);
const roomOptionsRef = ref<HTMLElement | null>(null);

const filteredCatalogSections = computed(() => {
  return Object.values(catalogSections).filter(
    (item) => item.TYPE === selectedSectionType.value
  );
});

const onDragStart = (modelId: string) => {
  store.selectModel(modelId);
};

const closeAllMenus = () => {
  menuStore.closeAllMenus();
};

const showTechMenu = (id: string, products: []) => {
  menuStore.openMenu("tech", id, products);
  customiserStore.hideCustomiserPopup();
  // customiserStore.toggleCustomiserPopup();
  //  eventBus.emit("A:Selected", null)
};

// Новое меню
const showRoomParMenu = () => {
  menuStore.openMenu("roomPar");
};

const changeCameraPos = (value: number) => {
  eventBus.emit("A:ChangeCameraPos", value);
};

onMounted(() => {
  cameraBtn.value.forEach((el, key) => {
    el.style.setProperty("--value", `${controlBtn[key].size}px`);
    el.style.setProperty("--font", `${controlBtn[key].fontSize}px`);
  });
});
</script>

<template>
  <section class="options">
    <div class="options__container">
      <div class="options-design">
        <h1 class="options__title">Проектирование</h1>
        <div class="goods">
          <div class="goods-item">
            <S2DAppartSVG class="goods-item__image" />
            <p class="goods-item__title">2D квартира</p>
            <div class="radial-sphere"></div>
          </div>

          <div
            class="goods-item"
            :class="{ active: menuStore.openMenus == 'roomPar' }"
            @click="showRoomParMenu"
          >
            <S2DAppartSVG class="goods-item__image" />
            <p class="goods-item__title">Параметры помещения</p>
            <div class="radial-sphere"></div>
          </div>
        </div>
      </div>

      <div class="options-design">
        <h1 class="options__title">Товары</h1>
        <MainSelect
          v-model="selectedSectionType"
          :options="catalogSectionsType"
          @change="closeAllMenus"
        />
        <div class="goods">
          <div
            v-for="(item, index) in filteredCatalogSections"
            :key="index"
            class="goods-item"
            :class="{
              active:
                menuStore.openMenus == 'tech' &&
                item.ID === menuStore.menuContentsByID,
            }"
            @click="showTechMenu(item.ID, item.PRODUCTS)"
          >
            <S2DAppartSVG class="goods-item__image" />
            <p class="goods-item__title">{{ item.NAME }}</p>
            <div class="radial-sphere"></div>
          </div>
        </div>
      </div>
    </div>
    <transition name="slide--left">
      <PopUpOptionsMenu v-if="menuStore.openMenus == 'tech'" />
    </transition>
    <transition name="slide--left">
      <RoomOptionsMenu
        v-if="menuStore.openMenus == 'roomPar'"
        ref="roomOptionsRef"
      />
    </transition>
    <div class="options__camera">
      <h1 class="options__title">Позиция камеры</h1>
      <div class="options__camera--container">
        <div class="options__camera--items">
          <div v-for="(btn, key) in controlBtn" :key="key">
            <button
              :className="'button__rounded'"
              ref="cameraBtn"
              @click="changeCameraPos(btn.action)"
            >
              <div :class="['icon', btn.icon]"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.options {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 315px;
  height: 100%;
  border-right: 1px solid $light-stroke;
  background-color: $bg;
  // transform-style: preserve-3d;
  z-index: 1;
  &__container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 10px;
    position: relative;
    background: $bg;
    transform-style: preserve-3d;

    @media screen and (min-width: 1329px) {
      padding: 20px;
    }

    .options-design {
      z-index: 10;

      .options__title {
        margin-bottom: 10px;
      }

      .options-group {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .options-item {
          height: 50px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 25px;
          cursor: pointer;
          padding: 0 15px;

          &__title {
            z-index: 5;
            transition: 0.15s;
          }

          &__image {
            z-index: 5;
          }

          .radial-sphere {
            width: 100%;
            min-width: 50px;
            max-width: 50px;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 360px;
            background: $stroke;
            z-index: 1;
            transition: 0.15s;
          }

          &.active {
            .options-item__title {
              color: $white;
            }

            .radial-sphere {
              max-width: 300px;
              background: $red;
            }
          }
        }
      }

      .goods {
        max-height: 20vh;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;

        @media screen and (min-width: 1329px) {
          max-height: 30vh;
        }

        .goods-item {
          min-height: 50px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 25px;
          padding: 0 15px;
          cursor: pointer;
          transition: 0.15s ease-in-out;

          &__title {
            z-index: 5;
            transition: 0.15s;
          }

          &__image {
            z-index: 5;
          }

          .radial-sphere {
            width: 100%;
            min-width: 50px;
            max-width: 50px;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 360px;
            background: $stroke;
            z-index: 1;
            transition: 0.3s ease;
          }

          &.active {
            .goods-item__title {
              color: $white;
            }

            .radial-sphere {
              max-width: 300px;
              background: $red;
            }
          }
        }
      }
    }

    .room {
      display: flex;
      gap: 15px;
      position: absolute;
      top: 15px;
      left: 320px;
      // transform: translateZ(-10px);
      // transition: 0.5s ease-in-out;

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
          display: flex;
          flex-direction: column;
          gap: 15px;

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
  }
  &__camera {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px;
    margin-bottom: auto;
    background: $bg;

    transition-property: opacity, filter;
    transition-duration: 0.3s;
    transition-timing-function: ease;

    &--container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &--items {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      max-width: 170px;
    }
    &.active {
      pointer-events: all;
      opacity: 1;
      filter: blur(0);
    }

    @media screen and (min-width: 1329px) {
      padding: 20px;
    }
  }
}

.icon {
  font-size: var(--font);
}

.button {
  &__rounded {
    padding: var(--value);
  }
}
</style>
