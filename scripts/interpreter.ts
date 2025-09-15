namespace microcode {
    // an interpreter for ProgramDefn
    export class Interpreter {
        private running: boolean = false
        private currentPage: number = 0

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
    }
}
