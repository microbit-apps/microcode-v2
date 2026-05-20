namespace microcode {
    interface HostedGridOptions<T> {
        scopeId: ui.UiFocusScopeId
        controls: ui.UiControl<T>[]
        columnCount: number
        controlWidth: number
        controlHeight: number
        rowGap?: number
        columnGap?: number
        controlStyle?: ui.UiButtonStyle
        labelBounds?: ui.Rect
    }

    interface HostedGridResult {
        kind: "activated"
    }

    interface HostedMoveInput {
        scopeId: ui.UiFocusScopeId
        currentTargetId?: ui.UiFocusId
        direction: ui.UiFocusDirection
        rows: ui.UiFocusNavigationTarget[][]
        horizontalWrap?: boolean
        verticalStrategy?: "column" | "nearest"
    }

    export function hostedMoveFocusInRow(
        scopeId: ui.UiFocusScopeId,
        currentTargetId: ui.UiFocusId,
        direction: ui.UiFocusDirection,
        targets: ui.UiFocusNavigationTarget[],
    ): ui.UiFocusMoveResult {
        return hostedMoveFocusInRaggedGrid({
            scopeId,
            currentTargetId,
            direction,
            rows: [targets],
        })
    }

    export function hostedMoveFocusInRaggedGrid(
        input: HostedMoveInput,
    ): ui.UiFocusMoveResult {
        const current = hostedCurrentCell(input.rows, input.currentTargetId)
        if (!current)
            return {
                kind: "stayed",
                scopeId: input.scopeId,
                targetId: input.currentTargetId,
                reason: "missingActive",
            }
        const destination =
            input.direction == "left" || input.direction == "right"
                ? hostedHorizontalDestination(input, current)
                : hostedVerticalDestination(input, current)
        if (destination)
            return hostedMovedResult(
                input.scopeId,
                current.target,
                destination.target,
            )
        if (
            (input.direction == "left" || input.direction == "right") &&
            input.horizontalWrap
        )
            return {
                kind: "stayed",
                scopeId: input.scopeId,
                targetId: input.currentTargetId,
                reason: "boundary",
            }
        return {
            kind: "exited",
            scopeId: input.scopeId,
            targetId: input.currentTargetId,
            direction: input.direction,
        }
    }

    interface HostedMoveCell {
        row: number
        column: number
        target: ui.UiFocusNavigationTarget
    }

    function hostedCurrentCell(
        rows: ui.UiFocusNavigationTarget[][],
        targetId: ui.UiFocusId,
    ): HostedMoveCell {
        for (let row = 0; row < rows.length; row++) {
            const targets = rows[row]
            for (let column = 0; column < targets.length; column++) {
                const target = targets[column]
                if (target.id == targetId && !target.hidden)
                    return { row, column, target }
            }
        }
        return undefined
    }

    function hostedHorizontalDestination(
        input: HostedMoveInput,
        current: HostedMoveCell,
    ): HostedMoveCell {
        const row = input.rows[current.row]
        const step = input.direction == "left" ? -1 : 1
        let column = current.column + step
        while (column >= 0 && column < row.length) {
            if (!row[column].hidden)
                return { row: current.row, column, target: row[column] }
            column += step
        }
        if (!input.horizontalWrap) return undefined
        column = step < 0 ? row.length - 1 : 0
        while (column != current.column) {
            if (!row[column].hidden)
                return { row: current.row, column, target: row[column] }
            column += step
        }
        return undefined
    }

    function hostedVerticalDestination(
        input: HostedMoveInput,
        current: HostedMoveCell,
    ): HostedMoveCell {
        const step = input.direction == "up" ? -1 : 1
        const sourceX =
            current.target.rect.x + Math.idiv(current.target.rect.width, 2)
        for (
            let rowIndex = current.row + step;
            rowIndex >= 0 && rowIndex < input.rows.length;
            rowIndex += step
        ) {
            const row = input.rows[rowIndex]
            if (input.verticalStrategy != "nearest") {
                const target = row[current.column]
                if (target && !target.hidden)
                    return { row: rowIndex, column: current.column, target }
            }
            let best: HostedMoveCell = undefined
            let bestDistance = 0
            for (let column = 0; column < row.length; column++) {
                const target = row[column]
                if (target.hidden) continue
                const dx = Math.abs(
                    target.rect.x + Math.idiv(target.rect.width, 2) - sourceX,
                )
                if (!best || dx < bestDistance) {
                    best = { row: rowIndex, column, target }
                    bestDistance = dx
                }
            }
            if (best) return best
        }
        return undefined
    }

    function hostedMovedResult(
        scopeId: ui.UiFocusScopeId,
        fromTarget: ui.UiFocusNavigationTarget,
        toTarget: ui.UiFocusNavigationTarget,
    ): ui.UiFocusMoveResult {
        const result: ui.UiFocusMoveResult = {
            kind: "moved",
            fromScopeId: scopeId,
            fromTargetId: fromTarget.id,
            toScopeId: scopeId,
            toTargetId: toTarget.id,
        }
        if (toTarget.scrollOwnerId !== undefined)
            result.scrollRequest = {
                scopeId,
                targetId: toTarget.id,
                scrollOwnerId: toTarget.scrollOwnerId,
                targetRect: (toTarget.scrollRect || toTarget.rect).clone(),
                reason: "focus",
            }
        return result
    }

    export class HostedGrid<T>
        implements ui.UiFocusableView<HostedGridResult>, ui.UiFocusNavigationProvider
    {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private scopeId_: ui.UiFocusScopeId
        private controls_: ui.UiControl<T>[]
        private columnCount_: number
        private controlWidth_: number
        private controlHeight_: number
        private rowGap_: number
        private columnGap_: number
        private controlStyle_: ui.UiButtonStyle
        private labelBounds_: ui.Rect
        private controlRects_: ui.Rect[]
        private buttonView_: ui.UiButtonView

        constructor(options: HostedGridOptions<T>) {
            this.scopeId_ = options.scopeId
            this.controls_ = options.controls
            this.columnCount_ = Math.max(1, options.columnCount)
            this.controlWidth_ = options.controlWidth
            this.controlHeight_ = options.controlHeight
            this.rowGap_ = options.rowGap || 0
            this.columnGap_ = options.columnGap || 0
            this.controlStyle_ = options.controlStyle
            this.labelBounds_ = options.labelBounds
            this.controlRects_ = []
            this.buttonView_ = new ui.UiButtonView({
                style: options.controlStyle,
            })
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
            output.set(
                this.contentWidth(),
                this.contentHeight(),
                this.contentWidth(),
                this.contentHeight(),
            )
            this.clearLayoutInvalidation()
        }

        public arrange(rect: ui.Rect): void {
            this.finalRect.copyFrom(rect)
            this.ensureRects()
            for (let i = 0; i < this.controls_.length; i++) {
                const row = Math.idiv(i, this.columnCount_)
                const column = i % this.columnCount_
                this.controlRects_[i].set(
                    rect.x + column * (this.controlWidth_ + this.columnGap_),
                    rect.y + row * (this.controlHeight_ + this.rowGap_),
                    this.controlWidth_,
                    this.controlHeight_,
                )
            }
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
                id: this.scopeId_,
                preferredTargetId: _uiControls.preferredControlId(
                    this.scopeId_,
                    this.controls_,
                    undefined,
                ),
            })
            for (let i = 0; i < this.controls_.length; i++) {
                const control = this.controls_[i]
                if (
                    !_uiControls.isVisible(control) ||
                    !_uiControls.isFocusable(control)
                )
                    continue
                focus.setTarget({
                    id: _uiControls.targetId(this.scopeId_, control.id),
                    scopeId: this.scopeId_,
                    rect: this.controlRects_[i],
                    activatable: true,
                })
            }
        }

        public registerNavigation(
            controller: ui.UiFocusInputController,
        ): void {
            controller.setNavigation(this.scopeId_, this)
        }

        public focusDefault(
            focus: ui.UiFocusState,
        ): ui.UiFocusSetResult {
            return focus.setActiveScope(this.scopeId_)
        }

        public handleFocusInput(
            result: ui.UiFocusInputResult,
        ): HostedGridResult {
            if (result.kind != "activated" || result.scopeId != this.scopeId_)
                return undefined
            const control = _uiControls.findControlByTargetId(
                this.scopeId_,
                this.controls_,
                result.targetId,
            )
            if (!control) return undefined
            _uiControls.emitControlActivate(
                control.value,
                control,
                control.id,
                undefined,
            )
            return { kind: "activated" }
        }

        public move(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult {
            return hostedMoveFocusInRaggedGrid({
                scopeId: this.scopeId_,
                currentTargetId: request.currentTargetId,
                direction: request.direction,
                rows: this.navigationRows(),
                horizontalWrap: true,
            })
        }

        public render(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus?: ui.UiFocusState,
        ): void {
            const labelBounds = _uiControls.resolveLabelBounds(
                surface,
                this.labelBounds_,
            )
            for (let i = 0; i < this.controls_.length; i++) {
                const control = this.controls_[i]
                if (!_uiControls.isVisible(control)) continue
                _uiControls.renderControl(
                    surface,
                    assets,
                    control,
                    this.controlRects_[i],
                    this.buttonView_,
                    this.controlStyle_,
                    labelBounds,
                )
            }
            const activeTargetId = _uiControls.activeTargetIdForScope(
                focus,
                this.scopeId_,
            )
            const index = _uiControls.focusedControlOverlayIndex(
                this.scopeId_,
                this.controls_,
                activeTargetId,
            )
            if (index < 0) return
            _uiControls.renderControl(
                surface,
                assets,
                this.controls_[index],
                this.controlRects_[index],
                this.buttonView_,
                this.controlStyle_,
                labelBounds,
                true,
            )
        }

        private navigationRows(): ui.UiFocusNavigationTarget[][] {
            const rows: ui.UiFocusNavigationTarget[][] = []
            let index = 0
            const rowCount = Math.idiv(
                this.controls_.length + this.columnCount_ - 1,
                this.columnCount_,
            )
            for (let row = 0; row < rowCount; row++) {
                const targets: ui.UiFocusNavigationTarget[] = []
                for (
                    let column = 0;
                    column < this.columnCount_ &&
                    index < this.controls_.length;
                    column++
                ) {
                    const control = this.controls_[index]
                    if (
                        _uiControls.isVisible(control) &&
                        _uiControls.isFocusable(control)
                    )
                        targets.push({
                            id: _uiControls.targetId(
                                this.scopeId_,
                                control.id,
                            ),
                            rect: this.controlRects_[index],
                            hidden: !_uiControls.isVisible(control),
                        })
                    index++
                }
                if (targets.length) rows.push(targets)
            }
            return rows
        }

        private ensureRects(): void {
            while (this.controlRects_.length < this.controls_.length)
                this.controlRects_.push(new ui.Rect())
            while (this.controlRects_.length > this.controls_.length)
                this.controlRects_.pop()
        }

        private contentWidth(): number {
            const columnCount = Math.min(
                this.columnCount_,
                this.controls_.length,
            )
            return (
                columnCount * this.controlWidth_ +
                (columnCount - 1) * this.columnGap_
            )
        }

        private contentHeight(): number {
            const rowCount = Math.idiv(
                this.controls_.length + this.columnCount_ - 1,
                this.columnCount_,
            )
            return (
                rowCount * this.controlHeight_ +
                (rowCount - 1) * this.rowGap_
            )
        }
    }

    export interface HostedPickerOptions<T> {
        modalScopeId: ui.UiFocusScopeId
        controls: ui.UiControl<T>[]
        title?: string
        titleId?: string
        titleBitmap?: Bitmap | string
        titleControls?: ui.UiControl<T>[]
        defaultControlId?: string
        closeOnActivate?: boolean
        columnCount: number
        controlWidth: number
        controlHeight: number
        rowGap?: number
        columnGap?: number
        controlStyle?: ui.UiButtonStyle
        titleControlWidth?: number
        titleControlHeight?: number
        titleControlGap?: number
        titleControlStyle?: ui.UiButtonStyle
        modalStyle?: ui.UiModalStyle
        onActivate?: ui.UiControlActivateHandler<T>
        onCancel?: (modalScopeId: ui.UiFocusScopeId) => void
    }

    export type HostedPickerResult<T> =
        | { kind: "activated" }
        | { kind: "keepOpen" }
        | { kind: "cancelled"; modalScopeId: ui.UiFocusScopeId }

    export class HostedPicker<T>
        implements ui.UiModal<HostedPickerResult<T>>, ui.UiFocusNavigationProvider
    {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private modalScopeId_: ui.UiFocusScopeId
        private controls_: ui.UiControl<T>[]
        private titleControls_: ui.UiControl<T>[]
        private title_: string
        private titleId_: string
        private titleBitmap_: Bitmap | string
        private defaultControlId_: string
        private closeOnActivate_: boolean
        private columnCount_: number
        private controlWidth_: number
        private controlHeight_: number
        private rowGap_: number
        private columnGap_: number
        private controlStyle_: ui.UiButtonStyle
        private titleControlWidth_: number
        private titleControlHeight_: number
        private titleControlGap_: number
        private titleControlStyle_: ui.UiButtonStyle
        private modalStyle_: ui.UiModalStyle
        private controlRects_: ui.Rect[]
        private titleControlRects_: ui.Rect[]
        private controlView_: ui.UiButtonView
        private titleControlView_: ui.UiButtonView
        private onActivate_: ui.UiControlActivateHandler<T>
        private onCancel_: (modalScopeId: ui.UiFocusScopeId) => void

        constructor(options: HostedPickerOptions<T>) {
            this.modalScopeId_ = options.modalScopeId
            this.controls_ = options.controls
            this.titleControls_ = options.titleControls
            this.title_ = options.title
            this.titleId_ = options.titleId
            this.titleBitmap_ = options.titleBitmap
            this.defaultControlId_ = options.defaultControlId
            this.closeOnActivate_ = options.closeOnActivate !== false
            this.columnCount_ = Math.max(1, options.columnCount)
            this.controlWidth_ = options.controlWidth
            this.controlHeight_ = options.controlHeight
            this.rowGap_ =
                options.rowGap !== undefined
                    ? options.rowGap
                    : AppStyles.ModalControlGap
            this.columnGap_ =
                options.columnGap !== undefined
                    ? options.columnGap
                    : AppStyles.ModalControlGap
            this.controlStyle_ = options.controlStyle
            this.titleControlWidth_ =
                options.titleControlWidth || options.controlWidth
            this.titleControlHeight_ =
                options.titleControlHeight || options.controlHeight
            this.titleControlGap_ = options.titleControlGap || 0
            this.titleControlStyle_ =
                options.titleControlStyle || options.controlStyle
            this.modalStyle_ = options.modalStyle
            this.controlRects_ = []
            this.titleControlRects_ = []
            this.controlView_ = new ui.UiButtonView({
                style: this.controlStyle_,
            })
            this.titleControlView_ = new ui.UiButtonView({
                style: this.titleControlStyle_,
            })
            this.onActivate_ = options.onActivate
            this.onCancel_ = options.onCancel
            this.layoutSpec = {
                width: { mode: "content" },
                height: { mode: "content" },
            }
            this.finalRect = new ui.Rect()
            this.layoutDirty = true
        }

        public get modalScopeId(): ui.UiFocusScopeId {
            return this.modalScopeId_
        }

        public measure(
            constraints: ui.UiLayoutConstraints,
            output: ui.UiMeasuredSize,
        ): void {
            const contentMargin = this.contentMargin()
            const width = Math.max(
                this.contentWidth(),
                this.titleControlContentWidth(),
            )
            const height =
                this.contentHeight() + this.titleHeight() + contentMargin
            output.set(
                width + contentMargin * 2,
                height,
                width + contentMargin * 2,
                height,
            )
            this.clearLayoutInvalidation()
        }

        public arrange(rect: ui.Rect): void {
            this.finalRect.copyFrom(rect)
            const margin = this.contentMargin()
            this.arrangeControls(rect.x + margin, rect.y + this.titleHeight())
            this.arrangeTitleControls(rect, margin)
            this.clearLayoutInvalidation()
        }

        public invalidateLayout(): void {
            this.layoutDirty = true
        }

        public clearLayoutInvalidation(): void {
            this.layoutDirty = false
        }

        public open(
            focus: ui.UiFocusState,
            controller?: ui.UiFocusInputController,
        ): ui.UiFocusSetResult {
            focus.setScope({
                id: this.modalScopeId_,
                parentScopeId: focus.getActiveScopeId(),
                preferredTargetId: this.resolvePreferredTargetId(),
                handlesCancel: true,
                modal: true,
            })
            this.registerTargets(focus, this.controls_, this.controlRects_)
            this.registerTargets(
                focus,
                this.titleControls_,
                this.titleControlRects_,
            )
            if (controller)
                controller.setNavigation(this.modalScopeId_, this)
            return focus.setActiveScope(this.modalScopeId_)
        }

        public close(focus: ui.UiFocusState): ui.UiFocusSetResult {
            return focus.closeModalScope(this.modalScopeId_)
        }

        public handleFocusInput(
            result: ui.UiFocusInputResult,
        ): HostedPickerResult<T> {
            if (result.kind == "activated") {
                const control = this.activatedControl(
                    result.scopeId,
                    result.targetId,
                )
                if (!control) return undefined
                const pickerResult = this.closeOnActivate_
                    ? <HostedPickerResult<T>>{
                          kind: "activated",
                      }
                    : <HostedPickerResult<T>>{
                          kind: "keepOpen",
                      }
                _uiControls.emitControlActivate(
                    control.value,
                    control,
                    control.id,
                    this.onActivate_,
                )
                return pickerResult
            }
            if (result.kind == "cancelled") {
                if (this.onCancel_) this.onCancel_(this.modalScopeId_)
                return {
                    kind: "cancelled",
                    modalScopeId: this.modalScopeId_,
                }
            }
            return undefined
        }

        public move(
            request: ui.UiFocusNavigationRequest,
        ): ui.UiFocusMoveResult {
            return hostedMoveFocusInRaggedGrid({
                scopeId: this.modalScopeId_,
                currentTargetId: request.currentTargetId,
                direction: request.direction,
                rows: this.navigationRows(),
                horizontalWrap: true,
                verticalStrategy: "nearest",
            })
        }

        public render(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus?: ui.UiFocusState,
        ): void {
            surface.drawRoundedRect(
                this.finalRect,
                15,
                this.modalStyle_ &&
                    this.modalStyle_.panelColor !== undefined
                    ? this.modalStyle_.panelColor
                    : 1,
            )
            this.drawTitle(surface, assets)
            this.renderControls(
                surface,
                assets,
                this.controls_,
                this.controlRects_,
                this.controlView_,
                this.controlStyle_,
            )
            this.renderControls(
                surface,
                assets,
                this.titleControls_,
                this.titleControlRects_,
                this.titleControlView_,
                this.titleControlStyle_,
            )
            this.renderFocus(
                surface,
                assets,
                focus,
                this.controls_,
                this.controlRects_,
                this.controlView_,
                this.controlStyle_,
            )
            this.renderFocus(
                surface,
                assets,
                focus,
                this.titleControls_,
                this.titleControlRects_,
                this.titleControlView_,
                this.titleControlStyle_,
            )
        }

        private drawTitle(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
        ): void {
            const title = this.resolveTitleText(assets)
            const titleBitmap = this.resolveTitleBitmap(assets)
            let x = this.finalRect.x + 4
            if (titleBitmap) {
                surface.drawBitmap(titleBitmap, x, this.finalRect.y + 4)
                x += titleBitmap.width + 2
            }
            if (title.length)
                surface.drawText(title, x, this.finalRect.y + 4, {
                    color:
                        this.modalStyle_ &&
                        this.modalStyle_.titleColor !== undefined
                            ? this.modalStyle_.titleColor
                            : 15,
                })
        }

        private resolveTitleText(assets: ui.UiAssetResolver): string {
            if (this.title_ !== undefined) return this.title_
            if (this.titleId_ !== undefined) return assets.getText(this.titleId_)
            return ""
        }

        private resolveTitleBitmap(
            assets: ui.UiAssetResolver,
        ): Bitmap {
            if (this.titleBitmap_ === undefined) return undefined
            if (typeof this.titleBitmap_ == "string")
                return assets.getBitmap(this.titleBitmap_)
            return this.titleBitmap_
        }

        private arrangeControls(x: number, y: number): void {
            this.ensureRects(this.controls_, this.controlRects_)
            for (let i = 0; i < this.controls_.length; i++) {
                const row = Math.idiv(i, this.columnCount_)
                const column = i % this.columnCount_
                this.controlRects_[i].set(
                    x + column * (this.controlWidth_ + this.columnGap_),
                    y + row * (this.controlHeight_ + this.rowGap_),
                    this.controlWidth_,
                    this.controlHeight_,
                )
            }
        }

        private arrangeTitleControls(rect: ui.Rect, margin: number): void {
            if (!this.hasTitleControls()) return
            this.ensureRects(this.titleControls_, this.titleControlRects_)
            let x =
                rect.x +
                rect.width -
                margin -
                this.titleControlContentWidth()
            for (let i = 0; i < this.titleControls_.length; i++) {
                this.titleControlRects_[i].set(
                    x,
                    rect.y + margin,
                    this.titleControlWidth_,
                    this.titleControlHeight_,
                )
                x += this.titleControlWidth_ + this.titleControlGap_
            }
        }

        private registerTargets(
            focus: ui.UiFocusState,
            controls: ui.UiControl<T>[],
            rects: ui.Rect[],
        ): void {
            if (!controls) return
            for (let i = 0; i < controls.length; i++) {
                const control = controls[i]
                if (
                    !_uiControls.isVisible(control) ||
                    !_uiControls.isFocusable(control)
                )
                    continue
                focus.setTarget({
                    id: _uiControls.targetId(this.modalScopeId_, control.id),
                    scopeId: this.modalScopeId_,
                    rect: rects[i],
                    hidden: !_uiControls.isVisible(control),
                    activatable: true,
                })
            }
        }

        private navigationRows(): ui.UiFocusNavigationTarget[][] {
            const rows: ui.UiFocusNavigationTarget[][] = []
            this.addNavigationRow(rows, this.titleControls_, this.titleControlRects_)
            let index = 0
            const rowCount = Math.idiv(
                this.controls_.length + this.columnCount_ - 1,
                this.columnCount_,
            )
            for (let row = 0; row < rowCount; row++) {
                const targets: ui.UiFocusNavigationTarget[] = []
                for (
                    let column = 0;
                    column < this.columnCount_ &&
                    index < this.controls_.length;
                    column++
                ) {
                    this.addNavigationTarget(
                        targets,
                        this.controls_[index],
                        this.controlRects_[index],
                    )
                    index++
                }
                if (targets.length) rows.push(targets)
            }
            return rows
        }

        private addNavigationRow(
            rows: ui.UiFocusNavigationTarget[][],
            controls: ui.UiControl<T>[],
            rects: ui.Rect[],
        ): void {
            if (!controls) return
            const targets: ui.UiFocusNavigationTarget[] = []
            for (let i = 0; i < controls.length; i++)
                this.addNavigationTarget(targets, controls[i], rects[i])
            if (targets.length) rows.push(targets)
        }

        private addNavigationTarget(
            targets: ui.UiFocusNavigationTarget[],
            control: ui.UiControl<T>,
            rect: ui.Rect,
        ): void {
            if (
                !control ||
                !_uiControls.isVisible(control) ||
                !_uiControls.isFocusable(control)
            )
                return
            targets.push({
                id: _uiControls.targetId(this.modalScopeId_, control.id),
                rect,
                hidden: !_uiControls.isVisible(control),
            })
        }

        private activatedControl(
            scopeId: ui.UiFocusScopeId,
            targetId: ui.UiFocusId,
        ): ui.UiControl<T> {
            if (scopeId != this.modalScopeId_) return undefined
            return (
                _uiControls.findControlByTargetId(
                    this.modalScopeId_,
                    this.titleControls_,
                    targetId,
                ) ||
                _uiControls.findControlByTargetId(
                    this.modalScopeId_,
                    this.controls_,
                    targetId,
                )
            )
        }

        private renderControls(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            controls: ui.UiControl<T>[],
            rects: ui.Rect[],
            buttonView: ui.UiButtonView,
            style: ui.UiButtonStyle,
        ): void {
            if (!controls) return
            for (let i = 0; i < controls.length; i++) {
                const control = controls[i]
                if (!_uiControls.isVisible(control)) continue
                _uiControls.renderControl(
                    surface,
                    assets,
                    control,
                    rects[i],
                    buttonView,
                    style,
                )
            }
        }

        private renderFocus(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus: ui.UiFocusState,
            controls: ui.UiControl<T>[],
            rects: ui.Rect[],
            buttonView: ui.UiButtonView,
            style: ui.UiButtonStyle,
        ): void {
            if (!controls) return
            const index = _uiControls.focusedControlOverlayIndex(
                this.modalScopeId_,
                controls,
                _uiControls.activeTargetIdForScope(focus, this.modalScopeId_),
            )
            if (index < 0) return
            _uiControls.renderControl(
                surface,
                assets,
                controls[index],
                rects[index],
                buttonView,
                style,
                undefined,
                true,
            )
        }

        private resolvePreferredTargetId(): ui.UiFocusId {
            return (
                _uiControls.preferredControlId(
                    this.modalScopeId_,
                    this.controls_,
                    this.defaultControlId_,
                ) ||
                _uiControls.preferredControlId(
                    this.modalScopeId_,
                    this.titleControls_,
                    undefined,
                )
            )
        }

        private ensureRects(
            controls: ui.UiControl<T>[],
            rects: ui.Rect[],
        ): void {
            if (!controls) return
            while (rects.length < controls.length) rects.push(new ui.Rect())
            while (rects.length > controls.length) rects.pop()
        }

        private hasTitleControls(): boolean {
            return !!this.titleControls_ && !!this.titleControls_.length
        }

        private contentWidth(): number {
            const columnCount = Math.min(
                this.columnCount_,
                this.controls_.length,
            )
            return (
                columnCount * this.controlWidth_ +
                (columnCount - 1) * this.columnGap_
            )
        }

        private contentHeight(): number {
            const rowCount = Math.idiv(
                this.controls_.length + this.columnCount_ - 1,
                this.columnCount_,
            )
            return rowCount * this.controlHeight_ + (rowCount - 1) * this.rowGap_
        }

        private titleHeight(): number {
            if (this.hasTitleControls())
                return (
                    this.contentMargin() +
                    this.titleControlHeight_ +
                    this.titleGap()
                )
            if (
                !this.showTitleBar() &&
                this.title_ === undefined &&
                this.titleId_ === undefined &&
                this.titleBitmap_ === undefined
            )
                return this.contentMargin()
            return 16 + this.titleGap()
        }

        private titleControlContentWidth(): number {
            if (!this.hasTitleControls()) return 0
            return (
                this.titleControls_.length * this.titleControlWidth_ +
                (this.titleControls_.length - 1) * this.titleControlGap_
            )
        }

        private contentMargin(): number {
            return this.modalStyle_ &&
                this.modalStyle_.contentMargin !== undefined
                ? this.modalStyle_.contentMargin
                : 4
        }

        private titleGap(): number {
            return this.modalStyle_ && this.modalStyle_.titleGap !== undefined
                ? this.modalStyle_.titleGap
                : 0
        }

        private showTitleBar(): boolean {
            return (
                !this.modalStyle_ || this.modalStyle_.showTitleBar !== false
            )
        }
    }
}
