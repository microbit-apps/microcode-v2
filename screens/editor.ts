namespace microcode {
    type EditorToolbarAction = "disk" | "run" | "stop" | "page"

    interface EditorToolbarControl extends ui.UiControl<EditorToolbarAction> {
        gapBefore?: number
    }

    interface EditorToolbarResult {
        kind: "activated"
    }
    type EditorDiskSlot = string
    type EditorPagePickerValue = number
    type RuleHandleAction = "add" | "delete" | "moveUp" | "moveDown"
    type TileSuggestionValue = Tile
    type FieldEditorModalValue = number

    const TILE_SUGGESTION_DELETE = -1
    const FIELD_EDITOR_COMMIT = -1
    const FIELD_EDITOR_DELETE = -2

    type TileSuggestionModalResult = ControlPickerResult<TileSuggestionValue>

    interface RuleTargetControlValue {
        kind: RuleTargetKind
        ruleIndex: number
        section?: RuleSection
        index?: number
    }

    interface RuleTargetFocus {
        ruleIndex: number
        kind: RuleTargetKind
        section?: RuleSection
        index?: number
    }

    const EDITOR_TOOLBAR_SCOPE = "editor/toolbar"
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
    const EDITOR_DISK_MODAL_SCOPE = "editor/disk-save"
    const EDITOR_PAGE_MODAL_SCOPE = "editor/page-picker"
    const EDITOR_RULE_HANDLE_MODAL_SCOPE = "editor/rule-handle"
    const EDITOR_TILE_SUGGESTION_MODAL_SCOPE = "editor/tile-suggestion"
    const EDITOR_NUMERIC_MODAL_SCOPE = "editor/numeric-entry"
    const EDITOR_FIELD_MODAL_SCOPE = "editor/field-editor"
    const EDITOR_FIELD_MODAL_CELL_SIZE = 16
    const EDITOR_FIELD_MODAL_MARGIN = 3
    const EDITOR_FIELD_MODAL_GRID_GAP = 1
    const EDITOR_MELODY_FIELD_MODAL_ROW_GAP = 0
    const EDITOR_RULE_WHEN_TILE_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.LightShadowedWhite,
        ui.UiButtonStyles.FocusLabel,
    )
    const EDITOR_RULE_DO_TILE_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.ShadowedWhite,
        ui.UiButtonStyles.FocusLabel,
    )
    const EDITOR_RULE_UNFRAMED_TILE_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.Transparent,
        ui.UiButtonStyles.FocusLabel,
    )
    const EDITOR_RULE_GENERATED_TILE_SIZE = 18
    // Intentionally omits `font`: the render path resolves the default font at
    // use time via `ui.locFont()`. Setting it here would capture
    // `bitmaps.font8` at module-init time, before the app assigns a per-language
    // font, and would never pick up a localized default.
    const EDITOR_RULE_GENERATED_TILE_CONTENT_STYLE: ui.UiButtonStyle = {
        color: 15,
        textPlacement: "content",
    }
    const EDITOR_RULE_SUBTLE_LABEL_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.Transparent,
        ui.UiButtonStyles.FocusLabel,
    )
    const EDITOR_RULE_HANDLE_STYLE = EDITOR_RULE_SUBTLE_LABEL_STYLE
    const EDITOR_RULE_HANDLE_MODAL_STYLE = ui.buttonStyle(
        AppStyles.ModalButton,
        ui.UiButtonStyles.FocusLabel,
    )
    const EDITOR_TILE_SUGGESTION_MODAL_STYLE = EDITOR_RULE_HANDLE_MODAL_STYLE
    const EDITOR_TILE_SUGGESTION_MAX_COLUMNS = 5
    const EDITOR_TILE_SUGGESTION_TITLE_GAP = EDITOR_FIELD_MODAL_GRID_GAP + 1
    const EDITOR_FIELD_DELETE_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.RedBorderedWhite,
        ui.UiButtonStyles.RoundedFrame,
        ui.UiButtonStyles.FocusLabel,
    )
    const EDITOR_FIELD_OK_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.GreenBorderedWhite,
        ui.UiButtonStyles.RoundedFrame,
    )

    function ruleTargetControlId(
        ruleIndex: number,
        kind: RuleTargetKind,
        section?: RuleSection,
        index?: number,
    ): string {
        let id = "rule-" + ruleIndex + "/" + kind
        if (section) id += "/" + section
        if (index !== undefined) id += "-" + index
        return id
    }

    function ruleFocusTargetId(
        ruleIndex: number,
        kind: RuleTargetKind,
        section?: RuleSection,
        index?: number,
    ): ui.UiFocusId {
        return (
            EDITOR_PAGE_SCOPE +
            "/" +
            ruleTargetControlId(ruleIndex, kind, section, index)
        )
    }

    function isNumericEntryTile(tile: Tile): boolean {
        const tid = getTid(tile)
        return (
            tid == Tid.TID_DECIMAL_EDITOR ||
            tid == Tid.TID_POS_INT_EDITOR ||
            isConstant(tid)
        )
    }

    function isGeneratedRuleTile(tile: Tile): boolean {
        return (
            isNumericEntryTile(tile) ||
            isIconEditor(tile) ||
            isMelodyEditor(tile)
        )
    }

    function numericLiteralTile(text: string): Tile {
        const value = parseFloat(text)
        if (value != Math.idiv(value, 1)) return undefined
        if (text != "" + value) return undefined
        if (value < 1 || value > 5) return undefined
        return Tid.TID_FILTER_COIN_1 + value - 1
    }

    function numericEntryMode(tile: Tile): ui.UiNumericEntryMode {
        return getTid(tile) == Tid.TID_POS_INT_EDITOR
            ? "positiveInteger"
            : "decimal"
    }

    function numericEntryText(tile: Tile): string {
        if (isModifierEditor(tile)) {
            const editor = tile as DigitEditor
            return editor.field
        }
        return "" + getParam(tile)
    }

    function cloneIconField(tile: IconEditor): Bitmap {
        return tile.field.clone()
    }

    function iconFieldsEqual(left: Bitmap, right: Bitmap): boolean {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (left.getPixel(col, row) != right.getPixel(col, row))
                    return false
            }
        }
        return true
    }

    function cloneMelodyField(tile: MelodyEditor): Melody {
        const field = tile.field
        return {
            notes: field.notes.slice(0),
            tempo: field.tempo,
        }
    }

    function melodyFieldsEqual(left: Melody, right: Melody): boolean {
        return left.notes == right.notes && left.tempo == right.tempo
    }

    /**
     * Brain editor screen.
     */
    export class EditorScreen extends ui.UiScreen {
        private host_: AppHost
        private app_: App
        private progdef_: ProgramDefn
        private currPage_: number
        private pageView_: PageView
        private toolbar_: EditorToolbar
        private pendingSave_: Buffer
        private saving_: boolean
        private rendered_: boolean

        constructor(host: AppHost, app: App) {
            super(host.runtime)
            this.backgroundColor = EDITOR_BACKGROUND_COLOR
            this.host_ = host
            this.app_ = app
            this.currPage_ = 0
            this.pendingSave_ = undefined
            this.saving_ = false
            this.rendered_ = false
            this.loadProgram()
            this.pageView_ = new PageView(
                () => this.progdef_,
                () => this.currPage_,
                (value: RuleTargetControlValue) =>
                    this.handlePageTargetActivation(value),
            )
            this.toolbar_ = new EditorToolbar(
                () => this.progdef_,
                () => this.currPage_,
                this.pageView_,
                () => this.openDiskModal(),
                () => this.openPageModal(),
            )
            this.pageView_.setToolbar(this.toolbar_)
            // Root views are registered with the screen here. `UiScreen`
            // measures, arranges, routes focus input to, and renders these
            // roots in order of addition.
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

        public update(): void {
            if (this.rendered_ && this.pageView_.ensureLayoutReady())
                this.pageView_.focusDefault(this.focus)
        }

        public render(surface: ui.DrawSurface): void {
            surface.clear(this.backgroundColor)
            this.drawBackground(surface)
            // Background drawing happens before registered roots so controls
            // and their focus affordances appear above the editor backdrop.
            super.render(surface)
            this.rendered_ = true
        }

        public handleInput(event: ui.UiInputEvent): boolean | undefined {
            // Screen-level input owns commands outside an individual control's
            // local movement and activation contract.
            if (event.action == "cancel") {
                if (event.phase != "released") this.handleBack()
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

        private handleBack(): void {
            if (this.pageView_.handleBack(this.focus, this.toolbar_)) return
            if (
                this.focus.getActiveScopeId() == EDITOR_TOOLBAR_SCOPE &&
                this.currPage_ != 0
            ) {
                this.switchToPage(0)
                return
            }
            if (this.currPage_ == 0) this.host_.launchHome()
        }

        private openDiskModal(): void {
            if (this.hasModal) return
            this.openModal(this.createDiskModal())
        }

        private createDiskModal(): ControlPicker<EditorDiskSlot> {
            return new ControlPicker<EditorDiskSlot>({
                modalScopeId: EDITOR_DISK_MODAL_SCOPE,
                controls: this.createDiskControls(),
                titleId: "disk",
                columnCount: AppStyles.ModalColumnCount,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                controlStyle: AppStyles.ModalButton,
                onActivate: slot => this.saveDiskSlot(slot),
            })
        }

        private createDiskControls(): ui.UiControl<EditorDiskSlot>[] {
            return diskSlots().map(slot =>
                ui.button<EditorDiskSlot>(slot, { bitmapId: slot }),
            )
        }

        private saveDiskSlot(slot: EditorDiskSlot): void {
            this.app_.save(slot, this.progdef_.toBuffer())
            this.closeModal()
        }

        private openPageModal(): void {
            if (this.hasModal) return
            this.openModal(this.createPageModal())
        }

        private createPageModal(): ControlPicker<EditorPagePickerValue> {
            return new ControlPicker<EditorPagePickerValue>({
                modalScopeId: EDITOR_PAGE_MODAL_SCOPE,
                controls: this.createPageControls(),
                defaultControlId: "page-" + this.currPage_,
                columnCount: PAGE_IDS().length,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                controlStyle: AppStyles.ModalButton,
                showTitleBar: false,
                onActivate: pageIndex => this.switchToPage(pageIndex),
            })
        }

        private createPageControls(): ui.UiControl<EditorPagePickerValue>[] {
            const pageIds = PAGE_IDS()
            return pageIds.map((pageId, index) => {
                return {
                    id: "page-" + index,
                    value: index,
                    bitmapId: pageId,
                }
            })
        }

        private switchToPage(pageIndex: number): void {
            if (pageIndex < 0 || pageIndex >= this.progdef_.pages.length) return
            this.currPage_ = pageIndex
            this.pageView_.pageChanged()
            this.closeModal()
        }

        private handlePageTargetActivation(
            value: RuleTargetControlValue,
        ): void {
            if (value.kind == "handle") this.openRuleHandleModal(value)
            else if (value.kind == "tile") {
                const tile = this.targetTile(value)
                if (tile && isNumericEntryTile(tile))
                    this.openNumericEntryModal(value, tile, false)
                else if (tile && (isIconEditor(tile) || isMelodyEditor(tile)))
                    this.openFieldEditorModal(value, tile, false)
                else this.openTileSuggestionModal(value)
            } else if (value.kind == "insert")
                this.openTileSuggestionModal(value)
        }

        private openRuleHandleModal(value: RuleTargetControlValue): void {
            if (this.hasModal) return
            this.openModal(this.createRuleHandleModal(value))
        }

        private createRuleHandleModal(
            value: RuleTargetControlValue,
        ): ControlPicker<RuleHandleAction> {
            const controls = this.createRuleHandleControls(value)
            return new ControlPicker<RuleHandleAction>({
                modalScopeId: EDITOR_RULE_HANDLE_MODAL_SCOPE,
                controls,
                columnCount: controls.length,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                controlStyle: EDITOR_RULE_HANDLE_MODAL_STYLE,
                showTitleBar: false,
                onActivate: action => this.applyRuleHandleAction(action, value),
            })
        }

        private createRuleHandleControls(
            value: RuleTargetControlValue,
        ): ui.UiControl<RuleHandleAction>[] {
            const controls: ui.UiControl<RuleHandleAction>[] = [
                this.ruleHandleControl("add", "plus", "add_rule"),
                this.ruleHandleControl("delete", "delete", "delete_rule"),
            ]
            const realRuleCount = this.realRuleCount(this.currentPage())
            const virtualRule = this.isVirtualRule(value)
            if (!virtualRule && value.ruleIndex > 0)
                controls.push(
                    this.ruleHandleControl("moveUp", "rule_up", "rule_up"),
                )
            if (!virtualRule && value.ruleIndex < realRuleCount - 1)
                controls.push(
                    this.ruleHandleControl(
                        "moveDown",
                        "rule_down",
                        "rule_down",
                    ),
                )
            return controls
        }

        private ruleHandleControl(
            action: RuleHandleAction,
            bitmapId: string,
            textId: string,
        ): ui.UiControl<RuleHandleAction> {
            return {
                id: action,
                value: action,
                bitmapId,
                textId,
            }
        }

        private applyRuleHandleAction(
            action: RuleHandleAction,
            value: RuleTargetControlValue,
        ): void {
            const page = this.currentPage()
            if (!page) {
                this.closeModal()
                return
            }

            let focusRuleIndex = value.ruleIndex
            let focusKind: RuleTargetKind = "handle"
            let focusSection: RuleSection = undefined
            let focusIndex: number = undefined
            const virtualRule = this.isVirtualRule(value)
            const running = isProgramRunning()

            if (!virtualRule) {
                if (action == "add") {
                    this.applyHostedEdit(
                        running,
                        () => !!page.insertRuleAt(value.ruleIndex, undefined),
                    )
                    focusKind = "insert"
                    focusSection = "sensors"
                    focusIndex = 0
                } else if (action == "delete") {
                    this.applyHostedEdit(
                        running,
                        () => !!page.deleteRuleAt(value.ruleIndex),
                    )
                } else if (action == "moveUp" && value.ruleIndex > 0) {
                    this.applyHostedEdit(running, () =>
                        this.moveRule(page, value.ruleIndex, -1),
                    )
                    focusRuleIndex = value.ruleIndex - 1
                } else if (
                    action == "moveDown" &&
                    value.ruleIndex < this.realRuleCount(page) - 1
                ) {
                    this.applyHostedEdit(running, () =>
                        this.moveRule(page, value.ruleIndex, 1),
                    )
                    focusRuleIndex = value.ruleIndex + 1
                }
            }

            this.closeModal()
            if (
                !this.pageView_.focusRuleTarget(
                    this.focus,
                    focusRuleIndex,
                    focusKind,
                    focusSection,
                    focusIndex,
                )
            )
                this.pageView_.focusRuleTarget(
                    this.focus,
                    focusRuleIndex,
                    "handle",
                )
        }

        private moveRule(
            page: PageDefn,
            index: number,
            delta: number,
        ): boolean {
            const rule = page.deleteRuleAt(index)
            if (!rule) return false
            if (page.insertRuleAt(index + delta, rule)) return true
            page.insertRuleAt(index, rule)
            return false
        }

        private currentPage(): PageDefn {
            return this.progdef_
                ? this.progdef_.pages[this.currPage_]
                : undefined
        }

        private targetRule(value: RuleTargetControlValue): RuleDefn {
            const page = this.currentPage()
            if (!page) return undefined
            if (this.isVirtualRule(value)) return new RuleDefn()
            return page.rules[value.ruleIndex]
        }

        private targetTile(value: RuleTargetControlValue): Tile {
            if (!value.section || value.index === undefined) return undefined
            const rule = this.targetRule(value)
            return rule
                ? rule.getRuleRep()[value.section][value.index]
                : undefined
        }

        private isVirtualRule(value: RuleTargetControlValue): boolean {
            return value.ruleIndex >= this.realRuleCount(this.currentPage())
        }

        private realRuleCount(page: PageDefn): number {
            if (!page) return 0
            let lastRule = page.rules.length - 1
            while (lastRule >= 0 && page.rules[lastRule].isEmpty()) lastRule--
            return lastRule + 1
        }

        private openTileSuggestionModal(value: RuleTargetControlValue): void {
            if (this.hasModal) return
            const modal = this.createTileSuggestionModal(value)
            if (modal) this.openModal(modal)
        }

        private createTileSuggestionModal(
            value: RuleTargetControlValue,
        ): ui.UiModal<TileSuggestionModalResult> {
            if (!this.isTileSuggestionTarget(value)) return undefined
            const rule = this.targetRule(value)
            if (!rule) return undefined
            const suggestions = Language.getTileSuggestions(
                rule,
                value.section,
                value.index,
            )
            if (!suggestions.length) return undefined
            if (this.isSingleFieldEditorSuggestion(suggestions)) {
                this.openPendingFieldEditor(value, suggestions[0])
                return undefined
            }
            const controls = this.createTileSuggestionControls(
                value,
                suggestions,
            )
            const selected = this.selectedTileSuggestionId(value, suggestions)
            const columnCount = Math.min(
                EDITOR_TILE_SUGGESTION_MAX_COLUMNS,
                controls.length,
            )
            const titleId = this.tileSuggestionTitleId(value)
            return new ControlPicker<TileSuggestionValue>({
                modalScopeId: EDITOR_TILE_SUGGESTION_MODAL_SCOPE,
                controls,
                titleControls: this.canDeleteFromSuggestionPicker(value)
                    ? [this.tileSuggestionDeleteControl(value)]
                    : undefined,
                titleId,
                defaultControlId: selected,
                columnCount,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                rowGap: EDITOR_FIELD_MODAL_GRID_GAP,
                columnGap: EDITOR_FIELD_MODAL_GRID_GAP,
                controlStyle: EDITOR_TILE_SUGGESTION_MODAL_STYLE,
                titleGap: EDITOR_TILE_SUGGESTION_TITLE_GAP,
                showTitleBar: titleId !== undefined,
                onActivate: controlValue =>
                    this.applyTileSuggestionValue(value, controlValue),
            })
        }

        private isTileSuggestionTarget(value: RuleTargetControlValue): boolean {
            if (!value.section || value.index === undefined) return false
            if (value.kind == "insert") return true
            const tile = this.targetTile(value)
            return value.kind == "tile" && tile && !isModifierEditor(tile)
        }

        private createTileSuggestionControls(
            value: RuleTargetControlValue,
            suggestions: Tile[],
        ): ui.UiControl<TileSuggestionValue>[] {
            const controls: ui.UiControl<TileSuggestionValue>[] = []
            for (let i = 0; i < suggestions.length; i++) {
                const tile = suggestions[i]
                controls.push(this.tileSuggestionControl(value, tile, i))
            }
            return controls
        }

        private tileSuggestionControl(
            value: RuleTargetControlValue,
            tile: Tile,
            index: number,
        ): ui.UiControl<TileSuggestionValue> {
            const control: ui.UiControl<TileSuggestionValue> = {
                id: "suggestion-" + index,
                value: tile,
                textId: tidToString(getTid(tile)),
            }
            const icon = getIcon(tile)
            if (typeof icon == "string" || typeof icon == "number")
                control.bitmapId = icon
            else control.bitmap = icon
            return control
        }

        private tileSuggestionDeleteControl(
            value: RuleTargetControlValue,
        ): ui.UiControl<TileSuggestionValue> {
            return {
                id: "delete",
                value: TILE_SUGGESTION_DELETE,
                bitmapId: "delete",
                textId: "delete",
                style: EDITOR_FIELD_DELETE_STYLE,
            }
        }

        private applyTileSuggestionValue(
            target: RuleTargetControlValue,
            controlValue: TileSuggestionValue,
        ): void {
            if (controlValue == TILE_SUGGESTION_DELETE)
                this.deleteSuggestedTile(target)
            else this.applyTileSuggestion(target, controlValue)
        }

        private selectedTileSuggestionId(
            value: RuleTargetControlValue,
            suggestions: Tile[],
        ): string {
            const tid = this.selectedTileSuggestionTid(value)
            if (tid === undefined) return undefined
            for (let i = 0; i < suggestions.length; i++) {
                if (getTid(suggestions[i]) == tid) return "suggestion-" + i
            }
            return undefined
        }

        private selectedTileSuggestionTid(
            value: RuleTargetControlValue,
        ): number {
            const tile = this.targetTile(value)
            if (!tile) return undefined
            if (!isModifierEditor(tile) && isNumericEntryTile(tile))
                return Tid.TID_DECIMAL_EDITOR
            return getTid(tile)
        }

        private canDeleteFromSuggestionPicker(
            value: RuleTargetControlValue,
        ): boolean {
            const tile = this.targetTile(value)
            return (
                value.kind == "tile" &&
                tile &&
                !isModifierEditor(tile) &&
                filterModifierWithDelete(tile)
            )
        }

        private tileSuggestionTitleId(value: RuleTargetControlValue): string {
            if (value.section == "sensors" || value.section == "actuators")
                return value.section
            return undefined
        }

        private isSingleFieldEditorSuggestion(suggestions: Tile[]): boolean {
            return suggestions.length == 1 && isModifierEditor(suggestions[0])
        }

        private applyTileSuggestion(
            value: RuleTargetControlValue,
            tile: Tile,
        ): void {
            if (isModifierEditor(tile)) {
                this.closeModal()
                this.openPendingFieldEditor(value, tile)
                return
            }
            const wasRunning = isProgramRunning()
            this.commitTileSuggestion(value, tile, wasRunning)
        }

        private openPendingFieldEditor(
            value: RuleTargetControlValue,
            tile: Tile,
        ): void {
            const candidate = this.fieldEditorCandidate(value, tile)
            if (!candidate) return
            if (isNumericEntryTile(candidate))
                this.openNumericEntryModal(value, candidate, true)
            else if (isIconEditor(candidate) || isMelodyEditor(candidate))
                this.openFieldEditorModal(value, candidate, true)
        }

        private fieldEditorCandidate(
            value: RuleTargetControlValue,
            tile: Tile,
        ): ModifierEditor {
            const existingTile = this.targetTile(value)
            if (
                value.kind == "tile" &&
                existingTile &&
                !isModifierEditor(existingTile) &&
                isNumericEntryTile(existingTile) &&
                isDigitEditor(tile)
            ) {
                return createDigitEditor(
                    numericEntryText(existingTile),
                    getTid(tile) == Tid.TID_POS_INT_EDITOR,
                )
            }
            const source = this.previousFieldEditor(value) || tile
            if (!isModifierEditor(source)) return undefined
            return createEditorInstance(source as ModifierEditor)
        }

        private previousFieldEditor(
            value: RuleTargetControlValue,
        ): ModifierEditor {
            if (!value.section || value.index === undefined || value.index <= 0)
                return undefined
            const rule = this.targetRule(value)
            if (!rule) return undefined
            const tiles = rule.getRuleRep()[value.section]
            const previous = tiles[value.index - 1]
            return isModifierEditor(previous)
                ? (previous as ModifierEditor)
                : undefined
        }

        private commitTileSuggestion(
            value: RuleTargetControlValue,
            tile: Tile,
            wasRunning: boolean,
            focusInsertedTile?: boolean,
        ): void {
            if (!this.isTileSuggestionTarget(value)) {
                this.closeModal()
                return
            }
            let added = 0
            let rule: RuleDefn = undefined
            const inserting = value.kind == "insert"
            this.applyHostedEdit(
                wasRunning,
                () => {
                    rule = this.committedTileSuggestionRule(value)
                    if (!rule) return false
                    if (inserting) added = rule.push(tile, value.section)
                    else rule.updateAt(value.section, value.index, tile)
                    Language.ensureValid(rule)
                    return true
                },
                value.ruleIndex,
            )
            this.closeModal()
            if (inserting && !focusInsertedTile)
                this.focusAfterInsertion(value, rule, added)
            else
                this.focusRuleTargetOrHandle(
                    value.ruleIndex,
                    "tile",
                    value.section,
                    value.index,
                )
        }

        private committedTileSuggestionRule(
            value: RuleTargetControlValue,
        ): RuleDefn {
            if (!this.isVirtualRule(value)) return this.targetRule(value)
            const page = this.currentPage()
            if (!page) return undefined
            return page.insertRuleAt(value.ruleIndex, new RuleDefn())
        }

        private deleteSuggestedTile(value: RuleTargetControlValue): void {
            if (!this.canDeleteFromSuggestionPicker(value)) {
                this.closeModal()
                return
            }
            const wasRunning = isProgramRunning()
            const fallback = this.deleteFocusTarget(value)
            this.deleteTileAt(value, wasRunning)
            this.closeModal()
            this.focusRuleTargetOrHandle(
                fallback.ruleIndex,
                fallback.kind,
                fallback.section,
                fallback.index,
            )
        }

        private focusAfterInsertion(
            value: RuleTargetControlValue,
            rule: RuleDefn,
            added: number,
        ): void {
            if (!rule) return
            if (
                this.focusFollowingInsertion(
                    value.ruleIndex,
                    rule,
                    value.section,
                    value.index,
                    added,
                )
            )
                return
            this.focusRuleTargetOrHandle(
                value.ruleIndex,
                "tile",
                value.section,
                value.index,
            )
        }

        private focusFollowingInsertion(
            ruleIndex: number,
            rule: RuleDefn,
            section: RuleSection,
            index: number,
            added: number,
        ): boolean {
            if (section == "sensors")
                return this.focusInsertionTarget(ruleIndex, rule, "filters")
            if (section == "actuators")
                return this.focusInsertionTarget(ruleIndex, rule, "modifiers")
            const nextIndex = index + Math.max(added, 1)
            if (
                this.focusRuleTargetIfSuggestions(
                    ruleIndex,
                    rule,
                    section,
                    nextIndex,
                )
            )
                return true
            if (section == "filters" && !rule.actuators.length)
                return this.focusInsertionTarget(ruleIndex, rule, "actuators")
            return false
        }

        private focusInsertionTarget(
            ruleIndex: number,
            rule: RuleDefn,
            section: RuleSection,
        ): boolean {
            const index = rule.getRuleRep()[section].length
            return this.focusRuleTargetIfSuggestions(
                ruleIndex,
                rule,
                section,
                index,
            )
        }

        private focusRuleTargetIfSuggestions(
            ruleIndex: number,
            rule: RuleDefn,
            section: RuleSection,
            index: number,
        ): boolean {
            if (!Language.getTileSuggestions(rule, section, index).length)
                return false
            return this.pageView_.focusRuleTarget(
                this.focus,
                ruleIndex,
                "insert",
                section,
                index,
            )
        }

        private focusRuleTargetOrHandle(
            ruleIndex: number,
            kind: RuleTargetKind,
            section?: RuleSection,
            index?: number,
        ): void {
            if (
                !this.pageView_.focusRuleTarget(
                    this.focus,
                    ruleIndex,
                    kind,
                    section,
                    index,
                )
            )
                this.pageView_.focusRuleTarget(this.focus, ruleIndex, "handle")
        }

        private openNumericEntryModal(
            value: RuleTargetControlValue,
            tile: Tile,
            pending: boolean,
        ): void {
            if (this.hasModal) return
            const modal = this.createNumericEntryModal(value, tile, pending)
            if (modal) this.openModal(modal)
        }

        private createNumericEntryModal(
            value: RuleTargetControlValue,
            tile: Tile,
            pending: boolean,
        ): ui.UiNumericEntryModal {
            if (!tile || !isNumericEntryTile(tile)) return undefined
            const wasRunning = isProgramRunning()
            return new ui.UiNumericEntryModal({
                modalScopeId: EDITOR_NUMERIC_MODAL_SCOPE,
                mode: numericEntryMode(tile),
                initialText: numericEntryText(tile),
                maxLength: 8,
                deleteEnabled: !pending,
                deleteContent: { bitmapId: "delete" },
                backgroundColor: AppStyles.DefaultModalPanelColor,
                contentMargin: AppStyles.NumericModalMargin,
                keyStyle: AppStyles.ModalButton,
                onResult: result =>
                    this.applyNumericEntryResult(
                        value,
                        tile,
                        pending,
                        result,
                        wasRunning,
                    ),
            })
        }

        private applyNumericEntryResult(
            value: RuleTargetControlValue,
            tile: Tile,
            pending: boolean,
            result: ui.UiNumericEntryResult,
            wasRunning: boolean,
        ): void {
            if (!result) return
            if (result.kind == "completed")
                this.completeNumericEntry(
                    value,
                    tile,
                    pending,
                    result,
                    wasRunning,
                )
            else if (result.kind == "deleted")
                this.deleteEditedTile(value, wasRunning)
        }

        private completeNumericEntry(
            value: RuleTargetControlValue,
            tile: Tile,
            pending: boolean,
            result: ui.UiNumericEntryResult,
            wasRunning: boolean,
        ): void {
            if (!tile || !isNumericEntryTile(tile)) {
                this.closeModal()
                return
            }
            if (pending) {
                const completedTile = this.completedNumericTile(
                    tile,
                    (<any>result).text,
                )
                this.commitTileSuggestion(
                    value,
                    completedTile,
                    wasRunning,
                    true,
                )
                return
            }
            const text = (<any>result).text
            if (this.numericEntryResultChanged(value, text))
                this.applyTargetRuleEdit(value, wasRunning, rule => {
                    this.writeNumericEntryResult(value, text)
                    Language.ensureValid(rule)
                    return true
                })
            this.closeModal()
            this.focusRuleTargetOrHandle(
                value.ruleIndex,
                value.kind,
                value.section,
                value.index,
            )
        }

        private writeNumericTextToTile(tile: Tile, text: string): void {
            if (!isModifierEditor(tile)) return
            const editor = tile as DigitEditor
            editor.field = text
        }

        private completedNumericTile(tile: Tile, text: string): Tile {
            const literal = numericLiteralTile(text)
            if (literal !== undefined) return literal
            this.writeNumericTextToTile(tile, text)
            return tile
        }

        private numericEntryResultChanged(
            value: RuleTargetControlValue,
            text: string,
        ): boolean {
            const tile = this.targetTile(value)
            if (!tile) return false
            if (isModifierEditor(tile)) {
                const editor = tile as DigitEditor
                return editor.field != text
            }
            if (!value.section || value.index === undefined) return false
            const literal = numericLiteralTile(text)
            return literal === undefined || getTid(tile) != literal
        }

        private writeNumericEntryResult(
            value: RuleTargetControlValue,
            text: string,
        ): boolean {
            const tile = this.targetTile(value)
            if (!tile) return false
            if (isModifierEditor(tile)) {
                const editor = tile as DigitEditor
                if (editor.field == text) return false
                editor.field = text
                return true
            }
            if (!value.section || value.index === undefined) return false
            const literal = numericLiteralTile(text)
            if (literal !== undefined && getTid(tile) == literal) return false
            const rule = this.targetRule(value)
            if (!rule) return false
            rule.updateAt(
                value.section,
                value.index,
                literal !== undefined ? literal : createDigitEditor(text),
            )
            return true
        }

        private openFieldEditorModal(
            value: RuleTargetControlValue,
            tile: Tile,
            pending: boolean,
        ): void {
            if (this.hasModal) return
            const modal = this.createFieldEditorModal(value, tile, pending)
            if (modal) this.openModal(modal)
        }

        private createFieldEditorModal(
            value: RuleTargetControlValue,
            tile: Tile,
            pending: boolean,
        ): ControlPicker<FieldEditorModalValue> {
            if (!tile || (!isIconEditor(tile) && !isMelodyEditor(tile)))
                return undefined
            if (isIconEditor(tile))
                return this.createIconFieldEditorModal(
                    value,
                    tile as IconEditor,
                    pending,
                )
            return this.createMelodyFieldEditorModal(
                value,
                tile as MelodyEditor,
                pending,
            )
        }

        private createIconFieldEditorModal(
            value: RuleTargetControlValue,
            tile: IconEditor,
            pending: boolean,
        ): ControlPicker<FieldEditorModalValue> {
            const field = cloneIconField(tile)
            const controls = this.createIconFieldControls(field)
            const wasRunning = isProgramRunning()
            return this.createFieldEditorPicker(
                icons.get(Tid.TID_ACTUATOR_PAINT),
                0,
                controls,
                5,
                EDITOR_FIELD_MODAL_GRID_GAP,
                !pending,
                (controlValue, control) => {
                    if (controlValue == FIELD_EDITOR_COMMIT)
                        this.commitIconFieldEditor(
                            value,
                            tile,
                            pending,
                            field,
                            wasRunning,
                        )
                    else if (controlValue == FIELD_EDITOR_DELETE)
                        this.deleteEditedTile(value, wasRunning)
                    else this.toggleIconFieldCell(field, controlValue, control)
                },
            )
        }

        private createFieldEditorPicker(
            titleBitmap: Bitmap,
            panelColor: number,
            controls: ui.UiControl<FieldEditorModalValue>[],
            columnCount: number,
            rowGap: number,
            deleteEnabled: boolean,
            onActivate: ui.UiControlActivateHandler<FieldEditorModalValue>,
        ): ControlPicker<FieldEditorModalValue> {
            return new ControlPicker<FieldEditorModalValue>({
                modalScopeId: EDITOR_FIELD_MODAL_SCOPE,
                controls,
                titleControls: this.fieldTitleControls(deleteEnabled),
                titleBitmap,
                defaultControlId:
                    "cell-" + (2 * columnCount + Math.min(2, columnCount - 1)),
                columnCount,
                controlWidth: EDITOR_FIELD_MODAL_CELL_SIZE,
                controlHeight: EDITOR_FIELD_MODAL_CELL_SIZE,
                rowGap,
                columnGap: EDITOR_FIELD_MODAL_GRID_GAP,
                panelColor,
                titleGap: EDITOR_FIELD_MODAL_GRID_GAP,
                onActivate,
            })
        }

        private fieldTitleControls(
            deleteEnabled: boolean,
        ): ui.UiControl<FieldEditorModalValue>[] {
            const controls: ui.UiControl<FieldEditorModalValue>[] = []
            if (deleteEnabled) controls.push(this.fieldCommandControl("delete"))
            controls.push(this.fieldCommandControl("ok"))
            return controls
        }

        private fieldCommandControl(
            action: "ok" | "delete",
        ): ui.UiControl<FieldEditorModalValue> {
            if (action == "ok")
                return {
                    id: "ok",
                    value: FIELD_EDITOR_COMMIT,
                    text: ui.loc("OK"),
                    style: EDITOR_FIELD_OK_STYLE,
                }
            return {
                id: "delete",
                value: FIELD_EDITOR_DELETE,
                bitmapId: "delete",
                style: EDITOR_FIELD_DELETE_STYLE,
            }
        }

        private createIconFieldControls(
            field: Bitmap,
        ): ui.UiControl<FieldEditorModalValue>[] {
            const controls: ui.UiControl<FieldEditorModalValue>[] = []
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    controls.push(
                        this.fieldCellControl(
                            row,
                            col,
                            5,
                            this.iconFieldBitmapId(field, row, col),
                        ),
                    )
                }
            }
            return controls
        }

        private createMelodyFieldEditorModal(
            value: RuleTargetControlValue,
            tile: MelodyEditor,
            pending: boolean,
        ): ControlPicker<FieldEditorModalValue> {
            const field = cloneMelodyField(tile)
            const controls = this.createMelodyFieldControls(field)
            const wasRunning = isProgramRunning()
            return this.createFieldEditorPicker(
                icons.get(Tid.TID_ACTUATOR_MUSIC),
                AppStyles.DefaultModalPanelColor,
                controls,
                MELODY_LENGTH,
                EDITOR_MELODY_FIELD_MODAL_ROW_GAP,
                !pending,
                (controlValue, control) => {
                    if (controlValue == FIELD_EDITOR_COMMIT)
                        this.commitMelodyFieldEditor(
                            value,
                            tile,
                            pending,
                            field,
                            wasRunning,
                        )
                    else if (controlValue == FIELD_EDITOR_DELETE)
                        this.deleteEditedTile(value, wasRunning)
                    else
                        this.toggleMelodyFieldCell(
                            field,
                            controls,
                            controlValue,
                            control,
                        )
                },
            )
        }

        private createMelodyFieldControls(
            field: Melody,
        ): ui.UiControl<FieldEditorModalValue>[] {
            const controls: ui.UiControl<FieldEditorModalValue>[] = []
            for (let row = 0; row < NUM_NOTES; row++) {
                for (let col = 0; col < MELODY_LENGTH; col++) {
                    controls.push(
                        this.fieldCellControl(
                            row,
                            col,
                            MELODY_LENGTH,
                            this.melodyFieldBitmapId(field, row, col),
                        ),
                    )
                }
            }
            return controls
        }

        private fieldCellControl(
            row: number,
            col: number,
            columnCount: number,
            bitmapId: string,
        ): ui.UiControl<FieldEditorModalValue> {
            const cell = row * columnCount + col
            return {
                id: "cell-" + cell,
                value: cell,
                bitmapId,
                style: ui.UiButtonStyles.Transparent,
            }
        }

        private iconFieldBitmapId(
            field: Bitmap,
            row: number,
            col: number,
        ): string {
            return field.getPixel(col, row) ? "solid_red" : "led_off"
        }

        private melodyFieldBitmapId(
            field: Melody,
            row: number,
            col: number,
        ): string {
            const note = field.notes.charAt(col)
            return note != "." && parseInt(note) == NUM_NOTES - 1 - row
                ? "note_on"
                : "note_off"
        }

        private toggleIconFieldCell(
            field: Bitmap,
            cell: number,
            control: ui.UiControl<FieldEditorModalValue>,
        ): void {
            const row = Math.idiv(cell, 5)
            const col = cell % 5
            const on = field.getPixel(col, row) ? 0 : 1
            field.setPixel(col, row, on)
            control.bitmapId = this.iconFieldBitmapId(field, row, col)
        }

        private toggleMelodyFieldCell(
            field: Melody,
            controls: ui.UiControl<FieldEditorModalValue>[],
            cell: number,
            control: ui.UiControl<FieldEditorModalValue>,
        ): void {
            const row = Math.idiv(cell, MELODY_LENGTH)
            const col = cell % MELODY_LENGTH
            const note = (NUM_NOTES - 1 - row).toString()
            const previous = field.notes.charAt(col)
            const active = previous == note
            const next = active ? "." : note
            field.notes =
                field.notes.slice(0, col) + next + field.notes.slice(col + 1)
            control.bitmapId = active ? "note_off" : "note_on"
            if (!active && previous != ".") {
                const previousRow = NUM_NOTES - 1 - parseInt(previous)
                controls[previousRow * MELODY_LENGTH + col].bitmapId =
                    "note_off"
            }
        }

        private commitIconFieldEditor(
            value: RuleTargetControlValue,
            tile: IconEditor,
            pending: boolean,
            field: Bitmap,
            wasRunning: boolean,
        ): void {
            if (!tile || !isIconEditor(tile)) {
                this.closeModal()
                return
            }
            const changed = !iconFieldsEqual(tile.field, field)
            if (pending) {
                tile.field = field.clone()
                this.commitTileSuggestion(value, tile, wasRunning, true)
                return
            }
            if (changed)
                this.applyHostedEdit(
                    wasRunning,
                    () => {
                        tile.field = field.clone()
                        return true
                    },
                    value.ruleIndex,
                )
            this.closeModal()
            this.focusTargetValue(value)
        }

        private commitMelodyFieldEditor(
            value: RuleTargetControlValue,
            tile: MelodyEditor,
            pending: boolean,
            field: Melody,
            wasRunning: boolean,
        ): void {
            if (!tile || !isMelodyEditor(tile)) {
                this.closeModal()
                return
            }
            const changed = !melodyFieldsEqual(tile.field, field)
            const nextField = {
                notes: field.notes.slice(0),
                tempo: field.tempo,
            }
            if (pending) {
                tile.field = nextField
                this.commitTileSuggestion(value, tile, wasRunning, true)
                return
            }
            if (changed)
                this.applyHostedEdit(
                    wasRunning,
                    () => {
                        tile.field = nextField
                        return true
                    },
                    value.ruleIndex,
                )
            this.closeModal()
            this.focusTargetValue(value)
        }

        private deleteEditedTile(
            value: RuleTargetControlValue,
            wasRunning: boolean,
        ): void {
            if (!value.section || value.index === undefined) {
                this.closeModal()
                this.pageView_.focusRuleTarget(
                    this.focus,
                    value.ruleIndex,
                    "handle",
                )
                return
            }
            const fallback = this.deleteFocusTarget(value)
            this.deleteTileAt(value, wasRunning)
            this.closeModal()
            this.focusRuleTargetOrHandle(
                fallback.ruleIndex,
                fallback.kind,
                fallback.section,
                fallback.index,
            )
        }

        private deleteFocusTarget(
            value: RuleTargetControlValue,
        ): RuleTargetFocus {
            if (!value.section || value.index === undefined)
                return { ruleIndex: value.ruleIndex, kind: "handle" }
            const rule = this.targetRule(value)
            if (!rule) return { ruleIndex: value.ruleIndex, kind: "handle" }
            const tiles = rule.getRuleRep()[value.section]
            if (value.index < tiles.length - 1) {
                return {
                    ruleIndex: value.ruleIndex,
                    kind: "tile",
                    section: value.section,
                    index: value.index,
                }
            }
            return this.pageView_.previousRuleTarget(value)
        }

        private focusTargetValue(value: RuleTargetControlValue): void {
            this.focusRuleTargetOrHandle(
                value.ruleIndex,
                value.kind,
                value.section,
                value.index,
            )
        }

        private deleteTileAt(
            value: RuleTargetControlValue,
            wasRunning: boolean,
        ): void {
            this.applyTargetRuleEdit(value, wasRunning, rule => {
                rule.deleteAt(value.section, value.index)
                Language.ensureValid(rule)
                return true
            })
        }

        private applyTargetRuleEdit(
            value: RuleTargetControlValue,
            wasRunning: boolean,
            mutate: (rule: RuleDefn) => boolean,
        ): boolean {
            let changed = false
            this.applyHostedEdit(
                wasRunning,
                () => {
                    const rule = this.targetRule(value)
                    if (!rule) return false
                    changed = mutate(rule)
                    return changed
                },
                value.ruleIndex,
            )
            return changed
        }

        private applyHostedEdit(
            wasRunning: boolean,
            mutate: () => boolean,
            changedRuleIndex?: number,
        ): boolean {
            if (wasRunning) stopProgram()
            const changed = mutate()
            if (changed) {
                this.pageView_.pageChanged(changedRuleIndex)
                const buffer = this.progdef_.toBuffer()
                this.queueAutosave(buffer)
            }
            if (wasRunning) runProgram(this.progdef_)
            return changed
        }

        private queueAutosave(buffer: Buffer): void {
            this.pendingSave_ = buffer
            if (this.saving_) return
            this.saving_ = true
            control.runInParallel(() => this.flushAutosave())
        }

        private flushAutosave(): void {
            while (this.pendingSave_) {
                const buffer = this.pendingSave_
                this.pendingSave_ = undefined
                this.app_.save(SAVESLOT_AUTO, buffer)
            }
            this.saving_ = false
            if (this.pendingSave_) this.queueAutosave(this.pendingSave_)
        }
    }

    class PageView
        implements ui.UiFocusableView<void>, ui.UiFocusNavigationProvider
    {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private getProgram_: () => ProgramDefn
        private getPage_: () => number
        private onActivateTarget_: (value: RuleTargetControlValue) => void
        private toolbar_: EditorToolbar
        private focus_: ui.UiFocusState
        private layout_: PageLayout
        private navigationRows_: PageNavigationTarget[][]
        private navigationTargets_: PageNavigationTarget[]
        private contentOffsetX_: number
        private contentOffsetY_: number
        private viewportRect_: ui.Rect
        private contentRect_: ui.Rect
        private measuredContentWidth_: number
        private measuredContentHeight_: number
        private focusTargetsDirty_: boolean

        constructor(
            getProgram: () => ProgramDefn,
            getPage: () => number,
            onActivateTarget: (value: RuleTargetControlValue) => void,
        ) {
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
            this.onActivateTarget_ = onActivateTarget
            this.contentOffsetX_ = 0
            this.contentOffsetY_ = 0
            this.viewportRect_ = new ui.Rect()
            this.contentRect_ = new ui.Rect()
            this.measuredContentWidth_ = 0
            this.measuredContentHeight_ = 0
            this.focusTargetsDirty_ = true
            this.toolbar_ = undefined
            this.focus_ = undefined
            this.layout_ = undefined
            this.navigationRows_ = []
            this.navigationTargets_ = []
        }

        public measure(
            constraints: ui.UiLayoutConstraints,
            output: ui.UiMeasuredSize,
        ): void {
            output.set(
                UI_SCREEN_WIDTH,
                UI_SCREEN_HEIGHT - EDITOR_CONTENT_Y,
                UI_SCREEN_WIDTH,
                UI_SCREEN_HEIGHT - EDITOR_CONTENT_Y,
            )
            this.clearLayoutInvalidation()
        }

        public arrange(rect: ui.Rect): void {
            this.finalRect.copyFrom(rect)
            this.updateViewportRect()
            this.focusTargetsDirty_ = true
        }

        public invalidateLayout(): void {
            this.layoutDirty = true
            this.focusTargetsDirty_ = true
        }

        public clearLayoutInvalidation(): void {
            this.layoutDirty = false
        }

        public registerFocusTargets(focus: ui.UiFocusState): void {
            if (this.focus_ != focus) this.focusTargetsDirty_ = true
            this.focus_ = focus
            // The page view owns one focus scope backed by rule-row controls.
            // Its targets are rebuilt whenever layout changes because scrolling
            // can change viewport-space target rectangles.
            if (this.layout_) this.refreshFocusTargets()
            else this.focus_.setScope({ id: EDITOR_PAGE_SCOPE })
        }

        public registerNavigation(controller: ui.UiFocusInputController): void {
            controller.setNavigation(EDITOR_PAGE_SCOPE, this)
        }

        public setToolbar(toolbar: EditorToolbar): void {
            this.toolbar_ = toolbar
        }

        public focusDefault(focus: ui.UiFocusState): ui.UiFocusSetResult {
            if (this.layout_) this.refreshFocusTargets()
            const result = focus.setActiveScope(EDITOR_PAGE_SCOPE)
            this.handleFocusScrollResult(result)
            return result
        }

        public ensureLayoutReady(): boolean {
            if (this.layout_) return false
            if (!this.finalRect.width && !this.finalRect.height) return false
            this.rebuildLayout(true)
            this.refreshFocusTargets()
            return true
        }

        public pageChanged(ruleIndex?: number): void {
            this.invalidateLayout()
            if (this.finalRect.width || this.finalRect.height) {
                if (
                    ruleIndex === undefined ||
                    !this.rebuildChangedRuleLayout(ruleIndex)
                )
                    this.rebuildLayout(true)
            }
            this.refreshFocusTargets()
        }

        public focusRuleTarget(
            focus: ui.UiFocusState,
            ruleIndex: number,
            kind: RuleTargetKind,
            section?: RuleSection,
            index?: number,
        ): boolean {
            this.refreshFocusTargets()
            const targetId = ruleFocusTargetId(ruleIndex, kind, section, index)
            const result = focus.setActiveTarget(EDITOR_PAGE_SCOPE, targetId)
            if (
                result.kind != "focused" &&
                !(result.kind == "unchanged" && result.targetId == targetId)
            )
                return false
            if (!this.handleFocusScrollResult(result))
                this.scrollTargetIntoView(targetId)
            return true
        }

        public previousRuleTarget(
            value: RuleTargetControlValue,
        ): RuleTargetFocus {
            const targetId = ruleFocusTargetId(
                value.ruleIndex,
                value.kind,
                value.section,
                value.index,
            )
            const rows = this.navigationRows()
            for (let row = 0; row < rows.length; row++) {
                for (let column = 0; column < rows[row].length; column++) {
                    if (rows[row][column].id != targetId) continue
                    if (column > 0)
                        return this.focusTargetFromTarget(
                            rows[row][column - 1].ruleTarget,
                        )
                    return { ruleIndex: value.ruleIndex, kind: "handle" }
                }
            }
            return { ruleIndex: value.ruleIndex, kind: "handle" }
        }

        public handleFocusInput(result: ui.UiFocusInputResult): void {
            if (result.kind == "activated") {
                if (result.scopeId == EDITOR_PAGE_SCOPE) {
                    const target = this.targetByFocusId(result.targetId)
                    if (target && this.onActivateTarget_)
                        this.onActivateTarget_(
                            this.ruleTargetValue(target.ruleTarget),
                        )
                }
            } else if (result.kind == "moved" && result.scrollRequest) {
                this.handleScrollRequest(result.scrollRequest)
            }
        }

        public render(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus?: ui.UiFocusState,
        ): void {
            if (!this.layout_) {
                this.drawLoadingIcon(surface, assets)
                return
            }
            this.rebuildLayout()
            const page = this.layout_
            if (!page) return
            this.drawPage(surface, assets, focus, page)
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
            const result = this.move({
                scopeId: EDITOR_PAGE_SCOPE,
                currentTargetId: focus.getActiveTargetId(EDITOR_PAGE_SCOPE),
                direction,
            })
            if (!result || result.kind != "moved") return false
            const focusResult = focus.setActiveTarget(
                result.toScopeId,
                result.toTargetId,
            )
            if (
                !this.handleFocusScrollResult(focusResult) &&
                result.scrollRequest
            )
                this.handleScrollRequest(result.scrollRequest)
            return true
        }

        public navigationRows(): PageNavigationTarget[][] {
            this.rebuildLayout()
            return this.navigationRows_
        }

        public defaultNavigationTarget(): ui.UiFocusNavigationTarget {
            const rows = this.navigationRows()
            for (let row = 0; row < rows.length; row++) {
                for (let column = 0; column < rows[row].length; column++) {
                    const target = rows[row][column]
                    if (this.isDefaultRuleTarget(target.ruleTarget))
                        return target
                }
            }
            if (rows.length && rows[0].length) return rows[0][0]
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
            return nearest
        }

        public nearestToolbarTarget(
            source: PageNavigationTarget,
        ): ui.UiFocusTargetReference {
            if (!this.toolbar_ || !source) return undefined
            const rect = this.fixedScopeExitComparisonRect(source)
            return this.toolbar_.nearestTargetReference({
                id: source.id,
                rect,
            })
        }

        public firstRuleHandleTarget(): ui.UiFocusNavigationTarget {
            const targetId = ruleFocusTargetId(0, "handle")
            const targets = this.allNavigationTargets()
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                if (target.id == targetId) return target
            }
            return this.defaultNavigationTarget()
        }

        public lastPageTarget(): ui.UiFocusNavigationTarget {
            const rows = this.navigationRows()
            for (let row = rows.length - 1; row >= 0; row--) {
                const targets = rows[row]
                if (targets.length) return targets[targets.length - 1]
            }
            return this.defaultNavigationTarget()
        }

        public handleScrollRequest(request: ui.UiFocusScrollRequest): void {
            if (request.scrollOwnerId != EDITOR_PAGE_SCROLL_OWNER) return
            if (!this.scrollRequestNeedsScroll(request)) return
            const previousOffsetX = this.contentOffsetX_
            const previousOffsetY = this.contentOffsetY_
            this.scrollContentRectIntoView(request.targetRect)
            if (
                previousOffsetX == this.contentOffsetX_ &&
                previousOffsetY == this.contentOffsetY_
            )
                return
            this.refreshScrollLayout()
            this.refreshFocusTargets()
        }

        public atVerticalBoundary(direction: ui.UiFocusDirection): boolean {
            if (direction == "up") return this.contentOffsetY_ == 0
            if (direction == "down") {
                const maxOffset = Math.max(
                    this.measuredContentHeight_ - this.finalRect.height,
                    0,
                )
                return this.contentOffsetY_ >= maxOffset
            }
            return true
        }

        public atHorizontalOrigin(): boolean {
            return this.contentOffsetX_ == 0
        }

        public horizontalOriginScrollRect(
            target: PageNavigationTarget,
        ): ui.Rect {
            return new ui.Rect(
                0,
                target.contentRect.y,
                Math.max(this.finalRect.width, 1),
                target.contentRect.height,
            )
        }

        public verticalBoundaryScrollRect(
            direction: ui.UiFocusDirection,
        ): ui.Rect {
            const x = this.contentOffsetX_
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

        public move(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult | undefined {
            const rows = this.navigationRows()
            if (!rows.length) return undefined
            const result = ui.moveFocusInRaggedGrid({
                scopeId: EDITOR_PAGE_SCOPE,
                currentTargetId: request.currentTargetId,
                direction: request.direction,
                rows,
                verticalStrategy: "column",
            })
            if (result.kind == "moved") return result
            const position = this.positionForTargetId(request.currentTargetId)
            if (!position) return this.moveToTarget(undefined, rows[0][0])

            switch (request.direction) {
                case "left":
                    if (position.column == 0 && !this.atHorizontalOrigin())
                        return this.horizontalOriginScrollMove(rows, position)
                    return this.horizontalEdgeMove(rows, position, -1)
                case "right":
                    return this.horizontalEdgeMove(rows, position, 1)
                case "up":
                    if (!this.atVerticalBoundary("up"))
                        return this.boundaryScrollMove(rows, position, "up")
                    return this.toolbarMove(rows, position)
                case "down":
                    if (!this.atVerticalBoundary("down"))
                        return this.boundaryScrollMove(rows, position, "down")
                    return result
            }

            return result
        }

        private pageLayout(): PageLayout {
            const page = this.currentPage()
            if (!page) return undefined

            const rules = this.layoutRules(page)
            const content = this.arrangeRules(rules)
            this.measuredContentWidth_ = content.width
            this.measuredContentHeight_ = content.height
            this.updateContentRect()
            return {
                viewport: this.viewportRect_.clone(),
                content: this.contentRect_.clone(),
                contentWidth: content.width,
                contentHeight: content.height,
                rules,
            }
        }

        private currentPage(): PageDefn {
            const program = this.getProgram_()
            return program ? program.pages[this.getPage_()] : undefined
        }

        private layoutRules(page: PageDefn): RuleView[] {
            const rules: RuleView[] = []
            const lastRule = this.lastNonEmptyRuleIndex(page)
            for (let i = 0; i <= lastRule; i++)
                rules.push(this.createRuleView(page, rules.length))
            rules.push(new RuleView(new RuleDefn(), rules.length, true))
            return rules
        }

        private createRuleView(page: PageDefn, ruleIndex: number): RuleView {
            if (ruleIndex >= 0 && ruleIndex < page.rules.length)
                return new RuleView(page.rules[ruleIndex], ruleIndex, false)
            return new RuleView(new RuleDefn(), ruleIndex, true)
        }

        private lastNonEmptyRuleIndex(page: PageDefn): number {
            let lastRule = page.rules.length - 1
            while (lastRule >= 0 && page.rules[lastRule].isEmpty()) lastRule--
            return lastRule
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
                maxTrayWidth = Math.max(maxTrayWidth, rule.naturalWidth)
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
                Math.max(
                    contentBounds.right + EDITOR_PAGE_MARGIN,
                    UI_SCREEN_WIDTH,
                ),
                Math.max(
                    contentBounds.bottom + EDITOR_PAGE_MARGIN,
                    UI_SCREEN_HEIGHT - EDITOR_CONTENT_Y,
                ),
            )
        }

        private drawPage(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus: ui.UiFocusState,
            page: PageLayout,
        ): void {
            for (let i = 0; i < page.rules.length; i++) {
                const rule = page.rules[i]
                if (!rule.isVisible(page)) continue
                rule.arrangeForPage(page)
                rule.draw(surface, assets, page)
            }
            for (let i = 0; i < page.rules.length; i++) {
                const rule = page.rules[i]
                if (!rule.isVisible(page)) continue
                rule.drawFocusOverlay(surface, assets, focus, page)
            }
        }

        private drawLoadingIcon(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
        ): void {
            const icon = assets.getBitmap(Tid.TID_SENSOR_TIMER)
            surface.drawBitmap(
                icon,
                Math.idiv(UI_SCREEN_WIDTH - icon.width, 2),
                Math.idiv(UI_SCREEN_HEIGHT - icon.height, 2),
            )
        }

        private rebuildLayout(force?: boolean): void {
            if (!force && !this.layoutDirty && this.layout_) return
            this.layout_ = this.pageLayout()
            this.rebuildNavigationCache()
            this.clearLayoutInvalidation()
        }

        private rebuildChangedRuleLayout(ruleIndex: number): boolean {
            if (!this.layout_ || ruleIndex < 0) return false
            const page = this.currentPage()
            if (!page) return false
            const rules = this.layout_.rules
            const lastRule = this.lastNonEmptyRuleIndex(page)
            const expectedRuleViews = lastRule + 2
            if (ruleIndex > lastRule && ruleIndex != expectedRuleViews - 1)
                return false

            if (rules.length == expectedRuleViews) {
                rules[ruleIndex] = this.createRuleView(page, ruleIndex)
            } else if (
                rules.length + 1 == expectedRuleViews &&
                ruleIndex == rules.length - 1
            ) {
                rules[ruleIndex] = this.createRuleView(page, ruleIndex)
                rules.push(new RuleView(new RuleDefn(), ruleIndex + 1, true))
            } else {
                return false
            }

            const content = this.arrangeRules(rules)
            this.measuredContentWidth_ = content.width
            this.measuredContentHeight_ = content.height
            this.updateContentRect()
            this.layout_.viewport.copyFrom(this.viewportRect_)
            this.layout_.content.copyFrom(this.contentRect_)
            this.layout_.contentWidth = content.width
            this.layout_.contentHeight = content.height
            this.rebuildNavigationCache()
            this.clearLayoutInvalidation()
            return true
        }

        private refreshScrollLayout(): void {
            if (!this.layout_) {
                this.rebuildLayout(true)
                this.focusTargetsDirty_ = true
                return
            }
            this.updateContentRect()
            this.layout_.viewport.copyFrom(this.viewportRect_)
            this.layout_.content.copyFrom(this.contentRect_)
            this.rebuildNavigationCache()
            this.focusTargetsDirty_ = true
        }

        private updateViewportRect(): void {
            this.viewportRect_.copyFrom(this.finalRect)
        }

        private updateContentRect(): void {
            this.contentOffsetX_ = this.clampScrollOffset(
                this.contentOffsetX_,
                this.measuredContentWidth_,
                this.viewportRect_.width,
            )
            this.contentOffsetY_ = this.clampScrollOffset(
                this.contentOffsetY_,
                this.measuredContentHeight_,
                this.viewportRect_.height,
            )
            this.contentRect_.set(
                this.viewportRect_.x - this.contentOffsetX_,
                this.viewportRect_.y - this.contentOffsetY_,
                this.measuredContentWidth_,
                this.measuredContentHeight_,
            )
        }

        private scrollContentRectIntoView(target: ui.Rect): void {
            this.contentOffsetX_ = this.scrollAxisIntoView(
                this.contentOffsetX_,
                this.viewportRect_.width,
                this.measuredContentWidth_,
                target.x,
                target.width,
            )
            this.contentOffsetY_ = this.scrollAxisIntoView(
                this.contentOffsetY_,
                this.viewportRect_.height,
                this.measuredContentHeight_,
                target.y,
                target.height,
            )
        }

        private scrollAxisIntoView(
            offset: number,
            viewportSize: number,
            contentSize: number,
            targetStart: number,
            targetSize: number,
        ): number {
            let nextOffset = offset
            const targetEnd = targetStart + targetSize
            if (targetSize > viewportSize) nextOffset = targetStart
            else if (targetStart < offset) nextOffset = targetStart
            else if (targetEnd > offset + viewportSize)
                nextOffset = targetEnd - viewportSize
            return this.clampScrollOffset(nextOffset, contentSize, viewportSize)
        }

        private clampScrollOffset(
            offset: number,
            contentSize: number,
            viewportSize: number,
        ): number {
            const maxOffset = Math.max(contentSize - viewportSize, 0)
            return Math.min(Math.max(offset, 0), maxOffset)
        }

        private scrollRequestNeedsScroll(
            request: ui.UiFocusScrollRequest,
        ): boolean {
            this.rebuildLayout()
            const page = this.layout_
            if (!page) return false
            const rect = request.targetRect
            const left = page.content.x + rect.x
            const top = page.content.y + rect.y
            const right = left + rect.width
            const bottom = top + rect.height
            return (
                left < page.viewport.x ||
                top < page.viewport.y ||
                right > page.viewport.right ||
                bottom > page.viewport.bottom
            )
        }

        private refreshFocusTargets(): void {
            if (!this.focus_) return
            if (!this.focusTargetsDirty_) return
            this.rebuildLayout()
            // Focus registration is split from drawing. The focus state stores
            // target ids, viewport rectangles for hit testing, and content
            // rectangles for scroll requests; rendering later consumes the same
            // active target id.
            this.focus_.setScope({
                id: EDITOR_PAGE_SCOPE,
                preferredTargetId: this.preferredTargetId(),
            })
            const targets = this.allNavigationTargets()
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                this.focus_.setTarget({
                    id: target.id,
                    scopeId: EDITOR_PAGE_SCOPE,
                    rect: target.viewportRect,
                    hidden: false,
                    activatable: true,
                    scrollOwnerId: target.scrollOwnerId,
                    scrollRect: target.scrollRect,
                })
            }
            this.focusTargetsDirty_ = false
        }

        private allNavigationTargets(): PageNavigationTarget[] {
            this.rebuildLayout()
            return this.navigationTargets_
        }

        private pageTargetComparisonRect(
            target: PageNavigationTarget,
        ): ui.Rect {
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
                const row = this.layout_.rules[i].navigationTargets(
                    this.layout_,
                )
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

        private isDefaultRuleTarget(target: RulePageTarget): boolean {
            return target.section == "sensors" || target.section == "filters"
        }

        private focusTargetFromTarget(target: RulePageTarget): RuleTargetFocus {
            return {
                ruleIndex: target.ruleIndex,
                kind: target.kind,
                section: target.section,
                index: target.index,
            }
        }

        private ruleTargetValue(
            target: RulePageTarget,
        ): RuleTargetControlValue {
            return {
                kind: target.kind,
                ruleIndex: target.ruleIndex,
                section: target.section,
                index: target.index,
            }
        }

        private currentPosition(focus: ui.UiFocusState): PageTargetPosition {
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
            const target = targets[column]
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
                    if (rows[row][column].id == targetId) return { row, column }
                }
            }
            return undefined
        }

        private targetByFocusId(targetId: ui.UiFocusId): PageNavigationTarget {
            const targets = this.allNavigationTargets()
            for (let i = 0; i < targets.length; i++) {
                if (targets[i].id == targetId) return targets[i]
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

        private horizontalEdgeMove(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
            step: number,
        ): ui.UiFocusMoveResult {
            let row = position.row
            let column = position.column + step
            if (column < 0) {
                row--
                if (row < 0) row = rows.length - 1
                column = rows[row].length - 1
            } else if (column >= rows[row].length) {
                row++
                if (row >= rows.length) row = 0
                column = 0
            }
            return this.moveToTarget(
                rows[position.row][position.column].id,
                rows[row][column],
            )
        }

        private toolbarMove(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
        ): ui.UiFocusMoveResult {
            const target = this.nearestToolbarTarget(
                rows[position.row][position.column],
            )
            if (target)
                return {
                    kind: "moved",
                    fromScopeId: EDITOR_PAGE_SCOPE,
                    fromTargetId: rows[position.row][position.column].id,
                    toScopeId: target.scopeId,
                    toTargetId: target.targetId,
                }
            return {
                kind: "moved",
                fromScopeId: EDITOR_PAGE_SCOPE,
                fromTargetId: rows[position.row][position.column].id,
                toScopeId: EDITOR_TOOLBAR_SCOPE,
                toTargetId: EDITOR_TOOLBAR_SCOPE + "/run",
            }
        }

        private horizontalOriginScrollMove(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
        ): ui.UiFocusMoveResult {
            const target = rows[position.row][position.column]
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
                    targetRect: this.horizontalOriginScrollRect(
                        rows[position.row][position.column],
                    ),
                    reason: "focus",
                },
            }
        }

        private boundaryScrollMove(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
            direction: ui.UiFocusDirection,
        ): ui.UiFocusMoveResult {
            const target = rows[position.row][position.column]
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
                    targetRect: this.verticalBoundaryScrollRect(direction),
                    reason: "focus",
                },
            }
        }

        private moveToTarget(
            fromTargetId: ui.UiFocusId,
            target: ui.UiFocusNavigationTarget,
        ): ui.UiFocusMoveResult {
            const result: ui.UiFocusMoveResult = {
                kind: "moved",
                fromScopeId: EDITOR_PAGE_SCOPE,
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
    }

    class RuleView {
        public readonly rule: RuleDefn
        public readonly ruleIndex: number
        private readonly virtualRule_: boolean
        private x_: number
        private y_: number
        private width_: number
        private naturalWidth_: number
        private height_: number
        private tray_: ui.Rect
        private when_: ui.Rect
        private targets_: RulePageTarget[]
        private whenControlIds_: string[]
        private doControlIds_: string[]
        private stripOffsetX_: number
        private stripOffsetY_: number
        private stripRect_: ui.Rect
        private controlRectScratch_: ui.Rect
        private controlRects_: ui.Rect[]
        private buttonView_: ui.UiButtonView
        private content_: ui.UiControlContent

        constructor(
            ruledef: RuleDefn,
            ruleIndex: number,
            virtualRule: boolean,
        ) {
            this.rule = ruledef
            this.ruleIndex = ruleIndex
            this.virtualRule_ = virtualRule
            this.x_ = 0
            this.y_ = 0
            this.width_ = 0
            this.naturalWidth_ = 0
            this.height_ = 0
            const ruleRep = ruledef.getRuleRep()
            this.tray_ = new ui.Rect()
            this.when_ = new ui.Rect()
            this.targets_ = []
            this.whenControlIds_ = []
            this.doControlIds_ = []
            this.stripRect_ = new ui.Rect()
            this.controlRectScratch_ = new ui.Rect()
            this.controlRects_ = []
            this.buttonView_ = new ui.UiButtonView({})
            this.content_ = {}
            this.addRuleControls(ruleRep)
            this.stripOffsetX_ = 0
            this.stripOffsetY_ = 0
            this.placeControls()
        }

        public get width(): number {
            return this.width_
        }

        public get naturalWidth(): number {
            return this.naturalWidth_
        }

        public get height(): number {
            return this.height_
        }

        public setPosition(x: number, y: number): void {
            this.x_ = x
            this.y_ = y
        }

        public setWidth(width: number): void {
            const resolved = Math.max(width, this.naturalWidth_)
            this.tray_.width = resolved
            this.width_ = resolved
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

        public draw(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            page: PageLayout,
        ): void {
            this.fillRect(surface, page, this.tray_, EDITOR_RULE_TRAY_COLOR)
            this.fillRect(surface, page, this.when_, EDITOR_WHEN_SECTION_COLOR)
            this.outlineTray(surface, page)
            this.renderControls(surface, assets)
        }

        public drawFocusOverlay(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus: ui.UiFocusState,
            page: PageLayout,
        ): void {
            this.renderFocus(surface, assets, focus)
        }

        public arrangeForPage(page: PageLayout): void {
            this.arrangeStrip(page.content)
        }

        public navigationTargets(page: PageLayout): PageNavigationTarget[] {
            this.arrangeStrip(page.content)
            const result: PageNavigationTarget[] = []
            for (let i = 0; i < this.targets_.length; i++) {
                const target = this.targets_[i]
                if (target.focusable === false) continue
                const contentRect = this.targetContentRect(
                    this.controlRects_[i],
                )
                const viewportRect = this.targetViewportRect(page, contentRect)
                const scrollNeeded =
                    viewportRect.width < contentRect.width ||
                    viewportRect.height < contentRect.height
                result.push({
                    id: this.targetFocusId(target.id),
                    rect: viewportRect,
                    scrollOwnerId: scrollNeeded
                        ? EDITOR_PAGE_SCROLL_OWNER
                        : undefined,
                    scrollRect: scrollNeeded ? contentRect : undefined,
                    hidden: viewportRect.width == 0 || viewportRect.height == 0,
                    ruleTarget: target,
                    contentRect,
                    viewportRect,
                })
            }
            return result
        }

        private addRuleControls(ruleRep: RuleRep): void {
            this.targets_.push(this.iconTarget("handle", "rule_handle", 0))
            const firstRuleGap = (this.targets_[0].width >> 1) + 2
            this.addTileTargets(
                "sensors",
                ruleRep.sensors,
                this.whenControlIds_,
                firstRuleGap,
            )
            this.addTileTargets(
                "filters",
                ruleRep.filters,
                this.whenControlIds_,
                this.whenControlIds_.length ? undefined : firstRuleGap,
            )
            const whenInsert = this.whenInsertionTarget(this.rule)
            if (whenInsert) {
                whenInsert.gapBefore = this.whenControlIds_.length
                    ? undefined
                    : firstRuleGap
                this.targets_.push(whenInsert)
                this.whenControlIds_.push(whenInsert.id)
            }

            this.targets_.push(this.staticIcon("rule_arrow", 1, 0))
            this.addTileTargets(
                "actuators",
                ruleRep.actuators,
                this.doControlIds_,
                0,
            )
            this.addTileTargets(
                "modifiers",
                ruleRep.modifiers,
                this.doControlIds_,
                this.doControlIds_.length ? undefined : 0,
            )
            const doInsert = this.doInsertionTarget(this.rule)
            if (doInsert) {
                if (!this.doControlIds_.length) doInsert.gapBefore = 0
                this.targets_.push(doInsert)
                this.doControlIds_.push(doInsert.id)
            }
        }

        private addTileTargets(
            section: RuleSection,
            tiles: Tile[],
            ids: string[],
            firstGap?: number,
        ): void {
            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i]
                const target = this.targetControl(
                    "tile",
                    this.targetBitmap(tile),
                    section,
                    i,
                    tile,
                )
                if (firstGap !== undefined && ids.length == 0)
                    target.gapBefore = firstGap
                this.targets_.push(target)
                ids.push(target.id)
            }
        }

        private iconTarget(
            kind: RuleTargetKind,
            bitmapId: string,
            gapBefore?: number,
        ): RulePageTarget {
            const bitmap = this.bitmap(bitmapId)
            return this.targetControl(
                kind,
                bitmap,
                undefined,
                undefined,
                undefined,
                gapBefore,
            )
        }

        private staticIcon(
            bitmapId: string,
            gapBefore?: number,
            gapAfter?: number,
        ): RulePageTarget {
            const bitmap = this.bitmap(bitmapId)
            return {
                id:
                    ruleTargetControlId(this.ruleIndex, "static") +
                    "/" +
                    bitmapId,
                kind: "static",
                ruleIndex: this.ruleIndex,
                bitmap,
                width: bitmap.width,
                height: bitmap.height,
                gapBefore,
                gapAfter,
                focusable: false,
                style: ui.UiButtonStyles.Transparent,
            }
        }

        private targetControl(
            kind: RuleTargetKind,
            bitmap?: Bitmap,
            section?: RuleSection,
            index?: number,
            tile?: Tile,
            gapBefore?: number,
        ): RulePageTarget {
            const generated =
                kind == "tile" && tile && isGeneratedRuleTile(tile)
            const generatedText = this.targetText(kind, tile)
            const framed =
                kind == "tile" &&
                tile &&
                !generated &&
                !isModifierEditor(tile) &&
                !isConstant(getTid(tile))
            return {
                id: this.targetId(kind, section, index),
                kind,
                ruleIndex: this.ruleIndex,
                section,
                index,
                bitmap,
                width: this.targetWidth(
                    bitmap,
                    framed,
                    generated,
                    generatedText,
                ),
                height: this.targetHeight(bitmap, framed, generated),
                gapBefore,
                text: generatedText,
                textId: this.targetTextId(kind, section, tile),
                focusLabel: this.targetFocusLabel(kind, tile),
                focusLabelId: this.targetFocusLabelId(kind, tile),
                style: this.targetStyle(kind, framed, generated, section, tile),
            }
        }

        private targetBitmap(tile: Tile): Bitmap {
            if (isNumericEntryTile(tile)) return undefined
            if (isIconEditor(tile) || isMelodyEditor(tile)) return undefined
            return this.bitmap(getIcon(tile))
        }

        private targetText(kind: RuleTargetKind, tile?: Tile): string {
            if (kind == "tile" && tile && isNumericEntryTile(tile))
                return numericEntryText(tile)
            return undefined
        }

        private targetFocusLabel(kind: RuleTargetKind, tile?: Tile): string {
            if (kind == "tile" && tile && isNumericEntryTile(tile))
                return numericEntryText(tile)
            return undefined
        }

        private targetFocusLabelId(kind: RuleTargetKind, tile?: Tile): string {
            if (
                kind == "tile" &&
                tile &&
                isGeneratedRuleTile(tile) &&
                !isNumericEntryTile(tile)
            )
                return tidToString(getTid(tile))
            return undefined
        }

        private targetWidth(
            bitmap: Bitmap,
            framed: boolean,
            generated: boolean,
            text?: string,
        ): number {
            if (text !== undefined) {
                // Match the render path, which resolves the default font via
                // ui.locFont(), so measured width tracks the drawn glyphs.
                return (text.length + 1) * ui.locFont().charWidth
            }
            if (generated) return EDITOR_RULE_GENERATED_TILE_SIZE
            return framed ? bitmap.width + 2 : bitmap.width
        }

        private targetHeight(
            bitmap: Bitmap,
            framed: boolean,
            generated: boolean,
        ): number {
            if (generated) return EDITOR_RULE_GENERATED_TILE_SIZE
            return framed ? bitmap.height + 2 : bitmap.height
        }

        private targetTextId(
            kind: RuleTargetKind,
            section?: RuleSection,
            tile?: Tile,
        ): string {
            if (kind == "handle") return "rule"
            if (kind == "insert" && this.virtualRule_)
                return this.insertionTextId(section)
            if (kind == "tile" && tile && isGeneratedRuleTile(tile))
                return undefined
            if (kind == "tile" && tile) return tidToString(getTid(tile))
            return undefined
        }

        private insertionTextId(section?: RuleSection): string {
            if (section == "sensors" || section == "filters") return "when"
            if (section == "actuators" || section == "modifiers") return "do"
            return undefined
        }

        private targetStyle(
            kind: RuleTargetKind,
            framed: boolean,
            generated: boolean,
            section?: RuleSection,
            tile?: Tile,
        ): ui.UiButtonStyle {
            if (kind == "handle") return EDITOR_RULE_HANDLE_STYLE
            if (kind == "insert") return EDITOR_RULE_SUBTLE_LABEL_STYLE
            if (kind == "tile" && generated)
                return ui.buttonStyle(
                    this.framedTileStyle(section),
                    this.generatedTileFrameStyle(tile),
                    EDITOR_RULE_GENERATED_TILE_CONTENT_STYLE,
                )
            if (kind == "tile")
                return framed
                    ? this.framedTileStyle(section)
                    : EDITOR_RULE_UNFRAMED_TILE_STYLE
            return ui.UiButtonStyles.Transparent
        }

        private generatedTileFrameStyle(tile?: Tile): ui.UiButtonStyle {
            if (tile && isIconEditor(tile))
                return {
                    backgroundColor: 15,
                    shadowColor: 15,
                }
            if (tile && isMelodyEditor(tile))
                return {
                    backgroundColor: 1,
                    shadowColor: 1,
                }
            return undefined
        }

        private framedTileStyle(section?: RuleSection): ui.UiButtonStyle {
            if (section == "actuators" || section == "modifiers")
                return EDITOR_RULE_DO_TILE_STYLE
            return EDITOR_RULE_WHEN_TILE_STYLE
        }

        private targetId(
            kind: RuleTargetKind,
            section?: RuleSection,
            index?: number,
        ): string {
            return ruleTargetControlId(this.ruleIndex, kind, section, index)
        }

        private bitmap(icon: string | number | Bitmap): Bitmap {
            return typeof icon == "string" || typeof icon == "number"
                ? icons.get(icon)
                : icon
        }

        private whenInsertionTarget(rule: RuleDefn): RulePageTarget {
            if (rule.sensors.length == 0)
                return this.targetControl(
                    "insert",
                    this.bitmap("when_insertion_point"),
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
                return this.targetControl(
                    "insert",
                    this.bitmap("when_insertion_point"),
                    "filters",
                    rule.filters.length,
                )
            return undefined
        }

        private doInsertionTarget(rule: RuleDefn): RulePageTarget {
            if (rule.actuators.length == 0)
                return this.targetControl(
                    "insert",
                    this.bitmap("do_insertion_point"),
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
                return this.targetControl(
                    "insert",
                    this.bitmap("do_insertion_point"),
                    "modifiers",
                    rule.modifiers.length,
                )
            return undefined
        }

        private placeControls(): void {
            this.width_ = this.stripContentWidth()
            this.height_ = this.stripContentHeight()
            this.stripOffsetX_ = -(this.targets_[0].width >> 1)
            this.stripOffsetY_ = -(this.height_ >> 1)
            this.arrangeStrip(new ui.Rect(0, 0, this.width_, this.height_))

            const tray = this.controlIdsBounds(this.whenControlIds_)
            this.addControlIdsBounds(tray, this.doControlIds_)
            tray.inflate(1)
            tray.width = Math.max(tray.width, UI_SCREEN_WIDTH)
            this.tray_.copyFrom(tray)

            const whenBounds = this.controlIdsBounds(this.whenControlIds_)
            this.when_.set(
                tray.x,
                tray.y,
                whenBounds.right - tray.x + 1,
                tray.height,
            )
            this.width_ = this.tray_.width
            this.naturalWidth_ = this.width_
            this.height_ = this.tray_.height
        }

        private fillRect(
            surface: ui.DrawSurface,
            page: PageLayout,
            rect: ui.Rect,
            color: number,
        ): void {
            surface.fillRect(this.absoluteRect(page.content, rect), color)
        }

        private outlineTray(surface: ui.DrawSurface, page: PageLayout): void {
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

        private absoluteRect(viewport: ui.Rect, rect: ui.Rect): ui.Rect {
            return new ui.Rect(
                viewport.x + this.x_ + rect.x,
                viewport.y + this.y_ + rect.y,
                rect.width,
                rect.height,
            )
        }

        private arrangeStrip(viewport: ui.Rect): void {
            this.stripRect_.set(
                viewport.x + this.x_ + this.stripOffsetX_,
                viewport.y + this.y_ + this.stripOffsetY_,
                this.width_,
                this.height_,
            )
            this.ensureControlRects()
            let x = this.stripRect_.x
            for (let i = 0; i < this.targets_.length; i++) {
                const target = this.targets_[i]
                const width = Math.max(target.width, 1)
                const height = Math.max(target.height, 1)
                const gapBefore = target.gapBefore
                x +=
                    gapBefore !== undefined ? Math.max(gapBefore, 0) : i ? 1 : 0
                this.controlRects_[i].set(
                    x,
                    this.stripRect_.y + Math.idiv(this.height_ - height, 2),
                    width,
                    height,
                )
                x +=
                    width +
                    (target.gapAfter !== undefined
                        ? Math.max(target.gapAfter, 0)
                        : 0)
            }
        }

        private controlIdsBounds(ids: string[]): ui.Rect {
            const result = new ui.Rect()
            if (!ids.length) return result
            this.copyControlRect(ids[0], result)
            for (let i = 1; i < ids.length; i++) {
                this.copyControlRect(ids[i], this.controlRectScratch_)
                result.union(this.controlRectScratch_)
            }
            return result
        }

        private addControlIdsBounds(target: ui.Rect, ids: string[]): void {
            for (let i = 0; i < ids.length; i++) {
                this.copyControlRect(ids[i], this.controlRectScratch_)
                target.union(this.controlRectScratch_)
            }
        }

        private copyControlRect(controlId: string, output: ui.Rect): void {
            for (let i = 0; i < this.targets_.length; i++) {
                if (this.targets_[i].id == controlId) {
                    output.copyFrom(this.controlRects_[i])
                    return
                }
            }
        }

        private targetContentRect(targetRect: ui.Rect): ui.Rect {
            return new ui.Rect(
                targetRect.x - this.stripRect_.x + this.x_ + this.stripOffsetX_,
                targetRect.y - this.stripRect_.y + this.y_ + this.stripOffsetY_,
                targetRect.width,
                targetRect.height,
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

        private targetFocusId(controlId: string): ui.UiFocusId {
            return EDITOR_PAGE_SCOPE + "/" + controlId
        }

        private renderControls(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
        ): void {
            for (let i = 0; i < this.targets_.length; i++) {
                const target = this.targets_[i]
                this.prepareTargetBitmap(target)
                this.content_.bitmap = target.bitmap
                this.content_.text =
                    target.text !== undefined
                        ? target.text
                        : target.textId !== undefined
                          ? assets.getText(target.textId)
                          : ""
                this.buttonView_.render(
                    surface,
                    this.controlRects_[i],
                    this.content_,
                    target.style,
                )
            }
        }

        private renderFocus(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus: ui.UiFocusState,
        ): void {
            const activeTargetId =
                focus && focus.getActiveScopeId() == EDITOR_PAGE_SCOPE
                    ? focus.getActiveTargetId(EDITOR_PAGE_SCOPE)
                    : undefined
            for (let i = 0; i < this.targets_.length; i++) {
                const target = this.targets_[i]
                if (activeTargetId == this.targetFocusId(target.id)) {
                    this.content_.bitmap = target.bitmap
                    this.content_.text =
                        target.text !== undefined
                            ? target.text
                            : target.textId !== undefined
                              ? assets.getText(target.textId)
                              : ""
                    let focusLabel = target.focusLabel
                    if (
                        focusLabel === undefined &&
                        target.focusLabelId !== undefined
                    )
                        focusLabel = assets.getText(target.focusLabelId)
                    this.buttonView_.renderFocus(
                        surface,
                        this.controlRects_[i],
                        this.content_,
                        target.style,
                        undefined,
                        focusLabel,
                    )
                    return
                }
            }
        }

        private prepareTargetBitmap(target: RulePageTarget): void {
            if (target.bitmap) return
            const tile = this.targetTile(target)
            if (isIconEditor(tile))
                target.bitmap = icondb.renderMicrobitLEDs(
                    (tile as IconEditor).field,
                )
            else if (isMelodyEditor(tile))
                target.bitmap = icondb.melodyToImage(
                    (tile as MelodyEditor).field,
                )
        }

        private targetTile(target: RulePageTarget): Tile {
            if (
                target.kind != "tile" ||
                !target.section ||
                target.index === undefined
            )
                return undefined
            const ruleRep = this.rule.getRuleRep()
            const index: number = target.index
            if (target.section == "filters") return ruleRep.filters[index]
            if (target.section == "actuators") return ruleRep.actuators[index]
            if (target.section == "modifiers") return ruleRep.modifiers[index]
            return ruleRep.sensors[index]
        }

        private ensureControlRects(): void {
            while (this.controlRects_.length < this.targets_.length)
                this.controlRects_.push(new ui.Rect())
            while (this.controlRects_.length > this.targets_.length)
                this.controlRects_.pop()
        }

        private stripContentWidth(): number {
            let width = 0
            for (let i = 0; i < this.targets_.length; i++) {
                const target = this.targets_[i]
                const gapBefore = target.gapBefore
                width +=
                    gapBefore !== undefined ? Math.max(gapBefore, 0) : i ? 1 : 0
                width += Math.max(target.width, 1)
                width +=
                    target.gapAfter !== undefined
                        ? Math.max(target.gapAfter, 0)
                        : 0
            }
            return width
        }

        private stripContentHeight(): number {
            let height = 0
            for (let i = 0; i < this.targets_.length; i++)
                height = Math.max(height, Math.max(this.targets_[i].height, 1))
            return height
        }
    }

    interface PageLayout {
        viewport: ui.Rect
        content: ui.Rect
        contentWidth: number
        contentHeight: number
        rules: RuleView[]
    }

    interface PageNavigationTarget extends ui.UiFocusNavigationTarget {
        ruleTarget: RulePageTarget
        contentRect: ui.Rect
        viewportRect: ui.Rect
    }

    interface RulePageTarget {
        id: string
        kind: RuleTargetKind
        ruleIndex: number
        section?: RuleSection
        index?: number
        bitmap?: Bitmap
        width: number
        height: number
        gapBefore?: number
        gapAfter?: number
        text?: string
        textId?: string
        focusLabel?: string
        focusLabelId?: string
        style?: ui.UiButtonStyle
        focusable?: boolean
    }

    interface PageTargetPosition {
        row: number
        column: number
    }

    type RuleSection = "sensors" | "filters" | "actuators" | "modifiers"

    type RuleTargetKind = "handle" | "tile" | "insert" | "static"

    class EditorToolbar
        implements
            ui.UiFocusableView<EditorToolbarResult>,
            ui.UiFocusNavigationProvider
    {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private getProgram_: () => ProgramDefn
        private getPage_: () => number
        private pageView_: PageView
        private runControl_: EditorToolbarControl
        private stopControl_: EditorToolbarControl
        private pageControl_: EditorToolbarControl
        private toolbarControls_: EditorToolbarControl[]
        private toolbarRects_: ui.Rect[]
        private toolbarButtonView_: ui.UiButtonView
        private toolbarStyle_: ui.UiButtonStyle
        private navigationScratch_: ui.UiFocusNavigationTarget[]
        private openDisk_: () => void
        private openPage_: () => void

        constructor(
            getProgram: () => ProgramDefn,
            getPage: () => number,
            pageView: PageView,
            openDisk: () => void,
            openPage: () => void,
        ) {
            this.layoutSpec = {
                width: { mode: "fixed", value: UI_SCREEN_WIDTH },
                height: { mode: "fixed", value: EDITOR_TOOLBAR_HEIGHT },
            }
            this.finalRect = new ui.Rect()
            this.layoutDirty = true
            this.getProgram_ = getProgram
            this.getPage_ = getPage
            this.pageView_ = pageView
            this.openDisk_ = openDisk
            this.openPage_ = openPage
            this.runControl_ = {
                id: "run",
                value: "run",
                textId: "run",
            }
            this.stopControl_ = {
                id: "stop",
                value: "stop",
                textId: "stop",
            }
            this.pageControl_ = {
                id: "page",
                value: "page",
                textId: "page",
            }
            this.toolbarControls_ = [
                {
                    id: "disk",
                    value: "disk",
                    bitmap: icondb.disk,
                    textId: "disk",
                },
                this.runControl_,
                this.stopControl_,
                this.pageControl_,
            ]
            this.pageControl_.gapBefore =
                EDITOR_TOOLBAR_PAGE_X -
                (EDITOR_TOOLBAR_LEFT_X + EDITOR_TOOLBAR_LEFT_WIDTH)
            this.toolbarStyle_ = ui.buttonStyle(
                EDITOR_RULE_SUBTLE_LABEL_STYLE,
                ui.UiButtonStyles.BorderedPurple,
                ui.UiButtonStyles.RoundedFrame,
            )
            this.toolbarRects_ = []
            this.toolbarButtonView_ = new ui.UiButtonView(this.toolbarStyle_)
            this.navigationScratch_ = []
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
            this.arrangeToolbarControls(rect)
            this.clearLayoutInvalidation()
        }

        public invalidateLayout(): void {
            this.layoutDirty = true
        }

        public clearLayoutInvalidation(): void {
            this.layoutDirty = false
        }

        public registerFocusTargets(focus: ui.UiFocusState): void {
            focus.setScope({
                id: EDITOR_TOOLBAR_SCOPE,
                preferredTargetId: this.targetId("disk"),
            })
            this.registerToolbarTargets(focus)
        }

        public registerNavigation(controller: ui.UiFocusInputController): void {
            controller.setNavigation(EDITOR_TOOLBAR_SCOPE, this)
        }

        public focusDefault(focus: ui.UiFocusState): ui.UiFocusSetResult {
            return focus.setActiveScope(EDITOR_TOOLBAR_SCOPE)
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
            const result = this.move({
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
            const target = this.nearestToolbarTarget(source)
            return target
                ? { scopeId: EDITOR_TOOLBAR_SCOPE, targetId: target.id }
                : undefined
        }

        public handleFocusInput(
            result: ui.UiFocusInputResult,
        ): EditorToolbarResult {
            if (
                result.kind != "activated" ||
                result.scopeId != EDITOR_TOOLBAR_SCOPE
            )
                return undefined
            const action = this.actionForTargetId(result.targetId)
            if (action == "disk") this.openDisk_()
            else if (action == "run") runProgramIfStopped(this.getProgram_())
            else if (action == "stop") stopProgramIfRunning()
            else if (action == "page") this.openPage_()
            else return undefined
            return { kind: "activated" }
        }

        public render(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus?: ui.UiFocusState,
        ): void {
            this.updateProgramControls()
            this.renderToolbarControls(surface, assets)
            this.renderToolbarFocus(surface, assets, focus)
        }

        public move(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult | undefined {
            if (request.scopeId != EDITOR_TOOLBAR_SCOPE) return undefined
            const result = ui.moveFocusInRaggedGrid({
                scopeId: EDITOR_TOOLBAR_SCOPE,
                currentTargetId: request.currentTargetId,
                direction: request.direction,
                rows: [this.toolbarTargets()],
            })
            if (result.kind == "moved") return result
            if (
                result.kind != "exited" &&
                (result.kind != "stayed" || result.reason != "boundary")
            )
                return result
            const target = this.pageTargetForExit(
                request.direction,
                request.currentTargetId,
            )
            if (!target) return result
            return {
                kind: "moved",
                fromScopeId: EDITOR_TOOLBAR_SCOPE,
                fromTargetId: request.currentTargetId,
                toScopeId: EDITOR_PAGE_SCOPE,
                toTargetId: target.id,
            }
        }

        private updateProgramControls(): void {
            const running = isProgramRunning()
            this.runControl_.bitmap = running ? icondb.runDisabled : icondb.run
            this.stopControl_.bitmap = running
                ? icondb.stop
                : icondb.stopDisabled
            this.pageControl_.bitmapId = PAGE_IDS()[this.getPage_()]
        }

        private nearestToolbarTarget(
            source: ui.UiFocusNavigationTarget,
        ): ui.UiFocusNavigationTarget {
            const targets = this.toolbarTargets()
            let nearest: ui.UiFocusNavigationTarget = undefined
            let nearestDistance = 0
            const sourceX = source.rect.x + Math.idiv(source.rect.width, 2)
            const sourceY = source.rect.y + Math.idiv(source.rect.height, 2)
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                if (target.hidden) continue
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

        private pageTargetForExit(
            direction: ui.UiFocusDirection,
            targetId: ui.UiFocusId,
        ): ui.UiFocusNavigationTarget {
            if (direction == "right" && targetId == this.targetId("page"))
                return this.pageView_.firstRuleHandleTarget()
            if (direction == "left" && targetId == this.targetId("disk"))
                return this.pageView_.lastPageTarget()
            if (direction == "down")
                return this.pageView_.nearestNavigationTarget(
                    this.toolbarTargetById(targetId),
                )
            return undefined
        }

        private targetDistanceFromCenter(
            target: ui.UiFocusNavigationTarget,
            sourceX: number,
            sourceY: number,
        ): number {
            const dx = target.rect.x + Math.idiv(target.rect.width, 2) - sourceX
            const dy =
                target.rect.y + Math.idiv(target.rect.height, 2) - sourceY
            return dx * dx + dy * dy
        }

        private toolbarTargetById(
            targetId: ui.UiFocusId,
        ): ui.UiFocusNavigationTarget {
            const targets = this.toolbarTargets()
            for (let i = 0; i < targets.length; i++) {
                if (targets[i].id == targetId) return targets[i]
            }
            return undefined
        }

        private toolbarTargets(): ui.UiFocusNavigationTarget[] {
            while (this.navigationScratch_.length) this.navigationScratch_.pop()
            for (let i = 0; i < this.toolbarControls_.length; i++) {
                const control = this.toolbarControls_[i]
                if (
                    !_uiControls.isVisible(control) ||
                    !_uiControls.isFocusable(control)
                )
                    continue
                this.navigationScratch_.push({
                    id: this.targetId(control.id),
                    rect: this.toolbarRects_[i],
                    hidden: !_uiControls.isVisible(control),
                })
            }
            return this.navigationScratch_
        }

        private targetId(controlId: string): ui.UiFocusId {
            return EDITOR_TOOLBAR_SCOPE + "/" + controlId
        }

        private actionForTargetId(targetId: ui.UiFocusId): EditorToolbarAction {
            for (let i = 0; i < this.toolbarControls_.length; i++) {
                const control = this.toolbarControls_[i]
                if (targetId == this.targetId(control.id)) return control.value
            }
            return undefined
        }

        private arrangeToolbarControls(rect: ui.Rect): void {
            while (this.toolbarRects_.length < this.toolbarControls_.length)
                this.toolbarRects_.push(new ui.Rect())
            let x = rect.x + EDITOR_TOOLBAR_LEFT_X
            const y = rect.y + EDITOR_TOOLBAR_BUTTON_Y
            for (let i = 0; i < this.toolbarControls_.length; i++) {
                const control = this.toolbarControls_[i]
                x += _uiControls.sanitizeDimension(
                    control.gapBefore,
                    i ? EDITOR_TOOLBAR_GAP : 0,
                )
                this.toolbarRects_[i].set(
                    x,
                    y,
                    EDITOR_TOOLBAR_BUTTON_SIZE,
                    EDITOR_TOOLBAR_BUTTON_SIZE,
                )
                x += EDITOR_TOOLBAR_BUTTON_SIZE
            }
        }

        private registerToolbarTargets(focus: ui.UiFocusState): void {
            for (let i = 0; i < this.toolbarControls_.length; i++) {
                const control = this.toolbarControls_[i]
                if (
                    !_uiControls.isVisible(control) ||
                    !_uiControls.isFocusable(control)
                )
                    continue
                focus.setTarget({
                    id: this.targetId(control.id),
                    scopeId: EDITOR_TOOLBAR_SCOPE,
                    rect: this.toolbarRects_[i],
                    activatable: true,
                })
            }
        }

        private renderToolbarControls(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
        ): void {
            for (let i = 0; i < this.toolbarControls_.length; i++) {
                const control = this.toolbarControls_[i]
                if (!_uiControls.isVisible(control)) continue
                _uiControls.renderControl(
                    surface,
                    control,
                    this.toolbarRects_[i],
                    this.toolbarButtonView_,
                    this.toolbarStyle_,
                    undefined,
                    undefined,
                    assets,
                )
            }
        }

        private renderToolbarFocus(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus: ui.UiFocusState,
        ): void {
            const activeTargetId = _uiControls.activeTargetIdForScope(
                focus,
                EDITOR_TOOLBAR_SCOPE,
            )
            const index = _uiControls.focusedControlOverlayIndex(
                EDITOR_TOOLBAR_SCOPE,
                this.toolbarControls_,
                activeTargetId,
            )
            if (index < 0) return
            _uiControls.renderControl(
                surface,
                this.toolbarControls_[index],
                this.toolbarRects_[index],
                this.toolbarButtonView_,
                this.toolbarStyle_,
                undefined,
                true,
                assets,
            )
        }
    }
}
