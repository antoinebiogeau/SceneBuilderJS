import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GridHelper } from 'three';
import * as dat from 'dat.gui';





const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let selectedObject = null;

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
const geometry2 = new THREE.BoxGeometry();
const material2 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

const control = new TransformControls(camera, renderer.domElement);
scene.add(control);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;

let isRotating = false;
let initialMousePosition = new THREE.Vector2();

const hoveredMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 0.1 });
const defaultMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const size = 100; // La taille de la grille
const divisions = 100; // Le nombre de divisions sur la grille
let gridHelper = new GridHelper(size, divisions, 0x0000ff, 0x808080); // Vous pouvez changer les couleurs ici
scene.add(gridHelper);
let backgroundColor = 0x424242;
renderer.setClearColor(backgroundColor);
//////////////////////////////////// light ////////////////////////////////////
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
scene.add(ambientLight);
const pointsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 }); // Essayez d'augmenter la taille
// Ajouter une lumière directionnelle
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); 
directionalLight.position.set(1, 1, 1); 
scene.add(directionalLight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//helpers
const lightHelper = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 8), 
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
lightHelper.position.copy(directionalLight.position);
scene.add(lightHelper);

function updateLightPosition() {
    directionalLight.position.copy(lightHelper.position);
}

let currentEdges = null;
let currentPoints = null;
let edgesVisible = false;
let pointsVisible = false;
let selectedVertexIndex = null;
let isVertexSelected = false;

/////////////////////////////////////////////////////////////////////////////////

//reglages light
directionalLight.castShadow = true;

directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 150;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.mapSize.width = 2048; 
directionalLight.shadow.mapSize.height = 2048; 


/////////////////////////////////////////////////////////////////////////////////

const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);



let highlighted = false;
cube.castShadow = true; 
cube.receiveShadow = true; 

cube2.castShadow = true; 
cube2.receiveShadow = true; 

plane.receiveShadow = true; 

scene.add(currentPoints);
console.log("Points ajoutés à la scène", currentPoints);



// renderer.domElement.addEventListener('mousemove', function(event) {
//     // Gérer la rotation
//     if (isRotating) {
//         controls.enableRotate = true;
//     }

//     // Convertir la position de la souris en coordonnées normalisées (-1 à +1)
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // Mettre à jour le raycaster avec la position de la souris
//     raycaster.setFromCamera(mouse, camera);

//     // Vérifier les intersections avec les points
//     if (currentPoints) {
//         const intersects = raycaster.intersectObject(currentPoints, true);
//         if (intersects.length > 0) {
//             selectedVertexIndex = intersects[0].index;
//             // Logique supplémentaire pour gérer le vertex survolé
//         } else {
//             selectedVertexIndex = null;
//         }
//     }
// });
let interactableObjects = [cube, cube2, plane, lightHelper, ambientLight, directionalLight];
renderer.domElement.addEventListener('mousedown', function(event) {
    if (event.button === 0 && !control.dragging) {
        isRotating = true;
        initialMousePosition.set(event.clientX, event.clientY);
    }
    else {
        controls.enableRotate = false;
    }
    
});

renderer.domElement.addEventListener('mousemove', function(event) {
    if (isRotating) {
        controls.enableRotate = true;
    }
});

renderer.domElement.addEventListener('mouseup', function() {
    isRotating = false;
});

renderer.domElement.addEventListener('mouseleave', function() {
    isRotating = false;
});

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;


document.getElementById('translate').addEventListener('click', function () {
    control.setMode('translate');
});

document.getElementById('rotate').addEventListener('click', function () {
    control.setMode('rotate');
});

document.getElementById('scale').addEventListener('click', function () {
    control.setMode('scale');
});
document.getElementById('saveScene').addEventListener('click', function () {
    saveScene();
});
camera.position.z = 5;


control.attach(cube);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let objectSelected = false;
function onKeyDown(event) {
    // Vérifier si la touche "Suppr" ou "Delete" est pressée
    if (event.key === 'Delete' || event.key === 'Del') {
        deleteSelectedObject();
    }
}

document.addEventListener('keydown', onKeyDown);
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
document.getElementById('colorPickerButton').addEventListener('click', function () {
    console.log(selectedObject);
    if (selectedObject) {
        document.getElementById('colorPicker').click();
    } else {
        alert("Veuillez sélectionner un objet.");
    }
});

document.getElementById('colorPicker').addEventListener('input', function (event) {
    if (selectedObject) {
        selectedObject.material.color.set(event.target.value);
    }
});

window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('mousemove', onMouseMove);


window.addEventListener('mousedown', onMouseDown);

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        loadFBX(url);
    }
});


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




function createEdgeRepresentation(mesh) {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    line.position.copy(mesh.position);
    line.rotation.copy(mesh.rotation);
    line.scale.copy(mesh.scale);

    return line;
}

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

document.getElementById('toggleEdges').addEventListener('click', function () {
    edgesVisible = !edgesVisible;
    if (currentEdges) {
        currentEdges.visible = edgesVisible;
    }
});

document.getElementById('togglePoints').addEventListener('click', function () {
    pointsVisible = !pointsVisible;
    if (currentPoints) {
        currentPoints.visible = pointsVisible;
    }
});

function saveScene() {
    // const sceneJson = scene.toJSON();
    // const stringifiedScene = JSON.stringify(sceneJson);
    // // À ce stade, `stringifiedScene` est une chaîne que vous pouvez enregistrer dans un fichier
    // download(stringifiedScene, 'scene.json', 'application/json');
    const exporter = new GLTFExporter();

    exporter.parse(scene, function (gltf) {
        download(JSON.stringify(gltf), 'scene.gltf', 'text/plain');
    });
}

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const contents = event.target.result;
            const json = JSON.parse(contents);
            const loader = new THREE.ObjectLoader();
            const loadedScene = loader.parse(json);
            // Remplacer l'ancienne scène par la nouvelle
            scene = loadedScene;
            // Mise à jour de la liste des objets interactifs, si nécessaire
            updateInteractableObjects();
        };
        reader.readAsText(file);
    }
});

function updateInteractableObjects() {
    interactableObjects = [];
    scene.traverse(function (object) {
        if (object.isMesh) {
            interactableObjects.push(object);
        }
    });
}

function download(content, fileName, contentType) {
    // var a = document.createElement("a");
    // var file = new Blob([content], {type: contentType});
    // a.href = URL.createObjectURL(file);
    // a.download = fileName;
    // a.click();
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
document.getElementById('dropZone').addEventListener('drop', function(event) {
    event.stopPropagation();
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
        clearScene(); // Effacer la scène avant de charger un nouveau fichier
        const url = URL.createObjectURL(file);
        loadGLTF(url); // Charger le fichier GLTF
    }
});

function clearScene() {
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
}
function deleteSelectedObject() {
    if (selectedObject) {
        // Supprime l'objet sélectionné de la scène
        scene.remove(selectedObject);

        // Libérer la mémoire si nécessaire, surtout pour des géométries ou des matériaux complexes
        if (selectedObject.geometry) {
            selectedObject.geometry.dispose();
        }
        if (selectedObject.material) {
            if (selectedObject.material.length) {
                // Pour les objets avec des matériaux multiples
                for (const material of selectedObject.material) {
                    material.dispose();
                }
            } else {
                // Pour les objets avec un seul matériau
                selectedObject.material.dispose();
            }
        }

        // Réinitialiser la variable selectedObject
        selectedObject = null;

        // Mettre à jour le rendu
        renderer.render(scene, camera);
    } else {
        console.log("Aucun objet n'est sélectionné pour la suppression.");
    }
}
//guizmo 3D qui permet de mettre la camera en perspective ou en orthographique et en vu de face ou de dessus
const gui = new dat.GUI();
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera, 'fov', 0, 180).onChange(() => camera.updateProjectionMatrix());
cameraFolder.add(camera, 'near', 0.1, 10000).onChange(() => camera.updateProjectionMatrix());
cameraFolder.add(camera, 'far', 0.1, 10000).onChange(() => camera.updateProjectionMatrix());
cameraFolder.add(camera, 'zoom', 0.1, 10).onChange(() => camera.updateProjectionMatrix());

// Ajout des contrôleurs pour la position et la rotation de la caméra
const cameraPositionGUI = cameraFolder.addFolder('Position');
cameraPositionGUI.add(camera.position, 'x', -100, 100).listen();
cameraPositionGUI.add(camera.position, 'y', -100, 100).listen();
cameraPositionGUI.add(camera.position, 'z', -100, 100).listen();

const cameraRotationGUI = cameraFolder.addFolder('Rotation');
cameraRotationGUI.add(camera.rotation, 'x', -Math.PI, Math.PI).listen();
cameraRotationGUI.add(camera.rotation, 'y', -Math.PI, Math.PI).listen();
cameraRotationGUI.add(camera.rotation, 'z', -Math.PI, Math.PI).listen();

cameraFolder.add(camera, 'fov', 0, 180).onChange(function() {
    camera.updateProjectionMatrix();
});
cameraFolder.add(camera, 'near', 0.1, 10000).onChange(function() {
    camera.updateProjectionMatrix();
});
cameraFolder.add(camera, 'far', 0.1, 10000).onChange(function() {
    camera.updateProjectionMatrix();
});
cameraFolder.add(camera, 'zoom', 0.1, 10).onChange(function() {
    camera.updateProjectionMatrix();
});
cameraFolder.add(camera, 'position', {
    'Vue de face': new THREE.Vector3(0, 0, 5),
    'Vue de dessus': new THREE.Vector3(0, 5, 0)
}).onChange(function(value) {
    camera.position.copy(value);
});
cameraFolder.add(camera, 'rotation', {
    'Vue de face': new THREE.Euler(0, 0, 0),
    'Vue de dessus': new THREE.Euler(-Math.PI / 2, 0, 0)
}).onChange(function(value) {
    camera.rotation.copy(value);
});
cameraFolder.add(camera, 'isPerspectiveCamera').onChange(function(value) {
    if (value) {
        camera.toPerspective();
    } else {
        camera.toOrthographic();
    }
});
cameraFolder.open();

const lightFolder = gui.addFolder('Lumière');
lightFolder.add(ambientLight, 'intensity', 0, 1);
lightFolder.add(directionalLight, 'intensity', 0, 1);
lightFolder.add(directionalLight.position, 'x', -100, 100);
lightFolder.add(directionalLight.position, 'y', -100, 100);
lightFolder.add(directionalLight.position, 'z', -100, 100);
lightFolder.add(directionalLight, 'castShadow');
lightFolder.add(directionalLight.shadow.camera, 'near', 0.1, 10000).onChange(function() {
    directionalLight.shadow.camera.updateProjectionMatrix();
});
lightFolder.add(directionalLight.shadow.camera, 'far', 0.1, 10000).onChange(function() {
    directionalLight.shadow.camera.updateProjectionMatrix();
});
lightFolder.add(directionalLight.shadow.camera, 'left', -50, 50).onChange(function() {
    directionalLight.shadow.camera.updateProjectionMatrix();
});
lightFolder.add(directionalLight.shadow.camera, 'right', -50, 50).onChange(function() {
    directionalLight.shadow.camera.updateProjectionMatrix();
});
lightFolder.add(directionalLight.shadow.camera, 'top', -50, 50).onChange(function() {
    directionalLight.shadow.camera.updateProjectionMatrix();
});
lightFolder.add(directionalLight.shadow.camera, 'bottom', -50, 50).onChange(function() {
    directionalLight.shadow.camera.updateProjectionMatrix();
});
lightFolder.add(directionalLight.shadow.mapSize, 'width', 512, 8192).onChange(function() {
    directionalLight.shadow.map.dispose();
    directionalLight.shadow.map = null;
    directionalLight.shadow.map = new THREE.WebGLShadowMap(renderer);
});
lightFolder.add(directionalLight.shadow.mapSize, 'height', 512, 8192).onChange(function() {
    directionalLight.shadow.map.dispose();
    directionalLight.shadow.map = null;
    directionalLight.shadow.map = new THREE.WebGLShadowMap(renderer);
});
lightFolder.open();

const sceneFolder = gui.addFolder('Scène');
const bgColor = { color: '#424242' }; // Utiliser un objet pour la couleur
sceneFolder.addColor(bgColor, 'color').onChange(value => {
    scene.background = new THREE.Color(value);
    if (scene.fog) {
        const fogFolder = sceneFolder.addFolder('Fog');
        fogFolder.add(scene.fog, 'near', 0.1, 100).onChange(() => scene.fog.near = parseFloat(scene.fog.near));
        fogFolder.add(scene.fog, 'far', 0.1, 100).onChange(() => scene.fog.far = parseFloat(scene.fog.far));
    }
});
sceneFolder.open();

const objectFolder = gui.addFolder('Objet');
objectFolder.add(cube.position, 'x', -10, 10);
objectFolder.add(cube.position, 'y', -10, 10);
objectFolder.add(cube.position, 'z', -10, 10);
objectFolder.add(cube.rotation, 'x', 0, Math.PI * 2);
objectFolder.add(cube.rotation, 'y', 0, Math.PI * 2);
objectFolder.add(cube.rotation, 'z', 0, Math.PI * 2);
objectFolder.add(cube.scale, 'x', 0.1, 10);
objectFolder.add(cube.scale, 'y', 0.1, 10);
objectFolder.add(cube.scale, 'z', 0.1, 10);
objectFolder.add(cube, 'visible');
objectFolder.add(cube, 'castShadow');
objectFolder.add(cube, 'receiveShadow');
objectFolder.open();

const transformFolder = gui.addFolder('Transformations');
transformFolder.add(control, 'showX').name('Axe X');
transformFolder.add(control, 'showY').name('Axe Y');
transformFolder.add(control, 'showZ').name('Axe Z');
transformFolder.add(control, 'space', {
    'Local': 'local',
    'Monde': 'world'
});
transformFolder.open();


const rendererFolder = gui.addFolder('Rendu');
rendererFolder.add(renderer.shadowMap, 'enabled').name('Activer ShadowMap');
rendererFolder.add(renderer.shadowMap, 'type', {
    'BasicShadowMap': THREE.BasicShadowMap,
    'PCFShadowMap': THREE.PCFShadowMap,
    'PCFSoftShadowMap': THREE.PCFSoftShadowMap
}).onChange(function(value) {
    renderer.shadowMap.type = parseInt(value);
});
rendererFolder.open();

const gridParams = {
    size: 100, // Taille initiale
    divisions: 100, // Divisions initiales
    color: 0x0000ff // Couleur initiale
};

// Fonction pour mettre à jour la grille
function updateGrid() {
    // Supprimer l'ancienne grille si elle existe
    if (gridHelper) scene.remove(gridHelper);

    // Créer une nouvelle grille avec la nouvelle taille et divisions
    gridHelper = new THREE.GridHelper(gridParams.size, gridParams.divisions, gridParams.color, 0x808080);
    scene.add(gridHelper);
}

// Ajout de contrôleurs pour la grille dans dat.GUI
const gridFolder = gui.addFolder('Grille');
gridFolder.add(gridHelper, 'visible');
gridFolder.add(gridParams, 'size', 1, 100).onChange(updateGrid);
gridFolder.add(gridParams, 'divisions', 1, 100).onChange(updateGrid);
gridFolder.addColor(gridParams, 'color').onChange(value => {
    gridParams.color = new THREE.Color(value);
    updateGrid();
});
gridFolder.open();



function loadGLTF(url) {
    const loader = new GLTFLoader();
    loader.load(url, function(gltf) {
        clearScene(); // Effacez la scène actuelle avant d'ajouter la nouvelle
        scene.add(gltf.scene);

        // Mettez à jour la liste des objets interactifs
        updateInteractableObjects();

        // Réinitialisez les contrôles de transformation si nécessaire
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Lumière directionnelle
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
        control.detach();
    }, undefined, function(error) {
        console.error('Erreur lors du chargement du fichier GLTF:', error);
    });

}
function update() {
    requestAnimationFrame(update);
    updateEdgeAndPointRepresentations();
    if (selectedObject === lightHelper) {
        updateLightPosition();
    }
    highlighted = false;
    renderer.render(scene, camera);
}
  update();