import * as THREE from 'three';
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseDown(event) {
    if (control.dragging) {
    return;
}
objectSelected = false;
mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(interactableObjects);
if (selectedVertexIndex !== null) {
    // Si un vertex est sélectionné, définissez un indicateur pour le déplacement
    isVertexSelected = true;
}
if (intersects.length > 0) {
    control.attach(intersects[0].object);
    selectedObject = intersects[0].object;
    objectSelected = true;
    updateEdgeAndPointRepresentations(selectedObject);
} else {

}
}
function onMouseMove(event) {
console.log("MouseMove détecté");

// Convertir la position de la souris en coordonnées normalisées (-1 à +1)
mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

// Mettre à jour le raycaster avec la position de la souris
raycaster.setFromCamera(mouse, camera);

// Vérifier les intersections avec les points
if (currentPoints) {
    const intersects = raycaster.intersectObjects([currentPoints], true);
    console.log("Nombre d'intersections : " + intersects.length);
    if (intersects.length > 0) {
        if (!highlighted) {
            console.log("jzaaaaaaauuuuuuunnnneeee");
            console.log(currentPoints);
            currentPoints.material = new THREE.PointsMaterial({ color: 0xffff00, size: 2 });
            currentPoints.geometry.attributes.position.needsUpdate = true;
            currentPoints.material.needsUpdate = true;
            highlighted = true;
            renderer.render(scene, camera);
        }
    } else {
        if (highlighted) {
            console.log("blaaaaaannnnncccc");
            console.log(currentPoints);

            currentPoints.material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
            currentPoints.geometry.attributes.position.needsUpdate = true;
            currentPoints.material.needsUpdate = true;
            highlighted = false;
            renderer.render(scene, camera);
        }
    }
}

}

function onMouseUp(event) {
if (!objectSelected && !control.dragging) {
    control.detach();
}
}

export { onMouseDown, onMouseMove, onMouseUp };
