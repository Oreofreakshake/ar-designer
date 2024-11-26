import React, { useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

function ModelWithControls({ modelPath, initialPosition = [0, -1, -2] }) {
  const [modelError, setModelError] = useState(null);
  const { scene } = useGLTF(modelPath, undefined, (error) => {
    console.error('Error loading model:', error);
    setModelError(error);
  });
  
  const modelRef = useRef();
  const { camera, gl } = useThree();
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (scene) {
      try {
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxSize * 2;
        scene.scale.set(scale, scale, scale);
        
        const center = box.getCenter(new THREE.Vector3());
        scene.position.sub(center);
      } catch (error) {
        console.error("Error scaling model:", error);
        setModelError(error);
      }
    }
  }, [scene]);

  if (modelError) {
    return (
      <Html center>
        <div className="bg-red-100 text-red-700 p-2 rounded">
          Error loading model. Please try again.
        </div>
      </Html>
    );
  }

  const handlePointerDown = (event) => {
    if (event.isPrimary) {
      setIsDragging(true);
    }
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !modelRef.current || !event.isPrimary) return;

    const x = (event.offsetX / gl.domElement.clientWidth) * 2 - 1;
    const y = -(event.offsetY / gl.domElement.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);

    setPosition([intersectionPoint.x, position[1], intersectionPoint.z]);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <group position={position} ref={modelRef}
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