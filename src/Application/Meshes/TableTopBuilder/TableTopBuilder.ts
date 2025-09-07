import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import { TJSONBuilder, TBuildProduct, TSize, TDeepDispose, TEdgeBuilder } from '@/types/types'
import { IProduct } from '@/types/interfases'



/**
 * Класс для создания и управления столешницей
 */
export class TableTopBuilder {
    private buildProduct: TBuildProduct
    private jsonBuilder: TJSONBuilder
    private edgeBuilder: TEdgeBuilder
    private deepDispose: TDeepDispose
    private scene: THREE.Scene

    constructor(parent: TBuildProduct) {
        this.scene = parent.scene
        // Доступ к приватному полю через any для избежания ошибок типизации
        this.deepDispose = (parent.root as any).deepDispose!
        this.buildProduct = parent
        this.jsonBuilder = parent.json_builder
        this.edgeBuilder = parent.edge_builder

    }

    private createMaterial(tableProduct: IProduct): THREE.Material {
        let material: THREE.MeshStandardMaterial | THREE.MeshPhongMaterial

        if (tableProduct.NAME != "Без столешницы") {
            material = new THREE.MeshStandardMaterial()
            const texture = tableProduct.texture

            this.buildProduct.resources.startLoading(texture.src, 'texture', (file) => {
                if (file instanceof THREE.Texture) {
                    file.colorSpace = THREE.SRGBColorSpace;
                    material.map = file;
                    material.map.wrapS = material.map.wrapT = THREE.MirroredRepeatWrapping;
                    material.map.repeat.set(
                        1 / texture.width,
                        1 / texture.height
                    );
                    material.map.offset.set(0.5, 0.5);
                    material.needsUpdate = true
                }
            })

        } else {
            material = new THREE.MeshPhongMaterial()
            material.color.set("#ffffff");
            material.transparent = true;
            material.opacity = 0.5;
            material.depthWrite = true;
        }

        return material;
    }

    private buildExpressions(
        baseExpr: Record<string, any>,
        sizes: TSize,
        params: IProduct,
        width?: number,
        depth?: number
    ) {
        return {
            ...baseExpr,
            "#MHEIGHT#": params.height,
            "#MODUL_HEIGHT#": params.height,
            "#MODUL_MHEIGHT#": params.height,
            "#MDEPTH#": params.depth,
            "#MODUL_DEPTH#": depth ?? sizes.depth,
            "#MODUL_MDEPTH#": params.depth,
            "#MODUL_MWIDTH#": sizes.width,
            "#MODUL_WIDTH#": width ?? sizes.width,
            "#MWIDTH#": sizes.width,
            "#X#": width ?? sizes.width,
            "#Y#": params.height,
            "#Z#": depth ?? sizes.depth,
        };
    }

    createTableTop({ props, incomeModel = null }
        : {
            props: THREETypes.TObject,
            model_data?: THREETypes.TObject,
            incomeModel?: number | null | string
        }
    ) {
        if (!props.CONFIG.HAVETABLETOP) return;
        const savedTableTopId = props.CONFIG.TABLETOP_ID


        const defTableTopModel = this.buildProduct.getDefaultOptionsConfig().tableTop.id

        const defModel: number | string = incomeModel ?? savedTableTopId ?? defTableTopModel;

        const tableProduct = this.buildProduct._PRODUCTS[defModel];
        const tableModelId = tableProduct.models[0];
        const tableModel = this.buildProduct._MODELS[tableModelId];

        const sizes = { ...props.CONFIG.SIZE, depth: props.CONFIG.SIZE.depth };
        const material = this.createMaterial(tableProduct);
        // const topJson = model_data.json?.tables;

        // if (topJson) {
        //     console.log('topJson')

        //     const tableTop = new THREE.Object3D()
        //     const localExpr = { ...props.CONFIG.EXPRESSIONS }

        //     Object.values(topJson).forEach((table: any) => {
        //         const width = this.buildProduct.calculateFromString(table.width)
        //         const depth = this.buildProduct.calculateFromString(table.depth)

        //         if (!width && !depth) return

        //         const expr = this.buildExpressions(localExpr, sizes, params, width, depth)
        //         const opt = {
        //             ...this.buildProduct.expressionsReplace(model, expr),
        //             material
        //         }

        //         const tablet = this.jsonBuilder.createMesh({ data: opt })

        //         if (table.position) {
        //             const posX = this.buildProduct.calculateFromString(table.position.x)
        //             const posZ = this.buildProduct.calculateFromString(table.position.z)
        //             if (posX) tablet.position.x = posX
        //             if (posZ) tablet.position.z = posZ
        //         }

        //         if (table.rotation?.y) {
        //             const rotY = this.buildProduct.calculateFromString(table.rotation.y)
        //             if (rotY) tablet.rotation.y = rotY
        //         }

        //         tableTop.add(tablet)
        //     })

        //     tableTop.position.z = this.buildProduct.getStartPosition(sizes).z + 300
        //     tableTop.name = 'TABLETOP'
        //     props.TABLETOP = tableTop
        //     return tableTop
        // }

        // Если нет topJson
        const expr = this.buildExpressions(props.CONFIG.EXPRESSIONS, sizes, tableProduct);

        const tableOptions = {
            ...this.buildProduct.expressionsReplace(tableModel.json, expr),
            material
        };

        const tableBody = this.jsonBuilder.createMesh({ data: tableOptions, parent_size: sizes })


        tableBody.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.userData.name = 'TABLETOP'
                const pos = new THREE.Vector3(30, 0, 0)
                child.geometry.translate(pos)
                child.geometry.computeBoundingBox()

                // this.root.scene?.add(edge)
            }
        });

        const edgeBody = this.edgeBuilder.createEdge(tableBody)
        tableBody.add(edgeBody)
        tableBody.name = 'tableTop';
        props.TABLETOP = tableBody;

        return tableBody;
    }

    updateTableTop(parent: THREE.Object3D, data: IProduct) {
        const { PROPS } = parent.userData
        const position = PROPS.TABLETOP.userData.positionWithoutTableTopHeight

        this.deepDispose.clearObject(PROPS.TABLETOP, this.scene);
        PROPS.TABLETOP = null;
        const newTableTop = this.createTableTop({ props: PROPS, incomeModel: data.ID }) as THREE.Object3D
        const tableHeigt = this.buildProduct.calculateHeight(newTableTop)

        // Корректируем высоту
        newTableTop.userData.positionWithoutTableTopHeight = position
        newTableTop.position.y = position + tableHeigt * 0.5

        parent.children[0].add(newTableTop)
        PROPS.TABLETOP = newTableTop
        // Сохраняем ID модели столешницы
        PROPS.CONFIG.TABLETOP_ID = data.ID
    }
}
