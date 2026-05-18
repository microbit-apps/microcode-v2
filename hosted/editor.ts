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
    const EDITOR_PAGE_SCOPE = "editor/page"
    const EDITOR_PAGE_SCROLL_OWNER = "editor/page-scroll"
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
            this.toolbar_ = new EditorToolbar(
                () => this.progdef_,
                () => this.currPage_,
                this.pageView_,
            )
            this.pageView_.setToolbar(this.toolbar_)
            this.add(this.pageView_, {
                x: 0,
                y: EDITOR_CONTENT_Y,
                width: UI_SCREEN_WIDTH,
                height: UI_SCREEN_HEIGHT - EDITOR_CONTENT_Y,
            })
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

        public enter(runtime: ui.UiRuntime): void {
            super.enter(runtime)
            this.toolbar_.focusDefault(this.focus)
        }

        public handleScreenInput(event: ui.UiInputEvent): boolean | undefined {
            if (event.action == "cancel") {
                if (event.phase != "released") this.handleBack()
                return true
            }
            if (event.action == "menu") {
                if (event.phase != "released")
                    runProgramIfStopped(this.progdef_)
                return true
            }
            if (event.action == "wheel") return this.handleWheel(event)
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

        private handleBack(): void {
            if (this.pageView_.handleBack(this.focus, this.toolbar_)) return
            if (this.currPage_ == 0) this.navigation_.launchHome()
        }

        private handleWheel(event: ui.UiInputEvent): boolean {
            if (event.dy === undefined || event.dy == 0) return true
            if (event.dy < 0) this.moveEditorFocus("up")
            else this.moveEditorFocus("down")
            return true
        }

        private moveEditorFocus(direction: ui.UiFocusDirection): void {
            const activeScopeId = this.focus.getActiveScopeId()
            if (activeScopeId == EDITOR_PAGE_SCOPE) {
                this.pageView_.moveFocus(this.focus, direction)
                return
            }
            const result = this.toolbar_.moveFocus(this.focus, direction)
            if (result && result.kind == "focused" && result.scrollRequest)
                this.pageView_.handleScrollRequest(result.scrollRequest)
        }
    }

    class PageView implements ui.UiFocusableView<PageViewResult> {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private getProgram_: () => ProgramDefn
        private getPage_: () => number
        private contentLayout_: PageContentLayout
        private scrollLayout_: ui.UiScrollViewportLayout
        private focusNavigator_: PageFocusNavigator
        private toolbar_: EditorToolbar
        private focus_: ui.UiFocusState
        private layout_: PageLayout
        private navigationRows_: PageNavigationTarget[][]
        private navigationTargets_: PageNavigationTarget[]
        private measuredContentWidth_: number
        private measuredContentHeight_: number
        private buttonView_: ui.UiButtonView
        private focusStyle_: ui.UiButtonStyle

        constructor(getProgram: () => ProgramDefn, getPage: () => number) {
            this.layoutSpec = {
                width: { mode: "fixed", value: UI_SCREEN_WIDTH },
                height: {
                    mode: "fixed",
                    value: UI_SCREEN_HEIGHT - EDITOR_CONTENT_Y,
                },
            }
            this.finalRect = new ui.Rect()
            this.layoutDirty = true
            this.getProgram_ = getProgram
            this.getPage_ = getPage
            this.measuredContentWidth_ = 0
            this.measuredContentHeight_ = 0
            this.contentLayout_ = new PageContentLayout(this)
            this.scrollLayout_ = new ui.UiScrollViewportLayout({
                layoutSpec: this.layoutSpec,
                child: this.contentLayout_,
                scrollX: true,
                scrollY: true,
            })
            this.focusNavigator_ = new PageFocusNavigator(this)
            this.toolbar_ = undefined
            this.focus_ = undefined
            this.layout_ = undefined
            this.navigationRows_ = []
            this.navigationTargets_ = []
            this.buttonView_ = new ui.UiButtonView({
                style: ui.UiButtonStyles.Transparent,
            })
            this.focusStyle_ = ui.UiButtonStyles.Transparent
        }

        public measure(
            constraints: ui.UiLayoutConstraints,
            output: ui.UiMeasuredSize,
        ): void {
            this.scrollLayout_.measure(constraints, output)
            this.clearLayoutInvalidation()
        }

        public arrange(rect: ui.Rect): void {
            this.finalRect.copyFrom(rect)
            this.scrollLayout_.arrange(rect)
            this.rebuildLayout(true)
            this.clearLayoutInvalidation()
        }

        public invalidateLayout(): void {
            this.layoutDirty = true
            this.scrollLayout_.invalidateLayout()
        }

        public clearLayoutInvalidation(): void {
            this.layoutDirty = false
            this.scrollLayout_.clearLayoutInvalidation()
        }

        public registerFocusTargets(focus: ui.UiFocusState): void {
            this.focus_ = focus
            this.refreshFocusTargets()
        }

        public registerNavigation(controller: ui.UiFocusInputController): void {
            controller.setNavigation(EDITOR_PAGE_SCOPE, this.focusNavigator_)
        }

        public setToolbar(toolbar: EditorToolbar): void {
            this.toolbar_ = toolbar
        }

        public focusDefault(focus: ui.UiFocusState): ui.UiFocusSetResult {
            this.refreshFocusTargets()
            const result = focus.setActiveScope(EDITOR_PAGE_SCOPE)
            this.handleFocusScrollResult(result)
            return result
        }

        public handleFocusInput(result: ui.UiFocusInputResult): PageViewResult {
            if (result.kind == "activated")
                return this.activationResult(result)
            if (result.kind == "hit" && result.action == "pointerMove") {
                this.focusPointerTarget(result)
                return undefined
            }
            if (result.kind == "moved" && result.scrollRequest) {
                this.handleScrollRequest(result.scrollRequest)
                return undefined
            }
            if (result.kind == "exited" && result.detail)
                return this.exitResult(result.detail.moveResult)
            return undefined
        }

        public render(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus?: ui.UiFocusState,
        ): void {
            this.rebuildLayout()
            const page = this.layout_
            if (!page) return
            this.drawPage(surface, page)
            this.drawFocus(surface, assets, focus, page)
        }

        public measureContent(output: ui.UiMeasuredSize): void {
            const page = this.measurePageContent()
            output.set(
                page ? page.width : 0,
                page ? page.height : 0,
                page ? page.width : 0,
                page ? page.height : 0,
            )
            this.measuredContentWidth_ = output.preferredWidth
            this.measuredContentHeight_ = output.preferredHeight
        }

        public handleBack(
            focus: ui.UiFocusState,
            toolbar: EditorToolbar,
        ): boolean {
            if (focus.getActiveScopeId() != EDITOR_PAGE_SCOPE) return false
            const position = this.currentPosition(focus)
            if (!position) return false
            if (position.column == 0) {
                toolbar.focusRun(focus)
                return true
            }
            this.focusPosition(focus, position.row, 0)
            return true
        }

        public moveFocus(
            focus: ui.UiFocusState,
            direction: ui.UiFocusDirection,
        ): boolean {
            const result = this.focusNavigator_.move({
                scopeId: EDITOR_PAGE_SCOPE,
                currentTargetId: focus.getActiveTargetId(EDITOR_PAGE_SCOPE),
                direction,
            })
            if (!result || result.kind != "moved") return false
            const focusResult = focus.setActiveTarget(
                result.toScopeId,
                result.toTargetId,
            )
            if (!this.handleFocusScrollResult(focusResult) && result.scrollRequest)
                this.handleScrollRequest(result.scrollRequest)
            return true
        }

        public navigationRows(): PageNavigationTarget[][] {
            this.rebuildLayout()
            return this.navigationRows_
        }

        public defaultNavigationTarget(): ui.UiFocusNavigationTarget {
            const rows = this.navigationRows()
            if (rows.length && rows[0].length) return rows[0][0].navigation
            return undefined
        }

        public nearestNavigationTarget(
            source: ui.UiFocusNavigationTarget,
        ): ui.UiFocusNavigationTarget {
            if (!source) return this.defaultNavigationTarget()
            const targets = this.allNavigationTargets()
            let nearest: PageNavigationTarget = undefined
            let nearestDistance = 0
            const sourceX = source.rect.x + Math.idiv(source.rect.width, 2)
            const sourceY = source.rect.y + Math.idiv(source.rect.height, 2)
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                const rect = this.pageTargetComparisonRect(target)
                const dx = rect.x + Math.idiv(rect.width, 2) - sourceX
                const dy = rect.y + Math.idiv(rect.height, 2) - sourceY
                const distance = dx * dx + dy * dy
                if (!nearest || distance < nearestDistance) {
                    nearest = target
                    nearestDistance = distance
                }
            }
            return nearest ? nearest.navigation : undefined
        }

        public nearestToolbarTarget(
            source: PageNavigationTarget,
        ): ui.UiFocusTargetReference {
            if (!this.toolbar_ || !source) return undefined
            const rect = this.fixedScopeExitComparisonRect(source)
            return this.toolbar_.nearestTargetReference(
                {
                    id: source.navigation.id,
                    rect,
                },
            )
        }

        public handleScrollRequest(request: ui.UiFocusScrollRequest): void {
            if (request.scrollOwnerId != EDITOR_PAGE_SCROLL_OWNER) return
            this.scrollLayout_.scrollContentRectIntoView(request.targetRect)
            this.scrollLayout_.arrange(this.finalRect)
            this.rebuildLayout(true)
            this.refreshFocusTargets()
        }

        public atVerticalBoundary(direction: ui.UiFocusDirection): boolean {
            if (direction == "up") return this.scrollLayout_.contentOffsetY == 0
            if (direction == "down") {
                const maxOffset = Math.max(
                    this.measuredContentHeight_ - this.finalRect.height,
                    0,
                )
                return this.scrollLayout_.contentOffsetY >= maxOffset
            }
            return true
        }

        public verticalBoundaryScrollRect(
            direction: ui.UiFocusDirection,
        ): ui.Rect {
            const x = this.scrollLayout_.contentOffsetX
            const width = Math.max(this.finalRect.width, 1)
            if (direction == "down")
                return new ui.Rect(
                    x,
                    Math.max(this.measuredContentHeight_ - 1, 0),
                    width,
                    1,
                )
            return new ui.Rect(x, 0, width, 1)
        }

        private pageLayout(): PageLayout {
            const page = this.currentPage()
            if (!page) return undefined

            const rules = this.layoutRules(page)
            const content = this.arrangeRules(rules)
            const viewport = new ui.Rect()
            const contentRect = new ui.Rect()
            this.scrollLayout_.getViewportRect(viewport)
            this.scrollLayout_.getContentRect(contentRect)
            return {
                control: this.pageControl(page),
                viewport,
                content: contentRect,
                contentWidth: content.width,
                contentHeight: content.height,
                rules,
            }
        }

        private measurePageContent(): ui.Size {
            const page = this.currentPage()
            if (!page) return undefined
            const rules = this.layoutRules(page)
            return this.arrangeRules(rules)
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

        private arrangeRules(rules: RuleView[]): ui.Size {
            let top = EDITOR_PAGE_MARGIN
            let maxTrayWidth = 0
            let contentBounds: ui.Rect = undefined

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

            for (let i = 0; i < rules.length; i++) {
                const bounds = rules[i].contentBounds()
                if (contentBounds) contentBounds.union(bounds)
                else contentBounds = bounds
            }

            if (!contentBounds) return new ui.Size(0, 0)
            return new ui.Size(
                Math.max(contentBounds.right + EDITOR_PAGE_MARGIN, UI_SCREEN_WIDTH),
                Math.max(
                    contentBounds.bottom + EDITOR_PAGE_MARGIN,
                    UI_SCREEN_HEIGHT - EDITOR_CONTENT_Y,
                ),
            )
        }

        private drawPage(surface: ui.DrawSurface, page: PageLayout): void {
            for (let i = 0; i < page.rules.length; i++) {
                const rule = page.rules[i]
                if (!rule.isVisible(page)) continue
                rule.draw(surface, page)
            }
        }

        private drawFocus(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus: ui.UiFocusState,
            page: PageLayout,
        ): void {
            if (!focus || focus.getActiveScopeId() != EDITOR_PAGE_SCOPE) return
            const targetId = focus.getActiveTargetId(EDITOR_PAGE_SCOPE)
            const target = this.targetByFocusId(targetId)
            if (!target) return
            this.buttonView_.renderFocus(
                surface,
                target.viewportRect,
                { bitmap: target.control.bitmap },
                {
                    focused: true,
                    style: this.focusStyle_,
                    contentRect: target.viewportRect,
                    labelBounds: page.viewport,
                },
            )
        }

        private rebuildLayout(force?: boolean): void {
            if (!force && !this.layoutDirty && this.layout_) return
            this.layout_ = this.pageLayout()
            this.rebuildNavigationCache()
        }

        private refreshFocusTargets(): void {
            if (!this.focus_) return
            this.rebuildLayout()
            this.focus_.setScope({
                id: EDITOR_PAGE_SCOPE,
                preferredTargetId: this.preferredTargetId(),
            })
            const targets = this.allNavigationTargets()
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                this.focus_.setTarget({
                    id: target.navigation.id,
                    scopeId: EDITOR_PAGE_SCOPE,
                    rect: target.viewportRect,
                    disabled: false,
                    hidden: false,
                    activatable: true,
                    scrollOwnerId: EDITOR_PAGE_SCROLL_OWNER,
                    scrollRect: target.contentRect,
                    hitTestOrder: 1,
                })
            }
        }

        private allNavigationTargets(): PageNavigationTarget[] {
            this.rebuildLayout()
            return this.navigationTargets_
        }

        private pageTargetComparisonRect(target: PageNavigationTarget): ui.Rect {
            if (target.viewportRect.width && target.viewportRect.height)
                return target.viewportRect
            if (!this.layout_) return target.viewportRect
            return new ui.Rect(
                this.layout_.content.x + target.contentRect.x,
                this.layout_.content.y + target.contentRect.y,
                target.contentRect.width,
                target.contentRect.height,
            )
        }

        private fixedScopeExitComparisonRect(
            target: PageNavigationTarget,
        ): ui.Rect {
            return new ui.Rect(
                this.finalRect.x + target.contentRect.x,
                this.finalRect.y + target.contentRect.y,
                target.contentRect.width,
                target.contentRect.height,
            )
        }

        private rebuildNavigationCache(): void {
            this.navigationRows_ = []
            this.navigationTargets_ = []
            if (!this.layout_) return
            for (let i = 0; i < this.layout_.rules.length; i++) {
                const row = this.layout_.rules[i].navigationTargets(this.layout_)
                if (!row.length) continue
                this.navigationRows_.push(row)
                for (let column = 0; column < row.length; column++)
                    this.navigationTargets_.push(row[column])
            }
        }

        private preferredTargetId(): ui.UiFocusId {
            const target = this.defaultNavigationTarget()
            return target ? target.id : undefined
        }

        private activationResult(
            result: ui.UiFocusInputResult,
        ): PageViewResult {
            const activation =
                result.detail && result.detail.activationResult
                    ? result.detail.activationResult
                    : undefined
            if (
                !activation ||
                activation.kind != "activated" ||
                activation.scopeId != EDITOR_PAGE_SCOPE
            )
                return undefined
            const target = this.targetByFocusId(activation.targetId)
            if (!target) return undefined
            return {
                kind: "activated",
                controlId: target.control.id,
                value: target.control.value,
                control: target.control,
                deferred: true,
            }
        }

        private exitResult(
            result: ui.UiFocusMoveResult,
        ): PageViewResult {
            if (
                !result ||
                result.kind != "exited" ||
                result.scopeId != EDITOR_PAGE_SCOPE
            )
                return undefined
            return {
                kind: "exited",
                direction: result.direction,
                scopeId: result.scopeId,
            }
        }

        private focusPointerTarget(result: ui.UiFocusInputResult): void {
            if (!this.focus_ || !result.detail) return
            const hit = result.detail.hitTestResult
            if (!hit || hit.kind != "hit") return
            if (hit.scopeId != EDITOR_PAGE_SCOPE) return
            const focusResult = this.focus_.setActiveTarget(
                hit.scopeId,
                hit.targetId,
            )
            if (!this.handleFocusScrollResult(focusResult))
                this.scrollTargetIntoView(hit.targetId)
        }

        private currentPosition(
            focus: ui.UiFocusState,
        ): PageTargetPosition {
            return this.positionForTargetId(
                focus.getActiveTargetId(EDITOR_PAGE_SCOPE),
            )
        }

        private focusPosition(
            focus: ui.UiFocusState,
            row: number,
            column: number,
        ): void {
            const rows = this.navigationRows()
            if (row < 0 || row >= rows.length) return
            const targets = rows[row]
            if (column < 0 || column >= targets.length) return
            const target = targets[column].navigation
            const result = focus.setActiveTarget(EDITOR_PAGE_SCOPE, target.id)
            if (!this.handleFocusScrollResult(result))
                this.scrollTargetIntoView(target.id)
        }

        private positionForTargetId(
            targetId: ui.UiFocusId,
        ): PageTargetPosition {
            const rows = this.navigationRows()
            for (let row = 0; row < rows.length; row++) {
                for (let column = 0; column < rows[row].length; column++) {
                    if (rows[row][column].navigation.id == targetId)
                        return { row, column }
                }
            }
            return undefined
        }

        private targetByFocusId(
            targetId: ui.UiFocusId,
        ): PageNavigationTarget {
            const targets = this.allNavigationTargets()
            for (let i = 0; i < targets.length; i++) {
                if (targets[i].navigation.id == targetId) return targets[i]
            }
            return undefined
        }

        private handleFocusScrollResult(result: ui.UiFocusSetResult): boolean {
            if (result.kind == "focused" && result.scrollRequest) {
                this.handleScrollRequest(result.scrollRequest)
                return true
            }
            return false
        }

        private scrollTargetIntoView(targetId: ui.UiFocusId): void {
            const target = this.targetByFocusId(targetId)
            if (!target) return
            this.handleScrollRequest({
                scopeId: EDITOR_PAGE_SCOPE,
                targetId,
                scrollOwnerId: EDITOR_PAGE_SCROLL_OWNER,
                targetRect: target.contentRect,
                reason: "focus",
            })
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
        private arrow_: RuleIconLayout
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
            this.arrow_ = this.staticIcon("rule_arrow")
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

        public contentBounds(): ui.Rect {
            return new ui.Rect(
                this.x_ + this.tray_.x,
                this.y_ + this.tray_.y,
                this.tray_.width,
                this.tray_.height,
            )
        }

        public isVisible(page: PageLayout): boolean {
            const y = page.content.y + this.y_
            return (
                y + this.tray_.y <= page.viewport.bottom &&
                y + this.tray_.bottom >= page.viewport.y
            )
        }

        public draw(surface: ui.DrawSurface, page: PageLayout): void {
            this.fillRect(surface, page, this.tray_, EDITOR_RULE_TRAY_COLOR)
            this.fillRect(
                surface,
                page,
                this.when_,
                EDITOR_WHEN_SECTION_COLOR,
            )
            this.outlineTray(surface, page)
            this.drawTarget(surface, page, this.handle_)
            if (this.whenInsert_)
                this.drawTarget(surface, page, this.whenInsert_)
            this.drawTarget(surface, page, this.arrow_)
            if (this.doInsert_)
                this.drawTarget(surface, page, this.doInsert_)
            this.drawTargetRun(surface, page, this.whenTargets_)
            this.drawTargetRun(surface, page, this.doTargets_)
        }

        public navigationTargets(page: PageLayout): PageNavigationTarget[] {
            const targets = this.orderedTargets()
            const result: PageNavigationTarget[] = []
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                const contentRect = this.targetContentRect(target)
                const viewportRect = this.targetViewportRect(page, contentRect)
                result.push({
                    control: target.control,
                    contentRect,
                    viewportRect,
                    navigation: {
                        id: EDITOR_PAGE_SCOPE + "/" + target.control.id,
                        rect: viewportRect,
                        scrollOwnerId: EDITOR_PAGE_SCROLL_OWNER,
                        scrollRect: contentRect,
                        hidden:
                            viewportRect.width == 0 || viewportRect.height == 0,
                    },
                })
            }
            return result
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
                bitmap,
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

        private staticIcon(bitmapId: string): RuleIconLayout {
            const bitmap = this.bitmap(bitmapId)
            const iconBounds = this.iconBounds(bitmap)
            return {
                bitmap,
                framed: false,
                centerX: 0,
                bounds: iconBounds.clone(),
                iconBounds,
            }
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

        private targetBounds(target: RuleIconLayout): ui.Rect {
            return new ui.Rect(
                target.centerX + target.bounds.x,
                target.bounds.y,
                target.bounds.width,
                target.bounds.height,
            )
        }

        private drawTargetRun(
            surface: ui.DrawSurface,
            page: PageLayout,
            targets: RuleTargetLayout[],
        ): void {
            for (let i = 0; i < targets.length; i++) {
                if (!this.isTargetVisibleX(page, targets[i])) continue
                this.drawTarget(surface, page, targets[i])
            }
        }

        private fillRect(
            surface: ui.DrawSurface,
            page: PageLayout,
            rect: ui.Rect,
            color: number,
        ): void {
            surface.fillRect(this.absoluteRect(page.content, rect), color)
        }

        private outlineTray(
            surface: ui.DrawSurface,
            page: PageLayout,
        ): void {
            const absolute = this.absoluteRect(page.content, this.tray_)
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
            page: PageLayout,
            target: RuleIconLayout,
        ): void {
            const iconRect = this.targetIconRect(page.content, target)
            if (target.framed) {
                surface.fillRect(iconRect, 1)
                surface.drawRect(iconRect, 1)
            }
            surface.drawBitmap(target.bitmap, iconRect.x, iconRect.y)
        }

        private targetIconRect(
            viewport: ui.Rect,
            target: RuleIconLayout,
        ): ui.Rect {
            return new ui.Rect(
                viewport.x + this.x_ + target.centerX + target.iconBounds.x,
                viewport.y + this.y_ + target.iconBounds.y,
                target.iconBounds.width,
                target.iconBounds.height,
            )
        }

        private isTargetVisibleX(
            page: PageLayout,
            target: RuleIconLayout,
        ): boolean {
            const x = page.content.x + this.x_ + target.centerX
            const halfWidth = target.bitmap.width >> 1
            return (
                x + halfWidth >= page.viewport.x &&
                x - halfWidth <= page.viewport.right
            )
        }

        private orderedTargets(): RuleTargetLayout[] {
            const result: RuleTargetLayout[] = []
            result.push(this.handle_)
            this.pushTargets(result, this.whenTargets_)
            if (this.whenInsert_) result.push(this.whenInsert_)
            this.pushTargets(result, this.doTargets_)
            if (this.doInsert_) result.push(this.doInsert_)
            return result
        }

        private pushTargets(
            result: RuleTargetLayout[],
            targets: RuleTargetLayout[],
        ): void {
            for (let i = 0; i < targets.length; i++) result.push(targets[i])
        }

        private targetContentRect(target: RuleIconLayout): ui.Rect {
            return new ui.Rect(
                this.x_ + target.centerX + target.bounds.x,
                this.y_ + target.bounds.y,
                target.bounds.width,
                target.bounds.height,
            )
        }

        private targetViewportRect(
            page: PageLayout,
            contentRect: ui.Rect,
        ): ui.Rect {
            const absolute = new ui.Rect(
                page.content.x + contentRect.x,
                page.content.y + contentRect.y,
                contentRect.width,
                contentRect.height,
            )
            const left = Math.max(absolute.x, page.viewport.x)
            const top = Math.max(absolute.y, page.viewport.y)
            const right = Math.min(absolute.right, page.viewport.right)
            const bottom = Math.min(absolute.bottom, page.viewport.bottom)
            return new ui.Rect(
                left,
                top,
                Math.max(right - left, 0),
                Math.max(bottom - top, 0),
            )
        }
    }

    interface PageLayout {
        control: ui.UiControl<PageControlValue>
        viewport: ui.Rect
        content: ui.Rect
        contentWidth: number
        contentHeight: number
        rules: RuleView[]
    }

    type PageViewResult =
        | {
              kind: "activated"
              controlId: string
              value: RuleTargetControlValue
              control: ui.UiControl<RuleTargetControlValue>
              deferred: boolean
          }
        | {
              kind: "exited"
              direction: ui.UiFocusDirection
              scopeId: ui.UiFocusScopeId
          }

    interface PageNavigationTarget {
        control: ui.UiControl<RuleTargetControlValue>
        contentRect: ui.Rect
        viewportRect: ui.Rect
        navigation: ui.UiFocusNavigationTarget
    }

    interface PageTargetPosition {
        row: number
        column: number
    }

    class PageContentLayout implements ui.UiLayoutNode {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private owner_: PageView

        constructor(owner: PageView) {
            this.owner_ = owner
            this.layoutSpec = {
                width: { mode: "content" },
                height: { mode: "content" },
            }
            this.finalRect = new ui.Rect()
            this.layoutDirty = true
        }

        public measure(
            constraints: ui.UiLayoutConstraints,
            output: ui.UiMeasuredSize,
        ): void {
            this.owner_.measureContent(output)
            this.clearLayoutInvalidation()
        }

        public arrange(rect: ui.Rect): void {
            this.finalRect.copyFrom(rect)
            this.clearLayoutInvalidation()
        }

        public invalidateLayout(): void {
            this.layoutDirty = true
        }

        public clearLayoutInvalidation(): void {
            this.layoutDirty = false
        }
    }

    class PageFocusNavigator implements ui.UiFocusNavigationProvider {
        private owner_: PageView

        constructor(owner: PageView) {
            this.owner_ = owner
        }

        public move(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult | undefined {
            const rows = this.owner_.navigationRows()
            if (!rows.length) return undefined
            const position = this.positionForTarget(rows, request.currentTargetId)
            if (!position)
                return this.moveToTarget(
                    undefined,
                    undefined,
                    rows[0][0].navigation,
                )

            switch (request.direction) {
                case "left":
                    return this.moveLeft(rows, position)
                case "right":
                    return this.moveRight(rows, position)
                case "up":
                    return this.moveUp(rows, position)
                case "down":
                    return this.moveDown(rows, position)
            }

            return undefined
        }

        private moveLeft(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
        ): ui.UiFocusMoveResult {
            let row = position.row
            let column = position.column - 1
            if (column < 0) {
                row--
                if (row < 0) row = rows.length - 1
                column = rows[row].length - 1
            }
            return this.moveToPosition(rows, position, row, column)
        }

        private moveRight(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
        ): ui.UiFocusMoveResult {
            let row = position.row
            let column = position.column + 1
            if (column >= rows[row].length) {
                row++
                if (row >= rows.length) row = 0
                column = 0
            }
            return this.moveToPosition(rows, position, row, column)
        }

        private moveUp(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
        ): ui.UiFocusMoveResult {
            if (position.row == 0) {
                if (!this.owner_.atVerticalBoundary("up"))
                    return this.boundaryScrollMove(rows, position, "up")
                const target = this.owner_.nearestToolbarTarget(
                    rows[position.row][position.column],
                )
                if (target)
                    return {
                        kind: "moved",
                        fromScopeId: EDITOR_PAGE_SCOPE,
                        fromTargetId:
                            rows[position.row][position.column].navigation.id,
                        toScopeId: target.scopeId,
                        toTargetId: target.targetId,
                    }
                return {
                    kind: "moved",
                    fromScopeId: EDITOR_PAGE_SCOPE,
                    fromTargetId: rows[position.row][position.column].navigation.id,
                    toScopeId: EDITOR_TOOLBAR_SCOPE,
                    toTargetId: EDITOR_TOOLBAR_SCOPE + "/run",
                }
            }
            return this.moveToPosition(
                rows,
                position,
                position.row - 1,
                Math.min(position.column, rows[position.row - 1].length - 1),
            )
        }

        private moveDown(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
        ): ui.UiFocusMoveResult {
            if (position.row == rows.length - 1) {
                if (!this.owner_.atVerticalBoundary("down"))
                    return this.boundaryScrollMove(rows, position, "down")
                return {
                    kind: "stayed",
                    scopeId: EDITOR_PAGE_SCOPE,
                    targetId: rows[position.row][position.column].navigation.id,
                    reason: "boundary",
                }
            }
            return this.moveToPosition(
                rows,
                position,
                position.row + 1,
                Math.min(position.column, rows[position.row + 1].length - 1),
            )
        }

        private moveToPosition(
            rows: PageNavigationTarget[][],
            from: PageTargetPosition,
            row: number,
            column: number,
        ): ui.UiFocusMoveResult {
            return this.moveToTarget(
                rows[from.row][from.column].navigation.id,
                EDITOR_PAGE_SCOPE,
                rows[row][column].navigation,
            )
        }

        private boundaryScrollMove(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
            direction: ui.UiFocusDirection,
        ): ui.UiFocusMoveResult {
            const target = rows[position.row][position.column].navigation
            return {
                kind: "moved",
                fromScopeId: EDITOR_PAGE_SCOPE,
                fromTargetId: target.id,
                toScopeId: EDITOR_PAGE_SCOPE,
                toTargetId: target.id,
                scrollRequest: {
                    scopeId: EDITOR_PAGE_SCOPE,
                    targetId: target.id,
                    scrollOwnerId: EDITOR_PAGE_SCROLL_OWNER,
                    targetRect: this.owner_.verticalBoundaryScrollRect(direction),
                    reason: "focus",
                },
            }
        }

        private moveToTarget(
            fromTargetId: ui.UiFocusId,
            fromScopeId: ui.UiFocusScopeId,
            target: ui.UiFocusNavigationTarget,
        ): ui.UiFocusMoveResult {
            const result: ui.UiFocusMoveResult = {
                kind: "moved",
                fromScopeId: fromScopeId || EDITOR_PAGE_SCOPE,
                fromTargetId,
                toScopeId: EDITOR_PAGE_SCOPE,
                toTargetId: target.id,
            }
            if (target.scrollOwnerId !== undefined) {
                result.scrollRequest = {
                    scopeId: EDITOR_PAGE_SCOPE,
                    targetId: target.id,
                    scrollOwnerId: target.scrollOwnerId,
                    targetRect: (target.scrollRect || target.rect).clone(),
                    reason: "focus",
                }
            }
            return result
        }

        private positionForTarget(
            rows: PageNavigationTarget[][],
            targetId: ui.UiFocusId,
        ): PageTargetPosition {
            for (let row = 0; row < rows.length; row++) {
                for (let column = 0; column < rows[row].length; column++) {
                    if (rows[row][column].navigation.id == targetId)
                        return { row, column }
                }
            }
            return undefined
        }
    }

    type RuleSection = "sensors" | "filters" | "actuators" | "modifiers"

    type RuleTargetKind = "handle" | "tile" | "insert"

    interface RuleIconLayout {
        bitmap: Bitmap
        framed: boolean
        centerX: number
        bounds: ui.Rect
        iconBounds: ui.Rect
    }

    interface RuleTargetLayout extends RuleIconLayout {
        control: ui.UiControl<RuleTargetControlValue>
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

        constructor(
            getProgram: () => ProgramDefn,
            getPage: () => number,
            pageView: PageView,
        ) {
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
                    },
                    {
                        fromScopeId: EDITOR_PAGE_SELECTOR_SCOPE,
                        direction: "left",
                        toScopeId: EDITOR_TOOLBAR_SCOPE,
                    },
                    {
                        fromScopeId: EDITOR_TOOLBAR_SCOPE,
                        direction: "down",
                        toScopeId: EDITOR_PAGE_SCOPE,
                    },
                    {
                        fromScopeId: EDITOR_PAGE_SELECTOR_SCOPE,
                        direction: "down",
                        toScopeId: EDITOR_PAGE_SCOPE,
                    },
                ],
                (
                    scopeId: ui.UiFocusScopeId,
                    source: ui.UiFocusNavigationTarget,
                ) => {
                    if (scopeId == EDITOR_PAGE_SCOPE)
                        return pageView.nearestNavigationTarget(source)
                    return undefined
                },
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

        public focusRun(focus: ui.UiFocusState): ui.UiFocusSetResult {
            return focus.setActiveTarget(
                EDITOR_TOOLBAR_SCOPE,
                EDITOR_TOOLBAR_SCOPE + "/run",
            )
        }

        public moveFocus(
            focus: ui.UiFocusState,
            direction: ui.UiFocusDirection,
        ): ui.UiFocusSetResult {
            const activeScopeId = focus.getActiveScopeId()
            const result = this.focusNavigator_.move({
                scopeId: activeScopeId,
                currentTargetId: focus.getActiveTargetId(activeScopeId),
                direction,
            })
            if (!result || result.kind != "moved") return undefined
            return focus.setActiveTarget(result.toScopeId, result.toTargetId)
        }

        public nearestTargetReference(
            source: ui.UiFocusNavigationTarget,
        ): ui.UiFocusTargetReference {
            return this.focusNavigator_.nearestTargetReference(source)
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
    }

    interface FocusScopeLink {
        fromScopeId: ui.UiFocusScopeId
        direction: ui.UiFocusDirection
        toScopeId: ui.UiFocusScopeId
    }

    interface FocusTargetResolver {
        (
            scopeId: ui.UiFocusScopeId,
            source: ui.UiFocusNavigationTarget,
        ): ui.UiFocusNavigationTarget
    }

    class FocusScopeNavigator<T> implements ui.UiFocusNavigationProvider {
        private scopes_: FocusScopeEntry<T>[]
        private links_: FocusScopeLink[]
        private externalTarget_: FocusTargetResolver
        private focus_: ui.UiFocusState

        constructor(
            scopes: FocusScopeEntry<T>[],
            links: FocusScopeLink[],
            externalTarget?: FocusTargetResolver,
        ) {
            this.scopes_ = scopes
            this.links_ = links
            this.externalTarget_ = externalTarget
            this.focus_ = undefined
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
            this.focus_ = focus
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
            if (result.kind == "hit" && result.action == "pointerMove") {
                this.focusPointerTarget(result)
                return undefined
            }
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

        public nearestTargetReference(
            source: ui.UiFocusNavigationTarget,
        ): ui.UiFocusTargetReference {
            let nearest: ui.UiFocusTargetReference = undefined
            let nearestDistance = 0
            for (let i = 0; i < this.scopes_.length; i++) {
                const target = this.nearestTargetInScope(this.scopes_[i], source)
                if (!target) continue
                const distance = this.targetDistance(source, target)
                if (!nearest || distance < nearestDistance) {
                    nearest = {
                        scopeId: this.scopes_[i].row.scopeId,
                        targetId: target.id,
                    }
                    nearestDistance = distance
                }
            }
            return nearest
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
            })
            if (result.kind == "exited") return this.moveThroughLink(result)
            if (result.kind == "stayed" && result.reason == "boundary")
                return this.moveThroughBoundary(request)
            return result
        }

        private moveThroughBoundary(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult {
            const result = this.moveThroughLink({
                kind: "exited",
                scopeId: request.scopeId,
                targetId: request.currentTargetId,
                direction: request.direction,
            })
            if (result.kind == "moved") return result
            return {
                kind: "stayed",
                scopeId: request.scopeId,
                targetId: request.currentTargetId,
                reason: "boundary",
            }
        }

        private moveThroughLink(
            exit: ui.UiFocusMoveResult,
        ): ui.UiFocusMoveResult {
            if (exit.kind != "exited") return exit
            for (let i = 0; i < this.links_.length; i++) {
                const link = this.links_[i]
                if (
                    link.fromScopeId != exit.scopeId ||
                    link.direction != exit.direction
                )
                    continue
                const target = this.targetForLink(link, exit)
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
            exit: ui.UiFocusMoveResult,
        ): ui.UiFocusNavigationTarget {
            const scope = this.scopeById(link.toScopeId)
            if (!scope) return this.externalTargetForLink(link, exit)
            const source = this.sourceTargetForLink(link, exit)
            const nearest = this.nearestTargetInScope(scope, source)
            if (nearest) return nearest
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

        private externalTargetForLink(
            link: FocusScopeLink,
            exit: ui.UiFocusMoveResult,
        ): ui.UiFocusNavigationTarget {
            if (!this.externalTarget_) return undefined
            const source = this.sourceTargetForLink(link, exit)
            return this.externalTarget_(link.toScopeId, source)
        }

        private sourceTargetForLink(
            link: FocusScopeLink,
            exit: ui.UiFocusMoveResult,
        ): ui.UiFocusNavigationTarget {
            const sourceScope = this.scopeById(link.fromScopeId)
            return sourceScope && exit.kind == "exited"
                ? this.targetByTargetId(sourceScope, exit.targetId)
                : undefined
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

        private nearestTargetInScope(
            scope: FocusScopeEntry<T>,
            source: ui.UiFocusNavigationTarget,
        ): ui.UiFocusNavigationTarget {
            if (!source) return undefined
            const targets = this.navigationTargets(scope)
            let nearest: ui.UiFocusNavigationTarget = undefined
            let nearestDistance = 0
            const sourceX = source.rect.x + Math.idiv(source.rect.width, 2)
            const sourceY = source.rect.y + Math.idiv(source.rect.height, 2)
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                if (target.disabled || target.hidden) continue
                const distance = this.targetDistanceFromCenter(
                    target,
                    sourceX,
                    sourceY,
                )
                if (!nearest || distance < nearestDistance) {
                    nearest = target
                    nearestDistance = distance
                }
            }
            return nearest
        }

        private targetDistance(
            source: ui.UiFocusNavigationTarget,
            target: ui.UiFocusNavigationTarget,
        ): number {
            const sourceX = source.rect.x + Math.idiv(source.rect.width, 2)
            const sourceY = source.rect.y + Math.idiv(source.rect.height, 2)
            return this.targetDistanceFromCenter(target, sourceX, sourceY)
        }

        private targetDistanceFromCenter(
            target: ui.UiFocusNavigationTarget,
            sourceX: number,
            sourceY: number,
        ): number {
            const dx = target.rect.x + Math.idiv(target.rect.width, 2) - sourceX
            const dy = target.rect.y + Math.idiv(target.rect.height, 2) - sourceY
            return dx * dx + dy * dy
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

        private focusPointerTarget(result: ui.UiFocusInputResult): void {
            if (!this.focus_ || !result.detail) return
            const hit = result.detail.hitTestResult
            if (!hit || hit.kind != "hit") return
            if (!this.scopeById(hit.scopeId)) return
            this.focus_.setActiveTarget(hit.scopeId, hit.targetId)
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

    }
}
