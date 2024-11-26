import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei';
import { Camera, RotateCw, ChevronRight, Box } from 'lucide-react';
import Scene from './Scene';  // Adjust the path as needed
import * as THREE from 'three';

// Update these paths to match your actual file structure
const TABLE_PATH = '../../public/models/table.glb';  // Adjust this path
const CHAIR_PATH = '../../public/models/chair.glb';   // Adjust this path

// Preload models with error handling
try {
  useGLTF.preload(TABLE_PATH);
  useGLTF.preload(CHAIR_PATH);
} catch (error) {
  console.error("Error preloading models:", error);
}


function FurnitureViewer() {
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  // Updated furniture items with correct paths
  const furnitureItems = [
    { 
      id: 1, 
      name: 'Table', 
      modelPath: TABLE_PATH
    },
    { 
      id: 2, 
      name: 'Chair', 
      modelPath: CHAIR_PATH
    }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="relative w-full h-2/3 bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: cameraActive ? 'block' : 'none' }}
        />
        
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 2, 5], fov: 75 }}
            gl={{ 
              alpha: true,
              antialias: true,
              preserveDrawingBuffer: true
            }}
            style={{ 
              background: cameraActive ? 'transparent' : '#1a1a1a'
            }}
            eventPrefix="client"
            eventSource={document.getElementById('root')}
          >
            <Scene selectedModel={selectedFurniture} />
          </Canvas>
        </div>

        <div className="absolute top-4 right-4 flex gap-4 z-10">
          <button 
            className={`p-2 rounded-full shadow-lg ${cameraActive ? 'bg-red-500 text-white' : 'bg-white'}`}
            onClick={toggleCamera}
          >
            <Camera className="w-6 h-6" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-lg">
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="w-full h-1/3 bg-white p-4">
        <h2 className="text-xl font-bold mb-4">Select Furniture</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {furnitureItems.map((item) => (
            <div 
              key={item.id}
              className={`flex-shrink-0 w-48 cursor-pointer transition-transform hover:scale-105 bg-white rounded-lg shadow-md
                ${selectedFurniture?.id === item.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedFurniture(item)}
            >
              <div className="p-4">
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                  <Box className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="font-medium">{item.name}</h3>
                <button 
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-500 text-white p-2 rounded-lg"
                >
                  View in {cameraActive ? 'AR' : '3D'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FurnitureViewer;