namespace microcode {
    /**
     * Tagged tile record for modifiers whose value is edited by a field editor.
     */
    export interface ModifierEditor {
        /**
         * Tile id stored in rule buffers and used for suggestions.
         */
        tid: number

        /**
         * Field payload owned by this editor tile.
         */
        field: any

        /**
         * Whether this tile is the singleton suggestion tile.
         */
        firstInstance: boolean

        /**
         * Whether a digit editor accepts only positive integer input.
         */
        posInt?: boolean
    }

    /**
     * Numeric modifier tile whose field is stored as a string.
     */
    export interface DigitEditor extends ModifierEditor {
        field: string
        posInt: boolean
    }

    /**
     * Modifier tile whose field is a 5 by 5 LED icon.
     */
    export interface IconEditor extends ModifierEditor {
        field: Bitmap
    }

    /**
     * Melody field stored as note indices plus tempo.
     */
    export interface Melody {
        notes: string
        tempo: number
    }

    /**
     * Modifier tile whose field is a melody.
     */
    export interface MelodyEditor extends ModifierEditor {
        field: Melody
    }

    /**
     * Returns true when `tile` is a field-editor modifier record.
     */
    export function isModifierEditor(tile: any): boolean {
        return !!tile && typeof tile != "number"
    }

    /**
     * Returns true when `tile` is a digit editor record.
     */
    export function isDigitEditor(tile: any): boolean {
        return (
            !!tile &&
            typeof tile != "number" &&
            (tile.tid == Tid.TID_DECIMAL_EDITOR ||
                tile.tid == Tid.TID_POS_INT_EDITOR)
        )
    }

    /**
     * Returns true when `tile` is an icon editor record.
     */
    export function isIconEditor(tile: any): boolean {
        return (
            !!tile &&
            typeof tile != "number" &&
            tile.tid == Tid.TID_MODIFIER_ICON_EDITOR
        )
    }

    /**
     * Returns true when `tile` is a melody editor record.
     */
    export function isMelodyEditor(tile: any): boolean {
        return (
            !!tile &&
            typeof tile != "number" &&
            tile.tid == Tid.TID_MODIFIER_MELODY_EDITOR
        )
    }

    /**
     * Creates a digit editor tile.
     */
    export function createDigitEditor(
        field?: string,
        posInt = false,
    ): DigitEditor {
        return {
            tid: posInt ? Tid.TID_POS_INT_EDITOR : Tid.TID_DECIMAL_EDITOR,
            field: field === undefined ? "10" : field,
            firstInstance: false,
            posInt,
        }
    }

    /**
     * Creates an icon editor tile.
     */
    export function createIconEditor(field?: Bitmap): IconEditor {
        return {
            tid: Tid.TID_MODIFIER_ICON_EDITOR,
            field: cloneIconFieldValue(field ? field : initIconField()),
            firstInstance: false,
        }
    }

    /**
     * Creates a melody editor tile.
     */
    export function createMelodyEditor(field?: Melody): MelodyEditor {
        return {
            tid: Tid.TID_MODIFIER_MELODY_EDITOR,
            field: cloneMelodyFieldValue(field ? field : initMelodyField()),
            firstInstance: false,
        }
    }

    /**
     * Creates an editable copy of a field-editor suggestion or rule tile.
     */
    export function createEditorInstance(
        tile: ModifierEditor,
        field: any = null,
    ): ModifierEditor {
        const tid = tile.tid
        if (tid == Tid.TID_DECIMAL_EDITOR || tid == Tid.TID_POS_INT_EDITOR)
            return createDigitEditor(
                field === null ? tile.field : field,
                tid == Tid.TID_POS_INT_EDITOR,
            )
        if (tid == Tid.TID_MODIFIER_ICON_EDITOR)
            return createIconEditor(
                field === null ? (tile as IconEditor).field : field,
            )
        if (tid == Tid.TID_MODIFIER_MELODY_EDITOR)
            return createMelodyEditor(
                field === null
                    ? cloneMelodyFieldValue((tile as MelodyEditor).field)
                    : field,
            )
        return undefined
    }

    /**
     * Returns the bitmap, text, or asset id used to draw a field-editor tile.
     */
    export function editorIcon(tile: ModifierEditor): string | number | Bitmap {
        if (tile.firstInstance) return tile.tid
        const tid = tile.tid
        if (tid == Tid.TID_DECIMAL_EDITOR || tid == Tid.TID_POS_INT_EDITOR)
            return icondb.numberToDecimalImage((tile as DigitEditor).field, false)
        if (tid == Tid.TID_MODIFIER_ICON_EDITOR)
            return icondb.renderMicrobitLEDs((tile as IconEditor).field)
        if (tid == Tid.TID_MODIFIER_MELODY_EDITOR)
            return icondb.melodyToImage((tile as MelodyEditor).field)
        return tile.tid
    }

    /**
     * Converts a field-editor tile payload to its compact buffer form.
     */
    export function editorFieldToBuffer(tile: ModifierEditor): Buffer {
        const tid = tile.tid
        if (tid == Tid.TID_DECIMAL_EDITOR || tid == Tid.TID_POS_INT_EDITOR)
            return digitFieldToBuffer((tile as DigitEditor).field)
        if (tid == Tid.TID_MODIFIER_ICON_EDITOR)
            return iconFieldToBuffer((tile as IconEditor).field)
        if (tid == Tid.TID_MODIFIER_MELODY_EDITOR)
            return melodyFieldToBuffer((tile as MelodyEditor).field)
        return Buffer.create(0)
    }

    /**
     * Reads a field-editor tile from its compact buffer form.
     */
    export function createEditorFromBuffer(
        tid: number,
        br: BufferReader,
    ): ModifierEditor {
        if (tid == Tid.TID_DECIMAL_EDITOR || tid == Tid.TID_POS_INT_EDITOR)
            return createDigitEditor(
                digitFieldFromBuffer(br),
                tid == Tid.TID_POS_INT_EDITOR,
            )
        if (tid == Tid.TID_MODIFIER_ICON_EDITOR)
            return createIconEditor(iconFieldFromBuffer(br))
        if (tid == Tid.TID_MODIFIER_MELODY_EDITOR)
            return createMelodyEditor(melodyFieldFromBuffer(br))
        return undefined
    }

    /**
     * Converts a field-editor tile payload to text tokens.
     */
    export function editorFieldToString(tile: ModifierEditor): string {
        const tid = tile.tid
        if (tid == Tid.TID_DECIMAL_EDITOR || tid == Tid.TID_POS_INT_EDITOR)
            return (tile as DigitEditor).field
        if (tid == Tid.TID_MODIFIER_ICON_EDITOR)
            return iconFieldToString((tile as IconEditor).field)
        if (tid == Tid.TID_MODIFIER_MELODY_EDITOR)
            return melodyToNotes((tile as MelodyEditor).field)
        return ""
    }

    /**
     * Parses text tokens into a field-editor payload.
     */
    export function editorFieldFromTokens(
        tile: ModifierEditor,
        tokens: string[],
    ): any {
        const tid = tile.tid
        if (tid == Tid.TID_DECIMAL_EDITOR || tid == Tid.TID_POS_INT_EDITOR)
            return tokens.length > 0 ? tokens[0] : "0"
        if (tid == Tid.TID_MODIFIER_ICON_EDITOR) return iconFieldFromTokens(tokens)
        if (tid == Tid.TID_MODIFIER_MELODY_EDITOR) return notesToMelody(tokens)
        return undefined
    }

    function digitFieldToBuffer(field: string): Buffer {
        const str = field
        const buf = Buffer.create(str.length + 1)
        for (let i = 0; i < str.length; i++) {
            buf.setUint8(i, str.charCodeAt(i))
        }
        buf.setUint8(str.length, 0)
        return buf
    }

    function digitFieldFromBuffer(buf: BufferReader): string {
        return buf.readString()
    }

    function initIconField(): Bitmap {
        return bmp`
        . . . . .
        . 1 . 1 .
        . . . . . 
        1 . . . 1
        . 1 1 1 .
        `
    }

    function cloneIconFieldValue(img: Bitmap): Bitmap {
        return img.clone()
    }

    function iconFieldToBuffer(img: Bitmap): Buffer {
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

    function iconFieldFromBuffer(br: BufferReader): Bitmap {
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

    function iconFieldToString(img: Bitmap): string {
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

    function iconFieldFromTokens(tokens: string[]): Bitmap {
        const ret = bitmaps.create(5, 5)
        for (let i = 0; i < tokens.length && i < 25; i++) {
            ret.setPixel(i % 5, Math.idiv(i, 5), tokens[i] == "1" ? 1 : 0)
        }
        return ret
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
     * Note names used by melody text parsing.
     */
    export const noteNames = ["C", "D", "E", "F", "G", "A", "B", "C5", "D5"]

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

    function initMelodyField(): Melody {
        return { notes: "0240", tempo: 120 }
    }

    function cloneMelodyFieldValue(melody: Melody): Melody {
        return { notes: melody.notes.slice(0), tempo: melody.tempo }
    }

    function melodyFieldToBuffer(melody: Melody): Buffer {
        const buf = Buffer.create(3)
        buf.setUint8(0, melody.tempo)
        const notes = melody.notes.split("")
        for (let i = 0; i < MELODY_LENGTH; i++) {
            const byte = i >> 1
            const bit = (i & 1) << 2
            if (notes[i] != ".") {
                const note = (parseInt(notes[i]) || 0) + 1
                buf.setUint8(byte + 1, buf.getUint8(byte + 1) | (note << bit))
            }
        }
        return buf
    }

    function melodyFieldFromBuffer(br: BufferReader): Melody {
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
                iconEditorTile = createIconEditor()
                iconEditorTile.firstInstance = true
            }
            return iconEditorTile
        } else if (tid == Tid.TID_MODIFIER_MELODY_EDITOR) {
            if (!melodyEditorTile) {
                melodyEditorTile = createMelodyEditor()
                melodyEditorTile.firstInstance = true
            }
            return melodyEditorTile
        } else if (tid == Tid.TID_DECIMAL_EDITOR) {
            if (!decimalEditorTile) {
                decimalEditorTile = createDigitEditor(undefined)
                decimalEditorTile.firstInstance = true
            }
            return decimalEditorTile
        } else if (tid == Tid.TID_POS_INT_EDITOR) {
            if (!posIntEditorTile) {
                posIntEditorTile = createDigitEditor(undefined, true)
                posIntEditorTile.firstInstance = true
            }
            return posIntEditorTile
        }
        return undefined
    }
}
