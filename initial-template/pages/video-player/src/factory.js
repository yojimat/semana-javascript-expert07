import Camera from "../../../lib/shared/camera.js";
import { supportsWorkerType } from "../../../lib/shared/util.js";
import { BLINK_READY } from "./constants.js";
import Controller from "./controller.js";
import Service from "./service.js";
import View from "./view.js";

async function getWorker() {
  if (supportsWorkerType()) {
    console.log("Initializing esm workers.");
    const worker = new Worker("./src/worker.js", { type: "module" });
    return worker;
  }

  console.warn("Browser doesn't support esm modules on  webworkers.");
  console.warn("Importing libraries.");

  await import("https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js");
  await import(
    "https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js"
  );
  await import(
    "https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js"
  );
  await import(
    "https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js"
  );

  console.warn("Using worker mock instead!");

  const service = new Service({
    faceLandmarksDetection: window.faceLandmarksDetection,
  });

  const workerMock = {
    async postMessage(video) {
      const blinked = await service.hadBlinked(video);
      if (!blinked) return;
      workerMock.onmessage({ data: { blinked } });
    },
    // This onmesssage will overriden by the controller's on message.
    onmessage(msg) {},
  };

  console.log("Loading tf model...");
  await service.loadModel();
  console.log("Tf model loaded.");

  // This is the time necessary to await for the controller load and enable the button.
  // The time can change depending on the host machine that the application it's running on.
  setTimeout(() => {
    worker.onmessage({ data: BLINK_READY });
  }, 500);

  return workerMock;
}

const worker = await getWorker();
const camera = await Camera.init();

const factory = {
  async initialize() {
    return Controller.initialize({
      view: new View(),
      worker,
      camera,
    });
  },
};

export default factory;
