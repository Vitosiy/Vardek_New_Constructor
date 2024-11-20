import * as PIXI from 'pixi.js';

export default class Constructor2D {

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private app2d: PIXI.Application | null = null;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {

    this.container = container;
    this.canvas = canvas;

  }

  async init(): Promise<void> {

    if (this.app2d) return; // Если уже инициализировано, ничего не делаем

    this.app2d = new PIXI.Application();
    await this.app2d.init({
      canvas: this.canvas,
      resizeTo: this.container, // Подгоняем размеры под контейнер
      backgroundColor: 0xffffff, // Белый фон
      antialias: true, // Сглаживание
      resolution: window.devicePixelRatio || 1, // Разрешение устройства
    });
    this.app2d.stage.hitArea = this.app2d.screen;
    this.app2d.stage.eventMode = 'static'; // ???

    // Обработчик изменения размера окна
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
    
  }

  private handleResize(): void {
    if (this.app2d) {
      this.app2d.renderer.resize(this.container.clientWidth, this.container.clientHeight);
    }
  }

  /*
  Очистка ресурсов (например, при удалении компонента):
  Метод destroy удаляет экземпляр PIXI и все связанные ресурсы, а также удаляет обработчик события resize, 
  чтобы предотвратить утечки памяти.
  */
  destroy(): void {
    if (this.app2d) {
      // Удаляем обработчик событий
      window.removeEventListener('resize', this.handleResize.bind(this));
      this.app2d.destroy(true, { children: true });
      this.app2d = null;
    }
  }

}