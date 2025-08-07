//@ts-nocheck
import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"
import {useMenuStore} from "@/store/appStore/useMenuStore.ts";
import {useModelState} from "@/store/appliction/useModelState.ts";

export class DragAndDropManager {

    canvas: HTMLElement;
    scene: THREE.Scene;

    geometryBuilder: THREE.TGeometryBuilder;
    universalGeometryBuilder: THREE.TUniversalGeometryBuilder;
    raycaster: THREE.Raycaster
    mouse: THREE.Vector2
    camera: THREE.Camera

    roomManager: THREETypes.TRoomManager
    trafficManager: THREETypes.TTrafficManager
    boxHelper: THREETypes.TCustomBoxHelper

    setObject: THREETypes.SetObject

    roomParams: { [key: string]: number | 0 } | THREEInterfases.IWallSizes

    handleDragOverBound: (event: DragEvent) => void;
    handleDropBound: (event: DragEvent) => void

    constructor(root: THREETypes.TApplication, mouse: THREE.Vector2, raycaster: THREE.Raycaster, trafficManager: THREETypes.TTrafficManager) {

        this.root = root
        this.canvas = root._canvas;
        this.scene = root._scene;
        this.camera = root._camera
        this.roomManager = root._roomManager
        this.trafficManager = trafficManager
        this.setObject = root._setObject
        this.roomParams = root._roomManager?._roomParams
        this.geometryBuilder = root._geometryBuilder
        this.universalGeometryBuilder = trafficManager.universalGeometryBuilder
        this.boxHelper = root._customBoxHelper

        this.raycaster = raycaster;
        this.mouse = mouse;

        this.handleDragOverBound = this.handleDragOver.bind(this)
        this.handleDropBound = this.handleDrop.bind(this)

        this.setupDragAndDrop();

    }

    setupDragAndDrop() {
        this.canvas.addEventListener('dragover', this.handleDragOverBound, false);
        this.canvas.addEventListener('drop', this.handleDropBound, false);
    }

    dispose() {
        this.canvas.removeEventListener('dragover', this.handleDragOverBound, false);
        this.canvas.removeEventListener('drop', this.handleDropBound, false);
    }

    private handleDragOver(event: DragEvent) {

        event.preventDefault();
    }

    private handleDrop(event: DragEvent) {

        event.preventDefault();

        if (!this.roomManager._roomFloor) return;

        const data = event.dataTransfer?.getData('text');

        if (data && data.trim() !== '') {
            try {
                const productData = JSON.parse(data) as THREEInterfases.IModelsData;

                this.mouse.x = ((event.clientX - this.canvas.getBoundingClientRect().left) / this.canvas.clientWidth) * 2 - 1;
                this.mouse.y = -((event.clientY - this.canvas.getBoundingClientRect().top) / this.canvas.clientHeight) * 2 + 1;

                this.raycaster.setFromCamera(this.mouse, this.camera);

                const intersects = this.raycaster.intersectObjects([...this.roomManager._roomWalls, this.roomManager._roomFloor]);

                if (intersects.length > 0) {
                    const point = intersects[0].point;
                    const surface = intersects[0].object;

                    if (productData.moduleType || productData.ID == 3954672) {
                        this.universalGeometryBuilder.craeteModel(productData, (object) => {

                            object.userData.MOUSE_POSITION = {
                                x: point.clone().project(this.camera).x * this.trafficManager._sizes.width * 0.5,
                                y: point.clone().project(this.camera).y * this.trafficManager._sizes.height * -0.5,
                            };
                            this.setObject.create({
                                object,
                                point,
                                trafficManager: this.trafficManager,
                                boxHelper: this.boxHelper,
                                wall: surface
                            });

                            //useModelState().setCurrentModel(object);
                        });
                    } else {
                        this.geometryBuilder.craeteModel(productData, (object) => {

                            object.userData.MOUSE_POSITION = {
                                x: point.clone().project(this.camera).x * this.root._sizes.width * 0.5,
                                y: point.clone().project(this.camera).y * this.root._sizes.height * -0.5,
                            };

                            this.setObject.create({
                                object,
                                point,
                                trafficManager: this.trafficManager,
                                boxHelper: this.boxHelper,
                                wall: surface
                            });
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                console.log('Received data:', data);
            }
        }
    }

    updateRoomData(roomManager: RoomManager) {
        this.roomManager = roomManager
    }
}