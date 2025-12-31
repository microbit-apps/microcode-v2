# The MicroCode Language

This document presents a detailed accounting of the syntax and
semantics of the MicroCode language. Its intended audience are
those who are familiar with programming languages and would like
to understand the MicroCode language in depth. We also will
use it as the basis for generating friendlier descriptions
that use MicroCode's visual presentation, as well as to
generate tests and aid in the translation of MakeCode programs
to MicroCode programs,

## Syntax

MicroCode has a concrete syntax, as detailed below, for the
purpose of creating programs without the need for the
MicroCode editor.

In the following, a word in ALLCAPS refers to a non-terminal in
MicroCode's grammar. All other words are terminal symbols, with
the following exceptions:

-   <float> is a floating point number;
-   <pos> is an integer greater than zero;
-   // designates a comment
    (just for use in this markdown - MicroCode does not support comments);
-   the symbols \s, \*, (, ), [, ], and | are part of the grammar
    specification

Words are always separated by whitespace. Note that non-terminals
correspond to the tooltips used in MicroCode's visual editor
(where the underscores are replaced by spaces), which
accounts for their long form.

A program (PROG) consists of 5 pages, numbered P_1 to P_5, each with a (possibly
empty) sequence of rules RULE:

    PROG := P_1 RULE\* P_2 RULE\* P_3 RULE\* P_4 RULE\* P_5 RULE\*

So, the following program is the empty program

```
P_1 P_2 P_3 P_4 P_5
```

Each rule has an optional section WHEN and an optional section DO.

    RULE := when [WHEN] do [DO]

The WHEN section specifies a signal of interest and, optionally, a filter on that signal. The DO section specifies an action and, optionally, parameters to that action.

    WHEN :=
    | start_page [TS]           // fires (once) when control transitions to this page, with optional delay
    | timer [TS]                // set a timer to fire after a delay, execute repeatedly
    | press [PK]                // fire on press of specified button PK
    | release [PK]              // fire on release of specified button PK
    | move [MK]                 // fire on specified accelerometer event MK
    | sound [loud | quiet | C]  // fire on loud/quiet event or comparison C of current sound level (0-255)
    | temperature [UD | C]      // fire on UD event or comparison C of current temperature (in Celsius)
    | light [UD | C]            // fire on UD event or comparison C of current light level (0-255)
    | magnet [UD | C]           // fire on UD event or comparison C of current magnetic level
    | radio_receive [C]         // fire when number arrives via radio, subject to comparison C
    | variable_X_set [C]        // fire after variable X has been assigned, subject to comparison C
    | variable_Y_set [C]        // fire after variable Y has been assigned, subject to comparison C
    | variable_Z_set [C]        // fire after variable Z has been assigned, subject to comparison C

    UD := up | down
    TS := (1/4_second | 1_second | 1_random_second | 5_seconds)\*       // sum the sequence of times
    PK := button_A | button_B | logo | touch_pin_0 | touch_pin_1 | touch_pin_2
    MK := shake | tilt_left | tilt_right | tilt_up | tilt_down | face_down | face_up

Sensors and variables may be compared to values using C; sensors may also have events

    C := CO E

Comparison operators CO are as follows:

    CO :=
    | equals
    | not_equals
    | less_then
    | less_then_or_equal
    | greater_than
    | greater_than_or_equal

An expression E is either atomic A, a binary expression, or a randomly chosen value:

    E :=
    | A
    | A + E
    | A / E
    | A - E
    | A * E
    | random_number PE

Note that the expression language does not admit parentheses and is right-recursive.

An atomic value A is either a floating point number, one of the three variables,
or the current value of one of the four sensors, or the last value received over radio:

    A :=
    | <float>
    | variable_X | variable_Y | variable_Z
    | light_value | sound_value | temp_value | magnet_value
    | radio_value

A positive (integer) expression PE is:

    PE :=
    | <pos>
    | <pos> + PE
    | <pos> * PE

A DO action takes on of the following forms:

    DO :=
    | show_number [V]
    | show_image (IMAGE)\* [repeat [PE]]
    | play_sound (SND)\*   [repeat [PE]]
    | music (NOTES)\* [repeat [PE]]
    | radio_send [V]
    | radio_set_group [PE]
    | set_variable_X [V]
    | set_variable_Y [V]
    | set_variable_Z [V]
    | switch_page [PAGE]

    PAGE := | page_1 | page_2 | page_3 | page_4 | page_5
    SND :=  | giggle | happy | hello | mysterious | sad | slide | soaring | spring | twinkle | yawn

An LED image occurs inside backquotes ` and consists of 25 characters, either . or 1, separated by
whitespace:

    IMAGE := image ` (.\s+ | 1\s+)25 `

A melody fragment consists of a sequence of 4 characters from the set { C, D, E, F, G, -},
where - denotes a rest, inside backquotes:

    NOTES := melody ` (C | D | E | F | G | -)4 `

## Semantics

Before execution starts, all variables (X, Y, and Z) are initialized to 0
and the current value of all micro:bit/jacdac sensors is cached.
The initial value of radio_value is undefined.
The radio group is initialized to 1.
Execution begins by transitioning (switching) to page 1.

### Defaults

The absence of an optional element/value in the when or do section of a rule
results in the use of a default element/value, as follows:

-   A rule with an empty do section never executes (no matching performed
    on it).
-   A rule with an empty when section defaults to start_page signal with no delay.
-   Signal defaults are as follows
    -   start_page defaults to no delay
    -   timer defaults to 1 second delay
    -   press defaults to wildcard (any element in PK)
    -   release defaults to wildcard (any element in PK)
    -   move defaults to shake event
    -   sound defaults to loud event
    -   temperature, light, and magnet default to up event
    -   radio and variable signals have no default, they fire even without a default
-   Action defaults are as follows
    -   show_number defaults to 0
    -   show_image defaults to smiley face
    -   play_sound defaults to giggle
    -   music defaults to `C E G C`
    -   radio_send defaults to 0
    -   radio_set_group defaults to 1
    -   variable_X_set, variable_Y_set, variable_Z_set defaults to 0
    -   switch_page with no page specified is a NOOP

### Signals

Execution of rules on the current page is driven by the reception
of _signals_, which may come from the external environment (for
example, when the user presses a button, shakes the micro:bit,
or a sensor provides a new value) or may be generated by the
MicroCode program itself (for example, by assigning to a variable
or switching to another page).

Regardless of their origin, signals are ordered and processed one
at a time using a FIFO queue. Each signal has a name corresponding to
the signals named in the when section; a signal carries a payload, which
may be an event or a value. Some special kinds of signals are
used for timers, as detailed later.

### Resources and conflicts

Actions have effects by writing to (updating) a resource, which are as follows:

-   screen
-   speaker
-   radio group
-   radio channel
-   variable X
-   variable Y
-   variable Z
-   current page

If two rules have actions that target the same resource, they are said
to be in _conflict_ if it is possible for them to execute at the same time.

### Rule matching

Upon reception of a signal, it is first necessary to find the
rules that are enabled for execution by the signal. The first
step is to find the rules that mention the named signal. Then
the optional conditions associated with those rules are evaluated
in the current state (of variable and sensor values) to prune this
set to get the enabled set E. Finally, if two rules in E are in conflict
then the rule that comes later in sequence is removed from E.

Once we have the final set E of enabled rules, we halt
execution of any currently active rules that conflict with
a rule in E.

The set E is then partition into three sets, I, S, and T, corresponding
to rules whose actions execute instantly, those that switch page, and those that take time. Instant actions are

-   assignments to variables
-   radio send
-   radio set group

The remaining actions (other than switch page) are the ones that (may) take time.

The actions in I are executed first and run to completion.
Then, if S is not empty then
it must be a singleton, so a page switch will take place, in which
case actions in T are ignored. Else, if S is empty then actions in
T are started.

### Updating state

### Switching pages

### Timers
