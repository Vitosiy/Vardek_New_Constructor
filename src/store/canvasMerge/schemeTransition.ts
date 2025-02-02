import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { APP } from '@/Application/F-sources';

export const useSchemeTransition = defineStore('SchemeTransition', () => {



    const SchemeTransitionData = ref<{ [key: string]: any }[]>([

        {
            id: 0, /** ID комнаты */
            label: "Гостинная", /** Лейбл */
            description: "Гостевая комната", /** Описание */
            size: {
                /** Данные для форпмирования стен комнат */
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
                floor: 44013, /** ID текстуры пола */
                wall: 44014,/** ID текстуры стен */
            },
            content: { /** Наполняемый контетн из 2D редактора (объёмные стены / переферия) */
                '2d': [

                ],
                '3d': [

                ]
            },
        },


    ])

    const setAppData = (value: any) => {
        SchemeTransitionData.value = value
        console.log(SchemeTransitionData.value);
    }

    const getSchemeTransitionData = computed(() => {
        return SchemeTransitionData.value
    })

    return {
        getSchemeTransitionData,
        setAppData
    };

})
