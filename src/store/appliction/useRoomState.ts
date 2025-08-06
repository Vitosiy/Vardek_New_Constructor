
// @ts-nocheck

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { rooms_mok } from "@/Application/F-mockapi"
import { useSchemeTransition } from '../canvasMerge/schemeTransition';
import { useAppData } from "@/store/appliction/useAppData";

import * as THREEInterfases from "../../types/interfases"



export const useRoomState = defineStore('RoomState', () => {

  //   const rooms = ref<THREEInterfases.IRoom[]>(rooms_mok || []);

  const roomsStore = useSchemeTransition();
  let roomsData = JSON.parse(JSON.stringify(roomsStore.getSchemeTransitionData.concat(rooms_mok)));
  const rooms = ref<THREEInterfases.IRoom[]>(roomsData || []);

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

  // const updateRoomSize = (id: number, size: THREEInterfases.IWallSizes) => {
  //   const room = rooms.value.find(room => room.id === id);
  //   if (room) {
  //     room.size = size;
  //   }
  // }

  const removeRoom = (id: number) => {
    rooms.value = rooms.value.filter(room => room.id !== id);
    if (rooms.value.length == 0) {
      clearCurrentRoomId()
    }
  };

  const setCurrentRoomId = (id: number) => {
    currentRoomId.value = id;
  };

  const clearCurrentRoomId = () => {
    currentRoomId.value = null;
  };

  const setCurrentRoomParams = (value: THREEInterfases.IWallSizes) => {
    tempRoomSize.value = value
  }

  const clearTempRoomSize = () => {
    tempRoomSize.value = null
  }

  const setWallTexture = (value: number | string) => {

    // const room = rooms.value.find(room => room.id === currentRoomId.value);

    if (tempRoomSize.value) {
      tempRoomSize.value.wall = value

      // console.log(tempRoomSize.value, rooms.value, 'setWallTexture')
    }

    // if (room) {
    //   room.size.wall = value
    // }
  }

  const setFloorTexture = (value: number | string) => {
    // const room = rooms.value.find(room => room.id === currentRoomId.value);
    if (tempRoomSize.value) {
      tempRoomSize.value.floor = value

      // console.log(tempRoomSize.value, rooms.value, 'setFloorTexture')
    }

    // if (room) {
    //   room.size.floor = value
    // }
  }

  //------------------------------------------------------------------------------------------

  const getCurrentRoomParams = computed(() => {
    return tempRoomSize.value
  });

  const getCurrentRoomData = (roomId) => {
    let centerized = roomsStore.getRoomDataFor3DScene(roomId);
    const currentRoom = rooms.value.find(value => value.id === roomId)
    if (centerized) {
      currentRoom.size = centerized?.size ?? currentRoom?.size;
    }

    return rooms.value.find(value => value.id === roomId)
  }


  const getCurrentRoomId = computed(() => {


    let centerized = roomsStore.getRoomDataFor3DScene(currentRoomId.value);

    const currentRoom = rooms.value.find(value => value.id === currentRoomId.value)

    if (centerized) {
      currentRoom.size = centerized?.size ?? currentRoom?.size;
    }

    return rooms.value.find(value => value.id === currentRoomId.value)
  });

  const getRoomId = computed(() => {
    return currentRoomId.value
  });

  const getRoomContent = computed(() => {
    const room = rooms.value.find(room => room.id === currentRoomId.value);
    if (room) {
      return room.content
    }
    return []
  })

  const getRooms = computed(() => {
    return rooms.value
  })

  const getWallsTextures = () => {
    return useAppData().getAppData.WALL
  }

  const getFloorTextures = () => {
    return useAppData().getAppData.FLOOR;
  }


  return {
    rooms,
    getRooms,
    addRoom,
    updateRoom,
    removeRoom,
    getRoomId,
    // updateRoomSize,

    setCurrentRoomId,
    getCurrentRoomId,
    clearCurrentRoomId,

    setCurrentRoomParams,
    getCurrentRoomParams,
    clearTempRoomSize,

    updatedRoomContent,
    getRoomContent,


    getWallsTextures,
    getFloorTextures,
    setWallTexture,
    setFloorTexture,

    getCurrentRoomData

  };
});