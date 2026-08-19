# Universal feature completeness inventory

## Evidence rules

This is a hand-written, fail-closed inventory for both user-facing surfaces: the Electron desktop preview and the public site. `Source present` never means `verified`. A row reaches complete only after every required implementation, documentation, localization, focused test, built-artifact interaction, and real capture exists for that surface.

The active ultra-speed pass prohibited tests and captures. Accordingly, **no row is complete in this bootstrap**, even where partial source exists. No negative-regression completeness guard was executed.

| Canonical feature | Desktop preview implementation | Site implementation | Documentation | Localization | Focused tests | Built-artifact interaction | Real captures | Status |
|---|---|---|---|---|---|---|---|---|
| Three language modes | Partial source in design export | Present in `SiteShell.tsx` | `docs/site/preferences.md` | English, Cantonese, bilingual site copy | Unverified | Unverified | Missing | Incomplete |
| Separate English/Cantonese funny levels | Partial source in design export | Present and wired to hero copy | `docs/site/preferences.md` | Partial site coverage | Unverified | Unverified | Missing | Incomplete |
| Global defaults and per-project settings overrides | Explicit four-field desktop allowlist (`theme`, `lang`, `funnyEn`, `funnyZh`); other persisted records excluded by role | Missing | `docs/application/project-settings-overrides.md` | English only | Unverified | Partial desktop interaction evidence | Missing | Incomplete |
| Emoji display toggle | Not inventoried as implemented | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| School mode and shared unlock | Not inventoried as implemented | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Narrator, voice pickers, rate, and pitch | Not inventoried as implemented | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Scheduled and external settings | Not inventoried as implemented | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Dim-sum startup surprise | Not inventoried as implemented | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Search and full regex builder | Partial source in design export | Present for feature catalog | `docs/site/search-and-regex.md` | English/Cantonese surrounding copy; builder labels English only | Unverified | Unverified | Missing | Incomplete |
| Search on every settings surface, dropdown, and context menu | Not proven | Missing from several site surfaces | Requirement recorded in `AGENTS.md` | Missing | Unverified | Unverified | Missing | Incomplete |
| Material Design 3 appearance | Preview source exists | Token-based site chrome present | `docs/site/landing-page.md` | Partial | Unverified | Unverified | Missing | Incomplete |
| Per-element appearance editor and infinite color translator | Not proven | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| App-logo customization and safe conversion | Not proven | Missing; shipped logo only | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Browser-style tabs and docking to every edge | Partial desktop source | Left/top docking only | `docs/site/preferences.md` | Partial | Unverified | Unverified | Missing | Incomplete |
| Tab overflow, reorder, pin, groups, four searches, bulk close | Not proven | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Command palette (`Ctrl+Shift+F`) | Source wiring owned by desktop lane | Present for destinations and reset | `docs/site/landing-page.md` | Partial | Unverified | Unverified | Missing | Incomplete |
| Rich command-palette controls and exact teleport | Not proven | Partial navigation only | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Non-blocking notifications and reviewable history | Partial toast source | Snackbar present; history missing | Missing | Partial | Unverified | Unverified | Missing | Incomplete |
| Destructive-action super confirmation | Not proven | No destructive site action; universal equivalent missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Local personal-vocabulary JSON upload | Partial: strict local version-1 picker/cache plus five exact Preview Data strings | Missing | `docs/application/personal-vocabulary.md` | Loader states English only; private replacements local | Unverified | Unverified | Missing | Incomplete |
| Every-element toy locks and Support Tickets | Not proven | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Unlock ladder | Not proven | No authentication; canonical equivalent not implemented | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Built-in authenticator and local QR registration | Not proven | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Local Git-backed history | Partial desktop source claim, not exercised | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Changelog viewer with filters and commit links | Not proven | Missing; repository changelog only | `CHANGELOG.md` | Missing | Unverified | Unverified | Missing | Incomplete |
| Shared Status Hub | Not proven | Local manifest status cards only; Hub integration missing | Missing | Partial | Unverified | Unverified | Missing | Incomplete |
| Universal file converter | Not proven | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Local Ollama suite manager | Not proven | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| External editor handoff | Not proven | Not applicable to the site’s current data, but universal equivalent missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| Export everything and bulk actions | Not proven | Missing for catalogs/settings | Missing | Missing | Unverified | Unverified | Missing | Incomplete |
| In-app offline documentation browser | Not proven | Articles embedded in site; completeness guard missing | `docs/README.md` | Partial | Unverified | Unverified | Missing | Incomplete |
| Changelog and release evidence | Repository records present | Release-manifest status surface present | `docs/release/release-downloads.md` | Partial | Unverified | Unverified | Missing | Incomplete |
| Chrome-style unsigned automatic updates | Startup, six-hour, and manual privileged update source present with persistent banner | Site exposes only published installer-manifest state | `docs/application/unsigned-automatic-updates.md` | Banner action labels localized; detailed state messages English | Unverified | Unverified | Missing | Incomplete |
| Product-specific shared-link graphic | Root and served assets generated | Open Graph metadata present in built HTML | `docs/site/landing-page.md` | Accessible English alt text | Unverified | Build output inspected only | Missing runtime capture | Incomplete |
| Responsive sizing and accessibility | Not proven | Responsive CSS, semantic tabs, focus, reduced motion in source | `docs/site/landing-page.md` | Partial | Unverified | Unverified | Missing | Incomplete |
| Browser-extension download Start/Downloading/Complete surfaces | Not in current product scope, but universal contract not implemented | Missing | Missing | Missing | Unverified | Unverified | Missing | Incomplete |

## Required negative regression

No executable negative regression was added or run in this ultra-speed pass. A later evidence task must enumerate these exact rows in code, deliberately remove one implementation, registration, article, localization entry, focused test, interaction proof, or capture record at a time, observe failure, restore it, and observe success. Discovery-only checks are not acceptable.

## Suggested reading

- [Checked-in design-reference parity inventory](design-parity-inventory.md)
- [Preview boundary](../application/preview-boundary.md)
- [Roadmap](../../ROADMAP.md)
