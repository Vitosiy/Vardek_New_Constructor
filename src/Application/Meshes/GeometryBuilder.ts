import * as THREE from "three"
import * as THREETypes from "@/types/types"

import { BuildProduct } from "./BuildProduct";

export class GeometryBuilder {

    root: THREETypes.TApplication
    buildProduct: BuildProduct

    constructor(root: THREETypes.TApplication) {
        this.root = root
        this.buildProduct = new BuildProduct(root)
    }

    craeteModel(data: any, onLoad: (object: THREE.Object3D) => void, loadedProps?: any): void {

        console.log(data, 'data')

        this.buildProduct.getModel(data, onLoad, loadedProps)

    }
}