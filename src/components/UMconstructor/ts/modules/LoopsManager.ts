//@ts-nocheck

import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {ErrorItem, ErrorsMessage, ErrorsType, LOOPSIDE} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import {GridModule} from "@/components/UMconstructor/types/UMtypes.ts";


export default class LoopsManager {
    scope: UMconstructorClass
    constructor(scope: UMconstructorClass) {
        this.scope = scope
    }

    calcLoops (secIndex: number, grid: GridModule) {
        const CONFIG = this.scope.UM_STORE.getUMData()?.CONFIG;
        const curGrid = grid || this.scope.UM_STORE.getUMGrid()

        if (!CONFIG.LOOPS)
            return

        const curSection = curGrid.sections[secIndex]

        if(curGrid.noLoops){
            delete curSection.loops
            delete curSection.loopsSides
            return;
        }

        const FASADES = curSection.fasades || []
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

        if (!curSection.loops.length)
            delete curSection.loops
        else if (!grid)
            this.checkLoopsCollision(secIndex)
    }

    calcLoopPositions(fasades, section) {

        let allLoops = []

        const defaultPos = 102
        const lowSizePos1 = 74
        const lowSizePos2 = 93

        fasades.forEach((fasade, key) => {

            const fasadeLoops = {
                side: fasade.loopsSide,
                coords: [],
                errors: [],
                height: 82,
                width: 38,
                type: 'loop',
                positionX: LOOPSIDE[fasade.loopsSide]?.includes("left") ? section.position.x - section.width / 2 : section.position.x + section.width / 2 - 38,
            }

            const fasadeSize = fasade.height;
            const quarterPos = fasadeSize / 4
            const oneThirdPos = fasadeSize / 3
            const secondPos = fasadeSize / 2

            const position = fasade.position.y

            //исключения по размерам
            if (fasadeSize === 2036) {
                //Отступ 658 от краев фасада
                fasadeLoops.coords = []
                fasadeLoops.coords.push((position + defaultPos).toFixed(1))
                fasadeLoops.coords.push((position + 658).toFixed(1))
                fasadeLoops.coords.push((position + fasadeSize - 658).toFixed(1))
                fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
            } else if (fasadeSize === 536) {
                //Отступ 93 от краев фасада
                fasadeLoops.coords = []
                fasadeLoops.coords.push((position + lowSizePos2).toFixed(1))
                fasadeLoops.coords.push((position + fasadeSize - lowSizePos2).toFixed(1))
            }//
            else if (fasadeSize >= 2064) {
                fasadeLoops.coords.push((position + defaultPos).toFixed(1))
                fasadeLoops.coords.push((position + quarterPos).toFixed(1))
                fasadeLoops.coords.push((position + quarterPos * 2).toFixed(1))
                fasadeLoops.coords.push((position + quarterPos * 3).toFixed(1))
                fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
            } else if (fasadeSize < 2064 && fasadeSize > 1500) {
                fasadeLoops.coords.push((position + defaultPos).toFixed(1))
                fasadeLoops.coords.push((position + oneThirdPos).toFixed(1))
                fasadeLoops.coords.push((position + oneThirdPos * 2).toFixed(1))
                fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
            } else if (fasadeSize <= 1500 && fasadeSize > 1000) {
                fasadeLoops.coords.push((position + defaultPos).toFixed(1))
                fasadeLoops.coords.push((position + secondPos).toFixed(1))
                fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
            } else if (fasadeSize <= 1000 && fasadeSize > 400) {
                fasadeLoops.coords.push((position + defaultPos).toFixed(1))
                fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
            } else if (400 >= fasadeSize && fasadeSize >= 360) {
                fasadeLoops.coords.push((position + lowSizePos1).toFixed(1))
                fasadeLoops.coords.push((position + fasadeSize - lowSizePos1).toFixed(1))
            }

            fasadeLoops.coords = fasadeLoops.coords.map((item) => parseInt(item))
            allLoops.push(fasadeLoops)
        })

        return allLoops
    }

    checkLoopsCollision(secIndex: number, grid: GridModule) {
        const CONFIG = this.scope.UM_STORE.getUMData()?.CONFIG;

        if (!CONFIG.LOOPS)
            return

        const currentSection = grid.sections[secIndex];
        const moduleThickness = grid.moduleThickness
        const loops = currentSection.loops

        if (!loops)
            return

        const errorItem =  <ErrorItem>{
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
                else if(cell.fillings?.length) {
                    cell.fillings.forEach((filling) => {
                        let filling_pos = new THREE.Vector2(filling.position.x, grid.height - filling.position.y - filling.height)
                        if(
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

                            if(cellRow.extras?.length) {
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

                    if(loops[doorKey][fasadeKey].errors.length) {
                        if(!errorItem.sections[secIndex])
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

                    if(loops[doorKey][fasadeKey].errors.length) {
                        if(!errorItem.sections[secIndex])
                            errorItem.sections[secIndex] = []

                        errorItem.sections[secIndex].push(loops[doorKey][fasadeKey].errors)
                    }

                })
            })
        }

        if (Object.entries(errorItem.sections).length) {
            if(!grid.errors)
                grid.errors = {}

            if(!grid.errors[ErrorsType['loops']])
                grid.errors[ErrorsType['loops']] = <ErrorItem>{
                    type: ErrorsType['loops'],
                    message: ErrorsMessage['loops'],
                    sections: {}
                }

            grid.errors[ErrorsType['loops']].sections = Object.assign(grid.errors[ErrorsType['loops']].sections, errorItem.sections)
        }
        else if(grid.errors?.[ErrorsType['loops']]?.sections?.[secIndex]?.length) {
            delete grid.errors[ErrorsType['loops']].sections[secIndex]
        }

        if(grid.errors?.[ErrorsType['loops']] && !Object.entries(grid.errors[ErrorsType['loops']].sections).length)
            delete grid.errors?.[ErrorsType['loops']]

        return loops;
    }
}