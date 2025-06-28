// @ts-nocheck 31
import {UI_PARAMS} from "./UMConstructorConst.ts";
import {Application, Container, Graphics, Text, TextStyle, GraphicsPath} from "pixi.js";

type TDashedLine = {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    dashLength?: number;
    gapLength?: number;
    graphics: any;
};

type TBounds = {
    x: number,
    y: number,
    width: number,
    height: number
}

type THoleData = {
    type: string,
    width: number,
    height: number,
    radius: number,
    x: number, // центр по X (относительно центра секции)
    y: number, // центр по Y (относительно центра секции)
    lable: string,
    Mwidth: number,
    Mheight: number,
    Mradius: number,
    distances: {
        left: number,
        right: number,
        top: number,
        bottom: number,
    };
}

type TExtremum = { maxX: number, maxY: number, minX: number, minY: number }


class Helpers {

    maxAreaHeight: number
    step: number = 1

    constructor() {


        this.maxAreaHeight = UI_PARAMS.TOTAL_HEIGHT * UI_PARAMS.MAX_AREA_WIDTH / UI_PARAMS.TOTAL_LENGTH
    }

    setStep(value: number) {
        this.step = value
    }

    getPixelWidth(mmWidth: number) {
        return (mmWidth / UI_PARAMS.TOTAL_LENGTH) * UI_PARAMS.MAX_AREA_WIDTH;
    };

    getPixelHeight(mmHeight: number) {
        // return Math.floor((mmHeight / TOTAL_HEIGHT) * getMaxAreaHeight.value);
        return (mmHeight / UI_PARAMS.TOTAL_HEIGHT) * this.maxAreaHeight;
    };

    getMmWidth(pxWidth: number) {
        return (pxWidth / UI_PARAMS.MAX_AREA_WIDTH) * UI_PARAMS.TOTAL_LENGTH;
    };

    getMmHeight(pxHeight: number) {
        return (pxHeight / this.maxAreaHeight) * UI_PARAMS.TOTAL_HEIGHT;
    };

    convertToTen(value) {

        if (value < 0) return 0

        return Math.round(value / this.step) * this.step;

    }

    getSectorBounds(sector: Container) {


        const bounds = sector.getBounds()
        return {
            x: sector.x,
            y: sector.y,
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY

        }
    }

    getTotalBounds(sector: Container, row) {

        const shapes = sector.shapes;

        if (shapes.length === 0) {
            return {maxX: 0, maxY: 0, minX: 0, minY: 0}; // или другое значение по умолчанию
        }


        let maxX = -Infinity;
        let maxY = -Infinity;
        let minX = Infinity;
        let minY = Infinity;

        for (const shape of shapes) {
            const bounds = shape.graphic.getBounds();
            maxX = Math.max(maxX, bounds.maxX);
            maxY = Math.max(maxY, bounds.maxY);
            minX = Math.min(minX, bounds.minX);
            minY = Math.min(minY, bounds.minY);
        }

        return {maxX, maxY, minX, minY};
    }

    getRightSectionWidth(sector, minX) {

        if (minX < 150) return 150

        const sBounds = sector.getBounds()
        const sMax = this.convertToTen(this.getMmWidth(sBounds.maxX))
        return sMax - minX + UI_PARAMS.SECTOR_PADDING

    }

    getLeftSectionWidth(sector, maxX) {

        if (maxX < 150) return 150

        const sBounds = sector.getBounds()
        const sMin = this.convertToTen(this.getMmWidth(sBounds.minX))
        return maxX - sMin + UI_PARAMS.SECTOR_PADDING
    }

    getSectionTop(sector, maxY) {

        if (maxY < 150) return 150
        const sBounds = sector.getBounds()
        const sMin = this.convertToTen(this.getMmWidth(sBounds.minY))
        return maxY - sMin + UI_PARAMS.SECTOR_PADDING
    }

    getSectionBottom(sector, minY) {

        if (minY < 150) return 150
        const sBounds = sector.getBounds()
        const sMax = this.convertToTen(this.getMmWidth(sBounds.maxY))
        return sMax - minY + UI_PARAMS.SECTOR_PADDING
    }

    getValidValue({
                      topLeft,
                      topRight,
                      bottomLeft,
                      bottomRight,
                      sectionWidth,
                      sectionHeight,
                  }) {
        // Инициализация значений по умолчанию
        const tl_width = topLeft.width || 0;
        const tr_width = topRight.width || 0;
        const bl_width = bottomLeft.width || 0;
        const br_width = bottomRight.width || 0;
        const tl_radius = topLeft.radius || 0;
        const tr_radius = topRight.radius || 0;
        const bl_radius = bottomLeft.radius || 0;
        const br_radius = bottomRight.radius || 0;
        const tl_corner = topLeft.corner || 0;
        const tr_corner = topRight.corner || 0;
        const bl_corner = bottomLeft.corner || 0;
        const br_corner = bottomRight.corner || 0;

        // Проверка ширины секции относительно всех углов
        if (
            sectionWidth <= tl_width ||
            sectionWidth <= tr_width ||
            sectionWidth <= bl_width ||
            sectionWidth <= br_width ||
            sectionWidth <= tl_radius ||
            sectionWidth <= tr_radius ||
            sectionWidth <= bl_radius ||
            sectionWidth <= br_radius ||
            sectionWidth <= tl_corner ||
            sectionWidth <= tr_corner ||
            sectionWidth <= bl_corner ||
            sectionWidth <= br_corner
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка пересечения по ширине (между левыми и правыми углами)
        if (
            sectionWidth - tl_width <= tr_width ||
            sectionWidth - tr_width <= tl_width ||
            sectionWidth - bl_width <= br_width ||
            sectionWidth - br_width <= bl_width
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка пересечения углов (corner) по ширине
        if (
            sectionWidth - tl_corner <= tr_corner ||
            sectionWidth - tr_corner <= tl_corner ||
            sectionWidth - bl_corner <= br_corner ||
            sectionWidth - br_corner <= bl_corner
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка пересечения радиусов по ширине
        if (
            sectionWidth - tl_radius <= tr_radius ||
            sectionWidth - tr_radius <= tl_radius ||
            sectionWidth - bl_radius <= br_radius ||
            sectionWidth - br_radius <= bl_radius
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка смешанных пересечений (ширина и радиус)
        if (
            sectionWidth - tl_width <= tr_radius ||
            sectionWidth - tr_width <= tl_radius ||
            sectionWidth - bl_width <= br_radius ||
            sectionWidth - br_width <= bl_radius ||
            sectionWidth - tl_radius <= tr_width ||
            sectionWidth - tr_radius <= tl_width ||
            sectionWidth - bl_radius <= br_width ||
            sectionWidth - br_radius <= bl_width
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка смешанных пересечений (ширина и угол)
        if (
            sectionWidth - tl_width <= tr_corner ||
            sectionWidth - tr_width <= tl_corner ||
            sectionWidth - bl_width <= br_corner ||
            sectionWidth - br_width <= bl_corner ||
            sectionWidth - tl_corner <= tr_width ||
            sectionWidth - tr_corner <= tl_width ||
            sectionWidth - bl_corner <= br_width ||
            sectionWidth - br_corner <= bl_width
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка смешанных пересечений (радиус и угол)
        if (
            sectionWidth - tl_radius <= tr_corner ||
            sectionWidth - tr_radius <= tl_corner ||
            sectionWidth - bl_radius <= br_corner ||
            sectionWidth - br_radius <= bl_corner ||
            sectionWidth - tl_corner <= tr_radius ||
            sectionWidth - tr_corner <= tl_radius ||
            sectionWidth - bl_corner <= br_radius ||
            sectionWidth - br_corner <= bl_radius
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка высоты секции относительно радиусов и углов
        if (
            sectionHeight <= tl_radius ||
            sectionHeight <= tr_radius ||
            sectionHeight <= bl_radius ||
            sectionHeight <= br_radius ||
            sectionHeight <= tl_corner ||
            sectionHeight <= tr_corner ||
            sectionHeight <= bl_corner ||
            sectionHeight <= br_corner
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка пересечения радиусов по высоте (между верхними и нижними углами)
        if (
            sectionHeight - tl_radius <= bl_radius ||
            sectionHeight - tr_radius <= br_radius ||
            sectionHeight - bl_radius <= tl_radius ||
            sectionHeight - br_radius <= tr_radius
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка пересечения углов по высоте
        if (
            sectionHeight - tl_corner <= bl_corner ||
            sectionHeight - tr_corner <= br_corner ||
            sectionHeight - bl_corner <= tl_corner ||
            sectionHeight - br_corner <= tr_corner
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Проверка смешанных пересечений (радиус и угол) по высоте
        if (
            sectionHeight - tl_radius <= bl_corner ||
            sectionHeight - tr_radius <= br_corner ||
            sectionHeight - bl_radius <= tl_corner ||
            sectionHeight - br_radius <= tr_corner ||
            sectionHeight - tl_corner <= bl_radius ||
            sectionHeight - tr_corner <= br_radius ||
            sectionHeight - bl_corner <= tl_radius ||
            sectionHeight - br_corner <= tr_radius
        ) {
            return {
                tl_width: 0, tr_width: 0, bl_width: 0, br_width: 0,
                tl_radius: 0, tr_radius: 0, bl_radius: 0, br_radius: 0,
                tl_corner: 0, tr_corner: 0, bl_corner: 0, br_corner: 0,
                error: "101"
            };
        }

        // Если все проверки пройдены, возвращаем валидные значения
        return {
            tl_width, tr_width, bl_width, br_width,
            tl_radius, tr_radius, bl_radius, br_radius,
            tl_corner, tr_corner, bl_corner, br_corner,
            error: false
        };
    }

    drawDashedLine({
                       startX,
                       startY,
                       endX,
                       endY,
                       dashLength = 5,
                       gapLength = 2.5,
                       graphics,
                   }: TDashedLine) {
        // graphics.clear(); // Очищаем предыдущее состояние


        const totalLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const dx = (endX - startX) / totalLength;
        const dy = (endY - startY) / totalLength;

        let currentPos = 0;

        while (currentPos < totalLength) {
            const dashStartX = startX + dx * currentPos;
            const dashStartY = startY + dy * currentPos;
            const dashEndX = startX + dx * Math.min(currentPos + dashLength, totalLength);
            const dashEndY = startY + dy * Math.min(currentPos + dashLength, totalLength);

            graphics.moveTo(dashStartX, dashStartY);
            graphics.lineTo(dashEndX, dashEndY);

            currentPos += dashLength + gapLength;
        }

        graphics.stroke({width: 1, color: '#5D6069'}); // Завершаем отрисовку линии

        return graphics

    };
}

class Shape extends Helpers {
    select: () => void
    render: () => void
    type: string
    sectorBounds: TBounds
    graphic: Graphics
    highlightGraphics: Graphics
    width: number = 0
    height: number = 0
    radius: number = 0
    shapes: Shape[]
    data: THoleData
    sector: Container
    dementionContainer: Container
    dragActive: boolean = true

    private distanceGraphics: Graphics | null = null; // Для хранения линий расстояний
    private distanceLabels: Text[] = []; // Для хранения текстовых меток
    private readonly padding: number = this.getPixelWidth(UI_PARAMS.SECTOR_PADDING); // Отступ от краев сектора в пикселях


    constructor({type, sector, position, data, select, render, dementionContainer, getMmWidth, getMmHeight, getPixelHeight, getPixelWidth, dragActive }:
                {
                    type: string,
                    sector: Container,
                    position?: { x: number, y: number },
                    data: THoleData,
                    select?: () => void,
                    render?: () => void,
                    getMmHeight?: () => void,
                    getMmWidth?: () => void,
                    getPixelHeight?: () => void,
                    getPixelWidth?: () => void,
                    dementionContainer?: Container,
                    dragActive: boolean,
                }) {
        super()

        this.sector = sector

        this.type = type;
        this.sectorBounds = this.getSectorBounds(sector);
        this.graphic = new Graphics();
        this.highlightGraphics= new Graphics();
        this.shapes = sector.shapes
        this.data = data
        this.select = select
        this.render = render

        if(getMmWidth)
            this.getMmWidth = getMmWidth
        if(getMmHeight)
            this.getMmHeight = getMmHeight
        if(getPixelWidth)
            this.getPixelWidth = getPixelWidth
        if(getPixelHeight)
            this.getPixelHeight = getPixelHeight

        this.dementionContainer = dementionContainer

        // Инициализация графики в зависимости от типа
        this.width = this.getPixelWidth(data.width);
        this.height = this.getPixelHeight(data.height);

        this.graphic.data = data
        this.graphic.holeId = data.id
        this.highlightGraphics.data = data
        this.highlightGraphics.holeId = data.id

        this.graphic.rect(0, 0, this.getPixelWidth(data.width), this.getPixelHeight(data.height))
        this.graphic.fill("#875003")
        this.graphic.stroke({width: 1, color: "#b86c02", alignment: 1});
        this.highlightGraphics.rect(0, 0, this.getPixelWidth(data.width), this.getPixelHeight(data.height))
        this.highlightGraphics.fill("#b86c02")
        this.highlightGraphics.stroke({width: 1, color: "#875003", alignment: 1});

        if (position) {
            this.graphic.position.x = this.getPixelWidth(position.x);
            this.graphic.position.y = this.getPixelHeight(position.y);
            this.highlightGraphics.position.x = this.getPixelWidth(position.x);
            this.highlightGraphics.position.y = this.getPixelHeight(position.y);
        } else {
            this.graphic.position.x = this.getPixelWidth(data.x);
            this.graphic.position.y = this.getPixelHeight(data.y);
            this.highlightGraphics.position.x = this.getPixelWidth(data.x);
            this.highlightGraphics.position.y = this.getPixelHeight(data.y);
        }

        // Сохраняем ссылку на класс в графическом объекте
        this.graphic.shapeInstance = this;
        this.highlightGraphics.shapeInstance = this;
        this.highlightGraphics.visible = false;

        // Настройка перетаскивания
        if(dragActive) {
            // Настройка интерактивности
            this.graphic.eventMode = "static";
            this.graphic.cursor = "grab";
            this.highlightGraphics.eventMode = "static";
            this.highlightGraphics.cursor = "grab";

            this.setupDraggable();
        }
    }

    // Настройка перетаскивания
    setupDraggable() {
        let dragging = false;
        let dragOffset = {x: 0, y: 0};
        let originalPosition = {x: 0, y: 0};
        const self = this;

        const pointerdown = (event, graphic) => {
            graphic.cursor = "grabbing";
            this.select(this.sector.secIndex, this.sector.cellIndex, this.sector.rowIndex)
            dragging = true;
            originalPosition = {
                x: graphic.position.x,
                y: graphic.position.y
            };
            dragOffset = {
                x: graphic.position.x - event.global.x,
                y: graphic.position.y - event.global.y,
            };
            graphic.alpha = 0.7;
        }

        const pointermove = (event, graphic) => {
            if (dragging) {
                // Вычисляем новые позиции
                const newY = event.global.y + dragOffset.y;

                // Ограничиваем позицию границами сектора с учетом отступа
                let adjustedY = newY;

                // Ограничения по Y
                adjustedY = Math.max(
                    this.sectorBounds.y + this.padding,
                    Math.min(newY, this.sectorBounds.y + this.sectorBounds.height - self.height - this.padding)
                );

                // Сохраняем текущую позицию для восстановления в случае коллизии
                const currentY = graphic.position.y;

                // Пробуем движение по Y
                self.graphic.position.y = adjustedY;
                self.highlightGraphics.position.y = adjustedY;
                let hasCollisionY = false;

                for (const otherShape of this.shapes) {
                    if (self !== otherShape && self.checkOverlap(otherShape)) {
                        hasCollisionY = true;
                        break;
                    }
                }

                if (hasCollisionY) {
                    self.graphic.position.y = currentY;
                    self.highlightGraphics.position.y = currentY;
                }
            }
        }

        this.graphic.on("pointerdown", (event) => pointerdown(event, this.graphic));
        this.graphic.on("pointermove", (event) => pointermove(event, this.graphic));
        this.highlightGraphics.on("pointerdown", (event) => pointerdown(event, this.highlightGraphics));
        this.highlightGraphics.on("pointermove", (event) => pointermove(event, this.highlightGraphics));

        const endDrag = () => {
            if (dragging) {
                dragging = false;
                self.graphic.alpha = 1;

                this.data.Mwidth = 600;
                this.data.Mheight = 600;

                if(this.data.position){
                    this.data.position.x = Math.round(this.getMmWidth(self.graphic.position.x));
                    this.data.position.y = Math.round(this.getMmHeight(self.graphic.position.y));
                }
                else {
                    this.data.x = Math.round(this.getMmWidth(self.graphic.position.x));
                    this.data.y = Math.round(this.getMmHeight(self.graphic.position.y));
                }

                this.render();
            }
        };

        this.graphic.on("pointerup", endDrag);
        this.graphic.on("pointerupoutside", endDrag);
        this.highlightGraphics.on("pointerup", endDrag);
        this.highlightGraphics.on("pointerupoutside", endDrag);
    }

    // Проверка перекрытия с другой фигурой
    checkOverlap(otherShape: Shape) {

        if (this === otherShape)
            return false;

        if(this.graphic.position.y + this.height > otherShape.graphic.position.y &&
            this.graphic.position.y + this.height < otherShape.graphic.position.y + otherShape.height)
            this.graphic.position.y = otherShape.graphic.position.y - 1 - this.height
        else if(this.graphic.position.y <= otherShape.graphic.position.y + otherShape.height &&
                    this.graphic.position.y >= otherShape.graphic.position.y)
            this.graphic.position.y = otherShape.graphic.position.y + otherShape.height + 1

        // Проверка наложения прямоугольников
        return !(
            this.graphic.position.x + this.width < otherShape.graphic.position.x ||
            this.graphic.position.x > otherShape.graphic.position.x + otherShape.width ||
            this.graphic.position.y + this.height < otherShape.graphic.position.y ||
            this.graphic.position.y > otherShape.graphic.position.y + otherShape.height
        );
    }

    // Проверка, находится ли указанная позиция внутри сектора
    isPositionInsideSector(position: { x: number, y: number }) {
        const pxPos = {
            x: this.getPixelWidth(position.x),
            y: this.getPixelHeight(position.y)
        };

        if (pxPos.y < this.sectorBounds.y + this.padding ) {
            pxPos.y = this.sectorBounds.y + this.padding
            position.y = Math.floor(this.getMmHeight(pxPos.y));
        }
        else if(pxPos.y + this.height > this.sectorBounds.y + this.sectorBounds.height - this.padding) {
            pxPos.y = this.sectorBounds.y + this.sectorBounds.height - this.padding - this.height
            position.y = Math.floor(this.getMmHeight(pxPos.y));
        }

        return (
            pxPos.x >= this.sectorBounds.x + this.padding &&
            pxPos.x + this.width <= this.sectorBounds.x + this.sectorBounds.width - this.padding
        );
    }

    // Вспомогательный метод для отрисовки стрелки (заполненный треугольник)
    private drawArrowhead(
        graphics: Graphics,
        x: number,
        y: number,
        direction: 'left' | 'right' | 'up' | 'down',
        size: number = 6,
        color: string = '#5D6069'
    ) {
        graphics.fill(color);
        const halfSize = size / 2;
        switch (direction) {
            case 'left': // Треугольник указывает влево
                graphics.moveTo(x, y);
                graphics.lineTo(x + size, y - halfSize);
                graphics.lineTo(x + size, y + halfSize);
                graphics.lineTo(x, y);
                break;
            case 'right': // Треугольник указывает вправо
                graphics.moveTo(x, y);
                graphics.lineTo(x - size, y - halfSize);
                graphics.lineTo(x - size, y + halfSize);
                graphics.lineTo(x, y);
                break;
            case 'up': // Треугольник указывает вверх
                graphics.moveTo(x, y);
                graphics.lineTo(x - halfSize, y + size);
                graphics.lineTo(x + halfSize, y + size);
                graphics.lineTo(x, y);
                break;
            case 'down': // Треугольник указывает вниз
                graphics.moveTo(x, y);
                graphics.lineTo(x - halfSize, y - size);
                graphics.lineTo(x + halfSize, y - size);
                graphics.lineTo(x, y);
                break;
        }

    }

    drawBoundaryDistances() {

        if (this.distanceGraphics) {
            this.dementionContainer.removeChild(this.distanceGraphics);
            this.distanceGraphics.destroy();
            this.distanceGraphics = null;
        }
        this.distanceLabels.forEach(label => this.dementionContainer.removeChild(label));
        this.distanceLabels.forEach(label => label.destroy());
        this.distanceLabels = [];

        const graphics = new Graphics();
        this.distanceGraphics = graphics;

        const distances = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        };

        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#5D6069',
        });

        distances.left = this.graphic.position.x - this.sectorBounds.x;
        distances.right = this.sectorBounds.x + this.sectorBounds.width - (this.graphic.position.x + this.width);
        distances.top = this.graphic.position.y - this.sectorBounds.y;
        distances.bottom = this.sectorBounds.y + this.sectorBounds.height - (this.graphic.position.y + this.height);

        // Отрисовка для левой границы
        if (distances.left > 0) {
            const startX = this.graphic.position.x
            const startY = this.graphic.position.y + this.height / 2
            const endX = this.sectorBounds.x;
            const endY = startY;
            this.drawDashedLine({
                startX,
                startY,
                endX,
                endY,
                graphics,
            });
            // Стрелка у объекта (у начала линии, указывает вправо, к объекту)
            this.drawArrowhead(graphics, startX, startY, 'right');
            // Стрелка на краю сектора (внутри сектора, указывает влево, от фигуры)
            this.drawArrowhead(graphics, endX, endY, 'left', 5);
            const leftText = new Text({text: `${Math.round(this.getMmWidth(distances.left))} mm`, style: textStyle});
            leftText.position.set(
                this.sectorBounds.x + distances.left / 2,
                startY - 15
            );
            this.dementionContainer.addChild(leftText);
            this.distanceLabels.push(leftText);
        }

        // Отрисовка для правой границы
        if (distances.right > 0) {
            const startX = this.graphic.position.x + this.width
            const startY = this.graphic.position.y + this.height / 2
            const endX = this.sectorBounds.x + this.sectorBounds.width;
            const endY = startY;
            this.drawDashedLine({
                startX,
                startY,
                endX,
                endY,
                graphics,
            });
            // Стрелка у объекта (у начала линии, указывает влево, к объекту)
            this.drawArrowhead(graphics, startX, startY, 'left');
            // Стрелка на краю сектора (внутри сектора, указывает вправо, от фигуры)
            this.drawArrowhead(graphics, endX, endY, 'right', 5);
            const rightText = new Text({text: `${Math.round(this.getMmWidth(distances.right))} mm`, style: textStyle});
            rightText.position.set(
                startX + distances.right / 2,
                startY - 15
            );
            this.dementionContainer.addChild(rightText);
            this.distanceLabels.push(rightText);
        }

        // Отрисовка для верхней границы
        if (distances.top > 0) {
            const startX = this.graphic.position.x + this.width / 2
            const startY = this.graphic.position.y
            const endX = startX;
            const endY = this.sectorBounds.y;
            this.drawDashedLine({
                startX,
                startY,
                endX,
                endY,
                graphics,
            });
            // Стрелка у объекта (у начала линии, указывает вниз, к объекту)
            this.drawArrowhead(graphics, startX, startY, 'down');
            // Стрелка на краю сектора (внутри сектора, указывает вверх, от фигуры)
            this.drawArrowhead(graphics, endX, endY, 'up', 5);
            const topText = new Text({text: `${Math.round(this.getMmHeight(distances.top))} mm`, style: textStyle});
            topText.position.set(
                startX + 5,
                this.sectorBounds.y + distances.top / 2
            );
            this.dementionContainer.addChild(topText);
            this.distanceLabels.push(topText);
        }

        // Отрисовка для нижней границы
        if (distances.bottom > 0) {
            const startX = this.graphic.position.x + this.width / 2
            const startY = this.graphic.position.y + this.height
            const endX = startX;
            const endY = this.sectorBounds.y + this.sectorBounds.height;
            this.drawDashedLine({
                startX,
                startY,
                endX,
                endY,
                graphics,
            });
            // Стрелка у объекта (у начала линии, указывает вверх, к объекту), с небольшим смещением вниз
            this.drawArrowhead(graphics, startX, startY, 'up');
            // Стрелка на краю сектора (внутри сектора, указывает вниз, от фигуры)
            this.drawArrowhead(graphics, endX, endY, 'down'); // Увеличено смещение до 5 пикселей
            this.drawArrowhead(graphics, startX, startY, 'up');

            const bottomText = new Text({
                text: `${Math.round(this.getMmHeight(distances.bottom))} mm`,
                style: textStyle
            });
            bottomText.position.set(
                startX + 5,
                startY + distances.bottom / 2
            );
            this.dementionContainer.addChild(bottomText);
            this.distanceLabels.push(bottomText);
        }

        this.dementionContainer.addChild(graphics);

        // Добавляем данные для отображения в компоненте VUE @CutOptions.vue

    this.data.distances = {
      left: Math.round(this.getMmWidth(distances.left)),
      right: Math.round(this.getMmWidth(distances.right)),
      top: Math.round(this.getMmHeight(distances.top)),
      bottom: Math.round(this.getMmHeight(distances.bottom)),
    }

    }

}

class Section extends Helpers {
    cellGraphics: Graphics = new Graphics();
    highlightGraphics: Graphics = new Graphics();
    width: number = 0;
    height: number = 0;
    data: any;
    sector: Container;

    constructor(data: any, width: number, height: number, sector: Container, _drawDimensions: boolean = true) {
        super();
        this.data = data;
        this.width = width;
        this.height = height;
        this.sector = sector;
        this._drawDimensions = _drawDimensions;

        this.createSection();
    }

    createSection(data = {}) {
        this.createFormSection(this.data);
    }

    createFormSection(data) {
        let bottomLeft = data.bottomLeft ?? {type: 'none'};
        let bottomRight = data.bottomRight ?? {type: 'none'};
        let topLeft = data.topLeft ?? {type: 'none'};
        let topRight = data.topRight ?? {type: 'none'};
        let defCellColor = data.type === "module" ? '#875003' : data.type === "fasade" ? '#1E90FF' : '#d2d0d7';
        let deffHighlightColor = data.type === "module" ? '#b86c02' : data.type === "fasade" ? '#80bfff' : '#ECEBF1';
        let opacity = data.type === "fasade" ? 0.8 : 1;

        if (data.error) {
            defCellColor = '#ad0202'
            deffHighlightColor = '#fa3c3c'
        }

        // Очищаем графику перед отрисовкой
        this.cellGraphics.clear();
        this.highlightGraphics.clear();

        // Создаем пути для графики
        const cellPath = this.createPath(topRight, topLeft, bottomRight, bottomLeft);
        const highlightPath = this.createPath(topRight, topLeft, bottomRight, bottomLeft);

        if (cellPath.error) {
            defCellColor = '#f5caca';
            deffHighlightColor = '#f7e2e2';
        }

        // Отрисовываем пути на графике
        this.cellGraphics.path(cellPath).fill({color: defCellColor, alpha: opacity});
        this.highlightGraphics.path(highlightPath).fill({color: deffHighlightColor, alpha: opacity});

        // Отрисовываем размеры
        if (this._drawDimensions) {
            this.drawDimensions(this.cellGraphics, topRight, topLeft, bottomRight, bottomLeft);
            this.drawDimensions(this.highlightGraphics, topRight, topLeft, bottomRight, bottomLeft);
        }
    }

    createPath(topRight, topLeft, bottomRight, bottomLeft): GraphicsPath {
        const elems = [topLeft, topRight, bottomLeft, bottomRight];

        const path = new GraphicsPath();
        const x = 0;
        const y = 0;

        const validValue = this.getValidValue({
            topLeft,
            topRight,
            bottomLeft,
            bottomRight,
            sectionWidth: this.width,
            sectionHeight: this.height,
        });

        const {
            tl_width, tr_width, bl_width, br_width,
            tl_radius, tr_radius, bl_radius, br_radius,
            tl_corner, tr_corner, bl_corner, br_corner,
            error
        } = validValue;

        // Начинаем с верхнего левого угла
        if (topLeft.type === 'rounded') {
            path.lineTo(x, y + tl_radius);
            path.arcTo(x, y, x + tl_radius, y, tl_radius);
        } else if (topLeft.type === 'corner') {
            path.lineTo(x, y + tl_corner);
            path.lineTo(x + tl_corner, y);
        } else if (topLeft.type === 'inward') {
            path.lineTo(x, y + tl_radius);
            const startX = x + tl_width - tl_radius;
            const startY = y + tl_radius;
            const endX = x + tl_width;
            const endY = y
            const controlX = x + tl_width;
            const controlY = y + tl_radius
            path.lineTo(startX, startY);
            path.quadraticCurveTo(controlX, controlY, endX, endY);
            path.lineTo(x + tl_width, y);

        } else {
            path.moveTo(x, y); // Острый угол
        }

        // Верхний правый угол
        if (topRight.type === 'rounded') {
            path.lineTo(x + this.width - tr_radius, y);
            path.arcTo(x + this.width, y, x + this.width, y + tr_radius, tr_radius);
        } else if (topRight.type === 'corner') {
            path.lineTo(x + this.width - tr_corner, y);
            path.lineTo(x + this.width, y + tr_corner);
        } else if (topRight.type === 'inward') {
            path.lineTo(x + this.width - tr_width, y);
            const endX = x + this.width - (tr_width - tr_radius);
            const endY = y + tr_radius;
            const controlX = x + this.width - tr_width;
            const controlY = y + tr_radius;
            path.quadraticCurveTo(controlX, controlY, endX, endY);
            path.lineTo(x + this.width, y + tr_radius);
        } else {
            path.lineTo(x + this.width, y); // Острый угол
        }
        // Нижний правый угол
        if (bottomRight.type === 'rounded') {
            path.lineTo(x + this.width, y + this.height - br_radius);
            path.arcTo(x + this.width, y + this.height, x + this.width - br_radius, y + this.height, br_radius);
        } else if (bottomRight.type === 'corner') {
            path.lineTo(x + this.width, y + this.height - br_corner);
            path.lineTo(x + this.width - br_corner, y + this.height);

        } else if (bottomRight.type === 'inward') {
            path.lineTo(x + this.width, y + this.height - br_radius);
            const startX = x + this.width - (br_width - br_radius);
            const startY = y + this.height - br_radius;
            const endX = x + this.width - br_width;
            const endY = y + this.height;
            const controlX = x + this.width - br_width;
            const controlY = y + this.height - br_radius;
            path.lineTo(startX, startY);
            path.quadraticCurveTo(controlX, controlY, endX, endY);
            path.lineTo(x + this.width - br_width, y + this.height);
        } else {
            path.lineTo(x + this.width, y + this.height); // Острый угол
        }
        // Нижний левый угол
        if (bottomLeft.type === 'rounded') {
            path.lineTo(x + bl_radius, y + this.height);
            path.arcTo(x, y + this.height, x, y + this.height - bl_radius, bl_radius);
        } else if (bottomLeft.type === 'corner') {
            path.lineTo(x + bl_corner, y + this.height);
            path.lineTo(x, y + this.height - bl_corner);
        } else if (bottomLeft.type === 'inward') {
            path.lineTo(x + bl_width, y + this.height);
            const startX = x + bl_width;
            const startY = y + this.height;
            const endX = x + (bl_width - bl_radius);
            const endY = y + this.height - bl_radius;
            const controlX = x + bl_width;
            const controlY = y + this.height - bl_radius;
            path.lineTo(startX, startY);
            path.quadraticCurveTo(controlX, controlY, endX, endY);
            path.lineTo(x, y + this.height - bl_radius);
        } else {
            path.lineTo(x, y + this.height); // Острый угол
        }

        // Закрываем путь, возвращаясь к начальной точке
        path.closePath();

        // Присваиваем код ошибки
        path.error = validValue.error;

        elems.forEach(item => {
            if (item.el) {
                item.el.error = validValue.error;
            }
        });

        return path;
    }

    drawDimensions(graphics: Graphics, topRight, topLeft, bottomRight, bottomLeft) {
        const x = 0;
        const y = 0;

        // Стили для текстовых меток
        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#1a1a1e',
        });

        // Метка ширины (по центру сверху)
        const widthText = new Text({text: `${this.data.width} мм`, style: textStyle});
        widthText.anchor.set(0.5, 0); // Центрируем по горизонтали, привязка к верхнему краю
        widthText.x = x + this.width / 2;
        widthText.y = y + 5; // Смещаем вниз на 10 пикселей от верхней границы
        graphics.addChild(widthText);

        // Метка высоты (по центру справа)
        const heightText = new Text({text: `${this.data.height} мм`, style: textStyle});
        heightText.anchor.set(1, 0.5); // Привязка к правому краю, центрируем по вертикали
        heightText.rotation = -Math.PI / 2; // Поворот на 90 градусов против часовой
        heightText.x = x + this.width - 10; // Смещаем влево на 10 пикселей от правой границы
        heightText.y = y + this.height / 2 - 20;
        graphics.addChild(heightText);

        // Дополнительные метки для углов (если нужно)
        // Например, радиусы или углы для topLeft и topRight
    }

}

class ShapeAdjuster extends Helpers {
    maxIterations: number = 500
    maxPositionAttempts: number = 250

    constructor({getMmWidth, getMmHeight, getPixelHeight, getPixelWidth }:
                {
                    getMmHeight?: () => void,
                    getMmWidth?: () => void,
                    getPixelHeight?: () => void,
                    getPixelWidth?: () => void,
                })
    {
        super()
        if(getMmWidth)
            this.getMmWidth = getMmWidth
        if(getMmHeight)
            this.getMmHeight = getMmHeight
        if(getPixelWidth)
            this.getPixelWidth = getPixelWidth
        if(getPixelHeight)
            this.getPixelHeight = getPixelHeight
    }

    createColumnBounds(sections, colNdx) {

        const totalCol = sections.filter(el => el.colNdx == colNdx)

        const colBounds = totalCol.reduce((acc: TExtremum, cur: TExtremum) => {

            if (cur.bound) {
                acc.maxX = Math.max(acc.maxX, cur.bound.maxX)

                if (cur.bound.minX > 0) {
                    acc.minX = Math.min(acc.minX, cur.bound.minX);
                }

                acc.maxY = Math.max(acc.maxY, cur.bound.maxY)
                acc.minY = acc.minY <= 0 ? cur.bound.minY : Math.min(acc.minY, cur.bound.minY)
                return acc
            }

        }, {maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity})

        return colBounds
    }


    getRandomPosition(sector, shape) {

        const bounds = this.getSectorBounds(sector)

        const margin = 0;
        const width = shape.width;
        const height = shape.height;

        const origX = shape.graphic.position.x
        const origY = shape.graphic.position.y

        for (let i = 0; i < this.maxPositionAttempts; i++) {

            const x = this.convertToTen(bounds.x + margin * (bounds.width - width));
            const y = this.convertToTen(bounds.y + margin + Math.random() * (bounds.height - height));

            shape.graphic.position.x = x;
            shape.graphic.position.y = y;

            if (
                !sector.shapes.some(
                    (other) => other !== shape && shape.checkOverlap(other)
                )
            ) {
                shape.graphic.position.x = origX;
                shape.graphic.position.y = origY;
                return {x, y};
            }
        }

        shape.graphic.position.x = origX;
        shape.graphic.position.y = origY;
        return null;
    }

    checkToCollision(sector: Container, shapeType: string, shapeData: THoleData) {
        const shapes = sector.shapes;


        const tempShape = new Shape({
            type: shapeType,
            sector: sector,
            data: shapeData,
            getMmWidth: this.getMmWidth,
            getMmHeight: this.getMmHeight,
            getPixelWidth: this.getPixelWidth,
            getPixelHeight: this.getPixelHeight,
        });

        const insideSector = tempShape.isPositionInsideSector(shapeData.position || {
            x: shapeData.x,
            y: shapeData.y,
        });


        const overLap = shapes.some(
            (otherShape) =>
                otherShape.graphic.holeId !== tempShape.graphic.holeId &&
                tempShape.checkOverlap(otherShape)
        );

        return insideSector && !overLap;
    }

}


export {Shape, ShapeAdjuster, Section}