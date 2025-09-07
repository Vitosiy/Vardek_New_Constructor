import * as THREE from 'three'
import { TBuildProduct } from '@/types/types'

export class EdgeBuilder {
    private parent: TBuildProduct


    private fasadeMaterial: THREE.MeshBasicMaterial
    private defaultMaterial: THREE.MeshBasicMaterial
    private lineMaterial: THREE.LineBasicMaterial

    constructor(parent: TBuildProduct) {
        this.parent = parent
        this.defaultMaterial = new THREE.MeshBasicMaterial({
            color: 'rgba(252, 252, 139, 1)',
            // transparent: true,
            // opacity: 0.15,
            side: THREE.DoubleSide // иначе будет видно только снаружи
        })
        this.fasadeMaterial = new THREE.MeshBasicMaterial({
            color: 'rgba(154, 154, 255, 1)',
            // transparent: true,
            // opacity: 0.15,
            side: THREE.DoubleSide // иначе будет видно только снаружи
        })
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 'rgba(32, 32, 32, 1)', linewidth: 1,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity: 1,
        })

    }

    createEdge(object: THREE.Object3D) {
        const edgeBody = new THREE.Object3D()
        // Привязываем ссылку на родителя для возможного внешнего использования
        edgeBody.userData.parentProduct = this.parent
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // линии
                const edge = this.createSingleEdge(child, object.name)
                edgeBody.add(edge)

                // плоскости
                const face = this.createSingleFace(child, object.name)
                edgeBody.add(face)
            }
        })

        edgeBody.name = 'EDGE_BODY'
        edgeBody.userData.edge = true
        edgeBody.visible = false
        return edgeBody
    }

    private createSingleEdge(mesh: THREE.Mesh, name?: string) {
        const edges = new THREE.EdgesGeometry(mesh.geometry)
        const meshEdge = new THREE.LineSegments(
            edges,
            this.lineMaterial
        )
        meshEdge.renderOrder = 1;

        meshEdge.position.copy(mesh.position)
        meshEdge.rotation.copy(mesh.rotation)
        meshEdge.userData.edge = true
        meshEdge.userData.name = name
        meshEdge.userData.parent = mesh

        return meshEdge
    }

    private createSingleFace(mesh: THREE.Mesh, name?: string) {
        const material = name === 'fasade' ? this.fasadeMaterial : this.defaultMaterial

        const faceMesh = new THREE.Mesh(mesh.geometry, material)
        faceMesh.position.copy(mesh.position)
        faceMesh.rotation.copy(mesh.rotation)
        faceMesh.userData.edge = true
        faceMesh.userData.name = name
        faceMesh.userData.parent = mesh


        return faceMesh
    }
}
