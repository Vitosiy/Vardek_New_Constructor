import * as PIXI from 'pixi.js';

import {
  angleBetweenTwoVectors,
  rotateVector
} from "./../../Utils/Math";

import { 
  MathUtils,
  Vector2
} from "three";

/*
interface originOfCoordinates {
  x: number;
  y: number;
}

interface segment {
  indent: number,
  width: number
}
*/

interface pointPosition {
  x: number,
  y: number
}

interface walls {
  id: string,
  startPoint: pointPosition,
  endPoint: pointPosition,
  container: any | null,
  graphics: any | null
}

export default class Planner {

  PIXIApplication: any;

  container: any;

  drawContainer: any;

  tapeLineArrow: any;
  tapeLineText: any;

  activePoint: any;

  eventContainer: any;

  lineColor: string | number = "#DA444C"; // красный
  arrowСolor0: string | number = "#B19F53"; // золотой цвет
  arrowColor1: string | number = "#B6887E"; // светло-коричневый цвет
  arrowColor2: string | number = "#4285F4"; // голубой цвет
  arrowColor3: string | number = "#B6887E";
  arrowColor4: string | number = "#8BDE84"; // зеленый цвет
  tapeLineColor: string | number = 0x5D6069;

  arrowWidth: number = 12; // гирина стрелки
  arrowHeight: number = 10; // высота стрелки

  textNumberStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontSize: 16,
    fill: 0x5D6069
  });

  drawMode: number = 0; // 0 - рисование выключено, 1 - рисование включено

  drawWallID: string | null = null;

  activeWallRotate: number = Math.PI/2;

  plannerZoomValue: number = 1;

  testPoint: any = null;
  
  walls: walls[] = [];

  // какой товар нужно добавлять при интерактивности (например, стену)
  activeGood: string = '';

  constructor(pixiApp: any = null) {

    if(pixiApp){

      this.PIXIApplication = pixiApp;

      this.init();

    }
    
  }

  public set zoomValue (value: number) {

    this.plannerZoomValue = value;

  }

  private init(): void{

    if(!this.container){

      this.container = new PIXI.Container();
      this.container.eventMode = 'static';
      this.PIXIApplication.stage.addChild(this.container);
      
      this.initEventContainer();
      
      this.drawContainer = new PIXI.Container();
      this.drawContainer.eventMode = 'static';

      this.tapeLineArrow = new PIXI.Graphics();
      this.tapeLineArrow.eventMode = 'static';
      this.drawContainer.addChild(this.tapeLineArrow);
      
      this.tapeLineText = new PIXI.Container();
      this.tapeLineText.eventMode = 'static';
      this.drawContainer.addChild(this.tapeLineText);

      this.activePoint = new PIXI.Graphics();
      this.activePoint.eventMode = 'static';
      this.drawContainer.addChild(this.activePoint);

      this.container.addChild(this.drawContainer);
      
      // this.interaction();
      
    }
    
  }

  private initEventContainer(): void{

    const gWidth: number = this.PIXIApplication.canvas.width;
    const gHeight: number = this.PIXIApplication.canvas.height;

    this.eventContainer = new PIXI.Graphics()
      .rect(0, 0, gWidth, gHeight)
      .fill({color: 0xff0000, alpha: 0});
      
    this.eventContainer.pivot.x = gWidth / 2;
    this.eventContainer.pivot.y = gHeight / 2;

    this.eventContainer.x = gWidth / 2;
    this.eventContainer.y = gHeight / 2;
      
    this.eventContainer.eventMode = 'static';
    // obj.cursor = 'pointer';
      
    this.container.addChild(this.eventContainer);

  }

  addWall(startPointX: number, startPointY: number, endPointX: number, endPointY: number): string | number{

    const id = MathUtils.generateUUID();

    const wallContainer = new PIXI.Container();
    wallContainer.eventMode = 'static';

    this.activeWallRotate = angleBetweenTwoVectors({
      x: startPointX,
      y: startPointY
    }, {
      x: endPointX,
      y: endPointY
    });
    
    this.walls.push({
      id: id,
      startPoint: {
        x: startPointX,
        y: startPointY
      },
      endPoint: {
        x: endPointX,
        y: endPointY
      },
      container: wallContainer,
      graphics: {
        line: new PIXI.Graphics(),
        
        containerBodyWall: new PIXI.Graphics(),
        bodyWall: new PIXI.Graphics(),
        borderWall: new PIXI.Graphics(),

        text: {}
      }
    });

    const wall = this.walls.find(el => el.id === id);

    wall!.container.addChild(wall!.graphics.containerBodyWall);
    wall!.container.addChild(wall!.graphics.bodyWall);
    wall!.container.addChild(wall!.graphics.borderWall);
    
    wall!.container.addChild(wall!.graphics.line);

    this.drawContainer.addChild(wall!.container);

    this.drawWallID = id;

    return this.drawWallID;

  }

  // линия-рулетка с размерами | 2 черные стрелки от объекта к осям
  drawTapeLineArrow(id: string): void {

    const wall = this.walls.find(el => el.id === id);
    
    const graphic = this.tapeLineArrow;
    graphic.clear();
    const graphicText = this.tapeLineText;
    
    const start: pointPosition = {
      x: wall!.startPoint.x - this.drawContainer.position.x * (1 / this.drawContainer.scale.x),
      y: wall!.startPoint.y - this.drawContainer.position.y * (1 / this.drawContainer.scale.x)
    };

    { // vertical line

      const end: pointPosition = {
        x: wall!.startPoint.x - this.drawContainer.position.x * (1 / this.drawContainer.scale.x),
        y: 30
      };

      { // линия стрелки
        graphic.moveTo(start.x, start.y);
        graphic.lineTo(start.x, 30);
        graphic.stroke({ width: 1, color: this.tapeLineColor });
      }
      
      { // стрелка вектора | конец линии

        const p0: any = {
          x: end.x, 
          y: end.y
        };
        const _p1: any = {
          x: end.x - this.arrowWidth, 
          y: end.y + this.arrowHeight / 2
        };
        const _p2: any = {
          x: end.x - this.arrowWidth, 
          y: end.y - this.arrowHeight / 2
        };

        let p1: any = rotateVector(p0, _p1, MathUtils.degToRad(90));
        let p2: any = rotateVector(p0, _p2, MathUtils.degToRad(90));

        graphic.moveTo(p0.x, p0.y);
        graphic.lineTo(p1.x, p1.y);
        graphic.lineTo(p2.x, p2.y);
        graphic.fill({color: this.tapeLineColor});

      }

      { // текст растояние от оси к объекту

        const v0: any = new Vector2(start.x, start.y);
        const v1: any = new Vector2(end.x, end.y);
        const distance: number = v0.distanceTo(v1).toFixed(1);
        
        if(!graphicText.children[0]){

          const text = new PIXI.Text({
            text: distance*10+" cm",
            style: this.textNumberStyle
          });
          text.x = start.x - 7;
          text.y = distance / 2;
          
          text.anchor.set(1, 1);
          text.rotation = MathUtils.degToRad(-90);
          
          graphicText.addChild(text);
          
        }else{

          graphicText.children[0].text = distance*10+" cm";
          graphicText.children[0].x = start.x - 7;
          graphicText.children[0].y = distance / 2;
          
        }
        
      }

    }

    { // horizontal line

      const end: pointPosition = {
        x: 30,
        y: wall!.startPoint.y - this.drawContainer.position.y
      };

      { // линия стрелки
        graphic.moveTo(start.x, start.y);
        graphic.lineTo(30, start.y);
        graphic.stroke({ width: 1, color: this.tapeLineColor });
      }
      
      { // стрелка вектора | конец линии

        const p0: any = {
          x: end.x, 
          y: end.y
        };
        const _p1: any = {
          x: end.x - this.arrowWidth, 
          y: end.y + this.arrowHeight / 2
        };
        const _p2: any = {
          x: end.x - this.arrowWidth, 
          y: end.y - this.arrowHeight / 2
        };

        let p1: any = rotateVector(p0, _p1, MathUtils.degToRad(180));
        let p2: any = rotateVector(p0, _p2, MathUtils.degToRad(180));

        graphic.moveTo(p0.x, p0.y);
        graphic.lineTo(p1.x, p1.y);
        graphic.lineTo(p2.x, p2.y);
        graphic.fill({color: this.tapeLineColor});

      }

      { // текст растояние от оси к объекту

        const v0: any = new Vector2(start.x, start.y);
        const v1: any = new Vector2(end.x, end.y);
        const distance: number = v0.distanceTo(v1).toFixed(1);
        
        if(!graphicText.children[1]){

          const text = new PIXI.Text({
            text: distance*10+" cm",
            style: this.textNumberStyle
          });
          text.x = distance / 2;
          text.y = start.y - (16+7);
          
          graphicText.addChild(text);
          
        }else{

          graphicText.children[1].text = distance*10+" cm";
          graphicText.children[1].x = distance / 2;
          graphicText.children[1].y = start.y - (16+7);
          
        }
        
      }

    }

  }

  drawWall(id: string): void {

    const wall = this.walls.find(el => el.id === id);
    
    const graphicVector = wall!.graphics.line;
    
    graphicVector.clear();
    
    const start: pointPosition = {
      x: wall!.startPoint.x - this.drawContainer.position.x * (1 / this.drawContainer.scale.x),
      y: wall!.startPoint.y - this.drawContainer.position.y * (1 / this.drawContainer.scale.x)
    };
    const end: pointPosition = {
      x: wall!.endPoint.x - this.drawContainer.position.x * (1 / this.drawContainer.scale.x),
      y: wall!.endPoint.y - this.drawContainer.position.y * (1 / this.drawContainer.scale.x)
    };
    
    { // template wall | test
      const vectorStart: pointPosition = {
        x: start.x + this.drawContainer.position.x,
        y: start.y + this.drawContainer.position.y
      }
      const vectorEnd: pointPosition = {
        x: end.x + this.drawContainer.position.x,
        y: end.y + this.drawContainer.position.y
      }
      this.activeWallRotate = angleBetweenTwoVectors(vectorStart, vectorEnd);

      { // главная стрелка

        { // линия стрелки
          graphicVector.moveTo(start.x, start.y);
          graphicVector.lineTo(end.x, end.y);
          graphicVector.stroke({ width: 1, color: this.lineColor });
        }

        { // стрелка вектора | конец линии

          const p0: any = {
            x: end.x, 
            y: end.y
          };
          const _p1: any = {
            x: end.x - this.arrowWidth, 
            y: end.y + this.arrowHeight / 2
          };
          const _p2: any = {
            x: end.x - this.arrowWidth, 
            y: end.y - this.arrowHeight / 2
          };

          let p1: any = rotateVector(p0, _p1, this.activeWallRotate);
          let p2: any = rotateVector(p0, _p2, this.activeWallRotate);

          graphicVector.moveTo(p0.x, p0.y);
          graphicVector.lineTo(p1.x, p1.y);
          graphicVector.lineTo(p2.x, p2.y);
          graphicVector.fill({color: this.arrowСolor0});

        }

        { // начало вектора | голубая точка 10х10

          graphicVector.circle(start.x, start.y, 5);
          graphicVector.fill({ color: this.arrowColor2 });

        }

      }

    }
    
  }

  drawActiveEndPoint(id: string | null, visible: boolean = true): void {

    const wall = this.walls.find(el => el.id === id);
    
    const graphicEndPoint = this.activePoint;
    
    graphicEndPoint.clear();

    // вкл/выкл видимость 
    const alpha: number = visible ? 1 : 0;

    const point: pointPosition = {
      x: wall!.startPoint.x - this.drawContainer.position.x * (1 / this.drawContainer.scale.x),
      y: wall!.startPoint.y - this.drawContainer.position.y * (1 / this.drawContainer.scale.x)
    };

    const sizeRect: number = 10;

    { // красный квадрат | конец вектора | показывается, если активна

      graphicEndPoint.pivot.x = sizeRect/2;
      graphicEndPoint.pivot.y = sizeRect/2;
      
      graphicEndPoint.rect(0, 0, sizeRect, sizeRect);
      graphicEndPoint.stroke({ width: 1, color: this.lineColor, alpha: alpha });

      graphicEndPoint.position.x = point.x;
      graphicEndPoint.position.y = point.y;
      
      graphicEndPoint.rotation = this.activeWallRotate * -1;
      
    }
    
  }

  drawBodyWall(id: string): void {

    const wall = this.walls.find(el => el.id === id);

    const wallThickness: number = 30;
    
    const start: pointPosition = {
      x: wall!.startPoint.x - this.drawContainer.position.x * (1 / this.drawContainer.scale.x),
      y: wall!.startPoint.y - this.drawContainer.position.y * (1 / this.drawContainer.scale.x)
    };
    const end: pointPosition = {
      x: wall!.endPoint.x - this.drawContainer.position.x * (1 / this.drawContainer.scale.x),
      y: wall!.endPoint.y - this.drawContainer.position.y * (1 / this.drawContainer.scale.x)
    };

    const v0: any = new Vector2(start.x, start.y);
    const v1: any = new Vector2(end.x, end.y);
    const distance: number = v0.distanceTo(v1);
    
    { // containerBodyWall
      const containerBodyWall = wall!.graphics.containerBodyWall;
      containerBodyWall.clear();

      // containerBodyWall.pivot.x = distance;
      containerBodyWall.pivot.y = wallThickness;
      containerBodyWall.rect(0, 0, distance, wallThickness);
      containerBodyWall.fill("#A3A9B5");

      containerBodyWall.position.x = start.x;
      containerBodyWall.position.y = start.y;
      
      containerBodyWall.rotation = this.activeWallRotate * -1;
    }
    
    { // bodyWall | degress 76
      const bodyWall = wall!.graphics.bodyWall;
      bodyWall.clear();

      const space: number = 30;

      const segments: number = Number((distance / space).toFixed())+2;

      for(let i=0; i<segments; i++){

        const v: pointPosition = rotateVector(
          {
            x: space*i,
            y: 0
          },
          {
            x: space*i,
            y: wallThickness*2
          },
          -76
        );

        bodyWall.moveTo(space*i, 0);
        bodyWall.lineTo(v.x, v.y);
        bodyWall.stroke({ width: 1, color: "#A3A9B5" });
        
      }

      bodyWall.position.x = start.x;
      bodyWall.position.y = start.y;
      
      bodyWall.rotation = this.activeWallRotate * -1;

      wall!.graphics.containerBodyWall.mask = bodyWall;
      
    }
    
    { // borderWall | #5D6069
      const borderWall = wall!.graphics.borderWall;
      borderWall.clear();

      const lineWidth: number = 3;
      const segmentWidth: number = 6;

      { // left and right lines
        const segmentsHeight: number = Number((wallThickness / segmentWidth).toFixed());

        for(let i=0; i<segmentsHeight; i++){

          borderWall.moveTo(0, -segmentWidth*i);
          borderWall.lineTo(0, -segmentWidth*i-lineWidth);
          borderWall.stroke({ width: 1.2, color: "#5D6069" });
          
        }

        for(let i=0; i<segmentsHeight; i++){

          borderWall.moveTo(distance, -segmentWidth*i);
          borderWall.lineTo(distance, -segmentWidth*i-lineWidth);
          borderWall.stroke({ width: 1, color: "#5D6069" });
          
        }
        
      }
      
      { // top and bottom lines
        const segmentsWidth: number = Number((distance / segmentWidth).toFixed());

        for(let i=0; i<segmentsWidth; i++){

          borderWall.moveTo(segmentWidth*i, -1);
          borderWall.lineTo(segmentWidth*i+lineWidth, -1);
          borderWall.stroke({ width: 1, color: "#5D6069" });

          borderWall.moveTo(segmentWidth*i, -wallThickness);
          borderWall.lineTo(segmentWidth*i+lineWidth, -wallThickness);
          borderWall.stroke({ width: 1, color: "#5D6069" });
          
        }

      }
  
      borderWall.position.x = start.x;
      borderWall.position.y = start.y;

      { // стрелки по краям стены

        { // start arrow

          const p0: any = {
            x: distance, 
            y: -30
          };
          const _p1: any = {
            x: distance - this.arrowWidth, 
            y: -30 + this.arrowHeight / 2
          };
          const _p2: any = {
            x: distance - this.arrowWidth, 
            y: -30 - this.arrowHeight / 2
          };
  
          let p1: any = rotateVector(p0, _p1, MathUtils.degToRad(-90));
          let p2: any = rotateVector(p0, _p2, MathUtils.degToRad(-90));
  
          borderWall.moveTo(p0.x, p0.y);
          borderWall.lineTo(p1.x, p1.y);
          borderWall.lineTo(p2.x, p2.y);
          borderWall.fill({color: this.arrowColor3});

        }

        { // end arrow

          const p0: any = {
            x: 0, 
            y: -30
          };
          const _p1: any = {
            x: 0 - this.arrowWidth, 
            y: -30 + this.arrowHeight / 2
          };
          const _p2: any = {
            x: 0 - this.arrowWidth, 
            y: -30 - this.arrowHeight / 2
          };
  
          let p1: any = rotateVector(p0, _p1, MathUtils.degToRad(-90));
          let p2: any = rotateVector(p0, _p2, MathUtils.degToRad(-90));
  
          borderWall.moveTo(p0.x, p0.y);
          borderWall.lineTo(p1.x, p1.y);
          borderWall.lineTo(p2.x, p2.y);
          borderWall.fill({color: this.arrowColor3});

        }

        { // normal arrow

          const pX = (distance / 100) * 30

          const p0: any = {
            x: pX, 
            y: 0
          };
          const _p1: any = {
            x: pX - this.arrowWidth, 
            y: 0 + this.arrowHeight / 2
          };
          const _p2: any = {
            x: pX - this.arrowWidth, 
            y: 0 - this.arrowHeight / 2
          };
  
          let p1: any = rotateVector(p0, _p1, MathUtils.degToRad(90));
          let p2: any = rotateVector(p0, _p2, MathUtils.degToRad(90));
  
          borderWall.moveTo(p0.x, p0.y);
          borderWall.lineTo(p1.x, p1.y);
          borderWall.lineTo(p2.x, p2.y);
          borderWall.fill({color: this.arrowColor3});

        }

        { // зеленая стрелка 1

          const p0: any = {
            x: (distance/100) * 40, 
            y: -30
          };
          const _p1: any = {
            x: (distance/100) * 40 - this.arrowWidth, 
            y: -30 + this.arrowHeight / 2
          };
          const _p2: any = {
            x: (distance/100) * 40 - this.arrowWidth, 
            y: -30 - this.arrowHeight / 2
          };
  
          let p1: any = rotateVector(p0, _p1, MathUtils.degToRad(90));
          let p2: any = rotateVector(p0, _p2, MathUtils.degToRad(90));
  
          borderWall.moveTo(p0.x, p0.y);
          borderWall.lineTo(p1.x, p1.y);
          borderWall.lineTo(p2.x, p2.y);
          borderWall.fill({color: this.arrowColor4});

        }

        { // зеленая стрелка 2

          const p0: any = {
            x: (distance/100) * 40, 
            y: 0
          };
          const _p1: any = {
            x: (distance/100) * 40 - this.arrowWidth, 
            y: 0 + this.arrowHeight / 2
          };
          const _p2: any = {
            x: (distance/100) * 40 - this.arrowWidth, 
            y: 0 - this.arrowHeight / 2
          };
  
          let p1: any = rotateVector(p0, _p1, MathUtils.degToRad(-90));
          let p2: any = rotateVector(p0, _p2, MathUtils.degToRad(-90));
  
          borderWall.moveTo(p0.x, p0.y);
          borderWall.lineTo(p1.x, p1.y);
          borderWall.lineTo(p2.x, p2.y);
          borderWall.fill({color: this.arrowColor4});

        }
  
      }

      borderWall.rotation = this.activeWallRotate * -1;
      
    }
  }

  private pointerMove(e: any): void {

    e.preventDefault();

    // рисуем линию
    if(this.drawMode){

      if(this.drawWallID){

        const wall = this.walls.find(el => el.id === this.drawWallID);
        
        wall!.endPoint.x = (e.data.global.x * (1 / this.drawContainer.scale.x)) + this.drawContainer.pivot.x;
        wall!.endPoint.y = (e.data.global.y * (1 / this.drawContainer.scale.x)) + this.drawContainer.pivot.y;

        this.drawBodyWall(this.drawWallID);

        this.drawWall(this.drawWallID);

        this.drawActiveEndPoint(this.drawWallID);
        
      }
      
    }

  }

  private pointerDown(e: any): void{ // нажали на кнопку

    e.preventDefault();

    console.log("active good:", this.activeGood);

    /*
    switch (this.drawMode) {
      
      case 0:
  
        // добавляем линию
        // включение редера линии
        this.drawMode = 1;

        const sPx: number = (e.data.global.x * (1 / this.drawContainer.scale.x)) + this.drawContainer.pivot.x;
        const sPy: number = (e.data.global.y * (1 / this.drawContainer.scale.y)) + this.drawContainer.pivot.y;

        this.addWall(sPx, sPy);
        
        break;
    
      case 1:

        // завершаем рисование линии
        // выключение рендера линии
        this.drawActiveEndPoint(this.drawWallID, false);
        this.drawMode = 0
        this.drawWallID = null;

        break;

    }
    */

  }

  private pointerUp(e: any): void{ // отпустили кнопку

    e.preventDefault();
    
    // this.drawMode = 0;

    // this.endWall();

  }

  interaction(): void {

    // this.container.on('pointermove', this.pointerMove, this);

    // this.container.on('pointerdown', this.pointerDown, this);

    // this.container.on('pointerup', this.pointerUp, this);
    
  }

  interactionOff(): void {

    // this.container.off('pointermove');

    // this.container.off('pointerdown');

    // this.container.off('pointerup');
    
  }

}