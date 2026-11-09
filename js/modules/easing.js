const Easing = (() => {
    const TAU = Math.PI * 2;

    const QUARTER_CYCLE = 0.25;
    const HALF_CYCLE = 0.5;
    const CLASSIC_BACK_OVERSHOOT = 1.70158;
    const CLASSIC_ELASTIC_PERIOD = 0.3;
    const REBOUND_DURATION_RATIO = 0.5;
    const REBOUND_DEPTH_RATIO = 0.25;
    const SETTLED_REMAINING_FRACTION = 0.01;
    const TIME_CONSTANTS_TO_SETTLE = -Math.log(SETTLED_REMAINING_FRACTION);

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    const clamp01 = (value) => clamp(value, 0, 1);

    const lerp = (from, to, t) => from + (to - from) * t;

    function progress(value, start, end) {
        if (start === end) return value < start ? 0 : 1;
        return clamp01((value - start) / (end - start));
    }

    function wrap(value, period = 1) {
        const remainder = value % period;
        const wrapped = remainder < 0 ? remainder + period : remainder;
        const roundedUpToPeriod = wrapped >= period;
        return roundedUpToPeriod ? 0 : wrapped;
    }

    const fract = (value) => wrap(value, 1);

    const toBipolar = (unit) => unit * 2 - 1;

    const toUnit = (bipolar) => (bipolar + 1) / 2;

    const phaseFromTime = (seconds, hertz = 1, offsetCycles = 0) => seconds * hertz + offsetCycles;

    function resolveCurve(curveOrName) {
        const curve = curveOrName ?? "linear";
        if (typeof curve === "function") return curve;
        const named = curves[curve];
        if (!named) throw new Error(`[easing]: unknown curve "${String(curve)}"`);
        return named;
    }

    function mirror(curveOrName) {
        const curve = resolveCurve(curveOrName);
        return (t) => 1 - curve(1 - t);
    }

    function mirrorInOut(curveOrName) {
        const curve = resolveCurve(curveOrName);
        return (t) => (t < HALF_CYCLE ? curve(2 * t) / 2 : 1 - curve(2 - 2 * t) / 2);
    }

    function reverseInput(curveOrName) {
        const curve = resolveCurve(curveOrName);
        return (t) => curve(1 - t);
    }

    const backIn =
        (overshoot = CLASSIC_BACK_OVERSHOOT) =>
        (t) =>
            t * t * ((overshoot + 1) * t - overshoot);

    const elasticIn =
        (period = CLASSIC_ELASTIC_PERIOD) =>
        (t) => {
            if (t === 0 || t === 1) return t;
            const phaseShift = period / 4;
            const decay = 2 ** (10 * (t - 1));
            const wobble = Math.sin(((t - 1 - phaseShift) * TAU) / period);
            return -decay * wobble;
        };

    function makeBounceOut(rebounds = 3) {
        const initialFall = { endTime: 1, centerTime: 0, halfDuration: 1, depth: 1 };
        const arcs = [initialFall];
        let elapsed = initialFall.endTime;

        for (let rebound = 0; rebound < rebounds; rebound++) {
            const duration = REBOUND_DURATION_RATIO ** rebound;
            arcs.push({
                endTime: elapsed + duration,
                centerTime: elapsed + duration / 2,
                halfDuration: duration / 2,
                depth: REBOUND_DEPTH_RATIO ** (rebound + 1),
            });
            elapsed += duration;
        }

        const totalDuration = elapsed;

        return (t) => {
            const time = t * totalDuration;
            const arc = arcs.find((candidate) => time <= candidate.endTime);
            if (!arc) return 1;
            const offsetFromCenter = (time - arc.centerTime) / arc.halfDuration;
            return 1 - arc.depth + arc.depth * offsetFromCenter * offsetFromCenter;
        };
    }

    const powerCurve = (exponent) => (t) => t ** exponent;

    const CURVE_FAMILIES = {
        quad: { easeIn: powerCurve(2) },
        cubic: { easeIn: powerCurve(3) },
        quart: { easeIn: powerCurve(4) },
        quint: { easeIn: powerCurve(5) },
        sine: { easeIn: (t) => 1 - Math.cos((t * Math.PI) / 2) },
        expo: { easeIn: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)) },
        circ: { easeIn: (t) => 1 - Math.sqrt(1 - t * t) },
        back: { easeIn: backIn() },
        elastic: { easeIn: elasticIn() },
        bounce: { easeOut: makeBounceOut() },
    };

    const builtCurves = {
        linear: (t) => t,
        smoothstep: (t) => t * t * (3 - 2 * t),
        smootherstep: (t) => t * t * t * (t * (6 * t - 15) + 10),
        hump: (t) => Math.sin(Math.PI * t),
    };

    for (const [familyName, shapes] of Object.entries(CURVE_FAMILIES)) {
        const suffix = familyName[0].toUpperCase() + familyName.slice(1);
        const easeIn = "easeIn" in shapes ? shapes.easeIn : mirror(shapes.easeOut);
        const easeOut = "easeOut" in shapes ? shapes.easeOut : mirror(shapes.easeIn);
        builtCurves[`in${suffix}`] = easeIn;
        builtCurves[`out${suffix}`] = easeOut;
        builtCurves[`inOut${suffix}`] = mirrorInOut(easeIn);
    }

    const curves = (
        Object.freeze(builtCurves)
    );

    const ease = (curveOrName, t) => resolveCurve(curveOrName)(clamp01(t));

    const tween = (from, to, t, curveOrName = "linear") => lerp(from, to, ease(curveOrName, t));

    const fadeIn = (value, start, end, curveOrName = "smoothstep") =>
        ease(curveOrName, progress(value, start, end));

    const fadeOut = (value, start, end, curveOrName = "smoothstep") =>
        1 - fadeIn(value, start, end, curveOrName);


    function envelope(
        value,
        { riseFrom, riseTo, fallFrom, fallTo, riseCurve = "smoothstep", fallCurve = "smoothstep" },
    ) {
        if (value < riseTo) return fadeIn(value, riseFrom, riseTo, riseCurve);
        if (value <= fallFrom) return 1;
        return fadeOut(value, fallFrom, fallTo, fallCurve);
    }

    function yoyo(t, curveOrName = "linear") {
        const clamped = clamp01(t);
        const outAndBack = clamped < HALF_CYCLE ? 2 * clamped : 2 - 2 * clamped;
        return resolveCurve(curveOrName)(outAndBack);
    }

    const wave = {
        sine: (phase) => Math.sin(TAU * phase),
        cosine: (phase) => Math.cos(TAU * phase),
        triangle: (phase) => {
            const shifted = fract(phase + QUARTER_CYCLE);
            const distanceFromMidpoint = Math.abs(shifted - HALF_CYCLE);
            return 1 - distanceFromMidpoint / QUARTER_CYCLE;
        },
        saw: (phase) => toBipolar(fract(phase)),
        pulse: (phase, dutyCycle = HALF_CYCLE) => (fract(phase) < dutyCycle ? 1 : -1),
        square: (phase) => wave.pulse(phase, HALF_CYCLE),
        trapezoid: (phase, steepness = 2) => clamp(steepness * wave.triangle(phase), -1, 1),
        softSquare: (phase, sharpness = 5) => Math.tanh(sharpness * wave.sine(phase)),
        staircase: (phase, steps = 4) => {
            const stepCount = Math.max(2, Math.floor(steps));
            const stepIndex = Math.floor(fract(phase) * stepCount);
            return toBipolar(stepIndex / (stepCount - 1));
        },
    };

    const cycle = {
        ramp: (phase) => fract(phase),
        pingPong: (phase) => 1 - Math.abs(toBipolar(fract(phase))),
        raisedCosine: (phase) => (1 - Math.cos(TAU * phase)) / 2,
        eased: (phase, curveOrName = "smoothstep") => resolveCurve(curveOrName)(cycle.pingPong(phase)),
        gate: (phase, dutyCycle = HALF_CYCLE) => (fract(phase) < dutyCycle ? 1 : 0),
        rectifiedSine: (phase) => Math.abs(wave.sine(phase)),
        halfSine: (phase) => Math.max(wave.sine(phase), 0),
    };

    const settleSecondsToTimeConstant = (settleSeconds) =>
        settleSeconds > 0 ? settleSeconds / TIME_CONSTANTS_TO_SETTLE : 0;

    const dampFactor = (deltaSeconds, timeConstant) =>
        timeConstant > 0 ? 1 - Math.exp(-deltaSeconds / timeConstant) : 1;

    const damp = (current, target, timeConstant, deltaSeconds) =>
        lerp(current, target, dampFactor(deltaSeconds, timeConstant));

    function moveToward(current, target, maxStep) {
        const remaining = target - current;
        return Math.abs(remaining) <= maxStep ? target : current + Math.sign(remaining) * maxStep;
    }

    class Smoother {
        constructor(initialValue = 0, { snapDistance = 1e-4 } = {}) {
            this.value = initialValue;
            this.target = initialValue;
            this.timeConstant = 0;
            this.snapDistance = snapDistance;
        }

        setTarget(target, settleSeconds = 0) {
            this.target = target;
            this.timeConstant = settleSecondsToTimeConstant(settleSeconds);
            if (this.timeConstant === 0) this.value = target;
            return this;
        }

        update(deltaSeconds) {
            if (this.settled) return this.value;
            this.value = damp(this.value, this.target, this.timeConstant, deltaSeconds);
            if (Math.abs(this.target - this.value) < this.snapDistance) this.value = this.target;
            return this.value;
        }

        get settled() {
            return this.value === this.target;
        }
    }

    return {
        TAU,

        clamp,
        clamp01,

        lerp,
        progress,

        wrap,
        fract,

        toBipolar,
        toUnit,

        phaseFromTime,
        resolveCurve,

        mirror,
        mirrorInOut,
        reverseInput,

        curves,

        ease,

        tween,

        fadeIn,
        fadeOut,

        envelope,

        yoyo,

        wave,
        cycle,

        settleSecondsToTimeConstant,

        dampFactor,
        damp,

        moveToward,

        Smoother
    }
})();