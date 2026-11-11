import { Easing } from "./modules/easing.js";
import { Vector2 } from "./modules/vector.js";
import { Wrap } from "./wrap.js"
import { Input } from "./modules/input.js"
import { Sound } from "./modules/sound.js"
import * as Config from "./config.js"

/** @typedef {import("./modules/loop.js").Looper} Looper */
/** @typedef {import("./view.js").DrawLooper} DrawLooper */

/**
 * @typedef {Object} TrailPoint
 * @property {number} x
 * @property {number} y
 * @property {number} rot
 * @property {number} nx normal vector, x
 * @property {number} ny normal vector, y
 */

const PLAYER_SIZE = 15;
const PLAYER_TRAIL_LENGTH = 50;
const PLAYER_BACK_OFFSET = PLAYER_SIZE * Math.cos(Math.PI * 2 / 3);
const PLAYER_BACK_HALF_WIDTH = PLAYER_SIZE * Math.sin(Math.PI * 2 / 3);
const PLAYER_TRAIL_HALF_WIDTH = PLAYER_SIZE / 1.2;
const PLAYER_BOUNDS_PAD = PLAYER_SIZE * 1.5; // covers ship, trail width, save marker, stroke

const PLAYER_AOE_ACTIVATION_DISTANCE_SQUARED = Config.PLAYER_AOE_ACTIVATION_DISTANCE * Config.PLAYER_AOE_ACTIVATION_DISTANCE

// pre calculate the ship rendering :P
const PLAYER_TRIANGLE = [0, 1, 2].flatMap((k) => [...Vector2.rotate(PLAYER_SIZE, 0, (Math.PI * 2 / 3) * k)]);
const TRAIL_PALETTE = Array.from({ length: 360 }, (_, h) => `hsl(${h}, 100%, 80%)`);
const TRAIL_PALETTE_LENGTH  = TRAIL_PALETTE.length;

export class Player {
    constructor() {
        this.x = Config.WORLD_WIDTH / 2;
        this.y = Config.WORLD_HEIGHT / 2;

        this.speedX = 0;
        this.speedY = 0;

        this.rotation = 0;

        /** @type {TrailPoint[]} */
        this.trail = [];
        this.trailColor = 0;

        /** @type {number | null} */
        this.savedX = null;
        /** @type {number | null} */
        this.savedY = null;

        this.iframesTimestamp = 0;

        this.aoeCooldownTimestamp = 0;

        this._bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    _back_point() {
        return Vector2.rotate(PLAYER_BACK_OFFSET, 0, this.rotation);
    }

    /**
     * @param {Looper} loop
     */
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

    /**
     * @param {Looper} loop
     */
    _face(loop) {
        if (Math.abs(this.speedX) > Number.EPSILON || Math.abs(this.speedY) > Number.EPSILON) {
            const targetRotation = Vector2.angle(this.speedX, this.speedY);
            
            let diff = targetRotation - this.rotation;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            const timeConstant = Easing.settleSecondsToTimeConstant(Config.PLAYER_TURN_SPEED);
            this.rotation += diff * Easing.dampFactor(loop.deltaTime, timeConstant);
        }
    }

    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    _draw_trail(ctx) {
        const trail = this.trail;
        if (trail.length < 2) return;

        const hueBase = Math.floor(this.trailColor);
        ctx.save();
        ctx.lineWidth = 1;

        let a = trail[0];
        let sizeA = Easing.ease("linear", 0) * PLAYER_TRAIL_HALF_WIDTH; // could just lerp here but i was playing arounf with different looks
        for (let i = 0; i < trail.length - 1; i++) {
            const b = trail[i + 1];
            const sizeB = Easing.ease("linear", (i + 1) / PLAYER_TRAIL_LENGTH) * PLAYER_TRAIL_HALF_WIDTH;

            const color = TRAIL_PALETTE[(i * 7 + hueBase) % TRAIL_PALETTE_LENGTH];
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

    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    _draw_ship(ctx) {
        // triangle
        ctx.lineWidth = 2.5;
        ctx.fillStyle = "#fff0f9";
        ctx.strokeStyle = "#2b081d";
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(PLAYER_TRIANGLE[0], PLAYER_TRIANGLE[1]);
        ctx.lineTo(PLAYER_TRIANGLE[2], PLAYER_TRIANGLE[3]);
        ctx.lineTo(PLAYER_TRIANGLE[4], PLAYER_TRIANGLE[5]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // circle eye thingy
        ctx.beginPath();
        ctx.arc(PLAYER_SIZE / 4, 0, PLAYER_SIZE / 4, 0, Math.PI * 2)
        ctx.fillStyle = "#2b081d";
        ctx.fill();
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

    /**
     * @param {DrawLooper} loop
     */
    draw(loop) {
        const ctx = loop.ctx
        const dt = loop.deltaTime
        this.trailColor = (this.trailColor + dt * 600) % TRAIL_PALETTE_LENGTH;

        this._draw_warp_line(loop);
        const b = this._compute_bounds();
        Wrap.forEachCopy(b.minX, b.minY, b.maxX, b.maxY, (ox, oy) => {
            ctx.save();
            ctx.translate(ox, oy);
            this._draw_trail(ctx);
            this._draw_ship(ctx);
            ctx.restore();
        });
        this._draw_warp_point(loop);
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

    /**
     * @param loop {DrawLooper}
     */
    _draw_warp_line(loop) {
        if (!this._has_warp_point()) return;
        const ctx = loop.ctx
        const { savedX, savedY } = this;

        const dx = Wrap.deltaX(this.x, savedX);
        const dy = Wrap.deltaY(this.y, savedY);
        const x2 = this.x + dx;
        const y2 = this.y + dy;
        const pad = 4;

        if (Wrap.distanceSquared(this.x, this.y, savedX, savedY) > PLAYER_AOE_ACTIVATION_DISTANCE_SQUARED) {
            Wrap.forEachCopy(
                Math.min(this.x, x2) - pad - Config.PLAYER_AOE_ACTIVATION_DISTANCE, Math.min(this.y, y2) - pad - Config.PLAYER_AOE_ACTIVATION_DISTANCE,
                Math.max(this.x, x2) + pad + Config.PLAYER_AOE_ACTIVATION_DISTANCE, Math.max(this.y, y2) + pad + Config.PLAYER_AOE_ACTIVATION_DISTANCE,
            (ox, oy) => {
                ctx.save();
                ctx.lineWidth = 3.5;
                ctx.translate(ox, oy)
                ctx.strokeStyle = "#00000020";
                ctx.setLineDash([10]);
                ctx.beginPath();
                ctx.moveTo(x2, y2);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();

                ctx.restore();
            })
        } else {
            Wrap.forEachCopy(
                Math.min(this.x, x2) - pad - Config.PLAYER_AOE_ACTIVATION_DISTANCE, Math.min(this.y, y2) - pad - Config.PLAYER_AOE_ACTIVATION_DISTANCE,
                Math.max(this.x, x2) + pad + Config.PLAYER_AOE_ACTIVATION_DISTANCE, Math.max(this.y, y2) + pad + Config.PLAYER_AOE_ACTIVATION_DISTANCE,
            (ox, oy) => {
                ctx.save();

                ctx.lineWidth = 3.5;
                ctx.translate(ox, oy)
                ctx.strokeStyle = "#00000020";
                ctx.setLineDash([10]);
                ctx.beginPath();
                ctx.translate(x2, y2)
                ctx.rotate(loop.timestamp / 500)
                ctx.arc(0, 0, Config.PLAYER_AOE_ACTIVATION_DISTANCE, 0, Math.PI * 2)
                ctx.stroke();

                ctx.restore();
            })
        }
    }

    /**
     * @returns {this is this & { savedX: number, savedY: number }}
     */
    _has_warp_point() {
        return !(this.savedX == null || this.savedY == null)
    }

    /**
     * @param loop {DrawLooper}
     */
    _draw_warp_point(loop) {
        if (!this._has_warp_point()) return;
        const { savedX, savedY } = this;
        const ctx = loop.ctx;

        const r = PLAYER_SIZE * 1.1 + 2;
        Wrap.forEachCopy(savedX - r, savedY - r, savedX + r, savedY + r, (ox, oy) => {
            ctx.save();

            // base
            ctx.lineWidth = 2.5;
            ctx.fillStyle = "#fff0f9"
            ctx.strokeStyle = "#2b081d"
            ctx.translate(savedX + ox, savedY + oy);
            ctx.beginPath();
            ctx.arc(0, 0, PLAYER_SIZE / 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // center
            ctx.beginPath();
            ctx.fillStyle = TRAIL_PALETTE[Math.floor((loop.timestamp / 10) % TRAIL_PALETTE_LENGTH)];
            ctx.arc(0, 0, PLAYER_SIZE / 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        });
    }

    /**
     * @param {Looper} loop
     * @param {number} savedX
     * @param {number} savedY
     */
    _warp(loop, savedX, savedY) { // silly function because warp is one letter off from wrap.
        const pitchScale = Math.random() * 0.4 + 0.8
        Sound.play("warp_use", {
            volume: 0.25,
            pan: this._get_player_sound_panning(),
            bus: "sfx",
            pitchScale,
        });

        const dx = Wrap.deltaX(this.x, savedX);
        const dy = Wrap.deltaY(this.y, savedY);

        if (this.trail.length > PLAYER_TRAIL_LENGTH - 2) {
            this.trail.shift();
        }
        this.rotation = Vector2.angle(dx, dy);
        this._add_trail();
        [ this.speedX, this.speedY ] = Vector2.rotate(Vector2.RIGHT.x, Vector2.RIGHT.y, this.rotation);
        this.speedX *= Config.PLAYER_WARP_SPEED_BOOST;
        this.speedY *= Config.PLAYER_WARP_SPEED_BOOST;

        this.x += dx;
        this.y += dy;
        this.savedX = null;
        this.savedY = null;
        this._add_trail();
        this._wrap();

        this.iframesTimestamp = loop.time + Config.PLAYER_DASH_I_FRAMES_SECONDS;

        Sound.play("warp_use", {
            volume: 0.25,
            pan: this._get_player_sound_panning(),
            bus: "sfx",
            pitchScale,
        });
    }

    _get_player_sound_panning() {
        return Easing.lerp(-1, 1, this.x/Config.WORLD_WIDTH) / 2.0
    }

    /**
     * @param {Looper} loop
     * @param {number} x
     * @param {number} y
     */
    _aoe_attack(loop, x, y) {
        this.savedX = null
        this.savedY = null
        this.aoeCooldownTimestamp = loop.time + Config.PLAYER_AOE_COOLDOWN_SECONDS;
        Sound.play("aoe_attack", {
            volume: 0.5,
            pan: this._get_player_sound_panning(),
            bus: "sfx",
            pitchScale: Math.random() * 0.4 + 0.8,
        });
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    _place_warp(x, y) {
        this.savedX = x
        this.savedY = y
        Sound.play("warp_place", {
            volume: 0.5,
            pan: this._get_player_sound_panning(),
            bus: "sfx",
            pitchScale: Math.random() * 0.4 + 0.8,
        });
    }

    /**
     * 
     * @param {Looper} loop
     */
    _off_aoe_cooldown(loop) {
        return loop.time > this.aoeCooldownTimestamp
    }

    /**
     * @param {Looper} loop
     */
    tick(loop) {
        const moveX = Number(Input.is_action_down("right")) - Number(Input.is_action_down("left"));
        const moveY = Number(Input.is_action_down("down")) - Number(Input.is_action_down("up"));
        const length = Vector2.magnitude(moveX, moveY);
        const targetX = (moveX / length) * Config.PLAYER_MOVE_SPEED;
        const targetY = (moveY / length) * Config.PLAYER_MOVE_SPEED;
        if ((Math.abs(moveX) >= Number.EPSILON || Math.abs(moveY) >= Number.EPSILON) && this._off_aoe_cooldown(loop)) {
            [ this.speedX, this.speedY ] = Vector2.lerp(this.speedX, this.speedY, targetX, targetY, 1 - Math.pow(Config.PLAYER_ACCEL, loop.deltaTime))
        } else {
            [ this.speedX, this.speedY ] = Vector2.lerp(this.speedX, this.speedY, Vector2.ZERO.x, Vector2.ZERO.y, 1 - Math.pow(Config.PLAYER_DECEL, loop.deltaTime))
        }
        this._move(loop);

        if (Input.was_action_just_pressed("warp") && this._off_aoe_cooldown(loop)) {
            if (this._has_warp_point()) {
                if (Wrap.distanceSquared(this.x, this.y, this.savedX, this.savedY) > PLAYER_AOE_ACTIVATION_DISTANCE_SQUARED) {
                    this._warp(loop, this.savedX, this.savedY);
                } else {
                    this._aoe_attack(loop, this.savedX, this.savedY);
                }
            } else {
                this._place_warp(this.x, this.y)
            }
        }

        this._add_trail();
    }
}
