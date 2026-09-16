// Generates icon-table.g.ts: table-driven, blob-packed icon storage replacing
// the if/else chains in icons.get (assets.ts) and jacdacImages.
//
// The mapping (tid -> icon, name -> icon) lives in scripts/icon-map.json.
// Icon pixel data is read from the bmp`` literals in assets.ts, encoded to
// the same F4 buffer format the compiler emits for bmp literals, and packed
// into a single hex literal (ICON_BLOB) with a u16 offset table. Bitmaps are
// materialized on demand via bitmaps.ofBuffer(blob.slice(...)) and cached.
//
// Icons whose icondb consts are referenced outside icons.get keep a const,
// emitted here as an eager iconByIndex() so assets.ts can drop the literal.
//
// Run: node scripts/genicontable.js
const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")
const map = JSON.parse(
    fs.readFileSync(path.join(__dirname, "icon-map.json"), "utf8"),
)
const assetsSrc = fs.readFileSync(path.join(root, "assets.ts"), "utf8")

// -- collect literals: icon-literals.json is the durable pixel store ---------
// Each entry is an array of row strings, one per pixel row, exactly as the
// MakeCode pixel editor prints them ("." = transparent, hex digit = color;
// spaces between characters are ignored). To add or edit an icon, paste the
// body of the img``/bmp`` literal here as quoted rows and rerun this script.
// A plain string with embedded newlines is accepted too. A bmp literal still
// present in assets.ts takes precedence and refreshes the store.
const litStore = path.join(__dirname, "icon-literals.json")
const toRows = v =>
    (Array.isArray(v) ? v : v.split("\n"))
        .map(r => r.trim())
        .filter(r => r.length > 0)
const literals = {}
{
    if (fs.existsSync(litStore)) {
        const stored = JSON.parse(fs.readFileSync(litStore, "utf8"))
        for (const [name, v] of Object.entries(stored))
            literals[name] = toRows(v).join("\n")
    }
    const re = /export const (\w+) = bmp`([^`]*)`/g
    let m
    while ((m = re.exec(assetsSrc))) literals[m[1]] = toRows(m[2]).join("\n")
    const out = {}
    for (const [name, v] of Object.entries(literals)) out[name] = v.split("\n")
    fs.writeFileSync(litStore, JSON.stringify(out, null, 1))
}

// -- F4 encoding, matching pxt's bmp literal output --------------------------
function encodeF4(lit) {
    const rows = lit
        .split("\n")
        .map(r => r.replace(/\s+/g, ""))
        .filter(r => r.length > 0)
    const w = Math.max(...rows.map(r => r.length))
    const h = rows.length
    // column stride is padded to a 32-bit boundary, matching pxt's F4 layout
    const colBytes = ((h * 4 + 31) >> 5) << 2
    const buf = Buffer.alloc(8 + colBytes * w)
    buf[0] = 0x87
    buf[1] = 4
    buf.writeUInt16LE(w, 2)
    buf.writeUInt16LE(h, 4)
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const ch = rows[y][x] || "."
            const v = ch === "." ? 0 : parseInt(ch, 16)
            const off = 8 + x * colBytes + (y >> 1)
            if (y & 1) buf[off] |= v << 4
            else buf[off] |= v
        }
    }
    return buf
}

// -- registry: unique symbols, blob-backed first, extern last ---------------
// extern = resolved from an existing const instead of blob data:
//   - procedurally drawn icons (no bmp literal; const stays in assets.ts)
//   - icons whose pixels match a ui-core icon (the package ships its own
//     copy, so packing them into the blob would duplicate flash data)
const mappedSyms = new Set([
    ...Object.values(map.tidMap),
    ...Object.values(map.nameMap),
])
const uiByContent = new Map()
{
    const uiSrc = fs.readFileSync(
        path.join(root, "pxt_modules/ui-core/icons.ts"),
        "utf8",
    )
    for (const m of uiSrc.matchAll(/export const (\w+) = bmp`([^`]*)`/g))
        uiByContent.set(encodeF4(m[2]).toString("hex"), m[1])
}
const externExpr = new Map()
for (const sym of mappedSyms) {
    if (!literals[sym]) externExpr.set(sym, "icondb." + sym)
    else {
        const twin = uiByContent.get(encodeF4(literals[sym]).toString("hex"))
        if (twin) externExpr.set(sym, "ui." + twin)
    }
}
const blobSyms = [...mappedSyms].filter(s => !externExpr.has(s))
const externSyms = [...mappedSyms].filter(s => externExpr.has(s))
const registry = [...blobSyms, ...externSyms]
const symIndex = new Map(registry.map((s, i) => [s, i]))
const indexOf = sym => symIndex.get(sym)
const tidTable = new Array(256).fill(0)
for (const t of Object.keys(map.tidMap)
    .map(Number)
    .sort((a, b) => a - b))
    tidTable[t] = indexOf(map.tidMap[t]) + 1
const names = Object.keys(map.nameMap)
const nameIdx = names.map(n => indexOf(map.nameMap[n]))
if (registry.length > 255) throw new Error("registry exceeds u8 index range")

// -- pack blob: identical pixel data shares one slot (pxt dedupes hexlits,
// so the blob must dedupe too or it comes out larger than what it replaces)
const chunks = []
const offsets = []
const contentOff = new Map()
let off = 0
for (const sym of blobSyms) {
    const b = encodeF4(literals[sym])
    const key = b.toString("hex")
    if (contentOff.has(key)) {
        offsets.push(contentOff.get(key))
        continue
    }
    contentOff.set(key, off)
    offsets.push(off)
    chunks.push(b)
    off += b.length
}
const blob = Buffer.concat(chunks)
const offBuf = Buffer.alloc(2 * offsets.length)
offsets.forEach((o, i) => offBuf.writeUInt16LE(o, 2 * i))
if (off > 0xffff) throw new Error("blob exceeds u16 offset range")

// -- which blob symbols still need an icondb const ---------------------------
// any icondb.<sym> reference outside its own (removed) literal definition
const keep = new Set()
{
    // only files actually compiled into the build matter
    const pxtJson = JSON.parse(
        fs.readFileSync(path.join(root, "pxt.json"), "utf8"),
    )
    const tsFiles = pxtJson.files
        .filter(f => f.endsWith(".ts") && f !== "icon-table.g.ts")
        .map(f => path.join(root, f))
    for (const p of tsFiles) {
        let src = fs.readFileSync(p, "utf8")
        if (path.basename(p) === "assets.ts")
            src = src.replace(/export const \w+ = bmp`[^`]*`/g, "")
        for (const m of src.matchAll(/icondb\.(\w+)/g))
            if (symIndex.has(m[1])) keep.add(m[1])
    }
}

const toHex = b => b.toString("hex")
const out = `// AUTO-GENERATED by scripts/genicontable.js -- do not edit.
// Mapping source of truth: scripts/icon-map.json
namespace microcode {
    // F4-encoded icon bitmaps, packed back to back
    const ICON_BLOB = hex\`${toHex(blob)}\`
    // u16le start offset of each icon in ICON_BLOB (duplicates share a slot)
    const ICON_OFF = hex\`${toHex(offBuf)}\`

    // tid -> (icon index + 1); 0 = no icon for that tid
    export const TID_ICON_IDX = hex\`${tidTable.map(v => v.toString(16).padStart(2, "0")).join("")}\`
    // icon index for each entry of ICON_NAMES
    export const ICON_NAME_IDX = hex\`${nameIdx.map(v => v.toString(16).padStart(2, "0")).join("")}\`
    export const ICON_NAMES = "${names.join(",")}".split(",")

    const ICON_BLOB_COUNT = ${blobSyms.length}
    const iconCache: Bitmap[] = []
    export function iconByIndex(idx: number): Bitmap {
        let bmp = iconCache[idx]
        if (!bmp) {
            if (idx < ICON_BLOB_COUNT) {
                const start = ICON_OFF.getNumber(
                    NumberFormat.UInt16LE,
                    idx * 2,
                )
                // F4 buffer size from its own header: 8-byte header plus
                // w columns of h nibbles padded to a 32-bit boundary
                const w = ICON_BLOB.getNumber(
                    NumberFormat.UInt16LE,
                    start + 2,
                )
                const h = ICON_BLOB.getNumber(
                    NumberFormat.UInt16LE,
                    start + 4,
                )
                const size = 8 + (((h * 4 + 31) >> 5) << 2) * w
                bmp = bitmaps.ofBuffer(ICON_BLOB.slice(start, size))
            } else {
                bmp = externIcon(idx - ICON_BLOB_COUNT)
            }
            iconCache[idx] = bmp
        }
        return bmp
    }

    // icons drawn procedurally at startup rather than stored in the blob
    function externIcon(i: number): Bitmap {
${externSyms
    .map((sym, i) => `        if (i == ${i}) return ${externExpr.get(sym)}`)
    .join("\n")}
        return ui.MISSING
    }
}

// consts still referenced directly by other code
namespace icondb {
${registry
    .map((sym, i) =>
        // procedural icons (no literal) still have their const in assets.ts
        keep.has(sym) && literals[sym]
            ? `    export const ${sym} = microcode.iconByIndex(${i})`
            : null,
    )
    .filter(Boolean)
    .join("\n")}
}
`
fs.writeFileSync(path.join(root, "icon-table.g.ts"), out)
fs.writeFileSync(
    path.join(__dirname, "icon-blob-syms.json"),
    JSON.stringify(registry, null, 2),
)
console.log(
    `blob: ${registry.length} icons, ${blob.length} bytes; ` +
        `${names.length} names; kept consts: ${[...keep].join(", ")}`,
)
