class Player {
    constructor() {
        this.x = 100;
        this.y = 100;
        this.speedX = 0;
        this.speedY = 0;
        this.rotation = TAU / 8.0;
    }

    move(loop) {
        this.x += this.speedX * loop.deltaTime;
        this.y += this.speedY * loop.deltaTime;
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
        const moveX = Input.is_action_down("right") - Input.is_action_down("left");
        const moveY = Input.is_action_down("down") - Input.is_action_down("up");
        const length = Vector2.magnitude(moveX, moveY);
        const targetX = (moveX / length) * PLAYER_MOVE_SPEED;
        const targetY = (moveY / length) * PLAYER_MOVE_SPEED;
        if (Math.abs(moveX) < Number.EPSILON && Math.abs(moveY) < Number.EPSILON) {
            [ this.speedX, this.speedY ] = Vector2.lerp(this.speedX, this.speedY, ...Vector2.ZERO, 1 - Math.pow(PLAYER_DECEL, loop.deltaTime))
        } else {
            [ this.speedX, this.speedY ] = Vector2.lerp(this.speedX, this.speedY, targetX, targetY, 1 - Math.pow(PLAYER_ACCEL, loop.deltaTime))
        }
        this.move(loop);
    }
}
