<script setup lang="ts">
import { ref } from 'vue'
import { MathUtils } from "three";
import S2DAppartSVG from "@/components/ui/svg/left-menu/S2DAppartSVG.vue";
import RoomPlaneSVG from "@/components/ui/svg/left-menu/RoomPlaneSVG.vue";

import { useC2DLeftMenuStore    } from "@/store/constructor2d/store/useLeftMenuStore";
import { catalogSections, pathD } from '@/store/constructor2d/data/useCatalogSectionsData';

const constructor2dMenu = useC2DLeftMenuStore();

const menuItemActive = ref<string | null>(null);
const goodItemActive = ref<string | null>(null);

function handleClick(id: string): void {
  
  menuItemActive.value = menuItemActive.value === id ? null : id;
  goodItemActive.value = null;

  const activeSection = catalogSections.find((el) => el.id === menuItemActive.value);
  constructor2dMenu.setInteractionMode(activeSection?.nameMode || '');
  
}

function goodItemDrag(e: DragEvent, id: string): void {
  // Функция обрабатывает клик по элементу товара в каталоге.
  // Принимает два параметра:
  // - e: объект события DragEvent (например, для перетаскивания элемента);
  // - id: строка, идентификатор товара.
  
  // Находим текущую активную секцию каталога по её id, хранимом в menuItemActive.
  const section = catalogSections.find((el) => el.id === menuItemActive.value);
  
  // В найденной секции ищем товар с заданным идентификатором id.
  const item = section?.goods?.find((el) => el.id === id);

  if (item) {
    // Если товар найден, выполняются следующие действия:
    // Устанавливаем идентификатор текущего активного товара.
    goodItemActive.value = id;
    
    // Вызываем метод `setGoodActive`, чтобы отметить товар активным в меню конструктора.
    constructor2dMenu.setGoodActive(item.nameMode);
    
    // Настраиваем данные для перетаскивания (drag-and-drop).
    e.dataTransfer?.setData('good', item.nameMode); // Передаём имя модели товара.
    e.dataTransfer.effectAllowed = 'move';         // Указываем, что элемент можно перемещать.
  }
}

</script>

<template>
  <section class="options">
    <div class="options__container">

      <div class="options-design">
        <h1 class="options__title">Проектирование</h1>
        <div class="goods">
          
          <div class="goods-item active">
            <S2DAppartSVG class="goods-item__image" />
            <p class="goods-item__title">2D квартира</p>
            <div class="radial-sphere"></div>
          </div>
          
          <div class="goods-item">
            <RoomPlaneSVG class="goods-item__image" />
            <p class="goods-item__title">Шаблоны комнат</p>
            <div class="radial-sphere"></div>
          </div>

        </div>
      </div>

      <div class="options-design">
        <h1 class="options__title">Товары</h1>
        <div class="goods">
          <div v-for="(item, index) in catalogSections">
            <div :key="index" 
              class="goods-item" 
              :class="item.id === menuItemActive ? 'active' : ''" 
              @click="handleClick(item.id)">
              <div class="goods-item__image">
                <svg :width="item.icon.width" :height="item.icon.height" :viewBox="item.icon.viewBox" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" :d="item.icon.d" fill="#5D6069"/>
                </svg>
              </div>
              <p class="goods-item__title">{{ item.name }}</p>
              <div class="radial-sphere"></div>
            </div>
            <div class="goods-list"
              :class="item.id === menuItemActive ? '' : 'd-none'">
              <div class="goods-list-item" v-if="item.goods" v-for="(gItem, i) in item.goods" :key="i">
                <div class="goods-list-item__icon" 
                  :class="gItem.id === goodItemActive ? 'active' : ''"
                  draggable="true" @dragstart="goodItemDrag($event, gItem.id)">
                  <img v-if="gItem.icon !== ''" :src="'./src/assets/img/'+gItem.icon">
                </div>
                <p>{{ gItem.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
  -webkit-user-select: none; /* Safari и старые версии Chrome */
  -moz-user-select: none;    /* Firefox */
  -ms-user-select: none;     /* Internet Explorer 10+ */
  user-select: none;  
  
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
        max-height: 70vh;
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
            
            .goods-item__image {
              svg {
                path {
                  fill: #ffffff;
                }
              }
            }
            
          }
          
        }

        .goods-list {

          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          padding-top: 10px;

          &-item{

            margin-right: 4px;
            margin-bottom: 4px;

            &__icon{
              width: 83px;
              height: 83px;
              border: 1px solid #A3A9B5; //#DA444C;
              border-radius: 10px;
              background-color: #ffffff;
              overflow: hidden;

              img {
                width: 100%;
                height: 100%;
              }
              
            }

            &__icon.active{
              border: 1px solid #DA444C;
            }

            &:hover{
              cursor: pointer;
            }
 
          }

          &.d-none {
            display: none;
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