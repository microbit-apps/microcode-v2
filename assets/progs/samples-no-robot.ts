function newSamples(): textSampleList {
    return
    ;[
        {
            label: "new program",
            ariadId: "N1",
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
            ariadId: "N3",
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
            ariadId: undefined,
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
            ariadId: "N2",
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
            ariadId: "N14",
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: "N4",
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
            ariadId: "N9",
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
            ariadId: "N8",
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
            ariadId: "N7",
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
            ariadId: "N10",
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
            ariadId: "N13",
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
            ariadId: "N6",
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
            ariadId: "N5",
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
            ariadId: undefined,
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
            ariadId: "N11",
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
            ariadId: "N12",
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
            ariadId: undefined,
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
