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
                "when " +
                toToken(rule.sensor) +
                " " +
                rule.filters.map(tileToString).join(" ") +
                " do " +
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
        progToStringRet = res.map((ps, i) => `page-${i + 1}\n${ps}`).join("\n")
    }

    enum Phase {
        Sensor = 1,
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
        let phase = Phase.Sensor
        const addTile = (rule: RuleDefn, tile: Tile) => {
            control.assert(rule != undefined, `No Rule definition`)
            if (phase == Phase.Sensor) {
                rule.push(tile, "sensors", false)
                phase = Phase.Filter
            } else if (phase == Phase.Filter) {
                rule.push(tile, "filters", false)
            } else if (phase == Phase.Modifier) {
                rule.push(tile, "modifiers", false)
            } else {
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

        let nextPageNum = 1
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
            if (tok.indexOf("page-") == 0) {
                control.assert(
                    tok.length == 6,
                    `expected page-[1-5], got page-`
                )
                const pageNum = parseInt(tok[5])
                control.assert(
                    pageNum == nextPageNum,
                    `expected page-${nextPageNum}, got page-${pageNum}`
                )
                if (currPage) {
                    if (currRule) currPage.rules.push(currRule)
                    prog.pages.push(currPage)
                    currRule = undefined
                }
                currPage = new PageDefn()
                nextPageNum++
            } else if (tok == "when") {
                control.assert(currPage != undefined, `No page defined`)
                if (currRule) currPage.rules.push(currRule)
                currRule = new RuleDefn()
                phase = Phase.Sensor
            } else if (tok == "do") {
                control.assert(currRule != undefined, `No when defined`)
                phase = Phase.Actuator
            } else {
                control.assert(currPage != undefined, `No page defined`)
                control.assert(currRule != undefined, `No when defined`)
                currTile = token2tile(tok)
                addTile(currRule, currTile)
            }
        }
        if (currRule) currPage.rules.push(currRule)
        prog.pages.push(currPage)
        parseProgRet = prog
    }

    //% shim=TD_NOOP
    function testSamples() {
        const samples = microcode.samples(false)
        for (const sample of samples) {
            console.log(`check sample ${sample.label}`)
            const buf = sample.source
            const prog = ProgramDefn.fromBuffer(new BufferReader(buf))
            progToString(prog)
            const pas1 = progToStringRet
            const buf1 = this.progdef.toBuffer()
            parseProg(pas1)
            const progFromString = parseProgRet
            const buf2 = progFromString.toBuffer()
            progToString(progFromString)
            const pas2 = progToStringRet
            // check the programs are the same
            for (let i = 0; i < buf.length && i < buf2.length; i++) {
                if (buf1[i] != buf2[i]) {
                    control.assert(
                        false,
                        `buf/buf2[${i}] = ${buf[i]}/${buf2[i]}`
                    )
                }
            }
            assert(buf1.length == buf2.length, `bufs not same length`)
            console.log(`${sample.label}\n${pas2}`)
        }
    }
}
