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
import {Application, Container, Graphics, Text} from "pixi.js";
import {Shape, ShapeAdjuster, Section} from "./utils/Methods";
import {UI_PARAMS} from "./utils/UMConstructorConst.ts";

const props = defineProps({
  module: {
    type: Array,
    required: true,
  },

  mode: {
    type: String,
    default: "module",
  },

  maxAreaHeight: {
    type: Number,
    default: 720,
  },
  maxAreaWidth: {
    type: Number,
    default: 600,
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

const selectedCell = ref({sec: 0, cell: 0, row: null});
const selectedFasade = ref({sec: 0, cell: 0, row: 0});
const selectedFilling = ref({sec: 0, cell: 0, row: null, item: 0});

let app: Application,
    sectionsContainer: Container,
    lablesContainer: Container,
    dementionContainer: Container,
    fillingsContainer: Container,
    shapeAdjuster: ShapeAdjuster;

let cursorCheck = false;
let lastDragEvent = ref(null);

// Хранилища объектов
const sections: Container[] = [];
const sectionLables: (Graphics | Text)[] = [];
const deviders: Graphics[] = [];
const dementions: Graphics[] = [];
const fillings: Graphics[] = [];

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

const TOTAL_HEIGHT = ref(0);
const TOTAL_WIDTH = ref(0);
const areaHeight = ref(MAX_AREA_HEIGHT);
const areaWidth = ref(MAX_AREA_WIDTH);
const mode = ref('module');

const pixelRatio = computed(() => TOTAL_WIDTH.value / MAX_AREA_WIDTH);

const getMaxAreaHeight = () =>
    (TOTAL_HEIGHT.value * MAX_AREA_WIDTH) / TOTAL_WIDTH.value;

const getMaxAreaWidth = () =>
    (TOTAL_WIDTH.value * MAX_AREA_HEIGHT) / TOTAL_HEIGHT.value;

const updateTotalHeight = (value) => {
  TOTAL_HEIGHT.value = parseInt(value);
  areaHeight.value = getMaxAreaHeight();

  app.canvas.style.height = `${MAX_AREA_HEIGHT}px`;
  app.renderer.resize(areaWidth.value, areaHeight.value);
};

const updateTotalWidth = (value) => {
  TOTAL_WIDTH.value = parseInt(value);
  areaWidth.value = getMaxAreaWidth();

  app.canvas.style.width = `${MAX_AREA_WIDTH}px`;
  app.renderer.resize(areaWidth.value, areaHeight.value);
};

const updateTotalSize = (value, dimension) => {
  if (dimension === "width") {
    TOTAL_WIDTH.value = parseInt(value);
    areaWidth.value = getMaxAreaWidth();
    areaHeight.value = getMaxAreaHeight();
  } else {
    TOTAL_HEIGHT.value = parseInt(value);
    areaHeight.value = getMaxAreaHeight();
    areaWidth.value = getMaxAreaWidth();
  }

  app.canvas.style.width = `${MAX_AREA_WIDTH}px`;
  app.canvas.style.height = `${MAX_AREA_HEIGHT}px`;
  app.renderer.resize(MAX_AREA_WIDTH, MAX_AREA_HEIGHT);
};


const getPixelWidth = (mmWidth) => {
  // return Math.floor((mmWidth / TOTAL_LENGTH) * MAX_AREA_WIDTH);
  return (mmWidth / TOTAL_WIDTH.value) * MAX_AREA_WIDTH;
};

const getPixelHeight = (mmHeight) => {
  // return Math.floor((mmHeight / TOTAL_HEIGHT) * getMaxAreaHeight.value);
  return (mmHeight / TOTAL_HEIGHT.value) * MAX_AREA_HEIGHT;
};

const getMmWidth = (pxWidth) => {
  return (pxWidth / MAX_AREA_WIDTH) * TOTAL_WIDTH.value;
};

const getMmHeight = (pxHeight) => {
  return (pxHeight / MAX_AREA_HEIGHT) * TOTAL_HEIGHT.value;
};

const init = async () => {
  app = new Application();
  await app.init({
    canvas: canvasContainer.value,
    width: MAX_AREA_WIDTH,
    height: MAX_AREA_HEIGHT,
    backgroundColor: BACKGROUND_COLOR,
    resolution: window.devicePixelRatio || 1,
    // autoDensity: true,
    antialias: true,
    premultipliedAlpha: false,
  });

  sectionsContainer = new Container();
  lablesContainer = new Container();
  dementionContainer = new Container();
  fillingsContainer = new Container();

  // sectionsContainer.interactive = true;
  fillingsContainer.interactive = true,
  lablesContainer.interactiveChildren = false;
  dementionContainer.interactiveChildren = false;

  app.stage.addChild(sectionsContainer);
  app.stage.addChild(lablesContainer);
  app.stage.addChild(dementionContainer);
  app.stage.addChild(fillingsContainer);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  shapeAdjuster = new ShapeAdjuster({
    getMmWidth,
    getMmHeight,
    getPixelHeight,
    getPixelWidth,
  });
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

  props.module?.sections.forEach((section, sectionIndex, _sections) => {
    const pxWidth = getPixelWidth(section.width);

    yOffset = getPixelHeight(props.module.moduleThickness);
    xOffset += getPixelWidth(props.module.moduleThickness)

    if (section.cells.length > 0) {
      section.cells.forEach((cell, cellIndex, section) => {
        const pxHeight = getPixelHeight(cell.height);
        cell.xOffset = xOffset;
        cell.yOffset = yOffset;

        if (cell.cellsRows?.length > 0) {
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
              gridType: "module",
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
            gridType: "module",
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
        cellIndex: null,
        cellData: section,
        section: _sections,
        _sector: moduleSector,
        gridType: "module",
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


  if (mode.value === "fasades") {
    xOffset = getPixelWidth(2);
    props.module?.sections.forEach((section, sectionIndex) => {
      section.fasades.forEach((column, colIndex) => {
        const pxWidth = getPixelWidth(column[0].width);
        yOffset = getPixelHeight(2);

        column.forEach((row, rowIndex, col) => {
          const pxHeight = getPixelHeight(row.height);
          row.xOffset = xOffset;
          row.yOffset = yOffset;

          // Отрисовываем секцию

          createSector({
            x: xOffset,
            y: yOffset,
            width: pxWidth,
            height: pxHeight,
            sectionIndex,
            cellIndex: colIndex,
            rowIndex: rowIndex,
            cellData: row,
            section: col,
            _sector: moduleSector,
            gridType: 'fasades',
          });

          //Добавляем отступ по вертикали
          yOffset += pxHeight + 4;
        });
        //Добавляем отступ по горизонтали
        xOffset += pxWidth + 4;

        // Создаём ограничения для секторов по ширине
        const colBond = shapeAdjuster.createColumnBounds(sections, colIndex);

        column.forEach((row) => {
          row.shapesBond = colBond;
          row.maxX = shapeAdjuster.convertToTen(getMmWidth(colBond.maxX));
          row.minX = shapeAdjuster.convertToTen(getMmWidth(colBond.minX));
        });
      });
    })
  }

  sections.forEach((elem) => {
    app.stage.addChildAt(elem, 0);
  });

  deviders.forEach((elem) => {
    sectionsContainer.addChild(elem);
  });

  fillings.forEach((elem) => {
    fillingsContainer.addChild(elem);
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

  const cell = new Section(moduleData, width, height, sector, false);
  cell.highlightGraphics.visible = false;
  cell.cellGraphics.eventMode = "static";
  cell.cellGraphics.cursor = "pointer";

  sector.addChild(cell.cellGraphics);
  sector.addChild(cell.highlightGraphics);

  sections.push(sector);

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
                        gridType,
                        _sector = false,
                        rowIndex = null,
                        row = false,
                        itemIndex = null,
                        item = false,
                      }) => {

  let sector = new Container();

  sector.position.set(x, y);

  sector.shapes = [];
  sector.sectorData = cellData;
  sector.sections = sections;
  sector.fillingsContainer = fillingsContainer;

  sector.secIndex = sectionIndex;
  sector.cellIndex = cellIndex;
  sector.rowIndex = rowIndex;

  const cell = new Section(cellData, width, height, sector, gridType === mode.value);
  const seleted = gridType === "fasades" ? selectedFasade : gridType === "filling" ? selectedFilling : selectedCell;

  if (
      seleted.value.sec === sectionIndex &&
      seleted.value.cell === cellIndex &&
      seleted.value.row === rowIndex &&
      (seleted.value.item === undefined || seleted.value.item === itemIndex)
  ) {
    cell.highlightGraphics.visible = true;
  } else {
    cell.highlightGraphics.visible = false;
  }

  cell.cellGraphics.eventMode = "static";
  cell.cellGraphics.cursor = "pointer";

  sector.addChild(cell.cellGraphics);
  sector.addChild(cell.highlightGraphics);

  if (!_sector)
    sections.push(sector);
  else
    _sector.addChild(sector);

  cellData.fillings?.forEach((data) => {
    createFilling(data, sector);
  });

  cell.cellGraphics.on("pointerdown", () => {
    selectCell(gridType, sectionIndex, cellIndex, false, rowIndex);
  });

  // Создаём ограничения для секторов по высоте
  const sectorBounds = shapeAdjuster.getTotalBounds(sector, cellData);
  sector.bound = sectorBounds;

  cell.maxY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.maxY));
  cell.minY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.minY));

  cellData.sector = sector;

  // Рендер линейки расстояний до границ сектора
  sector.shapes.forEach((el) => {
    el.drawBoundaryDistances();
  });

  if (gridType === mode.value) {
    // /** Создаём нумерацию сектора */
    createSectioNum({x, y, width, height, cell: cellData, sectionIndex, cellIndex, rowIndex});

    // /**Создание вертикального драга */
    //createVerticalCut({width, height, cell: cellData, section, sectionIndex, sector, cellIndex, rowIndex});
    // /**Создание горизонтального драга */
    //createHorozontalCut({width, height, cell: cellData, section, sectionIndex, sector, cellIndex, rowIndex});
  }
};

const createFilling = (data, sector) => {
  const filling = new Shape({
    type: data.type,
    position: data.position,
    sector,
    data,
    select: selectCell,
    render: renderGrid,
    getMmWidth,
    getMmHeight,
    getPixelHeight,
    getPixelWidth,
    dementions,
    dementionContainer,
  });

  fillings.push(filling.graphic);
  sector.shapes.push(filling);
};

// Отрисовываем номер ячейки
const createSectioNum = ({x, y, width, height, cell, sectionIndex, cellIndex, rowIndex = null}) => {
  const pxWidth = getPixelWidth(cell.width);
  const pxHeight = getPixelHeight(cell.height);

  const cellNumber = rowIndex !== null ? new Text({
        text: `${sectionIndex + 1}.${cellIndex + 1}.${rowIndex + 1}`,
        style: {fontSize: 14, fill: "#131313", align: "center"},
      })
      : new Text({
        text: `${sectionIndex + 1}.${cellIndex + 1}`,
        style: {fontSize: 14, fill: "#131313", align: "center"},
      });
  cellNumber.anchor.set(0.5);
  cellNumber.x = cell.xOffset + pxWidth / 2;
  cellNumber.y = cell.yOffset + pxHeight / 2;

  const cellNumberBackground = new Graphics();
  cellNumberBackground.roundRect(
      cell.xOffset + pxWidth / 2 - 18,
      cell.yOffset + pxHeight / 2 - 12,
      36,
      25,
      5
  );
  cellNumberBackground.fill("#ffffff");
  cellNumberBackground.stroke({width: 1, color: "#A3A9B5"});

  cellNumber.interactive = false;
  cellNumberBackground.interactive = false;

  sectionLables.push(cellNumberBackground);
  sectionLables.push(cellNumber);
};

// Отрисовываем вертикальный вырез
const createVerticalCut = ({width, height, cell, section, sectionIndex, sector, cellIndex = null, rowIndex = null}) => {
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
  divider.cell = cellIndex;
  divider.row = rowIndex;

  dashVert.rect(0, 0, 0, convertTotalHeight);
  dashVert.stroke({width: 1, color: "#5D6069"});
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
                               sector,
                               cellIndex = null,
                               rowIndex = null,
                             }) => {
  if (!(cellIndex < section.length - 1))
    return;

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
  divider.row = rowIndex;

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
  dashHor.stroke({width: 1, color: "#5D6069"});

  divider.on("pointerdown", onHorizontalDragStart, divider);

  // deviders.push(dashedV, divider);
  deviders.push(dashHor, divider);
};

const checkPositionFillingToCreate = (data) => {
  const sec = selectedCell.value.sec;
  const cell = selectedCell.value.cell;
  const row = selectedCell.value.row;

  let position, tempShape;

  const sector = sections[0].children.find(
      (elem) => elem.secIndex === sec && elem.cellIndex === cell && elem.rowIndex === row
  );

  if (!sector) {
    return false;
  }

  tempShape = new Shape({
    type: data.type,
    sector,
    position: {x: 0, y: 0},
    data,
    getMmWidth: getMmWidth,
    getMmHeight: getMmHeight,
  });

  /** Проверяем на возможность размещения отверстия */

  position = shapeAdjuster.getRandomPosition(sector, tempShape);

  if (!position) {
    return false;
  }

  return {
    x: Math.round(getMmWidth(position.x)),
    y: Math.round(getMmWidth(position.y)),
    width: data.width,
    height: data.height,
    type: data.type,
    PROPS: data
  };
};

// Выбор сектора, передача в родительский компонент
const selectCell = (type, sectionIndex, cellIndex, parent = false, rowIndex = null, item = null) => {
  console.log(sectionIndex, cellIndex, rowIndex, "CR");

  switch (type) {
    case "fillings":
      selectedFilling.value = {sec: sectionIndex, cell: cellIndex, row: rowIndex, item: item};
      toggleFillingColor(sectionIndex, cellIndex, rowIndex, item);
      break;
    case "fasades":
      selectedFasade.value = {sec: sectionIndex, cell: cellIndex, row: rowIndex};
      toggleFasadeColor(sectionIndex, cellIndex, rowIndex);
      break;
    default:
      selectedCell.value = {sec: sectionIndex, cell: cellIndex, row: rowIndex};
      toggleSectionColor(sectionIndex, cellIndex, rowIndex);
      break;
  }
  if (!parent)
    emit("cell-selected", sectionIndex, cellIndex, type, rowIndex);
};

const toggleSectionColor = (sectionIndex, cellIndex, rowIndex = null) => {
  const sector = rowIndex !== null ? props.module.sections[sectionIndex].cells[cellIndex].cellsRows?.[rowIndex]?.sector :
      cellIndex !== null ? props.module.sections[sectionIndex].cells[cellIndex].sector :
          sectionIndex !== null ? props.module.sections[sectionIndex].sector :
              props.module.sector;

  sections[0].children.forEach((elem) => {
    if (elem.children[1])
      elem.children[1].visible = false;
    // elem.children[0].alpha = 1;
  });
  if (sector?.children[1])
    sector.children[1].visible = true;
  // sector.children[0].alpha = 0.5;
};

const toggleFasadeColor = (sectionIndex, doorIndex, segmentIndex = 0) => {
  const fasades = props.module.sections[sectionIndex].fasades
  const door = fasades[doorIndex]
  const segment = door?.[segmentIndex]

  const sector = segment?.sector || door?.sector;

  sections[0].children.forEach((elem) => {
    if (elem.children[1])
      elem.children[1].visible = false;
    // elem.children[0].alpha = 1;
  });
  if (sector?.children[1])
    sector.children[1].visible = true;
  // sector.children[0].alpha = 0.5;
};

const toggleFillingColor = (sectionIndex, cellIndex, rowIndex = null, itemIndex = null) => {
  const curSegment = rowIndex !== null ? props.module.sections[sectionIndex].cells[cellIndex].cellsRows?.[rowIndex] :
      cellIndex !== null ? props.module.sections[sectionIndex].cells[cellIndex] :
          sectionIndex !== null ? props.module.sections[sectionIndex] :
              props.module;
  const sector = curSegment?.fillings?.[itemIndex]?.sector;

  sections[0].children.forEach((elem) => {
    if (elem.children[1])
      elem.children[1].visible = false;
    // elem.children[0].alpha = 1;
  });
  if (sector?.children[1])
    sector.children[1].visible = true;
  // sector.children[0].alpha = 0.5;
};

// Обработчик для вертикального перетаскивания (между колонками)
function onVerticalDragStart(event) {
  const module = props.module;
  // event.stopPropagation();
  cursorCheck = true;
  const sectionIndex = this.section;
  const cellIndex = this.cell;
  const rowIndex = this.row;

  const column = module.sections[sectionIndex];
  const cell = column.cells?.[cellIndex];
  const row = cell?.cellsRows?.[rowIndex];

  const cur = row || column
  const next = rowIndex !== null ? cell.cellsRows[rowIndex + 1] :
      module.sections[sectionIndex + 1];

  dragState.isDragging = true;
  dragState.type = "vertical";

  dragState.secIndex = sectionIndex;
  dragState.cellIndex = cellIndex;
  dragState.rowIndex = rowIndex;
  dragState.startX = event.data.global.x;

  dragState.startLeftWidth = cur.width;
  dragState.startRightWidth = next.width;

  dragState.minXleft = shapeAdjuster.getLeftSectionWidth(
      cur.sector,
      cur.maxX
  );

  dragState.minXRight = shapeAdjuster.getRightSectionWidth(
      next.sector,
      next.minX
  );

  dragState.element = this;

  app.stage.on("pointermove", onDragMove);
  app.stage.on("pointerup", onDragEnd);
}

// Обработчик для горизонтального перетаскивания (между строками)
function onHorizontalDragStart(event) {
  // event.stopPropagation();

  const module = props.module;
  // event.stopPropagation();
  cursorCheck = true;
  const sectionIndex = this.section;
  const cellIndex = this.cell;
  const rowIndex = this.row;

  const column = module.sections[sectionIndex];
  const cell = column.cells?.[cellIndex];
  const row = cell?.cellsRows?.[rowIndex];

  const cur = row || cell
  const next = rowIndex !== null ? cell.cellsRows[rowIndex + 1] :
      column.cells[cellIndex + 1]

  // event.currentTarget.alpha = 0.5;
  dragState.element = this;
  dragState.isDragging = true;
  dragState.type = "horizontal";

  dragState.secIndex = sectionIndex;
  dragState.cellIndex = cellIndex;
  dragState.rowIndex = rowIndex;

  dragState.startY = event.data.global.y;
  dragState.startTopHeight = cur.height;
  dragState.startBottomHeight = next.height;

  dragState.minTop = shapeAdjuster.getSectionTop(cur.sector, cur.maxY);
  dragState.minBottom = shapeAdjuster.getSectionBottom(next.sector, next.minY);

  app.stage.on("pointermove", onDragMove);
  app.stage.on("pointerup", onDragEnd);
}

function onDragMove(event) {

  if (!event)
    return

  lastDragEvent.value = event;
}

function dragMove(event) {
  if (!dragState.isDragging || !lastDragEvent.value)
    return;

  console.log('55')

  const {
    type,
    secIndex,
    cellIndex,
    rowIndex,
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

    let section = props.module.sections[secIndex]
    let delta1 = section.width - newLeftWidth

    section.cells.forEach((cell) => {
      if (cell.cellsRows)
        cell.cellsRows[cell.cellsRows.length - 1].width += delta1

      cell.width = newLeftWidth;
    })
    section.width = newLeftWidth;

    let nextSection = props.module.sections[secIndex + 1]
    let delta2 = nextSection.width - newRightWidth

    nextSection.cells.forEach((cell) => {
      if (cell.cellsRows)
        cell.cellsRows[cell.cellsRows.length - 1].width += delta2

      cell.width = newRightWidth;
    })

    nextSection.width = newRightWidth;
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

    if (props.module.sections[secIndex].cells[cellIndex].cellsRows)
      props.module.sections[secIndex].cells[cellIndex].cellsRows.forEach((row) => {
        row.height = newTopHeight;
      })
    props.module.sections[secIndex].cells[cellIndex].height = newTopHeight;

    if (props.module.sections[secIndex].cells[cellIndex + 1].cellsRows)
      props.module.sections[secIndex].cells[cellIndex + 1].cellsRows.forEach((row) => {
        row.height = newBottomHeight;
      })
    props.module.sections[secIndex].cells[cellIndex + 1].height = newBottomHeight;
  }

  renderGrid();
}

const onDragEnd = () => {
  dragState.isDragging = false;
  dragState.type = null;
  dragState.secIndex = null;
  dragState.cellIndex = null;
  dragState.rowIndex = null;
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
    rowIndex,
    newValue,
    dimension = "width"
) => {
  const minValue =
      dimension === "width" ? MIN_SECTION_WIDTH : MIN_SECTION_HEIGHT;
  newValue = Math.max(Math.floor(newValue / props.step) * props.step, minValue);
  let calcValue;

  const module = props.module;
  if (!sectionIndex && sectionIndex !== 0) {
    module[dimension] = newValue

    calcValue = newValue
  } else {
    if (dimension === "width") {
      const column = module.sections[sectionIndex];
      const cell = column.cells?.[cellIndex];
      const row = cell?.cellsRows?.[rowIndex];
      const currentRow = row || cell || column

      if (sectionIndex < module.sections.length - 1) {
        const nextRow = rowIndex !== null ? cell.cellsRows[rowIndex + 1] :
            cellIndex !== null ? column.cells[cellIndex + 1] :
                module.sections[sectionIndex + 1];

        const totalWidth = currentRow.width + nextRow.width;

        const minCurrent = Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getLeftSectionWidth(currentRow.sector, currentRow.maxX)
        );

        const minNext = Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getRightSectionWidth(nextRow.sector, nextRow.minX)
        );
        calcValue = updateSizes(
            newValue,
            dimension,
            currentRow,
            nextRow,
            totalWidth,
            minCurrent,
            minNext
        );
      } else if (sectionIndex > 0) {
        const prevRow = rowIndex !== null ? cell.cellsRows[rowIndex - 1] :
            cellIndex !== null ? column.cells[cellIndex - 1] :
                module.sections[sectionIndex - 1];
        const totalWidth = column.width + prevRow.width;

        const minCurrent = Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getRightSectionWidth(column.sector, column.minX)
        );

        const minPrev = Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getLeftSectionWidth(prevRow.sector, prevRow.maxX)
        );

        calcValue = updateSizes(
            newValue,
            dimension,
            column,
            prevRow,
            totalWidth,
            minCurrent,
            minPrev
        );
      } else {
        column.forEach((cell) => (cell.width = newValue));
      }
    } else {
      const column = module.sections[sectionIndex];
      const cell = column.cells?.[cellIndex];
      const row = cell?.cellsRows?.[rowIndex];
      const currentRow = row || cell || column

      if (cellIndex < column.length - 1) {
        const nextRow = rowIndex !== null ? cell.cellsRows[rowIndex + 1] :
            cellIndex !== null ? column.cells[cellIndex + 1] :
                module.sections[sectionIndex + 1];

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
      } else if (cellIndex > 0) {
        const prevRow = rowIndex !== null ? cell.cellsRows[rowIndex - 1] :
            cellIndex !== null ? column.cells[cellIndex - 1] :
                module.sections[sectionIndex - 1];
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
      } else {
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
  if (newValue < minCurrent)
    newValue = minCurrent;

  const newAdjacentSize = total - newValue;

  if (newAdjacentSize < minAdjacent)
    newValue = total - minAdjacent;

  /*if (dimension === "width") {
    current.forEach((cell) => (cell.width = newValue));
    adjacent.forEach((cell) => (cell.width = total - newValue));
  } else {
    current[dimension] = newValue;
    adjacent[dimension] = total - newValue;
  }*/

  return newValue;
};

const adjustSizeFromExternal = ({
                                  dimension,
                                  value,
                                  sec = null,
                                  cell = null,
                                  row = null
                                }: {
  dimension: string;
  value: number;
  sec?: number;
  cell?: number;
  row?: number;
}) => {
  if (sec === null) {
    console.warn("Не выбрана ячейка для изменения размера");
    return;
  }

  return adjustSectionSize(sec, cell, row, value, dimension);
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
  fillings.length = 0;

  sectionsContainer.removeChildren();
  lablesContainer.removeChildren();
  fillingsContainer.removeChildren();
  dementionContainer.removeChildren();
};

const changeConstructorMode = (_mode) => {
  mode.value = _mode;
  renderGrid();
}

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
  TOTAL_WIDTH.value = props.maxAreaWidth;
  mode.value = props.mode;
  areaHeight.value = getMaxAreaHeight();
  areaWidth.value = getMaxAreaWidth();
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
  updateTotalSize,
  destroy,
  changeConstructorMode,
  createFilling,
  checkPositionFillingToCreate,
  getMmWidth,
  getMmHeight,
  getPixelHeight,
  getPixelWidth,
});

</script>

<template>
  <div class="visualization" :style="`height:${MAX_AREA_HEIGHT}px width:${MAX_AREA_WIDTH}px`">
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
  height: 500px;
  width: 1100px;
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
