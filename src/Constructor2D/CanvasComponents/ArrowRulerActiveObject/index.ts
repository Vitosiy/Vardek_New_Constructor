import {
  watch
} from 'vue';
import * as PIXI from 'pixi.js';
import { 
  MathUtils
} from "three";
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

export default class ArrowRulerActiveObject {

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
        fill: 0x5D6069, // Цвет текста метки
      }
    });
    this.container.addChild(this.xText);

    this.yArrow = new PIXI.Graphics();
    this.container.addChild(this.yArrow);
    this.yText = new PIXI.Text({ // Создаём текстовую метку
      text: "", // Текст метки, вычисляется как положительная координата
      style: {
        fontSize: 16, // Размер текста метки
        fill: 0x5D6069, // Цвет текста метки
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

    if(!obj.points) return;
    
    const position = obj.points[0];

    this.container.visible = true;

    this.xArrow.clear();
    this.xText.text = "";
    this.yArrow.clear();
    this.yText.text = "";

    position.x += 30;
    position.y += 30;

    // вертикальная стрелка
    const distanceY = position.y - 30;
    const rotateDegY = -90;
    drawArrow(
      this.xArrow,
      position,
      distanceY,
      rotateDegY, // Угол направления стрелки в градусах
      configWall.color.tapeLineColor, // Цвет стрелки
      1, // Толщина линии
      12 // Размер треугольника (основание и высота)
    );
    this.xText.text = `${Math.round(distanceY * 10)} см`;
    this.xText.x = position.x - 24;
    this.xText.y = ((distanceY + 30) / 2) + (this.xText.width / 2);
    this.xText.rotation = MathUtils.degToRad(rotateDegY);

    // горизонтальная стрелка
    const distanceX = position.x - 30;
    const rotateDegX = 180;
    drawArrow(
      this.yArrow,
      position,
      distanceX,
      rotateDegX, // Угол направления стрелки в градусах
      configWall.color.tapeLineColor, // Цвет стрелки
      1, // Толщина линии
      12 // Размер треугольника (основание и высота)
    );
    this.yText.text = `${Math.round(distanceX * 10)} см`;
    this.yText.y = position.y - 24;
    this.yText.x = ((distanceX - 30) / 2) + (this.yText.width / 2);
    
  }

  public clearGraphic(): void{

    this.container.visible = false;
    
  }

}