namespace microcode {
    export class Sample {
        constructor(
            public readonly icon: string,
            public readonly b64: string,
        ) {}

        get source() {
            return Buffer.fromBase64(this.b64)
        }
    }

    type rawSampleList = {
        label?: string
        b64?: string
        // leave empty to hide sample
        icon?: string
    }[]

    export class TextSample {
        constructor(
            public readonly label: string,
            public readonly icon: string,
            public readonly src: string,
        ) {}

        get source() {
            return this.src
        }
    }

    type textSampleList = {
        label: string
        src: string
        // leave empty to hide sample
        icon?: string
    }[]

    //% shim=TD_NOOP
    export function robotSamples(r: { s: rawSampleList }) {
        r.s = r.s.concat([
            {
                b64: "JfiSPgounQ1cNL4NWzTCDV00wMINXjTBwgEBAQEBAA==",
            },
            {
                b64: "JfiSPgounRI0wMDAwgEBAQEBAA==",
            },
            {
                b64: "JfiSPgounQo0vhlPNMC+AQEBAQEA",
            },
            {
                b64: "JfiSPgoumxpoNL4aZjTAGmc0wRpqNMQaazTFGmk0wgEBAQEBAA==",
            },
            {
                b64: "JfiSPgoumwtJNL7IC0o0wsYZTzTEvgEBAQEBAA==",
            },
            {
                b64: "JfiSPgoumwtJNL7IC0o0w8cSNMLGAQEBAQEA",
            },
        ])
    }

    //% shim=TD_NOOP
    function rawWebAppSamples(r: { s: rawSampleList }) {
        r.s = r.s.concat([
            {
                b64: "JfiSPgtJLKBAgegAC0kpowEBAQEBAA==",
            },
            {
                b64: "JfiSPg4soKpGRQCgQDkCAA4powEBAQEBAA==",
                icon: "flashing_heart",
            },
            {
                b64: "JfiSPgtJMK2bEzOtEymlAQEBAQEA",
            },
            {
                b64: "JfiSPg1aMbGenxQwrgtJMK2uEzOtEymlAQEBAQEA",
            },
            {
                b64: "JfiSPgoppAozrQtJMK2bEzOtC0oolwEKKaUKM64LSjGumxQzrgtJKJYBAQEBAA==",
            },
            {
                b64: "JfiSPgosoGADBwALTSygQIHoAKBgAwcAsp0LTSmjDVosoEABFwGgYAMHALKdDVoppwEBAQEBAA==",
                icon: "pet_hamster",
            },
            {
                b64: "JfiSPg0wsZwNK7N4MTWzeAEAE04soL9+5wATTyygP8b4AQEBAQEBAA==",
                icon: "heads_tails",
            },
            {
                b64: "JfiSPg1aMLGdDVopqBNOLKAAAAAAoMA5BwATTyygAAAAAKA/xvgBE1AsoAAAAACgc5E1AQEBAQEBAA==",
                icon: "rock_paper_scissors",
            },
            {
                b64: "JfiSPg5WVVUolw4soAAQAACgAAAAAAEKLKC/fucACimnAQEBAQA=",
                icon: "hot_potato",
            },
            {
                b64: "JfiSPgosoP///wEKKaUSVyiXAQosoAAAAAAKKawSVyiWAQEBAQA=",
                icon: "clap_lights",
            },
            {
                b64: "JfiSPgoppQowmwosoEqprQCgjDHPALISVzCtmw5WVFQolxNSUlJSUiiYAQopowozrQ5WViiWAQoppwosoL864ACgvzoHALIOVlYolgEBAQA=",
            },
            {
                b64: "JfiSPgosoAAIAACgABAAAKAAIAAAsg5WVVVVVVUolwtJKJkLSiiYAQosoP///wEKKaULSSiYC0oomQEKLKBEPEEAoIh4ggCyDlYolgEKLKAEfUQAoII8IgCyDlYolgEBAA==",
                icon: "reaction_time",
            },
            {
                b64: "JfiSPg1aLKAAEAAADVotmxFOLKDmeAcAEU4ppQEBAQEBAA==",
                icon: "teleport_duck",
            },
            {
                b64: "JfiSPg4soAAQAACgQAEFAKARABABoAAAAAARTiiXC00omAEOLKCEEEAAoEopoAAOVCmmDlYolgEOLKC/OuAAoL86BwAOLZsBAQEA",
            },
            {
                b64: "JfiSPgosoAAQAAARMK2bDlMwrZsTUFIolw5UVFQolwEKLQowmwosoP/v/wEKKaUOUyiWAQEBAQA=",
                icon: "firefly",
            },
            {
                b64: "JfiSPgo3zAtJNZsLSS+2u7ILSjWfC0ovuLuyC00vvLIBAQEBAQA=",
                icon: "railroad_crossing",
            },
            {
                b64: "JfiSPg1cLKAnpXQADVssoCml9AANXSygIYTwAA1eLKAnnZQADVosoC889AABAQEBAQA=",
            },
            {
                b64: "JfiSPgtJMJsLSjCtmxNQLKAecugBE1EsoC88dAATUiygvdbaAQEBAQEBAA==",
            },
            {
                b64: "JfiSPgo1mw5TUyiXAQo1nw5TUyiWAQEBAQA=",
            },
            {
                b64: "JfiSPgoppQowsZ0KMZsNXDCxnQ1bMLGdDVsxrpsOVlZWViiXE04soOZ5BwATTyygL4TwAKAvvZQAoJ8QQgCyE1AsoCeldACgL6X0AKAvtPQAsgEKM64KKaMOVlYolgEBAQEA",
            },
            {
                b64: "JfiSPgosoE4p5QCgTimlALINWiiXAQosoE4p5QCgTinnAKBOOecAoM455wCyDlYolgEBAQEA",
            },
            {
                b64: "JfiSPgtNKJcRTyiYCiyg5VMnAKDkEwcAoPQXhwCyCimlAQowmw4trQtJMJsLSjCcE04soOVTJwCg5BMHAKD0F4cAshNPLKBRERUBAQ1aKacNWiygvzrgAKC/OgcAshFOKJYBAQEA",
            },
            {
                b64: "JfiSPg0wsZ0NKagTTiygv37nABNPLKA/xvgBE1AsoD/G+AEBAQEBAQA=",
            },
            {
                b64: "JfiSPg1aMK2bEzOtEymlAQEBAQEA",
            },
            {
                b64: "JfiSPhJXMK2bEzOtAQEBAQEA",
            },
            {
                b64: "JfiSPgtJMJuxnwtJMRMzrQtKMa6bFF8soECB6AABAQEBAQA=",
            },
            {
                b64: "JfiSPhdOM5sXTzOcF1AznRdRM54XUjOfAQEBAQEA",
            },
            {
                b64: "JfiSPg9OM5sPTzOcD1AznQ9RM54PUjOfAQEBAQEA",
            },
            {
                b64: "JfiSPhZOM5sWTzOcFlAznRZRM54WUjOfAQEBAQEA",
            },
            {
                b64: "JfiSPhhiMK2bGGMxrpsTM60UM64BAQEBAQA=",
            },
            {
                b64: "JfiSPgosoAAQAAALSyygQIHoAAtMLKBAARcBAQEBAQEA",
            },
            {
                b64: "JfiSPhxONswcUDbNAQEBAQEA",
            },
            {
                b64: "JfiSPh1OL7YdUC+6HVIvtwEBAQEBAA==",
            },
            {
                b64: "JfiSPgtJN8wMSjfNAQEBAQEA",
            },
            {
                b64: "JfiSPh5uN8webzfNAQEBAQEA",
            },
        ])
    }

    export function rawSamples() {
        const s: rawSampleList = [
            {
                b64: "JfiSPgEBAQEBAA==",
                icon: "new_program",
            },
            {
                b64: "JfiSPgtJLKB7g+gAoBtEBwALSSmkC0osoHsDFwGgewPwAQtKKacBAQEBAQA=",
                icon: "smiley_buttons",
            },
        ]
        return s
    }

    export function samples(withIcon: boolean): Sample[] {
        const s = rawSamples()
        const r = { s: s }
        rawWebAppSamples(r)
        // robotSamples(r)
        return r.s
            .filter(({ icon }) => !withIcon || !!icon)
            .map(({ icon, b64 }) => new Sample(icon, b64))
    }

    export function textSamples(withIcon: boolean): TextSample[] {
        const s = newSamples()
        return s
            .filter(({ icon }) => !withIcon || !!icon)
            .map(({ label, icon, src }) => new TextSample(label, icon, src))
    }

    function newSamples(): textSampleList {
        return [
            {
                label: "new program",
                src: ``,
                icon: "new_program",
            },

            {
                label: "smiley buttons",
                src: `when press button_A do show_image image \`
1 1 . 1 1
1 1 . 1 1
. . . . .
1 . . . 1
. 1 1 1 .
\`
 image \`
1 1 . 1 1
. . . . .
1 . . . 1
. 1 1 1 .
. . . . .
\`


when press button_A do play_sound happy

when press button_B do show_image image \`
1 1 . 1 1
1 1 . 1 1
. . . . .
. 1 1 1 .
1 . . . 1
\`
 image \`
1 1 . 1 1
1 1 . 1 1
. . . . .
. . . . .
1 1 1 1 1
\`


when press button_B do play_sound sad
`,
                icon: "smiley_buttons",
            },

            {
                label: "first program",
                src: `when press button_A do show_image image \`
. . . . .
. 1 . 1 .
. . . . .
1 . . . 1
. 1 1 1 .
\`


when press button_A do play_sound giggle
`,
                icon: undefined,
            },

            {
                label: "flashing heart",
                src: `when timer  do show_image image \`
. 1 . 1 .
1 . 1 . 1
1 . . . 1
. 1 . 1 .
. . 1 . .
\`
 image \`
. . . . .
. 1 . 1 .
. 1 1 1 .
. . 1 . .
. . . . .
\`


when timer  do play_sound giggle
`,
                icon: "flashing_heart",
            },

            {
                label: "counter",
                src: `when press button_A do set_variable_X variable_X add 1

when variable_X_set  do show_number variable_X

when variable_X_set  do play_sound hello
`,
                icon: undefined,
            },

            {
                label: "times table",
                src: `when move shake do set_variable_Y random_number 4 add 5

when variable_Y_set  do set_variable_X variable_Y

when press button_A do set_variable_X variable_X add variable_Y

when variable_X_set  do show_number variable_X

when variable_X_set  do play_sound hello
`,
                icon: undefined,
            },

            {
                label: "double counter",
                src: `when start_page  do play_sound happy

when start_page  do show_number variable_X

when press button_A do set_variable_X variable_X add 1

when variable_X_set  do show_number variable_X

when press button_B do switch_page page_2

page_2:
when start_page  do play_sound hello

when start_page  do show_number variable_Y

when press button_B do set_variable_Y variable_Y add 1

when variable_Y_set  do show_number variable_Y

when press button_A do switch_page page_1
`,
                icon: undefined,
            },

            {
                label: "pet hamster",
                src: `when start_page  do show_image image \`
. . . . .
1 1 . 1 1
. . . . .
. 1 1 1 .
. . . . .
\`


when press logo do show_image image \`
. . . . .
. 1 . 1 .
. . . . .
1 . . . 1
. 1 1 1 .
\`
 image \`
. . . . .
1 1 . 1 1
. . . . .
. 1 1 1 .
. . . . .
\`
 repeat 3

when press logo do play_sound giggle

when move shake do show_image image \`
. . . . .
. 1 . 1 .
. . . . .
. 1 1 1 .
1 . . . 1
\`
 image \`
. . . . .
1 1 . 1 1
. . . . .
. 1 1 1 .
. . . . .
\`
 repeat 3

when move shake do play_sound sad
`,
                icon: "pet_hamster",
            },

            {
                label: "head or tail",
                src: `when move  do set_variable_X random_number 2

when move  do music melody \`C E G E \`
 melody \`C - - - \`


when variable_X_set equals 1 do show_image image \`
1 1 1 1 1
1 . 1 . 1
1 1 1 1 1
. 1 1 1 .
. 1 1 1 .
\`


when variable_X_set equals 2 do show_image image \`
1 1 1 1 1
1 . . . 1
1 . . . 1
1 . . . 1
1 1 1 1 1
\`

`,
                icon: "heads_tails",
            },

            {
                label: "rock, paper, scissors",
                src: `when move shake do set_variable_X random_number 3

when move shake do play_sound slide

when variable_X_set equals 1 do show_image image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`
 image \`
. . . . .
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
. . . . .
\`


when variable_X_set equals 2 do show_image image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`
 image \`
1 1 1 1 1
1 . . . 1
1 . . . 1
1 . . . 1
1 1 1 1 1
\`


when variable_X_set equals 3 do show_image image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`
 image \`
1 1 . . 1
1 1 . 1 .
. . 1 . .
1 1 . 1 .
1 1 . . 1
\`

`,
                icon: "rock_paper_scissors",
            },

            {
                label: "hot potato",
                src: `when timer 5_seconds 1_random_second 1_random_second do switch_page page_2

when timer  do show_image image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`
 image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`


page_2:
when start_page  do show_image image \`
1 1 1 1 1
1 . 1 . 1
1 1 1 1 1
. 1 1 1 .
. 1 1 1 .
\`


when start_page  do play_sound sad
`,
                icon: "hot_potato",
            },

            {
                label: "clap lights",
                src: `when start_page  do show_image image \`
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
\`


when start_page  do play_sound hello

when sound loud do switch_page page_2

page_2:
when start_page  do show_image image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`


when start_page  do play_sound yawn

when sound loud do switch_page page_1
`,
                icon: "clap_lights",
            },

            {
                label: "24 7 clap",
                src: `when start_page  do play_sound hello

when start_page  do set_variable_X 1

when start_page  do show_image image \`
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
1 1 . 1 1
. 1 . 1 .
\`
 image \`
. . 1 1 .
. . 1 1 .
. . 1 1 .
. 1 1 1 1
. . 1 1 .
\`
 repeat

when sound loud do set_variable_X variable_X add 1

when timer 5_seconds 1_second 1_second do switch_page page_2

when variable_X_set 5 add 5 add 5 add 5 add 5 do switch_page page_3

page_2:
when start_page  do play_sound giggle

when start_page  do show_number variable_X

when timer 5_seconds 5_seconds do switch_page page_1

page_3:
when start_page  do play_sound sad

when start_page  do show_image image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. . . . .
. 1 1 1 .
\`
 image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. 1 1 1 .
. . . . .
\`
 repeat

when timer 5_seconds 5_seconds do switch_page page_1
`,
                icon: undefined,
            },

            {
                label: "reaction time",
                src: `when start_page  do show_image image \`
. . . . .
. . . . .
. 1 . . .
. . . . .
. . . . .
\`
 image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`
 image \`
. . . . .
. . . . .
. . . 1 .
. . . . .
. . . . .
\`
 repeat

when timer 5_seconds 1_random_second 1_random_second 1_random_second 1_random_second 1_random_second do switch_page page_2

when press button_A do switch_page page_4

when press button_B do switch_page page_3

page_2:
when start_page  do show_image image \`
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
\`


when start_page  do play_sound hello

when press button_A do switch_page page_3

when press button_B do switch_page page_4

page_3:
when start_page  do show_image image \`
. . 1 . .
. 1 . . .
1 1 1 1 .
. 1 . . .
. . 1 . .
\`
 image \`
. . . 1 .
. . 1 . .
. 1 1 1 1
. . 1 . .
. . . 1 .
\`
 repeat

when timer 5_seconds do switch_page page_1

page_4:
when start_page  do show_image image \`
. . 1 . .
. . . 1 .
1 1 1 1 1
. . . 1 .
. . 1 . .
\`
 image \`
. 1 . . .
. . 1 . .
1 1 1 1 .
. . 1 . .
. 1 . . .
\`
 repeat

when timer 5_seconds do switch_page page_1
`,
                icon: "reaction_time",
            },

            {
                label: "chuck a duck",
                src: `when move shake do show_image image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`


when move shake do radio_send 1

when radio_receive equals 1 do show_image image \`
. 1 1 . .
1 1 1 . .
. 1 1 1 1
. 1 1 1 .
. . . . .
\`


when radio_receive equals 1 do play_sound hello
`,
                icon: "teleport_duck",
            },

            {
                label: "zombie detector",
                src: `when timer  do show_image image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`
 image \`
. . . . .
. 1 . 1 .
. . . . .
. 1 . 1 .
. . . . .
\`
 image \`
1 . . . 1
. . . . .
. . . . .
. . . . .
1 . . . 1
\`
 image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`


when radio_receive equals 1 do switch_page page_2

when press logo do switch_page page_3

page_2:
when timer  do show_image image \`
. . 1 . .
. . 1 . .
. . 1 . .
. . . . .
. . 1 . .
\`
 image \`
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
. . . . .
. 1 . 1 .
\`


when timer 1_second do play_sound mysterious

when timer 5_seconds do switch_page page_1

page_3:
when timer  do show_image image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. . . . .
. 1 1 1 .
\`
 image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. 1 1 1 .
. . . . .
\`


when timer  do radio_send 1
`,
                icon: undefined,
            },

            {
                label: "firefly",
                src: `when start_page  do show_image image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`


when radio_receive  do set_variable_X variable_X add 1

when timer 1/4_second do set_variable_X variable_X add 1

when variable_X_set 3 add 5 do switch_page page_2

when timer 1_second 1_second 1_second do switch_page page_2

page_2:
when start_page  do radio_send 

when start_page  do set_variable_X 1

when start_page  do show_image image \`
1 1 1 1 1
1 1 1 1 1
1 1 . 1 1
1 1 1 1 1
1 1 1 1 1
\`


when start_page  do play_sound hello

when timer 1/4_second do switch_page page_1
`,
                icon: "firefly",
            },

            {
                label: "railroad crossing",
                src: `when start_page  do servo_power on

when press button_A do servo_set_angle 1

when press button_A do LED red black repeat

when press button_B do servo_set_angle 5

when press button_B do LED blue black repeat

when press logo do LED rainbow repeat
`,
                icon: "railroad_crossing",
            },

            {
                label: "moves",
                src: `when move tilt_down do show_image image \`
1 1 1 . .
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 1 1 . .
\`


when move tilt_up do show_image image \`
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 1 1 1 .
\`


when move tilt_left do show_image image \`
1 . . . .
1 . . . .
1 . . . .
1 . . . .
1 1 1 1 .
\`


when move tilt_right do show_image image \`
1 1 1 . .
1 . . 1 .
1 1 1 . .
1 . . 1 .
1 . . 1 .
\`


when move shake do show_image image \`
1 1 1 1 .
1 . . . .
1 1 1 1 .
. . . 1 .
1 1 1 1 .
\`

`,
                icon: undefined,
            },

            {
                label: "coins",
                src: `when press button_A do set_variable_X 1

when press button_B do set_variable_X variable_X add 1

when variable_X_set equals 3 do show_image image \`
. 1 1 1 1
. . . . 1
. . 1 1 1
. . . . 1
. 1 1 1 1
\`


when variable_X_set equals 4 do show_image image \`
1 1 1 1 .
1 . . . .
1 1 1 1 .
. . . 1 .
1 1 1 . .
\`


when variable_X_set equals 5 do show_image image \`
1 . 1 1 1
1 . 1 . 1
1 . 1 . 1
1 . 1 . 1
1 . 1 1 1
\`

`,
                icon: undefined,
            },

            {
                label: "inchworm",
                src: `when start_page  do servo_set_angle 1

when timer 1/4_second 1/4_second do switch_page page_2

page_2:
when start_page  do servo_set_angle 5

when timer 1/4_second 1/4_second do switch_page page_1
`,
                icon: undefined,
            },

            {
                label: "head guess",
                src: `when start_page  do play_sound hello

when start_page  do set_variable_X random_number 3

when start_page  do set_variable_Y 1

when move tilt_down do set_variable_X random_number 3

when move tilt_up do set_variable_X random_number 3

when move tilt_up do set_variable_Y variable_Y add 1

when timer 5_seconds 5_seconds 5_seconds 5_seconds do switch_page page_2

when variable_X_set equals 1 do show_image image \`
. 1 1 . .
1 1 1 1 .
. 1 1 1 1
. 1 1 1 .
. . . . .
\`


when variable_X_set equals 2 do show_image image \`
1 1 1 1 .
1 . . . .
1 . . . .
1 . . . .
1 1 1 1 .
\`
 image \`
1 1 1 1 .
1 . . 1 .
1 1 1 1 .
1 . . 1 .
1 . . 1 .
\`
 image \`
1 1 1 1 1
. . 1 . .
. . 1 . .
. . 1 . .
. . 1 . .
\`
 repeat

when variable_X_set equals 3 do show_image image \`
1 1 1 . .
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 1 1 . .
\`
 image \`
1 1 1 1 .
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 1 1 1 .
\`
 image \`
1 1 1 1 .
1 . . . .
1 . 1 1 .
1 . . 1 .
1 1 1 1 .
\`
 repeat

page_2:
when start_page  do show_number variable_Y

when start_page  do play_sound giggle

when timer 5_seconds 5_seconds do switch_page page_1
`,
                icon: undefined,
            },

            {
                label: "battery charger prank",
                src: `when start_page  do show_image image \`
. 1 1 1 .
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
. 1 1 1 .
\`
 image \`
. 1 1 1 .
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
\`
 repeat

when move shake do switch_page page_2

page_2:
when start_page  do show_image image \`
. 1 1 1 .
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
. 1 1 1 .
\`
 image \`
. 1 1 1 .
. 1 . 1 .
. 1 . 1 .
. 1 1 1 .
. 1 1 1 .
\`
 image \`
. 1 1 1 .
. 1 . 1 .
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
\`
 image \`
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
\`
 repeat

when timer 5_seconds do switch_page page_1
`,
                icon: undefined,
            },

            {
                label: "green light red light",
                src: `when press logo do switch_page page_2

when radio_receive equals 2 do switch_page page_3

when start_page  do show_image image \`
1 . 1 . .
1 1 1 1 1
. . 1 . 1
. 1 1 1 .
. 1 . . .
\`
 image \`
. . 1 . .
1 1 1 1 1
. . 1 . .
. 1 1 1 .
. . . . .
\`
 image \`
. . 1 . 1
1 1 1 1 1
1 . 1 . .
. 1 1 1 .
. . . 1 .
\`
 repeat

when start_page  do play_sound hello

page_2:
when start_page  do set_variable_X 1

when timer  do radio_send variable_X

when press button_A do set_variable_X 1

when press button_B do set_variable_X 2

when variable_X_set equals 1 do show_image image \`
1 . 1 . .
1 1 1 1 1
. . 1 . 1
. 1 1 1 .
. 1 . . .
\`
 image \`
. . 1 . .
1 1 1 1 1
. . 1 . .
. 1 1 1 .
. . . . .
\`
 image \`
. . 1 . 1
1 1 1 1 1
1 . 1 . .
. 1 1 1 .
. . . 1 .
\`
 repeat

when variable_X_set equals 2 do show_image image \`
1 . . . 1
. 1 . 1 .
. . 1 . .
. 1 . 1 .
1 . . . 1
\`


page_3:
when move shake do play_sound sad

when move shake do show_image image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. . . . .
. 1 1 1 .
\`
 image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. 1 1 1 .
. . . . .
\`
 repeat

when radio_receive equals 1 do switch_page page_1
`,
                icon: undefined,
            },

            {
                label: "crooked head or tail",
                src: `when move  do set_variable_X random_number 3

when move  do play_sound slide

when variable_X_set equals 1 do show_image image \`
1 1 1 1 1
1 . 1 . 1
1 1 1 1 1
. 1 1 1 .
. 1 1 1 .
\`


when variable_X_set equals 2 do show_image image \`
1 1 1 1 1
1 . . . 1
1 . . . 1
1 . . . 1
1 1 1 1 1
\`


when variable_X_set equals 3 do show_image image \`
1 1 1 1 1
1 . . . 1
1 . . . 1
1 . . . 1
1 1 1 1 1
\`

`,
                icon: undefined,
            },

            {
                label: "step counter",
                src: `when move shake do set_variable_X variable_X add 1

when variable_X_set  do show_number variable_X

when variable_X_set  do play_sound hello
`,
                icon: undefined,
            },

            {
                label: "clap counter",
                src: `when sound loud do set_variable_X variable_X add 1

when variable_X_set  do show_number variable_X
`,
                icon: undefined,
            },

            {
                label: "random counter",
                src: `when press button_A do set_variable_X 1 add random_number 5

when press button_A do set_variable_Y 

when variable_X_set  do show_number variable_X

when press button_B do set_variable_Y variable_Y add 1

when variable_Y_set equals variable_X do show_image image \`
. . . . .
. 1 . 1 .
. . . . .
1 . . . 1
. 1 1 1 .
\`

`,
                icon: undefined,
            },

            {
                label: "slider levels",
                src: `when slider equals 1 do show_number 1

when slider equals 2 do show_number 2

when slider equals 3 do show_number 3

when slider equals 4 do show_number 4

when slider equals 5 do show_number 5
`,
                icon: undefined,
            },

            {
                label: "light levels",
                src: `when light_(external) equals 1 do show_number 1

when light_(external) equals 2 do show_number 2

when light_(external) equals 3 do show_number 3

when light_(external) equals 4 do show_number 4

when light_(external) equals 5 do show_number 5
`,
                icon: undefined,
            },

            {
                label: "magnet levels",
                src: `when magnet equals 1 do show_number 1

when magnet equals 2 do show_number 2

when magnet equals 3 do show_number 3

when magnet equals 4 do show_number 4

when magnet equals 5 do show_number 5
`,
                icon: undefined,
            },

            {
                label: "count turns",
                src: `when dial turn_left do set_variable_X variable_X add 1

when dial turn_right do set_variable_Y variable_Y add 1

when variable_X_set  do show_number variable_X

when variable_Y_set  do show_number variable_Y
`,
                icon: undefined,
            },

            {
                label: "key demo",
                src: `when start_page  do show_image image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`


when press key_1 do show_image image \`
. . . . .
. 1 . 1 .
. . . . .
1 . . . 1
. 1 1 1 .
\`


when press key_2 do show_image image \`
. . . . .
. 1 . 1 .
. . . . .
. 1 1 1 .
1 . . . 1
\`

`,
                icon: undefined,
            },

            {
                label: "more water please!",
                src: `when moisture equals 1 do relay on

when moisture equals 3 do relay off
`,
                icon: undefined,
            },

            {
                label: "don't stand too close to me!",
                src: `when distance equals 1 do LED red

when distance equals 3 do LED yellow

when distance equals 5 do LED green
`,
                icon: undefined,
            },

            {
                label: "start/stop servo",
                src: `when press button_A do servo_power on

when release button_B do servo_power off
`,
                icon: undefined,
            },

            {
                label: "move off the line",
                src: `when reflected_light active do servo_power on

when reflected_light unactive do servo_power off
`,
                icon: undefined,
            },
        ]
    }
}
