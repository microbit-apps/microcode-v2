namespace microcode {
    let extraImage: Bitmap = null

    //% shim=TD_NOOP
    function extraSamples(name: string | number) {
        if (name == "clap_lights") extraImage = icondb.sampleClapLights
        if (name == "firefly") extraImage = icondb.sampleFirefly
        if (name == "flashing_heart") extraImage = icondb.sampleFlashingHeart
        // if (name == "dice") extraImage = icondb.sampleDice  // nice icon, don't delete, but not currently used
        if (name == "rock_paper_scissors")
            extraImage = icondb.sampleRockPaperScissors
        if (name == "teleport_duck") extraImage = icondb.sampleTeleportDuck
        if (name == "pet_hamster") extraImage = icondb.samplePetHamster
        if (name == "heads_tails") extraImage = icondb.sampleHeadsOrTails
        if (name == "reaction_time") extraImage = icondb.sampleReactionTime
        if (name == "hot_potato") extraImage = icondb.sampleHotPotato
        if (name == "clap_lights") extraImage = icondb.sampleClapLights
        if (name == "railroad_crossing")
            extraImage = icondb.sampleRailCrossingLight
    }

    // TODO: factor out all the jacdac stuff into separate file/class
    // TODO: so we can generate different builds
    function jacdacImages(name: string | number) {
        if (name == Tid.TID_FILTER_KITA_KEY_1) return icondb.kita_key_1
        if (name == Tid.TID_FILTER_KITA_KEY_2) return icondb.kita_key_2
        if (name == Tid.TID_SENSOR_SLIDER) return icondb.kita_slider
        if (name == Tid.TID_SENSOR_ROTARY) return icondb.kita_rotary
        if (name == Tid.TID_FILTER_ROTARY_LEFT) return icondb.kita_rotary_left
        if (name == Tid.TID_FILTER_ROTARY_RIGHT) return icondb.kita_rotary_right
        if (name == Tid.TID_ACTUATOR_RGB_LED) return icondb.rgbLed
        if (name == Tid.TID_MODIFIER_RGB_LED_COLOR_1)
            return icondb.tile_color_red
        if (name == Tid.TID_MODIFIER_RGB_LED_COLOR_2)
            return icondb.tile_color_green
        if (name == Tid.TID_MODIFIER_RGB_LED_COLOR_3)
            return icondb.tile_color_blue
        if (name == Tid.TID_MODIFIER_RGB_LED_COLOR_4)
            return icondb.tile_color_magenta
        if (name == Tid.TID_MODIFIER_RGB_LED_COLOR_5)
            return icondb.tile_color_yellow
        if (name == Tid.TID_MODIFIER_RGB_LED_COLOR_6)
            return icondb.tile_color_black
        if (name == Tid.TID_MODIFIER_RGB_LED_COLOR_RAINBOW)
            return icondb.tile_rainbow
        if (name == Tid.TID_MODIFIER_RGB_LED_COLOR_SPARKLE)
            return icondb.tile_sparkle
        if (name == Tid.TID_ACTUATOR_SERVO_SET_ANGLE)
            return icondb.servo_set_angle
        if (name == Tid.TID_ACTUATOR_SERVO_POWER) return icondb.servo_power
        if (name == Tid.TID_ACTUATOR_RELAY) return icondb.relay
        if (name == Tid.TID_SENSOR_LIGHT) return icondb.light_sensor
        if (name == Tid.TID_SENSOR_DISTANCE) return icondb.distance_sensor
        if (name == Tid.TID_SENSOR_MOISTURE) return icondb.soil_moisture
        if (name == Tid.TID_SENSOR_REFLECTED)
            return icondb.reflected_light_sensor
        return null
    }

    export class icons {
        public static get(
            name: string | number,
            nullIfMissing = false,
        ): Bitmap {
            // editor icons
            if (name == "delete") return icondb.btn_delete
            if (name == "plus") return icondb.btn_plus
            // TODO: add ops and comparisons
            if (name == "when_insertion_point")
                return icondb.btn_when_insertion_point
            if (name == "do_insertion_point")
                return icondb.btn_do_insertion_point
            if (name == "rule_arrow") return icondb.rule_arrow
            if (name == "rule_handle") return icondb.rule_handle
            if (name == "rule_up") return icondb.temp_warmer
            if (name == "rule_down") return icondb.temp_colder
            if (name == "edit_program") return icondb.largeEditIcon
            if (name == "largeSettingsGear") return icondb.largeSettingsGear
            if (name == "new_program") return icondb.largeNewProgramIcon
            if (name == "MISSING") return icondb.MISSING
            if (name == "disk") return icondb.disk
            if (name == "disk1") return icondb.disk1
            if (name == "disk2") return icondb.disk2
            if (name == "disk3") return icondb.disk3
            if (name == "largeDisk") return icondb.largeDiskIcon

            // basic colors led editor
            if (name == "solid_red") return icondb.solid_red
            if (name == "led_off") return icondb.led_off
            if (name == "note_on") return icondb.note_on
            if (name == "note_off") return icondb.note_off

            // sample icons
            if (name == "smiley_buttons") return icondb.sampleSmileyButtons

            if (name == "microbitLogo") return icondb.microbitLogo
            if (name == "microbit_logo") return icondb.microbit_logo
            if (name == "microbitLogoBtn") return icondb.microbit_logo_btn

            // math
            if (typeof name == "number") {
                if (microcode.isConstant(name)) {
                    return icondb.numberToImage(getParam(name))
                }
            }

            // pages
            if (name == Tid.TID_SENSOR_START_PAGE) return icondb.tile_start_page
            if (name == Tid.TID_ACTUATOR_SWITCH_PAGE)
                return icondb.tile_switch_page
            if (name == Tid.TID_MODIFIER_PAGE_1) return icondb.tile_page_1
            if (name == Tid.TID_MODIFIER_PAGE_2) return icondb.tile_page_2
            if (name == Tid.TID_MODIFIER_PAGE_3) return icondb.tile_page_3
            if (name == Tid.TID_MODIFIER_PAGE_4) return icondb.tile_page_4
            if (name == Tid.TID_MODIFIER_PAGE_5) return icondb.tile_page_5

            // looping
            if (name == Tid.TID_MODIFIER_LOOP) return icondb.loop

            // variables
            if (name == Tid.TID_SENSOR_MAGNET) return icondb.magnet
            if (name == Tid.TID_SENSOR_CUP_X_WRITTEN) return icondb.cupXwritten
            if (name == Tid.TID_SENSOR_CUP_Y_WRITTEN) return icondb.cupYwritten
            if (name == Tid.TID_SENSOR_CUP_Z_WRITTEN) return icondb.cupZwritten
            if (name == Tid.TID_FILTER_CUP_X_READ) return icondb.cupXread
            if (name == Tid.TID_FILTER_CUP_Y_READ) return icondb.cupYread
            if (name == Tid.TID_FILTER_CUP_Z_READ) return icondb.cupZread
            if (name == Tid.TID_ACTUATOR_CUP_X_ASSIGN) return icondb.cupXassign
            if (name == Tid.TID_ACTUATOR_CUP_Y_ASSIGN) return icondb.cupYassign
            if (name == Tid.TID_ACTUATOR_CUP_Z_ASSIGN) return icondb.cupZassign
            if (name == Tid.TID_MODIFIER_CUP_X_READ) return icondb.cupXread
            if (name == Tid.TID_MODIFIER_CUP_Y_READ) return icondb.cupYread
            if (name == Tid.TID_MODIFIER_CUP_Z_READ) return icondb.cupZread

            // function
            if (name == Tid.TID_MODIFIER_RANDOM_TOSS) return icondb.diceToss
            // micro:bit sensors
            if (name == Tid.TID_SENSOR_ACCELEROMETER)
                return icondb.accelerometer
            if (name == Tid.TID_SENSOR_TIMER) return icondb.tile_timer
            if (name == Tid.TID_SENSOR_RADIO_RECEIVE)
                return icondb.radio_receive
            if (name == Tid.TID_SENSOR_PRESS) return icondb.finger_press
            if (name == Tid.TID_SENSOR_RELEASE) return icondb.finger_release
            if (name == Tid.TID_SENSOR_MICROPHONE) return icondb.microphone
            if (name == Tid.TID_SENSOR_TEMP) return icondb.thermometer
            if (name == Tid.TID_SENSOR_LED_LIGHT) return icondb.led_light_sensor

            // micro:bit filters
            if (name == Tid.TID_FILTER_LOGO) return icondb.microbit_logo
            if (name == Tid.TID_FILTER_PIN_0) return icondb.tile_pin_0
            if (name == Tid.TID_FILTER_PIN_1) return icondb.tile_pin_1
            if (name == Tid.TID_FILTER_PIN_2) return icondb.tile_pin_2
            if (name == Tid.TID_FILTER_BUTTON_A) return icondb.tile_button_a
            if (name == Tid.TID_FILTER_BUTTON_B) return icondb.tile_button_b
            if (name == Tid.TID_FILTER_TIMESPAN_SHORT)
                return icondb.tile_timespan_short
            if (name == Tid.TID_FILTER_TIMESPAN_LONG)
                return icondb.tile_timespan_long
            if (name == Tid.TID_FILTER_TIMESPAN_VERY_LONG)
                return icondb.tile_timespan_fiveSeconds
            if (name == Tid.TID_FILTER_TIMESPAN_RANDOM)
                return icondb.tile_timespan_random
            if (name == Tid.TID_FILTER_LOUD) return icondb.speakerFun
            if (name == Tid.TID_FILTER_QUIET) return icondb.speakerSoft
            if (name == Tid.TID_FILTER_UP) return icondb.temp_warmer
            if (name == Tid.TID_FILTER_DOWN) return icondb.temp_colder
            if (name == Tid.TID_FILTER_ACCEL_SHAKE) return icondb.moveShake
            if (name == Tid.TID_FILTER_ACCEL_TILT_UP) return icondb.moveTiltUp
            if (name == Tid.TID_FILTER_ACCEL_TILT_DOWN)
                return icondb.moveTiltDown
            if (name == Tid.TID_FILTER_ACCEL_TILT_LEFT)
                return icondb.moveTiltLeft
            if (name == Tid.TID_FILTER_ACCEL_TILT_RIGHT)
                return icondb.moveTiltRight
            if (name == Tid.TID_FILTER_ACCEL_FACE_UP) return icondb.moveFaceUp
            if (name == Tid.TID_FILTER_ACCEL_FACE_DOWN)
                return icondb.moveFaceDown

            // micro:bit actuators
            if (name == Tid.TID_ACTUATOR_PAINT) return icondb.showScreen
            if (name == Tid.TID_ACTUATOR_SHOW_NUMBER) return icondb.showNumber
            if (name == Tid.TID_ACTUATOR_RADIO_SEND) return icondb.radio_send
            if (name == Tid.TID_ACTUATOR_RADIO_SET_GROUP)
                return icondb.radio_set_group_small
            if (name == Tid.TID_ACTUATOR_SPEAKER) return icondb.speakerFun
            if (name == Tid.TID_ACTUATOR_MUSIC) return icondb.music

            // micro:bit modifiers
            if (name == Tid.TID_MODIFIER_ICON_EDITOR) return icondb.iconEditor
            if (name == Tid.TID_MODIFIER_MELODY_EDITOR)
                return icondb.melodyEditor
            if (
                name == Tid.TID_DECIMAL_EDITOR ||
                name == Tid.TID_POS_INT_EDITOR
            )
                return icondb.decimalEditor

            if (name == Tid.TID_MODIFIER_EMOJI_GIGGLE) return icondb.soundGiggle
            if (name == Tid.TID_MODIFIER_EMOJI_HAPPY) return icondb.soundHappy
            if (name == Tid.TID_MODIFIER_EMOJI_HELLO) return icondb.soundHello
            if (name == Tid.TID_MODIFIER_EMOJI_MYSTERIOUS)
                return icondb.soundMysterious
            if (name == Tid.TID_MODIFIER_EMOJI_SAD) return icondb.soundSad
            if (name == Tid.TID_MODIFIER_EMOJI_SLIDE) return icondb.soundSlide
            if (name == Tid.TID_MODIFIER_EMOJI_SOARING)
                return icondb.soundSoaring
            if (name == Tid.TID_MODIFIER_EMOJI_SPRING) return icondb.soundSpring
            if (name == Tid.TID_MODIFIER_EMOJI_TWINKLE)
                return icondb.soundTwinkle
            if (name == Tid.TID_MODIFIER_EMOJI_YAWN) return icondb.soundYawn

            if (name == Tid.TID_MODIFIER_TEMP_READ) return icondb.thermometer
            if (name == Tid.TID_MODIFIER_RADIO_READ) return icondb.radio_value
            if (name == Tid.TID_MODIFIER_LIGHT_READ) return icondb.light_sensor
            if (name == Tid.TID_MODIFIER_MAGNET_READ) return icondb.magnet
            if (name == Tid.TID_MODIFIER_MIC_READ) return icondb.microphone
            if (name == Tid.TID_MODIFIER_CAR_WALL_READ) return icondb.car_wall

            // operators

            if (name == Tid.TID_OPERATOR_DIVIDE) return icondb.operatorIcon("/")
            if (name == Tid.TID_OPERATOR_MINUS) return icondb.operatorIcon("-")
            if (name == Tid.TID_OPERATOR_MULTIPLY)
                return icondb.operatorIcon("*")
            if (name == Tid.TID_OPERATOR_PLUS) return icondb.operatorIcon("+")
            if (name == Tid.TID_COMPARE_EQ) return icondb.eq
            if (name == Tid.TID_COMPARE_NEQ) return icondb.neq
            if (name == Tid.TID_COMPARE_LT) return icondb.lt
            if (name == Tid.TID_COMPARE_LTE) return icondb.lte
            if (name == Tid.TID_COMPARE_GT) return icondb.gt
            if (name == Tid.TID_COMPARE_GTE) return icondb.gte

            // micro:bit car
            if (CAR_TILES) {
                const car = carImages(name)
                if (car) return car
            }
            // const jacdac = jacdacImages(name)
            // if (jacdac) return jacdac
            extraImage = null
            extraSamples(name) // only for web app
            if (extraImage) return extraImage
            if (nullIfMissing) return null
            return icondb.MISSING
        }
    }
}

namespace icondb {
    export const lt = bitmaps.create(11, 11)
    lt.drawLine(2, 5, 8, 2, 15)
    lt.drawLine(2, 5, 8, 8, 15)

    export const gt = lt.clone()
    gt.flipX()

    export const lte = lt.clone()
    lte.scroll(0, -1)
    lte.drawLine(0, 10, 10, 10, 0)
    lte.drawLine(2, 7, 8, 10, 15)

    export const gte = lte.clone()
    gte.flipX()

    export const eq = bitmaps.create(11, 11)
    eq.drawLine(2, 4, 8, 4, 15)
    eq.drawLine(2, 6, 8, 6, 15)

    export const neq = eq.clone()
    neq.drawLine(8, 2, 3, 8, 15)

    // TODO: is it worth caching these?
    export function operatorIcon(op: string) {
        const img = bitmaps.create(11, 11)
        img.fill(0)
        img.print(op, 3, 1, 15)
        return img
    }

    const note4x3 = bmp`
    . f f .
    f c c .
    f c c .
`
    export function melodyToImage(melody: microcode.Melody) {
        const ret = bitmaps.create(16, 16)
        ret.fill(1)
        for (let col = 0; col < microcode.MELODY_LENGTH; col++) {
            if (melody.notes[col] === ".") continue
            const row = microcode.NUM_NOTES - 1 - parseInt(melody.notes[col])
            const color = 15
            const ncol = col << 2,
                nrow = row * 3 + 1
            ret.drawTransparentBitmap(note4x3, ncol, nrow)
        }
        return ret
    }

    // - upscale 5x5 image to 16 x 16, add halo
    export function renderMicrobitLEDs(led55: Bitmap) {
        const ret = bitmaps.create(16, 16)
        ret.fill(15)
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const on = led55.getPixel(row, col)
                if (!on) continue

                const color = 0x2
                const halo = 0xe
                const nrow = 1 + row * 3,
                    ncol = 1 + col * 3
                ret.setPixel(nrow, ncol, color)
                ret.setPixel(nrow + 1, ncol, color)
                ret.setPixel(nrow, ncol + 1, color)
                ret.setPixel(nrow + 1, ncol + 1, color)
            }
        }
        return ret
    }

    function renderImg(i: Bitmap) {
        let r = ""
        for (let y = 0; y < i.height; ++y) {
            let line = ""
            for (let x = 0; x < i.width; ++x)
                line += "0123456789abcdef"[i.getPixel(x, y)] + " "
            r += line + "\n"
        }
        console.log(`\nimg\`\n${r}\``)
    }

    /*
    export const melodyEditor = melodyToImage({
        notes: "0240",
        tempo: 0,
    })
    */

    const num2image = [
        icondb.blocks1,
        icondb.blocks2,
        icondb.blocks3,
        icondb.blocks4,
        icondb.blocks5,
    ]

    export function numberToDecimalImage(
        i: number | string,
        transparent = true,
    ) {
        const str = typeof i == "number" ? i.toString() : i
        const width = (str.length + 1) * bitmaps.font8.charWidth
        const img = bitmaps.create(width, 18)
        if (!transparent) {
            img.fill(1)
        }
        img.print(str, bitmaps.font8.charWidth >> 1, 5, 15)
        return img
    }

    export function numberToImage(i: number) {
        if (microcode.microcodeClassic) {
            const index = Math.floor(i - 1)
            if (index == i - 1 && index >= 0 && index < 5)
                return num2image[index]
        }
        return numberToDecimalImage(i, false)
    }

  
}
