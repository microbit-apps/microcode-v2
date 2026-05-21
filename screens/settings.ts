namespace microcode {
    export let microcodeClassic = false
    export let jacdacEnabled = false

    type SettingsMode = "classic" | "decimal"

    const SETTINGS_SCOPE = "settings/mode"
    const SETTINGS_TITLE = "Select Mode"
    const SETTINGS_CLASSIC_LABEL = "Classic: 1-5 dots"
    const SETTINGS_DECIMAL_LABEL = "Decimal: base 10"
    const SETTINGS_BACKGROUND = 0xc
    const SETTINGS_TITLE_Y = 18
    const SETTINGS_GRID_CENTER_Y = 66
    const SETTINGS_ITEM_WIDTH = 112
    const SETTINGS_ITEM_HEIGHT = 20
    const SETTINGS_ROW_GAP = 4

    const SETTINGS_BUTTON_STYLE = ui.buttonStyle(
        ui.UiButtonStyles.LightShadowedWhite,
        {
            foregroundColor: 15,
            font: bitmaps.font8,
        },
    )

    /**
     * Screen for choosing the numeric mode used by microcode tiles and sensors.
     */
    export class SettingsScreen extends ui.UiScreen {
        private navigation_: AppNavigation
        private controls_: ui.UiControl<SettingsMode>[]

        constructor(navigation: AppNavigation) {
            super()
            this.backgroundColor = SETTINGS_BACKGROUND
            this.navigation_ = navigation
            this.controls_ = this.createControls()

            this.addCentered(
                new HostedGrid<SettingsMode>({
                    scopeId: SETTINGS_SCOPE,
                    controls: this.controls_,
                    columnCount: 1,
                    controlWidth: SETTINGS_ITEM_WIDTH,
                    controlHeight: SETTINGS_ITEM_HEIGHT,
                    rowGap: SETTINGS_ROW_GAP,
                    controlStyle: SETTINGS_BUTTON_STYLE,
                    labelBounds: new ui.Rect(
                        0,
                        0,
                        UI_SCREEN_WIDTH,
                        UI_SCREEN_HEIGHT,
                    ),
                }),
                SETTINGS_GRID_CENTER_Y,
                UI_SCREEN_WIDTH,
                SETTINGS_ITEM_HEIGHT * 2 + SETTINGS_ROW_GAP,
            )
        }

        public render(surface: ui.DrawSurface): void {
            surface.clear(this.backgroundColor)
            this.drawTitle(surface)
            super.render(surface)
        }

        public handleScreenInput(event: ui.UiInputEvent): boolean | undefined {
            if (event.action == "cancel" && event.phase != "released") {
                this.navigation_.pop()
                return true
            }
            return undefined
        }

        private createControls(): ui.UiControl<SettingsMode>[] {
            return [
                this.modeControl("classic", SETTINGS_CLASSIC_LABEL, () =>
                    this.selectMode("classic"),
                ),
                this.modeControl("decimal", SETTINGS_DECIMAL_LABEL, () =>
                    this.selectMode("decimal"),
                ),
            ]
        }

        private modeControl(
            mode: SettingsMode,
            text: string,
            onActivate: () => void,
        ): ui.UiControl<SettingsMode> {
            return {
                id: mode,
                value: mode,
                text,
                selected: this.isSelected(mode),
                onActivate,
            }
        }

        private selectMode(mode: SettingsMode): void {
            microcodeClassic = mode == "classic"
            this.updateSelected()
        }

        private updateSelected(): void {
            for (let i = 0; i < this.controls_.length; i++) {
                const control = this.controls_[i]
                control.selected = this.isSelected(control.value)
            }
        }

        private isSelected(mode: SettingsMode): boolean {
            return mode == "classic" ? microcodeClassic : !microcodeClassic
        }

        private drawTitle(surface: ui.DrawSurface): void {
            const font = bitmaps.font8
            surface.drawText(
                SETTINGS_TITLE,
                Math.idiv(
                    UI_SCREEN_WIDTH - SETTINGS_TITLE.length * font.charWidth,
                    2,
                ),
                SETTINGS_TITLE_Y,
                { color: 1, font, transparent: true },
            )
        }
    }
}
