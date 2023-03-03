import { BLINK_READY } from "./constants.js";

export default class Controller {
  #view;
  #worker;
  #camera;
  #blinkCounter = 0;

  constructor({ view, worker, camera }) {
    this.#view = view;
    this.#camera = camera;
    this.#worker = this.#configureWorker(worker);

    this.#view.configureOnBtnClick(this.onBtnStart.bind(this));
  }

  static async initialize(deps) {
    const controller = new Controller(deps);
    controller.log(
      `It's not detecting eye blink yet! Click in the button to start.`
    );
    return controller.init();
  }

  #configureWorker(worker) {
    let ready = false;
    worker.onmessage = ({ data }) => {
      if (BLINK_READY === data) {
        console.log("Worker is ready.");
        this.#view.enableButton();
        ready = true;
        return;
      }
      const blinked = data.blinked;
      this.#blinkCounter += blinked;
      console.log("blinked", this.#blinkCounter);
      this.#view.togglePlayVideo()
    };

    return {
      send(msg) {
        if (!ready) return;
        worker.postMessage(msg);
      },
    };
  }

  async init() {
    console.log("Controller initialized.");
  }

  loop() {
    const video = this.#camera.video;
    const img = this.#view.getVideoFrame(video);
    this.#worker.send(img);

    this.log("Detecting eye blink...");

    setTimeout(() => this.loop(), 100);
  }

  log(text) {
    const times = ` - blinked times: ${this.#blinkCounter}`;
    this.#view.log(`Logger: ${text.concat(this.#blinkCounter ? times : "")}`);
  }

  onBtnStart() {
    this.log("Initializing detection...");
    this.#blinkCounter = 0;
    this.loop();
  }
}
