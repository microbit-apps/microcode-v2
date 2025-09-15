namespace microcode {
    // an interpreter for ProgramDefn

    // delay on sending stuff in pipes and changing pages
    const ANTI_FREEZE_DELAY = 50

    // we should abstract the when section of a rule to encapsulate
    // the different sort of events that can trigger a rule

    class RuleClosure {
        private actionIndex: number = -1 // action not active
        constructor(private rule: RuleDefn) {
            this.start()
        }

        start() {
            const sensor = this.rule.sensor
            let isTimer = sensor == microcode.Tid.TID_SENSOR_TIMER
            let once = false
            if (
                sensor == microcode.Tid.TID_SENSOR_START_PAGE &&
                this.rule.filters.some(
                    f => microcode.jdKind(f) == microcode.JdKind.Timespan
                )
            ) {
                isTimer = true
                once = true
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

                // terminate a previous timer for this rule, if any
                // now start a new one, computing random period, if needed
                // and register handler to run the body when the timer expires
                // if not once, then repeat the rule again
                return
            }
        }
    }

    class PageClosure {
        public rules: RuleClosure[] = []
        // what else to remember about a running page?
    }

    export class Interpreter {
        private running: boolean = false
        private currentPage: number = 0
        private pageClosure: PageClosure = undefined

        constructor(private program: ProgramDefn) {}

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
    }
}
