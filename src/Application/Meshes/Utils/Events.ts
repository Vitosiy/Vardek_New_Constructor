import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import { useEventBus } from '@/store/appliction/useEventBus';
import { DeepDispose } from '@/Application/Utils/DeepDispose';
import { BuildProduct } from '../BuildProduct';
import { useAppData } from '@/store/appliction/useAppData';

const alumTextures = new URL('@/assets/metall', import.meta.url).href + "/"


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
    private onChangeGlassColor: (data: number | string) => void;

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
        this.onChangeGlassColor = this.changeGlassColor.bind(this)
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

    /** Цвет Фасада */
    changeFasadeTexture(data: { [key: string]: any }) {

        if(!this._currentMesh) return;

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

        Object.values(fasade).forEach((item: any) => {

            item.traverse((children: THREE.Object3D) => {

                item.visible = true

                if (children instanceof THREE.Mesh) {

                    !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                    children.material = new THREE.MeshStandardMaterial();

                    this.resources.startLoading(`${alumTextures}metal_roughness.jpg`, 'texture', (file) => {
                        children.material.roughnessMap = file
                        children.material.roughnessMap.wrapS = children.material.roughnessMap.wrapT = THREE.RepeatWrapping;
                        children.material.roughnessMap.repeat.set(
                            1 / 512,
                            1 / 512
                        );
                        children.material.roughnessMap.offset.set(0.5, 0.5);
                    }, true)
                    // this.resources.startLoading(`${alumTextures}metal_normal.png`, 'texture', (file) => {
                    //     children.material.normalMap = file
                    //     children.material.normalMap.wrapS = children.material.normalMap.wrapT = THREE.RepeatWrapping;
                    //     children.material.normalMap.repeat.set(
                    //         1 / 512,
                    //         1 / 512
                    //     );
                    //     children.material.normalMap.offset.set(0.5, 0.5);
                    // })
                    this.resources.startLoading(`${alumTextures}metal_metallic.jpg`, 'texture', (file) => {
                        children.material.metallicMap = file
                        children.material.metallicMap.wrapS = children.material.metallicMap.wrapT = THREE.RepeatWrapping;
                        children.material.metallicMap.repeat.set(
                            1 / 512,
                            1 / 512
                        );
                        children.material.metallicMap.offset.set(0.5, 0.5);
                    }, true)

                    children.material.color.set(`${data.COLOR}`)
                    children.material.metalness = 0.5
                    children.material.roughness = 0.5

                    // children.material.clearcoat = 1
                    // children.material.clearcoatRoughness = 0

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

        if(!this._currentMesh) return;

        const props = this._currentMesh?.userData.PROPS
        const fasade = props.FASADE
        const palette = this._APP.PALETTE[data]

        if (palette.DETAIL_PICTURE != null) {

            Object.values(fasade).forEach((item: any) => {

                const box = new THREE.Box3().setFromObject(item);
                const vec = new THREE.Vector3()
                const fasadeSize = box.getSize(vec)

                item.traverse((children: THREE.Object3D) => {
                    item.visible = true

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
                })

                if (this.root._trafficManager) {
                    this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
                }
            })

            return
        }

        Object.values(fasade).forEach((item: any) => {

            item.traverse((children: THREE.Object3D) => {

                item.visible = true

                if (children instanceof THREE.Mesh) {

                    !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                    children.material = new THREE.MeshStandardMaterial();
                    children.material.color.set(`#${palette.HTML}`)
                    children.material.metalness = 0.7
                    children.material.roughness = 0.05

                    children.material.clearcoat = 1
                    children.material.clearcoatRoughness = 0

                    children.material.receiveShadow = true;
                    children.material.castShadow = true;
                    children.material.encoding = THREE.SRGBColorSpace;

                    children.material.needsUpdate = true;

                }
            })

            if (this.root._trafficManager) {
                this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
            }
        })

    }

    changeGlassColor(data: number | string) {

        if(!this._currentMesh) return;

        const props = this._currentMesh?.userData.PROPS
        const fasade = props.FASADE
        const GLASS = this._APP.GLASS[data]

        if (GLASS.DETAIL_PICTURE != null && GLASS.COLOR === null) {

            Object.values(fasade).forEach((item: any) => {

                item.visible = true;

                const box = new THREE.Box3().setFromObject(item);
                const vec = new THREE.Vector3()
                const fasadeSize = box.getSize(vec)

                item.traverse((children: THREE.Object3D) => {

                    if (children instanceof THREE.Mesh) {

                        !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                        this.changeColor(
                            {
                                object: children,
                                url: GLASS.DETAIL_PICTURE,
                                type: "Glass",
                                textureSize: fasadeSize
                            })
                    }
                })

                if (this.root._trafficManager) {
                    this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
                }
            })

            return
        }

        Object.values(fasade).forEach((item: any) => {

            item.traverse((children: THREE.Object3D) => {

                item.visible = true;

                if (children instanceof THREE.Mesh) {

                    !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                    children.material = new THREE.MeshStandardMaterial();
                    children.material.color.set(`#${GLASS.COLOR}`)
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
        })

    }

    // Доделать под разный выбранный фасад
    toggleFasade() {

        if(!this._currentMesh) return;

        const props = this._currentMesh?.userData.PROPS
        const fasade = props.FASADE

        Object.values(fasade).forEach((item: any) => {

            item.visible = false

            if (this.root._trafficManager) {
                this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
            }
        })

    }

    changeModelSize(data: { width: number, height: number, depth: number }) {

        if(!this._currentMesh) return;

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

        console.log(url)

        object.traverse(children => {
            if (children instanceof THREE.Mesh) {

                children.userData.ORIGINAL_COLOR != null ? children.material = children.userData.ORIGINAL_COLOR : ''

                this.resources.startLoading(url, 'texture', (file) => {

                    if (type === "Palette" || type === "Glass") {
                        children.material = new THREE.MeshStandardMaterial()
                    }

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

        this.onChangeGlassColor = (data) => {
            this.changeGlassColor(data)
        }

        this.onChangeModelSize = (data) => {
            this.changeModelSize(data as { width: number, height: number, depth: number })
        }

        this.onToggleFasade = () => {
            this.toggleFasade()
        }


        this.events.on('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.on('A:ChangeFasadeTexture', this.onChangeFasadeTexture);
        this.events.on('A:ChangePaletteColor', this.onChangePaletteColor);
        this.events.on('A:ChangeGlassColor', this.onChangeGlassColor);

        this.events.on('A:Model-resize', this.onChangeModelSize)
        this.events.on('A:Toggle-Fasad', this.onToggleFasade)
    }

    removeVueEvents() {
        this.events.off('A:ChangeModuleTexture', this.onChangeModuleTexture)
        this.currentProduct = null

        this.events.off('A:Model-resize', this.onChangeModelSize)
    }
}

