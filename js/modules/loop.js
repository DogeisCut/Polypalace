export const Loop = (() => {
    class Loop {
        constructor({
            fixedStep = 1 / 60,
            maxUpdates = 4,
            update = function(loop) {},
        } = {}) {
            this.fixedStep = fixedStep;
            this.deltaTime = fixedStep; // Temp until i get some actual calculations
            this.update = update;
            this.maxUpdates = maxUpdates;
            this.reset();
        }

        reset() {
            this.accumulator = 0;
            this.timesUpdated = 0;
            this.time = 0;
        }
        
        tick(dtSeconds) {
            this.accumulator += dtSeconds

            this.timesUpdated = 0;
            while(this.accumulator >= this.fixedStep) {
                this.accumulator -= this.fixedStep;
                this.time += this.fixedStep;
                this.update(this);
                this.timesUpdated++;
                if (this.timesUpdated > this.maxUpdates) {
                    this.accumulator = 0;
                    break;
                }
            }
        }

    }

    return {
        create: (options) => new Loop(options),
        Class: Loop
    }
})();