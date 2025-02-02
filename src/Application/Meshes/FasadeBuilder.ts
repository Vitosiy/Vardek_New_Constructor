//@ts-nocheck

import * as THREE from "three"
import * as THREETypes from "@/types/types"
import { OBB } from 'three/examples/jsm/math/OBB.js';
// import * as THREEInterfases from "@/types/interfases"


export class FasadeBuilder {

    parent: THREETypes.TBuildProduct
    constructor(parent: THREETypes.TBuildProduct) {
        this.parent = parent
    }

    getFasade(group: THREE.Object3D, props: THREETypes.TObject, model_data: THREETypes.TObject) {


        const sizes = props.CONFIG.SIZE
        let start_position = this.parent.getStartPosition(sizes);

        // const fasade_list = props.CONFIG.FASADE_LIST
        const fasade_list = props.CONFIG.FASADE_PROPS

        // const product = props.PRODUCT

        fasade_list.forEach((value, key) => {

            const fasade_position = this.getFasadePosition(props.CONFIG, key);

            this.calcFasadePosition(props.CONFIG, fasade_position)

            const fasade_id = props.CONFIG.FASADE_PROPS[key].TYPE

            props.CONFIG.FASADE_HEIGHT[`FASADESIZES${key}`] = [eval(fasade_position.FASADE_HEIGHT)];

            let fasade = this.createFasade(fasade_position, start_position, fasade_id, props, key) as THREE.Object3D;

            let box = new THREE.Box3().setFromObject(fasade)
            let vec = new THREE.Vector3();
            let size = box.getSize(vec)


            // console.log(props.CONFIG.FASADE_POSITIONS, '1')

            props.CONFIG.FASADE_POSITIONS[key].FASADE_WIDTH = size.x
            props.CONFIG.FASADE_POSITIONS[key].FASADE_HEIGHT = size.y
            props.CONFIG.FASADE_POSITIONS[key].FASADE_DEPTH = size.z


            props.FASADE.push(fasade);
            props.FASADE_DEFAULT.push(fasade?.clone());

            let product_model_type = props.CONFIG.MODEL?.type ?? "left";
            const position = this.setFasadePosition(fasade, fasade_position, product_model_type, props, start_position);

            // console.log(size, 'FASSIZE')

            /** Отрисовываем политру */
            if (value.PALETTE != null) {

                this.parent.palette_bulider.createPaletteColor(
                    {
                        fasade,
                        data: value.PALETTE,
                        fasadeNdx: key,
                        props
                    }
                )
            }

            /** Отрисовываем Фрезу */
            if (value.MILLING != null) {

                const fasadePositionProps = props.CONFIG.FASADE_POSITIONS
                const fasadePosition = {
                    FASADE_WIDTH: fasadePositionProps[key].FASADE_WIDTH,
                    FASADE_HEIGHT: fasadePositionProps[key].FASADE_HEIGHT,
                    FASADE_DEPTH: fasadePositionProps[key].FASADE_DEPTH
                };

                this.parent.milling_builder.createMillingFasade(fasade, fasadePosition, value.MILLING, props.FASADE_DEFAULT[key])
            }

            /** Отрисовываем окна */

            if (value.WINDOW != null) {
                const fasadePositionProps = props.CONFIG.FASADE_POSITIONS
                const fasadePosition = {
                    FASADE_WIDTH: fasadePositionProps[key].FASADE_WIDTH,
                    FASADE_HEIGHT: fasadePositionProps[key].FASADE_HEIGHT,
                    FASADE_DEPTH: fasadePositionProps[key].FASADE_DEPTH
                };

                const params =
                {
                    fasade,
                    fasadePosition,
                    data: value.WINDOW,
                    defaultGeometry: props.FASADE_DEFAULT[key]
                }

                this.parent.window_builder.createWindow(params)
            }

            fasade.visible = props.CONFIG.FASADE_PROPS[key].SHOW

            group.add(fasade as THREE.Object3D)

            // console.log(props.CONFIG.FASADE_POSITIONS, 'FASADE_POSITIONS--2')

        })
    }

    createFasade(fasade_position: THREETypes.TObject, start_position: THREETypes.TObject, fasade_id: number | string, props: THREETypes.TObject, key: number | string) {

        const fasade_color = this.parent._FASADE[fasade_id];

        let fasade;

        let model = fasade_position.FASADE_MODEL ? fasade_position.FASADE_MODEL : false;

        let geometry_height = eval(fasade_position.FASADE_HEIGHT);

        let product_model_type = props.CONFIG.MODEL?.type ?? "left";

        let geometry_config = {
            x: eval(fasade_position.FASADE_WIDTH),
            y: geometry_height,
            z: eval(fasade_position.FASADE_DEPTH),
        }

        let geometry = this.parent.createExtrudeBoxGeometry(geometry_config);

        let material = new THREE.MeshPhongMaterial();

        if (props.CONFIG.FASADE_PROPS.length > 0) {

            let url = this.parent._FASADE[props.CONFIG.FASADE_PROPS[key].COLOR].TEXTURE
            let texture_size = {
                width: this.parent._FASADE[props.CONFIG.FASADE_PROPS[key].COLOR].TEXTURE_WIDTH,
                height: this.parent._FASADE[props.CONFIG.FASADE_PROPS[key].COLOR].TEXTURE_HEIGHT,
            }

            this.parent.getTexture({ material, url, texture_size })
        }

        // const fasadeModel = this.parent._MODELS[fasade_position.FASADE_MODEL]

        // console.log(geometry_config, "geometry_config")

        // if (fasadeModel) {


        //     let buildFasad = this.parent.json_builder.createMesh({ data: fasadeModel, parent_size: geometry_config })

        //     // console.log(buildFasad, 'M1')
        //     // buildFasad.traverse(children => {
        //     //     if (children instanceof THREE.Mesh) {
        //     //         children.material = material
        //     //     }
        //     // })

        //     // const _rotation = buildFasad.children[0].userData.rotation
        //     // const _position = buildFasad.children[0].userData.position
        //     // buildFasad.children[0].position.set(0, 0, 0)
        //     // buildFasad.children[0].rotation.set(0, 0, 0)

        //     // buildFasad.children[0].matrixAutoUpdate = false;
        //     // buildFasad.children[0].updateMatrix()

        //     // console.log(buildFasad.children[0].userData)

        //     // buildFasad.children[0].position.set(_position.x, _position.y, _position.z)
        //     // buildFasad.children[0].rotateX(_rotation.x)
        //     // buildFasad.children[0].rotateY(_rotation.y)
        //     // buildFasad.children[0].rotateZ(_rotation.z)

        //     // buildFasad.children[0].updateMatrix()

        //     // buildFasad.children[0].applyMatrix4(buildFasad.matrixWorld)
        //     console.log(buildFasad.children[0], 'M2')

        //     return buildFasad
        // }


        if (fasade_color.TYPE == "no_fasade") {
            fasade = new THREE.Mesh(geometry, material)
        }

        // let product_model_type = props.CONFIG.MODEL?.type ?? "left";
        // const position = this.setFasadePosition(fasade, fasade_position, product_model_type, props, start_position);
        fasade.geometry.computeBoundingBox()


        return fasade


    }

    getFasadePosition(props: THREETypes.TObject, key: string | number) {
        const fasade_list = props.FASADE_PROPS[key].LIST || props.FASADE_PROPS[0].LIST;
        const expressions = props.EXPRESSIONS;
        // const fasadeThickness = 18;

        let fasade_position = this.parent._FASADE_POSITION[fasade_list];
        // const product_id = fasade_position?.PRODUCT || props.PRODUCT.ID

        let fasade_width = props.SIZE.width

        fasade_position = this.parent.expressionsReplace(fasade_position,
            Object.assign(expressions,
                {
                    "#X#": fasade_width,
                    "#Y#": props.SIZE.height || 2100,
                    "#Z#": props.SIZE.depth,
                }))
        let fasadePositionsData = {
            FASADE_WIDTH: eval(fasade_position.FASADE_WIDTH),
            FASADE_HEIGHT: eval(fasade_position.FASADE_HEIGHT),
            FASADE_DEPTH: eval(fasade_position.FASADE_DEPTH),
            POSITION_X: eval(fasade_position.POSITION_X),
            POSITION_Y: eval(fasade_position.POSITION_Y),
            POSITION_Z: eval(fasade_position.POSITION_Z),
            ROTATE_X: fasade_position.ROTATE_X,
            ROTATE_Y: fasade_position.ROTATE_Y,
            ROTATE_Z: fasade_position.ROTATE_Z,
            ROTATE_2_X: fasade_position.ROTATE_2_X,
            ROTATE_2_Y: fasade_position.ROTATE_2_Y,
            ROTATE_2_Z: fasade_position.ROTATE_2_Z,
            /** ВАЖНО!! */
            FASADE_NUMBER: fasade_position.FASADE_NUMBER - 1, /** Т.к просчитывется массив с фасадами, а не объект */
            FASADE_MODEL: fasade_position.FASADE_MODEL
        }

        /** Добавляем размеры и положене фасада в CONFIG */
        if (this.parent.addIfNotExists(props.FASADE_POSITIONS, fasadePositionsData)) {
            props.FASADE_POSITIONS.push(
                fasadePositionsData
            )
        }

        return fasade_position
    }

    setFasadePosition(fasade: THREE.Mesh, fasade_position: THREETypes.TObject, product_model_type: string, props: THREETypes.TObject, start_position: THREETypes.TObject) {
        // fasade.rotation.set(0, 0, 0);
        // fasade.rotateY(Math.PI)

        switch (product_model_type) {
            case "right":
                fasade.rotateX(THREE.MathUtils.degToRad(fasade_position.ROTATE_2_X))
                fasade.rotateY(THREE.MathUtils.degToRad(-fasade_position.ROTATE_2_Y))
                fasade.rotateZ(THREE.MathUtils.degToRad(fasade_position.ROTATE_2_Z))
                break;
            default:
                fasade.rotateX(THREE.MathUtils.degToRad(fasade_position.ROTATE_X))
                fasade.rotateY(THREE.MathUtils.degToRad(-fasade_position.ROTATE_Y))
                fasade.rotateZ(THREE.MathUtils.degToRad(fasade_position.ROTATE_Z))
                break;
        }



        let posx = eval(fasade_position.POSITION_X);
        let posy = eval(fasade_position.POSITION_Y);
        let posz = eval(fasade_position.POSITION_Z);

        posx += start_position.x + eval(fasade_position.FASADE_WIDTH) * 0.5;
        posy += start_position.y + eval(fasade_position.FASADE_HEIGHT) * 0.5;
        posz += start_position.z

        let position = new THREE.Vector3(posx, posy, posz);
        fasade.position.set(position.x, position.y, position.z)

    }

    calcFasadePosition(props: THREETypes.TObject, fasade_position: THREETypes.TObject) {

        const fasade_sizes = [eval(fasade_position.FASADE_HEIGHT)];

        let bottomFasadePosition = -(props.SIZE.height * 0.5);

        let fasadeSectionPositions: THREETypes.TObject = {}

        fasade_sizes.forEach((item, key) => {

            fasadeSectionPositions[key] = bottomFasadePosition + eval(fasade_position.POSITION_Y)
        });

        return fasadeSectionPositions;
    }
}