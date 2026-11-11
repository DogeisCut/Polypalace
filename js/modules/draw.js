/**
 * @typedef {InstanceType<typeof Draw.Class>} DrawLooper
 */

export const Draw = (() => {
    class DrawLooper {
        /**
         * @param {Object} [options]
         * @param {number} [options.width]
         * @param {number} [options.height]
         * @param {(drawLoop: DrawLooper) => void} [options.init]
         * @param {(drawLoop: DrawLooper) => void} [options.draw]
         * @param {(drawLoop: DrawLooper) => void} [options.windowResized]
         */
        constructor({
            width = window.innerWidth,
            height = window.innerHeight,
            init = () => {},
            draw = () => {},
            windowResized = (drawLoop) => {
                drawLoop.canvas.width = window.innerWidth
                drawLoop.canvas.height = window.innerHeight
            },
        } = {}) {   
            this.init = init;
            this.draw = draw;
            this.windowResized = windowResized;

            this.canvas = document.createElement('canvas');
            const ctx = this.canvas.getContext('2d');
            if (!ctx) {
                throw new Error("[draw]: couldn't get a 2d canvas context")
            }
            this.ctx = ctx;
            this.deltaTime = 0;

            document.body.appendChild(this.canvas);

            this.canvas.width = width;
            this.canvas.height = height;

            let lastTimestamp = performance.now();
            const loop = (/** @type {number} */ timestamp) => {
                this.deltaTime = (timestamp - lastTimestamp) / 1000;
                lastTimestamp = timestamp;

                this.draw(this);
                window.requestAnimationFrame(loop);
            }
            window.requestAnimationFrame(loop);

            window.addEventListener("resize", (event) => {
                this.windowResized(this)
            })

            this.init(this);
        }
    }
    return {
        /** @param {ConstructorParameters<typeof DrawLooper>[0]} [options] */
        create: (options) => new DrawLooper(options),
        Class: DrawLooper
    }
})();