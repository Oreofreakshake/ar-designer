import React, { useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

function ModelWithControls({ modelPath, initialPosition = [0, 0, 0], rotation = [0, 0, 0] }) {
  const [modelError, setModelError] = useState(null);
  const { scene } = useGLTF(modelPath, undefined, (error) => {
    console.error('Error loading model:', error);
    setModelError(error);
  });
  
  const modelRef = useRef();
  const { camera, gl } = useThree();
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, z: 0 });

  useEffect(() => {
    if (scene) {
      try {
        // Scale and center the model
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxSize * 5;
        scene.scale.set(scale, scale, scale);
        
        const center = box.getCenter(new THREE.Vector3());
        scene.position.sub(center);
      } catch (error) {
        console.error("Error scaling model:", error);
        setModelError(error);
      }
    }
  }, [scene]);

  const handlePointerDown = (event) => {
    event.stopPropagation();
    if (event.isPrimary) {
      setIsDragging(true);
      
      // Store the initial point where dragging started
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(
        (event.offsetX / gl.domElement.clientWidth) * 2 - 1,
        -(event.offsetY / gl.domElement.clientHeight) * 2 + 1
      );
      
      raycaster.setFromCamera(pointer, camera);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      
      dragStart.current = {
        x: intersectionPoint.x - position[0],
        z: intersectionPoint.z - position[2]
      };
    }
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !event.isPrimary) return;

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(
      (event.offsetX / gl.domElement.clientWidth) * 2 - 1,
      -(event.offsetY / gl.domElement.clientHeight) * 2 + 1
    );
    
    raycaster.setFromCamera(pointer, camera);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    
    setPosition([
      intersectionPoint.x - dragStart.current.x,
      position[1],
      intersectionPoint.z - dragStart.current.z
    ]);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  if (modelError) {
    return (
      <Html center>
        <div className="bg-red-100 text-red-700 p-2 rounded">
          Error loading model. Please try again.
        </div>
      </Html>
    );
  }

  return (
    <group 
      position={position} 
      rotation={rotation}
      ref={modelRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <primitive object={scene} />
      {isDragging && (
        <Html>
          <div className="bg-white px-2 py-1 rounded text-sm">
            Moving furniture...
          </div>
        </Html>
      )}
    </group>
  );
}

export default ModelWithControls;