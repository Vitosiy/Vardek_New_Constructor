import { MathUtils } from "three";
import { defineStore } from 'pinia';
import { computed, ref, reactive } from 'vue';
// import { APP } from '@/Application/F-sources';

import {
	getCenterOfPoints
} from "@/Constructor2D/utils/Math/index";

export const useSchemeTransition = defineStore('SchemeTransition', () => {

	const SchemeTransitionData = ref<{ [key: string]: any }[]>([

		{
			id: "room_001", //MathUtils.generateUUID(), /** ID комнаты */
			label: "Новая комната", /** Лейбл */
			description: "Новая комната", /** Описание */
			size: reactive({
				/** Данные для форпмирования стен комнат */
				// walls: [
				//     {
				//         "width": 6990.257505978436,
				//         "height": 3000,
				//         "position": {
				//             "x": -1992.213638056436,
				//             "y": 1500,
				//             "z": 6.677933000282188
				//         },
				//         "rotation": {
				//             "isEuler": true,
				//             "_x": 0,
				//             "_y": 1.5707963267948966,
				//             "_z": 0,
				//             "_order": "XYZ"
				//         },
				//         "side": 0
				//     },
				//     {
				//         "width": 3976.6504012986466,
				//         "height": 3000,
				//         "position": {
				//             "x": -3.8884374071124217,
				//             "y": 1500,
				//             "z": -3488.4508199889357
				//         },
				//         "rotation": {
				//             "isEuler": true,
				//             "_x": 0,
				//             "_y": 0,
				//             "_z": 0,
				//             "_order": "XYZ"
				//         },
				//         "side": 0
				//     },
				//     {
				//         "width": 6986.963634188191,
				//         "height": 3000,
				//         "position": {
				//             "x": 1984.436763242211,
				//             "y": 1500,
				//             "z": 5.030997105159862
				//         },
				//         "rotation": {
				//             "isEuler": true,
				//             "_x": 0,
				//             "_y": -1.5707963267948966,
				//             "_z": 0,
				//             "_order": "XYZ"
				//         },
				//         "side": 0
				//     },
				//     {
				//         "width": 3976.651765460494,
				//         "height": 3000,
				//         "position": {
				//             "x": -3.8884374071124217,
				//             "y": 1500,
				//             "z": 3500.1597500943777
				//         },
				//         "rotation": {
				//             "isEuler": true,
				//             "_x": 0,
				//             "_y": -3.140764350695509,
				//             "_z": 0,
				//             "_order": "XYZ"
				//         },
				//         "side": 0
				//     }
				// ],
				/*
				walls: [
					{
							"id": "wall_vertical__d9fad3eb-b7cc-4094-b0fb-00a72511b6a1",
							"width": 3234.1804574739404,
							"height": 3000,
							"position": {
									"x": 1306.03515625,
									"y": 1500,
									"z": 4839.21875
							},
							"rotation": {
									"isEuler": true,
									"_x": 0,
									"_y": 1.5249441714330672,
									"_z": 0,
									"_order": "XYZ"
							},
							"side": 0
					},
					{
							"id": "wall__a6e58d91-79d2-42d2-8b27-7fa5a7248f23",
							"width": 1506.104633582064,
							"height": 3000,
							"position": {
									"x": 2133.18359375,
									"y": 1500,
									"z": 3229.9609375
							},
							"rotation": {
									"isEuler": true,
									"_x": 0,
									"_y": -0.008144029514458645,
									"_z": 0,
									"_order": "XYZ"
							},
							"side": 0
					},
					{
							"id": "wall_vertical__782ddff3-8033-48bc-a7ba-a73cfb69617e",
							"width": 1830.724074319094,
							"height": 3000,
							"position": {
									"x": 3175.5859375,
									"y": 1500,
									"z": 2367.67578125
							},
							"rotation": {
									"isEuler": true,
									"_x": 0,
									"_y": 1.2491469835581261,
									"_z": 0,
									"_order": "XYZ"
							},
							"side": 0
					},
					{
							"id": "wall__be7c8066-63a4-453a-a15c-ce6df02bcfaf",
							"width": 1966.1290407412712,
							"height": 3000,
							"position": {
									"x": 4427.0703125,
									"y": 1500,
									"z": 1701.15234375
							},
							"rotation": {
									"isEuler": true,
									"_x": 0,
									"_y": -0.20684442276034878,
									"_z": 0,
									"_order": "XYZ"
							},
							"side": 0
					},
					{
							"id": "wall_vertical__420f7d63-2b3e-4bda-808d-e7795d843b8c",
							"width": 3872.5689342414116,
							"height": 3000,
							"position": {
									"x": 5874.58984375,
									"y": 1500,
									"z": 3777.5
							},
							"rotation": {
									"isEuler": true,
									"_x": 0,
									"_y": -1.317401774915874,
									"_z": 0,
									"_order": "XYZ"
							},
							"side": 0
					},
					{
							"id": "wall__0f011272-6bb8-4dc8-b438-ccc00ee3cd8f",
							"width": 5190.522366587906,
							"height": 3000,
							"position": {
									"x": 3795.95703125,
									"y": 1500,
									"z": 6053.28125
							},
							"rotation": {
									"isEuler": true,
									"_x": 0,
									"_y": -2.9863307889906676,
									"_z": 0,
									"_order": "XYZ"
							},
							"side": 0
					}
				],
				*/
				walls: [],
				wall: '44144',
				floor: '44020'
			}),
			content: [
			],
			// content: { /** Наполняемый контетн из 2D редактора (объёмные стены / переферия) */
			// 	'2d': [

			// 	],
			// 	'3d': [

			// 	]
			// },
		},

	]);

	const setAppData = (value: any) => {
		SchemeTransitionData.value = value
		console.log(SchemeTransitionData.value);
	};

	// добавление / обновление стены
	const setWall = (data: any) => {
		/*
		data.idRoom = string | number;
		data.wall = {}
		*/
		const room = SchemeTransitionData.value.find((item: any) => item.id === data.idRoom);

		if (!room) return;

		const indexWall = room.size.walls.findIndex((item: any) => item.id === data.wall.id);

		// // центр стены
		// const centerWall = data.wall.points.reduce((acc: any, point: any) => {
		// 	acc.x += point.x;
		// 	acc.y += point.y;
		// 	acc.z += point.z;
		// 	return acc;
		// }, { x: 0, y: 0, z: 0 });

		// centerWall.x /= data.wall.points.length;
		// centerWall.y /= data.wall.points.length;
		// centerWall.z /= data.wall.points.length;

		const centerWall = getCenterOfPoints([data.wall.points[0], data.wall.points[1]]);

		const wData = {
			id: data.wall.id,
			width: data.wall.width * 10,
			height: 300 * 10,
			position: {
				x: centerWall.x * 10,
				y: ( 300 * 10 ) / 2,
				z: centerWall.y * 10
			},
			rotation: {
				isEuler: true,
				_x: MathUtils.degToRad(0),
				_y: MathUtils.degToRad(-data.wall.angleDegrees),
				_z: MathUtils.degToRad(0),
				_order: "XYZ"
			},
			side: 0
		}

		if (indexWall == -1) {
			if(data.wall.mergeWalls.wallPoint0){
				const indexMergeWall = room.size.walls.findIndex((el: any) => el.id === data.wall.mergeWalls.wallPoint0);
				if(indexMergeWall != -1){
					room.size.walls.splice(indexMergeWall, 0, wData);
				}
			}else if(data.wall.mergeWalls.wallPoint1){
				const indexMergeWall = room.size.walls.findIndex((el: any) => el.id === data.wall.mergeWalls.wallPoint1);
				if(indexMergeWall != -1){
					room.size.walls.splice(indexMergeWall + 1, 0, wData);
				}
			}else {
				room.size.walls.push(wData);
			}
		} else {
			room.size.walls[indexWall] = wData;
		}

	};

	// удаление стены
	const removeWall = (data: any) => {
		/*
		data.idRoom = string | number;
		data.idWall = string | number;
		*/
		const room = SchemeTransitionData.value.find((item: any) => item.id === data.idRoom);

		if (!room) return;

		const indexWall = room.size.walls.findIndex((item: any) => item.id === data.idWall);

		if (indexWall >= 0) {
			room.size.walls.splice(indexWall, 1);
		}

	};

	const getRoomDataFor3DScene = (idRoom: string | number): any => {
		const data = SchemeTransitionData.value.find((item: any) => item.id === idRoom);

		if (!data) return;

		const roomData = JSON.parse(JSON.stringify(data));

    if (!roomData.size || !roomData.size.walls) return roomData;

    // Работаем с копией стен
    const walls = roomData.size.walls;

		// // определить центр масс всех стен
		// const center = walls.reduce((acc: any, wall: any) => {
		// 	acc.x += wall.position.x;
		// 	acc.y += wall.position.y;
		// 	acc.z += wall.position.z;
		// 	return acc;
		// }, { x: 0, y: 0, z: 0 });

		// center.x /= walls.length;
		// center.y /= walls.length;
		// center.z /= walls.length;

		// // сместить центр масс в центр координат (0, 0, 0) вместе со стенами
		// walls.forEach((wall: any) => {
		// 	wall.position.x -= center.x;
		// 	wall.position.y = 1500;
		// 	wall.position.z -= center.z;
		// });

		roomData.size.walls = walls; /// <<<< ТУТ ОШИБКА!!!! данные не меняются. Где ошибка ?

		console.log('>>>>>>>>> run getRoomDataFor3DScene')
		
		return roomData;
	};

	const getSchemeTransitionData = computed(() => {
		return SchemeTransitionData.value
	})

	const getWalls = computed(() => {
		return SchemeTransitionData.value[0].size.walls
	});

	const getRoomById = computed(() => {
		return (id: string | number) => {
			return SchemeTransitionData.value.find((item: any) => item.id === id);
		}
	});

	return {
		SchemeTransitionData,
		getSchemeTransitionData,
		getRoomDataFor3DScene,
		setAppData,
		getWalls,
		getRoomById,

		setWall,
		removeWall
	};

});
