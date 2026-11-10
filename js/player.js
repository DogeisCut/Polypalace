const PLAYER_SIZE = 15;
const PLAYER_TRAIL_LENGTH = 50;
const PLAYER_TRAIL_DISTANCE_THRESHOLD = 1;
const PLAYER_BACK_OFFSET = PLAYER_SIZE * Math.cos(Math.PI * 2 / 3);
const PLAYER_BACK_HALF_WIDTH = PLAYER_SIZE * Math.sin(Math.PI * 2 / 3);
const PLAYER_TRAIL_HALF_WIDTH = PLAYER_SIZE / 1.2;
const PLAYER_BOUNDS_PAD = PLAYER_SIZE * 1.5; // covers ship, trail width, save marker, stroke

// pre calculate the ship rendering :P
const PLAYER_TRIANGLE = [0, 1, 2].flatMap((k) => [...Vector2.rotate(PLAYER_SIZE, 0, (Math.PI * 2 / 3) * k)]);
const TRAIL_PALETTE = Array.from({ length: 360 }, (_, h) => `hsl(${h}, 100%, 80%)`);

class Player {
    constructor() {
        this.x = WORLD_WIDTH / 2;
        this.y = WORLD_HEIGHT / 2;
        this.speedX = 0;
        this.speedY = 0;
        this.rotation = 0;
        this.trail = [];
        this.trailColor = 0;
        this.savedX = null;
        this.savedY = null;
        this._bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    _back_point() {
        return Vector2.rotate(PLAYER_BACK_OFFSET, 0, this.rotation);
    }

    _move(loop) {
        this.x += this.speedX * loop.deltaTime;
        this.y += this.speedY * loop.deltaTime;
        this._face(loop);
        this._wrap();
    }

    _wrap() {
        const nx = Wrap.wrapX(this.x);
        const ny = Wrap.wrapY(this.y);
        const sx = nx - this.x;
        const sy = ny - this.y;
        if (sx === 0 && sy === 0) return;
        this.x = nx;
        this.y = ny;
        for (const p of this.trail) {
            p.x += sx;
            p.y += sy;
        }
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
        // we use raw canvas calls here because the trail is lowkey a little expensive to draw
        const trail = this.trail;
        if (trail.length < 2) return;

        const ctx = drawingContext;
        const hueBase = Math.floor(this.trailColor);
        ctx.save();
        ctx.lineWidth = 1;

        let a = trail[0];
        let sizeA = Easing.ease("linear", 0) * PLAYER_TRAIL_HALF_WIDTH; // could just lerp here but i was playing arounf with different looks
        for (let i = 0; i < trail.length - 1; i++) {
            const b = trail[i + 1];
            const sizeB = Easing.ease("linear", (i + 1) / PLAYER_TRAIL_LENGTH) * PLAYER_TRAIL_HALF_WIDTH;

            const color = TRAIL_PALETTE[(i * 7 + hueBase) % 360];
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(a.x + a.nx * sizeA, a.y + a.ny * sizeA);
            ctx.lineTo(b.x + b.nx * sizeB, b.y + b.ny * sizeB);
            ctx.lineTo(b.x - b.nx * sizeB, b.y - b.ny * sizeB);
            ctx.lineTo(a.x - a.nx * sizeA, a.y - a.ny * sizeA);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            a = b;
            sizeA = sizeB;
        }
        ctx.restore();
    }

    _draw_ship() {
        strokeWeight(2.5);
        fill("#fff0f9");
        stroke("#2b081d");
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        triangle(...PLAYER_TRIANGLE);
        fill("#2b081d");
        circle(PLAYER_SIZE / 4, 0, PLAYER_SIZE / 3);
        pop();
    }

    _compute_bounds() {
        const b = this._bounds;
        b.minX = b.maxX = this.x;
        b.minY = b.maxY = this.y;
        for (const p of this.trail) {
            if (p.x < b.minX) b.minX = p.x;
            else if (p.x > b.maxX) b.maxX = p.x;
            if (p.y < b.minY) b.minY = p.y;
            else if (p.y > b.maxY) b.maxY = p.y;
        }
        b.minX -= PLAYER_BOUNDS_PAD;
        b.minY -= PLAYER_BOUNDS_PAD;
        b.maxX += PLAYER_BOUNDS_PAD;
        b.maxY += PLAYER_BOUNDS_PAD;
        return b;
    }
    
    draw(dt) {
        this.trailColor = (this.trailColor + dt / 2) % 360;

        this._draw_warp_line();
        const b = this._compute_bounds();
        Wrap.forEachCopy(b.minX, b.minY, b.maxX, b.maxY, (ox, oy) => {
            push();
            translate(ox, oy);
            this._draw_trail();
            this._draw_ship();
            pop();
        });
        this._draw_warp_point();
    }

    _add_trail() {
        const [backX, backY] = this._back_point();

        this.trail.push({
            x: this.x + backX,
            y: this.y + backY,
            rot: this.rotation,
            nx: -Math.sin(this.rotation), // optimization :P
            ny: Math.cos(this.rotation),
        });
        if (this.trail.length > PLAYER_TRAIL_LENGTH) {
            this.trail.shift();
        }
    }

    _draw_warp_line() {
        if (!this._has_warp_point()) return;
        const dx = Wrap.deltaX(this.x, this.savedX);
        const dy = Wrap.deltaY(this.y, this.savedY);
        const x2 = this.x + dx;
        const y2 = this.y + dy;
        const pad = 4;
        Wrap.forEachCopy(
        Math.min(this.x, x2) - pad, Math.min(this.y, y2) - pad,
        Math.max(this.x, x2) + pad, Math.max(this.y, y2) + pad,
        (ox, oy) => {
            push();
            strokeWeight(3.5);
            translate(ox, oy)
            stroke("#00000020");
            drawingContext.setLineDash([10]);
            line(x2, y2, this.x, this.y);
            pop();
        })
    }

    _has_warp_point() {
        return !(this.savedX == null || this.savedY == null)
    }

    _draw_warp_point() {
        if (!this._has_warp_point()) return;
        const r = PLAYER_SIZE * 1.1 + 2;
        Wrap.forEachCopy(this.savedX - r, this.savedY - r, this.savedX + r, this.savedY + r, (ox, oy) => {
            push();
            strokeWeight(2.5);
            noFill();
            stroke("#2b081d");
            translate(this.savedX + ox, this.savedY + oy);
            circle(0, 0, PLAYER_SIZE);
            line(0, PLAYER_SIZE * 1.1, 0, -PLAYER_SIZE * 1.1);
            line(PLAYER_SIZE * 1.1, 0, -PLAYER_SIZE * 1.1, 0);
            pop();
        });
    }

    _warp() { // silly function because warp is one letter off from wrap.
        const dx = Wrap.deltaX(this.x, this.savedX);
        const dy = Wrap.deltaY(this.y, this.savedY);

        if (this.trail.length > PLAYER_TRAIL_LENGTH - 2) {
            this.trail.shift();
        }
        this.rotation = Vector2.angle(dx, dy);
        this._add_trail();
        [ this.speedX, this.speedY ] = Vector2.rotate(...Vector2.RIGHT, this.rotation);
        this.speedX *= PLAYER_WARP_SPEED_BOOST;
        this.speedY *= PLAYER_WARP_SPEED_BOOST;

        this.x += dx;
        this.y += dy;
        this.savedX = null;
        this.savedY = null;
        this._add_trail();
        this._wrap();
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
                this._warp();
            }
        }

        this._add_trail();
    }
}
