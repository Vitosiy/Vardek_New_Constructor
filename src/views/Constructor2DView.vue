<template>
  <div class="132">
    <canvas ref="canvasElement" id="roomCanvas"></canvas>
  </div>
</template>

<script lang="ts" setup>
//@ts-nocheck
import { ref, onMounted, Ref } from "vue";
import { useConstructorStore } from "@/store/appStore/constructor";

const constructor = useConstructorStore();

// canvas
const canvasElement: Ref<HTMLCanvasElement | undefined> = ref();
// ctx
const ctx: Ref<CanvasRenderingContext2D | undefined> = ref();

onMounted(() => {
  ctx.value = canvasElement.value?.getContext("2d") || undefined;
  updateCanvasSize();
  window.addEventListener("resize", function () {
    updateCanvasSize();
  });
  render();
});

function render() {
  if (!ctx.value) {
    return;
  }
}
function redraw() {
  ctx.value?.clearRect(0, 0, canvasElement.value!.width, canvasElement.value!.height);
  drawGrid();
  drawTopLabelsTable();
  drawLeftLabelsTable();
  // drawTopLabels();
  // drawLeftLabels();
  // Здесь можно добавить другие элементы комнаты (мебель, стены и т.д.)
}

// Функция для обновления размера холста

function updateCanvasSize() {
  constructor.canvasWidth = window.innerWidth;
  constructor.canvasHeight = window.innerHeight;
  canvasElement.value!.width = constructor.canvasWidth;
  canvasElement.value!.height = constructor.canvasHeight;
  redraw();
}

// Сетка
function drawGrid() {
  ctx.value?.beginPath();
  ctx.value!.strokeStyle = "#ddd";
  for (let x = 0; x < canvasElement.value!.width; x += constructor.gridSpacing) {
    ctx.value?.moveTo(x, constructor.gridSpacing);
    ctx.value?.lineTo(x, canvasElement.value!.height);
  }
  for (let y = 0; y < canvasElement.value!.height; y += constructor.gridSpacing) {
    ctx.value?.moveTo(constructor.gridSpacing, y);
    ctx.value?.lineTo(canvasElement.value!.width, y);
  }
  ctx.value?.stroke();
}

function drawTopLabelsTable() {
  const cellWidth = constructor.gridSpacing * 5; // Ширина одной ячейки

  ctx.value!.fillStyle = "#5D6069";
  ctx.value!.textAlign = "left";
  ctx.value!.textBaseline = "middle";

  // Пустой первый элемент
  ctx.value!.strokeStyle = "#5D6069";

  const numLabels = Math.floor(constructor.canvasWidth / cellWidth);
  for (let i = 1; i < numLabels; i++) {
    ctx.value?.beginPath();
    ctx.value?.moveTo(i * cellWidth + constructor.gridSpacing, 0);
    ctx.value?.lineTo(i * cellWidth + constructor.gridSpacing, constructor.gridSpacing);
    ctx.value?.stroke();
  }

  ctx.value?.beginPath();
  ctx.value?.moveTo(0, constructor.gridSpacing);
  ctx.value?.lineTo(constructor.canvasWidth, constructor.gridSpacing);
  ctx.value?.stroke();

  ctx.value?.beginPath();
  ctx.value?.moveTo(constructor.gridSpacing, 0);
  ctx.value?.lineTo(constructor.gridSpacing, constructor.canvasHeight);
  ctx.value?.stroke();

  // Числовые метки, начиная с 0, с шагом 1500
  ctx.value!.fillStyle = "#5D6069"; // Цвет текста
  ctx.value!.textAlign = "left";
  ctx.value!.textBaseline = "middle";
  for (let i = 0; i < numLabels; i++) {
    const value = i * 1500;
    const textX = (i + 1) * cellWidth + cellWidth / 10 + constructor.gridSpacing;
    ctx.value?.fillText(value.toString(), textX, constructor.gridSpacing / 2);
  }
}

// Функция для создания левой таблицы меток
function drawLeftLabelsTable() {
  const tableHeight = constructor.canvasHeight;
  const cellHeight = constructor.gridSpacing * 5;

  ctx.value!.fillStyle = "#000";
  ctx.value!.textAlign = "left";
  ctx.value!.textBaseline = "middle";
  const numLabels = Math.floor(constructor.canvasWidth / cellHeight);

  for (let i = 1; i < numLabels; i++) {
    ctx.value?.beginPath();
    ctx.value?.moveTo(0, i * cellHeight + constructor.gridSpacing);
    ctx.value?.lineTo(constructor.gridSpacing, i * cellHeight + constructor.gridSpacing);
    ctx.value?.stroke();
  }
  ctx.value!.fillStyle = "#5D6069"; // Цвет текста
  ctx.value!.textAlign = "left";
  ctx.value!.textBaseline = "middle";
  for (let i = 0; i < numLabels; i++) {
    const value = i * 1500;
    const textY = (i + 1) * cellHeight + cellHeight / 10 + constructor.gridSpacing;
    ctx.value?.save(); // Сохраняем текущее состояние контекста
    ctx.value?.rotate(Math.PI / 2); // Поворачиваем контекст на 90 градусов против часовой стрелки
    ctx.value?.fillText(value.toString(), textY, -constructor.gridSpacing / 2);
    ctx.value?.restore(); // Восстанавливаем предыдущее состояние контекста
  }
}

// Обработчик кликов мыши для добавления элементов комнаты
//   canvas.addEventListener("click", function (event) {
//     const mouseX = event.clientX - canvas.getBoundingClientRect().left;
//     const mouseY = event.clientY - canvas.getBoundingClientRect().top;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     redraw();
//   });

//   function drawAlignedLines(x1, y1, x2, y2) {
//     const gridSize = gridSpacing; // Размер клетки в сетке
//     const snapThreshold = 5; // Порог привязки к граням клеток

//     // Определяем ближайшие грани клеток, к которым привязывается прямая
//     const nearestX1 = Math.round(x1 / gridSize) * gridSize;
//     const nearestY1 = Math.round(y1 / gridSize) * gridSize;
//     const nearestX2 = Math.round(x2 / gridSize) * gridSize;
//     const nearestY2 = Math.round(y2 / gridSize) * gridSize;

//     // Рисуем прямую линию, привязанную к ближайшим граням клеток
//     ctx.beginPath();
//     ctx.moveTo(nearestX1, nearestY1);
//     ctx.lineTo(nearestX2, nearestY2);
//     ctx.stroke();
//   }

//   let prevX, prevY;
//   canvas.addEventListener("mousedown", function (event) {
//     // Проверяем, что нажата левая кнопка мыши
//     if (event.button === 0) {
//       // Записываем координаты точки начала прямой линии
//       const startX = event.clientX - canvas.getBoundingClientRect().left;
//       const startY = event.clientY - canvas.getBoundingClientRect().top;

//       prevX = startX;
//       prevY = startY;

//       // Обработчик события перемещения мыши для рисования прямой линии
//       let a = function onMouseMove(event) {
//         // Записываем координаты текущей точки
//         const ctx = canvas.getContext("2d");

//         const currentX = event.clientX - canvas.getBoundingClientRect().left;
//         const currentY = event.clientY - canvas.getBoundingClientRect().top;

//         // Очищаем холст
//         ctx.beginPath();
//         ctx.moveTo(prevX, prevY);
//         ctx.lineTo(currentX, currentY);
//         ctx.stroke();

//         // Рисуем прямую линию от начальной точки до текущей точки
//         // drawAlignedLines(startX, startY, currentX, currentY);

//         prevX = currentX;
//         prevY = currentY;
//       };

//       // Обработчик события отпускания левой кнопки мыши
//       let b = function onMouseUp() {
//         // Удаляем обработчик события перемещения мыши
//         canvas.removeEventListener("mousemove", a);
//         // Удаляем обработчик события отпускания левой кнопки мыши
//         canvas.removeEventListener("mouseup", onMouseUp);
//       };

//       // Добавляем обработчик события перемещения мыши
//       canvas.addEventListener("mousemove", a);
//       // Добавляем обработчик события отпускания левой кнопки мыши
//       canvas.addEventListener("mouseup", b);
//     }
//   });

</script>
<style lang="scss" setup>
#roomCanvas {
  display: flex;
}
</style>