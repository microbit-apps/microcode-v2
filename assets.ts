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

    export class icons {
        public static get(
            name: string | number,
            nullIfMissing = false,
        ): Bitmap {
            if (typeof name == "number") {
                // math constants render their value
                if (microcode.isConstant(name)) {
                    return icondb.numberToImage(getParam(name))
                }
                // operator glyphs are drawn at runtime
                if (name == Tid.TID_OPERATOR_DIVIDE)
                    return icondb.operatorIcon("/")
                if (name == Tid.TID_OPERATOR_MINUS)
                    return icondb.operatorIcon("-")
                if (name == Tid.TID_OPERATOR_MULTIPLY)
                    return icondb.operatorIcon("*")
                if (name == Tid.TID_OPERATOR_PLUS)
                    return icondb.operatorIcon("+")
                // all other tids resolve through the flash lookup table
                // (see icon-table.g.ts, regenerate with scripts/genicontable.js)
                if (name >= 0 && name < 256) {
                    const idx = TID_ICON_IDX[name]
                    if (idx) return iconByIndex(idx - 1)
                }
            } else {
                for (let i = 0; i < ICON_NAMES.length; ++i)
                    if (ICON_NAMES[i] == name)
                        return iconByIndex(ICON_NAME_IDX[i])
            }

            extraImage = null
            extraSamples(name) // only for web app
            if (extraImage) return extraImage
            if (nullIfMissing) return null
            return icondb.MISSING
        }
    }

    export const wordLogo = bmp` 
    .111111.......111111...1111.......................................................1111111.................................1111..................
    11bbbbbb.....11bbbbbb.11bbbb....................................................111bbbbbbb1..............................11bbbb.................
    1bbbbbbbb...11bbbbbbbf1bbbbbf..................................................11bbbbbbbbbbb.............................1bbbbbf................
    1bbbbbbbbb.11bbbbbbbbf1bbbbbf.................................................11bbbbbbbbbbbbb............................1bbbbbf................
    1bbbbbbbbbb1bbbbbbbbbf1bbbbbf................................................11bbbbbbbbbbbbbbb...........................1bbbbbf................
    1bbbbbbbbbbbbbbbbbbbbf.bbbbff...............................................11bbbbbbbbbbbbbbbbf..........................1bbbbbf................
    1bbbbbbbbbbbbbbbbbbbbf..ffff.....1111111......1111...111.......1111111......1bbbbbbbbbbbbbbbbbb.....1111111.........111111bbbbbf....1111111.....
    1bbbbbbbbbbbbbbbbbbbbf.1111....111bbbbbbb1...11bbbb.11bbb....111bbbbbbb1...11bbbbbbbfffbbbbbbbbf..111bbbbbbb1.....111bbbbbbbbbbf..111bbbbbbb1...
    1bbbbbbbbbbbbbbbbbbbbf11bbbb..11bbbbbbbbbbb..1bbbbbb1bbbbb..11bbbbbbbbbbb..1bbbbbbbff...bbbbbbbf.11bbbbbbbbbbb...11bbbbbbbbbbbbf.11bbbbbbbbbbb..
    1bbbbbbfbbbbbfbbbbbbbf1bbbbbf.1bbbbbbbbbbbbf.1bbbbbbbbbbbbf.1bbbbbbbbbbbbf.1bbbbbbff.....bbbbbff.1bbbbbbbbbbbbf..1bbbbbbbbbbbbbf.1bbbbbbbbbbbbf.
    1bbbbbbf.bbbff1bbbbbbf1bbbbbf11bbbbbbbbbbbbb.1bbbbbbbbbbbbf11bbbbbbbbbbbbb.1bbbbbbf.......fffff.11bbbbbbbbbbbbb.11bbbbbbbbbbbbbf11bbbbfffbbbbbb.
    1bbbbbbf..fff.1bbbbbbf1bbbbbf1bbbbbfffbbbbbbf1bbbbbfffbbbff1bbbbbfffbbbbbbf1bbbbbbf......11111..1bbbbbfffbbbbbbf1bbbbbfffbbbbbbf1bbbbff...bbbbbf
    1bbbbbbf......1bbbbbbf1bbbbbf1bbbbff...bbbbff1bbbbbf...fff.1bbbbff...bbbbbf1bbbbbbb.....11bbbbb.1bbbbff...bbbbbf1bbbbff..1bbbbbf1bbbbb11111bbbbf
    1bbbbbbf......1bbbbbbf1bbbbbf1bbbbf.....ffff.1bbbbbf.......1bbbbf....1bbbbf1bbbbbbbb...11bbbbbbf1bbbbf....1bbbbf1bbbbf...1bbbbbf1bbbbbbbbbbbbbbf
    1bbbbbbf......1bbbbbbf1bbbbbf1bbbbf....1111..1bbbbbf.......1bbbbf....1bbbbf.bbbbbbbbb111bbbbbbbf1bbbbf....1bbbbf1bbbbf...1bbbbbf1bbbbbbbbbbbbbff
    1bbbbbbf......1bbbbbbf1bbbbbf1bbbbb...11bbbb.1bbbbbf.......1bbbbb...11bbbbf.1bbbbbbbbbbbbbbbbbff1bbbbb...11bbbbf1bbbbb...1bbbbbf1bbbbffffffffff.
    1bbbbbbf......1bbbbbbf1bbbbbf1bbbbbb111bbbbbf1bbbbbf.......1bbbbbb111bbbbbf..bbbbbbbbbbbbbbbbbf.1bbbbbb111bbbbbf1bbbbbb111bbbbbf1bbbbb..........
    1bbbbbbf......1bbbbbbf1bbbbbf.bbbbbbbbbbbbbff1bbbbbf........bbbbbbbbbbbbbff...bbbbbbbbbbbbbbbff..bbbbbbbbbbbbbff.bbbbbbbbbbbbbbf.bbbbbb11111....
    1bbbbbbf......1bbbbbbf1bbbbbf.1bbbbbbbbbbbbf.1bbbbbf........1bbbbbbbbbbbbf.....bbbbbbbbbbbbbff...1bbbbbbbbbbbbf..1bbbbbbbbbbbbbf.1bbbbbbbbbbb...
    1bbbbbbf......1bbbbbbf1bbbbbf..bbbbbbbbbbbff.1bbbbbf.........bbbbbbbbbbbff......bbbbbbbbbbbff.....bbbbbbbbbbbff...bbbbbbbbbbbbbf..bbbbbbbbbbbf..
    .bbbbbff.......bbbbbff.bbbbff...fbbbbbbbfff...bbbbff..........fbbbbbbbfff........fbbbbbbbfff.......fbbbbbbbfff.....fbbbbbbbbbbff...fbbbbbbbbff..
    ..fffff.........fffff...ffff......fffffff......ffff.............fffffff............fffffff...........fffffff.........ffffffffff......ffffffff...
    `

    export const editorBackground = bmp`
    8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    8888888888888888888888188888881888888888881888888888888888888888888888888888888888888888888888888888885888888888888888888881888888888888888888818888888888888188
    8818888888881888888888888888818188888888888888888818888888881888888888818888888888881888888888588888888888888888888888888888888888888858888888888888888888888888
    8888888888888888888888888888881888888888888888888181888888888888888888888888888888888888888888888881888881888888888188888888888888888888888888888888888888888888
    8888588888888818888888888888888888888888888888888818888888888888888888888888888888888888888888888888888888888888881818888888888881888888818888888888818888888888
    8888888888888888888858888888888888188888888888888888888888888888818888888888888188888888888888888888888888888888888188888888888888888888888888888888888888888888
    8888888888888888188888888888888888888881888885888888888888888888888888885888888888888888881888888588888888888888888888888888888888888888888888888588888888888888
    8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    8886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886
    8686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686
    6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
    6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
    6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
    6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
    `
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

    export const arm_open = bmp`
    . . . . . . . . . . c c c . . .
    . . . . . . . . c c b b b c c .
    . . . . . . . c b b b b b b b c
    . . . . . . c b b b b c c b b c
    c c . . c b b b b c c . . c b c
    b b c c b b b b c . . . . . c .
    b b b b b b c c . . . . . . . .
    c f f b b c . . . . . . . . . .
    c f f b b c . . . . . . . . . .
    b b b b b b c c . . . . . . . .
    b b c c b b b b c . . . . . c .
    c c . . c b b b b c c . . c b c
    . . . . . c c b b b b c c b b c
    . . . . . . . c b b b b b b b c
    . . . . . . . . c c b b b c c .
    . . . . . . . . . . c c c . . .
    `

    export const arm_close = bmp`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . c c c c c c c c c . .
    . . . . . c b b b b b b b b c .
    . . . . c b b b b b b b b b b c
    c c d d b b c c c c c c c c b c
    b b b b b b c . . . . . . . c .
    c f f b b c . . . . . . . . . .
    c f f b b c . . . . . . . . . .
    b b b b b b c . . . . . . . c .
    c c d d b b c c c c c c c c b c
    . . . . c b b b b b b b b b b c
    . . . . . c b b b b b b b b c .
    . . . . . c c c c c c c c c . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . . `

    ///
    /// BUTTON ICONS
    ///
    export const btn_stop = bmp`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . f f f f f f f f . . . . 
        . . . . f 2 2 2 2 2 2 f . . . . 
        . . . . f 2 2 2 2 2 2 f . . . . 
        . . . . f 2 2 2 2 2 2 f . . . . 
        . . . . f 2 2 2 2 2 2 f . . . . 
        . . . . f 2 2 2 2 2 2 f . . . . 
        . . . . f 2 2 2 2 2 2 f . . . . 
        . . . . f f f f f f f f . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
    `

    export const arith_plus = bmp`
    . . . . . . . .
    . . . f f . . .
    . . . f f . . .
    . f f f f f f .
    . f f f f f f .
    . . . f f . . .
    . . . f f . . .
    . . . . . . . .
`

    export const arith_equals = bmp`
    . . . . . . . .
    . f f f f f f .
    . f f f f f f .
    . . . . . . . .
    . . . . . . . .
    . f f f f f f .
    . f f f f f f .
    . . . . . . . .

`

    ///
    /// GENERIC LANGUAGE TILES (NOT HARDWARE SPECIFIC)
    ///

    ///
    /// HARDWARE-SPECIFIC LANGUAGE TILES
    ///

    //TODO: I think this is actually the Jacdac logo?
    // user-interface-base/coreAssets.ts has the real microbitLogo
    // Use "microbitLogo" and at the end of this function it will check user-interface-base and fetch it.

    export const sampleFlashingHeart = bmp`
    .ffffffffffffffffffffffffffffff.
    ffffffffffffffffffffffffffffffff
    fffffffffffffffffffffff2ffffffff
    ffffffffffffffffffffff212ff2ffff
    ffffffffffffffffffffff212f212fff
    ffffffffffffffffffffff212212ffff
    fffffffffffffffffffffff2212fffff
    ffffffff222222ffff222222f2222fff
    fffffff22222222ff2222222221112ff
    ffffff22111111222211111122222fff
    fffff2211111111221111111122fffff
    ffff221114444111111444411122ffff
    fff22111422224111142222411122fff
    fff221142ffff241142ffff241122fff
    fff221142ffff241142ffff241122fff
    fff2211142ffff2442ffff2411122fff
    ffff221142fffff22fffff241122ffff
    ffff2211142ffffffffff2411122ffff
    fffff2211142ffffffff2411122fffff
    ffffff2211142ffffff2411122ffffff
    fffffff22111422ff22411122fffffff
    ffffffff2211144224411122ffffffff
    fffffffff22111144111122fffffffff
    ffff222fff221111111122ffffffffff
    fff21112fff2221111222fffffffffff
    ffff2222ffff22211222ffffffffffff
    ffffff2122ffff2222ffffffffffffff
    fffff212212ffff22fffffffffffffff
    ffff212f212fffffffffffffffffffff
    fffff2ff212fffffffffffffffffffff
    fffffffff2ffffffffffffffffffffff
    bffffffffffffffffffffffffffffffb
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`
    /*
    export const sampleDice = bmp`
    .111111111111111111111111111111.
    11111111111111111111111111111111
    11111111111111111111111111111111
    11111111111111111111111111111111
    1111ccccc11111111111111111111111
    111111111c1111111111111111111111
    1111111111c111111111111111111111
    111cccc1111111111111111111111111
    1111111cc1111cccc111111111111111
    111111111111cdb11cc1111111111111
    11111111111cdddb111ccc1111111111
    111111111ccddddb111111c111111111
    11111111cddddddb111111cd11111111
    1111111cdddddddb1111111c11111111
    1111111cddcdddddb111c11c11111111
    1111111cddddddddb111111cd1111111
    11111111cdddddcdb1111111c1111111
    11111111cdddddddbbbb1111cd111111
    11111111cddddddbbbbbbbbb1c111111
    11111111cdddddbbbbcbbbbbbcd11111
    111111111cddbbbbbbbbbbcbbcd11111
    111111111cdbbbbbbbcbbbbbcd111111
    111111111cbbbbcbbbbbbbbcd1111111
    111111111cccbbbbbbcbbccd11111111
    111111111111cccccbbbcd1111111111
    11111111111111111cccd11111111111
    11111111111111111111111111111111
    11111111111111111111111111111111
    1111111111ddddddddddddddddd11111
    1111111111111ddddddddddddd111111
    11111111111111111111111111111111
    b111111111111111111111111111111b
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`*/

    export const sampleFirefly = bmp`
.ffffffffffffffffffffffffffffff.
ffffffffffffffffffffffffffffffff
ffffffffffffffffffffffffffffffff
ffffffffffffffffffffff444fffffff
fffffffffffffffffffff45154ffffff
ffffffffffffffffffff4511154fffff
ffffffffffffffffffff4511154fffff
ffffffffffffffffffff4511154fffff
fffffffffffffffffffff45554ffffff
ffffffff444fffffffffff444fffffff
fffffff45154ffffffffffffffffffff
ffffff4511154fffffffffffffffffff
ffffff4511154fffffffffffffffffff
ffffff4511154fffffffffffffffffff
fffffff45554ffffffffffffffffffff
ffffffff444fffffffffffffffffffff
ffffffffffffffffffffffffffffffff
ffffffffffffffffffffffffffffffff
ffffffffffffffffffffffffffffffff
ffffffffffffffffffffffffffffffff
ffffffffffffffffffffffffffffffff
ffffffffffffffffffffffffffffffff
ffffffffffffffffffffffffffffffff
fffffffffffffffffffff444ffffffff
ffffffffffffffffffff45154fffffff
fffffffffffffffffff4511154ffffff
fffffffffffffffffff4511154ffffff
fffffffffffffffffff4511154ffffff
ffffffffffffffffffff45554fffffff
fffffffffffffffffffff444ffffffff
ffffffffffffffffffffffffffffffff
bffffffffffffffffffffffffffffffb
..bbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`
    export const sampleClapLights = bmp`
    .ffffffff8fffffffffffffffffffff.
    fffffffff8ffffffffffffffffffffff
    fffffffff8ffffffffffffffffffffff
    fffffffff8ffffffffffffffffffffff
    fffffffff8ffffffffffffffffffffff
    fffffffff8ffffffffffffffffffffff
    fffffffffeffffffffffffffffffffff
    ffffffffeeefffffffffffffffffffff
    ffffffffeeefffffffffffffffffffff
    ffffffff444fffffffffffffffffffff
    fffffff45154ffffffff5fffffffffff
    ffffff4511154fffffff5fffffffffff
    ffffff4511154fffffff5fff5fffffff
    ffffff4511154fffffff5ff5ffffffff
    fffffff45554ffffffffff5fffffffff
    ffffffff444fffff444fffffffffffff
    fffffffffffffff44544fff5555fffff
    fffffffffffff44445544fffffffffff
    ffffffffffff4545545544ffffffffff
    ffffffffffff4454554544444fffffff
    ffffffffffff454545544545544fffff
    ffffffffffff4454545545545554ffff
    ffffffffffff45454545545544554fff
    fffff5555fff44545455555554554fff
    ffffffffffff45454555555554454fff
    fffffffff5fff4545555555555454fff
    ffffffff5fffff455555555555454fff
    fffffff5ff5ffff45555555555454fff
    ffffffffff5fffff45555555555454ff
    ffffffffff5ffffff4555555555454ff
    ffffffffffffffffff4445555554554f
    bffffffffffffffffffff4555555554b
    ..bbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`
    export const sampleRockPaperScissors = bmp`
    .111111111111111111111111111111.
    11111111111111111111111111111111
    11111111111111111111111111111111
    11111111111111111111c11111111111
    1111111111111111111c1ccc11111111
    11111111ccc11111111c1111cc111111
    1111111c422c111111c11d1111c11111
    1111ccc42222c11111c111dd11cd1111
    111c42c42c42cd1111c1111111cd1111
    11c422242c42cd1111c1dd111cdd1111
    11c42c242c42cd111c1111d11cd11111
    11c42cc44222cd111c1111111cd11111
    11c222cc442cd111c11dd1111cd11111
    111c2224ccccd111c1111d11cd111111
    1111ccccc1cdcd111cc11111cd111111
    11111111c1cd1cd1111cc11cd1111111
    11111111c1cc11cd11111ccd11111111
    11111111c1cdc11cd111111111111111
    11111111c1cd1c11cd11111111111111
    11111111c1cd11c1cd11ccccc1111111
    11111111c1cd111cd11cddddbc111111
    11111111c1cd111111cd11ddbbc11111
    11111111c1cd11111cd1dddddbbc1111
    111111111cd11111cdddddddbbbcd111
    1111111111111111cddddddbdbbcd111
    1111111111111111cdddddbdbbbcd111
    11111111111111111cdddbdbbbcd1111
    111111111111111111cbbbbbccd11111
    1111111111111111111cccccdd111111
    11111111111111111111111111111111
    11111111111111111111111111111111
    b111111111111111111111111111111b
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`
    export const sampleTeleportDuck = bmp`
    .111111111111111111111111111111.
    11111111111111111111111111111111
    11111111111111116111111111111111
    11611111111111161611111111611111
    11161111b11111116111116611611111
    11116111111111511111111666111111
    11161611111111111111511611111111
    1111611111fff1111111666161111111
    11161111ff555ff111161116111b1111
    1111611f55fff55f1116111111b1b111
    111111f55f111f55f1611115111b1111
    111111f55f1f1f55f611111111111111
    111111f55f111f55f111166661111111
    1111fffff5fff555f111611116115111
    111f44444f555555fffffff111611111
    1111ffffff5555555555555f11611111
    1111111f5555555555555555f1611111
    1115116f555555554444455556111111
    11111611f5555555555545556f666111
    11116166f5555555555546665f111611
    11111661f5555555556665555fd11161
    1111611666666666665545555fd15161
    111661111f555555544455555fd11611
    1111166661f555555555555566666111
    1111111116666666666666665f111611
    111111111111ffff5555555ffd116111
    1111111111111111fffffffdd1116111
    1111116661111111ff44fd1111156111
    111666111151111f44444fd111111611
    1111161111111111fffffd1111111111
    11111111111111111111111111111111
    b111111111111111111111111111111b
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`
    export const samplePetHamster = bmp`
    .999999999999999999999999999999.
    99999999999999999999999999999999
    99999999999999999999999999999999
    99999999999999292999999119999999
    99999999999992422299999999999999
    99999999999992222299999999999999
    99991199999999222999999999999999
    99911119999999929999999999999999
    99111111999999999999999999999999
    9999999999fff99999fff99999119999
    999999999fdddfffffdddf9991111999
    999999999fd3ee444ee3df9911111199
    999999999fdeddeeeddedf9999999999
    999999999fed1fddd1fdef9999999999
    99999999fdddffdddffdddf999999999
    9999999fd333ddd2ddd333df99999999
    9999999fd333dfdfdfd333df99999999
    9999999fd333ddfffdd333df99999999
    19999999fdddddddddddddf999999999
    119999999fffdddddddfff9999999999
    1111999999fffffffffff99999999911
    999999999feeedddddeeef9999999999
    999999999feeeedddeeeef9999999999
    999999999ffddfeeefddff9999999999
    777777777feffeeeeeffef6777777777
    777771777feef44f44feef6717777177
    7777777777fffffffffff67777777777
    77717777777777777777777777717777
    77777717777777777717777777151777
    77777151777771777151777777717777
    77777717777777777717777777777777
    b777777777777777777777777777777b
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`

    export const sampleHeadsOrTails = bmp`
    .111111111111111111111111111111.
    111111111fff11111111111111111111
    11111111f11111111111111111111111
    1111111f11ff11111111111111111111
    111111111f1111111111111111111111
    11111111111111111111111111111111
    11111111111116611111111111111111
    11111111111169961111111111111111
    11111111111169996111111111111111
    11111111111116999611111111111111
    11111111111111699611111111111111
    11111111111111166111f1f111111111
    11111111111111111111f1f111111111
    1111111111111111111f11f111111111
    111111111111111111111f1111111111
    11111111111111111111f11111111111
    11111111111111441111111111111111
    11111111111114541111111111111111
    11111111111114554411111111111111
    11111111111114455444111111111111
    11111111111111445554d11111111111
    11111111114444445555411111111111
    111111111145555445554d1111111111
    1111111114445555545544d111111111
    11111111145544455455544d11111111
    111111111445555444555544d1111111
    1111111111444555545555554d111111
    11111111114544444455555554dd1111
    1111111111455555545555555544d111
    11111111111444444455555555554d11
    11111111111455555455455555555411
    b111111111114444444445555555554b
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`

    export const sampleReactionTime = bmp`
    .ffffffffffffffffffff455555554f.
    fffffffffffffffff1ff455555554fff
    fffffffffff1fffff1ff45555554ffff
    fffffffffff1f1fff1ff45555554ffff
    fffff1fffff1f1f1f1ff4555554fffff
    fffff1fffff1f1f1f1f45555554fffff
    fffff1fffff1f1fff1f4555554ffffff
    fffff1fffff1f1ffff45555554f1ffff
    f1fff1fffff1fff4445555554ff1ffff
    f1fff1fffff1ff45555555554ff1ffff
    f1fff1fffffff455555555554ff1ffff
    f1fff1ffffff455555555554fff1ff1f
    f1fff1fffff4555555555554fff1ff1f
    ff1fff1fff45455555555554fff1ff1f
    ff1fff1ff45454555555554ffff1ff1f
    ff1fff1ff44545455555554ffff1ff1f
    ff1fff1ff4545454554554ffff1fff1f
    ff1fff1ff445454554554fffff1fff1f
    ff1fff1ff45454554454ffffff1ff1ff
    ff1fff1ff4454554f44fffffff1ff1ff
    ff1fff1ff454554fffffffffff1ff1ff
    fff1ff1fff4444ffffffffffff1ff1ff
    fff1ff1fffffffffffffffffff1ff1ff
    fff1ffffffffffffffffffffff1ff1ff
    fff1fffffffff4444444ffffff1fffff
    ffffffffffff444444444fffffffffff
    fffffffffffe444444444effffffffff
    ddddddddddfe244444442efddddddddd
    ddddddddddfee2222222eefddddddddd
    dddddddddddfeeeeeeeeefdddddddddd
    ddddddddddddfffffffffddddddddddd
    bddddddddddddddddddddddddddddddb
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`
    export const sampleHotPotato = bmp`
    .ffffffffffffffffffffffffffffff.
    ffffffffffffffff5fffffffffffffff
    ffffffffffffffff55ffffffffffffff
    ffffffffff5f255f22ffffffffffffff
    fffffff25f22f255f2ffffffffffffff
    ffffff522ff22222522ff2ffffffffff
    ffffff5525552542252252ff5f2fffff
    ffffff24252555542252552f5522ffff
    ffff4425455244455252252f55524fff
    ffff444554422444444544525254ffff
    fffff444554ddddddd4444525254ffff
    ffffff54444dddedddd44442525fffff
    ffffff5444dddddddeddd4424222ffff
    fffff45544eddddddddddd42442fffff
    ffffff4544eddeddddddddd44455ffff
    ffffff4544eddddddeddddd44445ffff
    ff54455454eddddddddddded4455ffff
    fff54444444edddddddedddd445fffff
    ffff5522544eeddddddddddd44ffffff
    fffff5524444edddedddddddd4ffffff
    ffffff555444eeddddddedded4ffffff
    fffffffff5544edddddddddde4ffffff
    ffffffffff554edddedddddd44ffffff
    fffffffffff54eedddddeddd44ffffff
    ffffffffffff44eddddddddd44ffffff
    ffffffffffff44eedddddeee44ffffff
    fffffffffffff44eeddeeee44fffffff
    fffffffffffff444eeee44444fffffff
    ffffffffffffff4444444444ffffffff
    ffffffffffffffff44444fffffffffff
    ffffffffffffffffffffffffffffffff
    bffffffffffffffffffffffffffffffb
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`

    export const sampleRailCrossingLight = bmp`
    .999999991999999999999999999999.
    99999999999999199999999919999999
    9999ccccc99999999999999999991999
    999c44444c9999999991999991999999
    99c4222224c999999999999999999991
    99c4222224c999999999999999999999
    99c4222224c999999999999999999999
    99c4222224c999999999999999999999
    99c4222224c999999999999999999999
    999c44444c9999999999999999999999
    9999ccccc9999999999999999992d999
    99999bcb99999999999999999bbd2999
    9999ccccc99999999999999bbdddb999
    999c44444c999999999999b2ddbb9999
    99c4888884c999999999bbdd2b999999
    99c4888884c99999999b2ddb99999999
    99c4888884c999999bbdd2b999999999
    99c4888884c9999bb2ddb99999999999
    99c4888884c999bddd2b999999999999
    999c44444c99bbddbb99999999999999
    9999ccccc99bdddb9999999999999999
    99999bcbfbb2dbb99999999999999999
    99999bcbbddd29999999999999999999
    99999cbdddbb99999999999999999999
    9999bbddbb9999999999999999999999
    999b2ddb999999999999999999999999
    999dd2bc999999999999999999999999
    9999bccc999999999999999999999999
    97999ccc999999999999999999999999
    79979ccc999999999999999999999555
    99799ccc999999999999999999999555
    b7777ccceeeeeeeeeeeeeeeeeeeee554
    .bbbbbbbbbbbbbbbbbbbbbbbbbbbb44.
    `
    export const settingsGear = bmp`
    . . . . . . . . . . . . . . . .
    . . . . . . . d d . . . . . . .
    . . . d d . d b b c . d d . . .
    . . d b b c d b b c d b b c . .
    . . d b b b b b b b b b b c . .
    . . . c b d b c c b d b c . . .
    . . d d b b c . . c b b d d . .
    . d b b b c . . . . c b b b c .
    . d b b b c . . . . c b b b c .
    . . c c b b c . . c b b c c . .
    . . . d b d b c c b d b c . . .
    . . d b b b b b b b b b b c . .
    . . d b b c c b b c c b b c . .
    . . . c c . c b b c . c c . . .
    . . . . . . . c c . . . . . . .
    . . . . . . . . . . . . . . . .
`

    const one = bmp`
. . . . . .
. . f f . .
. f f f . .
. . f f . .
. . f f . .
. . f f . .
. f f f f .
. . . . . .
`

    const two = bmp`
. . . . . .
. . f f . .
. f . . f .
. . . . f .
. . f f . .
. f f . . .
. f f f f .
. . . . . .
`
    const three = bmp`
. . . . . .
. f f f . .
. . . . f .
. . f f f .
. . . . f .
. . . . f .
. f f f . .
. . . . . .
`
    const four = bmp`
. . . . . .
. f . . f .
. f . . f .
. f f f f .
. . . . f .
. . . . f .
. . . . f .
. . . . . .
`
    const five = bmp`
. . . . . .
. f f f f .
. f . . . .
. f f f . .
. . . . f .
. . . . f .
. f f f . .
. . . . . .
`

    export const blocks1 = bmp`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . 4 4 4 4 . . . . . .
    . . . . . . 4 5 5 4 . . . . . .
    . . . . . . 4 5 5 4 . . . . . .
    . . . . . . 4 4 4 4 . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`

    export const blocks2 = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . 4 4 4 4 . . 4 4 4 4 . . .
        . . . 4 5 5 4 . . 4 5 5 4 . . .
        . . . 4 5 5 4 . . 4 5 5 4 . . .
        . . . 4 4 4 4 . . 4 4 4 4 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
    export const blocks3 = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . 4 4 4 4 . 4 4 4 4 . 4 4 4 4 .
        . 4 5 5 4 . 4 5 5 4 . 4 5 5 4 .
        . 4 5 5 4 . 4 5 5 4 . 4 5 5 4 .
        . 4 4 4 4 . 4 4 4 4 . 4 4 4 4 .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
    export const blocks4 = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . 4 4 4 4 . . 4 4 4 4 . . .
        . . . 4 5 5 4 . . 4 5 5 4 . . .
        . . . 4 5 5 4 . . 4 5 5 4 . . .
        . . . 4 4 4 4 . . 4 4 4 4 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . 4 4 4 4 . . 4 4 4 4 . . .
        . . . 4 5 5 4 . . 4 5 5 4 . . .
        . . . 4 5 5 4 . . 4 5 5 4 . . .
        . . . 4 4 4 4 . . 4 4 4 4 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
    export const blocks5 = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . 4 4 4 4 . 4 4 4 4 . . . .
        . . . 4 5 5 4 . 4 5 5 4 . . . .
        . . . 4 5 5 4 . 4 5 5 4 . . . .
        . . . 4 4 4 4 . 4 4 4 4 . . . .
        . . . . . . . . . . . . . . . .
        . 4 4 4 4 . 4 4 4 4 . 4 4 4 4 .
        . 4 5 5 4 . 4 5 5 4 . 4 5 5 4 .
        . 4 5 5 4 . 4 5 5 4 . 4 5 5 4 .
        . 4 4 4 4 . 4 4 4 4 . 4 4 4 4 .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

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

    export const run = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . c c c . . . . . . . . . . . .
        . c 7 7 c c . . . . . . . . . .
        . c 7 7 7 7 c c c . . . . . . .
        . c 7 7 7 7 7 7 c c . . . . . .
        . c 7 7 7 7 7 7 7 7 c c . . . .
        . c 7 7 7 7 7 7 7 7 7 7 c c . .
        . c 7 7 7 7 7 7 7 7 7 7 7 7 c .
        . c 7 7 7 7 7 7 7 7 7 7 c c . .
        . c 7 7 7 7 7 7 7 7 c c . . . .
        . c 7 7 7 7 7 7 c c . . . . . .
        . c 7 7 7 7 c c . . . . . . . .
        . c 7 7 c c . . . . . . . . . .
        . c c c . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const runDisabled = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . c c c . . . . . . . . . . . .
        . c b b c c . . . . . . . . . .
        . c b b b b c c c . . . . . . .
        . c b b b b b b c c . . . . . .
        . c b b b b b b b b c c . . . .
        . c b b b b b b b b b b c c . .
        . c b b b b b b b b b b b b c .
        . c b b b b b b b b b b c c . .
        . c b b b b b b b b c c . . . .
        . c b b b b b b c c . . . . . .
        . c b b b b c c . . . . . . . .
        . c b b c c . . . . . . . . . .
        . c c c . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const stop = bmp`
. . . . . . . . . . . . . . . . 
. . . . . d d d d d d . . . . . 
. . . . d 1 1 1 1 1 1 d . . . . 
. . . d 1 2 2 2 2 2 2 1 d . . . 
. . d 1 2 2 2 2 2 2 2 2 1 d . . 
. d 1 2 2 2 2 2 2 2 2 2 2 1 d . 
. d 1 2 2 2 2 2 2 2 2 2 2 1 d . 
. d 1 2 2 1 1 1 1 1 1 2 2 1 d . 
. d 1 2 2 1 1 1 1 1 1 2 2 1 d . 
. d 1 2 2 2 2 2 2 2 2 2 2 1 d . 
. d 1 2 2 2 2 2 2 2 2 2 2 1 d . 
. . d 1 2 2 2 2 2 2 2 2 1 d . . 
. . . d 1 2 2 2 2 2 2 1 d . . . 
. . . . d 1 1 1 1 1 1 d . . . . 
. . . . . d d d d d d . . . . . 
. . . . . . . . . . . . . . . . 
`

    export const stopDisabled = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . d d d d d d . . . . .
        . . . . d c c c c c c d . . . .
        . . . d c b b b b b b c d . . .
        . . d c b b b b b b b b c d . .
        . d c b b b b b b b b b b c d .
        . d c b b b b b b b b b b c d .
        . d c b b c c c c c c b b c d .
        . d c b b c c c c c c b b c d .
        . d c b b b b b b b b b b c d .
        . d c b b b b b b b b b b c d .
        . . d c b b b b b b b b c d . .
        . . . d c b b b b b b c d . . .
        . . . . d c c c c c c d . . . .
        . . . . . d d d d d d . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const loud = bmp`
. . . . . . . . . . . . . . . .
. 2 2 2 2 2 2 2 2 2 2 2 2 2 2 .
. 2 f f 2 2 2 2 2 2 f f f 2 2 .
. 2 f f 2 2 2 2 2 f f 2 f f 2 .
. 2 f f 2 2 2 2 2 f 2 2 2 f 2 .
. 2 f f 2 2 2 2 2 f f 2 f f 2 .
. 2 f f f f 2 2 2 2 f f f 2 2 .
. 2 2 2 2 2 2 2 2 2 2 2 2 2 2 .
. 2 2 2 2 2 2 2 2 2 2 2 2 2 2 .
. 2 f f 2 2 f 2 2 f f f f 2 2 .
. 2 f f 2 2 f 2 2 f f 2 2 f 2 .
. 2 f f 2 2 f 2 2 f f 2 2 f 2 .
. 2 f f 2 2 f 2 2 f f 2 2 f 2 .
. 2 2 f f f 2 2 2 f f f f 2 2 .
. 2 2 2 2 2 2 2 2 2 2 2 2 2 2 .
. . . . . . . . . . . . . . . .
`

    export const quiet = bmp`
9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
9 9 9 9 1 1 1 9 9 9 9 9 9 9 1 9
9 9 9 1 1 1 1 1 9 9 1 1 1 9 9 9
9 9 1 1 1 1 1 1 9 9 9 1 1 1 9 9
9 9 9 9 1 1 9 9 9 9 9 9 1 1 1 9
9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
9 9 9 9 9 9 9 1 1 1 1 9 9 9 9 9
9 9 9 9 9 9 9 9 1 1 1 9 9 9 9 9
9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
9 9 9 7 7 7 7 7 7 9 9 9 9 9 9 9
7 7 7 7 7 7 7 7 7 7 7 9 9 9 7 7
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
`
}
