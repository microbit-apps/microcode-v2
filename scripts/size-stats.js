const fs = require("fs")
const path = require("path")

const asmPath = process.argv[2] || path.join("built", "binary.asm")
const source = fs.readFileSync(asmPath, "utf8")
const lines = source.split(/\r?\n/)
const counts = new Map()
let nonFunctionLines = 0
let functions = 0

function addCount(file, count) {
    counts.set(file, (counts.get(file) || 0) + count)
}

function sourceFileFromFunctionLine(line) {
    let name = line.substring("; Function ".length)
    const paren = name.indexOf("(")
    if (paren >= 0) name = name.substring(0, paren)
    return name
}

function objectSymbol(start) {
    for (let i = start + 1; i < lines.length; i++) {
        if (lines[i].indexOf("; Function ") == 0) return undefined
        const match = /^\s*\.object\s+([A-Za-z0-9_.$]+)/.exec(lines[i])
        if (match) return match[1]
    }
    return undefined
}

for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.indexOf("; Function ") != 0) {
        nonFunctionLines++
        continue
    }

    const file = sourceFileFromFunctionLine(line)
    const symbol = objectSymbol(i)
    let end = i + 1
    if (symbol) {
        const endLabel = symbol + "_end:"
        for (; end < lines.length; end++) {
            if (lines[end] == endLabel) {
                end++
                break
            }
        }
    } else {
        while (end < lines.length && lines[end].indexOf("; Function ") != 0)
            end++
    }

    addCount(file, end - i)
    functions++
    i = end - 1
}

function bucketFor(file) {
    if (file.indexOf("user-interface-base/") == 0) return "user-interface-base"
    if (file.indexOf("hosted/") == 0) return "hosted"
    if (
        file == "apphost.ts" ||
        file == "styles.ts" ||
        file == "storage.ts" ||
        file == "field-editor-model.ts"
    )
        return "new-app-infra"
    if (file.indexOf("microgui/") == 0) return "microgui"
    if (
        file == "editor.ts" ||
        file == "ruleeditor.ts" ||
        file == "home.ts" ||
        file == "gallery.ts" ||
        file == "settings.ts" ||
        file == "navigator.ts" ||
        file == "fieldeditors.ts"
    )
        return "old-ui-app-files"
    return "other"
}

const buckets = new Map()
for (const [file, count] of counts) {
    const bucket = bucketFor(file)
    buckets.set(bucket, (buckets.get(bucket) || 0) + count)
}

console.log("Buckets")
for (const [bucket, count] of Array.from(buckets).sort((a, b) => b[1] - a[1]))
    console.log(count.toString().padStart(8), bucket)

console.log("")
console.log("Top files")
for (const [file, count] of Array.from(counts).sort((a, b) => b[1] - a[1]).slice(0, 80))
    console.log(count.toString().padStart(8), file)

console.log("")
console.log("Function lines", Array.from(counts.values()).reduce((a, b) => a + b, 0))
console.log("Non-function lines", nonFunctionLines)
console.log("Total asm lines", lines.length)
console.log("Functions", functions)
