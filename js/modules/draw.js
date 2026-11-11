import { MathEx } from "./mathExpansion";

/**
 * @typedef {InstanceType<typeof Draw.Class>} DrawLooper
 */

export const Draw = (() => {    
    /**
     * @type {Map<number, [number, number][]>}
     */
    const polygonCache = new Map()
    
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

            this.timestamp = performance.now();

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

            const loop = (/** @type {number} */ timestamp) => {
                this.deltaTime = (timestamp - this.timestamp) / 1000;
                this.timestamp = timestamp;

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

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     */
    function circle(ctx, x, y, radius) {
        ctx.arc(x, y, radius, 0, MathEx.TAU)
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {[number, number][]} points
     */
    function points(ctx, points) {
        if (points.length < 2) {
            throw Error("[draw]: tried to draw less than 2 points")
        }
        const firstPoint = points[0]
        const [ firstPointX, firstPointY ] = firstPoint 
        ctx.moveTo(firstPointX, firstPointY);
        const otherPoints = points.splice(1);
        otherPoints.forEach(([x, y]) => {
            ctx.lineTo(x, y);
        })
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {number} sides
     */
    function poly(ctx, x, y, radius, sides) {
        //MathEx.range()
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} innerRadius
     * @param {number} outerRadius
     * @param {number} sides
     */
    function star(ctx, x, y, innerRadius, outerRadius, sides) {

    }

    return {
        /** @param {ConstructorParameters<typeof DrawLooper>[0]} [options] */
        create: (options) => new DrawLooper(options),
        Class: DrawLooper,

        circle,
        points,
        poly,
        star,
    }
})();