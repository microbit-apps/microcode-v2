namespace microcode {
    // the parser/unparser are only for web, not
    // for the micro:bit runtime. They allow us to
    // create a simple text representation of a program
    // that can be used for copy/paste or sharing.
    // The format is not intended to be human friendly,
    // but it is easy to parse and unparse.

    function parseTile(token: string): microcode.Tile {
        // TODO: Map token to tile ID or ModifierEditor
        // Example: return Tid[token] || parseInt(token)
        // You may need a lookup table for string->Tid
        return parseInt(token)
    }

    function parseRule(text: string): microcode.RuleDefn {
        const rule = new microcode.RuleDefn()
        const tokens = text
            .split(",")
            .map(t => t.trim())
            .filter(t => t)
        // Example: [sensor, filter, actuator, modifier, ...]
        if (tokens[0]) rule.sensors.push(parseTile(tokens[0]))
        if (tokens[1]) rule.filters.push(parseTile(tokens[1]))
        if (tokens[2]) rule.actuators.push(parseTile(tokens[2]))
        for (let i = 3; i < tokens.length; ++i) {
            rule.modifiers.push(parseTile(tokens[i]))
        }
        return rule
    }

    function parsePage(text: string): microcode.PageDefn {
        const page = new microcode.PageDefn()
        const ruleTexts = text
            .split(";")
            .map(t => t.trim())
            .filter(t => t)
        for (const ruleText of ruleTexts) {
            page.rules.push(parseRule(ruleText))
        }
        return page
    }

    export function parseProgram(text: string): microcode.ProgramDefn {
        const program = new microcode.ProgramDefn()
        const pageTexts = text
            .split("|")
            .map(t => t.trim())
            .filter(t => t)
        program.pages = pageTexts.map(parsePage)
        return program
    }
}
