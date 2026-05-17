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
        private actionButtonView_: ui.UiButtonView
        private diskItems_: ui.UiActionItem<HomeDiskSlot>[]
        private diskModal_: ui.UiModalGrid<HomeDiskSlot>
        private diskModalRect_: ui.Rect
        private diskModalSize_: ui.UiMeasuredSize
        private iconRect_: ui.Rect
        private rowLayout_: ui.UiAlignLayout
        private rowBandRect_: ui.Rect
        private labelRect_: ui.Rect
        private yOffset_: number

        constructor(navigation: AppNavigation) {
            this.navigation_ = navigation
            this.actions_ = this.createActions()
            this.diskItems_ = this.createDiskItems()
            this.actionButtonView_ = new ui.UiButtonView({
                style: ui.UiButtonStyles.Transparent,
            })
            // Widgets are retained objects. Build them once, then update their
            // layout, focus registration, and render pass as screen state changes.
            this.row_ = new ui.UiActionRow<HomeAction>({
                scopeId: HOME_ACTION_SCOPE,
                items: this.actions_,
                itemWidth: HOME_ACTION_WIDTH,
                itemHeight: HOME_ACTION_HEIGHT,
                gap: HOME_ACTION_GAP,
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
            this.diskModalRect_ = new ui.Rect()
            this.diskModalSize_ = new ui.UiMeasuredSize()
            this.iconRect_ = new ui.Rect()
            this.rowBandRect_ = new ui.Rect()
            this.labelRect_ = new ui.Rect()
            this.layoutActions()
            this.yOffset_ = -(UI_DESIGN_HEIGHT >> 1)
        }

        public enter(runtime: ui.UiRuntime, input: ui.UiInputScope): void {
            // The host owns the runtime. Screens keep only the runtime services
            // they need after `enter`; Home needs asset and text resolution.
            this.assets_ = runtime.assets
            this.widgets_ = new ui.UiWidgetController()
            this.registerFocus()
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
            this.row_.render(surface, this.assets_, this.widgets_.focus)
            if (this.diskModal_) {
                this.diskModal_.render(surface, this.assets_, this.widgets_.focus)
            }
        }

        public handleInput(event: ui.UiInputEvent): boolean {
            return event.action == "cancel"
        }

        private createActions(): ui.UiActionItem<HomeAction>[] {
            const actions: ui.UiActionItem<HomeAction>[] = [
                this.createAction("edit", "edit_program", "C0"),
                this.createAction("samples", "smiley_buttons", "C1"),
                this.createAction("load", "largeDisk", "load"),
            ]
            if (HOME_ADD_SETTINGS) {
                actions.push(
                    this.createAction(
                        "settings",
                        "largeSettingsGear",
                        "settings",
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
                }
            })
        }

        private createAction(
            value: HomeAction,
            bitmapId: string,
            textId: string,
        ): ui.UiActionItem<HomeAction> {
            // Action items carry typed app values. The widget reports which
            // value was activated; app navigation stays in this screen.
            return {
                id: value,
                value,
                bitmapId,
                textId,
                draw: (
                    surface: ui.DrawSurface,
                    item: ui.UiActionItem<HomeAction>,
                    rect: ui.Rect,
                    focused: boolean,
                ) => this.drawAction(surface, item, rect, focused),
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

        private layoutDiskModal(): void {
            if (!this.diskModal_) return
            this.diskModal_.measure(
                { maxWidth: UI_DESIGN_WIDTH, maxHeight: UI_DESIGN_HEIGHT },
                this.diskModalSize_,
            )
            this.diskModalRect_.set(
                Math.idiv(
                    UI_DESIGN_WIDTH - this.diskModalSize_.preferredWidth,
                    2,
                ),
                Math.idiv(
                    UI_DESIGN_HEIGHT - this.diskModalSize_.preferredHeight,
                    2,
                ),
                this.diskModalSize_.preferredWidth,
                this.diskModalSize_.preferredHeight,
            )
            this.diskModal_.arrange(this.diskModalRect_)
        }

        private actionCenterY(): number {
            return (UI_DESIGN_HEIGHT >> 1) + HOME_ACTION_CENTER_OFFSET_Y
        }

        private registerFocus(): void {
            // Focus registration happens after layout because focus targets need
            // final rectangles for controller movement and pointer hit testing.
            this.row_.registerFocusTargets(this.widgets_.focus, {
                id: HOME_ACTION_SCOPE,
                preferredTargetId: this.row_.resolvePreferredTargetId(),
            })
            this.row_.registerNavigation(this.widgets_.focusInput)
            this.row_.focusDefault(this.widgets_.focus)
        }

        private handleFocusInput(event: ui.UiInputEvent): boolean {
            if (this.diskModal_) return this.handleDiskModalInput(event)
            // Root Home consumes B/cancel without changing screens. Release is
            // left unhandled because press already handled the root behavior.
            if (event.action == "cancel" && event.phase != "released")
                return true
            return this.widgets_.handleInput(event, result => {
                const rowResult = this.row_.handleFocusInput(result)
                if (rowResult && rowResult.kind == "activated") {
                    this.dispatchAction(rowResult.value)
                    return true
                }
                return undefined
            })
        }

        private dispatchAction(action: HomeAction): void {
            // Navigation remains app-owned. Home decides the action; AppNavigation
            // decides how that action changes the current app surface.
            switch (action) {
                case "edit":
                    this.navigation_.launchEditor()
                    break
                case "samples":
                    this.navigation_.launchSamples()
                    break
                case "load":
                    this.openDiskModal()
                    break
                case "settings":
                    this.navigation_.launchSettings()
                    break
            }
        }

        private openDiskModal(): void {
            if (this.diskModal_) return
            this.diskModal_ = new ui.UiModalGrid<HomeDiskSlot>({
                parentScopeId: HOME_ACTION_SCOPE,
                modalScopeId: HOME_DISK_MODAL_SCOPE,
                items: this.diskItems_,
                titleId: "load",
                columnCount: HOME_DISK_COLUMN_COUNT,
                itemWidth: HOME_DISK_ITEM_WIDTH,
                itemHeight: HOME_DISK_ITEM_HEIGHT,
                buttonStyle: ui.UiButtonStyles.LightShadowedWhite,
                contentMargin: HOME_DISK_MODAL_MARGIN,
                panelColor: this.backgroundColor,
                titleColor: 1,
            })
            this.layoutDiskModal()
            this.diskModal_.open(
                this.widgets_.focus,
                this.widgets_.focusInput,
            )
        }

        private handleDiskModalInput(event: ui.UiInputEvent): boolean {
            return this.widgets_.handleInput(event, result => {
                const modalResult = this.diskModal_.handleFocusInput(result)
                if (modalResult) {
                    this.handleDiskModalResult(modalResult)
                    return true
                }
                if (event.action == "pointerClick" && result.kind == "miss")
                    return true
                return undefined
            })
        }

        private handleDiskModalResult(
            result: ui.UiModalGridResult<HomeDiskSlot>,
        ): void {
            if (result.kind == "activated") {
                const slot = result.value
                let buf = settings.readBuffer(slot)
                if (!buf) buf = this.createEmptyProgramBuffer()
                settings.writeBuffer(SAVESLOT_AUTO, buf)
                this.closeDiskModal()
                this.navigation_.launchEditor()
            } else if (result.kind == "cancelled") {
                this.closeDiskModal()
            }
        }

        private closeDiskModal(): void {
            if (!this.diskModal_) return
            const modalScopeId = this.diskModal_.modalScopeId
            this.diskModal_.close(this.widgets_.focus)
            this.widgets_.focusInput.clearNavigation(modalScopeId)
            this.widgets_.focus.removeScope(modalScopeId)
            this.diskModal_ = undefined
        }

        private createEmptyProgramBuffer(): Buffer {
            const buf = Buffer.create(6)
            for (let i = 0; i < 5; ++i) buf[i] = Tid.END_OF_PAGE
            buf[5] = Tid.END_OF_PROG
            return buf
        }

        private drawAction(
            surface: ui.DrawSurface,
            item: ui.UiActionItem<HomeAction>,
            rect: ui.Rect,
            focused: boolean,
        ): void {
            const bitmap = this.assets_.getBitmap(item.bitmapId, true)
            this.actionButtonView_.render(
                surface,
                rect,
                { bitmap },
                { focused, contentRect: this.iconRect_ },
            )
            if (focused && bitmap) {
                const text = this.actionText(item)
                if (text.length > 0) {
                    this.drawActionFocusLabel(
                        surface,
                        text,
                        this.iconRect_.x + Math.idiv(this.iconRect_.width, 2),
                        this.iconRect_.y +
                            this.iconRect_.height -
                            1 +
                            HOME_FOCUS_THICKNESS +
                            2,
                    )
                }
            } else if (focused) {
                const text = this.actionText(item)
                if (text.length > 0) {
                    this.drawActionFocusLabel(
                        surface,
                        text,
                        rect.x + Math.idiv(rect.width, 2),
                        rect.y + rect.height - 1 + HOME_FOCUS_THICKNESS + 2,
                    )
                }
            }
        }

        private drawActionFocusLabel(
            surface: ui.DrawSurface,
            text: string,
            centerX: number,
            top: number,
        ): void {
            const font = user_interface_base.font
            const textWidth = font.charWidth * text.length
            const textHeight = font.charHeight
            const maxX = Math.max(1, UI_DESIGN_WIDTH - 1 - textWidth)
            const x = Math.max(1, Math.min(maxX, centerX - (textWidth >> 1)))
            const y = Math.min(top, UI_DESIGN_HEIGHT - 1 - font.charHeight)

            this.labelRect_.set(x - 1, y - 1, textWidth + 1, textHeight + 2)
            surface.fillRect(this.labelRect_, HOME_FOCUS_LABEL_BACKGROUND)
            surface.drawText(text, x, y, {
                color: HOME_FOCUS_LABEL_COLOR,
                font,
            })
        }

        private actionText(item: ui.UiActionItem<HomeAction>): string {
            if (item.text !== undefined) return item.text
            if (item.textId !== undefined)
                return this.assets_.getText(item.textId)
            return ""
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
