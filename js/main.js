import { Draw } from "./modules/draw.js"
import { Input } from "./modules/input.js"
import { Loop } from "./modules/loop.js"
import { Sound } from "./modules/sound.js"
import { Player } from "./player.js"
import { View } from "./view.js"
import * as Config from "./config.js"
import { Wrap } from "./wrap.js"

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


const player = new Player()


const gameLoop = Loop.create({
    update: (loop) => {
        Input.update();
        player.tick(loop);
    }
})

Draw.create({
    init: (loop) => {
        View.resize(loop);
    },
    draw: (loop) => {
        gameLoop.tick(loop.deltaTime);

        View.begin(loop);
        player.draw(loop.ctx, loop.deltaTime);
        View.end(loop);
    },
    windowResized: (loop) => {
        loop.canvas.width = window.innerWidth
        loop.canvas.height = window.innerHeight
        View.resize(loop);
    }
})

Wrap.setDebug(Config.DEBUG.WRAPPING) 

load_assets()

Sound.create_bus("sfx")
Sound.create_bus("music")

//Sound.play("track1", {loop: true, bus: "music"})
