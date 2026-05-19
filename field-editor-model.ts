namespace microcode {
    /**
     * Returns the field serializer owned by a modifier editor tile.
     */
    export function getFieldEditor(tile: Tile): FieldEditor {
        if (tile instanceof ModifierEditor) return tile.fieldEditor
        return undefined
    }

    /**
     * Converts field-editor state between runtime, image, buffer, and text forms.
     */
    class FieldEditor {
        constructor() {}

        public init(): any {
            return undefined
        }

        public clone(field: any): any {
            return undefined
        }

        public toImage(field: any): Bitmap {
            return undefined
        }

        public toBuffer(field: any): Buffer {
            return undefined
        }

        public fromBuffer(buf: BufferReader): any {
            return undefined
        }

        public toString(field: any): string {
            return ""
        }

        public fromTokens(tokens: string[]): any {
            return undefined
        }
    }

    /**
     * Base tile type for modifiers whose value is edited through a field editor.
     */
    export class ModifierEditor {
        /**
         * Serializer and image renderer for this tile's field value.
         */
        public fieldEditor: FieldEditor

        /**
         * Whether this tile is the singleton suggestion tile rather than a rule value.
         */
        public firstInstance: boolean

        constructor(public tid: number) {
            this.firstInstance = false
        }

        public getField(): any {
            return null
        }

        public getIcon(): string | number | Bitmap {
            return null
        }

        public getNewInstance(field: any = null): ModifierEditor {
            return null
        }

        public usePreviousField(): boolean {
            return true
        }
    }

    interface BoxedNumAsStr {
        num: string
    }

    /**
     * Serializer and image renderer for decimal and positive-integer fields.
     */
    export class DigitWidgetEditor extends FieldEditor {
        constructor(private posInt: boolean) {
            super()
        }

        public init(): BoxedNumAsStr {
            return { num: "10" }
        }

        public clone(bn: BoxedNumAsStr): BoxedNumAsStr {
            return { num: bn.num.slice(0) }
        }

        public toImage(field: BoxedNumAsStr): Bitmap {
            return icondb.numberToDecimalImage(field.num, false)
        }

        public toBuffer(field: BoxedNumAsStr): Buffer {
            const str = field.num
            const buf = Buffer.create(str.length + 1)
            for (let i = 0; i < str.length; i++) {
                buf.setUint8(i, str.charCodeAt(i))
            }
            buf.setUint8(str.length, 0)
            return buf
        }

        public fromBuffer(buf: BufferReader): BoxedNumAsStr {
            const str = buf.readString()
            return { num: str }
        }

        public toString(field: BoxedNumAsStr): string {
            return field.num
        }

        public fromTokens(tokens: string[]): BoxedNumAsStr {
            return { num: tokens.length > 0 ? tokens[0] : "0" }
        }
    }

    /**
     * Numeric modifier tile whose field is stored as a string.
     */
    export class DigitEditor extends ModifierEditor {
        constructor(public field: BoxedNumAsStr, private posInt = false) {
            super(posInt ? Tid.TID_POS_INT_EDITOR : Tid.TID_DECIMAL_EDITOR)
            this.fieldEditor = new DigitWidgetEditor(posInt)
            this.field = this.fieldEditor.clone(
                field ? field : this.fieldEditor.init(),
            )
        }

        public getField(): BoxedNumAsStr {
            return this.field
        }

        public getIcon(): string | number | Bitmap {
            return this.firstInstance
                ? getIcon(Tid.TID_DECIMAL_EDITOR)
                : this.fieldEditor.toImage(this.field)
        }

        public getNewInstance(field: any = null): DigitEditor {
            return new DigitEditor(field ? field : this.field, this.posInt)
        }

        public usePreviousField(): boolean {
            return false
        }
    }

    /**
     * Serializer and image renderer for 5 by 5 LED icon fields.
     */
    export class IconFieldEditor extends FieldEditor {
        public init(): Bitmap {
            return bmp`
        . . . . .
        . 1 . 1 .
        . . . . . 
        1 . . . 1
        . 1 1 1 .
        `
        }

        public clone(img: Bitmap): Bitmap {
            return img.clone()
        }

        public toImage(field: Bitmap): Bitmap {
            return icondb.renderMicrobitLEDs(field)
        }

        public toBuffer(img: Bitmap): Buffer {
            const ret = Buffer.create(4)
            for (let index = 0; index < 25; index++) {
                const byte = index >> 3
                const bit = index & 7
                const col = index % 5
                const row = Math.idiv(index, 5)
                ret[byte] |= img.getPixel(col, row) << bit
            }
            return ret
        }

        public fromBuffer(br: BufferReader): Bitmap {
            const buf = br.readBuffer(4)
            const img = bitmaps.create(5, 5)
            for (let index = 0; index < 25; index++) {
                const byte = index >> 3
                const bit = index & 7
                const col = index % 5
                const row = Math.idiv(index, 5)
                img.setPixel(col, row, (buf[byte] >> bit) & 1)
            }
            return img
        }

        public toString(img: Bitmap): string {
            let ret = ""
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    ret += img.getPixel(col, row) ? "1" : "."
                    if (col < 4) ret += " "
                }
                ret += "\n"
            }
            return ret + ""
        }

        public fromTokens(tokens: string[]): Bitmap {
            const ret = bitmaps.create(5, 5)
            for (let i = 0; i < tokens.length && i < 25; i++) {
                ret.setPixel(i % 5, Math.idiv(i, 5), tokens[i] == "1" ? 1 : 0)
            }
            return ret
        }
    }

    /**
     * Modifier tile whose field is a 5 by 5 LED icon.
     */
    export class IconEditor extends ModifierEditor {
        public field: Bitmap

        constructor(field: Bitmap = null) {
            super(Tid.TID_MODIFIER_ICON_EDITOR)
            this.fieldEditor = new IconFieldEditor()
            this.field = this.fieldEditor.clone(
                field ? field : this.fieldEditor.init(),
            )
        }

        public getField(): Bitmap {
            return this.field
        }

        public getIcon(): string | number | Bitmap {
            return this.firstInstance
                ? getIcon(Tid.TID_MODIFIER_ICON_EDITOR)
                : this.fieldEditor.toImage(this.field)
        }

        public getNewInstance(field: any = null): IconEditor {
            return new IconEditor(field ? field : this.field.clone())
        }
    }

    /**
     * Melody field stored as note indices plus tempo.
     */
    export interface Melody {
        notes: string
        tempo: number
    }

    /**
     * Converts a melody field into note names separated by spaces.
     */
    export function melodyToNotes(melody: Melody): string {
        const notes = melody.notes.split("")
        let result = ""
        for (const n of notes) {
            if (n == ".") result += "- "
            else result += noteNames[parseInt(n)] + " "
        }
        return result + ""
    }

    function notesToMelody(tokens: string[]): Melody {
        let res = ""
        tokens.forEach(note => {
            if (note == "-") res += "."
            else {
                const index = noteNames.indexOf(note)
                if (index >= 0) res += index.toString()
            }
        })
        return { notes: res, tempo: 120 }
    }

    /**
     * Number of melody columns shown and serialized by melody editor tiles.
     */
    export const MELODY_LENGTH = 4

    /**
     * Number of selectable note rows in the melody editor.
     */
    export const NUM_NOTES = 5

    /**
     * Note names used by melody text parsing and accessibility.
     */
    export const noteNames = ["C", "D", "E", "F", "G", "A", "B", "C5", "D5"]

    /**
     * Serializer and image renderer for melody fields.
     */
    export class MelodyFieldEditor extends FieldEditor {
        public init(): Melody {
            return { notes: "0240", tempo: 120 }
        }

        public clone(melody: Melody): Melody {
            return { notes: melody.notes.slice(0), tempo: melody.tempo }
        }

        public toImage(field: Melody): Bitmap {
            return icondb.melodyToImage(field)
        }

        public toBuffer(melody: Melody): Buffer {
            const buf = Buffer.create(3)
            buf.setUint8(0, melody.tempo)
            const notes = melody.notes.split("")
            for (let i = 0; i < MELODY_LENGTH; i++) {
                const byte = i >> 1
                const bit = (i & 1) << 2
                if (notes[i] != ".") {
                    const note = (parseInt(notes[i]) || 0) + 1
                    buf.setUint8(
                        byte + 1,
                        buf.getUint8(byte + 1) | (note << bit),
                    )
                }
            }
            return buf
        }

        public fromBuffer(br: BufferReader): Melody {
            const buf = br.readBuffer(3)
            const tempo = buf[0]
            let notes = ""
            for (let i = 0; i < MELODY_LENGTH; i++) {
                const byte = i >> 1
                const bit = (i & 1) << 2
                const note = (buf[byte + 1] >> bit) & 0xf
                notes += note == 0 ? "." : (note - 1).toString()
            }
            return { tempo, notes }
        }

        public toString(melody: Melody): string {
            return melodyToNotes(melody)
        }

        public fromTokens(tokens: string[]): Melody {
            return notesToMelody(tokens)
        }
    }

    /**
     * Modifier tile whose field is a melody.
     */
    export class MelodyEditor extends ModifierEditor {
        public field: Melody

        constructor(field: Melody = null) {
            super(Tid.TID_MODIFIER_MELODY_EDITOR)
            this.firstInstance = false
            this.fieldEditor = new MelodyFieldEditor()
            this.field = this.fieldEditor.clone(
                field ? field : this.fieldEditor.init(),
            )
        }

        public getField(): Melody {
            return this.field
        }

        public getIcon(): string | number | Bitmap {
            return this.firstInstance
                ? getIcon(Tid.TID_MODIFIER_MELODY_EDITOR)
                : this.fieldEditor.toImage(this.field)
        }

        public getNewInstance(field: any = null): MelodyEditor {
            return new MelodyEditor(
                field ? field : this.fieldEditor.clone(this.field),
            )
        }
    }

    let iconEditorTile: ModifierEditor = undefined
    let melodyEditorTile: ModifierEditor = undefined
    let decimalEditorTile: ModifierEditor = undefined
    let posIntEditorTile: ModifierEditor = undefined

    /**
     * Returns the singleton field-editor suggestion tile for a tile id.
     */
    export function getEditor(tid: Tid): ModifierEditor {
        if (tid == Tid.TID_MODIFIER_ICON_EDITOR) {
            if (!iconEditorTile) {
                iconEditorTile = new IconEditor()
                iconEditorTile.firstInstance = true
            }
            return iconEditorTile
        } else if (tid == Tid.TID_MODIFIER_MELODY_EDITOR) {
            if (!melodyEditorTile) {
                melodyEditorTile = new MelodyEditor()
                melodyEditorTile.firstInstance = true
            }
            return melodyEditorTile
        } else if (tid == Tid.TID_DECIMAL_EDITOR) {
            if (!decimalEditorTile) {
                decimalEditorTile = new DigitEditor(undefined)
                decimalEditorTile.firstInstance = true
            }
            return decimalEditorTile
        } else if (tid == Tid.TID_POS_INT_EDITOR) {
            if (!posIntEditorTile) {
                posIntEditorTile = new DigitEditor(undefined, true)
                posIntEditorTile.firstInstance = true
            }
            return posIntEditorTile
        }
        return undefined
    }
}
