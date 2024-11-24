import { defineStore } from 'pinia';

import {
  Vector2
} from "@/types/constructor2d/interfaсes";

interface Mouse {
  rightBtn: boolean;
  rightClickPosition: Vector2;
  prevOriginOfCoordinates: Vector2;
  positionPoint: Vector2;
}

interface Segment {
  indent: number,
  width: number
}

interface State {
  mouse: Mouse;
  originOfCoordinates: Vector2;
  segment: Segment;
  colorAxisLine: number | string;
}


export const useConstructor2DStore = defineStore('constructor2DStore', {
  
  state: (): State => ({

    mouse: {
      
      rightBtn: false,

      rightClickPosition: {
        x: 0,
        y: 0
      },

      prevOriginOfCoordinates: {
        x: 0,
        y: 0
      },
      
      positionPoint: {
        x: 0,
        y: 0
      }

    },

    originOfCoordinates: {
      x: 30,
      y: 30
    },

    segment: {
      indent: 5,
      width: 5
    },

    colorAxisLine: 0xDA444C

  }),
  
  actions: {

    toggleRightBtn() {
      this.mouse.rightBtn = !this.mouse.rightBtn;
    },

    updatePositionPoint(x: number, y: number) {
      this.mouse.positionPoint.x = x;
      this.mouse.positionPoint.y = y;
    },

    updateOriginOfCoordinates(x: number, y: number) {
      this.originOfCoordinates.x = x;
      this.originOfCoordinates.y = y;
    },

    updataRightClickPosition(x: number, y: number) {
      this.mouse.rightClickPosition.x = x;
      this.mouse.rightClickPosition.y = y;
    },

    updatePrevOriginOfCoordinates(x: number, y: number) {
      this.mouse.prevOriginOfCoordinates.x = x;
      this.mouse.prevOriginOfCoordinates.y = y;
    }
    
  },
  
});