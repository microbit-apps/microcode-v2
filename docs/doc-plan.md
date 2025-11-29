MicroCode programs consist of 5 pages, numbered 1 - 5.
Execution always starts on page 1. Before execution
starts, all variables are initialized to 0 and
the current value of all sensors is cached.

A page consists of a sequence of rules (R):

P := page-D R\*

Each rule has an option when section W and an optional do section D.

R := when [W] do [D]

The when section specifies an event of interest
and, optionally, a filter on that event.
The do section specifies an action and, optionally,
parameters to that action.
Some actions can be repeated.

W :=
| page-start [TS]
| timer [TS]
| press [PK]
| release [PK]
| move [MK]
| sound [loud | quiet | C]
| temperature [UD | C]
| light [UD | C]
| magnet [UD | C]
| radio-receive [C]
| variable-X-set [C]
| variable-Y-set [C]
| variable-Z-set [C]

UD := up | down
TS := (1/4-second | 1-second | 1-random-second | 5-seconds)\*
PK := button-A | button-B | logo | pin-0 | pin-1 | pin-2
MK := shake | tilt-left | tilt-right | ...

C := CO V

CO :=
| equals
| not-equals
| less-then
| less-then-or-equal
| greater-than
| greater-than-or-equal

V :=
| A
| A + V
| A / V
| A - V
| A \* V
| random PV

A :=
| <float>
| var-X | var-Y | var-Z
| light-value | sound-value | temp-value | magnet-value
| radio-value

PV :=
| int>0
| int>0 + PV
| int>0 \* PV

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

PG := | page-1 | page-2 | page-3 | page-4 | page-5