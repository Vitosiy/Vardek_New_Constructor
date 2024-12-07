import {
  watch,
  ref
} from 'vue';
import * as PIXI from 'pixi.js';
// import { useGridStore } from '@/store/constructor2d/store/useGridStore';
// import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore";
import { useC2DInteractiveWallStore } from "@/store/constructor2d/store/useInteractiveWallStore";

import {
  PlannerObject,
  // PlannerObjectContainers,
  // Vector2,
} from "@/types/constructor2d/interfaсes";

import { 
  configWall
} from "@/store/constructor2d/data/usePlannerData";

import { 
  // rect,
  // drawVerticalLines,
  // drawDashedOutline,
  // drawArrow,
  // drawArrowHead,
  drawCircle,
} from "../../utils/Shape";

export default class StartPointActiveObject {

  private app: PIXI.Application;
  private container: PIXI.Container;
  
  private circle: PIXI.Graphics;
  
  // private gridStore = useGridStore();
  // private rulerStore = useRulers2DStore();
  private constructorStore = useConstructor2DStore();
  private plannerStore = usePlanner2DStore();
  private interactiveWallStore = useC2DInteractiveWallStore();

  constructor(pixiApp: PIXI.Application) {

    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.circle = new PIXI.Graphics();

    this.circle.eventMode = 'static';
    this.container.addChild(this.circle);

    this.setupInteractions();

    watch(
      () => this.plannerStore.objects,
      (newVal) => {
        
        const lastAddedObject = newVal[newVal.length - 1];
        
        if (lastAddedObject) {

          const newObject = JSON.parse(JSON.stringify(lastAddedObject));

          this.draw(newObject);
          
        }

      },
      { deep: true } // Следим за глубокими изменениями в массиве
    );

    watch(
      () => this.constructorStore.originOfCoordinates,
      (newValue) => {

        const cX = newValue.x;
        const cY = newValue.y;
        
        this.container.position.set(cX, cY);
        
      },
      { deep: true } // Необходим, чтобы отслеживать изменения вложенных объектов
    );

  }

  public draw(obj: PlannerObject): void {

    if(!obj.points) return;

    this.container.visible = true;
    
    const position = obj.points[0];

    this.interactiveWallStore.setActiveObjectID(obj.id);

    this.circle.clear();

    position.x += 30;
    position.y += 30;

    // синяя точка
    drawCircle(
      this.circle,
      position,
      12, 
      configWall.color.mediumBlue
    );
    
  }

  private setupInteractions(): void {

    this.circle
      // если нажали на точку стены
      .on('pointerdown', this.handleMouseDown.bind(this))
      // если отпустили кнопку на точке стены
      .on('pointerup', this.handleMouseUp.bind(this));

    // если перемещаем курсор с нажатой кнопкой 
    this.app.stage.on('pointermove', this.handleMouseMove.bind(this));

  }

  private handleMouseDown(e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();

    this.interactiveWallStore.setStatusLeftDownMouse(true);

    e.stopPropagation(); // Останавливаем всплытие события
    
  }

  private handleMouseUp (e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();

    this.interactiveWallStore.setStatusLeftDownMouse(false);
    
    e.stopPropagation(); // Останавливаем всплытие события
    
  }

  private handleMouseMove (e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();
    
    if(this.interactiveWallStore.statusLeftDownMouse){

      const co = this.constructorStore.getOriginOfCoordinates;

      this.plannerStore.setNewPointPosition(
        this.interactiveWallStore.activeObjectID,
        0,
        {
          x: e.data.global.x - co.x - 30,
          y: e.data.global.y - co.y - 30
        }
      );
      
    }
    
    e.stopPropagation(); // Останавливаем всплытие события
    
  }

  public clearGraphic(): void{

    this.container.visible = false;
    
  }

}