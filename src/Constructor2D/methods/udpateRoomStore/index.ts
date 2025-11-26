//@ts-nocheck 

import { MathUtils } from "three";
import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";
import { useRoomState } from "@/store/appliction/useRoomState";
import { useEventBus } from "@/store/appliction/useEventBus";

import {
  IRoom,
  IWallData,
  IContentItem
} from "@/types/interfases";

import {
  ObjectWall,
  IC2DRoom
} from "./../../Layers/Planner/interfaces";

import {
  IDrawObjects
} from "./../../Layers/DoorsAndWindows/interfaces";

import {
  getCenterOfPoints
} from "@/Constructor2D/utils/Math/index";

function updateRoomStore(this: any): boolean {
  const normalizeId = (value: string | number | null | undefined) => value !== undefined && value !== null ? String(value) : '';
  const eventBus = useEventBus()
  const roomState = useRoomState()
  console.log('BEFORE: ', roomState.rooms)
  const roomStore = useSchemeTransition();
  roomStore.clearStore(); // очищаем хранилище
  console.log('AFTER: ', roomState.rooms)

  const rooms: IRoom[] = [];

  // Получаем список ID объектов из 2D (двери и окна) для фильтрации
  const idObjectsFrom2D = this.IDObjects?.map((item: { id: string | number; name: string }) => item.id) || [];
  const idToFilter = [166755, ...idObjectsFrom2D]; // перегородки + двери/окна

  (this.layers.planner.allRooms).forEach((roomData: IC2DRoom) => {
    const normalizedRoomId = normalizeId(roomData.id);
    // Находим существующую комнату в roomState для сохранения content и basket
    const existingRoom = roomState.rooms.find((r: IRoom) => normalizeId(r.id) === normalizedRoomId);

    // Сохраняем существующий content из 3D сцены, исключая элементы из 2D (перегородки, двери, окна)
    let preservedContent: IContentItem[] = [];
    if (existingRoom?.content) {
      try {
        const contentArray = Array.isArray(existingRoom.content) 
          ? existingRoom.content 
          : (typeof existingRoom.content === 'string' ? JSON.parse(existingRoom.content) : []);
        
        // Фильтруем только предметы из 3D сцены, исключая элементы из 2D
        // Сравниваем ID с учетом разных типов (string и number)
        preservedContent = contentArray.filter((item: any) => {
          if (!item || !item.id) return false;
          const itemId = item.id;
          // Проверяем, не входит ли ID в список элементов из 2D
          return !idToFilter.some(filterId => String(filterId) === String(itemId));
        });
      } catch (error) {
        console.warn('Ошибка при парсинге content комнаты:', error);
        preservedContent = [];
      }
    }

    const room: IRoom = {
      id: normalizedRoomId, /** ID комнаты */
      label: roomData.label, /** Лейбл */
      description: roomData.description, /** Описание */
      params: {
        walls: [],
        // Сохраняем существующие значения wall и floor, если они есть
        wall: existingRoom?.params?.wall ?? '44144',
        floor: existingRoom?.params?.floor ?? '44020'
      },
      // Начинаем с сохраненного content из 3D сцены
      content: preservedContent,
      // Сохраняем существующий basket из roomState, если он есть
      basket: existingRoom?.basket
    };

    // 1. довляем стены и перегородки
    this.layers.planner.objectWalls.forEach((wallData: ObjectWall) => {
      if (wallData.roomId && normalizeId(wallData.roomId) === normalizedRoomId) {


        if (wallData.name === 'dividing_wall') { // если перегородка

          // const centerWall = getCenterOfPoints(wallData.points);
          const centerWall = getCenterOfPoints([wallData.points[0], wallData.points[1]]);

          const wData: IContentItem = {
            id: 166755,
            uuid: String(wallData.id),
            position: {
              x: centerWall.x * 10,
              y: (300 * 10) / 2,
              z: centerWall.y * 10
            },
            rotation: {
              isEuler: true,
              _x: 0,
              _y: MathUtils.degToRad(-wallData.angleDegrees),
              _z: 0,
              _order: "XYZ"
            },
            size: {
              width: wallData.width * 10,
              height: 300 * 10,
              depth: wallData.height * 10
            }
          };

          room.content?.push(wData);

        } else { // если стена

          const centerWall = getCenterOfPoints([wallData.points[0], wallData.points[1]]);

          const wData: IWallData = {
            id: normalizeId(wallData.id),
            width: wallData.width * 10,
            height: 300 * 10,
            depth: wallData.height * 10,
            position: {
              x: centerWall.x * 10,
              y: (300 * 10) / 2,
              z: centerWall.y * 10
            },
            rotation: {
              isEuler: true,
              _x: 0,
              _y: MathUtils.degToRad(-wallData.angleDegrees),
              _z: 0,
              _order: "XYZ"
            },
            side: 0
          };

          room.params!.walls.push(wData);

        }

      }
    });

    // 2. добавляем окна, двери и другие объекты
    this.layers.doorsAndWindows.drawObjects.forEach((objData: IDrawObjects) => {
      if (
        objData.roomId && normalizeId(objData.roomId) === normalizedRoomId
      ) {

        const IDObjects: number | string | null = this.IDObjects.find((item: { id: string | number; name: string; }) => item.name === objData.name)?.id ?? null;

        if (IDObjects === null) {
          console.warn(`Object with name ${objData.name} not found in IDObjects`);
          return;
        }

        const centerWall = getCenterOfPoints(
          (objData.name === 'door' || objData.name === 'window')
            ? [objData.points[0], objData.points[1]]
            : objData.points);

        const obj: IContentItem = {
          // id объекта для 3D сцены
          id: IDObjects, // Заметка: убрать "?? 0"
          position: {
            x: centerWall.x * 10,
            y: (
              (objData.name === 'door')
                ? 0
                : (
                  objData.name === 'window'
                    ? 1500
                    : (300 * 10) / 2
                )
            ),
            z: centerWall.y * 10
          },
          rotation: {
            isEuler: true,
            _x: 0,
            _y: MathUtils.degToRad(-objData.angleDegrees),
            _z: 0,
            _order: "XYZ"
          }
        };

        if (objData.name === "door" || objData.name === 'window') {

          obj.size = {
            width: objData.width * 10,
            height: 0,
            depth: objData.height * 10
          };

        }

        room.content?.push(obj);

      }
    });

    rooms.push(room);

    // console.log("rooms", rooms);

  });
  roomStore.setAppData(rooms);
  // Сразу синхронизируем стор комнат, чтобы 3D получил актуальные id/контент
  roomState.rooms = rooms;
  
  // console.log('Data room store:', roomStore.getAllData());
  console.log('AFTER AFTER: ', roomState.rooms)
  console.log("2D CANVAS STORE: ", roomStore.getAllData())
  return true;

}

export {
  updateRoomStore
};
