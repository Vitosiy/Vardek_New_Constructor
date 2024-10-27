import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import { useEventBus } from '@/store/appliction/useEventBus';
import { DeepDispose } from '@/Application/Utils/DeepDispose';
import { BuildProduct } from '../BuildProduct';
import { useAppData } from '@/store/appliction/useAppData';


export class MeshEvents {


    root: THREETypes.TApplication;
    scene: THREETypes.TScene
    events: ReturnType<typeof useEventBus> = useEventBus()
    currentProduct: THREE.Object3D | null = null
    resources: THREETypes.TResources
    dispose: DeepDispose
    buildProduct: BuildProduct

    _APP: THREETypes.TObject = useAppData().getAppData

    private onChangeModuleTexture: (data: { [key: string]: any }) => void;
    private onChangeFasadeTexture: (data: { [key: string]: any }) => void;
    private onChangePaletteColor: (data: number | string) => void;

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
        this.onChangePaletteColor = this.changePaletteColor.bind(this)
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
                this.changeColor(
                    {
                        object: children,
                        url: data.TEXTURE
                    })
            }
        })
        shelf?.forEach((item: THREE.Object3D) => {
            item.traverse((children: THREE.Object3D) => {
                if (children instanceof THREE.Mesh) {
                    this.changeColor(
                        {
                            object: children,
                            url: data.TEXTURE
                        })
                }
            })
        })

        if (this.root._trafficManager) {
            this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.MODULE_COLOR = data.ID
        }
    }

    /** Цвкет Фасада */
    changeFasadeTexture(data: { [key: string]: any }) {

        console.log(data)

        const props = this._currentMesh?.userData.PROPS
        const fasade = props.FASADE

        const textureSize = {
            x: data.TEXTURE_WIDTH,
            y: data.TEXTURE_HEIGHT,
        }

        if (!data.COLOR) {
            Object.values(fasade).forEach((item: any) => {

                item.visible = true;

                item.traverse((children: THREE.Object3D) => {

                    if (children instanceof THREE.Mesh) {

                        this.changeColor(
                            {
                                object: children,
                                url: data.TEXTURE,
                                textureSize
                            })
                    }

                    if (this.root._trafficManager) {
                        this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
                    }
                })
            })


            if (this.root._trafficManager) {
                this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_COLOR = data.ID
            }

            return;
        }

        console.log(data.COLOR)


        Object.values(fasade).forEach((item: any) => {

            item.traverse((children: THREE.Object3D) => {

                item.visible = true

                if (children instanceof THREE.Mesh) {

                    !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                    children.material = new THREE.MeshStandardMaterial();
                    children.material.color.set(`${data.COLOR}`)
                    children.material.metalness = 0.7
                    children.material.roughness = 0.05

                    children.material.clearcoat = 1
                    children.material.clearcoatRoughness = 0

                    children.material.receiveShadow = true;
                    children.material.castShadow = true;
                    children.material.encoding = THREE.SRGBColorSpace;

                    children.material.needsUpdate = true;

                }
                if (this.root._trafficManager) {
                    this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
                }
            })

            if (this.root._trafficManager) {
                this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_COLOR = data.ID
            }


        })


        // Доделать под разный выбранный фасад


    }

    changePaletteColor(data: number | string) {

        const props = this._currentMesh?.userData.PROPS
        const fasade = props.FASADE
        const palette = this._APP.PALETTE[data]

        if (palette.DETAIL_PICTURE != null) {

            Object.values(fasade).forEach((item: any) => {

                const box = new THREE.Box3().setFromObject(item);
                const vec = new THREE.Vector3()
                const fasadeSize = box.getSize(vec)

                item.traverse((children: THREE.Object3D) => {

                    item.visible = true;

                    if (children instanceof THREE.Mesh) {

                        !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                        this.changeColor(
                            {
                                object: children,
                                url: palette.DETAIL_PICTURE,
                                type: "Palette",
                                textureSize: fasadeSize
                            })
                    }

                    if (this.root._trafficManager) {
                        this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
                    }
                })
            })

            return
        }

        Object.values(fasade).forEach((item: any) => {

            item.traverse((children: THREE.Object3D) => {

                item.visible = true;

                if (children instanceof THREE.Mesh) {

                    !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                    children.material = new THREE.MeshStandardMaterial();
                    children.material.color.set(`#${palette.HTML}`)
                    children.material.metalness = 0.7
                    children.material.roughness = 0.05

                    children.material.clearcoat = 1
                    children.material.clearcoatRoughness = 0
                    children.material.needsUpdate = true;

                    children.material.encoding = THREE.SRGBColorSpace;

               
                }

                if (this.root._trafficManager) {
                    this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
                }
            })
        })

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
        // const rotation = this._currentMesh!.userData.PROPS.CONFIG.ROTATION as THREE.Euler

        /** Очищаем родительский объект */
        this.dispose.clearParent(this._currentMesh as THREE.Object3D)
        /** Пересоздаём по новым параметрам */
        let body = this.buildProduct.createProductBody(this._currentMesh as THREE.Object3D, data);
        /** Добавляем к родителю */
        this._currentMesh?.add(body as THREE.Object3D);
        this._currentMesh?.position.set(position.x, position.y, position.z)

        this._currentMesh?.updateMatrixWorld(true);
    }

    changeColor({ object, url, textureSize, type }: { object: THREE.Object3D, url: string, textureSize?: THREETypes.TObject, type?: string }) {

        object.traverse(children => {
            if (children instanceof THREE.Mesh) {

                children.userData.ORIGINAL_COLOR != null ? children.material = children.userData.ORIGINAL_COLOR : ''


                this.resources.startLoading(url, 'texture', (file) => {

                    if (type === "Palette") {
                        children.material = new THREE.MeshStandardMaterial()
                    }
                    // children.material = new THREE.MeshStandardMaterial()
                    if (file instanceof THREE.Texture) {

                        file.colorSpace = THREE.SRGBColorSpace
                        children.material.map = file

                        if (textureSize) {
                            children.material.map.wrapS = children.material.map.wrapT = THREE.RepeatWrapping;
                            children.material.map.repeat.set(
                                1 / textureSize.x,
                                1 / textureSize.y
                            );
                            children.material.map.offset.set(0.5, 0.5);
                        }
                        if (type === "Palette") {
                            children.material.metalness = 0.7
                            children.material.roughness = 0.05
                            children.material.clearcoat = 1
                            children.material.clearcoatRoughness = 0
                            children.material.needsUpdate = true;
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

        this.onChangePaletteColor = (data) => {
            this.changePaletteColor(data)
        }

        this.onChangeModelSize = (data) => {
            this.changeModelSize(data as { width: number, height: number, depth: number })
        }

        this.onToggleFasade = () => {
            this.toggleFasade()
        }


        this.events.on('A:ChangeModuleTexture', this.onChangeModuleTexture)
        this.events.on('A:ChangeFasadeTexture', this.onChangeFasadeTexture)
        this.events.on('A:ChangePaletteColor', this.onChangePaletteColor)

        this.events.on('A:Model-resize', this.onChangeModelSize)
        this.events.on('A:Toggle-Fasad', this.onToggleFasade)
    }

    removeVueEvents() {
        this.events.off('A:ChangeModuleTexture', this.onChangeModuleTexture)
        this.currentProduct = null

        this.events.off('A:Model-resize', this.onChangeModelSize)
    }
}

