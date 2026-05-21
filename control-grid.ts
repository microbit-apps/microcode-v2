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

    function arrangeGridControls<T>(
        controls: ui.UiControl<T>[],
        rects: ui.Rect[],
        x: number,
        y: number,
        columnCount: number,
        controlWidth: number,
        controlHeight: number,
        rowGap: number,
        columnGap: number,
    ): void {
        ensureGridRects(controls, rects)
        for (let i = 0; i < controls.length; i++) {
            const row = Math.idiv(i, columnCount)
            const column = i % columnCount
            rects[i].set(
                x + column * (controlWidth + columnGap),
                y + row * (controlHeight + rowGap),
                controlWidth,
                controlHeight,
            )
        }
    }

    function ensureGridRects<T>(
        controls: ui.UiControl<T>[],
        rects: ui.Rect[],
    ): void {
        while (rects.length < controls.length) rects.push(new ui.Rect())
        while (rects.length > controls.length) rects.pop()
    }

    function registerGridTargets<T>(
        focus: ui.UiFocusState,
        scopeId: ui.UiFocusScopeId,
        controls: ui.UiControl<T>[],
        rects: ui.Rect[],
    ): void {
        for (let i = 0; i < controls.length; i++) {
            const control = controls[i]
            if (
                !_uiControls.isVisible(control) ||
                !_uiControls.isFocusable(control)
            )
                continue
            focus.setTarget({
                id: _uiControls.targetId(scopeId, control.id),
                scopeId,
                rect: rects[i],
                activatable: true,
            })
        }
    }

    function appendGridNavigationRows<T>(
        rows: ui.UiFocusNavigationTarget[][],
        scopeId: ui.UiFocusScopeId,
        controls: ui.UiControl<T>[],
        rects: ui.Rect[],
        columnCount: number,
    ): void {
        let index = 0
        const rowCount = Math.idiv(
            controls.length + columnCount - 1,
            columnCount,
        )
        for (let row = 0; row < rowCount; row++) {
            const targets: ui.UiFocusNavigationTarget[] = []
            for (
                let column = 0;
                column < columnCount && index < controls.length;
                column++
            ) {
                const control = controls[index]
                if (
                    _uiControls.isVisible(control) &&
                    _uiControls.isFocusable(control)
                )
                    targets.push({
                        id: _uiControls.targetId(scopeId, control.id),
                        rect: rects[index],
                    })
                index++
            }
            if (targets.length) rows.push(targets)
        }
    }

    function gridContentWidth(
        controlCount: number,
        columnCount: number,
        controlWidth: number,
        columnGap: number,
    ): number {
        columnCount = Math.min(columnCount, controlCount)
        return columnCount * controlWidth + (columnCount - 1) * columnGap
    }

    function gridContentHeight(
        controlCount: number,
        columnCount: number,
        controlHeight: number,
        rowGap: number,
    ): number {
        const rowCount = Math.idiv(controlCount + columnCount - 1, columnCount)
        return rowCount * controlHeight + (rowCount - 1) * rowGap
    }

    export class HostedGrid<T>
        implements
            ui.UiFocusableView<HostedGridResult>,
            ui.UiFocusNavigationProvider
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
            const width = gridContentWidth(
                this.controls_.length,
                this.columnCount_,
                this.controlWidth_,
                this.columnGap_,
            )
            const height = gridContentHeight(
                this.controls_.length,
                this.columnCount_,
                this.controlHeight_,
                this.rowGap_,
            )
            output.set(width, height, width, height)
            this.clearLayoutInvalidation()
        }

        public arrange(rect: ui.Rect): void {
            this.finalRect.copyFrom(rect)
            arrangeGridControls(
                this.controls_,
                this.controlRects_,
                rect.x,
                rect.y,
                this.columnCount_,
                this.controlWidth_,
                this.controlHeight_,
                this.rowGap_,
                this.columnGap_,
            )
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
            registerGridTargets(
                focus,
                this.scopeId_,
                this.controls_,
                this.controlRects_,
            )
        }

        public registerNavigation(controller: ui.UiFocusInputController): void {
            controller.setNavigation(this.scopeId_, this)
        }

        public focusDefault(focus: ui.UiFocusState): ui.UiFocusSetResult {
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
            return ui.moveFocusInRaggedGrid({
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
            appendGridNavigationRows(
                rows,
                this.scopeId_,
                this.controls_,
                this.controlRects_,
                this.columnCount_,
            )
            return rows
        }
    }

    export interface HostedPickerOptions<T> {
        modalScopeId: ui.UiFocusScopeId
        controls: ui.UiControl<T>[]
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
        modalStyle: ui.UiModalStyle
        onActivate?: ui.UiControlActivateHandler<T>
    }

    export type HostedPickerResult<T> =
        | { kind: "activated" }
        | { kind: "keepOpen" }
        | { kind: "cancelled"; modalScopeId: ui.UiFocusScopeId }

    export class HostedPicker<T>
        implements
            ui.UiModal<HostedPickerResult<T>>,
            ui.UiFocusNavigationProvider
    {
        public readonly layoutSpec: ui.UiLayoutSpec
        public readonly finalRect: ui.Rect
        public layoutDirty: boolean
        private modalScopeId_: ui.UiFocusScopeId
        private controls_: ui.UiControl<T>[]
        private titleControls_: ui.UiControl<T>[]
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
        private panelColor_: number
        private titleColor_: number
        private contentMargin_: number
        private titleGap_: number
        private showTitleBar_: boolean
        private controlRects_: ui.Rect[]
        private titleControlRects_: ui.Rect[]
        private controlView_: ui.UiButtonView
        private onActivate_: ui.UiControlActivateHandler<T>

        constructor(options: HostedPickerOptions<T>) {
            this.modalScopeId_ = options.modalScopeId
            this.controls_ = options.controls
            this.titleControls_ = options.titleControls || []
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
            const modalStyle = options.modalStyle
            this.panelColor_ = modalStyle.panelColor
            this.titleColor_ = modalStyle.titleColor
            this.contentMargin_ = modalStyle.contentMargin
            this.titleGap_ = modalStyle.titleGap
            this.showTitleBar_ = modalStyle.showTitleBar !== false
            this.controlRects_ = []
            this.titleControlRects_ = []
            this.controlView_ = new ui.UiButtonView({
                style: this.controlStyle_,
            })
            this.onActivate_ = options.onActivate
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
            const contentWidth = gridContentWidth(
                this.controls_.length,
                this.columnCount_,
                this.controlWidth_,
                this.columnGap_,
            )
            const contentHeight = gridContentHeight(
                this.controls_.length,
                this.columnCount_,
                this.controlHeight_,
                this.rowGap_,
            )
            const width = Math.max(
                contentWidth,
                this.titleControlContentWidth(),
            )
            const height =
                contentHeight + this.titleHeight() + this.contentMargin_
            output.set(
                width + this.contentMargin_ * 2,
                height,
                width + this.contentMargin_ * 2,
                height,
            )
            this.clearLayoutInvalidation()
        }

        public arrange(rect: ui.Rect): void {
            this.finalRect.copyFrom(rect)
            arrangeGridControls(
                this.controls_,
                this.controlRects_,
                rect.x + this.contentMargin_,
                rect.y + this.titleHeight(),
                this.columnCount_,
                this.controlWidth_,
                this.controlHeight_,
                this.rowGap_,
                this.columnGap_,
            )
            this.arrangeTitleControls(rect, this.contentMargin_)
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
            if (controller) controller.setNavigation(this.modalScopeId_, this)
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
            return ui.moveFocusInRaggedGrid({
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
            surface.drawRoundedRect(this.finalRect, 15, this.panelColor_)
            this.drawTitle(surface, assets)
            this.renderControls(
                surface,
                assets,
                this.controls_,
                this.controlRects_,
            )
            this.renderControls(
                surface,
                assets,
                this.titleControls_,
                this.titleControlRects_,
            )
            this.renderFocus(
                surface,
                assets,
                focus,
                this.controls_,
                this.controlRects_,
            )
            this.renderFocus(
                surface,
                assets,
                focus,
                this.titleControls_,
                this.titleControlRects_,
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
                    color: this.titleColor_,
                })
        }

        private resolveTitleText(assets: ui.UiAssetResolver): string {
            if (this.titleId_ !== undefined)
                return assets.getText(this.titleId_)
            return ""
        }

        private resolveTitleBitmap(assets: ui.UiAssetResolver): Bitmap {
            if (this.titleBitmap_ === undefined) return undefined
            if (typeof this.titleBitmap_ == "string")
                return assets.getBitmap(this.titleBitmap_)
            return this.titleBitmap_
        }

        private arrangeTitleControls(rect: ui.Rect, margin: number): void {
            if (!this.hasTitleControls()) return
            this.ensureRects(this.titleControls_, this.titleControlRects_)
            let x =
                rect.x + rect.width - margin - this.titleControlContentWidth()
            for (let i = 0; i < this.titleControls_.length; i++) {
                this.titleControlRects_[i].set(
                    x,
                    rect.y + margin,
                    this.controlWidth_,
                    this.controlHeight_,
                )
                x += this.controlWidth_ + AppStyles.ModalControlGap
            }
        }

        private registerTargets(
            focus: ui.UiFocusState,
            controls: ui.UiControl<T>[],
            rects: ui.Rect[],
        ): void {
            registerGridTargets(focus, this.modalScopeId_, controls, rects)
        }

        private navigationRows(): ui.UiFocusNavigationTarget[][] {
            const rows: ui.UiFocusNavigationTarget[][] = []
            if (this.hasTitleControls())
                appendGridNavigationRows(
                    rows,
                    this.modalScopeId_,
                    this.titleControls_,
                    this.titleControlRects_,
                    this.titleControls_.length,
                )
            appendGridNavigationRows(
                rows,
                this.modalScopeId_,
                this.controls_,
                this.controlRects_,
                this.columnCount_,
            )
            return rows
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
        ): void {
            for (let i = 0; i < controls.length; i++) {
                const control = controls[i]
                if (!_uiControls.isVisible(control)) continue
                _uiControls.renderControl(
                    surface,
                    assets,
                    control,
                    rects[i],
                    this.controlView_,
                    this.controlStyle_,
                )
            }
        }

        private renderFocus(
            surface: ui.DrawSurface,
            assets: ui.UiAssetResolver,
            focus: ui.UiFocusState,
            controls: ui.UiControl<T>[],
            rects: ui.Rect[],
        ): void {
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
                this.controlView_,
                this.controlStyle_,
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
            while (rects.length < controls.length) rects.push(new ui.Rect())
            while (rects.length > controls.length) rects.pop()
        }

        private hasTitleControls(): boolean {
            return !!this.titleControls_.length
        }

        private titleHeight(): number {
            if (this.hasTitleControls())
                return (
                    this.contentMargin_ +
                    this.controlHeight_ +
                    this.titleGap_
                )
            if (
                !this.showTitleBar_ &&
                this.titleId_ === undefined &&
                this.titleBitmap_ === undefined
            )
                return this.contentMargin_
            return 16 + this.titleGap_
        }

        private titleControlContentWidth(): number {
            if (!this.hasTitleControls()) return 0
            return (
                this.titleControls_.length * this.controlWidth_ +
                (this.titleControls_.length - 1) * AppStyles.ModalControlGap
            )
        }
    }
}
