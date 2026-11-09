const Vector2 = (() => {
    function _v(x, y) {
        const v = Object.create({
            *[Symbol.iterator]() {
                yield this.x;
                yield this.y;
            }
        })
        v.x = x
        v.y = y
        return Object.freeze(
            v
        )
    }

    function distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.hypot(dx, dy);
    }

    function distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    function dot(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    }

    function magnitude(x, y) {
        return Math.hypot(x, y);
    }

    function normalized(x, y) {
        const mag = magnitude(x,y);
        return _v(
            x / mag,
            y / mag,
        )
    }

    function angle(x, y) {
        return Math.atan2(y, x);
    }

    function lerp(x1, y1, x2, y2, t) {
        return _v(
            x1 + (x2 - x1) * t,
            y1 + (y2 - y1) * t
        );
    }

    function rotate(x, y, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return _v(
            x * cos - y * sin,
            x * sin + y * cos
        );
    }

    const ZERO = _v(0, 0);
    const UP = _v(0, -1);
    const DOWN = _v(0, 1);
    const LEFT = _v(-1, 0);
    const RIGHT = _v(1, 0);
    const ONE = _v(1, 1);
    const INF = _v(Infinity, Infinity);

    return {
        distance,
        distanceSquared,
        dot,
        magnitude,
        normalized,
        angle,
        lerp,
        rotate,

        ZERO,
        UP,
        DOWN,
        LEFT,
        RIGHT,
        ONE,
        INF,
    }
})();