export const MILLINGS = {
    2462671: [
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ],// Понца

    566722: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4.5,
                bevelSize: 13,
                bevelOffset: -13,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "small_width",
                    condition: {
                        width: {
                            min: 175,
                            max: 295,
                        },
                        height: {
                            min: 396,
                            max: 2500,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -40,
                        heightOffset: -60,
                    },
                    hole: {
                        svg: `<path d="M -wth,+26 -hgh,+26 L -wth,+26 hgh,-26 L wth,-26 hgh,-26 L wth,-26 -hgh,+26 L -wth,+26 -hgh,+26 Z"/>`,
                        widthOffset: -40,
                        heightOffset: -60,
                    },
                },
                {
                    nameCondition: "small_height",
                    condition: {
                        width: {
                            min: 396,
                            max: 1250,
                        },
                        height: {
                            min: 175,
                            max: 295,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -60,
                        heightOffset: -40,
                    },
                    hole: {
                        svg: `<path d="M -wth,+26 -hgh,+26 L -wth,+26 hgh,-26 L wth,-26 hgh,-26 L wth,-26 -hgh,+26 L -wth,+26 -hgh,+26 Z"/>`,
                        widthOffset: -60,
                        heightOffset: -40,
                    },
                },
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 296,
                            max: Infinity,
                        },
                        height: {
                            min: 296,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -57,
                        heightOffset: -57,
                    },
                    hole: {
                        svg: `<path d="M -wth,+41 -hgh,+41 L -wth,+41 hgh,-41 L wth,-41 hgh,-41 L wth,-41 -hgh,+41 L -wth,+41 -hgh,+41 Z"/>`,
                        widthOffset: -57,
                        heightOffset: -57,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4.5,
                bevelSize: 7.49,
                bevelOffset: -7.49,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ],

    566715: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 2,
                bevelOffset: 2.7,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -16.3,
                        heightOffset: -16.3,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: -16.3,
                        heightOffset: -16.3,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Альби_2

    4717193: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 2,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 201,
                            max: Infinity,
                        },
                        height: {
                            min: 201,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth,62 -hgh,62 L wth,-62 -hgh,62 L wth,-62 hgh,-62 L -wth,62 hgh,-62 L -wth,62 -hgh,62 Z "/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<path d="M -wth,70 -hgh,70 L wth,-70 -hgh,70 L wth,-70 hgh,-70 L -wth,70 hgh,-70 L -wth,70 -hgh,70 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: 4,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 201,
                            max: Infinity,
                        },
                        height: {
                            min: 201,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth,72 -hgh,72 L wth,-72 -hgh,72 L wth,-72 hgh,-72 L -wth,72 hgh,-72 L -wth,72 -hgh,72 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<path d="M -wth,76 -hgh,76 L wth,-76 -hgh,76 L wth,-76 hgh,-76 L -wth,76 hgh,-76 L -wth,76 -hgh,76 Z"/>`,
                        widthOffset: 8,
                        heightOffset: 8,
                    },
                },
            ],
        },
        {
            name: "milling_3",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 2,
                bevelOffset: 2,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 201,
                            max: Infinity,
                        },
                        height: {
                            min: 201,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth,76 -hgh,76 L wth,-76 -hgh,76 L wth,-76 hgh,-76 L -wth,76 hgh,-76 L -wth,76 -hgh,76 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<path d="M -wth,80 -hgh,80 L wth,-80 -hgh,80 L wth,-80 hgh,-80 L -wth,80 hgh,-80 L -wth,80 -hgh,80 Z"/>`,
                        widthOffset: 4,
                        heightOffset: 4,
                    },
                },
            ],
        },
        {
            name: "Small_width",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: 4,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: 176,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth,72 -hgh,72 L wth,-72 -hgh,72 L wth,-72 hgh,-72 L -wth,72 hgh,-72 L -wth,72 -hgh,72 Z"/>`,
                        widthOffset: 14,
                        heightOffset: 7,
                    },
                    hole: {
                        svg: `<path d="M -wth,76 -hgh,76 L wth,-76 -hgh,76 L wth,-76 hgh,-76 L -wth,76 hgh,-76 L -wth,76 -hgh,76 Z"/>`,
                        widthOffset: 16,
                        heightOffset: 8,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Мальта

    4717192: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 5,
                bevelSize: 5,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -55.5,
                        heightOffset: -55.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -55.5,
                        heightOffset: -55.5,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 7.2,
                bevelSize: 7.2,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 250,
                            max: Infinity,
                        },
                        height: {
                            min: 250,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -80.5,
                        heightOffset: -80.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -97.5,
                        heightOffset: -97.5,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Капри

    5591090: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 3,
                bevelSize: 5.24,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="
                                M -(wth - radius) -hgh 
                                L (wth - radius) -hgh 
                                A radius radius 0 0 1 wth (-hgh + radius) 
                                L wth (hgh - radius) 
                                A radius radius 0 0 1 (wth - radius) hgh 
                                L -(wth - radius) hgh 
                                A radius radius 0 0 1 -wth (hgh - radius) 
                                L -wth -(hgh - radius) 
                                A radius radius 0 0 1 (-wth + radius) -hgh 
                                Z" 
                            />`,
                        // svg: `<path d="M -wth -hgh L wth -hgh Ar L wth hgh Ad L -wth hgh Al L -wth -hgh Au Z"/>`,
                        widthOffset: -25,
                        heightOffset: -25,
                        radius: 5.34
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Кёльн 3   

    5591096: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -19,
                        heightOffset: -19,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 6,
                bevelSize: 6,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 280,
                            max: Infinity,
                        },
                        height: {
                            min: 280,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -70,
                        heightOffset: -70,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -122,
                        heightOffset: -122,
                    },
                },
            ],
        },

        {
            name: "small_size",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 6,
                bevelSize: 6,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 176,
                            max: 279,
                        },
                        height: {
                            min: 176,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -70.5,
                        heightOffset: -70.5,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },

        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Ливерпуль_2

    5591095: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 176,
                            max: Infinity,
                        },
                        height: {
                            min: 176,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -70,
                        heightOffset: -70,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 6,
                bevelSize: 4,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 211,
                            max: Infinity,
                        },
                        height: {
                            min: 211,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -89,
                        heightOffset: -89,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Шато_2

    5591093: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -19,
                        heightOffset: -19,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },

        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Честер_2

    5591092: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -19,
                        heightOffset: -19,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 6,
                bevelSize: 6,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 175,
                            max: Infinity,
                        },
                        height: {
                            min: 175,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -70,
                        heightOffset: -70,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },

        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Лидс_2

    5591091: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 176,
                            max: Infinity,
                        },
                        height: {
                            min: 176,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -19,
                        heightOffset: -19,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -70.5,
                        heightOffset: -70.5,
                    },
                },
            ],
        },

        {
            name: "Small",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: 175,
                        },
                        height: {
                            min: 176,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -19,
                        heightOffset: -19,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },

        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Лестер_2

    5591086: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="
                                M -(wth - radius) -hgh 
                                L (wth - radius) -hgh 
                                A radius radius 0 0 1 wth (-hgh + radius) 
                                L wth (hgh - radius) 
                                A radius radius 0 0 1 (wth - radius) hgh 
                                L -(wth - radius) hgh 
                                A radius radius 0 0 1 -wth (hgh - radius) 
                                L -wth -(hgh - radius) 
                                A radius radius 0 0 1 (-wth + radius) -hgh 
                                Z" 
                            />`,
                        widthOffset: -55,
                        heightOffset: -55,
                        radius: 5.34
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Дрезден_2

    2475715: [], // Ручка_1

    3716541: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="
                                M 60 0 L -60 0 A 1 1 0 0 1 60 0 Z" 
                            />`,
                        widthOffset: 0,
                        heightOffset: 0,
                        topPosition: 20,
                        radius: 0
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ], // Ручка_2

    3716547: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 10,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7,
                bevelOffset: 0,
                bevelSegments: 16,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="
                               M 0 0 L -85 0 L -85 0 A -20 -20 0 0 1 -70 -22 L 70 -22 A -20 -20 0 0 1 85 0 Z" 
                            />`,
                        widthOffset: 0,
                        heightOffset: 0,
                        topPosition: 5,
                        radius: 0
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ],  // Ручка_3

    2462673: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 2,
                bevelEnabled: false,
            },
            figureParams: [
                {
                    nameCondition: "small_width",
                    condition: {
                        width: {
                            min: 70,
                            max: 295,
                        },
                        height: {
                            min: 396,
                            max: 2500,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh,+76.55 L wth -hgh,+76.55 L wth hgh,-76.55 L -wth hgh,-76.55 L -wth -hgh,+76.55 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh,+83.45 L wth -hgh,+83.45 L wth hgh,-83.45 L -wth hgh,-83.45 L -wth -hgh,+83.45 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
                {
                    nameCondition: "small_height",
                    condition: {
                        width: {
                            min: 396,
                            max: 1250,
                        },
                        height: {
                            min: 56,
                            max: 295,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth,+76.55 -hgh L wth,-76.55 -hgh L wth,-76.55 hgh L -wth,+76.55 hgh L -wth,+76.55 -hgh Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<path d="M -wth,+83.45 -hgh L wth,-83.45 -hgh L wth,-83.45 hgh L -wth,+83.45 hgh L -wth,+83.45 -hgh Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 296,
                            max: Infinity,
                        },
                        height: {
                            min: 457,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth,+76.55 -hgh L -wth,+83.45 -hgh L -wth,+83.45 -hgh,+76.55
                                  L wth,-83.45 -hgh,+76.55 L wth,-83.45 -hgh L wth,-76.55 -hgh L wth,-76.55 hgh
                                  L wth,-83.45 hgh L wth,-83.45 hgh,-76.55 L -wth,+83.45 hgh,-76.55 L -wth,+83.45 hgh
                                  L -wth,+76.55 hgh L -wth,+76.55 -hgh Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<path d="M -wth,+83.45 -hgh,+83.45 L wth,-83.45 -hgh,+83.45
                                  L wth,-83.45 hgh,-83.45 L -wth,+83.45 hgh,-83.45 L -wth,+83.45 -hgh,+83.45 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
                {
                    nameCondition: "default_rotated",
                    condition: {
                        width: {
                            min: 296,
                            max: Infinity,
                        },
                        height: {
                            min: 296,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh,+76.55 L -wth -hgh,+83.45 L -wth,+76.55 -hgh,+83.45
                                         L -wth,+76.55 hgh,-83.45 L -wth hgh,-83.45 L -wth hgh,-76.55 L wth hgh,-76.55
                                         L wth hgh,-83.45 L wth,-76.55 hgh,-83.45 L wth,-76.55 -hgh,+83.45 L wth -hgh,+83.45
                                         L wth -hgh,+76.55 L -wth -hgh,+76.55 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<path d="M -wth,+83.45 -hgh,+83.45 L wth,-83.45 -hgh,+83.45
                                  L wth,-83.45 hgh,-83.45 L -wth,+83.45 hgh,-83.45 L -wth,+83.45 -hgh,+83.45 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
    ],

    5591083: [
        {
            name: "milling_1",
            hem: true,
            extrudeSettings: {
                steps: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 0,
                            max: Infinity,
                        },
                        height: {
                            min: 0,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M 0 0 L 16.5 0 C 16 -2 15 -3 13.5 -3 L 7.6 -3 C 6.5 -3 5.9 -3.6 5.5 -4.3 C 4.9 -5.4 4 -5.5 3 -5.5 L 2 -5.5 C 1 -5.5 0 -6.5 0 -7.5 L 0 0 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0.1,
                bevelEnabled: true,
                bevelThickness: 3.1,
                bevelSize: 5.49,
                bevelOffset: -5.49,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "small_width",
                    condition: {
                        width: {
                            min: 146,
                            max: 175,
                        },
                        height: {
                            min: 296,
                            max: 2500,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh Z"/>`,
                        widthOffset: 7,
                        heightOffset: 7,
                    },
                    hole: {
                        svg: `<svg>
                                    <path d="M -wth,+7 -hgh,+7 L -wth,+48 -hgh,+7 L -wth,+48 hgh,-7 L -wth,+7 hgh,-7 Z"/>
                                    <path d="M -wth,+62 -hgh,+7 L wth,-62 -hgh,+7 L wth,-62 -hgh,+63 L -wth,+62 -hgh,+63 Z"/>
                                    <path d="M wth,-48 -hgh,+7 L wth,-7 -hgh,+7 L wth,-7 hgh,-7 L wth,-48 hgh,-7 Z"/>
                                    <path d="M -wth,+62 hgh,-63 L wth,-62 hgh,-63 L wth,-62 hgh,-7 L -wth,+62 hgh,-7 Z"/>
                                </svg>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
                {
                    nameCondition: "small_height",
                    condition: {
                        width: {
                            min: 296,
                            max: 1250,
                        },
                        height: {
                            min: 146,
                            max: 175,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh Z"/>`,
                        widthOffset: 7,
                        heightOffset: 7,
                    },
                    hole: {
                        svg: `<svg>
                                    <path d="M -wth,+7 -hgh,+7 L -wth,+63 -hgh,+7 L -wth,+63 hgh,-7 L -wth,+7 hgh,-7 Z"/>
                                    <path d="M -wth,+77 -hgh,+7 L wth,-77 -hgh,+7 L wth,-77 -hgh,+48 L -wth,+77 -hgh,+48 Z"/>
                                    <path d="M wth,-63 -hgh,+7 L wth,-7 -hgh,+7 L wth,-7 hgh,-7 L wth,-63 hgh,-7 Z"/>
                                    <path d="M -wth,+77 hgh,-48 L wth,-77 hgh,-48 L wth,-77 hgh,-7 L -wth,+77 hgh,-7 Z"/>
                                </svg>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 176,
                            max: Infinity,
                        },
                        height: {
                            min: 176,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh Z"/>`,
                        widthOffset: 16.5,
                        heightOffset: 16.5,
                    },
                    hole: {
                        svg: `<svg>
                                    <path d="M -wth,+16.5 -hgh,+22 L -wth,+74.5 -hgh,+82.3 L -wth,+74.5 hgh,-82.3 L -wth,+16.5 hgh,-22 Z"/>
                                    <path d="M -wth,+22 -hgh,+16.5 L wth,-22 -hgh,+16.5 L +wth,-82.3 -hgh,+74.5 L -wth,+82.3 -hgh,+74.5 Z"/>
                                    <path d="M wth,-74.5 -hgh,+82.3 L wth,-16.5 -hgh,+22 L wth,-16.5 hgh,-22 L wth,-74.5 hgh,-82.3 Z"/>
                                    <path d="M -wth,+82.3 hgh,-74.5 L wth,-82.3 hgh,-74.5 L wth,-22 hgh,-16.5 L -wth,+22 hgh,-16.5 Z"/>
                                    <path d="M -wth,+85.5 -hgh,+85.5 L wth,-85.5 -hgh,+85.5 L wth,-85.5 hgh,-85.5 L -wth,+85.5 hgh,-85.5 Z"/>
                                </svg>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
    ],

    2051525: [
        {
            name: "milling_1",
            hem: true,
            extrudeSettings: {
                steps: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 0,
                            max: Infinity,
                        },
                        height: {
                            min: 0,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M 0 0 L 16.5 0 C 16 -2 15 -3 13.5 -3 L 7.6 -3 C 6.5 -3 5.9 -3.6 5.5 -4.3 C 4.9 -5.4 4 -5.5 3 -5.5 L 2 -5.5 C 1 -5.5 0 -6.5 0 -7.5 L 0 0 Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: ``,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0.1,
                bevelEnabled: true,
                bevelThickness: 3.1,
                bevelSize: 5.49,
                bevelOffset: -5.49,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "small_width",
                    condition: {
                        width: {
                            min: 146,
                            max: 175,
                        },
                        height: {
                            min: 296,
                            max: 2500,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh Z"/>`,
                        widthOffset: 7,
                        heightOffset: 7,
                    },
                    hole: {
                        svg: `<svg>
                                    <path d="M -wth,+7 -hgh,+7 L -wth,+48 -hgh,+7 L -wth,+48 hgh,-7 L -wth,+7 hgh,-7 Z"/>
                                    <path d="M -wth,+62 -hgh,+7 L wth,-62 -hgh,+7 L wth,-62 -hgh,+63 L -wth,+62 -hgh,+63 Z"/>
                                    <path d="M wth,-48 -hgh,+7 L wth,-7 -hgh,+7 L wth,-7 hgh,-7 L wth,-48 hgh,-7 Z"/>
                                    <path d="M -wth,+62 hgh,-63 L wth,-62 hgh,-63 L wth,-62 hgh,-7 L -wth,+62 hgh,-7 Z"/>
                                </svg>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
                {
                    nameCondition: "small_height",
                    condition: {
                        width: {
                            min: 296,
                            max: 1250,
                        },
                        height: {
                            min: 146,
                            max: 175,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh Z"/>`,
                        widthOffset: 7,
                        heightOffset: 7,
                    },
                    hole: {
                        svg: `<svg>
                                    <path d="M -wth,+7 -hgh,+7 L -wth,+63 -hgh,+7 L -wth,+63 hgh,-7 L -wth,+7 hgh,-7 Z"/>
                                    <path d="M -wth,+77 -hgh,+7 L wth,-77 -hgh,+7 L wth,-77 -hgh,+48 L -wth,+77 -hgh,+48 Z"/>
                                    <path d="M wth,-63 -hgh,+7 L wth,-7 -hgh,+7 L wth,-7 hgh,-7 L wth,-63 hgh,-7 Z"/>
                                    <path d="M -wth,+77 hgh,-48 L wth,-77 hgh,-48 L wth,-77 hgh,-7 L -wth,+77 hgh,-7 Z"/>
                                </svg>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 176,
                            max: Infinity,
                        },
                        height: {
                            min: 176,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh Z"/>`,
                        widthOffset: 16.5,
                        heightOffset: 16.5,
                    },
                    hole: {
                        svg: `<svg>
                                    <path d="M -wth,+16.5 -hgh,+22 L -wth,+74.5 -hgh,+82.3 L -wth,+74.5 hgh,-82.3 L -wth,+16.5 hgh,-22 Z"/>
                                    <path d="M -wth,+22 -hgh,+16.5 L wth,-22 -hgh,+16.5 L +wth,-82.3 -hgh,+74.5 L -wth,+82.3 -hgh,+74.5 Z"/>
                                    <path d="M wth,-74.5 -hgh,+82.3 L wth,-16.5 -hgh,+22 L wth,-16.5 hgh,-22 L wth,-74.5 hgh,-82.3 Z"/>
                                    <path d="M -wth,+82.3 hgh,-74.5 L wth,-82.3 hgh,-74.5 L wth,-22 hgh,-16.5 L -wth,+22 hgh,-16.5 Z"/>
                                    <path d="M -wth,+85.5 -hgh,+85.5 L wth,-85.5 -hgh,+85.5 L wth,-85.5 hgh,-85.5 L -wth,+85.5 hgh,-85.5 Z"/>
                                </svg>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
    ],

    3971695: [
        {
            name: "milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0.01,
                bevelEnabled: true,
                bevelThickness: 3.99,
                bevelSize: 7,
                bevelOffset: -7,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "small_width",
                    condition: {
                        width: {
                            min: 146,
                            max: 195,
                        },
                        height: {
                            min: 716,
                            max: 2500,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -48,
                        heightOffset: -63,
                    },
                    hole: {
                        svg: `<path d="M -wth,+14 -hgh,+14 L -wth,+14 hgh,-14 L wth,-14 hgh,-14 L wth,-14 -hgh,+14 L -wth,+14 -hgh,+14 Z"/>`,
                        widthOffset: -48,
                        heightOffset: -63,
                    },
                },
                {
                    nameCondition: "small_height",
                    condition: {
                        width: {
                            min: 396,
                            max: 900,
                        },
                        height: {
                            min: 150,
                            max: 195,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -63,
                        heightOffset: -48,
                    },
                    hole: {
                        svg: `<path d="M -wth,+14 -hgh,+14 L -wth,+14 hgh,-14 L wth,-14 hgh,-14 L wth,-14 -hgh,+14 L -wth,+14 -hgh,+14 Z"/>`,
                        widthOffset: -63,
                        heightOffset: -48,
                    },
                },
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 196,
                            max: Infinity,
                        },
                        height: {
                            min: 196,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -63,
                        heightOffset: -63,
                    },
                    hole: {
                        svg: `<path d="M -wth,+14 -hgh,+14 L -wth,+14 hgh,-14 L wth,-14 hgh,-14 L wth,-14 -hgh,+14 L -wth,+14 -hgh,+14 Z"/>`,
                        widthOffset: -63,
                        heightOffset: -63,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            extrudeSettings: {
                steps: 1,
                depth: 0.01,
                bevelEnabled: true,
                bevelThickness: 0.99,
                bevelSize: 9.99,
                bevelOffset: -9.99,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 10,
                        heightOffset: 10,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -10,
                        heightOffset: -10,
                    },
                },
            ],
        },
    ],

    2503143: [
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: 175,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: -0.75,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 176,
                            max: Infinity,
                        },
                        height: {
                            min: 176,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<svg>
                                   <path d="
                                        M -(wth - 2.5) -(hgh -7.5) 
                                        L -2 -150 
                                        L -(wth - 2.5) (hgh -7.5)
                                        Z 

                                        M -(wth - 5) -(hgh - 5) 
                                        L (wth - 5) -(hgh - 5) 
                                        L 0 -152
                                        Z 

                                        M 2 -150
                                        L (wth - 2.5) -(hgh - 7.5)  
                                        L (wth - 2.5) (hgh - 2.5) 
                                        Z 
 
                                        M 0 -148
                                        L (wth - 5) (hgh - 2.5) 
                                        L -(wth - 5) (hgh - 2.5)  
                                        Z 
                                    "/>
                                </svg>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
    ], // Сатурн тип 2

    2503142: [
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 1,
                depth: 1.5,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: 175,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
        {
            name: "milling_2",
            extrudeSettings: {
                steps: 1,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 4,
                bevelOffset: -0.75,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 176,
                            max: Infinity,
                        },
                        height: {
                            min: 176,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh Z"/>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                    hole: {
                        svg: `<svg>
                                   <path d="
                                        M (wth - 2.5) (hgh - 7.5)
                                        L 2 150
                                        L (wth - 2.5) -(hgh - 7.5)
                                        Z
                                                                
                                        M (wth - 5) (hgh - 5)
                                        L -(wth - 5) (hgh - 5)
                                        L 0 152
                                        Z
                                                                
                                        M -2 150
                                        L -(wth - 2.5) (hgh - 7.5)
                                        L -(wth - 2.5) -(hgh - 7.5)
                                        Z
                                                                
                                        M 0 148
                                        L -(wth - 5) -(hgh - 2.5)
                                        L (wth - 5) -(hgh - 2.5)
                                        Z
                                    "/>
                                </svg>`,
                        widthOffset: 0,
                        heightOffset: 0,
                    },
                },
            ],
        },
    ], // Сатурн тип  1

    1906033:[
        {
            name: "Line",
            extrudeSettings: {
                steps: 1,
                depth: 1,
                bevelEnabled: true,
                bevelThickness: 0,
                bevelSize: 0,
                bevelOffset: 0,
                bevelSegments: 1,
            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 146,
                            max: Infinity,
                        },
                        height: {
                            min: 146,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M 0 3 L -5.2 0 L 5.2 0 Z"/>
                            `,
                        widthOffset: 0,
                        heightOffset: 0,
                        pattern:{
                            offset:30
                        },
                        boolParams: {
                            depth: {
                                offset: 3,
                                size: "FASADE_HEIGHT"
                            },
                            position: {
                                top: false,
                                bottom: true,
                                front: -8,
                                left: true,
                                right: false,
                                centerVertical: true
                            },
                            rotate: {
                                x: -Math.PI * 0.5,
                                z: -Math.PI
                            }
                        }
                    },
                    hole: {
                        svg: ``,
                        widthOffset: -0,
                        heightOffset: -0,
                    },
                },
            ],
        },
        {
            name: "corner_milling_1",
            isCorner: true,
            extrudeSettings: {
                steps: 0,
                depth: 0,
                bevelEnabled: true,
                bevelThickness: 4,
                bevelSize: 7.5,
                bevelOffset: -7.5,
                bevelSegments: 1,

            },
            figureParams: [
                {
                    nameCondition: "default",
                    condition: {
                        width: {
                            min: 20,
                            max: Infinity,
                        },
                        height: {
                            min: 20,
                            max: Infinity,
                        },
                    },
                    figure: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: 7.5,
                        heightOffset: 7.5,
                    },
                    hole: {
                        svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
                        widthOffset: -7.5,
                        heightOffset: -7.5,
                    },
                },
            ],
        },
    ] // Вертикаль широкая
}


const exampleHard = [
    {
        name: "Left",
        extrudeSettings: {
            steps: 1,
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 1,
        },
        figureParams: [
            {
                nameCondition: "default",
                condition: {
                    width: {
                        min: 146,
                        max: Infinity,
                    },
                    height: {
                        min: 146,
                        max: Infinity,
                    },
                },
                figure: {
                    svg: `<path d="M -21 -9 L -19.5 -7.5 L -16.5 -7.5 L -7.5 0 L 7.5 0 L 16.5 -7.5 L 21 -7.5 L 21 -9 Z"/>
                        `,
                    widthOffset: 0,
                    heightOffset: 0,

                    boolParams: {
                        depth: {
                            offset: 57,
                            size: "FASADE_HEIGHT"
                        },
                        position: {
                            top: false,
                            bottom: true,
                            front: 1,
                            left: true,
                            right: false,
                            centerVertical: true
                        },
                        rotate: {
                            x: -Math.PI * 0.5,
                            z: -Math.PI
                        }
                    }
                },
                hole: {
                    svg: ``,
                    widthOffset: -0,
                    heightOffset: -0,
                },
            },
        ],
    },
    {
        name: "Right",
        extrudeSettings: {
            steps: 1,
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 1,
        },
        figureParams: [
            {
                nameCondition: "default",
                condition: {
                    width: {
                        min: 146,
                        max: Infinity,
                    },
                    height: {
                        min: 146,
                        max: Infinity,
                    },
                },
                figure: {
                    svg: `<path d="M -21 -9 L -19.5 -7.5 L -16.5 -7.5 L -7.5 0 L 7.5 0 L 16.5 -7.5 L 21 -7.5 L 21 -9 Z"/>
                        `,
                    widthOffset: 0,
                    heightOffset: 0,

                    boolParams: {
                        depth: {
                            offset: 57,
                            size: "FASADE_HEIGHT"
                        },
                        position: {
                            top: false,
                            bottom: true,
                            front: 1,
                            left: false,
                            right: true,
                            centerVertical: true
                        },
                        rotate: {
                            x: -Math.PI * 0.5,
                            z: -Math.PI
                        }
                    }
                },
                hole: {
                    svg: ``,
                    widthOffset: -0,
                    heightOffset: -0,
                },
            },
        ],
    },
    {
        name: "Top",
        extrudeSettings: {
            steps: 1,
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 1,
        },
        figureParams: [
            {
                nameCondition: "default",
                condition: {
                    width: {
                        min: 146,
                        max: Infinity,
                    },
                    height: {
                        min: 146,
                        max: Infinity,
                    },
                },
                figure: {
                    svg: `<path d="M -21 -9 L -19.5 -7.5 L -16.5 -7.5 L -7.5 0 L 7.5 0 L 16.5 -7.5 L 21 -7.5 L 21 -9 Z"/>
                        `,
                    widthOffset: 0,
                    heightOffset: 0,

                    boolParams: {
                        depth: {
                            offset: 57,
                            size: "FASADE_WIDTH"
                        },
                        position: {
                            top: true,
                            bottom: false,
                            front: 1,
                            left: false,
                            right: false,
                            centerHorizontal: true
                        },
                        rotate: {
                            x: -Math.PI * 0.5,
                            z: -Math.PI,
                            y: Math.PI * 0.5
                        }
                    }
                },
                hole: {
                    svg: ``,
                    widthOffset: -0,
                    heightOffset: -0,
                },
            },
        ],
    },
    {
        name: "Bottom",
        extrudeSettings: {
            steps: 1,
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 1,
        },
        figureParams: [
            {
                nameCondition: "default",
                condition: {
                    width: {
                        min: 146,
                        max: Infinity,
                    },
                    height: {
                        min: 146,
                        max: Infinity,
                    },
                },
                figure: {
                    svg: `<path d="M -21 -9 L -19.5 -7.5 L -16.5 -7.5 L -7.5 0 L 7.5 0 L 16.5 -7.5 L 21 -7.5 L 21 -9 Z"/>
                        `,
                    widthOffset: 0,
                    heightOffset: 0,

                    boolParams: {
                        depth: {
                            offset: 57,
                            size: "FASADE_WIDTH"
                        },
                        position: {
                            top: false,
                            bottom: true,
                            front: 1,
                            left: false,
                            right: false,
                            centerHorizontal: true
                        },
                        rotate: {
                            x: -Math.PI * 0.5,
                            z: -Math.PI,
                            y: Math.PI * 0.5
                        }
                    }
                },
                hole: {
                    svg: ``,
                    widthOffset: -0,
                    heightOffset: -0,
                },
            },
        ],
    },
]