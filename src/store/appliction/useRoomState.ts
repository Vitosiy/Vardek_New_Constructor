
// @ts-nocheck

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { rooms_mok } from "@/Application/F-mockapi"
import { useSchemeTransition } from '../canvasMerge/schemeTransition';
import { useAppData } from "@/store/appliction/useAppData";
import { useModelState } from '../appliction/useModelState';


import * as THREEInterfases from "../../types/interfases"
import { TFasadeItem } from "@/types/types";



export const useRoomState = defineStore('RoomState', () => {

  //   const rooms = ref<THREEInterfases.IRoom[]>(rooms_mok || []);

  const roomsStore = useSchemeTransition();
  const roomsData = JSON.parse(JSON.stringify(roomsStore.getSchemeTransitionData.concat(rooms_mok)));
  const rooms = ref<THREEInterfases.IRoom[]>(roomsData || []);

  const APP = useAppData();
  const modelState = useModelState()

  const currentRoomId = ref<number | null>(null);
  const tempRoomSize = ref<THREEInterfases.IWallSizes | null>(null);
  const updatedRoomContent = ref<THREEInterfases.IContentItem[] | null>([])

  const addRoom = (room: THREEInterfases.IRoom) => {
    rooms.value.push(room);
  };

  const updateRoom = (id: number, content: THREEInterfases.IContentItem[], params: THREEInterfases.IWallSizes) => {
    const room = rooms.value.find(room => room.id === id);

    if (room) {
      room.content = content;
      room.params = params;
    }

  };

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

  const getCurrentRoomParams = computed(() => {
    return tempRoomSize.value
  });

  const getCurrentRoomData = (roomId) => {
    let centerized = roomsStore.getRoomDataFor3DScene(roomId);
    const currentRoom = rooms.value.find(value => value.id === roomId)

    if (centerized) {
      currentRoom.params = centerized?.params ?? currentRoom?.params;
    }

    return rooms.value.find(value => value.id === roomId)
  }

  const getCurrentRoomId = computed(() => {

    let centerized = roomsStore.getRoomDataFor3DScene(currentRoomId.value);

    const currentRoom = rooms.value.find(value => value.id === currentRoomId.value)

    if (centerized) {
      currentRoom.params = centerized?.params ?? currentRoom?.params;
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

  const apllyProjectWall = (value) => {
    rooms.value.forEach((room) => {
      room.params.wall = value;
    });
  }

  const apllyProjectFloor = (value) => {
    rooms.value.forEach((room) => {
      room.params.floor = value;
    });
  }


  const getWallsTextures = () => {
    return useAppData().getAppData.WALL

  }

  const getFloorTextures = () => {
    return useAppData().getAppData.FLOOR
  }

  const getDefaultModuleData = () => {
    const colorMap: Record<number, TFasadeItem> = {};
    const PRODUCTS = APP.getAppData.CATALOG.PRODUCTS
    const FASADE = APP.getAppData.FASADE;

    for (const el in PRODUCTS) {
      const product = PRODUCTS[el];


      if (Array.isArray(product.MODULECOLOR) && product.MODULECOLOR[0] != null) {
        product.MODULECOLOR.forEach(color => {
          if (FASADE[color] !== undefined && colorMap[color] === undefined) {
            colorMap[color] = FASADE[color] as TFasadeItem;
          }
        });
      }

    }

    return colorMap
  }

  const getDefaultFasadeData = () => {
    const PRODUCTS = APP.getAppData.CATALOG.PRODUCTS
    const [key, value] = Object.entries(PRODUCTS)[0]
    const fasade = value.FACADE
    const defaultFasadData = modelState.createCurrentModelFasadesData(fasade, true)
    return defaultFasadData

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

    getCurrentRoomData,

    apllyProjectWall,
    apllyProjectFloor,

    getDefaultModuleData,
    getDefaultFasadeData

  };
});