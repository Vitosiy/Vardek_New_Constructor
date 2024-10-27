<script setup lang="ts">
import { computed, ref } from "vue";

import PopUpOptionsMenu from "@/components/left-menu/option/PopUpOptionsMenu.vue";
import RoomOptionsMenu from "@/components/left-menu/option/RoomOptionsMenu.vue";

import S2DAppartSVG from "@/components/ui/svg/left-menu/S2DAppartSVG.vue";

import { useAppData } from "@/store/appliction/useAppData";
import { useMenuStore } from '@/store/appStore/useMenuStore';

import { useModelStore } from '@/store/appStore/useModelStore';

import MainSelect from "@/components/ui/selects/MainSelect.vue";


const store = useModelStore();
const menuStore = useMenuStore();

const catalogSectionsType = useAppData().getAppData.CATALOG.SECTIONS_TYPE;
const catalogSections = useAppData().getAppData.CATALOG.SECTIONS;

const selectedSectionType = ref<string>('standart');


const filteredCatalogSections = computed(() => {


  return Object.values(catalogSections).filter(item => item.TYPE === selectedSectionType.value);
});

const onDragStart = (modelId: string) => {
  store.selectModel(modelId);
};

const closeAllMenus = () => {
  menuStore.closeAllMenus();
};

const showTechMenu = (id: string, products: []) => {


  menuStore.openMenu('tech', id, products);
};

// Новое меню
const showRoomParMenu = () => {
  menuStore.openMenu('roomPar',);
};

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
          <!-- <div class="options-item">
            <ExamplesSVG class="options-item__image" />
            <p class="options-item__title">Шаблоны комнат</p>
            <div class="radial-sphere"></div>
          </div> -->
          <div class="goods-item" :class="{ active: menuStore.openMenus == 'roomPar' }" @click="showRoomParMenu">
            <S2DAppartSVG class="goods-item__image" />
            <p class="goods-item__title">Параметры помещения</p>
            <div class="radial-sphere"></div>
          </div>
        </div>
      </div>

      <div class="options-design">
        <h1 class="options__title">Товары</h1>
        <MainSelect v-model="selectedSectionType" :options="catalogSectionsType" @change="closeAllMenus" />
        <div class="goods">
          <div v-for="(item, index) in filteredCatalogSections" :key="index" class="goods-item"
            :class="{ active: menuStore.openMenus == 'tech' && item.ID === menuStore.menuContentsByID }"
            @click="showTechMenu(item.ID, item.PRODUCTS)">

            <S2DAppartSVG class="goods-item__image" />
            <p class="goods-item__title">{{ item.NAME }}</p>
            <div class="radial-sphere"></div>
          </div>
        </div>
      </div>
      <PopUpOptionsMenu />
      <RoomOptionsMenu />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.options {
  width: 315px;
  flex-shrink: 0;
  height: 100%;
  border-right: 1px solid $light-stroke;
  background: #f6f5fa;
  transform-style: preserve-3d;
  z-index: 1;
  &__container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 20px;
    position: relative;
    transform-style: preserve-3d;

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
        max-height: 40vh;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;

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
}
</style>
