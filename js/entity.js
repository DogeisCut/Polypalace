
/** @typedef {import("./modules/loop.js").Looper} Looper */
/** @typedef {import("./view.js").DrawLooper} DrawLooper */

export class Entity {
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