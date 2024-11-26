import React, { Suspense } from 'react';
import { Environment, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import ModelWithControls from './ModelWithControls';  // Make sure the path is correct

function Scene({ selectedModel }) {
  const { camera } = useThree();

  // Set initial camera position
  React.useEffect(() => {
    if (camera) {
      camera.position.set(0, 2, 5);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Environment and controls */}
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

      {/* Render selected furniture model */}
      {selectedModel && (
        <Suspense fallback={null}>
          <ModelWithControls 
            modelPath={selectedModel.modelPath}
            initialPosition={[0, -1, -2]}
          />
        </Suspense>
      )}

      {/* Ground plane for shadow and reference */}
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