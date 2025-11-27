// a pretty printer and parser for MC programs
// web only

namespace microcode {
    export let progToStringRet: string = undefined
    //% shim=TD_NOOP
    export function progToString(prog: ProgramDefn) {
        const ruleToString = (rule: RuleDefn) => {
            const toToken = (tile: Tile) =>
                resolveTooltip("T" + getTid(tile)).replaceAll(" ", "_")
            const tileToString = (tile: Tile) => {
                const tok = toToken(tile)
                if (tile instanceof ModifierEditor) {
                    const mod = tile as ModifierEditor
                    const field = mod.fieldEditor.toString(mod.getField())
                    if (mod instanceof IconEditor)
                        return `${tok} \`\n${field}\`\n`
                    else if (mod instanceof MelodyEditor)
                        return `${tok} \`${field}\`\n`
                    else return `${tok} ${field}`
                }
                return tok
            }
            return (
                "When " +
                toToken(rule.sensor) +
                " " +
                rule.filters.map(tileToString).join(" ") +
                " Do " +
                (rule.actuators.length
                    ? toToken(rule.actuators[0]) +
                      " " +
                      rule.modifiers.map(tileToString).join(" ")
                    : "") +
                "\n"
            )
        }
        const pageToString = (page: PageDefn) => {
            const res = page.rules.map(ruleToString)
            return res.join("\n")
        }
        const res = prog.pages.map(pageToString)
        progToStringRet = res.map((ps, i) => `Page ${i + 1}\n${ps}`).join("\n")
    }

    enum Phase {
        Sensor,
        Filter,
        Actuator,
        Modifier,
    }

    export let parseProgRet: ProgramDefn = undefined
    //% shim=TD_NOOP
    export function parseProg(str: string): void {
        const token2tile = (tok: string) => {
            const tid = tooltip2tid(tok.replaceAll("_", " "))
            control.assert(tid != undefined, `tok ${tok} does not have mapping`)
            // check to see if field editor needed
            const tile = getEditor(tid)
            if (tile && tile instanceof ModifierEditor) {
                return tile.getNewInstance()
            } else {
                return tid
            }
        }
        let phase: Phase = Phase.Sensor
        const addTile = (rule: RuleDefn, tile: Tile, phase: Phase) => {
            control.assert(rule != undefined, `No Rule definition`)
            if (phase == Phase.Sensor) {
                rule.push(tile, "sensors", false)
                phase = Phase.Filter
            } else if (phase == Phase.Filter) rule.push(tile, "filters", false)
            else if (phase == Phase.Modifier)
                rule.push(tile, "modifiers", false)
            else {
                rule.push(tile, "actuators", false)
                phase = Phase.Modifier
            }
        }
        // tokenizer
        let cursor = 0
        const getToken = () => {
            const whiteSpace = (s: string) => {
                return s == " " || s == "\n" || s == "\t"
            }
            let prev = cursor
            let gotToken = false
            while (cursor < str.length) {
                if (whiteSpace(str[cursor])) {
                    if (gotToken) return str.slice(prev, cursor)
                    cursor++
                    prev = cursor
                } else {
                    if (str[cursor] == "`") {
                        cursor++
                        return "`"
                    }
                    gotToken = true
                    cursor++
                }
            }
            if (gotToken) return str.slice(prev, cursor)
            return undefined
        }
        const prog = new ProgramDefn()
        prog.pages = []

        let currPage: PageDefn = undefined
        let currRule: RuleDefn = undefined
        let currTile: Tile = undefined
        let tok: string = undefined
        while ((tok = getToken())) {
            // console.log(`tok = ${tok}`)
            if (currTile && currTile instanceof ModifierEditor) {
                if (
                    currTile instanceof IconEditor ||
                    currTile instanceof MelodyEditor
                ) {
                    const thisTile = currTile as ModifierEditor
                    control.assert(tok == "`", `expected \`, got ${tok}`)
                    let tokens = []
                    while ((tok = getToken()) != "`") {
                        tokens.push(tok)
                    }
                    //console.log(`got tokens = ${tokens.join(":")}`)
                    control.assert(tok == "`", `expected \`, got ${tok}`)
                    currTile.field = thisTile.fieldEditor.fromTokens(tokens)
                } else if (currTile instanceof DigitEditor) {
                    currTile.field = currTile.fieldEditor.fromTokens([tok])
                }
                currTile = undefined
                continue
            }
            currTile = undefined
            if (tok == "Page") {
                if (currPage) {
                    if (currRule) currPage.rules.push(currRule)
                    prog.pages.push(currPage)
                    currRule = undefined
                }
                currPage = new PageDefn()
                getToken() // consume page #
            } else if (tok == "When") {
                control.assert(currPage != undefined, `No Page defined`)
                if (currRule) currPage.rules.push(currRule)
                currRule = new RuleDefn()
                phase = Phase.Sensor
            } else if (tok == "Do") {
                control.assert(currRule != undefined, `No When defined`)
                phase = Phase.Actuator
            } else {
                currTile = token2tile(tok)
                addTile(currRule, currTile, phase)
            }
        }
        if (currRule) currPage.rules.push(currRule)
        prog.pages.push(currPage)
        parseProgRet = prog
    }
}
