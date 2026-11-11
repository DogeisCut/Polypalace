import { Draw } from "./modules/draw.js";
import { Input } from "./modules/input.js";
import { Loop } from "./modules/loop.js";
import { Sound } from "./modules/sound.js";
import { Player } from "./player.js";
import { View } from "./view.js";
import * as Config from "./config.js";
import { Wrap } from "./wrap.js";

Input.addAction("up");
Input.addEvent("up", Input.Key.UP);
Input.addEvent("up", Input.Key.KEY_W);

Input.addAction("down");
Input.addEvent("down", Input.Key.DOWN);
Input.addEvent("down", Input.Key.KEY_S);

Input.addAction("left");
Input.addEvent("left", Input.Key.LEFT);
Input.addEvent("left", Input.Key.KEY_A);

Input.addAction("right");
Input.addEvent("right", Input.Key.RIGHT);
Input.addEvent("right", Input.Key.KEY_D);

Input.addAction("warp");
Input.addEvent("warp", Input.Key.SPACE);
Input.addEvent("warp", Input.Mouse.LEFT);

async function load_assets() {
    // Music
    await Sound.load("track1", "assets/sounds/music/track1.mp3");

    // Entity
    await Sound.load("wrap", "assets/sounds/sfx/wrap.wav");

    // Player
    await Sound.load("warp_place", "assets/sounds/sfx/warp_place.wav");
    await Sound.load("warp_use", "assets/sounds/sfx/warp_use.wav");
    await Sound.load("aoe_attack", "assets/sounds/sfx/aoe_attack.wav");
}

const player = new Player();

const gameLoop = Loop.create({
    update: (loop) => {
        Input.update();
        player.tick(loop);
    },
});

Draw.create({
    init: (loop) => {
        View.resize(loop);
    },
    draw: (loop) => {
        gameLoop.tick(loop.deltaTime);

        loop.ctx.lineCap = "round";
        loop.ctx.lineJoin = "miter";

        View.begin(loop);
        player.draw(loop);
        View.end(loop);
    },
    windowResized: (loop) => {
        loop.canvas.width = window.innerWidth;
        loop.canvas.height = window.innerHeight;
        View.resize(loop);
    },
});

Wrap.setDebug(Config.DEBUG.WRAPPING);

load_assets();

Sound.createBus("sfx");
Sound.createBus("music");

//Sound.play("track1", {loop: true, bus: "music"})
