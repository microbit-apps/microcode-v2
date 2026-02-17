console.debug(`loading custom sim support...`)
const MICROCODE_PRODUCT_IDENTIFIER = 0x3e92f825

const inIFrame = (() => {
    try {
        return typeof window !== "undefined" && window.self !== window.top
    } catch (e) {
        return typeof window !== "undefined"
    }
})()

const stringFormat = (s, args) => s.replace(/{(\w+)}/g, (_, id) => args[id])

function simPostMessage(channel, data) {
    const frame = document.getElementById("simframe")
    if (frame) {
        const buf = stringToUint8Array(JSON.stringify(data))
        const msg = {
            type: "messagepacket",
            channel,
            data: buf,
        }
        frame.contentWindow.postMessage(msg, document.body.dataset.simUrl)
    }
}

// docs
document.addEventListener("DOMContentLoaded", async () => {
    const build = document.body.dataset["build"] || "local"

    // initLang()
    // await loadTranslations(build)

    const docsbtn = document.getElementById("docsbtn")
    if (docsbtn)
        docsbtn.onclick = () => {
            docsbtn.disabled = true
            simPostMessage("docs", { type: "art" })
        }

    makeCodeRun({
        js: `./js/binary.js?v=${build}`,
    })
})

// handle accessibility requests
function uint8ArrayToString(input) {
    let len = input.length
    let res = ""
    for (let i = 0; i < len; ++i) res += String.fromCharCode(input[i])
    return res
}
function stringToUint8Array(str) {
    const encoder = new TextEncoder()
    return encoder.encode(str)
}

let liveRegion
let tooltipStrings = {}

async function fetchJSON(url) {
    const resp = await fetch(url)
    if (!resp.ok) return undefined
    return await resp.json()
}

function parseSemver(v) {
    const ver = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(v)
    if (ver) return [parseInt(ver[1]), parseInt(ver[2]), parseInt(ver[3])]
    else return [0, 0, 0]
}

function hexToUint8Array(hex) {
    const bytes = new Uint8Array(Math.ceil(hex.length / 2))
    for (let i = 0; i < bytes.length; i++)
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
    return bytes
}

async function delay(ms = 100) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

const palette = [
    "#000000",
    "#ffffff",
    "#ff2121",
    "#ff93c4",
    "#ff8135",
    "#fff609",
    "#249ca3",
    "#78dc52",
    "#003fad",
    "#87f2ff",
    "#8e2ec4",
    "#a4839f",
    "#5c406c",
    "#e5cdc4",
    "#91463d",
    "#000000",
]
function imgToPng(hex) {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const pixels = hexToUint8Array(hex)
    const w = pixels[0]
    const h = (pixels.length - 1) / w
    const f = 2
    canvas.width = w * 2
    canvas.height = h * 2
    let j = 1
    for (let x = 0; x < w; ++x) {
        for (let y = 0; y < h; ++y) {
            const c = pixels[j++]
            if (c > 0) {
                ctx.fillStyle = palette[c]
                ctx.fillRect(x * f, y * f, f, f)
            } else {
                ctx.clearRect(x * f, y * f, f, f)
            }
        }
    }
    const png = canvas.toDataURL("image/png")
    return png
}

const norm = s => s.replace(/,/g, "_").replace(/\/s+/g, "_").replace(/_+/g, "_")

addSimMessageHandler("docs", async data => {
    const msg = JSON.parse(uint8ArrayToString(data))

    if (msg.type === "art") showArt(msg.images, msg.samples)
})

function showArt(jsg, samples) {
    const container = document.createElement("dialog")
    container.classList.add("art")
    const form = document.createElement("form")
    form.setAttribute("method", "dialog")
    container.append(form)
    const buttons = document.createElement("div")
    form.append(buttons)

    const button = document.createElement("button")
    button.innerText = "save"
    button.onclick = async () => {
        const dir = await window.showDirectoryPicker({ mode: "readwrite" })
        if (!dir) return
        await Promise.all(
            jsg.map(async ({ type, name, pixels }) => {
                const png = imgToPng(pixels)
                // render image as datauri
                if (type === "image") {
                    const fn = norm(`${type}_${name}.datauri.txt`)
                    const file = await dir.getFileHandle(fn, { create: true })
                    const writable = await file.createWritable({
                        keepExistingData: false,
                    })
                    await writable.write(png)
                    await writable.close()
                }
                // render native format
                {
                    const blob = await (await fetch(png)).blob()
                    const fn = norm(`${type}_${name}.png`)
                    const file = await dir.getFileHandle(fn, { create: true })
                    const writable = await file.createWritable({
                        keepExistingData: false,
                    })
                    await writable.write(blob)
                    await writable.close()
                }
            }),
        )
        // markdown samples
        const mds = `# Samples
${samples
    .map(
        ({ label, b64, icon }) => `
## ${label}

${
    icon
        ? `-   ![${label} icon](./images/generated/icon_sample_${norm(
              label,
          )}.png){:class="icon-sample"}`
        : ""
}
-   [Open in MicroCode](/microcode/#${compressProgram(b64)})

`,
    )
    .join("\n")}
`
        await writeText(dir, "samples.md", mds)
        // markdown docs
        const md = `## Tiles
${jsg
    .filter(({ type }) => type === "icon")
    .sort(({ name }) => name)
    .map(
        ({ type, name }) => `
### ![${mapAriaId(name)}](./images/generated/${norm(
            `${type}_${name}`,
        )}.png){:class="icon"} \`${mapAriaId(name)}\` {#${norm(
            `${type}_${name}`,
        )}}

- ${type}

`,
    )
    .join("")}`
        await writeText(dir, "reference.md", md)
        window.location.reload()
    }
    buttons.append(button)

    const close = document.createElement("button")
    close.innerText = "close"
    close.onclick = () => container.close()
    buttons.append(close)

    jsg.forEach(({ type, name, pixels }) => {
        const fn = norm(`${type}_${name}`)
        if (!pixels) {
            console.error(`${fn} missing pixels`)
            return
        }
        const png = imgToPng(pixels)
        const img = document.createElement("img")
        img.src = png
        img.alt = fn
        img.title = name
        const a = document.createElement("a")
        a.setAttribute("href", png)
        a.setAttribute("download", `${fn}.png`)
        a.append(img)

        form.append(a)
    })

    document.body.append(container)
    container.showModal()

    async function writeText(dir, fn, content) {
        const file = await dir.getFileHandle(fn, { create: true })
        const writable = await file.createWritable({
            keepExistingData: false,
        })
        await writable.write(content)
        await writable.close()
    }
}

function trackEvent(name, props) {
    const appInsights = window.appInsights
    if (!appInsights) return

    const properties = props || {}
    properties["version"] = document.body.dataset.version
    properties["lang"] = editorLang
    // console.debug(msg.msg, { properties })
    appInsights.trackEvent({
        name,
        properties,
    })
}
