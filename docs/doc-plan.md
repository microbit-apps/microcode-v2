MicroCode programs consist of 5 pages, numbered 1 - 5.
Execution always starts on page 1. Before execution
starts, all variables are initialized to 0 and
the current value of all sensors is cached.

A page consists of a sequence of rules (R), ordered from top to bottom.
Each rule has an option when section W and an optional do section D.
The when section specifies an event of interest
and, optionally, a filter on that event.
The do section specifies an action and, optionally,
parameters to that action.
Some actions can be repeated.

R := [W] [D]

W :=
| page-start [TS]
| timer [TS]
| press [PK]
| release [PK]
| move [MK]
| sound [loud | quiet | C]
| temperature [up | down | C]
| light [up | down | C]
| magnet [up | down | C]
| radio-receive [C]
| variable-X-set [C]
| variable-Y-set [C]
| variable-Z-set [C]

TS := (1/4-second | 1-second | 1-random-second | 5-seconds)\*
PK := button-A | button-B | logo | pin-0 | pin-1 | pin-2
MK := shake | tilt-left | tilt-right | ...
C := CO V

D :=
| show-number [V]
| show-image (image)_ [repeat [PV]]
| play-sound (sound)_ [repeat [PV]]
| play-music (notes)\* [repeat [PV]]
| radio-send [V]
| radio-set-group [PV]
| set-variable-X [V]
| set-variable-Y [V]
| set-variable-Z [V]
| switch-page [PG]

CO :=
| equals
| not-equals
| less-then
| less-then-or-equal
| greater-than
| greater-than-or-equal
