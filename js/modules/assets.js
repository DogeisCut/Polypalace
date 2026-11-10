export const Assets = (() => {
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