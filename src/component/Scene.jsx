import React, { Suspense } from 'react';
import { Environment, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import ModelWithControls from './ModelWithControls';

function Scene({ selectedModel, rotationY = 0 }) {
  const { camera } = useThree();

  React.useEffect(() => {
    if (camera) {
      camera.position.set(0, 2, 5);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      <Suspense fallback={null}>
        <Environment preset="sunset" background={false} />
      </Suspense>
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
      />

      {selectedModel && (
        <Suspense fallback={null}>
          <ModelWithControls 
            modelPath={selectedModel.modelPath}
            initialPosition={[0, -1, -2]}
            rotation={[0, rotationY, 0]}
          />
        </Suspense>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#f0f0f0"
          transparent
          opacity={0.4}
        />
      </mesh>
    </>
  );
}

export default Scene;