// @ts-nocheck 

import * as THREE from 'three'
import * as THREETypes from "@/types/types"

import {
    GridModule, LOOPSIDE
} from "@/types/constructor2d/interfaсes.ts";

import { useSceneState } from "@/store/appliction/useSceneState"
import { useModelState } from '@/store/appliction/useModelState';

import { BuildProduct } from "../BuildProduct"
import {_URL} from "@/types/constants";

export class BuildUniversalModule extends BuildProduct {

    project = useSceneState().getCurrentProjectParams;
    modelState = useModelState();

    heightCorrect: number = 0

    constructor(root: THREETypes.TApplication) {
        super(root);
    }

    createProductBody(perent_group: THREE.Object3D, _size?: { width: number, height: number, depth: number }, moduleParams?: GridModule) {

        const total = new THREE.Object3D();

        const model_props = perent_group.userData.PROPS
        const product_id = model_props.CONFIG.ID
        const productInfo = this._PRODUCTS[product_id];

        model_props.FASADE = []
        model_props.FASADE_DEFAULT = []

        let model_data = model_props.CONFIG.MODEL

        const MODULEGRID = moduleParams || Object.keys(model_props.CONFIG.MODULEGRID)?.length || false

        const size = _size ? _size : MODULEGRID ? {width: MODULEGRID.width, height: MODULEGRID.height, depth: MODULEGRID.depth} : false

        let model_size = size || model_props.CONFIG.SIZE

        if (size) {
            model_props.CONFIG.SIZE = size
            this.getProductSize(model_props.CONFIG, Object.assign({}, productInfo, size))
        }

        let height_correct = 0

        /** Корректировка положения по высоте */
        const getHeightCorrect = (value: number, type: string) => {
            switch (type) {
                case 'top':
                    height_correct -= value;
                    break
                case 'bottom':
                    height_correct += value;
            }

            return height_correct;
        }

        if (!model_data) return

        const data = this.createModelData(model_data, model_props, model_size);

        /**Добавляем каркас  */
        !this.isEmpty(model_data) ? this.createBody(total, data, model_props) : ""

        /** Добавляем столешницу если есть */
        model_props.CONFIG.HAVETABLETOP ? this.createTableTop(total, model_props, data, getHeightCorrect) : "";

        /** Добавляем полки если есть */
        this._SHELF_POSITION[product_id] ? this.createShelf(total, model_props, this._SHELF_POSITION[product_id]) : "";

        /** Добавляем ножки если есть */
        productInfo.leg_length ? this.buildLegs(model_props, data, total, getHeightCorrect) : "";

        if(MODULEGRID) {
            this.parseModulegrid(MODULEGRID, model_props)
            this.buildModulegrid(model_props, total)
        }

        if(model_props.CONFIG.LOOPS && Object.keys(model_props.CONFIG.LOOPS)?.length) {
            let loopsMesh = this.createLoop(productInfo, model_props, model_props.CONFIG.LOOPS)
            total.add(loopsMesh)
        }

        Object.keys(model_props.CONFIG.FASADE_PROPS).length > 0 ? this.fasade_builder.getFasade(
            {
                group: total,
                props: model_props,
                model_data: data,
                isUMmodule: !!MODULEGRID
            }) : "";

        /** Корректировка положения общего Box3 по высоте  */
        total.position.y += height_correct / 2

        // /** Корректировка по глубине */
        // if (!size) {
        //     // total.position.z -= 5
        // }

        model_props.CONFIG.HEIGHTCORRECT = height_correct

        return total
    };

    createProductObject(product_data: THREETypes.TObject, props) {
        const CONFIG = super.createProductObject(product_data, props)

        let firstSectionSize = new THREE.Vector3(CONFIG.SIZE.width - CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2,
            CONFIG.SIZE.height - CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - CONFIG.EXPRESSIONS["#HORIZONT#"],
            CONFIG.SIZE.depth - CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"])

        CONFIG.SECTIONS = {
            1: {
                fillings: [],
                size: firstSectionSize,
                position: new THREE.Vector3(CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] + firstSectionSize.x / 2,
                    CONFIG.EXPRESSIONS["#HORIZONT#"] + CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"],
                    CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] + firstSectionSize.z / 2),
            }
        }

        CONFIG.MODULEGRID = {}

        if(product_data.moduleType.CODE !== "wardrobe")
            CONFIG.LOOPS = {}

        return CONFIG
    }

    parseModulegrid(product_data: THREETypes.TObject, PROPS: Object) {
        const OLD_SECTIONS = PROPS.CONFIG.SECTIONS
        const OLD_FASADES = PROPS.CONFIG.FASADE_POSITIONS
        PROPS.CONFIG.FASADE_POSITIONS = []
        PROPS.CONFIG.FASADE_PROPS = []
        PROPS.CONFIG.SECTIONS = {}
        PROPS.CONFIG.LOOPS = {}

        product_data.sections.forEach((section, secIndex) => {

            let sectionSize = new THREE.Vector3(section.width, section.height,
                product_data.depth - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"])
            let prevSection = PROPS.CONFIG.SECTIONS[secIndex] || false;

            PROPS.CONFIG.SECTIONS[secIndex + 1] = {
                fillings: [],
                size: sectionSize,
                position: new THREE.Vector3((prevSection ? prevSection.position.x + prevSection.size.x / 2 : 0) + PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] + sectionSize.x / 2,
                    PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"] + PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"],
                    PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] + sectionSize.z / 2)
            }
            let curSection = PROPS.CONFIG.SECTIONS[secIndex + 1]

            if(secIndex + 1 > 1)
                curSection.fillings.push({  //Добавляем разделитель секций, как товар наполнения
                    position: new THREE.Vector3(curSection.position.x - curSection.size.x / 2 - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] / 2,
                        curSection.position.y, curSection.position.z),
                    size: new THREE.Vector3(PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"], curSection.size.y, curSection.size.z),
                    product: 5820274,
                    material: PROPS.CONFIG.MODULE_COLOR,
                    id: curSection.fillings.length + 1,
                })

            let cells = [...section.cells].reverse()
            cells?.forEach((cell, cellIndex) => {

                if(cellIndex > 0)
                    curSection.fillings.push({  //Добавляем полку, как товар наполнения
                        position: new THREE.Vector3(cell.position.x, cell.position.y - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"], curSection.position.z),
                        size: new THREE.Vector3(cell.width, PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"], curSection.size.z),
                        product: 4263392,
                        id: curSection.fillings.length + 1,
                        material: PROPS.CONFIG.MODULE_COLOR,
                    })

                cell.cellsRows?.forEach((row, rowIndex) => {

                    if(rowIndex > 0)
                        curSection.fillings.push({  //Добавляем верт. полку, как товар наполнения
                            position: new THREE.Vector3(row.position.x, row.position.y, curSection.position.z),
                            size: new THREE.Vector3(PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"], cell.height, curSection.size.z),
                            product: 5820266,
                            id: curSection.fillings.length + 1,
                            material: PROPS.CONFIG.MODULE_COLOR,
                        })

                    row.fillings?.forEach((filling) => {
                        curSection.fillings.push({
                            ...filling,
                            position: new THREE.Vector3(row.position.x, row.position.y + filling.distances.bottom, curSection.position.z),
                            id: curSection.fillings.length + 1,
                        })
                    })
                })

                cell.fillings?.forEach((filling) => {
                    curSection.fillings.push({
                        ...filling,
                        position: new THREE.Vector3(cell.position.x, cell.position.y + filling.distances.bottom, curSection.position.z),
                        id: curSection.fillings.length + 1,
                    })
                })
            })

            section.fillings?.forEach((filling) => {
                curSection.fillings.push({
                    ...filling,
                    position: new THREE.Vector3(curSection.position.x, curSection.position.y + filling.distances.bottom, curSection.position.z),
                    id: curSection.fillings.length + 1,
                })
            })

            let allFasades = []
            section.fasades?.forEach((door, doorID) => {
                allFasades.push(...door)
            })

            if(section.fasadesDrawers)
                allFasades.push(...section.fasadesDrawers)

            allFasades.sort((a, b) => a.id - b.id)

            allFasades.forEach((fasade, fasadeID) => {
                if(!fasade.error) {
                    PROPS.CONFIG.FASADE_POSITIONS.push({
                        ...OLD_FASADES[0],
                        FASADE_WIDTH: fasade.width,
                        FASADE_HEIGHT: fasade.height,
                        POSITION_X: fasade.position.x,
                        POSITION_Y: fasade.position.y,  //(PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"]) + 2,
                        POSITION_Z: PROPS.CONFIG.SIZE.depth + 2,
                        FASADE_NUMBER: PROPS.CONFIG.FASADE_POSITIONS.length,
                    })
                    PROPS.CONFIG.FASADE_PROPS.push(fasade.material)
                }
            })

            if (section.loops)
                PROPS.CONFIG.LOOPS[secIndex + 1] = section.loops
        })

        if(product_data.fasades) {
            let allFasades = []
            product_data.fasades?.forEach((door, doorID) => {
                allFasades.push(...door)
            })

            allFasades.forEach((fasade, fasadeID) => {
                if(!fasade.error) {
                    PROPS.CONFIG.FASADE_POSITIONS.push({
                        ...OLD_FASADES[0],
                        FASADE_WIDTH: fasade.width,
                        FASADE_HEIGHT: fasade.height,
                        POSITION_X: fasade.position.x,
                        POSITION_Y: fasade.position.y,  //(PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"]) + 2,
                        POSITION_Z: fasade.position.z,
                        FASADE_NUMBER: PROPS.CONFIG.FASADE_POSITIONS.length,
                    })
                    PROPS.CONFIG.FASADE_PROPS.push(fasade.material)
                }
            })
        }
    }

    buildModulegrid(PROPS: THREETypes.TObject, group: THREE.Object3D) {

        PROPS.JSON_FILLINGS = []

        Object.entries(PROPS.CONFIG.SECTIONS).forEach(([secIndex, section]) => {
            if(section.fillings?.length) {
                section.fillings.map((filling) => {
                    const productInfo = this._PRODUCTS[filling.product]

                    if (!productInfo)
                        return

                    const onLoad = (productFilling, isModel = true) => {
                        let size = PROPS.CONFIG.SIZE
                        let start_position = this.getStartPosition(size)

                        if (isModel) {
                            const box = new THREE.Box3().setFromObject(productFilling);
                            const size = box.getSize(new THREE.Vector3());

                            productFilling.userData.trueSizes = {
                                WIDTH: size.x,
                                HEIGHT: size.y,
                                DEPTH: size.z,
                            }

                            productFilling.scale.x = filling.size.x / productFilling.userData.trueSizes.WIDTH
                            productFilling.scale.y = filling.size.y / productFilling.userData.trueSizes.HEIGHT
                            productFilling.scale.z = filling.size.z / productFilling.userData.trueSizes.DEPTH
                        }

                        start_position.add(filling.position)
                        start_position.y += filling.size.y / 2

                        productFilling.position.copy(start_position)

                        if (!isModel)
                            PROPS.JSON_FILLINGS.push(productFilling)

                        group.add(productFilling)
                    }

                    const filling_size = {width: filling.size.x, height: filling.size.y, depth: filling.size.z}
                    const data = this.createModelData(this._MODELS[productInfo.models[0]], PROPS, filling_size);

                    let productFilling
                    if (data.DAE) {
                        this.models_builder.create(data.file, onLoad, {CONFIG: {MODEL: data}}, false)
                    } else {
                        productFilling = this.createSubProductObject(data, PROPS)
                        onLoad(productFilling, false)
                    }
                })
            }
        })

        return
    }

    createSubProductObject(data: THREETypes.TObject, props: THREETypes.TObject) {
        let fasade = this._FASADE[props.CONFIG.MODULE_COLOR]
        let body = this.json_builder.createMesh({ data, fasade })

        body.position.set(eval(data.corr_x), eval(data.corr_y), eval(data.corr_z));
        body.matrixWorldNeedsUpdate = true
        body.name = "BODY"
        body.userData.MATERIAL = data.json.material.type

        const box = new THREE.Box3().setFromObject(body);
        const size = box.getSize(new THREE.Vector3());

        body.userData.trueSizes = {
            BODY_WIDTH: size.x,
            BODY_HEIGHT: size.y,
            BODY_DEPTH: size.z,
        }

        return body
    };

    createLoop(product, PROPS, loops, meshRet = true) {
        const parentModel = this._MODELS[product.models[0]];
        const model = this._MODELS[parentModel.loop_model];
        const loopPosition = this._LOOP_POSITION[parentModel.loop_position];
        let allLoopsMesh = new THREE.Object3D();

        let size = PROPS.CONFIG.SIZE
        let start_position = this.getStartPosition(size)
        //const wallThickness = this._FASADE[PROPS.CONFIG.MODULE_COLOR].DEPTH || 18

        //let loopPositionList = [];

        /*if (!loopPosition)
            return allLoopsMesh

        const loopPropsList = loopPosition.json;
        const groupHeight = PROPS.CONFIG.SIZE.height;

        // находит позиции петель
        loopPropsList.forEach( (loop) => {
            if (
                (loop.maxHeight ? groupHeight <= loop.maxHeight : true) &&
                (loop.minHeight ? groupHeight >= loop.minHeight : true)
            ) {
                // вычисляет пложение петель
                loop.array.forEach( (elPos, i) => {
                    loopPositionList[i] = Math.round(
                        eval(this.expressionsReplace(elPos, PROPS.CONFIG.EXPRESSIONS || {}))
                    );
                });
            }
        });

        if (!PROPS.CONFIG.FASADE_SECTIONS.LOOPS)
            PROPS.CONFIG.FASADE_SECTIONS.LOOPS = {}

        if ((product.moduleType && product.moduleType?.CODE !== "wardrobe") && PROPS.CONFIG.FASADE_SECTIONS.LOOPS?.[section])
            loopPositionList = PROPS.CONFIG.FASADE_SECTIONS.LOOPS[section];
        else if (!product.moduleType) {
            PROPS.CONFIG.FASADE_SECTIONS.LOOPS[section] = loopPositionList
        }

        obj.LOOP_COORDS = loopPositionList;

        //Проверка на опцию "корпус без присадки под петли"
        const hasLoops = PROPS.CONFIG.BASKET && PROPS.CONFIG.BASKET.OPTION && PROPS.CONFIG.BASKET.OPTION.map(item => +item).includes(3955910)
        if (hasLoops) {
            loopPositionList = []
        }

        if (!meshRet)
            return loopPositionList*/

        const create = (dae, secIndex, doorKey, loopCoord) => {
            let loopGroup = new THREE.Object3D();

            let box = new THREE.Box3().setFromObject(dae);
            let loop_size = new THREE.Vector3();
            box.getSize(loop_size)
            let loop = {};
            loop.width = loop_size.x;
            loop.height = loop_size.y;
            loop.depth = loop_size.z;

            const loopside = loopCoord.side
            const rightSide = LOOPSIDE[loopside] === 'right' ||  LOOPSIDE[loopside] === 'right_on_partition'

            let section = PROPS.CONFIG.SECTIONS[secIndex];

            const leftPosition = section.position.x - section.size.x / 2 + Math.round((loop.width + loopPosition.CORRECTION_X) / 2)
            const rightPosition = section.position.x + section.size.x / 2 - Math.round((loop.width + loopPosition.CORRECTION_X) / 2)

            loopCoord.coords.forEach((coord) => {
                let loopMesh = new THREE.Object3D();

                let rotation = new THREE.Vector3(
                    Math.PI / 2,
                    rightSide ? Math.PI : 0,
                    0,
                );

                let position = new THREE.Vector3(
                    rightSide ? rightPosition : leftPosition,
                    coord,
                    rightSide ?
                    PROPS.CONFIG.SIZE.depth + loopPosition.RIGHT_CORRECTION_Z + loop.depth/2:
                    PROPS.CONFIG.SIZE.depth + loopPosition.CORRECTION_Z + loop.depth/2,
                );

                loopMesh.rotation.set(rotation.x, rotation.y, rotation.z);

                position.add(start_position);
                loopMesh.position.copy(position);

                loopMesh.add(dae.clone());
                loopGroup.add(loopMesh);
            })

            return loopGroup
        }
        
        const onLoad = (loopModel) => {
            Object.entries(PROPS.CONFIG.LOOPS).forEach(([secIndex, section]) => {
                // Добавляет петли
                section.forEach((door, doorKey) => {
                    door.forEach((fasadeLoop, fasadeLoopKey) => {
                        allLoopsMesh.add(create(loopModel.clone(), secIndex, fasadeLoopKey, fasadeLoop))
                    });
                });
            })
        }

        this.models_builder.create(model.DAE, onLoad, {CONFIG: {MODEL: model}}, false)

        return allLoopsMesh
    };

}