import * as PIXI from 'pixi.js';
import { useGridStore } from '@/store/constructor2d/store/useGridStore';
import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";

export default class Grid {
  
  // Переменная для хранения экземпляра приложения PIXI
  private app: PIXI.Application; 
  // Контейнер для хранения графических элементов
  private container: PIXI.Container; 
  // Графический объект для отрисовки сетки
  private gridLines: PIXI.Graphics; 
  // Графический объект для отрисовки горизонтальных осей сетки
  private gridAxisLinesHorizontal: PIXI.Graphics; 
  // Графический объект для отрисовки вертикальных осей сетки
  private gridAxisLinesVertical: PIXI.Graphics; 

  // Хранилище сетки, используется для управления состоянием сетки
  private gridStore = useGridStore(); 
  // Хранилище линейки, используется для управления состоянием линеек
  private rulerStore = useRulers2DStore(); 
  // Хранилище конструктора, используется для управления состоянием приложения
  private constructorStore = useConstructor2DStore(); 

  // Конструктор класса, принимает экземпляр PIXI.Application
  constructor(pixiApp: PIXI.Application) {
    // Проверка, что передан экземпляр PIXI.Application, иначе выбрасывается ошибка
    if (!pixiApp) {
      throw new Error("PIXI.Application instance is required");
    }

    // Инициализация приложения PIXI
    this.app = pixiApp;
    // Создание нового контейнера для хранения графических элементов
    this.container = new PIXI.Container();
    this.container.position.set(30, 30);
    // Добавление контейнера на сцену приложения PIXI
    this.app.stage.addChild(this.container);

    // Создание объекта для рисования сетки
    this.gridLines = new PIXI.Graphics();
    // Добавление объекта сетки в контейнер
    this.container.addChild(this.gridLines);

    // Создание объектов для рисования осей сетки (горизонтальных и вертикальных)
    this.gridAxisLinesHorizontal = new PIXI.Graphics();
    this.gridAxisLinesVertical = new PIXI.Graphics();
    // Добавление объектов осей сетки в контейнер
    this.container.addChild(this.gridAxisLinesHorizontal, this.gridAxisLinesVertical);

    // Подписка на изменения в хранилище сетки, вызов обработчика при изменении данных
    this.gridStore.$subscribe(() => {
      this.handleConstructorStoreChange();
    });

    // Подписка на изменения в хранилище конструктора, вызов обработчика при изменении данных
    this.constructorStore.$subscribe(() => {
      this.handleConstructorStoreChange();
    });

    // Инициализация компонентов класса
    this.init();
  }

  // Метод для инициализации сетки и осевых линий
  private init(): void {
    // Рисует основную сетку
    this.drawGrid();
    // Рисует линии осей (горизонтальные и вертикальные)
    this.drawGridAxisLines();
  }

  // Метод для рисования осевых линий (горизонтальных и вертикальных)
  private drawGridAxisLines(): void {
    // Рисует горизонтальные линии осей
    this.drawAxisLine(this.gridAxisLinesHorizontal, "horizontal");
    // Рисует вертикальные линии осей
    this.drawAxisLine(this.gridAxisLinesVertical, "vertical");
  }

  // Метод для рисования отдельной осевой линии (горизонтальной или вертикальной)
  private drawAxisLine(graphics: PIXI.Graphics, direction: "horizontal" | "vertical"): void {
    // Очищает графический объект перед началом рисования
    graphics.clear();

    // Проверяет, является ли направление горизонтальным
    const isHorizontal = direction === "horizontal";
    // Определяет длину линии в зависимости от направления (ширина или высота рендера)
    const length = isHorizontal
      ? this.app.renderer.width
      : this.app.renderer.height;

    // Рассчитывает количество сегментов для осевой линии
    const countSegments = Number((length / (this.constructorStore.segment.indent + this.constructorStore.segment.width)).toFixed());

    // Цикл для отрисовки каждого сегмента осевой линии
    for (let i = 0; i < countSegments; i++) {
      // Начальная точка сегмента в зависимости от направления
      const start = isHorizontal
        ? { 
            x: i * (this.constructorStore.segment.indent + this.constructorStore.segment.width), // Расстояние сегмента по оси X
            y: this.constructorStore.originOfCoordinates.y // Координата Y берется из хранилища
          }
        : { 
            x: this.constructorStore.originOfCoordinates.x, // Координата X берется из хранилища
            y: i * (this.constructorStore.segment.indent + this.constructorStore.segment.width) // Расстояние сегмента по оси Y
          };

      // Конечная точка сегмента в зависимости от направления
      const end = isHorizontal
        ? { 
            x: start.x + this.constructorStore.segment.width, // Длина сегмента по оси X
            y: start.y // Координата Y остается неизменной
          }
        : { 
            x: start.x, // Координата X остается неизменной
            y: start.y + this.constructorStore.segment.width // Длина сегмента по оси Y
          };

      // Начинает линию от начальной точки сегмента
      graphics.moveTo(start.x, start.y);
      // Рисует линию до конечной точки сегмента
      graphics.lineTo(end.x, end.y);
    }

    // Применяет стиль к осевой линии (толщина и цвет)
    graphics.stroke({
      width: 1, // Толщина линии
      color: this.constructorStore.colorAxisLine // Цвет линии берется из хранилища
    });
  }

  // Метод для отрисовки сетки
  private drawGrid(): void {
    // Очищает графический объект перед началом рисования сетки
    this.gridLines.clear();
    
    // Получает текущую ширину области рендера
    const width = this.app.renderer.width;
    // Получает текущую высоту области рендера
    const height = this.app.renderer.height;
    
    // Рассчитывает количество вертикальных линий с учетом размера сетки
    const vLines = Math.ceil(width / this.gridStore.gridSize) + 2; // Добавляет две линии для создания эффекта "бесконечной" сетки
    // Рассчитывает количество горизонтальных линий с учетом размера сетки
    const hLines = Math.ceil(height / this.gridStore.gridSize) + 2; // Аналогично добавляет две линии
    
    // Определяет центр сцены (координаты начала системы координат)
    const centerScene = this.constructorStore.originOfCoordinates;
    
    // Отрисовка вертикальных линий
    this.drawLines(
      vLines, // Количество вертикальных линий
      (i) => {
        // Вычисляет позицию линии по X с учетом смещения и остатка от деления
        const positionX: number = (i * this.gridStore.gridSize) + (centerScene.x % this.gridStore.gridSize);
        return {
          startX: positionX, // Начальная координата X
          startY: -this.gridStore.gridSize, // Начальная координата Y чуть выше видимой области
          endX: positionX, // Конечная координата X совпадает с начальной
          endY: height + this.gridStore.gridSize, // Конечная координата Y чуть ниже видимой области
        };
      },
      this.gridStore.colorGrid // Цвет линий сетки
    );
    
    // Отрисовка горизонтальных линий
    this.drawLines(
      hLines, // Количество горизонтальных линий
      (i) => {
        // Вычисляет позицию линии по Y с учетом смещения и остатка от деления
        const positionY: number = (i * this.gridStore.gridSize) + (centerScene.y % this.gridStore.gridSize);
        return {
          startX: -this.gridStore.gridSize, // Начальная координата X чуть левее видимой области
          startY: positionY, // Начальная координата Y
          endX: width + this.gridStore.gridSize, // Конечная координата X чуть правее видимой области
          endY: positionY, // Конечная координата Y совпадает с начальной
        };
      },
      this.gridStore.colorGrid // Цвет линий сетки
    );
    
    // Вычисляет отступ для линейки на основе расстояния между сеткой и линейкой
    const offset = this.rulerStore.rulerSpace - this.gridStore.gridSize;
    // Устанавливает позицию сетки с учетом отступа
    this.gridLines.position.set(offset, offset);
  }

  // Метод для рисования линий (универсальный для горизонтальных и вертикальных)
  private drawLines(
    count: number, // Количество линий
    getPositions: (index: number) => { startX: number; startY: number; endX: number; endY: number }, // Функция для получения координат начала и конца линии
    color: number | string // Цвет линий
  ): void {
    // Цикл по количеству линий
    for (let i = 0; i < count; i++) {
      // Получает координаты начала и конца линии для текущего индекса
      const { startX, startY, endX, endY } = getPositions(i);
      // Устанавливает начальную точку линии
      this.gridLines.moveTo(startX, startY);
      // Рисует линию до конечной точки
      this.gridLines.lineTo(endX, endY);
    }
    // Применяет стиль линий (ширина и цвет)
    this.gridLines.stroke({
      width: 1, // Толщина линии
      color: color // Цвет линии
    });
  }

  // Метод для обработки изменений в хранилище конструктора
  private handleConstructorStoreChange(): void {
    // Перерисовывает сетку
    this.drawGrid();
    // Перерисовывает осевые линии
    this.drawGridAxisLines();
  }

}