class BasicScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // Initialisation de la scène, de la caméra et du renderer
        this.initScene();
        this.initCamera();
        this.initRenderer();

        // Ajout de la lumière et du cube
        this.addLights();
        this.addCube();

        // Gestion du redimensionnement
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Lancer l'animation
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
    }

    initCamera() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);
    }

    addLights() {
        const light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(5, 5, 5);
        this.scene.add(light);
    }

    addCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);
    }

    onWindowResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
    }
}

// Création et lancement de la scène
const myScene = new BasicScene('sceneContainer');
