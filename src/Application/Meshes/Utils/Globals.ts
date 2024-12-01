import { useAppData } from "@/store/appliction/useAppData"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"


export class GlobalsData {

    _APP: THREETypes.TObject = useAppData().getAppData
    _COLOR: THREETypes.TObject = this._APP.COLOR
    _FASADE: THREETypes.TObject = this._APP.FASADE;
    _FASADESIZE: THREETypes.TObject = this._APP.FASADESIZE;
    _FASADENUMBERSIZE: THREETypes.TObject = this._APP.FASADENUMBERSIZE;
    _FASADE_SECTION: THREETypes.TObject = this._APP.FASADE_SECTION;
    _FASADE_POSITION: THREETypes.TObject = this._APP.FASADE_POSITION;
    _FASADE_GROUPS: THREETypes.TObject = this._APP.FASADE_GROUPS
    _MILLING: THREETypes.TObject = this._APP.MILLING    
    _MODELS: THREETypes.TObject = this._APP.MODELS
    _SHELF_POSITION: THREETypes.TObject = this._APP.PRODUCT_SHELF_POSITION

    constructor(){
        
    }

}