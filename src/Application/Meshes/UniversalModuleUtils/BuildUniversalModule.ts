// @ts-nocheck 

import * as THREE from 'three'
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import {
    GridModule
} from "@/types/constructor2d/interfaсes.ts";

import { useSceneState } from "@/store/appliction/useSceneState"
import { useModelState } from '@/store/appliction/useModelState';

import { BuildProduct } from "../BuildProduct"
import {objectDirection} from "three/src/nodes/accessors/Object3DNode";

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

        const MODULEGRID = moduleParams || model_props.CONFIG.MODULEGRID || false

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
        const PROPS = super.createProductObject(product_data, props)

        let firstSectionSize = new THREE.Vector3(PROPS.SIZE.width - PROPS.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2,
            PROPS.SIZE.height - PROPS.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - PROPS.EXPRESSIONS["#HORIZONT#"],
            PROPS.SIZE.depth - PROPS.EXPRESSIONS["#MATERIAL_THICKNESS#"])

        PROPS.SECTIONS = {
            1: {
                fillings: [],
                size: firstSectionSize,
                position: new THREE.Vector3(PROPS.EXPRESSIONS["#MATERIAL_THICKNESS#"] + firstSectionSize.x / 2,
                    PROPS.EXPRESSIONS["#HORIZONT#"] + PROPS.EXPRESSIONS["#MATERIAL_THICKNESS#"],
                    PROPS.EXPRESSIONS["#MATERIAL_THICKNESS#"] + firstSectionSize.z / 2),
            }
        }

        return PROPS
    }

    parseModulegrid(product_data: THREETypes.TObject, PROPS: Object) {
        const OLD_SECTIONS = PROPS.CONFIG.SECTIONS
        const OLD_FASADES = PROPS.CONFIG.FASADE_POSITIONS
        PROPS.CONFIG.FASADE_POSITIONS = []
        PROPS.CONFIG.FASADE_PROPS = []
        PROPS.CONFIG.SECTIONS = {}

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
                        position: new THREE.Vector3(curSection.position.x, cell.position.y - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"], curSection.position.z),
                        size: new THREE.Vector3(cell.width, PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"], curSection.size.z),
                        product: 4263392,
                        id: curSection.fillings.length + 1,
                        material: PROPS.CONFIG.MODULE_COLOR,
                    })

                cell.cellsRows?.forEach((row, rowIndex) => {

                    if(rowIndex > 0)
                        curSection.fillings.push({  //Добавляем верт. полку, как товар наполнения
                            position: new THREE.Vector3(curSection.position.x, row.position.y, curSection.position.z),
                            size: new THREE.Vector3(PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"], cell.height, curSection.size.z),
                            product: 5820266,
                            id: curSection.fillings.length + 1,
                            material: PROPS.CONFIG.MODULE_COLOR,
                        })

                    row.fillings?.forEach((filling) => {
                        curSection.fillings.push({
                            ...filling,
                            position: new THREE.Vector3(curSection.position.x, curSection.position.y + filling.position.y, curSection.position.z),
                            id: curSection.fillings.length + 1,
                        })
                    })
                })

                cell.fillings?.forEach((filling) => {
                    curSection.fillings.push({
                        ...filling,
                        position: new THREE.Vector3(curSection.position.x, curSection.position.y + filling.position.y, curSection.position.z),
                        id: curSection.fillings.length + 1,
                    })
                })
            })

            section.fillings?.forEach((filling) => {
                curSection.fillings.push({
                    ...filling,
                    position: new THREE.Vector3(curSection.position.x, curSection.position.y + filling.position.y, curSection.position.z),
                    id: curSection.fillings.length + 1,
                })
            })

            section.fasades?.forEach((door, doorID) => {
                door.forEach((fasade, fasadeID) => {
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
                })
            })
        })

    }

    buildModulegrid(PROPS: THREETypes.TObject, group: THREE.Object3D) {

        Object.entries(PROPS.CONFIG.SECTIONS).forEach(([secIndex, section]) => {
            section.fillings?.map((filling) => {
                const productInfo = this._PRODUCTS[filling.product]

                if(!productInfo)
                    return

                const data = this.createModelData(this._MODELS[productInfo.models[0]], PROPS, {width: filling.size.x, height: filling.size.y, depth: filling.size.z});

                let productFilling = this.createSubProductObject(data, PROPS)
                let size = PROPS.CONFIG.SIZE

                let start_position = this.getStartPosition(size)
                start_position.add(filling.position)
                start_position.y += filling.size.y / 2

                productFilling.position.copy(start_position)

                group.add(productFilling)
            })
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

        body.userData.trueSize = {
            BODY_WIDTH: size.x,
            BODY_HEIGHT: size.y,
            BODY_DEPTH: size.z,
        }

        return body
    };

}