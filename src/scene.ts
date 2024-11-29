import { createPlaneMarker } from "./objects/PlaneMarker";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { handleXRHitTest } from "./utils/hitTest";

import {
  AmbientLight,
  BoxBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  XRFrame,
} from "three";


export function createScene(renderer: WebGLRenderer) {
  let chair: Object3D;
  let table: Object3D;
  let bed: Object3D;
  let closet: Object3D;
  let currentModel: Object3D;
  
  const gltfLoader = new GLTFLoader();

  const models = [
    { name: "chair", path: "../assets/models/chair.glb" },
    { name: "table", path: "../assets/models/table.glb" },
    { name: "bed", path: "../assets/models/bed.glb" },
    { name: "closet", path: "../assets/models/closet.glb" },
  ]

  //chair
  gltfLoader.load(models[0].path, (gltf: GLTF) => {
    chair = gltf.scene.children[0];
    // Scale down the model to make it smaller
    chair.scale.set(0.5, 0.5, 0.5);
  });

  //table
  gltfLoader.load(models[1].path, (gltf: GLTF) => {
    table = gltf.scene.children[0];
    table.scale.set(0.5, 0.5, 0.5);
  });

  //bed
  gltfLoader.load(models[2].path, (gltf: GLTF) => {
    bed = gltf.scene.children[0];
    bed.scale.set(0.5, 0.5, 0.5);
  });

  //closet
  gltfLoader.load(models[3].path, (gltf: GLTF) => {
    closet = gltf.scene.children[0];
    closet.scale.set(0.5, 0.5, 0.5);
  });

  createModelSelector();
  
  const scene = new Scene()
  const planeMarker = createPlaneMarker();
  scene.add(planeMarker);

  function setActiveModel(modelType: 'chair' | 'table' | 'bed' | 'closet') {
    switch (modelType) {
      case 'chair':
        currentModel = chair;
        break;
      case 'table':
        currentModel = table;
        break;
      case 'bed':
        currentModel = bed;
        break;
      case 'closet':
        currentModel = closet;
        break;
    }
  }

  const controller = renderer.xr.getController(0);
  scene.add(controller);

  controller.addEventListener("select", onSelect);

  function onSelect() {
    if (planeMarker.visible && currentModel) {
      const model = currentModel.clone();

      model.position.setFromMatrixPosition(planeMarker.matrix);

      // Rotate the model randomly to give a bit of variation to the scene.
      model.rotation.y = Math.random() * (Math.PI * 2);
      model.visible = true;

      scene.add(model);
    }
  }

  const ambientLight = new AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.02,
    20,
  )

  const renderLoop = (timestamp: number, frame?: XRFrame) => {   
    if (renderer.xr.isPresenting) {

      if (frame) {
        handleXRHitTest(renderer, frame, (hitPoseTransformed: Float32Array) => {
          if (hitPoseTransformed) {
            planeMarker.visible = true;
            planeMarker.matrix.fromArray(hitPoseTransformed);
          }
        }, () => {
          planeMarker.visible = false;
        })
      }
      renderer.render(scene, camera);
    }
  }
  
  renderer.setAnimationLoop(renderLoop);

  function createModelSelector() {
    const selector = document.createElement('div');
    selector.style.position = 'fixed';
    selector.style.bottom = '20px';
    selector.style.left = '50%';
    selector.style.transform = 'translateX(-50%)';
    selector.style.zIndex = '1000';
    selector.style.display = 'flex';
    selector.style.gap = '10px';
  
    models.forEach(model => {
      const button = document.createElement('button');
      button.textContent = model.name;
      button.style.padding = '10px 20px';
      button.onclick = () => setActiveModel(model.name as 'chair' | 'table' | 'bed' | 'closet');
      selector.appendChild(button);
    });
  
    document.body.appendChild(selector);
  }
  

}

