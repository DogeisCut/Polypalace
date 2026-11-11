export const MathEx = (() => {
    const TAU = Math.PI * 2;

    /**
     * @param {number} start
     * @param {number} stop
     * @param {number} step
     * @returns {number[]}
     */
    function range(start, stop, step = 1) {
        // TODO: negative step
        return Array(Math.ceil((stop - start) / step))
            .fill(start)
            .map((x, y) => x + y * step);
    }

    /**
     * @param {number} min
     * @param {number} max
     */
    function randomFloat(min, max) {
        // TODO
    }

    return Object.freeze({
        TAU,

        range,
        randomFloat,
    });
})();
