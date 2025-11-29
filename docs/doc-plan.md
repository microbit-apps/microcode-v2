MicroCode programs consist of 5 pages, numbered 1 - 5.
Execution always starts on page 1. Before execution
starts, all variables are initialized to 0 and the current value of all sensors is cached.

A page consists of a sequence of rules, ordered from top to bottom.
Each rule has a When section and a Do section.
The When section specifies an event of interest
and, optionally, a filter on that event.

When

page-start [timespan]
timer [timespan]
press [pressable-kind]
release [pressable-kind]
move [move-kind]
sound [loud-quiet,compare]
temperature [up-down,compare]
light [up-down,compare]
magnet [up-down,compare]
radio-receive [compare]
variable-X-set [compare]
variable-Y-set [compare]
variable-Z-set [compare]

Do

show-number [value]
show-image [image*] [repeat [pos-value]]
play-sound [sound*] [repeat [pos-value]]
play-music [notes*] [repeat [pos-value]]
radio-send [value]
radio-set-group [pos-value]
set-variable-X [value]
set-variable-Y [value]
set-variable-Z [value]
switch-page [page]
