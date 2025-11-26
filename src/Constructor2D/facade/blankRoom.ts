// @ts-nocheck
import { useSceneState } from "@/store/appliction/useSceneState"
import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition"
import { useProjectStore } from "@/features/quickActions/project/store/useProjectStore"

const sceneState = useSceneState()
const schemeTransition = useSchemeTransition()
const projectState = useProjectStore()

const jsonBlank = `{
    "projectId": "1762946168561",
    "type": "New",
    "rooms": [
        {
            "id": "b90b3471-0ad6-4026-9c00-d859d625e794",
            "label": "Комната 1",
            "description": "",
            "params": {
                "walls": [
                    {
                        "id": "wall_vertical__773a2c9c-da64-4171-856d-c10f63a521cf",
                        "width": 2619.101690962483,
                        "height": 3000,
                        "depth": 300,
                        "position": {
                            "x": 5253.88671875,
                            "y": 1500,
                            "z": 2713.69140625
                        },
                        "rotation": {
                            "isEuler": true,
                            "_x": 0,
                            "_y": -1.571109530560998,
                            "_z": 0,
                            "_order": "XYZ"
                        },
                        "side": 0
                    },
                    {
                        "id": "wall_vertical__c0ca5bf0-beb2-4503-9bf9-ccff5cc12952",
                        "width": 2620.2984207493882,
                        "height": 3000,
                        "depth": 300,
                        "position": {
                            "x": 1179.66796875,
                            "y": 1500,
                            "z": 2710.5859375
                        },
                        "rotation": {
                            "isEuler": true,
                            "_x": 0,
                            "_y": 1.5777880730857181,
                            "_z": 0,
                            "_order": "XYZ"
                        },
                        "side": 0
                    },
                    {
                        "id": "wall__8241750c-5d09-4837-8d7c-2e1d16769121",
                        "width": 4083.790713254126,
                        "height": 3000,
                        "depth": 300,
                        "position": {
                            "x": 3212.40234375,
                            "y": 1500,
                            "z": 1402.3046875
                        },
                        "rotation": {
                            "isEuler": true,
                            "_x": 0,
                            "_y": -0.0008991341017629902,
                            "_z": 0,
                            "_order": "XYZ"
                        },
                        "side": 0
                    },
                    {
                        "id": "wall__5ad29db5-f48a-49e7-9640-ae79f6d05ae5",
                        "width": 4064.649230537559,
                        "height": 3000,
                        "depth": 300,
                        "position": {
                            "x": 3221.15234375,
                            "y": 1500,
                            "z": 4021.97265625
                        },
                        "rotation": {
                            "isEuler": true,
                            "_x": 0,
                            "_y": 3.140967984025184,
                            "_z": 0,
                            "_order": "XYZ"
                        },
                        "side": 0
                    }
                ],
                "wall": "44144",
                "floor": "44020"
            },
            "content": "[]"
        }
    ],
    "camera": {
        "position": [
            8000,
            1500,
            0
        ],
        "target": {
            "x": 0,
            "y": 1500,
            "z": 0
        },
        "fov": 45,
        "near": 10,
        "far": 25000
    },
    "lights": {
        "ambientLight": {
            "color": "#ffffff",
            "intensity": 1.5
        },
        "pointLight": {
            "color": "#ffffff",
            "normalBias": -0.02,
            "bias": 0.0001,
            "castShadow": false,
            "mapSize": 512,
            "intensity": 1.6,
            "distance": 6000,
            "decay": 0
        }
    },
    "height_clamp": 3000,
    "project_name": "blankroom",
    "table_top_type_auto": true,
    "default_table_model": 69919,
    "default_table_color": null,
    "default_fasade_color": 7397,
    "default_module_color": 199675,
    "default_fasade_up": 7397,
    "default_fasade_down": 7397,
    "default_floor": 44013,
    "default_wall": 44128,
    "default_module_color_down": null,
    "default_module_color_up": null,
    "default_milling_bottom": null,
    "default_milling_top": null,
    "default_palit_bottom": null,
    "default_palit_top": null,
    "default_handles": 69920,
    "default_overlay_id": [
        63040,
        7014884,
        1944070,
        1944063,
        3922338
    ],
    "default_plinth_body": 70096,
    "default_plinth_color": null
}`
const projectData = JSON.parse(jsonBlank)

console.log(projectData)

const ensureLayersReady = async () => {
  while (!window.C2D?.layers?.planner || !window.C2D?.layers?.doorsAndWindows) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

export const loadBlankRoom = async () => {
  await ensureLayersReady()
  projectState.setInitialState(projectData)

  try {
    await sceneState.loadProjectFromData(projectData)
    sceneState.updateProjectParams({})
    schemeTransition.setAppData(projectData.rooms)

    projectState.setProjectId(undefined)

    window.C2D.layers.planner.init(true)
    window.C2D.layers.doorsAndWindows.init(true)
    console.log('READY')
  } catch (error) {
    console.error('Ошибка предварительной инициализации комнаты', error)
  }
}