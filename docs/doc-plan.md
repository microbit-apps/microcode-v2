# The MicroCode Language

## Syntax

In the following, a word in ALLCAPS refers to a non-terminal in
MicroCode's grammar. All other words are terminal symbols and
may have dashes and other symbols in them, with the following
exceptions: <float> is a floating point number; <pos> is an
integer greater than zero; // designates a comment.

A program (PROG) consists of 5 pages, number 1-5, each with a possibly empty sequence of
rules RULE:

    PROG := page-1 RULE* page-2 RULE* page-3 RULE* page-4 RULE* page-5 RULE*

Each rule has an option when section WHEN and an optional do section DO.

    RULE := when [WHEN] do [DO]

The WHEN section specifies an event of interest and, optionally, a filter on that event.
The DO section specifies an action and, optionally, parameters to that action.
Some actions can be repeated.

    WHEN :=
    | page-start [TS]           // fires (once) when control transitions to this page, with optional delay
    | timer [TS]                // set a timer to fire after a delay, execute repeatedly after associated action completes
    | press [PK]                // fire on press of specified button PK
    | release [PK]              // fire on release of specified button PK
    | move [MK]                 // fire on specified accelerometer event MK
    | sound [loud | quiet | C]  // fire on loud/quiet event or comparison C of current sound level (0-255)
    | temperature [UD | C]      // fire on UD event or comparison C of current temperature (in Celcius)
    | light [UD | C]            // fire on UD event or comparison C of current light level (0-255)
    | magnet [UD | C]           // fire on UD event or comparison C of current magnetic level
    | radio-receive [C]         // fire when number arrives via radio, subject to optional comparison C
    | variable-X-set [C]        // fire after variable X has been assigned, subject to optional comparison C
    | variable-Y-set [C]        // fire after variable Y has been assigned, subject to optional comparison C
    | variable-Z-set [C]        // fire after variable Z has been assigned, subject to optional comparison C

    UD := up | down
    TS := (1/4-second | 1-second | 1-random-second | 5-seconds)*       // sum the sequence of times
    PK := button-A | button-B | logo | pin-0 | pin-1 | pin-2
    MK := shake | tilt-left | tilt-right | ...

Sensors and variables may be compared to values using C; sensors may also have events

    C := CO E

Comparison operators CO are as follows:

    CO :=
    | equals
    | not-equals
    | less-then
    | less-then-or-equal
    | greater-than
    | greater-than-or-equal

An expression E is either atomic A, a binary expression, or a randomly chosen value:

    E :=
    | A
    | A + E
    | A / E
    | A - E
    | A * E
    | random PE

An atomic value A is either a floating point number, one of the three variables,
or the current value of one of the four sensors, or the last value received over radio:

    A :=
    | <float>
    | var-X | var-Y | var-Z
    | light-value | sound-value | temp-value | magnet-value
    | radio-value

A positive (integer) expression PE is

    PE :=
    | <pos>
    | <pos> + PE
    | <pos> * PE

A DO action

    DO :=
    | show-number [V]
    | show-image (IMAGE)* [repeat [PE]]
    | play-sound (SND)*   [repeat [PE]]
    | play-music (NOTES)* [repeat [PE]]
    | radio-send [V]
    | radio-set-group [PE]
    | set-variable-X [V]
    | set-variable-Y [V]
    | set-variable-Z [V]
    | switch-page [PAGE]

    PAGE := | page-1 | page-2 | page-3 | page-4 | page-5
    SND := | giggle | happy | hello | mysterious | sad | slide | soaring

An led image is specified inside quotes and consists of 25 digits, either 0 or 1, separated by
a space:

    IMAGE := LED-image `(0\s | 1\s)25`


    NOTES := (C | D | E | F | G)4

## Semantics

Before execution starts, all variables are initialized to 0 and
the current value of all micro:bit/jacdac sensors is cached.
Execution begins by transitioning to page 1.
