const Loop = (() => {
    class Loop {
        constructor({
            step: step = 1 / 60,
            update: update = null,
            maxStepsPerFrame: maxStepsPerFrame = 4,
            maxFrameSeconds: maxFrameSeconds = 0.25,
            fixedFps: fixedFps = 0,
        } = {}) {
            this.step = step;
            this.update = update;
            this.maxStepsPerFrame = maxStepsPerFrame;
            this.maxFrameSeconds = maxFrameSeconds;
            this.fixedFpsSetting = fixedFps;
            this.forcedFps = 0;
            this.paused = false;
            this.timeScale = 1;
            this.reset();
            this.frameDt = 0;
            this.frameTime = 0;
            this.frames = 0;
        }
        get fixedFps() {
            if (this.forcedFps > 0) {
                return this.forcedFps;
            }
            const fps =
                typeof this.fixedFpsSetting == "function"
                    ? this.fixedFpsSetting()
                    : this.fixedFpsSetting;
            return Math.max(0, Number(fps) || 0);
        }
        setFixedFps(fps) {
            this.forcedFps = Math.max(0, Number(fps) || 0);
            return this;
        }
        get alpha() {
            return Math.min(1, Math.max(0, this.accumulator / this.step));
        }
        reset() {
            this.time = 0;
            this.steps = 0;
            this.accumulator = 0;
            this.timers = [];
            this.timerCount = 0;
            return this;
        }
        tick(t = 0) {
            const fps = this.fixedFps;
            this.frameDt =
                fps > 0
                    ? 1 / fps
                    : Math.min(
                          Math.max(0, Number(t) || 0),
                          this.maxFrameSeconds,
                      );
            this.frameTime += this.frameDt;
            this.frames++;
            return this.frameDt;
        }
        run() {
            if (this.paused) {
                return 0;
            }
            this.accumulator += this.frameDt * this.timeScale;
            const e =
                this.fixedFps > 0
                    ? Math.ceil((this.frameDt * this.timeScale) / this.step) + 1
                    : this.maxStepsPerFrame;
            let i = 0;
            while (this.accumulator >= this.step - t && i < e) {
                this.stepOnce();
                this.accumulator -= this.step;
                i++;
            }
            if (i === e) {
                this.accumulator = 0;
            }
            if (this.accumulator < 0) {
                this.accumulator = 0;
            }
            return i;
        }
        frame(t) {
            this.tick(t);
            return this.run();
        }
        stepOnce() {
            this.time += this.step;
            this.steps++;
            this.runTimers();
            if (this.update) {
                this.update(this.step, this);
            }
        }
        addTimer(t, e, i, s) {
            const r = {
                due: this.time + Math.max(0, t),
                order: this.timerCount++,
                fn: e,
                interval: i,
                remaining: s,
                cancelled: false,
                cancel: () => {
                    r.cancelled = true;
                },
            };
            this.timers.push(r);
            return r;
        }
        after(t, e) {
            return this.addTimer(t, e, 0, 1);
        }
        every(t, e, { times: i = Infinity, delay: s = t } = {}) {
            return this.addTimer(s, e, Math.max(this.step, t), i);
        }
        runTimers() {
            if (this.timers.length !== 0) {
                while (true) {
                    let e = null;
                    for (const i of this.timers) {
                        if (!i.cancelled && !(i.due > this.time + t)) {
                            if (
                                !e ||
                                i.due < e.due ||
                                (i.due === e.due && i.order < e.order)
                            ) {
                                e = i;
                            }
                        }
                    }
                    if (!e) {
                        break;
                    }
                    e.remaining--;
                    if (e.remaining > 0 && e.interval > 0) {
                        e.due += e.interval;
                        if (e.due <= this.time + t) {
                            e.due = this.time + e.interval;
                        }
                        e.order = this.timerCount++;
                    } else {
                        e.cancelled = true;
                    }
                    e.fn(this);
                }
                this.timers = this.timers.filter((t) => !t.cancelled);
            }
        }
    }

    return {
        create: (options) => new Loop(options),
        Loop
    }
})