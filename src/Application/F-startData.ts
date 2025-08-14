// import * as THREEInterfases from "../types/interfases"

export const START_PROJECT_PARAMS = {

    rooms: [{
        id: 1000001,
        label: 'Комната 1',
        description: "",
        params: {
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
            default_room_module_color_down: null,
            default_room_module_color_up: null,
            default_room_fasade_up: 7397,
            default_room_fasade_down: 7397,
        },
        content: [],
    },
    ],

    camera: {
        position: [8 * 1000, 1.5 * 1000, 0],
        target: { x: 0, y: 1500, z: 0 },
        fov: 45,
        near: 10,
        far: 25000
    },

    lights: {

        ambientLight: {
            color: '#ffffff',
            intensity: 1.5,
        },

        pointLight: {
            color: '#ffffff',
            normalBias: -0.02,
            bias: 0.0001,
            castShadow: false,
            mapSize: 512,
            intensity: 1.6,
            distance: 6500,
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

    project_name: 'New Pod',
    table_top_type_auto: true,
    default_table_color: null,
    default_fasade_color: 7397,
    default_module_color: 199675,
    default_fasade_up: 7397,
    default_fasade_down: 7397,
    default_floor: 44013,
    default_wall: 44128,
    default_module_color_down: null,
    default_module_color_up: null,
    default_milling_down: null,
    default_milling_up: null,
    default_palit_down: null,
    default_palit_up: null,

}

export const START_SCHEME_CONTANT = {
    "id": "0aeedb70-c409-49e0-9bf6-64de303e9026",
    "label": "Комната 1",
    "description": "",
    "params": {
        "walls": [
            {
                "id": "wall__b105fc22-2b4f-45c2-8f77-c9076eb3a172",
                "width": 6351.82373046875,
                "height": 3000,
                "depth": 300,
                "position": {
                    "x": 4525.911865234375,
                    "y": 1500,
                    "z": 1550
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
                "id": "wall_vertical__a7c3f22c-2421-4198-8c98-76d2c0d14daa",
                "width": 5544.9481201171875,
                "height": 3000,
                "depth": 300,
                "position": {
                    "x": 7701.82373046875,
                    "y": 1500,
                    "z": 4322.474060058594
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
                "id": "wall_vertical__ae2c7a2f-6411-4037-91f0-8030b06757df",
                "width": 7162.215533972321,
                "height": 3000,
                "depth": 300,
                "position": {
                    "x": 4528.724365234375,
                    "y": 1500,
                    "z": 8755.000305175781
                },
                "rotation": {
                    "isEuler": true,
                    "_x": 0,
                    "_y": -2.659585828831095,
                    "_z": 0,
                    "_order": "XYZ"
                },
                "side": 0
            }
        ],
        "wall": "44144",
        "floor": "44020"
    },
    "content": [
        "{\"id\":3689611,\"position\":{\"x\":3120,\"y\":1040.4584595432282,\"z\":1550},\"rotation\":{\"isEuler\":true,\"_x\":0,\"_y\":0,\"_z\":0,\"_order\":\"XYZ\"},\"obb\":{\"center\":{\"x\":0.0861663818359375,\"y\":1035.4592416286469,\"z\":-46.28828811645508},\"halfSize\":{\"x\":479.81346130371094,\"y\":1040.4594595432281,\"z\":93.08352279663086},\"rotation\":{\"elements\":[1,0,0,0,1,0,0,0,1]}},\"data\":{\"ARROWS\":null,\"BODY\":null,\"CONFIG\":{\"DISABLE_MOVE\":false,\"ELEMENT_TYPE\":\"element_up\",\"ID\":3689611,\"FASADE_PROPS\":[],\"FASADE_SIZE\":{},\"FASADE_POSITIONS\":[],\"FASADE_TYPE\":[],\"HANDLES\":{},\"HANDLES_POSITION\":{},\"HAVETABLETOP\":false,\"HIDE_FASADE\":false,\"HIDDEN\":false,\"HEIGHTCORRECT\":0,\"MODELID\":3689601,\"MODEL\":{\"id\":3689601,\"name\":\"Дверь\",\"json\":null,\"type_label\":\"Левое\",\"type\":\"left\",\"shininess\":10,\"material\":null,\"color\":null,\"DAE\":\"/upload/iblock/385/38540860468c5d5c8d436a461d968033.gltf\",\"file\":\"/upload/iblock/385/38540860468c5d5c8d436a461d968033.gltf\",\"model_type\":\"GLTF\",\"scale\":1,\"width\":null,\"height\":null,\"depth\":null,\"corr_x\":null,\"corr_y\":\"0\",\"corr_z\":\"0\",\"loop_position\":null,\"loop_model\":null,\"wall_thickness\":null},\"MODULE_COLOR\":null,\"SIZE\":{\"width\":960,\"height\":2080,\"depth\":185},\"SIZE_EDIT\":{\"SIZE_EDIT_WIDTH_MIN\":500,\"SIZE_EDIT_WIDTH_MAX\":2000,\"SIZE_EDIT_HEIGHT_MIN\":500,\"SIZE_EDIT_HEIGHT_MAX\":3000,\"SIZE_EDIT_DEPTH_MIN\":50,\"SIZE_EDIT_DEPTH_MAX\":500},\"SHOWCASE\":null,\"POSITION\":{\"x\":3120,\"y\":1040.4584595432282,\"z\":1550},\"ROTATION\":{\"isEuler\":true,\"_x\":0,\"_y\":0,\"_z\":0,\"_order\":\"XYZ\"},\"UNIFORM_TEXTURE\":{\"group\":null,\"level\":null,\"index\":null,\"column_index\":null,\"backupFasadId\":null,\"color\":null},\"USLUGI\":[],\"EXPRESSIONS\":{\"#MWIDTH#\":960,\"#MODUL_MWIDTH#\":960,\"#MODUL_WIDTH#\":960,\"#X#\":960,\"#MHEIGHT#\":2080,\"#MODUL_MHEIGHT#\":2080,\"#MODUL_HEIGHT#\":2080,\"#Y#\":2080,\"#MDEPTH#\":185,\"#MODUL_MDEPTH#\":185,\"#MODUL_DEPTH#\":185,\"#Z#\":185,\"#SIZEEDITJOINDEPTH#\":null}},\"DRAWERS\":{},\"EXPRESSIONS\":{},\"FASADE\":[],\"FASADE_DEFAULT\":[],\"GLASS\":{},\"HANDLES\":{},\"HIDDENCHILDREN\":{},\"HIDDEN\":false,\"LEG\":[],\"MILLINGS\":[],\"PRODUCT\":3689611,\"RASPIL\":[],\"RASPIL_LIST\":[],\"RASPIL_COUNT\":0,\"SHELF\":[],\"SEPARATED\":[],\"SECTIONSOBJ\":[],\"SECTIONCONTROL\":[],\"TABLETOP\":{},\"WINDOW_DEFAULT\":[],\"BODY_DEFAULT\":null}}",
        "{\"id\":3689611,\"position\":{\"x\":7701.82373046875,\"y\":1040.4584595432282,\"z\":5670},\"rotation\":{\"isEuler\":true,\"_x\":0,\"_y\":-1.5707963267948966,\"_z\":0,\"_order\":\"XYZ\"},\"obb\":{\"center\":{\"x\":0.0861663818359375,\"y\":1035.4592416286469,\"z\":-46.28828811645508},\"halfSize\":{\"x\":479.81346130371094,\"y\":1040.4594595432281,\"z\":93.08352279663086},\"rotation\":{\"elements\":[1,0,0,0,1,0,0,0,1]}},\"data\":{\"ARROWS\":null,\"BODY\":null,\"CONFIG\":{\"DISABLE_MOVE\":false,\"ELEMENT_TYPE\":\"element_up\",\"ID\":3689611,\"FASADE_PROPS\":[],\"FASADE_SIZE\":{},\"FASADE_POSITIONS\":[],\"FASADE_TYPE\":[],\"HANDLES\":{},\"HANDLES_POSITION\":{},\"HAVETABLETOP\":false,\"HIDE_FASADE\":false,\"HIDDEN\":false,\"HEIGHTCORRECT\":0,\"MODELID\":3689601,\"MODEL\":{\"id\":3689601,\"name\":\"Дверь\",\"json\":null,\"type_label\":\"Левое\",\"type\":\"left\",\"shininess\":10,\"material\":null,\"color\":null,\"DAE\":\"/upload/iblock/385/38540860468c5d5c8d436a461d968033.gltf\",\"file\":\"/upload/iblock/385/38540860468c5d5c8d436a461d968033.gltf\",\"model_type\":\"GLTF\",\"scale\":1,\"width\":null,\"height\":null,\"depth\":null,\"corr_x\":null,\"corr_y\":\"0\",\"corr_z\":\"0\",\"loop_position\":null,\"loop_model\":null,\"wall_thickness\":null},\"MODULE_COLOR\":null,\"SIZE\":{\"width\":960,\"height\":2080,\"depth\":185},\"SIZE_EDIT\":{\"SIZE_EDIT_WIDTH_MIN\":500,\"SIZE_EDIT_WIDTH_MAX\":2000,\"SIZE_EDIT_HEIGHT_MIN\":500,\"SIZE_EDIT_HEIGHT_MAX\":3000,\"SIZE_EDIT_DEPTH_MIN\":50,\"SIZE_EDIT_DEPTH_MAX\":500},\"SHOWCASE\":null,\"POSITION\":{\"x\":7701.82373046875,\"y\":1040.4584595432282,\"z\":5670},\"ROTATION\":{\"isEuler\":true,\"_x\":0,\"_y\":-1.5707963267948966,\"_z\":0,\"_order\":\"XYZ\"},\"UNIFORM_TEXTURE\":{\"group\":null,\"level\":null,\"index\":null,\"column_index\":null,\"backupFasadId\":null,\"color\":null},\"USLUGI\":[],\"EXPRESSIONS\":{\"#MWIDTH#\":960,\"#MODUL_MWIDTH#\":960,\"#MODUL_WIDTH#\":960,\"#X#\":960,\"#MHEIGHT#\":2080,\"#MODUL_MHEIGHT#\":2080,\"#MODUL_HEIGHT#\":2080,\"#Y#\":2080,\"#MDEPTH#\":185,\"#MODUL_MDEPTH#\":185,\"#MODUL_DEPTH#\":185,\"#Z#\":185,\"#SIZEEDITJOINDEPTH#\":null}},\"DRAWERS\":{},\"EXPRESSIONS\":{},\"FASADE\":[],\"FASADE_DEFAULT\":[],\"GLASS\":{},\"HANDLES\":{},\"HIDDENCHILDREN\":{},\"HIDDEN\":false,\"LEG\":[],\"MILLINGS\":[],\"PRODUCT\":3689611,\"RASPIL\":[],\"RASPIL_LIST\":[],\"RASPIL_COUNT\":0,\"SHELF\":[],\"SEPARATED\":[],\"SECTIONSOBJ\":[],\"SECTIONCONTROL\":[],\"TABLETOP\":{},\"WINDOW_DEFAULT\":[],\"BODY_DEFAULT\":null}}",
        "{\"id\":3689611,\"position\":{\"x\":5923.034943145369,\"y\":1040.4584595432282,\"z\":8025.546841829702},\"rotation\":{\"isEuler\":true,\"_x\":0,\"_y\":-2.659585828831095,\"_z\":0,\"_order\":\"XYZ\"},\"obb\":{\"center\":{\"x\":0.0861663818359375,\"y\":1035.4592416286469,\"z\":-46.28828811645508},\"halfSize\":{\"x\":479.81346130371094,\"y\":1040.4594595432281,\"z\":93.08352279663086},\"rotation\":{\"elements\":[1,0,0,0,1,0,0,0,1]}},\"data\":{\"ARROWS\":null,\"BODY\":null,\"CONFIG\":{\"DISABLE_MOVE\":false,\"ELEMENT_TYPE\":\"element_up\",\"ID\":3689611,\"FASADE_PROPS\":[],\"FASADE_SIZE\":{},\"FASADE_POSITIONS\":[],\"FASADE_TYPE\":[],\"HANDLES\":{},\"HANDLES_POSITION\":{},\"HAVETABLETOP\":false,\"HIDE_FASADE\":false,\"HIDDEN\":false,\"HEIGHTCORRECT\":0,\"MODELID\":3689601,\"MODEL\":{\"id\":3689601,\"name\":\"Дверь\",\"json\":null,\"type_label\":\"Левое\",\"type\":\"left\",\"shininess\":10,\"material\":null,\"color\":null,\"DAE\":\"/upload/iblock/385/38540860468c5d5c8d436a461d968033.gltf\",\"file\":\"/upload/iblock/385/38540860468c5d5c8d436a461d968033.gltf\",\"model_type\":\"GLTF\",\"scale\":1,\"width\":null,\"height\":null,\"depth\":null,\"corr_x\":null,\"corr_y\":\"0\",\"corr_z\":\"0\",\"loop_position\":null,\"loop_model\":null,\"wall_thickness\":null},\"MODULE_COLOR\":null,\"SIZE\":{\"width\":960,\"height\":2080,\"depth\":185},\"SIZE_EDIT\":{\"SIZE_EDIT_WIDTH_MIN\":500,\"SIZE_EDIT_WIDTH_MAX\":2000,\"SIZE_EDIT_HEIGHT_MIN\":500,\"SIZE_EDIT_HEIGHT_MAX\":3000,\"SIZE_EDIT_DEPTH_MIN\":50,\"SIZE_EDIT_DEPTH_MAX\":500},\"SHOWCASE\":null,\"POSITION\":{\"x\":5923.034943145369,\"y\":1040.4584595432282,\"z\":8025.546841829702},\"ROTATION\":{\"isEuler\":true,\"_x\":0,\"_y\":-2.659585828831095,\"_z\":0,\"_order\":\"XYZ\"},\"UNIFORM_TEXTURE\":{\"group\":null,\"level\":null,\"index\":null,\"column_index\":null,\"backupFasadId\":null,\"color\":null},\"USLUGI\":[],\"EXPRESSIONS\":{\"#MWIDTH#\":960,\"#MODUL_MWIDTH#\":960,\"#MODUL_WIDTH#\":960,\"#X#\":960,\"#MHEIGHT#\":2080,\"#MODUL_MHEIGHT#\":2080,\"#MODUL_HEIGHT#\":2080,\"#Y#\":2080,\"#MDEPTH#\":185,\"#MODUL_MDEPTH#\":185,\"#MODUL_DEPTH#\":185,\"#Z#\":185,\"#SIZEEDITJOINDEPTH#\":null}},\"DRAWERS\":{},\"EXPRESSIONS\":{},\"FASADE\":[],\"FASADE_DEFAULT\":[],\"GLASS\":{},\"HANDLES\":{},\"HIDDENCHILDREN\":{},\"HIDDEN\":false,\"LEG\":[],\"MILLINGS\":[],\"PRODUCT\":3689611,\"RASPIL\":[],\"RASPIL_LIST\":[],\"RASPIL_COUNT\":0,\"SHELF\":[],\"SEPARATED\":[],\"SECTIONSOBJ\":[],\"SECTIONCONTROL\":[],\"TABLETOP\":{},\"WINDOW_DEFAULT\":[],\"BODY_DEFAULT\":null}}",
        "{\"id\":3689569,\"position\":{\"x\":3525.5407125387524,\"y\":976.789954642004,\"z\":9279.830139664567},\"rotation\":{\"isEuler\":true,\"_x\":0,\"_y\":-2.659585828831095,\"_z\":0,\"_order\":\"XYZ\"},\"obb\":{\"center\":{\"x\":-0.00048827496357262135,\"y\":780.8368077920704,\"z\":34.06570826246025},\"halfSize\":{\"x\":599.9938621316687,\"y\":823.210045357996,\"z\":99.99913978026598},\"rotation\":{\"elements\":[1,0,0,0,1,0,0,0,1]}},\"data\":{\"ARROWS\":null,\"BODY\":null,\"CONFIG\":{\"DISABLE_MOVE\":false,\"ELEMENT_TYPE\":\"element_up\",\"ID\":3689569,\"FASADE_PROPS\":[],\"FASADE_SIZE\":{},\"FASADE_POSITIONS\":[],\"FASADE_TYPE\":[],\"HANDLES\":{},\"HANDLES_POSITION\":{},\"HAVETABLETOP\":false,\"HIDE_FASADE\":false,\"HIDDEN\":false,\"HEIGHTCORRECT\":0,\"MODELID\":3689568,\"MODEL\":{\"id\":3689568,\"name\":\"Окно\",\"json\":null,\"type_label\":\"Левое\",\"type\":\"left\",\"shininess\":10,\"material\":null,\"color\":null,\"DAE\":\"/upload/iblock/65b/65b0e7f52d54e5c16d8fe574516d2f91.gltf\",\"file\":\"/upload/iblock/65b/65b0e7f52d54e5c16d8fe574516d2f91.gltf\",\"model_type\":\"GLTF\",\"scale\":1,\"width\":null,\"height\":null,\"depth\":null,\"corr_x\":null,\"corr_y\":\"0\",\"corr_z\":\"0\",\"loop_position\":null,\"loop_model\":null,\"wall_thickness\":null},\"MODULE_COLOR\":null,\"SIZE\":{\"width\":1200,\"height\":1650,\"depth\":64},\"SIZE_EDIT\":{\"SIZE_EDIT_WIDTH_MIN\":500,\"SIZE_EDIT_WIDTH_MAX\":2400,\"SIZE_EDIT_HEIGHT_MIN\":100,\"SIZE_EDIT_HEIGHT_MAX\":2400,\"SIZE_EDIT_DEPTH_MIN\":null,\"SIZE_EDIT_DEPTH_MAX\":null},\"SHOWCASE\":null,\"POSITION\":{\"x\":3525.5407125387524,\"y\":976.789954642004,\"z\":9279.830139664567},\"ROTATION\":{\"isEuler\":true,\"_x\":0,\"_y\":-2.659585828831095,\"_z\":0,\"_order\":\"XYZ\"},\"UNIFORM_TEXTURE\":{\"group\":null,\"level\":null,\"index\":null,\"column_index\":null,\"backupFasadId\":null,\"color\":null},\"USLUGI\":[],\"EXPRESSIONS\":{\"#MWIDTH#\":1200,\"#MODUL_MWIDTH#\":1200,\"#MODUL_WIDTH#\":1200,\"#X#\":1200,\"#MHEIGHT#\":1650,\"#MODUL_MHEIGHT#\":1650,\"#MODUL_HEIGHT#\":1650,\"#Y#\":1650,\"#MDEPTH#\":64,\"#MODUL_MDEPTH#\":64,\"#MODUL_DEPTH#\":64,\"#Z#\":64,\"#SIZEEDITJOINDEPTH#\":null}},\"DRAWERS\":{},\"EXPRESSIONS\":{},\"FASADE\":[],\"FASADE_DEFAULT\":[],\"GLASS\":{},\"HANDLES\":{},\"HIDDENCHILDREN\":{},\"HIDDEN\":false,\"LEG\":[],\"MILLINGS\":[],\"PRODUCT\":3689569,\"RASPIL\":[],\"RASPIL_LIST\":[],\"RASPIL_COUNT\":0,\"SHELF\":[],\"SEPARATED\":[],\"SECTIONSOBJ\":[],\"SECTIONCONTROL\":[],\"TABLETOP\":{},\"WINDOW_DEFAULT\":[],\"BODY_DEFAULT\":null}}",
        "{\"id\":3689569,\"position\":{\"x\":7701.82373046875,\"y\":976.789954642004,\"z\":3560},\"rotation\":{\"isEuler\":true,\"_x\":0,\"_y\":-1.5707963267948966,\"_z\":0,\"_order\":\"XYZ\"},\"obb\":{\"center\":{\"x\":-0.00048827496357262135,\"y\":780.8368077920704,\"z\":34.06570826246025},\"halfSize\":{\"x\":599.9938621316687,\"y\":823.210045357996,\"z\":99.99913978026598},\"rotation\":{\"elements\":[1,0,0,0,1,0,0,0,1]}},\"data\":{\"ARROWS\":null,\"BODY\":null,\"CONFIG\":{\"DISABLE_MOVE\":false,\"ELEMENT_TYPE\":\"element_up\",\"ID\":3689569,\"FASADE_PROPS\":[],\"FASADE_SIZE\":{},\"FASADE_POSITIONS\":[],\"FASADE_TYPE\":[],\"HANDLES\":{},\"HANDLES_POSITION\":{},\"HAVETABLETOP\":false,\"HIDE_FASADE\":false,\"HIDDEN\":false,\"HEIGHTCORRECT\":0,\"MODELID\":3689568,\"MODEL\":{\"id\":3689568,\"name\":\"Окно\",\"json\":null,\"type_label\":\"Левое\",\"type\":\"left\",\"shininess\":10,\"material\":null,\"color\":null,\"DAE\":\"/upload/iblock/65b/65b0e7f52d54e5c16d8fe574516d2f91.gltf\",\"file\":\"/upload/iblock/65b/65b0e7f52d54e5c16d8fe574516d2f91.gltf\",\"model_type\":\"GLTF\",\"scale\":1,\"width\":null,\"height\":null,\"depth\":null,\"corr_x\":null,\"corr_y\":\"0\",\"corr_z\":\"0\",\"loop_position\":null,\"loop_model\":null,\"wall_thickness\":null},\"MODULE_COLOR\":null,\"SIZE\":{\"width\":1200,\"height\":1650,\"depth\":64},\"SIZE_EDIT\":{\"SIZE_EDIT_WIDTH_MIN\":500,\"SIZE_EDIT_WIDTH_MAX\":2400,\"SIZE_EDIT_HEIGHT_MIN\":100,\"SIZE_EDIT_HEIGHT_MAX\":2400,\"SIZE_EDIT_DEPTH_MIN\":null,\"SIZE_EDIT_DEPTH_MAX\":null},\"SHOWCASE\":null,\"POSITION\":{\"x\":7701.82373046875,\"y\":976.789954642004,\"z\":3560},\"ROTATION\":{\"isEuler\":true,\"_x\":0,\"_y\":-1.5707963267948966,\"_z\":0,\"_order\":\"XYZ\"},\"UNIFORM_TEXTURE\":{\"group\":null,\"level\":null,\"index\":null,\"column_index\":null,\"backupFasadId\":null,\"color\":null},\"USLUGI\":[],\"EXPRESSIONS\":{\"#MWIDTH#\":1200,\"#MODUL_MWIDTH#\":1200,\"#MODUL_WIDTH#\":1200,\"#X#\":1200,\"#MHEIGHT#\":1650,\"#MODUL_MHEIGHT#\":1650,\"#MODUL_HEIGHT#\":1650,\"#Y#\":1650,\"#MDEPTH#\":64,\"#MODUL_MDEPTH#\":64,\"#MODUL_DEPTH#\":64,\"#Z#\":64,\"#SIZEEDITJOINDEPTH#\":null}},\"DRAWERS\":{},\"EXPRESSIONS\":{},\"FASADE\":[],\"FASADE_DEFAULT\":[],\"GLASS\":{},\"HANDLES\":{},\"HIDDENCHILDREN\":{},\"HIDDEN\":false,\"LEG\":[],\"MILLINGS\":[],\"PRODUCT\":3689569,\"RASPIL\":[],\"RASPIL_LIST\":[],\"RASPIL_COUNT\":0,\"SHELF\":[],\"SEPARATED\":[],\"SECTIONSOBJ\":[],\"SECTIONCONTROL\":[],\"TABLETOP\":{},\"WINDOW_DEFAULT\":[],\"BODY_DEFAULT\":null}}",
        "{\"id\":3689569,\"position\":{\"x\":5590,\"y\":976.789954642004,\"z\":1550},\"rotation\":{\"isEuler\":true,\"_x\":0,\"_y\":0,\"_z\":0,\"_order\":\"XYZ\"},\"obb\":{\"center\":{\"x\":-0.00048827496357262135,\"y\":780.8368077920704,\"z\":34.06570826246025},\"halfSize\":{\"x\":599.9938621316687,\"y\":823.210045357996,\"z\":99.99913978026598},\"rotation\":{\"elements\":[1,0,0,0,1,0,0,0,1]}},\"data\":{\"ARROWS\":null,\"BODY\":null,\"CONFIG\":{\"DISABLE_MOVE\":false,\"ELEMENT_TYPE\":\"element_up\",\"ID\":3689569,\"FASADE_PROPS\":[],\"FASADE_SIZE\":{},\"FASADE_POSITIONS\":[],\"FASADE_TYPE\":[],\"HANDLES\":{},\"HANDLES_POSITION\":{},\"HAVETABLETOP\":false,\"HIDE_FASADE\":false,\"HIDDEN\":false,\"HEIGHTCORRECT\":0,\"MODELID\":3689568,\"MODEL\":{\"id\":3689568,\"name\":\"Окно\",\"json\":null,\"type_label\":\"Левое\",\"type\":\"left\",\"shininess\":10,\"material\":null,\"color\":null,\"DAE\":\"/upload/iblock/65b/65b0e7f52d54e5c16d8fe574516d2f91.gltf\",\"file\":\"/upload/iblock/65b/65b0e7f52d54e5c16d8fe574516d2f91.gltf\",\"model_type\":\"GLTF\",\"scale\":1,\"width\":null,\"height\":null,\"depth\":null,\"corr_x\":null,\"corr_y\":\"0\",\"corr_z\":\"0\",\"loop_position\":null,\"loop_model\":null,\"wall_thickness\":null},\"MODULE_COLOR\":null,\"SIZE\":{\"width\":1200,\"height\":1650,\"depth\":64},\"SIZE_EDIT\":{\"SIZE_EDIT_WIDTH_MIN\":500,\"SIZE_EDIT_WIDTH_MAX\":2400,\"SIZE_EDIT_HEIGHT_MIN\":100,\"SIZE_EDIT_HEIGHT_MAX\":2400,\"SIZE_EDIT_DEPTH_MIN\":null,\"SIZE_EDIT_DEPTH_MAX\":null},\"SHOWCASE\":null,\"POSITION\":{\"x\":5590,\"y\":976.789954642004,\"z\":1550},\"ROTATION\":{\"isEuler\":true,\"_x\":0,\"_y\":0,\"_z\":0,\"_order\":\"XYZ\"},\"UNIFORM_TEXTURE\":{\"group\":null,\"level\":null,\"index\":null,\"column_index\":null,\"backupFasadId\":null,\"color\":null},\"USLUGI\":[],\"EXPRESSIONS\":{\"#MWIDTH#\":1200,\"#MODUL_MWIDTH#\":1200,\"#MODUL_WIDTH#\":1200,\"#X#\":1200,\"#MHEIGHT#\":1650,\"#MODUL_MHEIGHT#\":1650,\"#MODUL_HEIGHT#\":1650,\"#Y#\":1650,\"#MDEPTH#\":64,\"#MODUL_MDEPTH#\":64,\"#MODUL_DEPTH#\":64,\"#Z#\":64,\"#SIZEEDITJOINDEPTH#\":null}},\"DRAWERS\":{},\"EXPRESSIONS\":{},\"FASADE\":[],\"FASADE_DEFAULT\":[],\"GLASS\":{},\"HANDLES\":{},\"HIDDENCHILDREN\":{},\"HIDDEN\":false,\"LEG\":[],\"MILLINGS\":[],\"PRODUCT\":3689569,\"RASPIL\":[],\"RASPIL_LIST\":[],\"RASPIL_COUNT\":0,\"SHELF\":[],\"SEPARATED\":[],\"SECTIONSOBJ\":[],\"SECTIONCONTROL\":[],\"TABLETOP\":{},\"WINDOW_DEFAULT\":[],\"BODY_DEFAULT\":null}}"
    ]
}