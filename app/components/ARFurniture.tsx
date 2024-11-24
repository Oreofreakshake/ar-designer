// app/components/ARFurniture.tsx
'use client';

import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';

function ARFurniture() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isStreaming, setIsStreaming] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [debugLog, setDebugLog] = React.useState<string[]>([]);

  const addDebugLog = (message: string): void => {
    console.log(message);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkMediaDevices = async () => {
    // Add device info to debug log
    addDebugLog(`User Agent: ${navigator.userAgent}`);
    addDebugLog(`Platform: ${navigator.platform}`);
    
    // Check if mediaDevices exists
    if (!navigator.mediaDevices) {
      addDebugLog('mediaDevices not found, trying to initialize');
      // @ts-ignore - We need this for older browsers
      if (navigator.mediaDevices === undefined) {
        // @ts-ignore
        navigator.mediaDevices = {};
      }
    }

    // Check if getUserMedia exists
    if (!navigator.mediaDevices.getUserMedia) {
      addDebugLog('getUserMedia not found, trying to initialize');
      // @ts-ignore
      navigator.mediaDevices.getUserMedia = function(constraints) {
        addDebugLog('Using polyfill for getUserMedia');
        // @ts-ignore
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
  };

  const startCamera = async (): Promise<void> => {
    addDebugLog('Attempting to start camera...');
    setError('');

    try {
      await checkMediaDevices();
      addDebugLog('Media devices checked');

      addDebugLog('Requesting camera stream...');
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight }
        },
        audio: false
      };

      let stream: MediaStream;
      try {
        addDebugLog('Attempting to access environment camera...');
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        addDebugLog('Got environment camera stream');
      } catch (err) {
        addDebugLog('Failed to get environment camera, trying default camera');
        // Fallback to basic camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        addDebugLog('Got default camera stream');
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = async () => {
          addDebugLog('Video metadata loaded');
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              addDebugLog('Video playing');
              setIsStreaming(true);
            } catch (e) {
              addDebugLog(`Play error: ${e}`);
              setError('Failed to start video playback');
            }
          }
        };

        videoRef.current.onerror = (e) => {
          addDebugLog(`Video error: ${e}`);
          setError('Error with video playback');
        };

        setError('');
      } else {
        throw new Error('Failed to initialize video element');
      }
    } catch (err) {
      const error = err as Error;
      addDebugLog(`Camera error: ${error.name} - ${error.message}`);
      console.error('Camera error:', error);

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
      {error && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2">
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
        className="absolute top-0 left-0 w-full h-full"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {!isStreaming && (
          <button
            onClick={startCamera}
            className="bg-white rounded-lg px-6 py-3 flex items-center gap-2 shadow-lg z-10 active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6" />
            Start Camera
          </button>
        )}
        
        <div className="absolute bottom-4 left-4 right-4 text-white text-xs bg-black/70 p-2 rounded max-h-32 overflow-y-auto">
          {debugLog.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ARFurniture;