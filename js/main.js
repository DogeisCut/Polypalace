let player = null
const GameLoop = Loop.create({
    update: (loop) => tick(loop)
})

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
    player.tick(loop);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}