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
    const HOME_FOCUS_COLOR = 9
    const HOME_FOCUS_THICKNESS = 3
    const HOME_FOCUS_LABEL_BACKGROUND = 15
    const HOME_FOCUS_LABEL_COLOR = 1
    const HOME_MARGIN = 2

    export class HomeScreen extends ui.UiScreen {
        private navigation_: AppNavigation
        private logoOffset_: number

        constructor(navigation: AppNavigation) {
            super()
            this.backgroundColor = 0xc
            this.navigation_ = navigation
            const actionButtonStyle = ui.buttonStyle(
                ui.UiButtonStyles.Transparent,
                ui.UiButtonStyles.FocusLabel,
                {
                    focusColor: HOME_FOCUS_COLOR,
                    focusThickness: HOME_FOCUS_THICKNESS,
                    focusLabelBackgroundColor: HOME_FOCUS_LABEL_BACKGROUND,
                    focusLabelColor: HOME_FOCUS_LABEL_COLOR,
                    focusLabelFont: user_interface_base.font,
                    focusLabelGap: 2,
                    focusLabelPadding: 1,
                },
            )
            const actionLabelBounds = new ui.Rect(
                0,
                0,
                UI_SCREEN_WIDTH,
                UI_SCREEN_HEIGHT,
            )
            const actionRow = new ui.UiControlRow<HomeAction>({
                scopeId: HOME_ACTION_SCOPE,
                controls: this.createActions(),
                controlWidth: HOME_ACTION_WIDTH,
                controlHeight: HOME_ACTION_HEIGHT,
                gap: HOME_ACTION_GAP,
                controlStyle: actionButtonStyle,
                labelBounds: actionLabelBounds,
            })

            this.add(actionRow, {
                x: 0,
                centerY: (UI_SCREEN_HEIGHT >> 1) + HOME_ACTION_CENTER_OFFSET_Y,
                width: UI_SCREEN_WIDTH,
                height: HOME_ACTION_HEIGHT,
                horizontalAlignment: "center",
                verticalAlignment: "center",
            })
            this.logoOffset_ = -(UI_SCREEN_HEIGHT >> 1)
        }

        public render(surface: ui.DrawSurface): void {
            // Draw from back to front
            surface.clear(this.backgroundColor)
            this.drawLogo(surface)
            this.drawVersion(surface)
            this.renderWidgets(surface)
        }

        private createActions(): ui.UiControl<HomeAction>[] {
            const actions: ui.UiControl<HomeAction>[] = [
                {
                    id: "edit",
                    value: "edit",
                    bitmapId: "edit_program",
                    textId: "C0",
                    onActivate: () => this.navigation_.launchEditor(),
                },
                {
                    id: "samples",
                    value: "samples",
                    bitmapId: "smiley_buttons",
                    textId: "C1",
                    onActivate: () => this.navigation_.launchSamples(),
                },
                {
                    id: "load",
                    value: "load",
                    bitmapId: "largeDisk",
                    textId: "load",
                    onActivate: () => this.openDiskModal(),
                },
            ]
            if (HOME_ADD_SETTINGS) {
                actions.push(
                    {
                        id: "settings",
                        value: "settings",
                        bitmapId: "largeSettingsGear",
                        textId: "settings",
                        onActivate: () => this.navigation_.launchSettings(),
                    },
                )
            }
            return actions
        }

        private createDiskControls(): ui.UiControl<HomeDiskSlot>[] {
            return diskSlots().map(slot => {
                return {
                    id: slot,
                    value: slot,
                    bitmapId: slot,
                    onActivate: () => this.loadDiskSlot(slot),
                }
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

        private createDiskModal(): ui.UiModalGrid<HomeDiskSlot> {
            return new ui.UiModalGrid<HomeDiskSlot>({
                modalScopeId: HOME_DISK_MODAL_SCOPE,
                controls: this.createDiskControls(),
                titleId: "load",
                columnCount: HOME_DISK_COLUMN_COUNT,
                controlWidth: HOME_DISK_ITEM_WIDTH,
                controlHeight: HOME_DISK_ITEM_HEIGHT,
                controlStyle: ui.UiButtonStyles.LightShadowedWhite,
                contentMargin: HOME_DISK_MODAL_MARGIN,
                titleGap: 4,
                panelColor: this.backgroundColor,
                titleColor: 1,
                onCancel: () => this.closeDiskModal(),
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
