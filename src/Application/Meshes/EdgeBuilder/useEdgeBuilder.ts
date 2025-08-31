
import { Scene, Mesh, Object3D, LineSegments } from "three";
import { TAppLights, TApplication } from "@/types/types";
import { useMenuStore } from "@/store/appStore/useMenuStore";

export class UseEdgeBuilder {
    private menuStore: ReturnType<typeof useMenuStore> = useMenuStore()
    // private root: TApplication
    private lights: TAppLights
    private scene: Scene;
    constructor(root: TApplication) {
        this.scene = root._scene!
        this.lights = root._lights!
    }

    async drawingMode(value: boolean, object?: Object3D) {
        const curLight = this.menuStore.getShadowValue

        const root = object ?? this.scene
        console.log(root, 'root')

        root.traverse((child: Object3D) => {

            // объекты EdgeBuilder
            if ((child.userData && child.userData.edge) || child.parent?.userData?.edge) {
                if (child.userData.name === 'fasade') {
                    const show = child.userData.parent.userData.SHOW
                    console.log(child.userData, 'CHIMPOCO')

                    if (show && value) {
                        console.log('-1')
                        child.visible = true
                    }
                    if (!show && value) {
                        console.log('-2')
                        child.visible = false
                    }
                    return
                }

                child.visible = value
                return
            }

            // исключение для фасадов
            if (child instanceof Mesh && child.name === 'fasade') {
                if (child.userData.SHOW && !value) {
                    child.visible = true
                }
                if (child.userData.SHOW && value) {
                    child.visible = false
                }

                if (!child.userData.SHOW && value) {
                    child.visible = false
                }

                if (!child.userData.SHOW && !value) {
                    child.visible = false
                }

                return
            }

            // остальные меши и линии
            if (child instanceof Mesh || child instanceof LineSegments) {
                child.visible = !value
            }
        })

        if (value && curLight) {
            this.lights.toggleShadow(false)
        }
        if (!value && curLight) {
            this.lights.toggleShadow(true)
        }

    }

}