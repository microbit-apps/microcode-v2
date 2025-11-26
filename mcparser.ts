// a parser for MC programs

namespace microcode {
    export function parse(str: string): ProgramDefn {
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
            for (; tokens.length > 0; tok = tokens.shift()) {
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
        return prog
    }
}
