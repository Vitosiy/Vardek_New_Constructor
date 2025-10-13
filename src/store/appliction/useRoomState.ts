
// @ts-nocheck

import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import { rooms_mok } from "@/Application/F-mockapi"
import { useSchemeTransition } from '../canvasMerge/schemeTransition';
import { useAppData } from "@/store/appliction/useAppData";
import { useModelState } from '../appliction/useModelState';
import { useSceneState } from './useSceneState';

import * as THREEInterfases from "../../types/interfases"
import { TFasadeItem } from "@/types/types";

export type TempRoomParamsKey = 'wall' | 'floor';
export type TRoutPath = '/3d' | '/2d';

export const useRoomState = defineStore('RoomState', () => {

  const schemeTransition = useSchemeTransition();
  const sceneState = useSceneState();
  const roomsData = JSON.parse(JSON.stringify(schemeTransition.getSchemeTransitionData));
  const rooms = ref<THREEInterfases.IRoom[]>(roomsData || []);

  const APP = useAppData();
  const modelState = useModelState()

  const currentRoomId = ref<number | null>(null);
  const tempRoomSize = ref<THREEInterfases.IWallSizes | null>(null);
  const updatedRoomContent = ref<THREEInterfases.IContentItem[] | null>([])

  const convertDataTo3DConstuctor = () => {
    // console.log('3D', schemeTransition.getSchemeTransitionData)
    const data = toRaw(schemeTransition.getSchemeTransitionData)

    // console.log(data, 'clone')

    // const clone = data.map(item => {
    //   return item
    // })


    // const parseData = clone.map(elem => {

    //   const content = JSON.stringify(elem.content)
    //   return {
    //     ...elem,
    //     content: content
    //   }
    // })
    // rooms.value = parseData
    rooms.value = data
  }

  const convertDataTo2DConstuctor = () => {
    // const clone = rooms.value.map(item => {
    //   return item
    // })

    // const parseData = clone.map(elem => {
    //   const content = typeof elem.content === 'string' ? JSON.parse(elem.content) : elem.content
    //   return {
    //     ...elem,
    //     content: content
    //   }
    // })
    // schemeTransition.setAppData(parseData)

    schemeTransition.setAppData(rooms.value)
  }

  const converActions = {
    '/2d': () => convertDataTo2DConstuctor(),
    '/3d': () => convertDataTo3DConstuctor()
  }

  const routConvertData = (value: TRoutPath) => {
    converActions[value]()
  }

  const addRoom = (room: THREEInterfases.IRoom) => {
    rooms.value.push(room);
  };

  const updateRoom = (id: number, content: THREEInterfases.IContentItem[], params: THREEInterfases.IWallSizes) => {
    const room = rooms.value.find(room => room.id === id);

    if (room) {
      room.content = content;
      room.params = params;

      return
    }

  };

  const removeRoom = (id: number) => {
    rooms.value = rooms.value.filter(room => room.id !== id);
    if (rooms.value.length == 0) {
      clearCurrentRoomId()
    }

    /** Обновляем общий стор */
    sceneState.updateProjectParams({ rooms: rooms.value })

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

  const tempRoomUpdate = (value: number | string, type: TempRoomParamsKey) => {
    if (tempRoomSize.value) {
      tempRoomSize.value[type] = value
    }
  }

  //------------------------------------------------------------------------------------------

  const getCurrentRoomParams = computed(() => {
    return tempRoomSize.value
  });

  /** Возвращаем с использованием ID комнаты */
  const getCurrentRoomData = (roomId) => {
    let centerized = schemeTransition.getRoomDataFor3DScene(roomId);
    console.log(centerized, 'centerized')


    const currentRoom = rooms.value.find(value => value.id === roomId)

    if (centerized) {
      currentRoom.params = centerized?.params ?? currentRoom?.params;
      currentRoom.content = centerized?.content ?? currentRoom?.content;
    }

    return rooms.value.find(value => value.id === roomId)
  }

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

  return {
    rooms,
    getRooms,
    addRoom,
    updateRoom,
    removeRoom,
    getRoomId,


    setCurrentRoomId,
    clearCurrentRoomId,

    setCurrentRoomParams,
    getCurrentRoomParams,
    clearTempRoomSize,
    tempRoomUpdate,

    updatedRoomContent,
    getRoomContent,

    getCurrentRoomData,

    convertDataTo3DConstuctor,
    convertDataTo2DConstuctor,
    routConvertData
  };
});