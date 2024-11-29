export function displayUnsupportedBrowserMessage(): void {
  const appRoot = document.getElementById("app-root");
  if (!appRoot) return;
 
  const container = createStyledContainer();
  const message = document.createElement("div");
  message.className = "message-container";
  
  message.innerHTML = `
    <h2>😢 Device Not Supported</h2>
    <p>Your browser doesn't support WebXR augmented reality.</p>
    <p class="helper-text">Please use a recent version of Chrome on Android.</p>
  `;

  container.appendChild(message);
  appRoot.appendChild(container);
 }
 
 export function displayIntroductionMessage() {
  const appRoot = document.getElementById("app-root");
  if (!appRoot) return;
 
  const container = createStyledContainer();
  const content = document.createElement("div");
  const instruct = document.createElement("div");
  const arrow = document.createElement('div');
  content.className = "message-container";
  instruct.className = "instruct-container";
  
  content.innerHTML = `
    <h1>Interior AR</h1>
    <p class="subtitle">Design your room in augmented reality</p> 
    <p class="helper-text">Best used in well-lit spaces with room to move</p>
  `;

  instruct.innerHTML = `
  <p>Tap on the furniture to select it</p>
  `
  arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff5f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-down"><path d="M8 18L12 22L16 18"/><path d="M12 2V22"/></svg>`;
  arrow.style.color = 'white';
  arrow.style.fontSize = '32px';
  arrow.style.animation = 'bounce 2s infinite';

  const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-20px);
        }
        60% {
          transform: translateY(-10px);
        }
      }
    `;
  document.head.appendChild(style);
 
  container.appendChild(content);
  container.appendChild(instruct);
  container.appendChild(arrow);
  appRoot.appendChild(container);
 
  return () => appRoot.contains(container) && appRoot.removeChild(container);
 }
 
 export async function browserHasImmersiveArCompatibility(): Promise<boolean> {
  if (window.navigator.xr) {
    const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
    console.info(`[DEBUG] Browser ${isSupported ? "supports" : "does not support"} immersive-ar`);
    return isSupported;
  }
  return false;
 }
 
 function createStyledContainer() {
  const container = document.createElement("div");
  container.className = "container";
  return container;
 }
 
 export default {
  browserHasImmersiveArCompatibility,
  displayIntroductionMessage,
  displayUnsupportedBrowserMessage,
 };