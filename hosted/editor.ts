namespace microcode {
    type EditorToolbarAction = "disk" | "run" | "stop" | "page"

    type EditorToolbarResult = ui.UiRowResult<EditorToolbarAction>

    interface PageControlValue {
        kind: "page"
        page: PageDefn
        pageIndex: number
    }

    interface RuleControlValue {
        kind: "rule"
        rule: RuleDefn
        ruleIndex: number
    }

    interface RuleTargetControlValue {
        kind: RuleTargetKind
        rule: RuleDefn
        ruleIndex: number
        section?: RuleSection
        index?: number
        tile?: Tile
    }

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
    const EDITOR_CONTENT_Y = EDITOR_TOOLBAR_HEIGHT + 2
    const EDITOR_PAGE_MARGIN = 10
    const EDITOR_RULE_MARGIN = 3
    const EDITOR_RULE_TRAY_COLOR = 11
    const EDITOR_WHEN_SECTION_COLOR = 13
    const EDITOR_RULE_OUTLINE_COLOR = 12

    /**
     * Brain editor screen.
     */
    export class EditorScreen extends ui.UiScreen {
        private navigation_: AppNavigation
        private app_: App
        private progdef_: ProgramDefn
        private currPage_: number
        private pageView_: PageView
        private toolbar_: EditorToolbar

        constructor(navigation: AppNavigation, app: App) {
            super()
            this.backgroundColor = EDITOR_BACKGROUND_COLOR
            this.navigation_ = navigation
            this.app_ = app
            this.currPage_ = 0
            this.loadProgram()
            this.pageView_ = new PageView(
                () => this.progdef_,
                () => this.currPage_,
            )
            this.pageView_.arrange(
                new ui.Rect(
                    0,
                    EDITOR_CONTENT_Y,
                    UI_SCREEN_WIDTH,
                    UI_SCREEN_HEIGHT - EDITOR_CONTENT_Y,
                ),
            )
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
            this.pageView_.render(surface)
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

    class PageView {
        private getProgram_: () => ProgramDefn
        private getPage_: () => number
        private viewportRect_: ui.Rect

        constructor(getProgram: () => ProgramDefn, getPage: () => number) {
            this.getProgram_ = getProgram
            this.getPage_ = getPage
            this.viewportRect_ = new ui.Rect()
        }

        public arrange(rect: ui.Rect): void {
            this.viewportRect_.copyFrom(rect)
        }

        public render(surface: ui.DrawSurface): void {
            const page = this.pageLayout()
            if (!page) return
            this.drawPage(surface, page)
        }

        private pageLayout(): PageLayout {
            const page = this.currentPage()
            if (!page) return undefined

            const rules = this.layoutRules(page)
            this.arrangeRules(rules)
            return {
                control: this.pageControl(page),
                viewport: this.viewportRect_.clone(),
                rules,
            }
        }

        private currentPage(): PageDefn {
            const program = this.getProgram_()
            return program ? program.pages[this.getPage_()] : undefined
        }

        private layoutRules(page: PageDefn): RuleView[] {
            const rules: RuleView[] = []
            let lastRule = page.rules.length - 1
            while (lastRule >= 0 && page.rules[lastRule].isEmpty()) lastRule--
            for (let i = 0; i <= lastRule; i++)
                rules.push(new RuleView(page.rules[i], rules.length))
            rules.push(new RuleView(new RuleDefn(), rules.length))
            return rules
        }

        private pageControl(page: PageDefn): ui.UiControl<PageControlValue> {
            const pageIndex = this.getPage_()
            return {
                id: "page-" + pageIndex,
                value: {
                    kind: "page",
                    page,
                    pageIndex,
                },
            }
        }

        private arrangeRules(rules: RuleView[]): void {
            let top = EDITOR_PAGE_MARGIN
            let maxTrayWidth = 0

            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i]
                if (i) {
                    top += rules[i - 1].height >> 1
                    top += rule.height >> 1
                    top += EDITOR_RULE_MARGIN
                }
                rule.setPosition(EDITOR_PAGE_MARGIN, top)
                maxTrayWidth = Math.max(maxTrayWidth, rule.width)
            }

            for (let i = 0; i < rules.length; i++)
                rules[i].setWidth(maxTrayWidth)
        }

        private drawPage(surface: ui.DrawSurface, page: PageLayout): void {
            for (let i = 0; i < page.rules.length; i++) {
                const rule = page.rules[i]
                if (!rule.isVisible(page.viewport)) continue
                rule.draw(surface, page.viewport)
            }
        }
    }

    class RuleView {
        public readonly control: ui.UiControl<RuleControlValue>
        public readonly rule: RuleDefn
        public readonly ruleIndex: number
        private x_: number
        private y_: number
        private tray_: ui.Rect
        private when_: ui.Rect
        private handle_: RuleTargetLayout
        private whenTargets_: RuleTargetLayout[]
        private whenInsert_: RuleTargetLayout
        private arrow_: RuleTargetLayout
        private doTargets_: RuleTargetLayout[]
        private doInsert_: RuleTargetLayout

        constructor(ruledef: RuleDefn, ruleIndex: number) {
            this.rule = ruledef
            this.ruleIndex = ruleIndex
            this.control = this.ruleControl(ruledef, ruleIndex)
            this.x_ = 0
            this.y_ = 0
            const ruleRep = ruledef.getRuleRep()
            this.tray_ = new ui.Rect()
            this.when_ = new ui.Rect()
            this.handle_ = this.iconTarget("handle", "rule_handle")
            this.whenTargets_ = this.whenTargets(ruleRep)
            this.whenInsert_ = this.whenInsertionTarget(ruledef)
            this.arrow_ = this.iconTarget("arrow", "rule_arrow")
            this.doTargets_ = this.doTargets(ruleRep)
            this.doInsert_ = this.doInsertionTarget(ruledef)
            this.placeTargets()
        }

        public get width(): number {
            return this.tray_.width
        }

        public get height(): number {
            return this.tray_.height
        }

        public setPosition(x: number, y: number): void {
            this.x_ = x
            this.y_ = y
        }

        public setWidth(width: number): void {
            this.tray_.width = width
        }

        public isVisible(viewport: ui.Rect): boolean {
            const y = viewport.y + this.y_
            return (
                y + this.tray_.y <= viewport.bottom &&
                y + this.tray_.bottom >= viewport.y
            )
        }

        public draw(surface: ui.DrawSurface, viewport: ui.Rect): void {
            this.fillRect(surface, viewport, this.tray_, EDITOR_RULE_TRAY_COLOR)
            this.fillRect(
                surface,
                viewport,
                this.when_,
                EDITOR_WHEN_SECTION_COLOR,
            )
            this.outlineTray(surface, viewport)
            this.drawTarget(surface, viewport, this.handle_)
            if (this.whenInsert_)
                this.drawTarget(surface, viewport, this.whenInsert_)
            this.drawTarget(surface, viewport, this.arrow_)
            if (this.doInsert_)
                this.drawTarget(surface, viewport, this.doInsert_)
            this.drawTargetRun(surface, viewport, this.whenTargets_)
            this.drawTargetRun(surface, viewport, this.doTargets_)
        }

        private ruleControl(
            rule: RuleDefn,
            ruleIndex: number,
        ): ui.UiControl<RuleControlValue> {
            return {
                id: "rule-" + ruleIndex,
                value: {
                    kind: "rule",
                    rule,
                    ruleIndex,
                },
            }
        }

        private whenTargets(ruleRep: RuleRep): RuleTargetLayout[] {
            return this.tileTargets("sensors", ruleRep.sensors).concat(
                this.tileTargets("filters", ruleRep.filters),
            )
        }

        private doTargets(ruleRep: RuleRep): RuleTargetLayout[] {
            return this.tileTargets("actuators", ruleRep.actuators).concat(
                this.tileTargets("modifiers", ruleRep.modifiers),
            )
        }

        private tileTargets(
            section: RuleSection,
            tiles: Tile[],
        ): RuleTargetLayout[] {
            const result: RuleTargetLayout[] = []
            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i]
                result.push(
                    this.targetLayout(
                        "tile",
                        getIcon(tile),
                        !getFieldEditor(tile),
                        section,
                        i,
                        tile,
                    ),
                )
            }
            return result
        }

        private targetLayout(
            kind: RuleTargetKind,
            icon: string | number | Bitmap,
            framed: boolean,
            section?: RuleSection,
            index?: number,
            tile?: Tile,
        ): RuleTargetLayout {
            const bitmap = this.bitmap(icon)
            const iconBounds = this.iconBounds(bitmap)
            const bounds = iconBounds.clone()
            if (framed) bounds.inflate(1)
            return {
                control: this.targetControl(kind, bitmap, section, index, tile),
                framed,
                centerX: 0,
                bounds,
                iconBounds,
            }
        }

        private iconTarget(
            kind: RuleTargetKind,
            bitmapId: string,
        ): RuleTargetLayout {
            return this.targetLayout(kind, bitmapId, false)
        }

        private targetControl(
            kind: RuleTargetKind,
            bitmap: Bitmap,
            section?: RuleSection,
            index?: number,
            tile?: Tile,
        ): ui.UiControl<RuleTargetControlValue> {
            return {
                id: this.targetId(kind, section, index),
                value: {
                    kind,
                    rule: this.rule,
                    ruleIndex: this.ruleIndex,
                    section,
                    index,
                    tile,
                },
                bitmap,
            }
        }

        private targetId(
            kind: RuleTargetKind,
            section?: RuleSection,
            index?: number,
        ): string {
            let id = this.control.id + "/" + kind
            if (section) id += "/" + section
            if (index !== undefined) id += "-" + index
            return id
        }

        private bitmap(icon: string | number | Bitmap): Bitmap {
            return typeof icon == "string" || typeof icon == "number"
                ? icons.get(icon)
                : icon
        }

        private iconBounds(bitmap: Bitmap): ui.Rect {
            return new ui.Rect(
                -(bitmap.width >> 1),
                -(bitmap.height >> 1),
                bitmap.width,
                bitmap.height,
            )
        }

        private whenInsertionTarget(rule: RuleDefn): RuleTargetLayout {
            if (rule.sensors.length == 0)
                return this.targetLayout(
                    "insert",
                    "when_insertion_point",
                    false,
                    "sensors",
                    0,
                )
            if (
                Language.getTileSuggestions(
                    rule,
                    "filters",
                    rule.filters.length,
                ).length
            )
                return this.targetLayout(
                    "insert",
                    "when_insertion_point",
                    false,
                    "filters",
                    rule.filters.length,
                )
            return undefined
        }

        private doInsertionTarget(rule: RuleDefn): RuleTargetLayout {
            if (rule.actuators.length == 0)
                return this.targetLayout(
                    "insert",
                    "do_insertion_point",
                    false,
                    "actuators",
                    0,
                )
            if (
                Language.getTileSuggestions(
                    rule,
                    "modifiers",
                    rule.modifiers.length,
                ).length
            )
                return this.targetLayout(
                    "insert",
                    "do_insertion_point",
                    false,
                    "modifiers",
                    rule.modifiers.length,
                )
            return undefined
        }

        private placeTargets(): void {
            const whenParts = this.withOptional(this.whenTargets_, this.whenInsert_)
            const doParts = this.withOptional(this.doTargets_, this.doInsert_)
            let x = 0

            this.handle_.centerX = x
            x += this.handle_.bounds.width
            x = this.placeTargetRun(
                whenParts,
                x + (whenParts[0].bounds.width >> 1) + 2,
            )
            const whenRight = x

            x += (this.arrow_.bounds.width >> 1) + 1
            this.arrow_.centerX = x
            x += this.arrow_.bounds.width + 2
            this.placeTargetRun(doParts, x)

            const tray = this.targetRunBounds(whenParts)
            this.addTargetRunBounds(tray, doParts)
            tray.inflate(1)
            tray.width = Math.max(tray.width, UI_SCREEN_WIDTH)
            this.tray_ = tray
            this.when_ = new ui.Rect(
                tray.x,
                tray.y,
                whenRight - tray.x + 1,
                tray.height,
            )
        }

        private withOptional(
            targets: RuleTargetLayout[],
            optional: RuleTargetLayout,
        ): RuleTargetLayout[] {
            if (!optional) return targets
            const result = targets.slice()
            result.push(optional)
            return result
        }

        private placeTargetRun(
            targets: RuleTargetLayout[],
            firstCenterX: number,
        ): number {
            let x = firstCenterX
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                if (i) {
                    const previous = targets[i - 1]
                    x += previous.bounds.width >> 1
                    x += target.bounds.width >> 1
                    x += 1
                }
                target.centerX = x
            }
            const last = targets[targets.length - 1]
            return last.centerX + (last.bounds.width >> 1)
        }

        private targetRunBounds(targets: RuleTargetLayout[]): ui.Rect {
            const result = this.targetBounds(targets[0])
            for (let i = 1; i < targets.length; i++)
                result.union(this.targetBounds(targets[i]))
            return result
        }

        private addTargetRunBounds(
            target: ui.Rect,
            targets: RuleTargetLayout[],
        ): void {
            for (let i = 0; i < targets.length; i++)
                target.union(this.targetBounds(targets[i]))
        }

        private targetBounds(target: RuleTargetLayout): ui.Rect {
            return new ui.Rect(
                target.centerX + target.bounds.x,
                target.bounds.y,
                target.bounds.width,
                target.bounds.height,
            )
        }

        private drawTargetRun(
            surface: ui.DrawSurface,
            viewport: ui.Rect,
            targets: RuleTargetLayout[],
        ): void {
            for (let i = 0; i < targets.length; i++) {
                if (!this.isTargetVisibleX(viewport, targets[i])) continue
                this.drawTarget(surface, viewport, targets[i])
            }
        }

        private fillRect(
            surface: ui.DrawSurface,
            viewport: ui.Rect,
            rect: ui.Rect,
            color: number,
        ): void {
            surface.fillRect(this.absoluteRect(viewport, rect), color)
        }

        private outlineTray(
            surface: ui.DrawSurface,
            viewport: ui.Rect,
        ): void {
            const absolute = this.absoluteRect(viewport, this.tray_)
            const left = absolute.x
            const top = absolute.y
            const right = absolute.x + absolute.width - 1
            const bottom = absolute.y + absolute.height - 1
            surface.drawLine(
                left - 1,
                top,
                left - 1,
                bottom,
                EDITOR_RULE_OUTLINE_COLOR,
            )
            surface.drawLine(
                right + 1,
                top,
                right + 1,
                bottom,
                EDITOR_RULE_OUTLINE_COLOR,
            )
            surface.drawLine(
                left,
                top - 1,
                right,
                top - 1,
                EDITOR_RULE_OUTLINE_COLOR,
            )
            surface.drawLine(
                left,
                bottom + 1,
                right,
                bottom + 1,
                EDITOR_RULE_OUTLINE_COLOR,
            )
        }

        private absoluteRect(
            viewport: ui.Rect,
            rect: ui.Rect,
        ): ui.Rect {
            return new ui.Rect(
                viewport.x + this.x_ + rect.x,
                viewport.y + this.y_ + rect.y,
                rect.width,
                rect.height,
            )
        }

        private drawTarget(
            surface: ui.DrawSurface,
            viewport: ui.Rect,
            target: RuleTargetLayout,
        ): void {
            const iconRect = this.targetIconRect(viewport, target)
            if (target.framed) {
                surface.fillRect(iconRect, 1)
                surface.drawRect(iconRect, 1)
            }
            surface.drawBitmap(target.control.bitmap, iconRect.x, iconRect.y)
        }

        private targetIconRect(
            viewport: ui.Rect,
            target: RuleTargetLayout,
        ): ui.Rect {
            return new ui.Rect(
                viewport.x + this.x_ + target.centerX + target.iconBounds.x,
                viewport.y + this.y_ + target.iconBounds.y,
                target.iconBounds.width,
                target.iconBounds.height,
            )
        }

        private isTargetVisibleX(
            viewport: ui.Rect,
            target: RuleTargetLayout,
        ): boolean {
            const x = viewport.x + this.x_ + target.centerX
            const halfWidth = target.control.bitmap.width >> 1
            return (
                x + halfWidth >= viewport.x &&
                x - halfWidth <= viewport.right
            )
        }
    }

    interface PageLayout {
        control: ui.UiControl<PageControlValue>
        viewport: ui.Rect
        rules: RuleView[]
    }

    type RuleSection = "sensors" | "filters" | "actuators" | "modifiers"

    type RuleTargetKind = "handle" | "tile" | "insert" | "arrow"

    interface RuleTargetLayout {
        control: ui.UiControl<RuleTargetControlValue>
        framed: boolean
        centerX: number
        bounds: ui.Rect
        iconBounds: ui.Rect
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
