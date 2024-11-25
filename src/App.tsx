import { XR, createXRStore } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'
import './App.css'

function App() {
  const store = createXRStore()

  return (
    <Canvas>
      <XR store={store}>
        {/* Your 3D content will go here */}
        <mesh position={[0, 0, -1]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color={0x44aa88} />
        </mesh>
        <ambientLight />
      </XR>
    </Canvas>
  )
}

export default App
