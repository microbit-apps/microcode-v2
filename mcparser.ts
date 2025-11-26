// a parser for MC programs

namespace microcode {
    export function parse(str: string): ProgramDefn {
        const token2tile = (tok: string) => {
            const tid = tooltip2tid(tok.replaceAll("_", " "))
            // check to see if field editor needed
            const tile = getEditor(tid)
            if (tile instanceof ModifierEditor) {
                return tile.getNewInstance()
            } else {
                return tid
            }
        }
        const placeTile = (tile: Tile, rule: RuleDefn) => {
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
            if (currTile instanceof IconEditor) {
                // grab the next 4 lines as well
                const all5 = lines.slice(i, i + 4).join("\n")
                currTile.field = currTile.fieldEditor.fromString(all5)
                currTile = undefined
                i = i + 4
                continue
            }
            const tokens = lines[i].split(" ")
            if (tokens[0] == "Page") {
                currPage = new PageDefn()
            } else if (tokens[0] == "EOP") {
                prog.pages.push(currPage)
                currPage = undefined
            } else if (tokens[0] == "EOR") {
                currPage.rules.push(currRule)
                currRule = undefined
            } else {
                if (!currRule) {
                    currRule = new RuleDefn()
                    currRule.sensors.push(token2tile(tokens[0]) as number)
                    tokens.shift()
                }
                let tok = tokens.shift()
                while (tok) {
                    if (!currTile) {
                        currTile = token2tile(tok)
                        placeTile(currTile, currRule)
                    } else if (currTile instanceof IconEditor) {
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
                    tok = tokens.shift()
                }
            }
        }
        return prog
    }
}
