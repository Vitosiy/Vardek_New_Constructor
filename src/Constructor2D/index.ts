import * as PIXI from 'pixi.js';

export default class Constructor2D {

  container: HTMLElement;
  canvas: HTMLElement;

  app2d: any;

  constructor(container: HTMLElement, canvas: HTMLElement) {

    this.container = container;
    this.canvas = canvas

  }

  async init() {

    if(!this.app2d){

      this.app2d = new PIXI.Application();
      await this.app2d.init({
        resizeTo: this.canvas,
        backgroundColor: '#ffffff',
        antialias: true,
        // autoDensity: true, // !!!
        resolution: 2,
        canvas: this.canvas,
      });
      this.app2d.stage.hitArea = this.app2d.screen;
      this.app2d.stage.eventMode = 'static'; // ???

      this.app2d.renderer.resize(window.innerWidth, window.innerHeight);
      window.addEventListener('resize', () => {
        if (this.app2d) {
          this.app2d.renderer.resize(window.innerWidth, window.innerHeight);
        }
      });


    }
    
  }

}