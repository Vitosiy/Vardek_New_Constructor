<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  computed,
  reactive,
  defineExpose,
} from "vue";
import {
  Application,
  Container,
  Graphics,
  Text,
} from "pixi.js";
import { Shape, ShapeAdjuster, Section } from "./utils/Methods";
import { UI_PARAMS} from "./utils/UMConstructorConst.ts";

const props = defineProps({
  grid: {
    type: Array,
    required: true,
  },

  maxAreaHeight: {
    type: Number,
    default: 320,
  },

  correct: {
    type: Object,
  },

  container: {},
  tempHole: { type: Object },
});

const emit = defineEmits(["cell-selected", "position-non"]);

const canvasContainer = ref();
const selectedCell = ref({ col: 0, cell: 0 });

let app: Application,
    sectionsContainer: Container,
    cellsContainer: Container,
    lablesContainer: Container,
    dementionContainer: Container,
    shapeAdjuster: ShapeAdjuster;
let curCol = null;
let curRow = null;
let draggedObject = null;
let cursorCheck = false;

let sections = [];
let sectionLables = [];
let deviders = [];
let cells = [];
let dementions = [];

const {
  MAX_AREA_WIDTH,
  TOTAL_LENGTH,
  TOTAL_HEIGHT,
  BACKGROUND_COLOR,
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
} = UI_PARAMS;

const dragState = reactive({
  isDragging: false,
  type: null, // "vertical" или "horizontal"

  colIndex: null,
  rowIndex: null, // Для горизонтального перетаскивания

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

const getMaxAreaHeight = computed(
    () => (TOTAL_HEIGHT * MAX_AREA_WIDTH) / TOTAL_LENGTH
);

const getPixelWidth = (mmWidth) => {
  // return Math.floor((mmWidth / TOTAL_LENGTH) * MAX_AREA_WIDTH);
  return (mmWidth / TOTAL_LENGTH) * MAX_AREA_WIDTH;
};

const getPixelHeight = (mmHeight) => {
  // return Math.floor((mmHeight / TOTAL_HEIGHT) * getMaxAreaHeight.value);
  return (mmHeight / TOTAL_HEIGHT) * getMaxAreaHeight.value;
};

const getMmWidth = (pxWidth) => {
  return (pxWidth / MAX_AREA_WIDTH) * TOTAL_LENGTH;
};

const getMmHeight = (pxHeight) => {
  return (pxHeight / getMaxAreaHeight.value) * TOTAL_HEIGHT;
};

const init = async () => {
  app = new Application();
  await app.init({
    canvas: canvasContainer.value,
    width: MAX_AREA_WIDTH,
    height: props.maxAreaHeight,
    backgroundColor: BACKGROUND_COLOR,
    resolution: window.devicePixelRatio || 1,
    // autoDensity: true,
    antialias: true,
    premultipliedAlpha: false,
  });

  sectionsContainer = new Container();
  cellsContainer = new Container();
  lablesContainer = new Container();
  dementionContainer = new Container();

  // sectionsContainer.interactive = true;
  cellsContainer.interactive = true;
  lablesContainer.interactiveChildren = false;
  dementionContainer.interactiveChildren = false;

  app.stage.addChild(sectionsContainer);
  app.stage.addChild(cellsContainer);
  app.stage.addChild(lablesContainer);
  app.stage.addChild(dementionContainer);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  shapeAdjuster = new ShapeAdjuster();

  renderGrid();
};

const renderGrid = () => {
  clearRender();

  let xOffset = 0;

  props.grid.forEach((section, colIndex) => {
    const pxWidth = getPixelWidth(section.width);

    let yOffset = 0;

      const pxHeight = getPixelHeight(section.height);
    section.xOffset = xOffset;
    section.yOffset = yOffset;

      // Отрисовываем секцию

      createSector({
        x: xOffset,
        y: yOffset,
        width: pxWidth,
        height: pxHeight,
        colIndex,
        rowIndex: 1,
        cellData:section,
        col: 1,
      });

      //Добавляем отступ по вертикали
      yOffset += pxHeight;
    //Добавляем отступ по горизонтали
    xOffset += pxWidth;

    // Создаём ограничения для секторов по ширине
    const colBond = shapeAdjuster.createColumnBounds(sections, colIndex);

    section.cells.forEach((cell) => {
      cell.shapesBond = colBond;
      cell.maxX = shapeAdjuster.convertToTen(getMmWidth(colBond.maxX));
      cell.minX = shapeAdjuster.convertToTen(getMmWidth(colBond.minX));
    });
  });

  sections.forEach((elem) => {
    app.stage.addChildAt(elem, 0);
  });

  deviders.forEach((elem) => {
    sectionsContainer.addChild(elem);
  });

  cells.forEach((elem) => {
    cellsContainer.addChild(elem);
  });

  sectionLables.forEach((elem) => {
    lablesContainer.addChild(elem);
  });

  dementions.forEach((elem) => {
    dementionContainer.addChild(elem);
  });
};

// Создаём сектора
const createSector = ({
                        x,
                        y,
                        width,
                        height,
                        cellData,
                        col,
                        colIndex,
                        rowIndex,
                      }) => {
  const sector = new Container();

  sector.position.set(x, y);

  sector.shapes = [];
  sector.sectorData = cellData;
  sector.sections = sections;
  sector.cellsContainer = cellsContainer;

  sector.colNdx = colIndex;
  sector.rowNdx = rowIndex;
  const cell = new Section(cellData, width, height, sector);

  if (
      selectedCell.value.col === colIndex &&
      selectedCell.value.cell === rowIndex
  ) {
    cell.highlightGraphics.visible = true;
  } else {
    cell.highlightGraphics.visible = false;
  }

  cell.cellGraphics.eventMode = "static";
  cell.cellGraphics.cursor = "pointer";

  sector.addChild(cell.cellGraphics);
  sector.addChild(cell.highlightGraphics);

  sections.push(sector);

  /** Создаём отверсти */
  cell.fillings?.forEach((filling) => {
    createHole(filling, sector);
  });

  // /** Создаём нумерацию сектора */
  createSectioNum({ x, y, width, height, cell, colIndex, rowIndex });

  cell.cellGraphics.on("pointerdown", () => {
    selectCell(colIndex, rowIndex);
  });
  // /**Создание вертикального выреза */
  createVerticalCut({ width, height, cell, col, colIndex, sector });
  // /**Создание горизонтального выреза */
  createHorozontalCut({ width, height, cell, col, colIndex, rowIndex, sector });

  // Создаём ограничения для секторов по высоте

  const sectorBounds = shapeAdjuster.getTotalBounds(sector, cell);
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
const createSectioNum = ({ x, y, width, height, cell, colIndex, rowIndex }) => {
  const pxWidth = getPixelWidth(cell.width);
  const pxHeight = getPixelHeight(cell.height);

  const cellNumber = new Text({
    text: `${colIndex + 1}.${rowIndex + 1}`,
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
const createVerticalCut = ({ width, height, cell, col, colIndex, sector }) => {
  if (!(colIndex < props.grid.length - 1)) return;

  const pxWidth = getPixelWidth(cell.width);
  const totalHeight = col.reduce((sum, cell) => sum + cell.height, 0);
  const convertTotalHeight = getPixelHeight(totalHeight);

  const divider = new Graphics();
  const dashVert = new Graphics();

  divider.rect(0, 0, 10, convertTotalHeight);

  divider.fill("#A3A9B5");
  divider.alpha = 0;

  divider.eventMode = "static";
  divider.cursor = "col-resize";
  divider.col = colIndex;

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
                               col,
                               colIndex,
                               rowIndex,
                               sector,
                             }) => {
  if (!(rowIndex < col.length - 1)) return;

  const pxWidth = getPixelWidth(cell.width);
  const pxHeight = getPixelHeight(cell.height);

  const divider = new Graphics();
  const dashHor = new Graphics();

  divider.rect(cell.xOffset, cell.yOffset + pxHeight - 5, pxWidth, 10);
  divider.fill("#A3A9B5");
  divider.alpha = 0;
  divider.eventMode = "static";
  divider.cursor = "cell-resize";
  divider.col = colIndex;
  divider.cell = rowIndex;

  // dragState.colIndex === colIndex && dragState.rowIndex === rowIndex
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

// Создание отверстия

const checkPositionHoleToCreate = (data) => {
  const col = selectedCell.value.col;
  const cell = selectedCell.value.cell;

  let position, tempShape;

  const sector = sections.find(
      (elem) => elem.rowNdx === cell && elem.colNdx === col
  );

  tempShape = new Shape({
    type: data.type,
    sector,
    position: { x: 0, y: 0 },
    data,
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
    radius: data.radius,
  };
};

const createHole = (data, sector) => {
  const cell = new Shape({
    type: data.type,
    sector,
    data,
    select: selectCell,
    render: renderGrid,
    dementions,
    dementionContainer,
  });

  cells.push(cell.graphic);
  sector.shapes.push(cell);
};

// Выбор сектора, передача в родительский компонент

const selectCell = (colIndex, rowIndex) => {
  selectedCell.value = { col: colIndex, cell: rowIndex };
  toggleSectorColor(colIndex, rowIndex);
  emit("cell-selected", colIndex, rowIndex);
};

const toggleSectorColor = (colIndex, rowIndex) => {
  const sector = props.grid[colIndex][rowIndex].sector;

  sections.forEach((elem) => {
    elem.children[1].visible = false;
    // elem.children[0].alpha = 1;
  });
  sector.children[1].visible = true;
  // sector.children[0].alpha = 0.5;
};

// Обработчик для вертикального перетаскивания (между колонками)
function onVerticalDragStart(event) {
  // event.stopPropagation();
  cursorCheck = true;
  const colIndex = this.col;

  const cur = props.grid[colIndex];
  const next = props.grid[colIndex + 1];

  // event.currentTarget.alpha = 0.5;

  dragState.isDragging = true;
  dragState.type = "vertical";

  dragState.colIndex = colIndex;
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

  // renderGrid();
}

// Обработчик для горизонтального перетаскивания (между строками)
function onHorizontalDragStart(event) {
  // event.stopPropagation();

  cursorCheck = true;

  const colIndex = this.col as number;
  const rowIndex = this.cell as number;

  const cur = props.grid[colIndex][rowIndex];
  const next = props.grid[colIndex][rowIndex + 1];

  // event.currentTarget.alpha = 0.5;
  dragState.element = this;
  dragState.isDragging = true;
  dragState.type = "horizontal";
  dragState.colIndex = colIndex;
  dragState.rowIndex = rowIndex;
  dragState.startY = event.data.global.y;
  dragState.startTopHeight = cur.height;
  dragState.startBottomHeight = next.height;

  dragState.minTop = shapeAdjuster.getSectionTop(cur.sector, cur.maxY);
  dragState.minBottom = shapeAdjuster.getSectionBottom(next.sector, next.minY);

  app.stage.on("pointermove", onDragMove);
  app.stage.on("pointerup", onDragEnd);

  // renderGrid();
}

function onDragMove(event) {
  if (!dragState.isDragging) return;

  const {
    type,
    colIndex,
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

    element.position.x = Math.floor(event.data.global.x / 10) * 10;

    const deltaMm = Math.floor((deltaPixels * pixelRatio.value) / 10) * 10;

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

    props.grid[colIndex].forEach((cell) => {
      cell.width = newLeftWidth;
    });

    props.grid[colIndex + 1].forEach((cell) => {
      cell.width = newRightWidth;
    });
  } else if (type === "horizontal") {
    let curMin = minTop < MIN_SECTION_WIDTH ? MIN_SECTION_WIDTH : minTop;
    let nextMin = minBottom < MIN_SECTION_WIDTH ? MIN_SECTION_WIDTH : minBottom;

    const deltaPixels = event.data.global.y - startY;

    element.position.y = Math.floor(event.data.global.y / 10) * 10;

    const deltaMm = Math.floor((deltaPixels * pixelRatio.value) / 10) * 10;

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

    props.grid[colIndex][rowIndex].height = newTopHeight;
    props.grid[colIndex][rowIndex + 1].height = newBottomHeight;
  }

  renderGrid();
}

const onDragEnd = () => {
  dragState.isDragging = false;
  dragState.type = null;
  dragState.colIndex = null;
  dragState.rowIndex = null;
  dragState.curRoundMax = null;
  dragState.nextRoundMax = null;

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
    colIndex,
    rowIndex,
    newValue,
    dimension = "width"
) => {
  const minValue =
      dimension === "width" ? MIN_SECTION_WIDTH : MIN_SECTION_HEIGHT;
  newValue = Math.max(Math.floor(newValue / 10) * 10, minValue);
  let calcValue;

  const grid = props.grid;

  if (dimension === "width") {
    const section = grid[colIndex];

    if (colIndex < grid.length - 1) {
      const nextCol = grid[colIndex + 1];
      const totalWidth = section[0].width + nextCol[0].width;

      const minCurrent = Math.max(
          MIN_SECTION_WIDTH,
          shapeAdjuster.getLeftSectionWidth(section[0].sector, section[0].maxX)
      );

      const minNext = Math.max(
          MIN_SECTION_WIDTH,
          shapeAdjuster.getRightSectionWidth(nextCol[0].sector, nextCol[0].minX)
      );
      calcValue = updateSizes(
          newValue,
          dimension,
          section,
          nextCol,
          totalWidth,
          minCurrent,
          minNext
      );
    } else if (colIndex > 0) {
      const prevCol = grid[colIndex - 1];
      const totalWidth = section[0].width + prevCol[0].width;

      const minCurrent = Math.max(
          MIN_SECTION_WIDTH,
          shapeAdjuster.getRightSectionWidth(section[0].sector, section[0].minX)
      );

      const minPrev = Math.max(
          MIN_SECTION_WIDTH,
          shapeAdjuster.getLeftSectionWidth(prevCol[0].sector, prevCol[0].maxX)
      );

      calcValue = updateSizes(
          newValue,
          dimension,
          section,
          prevCol,
          totalWidth,
          minCurrent,
          minPrev
      );
    } else {
      section.forEach((cell) => (cell.width = newValue));
    }
  } else {
    const section = grid[colIndex];
    const currentRow = section[rowIndex];
    if (rowIndex < section.length - 1) {
      const nextRow = section[rowIndex + 1];
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
    } else if (rowIndex > 0) {
      const prevRow = section[rowIndex - 1];
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
                                  col,
                                  cell,
                                }: {
  dimension: string;
  value: number;
  col: number;
  cell?: number;
}) =>
{
  if (col === null) {
    console.warn("Не выбрана ячейка для изменения размера");
    return;
  }

  return adjustSectionSize(col, cell, value, dimension);
};

const clearRender = () => {
  sections.forEach((elem) => {
    app.stage.removeChild(elem);
    elem.destroy();
  });

  sections = [];
  sectionLables = [];
  deviders = [];
  cells = [];
  dementions = [];

  sectionsContainer.removeChildren();
  cellsContainer.removeChildren();
  lablesContainer.removeChildren();
  dementionContainer.removeChildren();
};

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
  checkPositionHoleToCreate,
  createHole,
});
</script>

<template>
  <div class="visualization" :style="'height:getMaxAreaHeight'">
    <canvas ref="canvasContainer"></canvas>
  </div>
</template>

<style>
.visualization {
  width: 64vw;
  height: 58vh;
  border: 1px solid #bbbbbb;
}

/*  height: 320px; */

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
