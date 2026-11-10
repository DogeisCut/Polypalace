const Wrap = (() => {
    const mod = (v, size) => ((v % size) + size) % size;

    const wrapX = (x) => mod(x, WORLD_WIDTH);
    const wrapY = (y) => mod(y, WORLD_HEIGHT);

    function delta(from, to, size) {
        let d = (to - from) % size;
        if (d > size / 2) d -= size;
        else if (d < -size / 2) d += size;
        return d;
    }

    const deltaX = (from, to) => delta(from, to, WORLD_WIDTH);
    const deltaY = (from, to) => delta(from, to, WORLD_HEIGHT);

    function distanceSquared(x1, y1, x2, y2) {
        const dx = deltaX(x1, x2);
        const dy = deltaY(y1, y2);
        return dx * dx + dy * dy;
    }

    function forEachCopy(minX, minY, maxX, maxY, draw) {
        const i0 = Math.floor(-maxX / WORLD_WIDTH) + 1;
        const i1 = Math.ceil((WORLD_WIDTH - minX) / WORLD_WIDTH) - 1;
        const j0 = Math.floor(-maxY / WORLD_HEIGHT) + 1;
        const j1 = Math.ceil((WORLD_HEIGHT - minY) / WORLD_HEIGHT) - 1;
        for (let j = j0; j <= j1; j++) {
            for (let i = i0; i <= i1; i++) {
                draw(i * WORLD_WIDTH, j * WORLD_HEIGHT);
            }
        }
    }

    return { mod, wrapX, wrapY, delta, deltaX, deltaY, distanceSquared, forEachCopy };
})();
