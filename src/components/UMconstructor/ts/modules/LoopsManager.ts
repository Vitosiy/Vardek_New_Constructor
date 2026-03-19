//@ts-nocheck

import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import { ErrorItem, ErrorsMessage, ErrorsType, LoopsmokAPI, LOOPSIDE } from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import { GridModule } from "@/components/UMconstructor/types/UMtypes.ts";


export default class LoopsManager {
    scope: UMconstructorClass
    MokTopLoop: LoopsmokAPI
    constructor(scope: UMconstructorClass) {
        this.scope = scope

        this.MokTopLoop = {
            123456: {
                "ID": 123456,
                "NAME": "Верх",
                "DETAIL_PICTURE": "/upload/iblock/244/2442fd9ccf1a3c524370a8c13350fb5a.png",
                "PREVIEW_PICTURE": "/upload/resize_cache/iblock/64e/40_40_1/64e2106b0cdd667d1a46a993bf45bd84.png",
                "CODE": "top",
                "SORT": 0
            }
        }
    }

    calcLoops(secIndex: number, grid: GridModule = this.scope.UM_STORE.getUMGrid()) {
        const CONFIG = this.scope.UM_STORE.getUMData()?.CONFIG;
        console.log(CONFIG, '===== UM_STORE')

        if (!CONFIG.LOOPS)
            return

        const curSection = grid.sections[secIndex]
        // console.log(curSection, 'curSection')
        const FASADES = curSection.fasades || []

        if (grid.noLoops) {
            delete curSection.loops
            delete curSection.loopsSides
            FASADES.forEach((door, doorKey) => {
                door.forEach((fasade, key) => {
                    fasade.loopsSide = LOOPSIDE['none']
                })
            })
            return;
        }

        curSection.loops = []

        FASADES.forEach((door, doorKey) => {
            const additional_fasades = []

            door.forEach((fasade, key) => {
                additional_fasades.push(fasade)
            })

            let loopsPos = this.calcLoopPositions(additional_fasades, curSection)

            if (loopsPos.length)
                curSection.loops.push(loopsPos)
        })

        if (!Object.keys(curSection.loops).length) {
            delete curSection.loops
            FASADES.forEach((door, doorKey) => {
                door.forEach((fasade, key) => {
                    fasade.loopsSide = LOOPSIDE['none']
                })
            })
        }
        else if (grid) {
            this.checkLoopsCollision(secIndex, grid)
        }
    }

    calcLoopPositions(fasades, section) {

        let allLoops = []

        const defaultPos = 102
        const lowSizePos1 = 74
        const lowSizePos2 = 93

        fasades.forEach((fasade, key) => {

            const { width, height } = fasade
            const topPositions = {
                x1: 38,
                x2: width * 0.5 - 38
            }

            const fasadeHeight = height;
            const quarterPos = fasadeHeight / 4
            const oneThirdPos = fasadeHeight / 3
            const secondPos = fasadeHeight / 2

            const left = LOOPSIDE[fasade.loopsSide]?.includes("left")
            const right = LOOPSIDE[fasade.loopsSide]?.includes("right")
            const top = !left && !right && fasadeHeight <= 450

            console.log(top, 'top')

            const fasadeLoops = {
                side: fasade.loopsSide,
                coords: [],
                errors: [],
                height: top ? 38 : 82,
                width: top ? 82 : 38,
                type: 'loop',
                positionX: (() => {
                    if (left) {
                        return section.position.x - section.width / 2
                    }
                    if (right) {
                        return section.position.x + section.width / 2 - 38
                    }
                    if (top) {
                        return section.position.x - section.width / 2
                    }
                })(),
                // left ? section.position.x - section.width / 2 : section.position.x + section.width / 2 - 38,
                // positionY: top ? section.position.y + section.height + 19 : fasade.position.y
                positionY: fasade.position.y
            }

            const { positionY, positionX } = fasadeLoops


            console.log(top, '====> top <====')

            //исключения по размерам

            if (!top) {
                if (fasadeHeight === 2036) {
                    //Отступ 658 от краев фасада
                    fasadeLoops.coords = []
                    fasadeLoops.coords.push((positionY + defaultPos).toFixed(1))
                    fasadeLoops.coords.push((positionY + 658).toFixed(1))
                    fasadeLoops.coords.push((positionY + fasadeHeight - 658).toFixed(1))
                    fasadeLoops.coords.push((positionY + fasadeHeight - defaultPos).toFixed(1))
                } else if (fasadeHeight === 536) {
                    //Отступ 93 от краев фасада
                    fasadeLoops.coords = []
                    fasadeLoops.coords.push((positionY + lowSizePos2).toFixed(1))
                    fasadeLoops.coords.push((positionY + fasadeHeight - lowSizePos2).toFixed(1))
                }//
                else if (fasadeHeight >= 2064) {
                    fasadeLoops.coords.push((positionY + defaultPos).toFixed(1))
                    fasadeLoops.coords.push((positionY + quarterPos).toFixed(1))
                    fasadeLoops.coords.push((positionY + quarterPos * 2).toFixed(1))
                    fasadeLoops.coords.push((positionY + quarterPos * 3).toFixed(1))
                    fasadeLoops.coords.push((positionY + fasadeHeight - defaultPos).toFixed(1))
                } else if (fasadeHeight < 2064 && fasadeHeight > 1500) {
                    fasadeLoops.coords.push((positionY + defaultPos).toFixed(1))
                    fasadeLoops.coords.push((positionY + oneThirdPos).toFixed(1))
                    fasadeLoops.coords.push((positionY + oneThirdPos * 2).toFixed(1))
                    fasadeLoops.coords.push((positionY + fasadeHeight - defaultPos).toFixed(1))
                } else if (fasadeHeight <= 1500 && fasadeHeight > 1000) {
                    fasadeLoops.coords.push((positionY + defaultPos).toFixed(1))
                    fasadeLoops.coords.push((positionY + secondPos).toFixed(1))
                    fasadeLoops.coords.push((positionY + fasadeHeight - defaultPos).toFixed(1))
                } else if (fasadeHeight <= 1000 && fasadeHeight > 400) {
                    fasadeLoops.coords.push((positionY + defaultPos).toFixed(1))
                    fasadeLoops.coords.push((positionY + fasadeHeight - defaultPos).toFixed(1))
                } else if (400 >= fasadeHeight && fasadeHeight >= 360) {
                    fasadeLoops.coords.push((positionY + lowSizePos1).toFixed(1))
                    fasadeLoops.coords.push((positionY + fasadeHeight - lowSizePos1).toFixed(1))
                }
            }
            else {
                console.log('TOOOOP')

                fasadeLoops.coords.push((positionY).toFixed(1))
                fasadeLoops.coords.push(key + width)

                // fasadeLoops.coords.push((positionY + defaultPos).toFixed(1))
                // fasadeLoops.coords.push((positionY + fasadeHeight - defaultPos).toFixed(1))

                // fasadeLoops.coords = [topPositions.x1, topPositions.x2]

            }


            fasadeLoops.coords = fasadeLoops.coords.map((item) => parseInt(item))
            allLoops.push(fasadeLoops)
        })

        console.log(allLoops)

        return allLoops
    }

    checkLoopsCollision(secIndex: number, grid: GridModule = this.scope.UM_STORE.getUMGrid()) {
        const CONFIG = this.scope.UM_STORE.getUMData()?.CONFIG;

        if (!CONFIG.LOOPS)
            return

        const currentSection = grid.sections[secIndex];
        const moduleThickness = grid.moduleThickness
        const loops = currentSection.loops

        if (!loops)
            return

        const errorItem = <ErrorItem>{
            type: ErrorsType['loops'],
            message: ErrorsMessage['loops'],
            sections: {}
        }

        let loopsSectors = {}
        Object.entries(loops).forEach(([doorKey, doorLoops]) => {
            loopsSectors[doorKey] = {}
            doorLoops.forEach((_loops, fasadeKey) => {
                loopsSectors[doorKey][fasadeKey] = []
                _loops.coords.forEach((coord, key) => {
                    loopsSectors[doorKey][fasadeKey].push({
                        id: key,
                        minY: coord - _loops.height / 2,
                        maxY: coord + _loops.height / 2,
                        minX: _loops.positionX,
                        maxX: _loops.positionX + _loops.width,
                    })
                })
            })
        })

        const checkLoop = (_loops, cell) => {
            let result = []
            _loops.forEach(loop => {
                if (
                    ((loop.minY < (cell.position.y - moduleThickness) && loop.maxY > (cell.position.y - moduleThickness)) ||
                        (loop.minY < cell.position.y && loop.maxY > cell.position.y))
                    &&
                    ((loop.minX <= (cell.position.x - cell.width / 2) && loop.maxX >= (cell.position.x - cell.width / 2)) ||
                        (loop.minX <= (cell.position.x + cell.width / 2) && loop.maxX >= (cell.position.x + cell.width / 2)))
                ) {
                    result.push(loop.id)
                }
                else if (cell.fillings?.length) {
                    cell.fillings.forEach((filling) => {
                        let filling_pos = new THREE.Vector2(filling.position.x, grid.height - filling.position.y - filling.height)
                        if (
                            (
                                (loop.minY < (filling_pos.y + filling.height) && loop.maxY > (filling_pos.y + filling.height)) ||
                                (loop.minY < filling_pos.y && loop.maxY > filling_pos.y) ||
                                (loop.minY > filling_pos.y && loop.maxY < (filling_pos.y + filling.height))
                            )
                            &&
                            ((loop.minX <= (filling_pos.x + filling.width) && loop.maxX >= (filling_pos.x + filling.width)) ||
                                (loop.minX <= (filling_pos.x) && loop.maxX >= (filling_pos.x)))
                        ) {
                            result.push(loop.id)
                        }
                    })
                }

            })

            return result;
        }

        if (currentSection.cells?.length) {
            Object.entries(loopsSectors).forEach(([doorKey, fasades]) => {
                Object.entries(fasades).forEach(([fasadeKey, _loops]) => {
                    loops[doorKey][fasadeKey].errors = []

                    currentSection.cells.forEach((cell, cellKey) => {

                        let check = checkLoop(_loops, cell)
                        check.forEach((id) => {
                            if (!loops[doorKey]?.[fasadeKey]?.errors.includes(id))
                                loops[doorKey][fasadeKey].errors.push(id)
                        })

                        cell.cellsRows?.forEach((cellRow) => {

                            if (cellRow.extras?.length) {
                                cellRow.extras.forEach((extraRow) => {
                                    let check = checkLoop(_loops, extraRow)
                                    check.forEach((id) => {
                                        if (!loops[doorKey]?.[fasadeKey]?.errors.includes(id))
                                            loops[doorKey][fasadeKey].errors.push(id)
                                    })
                                })
                            }

                        })

                    })

                    if (loops[doorKey][fasadeKey].errors.length) {
                        if (!errorItem.sections[secIndex])
                            errorItem.sections[secIndex] = []

                        errorItem.sections[secIndex].push(loops[doorKey][fasadeKey].errors)
                    }
                })
            })
        }
        else {
            Object.entries(loopsSectors).forEach(([doorKey, fasades]) => {
                Object.entries(fasades).forEach(([fasadeKey, _loops]) => {
                    loops[doorKey][fasadeKey].errors = []

                    let check = checkLoop(_loops, currentSection)
                    check.forEach((id) => {
                        if (!loops[doorKey]?.[fasadeKey]?.errors.includes(id))
                            loops[doorKey][fasadeKey].errors.push(id)
                    })

                    if (loops[doorKey][fasadeKey].errors.length) {
                        if (!errorItem.sections[secIndex])
                            errorItem.sections[secIndex] = []

                        errorItem.sections[secIndex].push(loops[doorKey][fasadeKey].errors)
                    }

                })
            })
        }

        if (Object.entries(errorItem.sections).length) {
            if (!grid.errors)
                grid.errors = {}

            if (!grid.errors[ErrorsType['loops']])
                grid.errors[ErrorsType['loops']] = <ErrorItem>{
                    type: ErrorsType['loops'],
                    message: ErrorsMessage['loops'],
                    sections: {}
                }

            grid.errors[ErrorsType['loops']].sections = Object.assign(grid.errors[ErrorsType['loops']].sections, errorItem.sections)
        }
        else if (grid.errors?.[ErrorsType['loops']]?.sections?.[secIndex]?.length) {
            delete grid.errors[ErrorsType['loops']].sections[secIndex]
        }

        if (grid.errors?.[ErrorsType['loops']] && !Object.entries(grid.errors[ErrorsType['loops']].sections).length)
            delete grid.errors?.[ErrorsType['loops']]

        return loops;
    }

    getLoopsideList(secIndex: number, doorIndex: number, grid: GridModule, segment: number) {
        const productInfo = this.scope.APP.CATALOG.PRODUCTS[grid.productID];
        const loopsData = this.scope.APP.LOOPSIDE
        const MokLoop = [...productInfo.LOOPSIDE, 14981055]

        const currSection = grid.sections[secIndex];
        const isTopPoseble = currSection.fasades?.length < 2

        let list = [];
        let tmp = {};

        if (grid.isRestrictedModule) {
            tmp[LOOPSIDE["left"]] = loopsData[LOOPSIDE["left"]];
            tmp[LOOPSIDE["right"]] = loopsData[LOOPSIDE["right"]];
            tmp[LOOPSIDE["top"]] = loopsData[LOOPSIDE["top"]];
        }
        else {
            // productInfo.LOOPSIDE.forEach((type) => {
            MokLoop.forEach((type) => {
                if (loopsData[type] != undefined) {
                    tmp[type] = loopsData[type];
                }
            });
        }


        const sectionLeft = grid.sections[secIndex - 1] || false;
        const sectionRight = grid.sections[secIndex + 1] || false;

        const currSectionLoops = currSection.loopsSides || {};

        if (isTopPoseble) {

            const fasadeHeight = segment ? currSection.fasades[0][segment - 1]?.height : false

            if (typeof fasadeHeight === 'number' && fasadeHeight > 450 || segment != currSection.fasades[0]?.length) {
                delete tmp[LOOPSIDE["top"]];
            }

        }
        else {
            delete tmp[LOOPSIDE["top"]];
            switch (doorIndex) {
                case 0:

                    console.log('IS TOPOPP 2222')
                    if (grid.sections[secIndex].fasades[1]) {
                        delete tmp[LOOPSIDE["right"]];
                    }

                    if (sectionLeft) {
                        const sectionLeftLoops = sectionLeft.loopsSides || {};

                        if (!grid.isRestrictedModule) {
                            if (
                                sectionLeftLoops[1] ||
                                [LOOPSIDE["right"], LOOPSIDE["right_on_partition"]].includes(
                                    sectionLeftLoops[0]
                                )
                            ) {
                                delete tmp[LOOPSIDE["left_on_partition"]];
                            }
                            else {
                                tmp[LOOPSIDE["left_on_partition"]] =
                                    loopsData[LOOPSIDE["left_on_partition"]];
                            }
                        }

                        delete tmp[LOOPSIDE["left"]];
                    }

                    if (sectionRight) {
                        const sectionRightLoops = sectionRight.loopsSides || {};

                        if (!grid.isRestrictedModule) {
                            if (
                                sectionRightLoops[1] ||
                                [LOOPSIDE["left"], LOOPSIDE["left_on_partition"]].includes(
                                    sectionRightLoops[0]
                                )
                            ) {
                                delete tmp[LOOPSIDE["right_on_partition"]];
                            } else {
                                tmp[LOOPSIDE["right_on_partition"]] =
                                    loopsData[LOOPSIDE["right_on_partition"]];
                            }
                        }

                        delete tmp[LOOPSIDE["right"]];
                    }

                    break;
                case 1:
                    if (sectionLeft) {
                        const sectionLeftLoops = sectionLeft.loopsSides || {};

                        if (!grid.isRestrictedModule) {
                            if (
                                sectionLeftLoops[1] ||
                                [LOOPSIDE["right"], LOOPSIDE["right_on_partition"]].includes(
                                    sectionLeftLoops[0]
                                )
                            ) {
                                delete tmp[LOOPSIDE["left_on_partition"]];
                            } else {
                                tmp[LOOPSIDE["left_on_partition"]] =
                                    loopsData[LOOPSIDE["left_on_partition"]];
                            }
                        }

                        delete tmp[LOOPSIDE["left"]];
                    }

                    if (sectionRight) {
                        const sectionRightLoops = sectionRight.loopsSides || {};

                        if (!grid.isRestrictedModule) {
                            if (
                                sectionRightLoops[1] ||
                                [LOOPSIDE["left"], LOOPSIDE["left_on_partition"]].includes(
                                    sectionRightLoops[0]
                                )
                            ) {
                                delete tmp[LOOPSIDE["right_on_partition"]];
                            } else {
                                tmp[LOOPSIDE["right_on_partition"]] =
                                    loopsData[LOOPSIDE["right_on_partition"]];
                            }
                        }

                        delete tmp[LOOPSIDE["right"]];
                    }

                    //delete tmp[LOOPSIDE["left"]]
                    delete tmp[currSectionLoops[0]];

                    break;
            }
        }

        list = Object.values(tmp);

        console.log(secIndex, list, '<====== list ======>')
        return list;
    };
}