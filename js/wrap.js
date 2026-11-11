import * as Config from "./config.js";

// TODO: move to some sort of Reusable World module

export const Wrap = (() => {
    /**
     * @param {number} v
     * @param {number} size
     */
    const mod = (v, size) => ((v % size) + size) % size;

    /** @param {number} x */
    const wrapX = (x) => mod(x, Config.WORLD_WIDTH);
    /** @param {number} y */
    const wrapY = (y) => mod(y, Config.WORLD_HEIGHT);

    let debug = false;

    /**
     * @param {number} from
     * @param {number} to
     * @param {number} size
     */
    function delta(from, to, size) {
        let d = (to - from) % size;
        if (d > size / 2) d -= size;
        else if (d < -size / 2) d += size;
        return d;
    }

    /**
     * @param {number} from
     * @param {number} to
     */
    const deltaX = (from, to) => delta(from, to, Config.WORLD_WIDTH);
    /**
     * @param {number} from
     * @param {number} to
     */
    const deltaY = (from, to) => delta(from, to, Config.WORLD_HEIGHT);

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    function distanceSquared(x1, y1, x2, y2) {
        const dx = deltaX(x1, x2);
        const dy = deltaY(y1, y2);
        return dx * dx + dy * dy;
    }

    /**
     * @param {number} minX
     * @param {number} minY
     * @param {number} maxX
     * @param {number} maxY
     * @param {(offsetX: number, offsetY: number) => void} draw
     */
    function forEachCopy(minX, minY, maxX, maxY, draw) {
        const i0 = Math.floor(-maxX / Config.WORLD_WIDTH) + 1;
        const i1 =
            Math.ceil((Config.WORLD_WIDTH - minX) / Config.WORLD_WIDTH) - 1;
        const j0 = Math.floor(-maxY / Config.WORLD_HEIGHT) + 1;
        const j1 =
            Math.ceil((Config.WORLD_HEIGHT - minY) / Config.WORLD_HEIGHT) - 1;

        // if (debug) {
        //     strokeWeight(1);
        //     fill("#004ef72d");
        //     stroke("#004ef7");
        //     rect(minX, minY, maxX - minX, maxY - minY)
        // }

        for (let j = j0; j <= j1; j++) {
            for (let i = i0; i <= i1; i++) {
                draw(i * Config.WORLD_WIDTH, j * Config.WORLD_HEIGHT);
            }
        }
    }

    /**
     * @param {boolean} to
     */
    function setDebug(to) {
        debug = to;
    }

    return {
        mod,
        wrapX,
        wrapY,
        delta,
        deltaX,
        deltaY,
        distanceSquared,
        forEachCopy,
        setDebug,
    };
})();
