namespace microcode {
    // Auto-save slot
    export const SAVESLOT_AUTO = "sa"

    export interface SavedState {
        progdef: any
        version?: string
    }

    export class App {
        private uiHost: UiHost

        constructor() {
            // One interval delay to ensure all static constructors have executed.
            basic.pause(500)

            const buf = this.load(SAVESLOT_AUTO)
            if (buf) {
                const prog = ProgramDefn.fromBuffer(new BufferReader(buf))
                runProgram(prog)
            }

            controller.setRepeatDefault(250, 30)

            this.uiHost = new UiHost(this)

            this.openHome()
        }

        public save(slot: string, buf: Buffer) {
            // console.log(`save to ${slot}: ${buf.length}b`)
            profile()
            settings.writeBuffer(slot, buf)
            return true
        }

        public load(slot: string): Buffer {
            try {
                return settings.readBuffer(slot)
            } catch (e) {
                console.log(e)
            }
            return undefined
        }

        public openHome() {
            this.uiHost.launchHome()
        }

        public runFromEditor() {
            const hostedProgram = this.uiHost.currentEditorProgram()
            if (hostedProgram) {
                runProgramIfStopped(hostedProgram)
            }
        }
    }

    let theInterpreter: Interpreter = undefined

    export function runProgram(prog: ProgramDefn) {
        if (theInterpreter) theInterpreter.stop()
        theInterpreter = new Interpreter(prog, runtimeHost)
    }

    export function runProgramIfStopped(prog: ProgramDefn): boolean {
        if (isProgramRunning()) return false
        runProgram(prog)
        return true
    }

    export function stopProgram() {
        if (theInterpreter) theInterpreter.stop()
        theInterpreter = undefined
    }

    export function stopProgramIfRunning(): boolean {
        if (!isProgramRunning()) return false
        stopProgram()
        basic.showIcon(IconNames.No, 100)
        basic.clearScreen()
        return true
    }

    export function isProgramRunning() {
        return theInterpreter != undefined
    }
}
