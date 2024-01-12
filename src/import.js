import * as THREE from 'three';

function clearScene() {
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
}

function jsonloadr(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const contents = event.target.result;
            const json = JSON.parse(contents);
            const loader = new THREE.ObjectLoader();

            clearScene(); // Effacez la scène actuelle avant de charger la nouvelle
            scene = loader.parse(json);
            updateInteractableObjects(); // Mettre à jour les objets interactifs
        };
        reader.readAsText(file);
    }

}


function loadFBX(url) {
    const loader = new FBXLoader();
    loader.load(url, function(object) {
        object.position.set(0, 0, 0);
        scene.add(object);
        //ajout shadow
        object.castShadow = true;
        object.receiveShadow = true;
        interactableObjects.push(object);
    }, undefined, function(error) {
        console.error(error);
    });
}

export { loadFBX, jsonloadr, clearScene }