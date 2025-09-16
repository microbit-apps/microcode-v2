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
            let isTimer = sensor == microcode.Tid.TID_SENSOR_TIMER
            this.once = false
            if (
                sensor == microcode.Tid.TID_SENSOR_START_PAGE &&
                this.rule.filters.some(
                    f => microcode.jdKind(f) == microcode.JdKind.Timespan
                )
            ) {
                isTimer = true
                this.once = true
            }
            if (isTimer) {
                // const timer = this.addProc(name + "_timer")
                let period = 0
                let randomPeriod = 0
                for (const m of this.rule.filters) {
                    const mJdparam = microcode.jdParam(m)
                    if (microcode.jdKind(m) == microcode.JdKind.Timespan) {
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
                const tid = microcode.getTid(sensor)
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
                if (microcode.jdKind(m) != microcode.JdKind.Literal)
                    return undefined
                v += microcode.jdParam(m)
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
                case microcode.JdKind.Temperature:
                    return this.state["z_temp"] || 0
                case microcode.JdKind.Literal:
                    return mJdpararm
                case microcode.JdKind.Variable:
                    return this.state[this.pipeVar(mJdpararm)] || 0
                case microcode.JdKind.RadioValue:
                    return this.state["z_radio"] || 0
                default:
                    this.error("can't emit kind: " + mKind)
                    return 0
            }
        }
    }
}
