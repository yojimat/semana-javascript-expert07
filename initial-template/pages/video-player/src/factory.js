import Camera from "../../../lib/shared/camera.js";
import { supportsWorkerType } from "../../../lib/shared/util.js";
import Controller from "./controller.js";
import Service from "./service.js";
import View from "./view.js";

async function getWorker() {
  if (supportsWorkerType()) {
    console.log("Browser supports workers.");
    console.log("Initializing esm workers.");
    const worker = new Worker("./src/worker.js", { type: "module" });
    return worker;
  }
  const workerMock = {
    async postMessage() {},
    onmessage(msg) {},
  };
  console.log("Browser doesn't support workers.");
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
