import {
  watch
} from 'vue';
import * as PIXI from 'pixi.js';
import { useGridStore } from '@/store/constructor2d/store/useGridStore';
import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";

export default class Grid {
  
  private app: PIXI.Application | null; // PIXI-приложение, может быть обнулено
  private container: PIXI.Container | null; // Контейнер, может быть обнулен
  private gridLines: PIXI.Graphics | null; // Линии сетки, может быть обнулено
  private gridAxisLinesHorizontal: PIXI.Graphics | null; // Горизонтальные линии, может быть обнулено
  private gridAxisLinesVertical: PIXI.Graphics | null; // Вертикальные линии, может быть обнулено

  // Хранилища, добавлен `| null` для возможности обнуления
  private gridStore: ReturnType<typeof useGridStore> | null = useGridStore();
  private rulerStore: ReturnType<typeof useRulers2DStore> | null = useRulers2DStore();
  private constructorStore: ReturnType<typeof useConstructor2DStore> | null = useConstructor2DStore();

  // Массив для хранения функций отписки
  private unwatchList: (() => void)[] = [];

  constructor(pixiApp: PIXI.Application) {
    if (!pixiApp) {
      throw new Error("PIXI.Application instance is required");
    }

    this.app = pixiApp;
    this.container = new PIXI.Container();
    this.container.position.set(30, 30);
    this.app.stage.addChild(this.container);

    this.gridLines = new PIXI.Graphics();
    this.container.addChild(this.gridLines);

    this.gridAxisLinesHorizontal = new PIXI.Graphics();
    this.gridAxisLinesVertical = new PIXI.Graphics();
    this.container.addChild(this.gridAxisLinesHorizontal, this.gridAxisLinesVertical);

    this.unwatchList.push(
      // Используем watch для наблюдения за изменениями в store
      watch(
        () => this.gridStore, // Источник данных, за которым наблюдаем
        () => {
          this.handleConstructorStoreChange(); // Вызываем обработчик изменений
        },
        { deep: true } // Глубокое отслеживание (необходимо, если наблюдаем за вложенными объектами)
      )
    );

    this.unwatchList.push(
      // Используем watch для наблюдения за изменениями в store
      watch(
        () => this.constructorStore, // Источник данных, за которым наблюдаем
        () => {
          this.handleConstructorStoreChange(); // Вызываем обработчик изменений
        },
        { deep: true } // Глубокое отслеживание (необходимо, если наблюдаем за вложенными объектами)
      )
    );

    this.unwatchList.push(
      watch(
        () => this.constructorStore!.scale,
        (scale) => {
          this.container!.scale.set(scale);
          this.drawGrid();
        }
      )
    );

    this.init();
  }

  private init(): void {
    this.drawGrid();
    this.drawGridAxisLines();
  }

  private drawGridAxisLines(): void {
    this.drawAxisLine(this.gridAxisLinesHorizontal!, "horizontal");
    this.drawAxisLine(this.gridAxisLinesVertical!, "vertical");
  }

  private drawAxisLine(graphics: PIXI.Graphics, direction: "horizontal" | "vertical"): void {
    graphics.clear();
    const isHorizontal = direction === "horizontal";
    const length = isHorizontal
      ? this.app!.renderer.width
      : this.app!.renderer.height;

    const countSegments = Number((length / (this.constructorStore!.segment.indent + this.constructorStore!.segment.width)).toFixed());

    for (let i = 0; i < countSegments; i++) {
      const start = isHorizontal
        ? { 
            x: i * (this.constructorStore!.segment.indent + this.constructorStore!.segment.width),
            y: this.constructorStore!.originOfCoordinates.y
          }
        : { 
            x: this.constructorStore!.originOfCoordinates.x,
            y: i * (this.constructorStore!.segment.indent + this.constructorStore!.segment.width)
          };

      const end = isHorizontal
        ? { 
            x: start.x + this.constructorStore!.segment.width,
            y: start.y
          }
        : { 
            x: start.x,
            y: start.y + this.constructorStore!.segment.width
          };

      graphics.moveTo(start.x, start.y);
      graphics.lineTo(end.x, end.y);
    }

    graphics.stroke({
      width: 1,
      color: this.constructorStore!.colorAxisLine
    });
  }

  private drawGrid(): void {
    this.gridLines!.clear();
    
    const width = this.app!.renderer.width * this.constructorStore!.getInverseScale;
    const height = this.app!.renderer.height * this.constructorStore!.getInverseScale;
    
    const vLines = Math.ceil(width / this.gridStore!.gridSize) + 2;
    const hLines = Math.ceil(height / this.gridStore!.gridSize) + 2;
    
    const centerScene = {
      x: this.constructorStore!.originOfCoordinates.x * this.constructorStore!.getInverseScale - 30,
      y: this.constructorStore!.originOfCoordinates.y * this.constructorStore!.getInverseScale - 30
    };
    
    this.drawLines(
      vLines,
      (i) => {
        const positionX: number = (i * this.gridStore!.gridSize) + (centerScene.x % this.gridStore!.gridSize);
        return {
          startX: positionX,
          startY: -this.gridStore!.gridSize,
          endX: positionX,
          endY: height + this.gridStore!.gridSize,
        };
      },
      this.gridStore!.colorGrid
    );

    this.drawLines(
      hLines,
      (i) => {
        const positionY: number = (i * this.gridStore!.gridSize) + (centerScene.y % this.gridStore!.gridSize);
        return {
          startX: -this.gridStore!.gridSize,
          startY: positionY,
          endX: width + this.gridStore!.gridSize,
          endY: positionY,
        };
      },
      this.gridStore!.colorGrid
    );

    const offset = this.rulerStore!.rulerSpace - this.gridStore!.gridSize;
    this.gridLines!.position.set(offset, offset);
  }

  private drawLines(
    count: number,
    getPositions: (index: number) => { startX: number; startY: number; endX: number; endY: number },
    color: number | string
  ): void {
    for (let i = 0; i < count; i++) {
      const { startX, startY, endX, endY } = getPositions(i);
      this.gridLines!.moveTo(startX, startY);
      this.gridLines!.lineTo(endX, endY);
    }
    this.gridLines!.stroke({
      width: 1,
      color: color
    });
  }

  private handleConstructorStoreChange(): void {
    this.drawGrid();
    this.drawGridAxisLines();
  }

  public destroy(): void {

    // Отписываемся от всех наблюдателей
    this.unwatchList.forEach(unwatch => unwatch());
    this.unwatchList = []; // Очищаем массив для безопасности
    
    // Очистка сетки
    if (this.gridLines) {
      this.gridLines.destroy(true);
      this.container!.removeChild(this.gridLines);
      this.gridLines = null;
    }

    if (this.gridAxisLinesHorizontal) {
      this.gridAxisLinesHorizontal.destroy(true);
      this.container!.removeChild(this.gridAxisLinesHorizontal);
      this.gridAxisLinesHorizontal = null;
    }

    if (this.gridAxisLinesVertical) {
      this.gridAxisLinesVertical.destroy(true);
      this.container!.removeChild(this.gridAxisLinesVertical);
      this.gridAxisLinesVertical = null;
    }

    if (this.container) {
      this.container.destroy({ children: true, texture: true });
      this.container = null;
    }

    // Обнуление хранилищ
    this.gridStore = null;
    this.rulerStore = null;
    this.constructorStore = null;

    // Обнуление приложения
    this.app = null;
  }
}
