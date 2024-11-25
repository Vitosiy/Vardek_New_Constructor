import * as PIXI from 'pixi.js';

import { degToRad } from './../../Utils/Math';

interface Vector {
  x: number;
  y: number;
}
  
/*
interface segment {
  indent: number,
  width: number
}
*/

export default class Ruler {

  PIXIApplication: any;

  container: any;

  containerLeftText: any;
  containerTopText: any;

  leftRuler: any;
  topRuler: any;

  lineColor: any = 0x5D6069;

  sectionLength: number = 100; // длина секции линейки

  spaceSize: number = 30;

  textNumberStyle: any;

  zoom: number = 1;

  centerScene: Vector = {
    x: 0,
    y: 0
  };

  constructor(pixiApp: any = null) {

    if(pixiApp){

      this.PIXIApplication = pixiApp;

      this.init();

    }
    
  }

  public get originCoordinates(): Vector {

    return this.centerScene;

  }

  public set originCoordinates(v: Vector) {

    this.centerScene = v;
    
  }

  private init (): void {

    if(!this.container){

      this.container = new PIXI.Container();
      this.PIXIApplication.stage.addChild(this.container);

      this.leftRuler = new PIXI.Graphics();
      this.container.addChild(this.leftRuler);
      this.topRuler = new PIXI.Graphics();
      this.container.addChild(this.topRuler);

      this.containerTopText = new PIXI.Container();
      this.container.addChild(this.containerTopText);

      this.containerLeftText = new PIXI.Container();
      this.container.addChild(this.containerLeftText);

      this.textNumberStyle = new PIXI.TextStyle({
        fontSize: 16,
        fill: this.lineColor
      });
      
      this.drawRulers();

      { // clear rect | start rulers

        const clearRect = new PIXI.Graphics();
        
        clearRect.rect(0, 0, this.spaceSize, this.spaceSize);
        clearRect.fill(0xffffff);
    
        clearRect.moveTo(this.spaceSize, 0);
        clearRect.lineTo(this.spaceSize, this.spaceSize-1);
        clearRect.lineTo(0, this.spaceSize-1);
        clearRect.stroke({ width: 1, color: this.lineColor });
        
        
        this.container.addChild(clearRect);
        
      }
      
    }
    
  }

  drawRulers(): void {

    if(this.container){
      this.drawTopRuler();
      this.drawLeftRuler();
    }
    
  }

  private drawTopRuler(): void {

    this.topRuler.clear();

    const cWidth: number = this.PIXIApplication.screen.width;

    this.topRuler.rect(this.spaceSize, 0, cWidth - this.spaceSize, this.spaceSize);
    this.topRuler.fill(0xffffff);

    const sectionLength: number = this.sectionLength * this.zoom;

    const rulerSections: number = Math.trunc(cWidth / sectionLength);

    const indentForText: number = (Math.trunc(this.centerScene.x / sectionLength) * sectionLength);

    const segmentIndent: number = this.centerScene.x - indentForText;

    // на сколько ушел центр сцены по оси х и в какую сторону + или -
    let offsetSegments: number = -segmentIndent;
    
    for(let i=-1; i<rulerSections+2; i++){

      this.topRuler.moveTo((this.spaceSize+sectionLength*i     - offsetSegments), this.spaceSize-1);
      this.topRuler.lineTo((this.spaceSize+sectionLength*(i+1) - offsetSegments), this.spaceSize-1);
      this.topRuler.lineTo((this.spaceSize+sectionLength*(i+1) - offsetSegments), 0);
      this.topRuler.stroke({ width: 1, color: this.lineColor });

      const textNumber: number = Math.round((this.sectionLength*10) * i);
      
      if(!this.containerTopText.children[i]){
        const text = new PIXI.Text({
          text: textNumber,
          style: this.textNumberStyle
        });
        text.x = (this.spaceSize+sectionLength*i+10);
        text.y = this.spaceSize / 4;
        
        this.containerTopText.addChild(text);
      }else{

        if(offsetSegments < 0){

          this.containerTopText.children[i].text = textNumber - Math.trunc(this.centerScene.x / sectionLength)*this.sectionLength*10 - this.sectionLength*10;
          this.containerTopText.children[i].x = ((this.spaceSize+sectionLength*i+10) + -offsetSegments) - sectionLength;

        }else{
          
          this.containerTopText.children[i].text = textNumber - Math.trunc(this.centerScene.x / sectionLength)*this.sectionLength*10;
          this.containerTopText.children[i].x = ((this.spaceSize+sectionLength*i+10) + -offsetSegments);

        }

      }
      
    }

  }

  private drawLeftRuler(): void {

    this.leftRuler.clear();

    const cHeight: number = this.PIXIApplication.screen.height;

    this.leftRuler.rect(0, this.spaceSize, this.spaceSize, cHeight - this.spaceSize);
    this.leftRuler.fill(0xffffff);

    const sectionLength: number = this.sectionLength * this.zoom;

    const rulerSections = Math.trunc(cHeight / sectionLength);

    const indentForText: number = (Math.trunc(this.centerScene.y / sectionLength) * sectionLength);

    const segmentIndent = this.centerScene.y - indentForText;

    // на сколько ушел центр сцены по оси х и в какую сторону + или -
    let offsetSegments: number = -segmentIndent;
    
    for(let i=-1; i<rulerSections+2; i++){

      this.leftRuler.moveTo(this.spaceSize, (this.spaceSize+sectionLength) - offsetSegments);
      this.leftRuler.lineTo(this.spaceSize, (this.spaceSize+sectionLength*i) - offsetSegments);
      this.leftRuler.lineTo(             0, (this.spaceSize+sectionLength*i) - offsetSegments);
      this.leftRuler.stroke({ width: 1, color: this.lineColor });

      const textNumber: number = Math.round((this.sectionLength*10) * i);
      
      if(!this.containerLeftText.children[i]){
        const text = new PIXI.Text({
          text: textNumber,
          style: this.textNumberStyle
        });
        text.x = this.spaceSize / 1.25;
        text.y = this.spaceSize+sectionLength*i+10;

        text.anchor.set(1, 1);
        text.rotation = degToRad(-90);

        this.containerLeftText.addChild(text);
      }else{

        if(offsetSegments < 0){

          this.containerLeftText.children[i].text = textNumber - Math.trunc(this.centerScene.y / sectionLength)*this.sectionLength*10 - this.sectionLength*10;
          this.containerLeftText.children[i].y = ((this.spaceSize+sectionLength*i+10) + -offsetSegments) - sectionLength;

        }else{
          
          this.containerLeftText.children[i].text = textNumber - Math.trunc(this.centerScene.y / sectionLength)*this.sectionLength*10;
          this.containerLeftText.children[i].y = ((this.spaceSize+sectionLength*i+10) + -offsetSegments);

        }
        
      }
      
    }
    
  }

}