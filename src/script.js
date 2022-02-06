import * as THREE from "three";

import {
    AnimationClip,
    AnimationMixer,
    Mesh,
    VectorKeyframeTrack,
} from "three";

import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

// import "./style.css";

import { buildTextMesh, updateTextMesh } from "./lib/build-text-mesh";
import { TextureAnimator } from "./lib/texture-animator";

import game from "./iframe-connector";

const state = {
    turnCount: 3,
}

let controller1, controller2, controllerGrip1, controllerGrip2;
let turnInfo, turnNumber, playersVs;

const intersected = [];

// THREE.js initializations
const activeButtonsGroup = new THREE.Group();

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

const textureLoader = new THREE.TextureLoader();

// Scene
const scene = new THREE.Scene();

// Objects
const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 12);

// Materials

const stayedPlace = textureLoader.load("./textures/p3.png");
const material = new THREE.MeshStandardMaterial({ map: stayedPlace });
// material.color = new THREE.Color(0xff0000)


// Debug
const gui = new dat.GUI();

// Canvas
let canvas = document.querySelector("canvas.webgl");

window.WebXRPokemons = {
    init: (_canvas) => {
        canvas = _canvas;
    }
}

// SETUP SCENE
new RGBELoader().load("textures/2.hdr", function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = texture;
    scene.environment = texture;
});

// BUILDING OBJECTS

// Pokemon Places
const pokemonPlace1 = new THREE.Mesh(geometry, material);
const pokemonPlace2 = new THREE.Mesh(geometry, material);
pokemonPlace1.position.set(2, 0.5, -9);
pokemonPlace2.position.set(-2.5, 0.2, -6);
scene.add(pokemonPlace1);
scene.add(pokemonPlace2);

const pokemonAnimation1 = new THREE.TextureLoader().load("textures/anim1.png");
const annieTA = new TextureAnimator(pokemonAnimation1, 59, 1, 59, 3); // texture, #horiz, #vert, #total, duration.

const boomPokemonAmination1 = new THREE.TextureLoader().load("textures/animBoom1.png");
const boomTA = new TextureAnimator(boomPokemonAmination1, 12, 1, 12, 6);

const pokemon1Map = new THREE.TextureLoader().load("textures/groudon.gif");
const pokemon2Map = new THREE.TextureLoader().load("textures/coalossal.gif");

// const material2 = new THREE.SpriteMaterial({
//     map: pokemon1Map,
//     color: 0xffffff,
// });
const material3 = new THREE.SpriteMaterial({
    map: pokemon2Map,
    color: 0xffffff,
});

// Pokemon Sprites

const initPokemonSprite = (material, position) => {
    const sprite = new THREE.Sprite(
        material,
    );

    sprite.scale.set(1, 1, 0);

    const { x,y,z } = position;

    sprite.position.set(x, y+0.5, z);

    scene.add(sprite);

    return sprite;
}

const sprite1 = initPokemonSprite(new THREE.SpriteMaterial({ map: pokemonAnimation1 }), pokemonPlace1.position)
const sprite2 = initPokemonSprite(material3, pokemonPlace2.position);

// HACK
const sprite = sprite1;

// sprite.scale.set(1, 1, 0);
// sprite.position.set(
//     pokemonPlace1.position.x,
//     pokemonPlace1.position.y + 0.5,
//     pokemonPlace1.position.z
// );
// scene.add(sprite);

// sprite2.scale.set(1, 1, 0);
// sprite2.position.set(
//     pokemonPlace2.position.x,
//     pokemonPlace2.position.y + 0.5,
//     pokemonPlace2.position.z
// );
// scene.add(sprite2);

// ADDING EFFECTS BOOOOMS
const boom1 = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: boomPokemonAmination1 })
);
boom1.position.set(
    pokemonPlace1.position.x,
    pokemonPlace1.position.y + 0.5,
    pokemonPlace1.position.z
);

// Health Points
const healthBackGeomety = new THREE.BoxGeometry(1, 0.1, 0.01);
const healthBackMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const healthBack1 = new THREE.Mesh(healthBackGeomety, healthBackMaterial);
const healthBack2 = new THREE.Mesh(healthBackGeomety, healthBackMaterial);
healthBack1.position.set(
    pokemonPlace1.position.x,
    pokemonPlace1.position.y + 0.5 + 0.6,
    pokemonPlace1.position.z
);
healthBack2.position.set(
    pokemonPlace2.position.x,
    pokemonPlace2.position.y + 0.5 + 0.6,
    pokemonPlace2.position.z
);
scene.add(healthBack1);
scene.add(healthBack2);

const healthFrontGeometry1 = new THREE.BoxGeometry(0.5, 0.1, 0.01);
const healthFrontGeometry2 = new THREE.BoxGeometry(0.9, 0.1, 0.01);
const healthFrontMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const healthFront1 = new THREE.Mesh(healthFrontGeometry1, healthFrontMaterial);
const healthFront2 = new THREE.Mesh(healthFrontGeometry2, healthFrontMaterial);
let hp1 = 95;
let hp2 = 95;
healthFront1.position.set(
    pokemonPlace1.position.x - 0.25,
    pokemonPlace1.position.y + 0.5 + 0.6,
    pokemonPlace1.position.z + 0.00000000001
);
healthFront2.position.set(
    pokemonPlace2.position.x - 0.05,
    pokemonPlace2.position.y + 0.5 + 0.6,
    pokemonPlace2.position.z + 0.00000000001
);
scene.add(healthFront1);
scene.add(healthFront2);

const group = new THREE.Group();
scene.add(group);
var namePokemon2 = buildTextMesh(
    "ASD",
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
group.add(namePokemon2);
var namePokemon1 = buildTextMesh(
    "Coalossal L84",
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
var hpPokemon1 = buildTextMesh(
    "90%",
    new THREE.MeshBasicMaterial({ color: 0x29c6fe })
);
var hpPokemon2 = buildTextMesh(
    "49%",
    new THREE.MeshBasicMaterial({ color: 0x29c6fe })
);
group.remove(namePokemon2);
namePokemon2 = buildTextMesh(
    "Groudon L82",
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
namePokemon2.scale.set(1, 1, 0.01);
namePokemon2.position.set(
    pokemonPlace1.position.x - 0.5,
    pokemonPlace1.position.y + 0.5 + 0.6 + 0.1,
    pokemonPlace1.position.z
);
group.add(namePokemon2);
namePokemon1.scale.set(1, 1, 0.01);
namePokemon1.position.set(
    pokemonPlace2.position.x - 0.5,
    pokemonPlace2.position.y + 0.5 + 0.6 + 0.1,
    pokemonPlace2.position.z
);
group.add(namePokemon1);
hpPokemon1.scale.set(1.2, 1.2, 0.01);
hpPokemon1.position.set(
    pokemonPlace2.position.x + 0.55,
    pokemonPlace2.position.y + 0.5 + 0.55,
    pokemonPlace2.position.z
);
group.add(hpPokemon1);
hpPokemon2.scale.set(1.2, 1.2, 0.01);
hpPokemon2.position.set(
    pokemonPlace1.position.x + 0.55,
    pokemonPlace1.position.y + 0.5 + 0.55,
    pokemonPlace1.position.z
);
group.add(hpPokemon2);
//scene.add(textMesh);

// Lights

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.x = 0;
camera.position.y = 1;
camera.position.z = 3;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true


// let controller = renderer.xr.getController( 0 );
// 				controller.addEventListener( 'connected', function ( event ) {

// 					this.add( buildController( event.data ) );

// 				} );
// 				scene.add( controller );
// const controllerModelFactory = new XRControllerModelFactory();

// let controllerGrip = renderer.xr.getControllerGrip( 0 );
// controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
// scene.add( controllerGrip );

// ATTACK BUTTONS

let buttonGeometry = new THREE.BoxGeometry(1.2, 0.6, 0.05);

let buttonRotationX = -10;
let buttonPositionY = -0.5;
let buttonPositionZ = -2;
let buttonStartPositionX = -2;

let buttons = [];
let buttonsTexts = [];
let activeTextButtonsGroup = new THREE.Group();
let skillsTexts = ["EarthSquake", "Stealth Rock", "Superpower", "Stone Edge"];

let abilitiesSkillsBox = [];
let abilitiesSkillsText = [];
let showInfoGroup = new THREE.Group();

scene.add(showInfoGroup);
scene.add(activeButtonsGroup);
scene.add(activeTextButtonsGroup);

for (let i = 0; i < 4; i++) {
    let buttonColor = 0xfef5e7;
    if (i == 2) buttonColor = 0xf5b7b1;

    buttonsTexts[i] = buildTextMesh(
        skillsTexts[i],
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    buttonsTexts[i].position.set(
        buttonStartPositionX - 0.4,
        buttonPositionY - 0.05,
        buttonPositionZ + 0.07
    );
    buttonsTexts[i].scale.set(1, 1, 0.01);
    buttonsTexts[i].rotation.x = 0.05;

    activeTextButtonsGroup.add(buttonsTexts[i]);

    abilitiesSkillsBox[i] = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.5, 0.01),
        new THREE.MeshBasicMaterial()
    );
    abilitiesSkillsBox[i].position.set(
        buttonStartPositionX,
        buttonPositionY - 0.6,
        buttonPositionZ + 0.8
    );
    abilitiesSkillsBox[i].rotation.x = 90;

    abilitiesSkillsText[i] = buildTextMesh(
        "Ground\nPower: 100\n Accuracy: 100%",
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    abilitiesSkillsText[i].position.set(
        buttonStartPositionX - 0.5,
        buttonPositionY - 0.3,
        buttonPositionZ + 0.3
    );
    abilitiesSkillsText[i].scale.set(0.7, 0.7, 0.00002);
    abilitiesSkillsText[i].rotation.x = -1.1;

    showInfoGroup.add(abilitiesSkillsBox[i]);
    showInfoGroup.add(abilitiesSkillsText[i]);

    let buttonMaterial = new THREE.MeshBasicMaterial({ color: buttonColor });
    buttons[i] = new Mesh(buttonGeometry, buttonMaterial);
    buttons[i].rotation.x = buttonRotationX;
    buttons[i].position.set(
        buttonStartPositionX,
        buttonPositionY,
        buttonPositionZ
    );
    buttonStartPositionX += 1.3;

    activeButtonsGroup.add(buttons[i]);

}

// PLAYERS POKEMONS BUTTONS

let backgroundPlayersPokemons = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 1.1, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
backgroundPlayersPokemons.position.set(-4, 0.7, -5);

let playersPokemonsInfoBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 1.1, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
let playersPokemonsInfoText = buildTextMesh(
    "Ground\nPower: 100\n Accuracy: 100%",
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
playersPokemonsInfoText.position.set(-4.7, 2.3, -5 + 0.1);
playersPokemonsInfoText.scale.set(1, 1, 0.001);

playersPokemonsInfoBox.position.set(-4, 2, -5);
showInfoGroup.add(playersPokemonsInfoText);
showInfoGroup.add(playersPokemonsInfoBox);

let playersPokemons = [];

// i is a position offset
const loadPokemonOnGrid = (parentMesh, i, pokemonImageURL) => {
    const pokemonImage = new THREE.TextureLoader().load(pokemonImageURL);

    const pokemon = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.0001),
        new THREE.MeshBasicMaterial({ map: pokemonImage })
    );

    // put pokemon in the right position on 3x2 grid
    const x = i % 3;
    const y = Math.floor(i / 3);

    pokemon.position.set(
        parentMesh.position.x - 0.55 + 0.55 * x,
        parentMesh.position.y + (y === 0 ? 1 : -1) * 0.27,
        parentMesh.position.z + 0.06,
    );

    return pokemon;
}

let playerPokemonsNames = ["Tauros", "Venonat", "Spearow", "Snorlax", "Psyduck", "Mew"]
for (let i = 0; i < 6; i++) {
    playersPokemons[i] = loadPokemonOnGrid(backgroundPlayersPokemons, i, "textures/pokemons/front/" + playerPokemonsNames[i] + ".gif");

    activeButtonsGroup.add(playersPokemons[i]);
}

scene.add(backgroundPlayersPokemons);

// OPPONENTS POKEMONS BUTTONS
let opponentsPlayersPokemons = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 1.1, 0.05),
    new THREE.MeshBasicMaterial()
);
opponentsPlayersPokemons.position.set(3.7, 1, -8);
let opponentsPokemons = [];

let opponentsPokemonsInfoBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 1.1, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
let opponentsPokemonsInfoText = buildTextMesh(
    "Ground\nPower: 100\n Accuracy: 100%",
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
opponentsPokemonsInfoText.position.set(3, 2.6, -8 + 0.1);
opponentsPokemonsInfoText.scale.set(1, 1, 0.001);
opponentsPokemonsInfoBox.position.set(3.7, 2.3, -8);
showInfoGroup.add(opponentsPokemonsInfoText);
showInfoGroup.add(opponentsPokemonsInfoBox);
let opponentPokemonsNames = ["Abra", "Bulbasaur", "Pidgeot", "Pikachu", "Sandslash", "Zubat"]
for (let i = 0; i < 6; i++) {
    opponentsPokemons[i] = loadPokemonOnGrid(opponentsPlayersPokemons, i, "textures/pokemons/front/" + opponentPokemonsNames[i] + ".gif");

    activeButtonsGroup.add(opponentsPokemons[i]);
}

scene.add(opponentsPlayersPokemons);

// SHOW INFO ABOUT CURRENT POKEMON

// player pokemon
let currentPlayerPokemonInfoBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.7, 0.0005),
    new THREE.MeshBasicMaterial({ color: 0x003399 })
);
let currentPlayerPokemonInfoText = buildTextMesh(
    "Ground\nPower - 100\n Accuracy - 100%",
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
currentPlayerPokemonInfoText.position.set(
    pokemonPlace2.position.x - 0.7,
    pokemonPlace2.position.y + 2.2,
    pokemonPlace2.position.z + 0.01
);
currentPlayerPokemonInfoText.scale.set(0.7, 0.7, 0.001);
currentPlayerPokemonInfoBox.position.set(
    pokemonPlace2.position.x,
    pokemonPlace2.position.y + 2,
    pokemonPlace2.position.z
);

scene.add(currentPlayerPokemonInfoBox);
scene.add(currentPlayerPokemonInfoText);

// opponent pokemon
let currentOpponentPokemonInfoBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.7, 0.0005),
    new THREE.MeshBasicMaterial({ color: 0x003399 })
);
let currentOpponentPokemonInfoText = buildTextMesh(
    "Ground\nPower - 100\n Accuracy - 100%",
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
currentOpponentPokemonInfoText.position.set(
    pokemonPlace1.position.x - 0.7,
    pokemonPlace1.position.y + 2.2,
    pokemonPlace1.position.z + 0.01
);
currentOpponentPokemonInfoText.scale.set(0.7, 0.7, 0.001);
currentOpponentPokemonInfoBox.position.set(
    pokemonPlace1.position.x,
    pokemonPlace1.position.y + 2,
    pokemonPlace1.position.z
);

scene.add(currentOpponentPokemonInfoBox);
scene.add(currentOpponentPokemonInfoText);

// CHANGING TEXTS FUNCTIONS

// ANIMATIONS
let startSprite = sprite.position;
let startSprite2 = sprite2.position;

const positionAttack = new VectorKeyframeTrack(
    ".position",
    [0, 0.5, 1, 1.3],
    [
        startSprite.x,
        startSprite.y,
        startSprite.z,
        startSprite.x - 2,
        startSprite.y + 0.5,
        startSprite.z + 1.5,
        sprite2.position.x,
        sprite2.position.y,
        sprite2.position.z - 0.05,
        startSprite.x,
        startSprite.y,
        startSprite.z,
    ]
);

const positionAttack2 = new VectorKeyframeTrack(
    ".position",
    [0, 0.6, 0.8, 1.3],
    [
        startSprite2.x,
        startSprite2.y,
        startSprite2.z,
        startSprite2.x + 2,
        startSprite2.y + 0.5,
        startSprite2.z - 1.5,
        sprite.position.x,
        sprite.position.y,
        sprite.position.z - 0.05,
        startSprite2.x,
        startSprite2.y,
        startSprite2.z,
    ]
);

const attackClip = new AnimationClip("attack1", -1, [positionAttack]);

const attackClip2 = new AnimationClip("attack2", -1, [positionAttack2]);

const mixer = new AnimationMixer(sprite);

var attackFromSprite = mixer.clipAction(attackClip).setLoop(THREE.LoopOnce);

const mixer2 = new AnimationMixer(sprite2);

var attackFromSprite2 = mixer2.clipAction(attackClip2);
attackFromSprite2.clampWhenFinished = true;
attackFromSprite2.play();

// WORKING WITH BUTTONS
function getIntersections(controller) {
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    return raycaster.intersectObjects(activeButtonsGroup.children, false);
}

function onSelectStart(event) { }

function onSelectEnd(event) {
    const controller = event.target;
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
        const intersection = intersections[0];

        const object = intersection.object;

        processClickOn(object);

        // controller.attach( object );
        // controller.userData.selected = object;
    }
}

function processClickOn(object) {

    state.turnCount += 1;

    // TODO: refactor NEXT TURN
    updateTextMesh(turnNumber, `Turn - ${state.turnCount}`);

    // TODO: activate attack
    if (buttons.includes(object)) {
        attackFromSprite2.enabled = true;
        attackFromSprite2.play();
    }

}


function intersectObjects(controller) {
    // Do not highlight when already selected

    const line = controller.getObjectByName("line");
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
        const intersection = intersections[0];
        const object = intersection.object;
        if (object == buttons[0]) {
            showInfoGroup.add(abilitiesSkillsBox[0]);
            showInfoGroup.add(abilitiesSkillsText[0]);
        } else if (object == buttons[1]) {
            showInfoGroup.add(abilitiesSkillsBox[1]);
            showInfoGroup.add(abilitiesSkillsText[1]);
        } else if (object == buttons[2]) {
            showInfoGroup.add(abilitiesSkillsBox[2]);
            showInfoGroup.add(abilitiesSkillsText[2]);
        } else if (object == buttons[3]) {
            showInfoGroup.add(abilitiesSkillsBox[3]);
            showInfoGroup.add(abilitiesSkillsText[3]);
        } else if (playersPokemons.includes(object)) {
            showInfoGroup.add(playersPokemonsInfoText);
            showInfoGroup.add(playersPokemonsInfoBox);
        } else if (opponentsPokemons.includes(object)) {
            showInfoGroup.add(opponentsPokemonsInfoText);
            showInfoGroup.add(opponentsPokemonsInfoBox);
        }

        intersected.push(object);
    } else {
        line.scale.z = 5;
    }
}

function cleanIntersected() {
    for (let i = 0; i < 4; i++) {
        showInfoGroup.remove(abilitiesSkillsBox[i]);
        showInfoGroup.remove(abilitiesSkillsText[i]);
    }
    showInfoGroup.remove(playersPokemonsInfoText);
    showInfoGroup.remove(playersPokemonsInfoBox);
    showInfoGroup.remove(opponentsPokemonsInfoText);
    showInfoGroup.remove(opponentsPokemonsInfoBox);
    while (intersected.length) {
        const object = intersected.pop();
    }
}

// END WORKING WITH BUTTONS

// TEXTS ABOUT ROUND
const initTexts = () => {

    turnNumber = buildTextMesh(
        `Turn - ${state.turnCount}`,
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    turnNumber.position.set(-25, 14, -40);
    turnNumber.scale.set(10, 10, 0.001);

    window.turnNumber = turnNumber;

    scene.add(turnNumber);

    turnInfo = buildTextMesh(
        `Coalossal will use Earthquake.
        Waiting for opponent...`,);
    turnInfo.position.set(-5, 12, -40);
    turnInfo.scale.set(3, 3, 0.2);
    scene.add(turnInfo);

    playersVs = buildTextMesh("MikeLun  vs  Daniel",  new THREE.MeshBasicMaterial({color: 0xB080FF}));
    playersVs.position.set(-11, 14, -40);
    playersVs.scale.set(14, 8, 0.5);
    scene.add(playersVs);
}

function changePlayerPokemon(id) {
    
}

const initControllers = () => {

    // CONTROLLERS
    controller1 = renderer.xr.getController(0);
    controller1.addEventListener("selectstart", onSelectStart);
    controller1.addEventListener("selectend", onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener("selectstart", onSelectStart);
    controller2.addEventListener("selectend", onSelectEnd);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(
        controllerModelFactory.createControllerModel(controllerGrip1)
    );
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(
        controllerModelFactory.createControllerModel(controllerGrip2)
    );
    scene.add(controllerGrip2);

    // init pointing line
    const geometryLine = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
    ]);

    const line = new THREE.Line(geometryLine);
    line.name = "line";
    line.scale.z = 5;

    controller1.add(line.clone());
    controller2.add(line.clone());
}

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;

initTexts();
initControllers();

renderer.setAnimationLoop(function () {
    const elapsedTime = clock.getElapsedTime();

    cleanIntersected();
    intersectObjects(controller1);
    intersectObjects(controller2);

    renderer.render(scene, camera);
    // sprite.rotation.y = 0;
    // sprite2.rotation.y = 0;
    pokemonPlace1.rotation.y = elapsedTime * 0.15;
    pokemonPlace2.rotation.y = elapsedTime * 0.15;

    const delta = clock.getDelta();

    annieTA.update(1000 * delta);
    boomTA.update(1000 * delta);

    mixer.update(5 * delta);

    // Animate boom manually 
    if (attackFromSprite2.time > 0.9) {
        scene.add(boom1);
    }
    if (attackFromSprite2.time > 1.2) {
        attackFromSprite2.enable = false;
        attackFromSprite2.stop();
        scene.remove(boom1);
    }

    mixer2.update(5 * delta);
});

// CONTROLS - Enable mouse rotation
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0, -4);
controls.update();

// Setup XR Mode toggle
document.body.appendChild(VRButton.createButton(renderer));

window.processClickOn = processClickOn;
