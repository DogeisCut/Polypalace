const Assets = (() => {
    const cache = new Map();

    async function load(name, url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`[assets]: failed to fetch ${url}`);
        const buffer = await response.arrayBuffer();
        cache.set(name, buffer);
        return buffer;
    }

    function get(name) {
        return cache.get(name);
    }

    return { load, get };
})();

const Sound = (() => {
    let ctx = null;
    const buffers = new Map();
    const busses = new Map();


    // TODO: splash screen
    function unlock() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            create_bus("master", ctx.destination);
        }
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    async function load(name, url) {
        try {
            unlock();
            const rawData = await Assets.load(name, url);
            const audioBuffer = await ctx.decodeAudioData(rawData.slice(0));
            buffers.set(name, audioBuffer);
        } catch (error) {
            console.error(`[sound]: failed to load sound ${name} (${url}):`, error)
        }
    }

    function create_bus(name, destination = "master") {
        if (busses.has(name)) {
            throw new Error(`[sound]: bus ${name} already exists`)
        }

        if (typeof destination === "string") {
            destination = get_bus(destination)
        }

        const gainNode = ctx.createGain()
        gainNode.connect(destination)
        busses.set(name, gainNode)
    }

    function get_bus(name) {
        if (!busses.has(name)) {
            throw new Error(`[sound]: no such bus ${name} exists`)
        }
        return busses.get(name)
    }

    function set_bus_volume(name, volume) {
        if (!busses.has(name)) {
            throw new Error(`[sound]: no such bus ${name} exists`)
        }
        busses.get(name).gain.value = volume;
    }

    function connect_bus(from, to) {
        if (!busses.has(from)) {
            throw new Error(`[sound]: no such source bus ${from} exists`)
        }
        if (!busses.has(to)) {
            throw new Error(`[sound]: no such destination bus ${to} exists`)
        }
        //TODO
    }

    function play(name, {
        loop = false,
        volume = 1.0,
        pitchScale = 1.0,
        pan = 0.0,
        bus = "master",
    } = {}) {
        if (!ctx || !buffers.has(name)) return;

        if (typeof bus === "string") {
            bus = get_bus(bus)
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffers.get(name);
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