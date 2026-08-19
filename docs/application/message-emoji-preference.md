# Message emoji preference

## Behavior

**Show emojis in dialogs and message boxes** is a persisted app-wide preference and a sparse per-project override. It defaults on for legacy four-setting records. The keyboard-accessible switch lives in Settings, participates in Settings search and command-palette routing, reports inherited/override counts with the other settings, and applies immediately.

When enabled, notification-center rows and transient snackbars gain a relevant `aria-hidden` emoji beside their existing Material status icon. When disabled, the decoration is omitted and the same title, body, severity, actions, facts, and accessible text remain. Emoji never enters button labels, field labels, accessible names, commands, paths, IDs, logs, snapshot facts, release facts, or diagnostics.

## Persistence and snapshots

The desktop allowlist is now `theme`, `lang`, `funnyEn`, `funnyZh`, and `showEmojis`. Legacy four-field global/project ownership records migrate with `showEmojis: true`. New state schema-version 3 snapshots and ownership schema-version 2 include the effective boolean and sparse ownership. Schema versions 1 and 2 remain readable under their documented legacy behavior.

## Verification boundary

Source and unsigned package builds may be exercised for this slice. Global/project inheritance, migration, Settings toggle/search/palette behavior, snapshot-version migration, and rendered notification/snackbar decoration remain runtime-unverified. Tests, lint, reviews, audits, installer execution, and screenshots were not part of this ultra-speed lane.
