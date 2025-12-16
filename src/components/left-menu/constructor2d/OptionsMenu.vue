<script setup lang="ts">
//@ts-nocheck
import { 
  ref,
  computed,
  onMounted,
  onUnmounted
} from 'vue'
// import { MathUtils } from "three";
import S2DAppartSVG from "@/components/ui/svg/left-menu/S2DAppartSVG.vue";
import RoomPlaneSVG from "@/components/ui/svg/left-menu/RoomPlaneSVG.vue";

import { useC2DLeftMenuStore } from "@/store/constructor2d/store/useLeftMenuStore";
import { catalogSections } from '@/store/constructor2d/data/useCatalogSectionsData';
import RoomManager from '../roomManager/RoomManager.vue';

import { usePopupStore } from "@/store/appStore/popUpsStore";
import CatalogSVG from '@/components/ui/svg/CatalogSVG.vue';
  
const popupStore = usePopupStore();

// Локальное состояние для открытия/закрытия меню "Параметры помещения" в 2D
const isRoomParamsOpen = ref(false);

const toggleRoomParams = () => {
  isRoomParamsOpen.value = !isRoomParamsOpen.value;
};

const constructor2dMenu = useC2DLeftMenuStore();

const menuItemActive = ref<string | null>(null);
const goodItemActive = ref<string | null>(null);

// Получаем секции "Двери" и "Окна"
const doorSection = computed(() => {
  return catalogSections.find((el) => el.nameMode === 'door');
});

const windowSection = computed(() => {
  return catalogSections.find((el) => el.nameMode === 'window');
});

// Объединяем товары из обеих секций
const doorsAndWindowsGoods = computed(() => {
  const goods = [];
  if (doorSection.value?.goods) {
    goods.push(...doorSection.value.goods);
  }
  if (windowSection.value?.goods) {
    goods.push(...windowSection.value.goods);
  }
  return goods;
});

let img = new Image();
img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

// Функция для обработки кликов по элементам товаров
let handleGoodClick = (event: Event) => {
  const target = (event.target as HTMLElement).closest('.goods-item'); // Ищем ближайший родительский .goods-item
  if (target) {
    const id = target.dataset.id;

    menuItemActive.value = menuItemActive.value === id ? null : id;
    goodItemActive.value = null;

    const activeSection = catalogSections.find((el) => el.id === menuItemActive.value);
    constructor2dMenu.setInteractionMode(activeSection?.nameMode || '');
  }
};

let goodItemDrag = (e: DragEvent): void => {
  const target = (e.target as HTMLElement).closest('.goods-list-item__icon'); // Ищем ближайший родительский .goods-list-item__icon
  if(target){
    const id = target.dataset.id;
    
    // Ищем товар во всех секциях каталога по id
    let item = null;
    for (const section of catalogSections) {
      item = section.goods?.find((el) => el.id === id);
      if (item) break;
    }

    if (item) {
      // Если товар найден, выполняются следующие действия:
      // Устанавливаем идентификатор текущего активного товара.
      goodItemActive.value = id;
      
      // Находим секцию, к которой принадлежит товар
      const section = catalogSections.find(s => s.goods?.some(g => g.id === id));
      
      // Устанавливаем режим взаимодействия для секции
      if (section) {
        constructor2dMenu.setInteractionMode(section.nameMode);
      }
      
      // Вызываем метод `setGoodActive`, чтобы отметить товар активным в меню конструктора.
      constructor2dMenu.setGoodActive(item.nameMode);
      
      // Настраиваем данные для перетаскивания (drag-and-drop).
      e.dataTransfer?.setData('good', item.nameMode); // Передаём имя модели товара.
      e.dataTransfer.setDragImage(img, 0, 0);
    }
  }
}

// если добавляется компонент в DOM
onMounted(() => {

  document.addEventListener('click', handleGoodClick);
  document.addEventListener('dragstart', goodItemDrag);
  
});

// если удаляется компонент из DOM
onUnmounted(() => {

  document.removeEventListener('click', handleGoodClick);
  document.removeEventListener('dragstart', goodItemDrag);
  handleGoodClick = null;
  goodItemDrag = null;
  img = null;
  constructor2dMenu.setInteractionMode(''); // Сброс режима взаимодействия
  constructor2dMenu.setGoodActive(''); // Сброс активного товара
  
});

const openPopup = (popupName: keyof typeof popupStore.popups) => {
  popupStore.openPopup(popupName);
};


</script>

<template>
  <section class="options">
    <div class="options__container">
      <div class="options-design">
        <h1 class="options__title">Проектирование</h1>
        <div class="goods">
          <div
            class="goods-item"
            :class="{ active: isRoomParamsOpen }"
            @click="toggleRoomParams"
          >
            <S2DAppartSVG class="goods-item__image" />
            <p class="goods-item__title">Параметры помещения</p>
            <div class="radial-sphere"></div>
          </div>
        </div>
      </div>

      <div class="options-design">
        <!-- <h1 class="options__title">Товары</h1>
        <div class="goods-items" @click="openPopup('catalog')">
          <CatalogSVG class="goods-items__image" />
          <p class="goods-items__title">Общий каталог</p>
          <div class="radial-sphere"></div>
        </div> -->
        <!-- Отображаем содержимое вкладок Двери и Окна -->
        <div class="goods-list">
          <div 
            class="goods-list-item" 
            v-for="(gItem, i) in doorsAndWindowsGoods" 
            :key="gItem.id || i">
            <div 
              class="goods-list-item__icon" 
              :class="gItem.id === goodItemActive ? 'active' : ''"
              draggable="true" 
              :data-id="gItem.id">
              <img v-if="gItem.icon !== ''" :src="`/images/${gItem.icon}`">
            </div>
            <p>{{ gItem.name }}</p>
          </div>
        </div>
      </div>

      <transition name="slide--left">
        <div class="room" v-if="isRoomParamsOpen">
          <div class="room-popup">
            <h1 class="popup__title">Параметры помещения</h1>
            <ul>
              <li v-for="n in 20" :key="n">
                {{ n }}
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.options {
  width: 300px;
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
    // transform-style: preserve-3d;

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
        max-height: 30vh;
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
      }

      // Стили для .goods-list на уровне .options-design (для прямого размещения вне .goods)
      .goods-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding-top: 0px;
        gap: 8px;

        &-item{
          margin-right: 4px;
          margin-bottom: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;

          &__icon{
            width: 120px;
            height: 120px;
            border: 1px solid #A3A9B5;
            border-radius: 10px;
            background-color: #ffffff;
            overflow: hidden;
            transition: border-color 0.15s;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          &__icon.active{
            border: 1px solid #DA444C;
          }

          &:hover{
            cursor: pointer;
          }

          p {
            font-size: 12px;
            text-align: center;
            margin: 0;
          }
        }

        &.d-none {
          display: none;
        }
      }
    }



    .room {
      display: flex;
      gap: 15px;
      position: absolute;
      top: 15px;
      left: 310px; // стартовая позиция, как в 3D-меню
      // transform: translateZ(-10px);
      // transition: 0.5s ease-in-out; // анимация теперь через <transition>

      .room-popup {
        width: 570px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        position: relative;
        padding: 15px;
        background: $red;
        box-shadow: 0px 0px 10px 0px #3030301a;
        z-index: 1;
        border-radius: 15px;
      }
    }
  }
}

.goods-items {
  min-height: 50px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 0 15px;
  cursor: pointer;
  transition: 0.15s ease-in-out;
  margin-bottom: 1rem;

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

</style>