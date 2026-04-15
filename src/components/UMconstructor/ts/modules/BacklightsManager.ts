//@ts-nocheck

import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {
    BacklightItem, BacklightSide,
    GridCell,
    GridCellsRow, GridModule,
    GridRowExtra,
    GridSection
} from "@/components/UMconstructor/types/UMtypes.ts";

export default class BacklightsManager {
    scope: UMconstructorClass;
    constructor(scope: UMconstructorClass) {
        this.scope = scope
    }

    getNearestCells(currentCell: GridSection | GridCell | GridCellsRow | GridRowExtra){
        if(currentCell?.sector)
            return this.scope.SHAPE_ADJUSTER.findNearestCells(currentCell.sector, currentCell.sector.sectorData)
        else
            return []
    }

    calcBacklightPosition(backlight: BacklightSide, cell: GridSection | GridCell | GridCellsRow | GridRowExtra, grid: GridModule = this.scope.UM_STORE.getUMGrid()) {
        let result = new this.scope.THREE.Vector3()
        let deepPos = 0
        switch (backlight.deepness){
            case "front":
                deepPos = grid.depth - 100
                break;
            case "mid":
                deepPos = grid.depth / 2
                break;
            case "back":
                deepPos = 100
                break;
        }

        switch (backlight.side){
            case "left":
                result = new this.scope.THREE.Vector3(cell.position.x - cell.width / 2, cell.position.y + cell.height / 2, deepPos);
                break;
            case "right":
                result = new this.scope.THREE.Vector3(cell.position.x + cell.width / 2, cell.position.y + cell.height / 2, deepPos);
                break;
            case "top":
                result = new this.scope.THREE.Vector3(cell.position.x, cell.position.y + cell.height, deepPos);
                break;
            case "bottom":
                result = new this.scope.THREE.Vector3(cell.position.x, cell.position.y, deepPos);
                break;
        }

        return result;
    }
}