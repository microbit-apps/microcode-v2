namespace microcode {
    // an interpreter for ProgramDefn

    // delay on sending stuff in pipes and changing pages
    const ANTI_FREEZE_DELAY = 50

    type StateMap = { [id: string]: number }

    class RuleClosure {
        private once: boolean = false
        private wakeTime: number = 0 // for timers
        private actionIndex: number = -1 // action not active
        constructor(private rule: RuleDefn) {
            this.getWakeTime()
        }

        reset() {
            if (this.once) return
            this.actionIndex = -1
            this.getWakeTime()
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
                this.wakeTime = control.millis() + period
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

            const microbitEvent = () => {
                console.debug("microbit event " + control.eventValue())
                // console.log("event: " + src + "/" + ev);
            }
            control.onEvent(
                DAL.DEVICE_ID_ANY,
                DAL.DEVICE_EVT_ANY,
                microbitEvent
            )
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
        private getValue(
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
