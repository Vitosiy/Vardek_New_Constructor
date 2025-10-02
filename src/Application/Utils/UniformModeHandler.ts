// @ts-nocheck

import * as THREETypes from "@/types/types"

/**
 * Обработчик для переключения режима переходящего рисунка
 */
export class UniformModeHandler {
    uniformEvents: THREETypes.TUniformTextureEvents
    uniformState: any
    boxHelper: any
    trafficManager: any
    uniformTextureBuilder: THREETypes.TUniformTextureBuilder

    constructor(
        uniformEvents: THREETypes.TUniformTextureEvents,
        uniformState: any,
        boxHelper: any,
        trafficManager: any,
        uniformTextureBuilder: THREETypes.TUniformTextureBuilder
    ) {
        this.uniformEvents = uniformEvents
        this.uniformState = uniformState
        this.boxHelper = boxHelper
        this.trafficManager = trafficManager
        this.uniformTextureBuilder = uniformTextureBuilder
    }

     // Переключает режим переходящего рисунка
     
    toggleUniformMode() {
        this.uniformEvents.togleUnionMode()
        this.uniformEvents.desablePreGrouping()
        this.uniformEvents.desableGroupAddition()

        if (this.uniformEvents._unionMode) {
            /** Убираем хелпер */
            this.boxHelper.removeBoxHelper()
            /** Убираем линейку */
            this.trafficManager.ruler.clearRuler()

            this.boxHelper.toggleGroupBox(true, this.uniformTextureBuilder._groupsBoxHelper)
        }
        else {
            this.boxHelper.clearSelect()
            this.uniformState.setPreGroup(0)
            this.uniformTextureBuilder.clearTemporaryGroups()
            this.uniformEvents.desableGroupAddition()
            this.uniformEvents.desableDegrouping()
            this.boxHelper.toggleGroupBox(false, this.uniformTextureBuilder._groupsBoxHelper)
        }
    }

    // Принудительно отключает режим переходящего рисунка
    disableUniformMode() {
        if (this.uniformEvents._unionMode) {
            this.uniformEvents.togleUnionMode()
        }
        
        this.uniformEvents.desablePreGrouping()
        this.uniformEvents.desableGroupAddition()
        
        this.boxHelper.clearSelect()
        this.uniformState.setPreGroup(0)
        this.uniformTextureBuilder.clearTemporaryGroups()
        this.uniformEvents.desableGroupAddition()
        this.uniformEvents.desableDegrouping()
        this.boxHelper.toggleGroupBox(false, this.uniformTextureBuilder._groupsBoxHelper)
        
        // Обновляем состояние в store
        this.uniformState.setUniformModeData({ 
            uniformMode: false, 
            preGrouping: false 
        })
    }
}
