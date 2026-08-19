# Landing page

## Behavior

The landing page introduces WinForge · Material 3 Preview, displays a clearly labelled static application preview, exposes the complete site feature catalog, embeds feature documentation, reports release-manifest status, and links to the project repository.

A persistent disclosure states that the page is not the desktop application, does not embed the installed product, and does not read or change Windows settings.

## Configuration

The site has two supported build targets:

```powershell
npm --prefix pages run build:sites
npm --prefix pages run build:pages
```

The Sites target uses the Worker adapter and an empty base path. The GitHub Pages target uses static export, trailing slashes, `pages/dist/client` output, and the canonical absolute `https://ding-ding-projects.github.io/material-winforge` asset prefix. GitHub Pages supplies the `/material-winforge` project path at hosting time; the export keeps the HTML entry point at the artifact root while its static asset URLs use that project path.

The static route is explicitly `force-static`, and `pages/public/.nojekyll` is copied to the output so GitHub Pages serves `_next` assets without preprocessing.

Both site targets are pinned to Node 22.23.2 through `pages/.node-version`, `pages/.nvmrc`, and the package engine. On Windows with Node 24.19.0, vinext completed the static export and then aborted during process shutdown with a libuv `UV_HANDLE_CLOSING` assertion. Running the same build under the verified official Node 22.23.2 portable archive exited normally. Do not treat a “Build complete” line followed by that assertion as a successful command.

`.openai/hosting.json` keeps `d1` and `r2` set to `null`. A deployment process may add an exact returned project identifier later; source must never invent one.

## Failure modes

- Missing or invalid release metadata leaves the installer action disabled.
- Missing local preferences fall back to documented defaults.
- An unavailable social-image generator stops the build instead of silently shipping mismatched copies.
- A static export with the wrong base path produces broken assets; the build target owns that path.
- vinext 1.0.0-beta.2 returns an RSC 404 when its static prerenderer requests `/` while a project `basePath` is configured. The supported project-site shape therefore leaves `basePath` empty, uses the canonical absolute asset prefix, and lets GitHub Pages mount the artifact root at `/material-winforge`.
- A runtime other than the pinned Node version is refused before the build so a known shutdown failure cannot masquerade as success.

## Security and privacy

The site uses local assets and browser storage only. It makes no analytics request, loads no remote font, and requests no credential or operating-system permission. The release manifest is public metadata and must contain no secret.

## Verification

A successful build proves compilation and output generation only. Deployment verification must fetch the served HTML, confirm canonical and Open Graph tags, fetch the absolute HTTPS image anonymously, and inspect that the release link matches a real published asset.

The initial bootstrap does not claim browser interaction, screenshots, accessibility review, or deployment.

## Suggested articles

- [Local preferences](preferences.md)
- [Search and regex builder](search-and-regex.md)
- [Release downloads](../release/release-downloads.md)
