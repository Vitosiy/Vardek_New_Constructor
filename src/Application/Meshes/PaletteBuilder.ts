// @ts-nocheck 
import * as THREE from "three";
import * as THREETypes from "@/types/types";

export class PaletteBuilder {
    parent: THREETypes.TBuildProduct;

    constructor(parent: THREETypes.TBuildProduct) {
        this.parent = parent;
    }

    private createMaterial(colorHex: string, roughness: number): THREE.MeshStandardMaterial {
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(`#${colorHex}`),
            metalness: 0.7,
            roughness
        });

        material.receiveShadow = true;
        material.castShadow = true;
        material.encoding = THREE.SRGBColorSpace;
        material.needsUpdate = true;

        return material;
    }

    private applyTexture(child: THREE.Mesh, palette: any, fasadeSize: THREE.Vector3) {
        this.parent.changeColor({
            object: child,
            url: palette.DETAIL_PICTURE,
            type: "Palette",
            textureSize: fasadeSize
        });
    }

    private applyMaterial(child: THREE.Mesh, fasade: THREE.Object3D, palette: any, roughness: number) {
        const material = this.createMaterial(palette.HTML, roughness);
        child.material = material;
        fasade.userData.millingMaterial = material;
    }

    createPaletteColor({
        fasade,
        data,
        fasadeProps,

    }: {
        fasade: THREE.Object3D;
        data: number | string;
        fasadeProps: { [key: string]: any };
    }) {
        const { _APP, _FASADE } = this.parent;
        const palette = _APP.PALETTE[data];
        const fasadeId = fasadeProps.COLOR ?? 567323;
        const fasadeName = _FASADE[fasadeId].NAME.toLowerCase();

        fasade.visible = true;

        const useTexture = Boolean(palette.DETAIL_PICTURE);
        const fasadeSize = useTexture
            ? new THREE.Box3().setFromObject(fasade).getSize(new THREE.Vector3())
            : undefined;

        const roughnessValue = !useTexture && fasadeName.includes("матовый") ? 0.5 : 0.02;

        fasade.traverse((child) => {

              // Пропускаем меш чертежа
            if ((child.userData && child.userData.edge) || child.parent?.userData?.edge) return

            if (!(child instanceof THREE.Mesh)) return;
            if (!useTexture && child.userData.type === "glass") return;

            if (!child.userData.ORIGINAL_COLOR) {
                child.userData.ORIGINAL_COLOR = child.material;
            }

            if (useTexture) {
                this.applyTexture(child, palette, fasadeSize!);
            } else {
                this.applyMaterial(child, fasade, palette, roughnessValue);
            }
        });

        fasadeProps.SHOW = true;
        fasadeProps.PALETTE = palette.ID;
    }
}