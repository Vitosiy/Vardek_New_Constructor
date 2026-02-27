import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import ExternalFasadesManager from "@/components/UMconstructor/ts/modules/ExternalFasadesManager.ts";
import {FasadeMaterial, FasadeObject, LOOPSIDE} from "./../../types/UMtypes.ts";
import * as THREE from "three";
import {TFasadeTrueSizes} from "@/types/types.ts";
import {useConversationActions} from "@/components/right-menu/actions/useConversationActions.ts";


export default class FasadesManager {
    scope: UMconstructorClass
    EXTERNAL_FASADES: ExternalFasadesManager
    FASADES_CONVERSATION: ReturnType<typeof useConversationActions> = useConversationActions();

    constructor(scope: UMconstructorClass) {
        this.scope = scope;
        this.EXTERNAL_FASADES = new ExternalFasadesManager(this);
    }
    selectCell(sec: number|null = 0, cell: number | null = null, row: number | null = null) {
        this.scope.UM_STORE.setSelected("fasades", {sec, cell, row});
    };

    getFasadePosition = (_position) => {

        const PROPS = productData.value.PROPS;
        let fasadePosition = APP.FASADE_POSITION[_position];

        if (!fasadePosition)
            return {}

        fasadePosition = builder.getExec(
            builder.expressionsReplace(fasadePosition,
                Object.assign(PROPS.CONFIG.EXPRESSIONS,
                    {
                        "#X#": totalWidth.value,
                        "#Y#": totalHeight.value - (module.value.isRestrictedModule ? 0 : module.value.horizont),
                        "#Z#": totalDepth.value,
                    }))
        )

        return fasadePosition
    }

    getFasadePositionMinMax = (fasade) => {
        const fasadeColor = APP.FASADE[fasade.material.COLOR]
        const fasadePosition = getFasadePosition(fasade.material.POSITION)

        return {
            minY: MIN_FASADE_HEIGHT,
            maxY: fasadeColor.MAX_HEIGHT || fasadePosition.FASADE_HEIGHT,
            maxX: fasadeColor.MAX_WIDTH || MAX_FASADE_WIDTH,
            minX: MIN_FASADE_WIDTH,
        }
    }

    updateFasades = () => {
        const {PROPS} = modelState.getCurrentModel.userData;
        const {PRODUCT} = PROPS

        let productInfo = APP.CATALOG.PRODUCTS[PRODUCT];
        let fasadePosition = getFasadePosition(productInfo.FASADE_POSITION[0]);

        const correctFasadeHeight = fasadePosition.FASADE_HEIGHT;
        const leftWidth = module.value.leftWallThickness || module.value.moduleThickness;
        const rightWidth = module.value.rightWallThickness || module.value.moduleThickness;

        if (!module.value.isSlidingDoors)
            module.value.sections.forEach((section, secIndex) => {

                if (section.fasades?.[0]) {
                    const countDoors = section.fasades.length;

                    const correctSectionFasadeWidth =
                        module.value.sections.length > 1 ?
                            secIndex > 0 && secIndex < module.value.sections.length - 1 ? section.width + module.value.moduleThickness - 4 :
                                section.width + ((secIndex == 0 ? leftWidth : rightWidth) - 2) + (module.value.moduleThickness / 2 - 2) :
                            module.value.width - 4;

                    const correctSectionFasadeWidthDoor = Math.floor(correctSectionFasadeWidth / countDoors - ((countDoors - 1) * 2));

                    const sumDoorsWidth = Math.floor(section.fasades.reduce(
                        (accumulator, item, index) => accumulator + item[0].width + (index > 0 ? 4 : 0),
                        0) / countDoors - ((countDoors - 1) * 2));
                    const sumDoorsHeight = section.fasades[0].reduce(
                        (accumulator, item, index) => accumulator + item.height + (index > 0 ? 4 : 0),
                        0);

                    const deltaWidth = correctSectionFasadeWidthDoor - sumDoorsWidth;
                    const deltaHeight = correctFasadeHeight - sumDoorsHeight;

                    if (deltaWidth !== 0) {
                        section.fasades.forEach((door, doorIndex) => {
                            door.forEach((segment) => {

                                let fasadeMinMax = getFasadePositionMinMax(segment)
                                Object.entries(fasadeMinMax).forEach(([key, value]) => {
                                    segment[key] = value;
                                })

                                segment.width += deltaWidth;

                                if (secIndex !== 0) {
                                    segment.position.x = section.position.x - section.width / 2 - module.value.moduleThickness / 2 + 2 + ((segment.width + 4) * doorIndex);
                                } else if (doorIndex > 0) {
                                    segment.position.x += deltaWidth;
                                }

                                const checkConversation = checkFasadeConversations(
                                    segment.material.COLOR,
                                    <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
                                );

                                if (!checkConversation || segment.width < segment.minX || segment.height < segment.minY)
                                    segment.error = true
                                else
                                    delete segment.error;
                            })
                        })
                    }

                    if (deltaHeight !== 0) {
                        section.fasades.forEach((door) => {
                            door.forEach((segment) => {
                                let fasadeMinMax = getFasadePositionMinMax(segment)
                                Object.entries(fasadeMinMax).forEach(([key, value]) => {
                                    segment[key] = value;
                                })
                            })

                            let lastSegment = door[0]
                            if (!lastSegment.manufacturerOffset) {
                                lastSegment.height += deltaHeight;

                                const checkConversation = checkFasadeConversations(
                                    lastSegment.material.COLOR,
                                    <TFasadeTrueSizes>{FASADE_WIDTH: lastSegment.width, FASADE_HEIGHT: lastSegment.height}
                                );

                                if (!checkConversation || lastSegment.height < lastSegment.minY || lastSegment.width < lastSegment.minX)
                                    lastSegment.error = true
                                else
                                    delete lastSegment.error;
                            }
                        })
                    }

                }

                if (section.fasadesDrawers?.length || section.hiTechProfiles?.length) {
                    calcDrawersFasades(secIndex)
                }

                calcLoops(secIndex)
            })
        else {
            module.value.fasades.forEach((door, doorIndex) => {
                let tmp_fasadePosition = calcSlideDoor(door[0].material.POSITION, doorIndex + 1)

                const sumDoorsHeight = door.reduce(
                    (accumulator, item) => accumulator + item.height,
                    0);
                const deltaHeight = tmp_fasadePosition.FASADE_HEIGHT - sumDoorsHeight;

                door[door.length - 1].height += deltaHeight;
                if (door[door.length - 1].height < door[door.length - 1].minY) {
                    door[0].height = tmp_fasadePosition.FASADE_HEIGHT
                    door = [door[0]]
                    return;
                } else
                    door.forEach((segment) => {
                        let fasadeMinMax = getFasadePositionMinMax(segment)
                        Object.entries(fasadeMinMax).forEach(([key, value]) => {
                            segment[key] = value;
                        })

                        segment.width = tmp_fasadePosition.FASADE_WIDTH
                        segment.position.x = tmp_fasadePosition.POSITION_X
                        segment.position.z = tmp_fasadePosition.POSITION_Z

                        const checkConversation = checkFasadeConversations(
                            segment.material.COLOR,
                            <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
                        );

                        if (!checkConversation || segment.width < segment.minX || segment.height < segment.minY)
                            segment.error = true
                        else
                            delete segment.error;
                    })
            })
        }
    };

    calcSlideDoor = (fasadePositionID, doorNumber, callback) => {
        const PROPS = productData.value.PROPS;

        const fasadeThickness = module.value?.moduleThickness || 18

        const doorsCount = module.value?.fasades?.length || 2
        const doorsPortalWidth = totalWidth.value - fasadeThickness * 2
        const horizont = module.value?.horizont || 78

        let fasadePosition = Object.assign({}, APP.FASADE_POSITION[fasadePositionID]);

        let fasade_width
        switch (doorsCount) {
            case 4:
                fasade_width = (doorsPortalWidth + 25 * 2) / 4
                break;
            default:
                fasade_width = (doorsPortalWidth + 25 * (doorsCount - 1)) / doorsCount
                break;
        }
        fasade_width = Math.ceil(fasade_width)

        fasadePosition = builder.getExec(
            builder.expressionsReplace(
                fasadePosition,
                Object.assign(PROPS.CONFIG.EXPRESSIONS,
                    {
                        "#X#": fasade_width,
                        "#Y#": totalHeight.value - horizont,
                        "#Z#": totalDepth.value,
                        "#FASADE_THICKNESS#": fasadeThickness || 0,
                    })
            )
        );

        //Вычитаем размеры направляющих в дверях-купе
        fasadePosition.FASADE_HEIGHT -= fasadeThickness * 2
        fasadePosition.DOORS_OVERFLOW = Math.abs(doorsPortalWidth - fasadePosition.FASADE_WIDTH * doorsCount) / (doorsCount - 1)

        fasadePosition.POSITION_Y = 11

        fasadePosition.POSITION_Y += horizont + fasadeThickness
        fasadePosition.POSITION_X += fasadeThickness

        if (doorNumber > 1) {
            switch (doorsCount) {
                case 4:
                    switch (doorNumber) {
                        case 4:
                            fasadePosition.POSITION_X -= 50
                            break;
                        default:
                            fasadePosition.POSITION_X -= 25
                            break;
                    }
                    break;
                default:
                    fasadePosition.POSITION_X -= 25 * (doorNumber - 1)
                    break;
            }
        }

        if (doorNumber && fasadePosition.FASADE_NUMBER != doorNumber) {
            fasadePosition.FASADE_NUMBER = doorNumber
        }

        if (doorNumber > 1) {
            fasadePosition.POSITION_X += fasadePosition.FASADE_WIDTH * (doorNumber - 1)
        }

        if (callback)
            callback(fasadePosition)
        else
            return fasadePosition
    }

    handleCellSelect = (secIndex, cellIndex = null, rowIndex = null) => {
        selectedFasade.value = { sec: secIndex, cell: cellIndex, row: rowIndex };

        //Задержка нужна для того, чтоб рендер аккордионов обновился
        setTimeout(() => {
            let idTag = `fasade_${secIndex}`

            if(cellIndex !== null)
                idTag += `_${cellIndex}`;

            if(rowIndex !== null)
                idTag += `_${rowIndex}`

            let domElem = document.getElementById(idTag)
            if(domElem) {
                domElem.scrollIntoView();
            }
            timer.value = false
        }, 10)

    };

    updateFasades = () => {
        emit("product-updateFasades");
    };

    calcSlideDoor = (positionId, doorIndex, callback) => {
        emit("product-calcSlideDoor", positionId, doorIndex, callback);
    };

    calcLoops = (secIndex) => {
        emit("product-calcLoops", secIndex);
    };

    checkLoopsCollision = (
        secIndex,
        cellIndex = null,
        rowIndex = null,
        segmentIndex = null
    ) => {
        emit(
            "product-checkLoopsCollision",
            secIndex,
            cellIndex,
            rowIndex,
            segmentIndex
        );
    };

    calcDrawersFasades = (secIndex) => {
        emit("product-calcDrawersFasades", secIndex);
    };

    getFasadePositionMinMax = (fasade) => {
        return emit("product-getFasadePositionMinMax", fasade);
    };

    getFasadePosition = (position) => {
        let fasadePosition = APP.FASADE_POSITION[position];

        fasadePosition = builder.getExec(
            builder.expressionsReplace(fasadePosition,
                Object.assign(props.moduleProps.CONFIG.EXPRESSIONS,
                    {
                        "#X#": module.value.width,
                        "#Y#": module.value.height - (module.value.isRestrictedModule ? 0 : module.value.horizont),
                        "#Z#": module.value.depth,
                    }))
        )

        return fasadePosition;
    };

    addSlideDoor = (doorIndex) => {
        const fasades = module.value.fasades;

        let newDoor;
        switch (doorIndex) {
            case 4:
                fasades[doorIndex - 2].forEach(
                    (item) => (item.material.POSITION = fasades[1][0].material.POSITION)
                );
                newDoor = fasades[0][0];
                break;
            default:
                if (doorIndex % 2 === 0) newDoor = fasades[1][0];
                else newDoor = fasades[0][0];
                break;
        }

        let newFasade = <FasadeObject>{
            ...newDoor,
            id: doorIndex,
            material: <FasadeMaterial>{ ...newDoor.material, HANDLES: {...newDoor.material.HANDLES} },
        };

        fasades.push([newFasade]);

        const callback = (fasadePosition) => {
            newFasade.width = fasadePosition.FASADE_WIDTH;
            newFasade.height = fasadePosition.FASADE_HEIGHT;
            newFasade.position = new THREE.Vector3(
                fasadePosition.POSITION_X,
                fasadePosition.POSITION_Y,
                fasadePosition.POSITION_Z
            );

            let checkConversation = checkFasadeConversations(
                newFasade.material.COLOR,
                <TFasadeTrueSizes>{FASADE_WIDTH: newFasade.width, FASADE_HEIGHT: newFasade.height}
            );
            if (!checkConversation || newFasade.width < newFasade.minX || newFasade.height < newFasade.minY)
                newFasade.error = true;
            else delete newFasade.error;

            //Пересчитываем параметры старых дверей
            fasades.forEach((door, index) => {
                if (index + 1 !== doorIndex) {
                    calcSlideDoor(
                        door[0].material.POSITION,
                        index + 1,
                        (tmp_fasadePosition) => {
                            door.forEach((segment, segmentIndex) => {
                                segment.width = tmp_fasadePosition.FASADE_WIDTH;
                                segment.position.x = tmp_fasadePosition.POSITION_X;
                                segment.position.z = tmp_fasadePosition.POSITION_Z;

                                checkConversation = checkFasadeConversations(
                                    segment.material.COLOR,
                                    <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
                                );
                                if (!checkConversation || segment.width < segment.minX || segment.height < segment.minY)
                                    segment.error = true;
                                else delete segment.error;
                            });
                        }
                    );
                }
            });

            // Обновляем рендер
            visualizationRef.value.renderGrid();
        };

        calcSlideDoor(newDoor.material.POSITION, doorIndex, callback);
    };

    deleteSlideDoor = (doorIndex) => {
        const fasades = module.value.fasades;

        if (doorIndex === 4)
            fasades[doorIndex - 2].forEach(
                (item) => (item.material.POSITION = fasades[0][0].material.POSITION)
            );

        fasades.pop();

        //Пересчитываем параметры старых дверей
        fasades.forEach((door, index) => {
            calcSlideDoor(
                door[0].material.POSITION,
                index + 1,
                (tmp_fasadePosition) => {
                    door.forEach((segment, segmentIndex) => {
                        segment.width = tmp_fasadePosition.FASADE_WIDTH;
                        segment.position.x = tmp_fasadePosition.POSITION_X;
                        segment.position.z = tmp_fasadePosition.POSITION_Z;

                        let checkConversation = checkFasadeConversations(
                            segment.material.COLOR,
                            <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
                        );

                        if (!checkConversation || segment.width < segment.minX || segment.height < segment.minY)
                            segment.error = true;
                        else delete segment.error;
                    });
                }
            );
        });

        selectedFasade.value.cell = 0;
        selectedFasade.value.sec = null;

        visualizationRef.value.renderGrid();
    };

    addDoor = (secIndex) => {
        const section = module.value.sections[secIndex];
        const leftWidth = module.value.leftWallThickness || module.value.moduleThickness;
        const rightWidth = module.value.rightWallThickness || module.value.moduleThickness;

        const width = section.fasades[0]?.[0] ? Math.floor(section.fasades[0][0].width / 2 - 2) :
            module.value.sections.length === 1 ? module.value.width - 4 :
                (secIndex > 0 && secIndex < module.value.sections.length - 1) ? section.width + module.value.moduleThickness - 4 :
                    section.width + ((secIndex == 0 ? leftWidth : rightWidth) - 2) + (module.value.moduleThickness / 2 - 2);

        let firstFasade, newDoorPosition;
        if (section.fasades[0]?.length) {
            section.fasades[0].map((item) => {
                item.width = width;
            });

            firstFasade = section.fasades[0][0];
            newDoorPosition = new THREE.Vector2(
                firstFasade.position.x + width + 4,
                firstFasade.position.y
            );
        } else {
            const PROPS = props.moduleProps;

            const FASADE_PROPS = PROPS.CONFIG.FASADE_PROPS[0];
            const FASADE = getFasadePosition(FASADE_PROPS.POSITION);

            let startX = secIndex > 0 ? section.position.x - section.width / 2 - module.value.moduleThickness / 2 + 2 : FASADE.POSITION_X;

            newDoorPosition = new THREE.Vector2(startX, module.value.isRestrictedModule ? FASADE.POSITION_Y : module.value.horizont + 2);
            firstFasade = <FasadeObject>{
                id: 1,
                width,
                height: module.value.height - module.value.horizont - 4,
                position: newDoorPosition,
                type: "fasade",
                material: <FasadeMaterial>{
                    ...FASADE_PROPS,
                    HANDLES: {...FASADE_PROPS.HANDLES},
                },
            };
            let fasadeMinMax = getFasadePositionMinMax(firstFasade);
            firstFasade = Object.assign(firstFasade, fasadeMinMax);
        }

        let checkConversation = checkFasadeConversations(
            firstFasade.material.COLOR,
            <TFasadeTrueSizes>{FASADE_WIDTH: firstFasade.width, FASADE_HEIGHT: firstFasade.height}
        );
        if (!checkConversation || width < firstFasade.minX)
            firstFasade.error = true;
        else delete firstFasade.error;

        // Создаем новую колонку с такими же параметрами
        const newDoor: FasadeObject = {
            ...firstFasade,
            position: newDoorPosition,
            material: {...firstFasade.material, HANDLES: {...firstFasade.material.HANDLES}},
        };

        let fasPos = getFasadePosition(newDoor.material.POSITION);
        newDoor.height = fasPos.FASADE_HEIGHT //module.value.height - module.value.horizont - 4; //TODO: костыль из-за прописанной в БД позиции фасада
        //newDoor.position.y = fasPos.POSITION_Y

        let loopsidesList = getLoopsideList(secIndex, section.fasades.length);
        let tmp_list = loopsidesList.filter(item => item.ID !== LOOPSIDE['none'])

        if(!module.value.isRestrictedModule) {
            if (!tmp_list.length) {
                alert("Нельзя добавить дверь");
                return;
            }
        }

        newDoor.loopsSide = tmp_list.pop().ID;

        if(!section.loopsSides)
            section.loopsSides = {}

        section.loopsSides[section.fasades.length] = newDoor.loopsSide;


        section.fasades.push([newDoor]);

        if (section.fasadesDrawers?.length || section.hiTechProfiles?.length) {
            calcDrawersFasades(secIndex)
        }

        if (!module.value.isSlidingDoors)
            calcLoops(secIndex);

        // Обновляем рендер
        visualizationRef.value.renderGrid();
    };

    splitFasade = (secIndex, doorIndex = 0, segmentIndex = 0) => {
        selectedFasade.value.sec = secIndex;
        selectedFasade.value.cell = doorIndex;
        selectedFasade.value.row = segmentIndex;

        visualizationRef.value.selectCell(
            "fasades",
            secIndex,
            doorIndex,
            true,
            segmentIndex
        );

        let fasades =
            secIndex === null
                ? module.value.fasades
                : module.value.sections[secIndex].fasades;
        let segment = fasades[doorIndex][segmentIndex];
        const halfHeight = Math.floor(
            (segment.height - (module.value.isSlidingDoors ? 0 : 4)) / 2
        );
        // Обновляем высоту последней строки

        let checkConversation = checkFasadeConversations(
            segment.material.COLOR,
            <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
        );
        if (!checkConversation || halfHeight < segment.minY || segment.width < segment.minX)
            segment.error = true;
        else delete segment.error;

        let delta =
            segment.height - halfHeight * 2 - (module.value.isSlidingDoors ? 0 : 4);

        segment.height = halfHeight;

        // Добавляем новую строку в эту колонку
        let newFasade = <FasadeObject> {
            ...segment,
            position: module.value.isSlidingDoors
                ? new THREE.Vector3(
                    segment.position.x,
                    segment.position.y + segment.height + delta,
                    segment.position.z
                )
                : new THREE.Vector2(
                    segment.position.x,
                    segment.position.y + 4 + segment.height + delta
                ),
            material: {...segment.material,  HANDLES: {...segment.material.HANDLES}},
        };

        fasades[doorIndex].splice(segmentIndex + 1, 0, newFasade);
        segment.height += delta;

        for (let i = 0; i < fasades[doorIndex].length; i++) {
            if (i > segmentIndex) fasades[doorIndex][i].id += 1;
        }

        if (!module.value.isSlidingDoors) calcLoops(secIndex);

        // Обновляем рендер
        visualizationRef.value.renderGrid();
    };

    deleteDoor = (secIndex, doorIndex) => {
        const current = module.value.sections[secIndex].fasades[doorIndex];
        let prev = module.value.sections[secIndex].fasades[doorIndex - 1];
        let next = module.value.sections[secIndex].fasades[doorIndex + 1];

        if(!next?.length){
            next = false
        }
        if(!prev?.length){
            prev = false
        }

        const combinedWidth = next
            ? current[0].width + next[0].width + 4
            : prev ? current[0].width + prev[0].width + 4 : 0;

        if (!combinedWidth) {
            module.value.sections[secIndex].fasades = [];
            module.value.sections[secIndex].loops = [];
            module.value.sections[secIndex].loopsSides = {};
        }
        else {
            if (next) {
                current.forEach((segment, index) => {
                    segment.width = combinedWidth;

                    let checkConversation = checkFasadeConversations(
                        segment.material.COLOR,
                        <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
                    );
                    if (!checkConversation || segment.width < segment.minX || segment.height < segment.minY)
                        segment.error = true;
                    else delete segment.error;
                });
            } else {
                prev.forEach((segment, index) => {
                    segment.width = combinedWidth;

                    let checkConversation = checkFasadeConversations(
                        segment.material.COLOR,
                        <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
                    );
                    if (!checkConversation || segment.width < segment.minX || segment.height < segment.minY)
                        segment.error = true;
                    else delete segment.error;
                });
            }

            if (next) {
                module.value.sections[secIndex].fasades.splice(doorIndex + 1, 1);
                module.value.sections[secIndex].loops.splice(doorIndex + 1, 1);
                delete module.value.sections[secIndex].loopsSides[doorIndex + 1];
            } else {
                module.value.sections[secIndex].fasades.splice(doorIndex, 1);
                module.value.sections[secIndex].loops.splice(doorIndex, 1);
                delete module.value.sections[secIndex].loopsSides[doorIndex];
            }

            if (!module.value.isSlidingDoors)
                calcLoops(secIndex);
        }

        selectedFasade.value.cell = 0;
        selectedFasade.value.sec = 0;

        visualizationRef.value.renderGrid();
    };

    checkRemoveFasadeSegment = (secIndex, doorIndex, segmentIndex) => {
        const fasades =
            secIndex === null ? module.value.fasades : module.value.sections[secIndex].fasades;
        const currentSection = fasades[doorIndex];
        const currentSegment = currentSection[segmentIndex];

        let next = currentSection[segmentIndex + 1];
        if (next) {
            let segmentsDistants = next.position.y - (currentSegment.position.y + currentSegment.height);
            if(segmentsDistants > 4)
                next = undefined;
        }

        let prev = currentSection[segmentIndex - 1];
        if (prev) {
            let segmentsDistants = currentSegment.position.y - (prev.position.y + prev.height);
            if(segmentsDistants > 4)
                prev = undefined;
        }

        return !!(next || prev);
    }

    removeFasadeSegment = (secIndex, doorIndex, segmentIndex) => {
        const clone = Object.assign({}, module.value);
        const fasades =
            secIndex === null ? clone.fasades : clone.sections[secIndex].fasades;
        const currentSection = fasades[doorIndex];
        const currentSegment = currentSection[segmentIndex];

        let next = currentSection[segmentIndex + 1];
        if (next) {
            let segmentsDistants = next.position.y - (currentSegment.position.y + currentSegment.height);
            if(segmentsDistants > 4)
                next = undefined;
        }

        let prev = currentSection[segmentIndex - 1];
        if (prev) {
            let segmentsDistants = currentSegment.position.y - (prev.position.y + prev.height);
            if(segmentsDistants > 4)
                prev = undefined;
        }

        const combinedHeight = next
            ? currentSegment.height +
            next.height +
            (module.value.isSlidingDoors ? 0 : 4)
            : currentSegment.height +
            prev.height +
            (module.value.isSlidingDoors ? 0 : 4);

        next ? (next.height = combinedHeight) : (prev.height = combinedHeight);

        let tmpSegment = next || prev;
        let checkConversation = checkFasadeConversations(
            tmpSegment.material.COLOR,
            <TFasadeTrueSizes>{FASADE_WIDTH: tmpSegment.width, FASADE_HEIGHT: tmpSegment.height}
        );

        if (!checkConversation || tmpSegment.width < tmpSegment.minX || tmpSegment.height < tmpSegment.minY)
            tmpSegment.error = true;
        else delete tmpSegment.error;

        next
            ? (next.position.y = currentSegment.position.y)
            : (prev.position.y = prev.position.y);

        for (let i = 0; i < fasades[doorIndex].length; i++) {
            if (i > segmentIndex) fasades[doorIndex][i].id -= 1;
        }

        if (currentSection.length > 1) {
            currentSection.splice(segmentIndex, 1);
        }

        module.value = clone;

        // Обновляем текущий сектор
        selectedFasade.value.row = 0;
        selectedFasade.value.cell = 0;
        selectedFasade.value.sec = secIndex;

        if (!module.value.isSlidingDoors) calcLoops(secIndex);

        visualizationRef.value.renderGrid();
    };

    updateFasadeHeight = (value, secIndex, doorIndex, segmentIndex) => {
        const newValue = parseInt(value);
        let adjustedValue;
        // Обновляем выбранную секцию для визуального отображения
        selectedFasade.value = { sec: secIndex, cell: doorIndex, row: segmentIndex };
        visualizationRef.value.selectCell(
            "fasades",
            secIndex,
            doorIndex,
            segmentIndex
        );

        if (!isNaN(newValue) && visualizationRef.value) {
            adjustedValue = visualizationRef.value.adjustSizeFromExternal({
                dimension: "height",
                value: newValue,
                sec: secIndex,
                cell: doorIndex,
                row: segmentIndex,
                type: "fasades",
            });
        }
        // Обновляем значение в module для синхронизации
        const clone = Object.assign({}, module.value);
        if (adjustedValue) {
            let curCell = clone.sections[secIndex].fasades[doorIndex][segmentIndex];
            let prevCell =
                clone.sections[secIndex].fasades[doorIndex][segmentIndex - 1];
            let nextCell =
                clone.sections[secIndex].fasades[doorIndex][segmentIndex + 1];

            if (nextCell) {
                let segmentsDistants = nextCell.position.y - (curCell.position.y + curCell.height);
                if(segmentsDistants > 4)
                    nextCell = undefined;
            }

            if (prevCell) {
                let segmentsDistants = curCell.position.y - (prevCell.position.y + prevCell.height);
                if(segmentsDistants > 4)
                    prevCell = undefined;
            }

            let delta = curCell.height - adjustedValue;

            curCell.height = adjustedValue;

            let checkConversation = checkFasadeConversations(
                curCell.material.COLOR,
                <TFasadeTrueSizes>{FASADE_WIDTH: curCell.width, FASADE_HEIGHT: curCell.height}
            );

            if (!checkConversation || curCell.width < curCell.minX || curCell.height < curCell.minY)
                curCell.error = true;
            else delete curCell.error;

            if (prevCell) {
                prevCell.height += delta;
                curCell.position.y += delta;
            } else if (nextCell) {
                nextCell.height += delta;
                nextCell.position.y += -delta;
            }

            let tmpSegment = prevCell || nextCell || {};
            checkConversation = checkFasadeConversations(
                tmpSegment.material.COLOR,
                <TFasadeTrueSizes>{FASADE_WIDTH: tmpSegment.width, FASADE_HEIGHT: tmpSegment.height}
            );
            if (
                !checkConversation ||
                tmpSegment.width < tmpSegment.minX ||
                tmpSegment.height < tmpSegment.minY
            )
                tmpSegment.error = true;
            else delete tmpSegment.error;
        }
        module.value = clone;

        if (!module.value.isSlidingDoors) calcLoops(secIndex);

        visualizationRef.value.renderGrid();
    };

    changeLoopside = (secIndex, fasade, newSide, doorIndex) => {
        fasade.loopsSide = parseInt(newSide);
        module.value.sections[secIndex].loopsSides[doorIndex] = fasade.loopsSide;
        module.value.sections[secIndex].fasades[doorIndex].forEach(
            (item) => (item.loopsSide = fasade.loopsSide)
        );

        calcLoops(secIndex)

        if(module.value.profilesConfig?.sideProfile)
            changeProfileSide(LOOPSIDE[fasade.loopsSide]?.includes("left") ? "left" : "right")

        visualizationRef.value.renderGrid();
    };

    changeProfileSide = (side: String) => {
        const profileSidesMap = {
            "right": new THREE.Vector2( -module.value.profilesConfig.sideProfile.manufacturerOffset - module.value.profilesConfig.sideProfile.size.y / 2, 0),
            "left": new THREE.Vector2( module.value.width + module.value.profilesConfig.sideProfile.manufacturerOffset + module.value.profilesConfig.sideProfile.size.y / 2, 0),
        }
        const profileRotationMap = {
            "right": Math.PI / 2,
            "left": -Math.PI / 2,
        }

        module.value.profilesConfig.sideProfile.position = profileSidesMap[side]
        module.value.profilesConfig.sideProfile.rotation = new THREE.Vector3(0, 0, profileRotationMap[side]);

        module.value.profilesConfig.sideProfile.side = side;
    };

    getLoopsideList = (secIndex, doorIndex) => {
        const productInfo = APP.CATALOG.PRODUCTS[module.value.productID];

        let list = [];
        let tmp = {};

        if(module.value.isRestrictedModule){
            tmp[LOOPSIDE["left"]] = APP.LOOPSIDE[LOOPSIDE["left"]];
            tmp[LOOPSIDE["right"]] = APP.LOOPSIDE[LOOPSIDE["right"]];
        }
        else {
            productInfo.LOOPSIDE.forEach((type) => {
                if (APP.LOOPSIDE[type] != undefined) {
                    tmp[type] = APP.LOOPSIDE[type];
                }
            });
        }

        const currSection = module.value.sections[secIndex];
        const sectionLeft = module.value.sections[secIndex - 1] || false;
        const sectionRight = module.value.sections[secIndex + 1] || false;

        const currSectionLoops = currSection.loopsSides || {};

        switch (doorIndex) {
            case 0:
                if (module.value.sections[secIndex].fasades[1]) {
                    delete tmp[LOOPSIDE["right"]];
                }

                if (sectionLeft) {
                    const sectionLeftLoops = sectionLeft.loopsSides || {};

                    if(!module.value.isRestrictedModule) {
                        if (
                            sectionLeftLoops[1] ||
                            [LOOPSIDE["right"], LOOPSIDE["right_on_partition"]].includes(
                                sectionLeftLoops[0]
                            )
                        )
                        {
                            delete tmp[LOOPSIDE["left_on_partition"]];
                        }
                        else {
                            tmp[LOOPSIDE["left_on_partition"]] =
                                APP.LOOPSIDE[LOOPSIDE["left_on_partition"]];
                        }
                    }

                    delete tmp[LOOPSIDE["left"]];
                }

                if (sectionRight) {
                    const sectionRightLoops = sectionRight.loopsSides || {};

                    if(!module.value.isRestrictedModule) {
                        if (
                            sectionRightLoops[1] ||
                            [LOOPSIDE["left"], LOOPSIDE["left_on_partition"]].includes(
                                sectionRightLoops[0]
                            )
                        ) {
                            delete tmp[LOOPSIDE["right_on_partition"]];
                        } else {
                            tmp[LOOPSIDE["right_on_partition"]] =
                                APP.LOOPSIDE[LOOPSIDE["right_on_partition"]];
                        }
                    }

                    delete tmp[LOOPSIDE["right"]];
                }

                break;
            case 1:
                if (sectionLeft) {
                    const sectionLeftLoops = sectionLeft.loopsSides || {};

                    if(!module.value.isRestrictedModule) {
                        if (
                            sectionLeftLoops[1] ||
                            [LOOPSIDE["right"], LOOPSIDE["right_on_partition"]].includes(
                                sectionLeftLoops[0]
                            )
                        ) {
                            delete tmp[LOOPSIDE["left_on_partition"]];
                        } else {
                            tmp[LOOPSIDE["left_on_partition"]] =
                                APP.LOOPSIDE[LOOPSIDE["left_on_partition"]];
                        }
                    }

                    delete tmp[LOOPSIDE["left"]];
                }

                if (sectionRight) {
                    const sectionRightLoops = sectionRight.loopsSides || {};

                    if(!module.value.isRestrictedModule) {
                        if (
                            sectionRightLoops[1] ||
                            [LOOPSIDE["left"], LOOPSIDE["left_on_partition"]].includes(
                                sectionRightLoops[0]
                            )
                        ) {
                            delete tmp[LOOPSIDE["right_on_partition"]];
                        } else {
                            tmp[LOOPSIDE["right_on_partition"]] =
                                APP.LOOPSIDE[LOOPSIDE["right_on_partition"]];
                        }
                    }

                    delete tmp[LOOPSIDE["right"]];
                }

                //delete tmp[LOOPSIDE["left"]]
                delete tmp[currSectionLoops[0]];

                break;
        }

        list = Object.values(tmp);
        return list;
    };

    checkAddDoor = (secIndex, doorIndex) => {
        if(module.value.isRestrictedModule) {
            let moduleFasadesCount = 0;
            module.value.sections.forEach(section => {
                moduleFasadesCount += section.fasades.length
            })

            return (module.value.sections.length > 1 && module.value.sections[secIndex].fasades.length < 1) || (module.value.sections.length === 1 && module.value.sections[secIndex].fasades.length < 2);
        }
        else {
            let loopsSidesList = getLoopsideList(secIndex, doorIndex);
            let tmp_list = loopsSidesList.filter(item => item.ID !== LOOPSIDE['none'])

            const currSection = module.value.sections[secIndex];

            if (currSection.loopsSides?.[doorIndex])
                tmp_list = tmp_list.filter(
                    (item) => item.ID !== currSection.loopsSides[doorIndex]
                );

            return tmp_list.length > 0;
        }
    };

    openFasadeSelector = (secIndex, doorIndex, segmentIndex) => {
        isOpenMaterialSelector.value = false;

        if(isOpenHandleSelector.value)
            closeMenu()

        /** @Создание_данных_для_выбранного_фасада */
        createFacadeData(segmentIndex);

        if (
            currentFasadeMaterial.value &&
            secIndex === currentFasadeMaterial.value.secIndex &&
            doorIndex === currentFasadeMaterial.value.doorIndex &&
            segmentIndex === currentFasadeMaterial.value.segmentIndex
        ) {
            closeMenu()
            return;
        }

        setTimeout(() => {
            let data =
                secIndex === null
                    ? module.value.fasades[doorIndex][segmentIndex]
                    : module.value.sections[secIndex].fasades[doorIndex][segmentIndex];
            currentFasadeMaterial.value = {
                secIndex,
                doorIndex,
                segmentIndex,
                data: data.material,
            };
            currentFasadeSize.value = <TFasadeTrueSizes>{FASADE_WIDTH: data.width, FASADE_HEIGHT: data.height}
            selectCell(secIndex, doorIndex, segmentIndex);
            isOpenMaterialSelector.value = true;
        }, 10);
    };

    openHandleSelector = (secIndex, doorIndex, segmentIndex) => {
        isOpenHandleSelector.value = false;
        isOpenMaterialSelector.value = false;

        if(isOpenMaterialSelector.value)
            closeMenu()

        if (
            currentHandle.value &&
            secIndex === currentHandle.value.secIndex &&
            doorIndex === currentHandle.value.doorIndex &&
            segmentIndex === currentHandle.value.segmentIndex
        ) {
            closeMenu()
            return;
        }

        setTimeout(() => {
            let data =
                secIndex === null
                    ? module.value.fasades[doorIndex][segmentIndex]
                    : module.value.sections[secIndex].fasades[doorIndex][segmentIndex];
            currentHandle.value = {
                secIndex,
                doorIndex,
                segmentIndex,
                data: data.material,
            };
            selectCell(secIndex, doorIndex, segmentIndex);
            isOpenHandleSelector.value = true;
        }, 10);
    };

    selectHandle = (data, type) => {
        switch (type) {
            case "handle":
                currentHandle.value.data.HANDLES.id = data;
                break;
            case "position":
                currentHandle.value.data.HANDLES.position = data;
                break;
        }
        visualizationRef.value.renderGrid();
    }

    selectOption = (value: Object, type: string, palette: Object = false) => {
        currentFasadeMaterial.value.data[type] = value ? value.ID || value : null;
        if (palette) currentFasadeMaterial.value.data["PALETTE"] = palette;

        let { secIndex, doorIndex, segmentIndex } = currentFasadeMaterial.value;
        if (secIndex === null) {
            module.value.fasades[doorIndex][segmentIndex].material = Object.assign(
                module.value.fasades[doorIndex][segmentIndex].material,
                currentFasadeMaterial.value.data
            );
        } else {
            module.value.sections[secIndex].fasades[doorIndex][segmentIndex].material =
                Object.assign(
                    module.value.sections[secIndex].fasades[doorIndex][segmentIndex]
                        .material,
                    currentFasadeMaterial.value.data
                );
        }
    };

    createFacadeData = (fasadeIndex) => {
        const productId = modelState.getCurrentModel.userData.PROPS.PRODUCT;
        const { FACADE } = modelState._PRODUCTS[productId];
        modelState.createCurrentModelFasadesData({
            data: FACADE,
            fasadeNdx: fasadeIndex,
            productId,
        });
    };
}