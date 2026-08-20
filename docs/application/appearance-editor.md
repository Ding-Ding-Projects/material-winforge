# Desktop element appearance editor

The desktop design reference now carries the same bounded appearance-editor contract as the site: an anchored card preview with local persistence, per-element reset, font-family/size/weight/style, underline and strikethrough variants, letter/word spacing, line-height, direction/alignment, continuous color/alpha controls, preset disclosure, and explicit unsupported-property copy.

The reference is design data, not a claim that the packaged desktop runtime has been independently exercised. No credentials or network route is present. The editor discloses HEX/HEX8, RGB/RGBA, HSL/HSLA, HSV/HSB, HWB, CMYK, alpha, contrast, and the sRGB gamut. CIELAB/LCH and OKLab/OKLCH remain explicitly unsupported without a color-management library; gradients, shadows, variable-font axes, and unsupported font properties remain visible as unsupported rather than guessed.

Suggested articles: [Preview boundary](preview-boundary.md), [Local snapshot](local-snapshot.md), [Global defaults and project overrides](project-settings-overrides.md).
