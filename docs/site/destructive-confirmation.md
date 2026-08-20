# Destructive Settings reset confirmation

## Protected action

The Pages site's **Reset settings** action is destructive because it replaces all eight effective presentation preferences with shipped defaults and permanently removes every local project record and sparse override. Personal vocabulary is preserved. Notification history and Settings history remain, and the completed reset adds a new Settings-history event.

The visible Settings control and the command-palette reset command open the same in-app confirmation. Neither route mutates browser state directly.

## Confirmation sequence

The blocking surface names the impact before authorization and lists the exact affected-record counts at the moment it opens: eight presentation settings, the current number of local project records, and the current number of sparse project overrides. It separately lists the personal vocabulary, app logo, notification history, and settings history that will be preserved. A visitor must independently acknowledge the presentation-settings reset and project-record removal. Only then does the full-range slider become available. Mutation occurs once, only when the slider reaches 100 percent. The completion state reports what changed and what was preserved.

Emergency exit, the close control, Escape, and a click on the surrounding scrim cancel without mutation and return focus to the control that opened the surface. While open, keyboard focus is contained within the alertdialog; completion keeps the same focus-return path. The controls have explicit labels, visible focus behavior inherited from the site, adequate targets, and localized English, Cantonese, and bilingual copy.

## Motion and failure modes

Slider progress and completion use visible non-color status. Reduced-motion preferences remove animation and transitions without hiding progress. Closing before completion resets both acknowledgements and the slider. A duplicate completion is refused in memory, so repeated events cannot run the reset twice.

## Privacy and verification

The action is browser-local and uses no network, credentials, paths, or operating-system access. Site builds and publication preflight verify compilation and publication boundaries. Runtime keyboard interaction, focus return, assistive-technology output, reduced-motion rendering, and visual capture remain unverified in this ultra-fast implementation pass.
