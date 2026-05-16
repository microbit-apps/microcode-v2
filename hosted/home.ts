namespace microcode {
    type HomeAction = "edit" | "samples" | "load" | "settings"

    const HOME_ACTION_SCOPE = "home/actions"
    const HOME_ADD_SETTINGS = false
    const HOME_ACTION_Y = 30
    const HOME_ACTION_WIDTH = 32
    const HOME_ACTION_HEIGHT = 33
    const HOME_ACTION_GAP = 8
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
        private focus_: ui.UiFocusState
        private input_: ui.UiFocusInputController
        private actions_: ui.UiActionItem<HomeAction>[]
        private row_: ui.UiActionRow<HomeAction>
        private rowRect_: ui.Rect
        private labelRect_: ui.Rect
        private yOffset_: number

        constructor(navigation: AppNavigation) {
            this.navigation_ = navigation
            this.actions_ = this.createActions()
            // Widgets are retained objects. Build them once, then update their
            // layout, focus registration, and render pass as screen state changes.
            this.row_ = new ui.UiActionRow<HomeAction>({
                scopeId: HOME_ACTION_SCOPE,
                items: this.actions_,
                itemWidth: HOME_ACTION_WIDTH,
                itemHeight: HOME_ACTION_HEIGHT,
                gap: HOME_ACTION_GAP,
            })
            this.rowRect_ = new ui.Rect()
            this.labelRect_ = new ui.Rect()
            this.layoutActions()
            this.yOffset_ = -(ui.LOGICAL_VIEWPORT_HEIGHT >> 1)
        }

        public enter(runtime: ui.UiRuntime, input: ui.UiInputScope): void {
            // The host owns the runtime. Screens keep only the runtime services
            // they need after `enter`; Home needs asset and text resolution.
            this.assets_ = runtime.assets
            // A screen owns its focus state. The runtime owns when this screen
            // receives input and frames; the screen decides how focus maps to
            // its widgets.
            this.focus_ = new ui.UiFocusState()
            this.input_ = new ui.UiFocusInputController({ focus: this.focus_ })
            this.registerFocus()
            this.registerInput(input)
        }

        public exit(): void {
            this.assets_ = undefined
            this.focus_ = undefined
            this.input_ = undefined
        }

        public render(surface: ui.DrawSurface): void {
            // Draw from back to front in one render pass. The host commits the
            // frame after this method returns.
            surface.clear(this.backgroundColor)
            this.drawLogo(surface)
            this.drawVersion(surface)
            this.row_.render(surface, this.assets_, this.focus_)
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
                    this.createAction("settings", "largeSettingsGear", "settings")
                )
            }
            return actions
        }

        private createAction(
            value: HomeAction,
            bitmapId: string,
            textId: string
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
                    focused: boolean
                ) => this.drawAction(surface, item, rect, focused),
            }
        }

        private layoutActions(): void {
            // Home actions use center-based visual targets. `UiActionRow` arranges
            // upper-left rectangles, so this translates the preserved centers
            // into the rectangle the row owns.
            const buttonStart = HOME_ADD_SETTINGS ? -60 : -40
            const left =
                this.oldX(buttonStart) - Math.idiv(HOME_ACTION_WIDTH, 2)
            const top =
                this.oldY(HOME_ACTION_Y) - Math.idiv(HOME_ACTION_HEIGHT, 2)
            this.rowRect_.set(
                left,
                top,
                this.actions_.length * HOME_ACTION_WIDTH +
                    (this.actions_.length - 1) * HOME_ACTION_GAP,
                HOME_ACTION_HEIGHT
            )
            this.row_.arrange(this.rowRect_)
        }

        private registerFocus(): void {
            // Focus registration happens after layout because focus targets need
            // final rectangles for controller movement and pointer hit testing.
            this.row_.registerFocusTargets(this.focus_, {
                id: HOME_ACTION_SCOPE,
                preferredTargetId: this.row_.resolvePreferredTargetId(),
            })
            this.row_.registerNavigation(this.input_)
            this.row_.focusDefault(this.focus_)
        }

        private registerInput(input: ui.UiInputScope): void {
            // `UiFocusInputController` converts semantic input events into
            // focus moves, activation, hit testing, and cancel results. The
            // screen still interprets the resulting app action.
            input.onAction("left", event => this.handleFocusInput(event))
            input.onAction("right", event => this.handleFocusInput(event))
            input.onAction("up", event => this.handleFocusInput(event))
            input.onAction("down", event => this.handleFocusInput(event))
            input.onAction("activate", event => this.handleFocusInput(event))
            input.onAction("cancel", event => this.handleFocusInput(event))
            input.onAction("pointerMove", event => this.handleFocusInput(event))
            input.onAction("pointerClick", event => this.handleFocusInput(event))
            input.onAction("wheel", event => this.handleFocusInput(event))
        }

        private handleFocusInput(event: ui.UiInputEvent): boolean {
            // Root Home consumes B/cancel without changing screens. Release is
            // left unhandled because press already handled the root behavior.
            if (event.action == "cancel" && event.phase != "released") return true
            const result = this.input_.handleInput(event)
            const rowResult = this.row_.handleFocusInput(result)
            if (rowResult && rowResult.kind == "activated") {
                this.dispatchAction(rowResult.value)
                return true
            }
            return result.handled
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
                    break
                case "settings":
                    this.navigation_.launchSettings()
                    break
            }
        }

        private drawAction(
            surface: ui.DrawSurface,
            item: ui.UiActionItem<HomeAction>,
            rect: ui.Rect,
            focused: boolean
        ): void {
            const bitmap = this.assets_.getBitmap(item.bitmapId, true)
            let focusX = rect.x
            let focusY = rect.y
            let focusWidth = rect.width
            let focusHeight = rect.height
            if (bitmap) {
                // Resolve assets through the runtime service. That keeps
                // screens testable against explicit dependencies.
                focusX = rect.x + Math.idiv(rect.width - bitmap.width, 2)
                focusY = rect.y + Math.idiv(rect.height - bitmap.height, 2)
                focusWidth = bitmap.width
                focusHeight = bitmap.height
                surface.drawBitmap(
                    bitmap,
                    focusX,
                    focusY
                )
            }
            if (focused) {
                this.drawActionFocus(
                    surface,
                    item,
                    focusX,
                    focusY,
                    focusWidth,
                    focusHeight
                )
            }
        }

        private drawActionFocus(
            surface: ui.DrawSurface,
            item: ui.UiActionItem<HomeAction>,
            x: number,
            y: number,
            width: number,
            height: number
        ): void {
            // The action focus visual has two parts: a thick outline on the
            // target and a text label placed below the focused icon.
            this.drawActionFocusRing(surface, x, y, width, height)

            const text = this.actionText(item)
            if (text.length > 0) {
                this.drawActionFocusLabel(
                    surface,
                    text,
                    x + Math.idiv(width, 2),
                    y + height - 1 + HOME_FOCUS_THICKNESS + 2
                )
            }
        }

        private drawActionFocusRing(
            surface: ui.DrawSurface,
            x: number,
            y: number,
            width: number,
            height: number
        ): void {
            const right = x + width - 1
            const bottom = y + height - 1
            for (let dist = 1; dist <= HOME_FOCUS_THICKNESS; dist++) {
                surface.drawLine(x - dist, y, x - dist, bottom, HOME_FOCUS_COLOR)
                surface.drawLine(
                    right + dist,
                    y,
                    right + dist,
                    bottom,
                    HOME_FOCUS_COLOR
                )
                surface.drawLine(x, y - dist, right, y - dist, HOME_FOCUS_COLOR)
                surface.drawLine(
                    x,
                    bottom + dist,
                    right,
                    bottom + dist,
                    HOME_FOCUS_COLOR
                )
                if (dist > 1) {
                    surface.drawLine(x - dist, y, x, y - dist, HOME_FOCUS_COLOR)
                    surface.drawLine(
                        right + dist,
                        y,
                        right,
                        y - dist,
                        HOME_FOCUS_COLOR
                    )
                    surface.drawLine(
                        x - dist,
                        bottom,
                        x,
                        bottom + dist,
                        HOME_FOCUS_COLOR
                    )
                    surface.drawLine(
                        right + dist,
                        bottom,
                        right,
                        bottom + dist,
                        HOME_FOCUS_COLOR
                    )
                }
            }
        }

        private drawActionFocusLabel(
            surface: ui.DrawSurface,
            text: string,
            centerX: number,
            top: number
        ): void {
            const font = user_interface_base.font
            const textWidth = font.charWidth * text.length
            const textHeight = font.charHeight
            const maxX = Math.max(
                1,
                ui.LOGICAL_VIEWPORT_WIDTH - 1 - textWidth
            )
            const x = Math.max(
                1,
                Math.min(maxX, centerX - (textWidth >> 1))
            )
            const y = Math.min(
                top,
                ui.LOGICAL_VIEWPORT_HEIGHT - 1 - font.charHeight
            )

            this.labelRect_.set(x - 1, y - 1, textWidth + 1, textHeight + 2)
            surface.fillRect(this.labelRect_, HOME_FOCUS_LABEL_BACKGROUND)
            surface.drawText(text, x, y, {
                color: HOME_FOCUS_LABEL_COLOR,
                font,
            })
        }

        private actionText(item: ui.UiActionItem<HomeAction>): string {
            if (item.text !== undefined) return item.text
            if (item.textId !== undefined) return this.assets_.getText(item.textId)
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
            const offset =
                (ui.LOGICAL_VIEWPORT_HEIGHT >> 1) - word.height - HOME_MARGIN
            const y = offset + dy

            surface.drawBitmap(
                word,
                Math.idiv(ui.LOGICAL_VIEWPORT_WIDTH - word.width, 2) + dy,
                y + this.yOffset_
            )
            surface.drawBitmap(
                microbit,
                Math.idiv(ui.LOGICAL_VIEWPORT_WIDTH - microbit.width, 2) + dy,
                y - word.height + this.yOffset_ + HOME_MARGIN
            )
            if (!this.yOffset_) {
                const tagline = this.assets_.getText("tagline")
                const font = bitmaps.font5
                surface.drawText(
                    tagline,
                    Math.idiv(ui.LOGICAL_VIEWPORT_WIDTH + word.width, 2) +
                        dy -
                        font.charWidth * tagline.length,
                    offset + word.height + dy + this.yOffset_ + 1,
                    { color: 0xb, font, transparent: true }
                )
            }
        }

        private drawVersion(surface: ui.DrawSurface): void {
            const font = bitmaps.font5
            surface.drawText(
                microcode.VERSION,
                ui.LOGICAL_VIEWPORT_WIDTH -
                    font.charWidth * microcode.VERSION.length,
                ui.LOGICAL_VIEWPORT_HEIGHT - font.charHeight - 1,
                { color: 0xb, font, transparent: true }
            )
        }

        private oldX(x: number): number {
            return x + (ui.LOGICAL_VIEWPORT_WIDTH >> 1)
        }

        private oldY(y: number): number {
            return y + (ui.LOGICAL_VIEWPORT_HEIGHT >> 1)
        }
    }
}
