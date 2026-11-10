const PLAYER_SIZE = 15;
const PLAYER_TRAIL_LENGTH = 50;
const PLAYER_TRAIL_DISTANCE_THRESHOLD = 1;
const PLAYER_TURN_SPEED = 0.25;

class Player {
    constructor() {
        this.x = 100;
        this.y = 100;
        this.speedX = 0;
        this.speedY = 0;
        this.rotation = TAU / 8.0;
        this.trail = [];
        this.trailColor = 0;
    }

    _move(loop) {
        this.x += this.speedX * loop.deltaTime;
        this.y += this.speedY * loop.deltaTime;
        this._face(loop);
    }

    _face(loop) {
        if (Math.abs(this.speedX) > Number.EPSILON || Math.abs(this.speedY) > Number.EPSILON) {
            const targetRotation = Vector2.angle(this.speedX, this.speedY);
            
            let diff = targetRotation - this.rotation;
            while (diff < -Math.PI) diff += TAU;
            while (diff > Math.PI) diff -= TAU;
            
            const timeConstant = Easing.settleSecondsToTimeConstant(PLAYER_TURN_SPEED);
            this.rotation += diff * Easing.dampFactor(loop.deltaTime, timeConstant);
        }
    }

    _draw_trail() {
        if (this.trail.length < 2) return;

        strokeWeight(0);
        colorMode(HSL);
        fill(this.trailColor % 360, 100, 60);
        beginShape();
        for (let i = 0; i < this.trail.length; i++) {
            const entry = this.trail[i];
            const t = i / PLAYER_TRAIL_LENGTH;

            const size = Easing.ease("linear", t) * (PLAYER_SIZE / 1.2); // could just lerp here but i was playing arounf with different looks

            const [ x2, y2 ] = Vector2.rotate(0, size, 0 + entry.rot)
            vertex(x2 + entry.x, y2 + entry.y);
        }
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const entry = this.trail[i];
            const t = i / PLAYER_TRAIL_LENGTH;

            const size = Easing.ease("linear", t) * (PLAYER_SIZE / 1.2);
            
            const [ x1, y1 ] = Vector2.rotate(0, size, PI + entry.rot)
            vertex(x1 + entry.x, y1 + entry.y);
        }
        endShape(CLOSE);
        colorMode(RGB);
    }
    
    draw(dt) {
        this._draw_trail();
        this.trailColor += dt / 10;
        strokeWeight(2.5);
        fill("#fff0f9");
        stroke("#2b081d");
        translate(this.x, this.y);
        rotate(this.rotation);
        triangle(
            ...Vector2.rotate(PLAYER_SIZE, 0, 0),
            ...Vector2.rotate(PLAYER_SIZE, 0, TAU / 3),
            ...Vector2.rotate(PLAYER_SIZE, 0, (TAU / 3) * 2),
        );
        rotate(-this.rotation);
        translate(-this.x, -this.y);
    }

    _add_trail() {
        this.trail.push({
            x: this.x,
            y: this.y,
            rot: this.rotation,
        })
        if (this.trail.length > PLAYER_TRAIL_LENGTH) {
            this.trail.shift();
        }
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
        this._move(loop);

        const lastEntry = this.trail[this.trail.length - 1];

        if (this.trail.length === 0 || Vector2.distance(lastEntry.x, lastEntry.y, this.x, this.y) > PLAYER_TRAIL_DISTANCE_THRESHOLD) {
            this._add_trail();
        }
    }
}
