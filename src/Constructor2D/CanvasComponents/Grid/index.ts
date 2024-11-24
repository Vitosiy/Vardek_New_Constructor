import * as PIXI from 'pixi.js';
import { useGridStore } from '@/store/constructor2d/store/useGridStore';
import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";

export default class Grid {
  
  private app: PIXI.Application;
  private container: PIXI.Container;
  private gridLines: PIXI.Graphics;
  private gridAxisLinesHorizontal: PIXI.Graphics;
  private gridAxisLinesVertical: PIXI.Graphics;

  private gridSize: number;
  private rulerSpace: number;
  private colorGrid: number; // Цвет сетки
  
  private gridStore = useGridStore(); // grid хранилище
  private rulerStore = useRulers2DStore(); // rulers хранилище
  private constructorStore = useConstructor2DStore(); // хранилище приложения

  constructor(pixiApp: PIXI.Application) {
    if (!pixiApp) {
      throw new Error("PIXI.Application instance is required");
    }

    this.app = pixiApp;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.gridLines = new PIXI.Graphics();
    this.container.addChild(this.gridLines);

    this.gridAxisLinesHorizontal = new PIXI.Graphics();
    this.gridAxisLinesVertical = new PIXI.Graphics();
    this.container.addChild(this.gridAxisLinesHorizontal, this.gridAxisLinesVertical);

    // Получаем начальные значения из Pinia-хранилища
    this.gridSize = this.gridStore.gridSize;
    this.rulerSpace = this.rulerStore.rulerSpace;
    this.colorGrid = this.gridStore.colorGrid;

    // Подписка на изменения в Pinia-хранилище
    this.gridStore.$subscribe(() => {
      this.updateParameters();
    });

    this.constructorStore.$subscribe(() => {
      this.handleConstructorStoreChange();
    });

    this.init();
  }

  private init(): void {
    this.drawGrid();
    this.drawGridAxisLines();
  }

  private drawGridAxisLines(): void {
    this.drawAxisLine(this.gridAxisLinesHorizontal, "horizontal");
    this.drawAxisLine(this.gridAxisLinesVertical, "vertical");
  }

  private drawAxisLine(graphics: PIXI.Graphics, direction: "horizontal" | "vertical"): void {
    graphics.clear();
  
    const isHorizontal = direction === "horizontal";
    const length = isHorizontal
      ? this.app.renderer.width
      : this.app.renderer.height;
  
    // Убедитесь, что округление согласовано с первым скриптом
    const countSegments = Number((length / (this.constructorStore.segment.indent + this.constructorStore.segment.width)).toFixed());

    console.log(this.constructorStore.originOfCoordinates.x, this.constructorStore.originOfCoordinates.y)
  
    for (let i = 0; i < countSegments; i++) {
      const start = isHorizontal
        ? { 
            x: i * (this.constructorStore.segment.indent + this.constructorStore.segment.width), 
            y: this.constructorStore.originOfCoordinates.y
          }
        : { 
            x: this.constructorStore.originOfCoordinates.x,
            y: i * (this.constructorStore.segment.indent + this.constructorStore.segment.width) 
          };
  
      const end = isHorizontal
        ? { 
            x: start.x + this.constructorStore.segment.width, 
            y: start.y 
          }
        : { 
            x: start.x, 
            y: start.y + this.constructorStore.segment.width 
          };
  
      graphics.moveTo(start.x, start.y);
      graphics.lineTo(end.x, end.y);
    }
  
    graphics.stroke({
      width: 1, 
      color: this.constructorStore.colorAxisLine // Убедитесь, что цвет корректно определен
    });
  }
  

  private drawGrid(): void {
    this.gridLines.clear(); // Очистка перед перерисовкой
  
    // Получаем актуальные размеры холста
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
  
    // Подсчитываем количество линий с учетом сетки
    const vLines = Math.ceil(width / this.gridSize) + 2; // Дополнительные линии для бесконечности по вертикали
    const hLines = Math.ceil(height / this.gridSize) + 2; // Дополнительные линии для бесконечности по горизонтали
  
    const centerScene = this.constructorStore.originOfCoordinates;
  
    // Рисуем вертикальные линии
    this.drawLines(
      vLines,
      (i) => {
        const positionX: number = (i * this.gridSize) + (centerScene.x % this.gridSize); // Смещение для создания эффекта бесконечной сетки
        return {
          startX: positionX,
          startY: -this.gridSize, // Рисуем чуть за пределами видимой области для бесшовности
          endX: positionX,
          endY: height + this.gridSize, // Рисуем чуть за пределами видимой области
        };
      },
      this.colorGrid
    );
  
    // Рисуем горизонтальные линии
    this.drawLines(
      hLines,
      (i) => {
        const positionY: number = (i * this.gridSize) + (centerScene.y % this.gridSize); // Смещение для создания эффекта бесконечной сетки
        return {
          startX: -this.gridSize,               // Рисуем чуть за пределами видимой области для бесшовности
          startY: positionY,
          endX: width + this.gridSize,          // Рисуем чуть за пределами видимой области
          endY: positionY,
        };
      },
      this.colorGrid
    );
  
    // Применяем отступ для линейки
    const offset = this.rulerSpace - this.gridSize;
    this.gridLines.position.set(offset, offset);
  }

  private drawLines(
    count: number,
    getPositions: (index: number) => { startX: number; startY: number; endX: number; endY: number },
    color: number | string
  ): void {
    for (let i = 0; i < count; i++) {
      const { startX, startY, endX, endY } = getPositions(i);
      this.gridLines.moveTo(startX, startY);
      this.gridLines.lineTo(endX, endY);
    }
    this.gridLines.stroke({
      width: 1,
      color: color
    });
  }

  private updateParameters(): void {
    const { gridSize, colorGrid } = this.gridStore;
    const { rulerSpace } = this.rulerStore;

    let shouldRedraw = false;

    if (gridSize !== this.gridSize) {
      this.gridSize = gridSize;
      shouldRedraw = true;
    }
    if (rulerSpace !== this.rulerSpace) {
      this.rulerSpace = rulerSpace;
      shouldRedraw = true;
    }
    if (colorGrid !== this.colorGrid) {
      this.colorGrid = colorGrid;
      shouldRedraw = true;
    }

    if (shouldRedraw) {
      this.drawGrid(); // Перерисовываем сетку
    }
  }

  private handleConstructorStoreChange(): void {
    this.drawGrid(); // перерисовка сетки
    this.drawGridAxisLines(); // перерисовка axis-линий
  }
}