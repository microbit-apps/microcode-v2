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

    /**
     * Home screen implemented directly on `ui-core` and `ui-widgets`.
     *
     * This screen is intentionally small enough to be a reference for app
     * screens: app code owns flow decisions, widgets own reusable focus and
     * activation mechanics, and all drawing happens through the frame surface.
     */
    export class HomeScreen implements ui.UiScreen {
        public backgroundColor = 0xc
        private navigation_: AppNavigation
        private screen_: ui.UiScreenController
        private actions_: ui.UiControl<HomeAction>[]
        private row_: ui.UiControlRow<HomeAction>
        private actionButtonStyle_: ui.UiButtonStyle
        private diskControls_: ui.UiControl<HomeDiskSlot>[]
        private actionLabelBounds_: ui.Rect
        private yOffset_: number

        constructor(navigation: AppNavigation) {
            this.navigation_ = navigation
            this.screen_ = new ui.UiScreenController()
            this.actions_ = this.createActions()
            this.diskControls_ = this.createDiskControls()
            this.actionButtonStyle_ = ui.buttonStyle(
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
            this.actionLabelBounds_ = new ui.Rect(
                0,
                0,
                UI_SCREEN_WIDTH,
                UI_SCREEN_HEIGHT,
            )
            this.row_ = new ui.UiControlRow<HomeAction>({
                scopeId: HOME_ACTION_SCOPE,
                controls: this.actions_,
                controlWidth: HOME_ACTION_WIDTH,
                controlHeight: HOME_ACTION_HEIGHT,
                gap: HOME_ACTION_GAP,
                controlStyle: this.actionButtonStyle_,
                labelBounds: this.actionLabelBounds_,
            })

            this.screen_.add(this.row_, {
                x: 0,
                centerY: (UI_SCREEN_HEIGHT >> 1) + HOME_ACTION_CENTER_OFFSET_Y,
                width: UI_SCREEN_WIDTH,
                height: HOME_ACTION_HEIGHT,
                horizontalAlignment: "center",
                verticalAlignment: "center",
            })
            this.yOffset_ = -(UI_SCREEN_HEIGHT >> 1)
        }

        public enter(runtime: ui.UiRuntime, input: ui.UiInputScope): void {
            this.screen_.enter(runtime, input, event =>
                this.handleRootInput(event),
            )
        }

        public exit(): void {
            this.screen_.exit()
        }

        public render(surface: ui.DrawSurface): void {
            // Draw from back to front in one render pass. The host commits the
            // frame after this method returns.
            surface.clear(this.backgroundColor)
            this.drawLogo(surface)
            this.drawVersion(surface)
            this.screen_.render(surface)
        }

        private createActions(): ui.UiControl<HomeAction>[] {
            const actions: ui.UiControl<HomeAction>[] = [
                ui.createControl<HomeAction>("edit", "edit", {
                    bitmapId: "edit_program",
                    textId: "C0",
                    onActivate: () => this.navigation_.launchEditor(),
                }),
                ui.createControl<HomeAction>("samples", "samples", {
                    bitmapId: "smiley_buttons",
                    textId: "C1",
                    onActivate: () => this.navigation_.launchSamples(),
                }),
                ui.createControl<HomeAction>("load", "load", {
                    bitmapId: "largeDisk",
                    textId: "load",
                    onActivate: () => this.openDiskModal(),
                }),
            ]
            if (HOME_ADD_SETTINGS) {
                actions.push(
                    ui.createControl<HomeAction>("settings", "settings", {
                        bitmapId: "largeSettingsGear",
                        textId: "settings",
                        onActivate: () => this.navigation_.launchSettings(),
                    }),
                )
            }
            return actions
        }

        private createDiskControls(): ui.UiControl<HomeDiskSlot>[] {
            return diskSlots().map(slot =>
                ui.createControl<HomeDiskSlot>(slot, slot, {
                    bitmapId: slot,
                    onActivate: () => this.loadDiskSlot(slot),
                }),
            )
        }

        private handleRootInput(event: ui.UiInputEvent): boolean | undefined {
            // Root Home consumes B/cancel without changing screens. Release is
            // left unhandled because press already handled the root behavior.
            if (event.action == "cancel" && event.phase != "released")
                return true
            return undefined
        }

        private openDiskModal(): void {
            if (this.screen_.hasModal) return
            this.screen_.openModal(this.createDiskModal())
        }

        private createDiskModal(): ui.UiModalGrid<HomeDiskSlot> {
            return new ui.UiModalGrid<HomeDiskSlot>({
                parentScopeId: HOME_ACTION_SCOPE,
                modalScopeId: HOME_DISK_MODAL_SCOPE,
                controls: this.diskControls_,
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
            this.screen_.closeModal()
        }

        private drawLogo(surface: ui.DrawSurface): void {
            // The animation is ordinary screen state. It advances during render
            // because the host runs frames continuously while this screen is top.
            this.yOffset_ = Math.min(0, this.yOffset_ + 2)
            const t = control.millis()
            const dy = this.yOffset_ == 0 ? (Math.idiv(t, 800) & 1) - 1 : 0
            const word = this.screen_.assets.getBitmap("wordLogo")
            const microbit = this.screen_.assets.getBitmap("microbitLogo")
            const offset = (UI_SCREEN_HEIGHT >> 1) - word.height - HOME_MARGIN
            const y = offset + dy

            surface.drawBitmap(
                word,
                Math.idiv(UI_SCREEN_WIDTH - word.width, 2) + dy,
                y + this.yOffset_,
            )
            surface.drawBitmap(
                microbit,
                Math.idiv(UI_SCREEN_WIDTH - microbit.width, 2) + dy,
                y - word.height + this.yOffset_ + HOME_MARGIN,
            )
            if (!this.yOffset_) {
                const tagline = this.screen_.assets.getText("tagline")
                const font = bitmaps.font5
                surface.drawText(
                    tagline,
                    Math.idiv(UI_SCREEN_WIDTH + word.width, 2) +
                        dy -
                        font.charWidth * tagline.length,
                    offset + word.height + dy + this.yOffset_ + 1,
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
