//@ts-nocheck

import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {DrawerFasadeObject, FasadeMaterial, FillingObject, MANUFACTURER} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import {GridModule} from "@/components/UMconstructor/types/UMtypes.ts";


export default class FillingsManager {
    scope: UMconstructorClass
    FILLING_TYPES: Map<string, string>
    constructor(scope: UMconstructorClass) {
        this.scope = scope
        this.FILLING_TYPES = new Map(
            Object.entries({
                2166308: 'drawer', //Встраиваемые ящики
                2166309: 'drawer', //Секции
                5718462: 'drawer', //Секции купе
                5726092: 'drawer', //Внешние ящики
                6560591: 'drawer', //Внешние ящики Hi-Tech
                5726093: 'shelf',  //Полки
                12102124: 'shelf', //Полки Hi-Tech
                6311723: 'shelf',  //Полки купе
                6174300: 'any',    //Аксессуары для шкафов
                6513322: 'profile',//Профиль Hi-Tech
            })
        )
    }

    updateFilling(value, currentfilling, type, render = false) {
        const {sec, cell, row, extra, item} = currentfilling

        const gridCopy = Object.assign({}, module.value);

        const section = gridCopy.sections[sec];
        const currentCell = section.cells?.[cell];
        const currentRow = currentCell?.cellsRows?.[row];
        const currentExtra =  currentRow?.extras?.[extra];

        const current = currentExtra || currentRow || currentCell || section;
        const prevValue = currentfilling[type]; //Предыдущее значение
        let newValue = parseInt(value);
        const delta = prevValue - newValue

        let tmpSector = currentfilling.sector
        delete currentfilling.sector

        const fillingData = JSON.parse(JSON.stringify(currentfilling));
        fillingData[type] = newValue;
        fillingData.sector = tmpSector;

        const pixiSector = current.sector;

        const check = pixiSector ? shapeAdjuster.checkToCollision(pixiSector, currentfilling.type, fillingData) : true;

        if (check && (newValue < MAX_SECTION_WIDTH || newValue > MIN_SECTION_WIDTH)) {
            delete currentfilling.error
            currentfilling[type] = newValue;

            if(type === "width") {
                currentfilling.size.x = newValue
                currentfilling.position.x = current.position.x - newValue / 2;
            }
            if(type === "height") {
                currentfilling.size.y = newValue
                currentfilling.position.y = current.position.y;
                currentfilling.distances.bottom = 0;
                currentfilling.distances.top = 0;
            }

        } else {
            currentfilling.error = true
            currentfilling[type] = prevValue;
        }

        if(currentfilling.type === 'vertical_shelf') {
            currentfilling.width = module.value.moduleThickness
            currentfilling.size.x = module.value.moduleThickness
        }

        if(currentfilling.type === 'shelf') {
            currentfilling.height = module.value.moduleThickness
            currentfilling.size.y = module.value.moduleThickness
        }

        currentfilling.sector = tmpSector;
        module.value = gridCopy;

        if (render)
            visualizationRef.value.renderGrid();
    };

    checkLoopsCollision(secIndex: number, grid: GridModule){
        this.scope.LOOPS.checkLoopsCollision(secIndex, grid)
    };

    selectCell(sec: number, cell: number|null = null, row: number|null = null, extra: number|null = null, item: number|null = 0){
        this.scope.UM_STORE.setSelected("fillings", {sec, cell, row, extra, item})
    };

    createFillingDataToCheck(product, currentSpace, isVerticalItem = false, isDrawer = false) {

        const grid = this.scope.UM_STORE.getUMGrid()
        let width = product.width
        let height = product.height
        let isSlidingDoors = grid.fasades ? 100 : 0

        if (!isVerticalItem && (height > currentSpace.height || product.ACTUAL_DEPT > grid.depth - isSlidingDoors)) {
            return false
        }

        if (isVerticalItem) {
            height = currentSpace.height;
        } else if (width !== currentSpace.width)
            width = currentSpace.width;

        let tempFilling = {
            width,
            height,
            data: product,
            isVerticalItem,
            isDrawer,
        };

        return this.scope.RENDER_REF.value.checkPositionFillingToCreate(tempFilling);
    };

    getFasadePosition(_position:number, grid: GridModule) {
        
        const PROPS = this.scope.UM_STORE.getUMData();
        let fasadePosition = this.scope.APP.FASADE_POSITION[_position];

        if (!fasadePosition || !grid)
            return {}

        fasadePosition = this.scope.BUILDER.getExec(
            this.scope.BUILDER.expressionsReplace(fasadePosition,
                Object.assign(PROPS.CONFIG.EXPRESSIONS,
                    {
                        "#X#": grid.width,
                        "#Y#": grid.height - (grid.isRestrictedModule ? 0 : grid.horizont),
                        "#Z#": grid.depth,
                    }))
        )

        return fasadePosition
    }

    addFilling(_product, productGroupID){

        const product = Object.assign({}, _product);
        const grid = this.scope.UM_STORE.getUMGrid();

        const {sec, cell, row, extra} = this.scope.UM_STORE.getSelected("module")
        const isHiTechProfile = this.scope.APP.PRODUCTS_TYPES[product.productType]?.CODE.includes("hi_tech_profile") || false
        const isBottomHiTechProfile = isHiTechProfile && this.scope.APP.PRODUCTS_TYPES[product.productType]?.CODE.includes("bottom") || false
        const PROPS = this.scope.UM_STORE.getUMData();

        let name = product.NAME?.toLowerCase()
        let _type = name.includes('разделитель') ? 'vertical_shelf' : this.FILLING_TYPES.get(`${productGroupID}`) || 'any';
        if (_type === 'shelf' && name.includes('стеклянная')) {
            _type = "glass_shelf"
        }

        const isVerticalItem = _type === "vertical_shelf"

        const currentSection = grid.sections[sec];
        const currentCell = currentSection.cells?.[cell];
        const currentRow = currentCell?.cellsRows?.[row];
        const currentExtra = currentRow?.extras?.[extra];

        let currentModuleSegment = currentExtra || currentRow || currentCell || currentSection

        if (row === null && cell === null && sec === null && extra === null) {
            alert("Пожалуйста, выберите секцию для добавления наполнения", "error");
            return;
        }

        if (product.MIN_FASADE_SIZE) {
            if (row || extra) {
                alert("Нельзя установить ящик с фасадом в вертикальную разделитель!", "error");
                return;
            }

            if (!currentSection?.fasades?.[0]?.[0] && !currentSection?.fasadesDrawers?.[0]) {
                alert("Нельзя установить ящик с фасадом в секцию без двери! Добавьте фасад, даже если он должен быть пустым!", "error");
                return;
            }
        }

        if (isBottomHiTechProfile && !PROPS.CONFIG.OPTIONS.find((opt, index) => {
            if (+opt.id === 4722965 && opt.active)
                return opt;
        })) {
            alert("Г-образный профиль доступен только для навесного модуля", "error")
            return;
        }

        if (isHiTechProfile && grid.profilesConfig?.sideProfile) {
            alert("Нельзя добавить горизонтальный профиль вместе с боковым!", "error");
            return;
        }

        let currentFillingsArray = []

        if (_type === 'shelf') {
            product.height = grid.moduleThickness
        }

        if (_type === 'vertical_shelf') {
            product.width = grid.moduleThickness
        }

        const startFillingData = this.createFillingDataToCheck(product, currentModuleSegment, isVerticalItem, !!product.MIN_FASADE_SIZE);

        if (!startFillingData) {
            alert("Позиция не найдена");
            return;
        }

        if (!currentModuleSegment.fillings)
            currentModuleSegment.fillings = []
        currentFillingsArray = currentModuleSegment.fillings

        let depth = product.depth
        if (product.SIZE_EDIT_DEPTH_MAX) {
            depth = grid.depth;

            const moduleProductInfo = this.scope.APP.CATALOG.PRODUCTS[grid.productID]
            if (moduleProductInfo?.moduleType?.CODE === "wardrobe")
                depth -= 100;
        }

        let width = startFillingData.width;
        let height = startFillingData.height;
        let profileData = {}
        if (isHiTechProfile) {
            if (!grid.profilesConfig) {
                grid.profilesConfig = {COLOR: product.COLOR[0] != null ? product.COLOR[0] : grid.moduleColor}
                grid.profilesConfig.colorsList = [...product.COLOR]
                grid.profilesConfig.onSectionSize = false

                PROPS.CONFIG['PROFILECOLOR'] = grid.profilesConfig.COLOR
            }

            height = product.height || grid.moduleThickness
            if (!isBottomHiTechProfile && !this.scope.APP.PRODUCTS_TYPES[product.productType]?.CODE.includes("section")) {
                width = grid.profilesConfig.onSectionSize ? startFillingData.width : startFillingData.width + grid.moduleThickness * 2

                if (!grid.profilesConfig.onSectionSize) {
                    width = startFillingData.width + grid.moduleThickness * 2
                    startFillingData.x -= grid.moduleThickness
                } else {
                    width = startFillingData.width
                }
            }

            profileData.COLOR = grid.profilesConfig?.COLOR ? grid.profilesConfig?.COLOR : grid.moduleColor

            let typeProfile = product.NAME.toLowerCase().split("-")[0].replace(/\s/g, '')
            if (typeProfile !== "c" && typeProfile !== "l")
                typeProfile = typeProfile.split(",").pop().replace(/\s/g, '')

            profileData.TYPE_PROFILE = typeProfile
            profileData.offsetFasades = typeProfile == "c" ? 36 : typeProfile == "l" ? 38 : 0
            profileData.manufacturerOffset = typeProfile == "c" ? -18.5 : typeProfile == "l" ? -19.5 : 0

            if (isBottomHiTechProfile) {
                profileData.isBottomHiTechProfile = true
                startFillingData.y = grid.height - grid.horizont - height
            }

            if (!currentModuleSegment.hiTechProfiles)
                currentModuleSegment.hiTechProfiles = []

            profileData.id = currentModuleSegment.hiTechProfiles.length + 1
        }

        let fillingObject = <FillingObject>{
            isVerticalItem,
            product: product.ID,
            id: currentFillingsArray.length + 1,
            name: product.NAME,
            image: product.PREVIEW_PICTURE,
            type: _type,
            position: new THREE.Vector2(startFillingData.x, startFillingData.y),
            size: new THREE.Vector3(width, height, depth),
            width,
            height,
            color: profileData.COLOR || false,
            sec,
            cell,
            row,
            extra,
        };


        if (isHiTechProfile) {
            fillingObject.isProfile = profileData
            fillingObject.moduleThickness = grid.moduleThickness
            currentModuleSegment.hiTechProfiles.push(fillingObject)
            currentFillingsArray.push(fillingObject);

            calcDrawersFasades(sec)
        } else
            currentFillingsArray.push(fillingObject);

        if (product.MIN_FASADE_SIZE) {
            if (!currentSection.fasadesDrawers)
                currentSection.fasadesDrawers = []

            const {PRODUCT} = PROPS
            let productInfo = this.scope.APP.CATALOG.PRODUCTS[PRODUCT];

            const leftWidth = grid.leftWallThickness || grid.moduleThickness;
            const rightWidth = grid.rightWallThickness || grid.moduleThickness;

            const correctSectionFasadeWidth =
                grid.sections.length > 1 ?
                    sec > 0 && sec < grid.sections.length - 1 ? currentSection.width + grid.moduleThickness - 4 :
                        currentSection.width + ((sec == 0 ? leftWidth : rightWidth) - 2) + (grid.moduleThickness / 2 - 2) :
                    grid.width - 4;

            let baseFasade = grid.sections[sec]?.fasades?.[0]?.[0] || grid.sections[0]?.fasades?.[0]?.[0] || currentSection.fasadesDrawers?.[0]

            let manufacturerOffset = 0
            let manufacturer_name = product.EN_NAME?.toLowerCase() || product.NAME?.toLowerCase()
            if(product.FASADE_DRAWER_OFFSET){
                manufacturerOffset = product.FASADE_DRAWER_OFFSET
            }
            else
                Object.entries(MANUFACTURER).forEach(([key, offset]) => {
                    if (manufacturer_name.includes(key)) {
                        manufacturer_name = key
                        manufacturerOffset = offset
                    }
                })

            fillingObject.type = "drawer"
            fillingObject.moduleThickness = grid.moduleThickness
            fillingObject.fasade = <DrawerFasadeObject>{
                id: currentSection.fasadesDrawers.length + 1,
                width: correctSectionFasadeWidth,
                height: product.MIN_FASADE_SIZE,
                minY: product.MIN_FASADE_SIZE,
                maxY: product.MAX_FASADE_SIZE,
                loopsSide: false,
                position: new THREE.Vector2(baseFasade.position.x, grid.height - (startFillingData.y + startFillingData.height + manufacturerOffset)),
                material: <FasadeMaterial>{
                    ...baseFasade.material,
                    HANDLES: {...baseFasade.material.HANDLES}
                },
                type: "fasade",
                manufacturerOffset,
                item: fillingObject.id,
                sec,
                cell,
                row,
            }


            currentSection.fasadesDrawers.push(fillingObject.fasade);
            this.scope.FASADES.EXTERNAL_FASADES.calcDrawersFasades(sec, grid)
        }

        selectCell(sec, cell, row, extra, currentFillingsArray.length - 1);

        // // Обновляем рендер
        visualizationRef.value.renderGrid();
    };

    deleteFilling(secIndex, itemIndex, cellIndex = null, rowIndex = null, extraIndex = null){
        const sec = grid.sections[secIndex];
        const cell = sec.cells?.[cellIndex];
        const row = cell?.cellsRows?.[rowIndex];
        const extra = row?.extras?.[extraIndex];

        const curRow = extra || row || cell || sec;
        let needFasadesUpdate = false
        let profileUpdate = false
        let curItem = curRow.fillings[itemIndex];
        curRow.fillings.forEach((filling, index) => {
            if (index > itemIndex) {
                filling.id -= 1;
                if (filling.fasade)
                    filling.fasade.item = filling.id;
            }
        })

        curRow.fillings = curRow.fillings.filter((el, index) => {
            if (index === itemIndex) {
                if (el.fasade)
                    needFasadesUpdate = true
                if (el.isProfile)
                    profileUpdate = true
            }

            return index !== itemIndex;
        });

        if (needFasadesUpdate || profileUpdate) {
            if (sec.fasadesDrawers?.length || curRow.hiTechProfiles?.length) {

                if (sec.fasadesDrawers?.length && needFasadesUpdate) {
                    sec.fasadesDrawers = sec.fasadesDrawers.filter((el, index) => {
                        return el.id !== curItem.fasade.id;
                    });

                    sec.fasadesDrawers.forEach((el, index) => {
                        if (el.id > curItem.fasade.id)
                            el.id -= 1;
                    })

                    if (!sec.fasadesDrawers.length)
                        delete sec.fasadesDrawers
                }

                if (curRow.hiTechProfiles?.length && profileUpdate) {
                    curRow.hiTechProfiles = curRow.hiTechProfiles.filter((el, index) => {
                        return el.isProfile.id !== curItem.isProfile.id;
                    });

                    curRow.hiTechProfiles.forEach((el, index) => {
                        if (el.isProfile.id > curItem.isProfile.id)
                            el.isProfile.id -= 1;
                    })

                    if (!curRow.hiTechProfiles.length)
                        delete curRow.hiTechProfiles
                }

                calcDrawersFasades(secIndex)
            } else
                updateFasades()
        }

        visualizationRef.value.renderGrid();
    };

    updateFasades(){
        emit("product-updateFasades");
    }

    calcDrawersFasades(sec, fillingData = false) {
        emit("product-calcDrawersFasades", sec, fillingData);
    }

    updateFilling(value, filling, type, render = false){
        emit("product-updateFilling", value, filling, type, render);
    };

    changeFillingPositionX(event, _value, key, secIndex, cellIndex = null, rowIndex = null, extraIndex = null){

        let value = Math.min(+_value, +event.target.max);
        value = Math.max(+value, +event.target.min);

        selectCell(secIndex, cellIndex, rowIndex, extraIndex, key);

        const gridCopy = Object.assign({}, grid);

        const sec = gridCopy.sections[secIndex];
        const currentColl = sec.cells?.[cellIndex];
        const currentRow = currentColl?.cellsRows?.[rowIndex];
        const currentExtra = currentRow?.extras?.[extraIndex];

        const current = currentExtra || currentRow || currentColl || sec;

        const currentfilling = current.fillings[key];

        if (currentfilling?.isProfile?.isBottomHiTechProfile) {
            alert("Г-образный профиль нельзя перемещать!");
            return;
        }

        const prevValue = currentfilling.position.x; //Предыдущее значение

        let delta = +value - currentfilling.distances.left
        const newValue = prevValue + delta

        let tmpSector = currentfilling.sector
        delete currentfilling.sector

        const fillingData = JSON.parse(JSON.stringify(currentfilling));
        fillingData.position.x = newValue;
        fillingData.sector = tmpSector;

        const pixiSector = current.sector;

        // Проверяем коллизию
        const check = props.shapeAdjuster.checkToCollision(pixiSector, false, fillingData);

        if (check) {
            currentfilling.position.x = fillingData.position.x;
        } else {
            alert(`Нельзя изменить позицию на ${+_value}`)
            currentfilling.position.x = prevValue;
        }

        currentfilling.sector = tmpSector;
        grid = gridCopy;

        if (currentfilling.fasade)
            calcDrawersFasades(secIndex)

        visualizationRef.value.renderGrid();
    };

    changeFillingPositionY(event, _value, key, secIndex, cellIndex = null, rowIndex = null, extraIndex = null) {
        let value = Math.min(+_value, +event.target.max);
        value = Math.max(+value, +event.target.min);

        selectCell(secIndex, cellIndex, rowIndex, extraIndex, key);

        const gridCopy = Object.assign({}, grid);

        const sec = gridCopy.sections[secIndex];
        const currentColl = sec.cells?.[cellIndex];
        const currentRow = currentColl?.cellsRows?.[rowIndex];
        const currentExtra = currentRow?.extras?.[extraIndex];

        const current = currentExtra || currentRow || currentColl || sec;

        const currentfilling = current.fillings[key];

        if (currentfilling?.isProfile?.isBottomHiTechProfile) {
            alert("Г-образный профиль нельзя перемещать!");
            return;
        }

        const prevValue = currentfilling.position.y; //Предыдущее значение

        let delta = +value - currentfilling.distances.bottom
        const newValue = prevValue - delta


        let tmpSector = currentfilling.sector
        delete currentfilling.sector

        const fillingData = JSON.parse(JSON.stringify(currentfilling));
        fillingData.position.y = newValue;
        fillingData.sector = tmpSector;

        const pixiSector = current.sector;

        // Проверяем коллизию
        const check = props.shapeAdjuster.checkToCollision(pixiSector, false, fillingData);

        if (check) {
            currentfilling.position.y = fillingData.position.y;
        } else {
            alert(`Нельзя изменить позицию на ${+_value}`)
            currentfilling.position.y = prevValue;
        }

        currentfilling.sector = tmpSector;
        grid = gridCopy;

        if (currentfilling.fasade)
            calcDrawersFasades(secIndex)
        else {
            checkLoopsCollision(secIndex)
        }

        visualizationRef.value.renderGrid();
    };

    createFacadeData(fasadeIndex){
        const productId = modelState.getCurrentModel.userData.PROPS.PRODUCT;
        const {FACADE} = modelState._PRODUCTS[productId];
        modelState.createCurrentModelFasadesData({
            data: FACADE,
            fasadeNdx: fasadeIndex,
            productId,
        });
    };

    openFasadeSelector(secIndex, cellIndex, rowIndex, itemIndex) {
        isOpenMaterialSelector.value = false;

        /** @Создание_данных_для_выбранного_фасада */
        createFacadeData();

        if (
            currentFasadeMaterial.value &&
            (
                secIndex == currentFasadeMaterial.value.secIndex &&
                cellIndex == currentFasadeMaterial.value.cellIndex &&
                rowIndex == currentFasadeMaterial.value.rowIndex &&
                itemIndex == currentFasadeMaterial.value.itemIndex
            )
        ) {
            currentFasadeMaterial.value = false;
            return;
        }

        setTimeout(() => {
            const curSection = grid.sections[secIndex]
            const curCell = curSection?.cells?.[cellIndex]
            const curRow = curCell?.cellsRows?.[rowIndex]

            const curModuleSegment = curRow || curCell || curSection

            let data = curModuleSegment.fillings[itemIndex].fasade.material
            currentFasadeMaterial.value = {
                secIndex,
                cellIndex,
                rowIndex,
                itemIndex,
                data,
                fasadeSize: {
                    FASADE_WIDTH: curModuleSegment.fillings[itemIndex].fasade.width,
                    FASADE_HEIGHT: curModuleSegment.fillings[itemIndex].fasade.height,
                    isDrawer: true
                },
            }
            selectCell(secIndex, cellIndex, rowIndex, null, itemIndex)
            isOpenMaterialSelector.value = true
        }, 10)
    }

    openHandleSelector(secIndex, cellIndex, rowIndex, itemIndex){
        isOpenHandleSelector.value = false;
        isOpenMaterialSelector.value = false;

        if(isOpenMaterialSelector.value)
            closeMenu()

        if (
            currentHandle.value &&
            secIndex === currentHandle.value.secIndex &&
            cellIndex === currentHandle.value.cellIndex &&
            rowIndex === currentHandle.value.rowIndex &&
            itemIndex === currentHandle.value.itemIndex
        ) {
            closeMenu()
            return;
        }

        setTimeout(() => {
            const curSection = grid.sections[secIndex]
            const curCell = curSection?.cells?.[cellIndex]
            const curRow = curCell?.cellsRows?.[rowIndex]

            const curModuleSegment = curRow || curCell || curSection
            let data = curModuleSegment.fillings[itemIndex].fasade.material

            currentHandle.value = {
                secIndex,
                cellIndex,
                rowIndex,
                itemIndex,
                data,
            };
            selectCell(secIndex, cellIndex, rowIndex, itemIndex);
            isOpenHandleSelector.value = true;
        }, 10);
    };

    selectHandle(data, type){
        switch (type) {
            case "handle":
                currentHandle.value.data.HANDLES.id = data;
                break;
            case "position":
                currentHandle.value.data.HANDLES.position = data;
                break;
        }
    }

    selectOption(value: Object, type: string, palette: Object = false){

        currentFasadeMaterial.value.data[type] = value ? value.ID : null;
        if (palette)
            currentFasadeMaterial.value.data['PALETTE'] = palette

        let {secIndex, cellIndex, rowIndex, itemIndex} = currentFasadeMaterial.value;
        const curSection = grid.sections[secIndex]
        const curCell = curSection?.cells?.[cellIndex]
        const curRow = curCell?.cellsRows?.[rowIndex]

        const curModuleSegment = curRow || curCell || curSection
        curModuleSegment.fillings[itemIndex].fasade.material =
            Object.assign(curModuleSegment.fillings[itemIndex].fasade.material, currentFasadeMaterial.value.data)
    };

    changeDrawerFasade(event, value, key, secIndex, cellIndex = null, rowIndex = null){
        selectCell(secIndex, cellIndex, rowIndex, null, key);

        const gridCopy = Object.assign({}, grid);

        const sec = gridCopy.sections[secIndex];
        const currentColl = sec.cells?.[cellIndex];
        const currentRow = currentColl?.cellsRows?.[rowIndex] || currentColl || sec;

        const currentfilling = currentRow.fillings[key];

        if (!currentfilling?.fasade) {
            alert("У элемента нет фасада!");
            return
        }

        const prevValue = currentfilling.fasade.height; //Предыдущее значение
        const newValue = parseInt(value)

        let tmpSector = currentfilling.sector
        let tmpFasade = currentfilling.fasade

        delete currentfilling.sector
        delete currentfilling.fasade

        const fillingData = JSON.parse(JSON.stringify(currentfilling));
        fillingData.sector = tmpSector;
        fillingData.fasade = tmpFasade;
        fillingData.fasade.height = newValue;

        const pixiSector = currentRow.sector;

        // Проверяем коллизию
        const check = props.shapeAdjuster.checkToCollision(pixiSector, false, fillingData);

        currentfilling.sector = tmpSector;
        currentfilling.fasade = tmpFasade;
        if (check) {
            currentfilling.fasade.height = fillingData.fasade.height;
        } else {
            currentfilling.fasade.height = prevValue;
            toAster.error("Ошибка! Размер фасада слишком велик!")
        }

        grid = gridCopy;

        calcDrawersFasades(secIndex)

        visualizationRef.value.renderGrid();
    };
}