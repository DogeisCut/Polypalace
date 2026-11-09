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

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    textFont(FONT_FAMILY);
    strokeWeight(2.5);
    fill("#fff0f9");
    stroke("#2b081d");
    player = new Player()
}

function draw() {
    GameLoop.tick(deltaTime / 1000);
    background(255);
    player.draw(deltaTime);
}

function tick(loop) {
    Input.update();
    player.tick(loop);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}