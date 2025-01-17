// import * as PIXI from 'pixi.js';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import {
  PlannerObject,
  Vector2
} from "@/types/constructor2d/interfaсes";

import { 
  getRectPoints,
  getRectPointsV2,
  getDistanceBetweenVectors,
  getAngleBetweenVectors
} from "@/Constructor2D/utils/Math";

import { configWall } from "@/store/constructor2d/data/usePlannerData";

// import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";

// const interactiveWallStore = useConstructor2DStore();

export const usePlanner2DStore = defineStore('planner2DStore', () => {
  const objects = ref<PlannerObject[]>([]);

  const addObj = (item: PlannerObject) => {

    let config = null;

    if(item.name === "wall") config = configWall;

    item.heightDirection = config.heightDirection;
    item.angleDegrees = config.angleDegrees;
    
    const points = getRectPoints(
      config.width,
      config.height,
      item.position,
      item.heightDirection,
      item.angleDegrees
    );

    item.points = points;
    item.width = config.width;
    item.height = config.height;
    
    objects.value.push(item);
    
  };

  const removeObj = (index: number) => {
    if (index >= 0 && index < objects.value.length) {
      objects.value.splice(index, 1);
    } else {
      console.warn(`Index ${index} is out of bounds.`);
    }
  };

  const setNewPointPosition = (id: number | string, indexPoint: number, position: Vector2) => {

    // Находим объект по id
    const targetObject = objects.value.find(obj => obj.id === id);

    if (!targetObject) {
      console.warn(`Object с id ${id} не найден.`);
      return;
    }

    // Проверяем, что индекс точки корректен
    if (!targetObject.points || indexPoint < 0 || indexPoint >= targetObject.points.length) {
      console.warn(`Индекс точки ${indexPoint} выходит за границы массива.`);
      return;
    }

    const startPoint: Vector2 = indexPoint === 0 ? position : targetObject.points[0];
    const endPoint: Vector2 = indexPoint === 0 ? targetObject.points[1] : position;

    const distance = getDistanceBetweenVectors(startPoint, endPoint);

    targetObject.angleDegrees = getAngleBetweenVectors(
      startPoint, 
      {
        x: startPoint.x + distance,
        y: startPoint.y
      },
      endPoint //targetObject.points[1]
    );
    
    if(indexPoint === 0) targetObject.position = position;
    targetObject.width = distance;

    const points = getRectPointsV2(
      distance,
      targetObject.height,
      startPoint,
      endPoint,
      targetObject.heightDirection,
      targetObject.angleDegrees
    );

    // Обновляем точку
    targetObject.points[0] = startPoint;
    targetObject.points[1] = points[1];
    targetObject.points[2] = points[2];
    targetObject.points[3] = points[3];
    
  }

  // Добавляем геттер для получения объекта по id
  const getObjectById = computed(() => {
    return (id: number | string) => objects.value.find(obj => obj.id === id);
  });

  // Геттер, который принимает аргументы положения курсора и 
  // находит точку 0 или 1, которая находится под курсором. 
  // Поиск осуществляется во всех объектах
  const getPointByPosition = computed(() => {
    return (position: Vector2): { id: number; indexPoint: number } | null => {
      let result: { id: number | string; indexPoint: number } | null = null;
      objects.value.forEach(obj => {
        if (obj.points) {
          obj.points.forEach((point, index) => {
            if(index === 0 || index === 1){
              if (getDistanceBetweenVectors(point, position) < 10) {
                result = {
                  id: obj.id,
                  indexPoint: index
                };
              }
            }
          });
        }
      });
      return result
    }
  }); 

  const getCountObjects = computed(() => objects.value.length);

  return {
    objects,
    
    addObj,
    removeObj,
    setNewPointPosition,
    
    getObjectById,
    getPointByPosition,
    getCountObjects
  };
});