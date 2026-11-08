import { config } from "./config.js";
import { state } from "./state.js";

function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(20);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

Object.assign(window, { setup, draw, windowResized });