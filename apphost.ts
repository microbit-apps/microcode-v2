namespace microcode {
    import Scene = user_interface_base.Scene

    const HOST_FRAME_PRIORITY = 30
    export const UI_SCREEN_WIDTH = ui.STANDARD_DISPLAY_WIDTH
    export const UI_SCREEN_HEIGHT = ui.STANDARD_DISPLAY_HEIGHT
    export const UI_DISPLAY_PROFILE = ui.UiDisplayProfileId.Standard
    const APP_FOCUS_COLOR = 9
    const APP_FOCUS_THICKNESS = 3
    const APP_FOCUS_LABEL_BACKGROUND = 15
    const APP_FOCUS_LABEL_COLOR = 1

    /**
     * Creates the shared icon-button style used by screen controls.
     */
    export function appIconButtonStyle(): ui.UiButtonStyle {
        return ui.buttonStyle(
            ui.UiButtonStyles.Transparent,
            ui.UiButtonStyles.FocusLabel,
            {
                focusColor: APP_FOCUS_COLOR,
                focusThickness: APP_FOCUS_THICKNESS,
                focusLabelBackgroundColor: APP_FOCUS_LABEL_BACKGROUND,
                focusLabelColor: APP_FOCUS_LABEL_COLOR,
                focusLabelFont: user_interface_base.font,
                focusLabelGap: 2,
                focusLabelPadding: 1,
            },
        )
    }

    class AppAssetResolver implements ui.UiAssetResolver {
        public getBitmap(
            id: string | number,
            nullIfMissing?: boolean,
        ): Bitmap | undefined {
            if (id == "wordLogo") return wordLogo
            const bitmap = icons.get(id, !!nullIfMissing)
            if (bitmap) return bitmap
            if (nullIfMissing) return undefined
            return icons.get("MISSING")
        }

        public getText(id: string): string {
            return resolveTooltip(id)
        }
    }

    class AppAccessibilitySink implements ui.UiAccessibilitySink {
        public publish(message: string): void {
            if (message) {
                const content: accessibility.TextAccessibilityMessage = {
                    type: "text",
                    value: message,
                }
                accessibility.setLiveContent(content)
            }
        }
    }

    class AppProfiler implements ui.UiProfiler {
        public mark(name: string): void {
            if (name) profile()
        }
    }

    /**
     * Navigation surface used by screens.
     */
    export interface AppNavigation {
        /**
         * Pushes a screen above the active screen.
         */
        push(screen: ui.UiScreen): void

        /**
         * Replaces the active screen.
         */
        replace(screen: ui.UiScreen): void

        /**
         * Pops the active screen when it is not the host root.
         */
        pop(): void

        /**
         * Opens the home screen.
         */
        launchHome(): void

        /**
         * Opens the editor.
         */
        launchEditor(): void

        /**
         * Opens the samples gallery.
         */
        launchSamples(): void

        /**
         * Opens the settings screen.
         */
        launchSettings(): void
    }

    /**
     * Owns the screen runtime and app-level navigation.
     */
    export class UiHost implements AppNavigation {
        private app_: App
        private scene_: UiHostScene

        constructor(app: App) {
            this.app_ = app
        }

        /**
         * Opens the screen runtime with a root screen.
         */
        public open(root: ui.UiScreen): void {
            if (this.scene_) return
            this.scene_ = new UiHostScene(this.app_, this, root)
            this.app_.pushScene(this.scene_)
        }

        public push(screen: ui.UiScreen): void {
            if (this.scene_) this.scene_.pushScreen(screen)
        }

        public replace(screen: ui.UiScreen): void {
            if (this.scene_) this.scene_.replaceScreen(screen)
        }

        public pop(): void {
            if (this.scene_) this.scene_.popScreen()
        }

        public launchHome(): void {
            const screen = new HomeScreen(this)
            if (this.scene_) this.scene_.replaceScreen(screen)
            else this.open(screen)
        }

        public launchEditor(): void {
            stopProgramIfRunning()
            const screen = new EditorScreen(this, this.app_)
            if (this.scene_) this.scene_.replaceScreen(screen)
            else this.open(screen)
        }

        public launchSamples(): void {
            this.push(new SamplesGalleryScreen(this))
        }

        public launchSettings(): void {
            this.app_.pushScene(new MicroCodeSettings(this.app_))
        }

        public close(): void {
            if (!this.scene_) return
            const scene = this.scene_
            this.scene_ = undefined
            this.app_.popUiHostScene(scene)
        }

        public didClose(scene: UiHostScene): void {
            if (this.scene_ == scene) this.scene_ = undefined
        }

        public currentEditorProgram(): ProgramDefn {
            return this.scene_ ? this.scene_.currentEditorProgram() : undefined
        }
    }

    class UiHostScene extends Scene {
        private owner_: UiHost
        private runtime_: ui.UiRuntime
        private root_: ui.UiScreen
        private frameCallback_: context.FrameCallback

        constructor(app: App, owner: UiHost, root: ui.UiScreen) {
            super(app, "ui-host")
            this.owner_ = owner
            this.root_ = root
            this.backgroundColor = 0
        }

        public startup(): void {
            this.runtime_ = new ui.UiRuntime({
                display: new ui.DisplayShieldFrameAdapter({
                    scaleMode: "cover",
                    displayProfile: UI_DISPLAY_PROFILE,
                }),
                assets: new AppAssetResolver(),
                accessibility: new AppAccessibilitySink(),
                profiler: new AppProfiler(),
                clearColor: this.backgroundColor,
            })
            this.runtime_.push(this.root_)
        }

        public __init(): void {
            this.bindFramePump()
        }

        public shutdown(): void {
            this.drainScreens()
            this.runtime_ = undefined
            this.owner_.didClose(this)
        }

        public update(): void {}

        public draw(): void {}

        public pushScreen(screen: ui.UiScreen): void {
            if (!this.runtime_) return
            this.runtime_.push(screen)
            this.bindFramePump()
        }

        public replaceScreen(screen: ui.UiScreen): void {
            if (!this.runtime_) return
            this.runtime_.replace(screen)
            this.bindFramePump()
        }

        public currentEditorProgram(): ProgramDefn {
            const screen = this.runtime_ ? this.runtime_.top() : undefined
            return screen instanceof EditorScreen
                ? screen.currentProgram()
                : undefined
        }

        public popScreen(): void {
            if (!this.runtime_ || this.runtime_.depth() <= 1) return
            this.runtime_.pop()
        }

        public dispatchPointerMove(x: number, y: number): void {
            this.dispatchPointerInput("pointerMove", x, y)
        }

        public dispatchPointerClick(x: number, y: number): void {
            this.dispatchPointerInput("pointerClick", x, y)
        }

        public dispatchWheel(dx: number, dy: number): void {
            if (!this.runtime_) return
            this.runtime_.dispatchInput({
                action: "wheel",
                source: "wheel",
                dx,
                dy,
            })
        }

        private bindFramePump(): void {
            const ctx = context.eventContext()
            if (!ctx) return
            this.frameCallback_ = ctx.registerFrameHandler(
                HOST_FRAME_PRIORITY,
                () => {
                    if (this.runtime_) this.runtime_.runFrame()
                },
            )
        }

        private dispatchPointerInput(
            action: "pointerMove" | "pointerClick",
            x: number,
            y: number,
        ): void {
            if (!this.runtime_) return
            this.runtime_.dispatchInput({
                action,
                source: "pointer",
                x,
                y,
            })
        }

        private drainScreens(): void {
            if (!this.runtime_) return
            while (this.runtime_.depth()) this.runtime_.pop()
        }
    }
}
