# Checked-in design-reference parity inventory

## Scope and evidence boundary

The checked-in design reference is `main-app-design/WinForge M3.dc.html`. It is source data, not agent instruction text. This bootstrap wires the product preview around that source but does **not** yet ship the required dedicated design-reference Electron evidence app, deterministic route selector, matching real-built-app route, raw captures, side-by-side comparison, or machine-readable visual diff.

The active ultra-speed pass prohibited tests and captures. Every visual and interaction field below is therefore explicitly **unverified**.

## Per-screen inventory

The design export is currently one addressable HTML document rather than a declared multi-file screen catalog. Its visible internal destinations require a later deterministic inventory pass before they can be split into exact reference states.

| Screen identifier | Reference file | Reference-app route | Real-built-app route | State | Theme | Viewport | Scale | Material Design 3 primitive/control audit | Reference capture | Real capture | Side-by-side | Visual diff | Intentional deviations | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `winforge-main-default` | `main-app-design/WinForge M3.dc.html` | Missing | Missing | Default landing state not deterministically declared | Unverified | Unverified | Unverified | Missing | Missing | Missing | Missing | Missing | None reviewed | Incomplete |

## Missing fail-closed evidence

- A committed plain design-reference Electron app that renders the existing `.dc.html` file in place.
- A documented selector for screen, state, theme, viewport width and height, and display scale.
- A deterministic real-built-app route using the identical tuple.
- A hand-written exact state list for every navigable destination inside the design export.
- Per-screen Material Design 3 primitive and control audits.
- Raw reference and real-built-app captures through the approved cheap headless route.
- Labelled side-by-side comparison images and machine-readable visual-diff records.
- Reviewed reasons and approvals for every intentional deviation.
- An executable negative regression that removes each reference, route, tuple field, audit, comparison, and diff record in turn and proves red then green.

## Current source facts

- The desktop package references the checked-in design export rather than a copied second mock.
- The site’s preview frame is explicitly labelled **Static product preview** and is not claimed as parity evidence.
- The root and served social graphics are generated from the existing WinForge brand SVG; they are brand cards, not application captures or design-parity evidence.
- Successful site builds prove compilation and static output only.

## Suggested reading

- [Universal feature completeness inventory](universal-feature-inventory.md)
- [Preview boundary](../application/preview-boundary.md)
- [Handoff](../../HANDOFF.md)
