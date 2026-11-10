export const Draw = (() => {
    class Draw {
        constructor({
            width = window.innerWidth,
            height = window.innerHeight,
            init = function(drawLoop) {},
            draw = function(drawLoop) {},
            windowResized = function(drawLoop) {
                drawLoop.canvas.width = window.innerWidth
                drawLoop.canvas.height = window.innerHeight
            },
        } = {}) {   
            this.init = init;
            this.draw = draw;
            this.windowResized = windowResized;

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.deltaTime = 0;

            document.body.appendChild(this.canvas);

            this.canvas.width = width;
            this.canvas.height = height;

            let lastTimestamp = performance.now();
            const loop = (timestamp) => {
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
        create: (options) => new Draw(options),
        Class: Draw
    }
})();