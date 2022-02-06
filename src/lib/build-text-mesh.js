import * as THREE from "three";

window.THREE = THREE;

export const fontJson = require("../font-teko.json");

// Name, Health and Lvl TEXT
export const updateTextMesh = (mesh, text, material = mesh.material) => {

    const textgeometry = new THREE.TextGeometry(
        text,
        {
            font: new THREE.Font(fontJson),
            bevelEnabled: false,
            curveSegments: 10,
            bevelSize: 0,
            height: 0.7,
            size: 0.15,
            metalness: 0.0,
            roughness: 0.5,
        }
    );

    mesh.geometry = textgeometry;
    mesh.material = material;

};

// Name, Health and Lvl TEXT
export const buildTextMesh = (text, material) => {
    //Number
    const textgeometry = new THREE.TextGeometry(
        text,
        {
            font: new THREE.Font(fontJson),
            bevelEnabled: false,
            curveSegments: 10,
            bevelSize: 0,
            height: 0.7,
            size: 0.15,
            metalness: 0.0,
            roughness: 0.5,
        }
        // Object.assign(
        //     {},
        // )
    );

    const numberMesh = new THREE.Mesh(textgeometry, material);
    // wireframe
    // var geo = new THREE.EdgesGeometry(numberMesh.geometry); // or WireframeGeometry

    // Translate to Center
    return numberMesh;
};

