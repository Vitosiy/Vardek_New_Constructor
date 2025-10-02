<script setup lang="ts">
//@ts-nocheck
import { 
  ref,
  onMounted,
  onUnmounted,
  nextTick
} from 'vue'

import { useEventBus } from '@/store/constructor2d/useEventBus';
import { Events } from "@/store/constructor2d/events";
import { Vector2 } from "@/types/constructor2d/interfaсes";
import { label } from 'three/webgpu';

const eventBus = useEventBus();

const pupupBackgroundElement = ref(null);
const labelRoomElement = ref(null);

const roomId = ref<string | number>(''); // Для хранения ID комнаты

const isVisible = ref(false); // По умолчанию блок скрыт

const roomLabel = ref(''); // Для хранения названия комнаты

// Реактивные переменные для позиции
const position = ref({
  top: '30px',
  left: '30px',
});

// Методы для управления видимостью
const show = async (data: {value: string, roomId: string | number}): void => {
  roomLabel.value = data.value;
  roomId.value = data.roomId; // Сохраняем ID комнаты
  isVisible.value = true;

  await nextTick(); // Ждём обновления DOM
  
  if (labelRoomElement.value && pupupBackgroundElement.value) {
    const width = labelRoomElement.value.offsetWidth;
    const height = labelRoomElement.value.offsetHeight;

    position.value = {
      top: `${pupupBackgroundElement.value.offsetHeight / 2 - height / 2}px`,
      left: `${pupupBackgroundElement.value.offsetWidth / 2 - width / 2}px`,
    };
  } else {
    console.error('Elements not defined');
  }
};

const hide = (): void => {
  roomLabel.value = '';
  roomId.value = ''; // Очищаем ID комнаты
  isVisible.value = false;
};

const handlerSetLabelRoom = (): void => {
  // Отправляем событие с новым названием комнаты
  eventBus.emit(Events.C2D_SET_ROOM_LABEL, {
    label: roomLabel.value,
    roomId: roomId.value, // Передаем ID комнаты
  });
  hide();
};

onMounted(() => {
  eventBus.on(Events.C2D_SHOW_FORM_ROOM_LABEL, show);
  eventBus.on(Events.C2D_HIDE_FORM_ROOM_LABEL, hide);
});

onUnmounted(() => {
  eventBus.off(Events.C2D_SHOW_FORM_ROOM_LABEL, show);
  eventBus.off(Events.C2D_HIDE_FORM_ROOM_LABEL, hide);
});

</script>

<template>
  <div 
    class="c2d_popup_background" 
    ref="pupupBackgroundElement"
    :class="{ 'd-none': !isVisible }"
    >
    <div id="c2dFromLabelRoom" 
      ref="labelRoomElement"
      :style="{ top: position.top, left: position.left }"
      >
      <div>
        <p>Назовите комнату</p>
        <input type="text" v-model="roomLabel" id="room_label"><br>
        <button @click="handlerSetLabelRoom">Сохранить</button>
        <button @click="hide">Скрыть</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.c2d_popup_background{

  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(246, 245, 250, 0.7);
  user-select: none; /* Стандартное свойство */
  -webkit-user-select: none; /* Для Safari */
  -moz-user-select: none; /* Для Firefox */
  -ms-user-select: none; /* Для старых IE */

  * {
    user-select: none; /* Стандартное свойство */
    -webkit-user-select: none; /* Для Safari */
    -moz-user-select: none; /* Для Firefox */
    -ms-user-select: none; /* Для старых IE */
  }

  &.d-none {
    display: none;
  }

  #c2dFromLabelRoom{
    display: flex;
    overflow: hidden;
    width: auto;
    height: auto;
    background-color: #FFFFFF;
    color: #212121;
    position: absolute;
    padding: 10px;
    border: 1px solid #444444;

    input {
      width: 300px;
      border: 1px solid #cccccc;
      margin-right: 5px;
    }

    button {
      padding: 0 20px;
      margin: 10px;
    }

  }

}

</style>