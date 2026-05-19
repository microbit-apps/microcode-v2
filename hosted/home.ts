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
    const HOME_DISK_ITEM_WIDTH = 18
    const HOME_DISK_ITEM_HEIGHT = 18
    const HOME_DISK_COLUMN_COUNT = 3
    const HOME_DISK_MODAL_MARGIN = 4
    const HOME_DISK_MODAL_TITLE_GAP = 4
    const HOME_MARGIN = 2

    export class HomeScreen extends ui.UiScreen {
        private navigation_: AppNavigation
        private logoOffset_: number

        constructor(navigation: AppNavigation) {
            super()
            this.backgroundColor = 0xc
            this.navigation_ = navigation
            const actionRow = new ui.UiRow<HomeAction>({
                scopeId: HOME_ACTION_SCOPE,
                controls: this.createActions(),
                controlWidth: HOME_ACTION_WIDTH,
                controlHeight: HOME_ACTION_HEIGHT,
                gap: HOME_ACTION_GAP,
                controlStyle: appIconButtonStyle(),
                labelBounds: new ui.Rect(0, 0, UI_SCREEN_WIDTH, UI_SCREEN_HEIGHT),
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
            surface.clear(this.backgroundColor)
            this.drawLogo(surface)
            this.drawVersion(surface)
            super.render(surface)
        }

        private createActions(): ui.UiControl<HomeAction>[] {
            const actions: ui.UiControl<HomeAction>[] = [
                ui.button<HomeAction>(
                    "edit",
                    "edit_program",
                    "C0",
                    () => this.navigation_.launchEditor(),
                ),
                ui.button<HomeAction>(
                    "samples",
                    "smiley_buttons",
                    "C1",
                    () => this.navigation_.launchSamples(),
                ),
                ui.button<HomeAction>(
                    "load",
                    "largeDisk",
                    "load",
                    () => this.openDiskModal(),
                ),
            ]
            if (HOME_ADD_SETTINGS) {
                actions.push(
                    ui.button<HomeAction>(
                        "settings",
                        "largeSettingsGear",
                        "settings",
                        () => this.navigation_.launchSettings(),
                    ),
                )
            }
            return actions
        }

        private createDiskControls(): ui.UiControl<HomeDiskSlot>[] {
            return diskSlots().map(slot => {
                return ui.iconButton<HomeDiskSlot>(
                    slot,
                    slot,
                    () => this.loadDiskSlot(slot),
                )
            })
        }

        public handleScreenInput(event: ui.UiInputEvent): boolean | undefined {
            if (event.action == "cancel" && event.phase != "released")
                return true
            return undefined
        }

        private openDiskModal(): void {
            if (this.hasModal) return
            this.openModal(this.createDiskModal())
        }

        private createDiskModal(): ui.UiPicker<HomeDiskSlot> {
            return new ui.UiPicker<HomeDiskSlot>({
                modalScopeId: HOME_DISK_MODAL_SCOPE,
                controls: this.createDiskControls(),
                titleId: "load",
                columnCount: HOME_DISK_COLUMN_COUNT,
                controlWidth: HOME_DISK_ITEM_WIDTH,
                controlHeight: HOME_DISK_ITEM_HEIGHT,
                controlStyle: ui.UiButtonStyles.LightShadowedWhite,
                modalStyle: ui.modalStyle(ui.UiModalStyles.Default, {
                    panelColor: this.backgroundColor,
                    titleColor: 1,
                    contentMargin: HOME_DISK_MODAL_MARGIN,
                    titleGap: HOME_DISK_MODAL_TITLE_GAP,
                }),
            })
        }

        private loadDiskSlot(slot: HomeDiskSlot): void {
            let buf = settings.readBuffer(slot)
            if (!buf) buf = new ProgramDefn().toBuffer()
            settings.writeBuffer(SAVESLOT_AUTO, buf)
            this.closeDiskModal()
            this.navigation_.launchEditor()
        }

        private closeDiskModal(): void {
            this.closeModal()
        }

        private drawLogo(surface: ui.DrawSurface): void {
            // The animation is ordinary screen state. It advances during render
            // because the host runs frames continuously while this screen is top.
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
                const font = bitmaps.font5
                surface.drawText(
                    tagline,
                    Math.idiv(UI_SCREEN_WIDTH + word.width, 2) +
                        dy -
                        font.charWidth * tagline.length,
                    offset + word.height + dy + this.logoOffset_ + 1,
                    { color: 0xb, font, transparent: true },
                )
            }
        }

        private drawVersion(surface: ui.DrawSurface): void {
            const font = bitmaps.font5
            surface.drawText(
                microcode.VERSION,
                UI_SCREEN_WIDTH - font.charWidth * microcode.VERSION.length,
                UI_SCREEN_HEIGHT - font.charHeight - 1,
                { color: 0xb, font, transparent: true },
            )
        }
    }
}
