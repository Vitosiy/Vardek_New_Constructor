<script setup lang="ts">
// @ts-nocheck
import {
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed,
  reactive,
  toRaw,
  defineExpose,
  render,
  onBeforeMount,
  toRef,
} from "vue";
import { Application, Container, Graphics, Text } from "pixi.js";
import { Shape, ShapeAdjuster, Section } from "./utils/Methods";
import { UI_PARAMS} from "./utils/UMConstructorConst.ts";

const props = defineProps({
  module: {
    type: Array,
    required: true,
  },

  maxAreaHeight: {
    type: Number,
    default: 720,
  },
  maxAreaWidth: {
    type: Number,
    default: 600 ,
  },
  correct: {
    type: Object,
  },

  step: {
    type: Number,
    default: 1,
  },

  container: {},
});

const emit = defineEmits(["cell-selected", "position-non"]);
const canvasContainer = ref();
const selectedCell = ref({ section: 0, cell: 0, row: 0 });

let app: Application,
    sectionsContainer: Container,
    lablesContainer: Container,
    dementionContainer: Container,
    shapeAdjuster: ShapeAdjuster;

let cursorCheck = false;
let lastDragEvent = ref(null);

// Хранилища объектов
const sections: Container[] = [];
const sectionLables: (Graphics | Text)[] = [];
const deviders: Graphics[] = [];
const dementions: Graphics[] = [];

const {
  MAX_AREA_WIDTH,
  MAX_AREA_HEIGHT,
  TOTAL_LENGTH,
  // TOTAL_HEIGHT,
  BACKGROUND_COLOR,
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
} = UI_PARAMS;

const dragState = reactive({
  isDragging: false,
  type: null, // "vertical" или "horizontal"

  sectionIndex: null,
  cellIndex: null, // Для горизонтального перетаскивания

  startX: 0,
  startY: 0,

  startLeftWidth: 0,
  startRightWidth: 0,

  minXleft: 150,
  minXRight: 150,

  startTopHeight: 0,
  startBottomHeight: 0,

  minTop: 150,
  minBottom: 150,

  element: null,
});

const pixelRatio = computed(() => TOTAL_LENGTH / MAX_AREA_WIDTH);

const TOTAL_HEIGHT = ref(0);
const TOTAL_WIDTH = ref(0);

const areaHeight = ref(0);
const areaWidth = ref(0);

const getMaxAreaHeight = () =>
    (TOTAL_HEIGHT.value * MAX_AREA_WIDTH) / TOTAL_LENGTH;

const getMaxAreaWidth = () =>
    (TOTAL_LENGTH * MAX_AREA_WIDTH) / TOTAL_HEIGHT.value;

const updateTotalHeight = (value) => {
  TOTAL_HEIGHT.value = parseInt(value);
  areaHeight.value = getMaxAreaHeight();

  app.canvas.style.height = `${areaHeight.value}px`;
  app.renderer.resize(TOTAL_LENGTH, areaHeight.value);
};

const updateTotalWidth = (value) => {
  areaWidth.value = parseInt(value);

  app.canvas.style.width = `${TOTAL_LENGTH}px`;
  app.renderer.resize(TOTAL_LENGTH, areaHeight.value);
};

const getPixelWidth = (mmWidth) => {
  // return Math.floor((mmWidth / TOTAL_LENGTH) * MAX_AREA_WIDTH);
  return (mmWidth / TOTAL_LENGTH) * MAX_AREA_WIDTH;
};

const getPixelHeight = (mmHeight) => {
  // return Math.floor((mmHeight / TOTAL_HEIGHT) * getMaxAreaHeight.value);
  return (mmHeight / TOTAL_HEIGHT.value) * areaHeight.value;
};

const getMmWidth = (pxWidth) => {
  return (pxWidth / MAX_AREA_WIDTH) * TOTAL_LENGTH;
};

const init = async () => {
  app = new Application();
  await app.init({
    canvas: canvasContainer.value,
    width: MAX_AREA_WIDTH,
    height: areaHeight.value,
    backgroundColor: BACKGROUND_COLOR,
    resolution: window.devicePixelRatio || 1,
    // autoDensity: true,
    antialias: true,
    premultipliedAlpha: false,
  });

  sectionsContainer = new Container();
  lablesContainer = new Container();
  dementionContainer = new Container();

  // sectionsContainer.interactive = true;
  lablesContainer.interactiveChildren = false;
  dementionContainer.interactiveChildren = false;

  app.stage.addChild(sectionsContainer);
  app.stage.addChild(lablesContainer);
  app.stage.addChild(dementionContainer);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  shapeAdjuster = new ShapeAdjuster();
  shapeAdjuster.setStep(props.step)
  addTicker();

  renderGrid();
};

const renderGrid = () => {
  clearRender();

  let xOffset = 0;
  let yOffset = 0;
  let ModulepxWidth = getPixelWidth(props.module.width);
  let ModulepxHeight = getPixelHeight(props.module.height);
  props.module.xOffset = xOffset;
  props.module.yOffset = yOffset;

  let moduleSector = createModule({
    x: xOffset,
    y: yOffset,
    width: ModulepxWidth,
    height: ModulepxHeight,
    moduleData: props.module,
  });

  props.module?.sections.forEach((section, sectionIndex) => {
    const pxWidth = getPixelWidth(section.width);

    yOffset = getPixelHeight(props.module.moduleThickness);
    xOffset += getPixelWidth(props.module.moduleThickness)

    if(section.cells.length > 0) {
      section.cells.forEach((cell, cellIndex, section) => {
        const pxHeight = getPixelHeight(cell.height);
        cell.xOffset = xOffset;
        cell.yOffset = yOffset;

        if(cell.cellsRows?.length > 0) {
          let rowxOffset = xOffset;
          cell.cellsRows.forEach((cellRow, cellRowIndex, _cell) => {
            const RowpxWidth = getPixelWidth(cellRow.width);
            cellRow.xOffset = rowxOffset;
            cellRow.yOffset = yOffset;

            createSector({
              x: rowxOffset,
              y: yOffset,
              width: RowpxWidth,
              height: pxHeight,
              sectionIndex,
              cellIndex,
              cellData: cellRow,
              section: _cell,
              rowIndex: cellRowIndex,
              row: cellRow,
              _sector: moduleSector,
            });

            //Добавляем отступ по вертикали
            rowxOffset += RowpxWidth + getPixelWidth(props.module.moduleThickness);
            const colBond = shapeAdjuster.createColumnBounds(sections, sectionIndex);

            // Создаём ограничения для секторов по ширине
            cellRow.shapesBond = colBond;
            cellRow.maxX = shapeAdjuster.convertToTen(getMmWidth(colBond.maxX));
            cellRow.minX = shapeAdjuster.convertToTen(getMmWidth(colBond.minX));
          });
        }
        else
          createSector({
            x: xOffset,
            y: yOffset,
            width: pxWidth,
            height: pxHeight,
            sectionIndex,
            cellIndex,
            cellData: cell,
            section,
            _sector: moduleSector,
          });

        //Добавляем отступ по вертикали
        yOffset += pxHeight + getPixelHeight(props.module.moduleThickness);
        const colBond = shapeAdjuster.createColumnBounds(sections, sectionIndex);

        // Создаём ограничения для секторов по ширине
        cell.shapesBond = colBond;
        cell.maxX = shapeAdjuster.convertToTen(getMmWidth(colBond.maxX));
        cell.minX = shapeAdjuster.convertToTen(getMmWidth(colBond.minX));
      });
    }
    else {
      const pxHeight = getPixelHeight(section.height);
      section.xOffset = xOffset;
      section.yOffset = yOffset;

      // Отрисовываем секцию

      createSector({
        x: xOffset,
        y: yOffset,
        width: pxWidth,
        height: pxHeight,
        sectionIndex,
        cellIndex: 0,
        cellData: section,
        section: [section],
        _sector: moduleSector,
      });

      //Добавляем отступ по вертикали
      yOffset += pxHeight;
      const colBond = shapeAdjuster.createColumnBounds(sections, sectionIndex);

      // Создаём ограничения для секторов по ширине
      section.shapesBond = colBond;
      section.maxX = shapeAdjuster.convertToTen(getMmWidth(colBond.maxX));
      section.minX = shapeAdjuster.convertToTen(getMmWidth(colBond.minX));
    }


    //Добавляем отступ по горизонтали
    xOffset += pxWidth;
  })

  sections.forEach((elem) => {
    app.stage.addChildAt(elem, 0);
  });

  deviders.forEach((elem) => {
    sectionsContainer.addChild(elem);
  });

  sectionLables.forEach((elem) => {
    lablesContainer.addChild(elem);
  });

  dementions.forEach((elem) => {
    dementionContainer.addChild(elem);
  });
};

const createModule = ({
                        x,
                        y,
                        width,
                        height,
                        moduleData,
                      }) => {

  const sector = new Container({isRenderGroup: true});

  sector.position.set(x, y);

  sector.shapes = [];
  sector.sectorData = moduleData;
  sector.sections = sections;

  const cell = new Section(moduleData, width, height, sector);
  cell.highlightGraphics.visible = false;
  cell.cellGraphics.eventMode = "static";
  cell.cellGraphics.cursor = "pointer";

  sector.addChild(cell.cellGraphics);
  sector.addChild(cell.highlightGraphics);

  sections.push(sector);
  // /** Создаём нумерацию сектора */
  //createSectioNum({ x, y, width, height, cell, sectionIndex, cellIndex });

  /*cell.cellGraphics.on("pointerdown", () => {
    selectCell(null, null);
  });*/
  // /**Создание вертикального выреза */
  //createVerticalCut({ width, height, cell, section, sectionIndex, sector });
  // /**Создание горизонтального выреза */
  //createHorozontalCut({ width, height, cell, section, sectionIndex, cellIndex, sector });

  // Создаём ограничения для секторов по высоте
  const sectorBounds = shapeAdjuster.getTotalBounds(sector, moduleData);
  sector.bound = sectorBounds;

  moduleData.maxY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.maxY));
  moduleData.minY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.minY));

  moduleData.sector = sector;

  return sector;
};

// Создаём сектора
const createSector = ({
                        x,
                        y,
                        width,
                        height,
                        cellData,
                        section,
                        sectionIndex,
                        cellIndex,
                        _sector = false,
                        rowIndex = null,
                        row = false,
                      }) => {

  let sector = new Container();

  sector.position.set(x, y);

  sector.shapes = [];
  sector.sectorData = cellData;
  sector.sections = sections;

  sector.secIndex = sectionIndex;
  sector.cellIndex = cellIndex;
  sector.rowIndex = rowIndex;

  const cell = new Section(cellData, width, height, sector);

  if (
      selectedCell.value.sec === sectionIndex &&
      selectedCell.value.cell === cellIndex
  ) {
    cell.highlightGraphics.visible = true;
  } else {
    cell.highlightGraphics.visible = false;
  }

  cell.cellGraphics.eventMode = "static";
  cell.cellGraphics.cursor = "pointer";

  sector.addChild(cell.cellGraphics);
  sector.addChild(cell.highlightGraphics);

  if(!_sector)
    sections.push(sector);
  else
    _sector.addChild(sector);

  // /** Создаём нумерацию сектора */
  createSectioNum({ x, y, width, height, cell: cellData, sectionIndex, cellIndex, rowIndex });

  cell.cellGraphics.on("pointerdown", () => {
    selectCell(sectionIndex, cellIndex, rowIndex);
  });
  // /**Создание вертикального выреза */
  createVerticalCut({ width, height, cell: cellData, section, sectionIndex, sector });
  // /**Создание горизонтального выреза */
  createHorozontalCut({ width, height, cell: cellData, section, sectionIndex, cellIndex, sector });

  // Создаём ограничения для секторов по высоте

  const sectorBounds = shapeAdjuster.getTotalBounds(sector, cellData);
  sector.bound = sectorBounds;

  cell.maxY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.maxY));
  cell.minY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.minY));

  cell.sector = sector;

  // Рендер линейки расстояний до границ сектора
  sector.shapes.forEach((el) => {
    el.drawBoundaryDistances();
  });
};

// Отрисовываем номер ячейки
const createSectioNum = ({ x, y, width, height, cell, sectionIndex, cellIndex, rowIndex = null }) => {
  const pxWidth = getPixelWidth(cell.width);
  const pxHeight = getPixelHeight(cell.height);

  const cellNumber = rowIndex !== null ? new Text({
    text:`${sectionIndex + 1}.${cellIndex + 1}.${rowIndex + 1}`,
    style: { fontSize: 14, fill: "#131313", align: "center" },
  })
      : new Text({
    text: `${sectionIndex + 1}.${cellIndex + 1}`,
    style: { fontSize: 14, fill: "#131313", align: "center" },
  });
  cellNumber.anchor.set(0.5);
  cellNumber.x = cell.xOffset + pxWidth / 2;
  cellNumber.y = cell.yOffset + pxHeight / 2;

  const cellNumberBackground = new Graphics();
  cellNumberBackground.roundRect(
      cell.xOffset + pxWidth / 2 - 12.5,
      cell.yOffset + pxHeight / 2 - 12,
      25,
      25,
      5
  );
  cellNumberBackground.fill("#ffffff");
  cellNumberBackground.stroke({ width: 1, color: "#A3A9B5" });

  cellNumber.interactive = false;
  cellNumberBackground.interactive = false;

  sectionLables.push(cellNumberBackground);
  sectionLables.push(cellNumber);
};

// Отрисовываем вертикальный вырез
const createVerticalCut = ({ width, height, cell, section, sectionIndex, sector }) => {
  if (!(sectionIndex < props.module.sections.length - 1))
    return;

  const pxWidth = getPixelWidth(cell.width);
  const totalHeight = section.reduce((sum, cell) => sum + cell.height, 0);
  const convertTotalHeight = getPixelHeight(totalHeight);

  const divider = new Graphics();
  const dashVert = new Graphics();

  divider.rect(0, 0, 10, convertTotalHeight);

  divider.fill("#A3A9B5");
  divider.alpha = 0;

  divider.eventMode = "static";
  divider.cursor = "section-resize";
  divider.section = sectionIndex;

  dashVert.rect(0, 0, 0, convertTotalHeight);
  dashVert.stroke({ width: 1, color: "#5D6069" });
  divider.dev_name = `dev${divider.uid}`;

  divider.position.set(cell.xOffset + pxWidth - 5, 0);
  dashVert.position.set(cell.xOffset + pxWidth, 0);
  divider.toColideCheck = dashVert;

  // const dashedV = drawDashedLine({
  //   startX: cell.xOffset + pxWidth,
  //   startY: 0,
  //   endX: cell.xOffset + pxWidth,
  //   endY: convertTotalHeight,
  //   graphics: dashVert,
  // });

  divider.on("pointerdown", onVerticalDragStart, divider);

  deviders.push(dashVert, divider);
};

// Отрисовываем вертикальный вырез
const createHorozontalCut = ({
                               width,
                               height,
                               cell,
                               section,
                               sectionIndex,
                               cellIndex,
                               sector,
                             }) => {
  if (!(cellIndex < section.length - 1)) return;

  const pxWidth = getPixelWidth(cell.width);
  const pxHeight = getPixelHeight(cell.height);

  const divider = new Graphics();
  const dashHor = new Graphics();

  divider.rect(cell.xOffset, cell.yOffset + pxHeight - 5, pxWidth, 10);
  divider.fill("#A3A9B5");
  divider.alpha = 0;
  divider.eventMode = "static";
  divider.cursor = "cell-resize";
  divider.section = sectionIndex;
  divider.cell = cellIndex;

  // dragState.sectionIndex === sectionIndex && dragState.cellIndex === cellIndex
  //   ? (divider.alpha = 0.5)
  //   : (divider.alpha = 0);

  // const dashedV = drawDashedLine({
  //   startX: cell.xOffset,
  //   startY: cell.yOffset + pxHeight,
  //   endX: cell.xOffset + pxWidth,
  //   endY: cell.yOffset + pxHeight,
  //   graphics: dashHor,
  // });

  dashHor.rect(cell.xOffset, cell.yOffset + pxHeight, pxWidth, 0);
  dashHor.stroke({ width: 1, color: "#5D6069" });

  divider.on("pointerdown", onHorizontalDragStart, divider);

  // deviders.push(dashedV, divider);
  deviders.push(dashHor, divider);
};

// Выбор сектора, передача в родительский компонент
const selectCell = (sectionIndex, cellIndex, parent = false, rowIndex = null) => {
  console.log(sectionIndex, cellIndex, rowIndex, "CR");

  selectedCell.value = { section: sectionIndex, cell: cellIndex , row: rowIndex};
  toggleSectorColor(sectionIndex, cellIndex, rowIndex);
  if (!parent) emit("cell-selected", sectionIndex, cellIndex, rowIndex);
};

const toggleSectorColor = (sectionIndex, cellIndex, rowIndex = null) => {
  const sector = rowIndex !== null ? props.module.sections[sectionIndex].cells[cellIndex].cellsRows?.[rowIndex]?.sector :
    cellIndex ? props.module.sections[sectionIndex].cells[cellIndex].sector :
        sectionIndex ? props.module.sections[sectionIndex].sector :
            props.module.sector;

  sections.forEach((elem) => {
    if(elem.children[1])
      elem.children[1].visible = false;
    // elem.children[0].alpha = 1;
  });
  if(sector?.children[1])
    sector.children[1].visible = true;
  // sector.children[0].alpha = 0.5;
};

// Обработчик для вертикального перетаскивания (между колонками)
function onVerticalDragStart(event) {
  // event.stopPropagation();
  cursorCheck = true;
  const sectionIndex = this.sec;

  const cur = props.module.sections[sectionIndex];
  const next = props.module.sections[sectionIndex + 1];

  // event.currentTarget.alpha = 0.5;

  dragState.isDragging = true;
  dragState.type = "vertical";

  dragState.secIndex = sectionIndex;
  dragState.startX = event.data.global.x;

  dragState.startLeftWidth = cur[0].width;
  dragState.startRightWidth = next[0].width;

  dragState.minXleft = shapeAdjuster.getLeftSectionWidth(
      cur[0].sector,
      cur[0].maxX
  );

  dragState.minXRight = shapeAdjuster.getRightSectionWidth(
      next[0].sector,
      next[0].minX
  );

  dragState.element = this;

  app.stage.on("pointermove", onDragMove);
  app.stage.on("pointerup", onDragEnd);
}

// Обработчик для горизонтального перетаскивания (между строками)
function onHorizontalDragStart(event) {
  // event.stopPropagation();

  cursorCheck = true;

  const sectionIndex = this.section as number;
  const cellIndex = this.cell as number;

  const cur = props.module.sections[sectionIndex].cells[cellIndex];
  const next = props.module.sections[sectionIndex].cells[cellIndex + 1];

  // event.currentTarget.alpha = 0.5;
  dragState.element = this;
  dragState.isDragging = true;
  dragState.type = "horizontal";
  dragState.secIndex = sectionIndex;
  dragState.cellIndex = cellIndex;
  dragState.startY = event.data.global.y;
  dragState.startTopHeight = cur.height;
  dragState.startBottomHeight = next.height;

  dragState.minTop = shapeAdjuster.getSectionTop(cur.sector, cur.maxY);
  dragState.minBottom = shapeAdjuster.getSectionBottom(next.sector, next.minY);

  app.stage.on("pointermove", onDragMove);
  app.stage.on("pointerup", onDragEnd);
}

function onDragMove(event) {

  if(!event)  return

  lastDragEvent.value = event;
}

function dragMove(event) {
  if (!dragState.isDragging || !lastDragEvent.value) return;

  console.log('55')

  const {
    type,
    sectionIndex,
    cellIndex,
    startX,
    startY,
    startLeftWidth,
    startRightWidth,
    startTopHeight,
    startBottomHeight,
    minXleft,
    minXRight,
    minTop,
    minBottom,
    element,
  } = dragState;

  if (type === "vertical") {
    let curMin = minXleft < MIN_SECTION_WIDTH ? MIN_SECTION_WIDTH : minXleft;
    let nextMin = minXRight < MIN_SECTION_WIDTH ? MIN_SECTION_WIDTH : minXRight;

    const deltaPixels = event.data.global.x - startX;

    element.position.x =
        Math.floor(event.data.global.x / props.step) * props.step;
    const deltaMm =
        Math.floor((deltaPixels * pixelRatio.value) / props.step) * props.step;

    // Calculate new dimensions
    let newLeftWidth = startLeftWidth + deltaMm;
    let newRightWidth = startRightWidth - deltaMm;

    // Enforce minimum dimensions
    if (newLeftWidth < curMin) {
      newLeftWidth = curMin;
      newRightWidth = startLeftWidth + startRightWidth - curMin;
    } else if (newRightWidth < nextMin) {
      newRightWidth = nextMin;
      newLeftWidth = startLeftWidth + startRightWidth - nextMin;
    }

    props.module[sectionIndex].forEach((cell) => {
      cell.width = newLeftWidth;
    });

    props.module[sectionIndex + 1].forEach((cell) => {
      cell.width = newRightWidth;
    });
  } else if (type === "horizontal") {
    let curMin = minTop < MIN_SECTION_WIDTH ? MIN_SECTION_WIDTH : minTop;
    let nextMin = minBottom < MIN_SECTION_WIDTH ? MIN_SECTION_WIDTH : minBottom;

    const deltaPixels = event.data.global.y - startY;

    element.position.y =
        Math.floor(event.data.global.y / props.step) * props.step;
    const deltaMm =
        Math.floor((deltaPixels * pixelRatio.value) / props.step) * props.step;

    // Calculate new dimensions
    let newTopHeight = startTopHeight + deltaMm;
    let newBottomHeight = startBottomHeight - deltaMm;

    // Enforce minimum dimensions
    if (newTopHeight < curMin) {
      newTopHeight = curMin;
      newBottomHeight = startTopHeight + startBottomHeight - curMin;
    } else if (newBottomHeight < nextMin) {
      newBottomHeight = nextMin;
      newTopHeight = startTopHeight + startBottomHeight - nextMin;
    }

    props.module.sections[sectionIndex].cells[cellIndex].height = newTopHeight;
    props.module.sections[sectionIndex].cells[cellIndex + 1].height = newBottomHeight;
  }

  renderGrid();
}

const onDragEnd = () => {
  dragState.isDragging = false;
  dragState.type = null;
  dragState.secIndex = null;
  dragState.cellIndex = null;
  dragState.curRoundMax = null;
  dragState.nextRoundMax = null;
  lastDragEvent.value = null

  app.stage.off("pointermove", onDragMove);
  app.stage.off("pointerup", onDragEnd);
  cursorCheck = false;

  renderGrid();
};

const handleGlobalPointerMove = (event) => {
  if (!app.renderer || !cursorCheck) return;

  const canvasRect = canvasContainer.value.getBoundingClientRect();

  const mouseX = event.clientX - canvasRect.left;
  const mouseY = event.clientY - canvasRect.top;

  if (
      mouseX < 0 ||
      mouseY < 0 ||
      mouseX > app.renderer.width ||
      mouseY > app.renderer.height
  ) {
    // console.log("Курсор вне холста (глобальная проверка)");
    onDragEnd();
  }
};

const adjustSectionSize = (
    sectionIndex,
    cellIndex,
    newValue,
    dimension = "width"
) => {
  const minValue =
      dimension === "width" ? MIN_SECTION_WIDTH : MIN_SECTION_HEIGHT;
  newValue = Math.max(Math.floor(newValue / props.step) * props.step, minValue);
  let calcValue;

  const module = props.module;
  if(!sectionIndex) {
    module[dimension] = newValue

    calcValue = newValue
  }
  else {
    if (dimension === "width") {
      const column = module.sections[sectionIndex];

      if (sectionIndex < module.sections.length - 1) {
        const nextCol = module.sections[sectionIndex + 1];
        const totalWidth = column.width + nextCol.width;

        const minCurrent = Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getLeftSectionWidth(column.sector, column.maxX)
        );

        const minNext = Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getRightSectionWidth(nextCol.sector, nextCol.minX)
        );
        calcValue = updateSizes(
            newValue,
            dimension,
            column,
            nextCol,
            totalWidth,
            minCurrent,
            minNext
        );
      }
      else if (sectionIndex > 0) {
        const prevCol = module.sections[sectionIndex - 1];
        const totalWidth = column.width + prevCol.width;

        const minCurrent = Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getRightSectionWidth(column.sector, column.minX)
        );

        const minPrev = Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getLeftSectionWidth(prevCol.sector, prevCol.maxX)
        );

        calcValue = updateSizes(
            newValue,
            dimension,
            column,
            prevCol,
            totalWidth,
            minCurrent,
            minPrev
        );
      }
      else {
        column.forEach((cell) => (cell.width = newValue));
      }
    } else {
      const column = module.sections[sectionIndex];
      const currentRow = column.cells[cellIndex];
      if (cellIndex < column.length - 1) {
        const nextRow = column.cells[cellIndex + 1];
        const totalHeight = currentRow.height + nextRow.height;
        const minCurrent = Math.max(
            MIN_SECTION_HEIGHT,
            shapeAdjuster.getSectionTop(currentRow.sector, currentRow.maxY)
        );
        const minNext = Math.max(
            MIN_SECTION_HEIGHT,
            shapeAdjuster.getSectionBottom(nextRow.sector, nextRow.minY)
        );
        calcValue = updateSizes(
            newValue,
            dimension,
            currentRow,
            nextRow,
            totalHeight,
            minCurrent,
            minNext
        );
      }
      else if (cellIndex > 0) {
        const prevRow = column.cells[cellIndex - 1];
        const totalHeight = currentRow.height + prevRow.height;
        const minCurrent = Math.max(
            MIN_SECTION_HEIGHT,
            shapeAdjuster.getSectionBottom(currentRow.sector, currentRow.minY)
        );
        const minPrev = Math.max(
            MIN_SECTION_HEIGHT,
            shapeAdjuster.getSectionTop(prevRow.sector, prevRow.maxY)
        );
        calcValue = updateSizes(
            newValue,
            dimension,
            currentRow,
            prevRow,
            totalHeight,
            minCurrent,
            minPrev
        );
      }
      else {
        currentRow.height = newValue;
      }
    }
  }
  renderGrid();
  return calcValue;
};

const updateSizes = (
    newValue,
    dimension,
    current,
    adjacent,
    total,
    minCurrent,
    minAdjacent
) => {
  if (newValue < minCurrent) newValue = minCurrent;
  const newAdjacentSize = total - newValue;
  if (newAdjacentSize < minAdjacent) newValue = total - minAdjacent;

  if (dimension === "width") {
    current.forEach((cell) => (cell.width = newValue));
    adjacent.forEach((cell) => (cell.width = total - newValue));
  } else {
    current[dimension] = newValue;
    adjacent[dimension] = total - newValue;
  }

  return newValue;
};

const adjustSizeFromExternal = ({
                                  dimension,
                                  value,
                                  section,
                                  cell,
                                }: {
  dimension: string;
  value: number;
  section?: number;
  cell?: number;
}) => {
  if (section === null) {
    console.warn("Не выбрана ячейка для изменения размера");
    return;
  }

  return adjustSectionSize(section, cell, value, dimension);
};

const clearRender = () => {
  sections.forEach((elem) => {
    app.stage.removeChild(elem);
    elem.destroy();
  });

  sections.length = 0;
  sectionLables.length = 0;
  deviders.length = 0;
  dementions.length = 0;

  sectionsContainer.removeChildren();
  lablesContainer.removeChildren();
  dementionContainer.removeChildren();
};

const destroy = () => {
  app.destroy(true);
};

const addTicker = () => {
  app.ticker.maxFPS = 60
  app.ticker.add(() => {
    dragMove(lastDragEvent.value);
  });
};

onBeforeMount(() => {
  TOTAL_HEIGHT.value = props.maxAreaHeight;
  areaWidth.value = props.maxAreaWidth;
  areaHeight.value = getMaxAreaHeight();
});

onMounted(() => {
  // console.log(toRaw(props.maxAreaHeight), 'TT')
  // getMaxAreaHeight.value = props.maxAreaHeight;
  init();
  document.addEventListener("mousemove", handleGlobalPointerMove, false);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", handleGlobalPointerMove, false);
  app.destroy(true);
});

defineExpose({
  adjustSizeFromExternal,
  renderGrid,
  selectCell,
  updateTotalHeight,
  updateTotalWidth,
  destroy,
});

// watch(
//   () => props.maxAreaHeight,
//   () => {
//     getMaxAreaHeight.value = props.maxAreaHeight;
//     renderGrid();
//   }
// );
</script>

<template>
  <div class="visualization" :style="`height:${areaHeight}px width:${areaWidth}px`">
    <canvas ref="canvasContainer"></canvas>
  </div>
  <!-- :style="'height:getMaxAreaHeight'" -->
</template>

<style>
.visualization {
  canvas {
    border: 1px solid #bbbbbb;
  }

  position: relative;
  right: 17vh;
}

/*  height: 320px;
  width: 800px;
*/

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
