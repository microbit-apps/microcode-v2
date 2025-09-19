namespace microcode {
    // an interpreter for ProgramDefn

    // delay on sending stuff in pipes and changing pages
    const ANTI_FREEZE_DELAY = 50

    type StateMap = { [id: string]: number }

    class RuleClosure {
        private once: boolean = false
        private wakeTime: number = 0 // for timers
        private actionRunning: boolean = false
        private modifierIndex: number = 0
        private loopIndex: number = 0
        constructor(private rule: RuleDefn, private parent: Interpreter) {
            this.getWakeTime()
        }

        reset() {
            this.once = false
            this.actionRunning = false
            this.modifierIndex = 0
            this.loopIndex = 0
            this.getWakeTime()
            if (this.wakeTime > 0) this.runDoSection()
        }

        public matchWhen(): boolean {
            // evaluate the condition associated with the rule, if any
            return false
        }

        public runDoSection() {
            if (this.actionRunning) return
            this.actionRunning = true
            control.runInBackground(() => {
                while (this.actionRunning) {
                    if (this.wakeTime > 0) {
                        basic.pause(this.wakeTime)
                        this.wakeTime = 0
                        this.modifierIndex = 0
                    }
                    if (this.modifierIndex >= 0) {
                        this.checkForLoopFinish()
                        this.runAction()
                    }
                }
            })
        }

        private checkForLoopFinish() {
            // do we have a loop, if so, repeat and keep track of count
            if (this.modifierIndex < 0) return
            if (this.modifierIndex < this.rule.modifiers.length) {
                const m = this.rule.modifiers[this.modifierIndex]
                if (m == Tid.TID_MODIFIER_LOOP) {
                    if (this.modifierIndex == this.rule.modifiers.length - 1) {
                        // forever loop
                        this.modifierIndex = 0
                    } else {
                        // get the loop bound
                        const loopBound = this.parent.getValue(
                            0,
                            this.rule.modifiers.slice(this.modifierIndex + 1),
                            0
                        )
                        this.loopIndex++
                        if (this.loopIndex >= loopBound) {
                            // end of loop
                            this.actionRunning = false
                        } else {
                            // repeat
                            this.modifierIndex = 0
                        }
                    }
                }
            } else {
                // command is finished, restart only if not once
                if (this.once) this.actionRunning = false
                else this.getWakeTime()
            }
        }

        private runAction() {
            if (this.wakeTime > 0 || !this.actionRunning) return
            // execute one step
            const action = this.rule.actuators[0]
            switch (action) {
                case Tid.TID_ACTUATOR_PAINT: {
                    break
                }
                case Tid.TID_ACTUATOR_CUP_X_ASSIGN: {
                    // compute the value to assign
                    // notify the interpreter of new value (don't update state here)
                    //
                    break
                }
                case Tid.TID_ACTUATOR_CUP_Y_ASSIGN: {
                    break
                }
                case Tid.TID_ACTUATOR_CUP_Z_ASSIGN: {
                    break
                }
                case Tid.TID_ACTUATOR_RADIO_SEND: {
                    break
                }
                case Tid.TID_ACTUATOR_RADIO_SET_GROUP: {
                    break
                }
                case Tid.TID_ACTUATOR_MUSIC: {
                    break
                }
                case Tid.TID_ACTUATOR_SPEAKER: {
                    break
                }
                case Tid.TID_ACTUATOR_SWITCH_PAGE: {
                    break
                }
            }
        }

        private getWakeTime() {
            this.wakeTime = 0
            const sensor = this.rule.sensor
            let isTimer = sensor == Tid.TID_SENSOR_TIMER
            this.once = false
            if (
                sensor == Tid.TID_SENSOR_START_PAGE &&
                this.rule.filters.some(f => jdKind(f) == JdKind.Timespan)
            ) {
                isTimer = true
                this.once = true
            }
            if (isTimer) {
                // const timer = this.addProc(name + "_timer")
                let period = 0
                let randomPeriod = 0
                for (const m of this.rule.filters) {
                    const mJdparam = jdParam(m)
                    if (jdKind(m) == JdKind.Timespan) {
                        if (mJdparam >= 0) period += mJdparam
                        else randomPeriod += -mJdparam
                    }
                }
                if (period == 0 && randomPeriod == 0) period = 1000 // reasonable default
                if (period == 0) period = ANTI_FREEZE_DELAY

                if (randomPeriod > 0)
                    period += Math.floor(Math.random() * randomPeriod)
                this.wakeTime = period
            }
        }
    }

    class PageClosure {
        public rules: RuleClosure[] = []
        // what else to remember about a running page?
    }

    // encapsulate the variety of ways microbit/jacdac/timer events
    // are exposed to the interpreter, as well as their values

    class InterpreterEvent {}

    // DEVICE_ID_ANY == DEVICE_EXT_ANY == 0

    type IdMap = { [id: number]: number }

    // see DAL for these values
    const matchPressReleaseTable: IdMap = {
        1: Tid.TID_FILTER_BUTTON_A, // DAL.DEVICE_ID_BUTTON_A
        2: Tid.TID_FILTER_BUTTON_B, // DAL.DEVICE_ID_BUTTON_B
        121: Tid.TID_FILTER_LOGO, // DAL.MICROBIT_ID_LOGO
        100: Tid.TID_FILTER_PIN_0, // DAL.DEVICE_ID_IO_P0
        101: Tid.TID_FILTER_PIN_1, // DAL.DEVICE_ID_IO_P1
        102: Tid.TID_FILTER_PIN_2, // DAL.DEVICE_ID_IO_P2
    }

    const matchAccelerometerTable: IdMap = {
        11: Tid.TID_FILTER_ACCEL_SHAKE,
        1: Tid.TID_FILTER_ACCEL_TILT_UP,
        2: Tid.TID_FILTER_ACCEL_TILT_DOWN,
        3: Tid.TID_FILTER_ACCEL_TILT_LEFT,
        4: Tid.TID_FILTER_ACCEL_TILT_RIGHT,
        5: Tid.TID_FILTER_ACCEL_FACE_UP,
        6: Tid.TID_FILTER_ACCEL_FACE_DOWN,
    }

    export class Interpreter {
        private hasErrors: boolean = false
        private running: boolean = false
        private currentPage: number = 0
        private pageClosure: PageClosure = undefined

        // state storage for variables and other temporary state
        private state: StateMap = {}

        constructor(private program: ProgramDefn) {
            // need to set up the state variables
            // - globals
            // - pipes
            // - recall the last radio values and other sensor values
            // - sensor values (for changes? though maybe we can do without)

            control.onEvent(DAL.DEVICE_ID_BUTTON_A, DAL.DEVICE_EVT_ANY, () =>
                this.onMicrobitEvent(
                    DAL.DEVICE_ID_BUTTON_A,
                    control.eventValue()
                )
            )
            control.onEvent(DAL.DEVICE_ID_BUTTON_B, DAL.DEVICE_EVT_ANY, () =>
                this.onMicrobitEvent(
                    DAL.DEVICE_ID_BUTTON_B,
                    control.eventValue()
                )
            )
        }

        private onMicrobitEvent(src: number, ev: number) {
            let activeRules: RuleDefn[] = []
            this.program.pages[this.currentPage].rules.forEach(r => {
                let match = false
                if (
                    (r.sensor == Tid.TID_SENSOR_PRESS &&
                        ev == DAL.DEVICE_BUTTON_EVT_DOWN) ||
                    (r.sensor == Tid.TID_SENSOR_RELEASE &&
                        ev == DAL.DEVICE_BUTTON_EVT_UP)
                ) {
                    match =
                        r.filters.length == 0 ||
                        r.filters[0] == matchPressReleaseTable[src]
                } else if (
                    r.sensor == Tid.TID_SENSOR_ACCELEROMETER &&
                    ev == DAL.DEVICE_ID_ACCELEROMETER
                ) {
                    match =
                        r.filters.length == 0 ||
                        r.filters[0] == matchAccelerometerTable[ev]
                } else if (
                    r.sensor == Tid.TID_SENSOR_RADIO_RECEIVE &&
                    ev == DAL.DEVICE_ID_RADIO
                ) {
                    // record radio value into state
                    this.state["z_radio"] = radio.receiveNumber()
                    // TODO: evaluate the filters
                } else if (
                    r.sensor == Tid.TID_SENSOR_MICROPHONE &&
                    ev == DAL.DEVICE_ID_MICROPHONE
                ) {
                } else if (r.sensor == Tid.TID_SENSOR_LIGHT) {
                    // TODO: light for change event
                    this.state["z_light"] = input.lightLevel()
                } else if (r.sensor == Tid.TID_SENSOR_TEMP) {
                    // TODO: heck for change event
                    this.state["z_temp"] = input.temperature()
                }
                if (match) activeRules.push(r)
            })
        }

        start() {
            this.running = true
            this.currentPage = 0
            this.runCurrentPage()
        }

        stop() {
            this.running = false
        }

        private runCurrentPage() {
            if (!this.running || this.currentPage >= this.program.pages.length)
                return
            const page = this.program.pages[this.currentPage]
        }

        // iterate over rules and start up timers, if needed
        private setupRule(rule: RuleDefn) {
            // for each sensor, set up event listeners or timers
            for (const sensor of rule.sensors) {
                const tid = getTid(sensor)
                // Example: if tid is a timer, set up a timer
                // If tid is a button press, set up an event listener
            }
        }

        // stop currently executing rules
        private teardownRule(rule: RuleDefn) {
            // remove event listeners or stop timers
        }

        private constantFold(mods: Tile[], defl = 0) {
            if (mods.length == 0) return defl
            let v = 0
            for (const m of mods) {
                if (jdKind(m) != JdKind.Literal) return undefined
                v += jdParam(m)
            }
            return v
        }

        private hasFilterEvent(rule: RuleDefn) {
            return rule.filters.some(f => {
                const k = jdKind(f)
                return k == JdKind.EventCode || k == JdKind.ServiceInstanceIndex
            })
        }

        private pipeVar(id: number) {
            return "z_pipe" + (id || 0)
        }

        private error(msg: string) {
            this.hasErrors = true
            console.error("Error: " + msg)
        }

        private getExprValue(expr: Tile): number {
            const mKind = jdKind(expr)
            const mJdpararm = jdParam(expr)
            switch (mKind) {
                case JdKind.Temperature:
                    return this.state["z_temp"] || 0
                case JdKind.Literal:
                    return mJdpararm
                case JdKind.Variable:
                    return this.state[this.pipeVar(mJdpararm)] || 0
                case JdKind.RadioValue:
                    return this.state["z_radio"] || 0
                default:
                    this.error("can't emit kind: " + mKind)
                    return 0
            }
        }

        private getAddSeq(
            current: number,
            mods: Tile[],
            defl: number = 0,
            clear = true
        ): number {
            // make this functional
            let result: number = current

            const addOrSet = (vv: number) => {
                if (clear) result = vv
                else {
                    result += vv
                }
                clear = false
            }

            if (mods.length == 0) return defl
            else {
                if (jdKind(mods[0]) == JdKind.RandomToss) {
                    let rndBnd = this.getAddSeq(0, mods.slice(1), 5)
                    if (!rndBnd || rndBnd <= 2) rndBnd = 2
                    addOrSet(Math.floor(Math.random() * rndBnd))
                } else {
                    const folded = this.constantFold(mods, defl)
                    if (folded != undefined) {
                        addOrSet(folded)
                    } else {
                        for (let i = 0; i < mods.length; ++i)
                            addOrSet(this.getExprValue(mods[i]))
                    }
                }
            }
            return result
        }

        private breaksValSeq(mod: Tile) {
            switch (jdKind(mod)) {
                case JdKind.RandomToss:
                    return true
                default:
                    return false
            }
        }

        // do we need to take initial value into account?
        public getValue(
            current: number,
            modifiers: Tile[],
            defl: number
        ): number {
            let currSeq: Tile[] = []
            let first = true
            let result: number = current

            for (const m of modifiers) {
                const cat = getCategory(m)
                // TODO: make the following a function
                if (
                    cat == "value_in" ||
                    cat == "value_out" ||
                    cat == "constant" ||
                    cat == "line" ||
                    cat == "on_off"
                ) {
                    if (this.breaksValSeq(m) && currSeq.length) {
                        result = this.getAddSeq(result, currSeq, 0, first)
                        currSeq = []
                        first = false
                    }
                    currSeq.push(m)
                }
            }

            if (currSeq.length) {
                result = this.getAddSeq(result, currSeq, 0, first)
                first = false
            }

            if (first) result = defl
            return result
        }

        private baseModifiers(rule: RuleDefn) {
            let modifiers = rule.modifiers
            if (modifiers.length == 0) {
                const actuator = rule.actuators[0]
                const defl = defaultModifier(actuator)
                if (defl != undefined) return [defl]
            } else {
                for (let i = 0; i < modifiers.length; ++i)
                    if (jdKind(modifiers[i]) == JdKind.Loop)
                        return modifiers.slice(0, i)
            }
            return modifiers
        }

        // 0-max inclusive
        private randomInt(max: number) {
            if (max <= 0) return 0
            return Math.floor(Math.random() * (max + 1))
        }

        private add(a: number, off: number) {
            return a + off
        }

        private loopModifierIdx(rule: RuleDefn) {
            for (let i = 0; i < rule.modifiers.length; ++i) {
                if (jdKind(rule.modifiers[i]) == JdKind.Loop) return i
            }
            return -1
        }
    }
}
