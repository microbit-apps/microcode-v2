namespace microcode {
    import PickerNavigator = user_interface_base.PickerNavigator
    import Picker = user_interface_base.Picker

    // accessibility for melody
    export class MelodyNavigator extends PickerNavigator {
        constructor(picker: Picker) {
            super(picker)
            this.row = 2
            this.col = 2
        }
        protected reportAria() {
            if (!reportAria) return
            super.reportAria()
            if (this.row == -1) return
            const on = true // TODO btn.getIcon() === "note_on"
            const index = this.hasDelete ? this.row - 1 : this.row
            accessibility.setLiveContent(<
                accessibility.NoteAccessibilityMessage
            >{
                type: "note",
                on,
                index,
                force: true,
            })
        }
    }

    // accessibility for LEDs
    export class LEDNavigator extends PickerNavigator {
        constructor(picker: Picker) {
            super(picker)
            this.row = 2
            this.col = 2
        }
        protected reportAria() {
            if (!reportAria) return
            super.reportAria()
            if (this.row == -1) return
            const on = true // TODO: btn.getIcon() == "solid_red"
            accessibility.setLiveContent(<
                accessibility.LEDAccessibilityMessage
            >{
                type: "led",
                on,
                x: this.col,
                y: this.row,
                force: true,
            })
        }
    }
}
