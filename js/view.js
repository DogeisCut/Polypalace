import * as Config from "./config.js"

export const View = (() => {
    const BAR_COLOR = "#1a1a1a";
    let _scale = 1;
    let _offsetX = 0;
    let _offsetY = 0;

    function resize() {
        _scale = Math.min(width / Config.WORLD_WIDTH, height / Config.WORLD_HEIGHT);
        _offsetX = Math.floor((width - Config.WORLD_WIDTH * _scale) / 2);
        _offsetY = Math.floor((height - Config.WORLD_HEIGHT * _scale) / 2);
    }

    function begin() {
        background(BAR_COLOR);
        push();
        translate(_offsetX, _offsetY);
        scale(_scale);
        push();
        noStroke();
        fill(255);
        rect(0, 0, Config.WORLD_WIDTH, Config.WORLD_HEIGHT);
        pop();
    }

    function end() {
        pop();
        push();
        noStroke();
        fill(BAR_COLOR);
        const right = _offsetX + Config.WORLD_WIDTH * _scale;
        const bottom = _offsetY + Config.WORLD_HEIGHT * _scale;
        if (_offsetX > 0) {
            rect(0, 0, _offsetX, height);
            rect(right, 0, width - right, height);
        }
        if (_offsetY > 0) {
            rect(0, 0, width, _offsetY);
            rect(0, bottom, width, height - bottom);
        }
        pop();
    }

    function toWorld(screenX, screenY) {
        return [(screenX - _offsetX) / _scale, (screenY - _offsetY) / _scale];
    }

    return { resize, begin, end, toWorld, get scale() { return _scale; } };
})();
