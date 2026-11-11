
/** @typedef {import("./loop.js").Looper} Looper */
/** @typedef {import("./draw.js").DrawLooper} DrawLooper */


export const World = (() => {
    class World {
        
    }

    class Entity {
        constructor() {
        }

        /**
         * @abstract
         * @param {DrawLooper} loop
         */
        draw(loop) {}

        /**
         * @abstract
         * @param {Looper} loop
         */
        update(loop) {}
    }
    return {
        Entity
    };
})();
