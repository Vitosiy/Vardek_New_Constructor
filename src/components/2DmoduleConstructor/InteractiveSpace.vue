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
  toRef, toRefs,
} from "vue";
import {Application, Container, Graphics, Text} from "pixi.js";
import {Shape, ShapeAdjuster, Section} from "./utils/Methods";
import {UI_PARAMS} from "./utils/UMConstructorConst.ts";

const props = defineProps({
  module: {
    type: Object,
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

const emit = defineEmits([
    "cell-selected",
    "position-non",
    "calcDrawersFasades",
    "module-reset",
]);
const canvasContainer = ref();

const selectedCell = ref({sec: 0, cell: 0, row: null, extra: null});
const selectedFasade = ref({sec: 0, cell: 0, row: 0});
const selectedFilling = ref({sec: 0, cell: 0, row: null, extra: null, item: 0});
const {module} = toRefs(props)

let app: Application,
    sectionsContainer: Container,
    lablesContainer: Container,
    dementionContainer: Container,
    fillingsContainer: Container,
    fasadesContainer: Container,
    loopsContainer: Container,
    shapeAdjuster: ShapeAdjuster;

let cursorCheck = false;
let lastDragEvent = ref(null);

// Хранилища объектов
const sections: Container[] = [];
const sectionLables: (Graphics | Text)[] = [];
const deviders: Graphics[] = [];
const dementions: Graphics[] = [];
const fillings: Graphics[] = [];
const fasades: Graphics[] = [];
const loops: Container[] = [];

const {
  CONST_MAX_AREA_WIDTH,
  CONST_MAX_AREA_HEIGHT,
  BACKGROUND_COLOR,
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
  MIN_FASADE_HEIGHT,
  MIN_FASADE_WIDTH
} = UI_PARAMS;

const dragState = reactive({
  isDragging: false,
  type: null, // "vertical" или "horizontal"

  secIndex: null, // Для горизонтального перетаскивания
  cellIndex: null, // Для вертикального перетаскивания
  rowIndex: null, // Для горизонтального перетаскивания
  extraIndex: null, // Для вертикального перетаскивания

  startX: 0,
  startY: 0,

  startLeftWidth: 0,
  startRightWidth: 0,

  minXleft: MIN_SECTION_WIDTH,
  minXRight: MIN_SECTION_WIDTH,

  startTopHeight: 0,
  startBottomHeight: 0,

  minTop: MIN_SECTION_HEIGHT,
  minBottom: MIN_SECTION_HEIGHT,

  element: null,
});


const MAX_AREA_WIDTH = computed(() => {
  let midArea = document.getElementById("midAreaUM2Dconstructor")
  return midArea?.clientWidth * 0.7 || CONST_MAX_AREA_WIDTH;
});

const MAX_AREA_HEIGHT = computed(() => {
  let midArea = document.getElementById("midAreaUM2Dconstructor")
  return midArea?.clientHeight * 0.75 || CONST_MAX_AREA_HEIGHT;
});

const TOTAL_HEIGHT = ref(0);
const TOTAL_WIDTH = ref(0);
const areaHeight = ref(0);
const areaWidth = ref(0);
const mode = ref('module');

const calcDrawersFasades = (secIndex, fillingData = false) => {
  emit("calcDrawersFasades", secIndex, fillingData);
}

const resetModule = () => {
  emit("module-reset");
}

const pixelRatioWidth = computed(() => TOTAL_WIDTH.value / areaWidth.value);
const pixelRatioHeight = computed(() => TOTAL_HEIGHT.value / areaHeight.value);

const calcMaxAreaSize = () => {
  let scale = Math.min(MAX_AREA_WIDTH.value / TOTAL_WIDTH.value, MAX_AREA_HEIGHT.value / TOTAL_HEIGHT.value)

  areaWidth.value = TOTAL_WIDTH.value * scale;
  areaHeight.value = TOTAL_HEIGHT.value * scale;
}

const updateTotalSize = (value, dimension) => {

  switch (dimension) {
    case "width":
      TOTAL_WIDTH.value = parseInt(value);
      break;
    case "height":
      TOTAL_HEIGHT.value = parseInt(value);
      break;
    default:
      break;
  }

  calcMaxAreaSize();

  app.canvas.style.width = `${areaWidth.value}px`;
  app.canvas.style.height = `${areaHeight.value}px`;
  app.renderer.resize(areaWidth.value, areaHeight.value);
};

const getPixelWidth = (mmWidth) => {
  return (mmWidth / TOTAL_WIDTH.value) * areaWidth.value;
};

const getPixelHeight = (mmHeight) => {
  return (mmHeight / TOTAL_HEIGHT.value) * areaHeight.value;
};

const getMmWidth = (pxWidth) => {
  return (pxWidth / areaWidth.value) * TOTAL_WIDTH.value;
};

const getMmHeight = (pxHeight) => {
  return (pxHeight / areaHeight.value) * TOTAL_HEIGHT.value;
};

const init = async () => {
  app = new Application();
  await app.init({
    canvas: canvasContainer.value,
    width: areaWidth.value,
    height: areaHeight.value,
    backgroundColor: BACKGROUND_COLOR,
    resolution: window.devicePixelRatio || 1,
    // autoDensity: true,
    antialias: true,
    premultipliedAlpha: false,
  });
  updateTotalSize();
  loopsContainer = new Container();
  sectionsContainer = new Container();
  lablesContainer = new Container();
  dementionContainer = new Container();
  fillingsContainer = new Container();
  fasadesContainer = new Container();

  // sectionsContainer.interactive = true;
  fillingsContainer.interactive = true;
  //loopsContainer.interactiveChildren = true;
  fasadesContainer.interactive = true;
  lablesContainer.interactiveChildren = false;
  dementionContainer.interactiveChildren = false;

  app.stage.addChild(dementionContainer);
  app.stage.addChild(fillingsContainer);
  app.stage.addChild(sectionsContainer);
  app.stage.addChild(loopsContainer);
  app.stage.addChild(fasadesContainer);
  app.stage.addChild(lablesContainer);

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

const renderGrid = (_moduleGrid) => {
  clearRender();
  let xOffset = 0;
  let yOffset = 0;
  const moduleGrid = _moduleGrid || props.module

  let ModulepxWidth = getPixelWidth(moduleGrid.width);
  let ModulepxHeight = getPixelHeight(moduleGrid.height);
  moduleGrid.xOffset = xOffset;
  moduleGrid.yOffset = yOffset;

  let moduleSector = createModule({
    x: xOffset,
    y: yOffset,
    width: ModulepxWidth,
    height: ModulepxHeight,
    moduleData: moduleGrid,
  });

  xOffset = getPixelWidth(moduleGrid.leftWallThickness)

  moduleGrid?.sections.forEach((section, sectionIndex, _sections) => {
    const pxWidth = getPixelWidth(section.width);

    yOffset = getPixelHeight(moduleGrid.moduleThickness);
    if(sectionIndex > 0)
      xOffset += getPixelWidth(moduleGrid.moduleThickness)

    let tmp_array_sectors = []

    if (section.cells.length > 0) {
      section.cells.slice().sort((a, b) => b.position.y - a.position.y).forEach((cell, cellIndex, section) => {
        const pxHeight = getPixelHeight(cell.height);
        cell.xOffset = xOffset;
        cell.yOffset = yOffset;

        if (cell.cellsRows?.length > 0) {
          let rowxOffset = xOffset;
          cell.cellsRows.forEach((cellRow, cellRowIndex, _cell) => {
            const RowpxWidth = getPixelWidth(cellRow.width);

            if (cellRow.extras?.length > 0) {
              let rowyOffset = yOffset;
              cellRow.extras.slice().sort((a, b) => b.position.y - a.position.y).forEach((extra, extraIndex, _extras) => {
                const RowpxHeight = getPixelWidth(extra.height);

                extra.xOffset = rowxOffset;
                extra.yOffset = rowyOffset;

                let sector = createSector({
                  x: rowxOffset,
                  y: rowyOffset,
                  width: RowpxWidth,
                  height: RowpxHeight,
                  sectionIndex,
                  cellIndex,
                  cellData: extra,
                  section: _extras,
                  rowIndex: cellRowIndex,
                  row: cellRow,
                  extraIndex,
                  _sector: moduleSector,
                  gridType: "module",
                });

                if(cellRowIndex === 0)
                  tmp_array_sectors.push(sector)

                //Добавляем отступ по вертикали
                rowyOffset += RowpxHeight + getPixelHeight(moduleGrid.moduleThickness);
                const colBond = shapeAdjuster.createColumnBounds(sections, sectionIndex);

                // Создаём ограничения для секторов по ширине
                extra.shapesBond = colBond;
                extra.maxX = shapeAdjuster.convertToTen(getMmWidth(colBond.maxX));
                extra.minX = shapeAdjuster.convertToTen(getMmWidth(colBond.minX));
              });
            }
            else {
              cellRow.xOffset = rowxOffset;
              cellRow.yOffset = yOffset;

              let sector = createSector({
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

              if(cellRowIndex === 0)
                tmp_array_sectors.push(sector)

              //Добавляем отступ по вертикали
              const colBond = shapeAdjuster.createColumnBounds(sections, sectionIndex);

              // Создаём ограничения для секторов по ширине
              cellRow.shapesBond = colBond;
              cellRow.maxX = shapeAdjuster.convertToTen(getMmWidth(colBond.maxX));
              cellRow.minX = shapeAdjuster.convertToTen(getMmWidth(colBond.minX));
            }

            rowxOffset += RowpxWidth + getPixelWidth(moduleGrid.moduleThickness);
          });
        }
        else {
          let sector = createSector({
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

          tmp_array_sectors.push(sector)
        }

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

      let sector = createSector({
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
      tmp_array_sectors.push(sector)

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

    if (section.loops?.length) {

      section.loops.forEach((door, doorIndex, ) => {
        door.forEach((loop, loopIndex) => {
          let tmpLoopData = Object.assign({}, loop)
          delete tmpLoopData.coords;
          delete tmpLoopData.errors;

          let loopXOffset = getPixelWidth(tmpLoopData.positionX);
          let loopYOffset = getPixelHeight(module.value.height);
          const pxWidth = getPixelWidth(tmpLoopData.width);
          const pxHeight = getPixelHeight(tmpLoopData.height);

          tmpLoopData.xOffset = loopXOffset;

          loop.coords.forEach((pos, posIndex, ) => {
            tmpLoopData.yOffset = loopYOffset - getPixelHeight(pos + tmpLoopData.height);
            // Отрисовываем секцию

            let loopSector = createLoop({
              x: tmpLoopData.xOffset,
              y: tmpLoopData.yOffset,
              width: pxWidth,
              height: pxHeight,
              loopData: {
                ...tmpLoopData,
                error: loop.errors?.includes(posIndex),
                position: {x: tmpLoopData.xOffset, y: tmpLoopData.yOffset}
              },
            });

            for(let i = 0; i < tmp_array_sectors.length; i++) {
              let sector = tmp_array_sectors[i];

              if(checkSectorsCollision(loopSector.sectorData, sector)) {
                let tempShape = new Shape({
                  type: "loop",
                  sector,
                  data: tmpLoopData,
                  position: {x: getMmHeight(loopSector.sectorData.position.x), y: getMmHeight(loopSector.sectorData.position.y)},
                  getMmWidth,
                  getMmHeight,
                  getPixelHeight,
                  getPixelWidth,
                  calcDrawersFasades,
                });

                sector.shapes.push(tempShape);
                break;
              }

            }
          })
        })
      })
    }

    if (mode.value === "fasades" && !module.value?.isSlidingDoors) {
      section.fasades.forEach((column, colIndex) => {

        if(!column.length)
          return;

        const pxWidth = getPixelWidth(column[0].width);
        let fasadeXOffset = getPixelWidth(column[0].position.x);

        column.forEach((row, rowIndex, col) => {
          let fasadeYOffset = getPixelHeight(module.value.height - row.position.y - row.height);

          const pxHeight = getPixelHeight(row.height);
          row.xOffset = fasadeXOffset;
          row.yOffset = fasadeYOffset;

          // Отрисовываем секцию

          createSector({
            x: fasadeXOffset,
            y: fasadeYOffset,
            width: pxWidth,
            height: pxHeight,
            sectionIndex,
            cellIndex: colIndex,
            rowIndex: row.id - 1,
            cellData: row,
            section: col,
            _sector: moduleSector,
            gridType: 'fasades',
          });
        });
        //Добавляем отступ по горизонтали
        fasadeXOffset += pxWidth + getPixelWidth(4);
      });

      let fasadeXOffset = getPixelWidth(section.fasadesDrawers?.[0]?.position.x);
      section.fasadesDrawers?.forEach((row, rowIndex, col) => {
        const pxWidth = getPixelWidth(row.width);
        let fasadeYOffset = getPixelHeight(module.value.height - row.position.y - row.height);

        const pxHeight = getPixelHeight(row.height);
        row.xOffset = fasadeXOffset;
        row.yOffset = fasadeYOffset;

        // Отрисовываем секцию

        createSector({
          x: fasadeXOffset,
          y: fasadeYOffset,
          width: pxWidth,
          height: pxHeight,
          sectionIndex,
          cellIndex: 0,
          rowIndex: row.id - 1,
          cellData: row,
          section: col,
          _sector: moduleSector,
          gridType: 'fasades',
        });
      });
    }
  })

  if (mode.value === "fasades" && module.value?.isSlidingDoors) {
    module.value?.fasades?.forEach((column, colIndex) => {
      const pxWidth = getPixelWidth(column[0].width);
      let fasadeXOffset = getPixelWidth(column[0].position.x);

      column.forEach((row, rowIndex, col) => {
        let fasadeYOffset = getPixelHeight(module.value.height - row.position.y - row.height);

        const pxHeight = getPixelHeight(row.height);
        row.xOffset = fasadeXOffset;
        row.yOffset = fasadeYOffset;

        // Отрисовываем секцию

        createSector({
          x: fasadeXOffset,
          y: fasadeYOffset,
          width: pxWidth,
          height: pxHeight,
          sectionIndex: null,
          cellIndex: colIndex,
          rowIndex: column.length > 1 ? row.id - 1 : null,
          cellData: row,
          section: col,
          _sector: moduleSector,
          gridType: 'fasades',
        });
      });
      //Добавляем отступ по горизонтали
      fasadeXOffset += pxWidth + getPixelWidth(4);
    });
  }

  sections.forEach((elem) => {
    app.stage.addChildAt(elem, 0);
  });

  deviders.forEach((elem) => {
    sectionsContainer.addChild(elem);
  });

  loops.forEach((elem) => {
    loopsContainer.addChild(elem);
  });

  fillings.forEach((elem) => {
    fillingsContainer.addChild(elem);
  });

  fasades.forEach((elem) => {
    fasadesContainer.addChild(elem);
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

  sections.push(sector);

  // Создаём ограничения для секторов по высоте
  const sectorBounds = shapeAdjuster.getTotalBounds(sector, moduleData);
  sector.bound = sectorBounds;

  moduleData.maxY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.maxY));
  moduleData.minY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.minY));
  moduleData.maxX = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.maxX));
  moduleData.minX = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.minX));

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
                        extraIndex = null,
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
  sector.extraIndex = extraIndex;

  const cell = new Section(cellData, width, height, sector, gridType === mode.value);
  const seleted = gridType === "fasades" ? selectedFasade : gridType === "filling" ? selectedFilling : selectedCell;

  if (
      seleted.value.sec === sectionIndex &&
      seleted.value.cell === cellIndex &&
      seleted.value.row === rowIndex &&
      seleted.value.extra === extraIndex &&
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

  if (gridType === "fasades") {
    fasades.push(sector);
  } else if (!_sector)
    sections.push(sector);
  else
    _sector.addChild(sector);

  cellData.fillings?.forEach((data) => {
    createFilling(data, sector);
  });

  cell.cellGraphics.on("pointerdown", () => {
    selectCell(gridType, sectionIndex, cellIndex, false, rowIndex, null, extraIndex);
  });

  // Создаём ограничения для секторов по высоте
  if (gridType !== "fasades") {
    const sectorBounds = shapeAdjuster.getTotalBounds(sector, cellData);
    sector.bound = sectorBounds;

    cellData.maxY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.maxY));
    cellData.minY = shapeAdjuster.convertToTen(getMmWidth(sectorBounds.minY));
  }

  cellData.sector = sector;

  // Рендер линейки расстояний до границ сектора
  sector.shapes.forEach((el) => {
    el.drawBoundaryDistances();
  });

  if (gridType === mode.value) {
    // /** Создаём нумерацию сектора */
    createSectioNum({x, y, width, height, cell: cellData, sectionIndex, cellIndex, rowIndex, extraIndex});

    if(gridType === "module") {
      // /**Создание вертикального драга */
      createVerticalCut({width, height, cell: cellData, section, sectionIndex, sector, cellIndex, rowIndex, extraIndex});
      // /**Создание горизонтального драга */
      createHorozontalCut({width, height, cell: cellData, section, sectionIndex, sector, cellIndex, rowIndex, extraIndex});
    }

  }

  return sector;
};

const createLoop = ({
                        x,
                        y,
                        width,
                        height,
                        loopData,
                      }) => {
  const sector = new Container();

  sector.position.set(x, y);

  sector.shapes = [];
  sector.sectorData = loopData;
  sector.sections = sections;

  const cell = new Section(loopData, width, height, sector, false);
  cell.highlightGraphics.visible = false;
  cell.cellGraphics.eventMode = "static";

  sector.addChild(cell.cellGraphics);

  loops.push(sector);

  // Создаём ограничения для секторов по высоте
  const sectorBounds = shapeAdjuster.getSectorBounds(sector);
  sector.bound = sectorBounds;

  loopData.sector = sector;

  return sector;
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
    calcDrawersFasades,
    dementions,
    dementionContainer,
    dragActive: mode.value === "fillings",
  });

  data.sector = filling.sector;

  if (mode.value === "fillings") {
    createSectioNum({
      x: getPixelWidth(filling.data.position.x),
      y: getPixelHeight(filling.data.position.y),
      width: filling.data.width,
      height: filling.data.height,
      cell: filling.data,
      sectionIndex: filling.data.sec,
      cellIndex: filling.data.cell,
      rowIndex: filling.data.row,
      extraIndex: filling.data.extra,
      itemIndex: filling.data.id,
    });

    filling.graphic.on("pointerdown", () => {
      selectCell("fillings", filling.data.sec, filling.data.cell, false, filling.data.row, filling.data.id, filling.data.extra);
    });
  }

  if (
      selectedFilling.value.sec === filling.data.sec &&
      selectedFilling.value.cell === filling.data.cell &&
      selectedFilling.value.row === filling.data.row &&
      selectedFilling.value.extra === filling.data.extra &&
      selectedFilling.value.item === filling.data.id
  ) {
    filling.highlightGraphics.visible = true;
  } else {
    filling.highlightGraphics.visible = false;
  }

  fillings.push(filling.graphic);
  fillings.push(filling.highlightGraphics);
  sector.shapes.push(filling);
};

// Отрисовываем номер ячейки
const createSectioNum = ({x, y, width, height, cell, sectionIndex, cellIndex, rowIndex = null, itemIndex = null, extraIndex = null}) => {
  const pxWidth = getPixelWidth(cell.width);
  const pxHeight = getPixelHeight(cell.height);

  const xOffset = cell.xOffset || x;
  const yOffset = cell.yOffset || y;


  let text

  if(sectionIndex === null) {
    text = rowIndex !== null ? `${cellIndex + 1}.${rowIndex + 1}` : `${cellIndex + 1}`;
  }
  else {
    text = rowIndex !== null ? `${sectionIndex + 1}.${cellIndex + 1}.${rowIndex + 1}` : `${sectionIndex + 1}.${cellIndex + 1}`;
  }

  if (extraIndex !== null)
    text += `.${extraIndex + 1}`

  if (itemIndex !== null)
    text += ` ${itemIndex}`

  const cellNumber = new Text({
    text: text,
    style: {fontSize: 14, fill: "#131313", align: "center"},
  })

  cellNumber.anchor.set(0.5);
  cellNumber.x = xOffset + pxWidth / 2;
  cellNumber.y = yOffset + pxHeight / 2;

  const labelWidth = cellNumber.width + 4

  const cellNumberBackground = new Graphics();
  cellNumberBackground.roundRect(
      xOffset + pxWidth / 2 - labelWidth / 2,
      yOffset + pxHeight / 2 - 13,
      labelWidth,
      26,
      5
  );
  cellNumberBackground.fill("#ffffff");
  cellNumberBackground.stroke({width: 1, color: "#A3A9B5"});

  cellNumber.interactive = false;
  cellNumberBackground.interactive = false;

  sectionLables.push(cellNumberBackground);
  sectionLables.push(cellNumber);
};

// Отрисовываем вертикальный драг
const createVerticalCut = ({width, height, cell, section, sectionIndex, sector, cellIndex = null, rowIndex = null, extraIndex = null}) => {

  let _cellIndex = cellIndex
  let _rowIndex = rowIndex
  let _extraIndex = extraIndex
  let _cell = cell

  const curSec = module.value.sections[sectionIndex]
  const curCell = curSec?.cells?.[_cellIndex]
  const curRow = curCell?.cellsRows?.[_rowIndex]
  const curExtra = curRow?.extras?.[_extraIndex]

  switch (_cell.type) {
    case "rowCell":
      if (!(_rowIndex < curCell.cellsRows?.length - 1))
        return;
      break
    case "section":
      if (!(sectionIndex < module.value.sections.length - 1))
        return;
      break;
    case "rowExtra":
      if(_rowIndex < curCell.cellsRows?.length - 1) {
        _extraIndex = null
      }
      else
        return;
      break
    case "cell":
      if((_cellIndex === curSec.cells?.length - 1) && (sectionIndex < module.value.sections.length - 1)) {
        _cellIndex = null
        _rowIndex =null
        _extraIndex = null

        _cell = curSec
      }
      else
        return;

      break;
    default:
      return;
  }

  const pxWidth = getPixelWidth(_cell.width);
  const convertTotalHeight = _rowIndex !== null ? getPixelHeight(_cell.height) : getPixelHeight(curSec.height);

  const divider = new Graphics();
  const dashVert = new Graphics();

  divider.rect(0, 0, getPixelWidth(module.value.moduleThickness + 4), convertTotalHeight);

  divider.fill("#4bef61");
  divider.alpha = 0;

  divider.eventMode = "static";
  divider.cursor = "section-resize";
  divider.section = sectionIndex;
  divider.cell = _cellIndex;
  divider.row = _rowIndex;

  dashVert.rect(0, 0, 0, convertTotalHeight);
  dashVert.stroke({width: 1, color: "#5D6069"});
  divider.dev_name = `dev${divider.uid}`;

  divider.position.set(_cell.xOffset + pxWidth - getPixelWidth(2), _cell.yOffset);
  dashVert.position.set(_cell.xOffset + pxWidth - getPixelWidth(2), _cell.yOffset);
  divider.toColideCheck = dashVert;

  divider.on("pointerdown", onVerticalDragStart, divider);
  divider.on("pointerup", () => {
    resetModule()
    setTimeout(()=>{renderGrid()}, 10)
  }, divider);

  deviders.push(dashVert, divider);
};

// Отрисовываем горизонтальный драг
const createHorozontalCut = ({
                               width,
                               height,
                               cell,
                               section,
                               sectionIndex,
                               sector,
                               cellIndex = null,
                               rowIndex = null,
                               extraIndex = null
                             }) => {

  let _cellIndex = cellIndex
  let _rowIndex = rowIndex
  let _extraIndex = extraIndex
  let _cell = cell

  const curSec = module.value.sections[sectionIndex]
  const curCell = curSec?.cells?.[_cellIndex]
  const curRow = curCell?.cellsRows?.[_rowIndex]
  const curExtra = curRow?.extras?.[_extraIndex]

  switch (_cell.type) {
    case "rowExtra":
      if(!curExtra) {
        return;
      }
      if (_extraIndex !== null && !(_extraIndex < curRow.extras?.length - 1)) {
        _extraIndex = null
        _rowIndex = null

        _cell = curSec.cells[_cellIndex]
      }
      break;
    case "cell":
      if (_cellIndex === null || !(_cellIndex < curSec.cells.length - 1))
        return;
      break;
    default:
      if(_rowIndex !== null && !(_rowIndex <  curCell.cellsRows?.length - 1)) {
        _rowIndex = null
        _extraIndex = null

        _cell = curSec.cells[_cellIndex]
      }
      else
        return;
      break;
  }

  const pxWidth = getPixelWidth(_cell.width);
  const pxHeight = getPixelHeight(_cell.height);

  const divider = new Graphics();
  const dashHor = new Graphics();

  divider.rect(_cell.xOffset, _cell.yOffset + pxHeight - getPixelHeight(2), pxWidth, getPixelHeight(module.value.moduleThickness + 4));
  divider.fill("#c53545");
  divider.alpha = 0;
  divider.eventMode = "static";
  divider.cursor = "cell-resize";
  divider.section = sectionIndex;
  divider.cell = _cellIndex;
  divider.row = _rowIndex;
  divider.extra = _extraIndex;

  dashHor.rect(_cell.xOffset, _cell.yOffset + pxHeight - getPixelHeight(2), pxWidth, 0);
  dashHor.stroke({width: 1, color: "#5D6069"});

  divider.on("pointerdown", onHorizontalDragStart, divider);
  divider.on("pointerup", () => {
    resetModule()
    setTimeout(()=>{renderGrid()}, 10)
  }, divider);

  deviders.push(dashHor, divider);
};

const checkPositionFillingToCreate = (data) => {
  const sec = selectedCell.value.sec;
  const cell = selectedCell.value.cell;
  const row = selectedCell.value.row;
  const extra = selectedCell.value.extra;

  let position, tempShape;

  const sector = sections[0].children.find(
      (elem) => elem.secIndex === sec && elem.cellIndex === cell && elem.rowIndex === row && elem.extraIndex === extra
  );

  if (!sector) {
    return false;
  }

  tempShape = new Shape({
    type: data.type,
    sector,
    position: {x: 0, y: 0},
    data,
    getMmWidth,
    getMmHeight,
    getPixelHeight,
    getPixelWidth,
    calcDrawersFasades,
  });

  /** Проверяем на возможность размещения отверстия */

  position = shapeAdjuster.getRandomPosition(sector, tempShape);

  if (!position) {
    return false;
  }

  return {
    x: Math.round(getMmWidth(position.x)),
    y: Math.round(getMmHeight(position.y)),
    width: data.width,
    height: data.height,
    type: data.type,
    PROPS: data
  };
};

// Выбор сектора, передача в родительский компонент
const selectCell = (type, sectionIndex, cellIndex, parent = false, rowIndex = null, item = null, extraIndex = null) => {

  switch (type) {
    case "fillings":
      selectedFilling.value = {sec: sectionIndex, cell: cellIndex, row: rowIndex, extra: extraIndex ,item: item};
      selectedCell.value = {sec: sectionIndex, cell: cellIndex, row: rowIndex, extra: extraIndex};
      toggleFillingColor(sectionIndex, cellIndex, rowIndex, item, extraIndex);
      break;
    case "fasades":
      selectedFasade.value = {sec: sectionIndex, cell: cellIndex, row: rowIndex};
      toggleFasadeColor(sectionIndex, cellIndex, rowIndex);
      break;
    default:
      selectedCell.value = {sec: sectionIndex, cell: cellIndex, row: rowIndex, extra: extraIndex};
      selectedFilling.value = {sec: sectionIndex, cell: cellIndex, row: rowIndex, extra: extraIndex, item: item};
      toggleSectionColor(sectionIndex, cellIndex, rowIndex, extraIndex);
      break;
  }
  if (!parent)
    emit("cell-selected", sectionIndex, cellIndex, type, rowIndex, item, extraIndex);
};

const toggleSectionColor = (sectionIndex, cellIndex, rowIndex = null, extraIndex = null) => {
  const section = props.module.sections[sectionIndex]
  const cell = section?.cells[cellIndex];
  const row = cell?.cellsRows?.[rowIndex];
  const extra = row?.extras?.[extraIndex];

  const sector = extra?.sector || row?.sector || cell?.sector || section?.sector || props.module.sector

  sections[0].children.forEach((elem) => {
    if (elem.children[1])
      elem.children[1].visible = false;
    // elem.children[0].alpha = 1;
  });
  if (sector?.children[1])
    sector.children[1].visible = true;
  // sector.children[0].alpha = 0.5;
};

const checkSectorsCollision = (currShape, targetSector) => {
  return shapeAdjuster.checkToCollision(targetSector, false, currShape);
}

const toggleFasadeColor = (sectionIndex, doorIndex, segmentIndex = 0) => {
  const _fasades = sectionIndex === null ? module?.value?.fasades : props.module.sections[sectionIndex].fasades
  const door = _fasades[doorIndex]
  const segment = door?.[segmentIndex]

  const sector = segment?.sector || door?.sector;

  fasades.forEach((elem) => {
    if (elem.children[1])
      elem.children[1].visible = false;
    // elem.children[0].alpha = 1;
  });
  if (sector?.children[1])
    sector.children[1].visible = true;
  // sector.children[0].alpha = 0.5;
};

const toggleFillingColor = (sectionIndex, cellIndex, rowIndex = null, itemIndex = null, extraIndex = null) => {
  const section = props.module.sections[sectionIndex]
  const cell = section?.cells[cellIndex];
  const row = cell?.cellsRows?.[rowIndex];
  const extra = row?.extras?.[extraIndex];

  const curSegment = extra || row || cell || section || props.module;
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
  const extraIndex = this.extra;

  const column = module.sections[sectionIndex];
  const cell = column.cells?.[cellIndex];
  const row = cell?.cellsRows?.[rowIndex];
  const extra = row?.extras?.[extraIndex];

  const cur = row || cell || column
  const next = row ? cell.cellsRows[rowIndex + 1] || module.sections[sectionIndex + 1] :
      module.sections[sectionIndex + 1];

  dragState.isDragging = true;
  dragState.type = "vertical";

  dragState.secIndex = sectionIndex;
  dragState.cellIndex = cellIndex;
  dragState.rowIndex = rowIndex !== null && cell.cellsRows[rowIndex + 1] ? rowIndex : null;
  dragState.extraIndex = null;
  dragState.startX = event.data.global.x;

  dragState.startLeftWidth = cur.width;
  dragState.startRightWidth = next.width;

  dragState.minXleft = shapeAdjuster.getLeftSectionWidth(
      cur.sector,
      cur.maxX
  );

  dragState.minXRight = shapeAdjuster.getRightSectionWidth(
      next.sector || cell?.sector || row?.sector || extra?.sector,
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
  const extraIndex = this.extra;

  const column = module.sections[sectionIndex];
  const cell = column.cells?.[cellIndex];
  const row = cell?.cellsRows?.[rowIndex];
  const extra = row?.extras?.[extraIndex];

  const cur = extra || row || cell
  const next = extra ? row.extras[extraIndex + 1] : row ? cell.cellsRows[rowIndex + 1] :
      column.cells[cellIndex + 1]

  // event.currentTarget.alpha = 0.5;
  dragState.element = this;
  dragState.isDragging = true;
  dragState.type = "horizontal";

  dragState.secIndex = sectionIndex;
  dragState.cellIndex = cellIndex;
  dragState.rowIndex = rowIndex;
  dragState.extraIndex = extraIndex;

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

  const {
    type,
    secIndex,
    cellIndex,
    rowIndex,
    extraIndex,
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
    let curMin = minXleft < MIN_SECTION_WIDTH ? MIN_SECTION_WIDTH : minXleft || MIN_SECTION_WIDTH;
    let nextMin = minXRight < MIN_SECTION_WIDTH ? MIN_SECTION_WIDTH : minXRight || MIN_SECTION_WIDTH;

    const deltaPixels = event.data.global.x - startX;

    element.position.x =
        Math.floor(event.data.global.x / props.step) * props.step;
    let deltaMm =
        Math.floor((deltaPixels * pixelRatioWidth.value) / props.step) * props.step;

    if(deltaMm === 0)
      return;

    let section = props.module.sections[secIndex]
    let cell = section.cells[cellIndex];
    let row = cell?.cellsRows?.[rowIndex];
    let extra = row?.extras?.[extraIndex];

    // Calculate new dimensions
    let newLeftWidth = startLeftWidth + deltaMm;
    let newRightWidth = startRightWidth - deltaMm;

    // Enforce minimum dimensions
    if (newLeftWidth < curMin) {
      deltaMm += curMin - newLeftWidth
      newLeftWidth = curMin;
      newRightWidth = startRightWidth - deltaMm;
    } else if (newRightWidth < nextMin) {
      deltaMm -= nextMin - newRightWidth
      newRightWidth = nextMin;
      newLeftWidth = startLeftWidth + deltaMm;
    }

    if (row) {
      row.width = newLeftWidth;

      row.extras?.forEach(item => {
        item.width = row.width

        if(item.fillings?.length) {
          item.fillings.forEach((filling) => {
            filling.width = item.width;
            filling.size.x = filling.width;
          })
        }
      })

      let nextRow = cell.cellsRows[rowIndex + 1]
      let delta2 = nextRow.width - newRightWidth
      nextRow.position.x += delta2 / 2;
      nextRow.width = newRightWidth;

      nextRow.extras?.forEach(item => {
        item.width = nextRow.width
        item.position.x = nextRow.position.x

        if(item.fillings?.length) {
          item.fillings.forEach((filling) => {
            filling.width = item.width;
            filling.size.x = filling.width;
          })
        }
      })

      if(row.fillings?.length) {
        row.fillings.forEach((filling) => {
          filling.width = row.width;
          filling.size.x = filling.width;
        })
      }

      if(nextRow.fillings?.length) {
        nextRow.fillings.forEach((filling) => {
          filling.width = nextRow.width;
          filling.size.x = filling.width;
          filling.position.x += delta2 / 2;
        })
      }

    }
    else {
      let delta1 = section.width - newLeftWidth

      section.cells.forEach((cell) => {
        cell.width = newLeftWidth;

        if (cell.cellsRows?.length) {
          let divideDelta = Math.floor(-delta1 / cell.cellsRows.length)
          let extraSize = (cell.cellsRows.length - 1) * module.value.moduleThickness
          cell.cellsRows.forEach(item => {
            if(item.width + divideDelta >= curMin) {
              item.width += divideDelta

              item.extras?.forEach(extra => {
                extra.width = item.width

                if(extra.fillings?.length) {
                  extra.fillings.forEach((filling) => {
                    filling.width = extra.width;
                    filling.size.x = extra.width;

                  })
                }
              })

              if(item.fillings?.length) {
                item.fillings.forEach((filling) => {
                  filling.width = item.width;
                  filling.size.x = filling.width;

                })
              }
            }

            extraSize += item.width

          } )

          cell.cellsRows[cell.cellsRows.length - 1].width += (newLeftWidth - extraSize)
          cell.cellsRows[cell.cellsRows.length - 1].extras?.forEach(extra => {
            extra.width = cell.cellsRows[cell.cellsRows.length - 1].width
            extra.position.x = cell.cellsRows[cell.cellsRows.length - 1].position.x
          })
        }

        if(cell.fillings?.length) {
          cell.fillings.forEach((filling) => {
            filling.width = cell.width;
            filling.size.x = filling.width;
          })
        }
      })
      section.width = newLeftWidth;

      if(section.fillings?.length) {
        section.fillings.forEach((filling) => {
          filling.width = section.width;
          filling.size.x = filling.width;

        })
      }

      let nextSection = props.module.sections[secIndex + 1]
      let delta2 = nextSection.width - newRightWidth

      nextSection.width = newRightWidth;
      nextSection.position.x += delta2;

      nextSection.cells.forEach((cell) => {
        cell.width = nextSection.width;
        cell.position.x = nextSection.position.x;

        if (cell.cellsRows?.length) {
          let divideDelta = Math.floor(-delta2 / cell.cellsRows.length)
          let extraSize = (cell.cellsRows.length - 1) * module.value.moduleThickness

          cell.cellsRows.forEach(item => {
            if(item.width + divideDelta >= nextMin) {
              item.width += divideDelta

              item.extras?.forEach(extra => {
                extra.width = item.width
                extra.position.x = item.position.x

                if(extra.fillings?.length) {
                  extra.fillings.forEach((filling) => {
                    filling.width = extra.width;
                    filling.size.x = extra.width;
                    filling.position.x += divideDelta;
                  })
                }

              })

              if(item.fillings?.length) {
                item.fillings.forEach((filling) => {
                  filling.width = item.width;
                  filling.size.x = filling.width;
                  filling.position.x += divideDelta;
                })
              }
            }

            extraSize += item.width

          })

          cell.cellsRows[0].width += (newRightWidth - extraSize)
          cell.cellsRows[0].extras?.forEach(extra => {
            extra.width = cell.cellsRows[0].width
            extra.position.x = cell.cellsRows[0].position.x
          })
        }

        if(cell.fillings?.length) {
          cell.fillings.forEach((filling) => {
            filling.width = cell.width;
            filling.size.x = filling.width;
            filling.position.x += delta2;
          })
        }
      })


      if(nextSection.fillings?.length) {
        nextSection.fillings.forEach((filling) => {
          filling.width = nextSection.width;
          filling.size.x = filling.width;
          filling.position.x += delta2;
        })
      }
    }

  }
  else if (type === "horizontal") {
    let curMin = minTop < MIN_SECTION_HEIGHT ? MIN_SECTION_HEIGHT : minTop || MIN_SECTION_HEIGHT;
    let nextMin = minBottom < MIN_SECTION_HEIGHT ? MIN_SECTION_HEIGHT : minBottom || MIN_SECTION_HEIGHT;

    const deltaPixels = event.data.global.y - startY;

    element.position.y =
        Math.floor(event.data.global.y / props.step) * props.step;
    const deltaMm =
        Math.floor((deltaPixels * pixelRatioHeight.value) / props.step) * props.step;

    if(deltaMm === 0)
      return;

    let section = props.module.sections[secIndex]
    let cell = section.cells[cellIndex];
    let row = cell?.cellsRows?.[rowIndex];
    let extra = row?.extras?.[extraIndex];

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

    if(extra){
      let delta1 = newTopHeight - extra.height
      extra.height = newTopHeight;
      extra.position.y += -delta1;

      let nextExtra = row.extras[extraIndex + 1]
      nextExtra.height = newBottomHeight;
    }
    else {
      let delta1 = cell.height - newTopHeight

      if (cell.cellsRows?.length) {
        cell.cellsRows.forEach((row) => {
          row.height = newTopHeight;

          if (row.extras?.length) {
            let divideDelta = Math.floor(-delta1 / row.extras.length)
            let extraSize = (row.extras.length - 1) * module.value.moduleThickness

            row.extras.forEach(item => {
              if (item.height + divideDelta >= curMin) {
                item.height += divideDelta
              }

              extraSize += item.height
            })

            row.extras[row.extras.length - 1].height += (newTopHeight - extraSize)
          }
        })
      }

      cell.height = newTopHeight;

      let nextCell = props.module.sections[secIndex].cells[cellIndex + 1]
      let delta2 = nextCell.height - newBottomHeight

      if (nextCell.cellsRows) {
        nextCell.cellsRows.forEach((row) => {
          row.height = newBottomHeight;

          if (row.extras?.length) {
            let divideDelta = Math.floor(-delta2 / row.extras.length)
            let extraSize = (row.extras.length - 1) * module.value.moduleThickness

            row.extras.forEach(item => {
              if (item.height + divideDelta >= curMin) {
                item.height += divideDelta
                item.position.y += divideDelta;
              }

              extraSize += item.height
            })

            row.extras[row.extras.length - 1].height += (newBottomHeight - extraSize)
          }
        })
      }

      nextCell.height = newBottomHeight;
    }

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

        const minCurrent = MIN_SECTION_WIDTH /*Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getLeftSectionWidth(currentRow.sector, currentRow.maxX)
        );*/

        const minNext = MIN_SECTION_WIDTH /*Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getRightSectionWidth(nextRow.sector, nextRow.minX)
        );*/
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

        const minCurrent = MIN_SECTION_WIDTH/* Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getRightSectionWidth(column.sector, column.minX)
        );*/

        const minPrev = MIN_SECTION_WIDTH /*Math.max(
            MIN_SECTION_WIDTH,
            shapeAdjuster.getLeftSectionWidth(prevRow.sector, prevRow.maxX)
        );
*/
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
        if (row) {
          const nextRow = cell.cellsRows[rowIndex + 1] || cell.cellsRows[rowIndex - 1]
          const totalWidth = column.width + nextRow.width;

          const minCurrent = MIN_SECTION_WIDTH /*Math.max(
              MIN_SECTION_WIDTH,
              shapeAdjuster.getRightSectionWidth(column.sector, column.minX)
          );*/

          const minPrev = MIN_SECTION_WIDTH /*Math.max(
              MIN_SECTION_WIDTH,
              shapeAdjuster.getLeftSectionWidth(nextRow.sector, nextRow.maxX)
          );*/

          calcValue = updateSizes(
              newValue,
              dimension,
              column,
              nextRow,
              totalWidth,
              minCurrent,
              minPrev
          );
        } else {
          column.cells.forEach((cell) => (cell.width = newValue));
          column.width = newValue
        }
      }
    } else {
      const column = module.sections[sectionIndex];
      const cell = column.cells?.[cellIndex];
      const row = cell?.cellsRows?.[rowIndex];
      const currentRow = row || cell || column

      if (cellIndex < column.cells?.length - 1) {
        const nextRow = rowIndex !== null ? cell.cellsRows[rowIndex + 1] :
            cellIndex !== null ? column.cells[cellIndex + 1] :
                module.sections[sectionIndex + 1];

        const totalHeight = currentRow.height + nextRow.height;
        const minCurrent = MIN_SECTION_HEIGHT /*Math.max(
            MIN_SECTION_HEIGHT,
            shapeAdjuster.getSectionTop(currentRow.sector, currentRow.maxY)
        );*/
        const minNext = MIN_SECTION_HEIGHT /*Math.max(
            MIN_SECTION_HEIGHT,
            shapeAdjuster.getSectionBottom(nextRow.sector, nextRow.minY)
        );*/
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
        const minCurrent = MIN_SECTION_HEIGHT /*Math.max(
            MIN_SECTION_HEIGHT,
            shapeAdjuster.getSectionBottom(currentRow.sector, currentRow.minY)
        );*/
        const minPrev = MIN_SECTION_HEIGHT /*Math.max(
            MIN_SECTION_HEIGHT,
            shapeAdjuster.getSectionTop(prevRow.sector, prevRow.maxY)
        );*/
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

const adjustFasadeSize = (
    sectionIndex,
    doorIndex,
    segmentIndex,
    newValue,
    dimension = "height"
) => {
  const minValue =
      dimension === "width" ? MIN_SECTION_WIDTH : MIN_SECTION_HEIGHT;
  newValue = Math.max(Math.floor(newValue / props.step) * props.step, minValue);
  let calcValue;

  const module = props.module;

  if (dimension === "width") {
    const section = module.sections[sectionIndex];
    const door = section.fasades?.[doorIndex];
    const currentSegment = door?.[segmentIndex];

    if (sectionIndex < module.sections.length - 1) {
      const nextRow = door[segmentIndex + 1]

      const totalWidth = currentSegment.width + nextRow.width;

      const minCurrent = MIN_FASADE_WIDTH
      const maxCurrent = currentSegment.maxX

      /*Math.max(
          MIN_SECTION_WIDTH,
          shapeAdjuster.getLeftSectionWidth(currentRow.sector, currentRow.maxX)
      );*/

      const minNext = MIN_FASADE_WIDTH
      const maxNext = nextRow.maxX

      /*Math.max(
          MIN_SECTION_WIDTH,
          shapeAdjuster.getRightSectionWidth(nextRow.sector, nextRow.minX)
      );*/
      calcValue = updateSizesFasades(
          newValue,
          totalWidth,
          minCurrent,
          maxCurrent,
          minNext,
          maxNext
      );
    } else if (sectionIndex > 0) {
      const prevRow = door[segmentIndex - 1]

      const totalWidth = currentSegment.width + prevRow.width;

      const minCurrent = MIN_FASADE_WIDTH
      const maxCurrent = currentSegment.maxX
      /* Math.max(
          MIN_SECTION_WIDTH,
          shapeAdjuster.getRightSectionWidth(column.sector, column.minX)
      );*/

      const minPrev = MIN_FASADE_WIDTH
      const maxPrev = prevRow.maxX
      /*Math.max(
          MIN_SECTION_WIDTH,
          shapeAdjuster.getLeftSectionWidth(prevRow.sector, prevRow.maxX)
      );
*/
      calcValue = updateSizesFasades(
          newValue,
          totalWidth,
          minCurrent,
          maxCurrent,
          minPrev,
          maxPrev
      );
    } else {
      const minCurrent = MIN_FASADE_WIDTH
      const maxCurrent = currentSegment.maxX

      if (newValue < minCurrent)
        calcValue = minCurrent;
      else if (newValue > maxCurrent)
        calcValue = maxCurrent;
    }
  } else {
    const section = module.sections[sectionIndex];
    const door = section.fasades?.[doorIndex];
    const currentSegment = door?.[segmentIndex];

    if (segmentIndex < door.length - 1) {
      const nextRow = door[segmentIndex + 1]

      const totalHeight = currentSegment.height + nextRow.height;
      const minCurrent = MIN_FASADE_HEIGHT  //Math.max(MIN_FASADE_HEIGHT, currentSegment.maxY);
      const minNext = MIN_FASADE_HEIGHT     //Math.max(MIN_FASADE_HEIGHT, nextRow.minY);
      const maxCurrent = currentSegment.maxY
      const maxNext = nextRow.maxY

      calcValue = updateSizesFasades(
          newValue,
          totalHeight,
          minCurrent,
          maxCurrent,
          minNext,
          maxNext
      );
    } else if (segmentIndex > 0) {
      const prevRow = door[segmentIndex - 1]
      const totalHeight = currentSegment.height + prevRow.height;

      const minCurrent = MIN_FASADE_HEIGHT // Math.max(MIN_FASADE_HEIGHT, currentSegment.minY);
      const minPrev = MIN_FASADE_HEIGHT // Math.max(MIN_FASADE_HEIGHT, prevRow.maxY);
      const maxCurrent = currentSegment.maxY
      const maxPrev = prevRow.maxY

      calcValue = updateSizesFasades(
          newValue,
          totalHeight,
          minCurrent,
          maxCurrent,
          minPrev,
          maxPrev
      );
    } else {
      const minCurrent = MIN_FASADE_HEIGHT
      const maxCurrent = currentSegment.maxY

      if (newValue < minCurrent)
        calcValue = minCurrent;
      else if (newValue > maxCurrent)
        calcValue = maxCurrent;
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

const updateSizesFasades = (
    newValue,
    total,
    minCurrent,
    maxCurrent,
    minAdjacent,
    maxAdjacent
) => {

  if (newValue < minCurrent)
    newValue = minCurrent;
  else if (newValue > maxCurrent)
    newValue = maxCurrent;

  const newAdjacentSize = total - newValue;

  if (newAdjacentSize < minAdjacent)
    newValue = total - minAdjacent;
  else if (newAdjacentSize > maxAdjacent)
    newValue = total - maxAdjacent;

  return newValue;
};

const adjustSizeFromExternal = ({
                                  dimension,
                                  value,
                                  sec = null,
                                  cell = null,
                                  row = null,
                                  type = 'module',
                                }: {
  dimension: string;
  value: number;
  sec?: number;
  cell?: number;
  row?: number;
  type?: string;
}) => {
  if (sec === null) {
    console.warn("Не выбрана ячейка для изменения размера");
    return;
  }

  switch (type) {
    case 'fasades':
      return adjustFasadeSize(sec, cell, row, value, dimension);
    default:
      return adjustSectionSize(sec, cell, row, value, dimension);
  }
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
  fasades.length = 0;
  loops.length = 0;

  sectionsContainer.removeChildren();
  loopsContainer.removeChildren();
  lablesContainer.removeChildren();
  fillingsContainer.removeChildren();
  dementionContainer.removeChildren();
  fasadesContainer.removeChildren();
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

  calcMaxAreaSize();
});

onMounted(() => {
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
  <div class="visualization-interactive" :style="`height:${areaHeight}px width:${areaWidth}px`">
    <canvas ref="canvasContainer"></canvas>
  </div>
  <!-- :style="'height:getMaxAreaHeight'" -->
</template>

<style lang="scss" scoped>
.visualization-interactive {
  canvas {
    border: 1px solid #bbbbbb;
    display: flex;
    justify-content: center;
  }
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
