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
        export const ModalButton = ui.buttonStyle(
            ui.UiButtonStyles.LightShadowedWhite,
            {
                font: bitmaps.font8,
            },
        )

        /**
         * Default modal style for app-owned modal panels.
         */
        export const Modal: ui.UiModalStyle = {
            panelColor: DefaultModalPanelColor,
            titleColor: ModalTitleColor,
            contentMargin: ModalMargin,
            titleGap: ModalTitleGap,
        }

        /**
         * Modal style for panels that do not render a title.
         */
        export const TitlelessModal: ui.UiModalStyle = {
            panelColor: DefaultModalPanelColor,
            titleColor: ModalTitleColor,
            contentMargin: ModalMargin,
            titleGap: ModalTitleGap,
            showTitleBar: false,
        }

        /**
         * Modal style for numeric entry.
         */
        export const NumericModal: ui.UiModalStyle = {
            panelColor: DefaultModalPanelColor,
            titleColor: ModalTitleColor,
            contentMargin: NumericModalMargin,
            titleGap: ModalTitleGap,
            showTitleBar: false,
        }

        /**
         * Creates the standard modal style with an optional panel color.
         */
        export function modal(panelColor?: number): ui.UiModalStyle {
            return {
                panelColor:
                    panelColor === undefined
                        ? DefaultModalPanelColor
                        : panelColor,
                titleColor: ModalTitleColor,
                contentMargin: ModalMargin,
                titleGap: ModalTitleGap,
            }
        }

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
