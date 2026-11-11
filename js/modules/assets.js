export const Assets = (() => {
    const cache = new Map();

    /**
     * @param {string} name
     * @param {RequestInfo | URL} url
     */
    async function load(name, url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`[assets]: failed to fetch ${url}`);
        const buffer = await response.arrayBuffer();
        cache.set(name, buffer);
        return buffer;
    }

    /**
     * @param {string} name
     */
    function get(name) {
        return cache.get(name);
    }

    return { load, get };
})();
