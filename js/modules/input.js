/**
 * @typedef {Array<Object> & { deadzone: number }} ActionArray
 */

/**
 * @typedef {Object} ActionEvent
 * @property {true} is_event
 */

/**
 * @typedef {string} ActionName
 */


export const Input = (() => {
    const actions = new Map()
    const action_states = new Map()
    const last_action_states = new Map()

    const active_hardware = new Set();

    window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        active_hardware.add(`keyboard:${e.code}`);
    });

    window.addEventListener('keyup', (e) => {
        active_hardware.delete(`keyboard:${e.code}`);
    });

    window.addEventListener('mousedown', (e) => {
        active_hardware.add(`mouse:${e.button}`);
    });

    window.addEventListener('mouseup', (e) => {
        active_hardware.delete(`mouse:${e.button}`);
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('blur', () => active_hardware.clear());

    const _eventProto = Object.create(null);
    _eventProto.is_event = true;

    /**
     * @param {string} type
     */
    function _device(type) {
        const _deviceProto = Object.create(_eventProto);
        _deviceProto.device = type;

        /**
         * 
         * @param {string | number} code 
         * @returns {ActionEvent}
         */
        const func = function(code) {
            let device = Object.create(_deviceProto);
            device.code = code;
            return Object.freeze(device);
        }
        return func
    }

    const _key = _device("keyboard")
    const _mouse = _device("mouse")
    const _mouse_wheel = _device("mouse_wheel")
    const _joy = _device("joy")

    // Ideally we'd have physical key support, control combos, and such like godot, but thats for super later.

    const Key = Object.freeze({
        ESCAPE: _key('Escape'),
        ENTER: _key('Enter'),
        SPACE: _key('Space'),
        TAB: _key('Tab'),
        BACKSPACE: _key('Backspace'),
        
        SHIFT: _key('ShiftLeft'), // shift exists on both sides. TODO: figure out how to handle this later
        CTRL: _key('ControlLeft'),
        ALT: _key('AltLeft'),

        UP: _key('ArrowUp'),
        DOWN: _key('ArrowDown'),
        LEFT: _key('ArrowLeft'),
        RIGHT: _key('ArrowRight'),

        KEY_A: _key('KeyA'),
        KEY_B: _key('KeyB'),
        KEY_C: _key('KeyC'),
        KEY_D: _key('KeyD'),
        KEY_E: _key('KeyE'),
        KEY_F: _key('KeyF'),
        KEY_G: _key('KeyG'),
        KEY_H: _key('KeyH'),
        KEY_I: _key('KeyI'),
        KEY_J: _key('KeyJ'),
        KEY_K: _key('KeyK'),
        KEY_L: _key('KeyL'),
        KEY_M: _key('KeyM'),
        KEY_N: _key('KeyN'),
        KEY_O: _key('KeyO'),
        KEY_P: _key('KeyP'),
        KEY_Q: _key('KeyQ'),
        KEY_R: _key('KeyR'),
        KEY_S: _key('KeyS'),
        KEY_T: _key('KeyT'),
        KEY_U: _key('KeyU'),
        KEY_V: _key('KeyV'),
        KEY_W: _key('KeyW'),
        KEY_X: _key('KeyX'),
        KEY_Y: _key('KeyY'),
        KEY_Z: _key('KeyZ'),

        NUM_0: _key('Digit0'),
        NUM_1: _key('Digit1'),
        NUM_2: _key('Digit2'),
        NUM_3: _key('Digit3'),
        NUM_4: _key('Digit4'),
        NUM_5: _key('Digit5'),
        NUM_6: _key('Digit6'),
        NUM_7: _key('Digit7'),
        NUM_8: _key('Digit8'),
        NUM_9: _key('Digit9'),
    });

    const Mouse = Object.freeze({
        LEFT: _mouse(0),
        RIGHT: _mouse(2),
        MIDDLE: _mouse(1),
        XBUTTON1: _mouse(3),
        XBUTTON2: _mouse(4),
        WHEEL_UP: _mouse_wheel("up"),
        WHEEL_DOWN: _mouse_wheel("down"),
        WHEEL_LEFT: _mouse_wheel("left"),
        WHEEL_RIGHT: _mouse_wheel("right"),
    });

    const Joy = Object.freeze({
        // TODO LATER
    });

    /**
     * @param {ActionName} name
     */
    function add_action(name, deadzone = 0.2) {
        if (actions.has(name)) {
            throw new Error(`[input]: action ${name} already exists`)
        }
        /**
         * @type {ActionArray}
         */
        // @ts-ignore
        let arr = []
        arr.deadzone = deadzone
        actions.set(name, arr)
        action_states.set(name, false)
        last_action_states.set(name, false)
    }

    /**
     * @param {ActionName} action
     * @param {number} deadzone
     */
    function set_deadzone(action, deadzone) {
        if (!actions.has(action)) {
            throw new Error(`[input]: no such action ${action} found`)
        }
        actions.get(action).deadzone = deadzone
    }

    /**
     * @param {ActionName} action
     * @param {ActionEvent} event
     */
    function add_event(action, event) {
        if (!actions.has(action)) {
            throw new Error(`[input]: no such action ${action} found`)
        }
        if (!event || !event.is_event) {
            throw new Error(`[input]: invalid event ${event} provided for ${action}, make sure you are using Input.Key, Input.Mouse, or Input.Joy`)
        }
        actions.get(action).push(event);
    }

    /**
     * @param {ActionName} action
     */
    function was_action_just_pressed(action) {
        if (!actions.has(action)) {
            throw new Error(`[input]: no such action ${action} found`)
        }
        return action_states.get(action) && !last_action_states.get(action);
    }

    /**
     * @param {ActionName} action
     */
    function was_action_just_released(action) {
        if (!actions.has(action)) {
            throw new Error(`[input]: no such action ${action} found`)
        }
        return !action_states.get(action) && last_action_states.get(action);
    }

    /**
     * @param {ActionName} action
     */
    function is_action_down(action) {
        if (!actions.has(action)) {
            throw new Error(`[input]: no such action ${action} found`)
        }
        return action_states.get(action);
    }

    function update() {
        actions.forEach((events, action) => {
            last_action_states.set(action, action_states.get(action));

            let is_down = false;
            for (const event of events) {
                const key_string = `${event.device}:${event.code}`
                if (active_hardware.has(key_string)) {
                    is_down = true;
                    break;
                }
            }
            action_states.set(action, is_down);
        })
    }

    return {
        update,

        Key,
        Mouse,
        
        add_action,
        set_deadzone,
        add_event,

        was_action_just_pressed,
        was_action_just_released,
        is_action_down
    }
})();