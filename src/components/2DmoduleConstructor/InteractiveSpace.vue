<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed,
  reactive,
  toRaw,
} from "vue";
import { Application, Container, Graphics, Text } from "pixi.js";
import { CUTTER_PARAMS } from "./CutterConst.ts";

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
});

const emit = defineEmits(["cell-selected"]);

const canvasContainer = ref(null);
const eventCheck = ref(null);
const selectedCell = ref({ col: 0, row: 0 });

let app, sectionsContainer, holesContainer, lablesContainer;
let curCol = null;
let curRow = null;
let draggedObject = null;
let cursorCheck = false;

let sections = [];
let sectionLables = [];
let deviders = [];
let holes = [];

const {
  MAX_AREA_WIDTH,
  TOTAL_LENGTH,
  TOTAL_HEIGHT,
  BACKGROUND_COLOR,
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
  HOLE_OFFSET,
} = CUTTER_PARAMS;

const dragState = reactive({
  isDragging: false,
  type: null, // "vertical" или "horizontal"
  colIndex: null,
  rowIndex: null, // Для горизонтального перетаскивания
  startX: 0,
  startY: 0,
  startLeftWidth: 0,
  startRightWidth: 0,
  startTopHeight: 0,
  startBottomHeight: 0,
  element: null,

  curRoundMax: null,
  nextRoundMax: null,
});

const holeDragState = reactive({
  isDragging: false,
  isResizing: false,
  sectionIndex: null,
  holeIndex: null,
  startHoleSize: 0,
  sectionElement: null,
  col: null,
  row: null,
  newX: 0,
  newY: 0,
  holeData: null,
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
  holesContainer = new Container();
  lablesContainer = new Container();

  sectionsContainer.interactive = true;
  holesContainer.interactive = true;
  lablesContainer.interactiveChildren = false;

  app.stage.addChild(sectionsContainer);
  app.stage.addChild(holesContainer);
  app.stage.addChild(lablesContainer);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  renderGrid();
};

const renderGrid = () => {
  sectionsContainer.removeChildren();
  holesContainer.removeChildren();
  lablesContainer.removeChildren();

  sections = [];
  sectionLables = [];
  deviders = [];
  holes = [];

  let xOffset = 0;

  props.grid.forEach((column, colIndex) => {
    const pxWidth = getPixelWidth(column[0].width);

    let yOffset = 0;

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
        colIndex,
        rowIndex,
        row,
        col,
      });

      //Добавляем отступ по вертикали
      yOffset += pxHeight;
    });
    //Добавляем отступ по горизонтали
    xOffset += pxWidth;
  });

  const union = [...sections, deviders].flat();

  sectionLables.forEach((elem) => {
    lablesContainer.addChild(elem);
  });

  union.forEach((elem) => {
    sectionsContainer.addChild(elem);
  });

  holes.forEach((elem) => {
    holesContainer.addChild(elem);
  });
};

// Создаём сектора
const createSector = ({
  x,
  y,
  width,
  height,
  row,
  col,
  colIndex,
  rowIndex,
}) => {
  row.colide = new HolesCollision();

  let color;
  let circle = "diameter" in row.roundCut;

  if (
    selectedCell.value.col === colIndex &&
    selectedCell.value.row === rowIndex
  ) {
    color = 0xe0f7fa;
  } else {
    color = "#ECEBF1";
  }

  if (circle) {
    color = "#ffffff";
  }

  const cellGraphics = new Graphics();

  cellGraphics.rect(0, 0, width, height);
  cellGraphics.fill(color);
  cellGraphics.position.set(x, y);
  cellGraphics.eventMode = "static";
  cellGraphics.cursor = "pointer";

  sections.push(cellGraphics);
  /** Создаём круглый разрез */
  createRoundCut({ x, y, row, colIndex, rowIndex });
  /** Создаём отверсти */

  row.holes.forEach((data) => {
    createHole({ data, x, y, row, colIndex, rowIndex });
  });

  /** Создаём нумерацию сектора */
  createSectioNum({ x, y, width, height, row, colIndex, rowIndex });

  cellGraphics.on("pointerdown", () => {
    selectCell(colIndex, rowIndex);
  });
  /**Создание вертикального выреза */
  createVerticalCut({ width, height, row, col, colIndex });
  /**Создание горизонтального выреза */
  createHorozontalCut({ width, height, row, col, colIndex, rowIndex });
};

// Отрисовываем номер ячейки
const createSectioNum = ({ x, y, width, height, row, colIndex, rowIndex }) => {
  const pxWidth = getPixelWidth(row.width);
  const pxHeight = getPixelHeight(row.height);

  const cellNumber = new Text({
    text: `${colIndex + 1}.${rowIndex + 1}`,
    style: { fontSize: 14, fill: "#131313", align: "center" },
  });
  cellNumber.anchor.set(0.5);
  cellNumber.x = row.xOffset + pxWidth / 2;
  cellNumber.y = row.yOffset + pxHeight / 2;

  const cellNumberBackground = new Graphics();
  cellNumberBackground.roundRect(
    row.xOffset + pxWidth / 2 - 12.5,
    row.yOffset + pxHeight / 2 - 12,
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

// Выбор сектора, передача в родительский компонент
const selectCell = (colIndex, rowIndex) => {
  selectedCell.value = { col: colIndex, row: rowIndex };
  emit("cell-selected", colIndex, rowIndex);
};

// Обработчик для вертикального перетаскивания (между колонками)
const onVerticalDragStart = (event, colIndex) => {
  event.stopPropagation();
  cursorCheck = true;

  const cur = props.grid[colIndex];
  const next = props.grid[colIndex + 1];

  let curRound = cur
    .filter((elem) => elem.roundCut.diameter)
    .sort((a, b) => b.roundCut.diameter - a.roundCut.diameter)[0];

  let nextRound = next
    .filter((elem) => elem.roundCut.diameter)
    .sort((a, b) => b.roundCut.diameter - a.roundCut.diameter)[0];

  // event.currentTarget.alpha = 0.5;

  dragState.isDragging = true;
  dragState.type = "vertical";

  dragState.colIndex = colIndex;
  dragState.startX = event.data.global.x;

  dragState.startLeftWidth = cur[0].width;
  dragState.startRightWidth = next[0].width;
  dragState.element = event.currentTarget;

  dragState.curRoundMax = curRound;
  dragState.nextRoundMax = nextRound;

  app.stage.on("pointermove", onDragMove);
  app.stage.on("pointerup", onDragEnd);
  // renderGrid();
};

// Обработчик для горизонтального перетаскивания (между строками)
const onHorizontalDragStart = (event, colIndex, rowIndex) => {
  event.stopPropagation();

  cursorCheck = true;

  const cur = props.grid[colIndex][rowIndex];
  const next = props.grid[colIndex][rowIndex + 1];

  // event.currentTarget.alpha = 0.5;
  dragState.element = event.currentTarge;
  dragState.isDragging = true;
  dragState.type = "horizontal";
  dragState.colIndex = colIndex;
  dragState.rowIndex = rowIndex;
  dragState.startY = event.data.global.y;
  dragState.startTopHeight = cur.height;
  dragState.startBottomHeight = next.height;

  console.log();

  dragState.curRoundMax = cur;
  dragState.nextRoundMax = next;

  app.stage.on("pointermove", onDragMove);
  app.stage.on("pointerup", onDragEnd);
};

const onHoleDragStart = ({ event, row, colIndex, rowIndex, x, y, hole }) => {
  event.stopPropagation();

  const cur = toRaw(selectedCell.value);

  const curSector = JSON.stringify({ col: colIndex, row: rowIndex });
  const curCell = JSON.stringify(cur);

  if (curCell !== curSector) {
    const newCell = JSON.parse(curSector);
    selectCell(newCell.col, newCell.row);
  }

  cursorCheck = true;

  holeDragState.isDragging = true;
  holeDragState.sectionElement = event.currentTarget;

  // console.log(event.currentTarget.getBounds(), '--currentTarget');

  // holeDragState.sectionElement.alpha = 0.4;
  holeDragState.sectionElement.dragData = event.data;
  holeDragState.sectionElement.dragging = true;
  holeDragState.row = row;

  if ("diametr" in row.roundCut) {
    holeDragState.newX = row.roundCut.x;
    holeDragState.newY = row.roundCut.y;
  }

  holeDragState.newX = x;
  holeDragState.newY = y;
  holeDragState.holeData = hole;

  app.stage.on("pointermove", onDragHoleMove);
  app.stage.on("pointerup", onHoleDragEnd);
};

const onDragMove = (event) => {
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
    element,
    curRoundMax,
    nextRoundMax,
  } = dragState;

  let curMin, nextMin;

  if (curRoundMax && "diameter" in curRoundMax.roundCut) {
    curMin = curRoundMax.roundCut.diameter;
  } else {
    curMin = MIN_SECTION_WIDTH;
  }

  if (nextRoundMax && "diameter" in nextRoundMax.roundCut) {
    nextMin = nextRoundMax.roundCut.diameter;
  } else {
    nextMin = MIN_SECTION_WIDTH;
  }

  if (type === "vertical") {
    const deltaPixels = event.data.global.x - startX;

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

    // Update grid dimensions
    props.grid[colIndex].forEach((row) => {
      row.width = newLeftWidth;
      adjustObjectPosition(row);
    });
    props.grid[colIndex + 1].forEach((row) => {
      row.width = newRightWidth;
      adjustObjectPosition(row);
    });
  } else if (type === "horizontal") {
    const deltaPixels = event.data.global.y - startY;

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

    adjustObjectPosition(props.grid[colIndex][rowIndex]);
    adjustObjectPosition(props.grid[colIndex][rowIndex + 1]);
  }

  renderGrid();
};

const onDragHoleMove = (event) => {
  if (!holeDragState.isDragging || !holeDragState.sectionElement) return;

  let elem = holeDragState.sectionElement;

  if (!elem.parent) return;

  const holeOffset = 100;
  const hole = holeDragState.holeData;
  const row = holeDragState.row;

  const newPosition = elem.parent.toLocal(event.global, null, elem.position);
  const drowPosition = elem.dragData.getLocalPosition(elem.parent);

  let pixelCenterX, pixelCenterY;

  if (row.colide._currentPos.x !== null) {
    pixelCenterX =
      row.colide._currentPos.x - row.xOffset - getPixelWidth(row.width) * 0.5;
    pixelCenterY =
      row.colide._currentPos.y - row.yOffset - getPixelHeight(row.height) * 0.5;
  } else {
    pixelCenterX = newPosition.x - row.xOffset - getPixelWidth(row.width) * 0.5;
    pixelCenterY =
      newPosition.y - row.yOffset - getPixelHeight(row.height) * 0.5;
  }

  // pixelCenterX = newPosition.x - row.xOffset - getPixelWidth(row.width) * 0.5;
  // pixelCenterY = newPosition.y - row.yOffset - getPixelHeight(row.height) * 0.5;


  // Преобразуем пиксели обратно в миллиметры
  let mmX = getMmWidth(pixelCenterX);
  let mmY = getMmHeight(pixelCenterY);

  let elmRadius;
  let minX, maxX, minY, maxY;
  let x, y;

  if ("diameter" in row.roundCut) {
    elmRadius = row.roundCut.diameter * 0.5;
    minX = -row.width * 0.5 + elmRadius; // Левая граница
    maxX = row.width * 0.5 - elmRadius; // Правая граница
    minY = -row.height * 0.5 + elmRadius; // Верхняя граница
    maxY = row.height * 0.5 - elmRadius; // Нижняя граница
  } else {
    minX = -row.width * 0.5 + hole.width * 0.5 + HOLE_OFFSET; // Левая граница
    maxX = row.width * 0.5 - hole.width * 0.5 - HOLE_OFFSET; // Правая граница
    minY = -row.height * 0.5 + hole.height * 0.5 + HOLE_OFFSET; // Верхняя граница
    maxY = row.height * 0.5 - hole.height * 0.5 - HOLE_OFFSET; // Нижняя граница
  }

  // Применяем ограничения
  mmX = Math.max(minX, Math.min(maxX, mmX));
  mmY = Math.max(minY, Math.min(maxY, mmY));

  const xMaxBound = Math.max(
    drowPosition.x,
    elem.sectorBounds.minX + row.xOffset
  );
  const yMaxBound = Math.max(
    drowPosition.y,
    elem.sectorBounds.minY + row.yOffset
  );

  if ("diameter" in row.roundCut) {
    x = Math.min(xMaxBound, elem.sectorBounds.maxX + row.xOffset);
    y = Math.min(yMaxBound, elem.sectorBounds.maxY + row.yOffset);
  } else {
    x =
      Math.min(xMaxBound, elem.sectorBounds.maxX + row.xOffset) -
      getPixelWidth(hole.width) * 0.5;
    y =
      Math.min(yMaxBound, elem.sectorBounds.maxY + row.yOffset) -
      getPixelHeight(hole.height) * 0.5;
  }

  // Обновляем позицию элемента для немедленного отображения

  // Позиционируем разрез
  elem.position.set(x, y);

  row.colide.update(elem);

  if ("diameter" in row.roundCut) {
    row.roundCut.x = Math.round(mmX);
    row.roundCut.y = Math.round(mmY);
  } else {
    hole.x = Math.round(mmX);
    hole.y = Math.round(mmY);

    // console.log(hole.x, hole.y, "--POS");
  }

  // Передаём новое положение
};

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

const onHoleDragEnd = () => {
  if (!holeDragState.sectionElement) return; // Исправлено условие: убрано === null
  holeDragState.row.colide.reset();
  holeDragState.sectionElement.alpha = 1; // Убираем подсветку
  holeDragState.sectionElement.dragging = false;
  holeDragState.sectionElement.dragData = null;
  holeDragState.sectionElement = null;
  holeDragState.startHoleSize = 0;
  holeDragState.col = null;
  holeDragState.row = null;
  holeDragState.newX = 0;
  holeDragState.newY = 0;
  holeDragState.holeData = null;
  app.stage.off("pointermove", onDragHoleMove);
  app.stage.off("pointerup", onHoleDragEnd);
  cursorCheck = false;
};

const adjustObjectPosition = (data) => {
  // Если в секции есть круглый вырез
  if (data.roundCut && "diameter" in data.roundCut) {
    const radius = data.roundCut.diameter / 2;

    // Ограничения по X
    const minX = -data.width / 2 + radius;
    const maxX = data.width / 2 - radius;

    // Ограничения по Y
    const minY = -data.height / 2 + radius;
    const maxY = data.height / 2 - radius;

    // Применяем ограничения
    data.roundCut.x = Math.max(minX, Math.min(maxX, data.roundCut.x));
    data.roundCut.y = Math.max(minY, Math.min(maxY, data.roundCut.y));
  }

  const collisionSystem = new HolesCollision();

  if (data.holes.length > 0) {
    data.colide.update();
  }
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
    onHoleDragEnd();
  }
};

onMounted(() => {
  init();
  document.addEventListener("mousemove", handleGlobalPointerMove, false);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", handleGlobalPointerMove, false);
  app.destroy(true);
});

watch(
  // () => props.grid,
  () => props.correct,
  () => {
    if (!props.correct.change) {
      console.log("??");
      // console.log("renderGrid");
      renderGrid();
    }
  },
  { deep: true }
);

watch([selectedCell], () => {
  renderGrid();
});
</script>

<template>
  <div class="visualization" :style="'height:getMaxAreaHeight'">
    <canvas ref="canvasContainer"></canvas>
  </div>
</template>

<style>
.visualization {
  width: 1000px;
  height: 780px;
  border: 1px solid #bbbbbb;
}
/*  height: 320px; */

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
