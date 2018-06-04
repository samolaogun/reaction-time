class Game {
  static get isMobile() {
    return window.matchMedia("(max-width: 704px)").matches;
  }

  async _duration(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time);
    });
  }

  async _click(className) {
    const el = document.querySelector(className);
    return new Promise((resolve, reject) => {
      el.addEventListener("click", resolve);
    });
  }

  async _keystroke(key) {
    return new Promise((resolve, reject) => {
      if (Game.isMobile) {
        game.addEventListener("click", resolve, { once: true });
      } else {
        const callback = e => {
          if (e.keyCode === key.charCodeAt(0)) {
            game.removeEventListener("keydown", callback);
            resolve();
          }
        };

        game.addEventListener("keydown", callback);
      }
    });
  }

  constructor() {
    this._start();
    this._gameNode = document.querySelector(".game");
  }

  async _start() {
    while (1) await this._play();
  }

  async _play() {
    this._gameNode.classList.add("fixed");
    document.body.style.overflow = "hidden";

    await this._show(".start", this._keystroke("S"));
    await this._show(".ready", this._duration(2000));
    await this._show(".set", this._duration(Math.random() * 7000));

    const time = await this._timer(".go", keystroke(" "));
    await this._showSummary(time);
  }

  async showSummary(time) {
    const el = document.querySelector(".summary");
    var h1 = el.querySelector("h1");
    h1.innerHTML = time;
    el.classList.add("slide--show");
    recordTime(time);
    await click(".redo");
    el.classList.remove("slide--show");
  }

  async reset() {
    await show(".reset", await click(".redo"));
  }

  async timer(...args) {
    const startTime = performance.now();
    await show(...args);
    return (performance.now() - startTime) / 1000;
  }

  async show(className, promise) {
    const el = document.querySelector(className);
    el.classList.add("slide--show");

    await promise;

    return new Promise((resolve, reject) => {
      el.classList.remove("slide--show");
      el.addEventListener("transitionend", resolve);
    });
  }
}
