'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Camera, StopCircle } from 'lucide-react';

interface MediaError {
  name: string;
  message: string;
}

const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const startCamera = async (): Promise<void> => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      const mediaError = err as MediaError;
      setError(`Failed to access camera. ${mediaError.message}`);
      console.error('Error accessing camera:', mediaError);
    }
  };

  const stopCamera = (): void => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track: MediaStreamTrack) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative w-full max-w-lg aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        {!isStreaming ? (
          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            type="button"
          >
            <Camera size={20} />
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            type="button"
          >
            <StopCircle size={20} />
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraComponent;