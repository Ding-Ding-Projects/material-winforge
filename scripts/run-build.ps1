param(
  [ValidateSet('App', 'Installer')][string]$Mode = 'App',
  [switch]$Silent
)

$ErrorActionPreference = 'Stop'
$Started = [DateTimeOffset]::UtcNow
$RepoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$Manifest = Get-Content -LiteralPath (Join-Path $RepoRoot 'toolchain-manifest.json') -Raw | ConvertFrom-Json

function Write-Phase([string]$Message) {
  if (-not $Silent) { Write-Host ("[build] {0}" -f $Message) }
}

function Get-Sha256([string]$Path) {
  $stream = [IO.File]::OpenRead($Path)
  try {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
  } finally { $stream.Dispose() }
}

& (Join-Path $PSScriptRoot 'download-dependencies.ps1') -Silent:$Silent
if ($LASTEXITCODE -ne 0) { throw "Dependency preparation failed with exit code $LASTEXITCODE." }

$CurrentNode = Get-Command node.exe -ErrorAction SilentlyContinue
if ($CurrentNode -and (& $CurrentNode.Source --version) -eq ("v{0}" -f $Manifest.node.version)) {
  $Node = $CurrentNode.Source
  $Npm = Join-Path (Split-Path -Parent $Node) 'npm.cmd'
} else {
  $NodeHome = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) ("MaterialWinForge\toolchains\node-v{0}-{1}" -f $Manifest.node.version, $Manifest.node.platform)
  $Node = Join-Path $NodeHome 'node.exe'
  $Npm = Join-Path $NodeHome 'npm.cmd'
  if (-not (Test-Path -LiteralPath $Node -PathType Leaf) -or -not (Test-Path -LiteralPath $Npm -PathType Leaf)) { throw 'Pinned Node.js executable was not prepared.' }
  $env:PATH = $NodeHome + [IO.Path]::PathSeparator + $env:PATH
}

Write-Phase 'Checking the private vocabulary currency boundary and public-tree publication boundary.'
& $Node (Join-Path $RepoRoot 'scripts\check-vocabulary.mjs')
if ($LASTEXITCODE -ne 0) { throw "Vocabulary currency check failed with exit code $LASTEXITCODE." }
& $Node (Join-Path $RepoRoot 'scripts\verify-publication.mjs')
if ($LASTEXITCODE -ne 0) { throw "Publication preflight failed with exit code $LASTEXITCODE." }

$AppRoot = Join-Path $RepoRoot 'main-app-design'
if ($Mode -eq 'App') {
  Write-Phase 'Building the runnable unpacked desktop application.'
  & $Npm --prefix $AppRoot run build
  if ($LASTEXITCODE -ne 0) { throw "Desktop application build failed with exit code $LASTEXITCODE." }
  $Executable = Get-ChildItem -LiteralPath (Join-Path $AppRoot 'dist\win-unpacked') -Filter '*.exe' -File | Select-Object -First 1
  $Asar = Join-Path $AppRoot 'dist\win-unpacked\resources\app.asar'
  if (-not $Executable -or -not (Test-Path -LiteralPath $Asar -PathType Leaf)) { throw 'The unpacked build is missing its executable or resources/app.asar.' }

  $PagesRoot = Join-Path $RepoRoot 'pages'
  if (Test-Path -LiteralPath (Join-Path $PagesRoot 'package.json') -PathType Leaf) {
    Write-Phase 'Building the private Sites Worker output.'
    & $Npm --prefix $PagesRoot run build:sites
    if ($LASTEXITCODE -ne 0) { throw "Sites build failed with exit code $LASTEXITCODE." }
    Write-Phase 'Building the GitHub Pages static output.'
    & $Npm --prefix $PagesRoot run build:pages
    if ($LASTEXITCODE -ne 0) { throw "GitHub Pages build failed with exit code $LASTEXITCODE." }
  }
  Write-Phase ("Runnable application: {0}" -f $Executable.FullName)
} else {
  Write-Phase 'Building the unsigned Squirrel.Windows installer and update artifacts.'
  $env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
  $env:CSC_LINK = ''
  $env:CSC_KEY_PASSWORD = ''
  $env:WIN_CSC_LINK = ''
  $env:WIN_CSC_KEY_PASSWORD = ''
  & $Npm --prefix $AppRoot run dist
  if ($LASTEXITCODE -ne 0) { throw "Installer build failed with exit code $LASTEXITCODE." }

  $Output = Join-Path $AppRoot 'dist\squirrel-windows'
  $Setup = Get-ChildItem -LiteralPath $Output -Filter '*Setup*.exe' -File | Sort-Object Length -Descending | Select-Object -First 1
  $Releases = Join-Path $Output 'RELEASES'
  $Packages = @(Get-ChildItem -LiteralPath $Output -Filter '*.nupkg' -File)
  if (-not $Setup -or -not (Test-Path -LiteralPath $Releases -PathType Leaf) -or $Packages.Count -lt 1) {
    throw 'Squirrel.Windows did not produce Setup.exe, RELEASES, and a full package.'
  }
  $Index = Get-Content -LiteralPath $Releases -Raw
  foreach ($Package in $Packages) {
    if ($Package.Name -notmatch '-delta\.nupkg$' -and $Index -notmatch [Regex]::Escape($Package.Name)) {
      throw "RELEASES does not reference the full package $($Package.Name)."
    }
  }
  $IsSigned = $false
  try {
    $Certificate = [Security.Cryptography.X509Certificates.X509Certificate]::CreateFromSignedFile($Setup.FullName)
    if ($Certificate) { $IsSigned = $true }
  } catch [Security.Cryptography.CryptographicException] {
    $IsSigned = $false
  }
  if ($IsSigned) { throw 'The installer contains an Authenticode certificate; expected an unsigned artifact.' }
  $Hash = Get-Sha256 $Setup.FullName
  $Commit = (& git -C $RepoRoot rev-parse HEAD).Trim()
  if ($LASTEXITCODE -ne 0) { throw 'Unable to resolve the source commit.' }
  Write-Phase 'Installer signing state: unsigned (no Authenticode certificate).'
  Write-Phase ("Installer: {0}" -f $Setup.FullName)
  Write-Phase ("Installer size: {0} bytes" -f $Setup.Length)
  Write-Phase ("Installer SHA-256: {0}" -f $Hash)
  Write-Phase ("Source commit: {0}" -f $Commit)
}

$Elapsed = [DateTimeOffset]::UtcNow - $Started
Write-Phase ("Build completed in {0:hh\:mm\:ss}." -f $Elapsed)
