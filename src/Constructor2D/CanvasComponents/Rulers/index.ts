import {
  watch
} from 'vue';
import * as PIXI from 'pixi.js';
import { MathUtils } from "three";
import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";

export default class Rulers {
  
  private app: PIXI.Application; // Экземпляр приложения PIXI, используется для управления графикой и сценой
  private container: PIXI.Container; // Главный контейнер для всех элементов линейки (графика, текстовые метки)
  
  private topRulerSegmentsGraphics: PIXI.Graphics; // Графика для отображения сегментов верхней линейки
  private topRulerSegmentNumbers: PIXI.Container; // Контейнер для числовых меток верхней линейки
  
  private leftRulerSegmentsGraphics: PIXI.Graphics; // Графика для отображения сегментов левой линейки
  private leftRulerSegmentNumbers: PIXI.Container; // Контейнер для числовых меток левой линейки
  
  private pureSquareGraphics: PIXI.Graphics; // Графика для отображения квадрата начала координат (точка пересечения осей)
  
  private rulerStore = useRulers2DStore(); // Стор для управления состоянием и параметрами линейки
  private constructorStore = useConstructor2DStore(); // Стор для управления состоянием конструктора 2D  

  private visibleTextRuler: boolean = true;
  private limitMaxSegmentsForText = 15;

  // Массив для хранения функций отписки
  private unwatchList: (() => void)[] = [];

  constructor(pixiApp: PIXI.Application) {

    if (!pixiApp) { // Проверяем, был ли передан экземпляр PIXI.Application
      throw new Error("PIXI.Application instance is required"); // Если не передан, выбрасываем ошибку
    }
    
    this.app = pixiApp; // Присваиваем переданный экземпляр PIXI.Application переменной app
    
    this.container = new PIXI.Container(); // Создаём новый контейнер для всех элементов линейки
    this.app.stage.addChild(this.container); // Добавляем этот контейнер на сцену приложения PIXI
    
    this.topRulerSegmentsGraphics = new PIXI.Graphics(); // Инициализируем графику для сегментов верхней линейки
    this.container.addChild(this.topRulerSegmentsGraphics); // Добавляем графику верхней линейки в контейнер
    
    this.topRulerSegmentNumbers = new PIXI.Container(); // Создаём контейнер для числовых меток верхней линейки
    this.container.addChild(this.topRulerSegmentNumbers); // Добавляем контейнер с метками в общий контейнер
    
    this.leftRulerSegmentsGraphics = new PIXI.Graphics(); // Инициализируем графику для сегментов левой линейки
    this.container.addChild(this.leftRulerSegmentsGraphics); // Добавляем графику левой линейки в контейнер
    
    this.leftRulerSegmentNumbers = new PIXI.Container(); // Создаём контейнер для числовых меток левой линейки
    this.container.addChild(this.leftRulerSegmentNumbers); // Добавляем контейнер с метками в общий контейнер
    
    this.pureSquareGraphics = new PIXI.Graphics(); // Инициализируем графику для квадрата начала координат
    this.container.addChild(this.pureSquareGraphics); // Добавляем графику квадрата в общий контейнер
    
    // this.constructorStore.$subscribe(() => { // Подписываемся на изменения в состоянии конструктора
    //   this.handleConstructorStoreChange(); // Вызываем метод для обработки изменений в состоянии конструктора
    // });
    
    this.init(); // Вызываем метод инициализации (рисование линейки и квадрата)

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
        () => this.constructorStore.scale,
        (scale) => {

          // const width = (this.app.renderer.width - 30) * this.constructorStore.getInverseScale; // Вычисляем доступную ширину линейки по холсту

          // const segmentSize = this.rulerStore.getSegmentSize * (1 / scale); // размер деления линейки (сегмент линейки)егмента линейки)
          
          // let countSegments = Math.ceil(width / segmentSize); // получаем количество сегментов

          // console.log("countSegments:", this.app.renderer.width, scale, countSegments);

          // const cs = Math.ceil(width*widthInverse) / (segmentSize * scale));

          // this.rulerStore.setSegmentSize(segmentSize * scale);
          // this.rulerStore.setTextSegment(i * cs);

          /*
          if(countSegments > 10){

            for(let i=2;;i++){

              const cs = Math.ceil(width / ((segmentSize * i) * scale));
              
              if(cs > 20){
                
                this.rulerStore.setSegmentSize(ss);
                this.rulerStore.setTextSegment(i * cs);
                
                break;
              }
              
            }

          }
          */
      
          this.drawRulers(); // Перерисовываем линейки
        }
      )
    );
  
  }

  private init(): void { // Метод инициализации линейки и элементов
    this.drawRulers(); // Вызываем метод для рисования верхней и левой линейки

    this.drawPureSquare(); // Рисуем квадрат в точке пересечения линеек
  }

  public drawRulers(): void { // Метод для рисования всех линеек

    if(!this.app || !this.app.renderer) return;
    
    this.visibleTextRuler = true;

    { // count top segments
      const width = this.app.renderer.width - this.rulerStore.rulerSpace;
      const segmentWidth = this.rulerStore.segmentSize * this.constructorStore.getScale;
      const countSegments = Math.ceil(width / segmentWidth);
      if(countSegments >= this.limitMaxSegmentsForText) this.visibleTextRuler = false;
    }

    { // count legt segments
      const length = this.app.renderer.height - this.rulerStore.rulerSpace;
      const segmentWidth = this.rulerStore.segmentSize * this.constructorStore.getScale;
      const countSegments = Math.ceil(length / segmentWidth);
      if(countSegments >= this.limitMaxSegmentsForText) this.visibleTextRuler = false;
    }
    
    this.drawTopRuler(); // Вызываем метод для рисования верхней линейки
    this.drawLeftRuler(); // Вызываем метод для рисования левой линейки
  }

  public drawPureSquare(): void { // Метод для рисования квадрата пересечения линеек

    const size = this.rulerStore.rulerSpace; // Получаем размер квадрата из стора линейки
    const color = this.rulerStore.edgeColor; // Получаем цвет линий из стора линейки

    this.pureSquareGraphics.rect(0, 0, size, size); // Создаём прямоугольник с координатами (0, 0) и размером size
    this.pureSquareGraphics.fill(0xffffff); // Заливаем квадрат белым цветом

    this.pureSquareGraphics.moveTo(0, size); // Устанавливаем начальную точку линии снизу в (0, size)
    this.pureSquareGraphics.lineTo(size, size); // Рисуем линию снизу от (0, size) до (size, size)
    this.pureSquareGraphics.stroke({ color: color }); // Применяем цвет линии для нижней границы

    this.pureSquareGraphics.moveTo(size, size); // Устанавливаем начальную точку линии справа в (size, size)
    this.pureSquareGraphics.lineTo(size, 0); // Рисуем линию справа от (size, size) до (size, 0)
    this.pureSquareGraphics.stroke({ color: color }); // Применяем цвет линии для правой границы

  }

  private drawTopRuler(): void { // Метод для рисования верхней линейки
    const startRulerCoordinatesX = this.constructorStore.originOfCoordinates.x + 30; // Определяем начальную координату нуля по оси X

    this.topRulerSegmentsGraphics.clear(); // Очищаем графику сегментов верхней линейки
    this.topRulerSegmentNumbers.removeChildren(); // Удаляем все числовые метки верхней линейки

    const height = this.rulerStore.rulerSpace; // Получаем высоту линейки из стора линейки
    const width = this.app.renderer.width - height; // Вычисляем доступную ширину линейки
    const startPositionX = height; // Устанавливаем начальную позицию X для рисования линейки
    const color = this.rulerStore.edgeColor; // Устанавливаем цвет линий линейки из стора линейки
    const segmentWidth = this.rulerStore.segmentSize * this.constructorStore.getScale; // Получаем ширину одного сегмента линейки

    this.topRulerSegmentsGraphics.rect(startPositionX, 0, width, height); // Рисуем прямоугольник фона линейки
    this.topRulerSegmentsGraphics.fill({ color: 0xffffff }); // Заливаем фон белым цветом

    const rightDistance = startRulerCoordinatesX - height; // Вычисляем расстояние от нуля до левого края линейки

    const leftSegmentsCount = Math.ceil(rightDistance / segmentWidth); // Вычисляем количество сегментов слева от нуля
    const rightSegmentsCount = Math.ceil((width - rightDistance) / segmentWidth); // Вычисляем количество сегментов справа от нуля

    for (let i = 0; i <= leftSegmentsCount; i++) { // Цикл для рисования сегментов слева от нуля
      const x = startRulerCoordinatesX - i * segmentWidth; // Определяем координату X текущего сегмента

      this.topRulerSegmentsGraphics.moveTo(x, 0); // Начало вертикальной линии сегмента
      this.topRulerSegmentsGraphics.lineTo(x, height); // Конец вертикальной линии сегмента
      this.topRulerSegmentsGraphics.stroke({ color: color }); // Рисуем вертикальную линию

      this.topRulerSegmentsGraphics.moveTo(x, height); // Начало горизонтальной линии сегмента
      this.topRulerSegmentsGraphics.lineTo(x - segmentWidth, height); // Конец горизонтальной линии сегмента
      this.topRulerSegmentsGraphics.stroke({ color: color }); // Рисуем горизонтальную линию

      if(this.visibleTextRuler){
        if (i > 0) { // Проверяем, что сегмент не первый, чтобы добавить метку
          const label = new PIXI.Text({ // Создаём текстовую метку
            text: `${-i * this.rulerStore.getTextSegment * 10}`, // Текст метки, вычисляется как отрицательная координата
            style: {
              fontSize: 16, // Размер текста метки
              fill: color, // Цвет текста метки
            }
          });
          label.x = x - label.width - 5; // Устанавливаем позицию метки слева от линии сегмента
          label.y = height / 2 - label.height / 2; // Центрируем метку по вертикали линейки
          this.topRulerSegmentNumbers.addChild(label); // Добавляем метку в контейнер
        }
      }
    }

    for (let i = 0; i <= rightSegmentsCount; i++) { // Цикл для рисования сегментов справа от нуля
      const x = startRulerCoordinatesX + i * segmentWidth; // Определяем координату X текущего сегмента

      this.topRulerSegmentsGraphics.moveTo(x, 0); // Начало вертикальной линии сегмента
      this.topRulerSegmentsGraphics.lineTo(x, height); // Конец вертикальной линии сегмента
      this.topRulerSegmentsGraphics.stroke({ color: color }); // Рисуем вертикальную линию

      if (i > 0) { // Проверяем, что сегмент не первый, чтобы нарисовать горизонтальную линию
        this.topRulerSegmentsGraphics.moveTo(x - segmentWidth, height); // Начало горизонтальной линии сегмента
        this.topRulerSegmentsGraphics.lineTo(x, height); // Конец горизонтальной линии сегмента
        this.topRulerSegmentsGraphics.stroke({ color: color }); // Рисуем горизонтальную линию
      } else {
        this.topRulerSegmentsGraphics.moveTo(startRulerCoordinatesX, height); // Начало горизонтальной линии от нуля
        this.topRulerSegmentsGraphics.lineTo(x, height); // Конец горизонтальной линии первого сегмента
        this.topRulerSegmentsGraphics.stroke({ color: color }); // Рисуем горизонтальную линию
      }

      if(this.visibleTextRuler){
        const label = new PIXI.Text({ // Создаём текстовую метку
          text: `${i * this.rulerStore.getTextSegment * 10}`, // Текст метки, вычисляется как положительная координата
          style: {
            fontSize: 16, // Размер текста метки
            fill: color, // Цвет текста метки
          }
        });
        label.x = x + 5; // Устанавливаем позицию метки справа от линии сегмента
        label.y = height / 2 - label.height / 2; // Центрируем метку по вертикали линейки
        this.topRulerSegmentNumbers.addChild(label); // Добавляем метку в контейнер
      }
    }
  }

  private drawLeftRuler(): void { // Метод для рисования левой линейки
    const startRulerCoordinatesX = this.constructorStore.originOfCoordinates.y + 30; // Устанавливаем точку отсчета 0 по оси Y

    this.leftRulerSegmentsGraphics.clear(); // Очищаем графику для сегментов левой линейки
    this.leftRulerSegmentNumbers.removeChildren(); // Удаляем все метки из контейнера числовых меток

    const width = this.rulerStore.rulerSpace; // Получаем ширину левой линейки из стора
    const height = this.app.renderer.height - width; // Рассчитываем доступную высоту для левой линейки

    const startPositionY = width; // Определяем начальную позицию по оси Y
    const color = this.rulerStore.edgeColor; // Устанавливаем цвет линий левой линейки из стора

    const segmentHeight = this.rulerStore.segmentSize * this.constructorStore.getScale; // Получаем высоту одного сегмента линейки

    this.leftRulerSegmentsGraphics.rect(0, startPositionY, width, height); // Рисуем фон левой линейки в виде прямоугольника
    this.leftRulerSegmentsGraphics.fill({ color: 0xffffff }); // Заливаем фон белым цветом

    const zeroOffset = startRulerCoordinatesX; // Рассчитываем расстояние от нуля до верхнего края линейки

    const topSegmentsCount = Math.ceil(zeroOffset / segmentHeight); // Рассчитываем количество сегментов выше нуля
    const bottomSegmentsCount = Math.ceil((height - zeroOffset) / segmentHeight); // Рассчитываем количество сегментов ниже нуля

    for (let i = 0; i <= topSegmentsCount; i++) { // Цикл для рисования сегментов выше нуля
      const y = startRulerCoordinatesX - i * segmentHeight; // Вычисляем координату Y текущего сегмента

      this.leftRulerSegmentsGraphics.moveTo(0, y); // Устанавливаем начальную точку горизонтальной линии сегмента
      this.leftRulerSegmentsGraphics.lineTo(width, y); // Рисуем горизонтальную линию сегмента
      this.leftRulerSegmentsGraphics.stroke({ color: color }); // Применяем цвет линии

      this.leftRulerSegmentsGraphics.moveTo(width, y); // Устанавливаем начальную точку вертикальной линии
      this.leftRulerSegmentsGraphics.lineTo(width, y - segmentHeight); // Рисуем вертикальную линию сегмента
      this.leftRulerSegmentsGraphics.stroke({ color: color }); // Применяем цвет линии

      if(this.visibleTextRuler){
        if (i > 0) { // Условие: текстовую метку добавляем только если это не первый сегмент
          const label = new PIXI.Text({ // Создаём текстовую метку для сегмента
            text: `${-i * this.rulerStore.getTextSegment * 10}`, // Значение метки (отрицательное для сегментов выше нуля)
            style: {
              fontSize: 16, // Устанавливаем размер шрифта
              fill: color, // Устанавливаем цвет текста
            }
          });

          label.x = width / 1.25; // Устанавливаем позицию текста по оси X внутри линейки
          label.y = y + 10; // Устанавливаем позицию текста по оси Y с небольшим отступом
          label.anchor.set(1, 1); // Устанавливаем якорную точку для текста
          label.rotation = MathUtils.degToRad(-90); // Поворачиваем текст на -90 градусов для вертикального отображения

          this.leftRulerSegmentNumbers.addChild(label); // Добавляем текстовую метку в контейнер
        }
      }
    }

    for (let i = 0; i <= bottomSegmentsCount; i++) { // Цикл для рисования сегментов ниже нуля
      const y = startRulerCoordinatesX + i * segmentHeight; // Вычисляем координату Y текущего сегмента

      this.leftRulerSegmentsGraphics.moveTo(0, y); // Устанавливаем начальную точку горизонтальной линии сегмента
      this.leftRulerSegmentsGraphics.lineTo(width, y); // Рисуем горизонтальную линию сегмента
      this.leftRulerSegmentsGraphics.stroke({ color: color }); // Применяем цвет линии

      this.leftRulerSegmentsGraphics.moveTo(width, y); // Устанавливаем начальную точку вертикальной линии
      this.leftRulerSegmentsGraphics.lineTo(width, y + segmentHeight); // Рисуем вертикальную линию сегмента
      this.leftRulerSegmentsGraphics.stroke({ color: color }); // Применяем цвет линии

      if(this.visibleTextRuler){
        const label = new PIXI.Text({ // Создаём текстовую метку для сегмента
          text: `${i * this.rulerStore.getTextSegment * 10}`, // Значение метки (положительное для сегментов ниже нуля)
          style: {
            fontSize: 16, // Устанавливаем размер шрифта
            fill: color, // Устанавливаем цвет текста
          }
        });

        label.x = width / 1.25; // Устанавливаем позицию текста по оси X внутри линейки
        label.y = y + 10; // Устанавливаем позицию текста по оси Y с небольшим отступом
        label.anchor.set(1, 1); // Устанавливаем якорную точку для текста
        label.rotation = MathUtils.degToRad(-90); // Поворачиваем текст на -90 градусов для вертикального отображения

        this.leftRulerSegmentNumbers.addChild(label); // Добавляем текстовую метку в контейнер
      }
    }

  }

  private handleConstructorStoreChange(): void { // Метод для обработки изменений в состоянии конструктора

    this.drawRulers(); // Перерисовываем линейки при изменении данных в сторе конструктора

  }

  public destroy(): void {

    // Отписываемся от всех наблюдателей
    this.unwatchList.forEach(unwatch => unwatch());
    this.unwatchList = []; // Очищаем массив для безопасности
    
    // Очистка верхней линейки
    if (this.topRulerSegmentsGraphics) {
      this.topRulerSegmentsGraphics.destroy(true);
      this.container.removeChild(this.topRulerSegmentsGraphics);
    }
    if (this.topRulerSegmentNumbers) {
      this.topRulerSegmentNumbers.destroy(true);
      this.container.removeChild(this.topRulerSegmentNumbers);
    }

    // Очистка левой линейки
    if (this.leftRulerSegmentsGraphics) {
      this.leftRulerSegmentsGraphics.destroy(true);
      this.container.removeChild(this.leftRulerSegmentsGraphics);
    }
    if (this.leftRulerSegmentNumbers) {
      this.leftRulerSegmentNumbers.destroy(true);
      this.container.removeChild(this.leftRulerSegmentNumbers);
    }

    // Очистка квадрата начала координат
    if (this.pureSquareGraphics) {
      this.pureSquareGraphics.destroy(true);
      this.container.removeChild(this.pureSquareGraphics);
    }

    // Очистка контейнера
    if (this.container) {
      this.container.destroy({ children: true, texture: true });
      this.container = null!;
    }

    // Обнуление ссылок
    this.app = null!;
  }

}
