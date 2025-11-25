// a parser for MC programs

// Page [num]
// When [Event] Do [Action] [Loop]

// TODO: need to make tokens have unique tids (filter/mod replication)
// TID_MODIFIER_CUP_X_READ...
// TID_MODIFIER_COIN_1...
// translate
// TODO: scripts reverse the tooltip

namespace microcode {
    // resolveTooltip to go from Tid to string (replace space by -)
    // reverseTooltip to go from string to tid

    export function parse(str: string) {
        const token2tile = (tok: string) => {
            const tid = tooltip2tid(tok)
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
        for (let i = 0; i < lines.length; i++) {
            const line = lines[0].split(" ")
            if (line[0] == "Page") {
                currPage = new PageDefn()
            } else if (line[0] == "EOP") {
                prog.pages.push(currPage)
                currPage = undefined
            } else if (line[0] == "EOR") {
                currPage.rules.push(currRule)
                currRule = undefined
            } else {
                if (!currRule) {
                    currRule = new RuleDefn()
                    currRule.sensors.push(token2tile(line[0]) as number)
                    line.shift()
                }
                let tok = line.shift()
                while (tok) {
                    const tile = token2tile(tok)
                    placeTile(tile, currRule)
                    if (tile instanceof ModifierEditor) {
                        // TODO: process the field, based on context
                    } else tok = line.shift()
                }
            }
        }
    }
}
