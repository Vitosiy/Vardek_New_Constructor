<script lang="ts" setup>

// import { MathUtils } from "three";

import { ref, onMounted, Ref, onUnmounted, reactive } from "vue";

// import { useC2DLeftMenuStore } from "@/store/constructor2d/store/useLeftMenuStore";
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore";
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";
import { useC2DInteractiveWallStore } from "@/store/constructor2d/store/useInteractiveWallStore";
import { configWall } from "@/store/constructor2d/data/usePlannerData";

// const leftMenuStore = useC2DLeftMenuStore();
const plannerStore = usePlanner2DStore();
const constructor2DStore = useConstructor2DStore();
const interactiveWallStore = useC2DInteractiveWallStore();

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

    const __id = 'wall_'+plannerStore.getCountObjects;
    
    const mergeWalls: { 
      wallPoint0: null | string | number, 
      wallPoint1: null | string | number 
    } = {
      wallPoint0: null, 
      wallPoint1: null
    };

    const oc = constructor2DStore.getOriginOfCoordinates;

    // const scale = constructor2DStore.getScale;
    const invScale = constructor2DStore.getInverseScale;
    
    // console.log("!!! scale: ", scale, " * invScale: ", invScale, " = ", scale * invScale);
    
    // позиция курсора мыши в координатах canvas
    const canvasPositionMouseX = eX - 30 - oc.x;
    const canvasPositionMouseY = eY - 30 - oc.y;

    let positionObjectX = canvasPositionMouseX * invScale;
    let positionObjectY = canvasPositionMouseY * invScale;

    const hoverPointObject: { id: number; indexPoint: number } | null = 
      plannerStore.getPointByPosition({
        x: positionObjectX,
        y: positionObjectY
      });

    // Если курсор попал на точку объекта, то обновляем хранилище
    if(hoverPointObject){
      
      constructor2DStore.setHoverObject(
        hoverPointObject.id,
        hoverPointObject.indexPoint
      );
      
      // присоединяем объект к точке
      if(hoverPointObject.indexPoint === 1){ // если курсор над точкой 1
      
        const __hoverObj = plannerStore.getObjectById(hoverPointObject.id); // находим объект которому принадлежит точка 1
        const hoverObj = JSON.parse(JSON.stringify(__hoverObj));
        if(hoverObj && hoverObj.points && hoverObj.mergeWalls.wallPoint0 === null){
          
          // присвваиваем положение точки 1 найденного объекта новому
          positionObjectX = hoverObj.points[1].x;
          positionObjectY = hoverObj.points[1].y;

          // указываем что точка 1 у найденного объекта (hoverObj.id)
          mergeWalls.wallPoint1 = hoverObj.id;
          if (__hoverObj) {
            __hoverObj.mergeWalls.wallPoint0 = __id;
          }
          
        }

      }else if(hoverPointObject.indexPoint === 0){ // если курсор над точкой 0

        const __hoverObj = plannerStore.getObjectById(hoverPointObject.id); // находим объект которому принадлежит точка 1
        const hoverObj = JSON.parse(JSON.stringify(__hoverObj));

        if(hoverObj && hoverObj.points && hoverObj.mergeWalls.wallPoint1 === null){
          
          // присвваиваем положение точки 1 найденного объекта новому
          positionObjectX = hoverObj.points[0].x - configWall.width;
          positionObjectY = hoverObj.points[0].y;

          // указываем что точка 1 у найденного объекта (hoverObj.id)
          if (__hoverObj) {
            mergeWalls.wallPoint0 = hoverObj.id; // точка новой стены для слияние с другой
            __hoverObj.mergeWalls.wallPoint1 = __id; // точка стены с которой нужно слить новую
          }

        }
          
      }
      
    }else{

      constructor2DStore.setHoverObject(
        null,
        null
      );

    }
    

    interactiveWallStore.setActiveObjectID(__id);
    // добавляем "товар" объект в Store
    plannerStore.addObj({
      // id: MathUtils.generateUUID(),
      id: __id,
      name: draggedData,
      width: configWall.width,
      height: configWall.height,
      position: { x: positionObjectX, y: positionObjectY },
      heightDirection: configWall.heightDirection,
      angleDegrees: configWall.angleDegrees,
      updateTime: 0,
      mergeWalls: reactive(mergeWalls)
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