import { Assets } from "./assets.js";

/**
 * @typedef {AudioNode | string} SoundBus
 */

export const Sound = (() => {
    /** @type {AudioContext | null} */
    let ctx = null;
    /** @type {Map<string, AudioBuffer>} */
    const buffers = new Map();
    /** @type {Map<string, GainNode>} */
    const busses = new Map();

    /**
     * @returns {AudioContext}
     */
    function _require_ctx() {
        if (!ctx) {
            throw new Error(
                `[sound]: audio context doesn't exist yet, call Sound.unlock() first`,
            );
        }
        return ctx;
    }

    // TODO: splash screen
    /**
     * @returns {AudioContext}
     */
    function unlock() {
        if (!ctx) {
            const AudioContextClass =
                window.AudioContext ||
                /** @type {any} */ (window).webkitAudioContext;
            ctx = new AudioContextClass();
            create_bus("master", ctx.destination);
        }
        if (ctx.state === "suspended") {
            ctx.resume();
        }
        return ctx;
    }

    /**
     * @param {string} name
     * @param {RequestInfo | URL} url
     */
    async function load(name, url) {
        try {
            const audioCtx = unlock();
            const rawData = await Assets.load(name, url);
            const audioBuffer = await audioCtx.decodeAudioData(
                rawData.slice(0),
            );
            buffers.set(name, audioBuffer);
        } catch (error) {
            console.error(
                `[sound]: failed to load sound ${name} (${url}):`,
                error,
            );
        }
    }

    /**
     * @param {string} name
     * @param {SoundBus} [destination]
     */
    function create_bus(name, destination = "master") {
        if (busses.has(name)) {
            throw new Error(`[sound]: bus ${name} already exists`);
        }

        if (typeof destination === "string") {
            destination = get_bus(destination);
        }

        const gainNode = _require_ctx().createGain();
        gainNode.connect(destination);
        busses.set(name, gainNode);
    }

    /**
     * @param {string} name
     * @returns {GainNode}
     */
    function get_bus(name) {
        const bus = busses.get(name);
        if (!bus) {
            throw new Error(`[sound]: no such bus ${name} exists`);
        }
        return bus;
    }

    /**
     * @param {string} name
     * @param {number} volume
     */
    function set_bus_volume(name, volume) {
        get_bus(name).gain.value = volume;
    }

    /**
     * @param {string} from
     * @param {string} to
     */
    function connect_bus(from, to) {
        if (!busses.has(from)) {
            throw new Error(`[sound]: no such source bus ${from} exists`);
        }
        if (!busses.has(to)) {
            throw new Error(`[sound]: no such destination bus ${to} exists`);
        }
        //TODO
    }

    /**
     * @param {string} name
     * @param {Object} [options]
     * @param {boolean} [options.loop]
     * @param {number} [options.volume]
     * @param {number} [options.pitchScale]
     * @param {number} [options.pan]
     * @param {SoundBus} [options.bus]
     */
    function play(
        name,
        {
            loop = false,
            volume = 1.0,
            pitchScale = 1.0,
            pan = 0.0,
            bus = "master",
        } = {},
    ) {
        const buffer = buffers.get(name);
        if (!ctx || !buffer) return;

        if (typeof bus === "string") {
            bus = get_bus(bus);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.playbackRate.value = pitchScale;

        const panner = ctx.createStereoPanner();
        panner.pan.value = pan;

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(panner);
        panner.connect(gainNode);

        gainNode.connect(bus);

        source.start(0);
    }

    return { load, play, unlock, create_bus, get_bus, set_bus_volume };
})();
