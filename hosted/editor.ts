namespace microcode {
    type EditorToolbarAction = "disk" | "run" | "stop" | "page"

    type EditorToolbarResult = ui.UiRowResult<EditorToolbarAction>
    type EditorDiskSlot = string
    type EditorPagePickerValue = number
    type RuleHandleAction = "add" | "delete" | "moveUp" | "moveDown"
    type TileSuggestionAction = "suggestion" | "delete"
    type FieldEditorModalAction = "cell" | "commit" | "delete"

    interface TileSuggestionValue {
        kind: TileSuggestionAction
        tile?: Tile
    }

    interface TileEditTarget {
        value: RuleTargetControlValue
        tile: Tile
        pending: boolean
    }

    type TileSuggestionModalResult = ui.UiPickerResult<TileSuggestionValue>

    interface FieldEditorModalValue {
        kind: FieldEditorModalAction
        row?: number
        col?: number
    }

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
    const EDITOR_RULE_GENERATED_TILE_CONTENT_STYLE: ui.UiButtonStyle = {
        foregroundColor: 15,
        textPlacement: "content",
        font: bitmaps.font8,
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
    const EDITOR_TILE_SUGGESTION_TITLE_GAP =
        EDITOR_FIELD_MODAL_GRID_GAP + 1
    const EDITOR_FIELD_DELETE_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.RedBorderedWhite,
        ui.UiButtonStyles.RoundedFrame,
    )
    const EDITOR_FIELD_OK_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.GreenBorderedWhite,
        ui.UiButtonStyles.RoundedFrame,
    )
    const EDITOR_ICON_FIELD_MODAL_STYLE = ui.modalStyle(AppStyles.Modal, {
        panelColor: 0,
    })

    function ruleControlId(ruleIndex: number): string {
        return "rule-" + ruleIndex
    }

    function ruleTargetControlId(
        ruleIndex: number,
        kind: RuleTargetKind,
        section?: RuleSection,
        index?: number,
    ): string {
        let id = ruleControlId(ruleIndex) + "/" + kind
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
        return EDITOR_PAGE_SCOPE + "/" + ruleTargetControlId(
            ruleIndex,
            kind,
            section,
            index,
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

    function isIconFieldEditorTile(tile: Tile): boolean {
        return tile instanceof IconEditor
    }

    function isMelodyFieldEditorTile(tile: Tile): boolean {
        return tile instanceof MelodyEditor
    }

    function isIconOrMelodyFieldEditorTile(tile: Tile): boolean {
        return isIconFieldEditorTile(tile) || isMelodyFieldEditorTile(tile)
    }

    function isFieldEditorTile(tile: Tile): boolean {
        return !!getFieldEditor(tile)
    }

    function isGeneratedRuleTile(tile: Tile): boolean {
        return (
            isNumericEntryTile(tile) ||
            isIconFieldEditorTile(tile) ||
            isMelodyFieldEditorTile(tile)
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
        if (getFieldEditor(tile)) {
            const editor = tile as DigitEditor
            return editor.getField().num
        }
        return "" + getParam(tile)
    }

    function cloneIconField(tile: IconEditor): Bitmap {
        return (tile.getField() as Bitmap).clone()
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
        const field = tile.getField() as Melody
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

        public render(surface: ui.DrawSurface): void {
            surface.clear(this.backgroundColor)
            this.drawBackground(surface)
            // Background drawing happens before registered roots so controls
            // and their focus affordances appear above the editor backdrop.
            super.render(surface)
        }

        public handleScreenInput(event: ui.UiInputEvent): boolean | undefined {
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
            if (this.currPage_ == 0) this.navigation_.launchHome()
        }

        private openDiskModal(): void {
            if (this.hasModal) return
            this.openModal(this.createDiskModal())
        }

        private createDiskModal(): ui.UiPicker<EditorDiskSlot> {
            return new ui.UiPicker<EditorDiskSlot>({
                modalScopeId: EDITOR_DISK_MODAL_SCOPE,
                controls: this.createDiskControls(),
                titleId: "disk",
                columnCount: AppStyles.ModalColumnCount,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                controlStyle: AppStyles.ModalButton,
                modalStyle: AppStyles.Modal,
            })
        }

        private createDiskControls(): ui.UiControl<EditorDiskSlot>[] {
            return diskSlots().map(slot =>
                ui.iconButton<EditorDiskSlot>(
                    slot,
                    slot,
                    () => this.saveDiskSlot(slot),
                )
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

        private createPageModal(): ui.UiPicker<EditorPagePickerValue> {
            return new ui.UiPicker<EditorPagePickerValue>({
                modalScopeId: EDITOR_PAGE_MODAL_SCOPE,
                controls: this.createPageControls(),
                defaultControlId: "page-" + this.currPage_,
                columnCount: PAGE_IDS().length,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                controlStyle: AppStyles.ModalButton,
                modalStyle: AppStyles.TitlelessModal,
            })
        }

        private createPageControls(): ui.UiControl<EditorPagePickerValue>[] {
            const pageIds = PAGE_IDS()
            return pageIds.map((pageId, index) => {
                return {
                    id: "page-" + index,
                    value: index,
                    bitmapId: pageId,
                    selected: index == this.currPage_,
                    onActivate: (pageIndex: number) =>
                        this.switchToPage(pageIndex),
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
            else if (
                value.kind == "tile" &&
                isNumericEntryTile(value.tile)
            )
                this.openNumericEntryModal({
                    value,
                    tile: value.tile,
                    pending: false,
                })
            else if (
                value.kind == "tile" &&
                isIconOrMelodyFieldEditorTile(value.tile)
            )
                this.openFieldEditorModal({
                    value,
                    tile: value.tile,
                    pending: false,
                })
            else if (value.kind == "tile" || value.kind == "insert")
                this.openTileSuggestionModal(value)
        }

        private openRuleHandleModal(value: RuleTargetControlValue): void {
            if (this.hasModal) return
            this.openModal(this.createRuleHandleModal(value))
        }

        private createRuleHandleModal(
            value: RuleTargetControlValue,
        ): ui.UiPicker<RuleHandleAction> {
            const controls = this.createRuleHandleControls(value)
            return new ui.UiPicker<RuleHandleAction>({
                modalScopeId: EDITOR_RULE_HANDLE_MODAL_SCOPE,
                controls,
                columnCount: controls.length,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                controlStyle: EDITOR_RULE_HANDLE_MODAL_STYLE,
                modalStyle: AppStyles.TitlelessModal,
            })
        }

        private createRuleHandleControls(
            value: RuleTargetControlValue,
        ): ui.UiControl<RuleHandleAction>[] {
            const controls: ui.UiControl<RuleHandleAction>[] = [
                this.ruleHandleControl("add", "plus", "add_rule", value),
                this.ruleHandleControl("delete", "delete", "delete_rule", value),
            ]
            const realRuleCount = this.realRuleCount(this.currentPage())
            const virtualRule = this.isVirtualRule(value)
            if (!virtualRule && value.ruleIndex > 0)
                controls.push(
                    this.ruleHandleControl(
                        "moveUp",
                        "rule_up",
                        "rule_up",
                        value,
                    ),
                )
            if (!virtualRule && value.ruleIndex < realRuleCount - 1)
                controls.push(
                    this.ruleHandleControl(
                        "moveDown",
                        "rule_down",
                        "rule_down",
                        value,
                    ),
                )
            return controls
        }

        private ruleHandleControl(
            action: RuleHandleAction,
            bitmapId: string,
            textId: string,
            value: RuleTargetControlValue,
        ): ui.UiControl<RuleHandleAction> {
            return {
                id: action,
                value: action,
                bitmapId,
                textId,
                onActivate: () => this.applyRuleHandleAction(action, value),
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
            let stoppedForEdit = false
            let changed = false

            if (!virtualRule) {
                if (action == "add") {
                    if (running) {
                        stopProgram()
                        stoppedForEdit = true
                    }
                    changed = !!page.insertRuleAt(value.ruleIndex, undefined)
                    focusKind = "insert"
                    focusSection = "sensors"
                    focusIndex = 0
                } else if (action == "delete") {
                    if (running) {
                        stopProgram()
                        stoppedForEdit = true
                    }
                    changed = !!page.deleteRuleAt(value.ruleIndex)
                } else if (action == "moveUp" && value.ruleIndex > 0) {
                    if (running) {
                        stopProgram()
                        stoppedForEdit = true
                    }
                    changed = this.moveRule(page, value.ruleIndex, -1)
                    focusRuleIndex = value.ruleIndex - 1
                } else if (
                    action == "moveDown" &&
                    value.ruleIndex < this.realRuleCount(page) - 1
                ) {
                    if (running) {
                        stopProgram()
                        stoppedForEdit = true
                    }
                    changed = this.moveRule(page, value.ruleIndex, 1)
                    focusRuleIndex = value.ruleIndex + 1
                }
            }

            if (changed) {
                this.app_.save(SAVESLOT_AUTO, this.progdef_.toBuffer())
                this.pageView_.pageChanged()
            }
            if (stoppedForEdit) runProgram(this.progdef_)

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
            return this.progdef_ ? this.progdef_.pages[this.currPage_] : undefined
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
            const suggestions = Language.getTileSuggestions(
                value.rule,
                value.section,
                value.index,
            )
            if (!suggestions.length) return undefined
            if (this.isSingleFieldEditorSuggestion(suggestions)) {
                this.openPendingFieldEditor(value, suggestions[0])
                return undefined
            }
            const controls = this.createTileSuggestionControls(value, suggestions)
            const selected = this.selectedTileSuggestionId(value, suggestions)
            const columnCount = Math.min(
                EDITOR_TILE_SUGGESTION_MAX_COLUMNS,
                controls.length,
            )
            const titleId = this.tileSuggestionTitleId(value)
            return new ui.UiPicker<TileSuggestionValue>({
                modalScopeId: EDITOR_TILE_SUGGESTION_MODAL_SCOPE,
                controls,
                titleControls: this.canDeleteFromSuggestionPicker(value)
                    ? [this.tileSuggestionDeleteControl(value)]
                    : undefined,
                titleId,
                defaultControlId: selected,
                horizontalWrap: true,
                columnCount,
                controlWidth: AppStyles.ModalItemSize,
                controlHeight: AppStyles.ModalItemSize,
                rowGap: EDITOR_FIELD_MODAL_GRID_GAP,
                columnGap: EDITOR_FIELD_MODAL_GRID_GAP,
                controlStyle: EDITOR_TILE_SUGGESTION_MODAL_STYLE,
                titleControlWidth: AppStyles.ModalItemSize,
                titleControlHeight: AppStyles.ModalItemSize,
                titleControlStyle: EDITOR_TILE_SUGGESTION_MODAL_STYLE,
                titleGap: EDITOR_TILE_SUGGESTION_TITLE_GAP,
                modalStyle: titleId ? AppStyles.Modal : AppStyles.TitlelessModal,
            })
        }

        private isTileSuggestionTarget(value: RuleTargetControlValue): boolean {
            if (!value.section || value.index === undefined) return false
            if (value.kind == "insert") return true
            return value.kind == "tile" && value.tile && !isFieldEditorTile(value.tile)
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
            const selectedTid = this.selectedTileSuggestionTid(value)
            const control: ui.UiControl<TileSuggestionValue> = {
                id: "suggestion-" + index,
                value: {
                    kind: "suggestion",
                    tile,
                },
                textId: tidToString(getTid(tile)),
                selected: selectedTid !== undefined && selectedTid == getTid(tile),
                onActivate: () => this.applyTileSuggestion(value, tile),
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
                value: { kind: "delete" },
                bitmapId: "delete",
                textId: "delete",
                style: EDITOR_FIELD_DELETE_STYLE,
                onActivate: () => this.deleteSuggestedTile(value),
            }
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
            if (!value.tile) return undefined
            if (!isFieldEditorTile(value.tile) && isNumericEntryTile(value.tile))
                return Tid.TID_DECIMAL_EDITOR
            return getTid(value.tile)
        }

        private canDeleteFromSuggestionPicker(
            value: RuleTargetControlValue,
        ): boolean {
            return (
                value.kind == "tile" &&
                value.tile &&
                !isFieldEditorTile(value.tile) &&
                filterModifierWithDelete(value.tile)
            )
        }

        private tileSuggestionTitleId(value: RuleTargetControlValue): string {
            if (value.section == "sensors" || value.section == "actuators")
                return value.section
            return undefined
        }

        private isSingleFieldEditorSuggestion(suggestions: Tile[]): boolean {
            return (
                suggestions.length == 1 &&
                suggestions[0] instanceof ModifierEditor
            )
        }

        private applyTileSuggestion(
            value: RuleTargetControlValue,
            tile: Tile,
        ): void {
            if (tile instanceof ModifierEditor) {
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
            const target: TileEditTarget = {
                value,
                tile: candidate,
                pending: true,
            }
            if (isNumericEntryTile(candidate)) this.openNumericEntryModal(target)
            else if (isIconOrMelodyFieldEditorTile(candidate))
                this.openFieldEditorModal(target)
        }

        private fieldEditorCandidate(
            value: RuleTargetControlValue,
            tile: Tile,
        ): ModifierEditor {
            if (
                value.kind == "tile" &&
                value.tile &&
                !isFieldEditorTile(value.tile) &&
                isNumericEntryTile(value.tile) &&
                tile instanceof DigitEditor
            ) {
                return new DigitEditor(
                    { num: numericEntryText(value.tile) },
                    getTid(tile) == Tid.TID_POS_INT_EDITOR,
                )
            }
            const source = this.previousFieldEditor(value) || tile
            if (!(source instanceof ModifierEditor)) return undefined
            return source.getNewInstance()
        }

        private previousFieldEditor(
            value: RuleTargetControlValue,
        ): ModifierEditor {
            if (!value.section || value.index === undefined || value.index <= 0)
                return undefined
            const tiles = value.rule.getRuleRep()[value.section]
            const previous = tiles[value.index - 1]
            return previous instanceof ModifierEditor
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
            const inserting = value.kind == "insert"
            this.applyHostedEdit(wasRunning, () => {
                const rule = this.committedTileSuggestionRule(value)
                if (!rule) return
                if (inserting) added = rule.push(tile, value.section)
                else rule.updateAt(value.section, value.index, tile)
                Language.ensureValid(rule)
            })
            this.closeModal()
            if (inserting && !focusInsertedTile)
                this.focusAfterInsertion(value, added)
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
            if (!this.isVirtualRule(value)) return value.rule
            const page = this.currentPage()
            if (!page) return undefined
            return page.insertRuleAt(value.ruleIndex, value.rule)
        }

        private deleteSuggestedTile(value: RuleTargetControlValue): void {
            if (!this.canDeleteFromSuggestionPicker(value)) {
                this.closeModal()
                return
            }
            const wasRunning = isProgramRunning()
            const fallback = this.deleteFocusTarget(value)
            this.applyHostedEdit(wasRunning, () => {
                value.rule.deleteAt(value.section, value.index)
                Language.ensureValid(value.rule)
            })
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
            added: number,
        ): void {
            if (
                this.focusFollowingInsertion(
                    value.ruleIndex,
                    value.rule,
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

        private openNumericEntryModal(target: TileEditTarget): void {
            if (this.hasModal) return
            const modal = this.createNumericEntryModal(target)
            if (modal) this.openModal(modal)
        }

        private createNumericEntryModal(
            target: TileEditTarget,
        ): ui.UiNumericEntryModal {
            if (!target.tile || !isNumericEntryTile(target.tile))
                return undefined
            const wasRunning = isProgramRunning()
            return new ui.UiNumericEntryModal({
                modalScopeId: EDITOR_NUMERIC_MODAL_SCOPE,
                mode: numericEntryMode(target.tile),
                initialText: numericEntryText(target.tile),
                maxLength: 8,
                deleteEnabled: !target.pending,
                deleteIcon: "delete",
                modalStyle: AppStyles.NumericModal,
                keyStyle: AppStyles.ModalButton,
                displayPalette: AppStyles.NumericDisplayPalette,
                onResult: result =>
                    this.applyNumericEntryResult(target, result, wasRunning),
            })
        }

        private applyNumericEntryResult(
            target: TileEditTarget,
            result: ui.UiNumericEntryResult,
            wasRunning: boolean,
        ): void {
            if (!result) return
            if (result.kind == "completed")
                this.completeNumericEntry(target, result, wasRunning)
            else if (result.kind == "deleted")
                this.deleteEditedTile(target.value, wasRunning)
        }

        private completeNumericEntry(
            target: TileEditTarget,
            result: ui.UiNumericEntryResult,
            wasRunning: boolean,
        ): void {
            if (!target.tile || !isNumericEntryTile(target.tile)) {
                this.closeModal()
                return
            }
            if (target.pending) {
                const tile = this.completedNumericTile(
                    target.tile,
                    (<any>result).text,
                )
                this.commitTileSuggestion(
                    target.value,
                    tile,
                    wasRunning,
                    true,
                )
                return
            }
            const value = target.value
            const text = (<any>result).text
            if (this.numericEntryResultChanged(value, text))
                this.applyHostedEdit(wasRunning, () => {
                    this.writeNumericEntryResult(value, text)
                    Language.ensureValid(value.rule)
                })
            this.closeModal()
            this.pageView_.focusRuleTarget(
                this.focus,
                value.ruleIndex,
                value.kind,
                value.section,
                value.index,
            )
        }

        private writeNumericTextToTile(tile: Tile, text: string): void {
            if (!getFieldEditor(tile)) return
            const editor = tile as DigitEditor
            editor.getField().num = text
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
            if (getFieldEditor(value.tile)) {
                const editor = value.tile as DigitEditor
                return editor.getField().num != text
            }
            if (!value.section || value.index === undefined) return false
            const literal = numericLiteralTile(text)
            return literal === undefined || getTid(value.tile) != literal
        }

        private writeNumericEntryResult(
            value: RuleTargetControlValue,
            text: string,
        ): boolean {
            if (getFieldEditor(value.tile)) {
                const editor = value.tile as DigitEditor
                if (editor.getField().num == text) return false
                editor.getField().num = text
                return true
            }
            if (!value.section || value.index === undefined) return false
            const literal = numericLiteralTile(text)
            if (literal !== undefined && getTid(value.tile) == literal)
                return false
            value.rule.updateAt(
                value.section,
                value.index,
                literal !== undefined ? literal : new DigitEditor({ num: text }),
            )
            return true
        }

        private openFieldEditorModal(target: TileEditTarget): void {
            if (this.hasModal) return
            const modal = this.createFieldEditorModal(target)
            if (modal) this.openModal(modal)
        }

        private createFieldEditorModal(
            target: TileEditTarget,
        ): ui.UiPicker<FieldEditorModalValue> {
            if (!target.tile || !isIconOrMelodyFieldEditorTile(target.tile))
                return undefined
            if (isIconFieldEditorTile(target.tile))
                return this.createIconFieldEditorModal(
                    target,
                    target.tile as IconEditor,
                )
            return this.createMelodyFieldEditorModal(
                target,
                target.tile as MelodyEditor,
            )
        }

        private createIconFieldEditorModal(
            target: TileEditTarget,
            tile: IconEditor,
        ): ui.UiPicker<FieldEditorModalValue> {
            const field = cloneIconField(tile)
            const controls = this.createIconFieldControls(field)
            const wasRunning = isProgramRunning()
            return this.createFieldEditorPicker(
                icons.get(Tid.TID_ACTUATOR_PAINT),
                EDITOR_ICON_FIELD_MODAL_STYLE,
                controls,
                5,
                undefined,
                !target.pending,
                (controlValue, control) => {
                    if (controlValue.kind == "commit")
                        this.commitIconFieldEditor(target, field, wasRunning)
                    else if (controlValue.kind == "delete")
                        this.deleteEditedTile(target.value, wasRunning)
                    else
                        this.toggleIconFieldCell(field, control)
                },
            )
        }

        private createFieldEditorPicker(
            titleBitmap: Bitmap,
            modalStyle: ui.UiModalStyle,
            controls: ui.UiControl<FieldEditorModalValue>[],
            columnCount: number,
            rowGap: number,
            deleteEnabled: boolean,
            onActivate: ui.UiControlActivateHandler<FieldEditorModalValue>,
        ): ui.UiPicker<FieldEditorModalValue> {
            return new ui.UiPicker<FieldEditorModalValue>({
                modalScopeId: EDITOR_FIELD_MODAL_SCOPE,
                controls,
                titleControls: this.fieldTitleControls(deleteEnabled),
                titleBitmap,
                defaultControlId: "cell-2-2",
                closeOnActivate: false,
                columnCount,
                horizontalWrap: true,
                controlWidth: EDITOR_FIELD_MODAL_CELL_SIZE,
                controlHeight: EDITOR_FIELD_MODAL_CELL_SIZE,
                rowGap:
                    rowGap !== undefined
                        ? rowGap
                        : EDITOR_FIELD_MODAL_GRID_GAP,
                columnGap: EDITOR_FIELD_MODAL_GRID_GAP,
                titleControlWidth: EDITOR_FIELD_MODAL_CELL_SIZE,
                titleControlHeight: EDITOR_FIELD_MODAL_CELL_SIZE,
                titleGap: EDITOR_FIELD_MODAL_GRID_GAP,
                modalStyle: modalStyle || AppStyles.Modal,
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
                    value: { kind: "commit" },
                    bitmap: this.okBitmap(),
                    style: EDITOR_FIELD_OK_STYLE,
                }
            return {
                id: "delete",
                value: { kind: "delete" },
                bitmapId: "delete",
                style: EDITOR_FIELD_DELETE_STYLE,
            }
        }

        private okBitmap(): Bitmap {
            const font = bitmaps.font8
            const text = "OK"
            const bitmap = bitmaps.create(
                EDITOR_FIELD_MODAL_CELL_SIZE,
                EDITOR_FIELD_MODAL_CELL_SIZE,
            )
            const x = Math.max(
                0,
                Math.idiv(
                    EDITOR_FIELD_MODAL_CELL_SIZE - font.charWidth * text.length,
                    2,
                ),
            )
            const y = Math.max(
                0,
                Math.idiv(EDITOR_FIELD_MODAL_CELL_SIZE - font.charHeight, 2),
            )
            bitmap.print(
                text,
                x,
                y,
                15,
                font,
            )
            return bitmap
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
                            this.iconFieldBitmap(field, row, col),
                        ),
                    )
                }
            }
            return controls
        }

        private createMelodyFieldEditorModal(
            target: TileEditTarget,
            tile: MelodyEditor,
        ): ui.UiPicker<FieldEditorModalValue> {
            const field = cloneMelodyField(tile)
            const controls = this.createMelodyFieldControls(field)
            const wasRunning = isProgramRunning()
            return this.createFieldEditorPicker(
                icons.get(Tid.TID_ACTUATOR_MUSIC),
                undefined,
                controls,
                MELODY_LENGTH,
                EDITOR_MELODY_FIELD_MODAL_ROW_GAP,
                !target.pending,
                (controlValue, control) => {
                    if (controlValue.kind == "commit")
                        this.commitMelodyFieldEditor(target, field, wasRunning)
                    else if (controlValue.kind == "delete")
                        this.deleteEditedTile(target.value, wasRunning)
                    else
                        this.toggleMelodyFieldCell(field, controls, control)
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
            bitmap: string | Bitmap,
        ): ui.UiControl<FieldEditorModalValue> {
            const control: ui.UiControl<FieldEditorModalValue> = {
                id: "cell-" + row + "-" + col,
                value: {
                    kind: "cell",
                    row,
                    col,
                },
                style: ui.UiButtonStyles.Transparent,
            }
            if (typeof bitmap == "string") {
                control.bitmapId = bitmap
                control.toggled = bitmap == "solid_red" || bitmap == "note_on"
            } else {
                control.bitmap = bitmap
                control.toggled = false
            }
            return control
        }

        private iconFieldBitmap(
            field: Bitmap,
            row: number,
            col: number,
        ): string | Bitmap {
            return field.getPixel(col, row)
                ? "solid_red"
                : "led_off"
        }

        private melodyFieldBitmapId(
            field: Melody,
            row: number,
            col: number,
        ): string {
            const note = field.notes.charAt(col)
            return note != "." &&
                parseInt(note) == NUM_NOTES - 1 - row
                ? "note_on"
                : "note_off"
        }

        private toggleIconFieldCell(
            field: Bitmap,
            control: ui.UiControl<FieldEditorModalValue>,
        ): void {
            const value = control.value
            const on = field.getPixel(value.col, value.row) ? 0 : 1
            field.setPixel(value.col, value.row, on)
            const bitmap = this.iconFieldBitmap(field, value.row, value.col)
            if (typeof bitmap == "string") {
                control.bitmapId = bitmap
                control.bitmap = undefined
            } else {
                control.bitmap = bitmap
                control.bitmapId = undefined
            }
            control.toggled = on != 0
        }

        private toggleMelodyFieldCell(
            field: Melody,
            controls: ui.UiControl<FieldEditorModalValue>[],
            control: ui.UiControl<FieldEditorModalValue>,
        ): void {
            const value = control.value
            const note = (NUM_NOTES - 1 - value.row).toString()
            const active = field.notes.charAt(value.col) == note
            const next = active ? "." : note
            field.notes =
                field.notes.slice(0, value.col) +
                next +
                field.notes.slice(value.col + 1)
            for (let i = 0; i < controls.length; i++) {
                const other = controls[i]
                if (other.value.kind != "cell") continue
                if (other.value.col != value.col) continue
                other.bitmapId = this.melodyFieldBitmapId(
                    field,
                    other.value.row,
                    other.value.col,
                )
                other.toggled = other.bitmapId == "note_on"
            }
        }

        private commitIconFieldEditor(
            target: TileEditTarget,
            field: Bitmap,
            wasRunning: boolean,
        ): void {
            if (!target.tile || !isIconFieldEditorTile(target.tile)) {
                this.closeModal()
                return
            }
            const tile = target.tile as IconEditor
            const changed = !iconFieldsEqual(tile.getField(), field)
            if (target.pending) {
                tile.field = field.clone()
                this.commitTileSuggestion(
                    target.value,
                    tile,
                    wasRunning,
                    true,
                )
                return
            }
            if (changed)
                this.applyHostedEdit(wasRunning, () => {
                    tile.field = field.clone()
                })
            this.closeModal()
            this.focusEditedRuleTarget(target.value)
        }

        private commitMelodyFieldEditor(
            target: TileEditTarget,
            field: Melody,
            wasRunning: boolean,
        ): void {
            if (!target.tile || !isMelodyFieldEditorTile(target.tile)) {
                this.closeModal()
                return
            }
            const tile = target.tile as MelodyEditor
            const changed = !melodyFieldsEqual(tile.getField(), field)
            const nextField = {
                notes: field.notes.slice(0),
                tempo: field.tempo,
            }
            if (target.pending) {
                tile.field = nextField
                this.commitTileSuggestion(
                    target.value,
                    tile,
                    wasRunning,
                    true,
                )
                return
            }
            if (changed)
                this.applyHostedEdit(wasRunning, () => {
                    tile.field = nextField
                })
            this.closeModal()
            this.focusEditedRuleTarget(target.value)
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
            this.applyHostedEdit(wasRunning, () => {
                value.rule.deleteAt(value.section, value.index)
                Language.ensureValid(value.rule)
            })
            this.closeModal()
            if (
                !this.pageView_.focusRuleTarget(
                    this.focus,
                    fallback.ruleIndex,
                    fallback.kind,
                    fallback.section,
                    fallback.index,
                )
            )
                this.pageView_.focusRuleTarget(
                    this.focus,
                    value.ruleIndex,
                    "handle",
                )
        }

        private deleteFocusTarget(
            value: RuleTargetControlValue,
        ): RuleTargetFocus {
            if (!value.section || value.index === undefined)
                return { ruleIndex: value.ruleIndex, kind: "handle" }
            const tiles = value.rule.getRuleRep()[value.section]
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

        private focusEditedRuleTarget(value: RuleTargetControlValue): void {
            if (
                !this.pageView_.focusRuleTarget(
                    this.focus,
                    value.ruleIndex,
                    value.kind,
                    value.section,
                    value.index,
                )
            )
                this.pageView_.focusRuleTarget(
                    this.focus,
                    value.ruleIndex,
                    "handle",
                )
        }

        private applyHostedEdit(
            wasRunning: boolean,
            mutate: () => void,
        ): void {
            if (wasRunning) stopProgram()
            mutate()
            this.app_.save(SAVESLOT_AUTO, this.progdef_.toBuffer())
            this.pageView_.pageChanged()
            if (wasRunning) runProgram(this.progdef_)
        }

    }

    class PageView
        implements
            ui.UiFocusableView<PageViewResult>,
            ui.UiFocusNavigationProvider
    {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private getProgram_: () => ProgramDefn
        private getPage_: () => number
        private onActivateTarget_: (value: RuleTargetControlValue) => void
        private contentLayout_: PageContentLayout
        private scrollLayout_: ui.UiScrollViewportLayout
        private toolbar_: EditorToolbar
        private focus_: ui.UiFocusState
        private layout_: PageLayout
        private navigationRows_: PageNavigationTarget[][]
        private navigationTargets_: PageNavigationTarget[]
        private rowNavigationScratch_: ui.UiFocusNavigationTarget[]
        private measuredContentWidth_: number
        private measuredContentHeight_: number

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
            this.measuredContentWidth_ = 0
            this.measuredContentHeight_ = 0
            this.contentLayout_ = new PageContentLayout(this)
            this.scrollLayout_ = new ui.UiScrollViewportLayout({
                layoutSpec: this.layoutSpec,
                child: this.contentLayout_,
                scrollX: true,
                scrollY: true,
            })
            this.toolbar_ = undefined
            this.focus_ = undefined
            this.layout_ = undefined
            this.navigationRows_ = []
            this.navigationTargets_ = []
            this.rowNavigationScratch_ = []
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
            // The page view owns one focus scope backed by rule-row controls.
            // Its targets are rebuilt whenever layout changes because scrolling
            // can change viewport-space target rectangles.
            this.refreshFocusTargets()
        }

        public registerNavigation(controller: ui.UiFocusInputController): void {
            controller.setNavigation(EDITOR_PAGE_SCOPE, this)
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

        public pageChanged(): void {
            this.invalidateLayout()
            if (this.finalRect.width || this.finalRect.height) {
                this.scrollLayout_.arrange(this.finalRect)
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
                !(
                    result.kind == "unchanged" &&
                    result.targetId == targetId
                )
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
                    if (rows[row][column].navigation.id != targetId) continue
                    if (column > 0)
                        return this.focusTargetFromValue(
                            rows[row][column - 1].control.value,
                        )
                    return { ruleIndex: value.ruleIndex, kind: "handle" }
                }
            }
            return { ruleIndex: value.ruleIndex, kind: "handle" }
        }

        public handleFocusInput(result: ui.UiFocusInputResult): PageViewResult {
            if (result.kind == "activated")
                return this.activationResult(result)
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
            this.drawPage(surface, assets, focus, page)
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
            for (let row = 0; row < rows.length; row++) {
                for (let column = 0; column < rows[row].length; column++) {
                    const target = rows[row][column]
                    if (this.isDefaultRuleTarget(target.control.value))
                        return target.navigation
                }
            }
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

        public firstRuleHandleTarget(): ui.UiFocusNavigationTarget {
            const targetId = ruleFocusTargetId(0, "handle")
            const targets = this.allNavigationTargets()
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                if (target.navigation.id == targetId) return target.navigation
            }
            return this.defaultNavigationTarget()
        }

        public lastPageTarget(): ui.UiFocusNavigationTarget {
            const rows = this.navigationRows()
            for (let row = rows.length - 1; row >= 0; row--) {
                const targets = rows[row]
                if (targets.length)
                    return targets[targets.length - 1].navigation
            }
            return this.defaultNavigationTarget()
        }

        public handleScrollRequest(request: ui.UiFocusScrollRequest): void {
            if (request.scrollOwnerId != EDITOR_PAGE_SCROLL_OWNER) return
            if (!this.scrollRequestNeedsScroll(request)) return
            const previousOffsetX = this.scrollLayout_.contentOffsetX
            const previousOffsetY = this.scrollLayout_.contentOffsetY
            this.scrollLayout_.scrollContentRectIntoView(request.targetRect)
            if (
                previousOffsetX == this.scrollLayout_.contentOffsetX &&
                previousOffsetY == this.scrollLayout_.contentOffsetY
            )
                return
            this.scrollLayout_.arrange(this.finalRect)
            this.refreshScrollLayout()
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

        public atHorizontalOrigin(): boolean {
            return this.scrollLayout_.contentOffsetX == 0
        }

        public horizontalOriginScrollRect(target: PageNavigationTarget): ui.Rect {
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

        public move(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult | undefined {
            const rows = this.navigationRows()
            if (!rows.length) return undefined
            const position = this.positionForTargetId(request.currentTargetId)
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
                rules.push(new RuleView(page.rules[i], rules.length, false))
            rules.push(new RuleView(new RuleDefn(), rules.length, true))
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

        private rebuildLayout(force?: boolean): void {
            if (!force && !this.layoutDirty && this.layout_) return
            this.layout_ = this.pageLayout()
            this.rebuildNavigationCache()
        }

        private refreshScrollLayout(): void {
            if (!this.layout_) {
                this.rebuildLayout(true)
                return
            }
            this.scrollLayout_.getViewportRect(this.layout_.viewport)
            this.scrollLayout_.getContentRect(this.layout_.content)
            this.rebuildNavigationCache()
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
                    id: target.navigation.id,
                    scopeId: EDITOR_PAGE_SCOPE,
                    rect: target.viewportRect,
                    hidden: false,
                    activatable: true,
                    scrollOwnerId: target.navigation.scrollOwnerId,
                    scrollRect: target.navigation.scrollRect,
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

        private isDefaultRuleTarget(value: RuleTargetControlValue): boolean {
            return value.section == "sensors" || value.section == "filters"
        }

        private focusTargetFromValue(
            value: RuleTargetControlValue,
        ): RuleTargetFocus {
            return {
                ruleIndex: value.ruleIndex,
                kind: value.kind,
                section: value.section,
                index: value.index,
            }
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
            if (target.control.value.kind == "static") return undefined
            if (this.onActivateTarget_)
                this.onActivateTarget_(target.control.value)
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

        private moveLeft(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
        ): ui.UiFocusMoveResult {
            const rowResult = ui.moveFocusInRow({
                scopeId: EDITOR_PAGE_SCOPE,
                currentTargetId: rows[position.row][position.column].navigation.id,
                direction: "left",
                targets: this.copyRowNavigationTargets(rows[position.row]),
            })
            if (rowResult.kind == "moved") return rowResult

            if (position.column == 0 && !this.atHorizontalOrigin())
                return this.horizontalOriginScrollMove(rows, position)

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
            const rowResult = ui.moveFocusInRow({
                scopeId: EDITOR_PAGE_SCOPE,
                currentTargetId: rows[position.row][position.column].navigation.id,
                direction: "right",
                targets: this.copyRowNavigationTargets(rows[position.row]),
            })
            if (rowResult.kind == "moved") return rowResult
            if (
                position.row == rows.length - 1 &&
                position.column == rows[position.row].length - 1
            )
                return this.moveToPosition(rows, position, 0, 0)

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
                if (!this.atVerticalBoundary("up"))
                    return this.boundaryScrollMove(rows, position, "up")
                const target = this.nearestToolbarTarget(
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
                if (!this.atVerticalBoundary("down"))
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

        private horizontalOriginScrollMove(
            rows: PageNavigationTarget[][],
            position: PageTargetPosition,
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
                    targetRect: this.verticalBoundaryScrollRect(direction),
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

        private copyRowNavigationTargets(
            row: PageNavigationTarget[],
        ): ui.UiFocusNavigationTarget[] {
            while (this.rowNavigationScratch_.length)
                this.rowNavigationScratch_.pop()
            for (let i = 0; i < row.length; i++)
                this.rowNavigationScratch_.push(row[i].navigation)
            return this.rowNavigationScratch_
        }
    }

    class RuleView {
        public readonly control: ui.UiControl<RuleControlValue>
        public readonly rule: RuleDefn
        public readonly ruleIndex: number
        private readonly virtualRule_: boolean
        private x_: number
        private y_: number
        private width_: number
        private height_: number
        private tray_: ui.Rect
        private when_: ui.Rect
        private controls_: ui.UiControl<RuleTargetControlValue>[]
        private whenControlIds_: string[]
        private doControlIds_: string[]
        private strip_: ui.UiRow<RuleTargetControlValue>
        private stripOffsetX_: number
        private stripOffsetY_: number
        private measureScratch_: ui.UiMeasuredSize
        private stripRect_: ui.Rect
        private controlRectScratch_: ui.Rect
        private navigationScratch_: ui.UiFocusNavigationTarget[]

        constructor(
            ruledef: RuleDefn,
            ruleIndex: number,
            virtualRule: boolean,
        ) {
            this.rule = ruledef
            this.ruleIndex = ruleIndex
            this.virtualRule_ = virtualRule
            this.control = this.ruleControl(ruledef, ruleIndex)
            this.x_ = 0
            this.y_ = 0
            this.width_ = 0
            this.height_ = 0
            const ruleRep = ruledef.getRuleRep()
            this.tray_ = new ui.Rect()
            this.when_ = new ui.Rect()
            this.controls_ = []
            this.whenControlIds_ = []
            this.doControlIds_ = []
            this.measureScratch_ = new ui.UiMeasuredSize()
            this.stripRect_ = new ui.Rect()
            this.controlRectScratch_ = new ui.Rect()
            this.navigationScratch_ = []
            this.addRuleControls(ruleRep)
            this.stripOffsetX_ = 0
            this.stripOffsetY_ = 0
            // Rule targets are `ui-controls` records. The strip owns their
            // horizontal layout, focus rectangles, focus rendering, and built-in
            // control drawing; `RuleView` only draws the rule tray bands around
            // the arranged controls.
            this.strip_ = new ui.UiRow<RuleTargetControlValue>({
                scopeId: EDITOR_PAGE_SCOPE,
                controls: this.controls_,
                controlWidth: 1,
                controlHeight: 1,
                gap: 1,
            })
            this.placeControls()
        }

        public get width(): number {
            return this.width_
        }

        public get height(): number {
            return this.height_
        }

        public setPosition(x: number, y: number): void {
            this.x_ = x
            this.y_ = y
        }

        public setWidth(width: number): void {
            this.tray_.width = width
            this.width_ = Math.max(width, this.width_)
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
            this.fillRect(
                surface,
                page,
                this.when_,
                EDITOR_WHEN_SECTION_COLOR,
            )
            this.outlineTray(surface, page)
            this.strip_.render(surface, assets)
        }

        public drawFocusOverlay(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus: ui.UiFocusState,
            page: PageLayout,
        ): void {
            this.strip_.renderFocus(surface, assets, focus)
        }

        public arrangeForPage(page: PageLayout): void {
            this.arrangeStrip(page.content)
        }

        public navigationTargets(page: PageLayout): PageNavigationTarget[] {
            this.arrangeStrip(page.content)
            this.strip_.copyNavigationTargets(this.navigationScratch_)
            const result: PageNavigationTarget[] = []
            for (let i = 0; i < this.navigationScratch_.length; i++) {
                const target = this.navigationScratch_[i]
                const control = this.controlForNavigationTarget(target)
                if (!control || control.value.kind == "static") continue
                const contentRect = this.targetContentRect(target.rect)
                const viewportRect = this.targetViewportRect(page, contentRect)
                const scrollNeeded =
                    viewportRect.width < contentRect.width ||
                    viewportRect.height < contentRect.height
                result.push({
                    control,
                    contentRect,
                    viewportRect,
                    navigation: {
                        id: target.id,
                        rect: viewportRect,
                        scrollOwnerId: scrollNeeded
                            ? EDITOR_PAGE_SCROLL_OWNER
                            : undefined,
                        scrollRect: scrollNeeded ? contentRect : undefined,
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
                id: ruleControlId(ruleIndex),
                value: {
                    kind: "rule",
                    rule,
                    ruleIndex,
                },
            }
        }

        private addRuleControls(ruleRep: RuleRep): void {
            this.controls_.push(this.iconTarget("handle", "rule_handle", 0))
            const firstRuleGap = (this.controls_[0].width >> 1) + 2
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
                this.controls_.push(whenInsert)
                this.whenControlIds_.push(whenInsert.id)
            }

            this.controls_.push(this.staticIcon("rule_arrow", 1, 0))
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
                this.controls_.push(doInsert)
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
                const control = this.targetControl(
                    "tile",
                    this.targetBitmap(tile),
                    section,
                    i,
                    tile,
                )
                if (firstGap !== undefined && ids.length == 0)
                    control.gapBefore = firstGap
                this.controls_.push(control)
                ids.push(control.id)
            }
        }

        private iconTarget(
            kind: RuleTargetKind,
            bitmapId: string,
            gapBefore?: number,
        ): ui.UiControl<RuleTargetControlValue> {
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
        ): ui.UiControl<RuleTargetControlValue> {
            const bitmap = this.bitmap(bitmapId)
            return {
                id: ruleTargetControlId(this.ruleIndex, "static") + "/" + bitmapId,
                value: {
                    kind: "static",
                    rule: this.rule,
                    ruleIndex: this.ruleIndex,
                },
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
        ): ui.UiControl<RuleTargetControlValue> {
            const generated = kind == "tile" && tile && isGeneratedRuleTile(tile)
            const generatedText = this.targetText(kind, tile)
            const customContent = this.targetCustomContent(kind, tile)
            const framed =
                kind == "tile" &&
                tile &&
                !generated &&
                !getFieldEditor(tile) &&
                !isConstant(getTid(tile))
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
                customContent,
                width: this.targetWidth(bitmap, framed, generatedText, customContent),
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
            if (isGeneratedRuleTile(tile)) return undefined
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

        private targetFocusLabelId(
            kind: RuleTargetKind,
            tile?: Tile,
        ): string {
            if (
                kind == "tile" &&
                tile &&
                isGeneratedRuleTile(tile) &&
                !isNumericEntryTile(tile)
            )
                return tidToString(getTid(tile))
            return undefined
        }

        private targetCustomContent(
            kind: RuleTargetKind,
            tile?: Tile,
        ): ui.UiButtonCustomContent {
            if (kind != "tile" || !tile) return undefined
            if (isIconFieldEditorTile(tile))
                return this.bitmapContent(
                    icondb.renderMicrobitLEDs(
                        (tile as IconEditor).getField(),
                    ),
                )
            if (isMelodyFieldEditorTile(tile))
                return this.bitmapContent(
                    icondb.melodyToImage(
                        (tile as MelodyEditor).getField(),
                    ),
                )
            return undefined
        }

        private bitmapContent(bitmap: Bitmap): ui.UiButtonCustomContent {
            return {
                width: bitmap.width,
                height: bitmap.height,
                draw: (surface: ui.DrawSurface, rect: ui.Rect) => {
                    surface.drawBitmap(bitmap, rect.x, rect.y)
                },
            }
        }

        private targetWidth(
            bitmap: Bitmap,
            framed: boolean,
            text?: string,
            customContent?: ui.UiButtonCustomContent,
        ): number {
            if (text !== undefined) {
                return (text.length + 1) * bitmaps.font8.charWidth
            }
            if (customContent) return EDITOR_RULE_GENERATED_TILE_SIZE
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
            if (tile && isIconFieldEditorTile(tile))
                return {
                    edgeColor: 15,
                    shadowColor: 15,
                }
            if (tile && isMelodyFieldEditorTile(tile))
                return {
                    edgeColor: 1,
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

        private whenInsertionTarget(
            rule: RuleDefn,
        ): ui.UiControl<RuleTargetControlValue> {
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

        private doInsertionTarget(
            rule: RuleDefn,
        ): ui.UiControl<RuleTargetControlValue> {
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
            this.strip_.measure({ maxWidth: 1000, maxHeight: 1000 }, this.measureScratch_)
            this.width_ = this.measureScratch_.preferredWidth
            this.height_ = this.measureScratch_.preferredHeight
            this.stripOffsetX_ = -(this.controls_[0].width >> 1)
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

        private arrangeStrip(viewport: ui.Rect): void {
            this.stripRect_.set(
                viewport.x + this.x_ + this.stripOffsetX_,
                viewport.y + this.y_ + this.stripOffsetY_,
                this.width_,
                this.height_,
            )
            this.strip_.arrange(this.stripRect_)
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

        private addControlIdsBounds(
            target: ui.Rect,
            ids: string[],
        ): void {
            for (let i = 0; i < ids.length; i++) {
                this.copyControlRect(ids[i], this.controlRectScratch_)
                target.union(this.controlRectScratch_)
            }
        }

        private copyControlRect(controlId: string, output: ui.Rect): void {
            this.strip_.getControlRect(controlId, output)
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

        private controlForNavigationTarget(
            target: ui.UiFocusNavigationTarget,
        ): ui.UiControl<RuleTargetControlValue> {
            for (let i = 0; i < this.controls_.length; i++) {
                const control = this.controls_[i]
                if (target.id == EDITOR_PAGE_SCOPE + "/" + control.id)
                    return control
            }
            return undefined
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

    type RuleSection = "sensors" | "filters" | "actuators" | "modifiers"

    type RuleTargetKind = "handle" | "tile" | "insert" | "static"

    class EditorToolbar implements ui.UiFocusableView<EditorToolbarResult>, ui.UiFocusNavigationProvider {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private getProgram_: () => ProgramDefn
        private getPage_: () => number
        private pageView_: PageView
        private runControl_: ui.UiControl<EditorToolbarAction>
        private stopControl_: ui.UiControl<EditorToolbarAction>
        private pageControl_: ui.UiControl<EditorToolbarAction>
        private toolbarRow_: ui.UiRow<EditorToolbarAction>
        private navigationScratch_: ui.UiFocusNavigationTarget[]

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
                textId: "page",
                onActivate: openPage,
            }
            const toolbarControls: ui.UiControl<EditorToolbarAction>[] = [
                {
                    id: "disk",
                    value: "disk",
                    bitmap: icondb.disk,
                    textId: "disk",
                    onActivate: openDisk,
                },
                this.runControl_,
                this.stopControl_,
                this.pageControl_,
            ]
            this.pageControl_.gapBefore =
                EDITOR_TOOLBAR_PAGE_X -
                (EDITOR_TOOLBAR_LEFT_X + EDITOR_TOOLBAR_LEFT_WIDTH)
            const controlStyle = ui.buttonStyle(
                EDITOR_RULE_SUBTLE_LABEL_STYLE,
                ui.UiButtonStyles.BorderedPurple,
                ui.UiButtonStyles.RoundedFrame,
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
            this.toolbarRow_.arrange(
                new ui.Rect(
                    rect.x + EDITOR_TOOLBAR_LEFT_X,
                    rect.y + EDITOR_TOOLBAR_BUTTON_Y,
                    UI_SCREEN_WIDTH - EDITOR_TOOLBAR_LEFT_X,
                    EDITOR_TOOLBAR_BUTTON_SIZE,
                ),
            )
            this.clearLayoutInvalidation()
        }

        public invalidateLayout(): void {
            this.layoutDirty = true
            this.toolbarRow_.invalidateLayout()
        }

        public clearLayoutInvalidation(): void {
            this.layoutDirty = false
            this.toolbarRow_.clearLayoutInvalidation()
        }

        public registerFocusTargets(focus: ui.UiFocusState): void {
            this.toolbarRow_.registerFocusTargets(focus)
        }

        public registerNavigation(controller: ui.UiFocusInputController): void {
            controller.setNavigation(EDITOR_TOOLBAR_SCOPE, this)
        }

        public focusDefault(focus: ui.UiFocusState): ui.UiFocusSetResult {
            return this.toolbarRow_.focusDefault(focus)
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
            return this.toolbarRow_.handleFocusInput(result)
        }

        public render(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus?: ui.UiFocusState,
        ): void {
            this.updateProgramControls()
            this.toolbarRow_.render(surface, assets, focus)
        }

        public move(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult | undefined {
            if (request.scopeId != EDITOR_TOOLBAR_SCOPE) return undefined
            const result = ui.moveFocusInRow({
                scopeId: EDITOR_TOOLBAR_SCOPE,
                currentTargetId: request.currentTargetId,
                direction: request.direction,
                targets: this.toolbarTargets(),
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
            this.stopControl_.bitmap = running ? icondb.stop : icondb.stopDisabled
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
            if (
                direction == "right" &&
                targetId == this.targetId("page")
            )
                return this.pageView_.firstRuleHandleTarget()
            if (
                direction == "left" &&
                targetId == this.targetId("disk")
            )
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
            const dy = target.rect.y + Math.idiv(target.rect.height, 2) - sourceY
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
            this.toolbarRow_.copyNavigationTargets(this.navigationScratch_)
            return this.navigationScratch_
        }

        private targetId(controlId: string): ui.UiFocusId {
            return EDITOR_TOOLBAR_SCOPE + "/" + controlId
        }

    }
}
