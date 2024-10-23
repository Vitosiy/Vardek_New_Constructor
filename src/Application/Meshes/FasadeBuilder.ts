import * as THREE from "three"
import * as THREETypes from "@/types/types"
import * as THREEInterfases from "@/types/interfases"


export class FasadeBuilder {
    root: THREETypes.TApplication


    constructor(root: THREETypes.TApplication) {
        this.root = root
    }

    getFasadePosition(props: THREETypes.TObject, ndx: number) {

        let fasade_list = props.FASADE_POSITION[ndx]
        let expressions = props.EXPRESSIONS

        console.log(fasade_list, 'fasade_list', expressions, 'expressions')

    }

}