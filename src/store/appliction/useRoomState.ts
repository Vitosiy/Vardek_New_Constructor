// @ts-nocheck 31

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { rooms_mok } from "@/Application/F-mockapi"

import * as THREEInterfases from "../../types/interfases"



export const useRoomState = defineStore('RoomState', () => {

  const rooms = ref<THREEInterfases.IRoom[]>(rooms_mok || [] );
  const currentRoomId = ref<number | null>(null);
  const tempRoomSize = ref<THREEInterfases.IWallSizes | null>(null);
  const updatedRoomContent = ref<THREEInterfases.IContentItem[] | null>([])


  const addRoom = (room: THREEInterfases.IRoom) => {
    rooms.value.push(room);
  };

  const updateRoom = (id: number, content: THREEInterfases.IContentItem[], size: THREEInterfases.IWallSizes) => {
    const room = rooms.value.find(room => room.id === id);

    if (room) {
      room.content = content;
      room.size = size;
    }

  };

  const updateRoomSize = (id: number, size: THREEInterfases.IWallSizes) => {
    const room = rooms.value.find(room => room.id === id);
    if (room) {
      room.size = size;
    }
  }

  const removeRoom = (id: number) => {
    rooms.value = rooms.value.filter(room => room.id !== id);
  };

  const setCurrentRoomId = (id: number) => {
    currentRoomId.value = id;
  };

  const clearCurrentRoomId = () => {
    currentRoomId.value = null;
  };

  const setCurrentRoomSize = (value: THREEInterfases.IWallSizes) => {
    tempRoomSize.value = value
  }

  const clearTempRoomSize = () => {
    tempRoomSize.value = null
  }

  const setWallTexture = (value: number | string) => {
    if (tempRoomSize.value) {
      tempRoomSize.value.wall = value
    }
  }

  const setFloorTexture = (value: number | string) => {
    if (tempRoomSize.value) {
      tempRoomSize.value.floor = value
    }
  }

  //------------------------------------------------------------------------------------------

  const getCurrentRoomSize = computed(() => {
    return tempRoomSize.value
  });

  const getCurrentRoomId = computed(() => {
    return rooms.value.find(value => value.id === currentRoomId.value)
  });

  const getRoomId = computed(() => {
    return currentRoomId.value
  });

  const getUpdatedRoomContent = computed(() => {
    return updatedRoomContent.value
  })

  const getRooms = computed(() => {
    return rooms.value
  })


  return {
    rooms,
    getRooms,
    addRoom,
    updateRoom,
    removeRoom,
    getRoomId,
    updateRoomSize,

    setCurrentRoomId,
    getCurrentRoomId,
    clearCurrentRoomId,

    setCurrentRoomSize,
    getCurrentRoomSize,
    clearTempRoomSize,

    updatedRoomContent,
    getUpdatedRoomContent,

    setWallTexture,
    setFloorTexture

  };
});