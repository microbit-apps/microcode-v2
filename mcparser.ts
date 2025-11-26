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
            const tid = getTid(tile)
            if (isFilter(tid)) rule.push(tile, "filters", false)
            else if (isModifier(tid)) rule.push(tile, "modifiers", false)
            else rule.push(tile, "actuators", false)
        }
        const prog = new ProgramDefn()
        prog.pages = []
        const lines = str.split("\n")
        let currPage: PageDefn = undefined
        let currRule: RuleDefn = undefined
        let currTile: Tile = undefined
        for (let i = 0; i < lines.length; i++) {
            console.log(`lines[${i}] = ${lines[i]}`)
            if (currTile && currTile instanceof IconEditor) {
                const all5 = lines.slice(i, i + 5).join("\n")
                console.log(`get the image?\n${all5}`)
                currTile.field = currTile.fieldEditor.fromString(all5)
                currTile = undefined
                i = i + 4 // loop count adds one more
                continue
            }
            const tokens = lines[i].split(" ")
            if (tokens.length == 0) continue
            console.log(`tokens = ${tokens.join(":")}`)
            let tok = tokens.shift()
            console.log(`tok1 = ${tok}`)
            if (tok == "Page") {
                if (currPage) {
                    if (currRule) currPage.rules.push(currRule)
                    prog.pages.push(currPage)
                    currRule = undefined
                }
                currPage = new PageDefn()
                continue
            } else if (tok == "When") {
                control.assert(currPage != undefined)
                if (currRule) currPage.rules.push(currRule)
                currRule = undefined
                tok = tokens.shift()
            }
            for (; tok !== undefined; tok = tokens.shift()) {
                console.log(`tok2 = ${tok}`)
                if (!tok) continue
                if (!currRule) {
                    currRule = new RuleDefn()
                    // can we have When followed by Do?
                    currRule.sensors.push(token2tile(tok) as number)
                    continue
                }
                if (tok == "Do") continue
                currTile = token2tile(tok)
                addTile(currTile, currRule)
                if (currTile instanceof IconEditor) {
                    console.log(`got IconEditor`)
                    break
                } else if (currTile instanceof DigitEditor) {
                    currTile.field = currTile.fieldEditor.fromString(tok)
                    currTile = undefined
                } else if (currTile instanceof MelodyEditor) {
                    currTile.field = currTile.fieldEditor.fromString(
                        tok + tokens.join(" ")
                    )
                    currTile = undefined
                    break
                }
            }
        }
        if (currRule) currPage.rules.push(currRule)
        prog.pages.push(currPage)
        parseProgRet = prog
    }
}
