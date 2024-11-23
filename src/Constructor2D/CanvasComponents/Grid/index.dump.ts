import * as PIXI from 'pixi.js';

interface originOfCoordinates {
  x: number;
  y: number;
}

interface segment {
  indent: number,
  width: number
}

export default class Grid {

  PIXIApplication: any;

  container: any;

  gridLines: any;

  redLineVertical: any;

  redLineHorizontal: any;

  gridSize: number = 20;

  rulerSpace: number = 30;

  color0 = 0xefefef; // gray color
  color1 = 0xDA444C; // red color

  originOfCoordinates: originOfCoordinates = {
    x: 0,
    y: 0
  };

  segment: segment = {
    indent: 5,
    width: 5
  };

  constructor(pixiApp: any = null) {

    if(pixiApp){

      this.PIXIApplication = pixiApp;

      this.init();

    }
    
  }

  init (): void {

    if(!this.container){

      this.container = new PIXI.Container();
      this.PIXIApplication.stage.addChild(this.container);
      
      this.initGridLines();

      this.initRedLine();
      
    }
    
  }

  private initGridLines (): void {

    if(!this.gridLines){

      this.gridLines = new PIXI.Graphics();

      { // vertical lines
    
        const vLines: number = Number((this.PIXIApplication.canvas.width / this.gridSize).toFixed(0)) + 2;
        const widthSpace: number = this.gridSize;
        
        for(let i=0; i<vLines; i++){
    
          const positionX: number = (widthSpace * i) - widthSpace;
    
          this.gridLines.moveTo(positionX, 0 - widthSpace);
          this.gridLines.lineTo(positionX, this.PIXIApplication.canvas.height + widthSpace);
          this.gridLines.stroke({ width: 1, color: this.color0 });
    
        }
          
        this.container.addChild(this.gridLines);
    
      }

      { // horisontal lines
    
        const hLines: number = Number((this.PIXIApplication.canvas.height / this.gridSize).toFixed(0)) + 2;
        const heightSpace: number = this.gridSize;
    
        for(let i=0; i<hLines; i++){
    
          const positionY: number = (heightSpace * i) - heightSpace;
    
          this.gridLines.moveTo(0 - heightSpace, positionY);
          this.gridLines.lineTo(this.PIXIApplication.canvas.width + heightSpace, positionY);
          this.gridLines.stroke({ width: 1, color: 0xefefef });
    
        }
          
        this.container.addChild(this.gridLines);
    
      }

      const positionXY = this.rulerSpace - this.gridSize;
      this.gridLines.x = positionXY;
      this.gridLines.y = positionXY;

    }
    
  }

  private initRedLine (): void {

    { // horizontal

      this.redLineHorizontal = new PIXI.Graphics();
      this.container.addChild(this.redLineHorizontal);

      this.drawRedLineHorizontal();
      
    }
    
    { // vertical

      this.redLineVertical = new PIXI.Graphics();
      this.container.addChild(this.redLineVertical);

      this.drawRedLineVertical();

    }
    
  }

  drawRedLineHorizontal(): void {

    this.redLineHorizontal.clear();

    const length = this.PIXIApplication.canvas.width - this.rulerSpace;

    const countSegments = Number((length / (this.segment.indent + this.segment.width)).toFixed());
    
    for(let i=0; i<countSegments; i++){
    
      const startPosition = {
        x: this.rulerSpace + (this.segment.indent + this.segment.width)*i,
        y: this.originOfCoordinates.y + this.rulerSpace
      };
      
      const endPosition = {
        x: this.rulerSpace + (this.segment.indent + this.segment.width)*i + this.segment.width,
        y: this.originOfCoordinates.y + this.rulerSpace
      };

      this.redLineHorizontal.moveTo(startPosition.x, startPosition.y); // start point
      this.redLineHorizontal.lineTo(endPosition.x, endPosition.y); // end point

    }

    this.redLineHorizontal.stroke({ width: 1, color: this.color1 });
    
  }

  drawRedLineVertical(): void {

    this.redLineVertical.clear();

    const length = this.PIXIApplication.canvas.height - this.rulerSpace;

    const countSegments = Number((length / (this.segment.indent + this.segment.width)).toFixed());
    
    for(let i=0; i<countSegments; i++){
    
      const startPosition = {
        x: this.originOfCoordinates.x + this.rulerSpace,
        y: this.rulerSpace + (this.segment.indent + this.segment.width)*i
      };
      
      const endPosition = {
        x: this.originOfCoordinates.x + this.rulerSpace,
        y: this.rulerSpace + (this.segment.indent + this.segment.width)*i + this.segment.width
      };

      this.redLineVertical.moveTo(startPosition.x, startPosition.y); // start point
      this.redLineVertical.lineTo(endPosition.x, endPosition.y); // end point

    }

    this.redLineVertical.stroke({ width: 1, color: this.color1 });

  }

}