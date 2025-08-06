import * as THREEInterfases from "../types/interfases"

// export const START_ROOM_DATA: THREEInterfases.IWallSizes = {
//     walls: [
//         {
//             "width": 6990.257505978436,
//             "height": 3000,
//             "position": {
//                 "x": -1992.213638056436,
//                 "y": 1500,
//                 "z": 6.677933000282188
//             },
//             "rotation": {
//                 "isEuler": true,
//                 "_x": 0,
//                 "_y": 1.5707963267948966,
//                 "_z": 0,
//                 "_order": "XYZ"
//             },
//             "side": 0
//         },
//         {
//             "width": 3976.6504012986466,
//             "height": 3000,
//             "position": {
//                 "x": -3.8884374071124217,
//                 "y": 1500,
//                 "z": -3488.4508199889357
//             },
//             "rotation": {
//                 "isEuler": true,
//                 "_x": 0,
//                 "_y": 0,
//                 "_z": 0,
//                 "_order": "XYZ"
//             },
//             "side": 0
//         },
//         {
//             "width": 6986.963634188191,
//             "height": 3000,
//             "position": {
//                 "x": 1984.436763242211,
//                 "y": 1500,
//                 "z": 5.030997105159862
//             },
//             "rotation": {
//                 "isEuler": true,
//                 "_x": 0,
//                 "_y": -1.5707963267948966,
//                 "_z": 0,
//                 "_order": "XYZ"
//             },
//             "side": 0
//         },
//         {
//             "width": 3976.651765460494,
//             "height": 3000,
//             "position": {
//                 "x": -3.8884374071124217,
//                 "y": 1500,
//                 "z": 3500.1597500943777
//             },
//             "rotation": {
//                 "isEuler": true,
//                 "_x": 0,
//                 "_y": -3.140764350695509,
//                 "_z": 0,
//                 "_order": "XYZ"
//             },
//             "side": 0
//         }
//     ],
//     floor: 44013,
//     wall: 44014,
// }

// export const CAMERA_DATA: THREEInterfases.ICameraData = {
//     position: [8 * 1000, 1.5 * 1000, 0],
//     target: { x: 0, y: 1500, z: 0 },
//     fov: 45,
//     near: 1,
//     far: 25000
// }

// export const ORTO_CAMERA_DATA: THREEInterfases.IOrtoCameraData = {
//     position: [0, 10, 0],
//     target: { x: 0, y: 0, z: 0 },
//     near: 0.01,
//     far: 100
// }

// export const START_LIGHTS_DATA: THREEInterfases.ILightsObjects = {

//     ambientLight: {
//         color: '#ffffff',
//         intensity: 1,
//     },

//     pointLight: {
//         color: '#ffffff',
//         normalBias: 0.05,
//         bias: 0.0001,
//         castShadow: false,
//         mapSize: 2048,
//         intensity: 1.5,
//         distance: 30000,
//         decay: 0
//     }
// }

// export const START_HEIGHT_CLAMP: number = 2000

export const START_PROJECT_PARAMS = {

    rooms: [{
        walls: [
            {
                "width": 6990.257505978436,
                "height": 3000,
                "position": {
                    "x": -1992.213638056436,
                    "y": 1500,
                    "z": 6.677933000282188
                },
                "rotation": {
                    "isEuler": true,
                    "_x": 0,
                    "_y": 1.5707963267948966,
                    "_z": 0,
                    "_order": "XYZ"
                },
                "side": 0
            },
            {
                "width": 3976.6504012986466,
                "height": 3000,
                "position": {
                    "x": -3.8884374071124217,
                    "y": 1500,
                    "z": -3488.4508199889357
                },
                "rotation": {
                    "isEuler": true,
                    "_x": 0,
                    "_y": 0,
                    "_z": 0,
                    "_order": "XYZ"
                },
                "side": 0
            },
            {
                "width": 6986.963634188191,
                "height": 3000,
                "position": {
                    "x": 1984.436763242211,
                    "y": 1500,
                    "z": 5.030997105159862
                },
                "rotation": {
                    "isEuler": true,
                    "_x": 0,
                    "_y": -1.5707963267948966,
                    "_z": 0,
                    "_order": "XYZ"
                },
                "side": 0
            },
            {
                "width": 3976.651765460494,
                "height": 3000,
                "position": {
                    "x": -3.8884374071124217,
                    "y": 1500,
                    "z": 3500.1597500943777
                },
                "rotation": {
                    "isEuler": true,
                    "_x": 0,
                    "_y": -3.140764350695509,
                    "_z": 0,
                    "_order": "XYZ"
                },
                "side": 0
            }
        ],
        floor: 44013,
        wall: 44128,
    },
    ],


    camera: {
        position: [8 * 1000, 1.5 * 1000, 0],
        target: { x: 0, y: 1500, z: 0 },
        fov: 45,
        near: 10,
        far: 25000
    },

    quality: [{
        lable: "Низкое",
        value: "low",
    },
    {
        lable: "Среднее",
        value: "medium",
    },
    {
        lable: "Высокое",
        value: "hight",
    }

    ],

    lights: {

        ambientLight: {
            color: '#ffffff',
            intensity: 1,
        },

        pointLight: {
            color: '#ffffff',
            normalBias: -0.02,
            bias: 0.0001,
            castShadow: false,
            mapSize: 2048,
            intensity: 1.5,
            distance: 30000,
            decay: 0
        }
    },

    height_clamp: 3000,

    table: {
        "material": {
            "type": "MeshLambertMaterial",
            "opt": {
                "color": 16777215
            }
        },
        "items": [
            {
                "id": "hor1",
                "type": "object",
                "geometry": {
                    "type": "ExtrudeGeometry",
                    "opt": {
                        "amount": "#X#",
                        "bevelEnabled": false,
                        "curveSegments": 4
                    },
                    "command": [
                        {
                            "type": "moveTo",
                            "opt": {
                                "x": "-(#Z#/2)",
                                "y": "-(#Y#/2)"
                            }
                        },
                        {
                            "type": "lineTo",
                            "opt": {
                                "x": "-(#Z#/2)",
                                "y": "(#Y#/2)"
                            }
                        },
                        {
                            "type": "absarc",
                            "opt": {
                                "aX": "(#Z#/2)-9",
                                "aY": "(#Y#/2)-9",
                                "aRadius": 9,
                                "aStartAngle": 1.5707963267948966,
                                "aEndAngle": 0,
                                "aClockwise": true
                            }
                        },
                        {
                            "type": "absarc",
                            "opt": {
                                "aX": "(#Z#/2)-9",
                                "aY": "-(#Y#/2)+9",
                                "aRadius": 9,
                                "aStartAngle": 0,
                                "aEndAngle": -1.5707963267948966,
                                "aClockwise": true
                            }
                        }
                    ]
                },
                "rotation": {
                    "x": 0,
                    "y": -1.5707963267948966,
                    "z": 0
                },
                "position": {
                    "x": "#X#/2",
                    "y": 0,
                    "z": 0
                }
            }
        ]
    },

    table_params: {
        "width": 3000,
        "depth": 600,
        "height": 38,
        "texture": {
            "src": "/upload/iblock/fe3/fe3ba18d6a53137de979f6b4f18ca631.jpg",
            "width": 128,
            "height": 128,
            "size": "1315"
        }
    },

    table_color: null,
    table_top_type_auto: true,
    module_color: null,
    default_fasade_up: 7397,
    default_fasade_down: 7397,
    default_floor: 44013,
    default_wall: 44128,
}