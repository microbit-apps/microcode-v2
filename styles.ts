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
         * Palette used by the numeric entry display.
         */
        export const NumericDisplayPalette: ui.UiControlPalette = {
            backgroundColor: 1,
            foregroundColor: 15,
        }

        /**
         * Default modal style for app-owned modal panels.
         */
        export const Modal = modal()

        /**
         * Modal style for panels that do not render a title.
         */
        export const TitlelessModal = ui.modalStyle(
            Modal,
            ui.UiModalStyles.Titleless,
        )

        /**
         * Modal style for numeric entry.
         */
        export const NumericModal = ui.modalStyle(TitlelessModal, {
            contentMargin: NumericModalMargin,
        })

        /**
         * Creates the standard modal style with an optional panel color.
         */
        export function modal(panelColor?: number): ui.UiModalStyle {
            return ui.modalStyle(ui.UiModalStyles.Default, {
                panelColor:
                    panelColor === undefined
                        ? DefaultModalPanelColor
                        : panelColor,
                titleColor: ModalTitleColor,
                contentMargin: ModalMargin,
                titleGap: ModalTitleGap,
            })
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
