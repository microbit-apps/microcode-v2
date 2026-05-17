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
        private assets_: ui.UiAssetResolver
        private widgets_: ui.UiWidgetController
        private actions_: ui.UiActionItem<HomeAction>[]
        private row_: ui.UiActionRow<HomeAction>
        private actionButtonStyle_: ui.UiButtonStyle
        private diskItems_: ui.UiActionItem<HomeDiskSlot>[]
        private rowLayout_: ui.UiAlignLayout
        private rowBandRect_: ui.Rect
        private actionLabelBounds_: ui.Rect
        private yOffset_: number

        constructor(navigation: AppNavigation) {
            this.navigation_ = navigation
            this.actions_ = this.createActions()
            this.diskItems_ = this.createDiskItems()
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
                UI_DESIGN_WIDTH,
                UI_DESIGN_HEIGHT,
            )
            // Widgets are retained objects. Build them once, then update their
            // layout, focus registration, and render pass as screen state changes.
            this.row_ = new ui.UiActionRow<HomeAction>({
                scopeId: HOME_ACTION_SCOPE,
                items: this.actions_,
                itemWidth: HOME_ACTION_WIDTH,
                itemHeight: HOME_ACTION_HEIGHT,
                gap: HOME_ACTION_GAP,
                buttonStyle: this.actionButtonStyle_,
                labelBounds: this.actionLabelBounds_,
            })

            this.rowLayout_ = new ui.UiAlignLayout({
                layoutSpec: {
                    width: { mode: "fixed", value: UI_DESIGN_WIDTH },
                    height: { mode: "fixed", value: HOME_ACTION_HEIGHT },
                },
                child: this.row_,
                horizontalAlignment: "center",
                verticalAlignment: "center",
            })
            this.rowBandRect_ = new ui.Rect()
            this.layoutActions()
            this.yOffset_ = -(UI_DESIGN_HEIGHT >> 1)
        }

        public enter(runtime: ui.UiRuntime, input: ui.UiInputScope): void {
            // The host owns the runtime. Screens keep only the runtime services
            // they need after `enter`; Home needs asset and text resolution.
            this.assets_ = runtime.assets
            this.widgets_ = new ui.UiWidgetController()
            this.widgets_.registerWidget(this.row_)
            this.widgets_.registerInput(input, event =>
                this.handleFocusInput(event),
            )
        }

        public exit(): void {
            this.assets_ = undefined
            this.widgets_ = undefined
        }

        public render(surface: ui.DrawSurface): void {
            // Draw from back to front in one render pass. The host commits the
            // frame after this method returns.
            surface.clear(this.backgroundColor)
            this.drawLogo(surface)
            this.drawVersion(surface)
            this.widgets_.render(surface, this.assets_, this.row_)
            this.widgets_.renderModal(surface, this.assets_)
        }

        public handleInput(event: ui.UiInputEvent): boolean {
            return event.action == "cancel"
        }

        private createActions(): ui.UiActionItem<HomeAction>[] {
            const actions: ui.UiActionItem<HomeAction>[] = [
                this.createAction("edit", "edit_program", "C0", () =>
                    this.navigation_.launchEditor(),
                ),
                this.createAction("samples", "smiley_buttons", "C1", () =>
                    this.navigation_.launchSamples(),
                ),
                this.createAction("load", "largeDisk", "load", () =>
                    this.openDiskModal(),
                ),
            ]
            if (HOME_ADD_SETTINGS) {
                actions.push(
                    this.createAction(
                        "settings",
                        "largeSettingsGear",
                        "settings",
                        () => this.navigation_.launchSettings(),
                    ),
                )
            }
            return actions
        }

        private createDiskItems(): ui.UiActionItem<HomeDiskSlot>[] {
            return diskSlots().map(slot => {
                return {
                    id: slot,
                    value: slot,
                    bitmapId: slot,
                    onActivate: () => this.loadDiskSlot(slot),
                }
            })
        }

        private createAction(
            value: HomeAction,
            bitmapId: string,
            textId: string,
            onActivate: () => void,
        ): ui.UiActionItem<HomeAction> {
            return {
                id: value,
                value,
                bitmapId,
                textId,
                onActivate,
            }
        }

        private layoutActions(): void {
            // `UiAlignLayout` owns centering the row within this screen band;
            // Home only chooses the vertical band where actions belong.
            this.rowBandRect_.set(
                0,
                this.actionCenterY() - Math.idiv(HOME_ACTION_HEIGHT, 2),
                UI_DESIGN_WIDTH,
                HOME_ACTION_HEIGHT,
            )
            this.rowLayout_.arrange(this.rowBandRect_)
        }

        private actionCenterY(): number {
            return (UI_DESIGN_HEIGHT >> 1) + HOME_ACTION_CENTER_OFFSET_Y
        }

        private handleFocusInput(event: ui.UiInputEvent): boolean {
            if (this.widgets_.hasModal)
                return this.widgets_.handleModalInput(event)
            // Root Home consumes B/cancel without changing screens. Release is
            // left unhandled because press already handled the root behavior.
            if (event.action == "cancel" && event.phase != "released")
                return true
            return this.widgets_.handleInput(event, this.row_)
        }

        private openDiskModal(): void {
            if (this.widgets_.hasModal) return
            this.widgets_.openModal(this.createDiskModal(), {
                constraints: {
                    maxWidth: UI_DESIGN_WIDTH,
                    maxHeight: UI_DESIGN_HEIGHT,
                },
            })
        }

        private createDiskModal(): ui.UiModalGrid<HomeDiskSlot> {
            return new ui.UiModalGrid<HomeDiskSlot>({
                parentScopeId: HOME_ACTION_SCOPE,
                modalScopeId: HOME_DISK_MODAL_SCOPE,
                items: this.diskItems_,
                titleId: "load",
                columnCount: HOME_DISK_COLUMN_COUNT,
                itemWidth: HOME_DISK_ITEM_WIDTH,
                itemHeight: HOME_DISK_ITEM_HEIGHT,
                buttonStyle: ui.UiButtonStyles.LightShadowedWhite,
                contentMargin: HOME_DISK_MODAL_MARGIN,
                titleGap: 4,
                panelColor: this.backgroundColor,
                titleColor: 1,
                onCancel: () => this.closeDiskModal(),
            })
        }

        private loadDiskSlot(slot: HomeDiskSlot): void {
            let buf = settings.readBuffer(slot)
            if (!buf) buf = this.createEmptyProgramBuffer()
            settings.writeBuffer(SAVESLOT_AUTO, buf)
            this.closeDiskModal()
            this.navigation_.launchEditor()
        }

        private closeDiskModal(): void {
            this.widgets_.closeModal()
        }

        private createEmptyProgramBuffer(): Buffer {
            const buf = Buffer.create(6)
            for (let i = 0; i < 5; ++i) buf[i] = Tid.END_OF_PAGE
            buf[5] = Tid.END_OF_PROG
            return buf
        }

        private drawLogo(surface: ui.DrawSurface): void {
            // The animation is ordinary screen state. It advances during render
            // because the host runs frames continuously while this screen is top.
            this.yOffset_ = Math.min(0, this.yOffset_ + 2)
            const t = control.millis()
            const dy = this.yOffset_ == 0 ? (Math.idiv(t, 800) & 1) - 1 : 0
            const word = this.assets_.getBitmap("wordLogo")
            const microbit = this.assets_.getBitmap("microbitLogo")
            const offset = (UI_DESIGN_HEIGHT >> 1) - word.height - HOME_MARGIN
            const y = offset + dy

            surface.drawBitmap(
                word,
                Math.idiv(UI_DESIGN_WIDTH - word.width, 2) + dy,
                y + this.yOffset_,
            )
            surface.drawBitmap(
                microbit,
                Math.idiv(UI_DESIGN_WIDTH - microbit.width, 2) + dy,
                y - word.height + this.yOffset_ + HOME_MARGIN,
            )
            if (!this.yOffset_) {
                const tagline = this.assets_.getText("tagline")
                const font = bitmaps.font5
                surface.drawText(
                    tagline,
                    Math.idiv(UI_DESIGN_WIDTH + word.width, 2) +
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
                UI_DESIGN_WIDTH - font.charWidth * microcode.VERSION.length,
                UI_DESIGN_HEIGHT - font.charHeight - 1,
                { color: 0xb, font, transparent: true },
            )
        }
    }
}
