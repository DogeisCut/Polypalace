/**
 * @typedef {InstanceType<typeof Loop.Class>} Looper
 */

export const Loop = (() => {
    class Looper {
        // type checker was being real annoying
        // aparently i have to define these up here to make it not assume these undefined
        accumulator = 0;
        timesUpdated = 0;
        time = 0;

        /**
         * @param {Object} [options]
         * @param {number} [options.fixedStep]
         * @param {number} [options.maxUpdates]
         * @param {(loop: Looper) => void} [options.update]
         */
        constructor({
            fixedStep = 1 / 60,
            maxUpdates = 4,
            update = () => {},
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

        /**
         * @param {number} dtSeconds
         */
        tick(dtSeconds) {
            this.accumulator += dtSeconds;

            this.timesUpdated = 0;
            while (this.accumulator >= this.fixedStep) {
                this.accumulator -= this.fixedStep;
                this.time += this.fixedStep;
                this.update(this);
                this.timesUpdated++;
                if (this.timesUpdated >= this.maxUpdates) {
                    this.accumulator = 0;
                    break;
                }
            }
        }
    }

    return {
        /** @param {ConstructorParameters<typeof Looper>[0]} [options] */
        create: (options) => new Looper(options),
        Class: Looper,
    };
})();
