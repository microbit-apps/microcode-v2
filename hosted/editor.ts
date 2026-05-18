namespace microcode {
    type EditorToolbarAction = "disk" | "run" | "stop" | "page"

    type EditorToolbarResult = ui.UiRowResult<EditorToolbarAction>

    const EDITOR_TOOLBAR_SCOPE = "editor/toolbar"
    const EDITOR_PAGE_SELECTOR_SCOPE = "editor/page-selector"
    const EDITOR_BACKGROUND_COLOR = 6
    const EDITOR_TOOLBAR_HEIGHT = 17
    const EDITOR_TOOLBAR_Y = -1
    const EDITOR_TOOLBAR_BUTTON_SIZE = 18
    const EDITOR_TOOLBAR_BUTTON_Y = 0
    const EDITOR_TOOLBAR_LEFT_X = 3
    const EDITOR_TOOLBAR_GAP = 2
    const EDITOR_TOOLBAR_LEFT_WIDTH =
        EDITOR_TOOLBAR_BUTTON_SIZE * 3 + EDITOR_TOOLBAR_GAP * 2
    const EDITOR_TOOLBAR_PAGE_X = UI_SCREEN_WIDTH - 21

    /**
     * Brain editor screen.
     */
    export class EditorScreen extends ui.UiScreen {
        private navigation_: AppNavigation
        private app_: App
        private progdef_: ProgramDefn
        private currPage_: number
        private toolbar_: EditorToolbar

        constructor(navigation: AppNavigation, app: App) {
            super()
            this.backgroundColor = EDITOR_BACKGROUND_COLOR
            this.navigation_ = navigation
            this.app_ = app
            this.currPage_ = 0
            this.loadProgram()
            this.toolbar_ = new EditorToolbar(
                () => this.progdef_,
                () => this.currPage_,
            )
            this.add(this.toolbar_, {
                x: 0,
                y: EDITOR_TOOLBAR_Y,
                width: UI_SCREEN_WIDTH,
                height: EDITOR_TOOLBAR_HEIGHT,
            })
        }

        public render(surface: ui.DrawSurface): void {
            surface.clear(this.backgroundColor)
            this.drawBackground(surface)
            super.render(surface)
        }

        public handleScreenInput(event: ui.UiInputEvent): boolean | undefined {
            if (event.action == "cancel") {
                if (event.phase != "released") this.navigation_.launchHome()
                return true
            }
            if (event.action == "menu") {
                if (event.phase != "released")
                    runProgramIfStopped(this.progdef_)
                return true
            }
            return undefined
        }

        public currentProgram(): ProgramDefn {
            return this.progdef_
        }

        private loadProgram(): void {
            const buf = this.app_.load(SAVESLOT_AUTO)
            if (!buf) {
                this.progdef_ = ProgramDefn.fromBuffer(
                    new BufferReader(samples(true)[1].source),
                )
                this.app_.save(SAVESLOT_AUTO, this.progdef_.toBuffer())
            } else {
                this.progdef_ = ProgramDefn.fromBuffer(new BufferReader(buf))
            }
        }

        private drawBackground(surface: ui.DrawSurface): void {
            let x = -(this.currPage_ << 4)
            while (x < UI_SCREEN_WIDTH) {
                surface.drawBitmap(editorBackground, x, 0)
                x += editorBackground.width
            }
        }
    }
    class EditorToolbar implements ui.UiFocusableView<EditorToolbarResult> {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private getProgram_: () => ProgramDefn
        private getPage_: () => number
        private runControl_: ui.UiControl<EditorToolbarAction>
        private stopControl_: ui.UiControl<EditorToolbarAction>
        private pageControl_: ui.UiControl<EditorToolbarAction>
        private toolbarRow_: ui.UiRow<EditorToolbarAction>
        private pageRow_: ui.UiRow<EditorToolbarAction>
        private focusNavigator_: FocusScopeNavigator<EditorToolbarAction>

        constructor(getProgram: () => ProgramDefn, getPage: () => number) {
            this.layoutSpec = {
                width: { mode: "fixed", value: UI_SCREEN_WIDTH },
                height: { mode: "fixed", value: EDITOR_TOOLBAR_HEIGHT },
            }
            this.finalRect = new ui.Rect()
            this.layoutDirty = true
            this.getProgram_ = getProgram
            this.getPage_ = getPage
            this.runControl_ = {
                id: "run",
                value: "run",
                textId: "run",
                onActivate: () => runProgramIfStopped(this.getProgram_()),
            }
            this.stopControl_ = {
                id: "stop",
                value: "stop",
                textId: "stop",
                onActivate: () => stopProgramIfRunning(),
            }
            this.pageControl_ = {
                id: "page",
                value: "page",
                onActivate: () => {},
            }
            const toolbarControls: ui.UiControl<EditorToolbarAction>[] = [
                {
                    id: "disk",
                    value: "disk",
                    bitmap: icondb.disk,
                    textId: "disk",
                    onActivate: () => {},
                },
                this.runControl_,
                this.stopControl_,
            ]
            const pageControls = [this.pageControl_]
            const controlStyle = ui.buttonStyle(
                ui.UiButtonStyles.BorderedPurple,
                ui.UiButtonStyles.RoundedFrame,
                ui.UiButtonStyles.FocusLabel,
                {
                    focusPadding: 1,
                    focusLabelGap: 3,
                    focusLabelFont: user_interface_base.font,
                },
            )
            this.toolbarRow_ = new ui.UiRow<EditorToolbarAction>({
                scopeId: EDITOR_TOOLBAR_SCOPE,
                controls: toolbarControls,
                defaultControlId: "disk",
                controlWidth: EDITOR_TOOLBAR_BUTTON_SIZE,
                controlHeight: EDITOR_TOOLBAR_BUTTON_SIZE,
                gap: EDITOR_TOOLBAR_GAP,
                controlStyle,
            })
            this.pageRow_ = new ui.UiRow<EditorToolbarAction>({
                scopeId: EDITOR_PAGE_SELECTOR_SCOPE,
                controls: pageControls,
                defaultControlId: "page",
                controlWidth: EDITOR_TOOLBAR_BUTTON_SIZE,
                controlHeight: EDITOR_TOOLBAR_BUTTON_SIZE,
                controlStyle,
            })
            this.focusNavigator_ = new FocusScopeNavigator<EditorToolbarAction>(
                [{ row: this.toolbarRow_ }, { row: this.pageRow_ }],
                [
                    {
                        fromScopeId: EDITOR_TOOLBAR_SCOPE,
                        direction: "right",
                        toScopeId: EDITOR_PAGE_SELECTOR_SCOPE,
                        toControlId: "page",
                    },
                    {
                        fromScopeId: EDITOR_PAGE_SELECTOR_SCOPE,
                        direction: "left",
                        toScopeId: EDITOR_TOOLBAR_SCOPE,
                        toControlId: "stop",
                    },
                ],
            )
        }

        public measure(
            constraints: ui.UiLayoutConstraints,
            output: ui.UiMeasuredSize,
        ): void {
            output.set(
                UI_SCREEN_WIDTH,
                EDITOR_TOOLBAR_HEIGHT,
                UI_SCREEN_WIDTH,
                EDITOR_TOOLBAR_HEIGHT,
            )
            this.clearLayoutInvalidation()
        }

        public arrange(rect: ui.Rect): void {
            this.finalRect.copyFrom(rect)
            this.toolbarRow_.arrange(
                new ui.Rect(
                    rect.x + EDITOR_TOOLBAR_LEFT_X,
                    rect.y + EDITOR_TOOLBAR_BUTTON_Y,
                    EDITOR_TOOLBAR_LEFT_WIDTH,
                    EDITOR_TOOLBAR_BUTTON_SIZE,
                ),
            )
            this.pageRow_.arrange(
                new ui.Rect(
                    rect.x + EDITOR_TOOLBAR_PAGE_X,
                    rect.y + EDITOR_TOOLBAR_BUTTON_Y,
                    EDITOR_TOOLBAR_BUTTON_SIZE,
                    EDITOR_TOOLBAR_BUTTON_SIZE,
                ),
            )
            this.clearLayoutInvalidation()
        }

        public invalidateLayout(): void {
            this.layoutDirty = true
            this.focusNavigator_.invalidateLayout()
        }

        public clearLayoutInvalidation(): void {
            this.layoutDirty = false
            this.focusNavigator_.clearLayoutInvalidation()
        }

        public registerFocusTargets(focus: ui.UiFocusState): void {
            this.focusNavigator_.registerFocusTargets(focus)
        }

        public registerNavigation(controller: ui.UiFocusInputController): void {
            this.focusNavigator_.registerNavigation(controller)
        }

        public focusDefault(focus: ui.UiFocusState): ui.UiFocusSetResult {
            return this.focusNavigator_.focusDefault(focus)
        }

        public handleFocusInput(
            result: ui.UiFocusInputResult,
        ): EditorToolbarResult {
            return this.focusNavigator_.handleFocusInput(result)
        }

        public render(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus?: ui.UiFocusState,
        ): void {
            this.updateProgramControls()
            this.focusNavigator_.render(surface, assets, focus)
        }

        private updateProgramControls(): void {
            const running = isProgramRunning()
            this.runControl_.bitmap = running ? icondb.runDisabled : icondb.run
            this.stopControl_.bitmap = running ? icondb.stop : icondb.stopDisabled
            this.pageControl_.bitmapId = PAGE_IDS()[this.getPage_()]
        }
    }

    interface FocusScopeEntry<T> {
        row: ui.UiRow<T>
        wrap?: boolean
    }

    interface FocusScopeLink {
        fromScopeId: ui.UiFocusScopeId
        direction: ui.UiFocusDirection
        toScopeId: ui.UiFocusScopeId
        fromControlId?: string
        toControlId?: string
    }

    class FocusScopeNavigator<T> implements ui.UiFocusNavigationProvider {
        private scopes_: FocusScopeEntry<T>[]
        private links_: FocusScopeLink[]

        constructor(
            scopes: FocusScopeEntry<T>[],
            links: FocusScopeLink[],
        ) {
            this.scopes_ = scopes
            this.links_ = links
        }

        public invalidateLayout(): void {
            for (let i = 0; i < this.scopes_.length; i++)
                this.scopes_[i].row.invalidateLayout()
        }

        public clearLayoutInvalidation(): void {
            for (let i = 0; i < this.scopes_.length; i++)
                this.scopes_[i].row.clearLayoutInvalidation()
        }

        public registerFocusTargets(focus: ui.UiFocusState): void {
            for (let i = 0; i < this.scopes_.length; i++)
                this.scopes_[i].row.registerFocusTargets(focus)
        }

        public registerNavigation(controller: ui.UiFocusInputController): void {
            for (let i = 0; i < this.scopes_.length; i++)
                controller.setNavigation(this.scopes_[i].row.scopeId, this)
        }

        public focusDefault(focus: ui.UiFocusState): ui.UiFocusSetResult {
            return this.scopes_[0].row.focusDefault(focus)
        }

        public handleFocusInput(
            result: ui.UiFocusInputResult,
        ): ui.UiRowResult<T> {
            for (let i = 0; i < this.scopes_.length; i++) {
                const rowResult = this.scopes_[i].row.handleFocusInput(result)
                if (rowResult) return rowResult
            }
            return undefined
        }

        public render(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus?: ui.UiFocusState,
        ): void {
            for (let i = 0; i < this.scopes_.length; i++)
                this.scopes_[i].row.render(surface, assets, focus)
        }

        public move(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult | undefined {
            const scope = this.scopeById(request.scopeId)
            if (!scope) return undefined
            const result = ui.moveFocusInRow({
                scopeId: scope.row.scopeId,
                currentTargetId: request.currentTargetId,
                direction: request.direction,
                targets: this.navigationTargets(scope),
                wrap: scope.wrap,
            })
            if (result.kind == "exited") return this.moveThroughLink(result)
            return result
        }

        private moveThroughLink(
            exit: ui.UiFocusMoveResult,
        ): ui.UiFocusMoveResult {
            if (exit.kind != "exited") return exit
            const controlId = this.controlIdFromTargetId(
                exit.scopeId,
                exit.targetId,
            )
            for (let i = 0; i < this.links_.length; i++) {
                const link = this.links_[i]
                if (
                    link.fromScopeId != exit.scopeId ||
                    link.direction != exit.direction ||
                    (link.fromControlId && link.fromControlId != controlId)
                )
                    continue
                const target = this.targetForLink(link)
                if (target) return this.movedTo(exit, link.toScopeId, target)
            }
            return exit
        }

        private movedTo(
            exit: ui.UiFocusMoveResult,
            scopeId: ui.UiFocusScopeId,
            target: ui.UiFocusNavigationTarget,
        ): ui.UiFocusMoveResult {
            if (exit.kind != "exited") return exit
            return {
                kind: "moved",
                fromScopeId: exit.scopeId,
                fromTargetId: exit.targetId,
                toScopeId: scopeId,
                toTargetId: target.id,
            }
        }

        private targetForLink(
            link: FocusScopeLink,
        ): ui.UiFocusNavigationTarget {
            if (link.toControlId)
                return this.targetByControlId(
                    link.toScopeId,
                    link.toControlId,
                )
            const scope = this.scopeById(link.toScopeId)
            if (!scope) return undefined
            const preferred = scope.row.resolvePreferredTargetId()
            if (preferred) {
                const preferredTarget = this.targetByTargetId(scope, preferred)
                if (preferredTarget) return preferredTarget
            }
            const targets = this.navigationTargets(scope)
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                if (!target.disabled && !target.hidden) return target
            }
            return undefined
        }

        private targetByControlId(
            scopeId: ui.UiFocusScopeId,
            controlId: string,
        ): ui.UiFocusNavigationTarget {
            const scope = this.scopeById(scopeId)
            if (!scope) return undefined
            return this.targetByTargetId(
                scope,
                this.targetId(scopeId, controlId),
            )
        }

        private targetByTargetId(
            scope: FocusScopeEntry<T>,
            targetId: ui.UiFocusId,
        ): ui.UiFocusNavigationTarget {
            const targets = this.navigationTargets(scope)
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                if (target.id == targetId && !target.disabled && !target.hidden)
                    return target
            }
            return undefined
        }

        private navigationTargets(
            scope: FocusScopeEntry<T>,
        ): ui.UiFocusNavigationTarget[] {
            const controls = scope.row.controls
            const targets: ui.UiFocusNavigationTarget[] = []
            for (let i = 0; i < controls.length; i++) {
                const control = controls[i]
                const rect = new ui.Rect()
                scope.row.getControlRect(control.id, rect)
                targets.push({
                    id: this.targetId(scope.row.scopeId, control.id),
                    rect,
                    disabled: control.disabled || false,
                    hidden: control.visible === false,
                })
            }
            return targets
        }

        private scopeById(
            scopeId: ui.UiFocusScopeId,
        ): FocusScopeEntry<T> {
            for (let i = 0; i < this.scopes_.length; i++) {
                const scope = this.scopes_[i]
                if (scope.row.scopeId == scopeId) return scope
            }
            return undefined
        }

        private targetId(
            scopeId: ui.UiFocusScopeId,
            controlId: string,
        ): ui.UiFocusId {
            return scopeId + "/" + controlId
        }

        private controlIdFromTargetId(
            scopeId: ui.UiFocusScopeId,
            targetId: ui.UiFocusId,
        ): string {
            const prefix = scopeId + "/"
            if (targetId && targetId.substr(0, prefix.length) == prefix)
                return targetId.substr(prefix.length)
            return undefined
        }
    }
}
