// Импортируем необходимые модули и функции
import { watch } from "vue"; // Для отслеживания реактивных изменений
import * as PIXI from "pixi.js"; // Для работы с графикой
import { MathUtils } from "three"; // Для работы с математикой, например, преобразование градусов в радианы
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore"; // Магазин для хранения состояния 2D-конструктора
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore"; // Магазин для хранения состояния планировщика
import { useC2DInteractiveWallStore } from "@/store/constructor2d/store/useInteractiveWallStore"; // Магазин для работы с интерактивными объектами стен
import { PlannerObject } from "@/types/constructor2d/interfaсes"; // Интерфейс для объектов планировщика
import { configWall } from "@/store/constructor2d/data/usePlannerData"; // Конфигурация для стен
import { drawArrow } from "./../../utils/Shape"; // Утилита для отрисовки стрелки

export default class ArrowRulerActiveObject {
  // Основные свойства класса

  private app: PIXI.Application | null; // Экземпляр приложения PIXI
  private container: PIXI.Container | null; // Контейнер для размещения графических элементов

  // Графические объекты и текст для отображения измерений
  private xArrow: PIXI.Graphics | null = null; 
  private xText: PIXI.Text | null = null;

  private yArrow: PIXI.Graphics | null = null;
  private yText: PIXI.Text | null = null;

  // Магазины состояния
  private constructorStore: ReturnType<typeof useConstructor2DStore> | null = useConstructor2DStore();
  private plannerStore: ReturnType<typeof usePlanner2DStore> | null = usePlanner2DStore();
  private interactiveWallStore: ReturnType<typeof useC2DInteractiveWallStore> | null = useC2DInteractiveWallStore();

  // Массив для хранения функций отписки
  private unwatchList: (() => void)[] = [];

  // Конструктор класса
  constructor(pixiApp: PIXI.Application) {
    if (!pixiApp) throw new Error("PIXI.Application instance is required"); // Проверка на наличие PIXI-приложения

    this.app = pixiApp; // Сохраняем ссылку на приложение PIXI
    this.container = new PIXI.Container(); // Создаем контейнер для графических элементов
    this.container.x = 30; // Начальное положение контейнера по X
    this.container.y = 30; // Начальное положение контейнера по Y
    this.app.stage.addChild(this.container); // Добавляем контейнер на сцену PIXI

    // Создаем графику и текст для оси X
    this.xArrow = new PIXI.Graphics();
    this.container.addChild(this.xArrow);
    this.xText = new PIXI.Text({
      text: "", // Текст будет добавляться динамически
      style: {
        fontSize: 16, // Размер шрифта
        fill: 0x5d6069, // Цвет текста
      },
    });
    this.container.addChild(this.xText);

    // Создаем графику и текст для оси Y
    this.yArrow = new PIXI.Graphics();
    this.container.addChild(this.yArrow);
    this.yText = new PIXI.Text({
      text: "",
      style: {
        fontSize: 16,
        fill: 0x5d6069,
      },
    });
    this.container.addChild(this.yText);

    this.unwatchList.push(
      // Наблюдаем за изменениями в объектах планировщика
      watch(
        () => this.plannerStore!.objects.map((obj) => ({ ...obj })), // Слежение за массивом объектов
        (newVal, oldVal) => {
          newVal.forEach((newObject, index) => {
            const oldObject = oldVal?.[index];
            if(!oldObject || newObject.updateTime === oldObject.updateTime){
              if (oldObject && JSON.stringify(newObject) !== JSON.stringify(oldObject)) {
                // Если объект изменился, вызываем метод отрисовки
                const updatedObject = JSON.parse(JSON.stringify(newObject));
                this.draw(updatedObject);
              }
            }
          });
        },
        { deep: true } // Глубокое отслеживание изменений
      )
    );

    this.unwatchList.push(
      // Наблюдаем за изменением начальных координат
      watch(
        () => this.constructorStore!.originOfCoordinates,
        (newValue) => {
          // Перемещаем контейнер в новую позицию
          const cX = 30 + newValue.x;
          const cY = 30 + newValue.y;
          this.container!.position.set(cX, cY);
        },
        { deep: true }
      )
    );

    this.unwatchList.push(
      // Наблюдаем за активным объектом
      watch(
        () => this.interactiveWallStore!.activeObjectID,
        (newVal) => {
          if (newVal) {
            // Получаем активный объект и отрисовываем его
            const obj = JSON.parse(JSON.stringify(this.plannerStore!.getObjectById(newVal)));
            this.interactiveWallStore!.setActivePoint(0);
            this.draw(obj);
          }
        }
      )
    );

    this.unwatchList.push(
      // Наблюдаем за масштабом
      watch(
        () => this.constructorStore!.scale,
        (newValue) => {
          // Изменяем масштаб контейнера
          this.container!.scale.set(newValue);
        }
      )
    );
  }

  // Метод для отрисовки объекта
  public draw(obj: PlannerObject): void {
    if (!obj.points) return; // Если точек нет, выходим

    const position = obj.points[this.interactiveWallStore!.activePoint ?? 0]; // Получаем текущую точку

    this.container!.visible = true; // Делаем контейнер видимым

    // Очищаем предыдущую графику
    this.xArrow!.clear();
    this.xText!.text = "";
    this.yArrow!.clear();
    this.yText!.text = "";

    // Отрисовка вертикальной стрелки (ось Y)
    const distanceY = position.y;
    const rotateDegY = -90;
    drawArrow(
      this.xArrow!,
      position,
      distanceY,
      rotateDegY,
      configWall.color.tapeLineColor,
      0.6,
      12,
      true
    );
    this.xText!.text = `${Math.round((distanceY) * 10)} см`;
    this.xText!.x = (position.x) - 24;
    this.xText!.y = ((distanceY / 2) + (this.xText!.width / 2));
    this.xText!.rotation = MathUtils.degToRad(rotateDegY);

    // Отрисовка горизонтальной стрелки (ось X)
    const distanceX = position.x;
    const rotateDegX = 180;
    drawArrow(
      this.yArrow!,
      position,
      distanceX,
      rotateDegX,
      configWall.color.tapeLineColor,
      0.6,
      12,
      true
    );
    this.yText!.text = `${Math.round((distanceX) * 10)} см`;
    this.yText!.y = (position.y) - 24;
    this.yText!.x = ((distanceX / 2) - (this.yText!.width / 2));
  }

  // Метод для скрытия графики
  public clearGraphic(): void {
    this.container!.visible = false;
  }

  // Метод для очистки ресурсов и уничтожения объекта
  public destroy(): void {

    // Отписываемся от всех наблюдателей
    this.unwatchList.forEach(unwatch => unwatch());
    this.unwatchList = []; // Очищаем массив для безопасности

    if (this.xArrow) {
      this.xArrow.destroy(true);
      this.container!.removeChild(this.xArrow);
      this.xArrow = null;
    }
    if (this.xText) {
      this.xText.destroy(true);
      this.container!.removeChild(this.xText);
      this.xText = null;
    }
    if (this.yArrow) {
      this.yArrow.destroy(true);
      this.container!.removeChild(this.yArrow);
      this.yArrow = null;
    }
    if (this.yText) {
      this.yText.destroy(true);
      this.container!.removeChild(this.yText);
      this.yText = null;
    }
    if (this.app?.stage && this.container) {
      this.app.stage.removeChild(this.container);
    }
    if (this.container) {
      this.container.destroy({ children: true, texture: true });
      this.container = null;
    }
    this.constructorStore = null;
    this.plannerStore = null;
    this.interactiveWallStore = null;
    this.app = null;
  }
}
