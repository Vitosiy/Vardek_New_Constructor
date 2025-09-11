<script lang="ts" setup>

import { onMounted, onUnmounted, ref } from "vue";

import ModifyWall from "@/components/popUp/constructor2d/ModifyWall.vue";
import FormLabelRoom from "@/components/popUp/constructor2d/FormLabelRoom.vue";

import { use2DFacade } from '@/Constructor2D/use2DFacade';
import type { Vector2, WallType, ObjectType } from '@/Constructor2D/types';

// root container
const root2d = ref<HTMLElement>();
// canvas
const canvas2d = ref<HTMLCanvasElement>();

// Используем наш фасад
const {
  isInitialized,
  initialize,
  addWall,
  addObject,
  getInstance,
  isReady
} = use2DFacade();

const preventContextMenu = (e: Event) => e.preventDefault();

// Обработчик drag & drop с использованием фасада
const dropHandler = (event: DragEvent): void => {
  try {
    // Предотвращаем действие по умолчанию при перетаскивании
    event.preventDefault();
    
    // Извлечение данных из перетаскиваемого элемента
    const draggedData = event.dataTransfer?.getData("good");
    
    // Проверяем валидность данных и инициализацию фасада
    if (!draggedData) {
      console.warn("Нет данных в перетаскиваемом элементе.");
      return;
    }
    
    if (!isReady()) {
      console.error("Constructor2D не готов к работе.");
      return;
    }
    
    // Получаем координаты мыши при броске
    const pointerPosition: Vector2 = {
      x: event.offsetX,
      y: event.offsetY
    };

    // Используем методы фасада для добавления объектов
    if (draggedData === "wall" || draggedData === "wall_vertical" || draggedData === "dividing_wall") {
      // Добавляем стену через фасад
      const wallId = addWall(pointerPosition, draggedData as WallType);
      console.log(`Стена добавлена с ID: ${wallId}`);
    } else if (draggedData === "door" || draggedData === "window") {
      // Добавляем дверь или окно через фасад
      const objectId = addObject(pointerPosition, draggedData as ObjectType);
      console.log(`Объект добавлен с ID: ${objectId}`);
    } else {
      console.warn("Неизвестный тип перетаскиваемого объекта:", draggedData);
    }

  } catch (error) {
    console.error("Произошла ошибка в обработчике перетаскивания:", error);
  }
};

onMounted(async () => {
  try {
    if (root2d.value && canvas2d.value) {
      // Инициализируем Constructor2D через фасад
      await initialize(root2d.value, canvas2d.value);
      
      console.log("Constructor2D инициализирован через фасад:", isInitialized.value);

      // Добавляем обработчики событий
      if (canvas2d.value) {
        canvas2d.value.addEventListener('contextmenu', preventContextMenu);
        canvas2d.value.addEventListener('drop', dropHandler);
      }

      // Сохраняем ссылку на фасад в глобальную область для отладки
      // @ts-ignore
      window.C2DFacade = { 
        isInitialized, 
        isReady, 
        addWall, 
        addObject, 
        getInstance 
      };
    }
    
    // Безопасное скрытие loader
    const loader = document.querySelector('#main-loader');
    if (loader) {
      (loader as HTMLElement).style.display = 'none';
    }
  } catch (error) {
    console.error('Ошибка инициализации Constructor2D:', error);
  }
});

onUnmounted(() => {
  try {
    // Уничтожаем Constructor2D через фасад (автоматически вызывается в хуке)
    if (isInitialized.value) {
      console.log('Уничтожение Constructor2D через фасад');
    }

    // Удаляем обработчики событий
    if (canvas2d.value) {
      try {
        canvas2d.value.removeEventListener('drop', dropHandler);
        canvas2d.value.removeEventListener('contextmenu', preventContextMenu);
      } catch (error) {
        console.warn('Ошибка при удалении обработчиков событий:', error);
      }
    }

    // Очищаем глобальную ссылку
    // @ts-ignore
    if (window.C2DFacade) {
      // @ts-ignore
      delete window.C2DFacade;
    }
  } catch (error) {
    console.error('Ошибка при очистке компонента Constructor2D:', error);
  }
});

</script>

<style lang="scss" setup>
#app2D {
  position: relative;
  display: flex;
  width: 100%;
  overflow: hidden;

  #constructor2D{
    width: 100%;
    height: 100%;
  }
}
</style>

<template>
  <div ref="root2d" id="app2D">
    <canvas ref="canvas2d" id="constructor2D"
      @dragover.prevent @contextmenu.prevent></canvas>
    <ModifyWall />
    <FormLabelRoom />
  </div>
</template>