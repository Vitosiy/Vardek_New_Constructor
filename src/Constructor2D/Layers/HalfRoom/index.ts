//@ts-nocheck
import * as PIXI from 'pixi.js';
// import { MathUtils } from "three";

import { 
  IHalfRoomData,
  IConfig
} from "./interfaces";

import { shape } from "@/Constructor2D/utils/Shape";

export default class HalfRoom {

  private app: PIXI.Application;
  private parent: any;
  private container: PIXI.Container;

  public config: IConfig = {
    half: {
      color: 0xECEBF1,
    }
  };

  private state: IState = {
    graphics: []
  };

  constructor(pixiApp: PIXI.Application, parent: any) {
      
    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.parent = parent;
    this.container = new PIXI.Container();
    this.container.x = 30;
    this.container.y = 30;
    this.app.stage.addChild(this.container);

  }

  // добавление пола комнаты и его редактирование
  public drawHalfRoom(roomList: IHalfRoomData[]):void {
    
    roomList.forEach((item) => {

      let halfRoom = this.state.graphics.find((el) => el.id === item.id);

      if( halfRoom === undefined) {
        halfRoom = {
          id: item.id,
          graphic: new PIXI.Graphics(),
        };
        this.state.graphics.push(halfRoom);
        this.container.addChild(halfRoom.graphic);
      }

      halfRoom.graphic.clear();

      shape(halfRoom.graphic, item.points, this.config.half.color);
      
    });

  }

  // удаление пола комнаты
  public removeHalfRoom(id: string | number | null = null):void {
    
    if (id === null) {
      this.state.graphics.forEach((item) => {
        this.container.removeChild(item.graphic);
        item.graphic.destroy();
      });
      this.state.graphics = [];
      return;
    }
    
    // удаляем пол комнаты по id
    // находим индекс элемента в массиве
    // если индекс не -1, то удаляем элемент из массива и из контейнера
    // удаляем графику из контейнера
    // удаляем графику из массива
    const index = this.state.graphics.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.container.removeChild(this.state.graphics[index].graphic);
      this.state.graphics[index].graphic.destroy();
      this.state.graphics.splice(index, 1);
    }

  }

  public updateScenePosition(): void {

    this.container!.x = this.parent.config.originOfCoordinates.x + 30;
    this.container!.y = this.parent.config.originOfCoordinates.y + 30;
    
  }

  public set scale(v: number) {
    this.container!.scale.set(v);
  }

  public destroy():void {
    this.container.destroy();
    
    this.state.graphics.forEach((item) => {
      this.container.removeChild(item.graphic);
      item.graphic.destroy();
    });
    this.state.graphics = [];

    this.container = null;
    this.app = null;
    this.parent = null;
  }

};