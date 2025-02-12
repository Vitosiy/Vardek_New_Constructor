//@ts-nocheck
import * as THREE from 'three'

export type TUniform = {
    id: number,
    parts: LevelItem[][],
    fasadeId: number,
    groupSize: {
        maxWidth: number,
        maxHeight: number,
        currentWidth: number,
        currentHeight: number
    },
    color: string
}

export type LevelItem =
    THREE.Object3D
    | { columnItems: THREE.Object3D[] };

export type TUniformGroupMembership = {
    id: number,
    objects: THREE.Object3D[],
    fasadId?: number,
    color?: string
}

export type TElementTexuredProps = {
    element: THREE.Object3D,
    elementNdx: number,
    levelNdx: number,
    columnTotalHeight?: number,
    columnElementNdx?: number,
    columnElementsArray?: THREE.Object3D[],
    prevElementWidth: number,
    totalLevelHeight: number,
    totalLevelHeightCorrect: number,
    totalLevelWidth: number,
    totalLevelWidthCorrect: number,
    texture: THREE.Texture
}

export type TTextureProp = {
    fasade: THREE.Object3D,
    productBody: THREE.Object3D,

    fasadeNdx: number,
    fasadeArray: LevelItem[],

    texture: THREE.Texture
    elementNdx: number,
    hasMixedTypes: boolean,

    totalWidth?: number,
    totalHeight?: number,
    correctWidth?: number,
    correctHeight?: number,
    totalLevelHeight?: number,
    totalLevelHeightCorrect?: number,
    totalLevelWidth?: number,
    totalLevelWidthCorrect?: number,
    totalWidthToString?: number,
    totalHeightToString?: number,
    correctWidthToString?: number,
    correctHeightToString?: number,
    totalWidthToDefault?: number,
    totalHeightToDefault?: number,
    correctWidthToDefault?: number,
    correctHeightToDefault?: number,

    columnTotalHeight?: number,
    levelNdx?: number,
}
