Here's the plan for bringing Jacdac back to MicroCode:

- we will use the extension microbit-apps/sensors
- bring over the Jacdac discovery UI from MicroData 

- Jacdac (input vs output)
    - different icon?

- click on Jacdac icon to bring up "Jacdac dashboard". Cases:
    - nothing on bus, no roles
    - nothing on bus, some roles (previously created)
    - something on the bus...
        - new things
        - already bound things
    - list unbound roles (name, service name)
    - operations
        - select which role to use in the tile
        - rename a role (LATER)
        - view sensor (if applicable)
    - Jacdac editor responds to changes to bus...

- when bus changes AND ???
    - do we interrupt and enter "Jacdac dashboard"?
    - need to distinguish from entering via tile editor

- treating events
    - press/release (button), filters Jacdac services

- ISSUE: do we want to retain classic Jacdac?
