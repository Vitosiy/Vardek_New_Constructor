//@ts-nocheck
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
} from "../../utils/Shape";

export default class SizeTextActiveObject {

  private app: PIXI.Application;
  private container: PIXI.Container;
  
  private widthLine: PIXI.Graphics;
  private widthText: PIXI.Text;
  private heightText: PIXI.Text;
  private heightTextContainer: PIXI.Container;
  
  // private gridStore = useGridStore();
  // private rulerStore = useRulers2DStore();
  private constructorStore = useConstructor2DStore();
  private plannerStore = usePlanner2DStore();

  // Массив для хранения функций отписки
  private unwatchList: (() => void)[] = [];

  constructor(pixiApp: PIXI.Application) {

    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.widthLine = new PIXI.Graphics();
    this.container.addChild(this.widthLine);
    
    this.widthText = new PIXI.Text({ // Создаём текстовую метку
      text: "", // Текст метки, вычисляется как положительная координата
      style: {
        fontSize: 16, // Размер текста метки
        fill: configWall.color.arrowHeadWall, // Цвет текста метки
      }
    });
    this.container.addChild(this.widthText);

    this.heightText = new PIXI.Text({ // Создаём текстовую метку
      text: "", // Текст метки, вычисляется как положительная координата
      style: {
        fontSize: 16, // Размер текста метки
        fill: configWall.color.arrowHeadWall, // Цвет текста метки
      }
    });
    this.heightTextContainer = new PIXI.Container();
    this.heightTextContainer.addChild(this.heightText);
    this.container.addChild(this.heightTextContainer);

    this.unwatchList.push(
      // отслеживаем изменения в объекте
      watch(
        () => this.plannerStore.objects.map(obj => ({ ...obj })), // "Копируем" объекты для отслеживания
        (newVal, oldVal) => {
          newVal.forEach((newObject, index) => {
            const oldObject = oldVal?.[index];
      
            if (oldObject && JSON.stringify(newObject) !== JSON.stringify(oldObject)) {
              // Если объект изменился
              const updatedObject = JSON.parse(JSON.stringify(newObject));
              this.draw(updatedObject); // Выполняем действие с изменённым объектом
            }
          });
        },
        { deep: true } // Глубокое слежение за изменениями
      )
    );

    this.unwatchList.push(
      watch(
        () => this.constructorStore.originOfCoordinates,
        (newValue) => {

          const cX = newValue.x;
          const cY = newValue.y;
          
          this.container.position.set(cX, cY);
          
        },
        { deep: true } // Необходим, чтобы отслеживать изменения вложенных объектов
      )
    );

    this.unwatchList.push(
      watch(
        () => this.constructorStore.scale,
        (newValue) => {
          
          this.container.scale.set(newValue);
          
        }
      )
    );

  }

  public draw(obj: PlannerObject): void {

    this.container.visible = true;

    this.widthLine.clear();
    this.widthText.text = "";
    this.heightText.text = "";

    this.heightText.text = `${Math.round(obj.height)} см`;

    if(obj.points){
      this.heightText.x = 10;
      this.heightText.y = -24;
    }

    if(obj.points){
      this.heightTextContainer.x = obj.points[1].x + 30;
      this.heightTextContainer.y = obj.points[1].y + 30;
      this.heightTextContainer.rotation = MathUtils.degToRad(obj.angleDegrees);
    }

    { // рисуем линию длины стены

    }
    
    /*
    this.xArrow.clear();
    this.xText.text = "";
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
    this.xText.text = `${distanceY * 10} см`;
    this.xText.x = position.x - 24;
    this.xText.y = ((distanceY + 30) / 2) + (this.xText.width / 2);
    this.xText.rotation = MathUtils.degToRad(rotateDegY);
    */
    
  }

  public clearGraphic(): void{

    this.container.visible = false;
    
  }

  public destroy(): void {
    
    // Отписываемся от всех наблюдателей
    this.unwatchList.forEach(unwatch => unwatch());
    this.unwatchList = []; // Очищаем массив наблюдателей для безопасности
  
    // Уничтожаем графику
    if (this.widthLine) {
      this.widthLine.destroy(true);
      this.container.removeChild(this.widthLine);
      this.widthLine = null!;
    }
  
    if (this.widthText) {
      this.widthText.destroy(true);
      this.container.removeChild(this.widthText);
      this.widthText = null!;
    }
  
    if (this.heightText) {
      this.heightText.destroy(true);
      this.heightTextContainer.removeChild(this.heightText);
      this.heightText = null!;
    }
  
    if (this.heightTextContainer) {
      this.heightTextContainer.destroy(true);
      this.container.removeChild(this.heightTextContainer);
      this.heightTextContainer = null!;
    }
  
    // Уничтожаем контейнер
    if (this.container) {
      this.container.destroy({ children: true, texture: true });
      this.app.stage.removeChild(this.container);
      this.container = null!;
    }
  
    // Обнуляем ссылку на PIXI.Application
    this.app = null!;
  }  

}