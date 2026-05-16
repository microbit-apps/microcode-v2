const fs = require("fs")
const os = require("os")
const path = require("path")

const projectRoot = path.resolve(__dirname, "..")
const cacheRoots = []

function addCacheRoot(root) {
    if (!root) return
    const resolved = path.resolve(root)
    if (cacheRoots.indexOf(resolved) < 0) cacheRoots.push(resolved)
}

if (process.env.PXT_CACHE_DIR) {
    addCacheRoot(process.env.PXT_CACHE_DIR)
} else {
    addCacheRoot(path.join(os.homedir(), ".pxt", "mkc-cache"))
    addCacheRoot(path.join(projectRoot, ".pxt", "mkc-cache"))
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function isGitHubSpec(spec) {
    return typeof spec == "string" && spec.indexOf("github:") == 0
}

function cacheNameForGitHubSpec(spec) {
    const ref = spec.substring("github:".length)
    let encoded = ""
    for (let i = 0; i < ref.length; i++) {
        const ch = ref.charAt(i)
        if (
            (ch >= "a" && ch <= "z") ||
            (ch >= "A" && ch <= "Z") ||
            (ch >= "0" && ch <= "9") ||
            ch == "-" ||
            ch == "_" ||
            ch == "."
        ) {
            encoded += ch
        } else {
            encoded += "_" + ref.charCodeAt(i) + "_"
        }
    }
    return "c-gh-pkg-" + encoded
}

function findLocalPackageRoot(name, dependentRoot) {
    const candidates = [
        path.join(dependentRoot, "pxt_modules", name),
        path.join(projectRoot, "pxt_modules", name),
    ]

    for (const candidate of candidates) {
        if (
            fs.existsSync(path.join(candidate, "pxt.json")) &&
            fs.lstatSync(candidate).isSymbolicLink()
        ) {
            return candidate
        }
    }

    return undefined
}

function pxtFileNames(pxt) {
    const seen = {}
    const names = ["pxt.json"]
    const add = name => {
        if (!name || seen[name]) return
        seen[name] = true
        names.push(name)
    }

    ;(pxt.files || []).forEach(add)
    return names
}

function packPackage(root) {
    const pxt = readJson(path.join(root, "pxt.json"))
    const files = {}
    const names = pxtFileNames(pxt)

    for (const name of names) {
        files[name] = fs.readFileSync(path.join(root, name), "utf8")
    }

    return { pxt, blob: { files }, count: names.length }
}

function writeCacheBlob(cachePath, blob) {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true })
    if (fs.existsSync(cachePath) && !fs.existsSync(cachePath + ".remote")) {
        fs.copyFileSync(cachePath, cachePath + ".remote")
    }
    fs.writeFileSync(cachePath, JSON.stringify(blob))
}

function writeCacheBlobs(cacheName, blob) {
    const paths = []
    for (let i = 0; i < cacheRoots.length; i++) {
        const cachePath = path.join(cacheRoots[i], cacheName)
        writeCacheBlob(cachePath, blob)
        paths.push(cachePath)
    }
    return paths
}

function syncDependency(name, spec, dependentRoot, synced) {
    if (!isGitHubSpec(spec)) return

    const cacheName = cacheNameForGitHubSpec(spec)
    if (synced[cacheName]) return

    const localRoot = findLocalPackageRoot(name, dependentRoot)
    if (!localRoot) return

    const packed = packPackage(localRoot)
    const cachePaths = writeCacheBlobs(cacheName, packed.blob)
    synced[cacheName] = true

    console.log(
        name +
            " -> " +
            cachePaths.join(", ") +
            " (" +
            packed.count +
            " files from " +
            localRoot +
            ")"
    )

    const dependencies = packed.pxt.dependencies || {}
    Object.keys(dependencies).forEach(childName => {
        syncDependency(childName, dependencies[childName], localRoot, synced)
    })
}

function main() {
    const pxt = readJson(path.join(projectRoot, "pxt.json"))
    const dependencies = pxt.dependencies || {}
    const synced = {}

    console.log("cache roots: " + cacheRoots.join(", "))

    Object.keys(dependencies).forEach(name => {
        syncDependency(name, dependencies[name], projectRoot, synced)
    })

    const count = Object.keys(synced).length
    console.log("synced " + count + " local PXT package cache blob(s)")
}

main()
