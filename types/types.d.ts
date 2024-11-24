// types.d.ts
interface MediaDevices {
    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  }
  
  interface Navigator {
    mediaDevices: MediaDevices;
  }