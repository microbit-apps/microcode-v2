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
                    if (mod instanceof IconEditor) return `${tok}\n${field}`
                    if (mod instanceof MelodyEditor) return `${tok} ${field}\n`
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
        const addTile = (tile: Tile, rule: RuleDefn) => {
            control.assert(rule != undefined)
            const tid = getTid(tile)
            if (isSensor(tid)) rule.push(tile, "sensors", false)
            if (isFilter(tid)) rule.push(tile, "filters", false)
            else if (isModifier(tid)) rule.push(tile, "modifiers", false)
            else rule.push(tile, "actuators", false)
        }
        let cursor = 0
        const whiteSpace = (s: string) => {
            return s == " " || s == "\n" || s == "\t"
        }
        const getToken = () => {
            let prev = cursor
            let gotToken = false
            while (cursor < str.length) {
                if (whiteSpace(str[cursor])) {
                    if (gotToken) return str.slice(prev, cursor)
                    cursor++
                    prev = cursor
                } else {
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
            console.log(`tok1 = ${tok}`)
            if (currTile) {
                if (
                    currTile instanceof IconEditor ||
                    currTile instanceof MelodyEditor
                ) {
                    control.assert(tok == "`")
                    let iconTokens = []
                    while ((tok = getToken()) != "`") iconTokens.push(tok)
                    control.assert(tok == "`")
                    currTile.field = currTile.fieldEditor.fromTokens(iconTokens)
                } else if (currTile instanceof DigitEditor) {
                    currTile.field = currTile.fieldEditor.fromTokens([tok])
                }
                currTile = undefined
            } else if (tok == "Page") {
                if (currPage) {
                    if (currRule) currPage.rules.push(currRule)
                    prog.pages.push(currPage)
                    currRule = undefined
                }
                currPage = new PageDefn()
                getToken() // consume page #
                continue
            } else if (tok == "When") {
                control.assert(currPage != undefined)
                if (currRule) currPage.rules.push(currRule)
                currRule = new RuleDefn()
            } else if (tok == "Do") {
                control.assert(currRule != undefined)
            } else {
                currTile = token2tile(tok)
                addTile(currTile, currRule)
            }
        }
        if (currRule) currPage.rules.push(currRule)
        prog.pages.push(currPage)
        parseProgRet = prog
    }
}
