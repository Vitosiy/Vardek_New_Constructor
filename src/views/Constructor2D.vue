<script lang="ts" setup>

import { onMounted, onUnmounted, Ref, ref } from "vue";

import {
  Vector2,
} from "@/types/constructor2d/interfaсes";

import Constructor2D from '@/Constructor2D';

// root container
let root2d: Ref<HTMLElement | undefined> = ref();
// canvas
let canvas2d: Ref<HTMLCanvasElement | undefined> = ref();

document.oncontextmenu = document.body.oncontextmenu = function() {return false;};

let App2d: Constructor2D | null = null;

// Сохраняем ссылку на обработчик события
let dropHandler: ((event: DragEvent) => void) = (event: DragEvent): void => {
  try {
    // Предотвращаем действие по умолчанию при перетаскивании
    event.preventDefault();
    
    // Извлечение данных из перетаскиваемого элемента
    let draggedData = event.dataTransfer?.getData("good");
    
    // Проверяем валидность данных и доступность объекта App2d
    if (!draggedData) {
      console.warn("Нет данных в перетаскиваемом элементе.");
      return;
    }
    if (!App2d) {
      console.error("Объект App2d недоступен.");
      return;
    }
    
    // Получаем координаты мыши при броске
    const pointerPosition: Vector2 = {
      x: event.offsetX,
      y: event.offsetY
    };

    if(App2d){
      App2d.layers.planner?.addWall({
        position: pointerPosition, 
        type: draggedData
      });
    }

  } catch (error) {
    console.error("Произошла ошибка в обработчике перетаскивания:", error);
  }
};

onMounted(async () => {
  if (root2d.value && canvas2d.value) {

    App2d = new Constructor2D(root2d.value, canvas2d.value);
    await App2d.init();

    // Добавляем обработчик события
    canvas2d.value.addEventListener('drop', dropHandler);

    console.log("!!! App2d:", App2d);
    
  }

});

onUnmounted(() => {

  if (App2d) {
    App2d.destroy(); // Уничтожаем объект App2d
    App2d = null;    // Сбрасываем переменную в null
  }

  // Удаляем обработчик события, если он был добавлен
  if (canvas2d.value && dropHandler) {
    canvas2d.value.removeEventListener('drop', dropHandler);
  }

});

</script>

<style lang="scss" setup>
#app2D {
  display: flex;
  width: 100%;

  #constructor2D{
    width: 100%;
    height: 100%;
  }
}
</style>

<template>
  <div ref="root2d" id="app2D">
    <canvas ref="canvas2d" id="constructor2D"
      @dragover.prevent></canvas>
  </div>
</template>