<template>
  <div class="constructor-demo">
    <div class="header">
      <h2>Constructor2D Facade Demo</h2>
      <div class="status">
        Статус: 
        <span :class="isInitialized ? 'status-active' : 'status-inactive'">
          {{ isInitialized ? 'Инициализирован' : 'Не инициализирован' }}
        </span>
      </div>
    </div>

    <div class="main-content">
      <div class="canvas-section">
        <div ref="containerRef" class="canvas-container">
          <canvas ref="canvasRef"></canvas>
        </div>
      </div>

      <div class="controls-section">
        <div class="control-group">
          <h3>Комнаты</h3>
          <button @click="addRoom" :disabled="!isInitialized" class="btn btn-primary">
            Добавить комнату
          </button>
          <button @click="getAllRooms" :disabled="!isInitialized" class="btn btn-secondary">
            Показать все комнаты
          </button>
        </div>

        <div class="control-group">
          <h3>Стены</h3>
          <button @click="addWall" :disabled="!isInitialized" class="btn btn-primary">
            Добавить стену
          </button>
          <button @click="getAllWalls" :disabled="!isInitialized" class="btn btn-secondary">
            Показать все стены
          </button>
        </div>

        <div class="control-group">
          <h3>Объекты</h3>
          <button @click="addWindow" :disabled="!isInitialized" class="btn btn-primary">
            Добавить окно
          </button>
          <button @click="addDoor" :disabled="!isInitialized" class="btn btn-primary">
            Добавить дверь
          </button>
          <button @click="getAllObjects" :disabled="!isInitialized" class="btn btn-secondary">
            Показать все объекты
          </button>
        </div>

        <div class="control-group">
          <h3>Вид</h3>
          <button @click="zoomIn" :disabled="!isInitialized" class="btn btn-secondary">
            Увеличить
          </button>
          <button @click="zoomOut" :disabled="!isInitialized" class="btn btn-secondary">
            Уменьшить
          </button>
          <button @click="resetView" :disabled="!isInitialized" class="btn btn-secondary">
            Сброс вида
          </button>
        </div>

        <div class="control-group">
          <h3>Экспорт</h3>
          <button @click="exportImage" :disabled="!isInitialized" class="btn btn-success">
            Экспорт в изображение
          </button>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>Информация</h3>
      <div class="info-content">
        <p><strong>Комнат:</strong> {{ roomsCount }}</p>
        <p><strong>Стен:</strong> {{ wallsCount }}</p>
        <p><strong>Объектов:</strong> {{ objectsCount }}</p>
        <p><strong>Масштаб:</strong> {{ currentScale.toFixed(2) }}</p>
      </div>
    </div>

    <div v-if="lastAction" class="action-feedback">
      <p>{{ lastAction }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { use2DFacade } from '@/Constructor2D/use2DFacade';

const containerRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();
const lastAction = ref<string>('');

const {
  isInitialized,
  initialize,
  addRoom: addRoomFacade,
  removeRoom,
  getAllRooms,
  addWall: addWallFacade,
  getAllWalls,
  addObject,
  getAllObjects,
  exportToImage,
  resetView,
  zoomIn: zoomInFacade,
  zoomOut: zoomOutFacade,
  getViewport
} = use2DFacade();

// Вычисляемые свойства для отображения статистики
const roomsCount = computed(() => {
  if (!isInitialized.value) return 0;
  return getAllRooms().length;
});

const wallsCount = computed(() => {
  if (!isInitialized.value) return 0;
  return getAllWalls().length;
});

const objectsCount = computed(() => {
  if (!isInitialized.value) return 0;
  return getAllObjects().length;
});

const currentScale = computed(() => {
  if (!isInitialized.value) return 1;
  return getViewport().scale;
});

onMounted(async () => {
  if (containerRef.value && canvasRef.value) {
    try {
      await initialize(containerRef.value, canvasRef.value);
      lastAction.value = 'Constructor2D успешно инициализирован';
    } catch (error) {
      lastAction.value = `Ошибка инициализации: ${error}`;
      console.error('Ошибка инициализации:', error);
    }
  }
});

const addRoom = () => {
  const roomId = addRoomFacade({
    label: `Комната ${roomsCount.value + 1}`,
    description: 'Демо комната',
    points: [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 200 },
      { x: 100, y: 200 }
    ]
  });
  lastAction.value = `Добавлена комната с ID: ${roomId}`;
};

const addWall = () => {
  const wallId = addWallFacade(
    { x: 200 + wallsCount.value * 50, y: 150 },
    'wall'
  );
  lastAction.value = `Добавлена стена с ID: ${wallId}`;
};

const addWindow = () => {
  const windowId = addObject(
    { x: 150 + objectsCount.value * 30, y: 120 },
    'window'
  );
  lastAction.value = `Добавлено окно с ID: ${windowId}`;
};

const addDoor = () => {
  const doorId = addObject(
    { x: 180 + objectsCount.value * 30, y: 180 },
    'door'
  );
  lastAction.value = `Добавлена дверь с ID: ${doorId}`;
};

const exportImage = () => {
  const imageData = exportToImage();
  if (imageData) {
    const link = document.createElement('a');
    link.download = `constructor-export-${Date.now()}.png`;
    link.href = imageData;
    link.click();
    lastAction.value = 'Изображение экспортировано';
  } else {
    lastAction.value = 'Ошибка экспорта изображения';
  }
};

const resetView = () => {
  resetView();
  lastAction.value = 'Вид сброшен к начальному состоянию';
};

const zoomIn = () => {
  zoomInFacade();
  lastAction.value = 'Масштаб увеличен';
};

const zoomOut = () => {
  zoomOutFacade();
  lastAction.value = 'Масштаб уменьшен';
};

const getAllRooms = () => {
  const rooms = getAllRooms();
  console.log('Все комнаты:', rooms);
  lastAction.value = `Найдено комнат: ${rooms.length}`;
};

const getAllWalls = () => {
  const walls = getAllWalls();
  console.log('Все стены:', walls);
  lastAction.value = `Найдено стен: ${walls.length}`;
};

const getAllObjects = () => {
  const objects = getAllObjects();
  console.log('Все объекты:', objects);
  lastAction.value = `Найдено объектов: ${objects.length}`;
};
</script>

<style scoped>
.constructor-demo {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
  color: #343a40;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-active {
  color: #28a745;
  font-weight: bold;
}

.status-inactive {
  color: #dc3545;
  font-weight: bold;
}

.main-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.canvas-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.canvas-container {
  flex: 1;
  position: relative;
  border: 1px solid #dee2e6;
  background: #ffffff;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.controls-section {
  width: 300px;
  padding: 20px;
  background: #f8f9fa;
  border-left: 1px solid #dee2e6;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 24px;
}

.control-group h3 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.btn {
  display: block;
  width: 100%;
  padding: 10px 16px;
  margin-bottom: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
  border-color: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
  border-color: #1e7e34;
}

.info-section {
  padding: 16px 20px;
  background: #e9ecef;
  border-top: 1px solid #dee2e6;
}

.info-section h3 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 16px;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.info-content p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.action-feedback {
  padding: 12px 20px;
  background: #d4edda;
  border-top: 1px solid #c3e6cb;
  color: #155724;
  font-size: 14px;
}

.action-feedback p {
  margin: 0;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .controls-section {
    width: 100%;
    max-height: 200px;
  }
  
  .info-content {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
