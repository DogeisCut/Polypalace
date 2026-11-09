class Player {
    constructor() {
        this.x = 100;
        this.y = 100;
        this.rotation = TAU / 8.0;
    }

    move(x, y) {
        this.x += x
        this.y += y
    }
    
    draw(dt) {
        const SIZE = 15;
        translate(this.x, this.y);
        rotate(this.rotation);
        triangle(
            ...Vector2.rotate(0, -SIZE, 0),
            ...Vector2.rotate(0, -SIZE, TAU / 3),
            ...Vector2.rotate(0, -SIZE, (TAU / 3) * 2),
        );
        translate(-this.x, -this.y);
    }

    tick(loop) {
        this.move(1, 1);
    }
}
