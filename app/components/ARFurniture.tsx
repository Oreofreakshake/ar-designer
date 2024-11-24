'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, AlertCircle, Plus, Minus, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

function ARFurniture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>(''); // For debug info
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const initThreeJS = () => {
    try {
      setStatus('Initializing Three.js...');
      
      if (!canvasRef.current) {
        setStatus('Canvas not found');
        return;
      }

      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      setStatus('Scene created');

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;
      setStatus('Camera created');

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
      setStatus('Renderer created');

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 5, 5);
      scene.add(directionalLight);
      setStatus('Lights added');

      // Add a test cube
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, 0, -3);
      scene.add(cube);
      setStatus('Test cube added');

      // Animation loop
      const animate = () => {
        if (sceneRef.current && cameraRef.current && rendererRef.current) {
          requestAnimationFrame(animate);
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();
      setStatus('Animation started');

      // Handle touch events
      const handleTouch = (event: TouchEvent) => {
        event.preventDefault();
        setStatus('Screen touched at: ' + event.touches[0].clientX + ', ' + event.touches[0].clientY);
        
        const touch = event.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        const newCube = new THREE.Mesh(geometry, material);
        const vector = new THREE.Vector3(x, y, -3);
        vector.unproject(camera);
        newCube.position.copy(vector);
        scene.add(newCube);
        setStatus('New cube added at: ' + x.toFixed(2) + ', ' + y.toFixed(2));
      };

      canvasRef.current.addEventListener('touchstart', handleTouch, { passive: false });

      return () => {
        canvasRef.current?.removeEventListener('touchstart', handleTouch);
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
      };
    } catch (err) {
      setStatus('Error in Three.js init: ' + (err as Error).message);
    }
  };

  const startCamera = async (): Promise<void> => {
    setError('');
    setStatus('Starting camera...');

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      setStatus('Requesting camera access...');
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        setStatus('Camera access granted');
      } catch (err) {
        setStatus('Falling back to default camera');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              setIsStreaming(true);
              setStatus('Video playing');
              initThreeJS();
            } catch (e) {
              setError('Failed to start video playback');
              setStatus('Video play error: ' + (e as Error).message);
            }
          }
        };
      }
    } catch (err) {
      const error = err as Error;
      setStatus('Camera error: ' + error.message);
      
      if (error.name === 'NotAllowedError' || error.message.includes('Permission')) {
        setError('Please allow camera access in your browser settings and try again');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on your device');
      } else if (error.name === 'NotReadableError') {
        setError('Camera is already in use by another app');
      } else {
        setError('Failed to access camera. Please check browser permissions and try again.');
      }
      setIsStreaming(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Status/Debug Display */}
      <div className="absolute top-0 left-0 right-0 bg-black/50 text-white p-2 z-50 text-sm">
        Status: {status}
      </div>

      {error && (
        <div className="absolute top-12 left-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {!isStreaming && (
          <button
            onClick={startCamera}
            className="bg-white text-black rounded-lg px-6 py-3 flex items-center gap-2 shadow-lg z-10 active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6" />
            Start AR Experience
          </button>
        )}
      </div>
    </div>
  );
}

export default ARFurniture;