import * as THREE from "./three.js-master/build/three.module.js";
import { GLTFLoader } from "./three.js-master/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "./three.js-master/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();

let toggleBtn = document.querySelector("#navbar-toggle");
let collapse = document.querySelector("#navbar-collapse");

toggleBtn.onclick = () => {
  collapse.classList.toggle("hidden");
  collapse.classList.toggle("flex");
};

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const loadingScreen = document.querySelector(".loading-screen");
loadingScreen.style.display = "flex";

let currentMesh = null;
let meshScale = 0.5;
let index = -1;

const changeModelButtons = document.querySelectorAll(".CM");
const changeModelButtonsArray = Array.prototype.slice.call(changeModelButtons);

changeModelButtonsArray.forEach((button) => {
  button.addEventListener("click", (event) => {
    loadingScreen.style.display = "flex";
    // remove the selected class from all buttons
    changeModelButtons.forEach((button) => {
      button.classList.add("border-indigo-600");
      button.classList.remove(
        "shadow-xl",
        "bg-indigo-600",
        "text-white",
        "text-indigo-600"
      );
    });

    // add the selected class to the clicked button
    button.classList.remove("border-indigo-600");
    event.target.classList.add("shadow-xl", "bg-indigo-600", "text-white");
    const url = event.target.dataset.meshUrl;
    // meshScale=scales.url
    meshScale = parseFloat(event.target.dataset.meshScale);
    index = parseInt(event.target.dataset.meshIdx);
    loadModel(`assets/${url}.glb`);
  });
});

// changeModelButton.addEventListener("click", () => {
//   loadModel("assets/juice_carton_shop.glb");
// });

function loadModel(url) {
  const loader = new GLTFLoader();
  loader.load(
    url,
    GLBLoaderLoader,
    function (xhr) {
      // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log(error);
    }
  );
}

function GLBLoaderLoader(glb) {
  if (currentMesh) {
    scene.remove(currentMesh);
  }
  // console.log(glb);
  currentMesh = glb.scene;
  getLBH(currentMesh);
  currentMesh.position.set(0, index, 0);
  // console.log(meshScale);
  currentMesh.scale.set(meshScale, meshScale, meshScale);
  scene.add(currentMesh);
  resetCamera();
  loadingScreen.style.display = "none";
}
scene.background = new THREE.Color(0xffffff);
const loader = new GLTFLoader();
loader.load(
  "assets/juice_carton_shop.glb",
  GLBLoaderLoader,
  function (xhr) {
    // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log(error);
  }
);

function getLBH(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);

  const length = size.x;
  const breadth = size.z;
  const height = size.y;
  // console.log("length:", length);
  // console.log("breadth:", breadth);
  // console.log("height:", height);
}

const fileInput = document.querySelector("#file-input");
const warning = document.querySelector("#alert-border-2");
const ctrl = document.querySelector(".controls");
warning.style.display = "none";
ctrl.style.display = "flex";
// console.log('wrn',warning.style.display);
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file.name.endsWith(".glb")) {
    warning.style.display = "flex";
    // console.log('wrn',warning.style.display);
    return;
  } else {
    warning.style.display = "none";
  }
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    const data = reader.result;
    const loader = new GLTFLoader();

    loader.parse(data, "", (glb) => GLBLoaderLoader(glb));
  });

  reader.readAsArrayBuffer(file);
});

const closeWarningButton = document.querySelector('#close-warning');
closeWarningButton.addEventListener('click', () => {
  warning.style.display = 'none';
});

// Set up camera

// const VP = document.querySelector(".VP");

const sizes = {
  width: window.innerWidth * 0.9,
  height: window.innerHeight / 1.5,
};
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 2);
scene.add(camera);
function onWindowResize() {
  // VP.style.width=window.innerWidth - 49
  // Update sizes
  // console.log("width:", window.innerWidth);
  // console.log("height:", window.innerHeight / 2);
  sizes.width = window.innerWidth * 0.9;

  // Update camera aspect ratio
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(sizes.width, sizes.height);
}

// window resize event
window.addEventListener("resize", onWindowResize);
// Set up renderer

const renderer = new THREE.WebGL1Renderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.gammaOuput = true;
renderer.render(scene, camera);

// Set up orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = true;
controls.zoomSpeed = 0.5;

// Reset camera function
function resetCamera() {
  camera.position.set(0, 0, 10);
  controls.target.set(0, 0, 0);
  camera.fov = 20;
  camera.updateProjectionMatrix();
  handleZoomClick();
}

//  reset button functionality
const resetButton = document.querySelector("#reset");

resetButton.addEventListener("click", () => {
  resetCamera();
});

const zoomValue = document.querySelector("#zoom-value");
function handleZoom() {
  const distance = camera.position.distanceTo(controls.target) / 10;
  zoomValue.textContent = distance.toFixed(2);
}

function handleZoomClick() {
  zoomValue.textContent = parseFloat(camera.fov / 50).toFixed(2);
}
const zoomInButton = document.querySelector("#zoom-in");
const zoomOutButton = document.querySelector("#zoom-out");

zoomInButton.addEventListener("click", () => {
  camera.fov -= 5;
  camera.updateProjectionMatrix();
  handleZoomClick();
});

zoomOutButton.addEventListener("click", () => {
  camera.fov += 5;
  camera.updateProjectionMatrix();
  handleZoomClick();
});

// Animate function
function animate() {
  requestAnimationFrame(animate);
  controls.addEventListener("change", () => {
    handleZoom();
  });
  // Update orbit controls
  controls.update();

  renderer.render(scene, camera);
}

animate();
