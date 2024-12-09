
//@ts-nocheck
import * as PIXI from 'pixi.js';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import {
  PlannerObject
} from "@/types/constructor2d/interfaсes";

import { 
  getRectPoints
} from "@/Constructor2D/utils/Math";

import { configWall } from "@/store/constructor2d/data/usePlannerData";

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

  return {
    objects,
    addObj,
    removeObj,
  };
});