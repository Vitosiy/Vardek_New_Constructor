import { MathUtils } from "three";
import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";

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

  const roomStore = useSchemeTransition();
  roomStore.clearStore(); // очищаем хранилище

  const rooms: IRoom[] = [];

  (this.layers.planner.allRooms).forEach((roomData: IC2DRoom) => {

    const room: IRoom = {
      id: roomData.id, /** ID комнаты */
      label: roomData.label, /** Лейбл */
      description: roomData.description, /** Описание */
      params: {
        walls: [],
        wall: '44144',
        floor: '44020'
      },
      content: [
      ],
    };

    // 1. довляем стены и перегородки
    this.layers.planner.objectWalls.forEach((wallData: ObjectWall) => {
      if (wallData.roomId && wallData.roomId === room.id) {


        if (wallData.name === 'dividing_wall') { // если перегородка

          // const centerWall = getCenterOfPoints(wallData.points);
          const centerWall = getCenterOfPoints([wallData.points[0], wallData.points[1]]);

          const wData: IContentItem = {
            id: 166755,
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
            id: wallData.id,
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
        objData.roomId && objData.roomId === room.id
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

  // console.log('Data room store:', roomStore.getAllData());

  return true;

}

export {
  updateRoomStore
};