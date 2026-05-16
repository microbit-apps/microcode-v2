namespace microcode {
    import Scene = user_interface_base.Scene

    const HOST_FRAME_PRIORITY = 30

    class MicroCodeUiAssets implements ui.UiAssetResolver {
        public getBitmap(
            id: string | number,
            nullIfMissing?: boolean
        ): Bitmap | undefined {
            const bitmap = icons.get(id, !!nullIfMissing)
            if (bitmap) return bitmap
            if (nullIfMissing) return undefined
            return icons.get("MISSING")
        }

        public getText(id: string): string {
            return resolveTooltip(id)
        }
    }

    class MicroCodeUiAccessibility implements ui.UiAccessibilitySink {
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

    class MicroCodeUiProfiler implements ui.UiProfiler {
        public mark(name: string): void {
            if (name) profile()
        }
    }

    class HostedSmokeScreen implements ui.UiScreen {
        public backgroundColor = 0xc

        public render(surface: ui.DrawSurface): void {
            surface.drawText("", 0, 0)
        }

        public handleInput(event: ui.UiInputEvent): boolean {
            return event.action == "cancel"
        }
    }

    /**
     * Navigation surface used by hosted microcode screens.
     */
    export interface MicroCodeHostedNavigation {
        /**
         * Pushes a hosted screen onto the app-owned UI runtime.
         */
        push(screen: ui.UiScreen): void

        /**
         * Replaces the active hosted screen.
         */
        replace(screen: ui.UiScreen): void

        /**
         * Pops the active hosted screen when it is not the host root.
         */
        pop(): void

        /**
         * Leaves the hosted runtime and opens the old editor scene.
         */
        launchEditor(): void
    }

    /**
     * App-local owner for hosted `ui-core` screens.
     */
    export class MicroCodeUiHost implements MicroCodeHostedNavigation {
        private app_: App
        private scene_: HostedUiScene

        constructor(app: App) {
            this.app_ = app
        }

        /**
         * Opens the hosted runtime with a root screen.
         */
        public open(root: ui.UiScreen): void {
            if (this.scene_) return
            this.scene_ = new HostedUiScene(this.app_, this, root)
            this.app_.pushScene(this.scene_)
        }

        /**
         * Constructs a hosted runtime scene and tears it down without opening it.
         */
        public smokeConstruct(): boolean {
            const scene = new HostedUiScene(this.app_, this, new HostedSmokeScreen())
            scene.prepareForSmoke()
            scene.shutdown()
            return true
        }

        public push(screen: ui.UiScreen): void {
            if (this.scene_) this.scene_.pushHostedScreen(screen)
        }

        public replace(screen: ui.UiScreen): void {
            if (this.scene_) this.scene_.replaceHostedScreen(screen)
        }

        public pop(): void {
            if (this.scene_) this.scene_.popHostedScreen()
        }

        public launchEditor(): void {
            this.close()
            stopProgram()
            this.app_.pushScene(new Editor(this.app_))
        }

        public close(): void {
            if (!this.scene_) return
            const scene = this.scene_
            this.scene_ = undefined
            this.app_.popHostedScene(scene)
        }

        public didClose(scene: HostedUiScene): void {
            if (this.scene_ == scene) this.scene_ = undefined
        }
    }

    class HostedUiScene extends Scene {
        private owner_: MicroCodeUiHost
        private runtime_: ui.UiRuntime
        private root_: ui.UiScreen
        private frameCallback_: context.FrameCallback

        constructor(app: App, owner: MicroCodeUiHost, root: ui.UiScreen) {
            super(app, "hosted-ui")
            this.owner_ = owner
            this.root_ = root
            this.backgroundColor = 0
        }

        public startup(): void {
            this.runtime_ = new ui.UiRuntime({
                display: new ui.DisplayShieldFrameAdapter({
                    scaleMode: "cover",
                }),
                assets: new MicroCodeUiAssets(),
                accessibility: new MicroCodeUiAccessibility(),
                profiler: new MicroCodeUiProfiler(),
                clearColor: this.backgroundColor,
            })
            this.runtime_.push(this.root_)
        }

        public __init(): void {
            this.bindFramePump()
        }

        public shutdown(): void {
            this.drainHostedScreens()
            this.runtime_ = undefined
            this.owner_.didClose(this)
        }

        public update(): void {
        }

        public draw(): void {
        }

        public prepareForSmoke(): void {
            this.startup()
            this.runtime_.runFrame()
        }

        public pushHostedScreen(screen: ui.UiScreen): void {
            if (!this.runtime_) return
            this.runtime_.push(screen)
            this.bindFramePump()
        }

        public replaceHostedScreen(screen: ui.UiScreen): void {
            if (!this.runtime_) return
            this.runtime_.replace(screen)
            this.bindFramePump()
        }

        public popHostedScreen(): void {
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
                }
            )
        }

        private dispatchPointerInput(
            action: "pointerMove" | "pointerClick",
            x: number,
            y: number
        ): void {
            if (!this.runtime_) return
            this.runtime_.dispatchInput({
                action,
                source: "pointer",
                x: this.logicalXFromPhysical(x),
                y: this.logicalYFromPhysical(y),
            })
        }

        private logicalXFromPhysical(x: number): number {
            const scale = ui.physicalViewportScale(
                screen().width,
                screen().height,
                "cover"
            )
            return Math.idiv(
                (x - ui.physicalViewportOffsetX(screen().width, screen().height, "cover")) *
                    1000,
                scale * 1000
            )
        }

        private logicalYFromPhysical(y: number): number {
            const scale = ui.physicalViewportScale(
                screen().width,
                screen().height,
                "cover"
            )
            return Math.idiv(
                (y - ui.physicalViewportOffsetY(screen().width, screen().height, "cover")) *
                    1000,
                scale * 1000
            )
        }

        private drainHostedScreens(): void {
            if (!this.runtime_) return
            while (this.runtime_.depth()) this.runtime_.pop()
        }
    }
}
