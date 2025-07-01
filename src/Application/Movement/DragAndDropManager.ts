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

    constructor(canvas: HTMLElement, scene: THREE.Scene, room: RoomManager, camera: THREE.Camera, mouse: THREE.Vector2, raycaster: THREE.Raycaster, boxHelper: THREETypes.TCustomBoxHelper, trafficManager: THREETypes.TTrafficManager) {

        this.handleDragOverBound = this.handleDragOver.bind(this)
        this.handleDropBound = this.handleDrop.bind(this)

        this.canvas = canvas;
        this.scene = scene;
        this.camera = camera

        this.roomManager = room
        this.trafficManager = trafficManager

        this.raycaster = raycaster;
        this.mouse = mouse;
        this.geometryBuilder = trafficManager.geometryBuilder
        this.universalGeometryBuilder = trafficManager.universalGeometryBuilder
        this.boxHelper = boxHelper

        this.roomParams = room._roomParams

        this.setupDragAndDrop();
        this.setObject = trafficManager.root.setObject
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

                    if(productData.moduleType || productData.ID == 3954672) {
                        this.universalGeometryBuilder.craeteModel(productData, (object) => {
                            const menuStore = useMenuStore();

                            object.userData.MOUSE_POSITION = {
                                x: point.clone().project(this.camera).x * this.trafficManager._sizes.width * 0.5,
                                y: point.clone().project(this.camera).y * this.trafficManager._sizes.height * -0.5,
                            };
                            this.setObject.create({
                                scene: this.scene,
                                object,
                                point,
                                roomManager: this.roomManager,
                                trafficManager: this.trafficManager,
                                boxHelper: this.boxHelper,
                                wall: surface
                            });

                            menuStore.openMenu('2dModuleConstructor', productData.ID, [object])
                            //useModelState().setCurrentModel(object);
                        });
                    }
                    else {
                        this.geometryBuilder.craeteModel(productData, (object) => {

                            object.userData.MOUSE_POSITION = {
                                x: point.clone().project(this.camera).x * this.trafficManager._sizes.width * 0.5,
                                y: point.clone().project(this.camera).y * this.trafficManager._sizes.height * -0.5,
                            };

                            this.setObject.create({
                                scene: this.scene,
                                object,
                                point,
                                roomManager: this.roomManager,
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