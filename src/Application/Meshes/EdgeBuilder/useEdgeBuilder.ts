
import { Scene, Mesh, Object3D, LineSegments } from "three";
import { TAppLights, TApplication } from "@/types/types";
import { useRoomOptions } from "@/components/left-menu/option/roomOptions/useRoomOptons";

export class UseEdgeBuilder {
    private roomOptions: ReturnType<typeof useRoomOptions> = useRoomOptions()
    // private root: TApplication
    private lights: TAppLights
    private scene: Scene;
    constructor(root: TApplication) {
        this.scene = root._scene!
        this.lights = root._lights!
    }

    async drawingMode(value: boolean, object?: Object3D) {
        const curLight = this.roomOptions.getShadowValue

        const root = object ?? this.scene

        root.traverse((child: Object3D) => {

            // объекты EdgeBuilder
            if ((child.userData && child.userData.edge) || child.parent?.userData?.edge) {
                if (child.userData.name === 'fasade') {
                    const show = child.userData.parent.userData.SHOW

                    if (show && value) {
                        child.visible = true
                    }
                    if (!show && value) {
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