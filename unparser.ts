namespace microcode {
    function tileToString(tile: microcode.Tile): string {
        // Use the tile ID as string, or tooltip if available
        const tid = microcode.getTid(tile)
        // Try to find the tooltip key for this tid
        // If tid is a number, use its string form
        // If tid is a string, use it directly
        // Otherwise, fallback to tid.toString()
        return (
            tooltips.resolveTooltip(microcode.tidToString(tid)) ||
            microcode.tidToString(tid)
        )
    }

    function ruleToString(rule: microcode.RuleDefn): string {
        const parts: string[] = []
        if (rule.sensors.length) parts.push(tileToString(rule.sensors[0]))
        if (rule.filters.length) parts.push(tileToString(rule.filters[0]))
        if (rule.actuators.length) parts.push(tileToString(rule.actuators[0]))
        for (const mod of rule.modifiers) {
            parts.push(tileToString(mod))
        }
        return parts.join(",")
    }

    function pageToString(page: microcode.PageDefn): string {
        return page.rules.map(ruleToString).join(";")
    }

    export function unparseProgram(program: microcode.ProgramDefn): string {
        return program.pages.map(pageToString).join(" | ")
    }
}
