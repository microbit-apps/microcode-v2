namespace microcode {
    import AppInterface = user_interface_base.AppInterface
    import Scene = user_interface_base.Scene
    import SceneManager = user_interface_base.SceneManager

    // Auto-save slot
    export const SAVESLOT_AUTO = "sa"

    export interface SavedState {
        progdef: any
        version?: string
    }

    export class App implements AppInterface {
        private sceneManager: SceneManager
        private uiHost: UiHost

        constructor() {
            // One interval delay to ensure all static constructors have executed.
            basic.pause(500)

            // Application configuration
            user_interface_base.getIcon = id => icons.get(id)
            user_interface_base.resolveTooltip = (ariaId: string) =>
                resolveTooltip(ariaId)

            const buf = this.load(SAVESLOT_AUTO)
            if (buf) {
                const prog = ProgramDefn.fromBuffer(new BufferReader(buf))
                runProgram(prog)
            }

            controller.setRepeatDefault(250, 30)
            // keymap.setupKeys()

            this.sceneManager = new SceneManager()
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

        public pushScene(scene: Scene) {
            this.sceneManager.pushScene(scene)
        }

        public popScene() {
            this.sceneManager.popScene()
        }

        public popUiHostScene(scene: Scene) {
            const topIndex = this.sceneManager.scenes.length - 1
            if (this.sceneManager.scenes[topIndex] == scene) {
                this.sceneManager.popScene()
            }
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
