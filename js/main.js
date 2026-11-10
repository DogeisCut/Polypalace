import { Assets } from "./modules/assets.js"
import { Easing } from "./modules/easing.js"
import { Input } from "./modules/input.js"
import { Loop } from "./modules/loop.js"
import { Sound } from "./modules/sound.js"
import { UI } from "./modules/ui.js"
import { Player } from "./player.js"
import { View } from "./view.js"
import * as Config from "./config.js"

let player = null
const GameLoop = Loop.create({
    update: (loop) => tick(loop)
})

Input.add_action("up")
Input.add_event("up", Input.Key.UP)
Input.add_event("up", Input.Key.KEY_W)

Input.add_action("down")
Input.add_event("down", Input.Key.DOWN)
Input.add_event("down", Input.Key.KEY_S)

Input.add_action("left")
Input.add_event("left", Input.Key.LEFT)
Input.add_event("left", Input.Key.KEY_A)

Input.add_action("right")
Input.add_event("right", Input.Key.RIGHT)
Input.add_event("right", Input.Key.KEY_D)

Input.add_action("warp")
Input.add_event("warp", Input.Key.SPACE)
Input.add_event("warp", Input.Mouse.LEFT)

async function load_assets() {
    await Sound.load("track1", "assets/sounds/music/track1.mp3")

    await Sound.load("warp_place", "assets/sounds/sfx/warp_place.wav")
    await Sound.load("warp_use", "assets/sounds/sfx/warp_use.wav")
    await Sound.load("wrap", "assets/sounds/sfx/wrap.wav")
}

async function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(Math.min(window.devicePixelRatio || 1, 2)); // we could do with some quality settings later
    View.resize();
    textAlign(CENTER, CENTER);
    textFont(Config.FONT_FAMILY);
    strokeWeight(2.5);
    fill("#fff0f9");
    stroke("#2b081d");
    player = new Player()

    await load_assets()

    Sound.create_bus("sfx")
    Sound.create_bus("music")

    Sound.play("track1", {loop: true, bus: "music"})
}
window.setup = setup;

function draw() {
    GameLoop.tick(deltaTime / 1000);
    View.begin();
    player.draw(deltaTime);
    View.end();
}
window.draw = draw;

function tick(loop) {
    Input.update();
    player.tick(loop);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    View.resize();
}
window.windowResized = windowResized;
