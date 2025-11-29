namespace microcode {
    export class Sample {
        constructor(
            public readonly label: string,
            public readonly ariaId: string,
            public readonly icon: string,
            public readonly b64: string
        ) {}

        get source() {
            return Buffer.fromBase64(this.b64)
        }
    }

    type rawSampleList = {
        label: string
        ariaId?: string
        b64?: string
        // leave empty to hide sample
        icon?: string
    }[]

    export class TextSample {
        constructor(
            public readonly label: string,
            public readonly ariaId: string,
            public readonly icon: string,
            public readonly src: string
        ) {}

        get source() {
            return this.src
        }
    }

    type textSampleList = {
        label: string
        ariaId?: string
        src: string
        // leave empty to hide sample
        icon?: string
    }[]

    //% shim=TD_NOOP
    export function robotSamples(r: { s: rawSampleList }) {
        r.s = r.s.concat([
            {
                label: "robot shake",
                b64: "JfiSPgounQ1cNL4NWzTCDV00wMINXjTBwgEBAQEBAA==",
            },
            {
                label: "robot wake",
                b64: "JfiSPgounRI0wMDAwgEBAQEBAA==",
            },
            {
                label: "robot avoid wall",
                b64: "JfiSPgounQo0vhlPNMC+AQEBAQEA",
            },
            {
                label: "robot line follow",
                b64: "JfiSPgoumxpoNL4aZjTAGmc0wRpqNMQaazTFGmk0wgEBAQEBAA==",
            },
            {
                label: "robot showcase",
                b64: "JfiSPgoumwtJNL7IC0o0wsYZTzTEvgEBAQEBAA==",
            },
            {
                label: "robot drift tester",
                b64: "JfiSPgoumwtJNL7IC0o0w8cSNMLGAQEBAQEA",
            },
        ])
    }

    //% shim=TD_NOOP
    function rawWebAppSamples(r: { s: rawSampleList }) {
        r.s = r.s.concat([
            {
                label: "first program",
                b64: "JfiSPgtJLKBAgegAC0kpowEBAQEBAA==",
            },
            {
                label: "flashing heart",
                ariaId: "N2",
                b64: "JfiSPg4soKpGRQCgQDkCAA4powEBAQEBAA==",
                icon: "flashing_heart",
            },
            {
                label: "counter",
                ariaId: "N14",
                b64: "JfiSPgtJMK2bEzOtEymlAQEBAQEA",
            },
            {
                label: "times table",
                b64: "JfiSPg1aMbGenxQwrgtJMK2uEzOtEymlAQEBAQEA",
            },
            {
                label: "double counter",
                b64: "JfiSPgoppAozrQtJMK2bEzOtC0oolwEKKaUKM64LSjGumxQzrgtJKJYBAQEBAA==",
            },
            {
                label: "pet hamster",
                ariaId: "N4",
                b64: "JfiSPgosoGADBwALTSygQIHoAKBgAwcAsp0LTSmjDVosoEABFwGgYAMHALKdDVoppwEBAQEBAA==",
                icon: "pet_hamster",
            },
            {
                label: "head or tail",
                ariaId: "N9",
                b64: "JfiSPg0wsZwNK7N4MTWzeAEAE04soL9+5wATTyygP8b4AQEBAQEBAA==",
                icon: "heads_tails",
            },
            {
                label: "rock, paper, scissors",
                ariaId: "N8",
                b64: "JfiSPg1aMLGdDVopqBNOLKAAAAAAoMA5BwATTyygAAAAAKA/xvgBE1AsoAAAAACgc5E1AQEBAQEBAA==",
                icon: "rock_paper_scissors",
            },
            {
                label: "hot potato",
                ariaId: "N7",
                b64: "JfiSPg5WVVUolw4soAAQAACgAAAAAAEKLKC/fucACimnAQEBAQA=",
                icon: "hot_potato",
            },
            {
                label: "clap lights",
                ariaId: "N10",
                b64: "JfiSPgosoP///wEKKaUSVyiXAQosoAAAAAAKKawSVyiWAQEBAQA=",
                icon: "clap_lights",
            },
            {
                label: "24 7 clap",
                ariaId: "N13",
                b64: "JfiSPgoppQowmwosoEqprQCgjDHPALISVzCtmw5WVFQolxNSUlJSUiiYAQopowozrQ5WViiWAQoppwosoL864ACgvzoHALIOVlYolgEBAQA=",
            },
            {
                label: "reaction time",
                ariaId: "N6",
                b64: "JfiSPgosoAAIAACgABAAAKAAIAAAsg5WVVVVVVUolwtJKJkLSiiYAQosoP///wEKKaULSSiYC0oomQEKLKBEPEEAoIh4ggCyDlYolgEKLKAEfUQAoII8IgCyDlYolgEBAA==",
                icon: "reaction_time",
            },
            {
                label: "chuck a duck",
                ariaId: "N5",
                b64: "JfiSPg1aLKAAEAAADVotmxFOLKDmeAcAEU4ppQEBAQEBAA==",
                icon: "teleport_duck",
            },
            {
                label: "zombie detector",
                b64: "JfiSPg4soAAQAACgQAEFAKARABABoAAAAAARTiiXC00omAEOLKCEEEAAoEopoAAOVCmmDlYolgEOLKC/OuAAoL86BwAOLZsBAQEA",
            },
            {
                label: "firefly",
                ariaId: "N11",
                b64: "JfiSPgosoAAQAAARMK2bDlMwrZsTUFIolw5UVFQolwEKLQowmwosoP/v/wEKKaUOUyiWAQEBAQA=",
                icon: "firefly",
            },
            {
                label: "railroad crossing",
                ariaId: "N12",
                b64: "JfiSPgo3zAtJNZsLSS+2u7ILSjWfC0ovuLuyC00vvLIBAQEBAQA=",
                icon: "railroad_crossing",
            },
            {
                label: "moves",
                b64: "JfiSPg1cLKAnpXQADVssoCml9AANXSygIYTwAA1eLKAnnZQADVosoC889AABAQEBAQA=",
            },
            {
                label: "coins",
                b64: "JfiSPgtJMJsLSjCtmxNQLKAecugBE1EsoC88dAATUiygvdbaAQEBAQEBAA==",
            },
            {
                label: "inchworm",
                b64: "JfiSPgo1mw5TUyiXAQo1nw5TUyiWAQEBAQA=",
            },
            {
                label: "head guess",
                b64: "JfiSPgoppQowsZ0KMZsNXDCxnQ1bMLGdDVsxrpsOVlZWViiXE04soOZ5BwATTyygL4TwAKAvvZQAoJ8QQgCyE1AsoCeldACgL6X0AKAvtPQAsgEKM64KKaMOVlYolgEBAQEA",
            },
            {
                label: "battery charger prank",
                b64: "JfiSPgosoE4p5QCgTimlALINWiiXAQosoE4p5QCgTinnAKBOOecAoM455wCyDlYolgEBAQEA",
            },
            {
                label: "green light red light",
                b64: "JfiSPgtNKJcRTyiYCiyg5VMnAKDkEwcAoPQXhwCyCimlAQowmw4trQtJMJsLSjCcE04soOVTJwCg5BMHAKD0F4cAshNPLKBRERUBAQ1aKacNWiygvzrgAKC/OgcAshFOKJYBAQEA",
            },
            {
                label: "crooked head or tail",
                b64: "JfiSPg0wsZ0NKagTTiygv37nABNPLKA/xvgBE1AsoD/G+AEBAQEBAQA=",
            },
            {
                label: "step counter",
                b64: "JfiSPg1aMK2bEzOtEymlAQEBAQEA",
            },
            {
                label: "clap counter",
                b64: "JfiSPhJXMK2bEzOtAQEBAQEA",
            },
            {
                label: "random counter",
                b64: "JfiSPgtJMJuxnwtJMRMzrQtKMa6bFF8soECB6AABAQEBAQA=",
            },
            {
                label: "slider levels",
                b64: "JfiSPhdOM5sXTzOcF1AznRdRM54XUjOfAQEBAQEA",
            },
            {
                label: "light levels",
                b64: "JfiSPg9OM5sPTzOcD1AznQ9RM54PUjOfAQEBAQEA",
            },
            {
                label: "magnet levels",
                b64: "JfiSPhZOM5sWTzOcFlAznRZRM54WUjOfAQEBAQEA",
            },
            {
                label: "count turns",
                b64: "JfiSPhhiMK2bGGMxrpsTM60UM64BAQEBAQA=",
            },
            {
                label: "key demo",
                b64: "JfiSPgosoAAQAAALSyygQIHoAAtMLKBAARcBAQEBAQEA",
            },
            {
                label: "more water please!",
                b64: "JfiSPhxONswcUDbNAQEBAQEA",
            },
            {
                label: "don't stand too close to me!",
                b64: "JfiSPh1OL7YdUC+6HVIvtwEBAQEBAA==",
            },
            {
                label: "start/stop servo",
                b64: "JfiSPgtJN8wMSjfNAQEBAQEA",
            },
            {
                label: "move off the line",
                b64: "JfiSPh5uN8webzfNAQEBAQEA",
            },
        ])
    }

    export function rawSamples() {
        const s: rawSampleList = [
            {
                label: "new program",
                ariaId: "N1",
                b64: "JfiSPgEBAQEBAA==",
                icon: "new_program",
            },
            {
                label: "smiley buttons",
                ariaId: "N3",
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
            .map(
                ({ label, ariaId, icon, b64 }) =>
                    new Sample(label, ariaId, icon, b64)
            )
    }

    export function textSamples(withIcon: boolean): TextSample[] {
        const s = newSamples()
        return s
            .filter(({ icon }) => !withIcon || !!icon)
            .map(
                ({ label, ariaId, icon, src }) =>
                    new TextSample(label, ariaId, icon, src)
            )
    }

    function newSamples(): textSampleList {
        return [
            {
                label: "new program",
                ariaId: "N1",
                src: `page-1

page-2

page-3

page-4

page-5
`,
                icon: "new_program",
            },

            {
                label: "smiley buttons",
                ariaId: "N3",
                src: `page-1
when press button_A do show_image LED_image \`
1 1 . 1 1
1 1 . 1 1
. . . . .
1 . . . 1
. 1 1 1 .
\`
 LED_image \`
1 1 . 1 1
. . . . .
1 . . . 1
. 1 1 1 .
. . . . .
\`


when press button_A do play_sound happy

when press button_B do show_image LED_image \`
1 1 . 1 1
1 1 . 1 1
. . . . .
. 1 1 1 .
1 . . . 1
\`
 LED_image \`
1 1 . 1 1
1 1 . 1 1
. . . . .
. . . . .
1 1 1 1 1
\`


when press button_B do play_sound sad

page-2

page-3

page-4

page-5
`,
                icon: "smiley_buttons",
            },

            {
                label: "first program",
                ariaId: undefined,
                src: `page-1
when press button_A do show_image LED_image \`
. . . . .
. 1 . 1 .
. . . . .
1 . . . 1
. 1 1 1 .
\`


when press button_A do play_sound giggle

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "flashing heart",
                ariaId: "N2",
                src: `page-1
when timer  do show_image LED_image \`
. 1 . 1 .
1 . 1 . 1
1 . . . 1
. 1 . 1 .
. . 1 . .
\`
 LED_image \`
. . . . .
. 1 . 1 .
. 1 1 1 .
. . 1 . .
. . . . .
\`


when timer  do play_sound giggle

page-2

page-3

page-4

page-5
`,
                icon: "flashing_heart",
            },

            {
                label: "counter",
                ariaId: "N14",
                src: `page-1
when press button_A do set_variable_X variable_X add 1

when variable_X_set  do show_number variable_X

when variable_X_set  do play_sound hello

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "times table",
                ariaId: undefined,
                src: `page-1
when move shake do set_variable_Y random_number 4 add 5

when variable_Y_set  do set_variable_X variable_Y

when press button_A do set_variable_X variable_X add variable_Y

when variable_X_set  do show_number variable_X

when variable_X_set  do play_sound hello

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "double counter",
                ariaId: undefined,
                src: `page-1
when page_start  do play_sound happy

when page_start  do show_number variable_X

when press button_A do set_variable_X variable_X add 1

when variable_X_set  do show_number variable_X

when press button_B do switch_page page_2

page-2
when page_start  do play_sound hello

when page_start  do show_number variable_Y

when press button_B do set_variable_Y variable_Y add 1

when variable_Y_set  do show_number variable_Y

when press button_A do switch_page page_1

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "pet hamster",
                ariaId: "N4",
                src: `page-1
when page_start  do show_image LED_image \`
. . . . .
1 1 . 1 1
. . . . .
. 1 1 1 .
. . . . .
\`


when press logo do show_image LED_image \`
. . . . .
. 1 . 1 .
. . . . .
1 . . . 1
. 1 1 1 .
\`
 LED_image \`
. . . . .
1 1 . 1 1
. . . . .
. 1 1 1 .
. . . . .
\`
 repeat 3

when press logo do play_sound giggle

when move shake do show_image LED_image \`
. . . . .
. 1 . 1 .
. . . . .
. 1 1 1 .
1 . . . 1
\`
 LED_image \`
. . . . .
1 1 . 1 1
. . . . .
. 1 1 1 .
. . . . .
\`
 repeat 3

when move shake do play_sound sad

page-2

page-3

page-4

page-5
`,
                icon: "pet_hamster",
            },

            {
                label: "head or tail",
                ariaId: "N9",
                src: `page-1
when move  do set_variable_X random_number 2

when move  do music melody \`C E G E \`
 melody \`C - - - \`


when variable_X_set equals 1 do show_image LED_image \`
1 1 1 1 1
1 . 1 . 1
1 1 1 1 1
. 1 1 1 .
. 1 1 1 .
\`


when variable_X_set equals 2 do show_image LED_image \`
1 1 1 1 1
1 . . . 1
1 . . . 1
1 . . . 1
1 1 1 1 1
\`


page-2

page-3

page-4

page-5
`,
                icon: "heads_tails",
            },

            {
                label: "rock, paper, scissors",
                ariaId: "N8",
                src: `page-1
when move shake do set_variable_X random_number 3

when move shake do play_sound slide

when variable_X_set equals 1 do show_image LED_image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`
 LED_image \`
. . . . .
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
. . . . .
\`


when variable_X_set equals 2 do show_image LED_image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`
 LED_image \`
1 1 1 1 1
1 . . . 1
1 . . . 1
1 . . . 1
1 1 1 1 1
\`


when variable_X_set equals 3 do show_image LED_image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`
 LED_image \`
1 1 . . 1
1 1 . 1 .
. . 1 . .
1 1 . 1 .
1 1 . . 1
\`


page-2

page-3

page-4

page-5
`,
                icon: "rock_paper_scissors",
            },

            {
                label: "hot potato",
                ariaId: "N7",
                src: `page-1
when timer 5_seconds 1_random_second 1_random_second do switch_page page_2

when timer  do show_image LED_image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`
 LED_image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`


page-2
when page_start  do show_image LED_image \`
1 1 1 1 1
1 . 1 . 1
1 1 1 1 1
. 1 1 1 .
. 1 1 1 .
\`


when page_start  do play_sound sad

page-3

page-4

page-5
`,
                icon: "hot_potato",
            },

            {
                label: "clap lights",
                ariaId: "N10",
                src: `page-1
when page_start  do show_image LED_image \`
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
\`


when page_start  do play_sound hello

when sound loud do switch_page page_2

page-2
when page_start  do show_image LED_image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`


when page_start  do play_sound yawn

when sound loud do switch_page page_1

page-3

page-4

page-5
`,
                icon: "clap_lights",
            },

            {
                label: "24 7 clap",
                ariaId: "N13",
                src: `page-1
when page_start  do play_sound hello

when page_start  do set_variable_X 1

when page_start  do show_image LED_image \`
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
1 1 . 1 1
. 1 . 1 .
\`
 LED_image \`
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

page-2
when page_start  do play_sound giggle

when page_start  do show_number variable_X

when timer 5_seconds 5_seconds do switch_page page_1

page-3
when page_start  do play_sound sad

when page_start  do show_image LED_image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. . . . .
. 1 1 1 .
\`
 LED_image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. 1 1 1 .
. . . . .
\`
 repeat

when timer 5_seconds 5_seconds do switch_page page_1

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "reaction time",
                ariaId: "N6",
                src: `page-1
when page_start  do show_image LED_image \`
. . . . .
. . . . .
. 1 . . .
. . . . .
. . . . .
\`
 LED_image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`
 LED_image \`
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

page-2
when page_start  do show_image LED_image \`
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
1 1 1 1 1
\`


when page_start  do play_sound hello

when press button_A do switch_page page_3

when press button_B do switch_page page_4

page-3
when page_start  do show_image LED_image \`
. . 1 . .
. 1 . . .
1 1 1 1 .
. 1 . . .
. . 1 . .
\`
 LED_image \`
. . . 1 .
. . 1 . .
. 1 1 1 1
. . 1 . .
. . . 1 .
\`
 repeat

when timer 5_seconds do switch_page page_1

page-4
when page_start  do show_image LED_image \`
. . 1 . .
. . . 1 .
1 1 1 1 1
. . . 1 .
. . 1 . .
\`
 LED_image \`
. 1 . . .
. . 1 . .
1 1 1 1 .
. . 1 . .
. 1 . . .
\`
 repeat

when timer 5_seconds do switch_page page_1

page-5
`,
                icon: "reaction_time",
            },

            {
                label: "chuck a duck",
                ariaId: "N5",
                src: `page-1
when move shake do show_image LED_image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`


when move shake do radio_send 1

when radio_receive equals 1 do show_image LED_image \`
. 1 1 . .
1 1 1 . .
. 1 1 1 1
. 1 1 1 .
. . . . .
\`


when radio_receive equals 1 do play_sound hello

page-2

page-3

page-4

page-5
`,
                icon: "teleport_duck",
            },

            {
                label: "zombie detector",
                ariaId: undefined,
                src: `page-1
when timer  do show_image LED_image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`
 LED_image \`
. . . . .
. 1 . 1 .
. . . . .
. 1 . 1 .
. . . . .
\`
 LED_image \`
1 . . . 1
. . . . .
. . . . .
. . . . .
1 . . . 1
\`
 LED_image \`
. . . . .
. . . . .
. . . . .
. . . . .
. . . . .
\`


when radio_receive equals 1 do switch_page page_2

when press logo do switch_page page_3

page-2
when timer  do show_image LED_image \`
. . 1 . .
. . 1 . .
. . 1 . .
. . . . .
. . 1 . .
\`
 LED_image \`
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
. . . . .
. 1 . 1 .
\`


when timer 1_second do play_sound mysterious

when timer 5_seconds do switch_page page_1

page-3
when timer  do show_image LED_image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. . . . .
. 1 1 1 .
\`
 LED_image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. 1 1 1 .
. . . . .
\`


when timer  do radio_send 1

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "firefly",
                ariaId: "N11",
                src: `page-1
when page_start  do show_image LED_image \`
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

page-2
when page_start  do radio_send 

when page_start  do set_variable_X 1

when page_start  do show_image LED_image \`
1 1 1 1 1
1 1 1 1 1
1 1 . 1 1
1 1 1 1 1
1 1 1 1 1
\`


when page_start  do play_sound hello

when timer 1/4_second do switch_page page_1

page-3

page-4

page-5
`,
                icon: "firefly",
            },

            {
                label: "railroad crossing",
                ariaId: "N12",
                src: `page-1
when page_start  do servo_power on

when press button_A do servo_set_angle 1

when press button_A do LED red black repeat

when press button_B do servo_set_angle 5

when press button_B do LED blue black repeat

when press logo do LED rainbow repeat

page-2

page-3

page-4

page-5
`,
                icon: "railroad_crossing",
            },

            {
                label: "moves",
                ariaId: undefined,
                src: `page-1
when move tilt_down do show_image LED_image \`
1 1 1 . .
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 1 1 . .
\`


when move tilt_up do show_image LED_image \`
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 1 1 1 .
\`


when move tilt_left do show_image LED_image \`
1 . . . .
1 . . . .
1 . . . .
1 . . . .
1 1 1 1 .
\`


when move tilt_right do show_image LED_image \`
1 1 1 . .
1 . . 1 .
1 1 1 . .
1 . . 1 .
1 . . 1 .
\`


when move shake do show_image LED_image \`
1 1 1 1 .
1 . . . .
1 1 1 1 .
. . . 1 .
1 1 1 1 .
\`


page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "coins",
                ariaId: undefined,
                src: `page-1
when press button_A do set_variable_X 1

when press button_B do set_variable_X variable_X add 1

when variable_X_set equals 3 do show_image LED_image \`
. 1 1 1 1
. . . . 1
. . 1 1 1
. . . . 1
. 1 1 1 1
\`


when variable_X_set equals 4 do show_image LED_image \`
1 1 1 1 .
1 . . . .
1 1 1 1 .
. . . 1 .
1 1 1 . .
\`


when variable_X_set equals 5 do show_image LED_image \`
1 . 1 1 1
1 . 1 . 1
1 . 1 . 1
1 . 1 . 1
1 . 1 1 1
\`


page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "inchworm",
                ariaId: undefined,
                src: `page-1
when page_start  do servo_set_angle 1

when timer 1/4_second 1/4_second do switch_page page_2

page-2
when page_start  do servo_set_angle 5

when timer 1/4_second 1/4_second do switch_page page_1

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "head guess",
                ariaId: undefined,
                src: `page-1
when page_start  do play_sound hello

when page_start  do set_variable_X random_number 3

when page_start  do set_variable_Y 1

when move tilt_down do set_variable_X random_number 3

when move tilt_up do set_variable_X random_number 3

when move tilt_up do set_variable_Y variable_Y add 1

when timer 5_seconds 5_seconds 5_seconds 5_seconds do switch_page page_2

when variable_X_set equals 1 do show_image LED_image \`
. 1 1 . .
1 1 1 1 .
. 1 1 1 1
. 1 1 1 .
. . . . .
\`


when variable_X_set equals 2 do show_image LED_image \`
1 1 1 1 .
1 . . . .
1 . . . .
1 . . . .
1 1 1 1 .
\`
 LED_image \`
1 1 1 1 .
1 . . 1 .
1 1 1 1 .
1 . . 1 .
1 . . 1 .
\`
 LED_image \`
1 1 1 1 1
. . 1 . .
. . 1 . .
. . 1 . .
. . 1 . .
\`
 repeat

when variable_X_set equals 3 do show_image LED_image \`
1 1 1 . .
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 1 1 . .
\`
 LED_image \`
1 1 1 1 .
1 . . 1 .
1 . . 1 .
1 . . 1 .
1 1 1 1 .
\`
 LED_image \`
1 1 1 1 .
1 . . . .
1 . 1 1 .
1 . . 1 .
1 1 1 1 .
\`
 repeat

page-2
when page_start  do show_number variable_Y

when page_start  do play_sound giggle

when timer 5_seconds 5_seconds do switch_page page_1

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "battery charger prank",
                ariaId: undefined,
                src: `page-1
when page_start  do show_image LED_image \`
. 1 1 1 .
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
. 1 1 1 .
\`
 LED_image \`
. 1 1 1 .
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
\`
 repeat

when move shake do switch_page page_2

page-2
when page_start  do show_image LED_image \`
. 1 1 1 .
. 1 . 1 .
. 1 . 1 .
. 1 . 1 .
. 1 1 1 .
\`
 LED_image \`
. 1 1 1 .
. 1 . 1 .
. 1 . 1 .
. 1 1 1 .
. 1 1 1 .
\`
 LED_image \`
. 1 1 1 .
. 1 . 1 .
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
\`
 LED_image \`
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
. 1 1 1 .
\`
 repeat

when timer 5_seconds do switch_page page_1

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "green light red light",
                ariaId: undefined,
                src: `page-1
when press logo do switch_page page_2

when radio_receive equals 2 do switch_page page_3

when page_start  do show_image LED_image \`
1 . 1 . .
1 1 1 1 1
. . 1 . 1
. 1 1 1 .
. 1 . . .
\`
 LED_image \`
. . 1 . .
1 1 1 1 1
. . 1 . .
. 1 1 1 .
. . . . .
\`
 LED_image \`
. . 1 . 1
1 1 1 1 1
1 . 1 . .
. 1 1 1 .
. . . 1 .
\`
 repeat

when page_start  do play_sound hello

page-2
when page_start  do set_variable_X 1

when timer  do radio_send variable_X

when press button_A do set_variable_X 1

when press button_B do set_variable_X 2

when variable_X_set equals 1 do show_image LED_image \`
1 . 1 . .
1 1 1 1 1
. . 1 . 1
. 1 1 1 .
. 1 . . .
\`
 LED_image \`
. . 1 . .
1 1 1 1 1
. . 1 . .
. 1 1 1 .
. . . . .
\`
 LED_image \`
. . 1 . 1
1 1 1 1 1
1 . 1 . .
. 1 1 1 .
. . . 1 .
\`
 repeat

when variable_X_set equals 2 do show_image LED_image \`
1 . . . 1
. 1 . 1 .
. . 1 . .
. 1 . 1 .
1 . . . 1
\`


page-3
when move shake do play_sound sad

when move shake do show_image LED_image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. . . . .
. 1 1 1 .
\`
 LED_image \`
1 1 1 1 1
1 . 1 . 1
. 1 1 1 .
. 1 1 1 .
. . . . .
\`
 repeat

when radio_receive equals 1 do switch_page page_1

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "crooked head or tail",
                ariaId: undefined,
                src: `page-1
when move  do set_variable_X random_number 3

when move  do play_sound slide

when variable_X_set equals 1 do show_image LED_image \`
1 1 1 1 1
1 . 1 . 1
1 1 1 1 1
. 1 1 1 .
. 1 1 1 .
\`


when variable_X_set equals 2 do show_image LED_image \`
1 1 1 1 1
1 . . . 1
1 . . . 1
1 . . . 1
1 1 1 1 1
\`


when variable_X_set equals 3 do show_image LED_image \`
1 1 1 1 1
1 . . . 1
1 . . . 1
1 . . . 1
1 1 1 1 1
\`


page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "step counter",
                ariaId: undefined,
                src: `page-1
when move shake do set_variable_X variable_X add 1

when variable_X_set  do show_number variable_X

when variable_X_set  do play_sound hello

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "clap counter",
                ariaId: undefined,
                src: `page-1
when sound loud do set_variable_X variable_X add 1

when variable_X_set  do show_number variable_X

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "random counter",
                ariaId: undefined,
                src: `page-1
when press button_A do set_variable_X 1 add random_number 5

when press button_A do set_variable_Y 

when variable_X_set  do show_number variable_X

when press button_B do set_variable_Y variable_Y add 1

when variable_Y_set equals variable_X do show_image LED_image \`
. . . . .
. 1 . 1 .
. . . . .
1 . . . 1
. 1 1 1 .
\`


page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "slider levels",
                ariaId: undefined,
                src: `page-1
when slider equals 1 do show_number 1

when slider equals 2 do show_number 2

when slider equals 3 do show_number 3

when slider equals 4 do show_number 4

when slider equals 5 do show_number 5

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "light levels",
                ariaId: undefined,
                src: `page-1
when light_(external) equals 1 do show_number 1

when light_(external) equals 2 do show_number 2

when light_(external) equals 3 do show_number 3

when light_(external) equals 4 do show_number 4

when light_(external) equals 5 do show_number 5

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "magnet levels",
                ariaId: undefined,
                src: `page-1
when magnet equals 1 do show_number 1

when magnet equals 2 do show_number 2

when magnet equals 3 do show_number 3

when magnet equals 4 do show_number 4

when magnet equals 5 do show_number 5

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "count turns",
                ariaId: undefined,
                src: `page-1
when dial turn_left do set_variable_X variable_X add 1

when dial turn_right do set_variable_Y variable_Y add 1

when variable_X_set  do show_number variable_X

when variable_Y_set  do show_number variable_Y

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "key demo",
                ariaId: undefined,
                src: `page-1
when page_start  do show_image LED_image \`
. . . . .
. . . . .
. . 1 . .
. . . . .
. . . . .
\`


when press key_1 do show_image LED_image \`
. . . . .
. 1 . 1 .
. . . . .
1 . . . 1
. 1 1 1 .
\`


when press key_2 do show_image LED_image \`
. . . . .
. 1 . 1 .
. . . . .
. 1 1 1 .
1 . . . 1
\`


page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "more water please!",
                ariaId: undefined,
                src: `page-1
when moisture equals 1 do relay on

when moisture equals 3 do relay off

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "don't stand too close to me!",
                ariaId: undefined,
                src: `page-1
when distance equals 1 do LED red

when distance equals 3 do LED yellow

when distance equals 5 do LED green

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "start/stop servo",
                ariaId: undefined,
                src: `page-1
when press button_A do servo_power on

when release button_B do servo_power off

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },

            {
                label: "move off the line",
                ariaId: undefined,
                src: `page-1
when reflected_light active do servo_power on

when reflected_light unactive do servo_power off

page-2

page-3

page-4

page-5
`,
                icon: undefined,
            },
        ]
    }
}
