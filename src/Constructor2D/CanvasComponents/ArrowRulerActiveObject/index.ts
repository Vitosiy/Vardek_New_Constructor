import {
  watch
} from 'vue';
import * as PIXI from 'pixi.js';
// import { useGridStore } from '@/store/constructor2d/store/useGridStore';
// import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore";

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
  drawArrow,
  // drawArrowHead,
  // drawCircle,
} from "./../../utils/Shape";

export default class Planner {

  private app: PIXI.Application;
  private container: PIXI.Container;
  
  private xArrow: PIXI.Graphics;
  private xText: PIXI.Text;

  private yArrow: PIXI.Graphics;
  private yText: PIXI.Text;
  
  // private gridStore = useGridStore();
  // private rulerStore = useRulers2DStore();
  private constructorStore = useConstructor2DStore();
  private plannerStore = usePlanner2DStore();

  constructor(pixiApp: PIXI.Application) {

    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.xArrow = new PIXI.Graphics();
    this.container.addChild(this.xArrow);
    this.xText = new PIXI.Text({ // Создаём текстовую метку
      text: "", // Текст метки, вычисляется как положительная координата
      style: {
        fontSize: 16, // Размер текста метки
        fill: 0xff0000, // Цвет текста метки
      }
    });
    this.container.addChild(this.xText);

    this.yArrow = new PIXI.Graphics();
    this.container.addChild(this.yArrow);
    this.yText = new PIXI.Text({ // Создаём текстовую метку
      text: "", // Текст метки, вычисляется как положительная координата
      style: {
        fontSize: 16, // Размер текста метки
        fill: 0xff0000, // Цвет текста метки
      }
    });
    this.container.addChild(this.yText);

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
    
    const position = obj.position;

    this.xArrow.clear();
    this.xText.text = "";
    this.yArrow.clear();
    this.xText.text = "";

    position.x += 30;
    position.y += 30;

    drawArrow(
      this.xArrow,
      position,
      position.y - 30,
      -90, // Угол направления стрелки в градусах
      configWall.color.tapeLineColor, // Цвет стрелки
      1, // Толщина линии
      12 // Размер треугольника (основание и высота)
    );

    drawArrow(
      this.yArrow,
      position,
      position.x - 30,
      180, // Угол направления стрелки в градусах
      configWall.color.tapeLineColor, // Цвет стрелки
      1, // Толщина линии
      12 // Размер треугольника (основание и высота)
    );
    
  }

}

   // синяя точка
  //  drawCircle(
  //   this.activeObjectGraphic,
  //   position,
  //   12, 
  //   configWall.color.mediumBlue
  // );