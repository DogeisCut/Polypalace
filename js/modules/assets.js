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

    // TODO: splash screen
    function unlock() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
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
            console.error(`Failed to load sound ${name} (${url}):`, error)
        }
    }

    function play(name) {
        if (!ctx || !buffers.has(name)) return;
        
        const source = ctx.createBufferSource();
        source.buffer = buffers.get(name);
        source.connect(ctx.destination);
        source.start(0);
    }

    return { load, play, unlock };
})();