import "https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js";
import "https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js";
import "https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js";
import "https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js";

import Service from "./service.js";
import { BLINK_READY } from "./constants.js";

// In the main process, the object to get the external imports is window.
// In the worker is 'self'.
const { tf, faceLandmarksDetection } = self;
tf.setBackend("webgl");

const service = new Service({
  faceLandmarksDetection,
});
console.log("Loading tf model.");
await service.loadModel();
console.log("Tf model loaded.");
postMessage(BLINK_READY);

onmessage = async ({ data: video }) => {
  const blinked = await service.hadBlinked(video);
  if (!blinked) return; 
  postMessage({ ok: "ok" });
};
