import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import { useEventBus } from '@/store/appliction/useEventBus';
import { DeepDispose } from '@/Application/Utils/DeepDispose';
import { BuildProduct } from '../BuildProduct';


export class MeshEvents {

    root: THREETypes.TApplication;
    scene: THREETypes.TScene
    events: ReturnType<typeof useEventBus> = useEventBus()
    currentProduct: THREE.Object3D | null = null
    resources: THREETypes.TResources
    dispose: DeepDispose
    buildProduct: BuildProduct

    private onChangeModuleTexture: (data: { [key: string]: any }) => void;
    private onChangeFasadeTexture: (data: { [key: string]: any }) => void;
    private onChangeModelSize: (data: { width: number, height: number, depth: number }) => void;
    private onToggleFasade: () => void;

    constructor(root: THREETypes.TApplication) {

        this.root = root
        this.scene = root._scene
        this.resources = root._resources
        this.dispose = new DeepDispose()
        this.buildProduct = new BuildProduct(root)

        this.addVueEvents()

        this.onChangeModuleTexture = this.changeModuleTexture.bind(this)
        this.onChangeFasadeTexture = this.changeFasadeTexture.bind(this)
        this.onChangeModelSize = this.changeModelSize.bind(this)
        this.onToggleFasade = this.toggleFasade.bind(this)
    }

    get _currentMesh() {
        return this.root._trafficManager?.currentObject
    }
    // set _currentMesh(value) {
    //     this.currentProduct = this.root._trafficManager?._currentObject
    // }
    /** Цвкет корпуса */
    changeModuleTexture(data: { [key: string]: any }) {

        let body = this._currentMesh?.userData.PROPS.BODY
        let shelf = this._currentMesh?.userData.PROPS.SHELF

        console.log(shelf, 'shelf!!')

        body?.traverse((children: THREE.Object3D) => {
            if (children instanceof THREE.Mesh) {
                this.changeColor(children, data.TEXTURE)
            }
        })
        shelf?.forEach((item: THREE.Object3D) => {
            item.traverse((children: THREE.Object3D) => {
                if (children instanceof THREE.Mesh) {
                    this.changeColor(children, data.TEXTURE)
                }
            })
        })

        if (this.root._trafficManager) {
            this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.MODULE_COLOR = data.ID
        }
    }

    /** Цвкет Фасада */
    changeFasadeTexture(data: { [key: string]: any }) {
        console.log(data);

        const props = this._currentMesh?.userData.PROPS
        const fasade = props.FASADE

        const textureSize = {
            width: data.TEXTURE_WIDTH,
            height: data.TEXTURE_HEIGHT,
        }

        Object.values(fasade).forEach((item: any) => {
            item.traverse((children: THREE.Object3D) => {
                if (children instanceof THREE.Mesh) {
                    this.changeColor(children, data.TEXTURE, textureSize)
                }
            })
        })

        // Доделать под разный выбранный фасад

        if (this.root._trafficManager) {
            this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_COLOR = data.ID
        }

    }
  // Доделать под разный выбранный фасад
    toggleFasade() {

        const props = this._currentMesh?.userData.PROPS
        const fasade = props.FASADE

        Object.values(fasade).forEach((item: any) => {

            item.visible ? item.visible = false : item.visible = true

            if (this.root._trafficManager) {
                this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
            }
        })



    }

    hideTable() {

    }


    changeModelSize(data: { width: number, height: number, depth: number }) {

        const position = this._currentMesh!.userData.PROPS.CONFIG.POSITION as THREE.Vector3
        const rotation = this._currentMesh!.userData.PROPS.CONFIG.ROTATION as THREE.Euler

        /** Очищаем родительский объект */
        this.dispose.clearParent(this._currentMesh as THREE.Object3D)
        /** Пересоздаём по новым параметрам */
        let body = this.buildProduct.createProductBody(this._currentMesh as THREE.Object3D, data);
        /** Добавляем к родителю */
        this._currentMesh?.add(body as THREE.Object3D);
        this._currentMesh?.position.set(position.x, position.y, position.z)

        this._currentMesh?.updateMatrixWorld(true);
    }

    changeColor(object: THREE.Object3D, url: string, textureSize?: THREETypes.TObject) {

        object.traverse(children => {
            if (children instanceof THREE.Mesh) {
                this.resources.startLoading(url, 'texture', (file) => {
                    if (file instanceof THREE.Texture) {
                        file.colorSpace = THREE.SRGBColorSpace
                        children.material.map = file
                        children.material.needsUpdate = true;
                        if (textureSize) {
                            children.material.map.wrapS = children.material.map.wrapT = THREE.RepeatWrapping;
                            children.material.map.repeat.set(
                                1 / textureSize.width,
                                1 / textureSize.height
                            );
                            children.material.map.offset.set(0.5, 0.5);
                        }

                    }
                });
            }
        })
    }

    addVueEvents() {
        this.onChangeModuleTexture = (data) => {
            this.changeModuleTexture(data)
        }

        this.onChangeFasadeTexture = (data) => {
            this.changeFasadeTexture(data)
        }

        this.onChangeModelSize = (data) => {
            this.changeModelSize(data as { width: number, height: number, depth: number })
        }

        this.onToggleFasade = () => {
            this.toggleFasade()
        }


        this.events.on('A:ChangeModuleTexture', this.onChangeModuleTexture)
        this.events.on('A:ChangeFasadeTexture', this.onChangeFasadeTexture)
        this.events.on('A:Model-resize', this.onChangeModelSize)
        this.events.on('A:Toggle-Fasad', this.onToggleFasade)
    }

    removeVueEvents() {
        this.events.off('A:ChangeModuleTexture', this.onChangeModuleTexture)
        this.currentProduct = null

        this.events.off('A:Model-resize', this.onChangeModelSize)
    }
}

