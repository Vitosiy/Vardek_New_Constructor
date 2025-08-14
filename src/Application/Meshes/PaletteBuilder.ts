//@ts-nocheck
import * as THREE from "three";
import * as THREETypes from "@/types/types";

export class PaletteBuilder {
    parent: THREETypes.TBuildProduct;

    constructor(parent: THREETypes.TBuildProduct) {
        this.parent = parent;
    }

    createPaletteColor({
        fasade,
        data,
        fasadeNdx,
        props
    }: {
        fasade: THREE.Object3D;
        data: number | string;
        fasadeNdx: number;
        props: { [key: string]: any };
    }) {
        const palette = this.parent._APP.PALETTE[data];
        const fasadeProps = props.CONFIG.FASADE_PROPS[fasadeNdx];
        const fasadeId = fasadeProps.COLOR ?? 567323;
        const fasadeName = this.parent._FASADE[fasadeId].NAME.toLowerCase();

        fasade.visible = true;

        const useTexture = Boolean(palette.DETAIL_PICTURE);
        let fasadeSize: THREE.Vector3 | undefined;

        // Если текстура — размер фасада нужен один раз
        if (useTexture) {
            fasadeSize = new THREE.Box3()
                .setFromObject(fasade)
                .getSize(new THREE.Vector3());
        } else {
            var roughnessValue = fasadeName.includes("матовый") ? 0.5 : 0.02;
        }

        fasade.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            if (!useTexture && child.userData.type === "glass") return;

            if (!child.userData.ORIGINAL_COLOR) {
                child.userData.ORIGINAL_COLOR = child.material;
            }

            if (useTexture) {
                this.parent.changeColor({
                    object: child,
                    url: palette.DETAIL_PICTURE,
                    type: "Palette",
                    textureSize: fasadeSize!
                });
            } else {
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(`#${palette.HTML}`),
                    metalness: 0.7,
                    roughness: roughnessValue
                });

                material.receiveShadow = true;
                material.castShadow = true;
                material.encoding = THREE.SRGBColorSpace;
                material.needsUpdate = true;

                child.material = material;
                fasade.userData.millingMaterial = material;
            }
        });

        fasadeProps.SHOW = true;
        fasadeProps.PALETTE = palette.ID;
    }
}