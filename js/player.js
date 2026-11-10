const PLAYER_SIZE = 15;
const PLAYER_TRAIL_LENGTH = 50;
const PLAYER_TRAIL_DISTANCE_THRESHOLD = 1;
const PLAYER_BACK_OFFSET = PLAYER_SIZE * Math.cos(Math.PI * 2 / 3);
const PLAYER_BACK_HALF_WIDTH = PLAYER_SIZE * Math.sin(Math.PI * 2 / 3);

class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.rotation = 0;
        this.trail = [];
        this.trailColor = 0;
        this.savedX = null;
        this.savedY = null;
    }

    _back_point() {
        return Vector2.rotate(PLAYER_BACK_OFFSET, 0, this.rotation);
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

        strokeWeight(1);
        colorMode(HSL, 360, 100, 100);

        for (let i = 0; i < this.trail.length - 1; i++) {
            const a = this.trail[i];
            const b = this.trail[i + 1];

            const sizeA = Easing.ease("linear", i / PLAYER_TRAIL_LENGTH) * (PLAYER_SIZE / 1.2); // could just lerp here but i was playing arounf with different looks
            const sizeB = Easing.ease("linear", (i + 1) / PLAYER_TRAIL_LENGTH) * (PLAYER_SIZE / 1.2);

            const [ ax1, ay1 ] = Vector2.rotate(0, sizeA, a.rot);
            const [ ax2, ay2 ] = Vector2.rotate(0, sizeA, PI + a.rot);
            const [ bx1, by1 ] = Vector2.rotate(0, sizeB, b.rot);
            const [ bx2, by2 ] = Vector2.rotate(0, sizeB, PI + b.rot);

            fill((i * 7 + this.trailColor) % 360, 100, 80);
            stroke((i * 7 + this.trailColor) % 360, 100, 80)
            quad(
                a.x + ax1, a.y + ay1,
                b.x + bx1, b.y + by1,
                b.x + bx2, b.y + by2,
                a.x + ax2, a.y + ay2,
            );
        }

        colorMode(RGB, 255, 255, 255);
    }
    
    draw(dt) {
        this.trailColor += dt / 2;
        this._draw_copy()
        translate(-width, 0);
        this._draw_copy()
        translate(width * 2, 0);
        this._draw_copy()
    }

    _draw_copy() {
        this._draw_trail();
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
        fill("#2b081d");
        circle(PLAYER_SIZE/4,0,PLAYER_SIZE/3);
        rotate(-this.rotation);
        translate(-this.x, -this.y);
        this._draw_save_point();
    }

    _add_trail() {
        const [backX, backY] = this._back_point();

        this.trail.push({
            x: this.x + backX,
            y: this.y + backY,
            rot: this.rotation,
        });
        if (this.trail.length > PLAYER_TRAIL_LENGTH) {
            this.trail.shift();
        }
    }

    _draw_save_point() {
        if (this.savedX != null && this.savedY != null) {
            strokeWeight(2.5);
            noFill();
            stroke("#2b081d");
            translate(this.savedX, this.savedY);
            circle(0,0,PLAYER_SIZE);
            line(0,PLAYER_SIZE*1.1,0,-PLAYER_SIZE*1.1);
            line(PLAYER_SIZE*1.1,0,-PLAYER_SIZE*1.1,0);
            translate(-this.savedX, -this.savedY);
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

        if (Input.was_action_just_pressed("warp")) {
            if (this.savedX == null || this.savedY == null) {
                this.savedX = this.x
                this.savedY = this.y
            } else {
                if (this.trail.length > PLAYER_TRAIL_LENGTH - 2) {
                    this.trail.shift();
                }
                this.rotation = Vector2.angle(this.savedX - this.x, this.savedY - this.y);
                this._add_trail();
                [ this.speedX, this.speedY ] = Vector2.rotate(...Vector2.RIGHT, this.rotation);
                this.speedX *= PLAYER_WARP_SPEED_BOOST;
                this.speedY *= PLAYER_WARP_SPEED_BOOST;
                this.x = this.savedX;
                this.y = this.savedY;
                this.savedX = null;
                this.savedY = null;
                this._add_trail();
            }
        }

        this._add_trail();
    }
}
