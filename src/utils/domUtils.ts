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
  content.className = "message-container";
  
  content.innerHTML = `
    <h1>Interior AR</h1>
    <p class="subtitle">Design your space in augmented reality</p>
    <p class="helper-text">Best used in well-lit spaces with room to move</p>
  `;
 
  container.appendChild(content);
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