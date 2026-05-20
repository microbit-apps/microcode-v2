// a pretty printer and parser for MC programs
// web only

namespace microcode {
    //% shim=TD_NOOP
    export function progToString(prog: ProgramDefn, ret: { s: string }) {
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
            const res = page.rules.map(ruleToString).filter(r => r != "")
            return res.join("\n")
        }
        const res = prog.pages.map(pageToString)
        ret.s = res
            .map((ps, i) =>
                ps == "" && i > 0 ? "" : i == 0 ? ps : `page_${i + 1}:\n${ps}`
            )
            .filter(s => s != "")
            .join("\n")
    }

    enum Phase {
        Sensor = 1,
        Filter,
        Actuator,
        Modifier,
    }

    //% shim=TD_NOOP
    export function parseProg(str: string, ret: { p: ProgramDefn }) {
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

        let pageMap: { [key: number]: PageDefn } = {}
        let currPage: PageDefn = undefined
        let currPageNum: number = undefined
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
            if (
                tok.indexOf("page_") == 0 &&
                tok.indexOf(":") == tok.length - 1
            ) {
                control.assert(
                    tok.length == 7,
                    `expected page_[1-5]:, got ${tok}}`
                )
                const pageNum = parseInt(tok[5])
                control.assert(
                    pageNum >= 1 && pageNum <= 5,
                    `page number must be between 1 and 5, got ${pageNum}`
                )
                if (currPage && currPageNum !== undefined) {
                    if (currRule) currPage.rules.push(currRule)
                    pageMap[currPageNum] = currPage
                    currRule = undefined
                }
                assert(
                    pageMap[pageNum] == undefined,
                    `page ${pageNum} redefined`
                )
                currPage = new PageDefn()
                currPageNum = pageNum
            } else if (tok == "when") {
                if (currPage == undefined) {
                    currPage = new PageDefn()
                    currPageNum = 1
                    pageMap[currPageNum] = currPage
                }
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
        if (currPageNum !== undefined) {
            pageMap[currPageNum] = currPage
        }

        // Build pages array from 1 to 5, including only pages that were defined
        for (let i = 1; i <= 5; i++) {
            if (pageMap[i]) {
                prog.pages.push(pageMap[i])
            } else {
                prog.pages.push(new PageDefn())
            }
        }
        ret.p = prog
    }

    //% shim=TD_NOOP
    export function testSamples() {
        const samples = microcode.samples(false)
        console.log(`const newSamples: textSampleList = [`)
        for (const sample of samples) {
            const buf = sample.source
            const prog = ProgramDefn.fromBuffer(new BufferReader(buf))
            const ret = { s: "" }
            progToString(prog, ret)
            const buf1 = prog.toBuffer()
            const ret2: { p: ProgramDefn } = { p: undefined }
            parseProg(ret.s, ret2)
            const buf2 = ret2.p.toBuffer()
            const ret3 = { s: "" }
            progToString(ret2.p, ret3)
            const pas2 = ret3.s
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
            console.log(`{
 src: \`${pas2.replaceAll("`", "\\`")}\`,
 icon: ${sample.icon ? '"' + sample.icon + '"' : "undefined"},
},\n`)
        }
        console.log(`]`)
    }
}
