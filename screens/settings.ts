namespace microcode {
    export let microcodeClassic = false
    export let jacdacEnabled = false

    type SettingsMode = "classic" | "decimal"

    const SETTINGS_SCOPE = "settings/mode"
    const SETTINGS_BACKGROUND = 0xc
    const SETTINGS_TITLE_Y = 18
    const SETTINGS_GRID_CENTER_Y = 66
    const SETTINGS_ITEM_WIDTH = 112
    const SETTINGS_ITEM_HEIGHT = 20
    const SETTINGS_ROW_GAP = 4

    // These button styles intentionally omit `font`: the render path resolves
    // the default font at use time via `ui.locFont()`. Setting it here would
    // capture `bitmaps.font8` at module-init time, before the app assigns a
    // per-language font, and would never pick up a localized default.
    const SETTINGS_UNSELECTED_BUTTON_STYLE: ui.UiButtonStyle = {
        backgroundColor: 11,
        borderColor: 11,
        frame: "roundedRect",
    }
    const SETTINGS_SELECTED_BUTTON_STYLE: ui.UiButtonStyle = {
        backgroundColor: 1,
        borderColor: 1,
        frame: "roundedRect",
    }

    /**
     * Screen for choosing the numeric mode used by microcode tiles and sensors.
     */
    export class SettingsScreen extends ui.UiScreen {
        private host_: AppHost
        private controls_: ui.UiControl<SettingsMode>[]

        constructor(host: AppHost) {
            super(host.runtime)
            this.backgroundColor = SETTINGS_BACKGROUND
            this.host_ = host
            this.controls_ = this.createControls()

            this.addCentered(
                new ControlGrid<SettingsMode>({
                    scopeId: SETTINGS_SCOPE,
                    controls: this.controls_,
                    columnCount: 1,
                    controlWidth: SETTINGS_ITEM_WIDTH,
                    controlHeight: SETTINGS_ITEM_HEIGHT,
                    rowGap: SETTINGS_ROW_GAP,
                    controlStyle: SETTINGS_UNSELECTED_BUTTON_STYLE,
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

        public handleInput(event: ui.UiInputEvent): boolean | undefined {
            if (event.action == "cancel" && event.phase != "released") {
                this.host_.pop()
                return true
            }
            return undefined
        }

        private createControls(): ui.UiControl<SettingsMode>[] {
            return [
                this.modeControl("classic", ui.loc("Classic: 1-5 dots"), () =>
                    this.selectMode("classic"),
                ),
                this.modeControl("decimal", ui.loc("Decimal: base 10"), () =>
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
                style: this.modeStyle(mode),
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
                control.style = this.modeStyle(control.value)
            }
        }

        private modeStyle(mode: SettingsMode): ui.UiButtonStyle {
            return this.isSelected(mode)
                ? SETTINGS_SELECTED_BUTTON_STYLE
                : SETTINGS_UNSELECTED_BUTTON_STYLE
        }

        private isSelected(mode: SettingsMode): boolean {
            return mode == "classic" ? microcodeClassic : !microcodeClassic
        }

        private drawTitle(surface: ui.DrawSurface): void {
            const font = ui.locFont()
            const title = ui.loc("Select Mode")
            surface.drawText(
                title,
                Math.idiv(UI_SCREEN_WIDTH - title.length * font.charWidth, 2),
                SETTINGS_TITLE_Y,
                { color: 1, font },
            )
        }
    }
}
