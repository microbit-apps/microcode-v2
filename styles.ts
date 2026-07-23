namespace microcode {
    /**
     * Shared visual styles for microcode screens and modal controls.
     */
    export namespace AppStyles {
        /**
         * Standard square size for compact modal items.
         */
        export const ModalItemSize = 18

        /**
         * Standard column count for compact modal pickers.
         */
        export const ModalColumnCount = 3

        /**
         * Standard content margin for compact modal panels.
         */
        export const ModalMargin = 4

        /**
         * Standard gap between a modal title and its content grid.
         */
        export const ModalTitleGap = 4

        /**
         * Standard gap between controls in compact modal pickers.
         */
        export const ModalControlGap = 1

        /**
         * Default modal panel color for editor-owned modal panels.
         */
        export const DefaultModalPanelColor = 12

        /**
         * Default title color for app-owned modal panels.
         */
        export const ModalTitleColor = 1

        /**
         * Content margin used by the numeric entry modal.
         */
        export const NumericModalMargin = 5

        /**
         * Button style for compact modal controls.
         */
        // Intentionally omits `font`: the render path resolves the default font
        // at use time via `ui.locFont()`. Setting it here would capture
        // `bitmaps.font8` at module-init time, before the app assigns a
        // per-language font, and would never pick up a localized default.
        export const ModalButton = ui.buttonStyle(
            ui.UiButtonStyles.LightShadowedWhite,
        )

        /**
         * Creates the shared icon-button style used by screen controls.
         */
        export function iconButton(): ui.UiButtonStyle {
            return ui.buttonStyle(
                ui.UiButtonStyles.Transparent,
                ui.UiButtonStyles.FocusLabel,
            )
        }
    }
}
