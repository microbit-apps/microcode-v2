namespace microcode {
    export const UI_SCREEN_WIDTH = 160
    export const UI_SCREEN_HEIGHT = 120

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
        private runtime_: ui.UiRuntime

        constructor(app: App) {
            this.app_ = app
        }

        /**
         * Opens the screen runtime with a root screen.
         */
        public open(root: ui.UiScreen): void {
            if (this.runtime_) return
            this.runtime_ = this.createRuntime()
            this.runtime_.push(root)
            this.runtime_.start()
        }

        public push(screen: ui.UiScreen): void {
            if (!this.runtime_) {
                this.open(screen)
                return
            }
            this.runtime_.push(screen)
        }

        public replace(screen: ui.UiScreen): void {
            if (!this.runtime_) {
                this.open(screen)
                return
            }
            this.runtime_.replace(screen)
        }

        public pop(): void {
            if (!this.runtime_ || this.runtime_.depth() <= 1) return
            this.runtime_.pop()
        }

        public launchHome(): void {
            const screen = new HomeScreen(this)
            if (this.runtime_) this.replace(screen)
            else this.open(screen)
        }

        public launchEditor(): void {
            const screen = new EditorScreen(this, this.app_)
            if (this.runtime_) this.replace(screen)
            else this.open(screen)
        }

        public launchSamples(): void {
            this.push(new SamplesGalleryScreen(this))
        }

        public launchSettings(): void {
            this.push(new SettingsScreen(this))
        }

        public close(): void {
            if (!this.runtime_) return
            this.runtime_.stop()
            while (this.runtime_.depth()) this.runtime_.pop()
            this.runtime_ = undefined
        }

        public currentEditorProgram(): ProgramDefn {
            const screen = this.runtime_ ? this.runtime_.top() : undefined
            return screen instanceof EditorScreen
                ? screen.currentProgram()
                : undefined
        }

        private createRuntime(): ui.UiRuntime {
            return new ui.UiRuntime({
                display: new ui.DisplayShieldFrameAdapter(),
                assets: new AppAssetResolver(),
                clearColor: 0,
            })
        }
    }
}
