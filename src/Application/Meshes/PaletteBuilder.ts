//@ts-nocheck
import * as THREE from "three"
import * as THREETypes from "@/types/types"

export class PaletteBulider {

    parent: THREETypes.TBuildProduct

    constructor(parent: THREETypes.TBuildProduct) {

        this.parent = parent
    }

    createPaletteColor({ fasade, data, fasadeNdx, props }: { fasade: THREE.Object3D, data: number | string, fasadeNdx: number, props: { [key: string]: any } }) {

        const palette = this.parent._APP.PALETTE[data]
        const fasadeId = props.CONFIG.FASADE_PROPS[fasadeNdx].COLOR ?? 567323
        const fasadeDataName = this.parent._FASADE[fasadeId].NAME.toLowerCase()

        const roughnessValue = fasadeDataName.includes('матовый') ? 0.5 : 0.02


        if (palette.DETAIL_PICTURE != null) {

            console.log('wwwww')

            const box = new THREE.Box3().setFromObject(fasade);
            const vec = new THREE.Vector3()
            const fasadeSize = box.getSize(vec)

            fasade.traverse((children: THREE.Object3D) => {
                fasade.visible = true

                if (children instanceof THREE.Mesh) {

                    !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                    this.parent.changeColor(
                        {
                            object: children,
                            url: palette.DETAIL_PICTURE,
                            type: "Palette",
                            textureSize: fasadeSize
                        })
                }
            })

            props.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
            props.CONFIG.FASADE_PROPS[fasadeNdx].PALETTE = palette.ID

            return
        }


        fasade.traverse((children: THREE.Object3D) => {

            fasade.visible = true

            if (children instanceof THREE.Mesh) {

                !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                children.material = new THREE.MeshStandardMaterial();
                children.material.color.set(`#${palette.HTML}`)
                children.material.metalness = 0.7

                children.material.roughness = roughnessValue

                children.material.receiveShadow = true;
                children.material.castShadow = true;
                children.material.encoding = THREE.SRGBColorSpace;

                children.material.needsUpdate = true;

                fasade.userData.millingMaterial = children.material

                

            }
        })



        props.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
        props.CONFIG.FASADE_PROPS[fasadeNdx].PALETTE = palette.ID

    }

}

