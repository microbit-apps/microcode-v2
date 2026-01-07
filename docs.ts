namespace docs {
    import Screen = user_interface_base.Screen
    import AppInterface = user_interface_base.AppInterface

    function imageToBuffer(img: Bitmap) {
        const w = img.width
        const h = img.height
        const buf = control.createBuffer(1 + w * h)
        let j = 0
        buf[j++] = w
        for (let x = 0; x < w; ++x) {
            for (let y = 0; y < h; ++y) {
                buf[j++] = img.getPixel(x, y)
            }
        }
        return buf
    }

    let app: AppInterface
    export function setup(theApp: AppInterface) {
        app = theApp
        _setup()
    }

    //% shim=TD_NOOP
    function _setup() {
        control.simmessages.onReceived("docs", (data: Buffer) => {
            const msg = JSON.parse(data.toString())
            if (msg.type === "art") _renderApp()
            else if (msg.type === "screenshot") _renderScreenshot()
        })
    }

    interface RenderedImage {
        type: "icon" | "sample" | "icon_sample" | "image" | "program"
        name: string
        pixels: string
    }

    //% shim=TD_NOOP
    function _renderApp() {
        const images: RenderedImage[] = []
        appendImage(images, "image", "home", screen())
        renderIcons(images)
        const samples = renderSamples(images)
        appendImage(images, "image", "microcode", microcode.wordLogo)
        // appendImage(images, "image", "microbit", microcode.microbitLogo)
        appendImage(
            images,
            "image",
            "editor_background",
            microcode.editorBackground
        )
        control.simmessages.send(
            "docs",
            Buffer.fromUTF8(
                JSON.stringify({
                    type: "art",
                    samples: samples.map(s => ({
                        label: s.label,
                        b64: s.b64,
                        icon: s.icon || "",
                    })),
                    images,
                })
            )
        )
    }

    function renderSamples(images: RenderedImage[]) {
        app.popScene()
        const samples = microcode.samples(false)
        for (const sample of samples) {
            console.log(`render sample ${sample.label}`)
            const icon = microcode.icons.get(sample.icon, true)
            if (icon) appendImage(images, "icon_sample", sample.label, icon)
            app.save(microcode.SAVESLOT_AUTO, sample.source)

            const res = _renderProgram()
            Object.keys(res).forEach(iname => {
                appendImage(
                    images,
                    "sample",
                    iname == "app" ? sample.label : `${sample.label}_${iname}`,
                    res[iname]
                )
            })

            app.popScene()
        }
        Screen.resetScreenImage()
        return samples
    }

    //% shim=TD_NOOP
    function _renderScreenshot() {
        const res = _renderProgram()
        const images: RenderedImage[] = []
        Object.keys(res).forEach(iname =>
            appendImage(
                images,
                "program",
                iname == "app" ? "current" : `current_${iname}`,
                res[iname]
            )
        )
        Screen.resetScreenImage()
        control.simmessages.send(
            "docs",
            Buffer.fromUTF8(
                JSON.stringify({
                    type: "art",
                    images,
                })
            )
        )
    }

    //% shim=TD_NOOP
    function _renderProgram(): { [name: string]: Bitmap } {
        const r: { [name: string]: Bitmap } = {}
        const loader = new microcode.Editor(app)
        // TODO: revisit rendering flag
        // loader.rendering = true
        app.pushScene(loader)
        loader.cursor.visible = false

        const pages = loader.nonEmptyPages()

        let imgs: Bitmap[] = []
        let w = 0
        let h = 0
        const margin = 4

        // compute largest rule width
        let pw = 160
        for (const p of pages) {
            loader.switchToPage(p)
            const rw = loader.ruleWidth()
            pw = Math.max(pw, rw)
        }
        // when the width is too large (>255?), bad things happen
        pw = Math.min(255, pw)

        // render all pages
        loader.nonEmptyPages().forEach(p => {
            loader.switchToPage(p)
            loader.pageEditor.layout()
            Screen.setImageSize(pw, loader.pageHeight())
            const editor = new microcode.Editor(app)
            // TODO: editor.rendering = true
            app.pushScene(editor)
            editor.cursor.visible = false
            pause(500)
            Screen.image.fill(editor.backgroundColor)
            editor.renderPage(p)
            const img = Screen.image.clone()
            imgs.push(img)
            w = Math.max(w, img.width)
            h += img.height + margin

            r[`page_${p + 1}`] = img

            // render individual rules
            const pageEditor = editor.pageEditor
            const rulesEditor = pageEditor.ruleEditors
            rulesEditor.forEach((ruleEditor, ri) => {
                const bound = ruleEditor.bounds
                const imgr = bitmaps.create(bound.width, bound.height)
                imgr.fill(loader.backgroundColor)
                imgr.blit(
                    0,
                    0,
                    bound.width,
                    bound.height,
                    img,
                    ruleEditor.xfrm.localPos.x - bound.left,
                    ruleEditor.xfrm.localPos.y - bound.top,
                    bound.width,
                    bound.height,
                    true,
                    false
                )
                r[`page_${p + 1}_rule_${ri + 1}`] = imgr
            })
            app.popScene()
        })

        const res = bitmaps.create(w, h)
        r["app"] = res
        res.fill(loader.backgroundColor)
        let y = 0
        for (let i = 0; i < imgs.length; ++i) {
            const img = imgs[i]
            res.drawTransparentBitmap(img, 0, y)
            y += img.height + margin
        }

        app.popScene()
        return r
    }

    function appendImage(
        images: RenderedImage[],
        type: "icon" | "sample" | "icon_sample" | "image" | "program",
        name: string | number,
        img: Bitmap
    ) {
        const newName =
            typeof name == "string"
                ? name
                : microcode.resolveTooltip("T" + name)
        const msg: RenderedImage = {
            type,
            name: newName.replaceAll(" ", "_").replaceAll(",", ""),
            pixels: imageToBuffer(img).toHex(),
        }
        images.push(msg)
    }

    function names() {
        return [
            "clap_lights",
            "firefly",
            "flashing_heart",
            "rock_paper_scissors",
            "teleport_duck",
            "pet_hamster",
            "heads_tails",
            "reaction_time",
            "hot_potato",
            "clap_lights",
            "railroad_crossing",
            microcode.Tid.TID_ACTUATOR_CAR,
            microcode.Tid.TID_MODIFIER_CAR_FORWARD,
            microcode.Tid.TID_MODIFIER_CAR_FORWARD_FAST,
            microcode.Tid.TID_MODIFIER_CAR_REVERSE,
            microcode.Tid.TID_MODIFIER_CAR_TURN_LEFT,
            microcode.Tid.TID_MODIFIER_CAR_TURN_RIGHT,
            microcode.Tid.TID_MODIFIER_CAR_STOP,
            microcode.Tid.TID_MODIFIER_CAR_SPIN_LEFT,
            microcode.Tid.TID_MODIFIER_CAR_SPIN_RIGHT,
            microcode.Tid.TID_MODIFIER_CAR_LED_COLOR_1,
            microcode.Tid.TID_MODIFIER_CAR_LED_COLOR_2,
            microcode.Tid.TID_MODIFIER_CAR_LED_COLOR_3,
            microcode.Tid.TID_MODIFIER_CAR_LED_COLOR_4,
            microcode.Tid.TID_MODIFIER_CAR_ARM_OPEN,
            microcode.Tid.TID_MODIFIER_CAR_ARM_CLOSE,
            microcode.Tid.TID_MODIFIER_ON,
            microcode.Tid.TID_MODIFIER_OFF,
            microcode.Tid.TID_SENSOR_CAR_WALL,
            microcode.Tid.TID_SENSOR_LINE,
            microcode.Tid.TID_FILTER_LINE_LEFT,
            microcode.Tid.TID_FILTER_LINE_RIGHT,
            microcode.Tid.TID_FILTER_LINE_BOTH,
            microcode.Tid.TID_FILTER_LINE_NEITHER,
            microcode.Tid.TID_FILTER_LINE_NEITHER_LEFT,
            microcode.Tid.TID_FILTER_LINE_NEITHER_RIGHT,
            microcode.Tid.TID_FILTER_KITA_KEY_1,
            microcode.Tid.TID_FILTER_KITA_KEY_2,
            microcode.Tid.TID_SENSOR_MAGNET,
            microcode.Tid.TID_SENSOR_SLIDER,
            microcode.Tid.TID_SENSOR_ROTARY,
            microcode.Tid.TID_FILTER_ROTARY_LEFT,
            microcode.Tid.TID_FILTER_ROTARY_RIGHT,
            microcode.Tid.TID_ACTUATOR_RGB_LED,
            microcode.Tid.TID_MODIFIER_RGB_LED_COLOR_1,
            microcode.Tid.TID_MODIFIER_RGB_LED_COLOR_2,
            microcode.Tid.TID_MODIFIER_RGB_LED_COLOR_3,
            microcode.Tid.TID_MODIFIER_RGB_LED_COLOR_4,
            microcode.Tid.TID_MODIFIER_RGB_LED_COLOR_5,
            microcode.Tid.TID_MODIFIER_RGB_LED_COLOR_6,
            microcode.Tid.TID_MODIFIER_RGB_LED_COLOR_RAINBOW,
            microcode.Tid.TID_MODIFIER_RGB_LED_COLOR_SPARKLE,
            microcode.Tid.TID_ACTUATOR_SERVO_SET_ANGLE,
            microcode.Tid.TID_ACTUATOR_RELAY,
            microcode.Tid.TID_ACTUATOR_SERVO_POWER,
            // editor icons
            "delete",
            "plus",
            "arith_plus",
            "arith_equals",
            "when_insertion_point",
            "do_insertion_point",
            "rule_arrow",
            "rule_handle",
            "edit_program",
            "new_program",
            "MISSING",
            "disk",
            "disk1",
            "disk2",
            "disk3",
            "largeDisk",
            // basic colors led editor
            "solid_red",
            "solid_black",
            "note_on",
            "note_off",
            "smiley_buttons",
            microcode.Tid.TID_SENSOR_START_PAGE,
            microcode.Tid.TID_ACTUATOR_SWITCH_PAGE,
            microcode.Tid.TID_MODIFIER_PAGE_1,
            microcode.Tid.TID_MODIFIER_PAGE_2,
            microcode.Tid.TID_MODIFIER_PAGE_3,
            microcode.Tid.TID_MODIFIER_PAGE_4,
            microcode.Tid.TID_MODIFIER_PAGE_5,
            // looping
            microcode.Tid.TID_MODIFIER_LOOP,

            // variables

            microcode.Tid.TID_SENSOR_CUP_X_WRITTEN,
            microcode.Tid.TID_SENSOR_CUP_Y_WRITTEN,
            microcode.Tid.TID_SENSOR_CUP_Z_WRITTEN,
            microcode.Tid.TID_FILTER_CUP_X_READ,
            microcode.Tid.TID_FILTER_CUP_Y_READ,
            microcode.Tid.TID_FILTER_CUP_Z_READ,
            microcode.Tid.TID_ACTUATOR_CUP_X_ASSIGN,
            microcode.Tid.TID_ACTUATOR_CUP_Y_ASSIGN,
            microcode.Tid.TID_ACTUATOR_CUP_Z_ASSIGN,
            microcode.Tid.TID_MODIFIER_CUP_X_READ,
            microcode.Tid.TID_MODIFIER_CUP_Y_READ,
            microcode.Tid.TID_MODIFIER_CUP_Z_READ,

            // numbers
            microcode.Tid.TID_MODIFIER_RANDOM_TOSS,
            microcode.Tid.TID_FILTER_COIN_1,
            microcode.Tid.TID_FILTER_COIN_2,
            microcode.Tid.TID_FILTER_COIN_3,
            microcode.Tid.TID_FILTER_COIN_4,
            microcode.Tid.TID_FILTER_COIN_5,
            microcode.Tid.TID_MODIFIER_COIN_1,
            microcode.Tid.TID_MODIFIER_COIN_2,
            microcode.Tid.TID_MODIFIER_COIN_3,
            microcode.Tid.TID_MODIFIER_COIN_4,
            microcode.Tid.TID_MODIFIER_COIN_5,

            // micro:bit sensors
            microcode.Tid.TID_SENSOR_ACCELEROMETER,
            microcode.Tid.TID_SENSOR_TIMER,
            microcode.Tid.TID_SENSOR_RADIO_RECEIVE,
            microcode.Tid.TID_SENSOR_PRESS,
            microcode.Tid.TID_SENSOR_RELEASE,
            microcode.Tid.TID_SENSOR_MICROPHONE,
            microcode.Tid.TID_SENSOR_TEMP,
            microcode.Tid.TID_SENSOR_LED_LIGHT,
            microcode.Tid.TID_SENSOR_LIGHT,
            microcode.Tid.TID_SENSOR_DISTANCE,
            microcode.Tid.TID_SENSOR_MOISTURE,
            microcode.Tid.TID_SENSOR_REFLECTED,

            // micro:bit filters
            microcode.Tid.TID_FILTER_LOGO,
            microcode.Tid.TID_FILTER_PIN_0,
            microcode.Tid.TID_FILTER_PIN_1,
            microcode.Tid.TID_FILTER_PIN_2,
            microcode.Tid.TID_FILTER_BUTTON_A,
            microcode.Tid.TID_FILTER_BUTTON_B,
            microcode.Tid.TID_FILTER_TIMESPAN_SHORT,
            microcode.Tid.TID_FILTER_TIMESPAN_LONG,
            microcode.Tid.TID_FILTER_TIMESPAN_VERY_LONG,
            microcode.Tid.TID_FILTER_TIMESPAN_RANDOM,
            microcode.Tid.TID_FILTER_LOUD,
            microcode.Tid.TID_FILTER_QUIET,
            microcode.Tid.TID_FILTER_UP,
            microcode.Tid.TID_FILTER_DOWN,
            microcode.Tid.TID_FILTER_ACCEL_SHAKE,
            microcode.Tid.TID_FILTER_ACCEL_TILT_UP,
            microcode.Tid.TID_FILTER_ACCEL_TILT_DOWN,
            microcode.Tid.TID_FILTER_ACCEL_TILT_LEFT,
            microcode.Tid.TID_FILTER_ACCEL_TILT_RIGHT,
            microcode.Tid.TID_FILTER_ACCEL_FACE_DOWN,
            microcode.Tid.TID_FILTER_ACCEL_FACE_UP,
            microcode.Tid.TID_FILTER_ON,
            microcode.Tid.TID_FILTER_OFF,

            // micro:bit actuators
            microcode.Tid.TID_ACTUATOR_PAINT,
            microcode.Tid.TID_ACTUATOR_SHOW_NUMBER,
            microcode.Tid.TID_ACTUATOR_RADIO_SEND,
            microcode.Tid.TID_ACTUATOR_RADIO_SET_GROUP,
            microcode.Tid.TID_ACTUATOR_SPEAKER,
            microcode.Tid.TID_ACTUATOR_MUSIC,

            // micro:bit modifiers
            microcode.Tid.TID_MODIFIER_ICON_EDITOR,
            microcode.Tid.TID_MODIFIER_MELODY_EDITOR,

            microcode.Tid.TID_MODIFIER_EMOJI_GIGGLE,
            microcode.Tid.TID_MODIFIER_EMOJI_HAPPY,
            microcode.Tid.TID_MODIFIER_EMOJI_HELLO,
            microcode.Tid.TID_MODIFIER_EMOJI_MYSTERIOUS,
            microcode.Tid.TID_MODIFIER_EMOJI_SAD,
            microcode.Tid.TID_MODIFIER_EMOJI_SLIDE,
            microcode.Tid.TID_MODIFIER_EMOJI_SOARING,
            microcode.Tid.TID_MODIFIER_EMOJI_SPRING,
            microcode.Tid.TID_MODIFIER_EMOJI_TWINKLE,
            microcode.Tid.TID_MODIFIER_EMOJI_YAWN,

            microcode.Tid.TID_MODIFIER_TEMP_READ,
            microcode.Tid.TID_MODIFIER_RADIO_READ,
        ]
    }

    function renderIcons(images: RenderedImage[]) {
        for (const name of names()) {
            console.log(`render icon ${name}`)
            const icon = microcode.icons.get(name)
            appendImage(images, `icon`, name, icon)
        }
    }
}
