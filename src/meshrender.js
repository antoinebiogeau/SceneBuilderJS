function createPointRepresentation(mesh) {
    if (!(mesh.geometry instanceof THREE.BufferGeometry)) {
        console.error('La géométrie n\'est pas une instance de THREE.BufferGeometry.');
        return;
    }

    const positionAttribute = mesh.geometry.getAttribute('position');
    const points = [];
    for (let i = 0; i < positionAttribute.count; i++) {
        points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i));
    }

    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const pointsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    pointsMesh.position.copy(mesh.position);
    pointsMesh.rotation.copy(mesh.rotation);
    pointsMesh.scale.copy(mesh.scale);

    return pointsMesh;
}
import * as THREE from 'three';

function updateEdgeAndPointRepresentations() {
    if (!selectedObject) return;
    if (currentEdges) scene.remove(currentEdges);
    if (currentPoints) scene.remove(currentPoints);
    currentEdges = createEdgeRepresentation(selectedObject);
    currentPoints = createPointRepresentation(selectedObject);
    currentEdges.visible = edgesVisible;
    currentPoints.visible = pointsVisible;
    highlighted = false;
    scene.add(currentEdges);
    scene.add(currentPoints);
    
}


function createEdgeRepresentation(mesh) {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    line.position.copy(mesh.position);
    line.rotation.copy(mesh.rotation);
    line.scale.copy(mesh.scale);

    return line;
}

function updateInteractableObjects() {
    interactableObjects = [];
    scene.traverse(function (object) {
        if (object.isMesh) {
            interactableObjects.push(object);
        }
    });
}

export { createPointRepresentation, updateEdgeAndPointRepresentations, createEdgeRepresentation, updateInteractableObjects}