# Locale catalogs

- `tooltips.json` is the id-keyed master of tooltip source strings, mapping each
  tooltip id to its English source string. It is consumed by `tooltips.ts` to
  resolve a tooltip id to the source string that the runtime then localizes.
- `en.json` is generated -- run `npm run loc:strings` to regenerate it
  from the `ui.loc(...)` call sites; do not edit it by hand.
- Every other `<lang>.json` is the translation catalog for one language, a flat
  JSON object keyed by the English source string and mapping it to that
  language's translation. A key missing from a catalog falls back to the source
  string at runtime, so partial catalogs are safe.

## Adding a new string

### Direct strings

Wrap the string literal in `ui.loc(...)` where it is used, in runtime code -- a
render or constructor path. Do not call `ui.loc(...)` in a module-scope `const`
initializer: the translation table is assigned at startup by the generated
`loc.g.ts`, which runs before the other app files but after the module-scope
constants of dependency libraries, so a constant initialized with `ui.loc(...)`
would capture the untranslated source string. Then:

1. `npm run loc:strings` to regenerate `en.json` from the call sites.
2. Add the translation to each `<lang>.json` catalog, keyed by the source
   string. A key missing from a catalog falls back to the source string.
3. `npm run loc:hex` to rebuild the per-language hexes.

### Tooltips

Add the `id -> source string` entry to `tooltips.json`, then run
`npm run loc:tooltips` to regenerate `tooltips.ts`. Reference the id at
the call site through `textId` / `titleId`. Add translations to the
`<lang>.json` catalogs keyed by the source string, not by the id.

### Checking coverage

`npm run loc:coverage` reports, per language, how much of the source-string
inventory is translated. Add `-- --verbose` to list the missing strings, and
name languages after `--` to limit the report to them.

### Context-disambiguated strings

When one source string needs different translations in different places, use
`ui.locc("context", "string")`. It is cataloged under the key `context#string`,
so each context is translated independently while the call still falls back to
`string`.

## CJK languages

Translations are validated against font8 (ASCII, Latin-1, Latin Extended-A,
Cyrillic). CJK fails wholesale, so those languages build no hex; their
catalogs (`ja`, `ko`, `zh-CN`, `zh-HK`) are kept as data.

Supporting CJK would require solving all of:

- **Font.** CJK needs a 12x12 cell; font8 is 6x8. Labels size to their
  content, so font12 doubles every string's width: long Latin strings
  (untranslated fallbacks, dynamic text) render oversized with a gap after
  every letter and can overflow the display. Dense CJK strings are short and
  would likely fit -- the blocker is the Latin text that inevitably shares
  the UI, which needs the per-string font selection below.
- **Flash.** Glyph data lives in flash. The full CJK table (~200KB) is far
  beyond the source-string image's remaining headroom (~28KB). A
  one-language subset (~6KB) fits, but spends roughly a quarter of the
  headroom, which is reserved for app growth.
- **Rendering.** One font per draw call, so mixed Latin/CJK text needs
  per-string font selection that does not exist. CJK lookup also renders
  blank on hardware despite working in the simulator; cause undiagnosed.
