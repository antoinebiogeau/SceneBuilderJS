import * as THREE from 'three';

function download(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    // var a = document.createElement("a");
    // var file = new Blob([content], {type: contentType});
    // a.href = URL.createObjectURL(file);
    // a.download = fileName;
    // a.click();
}

function saveScene() {
    // const sceneJson = scene.toJSON();
    // const stringifiedScene = JSON.stringify(sceneJson);
    // // À ce stade, `stringifiedScene` est une chaîne que vous pouvez enregistrer dans un fichier
    // download(stringifiedScene, 'scene.json', 'application/json');

    //gltf
    // const exporter = new GLTFExporter();

    // exporter.parse(scene, function (gltf) {
    //     download(JSON.stringify(gltf), 'scene.gltf', 'text/plain');
    // });
    //json
        const sceneJson = scene.toJSON();
        const stringifiedScene = JSON.stringify(sceneJson);
        download(stringifiedScene, 'scene.json', 'application/json');

    
}

export { saveScene, download }