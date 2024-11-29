import { createPlaneMarker } from "./objects/PlaneMarker";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { handleXRHitTest } from "./utils/hitTest";

import {
  AmbientLight,
  BoxBufferGeometry,
  DirectionalLight,
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
    table.scale.set(0.6, 0.6, 0.6);
  });

  //bed
  gltfLoader.load(models[2].path, (gltf: GLTF) => {
    bed = gltf.scene.children[0];
    bed.scale.set(0.5, 0.5, 0.5);
  });

  //closet
  gltfLoader.load(models[3].path, (gltf: GLTF) => {
    closet = gltf.scene.children[0];
    closet.scale.set(0.7, 0.7, 0.7);
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
    selector.style.position = 'absolute';
    selector.style.bottom = '43%';
    selector.style.left = '50%';
    selector.style.transform = 'translate(-50%, 50%)';
    selector.style.display = 'flex';
    selector.style.flexDirection = 'column'; 
    selector.style.alignItems = 'center';
    selector.style.gap = '20px'; 
    
    const buttonContainer = document.createElement('div'); 
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    
    let selectedButton: HTMLButtonElement | null = null;
    
    models.forEach(model => {
      const button = document.createElement('button');
      button.textContent = model.name;
      button.style.padding = '10px 20px';
      button.style.background = 'black';
      button.style.fontFamily = 'Lexend Deca';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      button.style.transition = 'all 0.3s ease';
      
      button.onclick = () => {
        if (selectedButton) {
          selectedButton.style.background = 'black';
          selectedButton.style.color = 'white';
        }
        button.style.background = 'white';
        button.style.color = 'black';
        selectedButton = button;
        setActiveModel(model.name as 'chair' | 'table' | 'bed' | 'closet');
      };
      
      buttonContainer.appendChild(button);
    });

    
    
    selector.appendChild(buttonContainer);
    document.body.appendChild(selector);
  }
  

}

