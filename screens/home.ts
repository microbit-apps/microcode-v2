namespace microcode {
    type HomeAction = "edit" | "samples" | "load" | "settings"
    type HomeDiskSlot = string

    const HOME_ACTION_SCOPE = "home/actions"
    const HOME_DISK_MODAL_SCOPE = "home/load"
    const HOME_ADD_SETTINGS = false
    const HOME_ACTION_CENTER_OFFSET_Y = 30
    const HOME_ACTION_WIDTH = 32
    const HOME_ACTION_HEIGHT = 33
    const HOME_ACTION_GAP = 8
    const HOME_ACTION_LABEL_GAP = 1
    const HOME_MARGIN = 2

    export class HomeScreen extends ui.UiScreen {
        private host_: AppHost
        private logoOffset_: number

        constructor(host: AppHost) {
            assert(!!host.runtime, "AppHost must have a runtime")
            super(host.runtime)
            this.backgroundColor = 0xc
            this.host_ = host
            const actionRow = new ControlGrid<HomeAction>({
                scopeId: HOME_ACTION_SCOPE,
                controls: this.createActions(),
                columnCount: HOME_ADD_SETTINGS ? 4 : 3,
                controlWidth: HOME_ACTION_WIDTH,
                controlHeight: HOME_ACTION_HEIGHT,
                columnGap: HOME_ACTION_GAP,
                controlStyle: ui.buttonStyle(AppStyles.iconButton(), {
                    focusLabelGap: HOME_ACTION_LABEL_GAP,
                }),
                labelBounds: new ui.Rect(
                    0,
                    0,
                    UI_SCREEN_WIDTH,
                    UI_SCREEN_HEIGHT,
                ),
            })

            this.addCentered(
                actionRow,
                (UI_SCREEN_HEIGHT >> 1) + HOME_ACTION_CENTER_OFFSET_Y,
                UI_SCREEN_WIDTH,
                HOME_ACTION_HEIGHT,
            )
            this.logoOffset_ = -(UI_SCREEN_HEIGHT >> 1)
        }

        public render(surface: ui.DrawSurface): void {
            // Draw from back to front
            this.drawLogo(surface)
            this.drawVersion(surface)
            super.render(surface)
        }

        private createActions(): ui.UiControl<HomeAction>[] {
            const actions: ui.UiControl<HomeAction>[] = [
                ui.button<HomeAction>(
                    "edit",
                    { bitmapId: "edit_program", textId: "C0" },
                    () => this.host_.launchEditor(),
                ),
                ui.button<HomeAction>(
                    "samples",
                    { bitmapId: "smiley_buttons", textId: "C1" },
                    () => this.host_.launchSamples(),
                ),
                ui.button<HomeAction>(
                    "load",
                    { bitmapId: "largeDisk", textId: "load" },
                    () => this.openDiskModal(),
                ),
            ]
            if (HOME_ADD_SETTINGS) {
                actions.push(
                    ui.button<HomeAction>(
                        "settings",
                        { bitmapId: "largeSettingsGear", textId: "settings" },
                        () => this.host_.launchSettings(),
                    ),
                )
            }
            return actions
        }

        private createDiskControls(): ui.UiControl<HomeDiskSlot>[] {
            return diskSlots().map(slot => {
                return ui.button<HomeDiskSlot>(slot, { bitmapId: slot }, () =>
                    this.loadDiskSlot(slot),
                )
            })
        }

        public handleInput(event: ui.UiInputEvent): boolean | undefined {
            if (event.action == "cancel" && event.phase != "released")
                return true
            return undefined
        }

        private openDiskModal(): void {
            if (this.hasModal) return
            this.openModal(this.createDiskModal())
        }

        private createDiskModal(): ControlPicker<HomeDiskSlot> {
            return new ControlPicker<HomeDiskSlot>({
                modalScopeId: HOME_DISK_MODAL_SCOPE,
                controls: this.createDiskControls(),
                titleId: "load",
                columnCount: AppStyles.ModalColumnCount,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                controlStyle: AppStyles.ModalButton,
                panelColor: this.backgroundColor,
            })
        }

        private loadDiskSlot(slot: HomeDiskSlot): void {
            let buf = settings.readBuffer(slot)
            if (!buf) buf = new ProgramDefn().toBuffer()
            replaceAutoProgram(buf)
            this.closeDiskModal()
            this.host_.launchEditor()
        }

        private closeDiskModal(): void {
            this.closeModal()
        }

        private drawLogo(surface: ui.DrawSurface): void {
            this.logoOffset_ = Math.min(0, this.logoOffset_ + 2)
            const t = control.millis()
            const dy = this.logoOffset_ == 0 ? (Math.idiv(t, 800) & 1) - 1 : 0
            const word = this.assets.getBitmap("wordLogo")
            const microbit = this.assets.getBitmap("microbitLogo")
            const offset = (UI_SCREEN_HEIGHT >> 1) - word.height - HOME_MARGIN
            const y = offset + dy

            surface.drawBitmap(
                word,
                Math.idiv(UI_SCREEN_WIDTH - word.width, 2) + dy,
                y + this.logoOffset_,
            )
            surface.drawBitmap(
                microbit,
                Math.idiv(UI_SCREEN_WIDTH - microbit.width, 2) + dy,
                y - word.height + this.logoOffset_ + HOME_MARGIN,
            )
            if (!this.logoOffset_) {
                const tagline = this.assets.getText("tagline")
                // font5 covers Latin glyphs only; a localized tagline may
                // require a different font.
                const font = bitmaps.font5
                surface.drawText(
                    tagline,
                    Math.idiv(UI_SCREEN_WIDTH + word.width, 2) +
                        dy -
                        font.charWidth * tagline.length,
                    offset + word.height + dy + this.logoOffset_ + 1,
                    { color: 0xb, font },
                )
            }
        }

        private drawVersion(surface: ui.DrawSurface): void {
            const font = bitmaps.font5
            surface.drawText(
                microcode.VERSION,
                UI_SCREEN_WIDTH - font.charWidth * microcode.VERSION.length,
                UI_SCREEN_HEIGHT - font.charHeight - 1,
                { color: 0xb, font },
            )
        }
    }
}
