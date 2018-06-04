"use strict";

// add a test to make sure that people know how to use it.

var sections = document.querySelectorAll("section");
var game = document.querySelector(".game");
var hasBegun = false;

var database = firebase.database();

if (window.matchMedia("(max-width: 704px)").matches) {
  document.querySelectorAll(".tap").forEach(function(el) {
    el.innerHTML = "Tap ";
  });
}

function recordTime(time) {
  var date = new Date();
  var ms = date.getTime();
  var str = date.toISOString();

  database.ref("reactionTimes/" + ms).set({
    date: str,
    reactionTime: time
  });
}

window.addEventListener(
  "scroll",
  function() {
    var active = null;
    sections.forEach(function(section) {
      if (inView(section)) active = section;
      section.classList.remove("active");
    });
    if (active) active.classList.add("active");
    if (gameIsInView()) startGame();
  },
  { passive: true }
);

async function startGame() {
  if (!hasBegun) {
    while (1) await initGame();
  }
}

function inView(el) {
  const height = window.innerHeight;
  const { top } = el.getBoundingClientRect();

  return top < height * 0.5;
}

function gameIsInView() {
  var initTop = document.querySelector(".game").getBoundingClientRect().top;

  return initTop < 20;
}

async function showSummary(time) {
  const el = document.querySelector(".summary");
  var h1 = el.querySelector("h1");
  h1.innerHTML = time;
  el.classList.add("slide--show");
  recordTime(time);
  await Promise.race([click(".redo"), keystroke(" "), keystroke("S")]);
  el.classList.remove("slide--show");
}

async function reset() {
  await show(".reset", await click(".redo"));
}

async function initGame() {
  hasBegun = true;
  game.classList.add("fixed");
  document.body.style.overflow = "hidden";
  await show(".start", keystroke("S"));
  await show(".ready", duration(2000));
  await show(".set", duration(Math.random() * 7000));
  const time = await timer(".go", keystroke(" "));
  await duration(10);
  await showSummary(time);
  await duration(10);
  hasBegun = false;
}

async function timer(...args) {
  const startTime = performance.now();
  await show(...args);
  return (performance.now() - startTime) / 1000;
}

async function duration(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

async function show(className, promise) {
  const el = document.querySelector(className);
  el.classList.add("slide--show");

  await promise;

  return new Promise((resolve, reject) => {
    el.classList.remove("slide--show");
    el.addEventListener("transitionend", resolve, { once: true });
  });
}

async function click(className) {
  const el = document.querySelector(className);
  return new Promise((resolve, reject) => {
    if (window.matchMedia("(max-width: 704px)").matches) {
      el.addEventListener("touchstart", resolve, {
        once: true,
        passive: true
      });
    } else {
      el.addEventListener("click", resolve, { once: true });
    }
  });
}

async function keystroke(key) {
  return Promise.race([touchStart(), keyDown(key)]);
}

async function touchStart() {
  console.log(1);
  return new Promise(function(resolve, reject) {
    window.addEventListener("touchstart", resolve, {
      once: true,
      passive: true
    });
  });
}

async function keyDown(key) {
  return new Promise(function(resolve, reject) {
    window.addEventListener("keydown", function(e) {
      e.keyCode === key.charCodeAt(0) && resolve();
    });
  });
}
