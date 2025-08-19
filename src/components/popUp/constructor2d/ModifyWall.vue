<script setup lang="ts">
//@ts-nocheck
import { 
  ref,
  onMounted,
  onUnmounted
} from 'vue'

import { useEventBus } from '@/store/constructor2d/useEventBus';
import { Events } from "@/store/constructor2d/events";
import { Vector2 } from "@/types/constructor2d/interfaсes";

interface IDataForm{
  width: number;
  height: number;
  position: Vector2;
};

const eventBus = useEventBus();

const isVisible = ref(false); // По умолчанию блок скрыт

// Создаем реактивные переменные для хранения значений из input
const wallWidth = ref(30);
const wallHeight = ref(30);

// Реактивные переменные для позиции
const position = ref({
  top: '30px',
  left: '30px',
});

const handlerModifyWall = (): void => {

  // отправляем событие с новыми размерами стены
  eventBus.emit(Events.C2D_MODIFY_WALL, {
    width: wallWidth.value,
    height: wallHeight.value,
  });
  
};

const handlerRemoveWall = (): void => {

  // отправляем событие на удаление стены
  eventBus.emit(Events.C2D_REMOVE_WALL);

};

// Функция для обновления значений в форме
const update = (data: IDataForm): void => {
  
  wallWidth.value = data.width;
  wallHeight.value = data.height;

  // Устанавливаем позицию, если она передана в data
  if (data.position) {
    position.value = {
      // top: `${data.position.y+70}px`,
      // left: `${data.position.x+70}px`,
      bottom: '10px',
      left: '40px'
    };
  }

};

// Методы для управления видимостью
const show = (data: IDataForm): void => {
  update(data);
  isVisible.value = true;
};

const hide = (): void => {
  isVisible.value = false;
};

// Подписка на события
onMounted(() => {
  eventBus.on(Events.C2D_SHOW_FORM_MODIFY_WALL, show);
  eventBus.on(Events.C2D_HIDE_FORM_MODIFY_WALL, hide);
  eventBus.on(Events.C2D_UPDATE_FORM_MODIFY_WALL, update);
});

onUnmounted(() => {
  eventBus.off(Events.C2D_SHOW_FORM_MODIFY_WALL, show);
  eventBus.off(Events.C2D_HIDE_FORM_MODIFY_WALL, hide);
  eventBus.off(Events.C2D_UPDATE_FORM_MODIFY_WALL, update);
});

</script>

<!-- <template>
  <div id="c2dModifyWall" 
    :class="{ 'd-none': !isVisible }"
    :style="{ top: position.top, left: position.left }"
    >
    <div class="c2dModifyWall-buttons">
      <div class="remove" @click="handlerRemoveWall">Удалить</div>
    </div>
    <div>
      <input type="number" v-model="wallWidth" min="200" max="100000" id="wall_width">
      <input type="number" v-model="wallHeight" min="200" max="900" id="wall_height">
      <button @click="handlerModifyWall">ok</button>
    </div>
  </div>
</template> -->

<template>
  <div id="c2dModifyWall" 
    :class="{ 'd-none': !isVisible }"
    :style="{ bottom: position.bottom, left: position.left }"
    >
    <div class="c2dModifyWall-buttons">
      <div class="remove" @click="handlerRemoveWall">Удалить</div>
    </div>
    <div>
      <input type="number" v-model="wallWidth" min="200" max="100000" id="wall_width">
      <input type="number" v-model="wallHeight" min="200" max="900" id="wall_height">
      <button @click="handlerModifyWall">ok</button>
    </div>
  </div>
</template>


<style lang="scss" scoped>

#c2dModifyWall{
  display: flex;
  overflow: hidden;
  width: auto;
  height: auto;
  background-color: #FFFFFF;
  color: #212121;
  position: absolute;
  padding: 10px;
  border: 1px solid #444444;

  .c2dModifyWall-buttons{

    div:hover{
      cursor: pointer;
      background-color: #f1f1f1;
      font-weight: bold;
    }

    margin-right: 10px;

  }

  input {
    width: 100px;
    border: 1px solid #cccccc;
    margin-right: 5px;
  }

  button {
    padding: 0 20px;
  }

  &.d-none {
    display: none;
  }

}

</style>