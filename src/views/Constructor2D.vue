<script lang="ts" setup>

import { MathUtils } from "three";

import { ref, onMounted, Ref, onUnmounted } from "vue";

// import { useC2DLeftMenuStore } from "@/store/constructor2d/store/useLeftMenuStore";
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore";
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";

// const leftMenuStore = useC2DLeftMenuStore();
const plannerStore = usePlanner2DStore();
const constructor2DStore = useConstructor2DStore();

import Constructor2D from '@/Constructor2D';

// root container
const root2d: Ref<HTMLElement | undefined> = ref();
// canvas
const canvas2d: Ref<HTMLCanvasElement | undefined> = ref();

document.oncontextmenu = document.body.oncontextmenu = function() {return false;};

let App2d: Constructor2D | null = null; 

onMounted(async () => {

  if (root2d.value && canvas2d.value) {

    App2d = new Constructor2D(root2d.value, canvas2d.value);
    await App2d.init();

    console.log("!!! App2d:", App2d);
    
  }
  
});

onUnmounted(() => {
  if (App2d) {
    App2d.destroy(); // Уничтожаем объект App2d
    App2d = null;    // Сбрасываем переменную в null
  }
});

function dropHandler(ev: DragEvent): void {
  try {
    // Предотвращаем действие по умолчанию при перетаскивании
    ev.preventDefault();
    
    // Извлечение данных из перетаскиваемого элемента
    const draggedData = ev.dataTransfer?.getData("good");
    
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
    const { offsetX: eX, offsetY: eY } = ev;

    const oc = constructor2DStore.getOriginOfCoordinates;

    const scale = constructor2DStore.getScale;
    const invScale = constructor2DStore.getInverseScale;
    
    console.log("!!! scale: ", scale, " * invScale: ", invScale, " = ", scale * invScale);
    
    // позиция курсора мыши в координатах canvas
    const canvasPositionMouseX = eX - 30 - oc.x;
    const canvasPositionMouseY = eY - 30 - oc.y;

    const positionObjectX = canvasPositionMouseX * invScale;
    const positionObjectY = canvasPositionMouseY * invScale;
    
    // добавляем "товар" объект в Store
    plannerStore.addObj({
      id: MathUtils.generateUUID(),
      name: draggedData,
      width: 150,
      height: 30,
      position: { x: positionObjectX, y: positionObjectY },
      heightDirection: -1,
      angleDegrees: 0
    });

  } catch (error) {
    console.error("Произошла ошибка в обработчике перетаскивания:", error);
  }
}

</script>

<style lang="scss" setup>
#app2D {
  display: flex;
  width: 100%;
}
#constructor2D{
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div ref="root2d" id="app2D">
    <canvas ref="canvas2d" id="constructor2D"
      @dragover.prevent
      @drop="dropHandler($event)"></canvas>
  </div>
</template>